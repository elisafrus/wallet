const transactionModel = require('../model/transactionModel');
const { promisify } = require('util');

const getIncomeSum = promisify(transactionModel.getIncomeSum);
const getExpensesSum = promisify(transactionModel.getExpensesSum);
const getExpensesByCategory = promisify(transactionModel.getExpensesByCategory);
const getExpensesListByCategory = promisify(transactionModel.getExpensesListByCategory);
const getExpensesByDate = promisify(transactionModel.getExpensesByDate);
const getIncomeByDate = promisify(transactionModel.getIncomeByDate);

class StatisticsService {
  async getFullStatistics(userId, startDate, endDate) {
    const [incomeSum, expensesSum, expensesByCategory, expensesByDate, incomeByDate] = await Promise.all([
      getIncomeSum(userId, startDate, endDate),
      getExpensesSum(userId, startDate, endDate),
      getExpensesByCategory(userId, startDate, endDate),
      getExpensesByDate(userId, startDate, endDate),
      getIncomeByDate(userId, startDate, endDate)
    ]);

    return { incomeSum, expensesSum, expensesByCategory, expensesByDate, incomeByDate };
  }

  async getCategoryDetails(userId, category, startDate, endDate) {
    return await getExpensesListByCategory(userId, category, startDate, endDate);
  }
}

module.exports = new StatisticsService();