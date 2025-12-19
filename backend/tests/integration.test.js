const request = require('supertest');
const app = require('../app');
const userModel = require('../model/userModel');

jest.mock('../model/userModel');

describe('Integration Test: API Routes', () => {
  test('GET /login should return 200', async () => {
    const res = await request(app).get('/login').redirects(1);
    expect(res.statusCode).toBe(200);
  });

  test('POST /login should redirect on error', async () => {
    userModel.findUserByEmail.mockImplementation((email, cb) => cb(null, null));

    const res = await request(app)
      .post('/login')
      .send({ email: 'wrong@email.com', password: '123' });

    expect(res.statusCode).toBe(302);
  });
});
