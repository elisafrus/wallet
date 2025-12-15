const express = require('express');
const homepageRouter = express.Router();
const db = require('../db');
const transactionModel = require('../model/transactionModel');
const userModel = require('../model/userModel');

const path = require('path');

homepageRouter.use(express.static(path.join(__dirname, '..')));

homepageRouter.use(express.static(path.join(__dirname, '..', 'frontend')));

homepageRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'homepage')));

homepageRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'homepage', 'index.html');
  res.sendFile(filePath);
});

homepageRouter.post('/income', (req, res) => {
  const { incomeamount, incomedate } = req.body;
  const user_id = req.session.user_id;

  if (!incomeamount || !incomedate) {
    res.status(400).send('Missing required fields');
    return;
  }

  transactionModel.addIncome(incomeamount, incomedate, user_id, (err) => {
    if (err) {
      console.error('Error adding income:', err.message);
      res.status(500).send('Server error');
      return;
    }
    res.redirect(req.get('referer'));
  });
});

homepageRouter.post('/expenses', (req, res) => {
  const { expensesamount, expensesdate, expensescategory } = req.body;
  const user_id = req.session.user_id;

  if (!expensesamount || !expensesdate || !expensescategory) {
    res.status(400).send('Missing required fields');
    return;
  }

  transactionModel.addExpense(expensesamount, expensesdate, expensescategory, user_id, (err) => {
    if (err) {
      console.error('Error adding expense:', err.message);
      res.status(500).send('Server error');
      return;
    }
    res.redirect(req.get('referer'));
  });
});

homepageRouter.get('/account-balance', (req, res) => {
  const user_id = req.session.user_id;

  transactionModel.getAccountBalance(user_id, (error, balance) => {
    if (error) {
      console.error('Model error:', error);
      return res.status(500).send(JSON.stringify({ error: "Server error" }));
    }
    res.send(JSON.stringify({ value: balance }));
  });
});

homepageRouter.get('/recent-transactions', (req, res) => {
  const user_id = req.session.user_id;

  transactionModel.getRecentTransactions(user_id, (error, transactions) => {
    if (error) {
      console.error('Model error:', error);
      res.status(500).send(JSON.stringify({ error: "Server error" }));
      return;
    }
    res.send(JSON.stringify({ transactions: transactions }));
  });
});

homepageRouter.delete('/homepage/transactions/:id/delete/:type', (req, res) => {
  const transactionId = req.params.id;
  const transactionType = req.params.type;

  if (transactionType !== 'income' && transactionType !== 'expenses') {
    res.status(400).json({ error: 'Incorrect type of transaction' });
    return;
  }

  transactionModel.deleteTransaction(transactionId, transactionType, (error) => {
    if (error) {
      console.error('Model error', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    if (transactionType === 'income') {
      res.status(200).json({ message: 'Income transaction deleted successfully' });
    } else {
      res.status(200).json({ message: 'Expenses transaction deleted successfully' });
    }
  });
});

homepageRouter.put('/homepage/transactions/:id/edit/:type', async (req, res) => {
  const { type, id } = req.params;
  const { amount, date, category } = req.body;

  try {
    if (type === 'income') {
      await transactionModel.updateIncomeTransaction(id, amount, date);
    } else if (type === 'expenses') {
      await transactionModel.updateExpenseTransaction(id, amount, date, category);
    } else {
      return res.status(400).send('Incorrect transaction type');
    }
    res.status(200).send('Transaction edited successfully');
  } catch (error) {
    console.error('Model error:', error);
    res.status(500).send('Server error');
  }
});

homepageRouter.get('/homepage/avatar', (req, res) => {
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

homepageRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = homepageRouter;
