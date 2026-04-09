const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'changeorgdatabase',
  password: '',
});

module.exports = pool.promise();
