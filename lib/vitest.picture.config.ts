import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration - the picture
 *
 * Runs the checks of `tests-picture/`: the rows computed from the formats' published
 * definitions, and (as the picture grows) one case for every row.
 *
 * Run with: `pnpm test:picture`
 */
export default defineConfig({
  test: {
    include: ['tests-picture/**/*.test.ts'],
    exclude: ['node_modules/**'],
  },
});
