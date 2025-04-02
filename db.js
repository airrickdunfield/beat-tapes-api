const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: "root", // Use Railway or environment variables
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0, // Unlimited queueing
});

// Export the pool for use in other parts of the app
