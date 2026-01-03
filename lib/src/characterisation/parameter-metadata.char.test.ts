import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import { getEndpointDefinitionList } from '../test-helpers/legacy-compat.js';

/**
 * Characterisation Tests: Parameter Metadata Extraction (Session 6)
 *
 * These tests verify that parameter metadata (descriptions, examples, constraints, defaults)
 * is correctly extracted from OpenAPI specifications and included in endpoint definitions.
 *
 * **Focus:**
 * - Real OpenAPI specs from examples directory
 * - Official OpenAPI metadata fields
 * - Constraint extraction from schemas
 * - Library types (no custom types)
 */
describe('Characterisation: Parameter Metadata Extraction from Real Specs', () => {
  it('should extract parameter metadata from petstore-expanded spec', async () => {
    // Arrange: Use real OpenAPI spec from examples
    const doc = await prepareOpenApiDocument('./examples/openapi/v3.0/petstore-expanded.yaml');

    // Act: Extract endpoint definitions with metadata
    const endpoints = getEndpointDefinitionList(doc);

    // Assert: Verify metadata is extracted
    expect(endpoints.endpoints).toBeDefined();
    expect(endpoints.endpoints.length).toBeGreaterThan(0);

    // Find the GET /pets endpoint which has parameters with descriptions
    const getPetsEndpoint = endpoints.endpoints.find(
      (e) => e.method === 'get' && e.path.includes('/pets'),
    );

    expect(getPetsEndpoint).toBeDefined();
    expect(getPetsEndpoint?.parameters).toBeDefined();
    expect(getPetsEndpoint?.parameters.length).toBeGreaterThan(0);

    // Check if parameters have metadata (at least some should have descriptions)
    const paramWithMetadata = getPetsEndpoint?.parameters.find((p) => p.description !== undefined);
    expect(paramWithMetadata).toBeDefined();
  });

  it('should extract parameter examples from api-with-examples spec', async () => {
    // Arrange: Use spec that has examples
    const doc = await prepareOpenApiDocument('./examples/openapi/v3.0/api-with-examples.yaml');

    // Act: Extract endpoint definitions
    const endpoints = getEndpointDefinitionList(doc);

    // Assert: Endpoints are extracted (examples are in response, not parameters for this spec)
    expect(endpoints.endpoints).toBeDefined();
    expect(endpoints.endpoints.length).toBeGreaterThan(0);
  });
});

describe('Characterisation: Parameter Constraints Extraction', () => {
  it('should extract numeric constraints', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            parameters: [
              {
                name: 'age',
                in: 'query',
                schema: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 120,
                },
              },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    };

    const doc = await prepareOpenApiDocument(spec);
    const endpoints = getEndpointDefinitionList(doc);

    const ageParam = endpoints.endpoints[0]?.parameters.find((p) => p.name === 'age');
    expect(ageParam?.constraints?.minimum).toBe(0);
    expect(ageParam?.constraints?.maximum).toBe(120);
  });

  it('should extract string constraints', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            parameters: [
              {
                name: 'username',
                in: 'query',
                schema: {
                  type: 'string',
                  minLength: 3,
                  maxLength: 20,
                  pattern: '^[a-z]+$',
                },
              },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    };

    const doc = await prepareOpenApiDocument(spec);
    const endpoints = getEndpointDefinitionList(doc);

    const usernameParam = endpoints.endpoints[0]?.parameters.find((p) => p.name === 'username');
    expect(usernameParam?.constraints?.minLength).toBe(3);
    expect(usernameParam?.constraints?.maxLength).toBe(20);
    expect(usernameParam?.constraints?.pattern).toBe('^[a-z]+$');
  });

  it('should extract array constraints', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'getItems',
            parameters: [
              {
                name: 'tags',
                in: 'query',
                schema: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                  maxItems: 10,
                  uniqueItems: true,
                },
              },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    };

    const doc = await prepareOpenApiDocument(spec);
    const endpoints = getEndpointDefinitionList(doc);

    const tagsParam = endpoints.endpoints[0]?.parameters.find((p) => p.name === 'tags');
    expect(tagsParam?.constraints?.minItems).toBe(1);
    expect(tagsParam?.constraints?.maxItems).toBe(10);
    expect(tagsParam?.constraints?.uniqueItems).toBe(true);
  });

  it('should extract enum constraints', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'getItems',
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
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    };

    const doc = await prepareOpenApiDocument(spec);
    const endpoints = getEndpointDefinitionList(doc);

    const statusParam = endpoints.endpoints[0]?.parameters.find((p) => p.name === 'status');
    expect(statusParam?.constraints?.enum).toEqual(['active', 'inactive', 'pending']);
  });
});

describe('Characterisation: Parameter Metadata Fields', () => {
  it('should extract description and deprecated flags', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            parameters: [
              {
                name: 'filter',
                in: 'query',
                description: 'Filter users by status',
                deprecated: true,
                schema: { type: 'string' },
              },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    };

    const doc = await prepareOpenApiDocument(spec);
    const endpoints = getEndpointDefinitionList(doc);

    const filterParam = endpoints.endpoints[0]?.parameters.find((p) => p.name === 'filter');
    expect(filterParam?.description).toBe('Filter users by status');
    expect(filterParam?.deprecated).toBe(true);
  });

  it('should extract example values', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            parameters: [
              {
                name: 'username',
                in: 'query',
                example: 'john_doe',
                schema: { type: 'string' },
              },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    };

    const doc = await prepareOpenApiDocument(spec);
    const endpoints = getEndpointDefinitionList(doc);

    const usernameParam = endpoints.endpoints[0]?.parameters.find((p) => p.name === 'username');
    expect(usernameParam?.example).toBe('john_doe');
  });

  it('should extract default values from schema', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'getItems',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 10,
                },
              },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    };

    const doc = await prepareOpenApiDocument(spec);
    const endpoints = getEndpointDefinitionList(doc);

    const limitParam = endpoints.endpoints[0]?.parameters.find((p) => p.name === 'limit');
    expect(limitParam?.default).toBe(10);
  });
});
