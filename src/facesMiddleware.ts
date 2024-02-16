import { Request, Response } from 'express';
import {globalParameters} from './utils/globalParameters';
import { EventDBRecord, FaceDataReport, AgeIntervalCount } from './utils/commonInterfaces';
const { timeIntervals, detectionStartTime, detectionFinishTime, utc } = globalParameters;
import { getFacesReportByDateInterval, 
        getFacesReportByDateIntervalSplittedAges, 
        getIntervalDateCustom, ageIntervals } from './utils/facesDataFunctions';
import * as pgDB from './db/postgres'

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
    const faceDataReport : FaceDataReport = await getFacesReportByDateInterval(startTimeStamp, finishTimeStamp);
    response.status(200).json(faceDataReport);
  }catch(error){
    console.log("No se pudo recuperar el evento(faceAppeared): " + error);
  }
}

const getFacesDayReport = async(request: Request, response: Response) => {
  console.log('Faces Day Report')
  // "2024-01-24 12:00:00" is the same as "2024-01-24T(12-utc):00:00Z"
  //const now = new Date("2024-01-24 12:00:00")
  const now = new Date();
  const intervalDate = getIntervalDateCustom(now)
  const {_initDate, _finishDate} = intervalDate

  try {
    const faceDataReport : FaceDataReport = await getFacesReportByDateInterval(_initDate, _finishDate);
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

  try {
    let reportsArray : FaceDataReport[] = await getFacesReportByDateIntervalSplittedAges(_initDate, _finishDate)
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
    let reportsArray : FaceDataReport[] = await getFacesReportByDateIntervalSplittedAges(_initDate, _finishDate)
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

export {
  getAllEvents,
  getEventByTimeStamp,
  getEventsByDateRange,
  getFacesDayReport,
  geyFacesDayReportByIntervals,
  getFacesReportForChart
}