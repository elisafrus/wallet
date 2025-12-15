const mockDb = {
  query: jest.fn(),

  connect: jest.fn((callback) => {
    if (callback) callback(null);
  }),
};

module.exports = mockDb;
