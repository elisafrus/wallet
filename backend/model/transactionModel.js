// models/transactionModel.js
const db = require('../db');

function addDateFilter(baseQuery, userId, startDate, endDate) {
  const params = [userId];
  let query = baseQuery;

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  return { query, params };
}

const transactionModel = {
  getAccountBalance: (userId, callback) => {
    const query = `
      SELECT
        (SELECT SUM(amount) FROM income WHERE user_id = ?) AS income_sum,
        (SELECT SUM(amount) FROM expenses WHERE user_id = ?) AS expenses_sum
    `;
    db.query(query, [userId, userId], (error, rows) => {
      if (error) {
        return callback(error, null);
      }
      const incomeSum = rows[0].income_sum || 0;
      const expensesSum = rows[0].expenses_sum || 0;
      const balance = incomeSum - expensesSum;
      callback(null, balance);
    });
  },

  addIncome: (amount, date, userId, callback) => {
    const query = 'INSERT INTO income (amount, date, user_id) VALUES (?, ?, ?)';
    db.query(query, [amount, date, userId], callback);
  },

  addExpense: (amount, date, category, userId, callback) => {
    const query = 'INSERT INTO expenses (amount, date, category, user_id) VALUES (?, ?, ?, ?)';
    db.query(query, [amount, date, category, userId], callback);
  },

  getRecentTransactions: (userId, callback) => {
    const query = `
      SELECT * FROM (
        (SELECT 'income' AS type, NULL AS category, date, amount, id FROM income WHERE user_id = ?)
        UNION ALL
        (SELECT 'expenses' AS type, category, date, amount, id FROM expenses WHERE user_id = ?)
      ) AS transactions
      ORDER BY date DESC, id DESC
    `;
    db.query(query, [userId, userId], (error, rows) => {
      callback(error, rows);
    });
  },

  deleteTransaction: (id, type, callback) => {
    let query = '';
    if (type === 'income') {
      query = `DELETE FROM income WHERE id = ?`;
    } else if (type === 'expenses') {
      query = `DELETE FROM expenses WHERE id = ?`;
    } else {
      return callback(new Error('Invalid transaction type'));
    }
    db.query(query, [id], callback);
  },

  updateIncomeTransaction: (id, amount, date) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE income SET amount = ?, date = ? WHERE id = ?';
      db.query(query, [amount, date, id], (error, results) => {
        if (error) reject(error); else resolve(results);
      });
    });
  },

  updateExpenseTransaction: (id, amount, date, category) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE expenses SET amount = ?, date = ?, category = ? WHERE id = ?';
      db.query(query, [amount, date, category, id], (error, results) => {
        if (error) reject(error); else resolve(results);
      });
    });
  },

  getIncomeSum: (userId, startDate, endDate, callback) => {
    const baseQuery = `SELECT SUM(amount) AS income_sum FROM income WHERE user_id = ?`;
    const { query, params } = addDateFilter(baseQuery, userId, startDate, endDate);

    db.query(query, params, (error, rows) => {
      const sum = rows && rows.length > 0 ? rows[0]['income_sum'] : 0;
      callback(error, sum);
    });
  },

  getExpensesSum: (userId, startDate, endDate, callback) => {
    const baseQuery = `SELECT SUM(amount) AS expenses_sum FROM expenses WHERE user_id = ?`;
    const { query, params } = addDateFilter(baseQuery, userId, startDate, endDate);

    db.query(query, params, (error, rows) => {
      const sum = rows && rows.length > 0 ? rows[0]['expenses_sum'] : 0;
      callback(error, sum);
    });
  },

  getExpensesByCategory: (userId, startDate, endDate, callback) => {
    const baseQuery = `SELECT category, SUM(amount) AS total_amount FROM expenses WHERE user_id = ?`;
    let { query, params } = addDateFilter(baseQuery, userId, startDate, endDate);

    query += ' GROUP BY category';

    db.query(query, params, (error, rows) => {
      const expensesByCategory = rows ? rows.map(row => ({
        category: row.category,
        total_amount: row.total_amount
      })) : [];
      callback(error, expensesByCategory);
    });
  },

  getExpensesListByCategory: (userId, category, startDate, endDate, callback) => {
    let query = `SELECT amount, date FROM expenses WHERE user_id = ? AND category = ?`;
    const params = [userId, category];

    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    db.query(query, params, (error, rows) => {
      const expensesList = rows ? rows.map(row => ({
        amount: row.amount,
        date: row.date
      })) : [];
      callback(error, expensesList);
    });
  },

  getExpensesByDate: (userId, startDate, endDate, callback) => {
    const baseQuery = `SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(amount) AS total_month_amount FROM expenses WHERE user_id = ?`;
    let { query, params } = addDateFilter(baseQuery, userId, startDate, endDate);

    query += ' GROUP BY YEAR(date), MONTH(date) ORDER BY year, month';

    db.query(query, params, (error, rows) => {
      const expensesByDate = rows ? rows.map(row => ({
        year: row.year,
        month: row.month,
        total_month_amount: row.total_month_amount
      })) : [];
      callback(error, expensesByDate);
    });
  },

  getIncomeByDate: (userId, startDate, endDate, callback) => {
    const baseQuery = `SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(amount) AS total_month_amount FROM income WHERE user_id = ?`;
    let { query, params } = addDateFilter(baseQuery, userId, startDate, endDate);

    query += ' GROUP BY YEAR(date), MONTH(date) ORDER BY year, month';

    db.query(query, params, (error, rows) => {
      const incomeByDate = rows ? rows.map(row => ({
        year: row.year,
        month: row.month,
        total_month_amount: row.total_month_amount
      })) : [];
      callback(error, incomeByDate);
    });
  }
};



module.exports = transactionModel;