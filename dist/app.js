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
// const db = require('./queries')
const faceQueries_1 = require("./faceQueries");
const ftp = require("basic-ftp");
var cron = require('node-cron');
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Listening on ${port} ...`);
});
app.get("/", (_req, res) => {
    res.send("Backend Axxon!");
});
app.get('/events', faceQueries_1.getAllEvents);
app.get('/event/:timestamp', faceQueries_1.getEventByTimeStamp);
app.get('/eventsRange/:startTimeStamp/:finishTimeStamp', faceQueries_1.getEventsByDateRange);
app.get('/faces-day-report', faceQueries_1.getFacesDayReport);
const ftpConfig = {
    host: ftpAddress,
    port: 21,
    user: ftpUser,
    password: ftpPsw
};
const client = new ftp.Client();
//client.ftp.verbose = true; // For debug
const sendFile = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!client.accessed) {
            // Connect to the server only if the client has not been accessed before
            console.log("Conectando...");
            yield client.access(ftpConfig);
        }
        console.log(yield client.list());
        yield client.uploadFrom("./visitorsData.csv", "./public_html/uploads/visitorsData.csv");
        //await client.downloadTo(".downloads.csv", "./public_html/uploads/visitorsData.csv");
    }
    catch (err) {
        console.log(err);
    }
});
const closeFTPConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.close();
        console.log("Connection closed.");
    }
    catch (err) {
        console.log(err);
    }
});
const createVisitorsFile = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    //const now = new Date("2024-01-25 12:00:00")
    const intervalDate = (0, dateFunctions_1.getIntervalDate)(now);
    const { initDate, finishDate } = intervalDate;
    const excelData = yield (0, dataProcessing_1.getAsyncExcelData)({ initDate, finishDate });
    const fileName = yield (0, dataProcessing_1.writeCSVFile)(excelData);
});
// Schedule the task to run every day at 23:00
cron.schedule("00 23 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Fetching data at 23:00...");
    createVisitorsFile();
    sendFile()
        .then(() => closeFTPConnection())
        .catch((err) => console.log(err));
}));
//createVisitorsFile()
/* sendFile()
  .then(() => closeFTPConnection())
  .catch((err) => console.log(err)); */ 
