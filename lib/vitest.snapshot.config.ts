import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration for Snapshot Tests
 *
 * Snapshot tests validate generated output against saved snapshots.
 * These tests are integration-style and verify the complete output structure.
 *
 * Run with: `pnpm test:snapshot`
 */
export default defineConfig({
  test: {
    include: ['tests-snapshot/**/*.test.ts'],
    snapshotFormat: { indent: 4, escapeString: false },
    // Snapshot tests may be slower as they generate full output
    testTimeout: 30000,
  },
});
