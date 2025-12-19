const authService = require('./authService');
const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');

jest.mock('../model/userModel');
jest.mock('bcrypt');

describe('Unit Test: AuthService', () => {
  test('Success login', async () => {
    userModel.findUserByEmail.mockImplementation((email, cb) => {
      cb(null, { id: 1, email: 'test@test.com', password: 'hashed_password' });
    });
    bcrypt.compare.mockResolvedValue(true);

    const user = await authService.authenticate('test@test.com', 'password123');
    expect(user.id).toBe(1);
  });
});