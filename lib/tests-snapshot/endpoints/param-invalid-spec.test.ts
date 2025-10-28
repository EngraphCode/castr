/**
 * Tests for strict OpenAPI spec validation
 *
 * These tests verify that we fail fast with helpful error messages
 * when encountering invalid OpenAPI specifications, rather than
 * attempting to tolerate malformed specs.
 */

import { expect, test, describe } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../../src/generateZodClientFromOpenAPI.js';

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
              {
                name: 'invalid-param',
                description: 'This parameter is invalid per OpenAPI spec',
                in: 'query',
                // Missing both 'schema' and 'content' - violates SchemaXORContent constraint
              } as any,
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

    await expect(
      generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
    ).rejects.toThrow(
      /Invalid OpenAPI specification: Parameter "invalid-param" \(in: query\) must have either 'schema' or 'content' property/,
    );
  });

  test('parameter with unresolvable $ref should throw helpful error', async () => {
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
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
    };

    await expect(
      generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc }),
    ).rejects.toThrow(/Component 'NonExistentSchema' of type 'schemas' not found/);
  });
});
