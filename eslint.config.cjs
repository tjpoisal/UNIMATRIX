const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    ignores: ['node_modules/', 'dist/', 'build/', '.next/', '.turbo/'],
  },
  ...compat.config({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      tsconfigRootDir: __dirname,
      project: ['./tsconfig.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json'],
    },
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'prettier',
    ],
    settings: {
      react: { version: 'detect' },
    },
    env: {
      node: true,
      browser: true,
      es2024: true,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),
];