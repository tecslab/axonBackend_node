const Pool = require('ngp').Pool

const pool = new Pool({
  user: 'ngp',
  host: 'ngp',
  database: 'ngp',
  password: 'ngp',
  port: 20110,
});

const getAllEvents = (request, response) =>  {
    pool.query('SELECT * FROM t_event', (error, results)=>{
        if (error){
            throw error
        }
        else response.status(200).json(results.row)
    });
}

const getEventById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('SELECT * FROM t_event WHERE id = $1', [id],(error, results)=>{
        if (error){
            throw error
        }
        else response.status(200).json(results.row)
    });
}

const getEventsByDataRange = (request, response) =>{
    const {startDate, finishDate} = request.body;
    // format yyyy-mm-dd
    pool.query("SELECT * FROM t_event WHERE timestamp BETWEEN '$1' AND '$2'", [startDate, finishDate], (error, results) =>{
        if (error){
            throw error
        }
        response.status(200).json(results.rows)
    })
}

module.exports = {
    getAllEvents,
    getEventById,
    getEventsByDataRange
}