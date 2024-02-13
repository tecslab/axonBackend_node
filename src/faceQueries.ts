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
  end: number,
  count: number,
  backgroundColor: String
}

interface FaceDataReport {
  countHombres: number,
  countMujeres: number,
  ageIntervals: AgeIntervalCount[]
}

const ageIntervals : AgeIntervalCount[] = [
  {start: 0, end: 15, count:0, backgroundColor: "aquamarine" },
  {start: 15, end: 20, count:0, backgroundColor: "bisque"},
  {start: 20, end: 30, count:0, backgroundColor: "blueviolet"},
  {start: 30, end: 35, count:0, backgroundColor: "brown"},
  {start: 35, end: 40, count:0, backgroundColor: "cadetblue"},
  {start: 40, end: 45, count:0, backgroundColor: "coral"},
  {start: 45, end: 50, count:0, backgroundColor: "cyan"},
  {start: 50, end: 55, count:0, backgroundColor: "darkblue"},
  {start: 55, end: 60, count:0, backgroundColor: "darkgray"},
  {start: 60, end: 200, count:0, backgroundColor: "darkgreen"}
]

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
  const now = new Date("2024-02-10 12:00:00")
  //const now = new Date();
  const intervalDate = getIntervalDateCustom(now)
  const {_initDate, _finishDate} = intervalDate

  console.log("Tiempo de consulta")
  console.log(_initDate, _finishDate)

  try {
    const facesEvents : EventDBRecord[] = await getFacesEventsByDateRange(_initDate, _finishDate)
    let reportsArray : FaceDataReport[] = [];
    timeIntervals.forEach(timeInterval => {

      let intervalFaceEvents : EventDBRecord[] = facesEvents.filter((faceEvent) => (new Date(faceEvent.timestamp)).getHours() - 5 === Number(timeInterval.slice(0,2)))
      const faceDataReport1 : FaceDataReport = processFaceData(intervalFaceEvents)
      reportsArray.push(faceDataReport1);
    })
    response.status(200).json(reportsArray);
  }catch(error){
    console.log("No se pudo recuperar el evento(faceAppeared): " + error);
  }
}

const getFacesReportForChart = async(request: Request, response: Response) =>{
  const selectedDay : Date = new Date(parseInt(request.params.selectedDay, 10));
  //const selectedDay = new Date("2024-01-24 12:00:00")
  const intervalDate = getIntervalDateCustom(selectedDay)
  const {_initDate, _finishDate} = intervalDate

  try {
    const facesEvents : EventDBRecord[] = await getFacesEventsByDateRange(_initDate, _finishDate)
    let reportsArray : FaceDataReport[] = [];
    timeIntervals.forEach(timeInterval => {
      let intervalFaceEvents : EventDBRecord[] = facesEvents.filter((faceEvent) => (new Date(faceEvent.timestamp)).getHours() -5 === Number(timeInterval.slice(0,2)))
      const faceDataReport : FaceDataReport = processFaceData(intervalFaceEvents)
      reportsArray.push(faceDataReport);
    })

    const ageIntervalsData : Array<any> = [];

    for (let i=0; i<ageIntervals.length; i++){
      // reduce cada faceDataReport al conteo del intervalo de tiempo que corresponde
      let dayIntervalRecords : number[] =  reportsArray.map(faceDataReport => faceDataReport.ageIntervals[i].count)
      const dataAgeInterval = {
        type: "bar",
        label: ageIntervals[i].start,
        backgroundColor: ageIntervals[i].backgroundColor,
        data: dayIntervalRecords
      }
      
      ageIntervalsData.push(dataAgeInterval);
    }

    const facesReportForChart = {
      labels: timeIntervals,
      datasets: ageIntervalsData
    }
    response.status(200).json(facesReportForChart);
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
  const startDateString = startTimeStamp.toISOString()//.replace("T", " ").replace("Z", "");
  const finishDateString = finishTimeStamp.toISOString()//.replace("T", " ").replace("Z", "");
  console.log('fetching range data');
  console.log(startDateString + " to " + finishDateString);
  try{
    const query : string = "SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '" + startDateString + "' AND '" + finishDateString + "'"
    //const query : string = "SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '2024-02-08T09:00:26.021Z' AND '2024-02-09T02:00:26.021Z'"
    console.log(query)
    const result: EventDBRecord[] = await pgDB.plainQuery(query);
    //const result = await pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '$1' AND '$2'", [startDateString, finishDateString]);
    console.log(result[0])
    //console.log(result[result.length-1])
    return result;
  }catch(err){
    console.log("No se pudo recuperar el evento(faceAppeared): " + err);
    throw new Error("Error al recuperar los eventos faces de la BD")
  }
}

const processFaceData = (JSONEvents: EventDBRecord[]) : FaceDataReport =>{
  let countHombres = 0;
  let countMujeres = 0;
  let ageIntervaleInstance = JSON.parse(JSON.stringify(ageIntervals))

  JSONEvents.forEach( (faceEventWrapper : EventDBRecord) => {
    // let time: Date = new Date(faceEventWrapper.timestamp);
    const event : EventWrapper = faceEventWrapper.event;  // Verify it this needs T and Z
    const faceEventResult : FaceEventResult = event.body.details[1].faceRecognitionResult;

    if (faceEventResult.beginTime==="0") return  // to skip results no valids, no valid record use to have 0 as beginTime
    

    for (let i=0; i<ageIntervaleInstance.length; i++){
      let age = faceEventResult.age;
      if (age >= ageIntervaleInstance[i].start && age < ageIntervaleInstance[i].end){
        ageIntervaleInstance[i].count++
        break;
      }
    }
    let gender = faceEventResult.gender;
    gender=="FEMALE"?countMujeres++:countHombres++
  });

  return {countHombres, countMujeres, ageIntervals: ageIntervaleInstance}
}

export {
  getAllEvents,
  getEventByTimeStamp,
  getEventsByDateRange,
  getFacesDayReport,
  geyFacesDayReportByIntervals,
  getFacesReportForChart
}