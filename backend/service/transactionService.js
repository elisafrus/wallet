const transactionModel = require('../model/transactionModel');
const { promisify } = require('util');

const addIncome = promisify(transactionModel.addIncome);
const addExpense = promisify(transactionModel.addExpense);
const getBalance = promisify(transactionModel.getAccountBalance);
const getRecent = promisify(transactionModel.getRecentTransactions);
const deleteTx = promisify(transactionModel.deleteTransaction);

class TransactionService {
  async createIncome(amount, date, userId) {
    return await addIncome(amount, date, userId);
  }

  async createExpense(amount, date, category, userId) {
    return await addExpense(amount, date, category, userId);
  }

  async getAccountSummary(userId) {
    const balance = await getBalance(userId);
    const transactions = await getRecent(userId);
    return { balance, transactions };
  }

  async removeTransaction(id, type) {
    if (type !== 'income' && type !== 'expenses') {
      throw new Error('INVALID_TYPE');
    }
    return await deleteTx(id, type);
  }

  async updateTransaction(id, type, data) {
    const { amount, date, category } = data;
    if (type === 'income') {
      return await transactionModel.updateIncomeTransaction(id, amount, date);
    } else if (type === 'expenses') {
      return await transactionModel.updateExpenseTransaction(id, amount, date, category);
    }
    throw new Error('INVALID_TYPE');
  }
}

module.exports = new TransactionService();
