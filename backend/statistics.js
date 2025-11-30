const express = require('express');
const statisticsRouter = express.Router();
const { Users, Transactions } = require('./data');

const path = require('path');

statisticsRouter.use(express.static(path.join(__dirname, '..')));
statisticsRouter.use(express.static(path.join(__dirname, '..', 'frontend')));
statisticsRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'statistics')));

statisticsRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'statistics', 'index.html');
  res.sendFile(filePath);
});

let dateFilter = {};

const matchesDateFilter = (transaction, dateFilter) => {
  if (!dateFilter.startDate || !dateFilter.endDate) {
    return true;
  }
  return transaction.date >= dateFilter.startDate && transaction.date <= dateFilter.endDate;
};

statisticsRouter.post('/sort-by-date', (req, res) => {
  const startDate = req.body['start-date'];
  const endDate = req.body['end-date'];
  dateFilter = { startDate, endDate };
  res.sendStatus(200);
});

statisticsRouter.get('/income-sum', (req, res) => {
  const user_id = req.session.user_id;

  const filteredIncomes = Transactions.filter(t =>
    t.user_id === user_id &&
    t.type === 'income' &&
    matchesDateFilter(t, dateFilter)
  );

  const incomesum = filteredIncomes.reduce((sum, t) => sum + t.amount, 0);

  res.json({ incomesum: incomesum.toFixed(2) }); // toFixed(2) для збереження формату
});

statisticsRouter.get('/expenses-sum', (req, res) => {
  const user_id = req.session.user_id;

  const filteredExpenses = Transactions.filter(t =>
    t.user_id === user_id &&
    t.type === 'expense' &&
    matchesDateFilter(t, dateFilter)
  );

  const expensessum = filteredExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Повертаємо об'єкт у форматі, якби його повернула БД
  res.json({ expensessum: expensessum.toFixed(2) }); // toFixed(2) для збереження формату
});

statisticsRouter.get('/expenses-by-category', (req, res) => {
  const user_id = req.session.user_id;

  // Фільтруємо транзакції: за user_id, типом 'expense' та фільтром дат
  const filteredExpenses = Transactions.filter(t =>
    t.user_id === user_id &&
    t.type === 'expense' &&
    matchesDateFilter(t, dateFilter)
  );

  const expensesByCategoryMap = filteredExpenses.reduce((acc, t) => {
    const category = t.category || 'Unknown';
    acc[category] = (acc[category] || 0) + t.amount;
    return acc;
  }, {});

  const expensesByCategory = Object.keys(expensesByCategoryMap).map(category => ({
    category: category,
    total_amount: expensesByCategoryMap[category].toFixed(2)
  }));

  res.json({ expensesByCategory });
});

statisticsRouter.get('/expenses-list-by-category/:category', (req, res) => {
  const user_id = req.session.user_id;
  const category = req.params.category;

  const expensesListByCategory = Transactions.filter(t =>
    t.user_id === user_id &&
    t.type === 'expense' &&
    t.category === category &&
    matchesDateFilter(t, dateFilter)
  ).map(t => ({
    amount: t.amount,
    date: new Date(t.date)
  }));

  res.json({ expensesListByCategory });
});

const groupAndSumByMonth = (transactions) => {
  const groupedData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = { year, month, total_month_amount: 0 };
    }
    acc[key].total_month_amount += t.amount;
    return acc;
  }, {});

  return Object.values(groupedData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  }).map(item => ({
    year: item.year,
    month: item.month,
    total_month_amount: item.total_month_amount.toFixed(2)
  }));
};

statisticsRouter.get('/expenses-by-date', (req, res) => {
  const user_id = req.session.user_id;

  // Фільтруємо транзакції: за user_id, типом 'expense' та фільтром дат
  const filteredExpenses = Transactions.filter(t =>
    t.user_id === user_id &&
    t.type === 'expense' &&
    matchesDateFilter(t, dateFilter)
  );

  const expensesByDate = groupAndSumByMonth(filteredExpenses);

  res.json({ expensesByDate });
});

statisticsRouter.get('/income-by-date', (req, res) => {
  const user_id = req.session.user_id;

  const filteredIncomes = Transactions.filter(t =>
    t.user_id === user_id &&
    t.type === 'income' &&
    matchesDateFilter(t, dateFilter)
  );

  const incomeByDate = groupAndSumByMonth(filteredIncomes);

  res.json({ incomeByDate });
});

statisticsRouter.get('/statistics/avatar', (req, res) => {
  const user_id = req.session.user_id;

  const user = Users.find(u => u.id === user_id);

  if (!user) {
    return res.status(404).json({ error: 'Image not found' });
  }

  const avatarUrl = user.avatar;

  res.json({ avatarUrl: avatarUrl });
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