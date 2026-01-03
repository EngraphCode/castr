/**
 * Characterisation Tests: Schema Validation Regressions
 *
 * These tests capture expected behavior for schema validation generation.
 * They were written as failing tests (TDD RED) to document regressions.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import { isSingleFileResult, type GenerationResult } from '../rendering/generation-result.js';

function assertSingleFileContent(result: GenerationResult): string {
  if (!isSingleFileResult(result)) {
    throw new Error('Expected single file result');
  }
  return result.content;
}

describe('Characterisation: Schema Validation Regressions', () => {
  /**
   * REGRESSION: Regex Pattern Formatting
   *
   * OpenAPI pattern: "^[a-z]+$"
   * Expected Zod: z.string().regex(/^[a-z]+$/)
   * Actual (bug): z.string().regex(new RegExp("/^[a-z]+$/"))
   *
   * The bug double-escapes the pattern by including literal slashes.
   */
  describe('Regex Pattern Generation', () => {
    it('should generate valid regex literals without new RegExp wrapper', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'testPattern',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/PatternTest' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            PatternTest: {
              type: 'string',
              pattern: '^[a-z]+$',
            },
          },
        },
      };

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      const content = assertSingleFileContent(result);

      // Should use regex literal, not new RegExp()
      expect(content).toMatch(/\.regex\(\/\^/);
      expect(content).not.toContain('new RegExp');
    });

    it('should handle patterns with slashes correctly', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'testSlashPattern',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/SlashPattern' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            SlashPattern: {
              type: 'string',
              pattern: 'abc/def/ghi',
            },
          },
        },
      };

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      const content = assertSingleFileContent(result);

      // Should escape internal slashes but still be regex literal
      expect(content).toMatch(/\.regex\(/);
      // Should NOT have doubled slashes from wrapping
      expect(content).not.toContain('"/abc/def/ghi/"');
    });
  });

  /**
   * REGRESSION: Property Optionality
   *
   * Per OpenAPI spec: properties NOT in `required` array should be optional
   * Per strictness principle: properties in `required` array should NOT be optional
   *
   * OLD behavior (correct): Required properties don't have .optional()
   * NEW behavior (bug): ALL properties marked .optional()
   */
  describe('Property Optionality', () => {
    it('should NOT mark required properties as optional', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUser',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
            },
          },
        },
      };

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      const content = assertSingleFileContent(result);

      // 'name' is in required array - should NOT have .optional()
      // Look for 'name: z.string()' NOT followed by '.optional()'
      expect(content).toMatch(/name:\s*z\.string\(\)(?!\.optional)/);

      // 'age' is NOT in required array - SHOULD have .optional()
      expect(content).toMatch(/age:\s*z\.number\(\)\.optional\(\)/);
    });

    it('should not make all properties optional when all are required', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items': {
            get: {
              operationId: 'getItem',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Item' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Item: {
              type: 'object',
              required: ['foo', 'bar'],
              properties: {
                foo: { type: 'string' },
                bar: { type: 'number' },
              },
            },
          },
        },
      };

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      const content = assertSingleFileContent(result);

      // Both properties are required - neither should have .optional()
      // Check that foo and bar don't have .optional() in their definitions
      expect(content).toMatch(/foo:\s*z\.string\(\)(?![.\w]*\.optional)/);
      expect(content).toMatch(/bar:\s*z\.number\(\)(?![.\w]*\.optional)/);
    });
  });
});
