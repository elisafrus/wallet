const express = require('express');
const signupRouter = express.Router();
const authService = require('../service/authService'); // шлях до сервісу
const path = require('path');

signupRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'signup')));

signupRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'signup', 'index.html'));
});

signupRouter.post('/', async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.redirect('/signup?Error=empty_fields');
  }

  try {
    await authService.registerUser(fullname, email, password);

    res.redirect('/login');

  } catch (err) {
    console.error('Signup error:', err);
    res.redirect('/signup?Error=true');
  }
});

module.exports = signupRouter;
