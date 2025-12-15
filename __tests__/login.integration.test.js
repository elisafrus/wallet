const request = require('supertest');
const app = require('../backend/app');
const db = require('../backend/db'); 

describe('POST /login', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  test('Успішний вхід повинен повернути редирект на /homepage', async () => {
    // Імітація успішного пошуку користувача в БД
    const mockUser = [{ id: 1, password: 'hashed_password_from_db' }];
    db.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockUser);
    });

    jest.mock('bcrypt', () => ({
      compare: (password, hash, callback) => callback(null, true),
    }));

    const response = await request(app)
      .post('/login')
      .send({ email: 'valid@mail.com', password: 'validpassword' });

    expect(response.statusCode).toBe(302); // Код редиректу
    expect(response.headers.location).toBe('/homepage');
  });

  test('Невірний пароль повинен повернути редирект на /login?Error=true', async () => {
    const mockUser = [{ id: 1, password: 'hashed_password_from_db' }];
    db.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockUser);
    });

    jest.mock('bcrypt', () => ({
      compare: (password, hash, callback) => callback(null, false),
    }));

    const response = await request(app)
      .post('/login')
      .send({ email: 'valid@mail.com', password: 'wrongpassword' });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/login?Error=true');
  });
});