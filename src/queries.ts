/* import { Pool, Client } from 'pg'; */

import { Client } from 'ts-postgres';

import { Request, Response } from 'express';
//const Pool = require('ngp').Pool

/* const pool = new Pool({
  user: 'ngp',
  host: 'ngp',
  database: 'ngp',
  password: 'ngp',
  port: 20110,
}); */

const client = new Client({
    user: 'ngp',
    host: 'ngp', // problem here
    database: 'ngp',
    password: 'ngp',
    port: 20110,
  });

  /* Error: getaddrinfo ENOTFOUND ngp
  [1]     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:108:26) {
  [1]   errno: -3008,
  [1]   code: 'ENOTFOUND',
  [1]   syscall: 'getaddrinfo',
  [1]   hostname: 'ngp'
  [1] } */


const connectDB = async() =>{
    await client.connect();
}

connectDB();


const getAllEvents = (request: Request, response: Response) =>  {
    console.log('debuggin')
    /* pool.query('SELECT * FROM t_event', (error: Error, results: any)=>{
        if (error){
            throw error
        }
        else response.status(200).json(results.row)
    }); */

    const result = client.query('SELECT * FROM t_event');
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


const getEventById = (request: Request, response: Response) => {
    const id: number = parseInt(request.params.id, 10);

    /* client.query('SELECT * FROM t_event WHERE id = $1' + id, (error: Error, results: any) => {
        if (error) {
            throw error;
        } else {
            response.status(200).json(results.rows);
        }
    }); */

    const result = client.query('SELECT * FROM t_event WHERE id =' + id);
    response.status(200).json(result);

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
    getEventById,
    getEventsByDateRange
}