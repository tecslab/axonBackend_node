"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dateFunctions_1 = require("./utils/dateFunctions");
const dataProcessing_1 = require("./utils/dataProcessing");
const globalParameters_1 = require("./utils/globalParameters");
const { ftpAddress, ftpUser, ftpPsw } = globalParameters_1.globalParameters;
var ftpClient = require('ftp-client');
var cron = require('node-cron');
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
app.get("/", (_req, res) => {
    res.send("Backend Axxon!");
});
app.listen(port, () => {
    console.log(`Listening on ${port} ...`);
});
const ftpConfig = {
    host: ftpAddress,
    port: 21,
    user: ftpUser,
    password: ftpPsw
};
const options = {
    logging: 'debug'
};
var client = new ftpClient(ftpConfig, options);
const sendFile = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect(() => {
            client.upload(["./visitorsData.csv"], '/public_html/uploads', {
                baseDir: 'uploads',
                overwrite: 'all'
            }, (result) => {
                console.log(result);
            });
        });
    }
    catch (e) {
        console.log(e);
    }
});
try {
    client.connect(() => {
        console.log("download");
        client.download('/**', './downloads', {
            overwrite: 'none'
        }, function (result) {
            console.log(result);
        });
    });
}
catch (e) {
    console.log("Error de descarga");
    console.log(e);
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
cron.schedule("00 23 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Fetching data at 23:00...");
    const now = new Date();
    const intervalDate = (0, dateFunctions_1.getIntervalDate)(now);
    const { initDate, finishDate } = intervalDate;
    const excelData = yield (0, dataProcessing_1.getAsyncExcelData)({ initDate, finishDate });
    const fileName = yield (0, dataProcessing_1.writeCSVFile)(excelData);
    sendFile();
}));
