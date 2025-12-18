const express = require('express');
const homepageRouter = express.Router();
const transactionService = require('../service/transactionService');
const path = require('path');

homepageRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'homepage')));

homepageRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'homepage', 'index.html'));
});

homepageRouter.post('/income', async (req, res) => {
  const { incomeamount, incomedate } = req.body;
  const userId = req.session.user_id;

  if (!incomeamount || !incomedate) return res.status(400).send('Missing fields');

  try {
    await transactionService.createIncome(incomeamount, incomedate, userId);
    res.redirect(req.get('referer'));
  } catch (err) {
    res.status(500).send('Server error');
  }
});

homepageRouter.post('/expenses', async (req, res) => {
  const { expensesamount, expensesdate, expensescategory } = req.body;
  const userId = req.session.user_id;

  if (!expensesamount || !expensesdate || !expensescategory)
    return res.status(400).send('Missing fields');

  try {
    await transactionService.createExpense(expensesamount, expensesdate, expensescategory, userId);
    res.redirect(req.get('referer'));
  } catch (err) {
    res.status(500).send('Server error');
  }
});

homepageRouter.get('/account-balance', async (req, res) => {
  try {
    const { balance } = await transactionService.getAccountSummary(req.session.user_id);
    res.json({ value: balance });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

homepageRouter.get('/recent-transactions', async (req, res) => {
  try {
    const { transactions } = await transactionService.getAccountSummary(req.session.user_id);
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

homepageRouter.delete('/homepage/transactions/:id/delete/:type', async (req, res) => {
  try {
    await transactionService.removeTransaction(req.params.id, req.params.type);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    const status = err.message === 'INVALID_TYPE' ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

homepageRouter.put('/homepage/transactions/:id/edit/:type', async (req, res) => {
  try {
    await transactionService.updateTransaction(req.params.id, req.params.type, req.body);
    res.status(200).send('Edited successfully');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

homepageRouter.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = homepageRouter;
