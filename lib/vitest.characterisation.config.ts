import { defineConfig } from 'vitest/config';

const EXPECTED_UNREACHABLE_URL_WARNING =
  '[WARN] Failed to parse JSON/YAML from URL: https://api.example.com/openapi.json';

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
    // These tests intentionally exercise unreachable-URL rejection paths.
    // Scalar emits this exact warning before rejecting, so we suppress only
    // that known diagnostic to keep the gate output clean without muting
    // unrelated stderr from the characterisation suite.
    onConsoleLog(log, type) {
      return !(type === 'stderr' && log.includes(EXPECTED_UNREACHABLE_URL_WARNING));
    },
  },
});
