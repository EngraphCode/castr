import { defineConfig } from 'vitest/config';

/**
 * Main Vitest Configuration - Canonical `pnpm test` Collector
 *
 * Excludes:
 * - Characterisation tests (use `pnpm character`)
 * - Snapshot tests (use `pnpm test:snapshot`)
 *
 * Current Pack 7 scope note:
 * - despite the historical "unit" nickname, this collector still matches
 *   `src/tests-e2e/openapi-fidelity.test.ts` via the broad `src` test glob
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
