/**
 * Integration tests for validation error formatting in loadOpenApiDocument.
 *
 * PROVES that the error formatting is wired into the system and provides VALUE to CLI users
 * by showing helpful, readable error messages when OpenAPI specs are invalid.
 *
 * Per testing-strategy.md: Integration tests verify the behaviour of a collection of units
 * working together as code.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';
import { loadOpenApiDocument } from './index.js';

describe('loadOpenApiDocument error formatting (integration)', () => {
  it('provides readable path in error message for missing response description', async () => {
    const invalidSpec = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                // Missing required 'description'
                content: { 'application/json': { schema: { type: 'string' } } },
              },
            },
          },
        },
      },
    };

    await expect(loadOpenApiDocument(invalidSpec)).rejects.toThrow(
      /paths → \/test → get → responses → 200/,
    );
  });

  it('includes OpenAPI version in error message', async () => {
    const invalidSpec = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': { content: { 'application/json': { schema: { type: 'string' } } } },
            },
          },
        },
      },
    };

    await expect(loadOpenApiDocument(invalidSpec)).rejects.toThrow(/3\.0\.3/);
  });

  it('includes helpful hint for common errors', async () => {
    const invalidSpec = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': { content: { 'application/json': { schema: { type: 'string' } } } },
            },
          },
        },
      },
    };

    // Error message should include hint about 'description' being required
    await expect(loadOpenApiDocument(invalidSpec)).rejects.toThrow(/description/);
  });

  it('formats error with location, issue, and hint', async () => {
    const invalidSpec = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': { content: { 'application/json': { schema: { type: 'string' } } } },
            },
          },
        },
      },
    };

    try {
      await loadOpenApiDocument(invalidSpec);
      expect.fail('Expected to throw');
    } catch (error) {
      const message = (error as Error).message;
      // Verify structured error message format
      expect(message).toContain('Location:');
      expect(message).toContain('Issue:');
      expect(message).toContain('Hint:');
    }
  });
});
