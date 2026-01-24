import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test, describe } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

/**
 * Tests for schema type validation behavior
 *
 * With strict OpenAPI validation enabled, invalid type values
 * (like 'Integer' instead of 'integer') are now rejected at
 * the validation stage rather than being gracefully degraded.
 *
 * Per RULES.md: "Fail fast, fail hard, be strict at all times"
 */
describe('schema-type-wrong-case', () => {
  test('invalid type case is rejected by strict validation', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.3',
      info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
      paths: {
        '/pet': {
          put: {
            operationId: 'updatePet',
            responses: {
              '200': {
                description: 'Successful operation',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/test1' } } },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          // @ts-expect-error TS2322 - Invalid schema type ('Integer' instead of 'integer')
          test1: { type: 'object', properties: { text1: { type: 'Integer' as unknown } } },
        },
      },
    };

    // BEHAVIOR: With strict validation, invalid type cases are rejected
    await expect(
      generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
    ).rejects.toThrow(/Invalid OpenAPI|type|Integer/i);
  });

  test('valid lowercase type is accepted', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.3',
      info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
      paths: {
        '/pet': {
          put: {
            operationId: 'updatePet',
            responses: {
              '200': {
                description: 'Successful operation',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/test1' } } },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          test1: { type: 'object', properties: { text1: { type: 'integer' } } }, // Correct case
        },
      },
    };

    // Should succeed with valid lowercase type
    await expect(
      generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
    ).resolves.not.toThrow();
  });
});
