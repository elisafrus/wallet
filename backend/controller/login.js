const express = require('express');
const loginRouter = express.Router();
const authService = require('../service/authService'); // шлях до сервісу
const path = require('path');

loginRouter.use(express.static(path.join(__dirname, '..')));
loginRouter.use(express.static(path.join(__dirname, '..', 'frontend')));
loginRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'login')));

loginRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login', 'index.html'));
});

loginRouter.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await authService.authenticate(email, password);

    if (user) {
      req.session.loggedin = true;
      req.session.user_id = user.id;
      return res.redirect('/homepage');
    } else {
      return res.redirect('/login?Error=true');
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Server error');
  }
});

module.exports = loginRouter;