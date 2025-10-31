/**
 * Suggestions / Improvements (place here for quick team reference)
 *
 * 1) Enable type-aware rules only where needed:
 *    - Keep parserOptions.project for src/TS files but set project: null for configs/scripts to avoid slow type-checking on every file.
 *
 * 2) Incremental linting:
 *    - Use lint-staged + husky to run eslint --cache on staged files to speed pre-commit checks.
 *
 * 3) CI enforcement:
 *    - Run `eslint --max-warnings=0` in CI to fail the build on any warnings you want enforced.
 *
 * 4) Import resolver:
 *    - Ensure tsconfig.json has "paths" and configure `import/resolver.typescript.project` if using path aliases.
 *
 * 5) Opt into extra quality plugins as needed:
 *    - Consider eslint-plugin-unused-imports to auto-remove unused imports.
 *    - Consider stricter rules (no-default-export, prefer-readonly) behind a gradual opt-in plan.
 *
 * 6) Performance:
 *    - Pin plugin versions in package.json and consider ESLint caching; avoid enabling heavyweight type-check rules for large codebases unless needed.
 *
 * Adjust these recommendations as the team comfort and CI capacity grow.
 */

// ...existing code...
import type { FlatConfig } from 'eslint';

// load plugins via require to keep runtime compatibility
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const sonarjsPlugin = require('eslint-plugin-sonarjs');

const config: FlatConfig = [
  // global ignores
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**'],
  },

  // Base rules for JS/TS/React files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
      sonarjs: sonarjsPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {},
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      // Core
      'no-console': 'warn',
      'no-debugger': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Imports
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',

      // Accessibility
      'jsx-a11y/anchor-is-valid': 'warn',

      // Prettier
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // Sonar
      'sonarjs/cognitive-complexity': ['warn', 20],
    },
  },

  // Tests override
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
    languageOptions: { globals: { jest: true } },
  },

  // Config & scripts override (no type-checking)
  {
    files: ['*.config.js', 'scripts/**/*.js', 'scripts/**/*.ts'],
    languageOptions: {
      parserOptions: { project: null },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];

export default config;