import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest Configuration for Generated Code Validation Tests
 *
 * These tests validate that generated TypeScript/Zod code is syntactically valid,
 * type-safe, lint-compliant, and runtime-executable. They exercise all code
 * generation paths using representative OpenAPI fixtures.
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
