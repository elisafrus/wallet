const express = require('express');
const statisticsRouter = express.Router();
const transactionModel = require('../model/transactionModel');
const userModel = require('../model/userModel');

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
  const { startDate, endDate } = dateFilter;

  transactionModel.getIncomeSum(user_id, startDate, endDate, (error, incomesum) => {
    if (error) {
      console.error('Model error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json({ incomesum });
  });
});

statisticsRouter.get('/expenses-sum', (req, res) => {
  const user_id = req.session.user_id;
  const { startDate, endDate } = dateFilter;

  transactionModel.getExpensesSum(user_id, startDate, endDate, (error, expensessum) => {
    if (error) {
      console.error('Model error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json({ expensessum });
  });
});

statisticsRouter.get('/expenses-by-category', (req, res) => {
  const user_id = req.session.user_id;
  const { startDate, endDate } = dateFilter;

  transactionModel.getExpensesByCategory(
    user_id,
    startDate,
    endDate,
    (error, expensesByCategory) => {
      if (error) {
        console.error('Model error', error);
        res.status(500).json({ error: 'Server error' });
        return;
      }
      res.json({ expensesByCategory });
    },
  );
});

statisticsRouter.get('/expenses-list-by-category/:category', (req, res) => {
  const user_id = req.session.user_id;
  const category = req.params.category;
  const { startDate, endDate } = dateFilter;

  transactionModel.getExpensesListByCategory(
    user_id,
    category,
    startDate,
    endDate,
    (error, expensesListByCategory) => {
      if (error) {
        console.error('Model error', error);
        res.status(500).json({ error: 'Server error' });
        return;
      }
      res.json({ expensesListByCategory });
    },
  );
});

statisticsRouter.get('/expenses-by-date', (req, res) => {
  const user_id = req.session.user_id;
  const { startDate, endDate } = dateFilter;

  transactionModel.getExpensesByDate(user_id, startDate, endDate, (error, expensesByDate) => {
    if (error) {
      console.error('Model error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json({ expensesByDate });
  });
});

statisticsRouter.get('/income-by-date', (req, res) => {
  const user_id = req.session.user_id;
  const { startDate, endDate } = dateFilter;

  transactionModel.getIncomeByDate(user_id, startDate, endDate, (error, incomeByDate) => {
    if (error) {
      console.error('Model error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    res.json({ incomeByDate });
  });
});

statisticsRouter.get('/statistics/avatar', (req, res) => {
  const user_id = req.session.user_id;

  userModel.getUserAvatar(user_id, (err, avatarUrl) => {
    if (err) {
      console.error('Model error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!avatarUrl) {
      return res.status(404).json({ error: 'Image not found' });
    }

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
