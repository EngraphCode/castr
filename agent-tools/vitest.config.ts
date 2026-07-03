import { defineConfig } from 'vitest/config';

/**
 * Unit + integration test config for @engraph/agent-tools.
 *
 * Inlined from Oak's root `vitest.config.base.ts` (castr has no shared root
 * base) so the package is self-contained — transplanted from Oak 06018bc3.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    // Force process isolation to prevent global state pollution between tests
    // (many tests mutate process.env, which races under parallel execution).
    isolate: true,
    pool: 'forks',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'coverage', '**/*.e2e.test.ts', 'stryker-tmp'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'dist/**'],
      reporter: ['text-summary', 'html', 'lcov', 'cobertura'],
    },
  },
});
