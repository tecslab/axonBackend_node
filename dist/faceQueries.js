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
exports.getEventsByDateRange = exports.getEventByTimeStamp = exports.getAllEvents = void 0;
const globalParameters_1 = require("./utils/globalParameters");
const { timeIntervals } = globalParameters_1.globalParameters;
const pgDB = __importStar(require("./db/postgres"));
// On the DB table, timestamp is in the format "yyyy-mm-dd HH:MM:SS.ms" which is very similar to date.toISOString();
const getAllEvents = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = '$1'", ["faceAppeared"]);
        response.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.log("No se pudo recuperar los eventos: " + error);
    }
});
exports.getAllEvents = getAllEvents;
const getEventByTimeStamp = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const timeStamp = new Date(parseInt(request.params.timestamp, 10));
    const dateString = timeStamp.toISOString().replace("T", " ").replace("Z", "");
    // no existe id, se debe implementar por timestamp
    try {
        const result = yield pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='$1'", [dateString]);
        response.status(200).json(result.rows[0][3]);
    }
    catch (error) {
        console.log("No se pudo recuperar el evento(faceAppeared): " + error);
    }
});
exports.getEventByTimeStamp = getEventByTimeStamp;
const getEventsByDateRange = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const startTimeStamp = new Date(parseInt(request.params.startTimeStamp, 10));
    const startDateString = startTimeStamp.toISOString().replace("T", " ").replace("Z", "");
    const finishTimeStamp = new Date(parseInt(request.params.finishTimeStamp, 10));
    const finishDateString = finishTimeStamp.toISOString().replace("T", " ").replace("Z", "");
    console.log('fetching range data');
    console.log(startDateString + " to " + finishDateString);
    try {
        const result = yield pgDB.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '$1' AND '$2'", [startDateString, finishDateString]);
        console.log(result);
        response.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.log("No se pudo recuperar el evento(faceAppeared): " + error);
    }
});
exports.getEventsByDateRange = getEventsByDateRange;
const processFaceData = (JSONEvents) => {
    /* for (let i=0; i>=timeIntervals.length; i++) {
        let intervalInit : String = timeIntervals[i];
        let intervalFinish : String = timeIntervals[i+1];
        JSONEvents.filter(faceEvent => {
            let eventTime = faceEvent[2];
        });
    } */
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
    JSONEvents.forEach((faceEvent) => {
        let time = new Date(faceEvent.body[2]); // verificar
        let event = faceEvent.body; // Verify it this needs T and Z
        let faceEventResult = event.details.faceRecognitionResult;
    });
};
