/**
 * Scalar Validator Behavior Verification Tests
 *
 * PROVES what the @scalar/openapi-parser validate() function actually
 * catches versus what it misses. These are integration tests against
 * the running system, not assumptions.
 *
 * Per official OpenAPI specs:
 * - 3.0.x: Has `nullable: boolean`, `exclusiveMinimum: boolean`
 * - 3.1.x: Uses JSON Schema 2020-12 — no `nullable`, `exclusiveMinimum` is numeric
 *
 * @module
 */

import { describe, it, expect } from 'vitest';
import { validate } from '@scalar/openapi-parser';
import type { AnyObject } from '@scalar/openapi-parser';

/**
 * Helper to validate an inline OpenAPI document
 */
async function validateInlineDoc(doc: AnyObject): Promise<{
  valid: boolean;
  errors: { message: string; path?: string }[];
}> {
  // Validate directly - Scalar's validate() accepts the document directly
  const result = await validate(doc);
  return {
    valid: result.valid,
    errors:
      result.errors?.map((e) => {
        const path = (e as unknown as { path?: string }).path;
        return path !== undefined ? { message: e.message, path } : { message: e.message };
      }) ?? [],
  };
}

describe('Scalar Validator Behavior Verification', () => {
  // =========================================================================
  // ASSUMPTION 1: nullable: true in 3.1.x
  // Official spec: 3.1.x does NOT have nullable keyword (uses type array)
  // =========================================================================
  describe('nullable: true in 3.1.x', () => {
    it('should reject nullable: true in 3.1.x spec (per official schema)', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        nullable: true, // 3.0.x syntax - should NOT be valid in 3.1.x
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);

      // ACTUAL BEHAVIOR - document what Scalar actually does
      console.log('nullable in 3.1.x:', result.valid ? 'PASSES (limitation)' : 'REJECTS (correct)');
      console.log('Errors:', result.errors);

      // This assertion documents ACTUAL behavior, not desired behavior
      // If this test fails, Scalar has been updated to correctly reject
      expect(result.valid).toBe(true); // LIMITATION: Scalar allows this
    });

    it('should accept type array with null in 3.1.x (correct 3.1.x syntax)', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        type: ['string', 'null'], // Correct 3.1.x syntax
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      expect(result.valid).toBe(true);
    });
  });

  // =========================================================================
  // ASSUMPTION 2: boolean exclusiveMinimum in 3.1.x
  // Official spec: 3.1.x uses JSON Schema 2020-12 where exclusiveMinimum is numeric
  // =========================================================================
  describe('boolean exclusiveMinimum in 3.1.x', () => {
    it('should reject boolean exclusiveMinimum in 3.1.x spec (per JSON Schema 2020-12)', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'number',
                        minimum: 0,
                        exclusiveMinimum: true, // 3.0.x syntax - should be numeric in 3.1.x
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);

      console.log(
        'boolean exclusiveMinimum in 3.1.x:',
        result.valid ? 'PASSES (limitation)' : 'REJECTS (correct)',
      );
      console.log('Errors:', result.errors);

      // ACTUAL BEHAVIOR - document what Scalar actually does
      expect(result.valid).toBe(true); // LIMITATION: Scalar allows this
    });

    it('should accept numeric exclusiveMinimum in 3.1.x (correct syntax)', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'number',
                        exclusiveMinimum: 0, // Correct 3.1.x syntax - numeric value
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      expect(result.valid).toBe(true);
    });
  });

  // =========================================================================
  // ASSUMPTION 3: Component types validation (examples, links, callbacks)
  // =========================================================================
  describe('Component types validation', () => {
    it('should validate examples component', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          examples: {
            TestExample: {
              summary: 'An example',
              value: { foo: 'bar' },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      console.log('examples component:', result.valid ? 'PASSES' : 'REJECTS');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid examples component (missing required fields)', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          examples: {
            TestExample: {
              // Missing value or externalValue - only summary
              summary: 'An incomplete example',
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      console.log(
        'invalid examples component:',
        result.valid ? 'PASSES (limitation?)' : 'REJECTS (correct)',
      );
      // Example objects don't require value - summary alone is valid
      expect(result.valid).toBe(true);
    });

    it('should validate links component', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          links: {
            TestLink: {
              operationId: 'someOperation',
              description: 'A link to another operation',
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      console.log('links component:', result.valid ? 'PASSES' : 'REJECTS');
      expect(result.valid).toBe(true);
    });

    it('should validate callbacks component', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          callbacks: {
            onEvent: {
              '{$request.body#/callbackUrl}': {
                post: {
                  operationId: 'onEventCallback',
                  requestBody: {
                    required: true,
                    content: {
                      'application/json': {
                        schema: { type: 'object' },
                      },
                    },
                  },
                  responses: {
                    '200': { description: 'OK' },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      console.log('callbacks component:', result.valid ? 'PASSES' : 'REJECTS');
      expect(result.valid).toBe(true);
    });

    it('should validate pathItems component (3.1.x only)', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          pathItems: {
            ReusablePath: {
              get: {
                operationId: 'reusableGet',
                responses: {
                  '200': { description: 'OK' },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      console.log('pathItems component (3.1.x):', result.valid ? 'PASSES' : 'REJECTS');
      expect(result.valid).toBe(true);
    });
  });

  // =========================================================================
  // ASSUMPTION 4: x-* extension validation (should always pass)
  // =========================================================================
  describe('Extension (x-*) validation', () => {
    it('should accept x-* extensions at root level', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        'x-custom-extension': { anything: 'goes here' },
      };

      const result = await validateInlineDoc(doc);
      expect(result.valid).toBe(true);
    });

    it('should accept x-* extensions in operation', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              'x-custom': true,
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      expect(result.valid).toBe(true);
    });
  });

  // =========================================================================
  // ASSUMPTION 5: Deep reference validation
  // =========================================================================
  describe('Reference validation', () => {
    it('should reject unresolvable $ref', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/DoesNotExist' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      console.log('unresolvable $ref:', result.valid ? 'PASSES (limitation)' : 'REJECTS (correct)');
      // Scalar correctly rejects unresolvable $ref references
      expect(result.valid).toBe(false);
    });

    it('should handle circular references', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                children: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Node' }, // Circular
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      console.log('circular $ref:', result.valid ? 'PASSES' : 'REJECTS');
      expect(result.valid).toBe(true); // Circular refs are valid
    });
  });

  // =========================================================================
  // KNOWN CORRECT REJECTIONS (Sanity checks)
  // =========================================================================
  describe('Sanity checks - known correct rejections', () => {
    it('should reject missing description in response', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  // Missing description - required field
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('description'))).toBe(true);
    });

    it('should reject webhooks in 3.0.x', async () => {
      const doc = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        webhooks: {
          // 3.1.x only field
          onEvent: {
            post: {
              operationId: 'onEvent',
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };

      const result = await validateInlineDoc(doc);
      expect(result.valid).toBe(false);
    });

    it('should reject jsonSchemaDialect in 3.0.x', async () => {
      const doc = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema', // 3.1.x only
        paths: {},
      };

      const result = await validateInlineDoc(doc);
      expect(result.valid).toBe(false);
    });
  });
});
