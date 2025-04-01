const mysql = require('mysql2');
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQLPORT,
});


db.connect((err) => {

    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    
    console.log('Connected as id ' + db.threadId);
});
    
module.exports = db;