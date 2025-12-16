const Users = [
  {
    id: 1,
    fullname: 'user',
    email: 'user@wallet.com',
    password: '123',
    avatar: 'http://localhost:3000/uploads/avatar.jpg',
  },
  {
    id: 2,
    fullname: 'test',
    email: 'test@wallet.com',
    password: 'test',
    avatar: 'http://localhost:3000/uploads/user1.jpg',
  },
];

let Transactions = [
  { id: 101, user_id: 1, type: 'income', amount: 5000.0, date: '2025-11-01' },
  { id: 102, user_id: 1, type: 'expense', amount: 1200.0, date: '2025-11-05', category: 'rent' },
  {
    id: 103,
    user_id: 1,
    type: 'expense',
    amount: 350.5,
    date: '2025-11-08',
    category: 'food and drinks',
  },
  { id: 104, user_id: 1, type: 'income', amount: 100.0, date: '2025-11-10' },
  {
    id: 105,
    user_id: 1,
    type: 'expense',
    amount: 400.0,
    date: '2025-10-20',
    category: 'transport',
  },
  { id: 201, user_id: 2, type: 'expense', amount: 10.0, date: '2025-11-01', category: 'other' },
];

let nextUserId = 3;
let nextTransactionId = 300;

module.exports = {
  Users,
  get Transactions() {
    return Transactions;
  },
  getNextUserId: () => nextUserId++,
  getNextTransactionId: () => nextTransactionId++,
  setTransactions: (newTransactions) => {
    Transactions = newTransactions;
  },
};
