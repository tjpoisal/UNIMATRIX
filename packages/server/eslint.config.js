import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'generated/**'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
];
