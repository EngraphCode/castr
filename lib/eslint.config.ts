import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configs as tsEslintConfigs } from 'typescript-eslint';
import { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs';
import eslint from '@eslint/js';

const baseDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript recommended rules with type checking
  tsEslintConfigs.recommendedTypeChecked,

  // Sonarjs recommended rules for code complexity and quality
  sonarjsConfigs.recommended,

  {
    // Global language options for TypeScript
    languageOptions: {
      parserOptions: {
        project: './tsconfig.lint.json',
        tsconfigRootDir: baseDirectory,
      },
    },
  },

  {
    // Global ignores
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.typegen.ts',
      '**/coverage/**',
      '**/*.d.ts',
      'bin.cjs',
    ],
  },

  {
    // Main rules for all TypeScript files
    files: ['**/*.ts'],
    rules: {
      // Consistency rules
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never',
        },
      ],
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            'Record<string, unknown>': {
              message:
                'Avoid Record<string, unknown>. It destroys type information. Refactor, or use an existing internal or library type where possible.',
            },
            'Record<string, undefined>': {
              message:
                'Avoid Record<string, undefined>. It destroys type information. Refactor, or use an existing internal or library type where possible.',
            },
            'Readonly<Record<string, undefined>>': {
              message:
                'Avoid Readonly<Record<string, undefined>>. It destroys type information. Refactor, or use an existing internal or library type where possible.',
            },
            'Record<PropertyKey, undefined>': {
              message:
                'Avoid Record<PropertyKey, undefined>. It destroys type information. Refactor, or use an existing internal or library type where possible.',
            },
          },
        },
      ],

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/consistent-type-imports': ['error'],

      // Complexity
      complexity: ['error', 29], // Target 8
      'sonarjs/cognitive-complexity': ['error', 29], // Target 8
      'max-depth': ['error', 5], // Target 3
      'max-statements': ['error', 30], // Target 20
      'max-lines-per-function': ['error', 100], // Target 50
      'max-lines': ['error', 350], // Target 250

      // Code quality
      'no-console': 'off',
      'no-debugger': 'error',
      'no-empty': ['error'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  {
    // Test files - more relaxed rules
    files: ['**/*.test.ts', 'tests/**/*.ts'],
    rules: {
      'max-lines-per-function': ['off'],
      'max-lines': ['off'],
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'no-console': 'off',
    },
  },
);
