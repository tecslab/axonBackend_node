import { Client } from 'ts-postgres';

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

export const query = (text: string, params: Array<any>) => {
  return client.query(text, params)
}