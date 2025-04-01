const mysql = require('mysql2');
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'music_db_user',
    password: 'secretPassword1',
    database: 'music'
});


db.connect((err) => {

    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    
    console.log('Connected as id ' + db.threadId);
});
    
module.exports = db;