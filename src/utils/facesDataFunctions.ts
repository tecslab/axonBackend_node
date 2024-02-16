import { globalParameters } from "./globalParameters"
import { EventDBRecord, EventWrapper, FaceEventResult, FaceDataReport, AgeIntervalCount } from "./commonInterfaces";
import * as pgDB from '../db/postgres';
const { timeIntervals, detectionStartTime, detectionFinishTime, utc } = globalParameters;

export const ageIntervals : AgeIntervalCount[] = [
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

export const queryFacesEventsByDateRange = async(startTimeStamp : Date, finishTimeStamp : Date) : Promise<EventDBRecord[]> => {
  const startDateString = startTimeStamp.toISOString()//.replace("T", " ").replace("Z", "");
  const finishDateString = finishTimeStamp.toISOString()//.replace("T", " ").replace("Z", "");
  console.log('fetching range data');
  console.log(startDateString + " to " + finishDateString);
  try{
    const query : string = "SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '" + startDateString + "' AND '" + finishDateString + "'"
    //const query : string = "SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '2024-02-08T09:00:26.021Z' AND '2024-02-09T02:00:26.021Z'"
    console.log(query)
    const result : EventDBRecord[] = await pgDB.plainQuery(query);
    //const result = await pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '$1' AND '$2'", [startDateString, finishDateString]);
    console.log(result[0])
    //console.log(result[result.length-1])
    return result;
  }catch(err){
    console.log("No se pudo recuperar el evento(faceAppeared): " + err);
    throw new Error("Error al recuperar los eventos faces de la BD")
  }
}

export const processFaceData = (JSONEvents: EventDBRecord[]) : FaceDataReport =>{
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

export const getFacesReportByDateInterval = async(startDate : Date, endDate : Date) : Promise<FaceDataReport> =>{
  console.log("Tiempo de consulta")
  console.log(startDate, endDate)

  try {
    const facesEvents : EventDBRecord[] = await queryFacesEventsByDateRange(startDate, endDate)
    const faceDataReport : FaceDataReport = processFaceData(facesEvents)
    return faceDataReport
  }catch(error){
    throw error;
  }
}

export const getFacesReportByDateIntervalSplittedAges = async(startDate : Date, endDate : Date) : Promise<FaceDataReport[]> =>{
  try {
    const facesEvents : EventDBRecord[] = await queryFacesEventsByDateRange(startDate, endDate)
    let reportsArray : FaceDataReport[] = [];
    timeIntervals.forEach(timeInterval => {

      let intervalFaceEvents : EventDBRecord[] = facesEvents.filter((faceEvent) => (new Date(faceEvent.timestamp)).getHours() + utc === Number(timeInterval.slice(0,2)))
      const faceDataReport : FaceDataReport = processFaceData(intervalFaceEvents)
      reportsArray.push(faceDataReport);
    })
    return reportsArray;
  }catch(error){
    throw error;
  }
}