import express, { Express, Request, Response } from "express";
var cors = require('cors')
var cron = require('node-cron');
import { createVisitorsFile } from "./utils/dataProcessing";
import { sendFile } from "./utils/ftpClient";
// const db = require('./queries')
import { getAllEvents, getEventByTimeStamp, getEventsByDateRange,
  getFacesDayReport, geyFacesDayReportByIntervals, getFacesReportForChart } from './faceQueries';

const app : Express = express();
const port : number = Number(process.env.PORT )|| 3000;

app.use(cors())

app.listen(port, () => {
  console.log(`Listening on ${ port } ...`);
});

// ------ Routes -------
app.get("/", (_req: Request, res: Response): void => {
  res.send("Backend Axxon!");
});

app.get('/events', getAllEvents);
app.get('/event/:timestamp', getEventByTimeStamp);
app.get('/eventsRange/:startTimeStamp/:finishTimeStamp', getEventsByDateRange);
app.get('/faces-day-report', getFacesDayReport)
app.get('/full-faces-day-report', geyFacesDayReportByIntervals)
app.get('/get-faces-report-for-chart/:selectedDay', getFacesReportForChart)
// /eventsRange/1706086800000/1706115600000

// ------ /Routes -------

// Schedule the task to run every day at 23:00
cron.schedule("00 23 * * *", async () => {
  console.log("Fetching data at 23:00...");
  try{
    createVisitorsFile();
    sendFile("./visitorsData.csv", "./public_html/uploads/visitorsData.csv");
  }catch(err){
    console.error(err);
    console.error(err);
  }
});