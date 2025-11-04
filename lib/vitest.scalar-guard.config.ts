import { defineConfig } from 'vitest/config';

/**
 * Dedicated Vitest configuration for the Scalar legacy import guard.
 *
 * Run with: pnpm test:scalar-guard
 */
export default defineConfig({
  test: {
    include: ['src/validation/scalar-guard.test.ts'],
    exclude: [],
  },
});
