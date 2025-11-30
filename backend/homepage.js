const express = require('express');
const homepageRouter = express.Router();
const path = require('path');

const db = require('./data');

const { Users, Transactions, getNextTransactionId } = db;

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

  if (!user_id) {
    return res.status(401).send('Unauthorized');
  }
  if (!incomeamount || !incomedate) {
    return res.status(400).send('Missing required fields');
  }

  const newTransaction = {
    id: getNextTransactionId(),
    user_id: user_id,
    type: 'income',
    amount: parseFloat(incomeamount),
    date: incomedate,
  };

  Transactions.push(newTransaction);
  res.redirect(req.get('referer'));
});

homepageRouter.post('/expenses', (req, res) => {
  const { expensesamount, expensesdate, expensescategory } = req.body;
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.status(401).send('Unauthorized');
  }
  if (!expensesamount || !expensesdate || !expensescategory) {
    return res.status(400).send('Missing required fields');
  }

  const newTransaction = {
    id: getNextTransactionId(),
    user_id: user_id,
    type: 'expenses',
    amount: parseFloat(expensesamount),
    date: expensesdate,
    category: expensescategory,
  };

  Transactions.push(newTransaction);
  res.redirect(req.get('referer'));
});

homepageRouter.get('/account-balance', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userTransactions = Transactions.filter(t => t.user_id === user_id);

  // Розраховуємо суму
  const income_sum = userTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses_sum = userTransactions
    .filter(t => t.type === 'expenses')
    .reduce((sum, t) => sum + t.amount, 0);

  const value = income_sum - expenses_sum;

  res.send(JSON.stringify({ value: value.toFixed(2) }));
});

homepageRouter.get('/recent-transactions', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userTransactions = Transactions
    .filter(t => t.user_id === user_id)
    .map(t => ({
      type: t.type,
      category: t.category || null, // В income category буде null
      date: t.date,
      amount: t.amount,
      id: t.id
    }))

    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return b.id - a.id;
    });

  res.send(JSON.stringify({ transactions: userTransactions }));
});

homepageRouter.delete('/transactions/:id/delete/:type', (req, res) => {
  const transactionId = parseInt(req.params.id);
  const transactionType = req.params.type;
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const initialLength = db.Transactions.length;

  db.setTransactions(db.Transactions.filter(t =>
    !(t.id === transactionId && t.type === transactionType && t.user_id === user_id)
  ));

  if (db.Transactions.length < initialLength) {
    const message = transactionType === 'income'
      ? 'Income transaction deleted successfully'
      : 'Expenses transaction deleted successfully';
    res.status(200).json({ message });
  } else {
    res.status(404).json({ error: 'Transaction not found or unauthorized' });
  }
});

function editIncomeTransaction(transactionId, newAmount, newDate, user_id) {
  const transaction = Transactions.find(t => t.id === parseInt(transactionId) && t.type === 'income' && t.user_id === user_id);
  if (transaction) {
    transaction.amount = parseFloat(newAmount);
    transaction.date = newDate;
    return true;
  }
  return false;
}

function editExpensesTransaction(transactionId, newAmount, newDate, newCategory, user_id) {
  const transaction = Transactions.find(t => t.id === parseInt(transactionId) && t.type === 'expenses' && t.user_id === user_id);
  if (transaction) {
    transaction.amount = parseFloat(newAmount);
    transaction.date = newDate;
    transaction.category = newCategory;
    return true;
  }
  return false;
}

homepageRouter.put('/homepage/transactions/:id/edit/:type', async (req, res) => {
  const { type, id } = req.params;
  const { amount, date, category } = req.body;
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.status(401).send('Unauthorized');
  }

  try {
    let success = false;
    if (type === 'income') {
      success = editIncomeTransaction(id, amount, date, user_id);
    } else if (type === 'expenses') {
      success = editExpensesTransaction(id, amount, date, category, user_id);
    }

    if (success) {
      res.status(200).send('Transaction edited successfully');
    } else {
      res.status(404).send('Transaction not found or unauthorized');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

homepageRouter.get('/homepage/avatar', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = Users.find(u => u.id === user_id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const avatarUrl = user.avatar;
  if (!avatarUrl) {
    return res.status(200).json({ avatarUrl: null });
  }

  res.json({ avatarUrl: avatarUrl });
});

homepageRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Could not log out.');
    } else {
       res.redirect('/');
    }
  });
});

module.exports = homepageRouter;