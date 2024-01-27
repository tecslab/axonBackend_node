import express, { Express, Request, Response } from "express";
import { getIntervalDate } from "./utils/dateFunctions";
import { getAsyncExcelData, writeCSVFile } from "./utils/dataProcessing";
import { globalParameters } from "./utils/globalParameters";
// const db = require('./queries')
import { getAllEvents, getEventByTimeStamp, getEventsByDateRange } from './faceQueries';
const { ftpAddress, ftpUser, ftpPsw } = globalParameters

var ftpClient = require('ftp-client')
var cron = require('node-cron');

const app : Express = express();
const port : number = Number(process.env.PORT )|| 3000;

app.get("/", (_req: Request, res: Response): void => {
  res.send("Backend Axxon!");
});

app.get('/events', getAllEvents);
app.get('/event/:id', getEventByTimeStamp);
app.post('/eventsRange', getEventsByDateRange);

app.listen(port, () => {
  console.log(`Listening on ${ port } ...`);
});


const ftpConfig = {
  host: ftpAddress,
  port: 21,
  user: ftpUser,
  password: ftpPsw
}

const options =  {
  logging: 'basic' //debug
}

try {
  var client = new ftpClient(ftpConfig, options);
}catch(error){
  console.log('No se alcanza al servidor FTP')
}

const sendFile = async () => {
  try {
    await client.connect(()=>{
      client.upload(["./visitorsData.csv"], '/public_html/uploads', {
        baseDir: 'uploads',
        overwrite: 'all'
      }, (result:any)=> {
        console.log(result);
      });
    });
  
  }catch(e){
    console.log(e)
  }
}

try {
  client.connect(()=>{
    console.log("download");
    client.download('/**', './downloads', {
      overwrite: 'none'
    }, function (result: any) {
      console.log(result);
    });
  })
}catch(e){
  console.log("Error de descarga")
  console.log(e)
}

/* // Helper function to convert ReadableStream to ArrayBuffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return new Uint8Array(Buffer.concat(chunks)).buffer;
} */


// Schedule the task to run every day at 23:00
cron.schedule("00 23 * * *", async () => {
  console.log("Fetching data at 23:00...");
  const now = new Date();
  const intervalDate = getIntervalDate(now)
  const {initDate, finishDate} = intervalDate


  const excelData = await getAsyncExcelData({initDate, finishDate});
  const fileName = await writeCSVFile(excelData)
  sendFile()

});