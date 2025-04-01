const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;
const DATABASE = process.env.DB_DATABASE;
    
const { Pool } = require('pg');

const pool = new Pool({
  user: USER,
  password: PASSWORD,
  host: HOST,
  port: PORT, // default Postgres port
  database:DATABASE
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};