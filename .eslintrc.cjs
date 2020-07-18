const prettierRules = require('./.prettierrc.cjs');

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'eslint-config-prettier', "plugin:@typescript-eslint/eslint-recommended",
  "plugin:@typescript-eslint/recommended"],
  rules: {
    'prettier/prettier': ['error', prettierRules],
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
  },
  plugins: ['eslint-plugin-prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
};
