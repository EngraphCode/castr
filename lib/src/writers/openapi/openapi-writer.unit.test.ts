/**
 * Unit tests for OpenAPI document writer.
 *
 * Tests the main writeOpenApi function that assembles a complete OpenAPI document.
 * Follows TDD - tests written first, implementation follows.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

import type {
  CastrDocument,
  CastrSchemaComponent,
  CastrSchemaNode,
  IRDependencyGraph,
} from '../../ir/schema.js';

import { writeOpenApi } from './openapi-writer.js';

/**
 * Creates a minimal valid CastrSchemaNode for testing.
 */
function createMetadata(overrides: Partial<CastrSchemaNode> = {}): CastrSchemaNode {
  return {
    required: false,
    nullable: false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
    ...overrides,
  };
}

/**
 * Creates a minimal valid dependency graph for testing.
 */
function createDependencyGraph(): IRDependencyGraph {
  return {
    nodes: new Map(),
    topologicalOrder: [],
    circularReferences: [],
  };
}

/**
 * Creates a minimal valid CastrDocument for testing.
 */
function createDocument(overrides: Partial<CastrDocument> = {}): CastrDocument {
  return {
    version: '1.0.0',
    openApiVersion: '3.1.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    servers: [],
    components: [],
    operations: [],
    dependencyGraph: createDependencyGraph(),
    schemaNames: [],
    enums: new Map(),
    ...overrides,
  };
}

describe('writeOpenApi', () => {
  describe('document structure', () => {
    it('returns valid OpenAPI 3.1.0 document', () => {
      const ir = createDocument();

      const result = writeOpenApi(ir);

      expect(result.openapi).toBe('3.1.0');
    });

    it('preserves info object', () => {
      const ir = createDocument({
        info: {
          title: 'Pet Store API',
          version: '2.0.0',
          description: 'A sample API',
        },
      });

      const result = writeOpenApi(ir);

      expect(result.info.title).toBe('Pet Store API');
      expect(result.info.version).toBe('2.0.0');
      expect(result.info.description).toBe('A sample API');
    });

    it('preserves servers array', () => {
      const ir = createDocument({
        servers: [
          { url: 'https://api.example.com', description: 'Production' },
          { url: 'https://staging.example.com', description: 'Staging' },
        ],
      });

      const result = writeOpenApi(ir);

      expect(result.servers).toHaveLength(2);
      expect(result.servers?.[0]?.url).toBe('https://api.example.com');
      expect(result.servers?.[1]?.url).toBe('https://staging.example.com');
    });
  });

  describe('components integration', () => {
    it('includes schema components', () => {
      const ir = createDocument({
        components: [
          {
            type: 'schema',
            name: 'User',
            schema: { type: 'object', metadata: createMetadata() },
            metadata: createMetadata(),
          } satisfies CastrSchemaComponent,
        ],
      });

      const result = writeOpenApi(ir);

      expect(result.components?.schemas?.['User']).toBeDefined();
    });
  });

  describe('paths integration', () => {
    it('includes operations as paths', () => {
      const ir = createDocument({
        operations: [
          {
            operationId: 'getUsers',
            method: 'get',
            path: '/users',
            parameters: [],
            parametersByLocation: { query: [], path: [], header: [], cookie: [] },
            responses: [
              {
                statusCode: '200',
                description: 'Success',
              },
            ],
          },
        ],
      });

      const result = writeOpenApi(ir);

      expect(result.paths?.['/users']?.get).toBeDefined();
      expect(result.paths?.['/users']?.get?.operationId).toBe('getUsers');
    });
  });

  describe('security integration', () => {
    it('includes document-level security', () => {
      const ir = createDocument({
        security: [{ schemeName: 'bearerAuth', scopes: [] }],
      });

      const result = writeOpenApi(ir);

      expect(result.security).toBeDefined();
      expect(result.security).toEqual([{ bearerAuth: [] }]);
    });
  });

  describe('empty document', () => {
    it('handles minimal document', () => {
      const ir = createDocument();

      const result = writeOpenApi(ir);

      expect(result.openapi).toBe('3.1.0');
      expect(result.info).toBeDefined();
      expect(result.paths).toEqual({});
    });
  });
});
