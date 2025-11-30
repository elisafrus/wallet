const express = require('express');
const homepageRouter = express.Router();
const db = require('./db');

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

  db.query('INSERT INTO income (amount, date, user_id) VALUES (?, ?, ?)', [incomeamount, incomedate, user_id], (err) => {
    if (err) {
      console.error('SQL error' + err.message);
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

  db.query('INSERT INTO expenses (amount, date, category, user_id) VALUES (?, ?, ?, ?)', [expensesamount, expensesdate, expensescategory, user_id], (err) => {
    if (err) {
      console.error('SQL error' + err.message);
      res.status(500).send('Server error');
      return;
    }
    res.redirect(req.get('referer'));
  });
});

homepageRouter.get('/account-balance', (req, res) => {
  const user_id = req.session.user_id;

  return db.query(
    `SELECT
            (SELECT SUM(amount) FROM income WHERE user_id = ${user_id}) AS income_sum,
            (SELECT SUM(amount) FROM expenses WHERE user_id = ${user_id}) AS expenses_sum`,
    (error, rows) => {
      const value = rows[0]['income_sum'] - rows[0]['expenses_sum'];
      res.send(JSON.stringify({ value }));
    }
  );
});

homepageRouter.get('/recent-transactions', (req, res) => {
  const user_id = req.session.user_id;
  return db.query(
    `SELECT * FROM (
            (SELECT 'income' AS type, NULL AS category, date, amount, id FROM income WHERE user_id = ${user_id})
            UNION ALL
            (SELECT 'expenses' AS type, category, date, amount, id FROM expenses WHERE user_id = ${user_id})
        ) AS transactions
        ORDER BY date DESC, id DESC`,
    (error, rows) => {
      if (error) {
        res.status(500).send(JSON.stringify({ error: "Server error" }));
        return;
      }
      res.send(JSON.stringify({ transactions: rows }));
    }
  );
});

homepageRouter.delete('/homepage/transactions/:id/delete/:type', (req, res) => {
  const transactionId = req.params.id;
  const transactionType = req.params.type;

  let deleteTransactionQuery = '';

  if (transactionType === 'income') {
    deleteTransactionQuery = `DELETE FROM income WHERE id = ?`;
  } else if (transactionType === 'expenses') {
    deleteTransactionQuery = `DELETE FROM expenses WHERE id = ?`;
  } else {
    res.status(400).json({ error: 'Incorrect type of transaction' });
    return;
  }

  db.query(deleteTransactionQuery, [transactionId], (error) => {
    if (error) {
      console.error('SQL error', error);
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

function editIncomeTransaction(transactionId, newAmount, newDate) {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE income SET amount = ?, date = ? WHERE id = ?';
    db.query(query, [newAmount, newDate, transactionId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function editExpensesTransaction(transactionId, newAmount, newDate, newCategory) {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE expenses SET amount = ?, date = ?, category = ? WHERE id = ?';
    db.query(query, [newAmount, newDate, newCategory, transactionId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

homepageRouter.put('/homepage/transactions/:id/edit/:type', async (req, res) => {
  const { type, id } = req.params;
  const { amount, date, category } = req.body;

  try {
    if (type === 'income') {
      await editIncomeTransaction(id, amount, date);
    } else if (type === 'expenses') {
      await editExpensesTransaction(id, amount, date, category);
    }
    res.status(200).send('Transaction edited successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

homepageRouter.get('/homepage/avatar', (req, res) => {
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
