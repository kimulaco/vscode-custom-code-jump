module.exports = {
  root: true,
  extends: ['prettier'],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  rules: {},
  ignorePatterns: ['out', 'dist', '**/*.d.ts'],

  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'import',
            format: ['camelCase', 'PascalCase'],
          },
        ],
      },
    },
  ],
};
