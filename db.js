const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: require('fs').readFileSync(process.env.DB_SSL_CA) // Load the CA certificate
  }
});

// Export the pool for use in other parts of the app
module.exports = pool;