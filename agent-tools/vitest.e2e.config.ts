import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * E2E test configuration for `@engraph/agent-tools`.
 *
 * Inlined from Oak's root `vitest.e2e.config.base.ts` (castr has no shared
 * root base) so the package is self-contained — transplanted from Oak
 * 06018bc3. E2E tests verify running behaviour and must be network-free
 * (the local `test.setup.no-network.ts` guards fetch). TUI E2E tests are
 * in-process and dependency-injected per the testing doctrine.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [resolve(dirname(fileURLToPath(import.meta.url)), 'test.setup.no-network.ts')],
    // Composition-root isolation for the git-driven E2E fixtures: child git
    // processes inherit this environment, so a host's global or system git
    // config (hooksPath, templates, merge drivers) cannot change their results.
    env: { GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' },
    passWithNoTests: false,
    include: ['e2e-tests/**/*.e2e.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
    testTimeout: 60000,
    hookTimeout: 30000,
    retry: 0,
  },
});
