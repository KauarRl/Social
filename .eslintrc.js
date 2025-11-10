module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['unused-imports', 'simple-import-sort', 'import'],
  env: {
    jest: true,
  },
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'no-unused-vars': 'off',
    'import/order': 'off',
  },
};
