import { defineConfig } from 'vitest/config';

/**
 * Main Vitest Configuration - Canonical `pnpm test` Collector
 *
 * Collects the in-process (unit + integration) suites. Excludes:
 * - Characterisation tests (use `pnpm character`)
 * - Snapshot tests (use `pnpm test:snapshot`)
 * - The scalar-guard suite (use `pnpm test:scalar-guard`)
 *
 * Run with: `pnpm test` (append `--coverage` for a code-path coverage report;
 * coverage is a signal that routes attention, never a target to hit — the
 * behaviour-proof suites in testing-strategy.md remain the correctness bar)
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
    coverage: {
      provider: 'v8',
      include: ['src/**', 'eslint-rules/**'],
      exclude: [
        'src/**/*.test.ts',
        'eslint-rules/**/*.test.ts',
        'src/characterisation/**',
        'dist/**',
      ],
      reporter: ['text-summary', 'html', 'lcov', 'cobertura'],
    },
  },
});
