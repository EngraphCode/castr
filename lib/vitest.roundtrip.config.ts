import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration - Round-Trip Tests
 *
 * Tests that verify lossless transformation through the IR.
 *
 * Run with: `pnpm test:roundtrip`
 */
export default defineConfig({
  test: {
    include: ['tests-roundtrip/**/*.test.ts'],
    exclude: ['node_modules/**'],
  },
});
