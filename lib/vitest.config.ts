import { defineConfig } from 'vitest/config';

/**
 * Main Vitest Configuration - Unit Tests Only
 *
 * Excludes:
 * - Characterisation tests (use `pnpm character`)
 * - Snapshot tests (use `pnpm test:snapshot`)
 *
 * Run with: `pnpm test`
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'eslint-rules/**/*.test.ts'],
    exclude: [
      'src/characterisation/**/*.test.ts',
      'src/validation/scalar-guard.test.ts',
      'tests-snapshot/**/*.test.ts',
      'node_modules/**',
    ],
  },
});
