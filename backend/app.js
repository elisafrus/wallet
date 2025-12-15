const express = require('express');
const app = express();
const routes = require('./controller/routes');
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session');
const homepageRouter = require("./controller/homepage");
const statisticsRouter = require("./controller/statistics");
const profileRouter = require("./controller/profile");

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', routes);

app.use(express.static(path.join(__dirname, '..')));

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(express.static(path.join(__dirname, '..', 'frontend', 'welcome')));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'welcome', 'index.html');
  res.sendFile(filePath);
});

app.use('/', homepageRouter);
app.use('/', statisticsRouter);
app.use('/', profileRouter);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
