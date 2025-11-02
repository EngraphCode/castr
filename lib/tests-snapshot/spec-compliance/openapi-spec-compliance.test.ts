/**
 * Comprehensive OpenAPI Specification Compliance Tests
 *
 * These tests validate that we correctly handle spec-compliant OpenAPI documents
 * for both OAS 3.0.x and 3.1.x specifications.
 *
 * Strategy:
 * 1. Use official OpenAPI JSON schemas from .agent/reference/openapi_schema/
 * 2. Validate test documents against official schemas using AJV
 * 3. Verify our code handles compliant documents correctly
 * 4. Use openapi3-ts types exclusively (no duplication)
 *
 * References:
 * - OAS 3.0.3: https://spec.openapis.org/oas/v3.0.3
 * - OAS 3.1.0: https://spec.openapis.org/oas/v3.1.0
 */

import { expect, test, describe, beforeAll } from 'vitest';
import * as Ajv04Module from 'ajv-draft-04';
import * as addFormatsModule from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import type { ValidateFunction } from 'ajv';
import { generateZodClientFromOpenAPI } from '../../src/generateZodClientFromOpenAPI.js';

// Handle CJS/ESM interop for default exports
// @ts-expect-error TS2571 - Ajv04Module may have default export (CJS) or be direct export (ESM)
const Ajv04 = (Ajv04Module as unknown).default || Ajv04Module;
// @ts-expect-error TS2571 - addFormatsModule may have default export (CJS) or be direct export (ESM)
const addFormats = (addFormatsModule as unknown).default || addFormatsModule;

// Load official OpenAPI schemas
const SCHEMA_DIR = join(process.cwd(), '../.agent/reference/openapi_schema');
const oas30Schema = JSON.parse(
  readFileSync(join(SCHEMA_DIR, 'openapi_3_0_x_schema.json'), 'utf-8'),
);

// Note: OAS 3.1 uses JSON Schema 2020-12 which requires different handling
// For now, focus on 3.0.x which is more widely used

describe('openapi-spec-compliance', () => {
  let ajv: InstanceType<typeof Ajv04>;
  let validateOAS30: ValidateFunction;

  beforeAll(() => {
    // OpenAPI 3.0 uses JSON Schema draft-04
    ajv = new Ajv04({
      strict: false,
      validateFormats: true,
      allErrors: true,
    });
    addFormats(ajv);

    validateOAS30 = ajv.compile(oas30Schema);
  });

  describe('OAS 3.0.x compliance', () => {
    test('minimal valid document', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: {
          title: 'Minimal API',
          version: '1.0.0',
        },
        paths: {},
      };

      // Validate against official schema
      const valid = validateOAS30(doc);
      if (!valid) {
        console.error('Validation errors:', validateOAS30.errors);
      }
      expect(valid).toBe(true);

      // Verify our code handles it
      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('parameter with schema (not content)', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('parameter with content (not schema)', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'listUsers',
              parameters: [
                {
                  name: 'filter',
                  in: 'query',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('MediaType.schema with $ref', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/pets': {
            post: {
              operationId: 'createPet',
              requestBody: {
                content: {
                  'application/json': {
                    // CORRECT: $ref inside schema property
                    schema: { $ref: '#/components/schemas/Pet' },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Pet: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
              required: ['name'],
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('Schema composition (allOf, oneOf, anyOf)', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        allOf: [
                          { type: 'object', properties: { a: { type: 'string' } } },
                          { type: 'object', properties: { b: { type: 'number' } } },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('nullable property (OAS 3.0 style)', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          // In OAS 3.0, nullable is a property alongside type
                          maybeString: {
                            type: 'string',
                            nullable: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('enum values', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              parameters: [
                {
                  name: 'status',
                  in: 'query',
                  schema: {
                    type: 'string',
                    enum: ['active', 'inactive', 'pending'],
                  },
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('response with multiple status codes', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            post: {
              operationId: 'test',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
                '400': {
                  description: 'Bad Request',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          error: { type: 'string' },
                        },
                      },
                    },
                  },
                },
                '404': {
                  description: 'Not Found',
                },
                default: {
                  description: 'Unexpected error',
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('array schema with items', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                          },
                          required: ['id'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });

    test('schema with additionalProperties', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          known: { type: 'string' },
                        },
                        additionalProperties: {
                          type: 'number',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(true);

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc: doc }),
      ).resolves.not.toThrow();
    });
  });

  describe('OAS 3.0.x constraint violations', () => {
    test('invalid: parameter without schema or content', () => {
      const doc = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              parameters: [
                {
                  name: 'invalid',
                  in: 'query',
                  // Missing both schema and content
                },
              ],
              responses: {
                '200': { description: 'Success' },
              },
            },
          },
        },
      };

      // Should fail schema validation
      const valid = validateOAS30(doc);
      expect(valid).toBe(false);
      expect(validateOAS30.errors).toBeTruthy();
    });

    test('invalid: empty openapi version', () => {
      const doc = {
        openapi: '',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(false);
    });

    test('invalid: missing required info', () => {
      const doc = {
        openapi: '3.0.3',
        paths: {},
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(false);
    });

    test('invalid: missing required paths', () => {
      const doc = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
      };

      const valid = validateOAS30(doc);
      expect(valid).toBe(false);
    });
  });
});
