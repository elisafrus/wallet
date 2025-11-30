const express = require('express');
const signupRouter = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');

const path = require('path');

signupRouter.use(express.static(path.join(__dirname, '..')));

signupRouter.use(express.static(path.join(__dirname, '..', 'frontend')));

signupRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'signup')));

signupRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'signup', 'index.html');
  res.sendFile(filePath);
});

signupRouter.post('/', (req, res) => {
  const { fullname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.query('INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)', [fullname, email, hashedPassword], (err) => {
    if (err) {
      console.error(err);
      res.redirect('/signup?Error=true')
    } else {
      res.redirect('/login');
    }
  });
});

module.exports = signupRouter;