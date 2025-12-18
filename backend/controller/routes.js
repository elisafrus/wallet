const express = require('express');
const router = express.Router();
const path = require('path');

// 1. Підключаємо всі роутери
const signupRouter = require('./signup');
const loginRouter = require('./login');
const homepageRouter = require('./homepage');
const statisticsRouter = require('./statistics');
const profileRouter = require('./profile');

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user_id) {
    return next();
  }
  res.redirect('/login');
};

router.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

router.use('/signup', signupRouter);
router.use('/login', loginRouter);

router.use('/homepage', isAuthenticated, homepageRouter);
router.use('/statistics', isAuthenticated, statisticsRouter);
router.use('/profile', isAuthenticated, profileRouter);

router.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/homepage');
  } else {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'welcome', 'index.html'));
  }
});

module.exports = router;
