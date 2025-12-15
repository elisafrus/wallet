const express = require('express');
const loginRouter = express.Router();
const db = require('../db');
const userModel = require('../model/userModel');
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

  userModel.findUserByEmail(email, (err, user) => {
    if (err) {
      console.error('Model error:', err);
      return res.status(500).send('Server error');
    }

    if (!user) {
      res.redirect('/login?Error=true')
      return;
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return res.status(500).send('Server error');
      }

      if (isMatch) {
        req.session.loggedin = true;
        req.session.user_id = user.id;
        res.redirect('/homepage');
      } else {
        res.redirect('/login?Error=true')
      }
    });
  });
});

module.exports = loginRouter;