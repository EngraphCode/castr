// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // Base ESLint recommended rules
  eslint.configs.recommended,
  
  // TypeScript recommended rules with type checking
  ...tseslint.configs.recommendedTypeChecked,
  
  // Sonarjs recommended rules
  sonarjs.configs.recommended,
  
  {
    // Global language options for TypeScript + React
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
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
    ],
  },
  
  {
    // React files
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // React rules
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in React 18+
      'react/prop-types': 'off', // Using TypeScript
      
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
      
      // Sonarjs complexity
      'sonarjs/cognitive-complexity': ['warn', 30],
      
      // Code quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  {
    // Specific file overrides (from old config)
    files: ['src/toasts.ts', 'src/Playground/Playground.machine.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  }
);

