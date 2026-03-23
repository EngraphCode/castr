import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest Configuration for Generated Code Validation Tests
 *
 * These tests validate representative single-file generated TypeScript/Zod
 * output for syntax, type-check, lint, and runtime-sanity checks.
 *
 * Current Pack 7 scope note:
 * - runtime validation is a smoke check, not module execution
 * - grouped output and every writer branch are not covered here
 *
 * Run with: `pnpm test:gen`
 */
export default defineConfig({
  test: {
    name: 'generated-code-validation',
    include: ['tests-generated/**/*.gen.test.ts'],
    globals: false,
    environment: 'node',
    testTimeout: 30000, // Longer timeout for code generation + validation
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
