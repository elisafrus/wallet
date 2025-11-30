const express = require('express');
const signupRouter = express.Router();
const path = require('path');

const { Users, getNextUserId } = require('./data');

signupRouter.use(express.static(path.join(__dirname, '..')));
signupRouter.use(express.static(path.join(__dirname, '..', 'frontend')));
signupRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'signup')));

signupRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'signup', 'index.html');
  res.sendFile(filePath);
});

signupRouter.post('/', (req, res) => {
  const { fullname, email, password } = req.body;

  const plainTextPassword = password;

  const existingUser = Users.find(user => user.email === email);

  if (existingUser) {
    console.error(`User with email ${email} already exists.`);
    res.redirect('/signup?Error=email_exists');
    return;
  }

  const newUser = {
    id: getNextUserId(),
    fullname: fullname,
    email: email,
    password: plainTextPassword,
    avatar: null
  };

  Users.push(newUser);

  console.log('New user registered:', newUser);

  res.redirect('/login');
});

module.exports = signupRouter;