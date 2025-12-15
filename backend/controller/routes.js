const express = require('express');
const router = express.Router();
const path = require('path');

router.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

const signupRouter = require('./signup');
const loginRouter = require('./login');
const homepageRouter = require("./homepage");
const statisticsRouter = require("./statistics");

router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/homepage', homepageRouter);
router.use('/statistics', statisticsRouter);

module.exports = router;