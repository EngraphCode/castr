import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { getEndpointDefinitionList } from '../../src/endpoints/definition-list.js';

/**
 * Snapshot Tests: Parameter Metadata Extraction
 *
 * These tests create focused fixtures with rich parameter metadata
 * and verify that the extracted endpoint definitions contain the expected metadata.
 */

describe('Parameter Metadata Extraction - Snapshot Tests', () => {
  it('should extract complete parameter metadata with all fields', () => {
    // Arrange: Comprehensive fixture with all metadata types
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/products': {
          get: {
            operationId: 'searchProducts',
            parameters: [
              {
                name: 'price_min',
                in: 'query',
                description: 'Minimum price filter',
                example: 10.0,
                schema: {
                  type: 'number',
                  minimum: 0,
                  default: 0,
                  format: 'float',
                },
              },
              {
                name: 'category',
                in: 'query',
                description: 'Product category',
                deprecated: true,
                schema: {
                  type: 'string',
                  enum: ['electronics', 'clothing', 'books'],
                  default: 'electronics',
                },
              },
              {
                name: 'tags',
                in: 'query',
                description: 'Filter by tags',
                schema: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                  maxItems: 10,
                  uniqueItems: true,
                },
              },
              {
                name: 'name',
                in: 'query',
                description: 'Product name search',
                examples: {
                  laptop: {
                    value: 'laptop',
                    summary: 'Search for laptops',
                  },
                  phone: {
                    value: 'phone',
                    summary: 'Search for phones',
                    description: 'Mobile phones and accessories',
                  },
                },
                schema: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                  pattern: '^[a-zA-Z0-9 ]+$',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Act: Extract endpoints
    const result = getEndpointDefinitionList(spec);
    const endpoint = result.endpoints[0];

    // Assert: Snapshot the complete endpoint definition
    expect(endpoint).toBeDefined();
    expect(endpoint?.parameters).toHaveLength(4);

    // Snapshot each parameter with its metadata
    const priceParam = endpoint?.parameters.find((p) => p.name === 'price_min');
    expect(priceParam).toMatchSnapshot('price_min parameter with numeric constraints');

    const categoryParam = endpoint?.parameters.find((p) => p.name === 'category');
    expect(categoryParam).toMatchSnapshot('deprecated category parameter with enum');

    const tagsParam = endpoint?.parameters.find((p) => p.name === 'tags');
    expect(tagsParam).toMatchSnapshot('tags parameter with array constraints');

    const nameParam = endpoint?.parameters.find((p) => p.name === 'name');
    expect(nameParam).toMatchSnapshot('name parameter with examples and string constraints');
  });

  it('should handle parameters with minimal metadata', () => {
    // Arrange: Minimal parameter fixture
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/simple': {
          get: {
            operationId: 'simple',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
              {
                name: 'filter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Act: Extract endpoints
    const result = getEndpointDefinitionList(spec);
    const endpoint = result.endpoints[0];

    // Assert: Parameters have no optional metadata
    expect(endpoint?.parameters).toHaveLength(2);

    const idParam = endpoint?.parameters.find((p) => p.name === 'id');
    expect(idParam?.description).toBeUndefined();
    expect(idParam?.deprecated).toBeUndefined();
    expect(idParam?.example).toBeUndefined();
    expect(idParam?.constraints).toBeUndefined();

    expect(endpoint).toMatchSnapshot('endpoint with minimal parameter metadata');
  });

  it('should extract metadata for path parameters', () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/items/{id}': {
          get: {
            operationId: 'getItem',
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: 'Item identifier',
                required: true,
                example: 'item-123',
                schema: { type: 'string', pattern: '^item-[0-9]+$' },
              },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    };

    const result = getEndpointDefinitionList(spec);
    const pathParam = result.endpoints[0]?.parameters.find((p) => p.type === 'Path');

    expect(pathParam?.description).toBe('Item identifier');
    expect(pathParam?.example).toBe('item-123');
    expect(pathParam?.constraints?.pattern).toBe('^item-[0-9]+$');
  });

  it('should extract metadata for query parameters', () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'getItems',
            parameters: [
              {
                name: 'include',
                in: 'query',
                description: 'Fields to include',
                example: 'name,price',
                schema: { type: 'string', pattern: '^[a-z,]+$' },
              },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    };

    const result = getEndpointDefinitionList(spec);
    const queryParam = result.endpoints[0]?.parameters.find((p) => p.type === 'Query');

    expect(queryParam?.description).toBe('Fields to include');
    expect(queryParam?.example).toBe('name,price');
    expect(queryParam?.constraints?.pattern).toBe('^[a-z,]+$');
  });

  it('should extract metadata for header parameters', () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'getItems',
            parameters: [
              {
                name: 'X-Request-ID',
                in: 'header',
                description: 'Request identifier',
                schema: { type: 'string', format: 'uuid' },
              },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    };

    const result = getEndpointDefinitionList(spec);
    const headerParam = result.endpoints[0]?.parameters.find((p) => p.type === 'Header');

    expect(headerParam?.description).toBe('Request identifier');
    expect(headerParam?.constraints?.format).toBe('uuid');
  });

  it('should prefer parameter example over schema example', () => {
    // Arrange: Example priority test
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            operationId: 'test',
            parameters: [
              {
                name: 'param_with_both',
                in: 'query',
                example: 'parameter-example',
                schema: {
                  type: 'string',
                  example: 'schema-example',
                },
              },
              {
                name: 'param_with_schema_example_only',
                in: 'query',
                schema: {
                  type: 'string',
                  example: 'schema-only-example',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Act: Extract endpoints
    const result = getEndpointDefinitionList(spec);
    const endpoint = result.endpoints[0];

    // Assert: Example priority is correct
    const paramWithBoth = endpoint?.parameters.find((p) => p.name === 'param_with_both');
    expect(paramWithBoth?.example).toBe('parameter-example'); // Not 'schema-example'

    const paramSchemaOnly = endpoint?.parameters.find(
      (p) => p.name === 'param_with_schema_example_only',
    );
    expect(paramSchemaOnly?.example).toBe('schema-only-example');

    expect(endpoint).toMatchSnapshot('endpoint showing example priority');
  });
});
