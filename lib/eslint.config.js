// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const sonarjs = require('eslint-plugin-sonarjs');
const unicorn = require('eslint-plugin-unicorn');

module.exports = tseslint.config(
  // Base ESLint recommended rules
  eslint.configs.recommended,
  
  // TypeScript recommended rules with type checking
  ...tseslint.configs.recommendedTypeChecked,
  
  // Sonarjs recommended rules for code complexity and quality
  sonarjs.configs.recommended,
  
  {
    // Global language options for TypeScript
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
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
    ],
  },
  
  {
    // Main rules for all TypeScript files
    files: ['**/*.ts'],
    plugins: {
      unicorn,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      
      // Unicorn rules (matching old config intent)
      'unicorn/prefer-module': 'off', // CommonJS is used in this project
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-top-level-await': 'off',
      
      // Sonarjs complexity - adjusted from default
      'sonarjs/cognitive-complexity': ['warn', 30],
      
      // Code quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Allow eslint-disable comments
      'no-warning-comments': 'off',
    },
  },
  
  {
    // Test files - more relaxed rules
    files: ['**/*.test.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'no-console': 'off',
    },
  },
  
  {
    // src/index.ts - export file, allow unused variables
    files: ['src/index.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  }
);

