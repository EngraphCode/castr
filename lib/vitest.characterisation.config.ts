import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for characterisation tests
 *
 * These tests capture PUBLIC API behavior to protect against regressions
 * during architectural refactoring. Run with: pnpm character
 */
export default defineConfig({
  test: {
    include: ['src/characterisation/**/*.test.ts'],
    snapshotFormat: { indent: 4, escapeString: false },
    // Characterisation tests may be slower as they exercise the full API
    testTimeout: 30000,
  },
});
