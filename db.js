
const { Pool } = require('pg');

const pool = new Pool({
  user: PGUSER,
  password: PGPASSWORD,
  host: PGHOST,
  database:PGDATABASE
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};