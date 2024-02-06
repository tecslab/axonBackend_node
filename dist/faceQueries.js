"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geyFacesDayReportByIntervals = exports.getFacesDayReport = exports.getEventsByDateRange = exports.getEventByTimeStamp = exports.getAllEvents = exports.getIntervalDateCustom = void 0;
const globalParameters_1 = require("./utils/globalParameters");
const { timeIntervals, detectionStartTime, detectionFinishTime } = globalParameters_1.globalParameters;
const pgDB = __importStar(require("./db/postgres"));
// On the DB table, timestamp is in the format "yyyy-mm-dd HH:MM:SS.ms" which is very similar to date.toISOString();
const getAllEvents = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pgDB.plainQuery("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared'");
        response.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.log("No se pudo recuperar los eventos: " + error);
    }
});
exports.getAllEvents = getAllEvents;
const getEventByTimeStamp = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('one event');
    const timeStamp = new Date(parseInt(request.params.timestamp, 10));
    const dateString = timeStamp.toISOString().replace("T", " ").replace("Z", "");
    // no existe id, se debe implementar por timestamp
    try {
        //const result = await pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='$1'", [dateString]);
        const result = yield pgDB.plainQuery("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='" + dateString + "'");
        response.status(200).json(result.rows[0][3]);
    }
    catch (error) {
        console.log("No se pudo recuperar el evento(faceAppeared): " + error);
    }
});
exports.getEventByTimeStamp = getEventByTimeStamp;
const getEventsByDateRange = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const startTimeStamp = new Date(parseInt(request.params.startTimeStamp, 10));
    const finishTimeStamp = new Date(parseInt(request.params.finishTimeStamp, 10));
    try {
        const facesEvents = yield getFacesEventsByDateRange(startTimeStamp, finishTimeStamp);
        const faceDataReport = processFaceData(facesEvents);
        response.status(200).json(faceDataReport);
    }
    catch (error) {
        console.log("No se pudo recuperar el evento(faceAppeared): " + error);
    }
});
exports.getEventsByDateRange = getEventsByDateRange;
const getFacesDayReport = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Faces Day Report');
    // "2024-01-24 12:00:00" is the same as "2024-01-24T(12-utc):00:00Z"
    const now = new Date("2024-01-24 12:00:00");
    //const now = new Date();
    const intervalDate = (0, exports.getIntervalDateCustom)(now);
    const { _initDate, _finishDate } = intervalDate;
    console.log("Tiempo de consulta");
    console.log(_initDate, _finishDate);
    try {
        const facesEvents = yield getFacesEventsByDateRange(_initDate, _finishDate);
        const faceDataReport = processFaceData(facesEvents);
        response.status(200).json(faceDataReport);
    }
    catch (error) {
        console.log("No se pudo recuperar el evento(faceAppeared): " + error);
    }
});
exports.getFacesDayReport = getFacesDayReport;
const geyFacesDayReportByIntervals = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date("2024-01-24 12:00:00");
    //const now = new Date();
    const intervalDate = (0, exports.getIntervalDateCustom)(now);
    const { _initDate, _finishDate } = intervalDate;
    console.log("Tiempo de consulta");
    console.log(_initDate, _finishDate);
    try {
        const facesEvents = yield getFacesEventsByDateRange(_initDate, _finishDate);
        let result = [];
        timeIntervals.forEach(timeInterval => {
            let intervalFaceEvents = facesEvents.filter(faceEvent => (new Date(faceEvent.timestamp)).getHours() === Number(timeInterval.slice(0, 2)));
            const faceDataReport = processFaceData(intervalFaceEvents);
            result.push(faceDataReport);
        });
        response.status(200).json(result);
    }
    catch (error) {
        console.log("No se pudo recuperar el evento(faceAppeared): " + error);
    }
});
exports.geyFacesDayReportByIntervals = geyFacesDayReportByIntervals;
const getIntervalDateCustom = (date) => {
    // returns the day interval between the processing will be done
    const _initDate = new Date(date);
    _initDate.setHours(Number(detectionStartTime.substring(0, 2)));
    _initDate.setMinutes(Number(detectionStartTime.substring(2, 4)));
    const _finishDate = new Date(date);
    _finishDate.setHours(Number(detectionFinishTime.substring(0, 2)));
    _finishDate.setMinutes(Number(detectionFinishTime.substring(2, 4)));
    return { _initDate, _finishDate };
};
exports.getIntervalDateCustom = getIntervalDateCustom;
const getFacesEventsByDateRange = (startTimeStamp, finishTimeStamp) => __awaiter(void 0, void 0, void 0, function* () {
    const startDateString = startTimeStamp.toISOString().replace("T", " ").replace("Z", "");
    const finishDateString = finishTimeStamp.toISOString().replace("T", " ").replace("Z", "");
    console.log('fetching range data');
    console.log(startDateString + " to " + finishDateString);
    try {
        const result = yield pgDB.plainQuery("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '" + startDateString + "' AND '" + finishDateString + "'");
        //const result = await pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '$1' AND '$2'", [startDateString, finishDateString]);
        return result;
    }
    catch (err) {
        console.log("No se pudo recuperar el evento(faceAppeared): " + err);
        throw new Error("Error al recuperar los eventos faces de la BD");
    }
});
const processFaceData = (JSONEvents) => {
    let countHombres = 0;
    let countMujeres = 0;
    const ageIntervals = [
        { start: 0, finish: 15, count: 0 },
        { start: 15, finish: 20, count: 0 },
        { start: 20, finish: 30, count: 0 },
        { start: 30, finish: 35, count: 0 },
        { start: 35, finish: 35, count: 0 },
        { start: 40, finish: 35, count: 0 },
        { start: 45, finish: 35, count: 0 },
        { start: 50, finish: 35, count: 0 },
        { start: 55, finish: 35, count: 0 },
        { start: 60, finish: 200, count: 0 }
    ];
    JSONEvents.forEach((faceEventWrapper) => {
        // let time: Date = new Date(faceEventWrapper.timestamp);
        let event = faceEventWrapper.event; // Verify it this needs T and Z
        let faceEventResult = event.body.details[1].faceRecognitionResult;
        if (faceEventResult.beginTime === "0")
            return; // to skip results no valids, no valid record use to have 0 as beginTime
        for (let i = 0; i < ageIntervals.length; i++) {
            let age = faceEventResult.age;
            if (age >= ageIntervals[i].start && age < ageIntervals[i].finish) {
                ageIntervals[i].count++;
                break;
            }
        }
        let gender = faceEventResult.gender;
        gender == "FEMALE" ? countMujeres++ : countHombres++;
    });
    return { countHombres, countMujeres, ageIntervals };
};
