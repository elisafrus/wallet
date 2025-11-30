const express = require('express');
const loginRouter = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');

const path = require('path');

loginRouter.use(express.static(path.join(__dirname, '..')));

loginRouter.use(express.static(path.join(__dirname, '..', 'frontend')));

loginRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'login')));

loginRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'login', 'index.html');
  res.sendFile(filePath);
});

loginRouter.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      res.redirect('/login?Error=true')
      return;
    }

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        req.session.loggedin = true;
        req.session.user_id = results[0].id;
        res.redirect('/homepage');
      } else {
        res.redirect('/login?Error=true')
      }
    });
  });
});

module.exports = loginRouter;