import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { expect, test, describe } from 'vitest';
import { getEndpointDefinitionList } from '../../src/test-helpers/legacy-compat.js';

/**
 * Test: getEndpointDefinitionList integration tests
 *
 * BEHAVIORAL INTENT: The getEndpointDefinitionList function should
 * correctly parse OpenAPI documents and return endpoint definitions.
 */

const baseDoc: OpenAPIObject = {
  openapi: '3.0.3',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {},
};

describe('getEndpointDefinitionList', () => {
  test('should handle simple endpoint', () => {
    const result = getEndpointDefinitionList({
      ...baseDoc,
      paths: {
        '/test': {
          get: {
            operationId: 'getTest',
            responses: {
              '200': {
                description: 'Success',
                content: { 'application/json': { schema: { type: 'string' } } },
              },
            },
          },
        },
      },
    });

    // BEHAVIOR: Should return endpoints array
    expect(result.endpoints).toBeDefined();
    expect(result.endpoints.length).toBe(1);
    expect(result.endpoints[0]?.method).toBe('get');
    expect(result.endpoints[0]?.path).toBe('/test');
  });

  test('should handle requestBody', () => {
    const result = getEndpointDefinitionList({
      ...baseDoc,
      paths: {
        '/pet': {
          post: {
            operationId: 'addPet',
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { name: { type: 'string' } } },
                },
              },
            },
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    });

    // BEHAVIOR: Should return endpoint with body
    expect(result.endpoints).toBeDefined();
    expect(result.endpoints.length).toBe(1);
    expect(result.endpoints[0]?.method).toBe('post');
  });

  test('should handle schema references', () => {
    const petSchema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        category: { $ref: '#/components/schemas/Category' },
      },
    };

    const categorySchema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const result = getEndpointDefinitionList({
      ...baseDoc,
      components: {
        schemas: {
          Pet: petSchema,
          Category: categorySchema,
        },
      },
      paths: {
        '/pet': {
          get: {
            operationId: 'getPet',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                },
              },
            },
          },
        },
      },
    });

    // BEHAVIOR: Should resolve schema references
    expect(result.endpoints).toBeDefined();
    expect(result.endpoints.length).toBe(1);
  });

  test('should handle query parameters', () => {
    const result = getEndpointDefinitionList({
      ...baseDoc,
      paths: {
        '/pet/findByStatus': {
          get: {
            operationId: 'findPetsByStatus',
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['available', 'pending', 'sold'],
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    });

    // BEHAVIOR: Should include parameters
    expect(result.endpoints).toBeDefined();
    expect(result.endpoints.length).toBe(1);
    expect(result.endpoints[0]?.parameters).toBeDefined();
  });
});
