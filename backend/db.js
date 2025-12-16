const mysql = require('mysql');

let connection = null;

if (process.env.NODE_ENV !== 'test' && !process.env.CI) {
  connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'qwerty11',
    database: 'wallet',
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL Database:', err.message);
      throw err;
    }
    console.log('Connected to MySQL Database!');
  });
} else {
  console.log('Skipping MySQL connection in CI/Test environment.');
  connection = {
    query: (sql, callback) => callback(new Error('DB connection is stubbed in test mode')),
    end: () => {
    },
  };
}

module.exports = connection;
