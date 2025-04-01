const mysql = require('mysql2');
const db = mysql.createConnection({
    host: MYSQLHOST,
    user: "root",
    password: MYSQL_ROOT_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQLPORT,
});


db.connect((err) => {

    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    
    console.log('Connected as id ' + db.threadId);
});
    
module.exports = db;