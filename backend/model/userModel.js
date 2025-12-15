const db = require('../db');

const userModel = {
  getUserAvatar: (userId, callback) => {
    const sql = 'SELECT avatar FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      const avatarUrl = results.length > 0 ? results[0].avatar : null;
      callback(null, avatarUrl);
    });
  },

  getUserInfo: (userId, callback) => {
    const query = `SELECT avatar, fullname, email, password FROM users WHERE id = ?`;
    db.query(query, [userId], (error, rows) => {
      if (error) {
        return callback(error, null);
      }
      callback(null, rows.length > 0 ? rows[0] : null);
    });
  },

  updateUserProfile: (userId, fullname, email, hashedPassword, avatarUrl, callback) => {
    const query = 'UPDATE users SET fullname = ?, email = ?, password = ?, avatar = ? WHERE id = ?';
    db.query(query, [fullname, email, hashedPassword, avatarUrl, userId], callback);
  },

  findUserByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      const user = results.length > 0 ? results[0] : null;
      callback(null, user);
    });
  },

  createUser: (fullname, email, hashedPassword, callback) => {
    const query = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
    db.query(query, [fullname, email, hashedPassword], callback);
  }
};

module.exports = userModel;