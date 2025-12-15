jest.mock('../backend/db');
const db = require('../backend/db');
const userModel = require('../backend/model/userModel');

describe('userModel', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  test('findUserByEmail повинен повернути користувача, якщо знайдено', async () => {
    const mockUser = [{ id: 1, email: 'test@mail.com', password: 'hashed' }];
    // Налаштовуємо мок-функцію, щоб вона повернула очікувані результати
    db.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockUser);
    });

    await new Promise(resolve => {
      userModel.findUserByEmail('test@mail.com', (err, user) => {
        expect(err).toBeNull();
        expect(user).toEqual(mockUser[0]);
        // Перевіряємо, чи був викликаний правильний SQL-запит
        expect(db.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM users'),
          ['test@mail.com'],
          expect.any(Function)
        );
        resolve();
      });
    });
  });

  test('findUserByEmail повинен повернути null, якщо користувача не знайдено', async () => {
    db.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, []); // Порожній масив
    });

    await new Promise(resolve => {
      userModel.findUserByEmail('unknown@mail.com', (err, user) => {
        expect(err).toBeNull();
        expect(user).toBeNull();
        resolve();
      });
    });
  });
});