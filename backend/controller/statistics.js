const express = require('express');
const statisticsRouter = express.Router();
const statisticsService = require('../service/statisticsService');
const userModel = require('../model/userModel');
const path = require('path');

statisticsRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'statistics')));

statisticsRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'statistics', 'index.html'));
});

statisticsRouter.post('/sort-by-date', (req, res) => {
  const { 'start-date': startDate, 'end-date': endDate } = req.body;
  req.session.dateFilter = { startDate, endDate };
  res.sendStatus(200);
});

const getDates = (req) => req.session.dateFilter || { startDate: null, endDate: null };

statisticsRouter.get('/income-sum', async (req, res) => {
  try {
    const { startDate, endDate } = getDates(req);
    const incomesum = await statisticsService.getFullStatistics(
      req.session.user_id,
      startDate,
      endDate,
    );
    res.json({ incomesum: incomesum.incomeSum });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

statisticsRouter.get('/expenses-sum', async (req, res) => {
  try {
    const { startDate, endDate } = getDates(req);
    const data = await statisticsService.getFullStatistics(req.session.user_id, startDate, endDate);
    res.json({ expensessum: data.expensesSum });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

statisticsRouter.get('/expenses-by-category', async (req, res) => {
  try {
    const { startDate, endDate } = getDates(req);
    const data = await statisticsService.getFullStatistics(req.session.user_id, startDate, endDate);
    res.json({ expensesByCategory: data.expensesByCategory });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

statisticsRouter.get('/expenses-list-by-category/:category', async (req, res) => {
  try {
    const { startDate, endDate } = getDates(req);
    const list = await statisticsService.getCategoryDetails(
      req.session.user_id,
      req.params.category,
      startDate,
      endDate,
    );
    res.json({ expensesListByCategory: list });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

statisticsRouter.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = statisticsRouter;
