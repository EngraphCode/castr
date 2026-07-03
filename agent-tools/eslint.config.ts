import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tsdocPlugin from 'eslint-plugin-tsdoc';

/**
 * ESLint flat config for `@engraph/agent-tools`.
 *
 * castr has no shared root ESLint config and no `@oaknational/eslint-plugin-standards`
 * (Oak's package-local config was built entirely on it). This is a self-contained,
 * pragmatic baseline from castr's installed devDeps: JS + TS-ESLint recommended with
 * Prettier turning off stylistic rules. Type-aware rules are intentionally omitted to
 * avoid project-coverage friction across the package's `.ts`/`.tsx` surface.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', '.turbo/**', '*.log', '**/*.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Result-pattern causal-chain discipline (use-result-pattern rule): a re-thrown
      // or re-expressed error must carry { cause } so the causal chain survives.
      'preserve-caught-error': ['error', { requireCatchParameter: true }],
    },
  },
  {
    // TSDoc syntax discipline: any /** */ doc comment must parse as valid TSDoc
    files: ['**/*.{ts,tsx}'],
    plugins: { tsdoc: tsdocPlugin },
    rules: { 'tsdoc/syntax': 'error' },
  },
  {
    // CLI entry points legitimately write to stdout/stderr.
    files: ['src/bin/**/*.{ts,tsx}'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  prettier,
);
