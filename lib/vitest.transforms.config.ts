import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration - Transform Tests with Sample Input
 *
 * Runs transform-focused tests that use representative sample inputs.
 * Some files contain explicit round-trip assertions used to prove
 * losslessness and idempotence.
 *
 * Run with: `pnpm test:transforms`
 */
export default defineConfig({
  test: {
    include: ['tests-transforms/**/*.test.ts'],
    exclude: ['node_modules/**'],
  },
});
