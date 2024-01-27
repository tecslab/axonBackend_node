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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsByDateRange = exports.getEventByTimeStamp = exports.getAllEvents = void 0;
const ts_postgres_1 = require("ts-postgres");
const client = new ts_postgres_1.Client({
    user: 'ngp',
    host: 'localhost', // problem here
    database: 'ngp',
    password: 'ngp',
    port: 20110,
});
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield client.connect();
});
connectDB();
const getAllEvents = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared'");
    response.status(200).json(result);
});
exports.getAllEvents = getAllEvents;
/* const getEventById = (request: Request, response: Response) => {
    const id = parseInt(request.params.id)
    client.query('SELECT * FROM t_event WHERE id = $1', [id],(error: Error, results: any)=>{
        if (error){
            throw error
        }
        else response.status(200).json(results.row)
    });
} */
const getEventByTimeStamp = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const timeStamp = new Date(parseInt(request.params.id, 10));
    const dateString = timeStamp.toISOString().replace("T", " ").replace("Z", "");
    // no existe id, se debe implementar por timestamp
    console.log("probando");
    console.log(dateString);
    const result = yield client.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='" + dateString + "'");
    console.log(result);
    response.status(200).json(result.rows[0][3]);
});
exports.getEventByTimeStamp = getEventByTimeStamp;
const getEventsByDateRange = (request, response) => {
    const { startDate, finishDate } = request.body;
    // format yyyy-mm-dd
    /* pool.query("SELECT * FROM t_event WHERE timestamp BETWEEN '$1' AND '$2'", [startDate, finishDate], (error: Error, results: any) =>{
        if (error){
            throw error
        }
        response.status(200).json(results.rows)
    }) */
};
exports.getEventsByDateRange = getEventsByDateRange;
