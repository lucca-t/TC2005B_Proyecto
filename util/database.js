const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'luccat_db',
  database: 'changeorgdatabase',
  password: '1234',
});

module.exports = pool.promise();
