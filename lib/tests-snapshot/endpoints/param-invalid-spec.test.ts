/**
 * Tests for strict OpenAPI spec validation
 *
 * BEHAVIORAL INTENT: The generator should fail fast with helpful error messages
 * when encountering invalid OpenAPI specifications.
 */

import { expect, test, describe } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../../src/rendering/index.js';

describe('param-invalid-spec', () => {
  test('parameter without schema or content should throw helpful error', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/pet': {
          put: {
            operationId: 'updatePet',
            parameters: [
              // @ts-expect-error TS2322 - Testing invalid parameter (missing schema/content)
              {
                name: 'invalid-param',
                description: 'This parameter is invalid per OpenAPI spec',
                in: 'query',
                // Missing both 'schema' and 'content' - violates SchemaXORContent constraint
              } as unknown,
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    // BEHAVIOR: Should reject with an error mentioning the problematic parameter
    await expect(
      generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
    ).rejects.toThrow(/invalid-param/);
  });

  test('parameter with unresolvable $ref should throw error', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/pet': {
          put: {
            operationId: 'updatePet',
            parameters: [
              {
                name: 'broken-ref-param',
                in: 'query',
                schema: {
                  $ref: '#/components/schemas/NonExistentSchema',
                },
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    // BEHAVIOR: Should reject when encountering unresolvable $ref
    await expect(
      generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
    ).rejects.toThrow();
  });
});
