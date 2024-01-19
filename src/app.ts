import express, { Express, Request, Response } from "express";
import { getIntervalDate } from "./utils/dateFunctions";
import { getAsyncExcelData, writeCSVFile } from "./utils/dataProcessing";
import { globalParameters } from "./utils/globalParameters";
const { ftpAddress, ftpUser, ftpPsw } = globalParameters

var ftpClient = require('ftp-client')
var cron = require('node-cron');

const app : Express = express();
const port : number = Number(process.env.PORT )|| 3000;

app.get("/", (_req: Request, res: Response): void => {
  res.send("Backend Axxon!");
});

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
  logging: 'debug'
}

var client = new ftpClient(ftpConfig,{});


const sendFile = async () => {
  try {
    await client.connect(()=>{
      client.upload(["./visitorsData.csv"], '/public_html/test/visitorsData.csv', {
        baseDir: 'test',
        overwrite: 'all'
      }, (result:any)=> {
        console.log(result);
      });
    });
  
  }catch(e){
    console.log(e)
  }
}

client.connect(()=>{
  console.log("download");
  client.download('/public_html/test/visitorsData.csv', './test', {
    overwrite: 'all'
  }, function (result: any) {
    console.log(result);
  });
})

/* // Helper function to convert ReadableStream to ArrayBuffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return new Uint8Array(Buffer.concat(chunks)).buffer;
} */


// Schedule the task to run every day at 23:00
cron.schedule("08 00 * * *", async () => {
  console.log("Fetching data at 23:00...");
  const now = new Date();
  const intervalDate = getIntervalDate(now)
  const {initDate, finishDate} = intervalDate


  const excelData = await getAsyncExcelData({initDate, finishDate});
  const fileName = await writeCSVFile(excelData)
  sendFile()

});