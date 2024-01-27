import { Client } from 'ts-postgres';
import { Request, Response } from 'express';

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


const getAllEvents = async(request: Request, response: Response) =>  {
    const result = await client.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared'");
    response.status(200).json(result);
}

/* const getEventById = (request: Request, response: Response) => {
    const id = parseInt(request.params.id)
    client.query('SELECT * FROM t_event WHERE id = $1', [id],(error: Error, results: any)=>{
        if (error){
            throw error
        }
        else response.status(200).json(results.row)
    });
} */


const getEventByTimeStamp = async (request: Request, response: Response) => {
    const timeStamp: Date = new Date(parseInt(request.params.id, 10));
    const dateString = timeStamp.toISOString().replace("T", " ").replace("Z", "")
    // no existe id, se debe implementar por timestamp
    console.log("probando")
    console.log(dateString)
    const result = await client.query("SELECT * FROM t_event WHERE event->'body'->>'eventType' = 'faceAppeared' AND timestamp='" + dateString + "'");
    console.log(result)
    response.status(200).json(result.rows[0][3]);

};


const getEventsByDateRange = (request: Request, response: Response) =>{
    const {startDate, finishDate} = request.body;
    // format yyyy-mm-dd
    /* pool.query("SELECT * FROM t_event WHERE timestamp BETWEEN '$1' AND '$2'", [startDate, finishDate], (error: Error, results: any) =>{
        if (error){
            throw error
        }
        response.status(200).json(results.rows)
    }) */
}

export {
    getAllEvents,
    getEventByTimeStamp,
    getEventsByDateRange
}