const express = require('express');
const loginRouter = express.Router();
const path = require('path');
const { Users } = require('./data');

loginRouter.use(express.static(path.join(__dirname, '..')));
loginRouter.use(express.static(path.join(__dirname, '..', 'frontend')));
loginRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'login')));

loginRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'login', 'index.html');
  res.sendFile(filePath);
});

loginRouter.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = Users.find(u => u.email === email);

  if (!user) {
    console.log(`Login attempt failed: User not found for email ${email}`);
    return res.redirect('/login?Error=true');
  }

  let passwordMatch = false;

  passwordMatch = user.password === password;

  if (passwordMatch) {
    req.session.loggedin = true;
    req.session.user_id = user.id;
    console.log(`Login successful for user ${user.id}`);
    res.redirect('/homepage');
  } else {
    console.log(`Login attempt failed: Invalid password for email ${email}`);
    res.redirect('/login?Error=true');
  }
});

module.exports = loginRouter;