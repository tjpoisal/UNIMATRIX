module.exports = {
  root: true,
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
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.next/', '.turbo/'],
  // Also ignore generated and non-source files that should not be linted with project parser options
  // (Prisma client, generated packages, docs, scripts)
  // These are intentionally excluded to avoid parserErrors referencing non-tsproject files.
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '.turbo/',
    'packages/db/generated/**',
    'packages/types/src/**',
    'scripts/**',
    'docs/**',
    'prisma.config.ts',
    // Ignore app bundles, extension assets and desktop build inputs which are not in TS projects
    'apps/desktop/**',
    'apps/extension/**',
    'apps/mobile/metro.config.js',
    'apps/web/__tests__/**',
  ],
  rules: {
    // repo-specific relaxations can go here
    '@typescript-eslint/no-explicit-any': 'off',
    // Next / modern React uses the automatic JSX runtime — React in scope not required
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    // Generated Prisma client - ignore and suppress noisy rules
    {
      files: ['packages/db/generated/**'],
      rules: {
        // Generated code: skip linting that expects source-level typing/style
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        'no-unused-private-class-members': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    // Mark packages/types generated artifacts and scripts as ignored via ignorePatterns above.
    // Ignore docs, scripts, and other files that are not part of the TS projects
    {
      files: ['docs/**', 'scripts/**', 'prisma.config.ts', 'packages/types/src/**', 'packages/*/eslint.config.*'],
      rules: {
        // do not attempt to type-check or lint these with project parser options
      },
      // mark these files as ignored by parser-based checks by excluding them from linting
    },
    // Skip parserOptions.project for plain JS files to avoid "none of those tsconfigs include this file" errors
    {
      files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
      parserOptions: {
        // Explicitly clear project for pure JS files so typescript-eslint won't attempt type-aware linting
        project: [],
      },
    },
  ],
};
