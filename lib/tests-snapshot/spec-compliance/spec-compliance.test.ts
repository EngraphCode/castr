/**
 * Tests for OpenAPI specification compliance
 *
 * These tests verify strict adherence to the OpenAPI specification,
 * ensuring we fail fast on malformed specs rather than attempting
 * to tolerate violations.
 *
 * References:
 * - OpenAPI 3.0.x: https://spec.openapis.org/oas/v3.0.3
 * - OpenAPI 3.1.x: https://spec.openapis.org/oas/v3.1.0
 */

import { expect, test, describe } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../../src/rendering/index.js';

describe('spec-compliance', () => {
  describe('MediaType schema property', () => {
    test('$ref at wrong level (mediaTypeObject instead of schema property) should throw', async () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/pet': {
            put: {
              operationId: 'updatePet',
              parameters: [
                {
                  name: 'malformed-param',
                  in: 'query',
                  content: {
                    // Per OAS 3.0 spec: MediaType.schema must be Schema | Reference
                    // This is a $ref at the MediaType level, not inside schema
                    // @ts-expect-error TS2322 - Testing invalid spec ($ref at MediaType level) to verify error handling
                    '*/*': { $ref: '#/components/schemas/Pet' } as unknown,
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
        components: {
          schemas: {
            Pet: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };
      // BEHAVIOR: Should reject with an error mentioning the parameter location
      // Enhanced error messages use path format: "paths → /pet → put → parameters → 0"
      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
      ).rejects.toThrow(/parameters.*0|parameter|schema|\$ref/i);
    });

    test('valid $ref inside schema property should succeed', async () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/pet': {
            put: {
              operationId: 'updatePet',
              parameters: [
                {
                  name: 'valid-param',
                  in: 'query',
                  content: {
                    // CORRECT: $ref is inside the schema property
                    '*/*': {
                      schema: { $ref: '#/components/schemas/Pet' },
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
        components: {
          schemas: {
            Pet: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
      ).resolves.not.toThrow();
    });
  });

  describe('Schema nullability', () => {
    // NOTE: "null schema should be rejected" was removed because it was a placeholder
    // test that didn't actually test anything. Per testing-strategy.md:
    // "Each test must say something real and true about the code."
    // The null check in getZodSchema is exercised by other tests that provide
    // actual fixtures.

    test('empty schema object is valid (represents any value)', async () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/pet': {
            get: {
              operationId: 'getPet',
              parameters: [
                {
                  name: 'any-param',
                  in: 'query',
                  schema: {}, // Empty schema = any value = z.unknown()
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {}, // Empty schema is valid
                    },
                  },
                },
              },
            },
          },
        },
      };

      await expect(
        generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
      ).resolves.not.toThrow();
    });
  });
});
