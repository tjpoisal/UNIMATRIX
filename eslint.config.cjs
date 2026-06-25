const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
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
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json'],
      },
    },
  },
];