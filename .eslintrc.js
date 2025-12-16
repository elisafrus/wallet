module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
  },

  env: {
    browser: true,
    node: true,
    es2021: true
  },

  overrides: [
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
      },
    },
    {
      files: ['frontend/**/*.js'],
      env: {
        browser: true,
        node: false,
      },
      globals: {
        "Chart": "readonly",
        "File": "readonly",
        "DataTransfer": "readonly",
        "FileReader": "readonly",
        "localStorage": "readonly"
      }
    }
  ]
};