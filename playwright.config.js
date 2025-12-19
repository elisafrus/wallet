const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './backend/tests/e2e',

  testMatch: /.*\.js/,

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'node backend/app.js',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
