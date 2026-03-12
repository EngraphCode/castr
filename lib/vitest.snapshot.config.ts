import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const SNAPSHOT_TEST_UTILS = fileURLToPath(
  new URL('./tests-snapshot/test-utils.ts', import.meta.url),
);

/**
 * Vitest Configuration for Snapshot Tests
 *
 * Snapshot tests validate generated output against saved snapshots.
 * These tests are integration-style and verify the complete output structure.
 *
 * Run with: `pnpm test:snapshot`
 */
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^(?:\.\.\/){2,3}src\/index\.js$/,
        replacement: SNAPSHOT_TEST_UTILS,
      },
      {
        find: /^(?:\.\.\/){2,3}src\/schema-processing\/context\/index\.js$/,
        replacement: SNAPSHOT_TEST_UTILS,
      },
      {
        find: /^(?:\.\.\/){2,3}src\/schema-processing\/context\/template-context\.js$/,
        replacement: SNAPSHOT_TEST_UTILS,
      },
      {
        find: /^(?:\.\.\/){2,3}src\/schema-processing\/conversion\/zod\/index\.js$/,
        replacement: SNAPSHOT_TEST_UTILS,
      },
      {
        find: /^(?:\.\.\/){2,3}src\/schema-processing\/conversion\/typescript\/index\.js$/,
        replacement: SNAPSHOT_TEST_UTILS,
      },
    ],
  },
  test: {
    include: ['tests-snapshot/**/*.test.ts'],
    snapshotFormat: { indent: 4, escapeString: false },
    // Snapshot tests may be slower as they generate full output
    testTimeout: 30000,
  },
});
