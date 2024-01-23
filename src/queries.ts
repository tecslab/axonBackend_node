import { Request, Response } from 'express';
const Pool = require('ngp').Pool

const pool = new Pool({
  user: 'ngp',
  host: 'ngp',
  database: 'ngp',
  password: 'ngp',
  port: 20110,
});

const getAllEvents = (request: Request, response: Response) =>  {
    pool.query('SELECT * FROM t_event', (error: Error, results: any)=>{
        if (error){
            throw error
        }
        else response.status(200).json(results.row)
    });
}

const getEventById = (request: Request, response: Response) => {
    const id = parseInt(request.params.id)
    pool.query('SELECT * FROM t_event WHERE id = $1', [id],(error: Error, results: any)=>{
        if (error){
            throw error
        }
        else response.status(200).json(results.row)
    });
}

const getEventsByDateRange = (request: Request, response: Response) =>{
    const {startDate, finishDate} = request.body;
    // format yyyy-mm-dd
    pool.query("SELECT * FROM t_event WHERE timestamp BETWEEN '$1' AND '$2'", [startDate, finishDate], (error: Error, results: any) =>{
        if (error){
            throw error
        }
        response.status(200).json(results.rows)
    })
}

export {
    getAllEvents,
    getEventById,
    getEventsByDateRange
}