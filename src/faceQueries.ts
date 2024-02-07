import { Request, Response } from 'express';
import {globalParameters} from './utils/globalParameters';
import { getIntervalDate, UTCTransform } from './utils/dateFunctions';
import { DateRange } from './utils/commonInterfaces';
const { timeIntervals, detectionStartTime, detectionFinishTime } = globalParameters;
import * as pgDB from './db/postgres'

interface EventWrapper{
  body: any,
  subject: string,
  subjects: string[],
  eventType: string,
  localization: any
}

interface EventDBRecord {
  type: number,
  subjects: string[],
  timestamp: Date,
  event: EventWrapper,
  ts_vector: string
}

interface FaceEventResult{
  age: number,
  gender: string,
  beginTime: string,
  bestQuality: number,
  temperature: {
    unit: string,
    value: number
  }
}

interface AgeIntervalCount{
  start: number,
  finish: number,
  count: number
}

interface FaceDataReport {
  countHombres: number,
  countMujeres: number,
  ageIntervals: AgeIntervalCount[]
}

// On the DB table, timestamp is in the format "yyyy-mm-dd HH:MM:SS.ms" which is very similar to date.toISOString();
const getAllEvents = async(request: Request, response: Response) =>  {
  try {
    const result = await pgDB.plainQuery("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared'");
    response.status(200).json(result.rows[0]);
  }catch(error){
    console.log("No se pudo recuperar los eventos: " + error)
  }
}

const getEventByTimeStamp = async (request: Request, response: Response) => {
  console.log('one event')
  const timeStamp: Date = new Date(parseInt(request.params.timestamp, 10));
  const dateString = timeStamp.toISOString().replace("T", " ").replace("Z", "")
  // no existe id, se debe implementar por timestamp
  try {
    //const result = await pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='$1'", [dateString]);
    const result = await pgDB.plainQuery("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='" + dateString + "'");
    response.status(200).json(result.rows[0][3]);
  }catch(error){
    console.log("No se pudo recuperar el evento(faceAppeared): " + error);
  }
};

const getEventsByDateRange = async(request: Request, response: Response) => {
  const startTimeStamp : Date = new Date(parseInt(request.params.startTimeStamp, 10));
  const finishTimeStamp : Date = new Date(parseInt(request.params.finishTimeStamp, 10));
  
  try {
    const facesEvents : EventDBRecord[] = await getFacesEventsByDateRange(startTimeStamp, finishTimeStamp)
    const faceDataReport : FaceDataReport = processFaceData(facesEvents)
    response.status(200).json(faceDataReport);
  }catch(error){
    console.log("No se pudo recuperar el evento(faceAppeared): " + error);
  }
}

const getFacesDayReport = async(request: Request, response: Response) => {
  console.log('Faces Day Report')
  // "2024-01-24 12:00:00" is the same as "2024-01-24T(12-utc):00:00Z"
  const now = new Date("2024-01-24 12:00:00")
  //const now = new Date();
  const intervalDate = getIntervalDateCustom(now)
  const {_initDate, _finishDate} = intervalDate

  console.log("Tiempo de consulta")
  console.log(_initDate, _finishDate)

  try {
    const facesEvents : EventDBRecord[] = await getFacesEventsByDateRange(_initDate, _finishDate)
    const faceDataReport : FaceDataReport = processFaceData(facesEvents)
    response.status(200).json(faceDataReport);
  }catch(error){
    console.log("No se pudo recuperar el evento(faceAppeared): " + error);
  }
}

const geyFacesDayReportByIntervals = async(request: Request, response: Response) => {
  const now = new Date("2024-01-24 12:00:00")
  //const now = new Date();
  const intervalDate = getIntervalDateCustom(now)
  const {_initDate, _finishDate} = intervalDate

  console.log("Tiempo de consulta")
  console.log(_initDate, _finishDate)

  try {
    const facesEvents : EventDBRecord[] = await getFacesEventsByDateRange(_initDate, _finishDate)
    let reportsArray : FaceDataReport[] = [];
    timeIntervals.forEach(timeInterval => {
      let intervalFaceEvents : EventDBRecord[] = facesEvents.filter((faceEvent) => (new Date(faceEvent.timestamp)).getHours() === Number(timeInterval.slice(0,2)))
      const faceDataReport : FaceDataReport = processFaceData(intervalFaceEvents)
      reportsArray.push(faceDataReport);
    })
    response.status(200).json(reportsArray);
  }catch(error){
    console.log("No se pudo recuperar el evento(faceAppeared): " + error);
  }
}

export const getIntervalDateCustom = (date: Date) => {
  // returns the day interval between the processing will be done
  const _initDate = new Date(date)
  _initDate.setHours(Number(detectionStartTime.substring(0, 2)))
  _initDate.setMinutes(Number(detectionStartTime.substring(2, 4)))

  const _finishDate = new Date(date)
  _finishDate.setHours(Number(detectionFinishTime.substring(0, 2)))
  _finishDate.setMinutes(Number(detectionFinishTime.substring(2, 4)))

  return { _initDate, _finishDate }
}

const getFacesEventsByDateRange = async(startTimeStamp : Date, finishTimeStamp : Date) : Promise<EventDBRecord[]> => {
  const startDateString = startTimeStamp.toISOString().replace("T", " ").replace("Z", "");
  const finishDateString = finishTimeStamp.toISOString().replace("T", " ").replace("Z", "");
  console.log('fetching range data');
  console.log(startDateString + " to " + finishDateString);
  try{
    const result: EventDBRecord[] = await pgDB.plainQuery("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '" + startDateString + "' AND '" + finishDateString + "'");
    //const result = await pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '$1' AND '$2'", [startDateString, finishDateString]);
    return result;
  }catch(err){
    console.log("No se pudo recuperar el evento(faceAppeared): " + err);
    throw new Error("Error al recuperar los eventos faces de la BD")
  }
}

const processFaceData = (JSONEvents: EventDBRecord[]) : FaceDataReport =>{
  let countHombres = 0;
  let countMujeres = 0;
  const ageIntervals : AgeIntervalCount[] = [
    {start: 0, finish: 15, count:0},
    {start: 15, finish: 20, count:0},
    {start: 20, finish: 30, count:0},
    {start: 30, finish: 35, count:0},
    {start: 35, finish: 35, count:0},
    {start: 40, finish: 35, count:0},
    {start: 45, finish: 35, count:0},
    {start: 50, finish: 35, count:0},
    {start: 55, finish: 35, count:0},
    {start: 60, finish: 200, count:0}
  ]

  JSONEvents.forEach( (faceEventWrapper : EventDBRecord) => {
    // let time: Date = new Date(faceEventWrapper.timestamp);
    let event : EventWrapper = faceEventWrapper.event;  // Verify it this needs T and Z
    let faceEventResult : FaceEventResult = event.body.details[1].faceRecognitionResult;

    if (faceEventResult.beginTime==="0") return  // to skip results no valids, no valid record use to have 0 as beginTime
    
    for (let i=0; i<ageIntervals.length; i++){
      let age = faceEventResult.age;
      if (age >= ageIntervals[i].start && age < ageIntervals[i].finish){
        ageIntervals[i].count++
        break;
      }
    }
    let gender = faceEventResult.gender;
    gender=="FEMALE"?countMujeres++:countHombres++
  });

  return {countHombres, countMujeres, ageIntervals}
}

export {
  getAllEvents,
  getEventByTimeStamp,
  getEventsByDateRange,
  getFacesDayReport,
  geyFacesDayReportByIntervals
}