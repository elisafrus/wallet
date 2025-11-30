const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'qwerty11',
  database: 'wallet'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database!');
});

module.exports = connection;

