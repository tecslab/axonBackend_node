import express, { Express, Request, Response } from "express";
import { getIntervalDate } from "./utils/dateFunctions";
import { getAsyncExcelData, writeCSVFile } from "./utils/dataProcessing";
import { globalParameters } from "./utils/globalParameters";
const { ftpAddress, ftpUser, ftpPsw } = globalParameters
// const db = require('./queries')
import { getAllEvents, getEventByTimeStamp, getEventsByDateRange } from './faceQueries';
const ftp = require("basic-ftp") 
var cron = require('node-cron');

const app : Express = express();
const port : number = Number(process.env.PORT )|| 3000;

app.listen(port, () => {
  console.log(`Listening on ${ port } ...`);
});

app.get("/", (_req: Request, res: Response): void => {
  res.send("Backend Axxon!");
});

app.get('/events', getAllEvents);
app.get('/event/:id', getEventByTimeStamp);
app.post('/eventsRange', getEventsByDateRange);

interface FtpConfig {
  host: string,
  port: number,
  user: string,
  password: string
}

const ftpConfig : FtpConfig = {
  host: ftpAddress,
  port: 21,
  user: ftpUser,
  password: ftpPsw
}

const client = new ftp.Client();
//client.ftp.verbose = true; // For debug

const sendFile = async () => {
  try {
    if (!client.accessed) {
      // Connect to the server only if the client has not been accessed before
      console.log("Conectando...");
      await client.access(ftpConfig);
    }

    console.log(await client.list());
    await client.uploadFrom("./visitorsData.csv", "./public_html/uploads/visitorsData.csv");
    //await client.downloadTo(".downloads.csv", "./public_html/uploads/visitorsData.csv");
  } catch (err) {
    console.log(err);
  }
};

const closeFTPConnection = async () => {
  try {
    await client.close();
    console.log("Connection closed.");
  } catch (err) {
    console.log(err);
  }
};

const createVisitorsFile = async () => {
  const now = new Date();
  //const now = new Date("2024-01-25 12:00:00")
  const intervalDate = getIntervalDate(now)
  const {initDate, finishDate} = intervalDate
  
  const excelData = await getAsyncExcelData({initDate, finishDate});
  const fileName = await writeCSVFile(excelData)
}

// Schedule the task to run every day at 23:00
cron.schedule("00 23 * * *", async () => {
  console.log("Fetching data at 23:00...");
  createVisitorsFile()

  sendFile()
    .then(() => closeFTPConnection())
    .catch((err) => console.log(err));
});

//createVisitorsFile()

/* sendFile()
  .then(() => closeFTPConnection())
  .catch((err) => console.log(err)); */