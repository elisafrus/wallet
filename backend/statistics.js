const express = require('express');
const statisticsRouter = express.Router();
const db = require('./db');

const path = require('path');

statisticsRouter.use(express.static(path.join(__dirname, '..')));

statisticsRouter.use(express.static(path.join(__dirname, '..', 'frontend')));

statisticsRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'statistics')));

statisticsRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'statistics', 'index.html');
  res.sendFile(filePath);
});

let dateFilter = {};

statisticsRouter.post('/sort-by-date', (req, res) => {
  const startDate = req.body['start-date'];
  const endDate = req.body['end-date'];
  dateFilter = { startDate, endDate };
  res.sendStatus(200);
});

statisticsRouter.get('/income-sum', (req, res) => {
  const user_id = req.session.user_id;
  let query = `SELECT SUM(amount) AS income_sum FROM income WHERE user_id = ${user_id}`;

  if (dateFilter.startDate && dateFilter.endDate) {
    query += ` AND date BETWEEN '${dateFilter.startDate}' AND '${dateFilter.endDate}'`;
  }

  db.query(query, (error, rows) => {
    if (error) {
      console.error('SQL error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    const incomesum = rows.length > 0 ? rows[0]['income_sum'] : 0;
    res.json({ incomesum });
  });
});

statisticsRouter.get('/expenses-sum', (req, res) => {
  const user_id = req.session.user_id;
  let query = `SELECT SUM(amount) AS expenses_sum FROM expenses WHERE user_id = ${user_id}`;

  if (dateFilter.startDate && dateFilter.endDate) {
    query += ` AND date BETWEEN '${dateFilter.startDate}' AND '${dateFilter.endDate}'`;
  }

  db.query(query, (error, rows) => {
    if (error) {
      console.error('SQL error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    const expensessum = rows.length > 0 ? rows[0]['expenses_sum'] : 0;
    res.json({ expensessum });
  });
});

statisticsRouter.get('/expenses-by-category', (req, res) => {
  const user_id = req.session.user_id;
  let query = `SELECT category, SUM(amount) AS total_amount FROM expenses WHERE user_id = ${user_id}`;

  if (dateFilter.startDate && dateFilter.endDate) {
    query += ` AND date BETWEEN '${dateFilter.startDate}' AND '${dateFilter.endDate}'`;
  }

  query += ' GROUP BY category';

  db.query(query, (error, rows) => {
    if (error) {
      console.error('SQL error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    const expensesByCategory = rows.map((row) => ({
      category: row.category,
      total_amount: row.total_amount,
    }));
    res.json({ expensesByCategory });
  });
});

statisticsRouter.get('/expenses-list-by-category/:category', (req, res) => {
  const user_id = req.session.user_id;
  const category = req.params.category;
  let query = `SELECT amount, date FROM expenses WHERE user_id = ${user_id} AND category = ?`;

  if (dateFilter.startDate && dateFilter.endDate) {
    query += ` AND date BETWEEN '${dateFilter.startDate}' AND '${dateFilter.endDate}'`;
  }

  db.query(query, [category], (error, rows) => {
    if (error) {
      console.error('SQL error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    const expensesListByCategory = rows.map((row) => ({
      amount: row.amount,
      date: row.date,
    }));
    res.json({ expensesListByCategory });
  });
});

statisticsRouter.get('/expenses-by-date', (req, res) => {
  const user_id = req.session.user_id;
  let query = `SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(amount) AS total_month_amount FROM expenses WHERE user_id = ${user_id}`;

  if (dateFilter.startDate && dateFilter.endDate) {
    query += ` AND date BETWEEN '${dateFilter.startDate}' AND '${dateFilter.endDate}'`;
  }

  query += ' GROUP BY YEAR(date), MONTH(date) ORDER BY year, month';

  db.query(query, (error, rows) => {
    if (error) {
      console.error('SQL error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    const expensesByDate = rows.map((row) => ({
      year: row.year,
      month: row.month,
      total_month_amount: row.total_month_amount,
    }));
    res.json({ expensesByDate });
  });
});

statisticsRouter.get('/income-by-date', (req, res) => {
  const user_id = req.session.user_id;
  let query = `SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(amount) AS total_month_amount FROM income WHERE user_id = ${user_id}`;

  if (dateFilter.startDate && dateFilter.endDate) {
    query += ` AND date BETWEEN '${dateFilter.startDate}' AND '${dateFilter.endDate}'`;
  }

  query += ' GROUP BY YEAR(date), MONTH(date) ORDER BY year, month';

  db.query(query, (error, rows) => {
    if (error) {
      console.error('SQL error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    const incomeByDate = rows.map((row) => ({
      year: row.year,
      month: row.month,
      total_month_amount: row.total_month_amount,
    }));
    res.json({ incomeByDate });
  });
});

statisticsRouter.get('/statistics/avatar', (req, res) => {
  const user_id = req.session.user_id;
  const sql = 'SELECT avatar FROM users WHERE id = ?';

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('SQL error', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const avatarUrl = results[0].avatar;

    res.json({ avatarUrl: avatarUrl });
  });
});

statisticsRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = statisticsRouter;
