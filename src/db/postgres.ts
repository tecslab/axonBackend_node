import * as pgPromise from 'pg-promise';
const pgp = require('pg-promise')();

const config = {
    user: 'ngp',
    host: 'localhost',
    database: 'ngp',
    password: 'ngp',
    port: 20110,
};

const db = pgp(config);


export const query = async(text: string, params: Array<any>) : Promise<any>=> {
  return db.query(text, params)
}

export const plainQuery = async(text: string) : Promise<any> => {
  //db.query('SET TIME ZONE "America/Bogota"');
  return db.query(text)
}

export const queryWithDateRange = async(text: string, initDate : Date, endDate: Date) : Promise<any> => {
  //initDate.setHours(initDate.getHours()+5);
  //endDate.setHours(endDate.getHours()+5);
  return db.query(text)
}