import { Client } from 'ts-postgres';
import { Request, Response } from 'express';
import globalParameters from './utils/globalParameters';
const { timeIntervals } = globalParameters;

const client = new Client({
    user: 'ngp',
    host: 'localhost', // problem here
    database: 'ngp',
    password: 'ngp',
    port: 20110,
  });


const connectDB = async() =>{
    await client.connect();
}

connectDB();

// On the DB table, timestamp is in the format "yyyy-mm-dd HH:MM:SS.ms" which is very similar to date.toISOString();
const getAllEvents = async(request: Request, response: Response) =>  {
    try {
        const result = await client.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared'");
        response.status(200).json(result.rows[0]);
    }catch(error)=>{
       console.log("No se pudo recuperar los eventos: " + result)
    }
}


const getEventByTimeStamp = async (request: Request, response: Response) => {
    const timeStamp: Date = new Date(parseInt(request.params.timestamp, 10));
    const dateString = timeStamp.toISOString().replace("T", " ").replace("Z", "")
    // no existe id, se debe implementar por timestamp
    try {
        const result = await client.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='" + dateString + "'");
        response.status(200).json(result.rows[0][3]);
    }catch(error)=>{
        console.log("No se pudo recuperar el evento(faceAppeared): " + result);
    }

};


const getEventsByDateRange = (request: Request, response: Response) => {
    const startTimeStamp: Date = new Date(parseInt(request.params.startTimeStamp, 10));
    const startDateString = startTimeStamp.toISOString().replace("T", " ").replace("Z", "");

    const finishTimeStamp: Date = new Date(parseInt(request.params.finishTimeStamp, 10));
    const finishDateString = finishTimeStamp.toISOString().replace("T", " ").replace("Z", "");
    console.log('fetching range data');
    console.log(startDateString + " to " + finishDateString);
    try {
        const result = await client.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp BETWEEN '" + startDateString +"' AND '" + finishDateString +"'");
        console.log(result)
        response.status(200).json(result.rows[0]);       
    }catch(error)=>{
        console.log("No se pudo recuperar el evento(faceAppeared): " + result);
    }
}

interface FaceEvent {
    body: any
}

interface FaceEventResult{
    age: number,
    gender: string,
    beginTime: number,
    bestQuality: number,
    temperature: {
        unit: string,
        value: number
    }
}

const processFaceData = (JSONEvents: Array) =>{

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
        {start: 0, finish: 15, count:0},
        {start: 15, finish: 20, count:0},
        {start: 20, finish: 30, count:0},
        {start: 30, finish: 35, count:0},
        {start: 35, finish: 35, count:0},
        {start: 40, finish: 35, count:0},
        {start: 45, finish: 35, count:0},
        {start: 50, finish: 35, count:0},
        {start: 55, finish: 35, count:0},
        {start: 60, finish: 200, count:0}
    ]

    JSONEvents.forEach(faceEvent: FaceEvent => {
        let time: Date = new Date(faceEvent[2]); // verificar
        let event = faceEvent[3].body;  // Verify it this needs T and Z
        let faceEventResult : FaceEventResult = event.details.faceRecognitionResult;
        
        
    });
}

export {
    getAllEvents,
    getEventByTimeStamp,
    getEventsByDateRange
}