module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  overrides: [
    {
      files: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/__tests__/**/*.js',
        '**/__mocks__/**/*.js'
      ],
      env: {
        jest: true
      }
    }
  ],
  globals: {
    Chart: 'readonly'
  }
};
