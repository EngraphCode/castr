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
  CastrSchemaNode,
  IRDependencyGraph,
  CastrDocument,
  CastrSchemaComponent,
} from '../../ir/index.js';
import { getSchemaFromIRMediaTypeEntry } from '../../ir/index.js';
import { buildIR } from '../../parsers/openapi/index.js';

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
    additionalOperations: [],
    dependencyGraph: createDependencyGraph(),
    schemaNames: [],
    enums: new Map(),
    ...overrides,
  };
}

describe('writeOpenApi', () => {
  describe('document structure', () => {
    it('returns canonical OpenAPI 3.2.0 document', () => {
      const ir = createDocument();

      const result = writeOpenApi(ir);

      expect(result.openapi).toBe('3.2.0');
    });

    it('keeps OpenAPI 3.2.0 canonical even when IR still carries 3.1.0', () => {
      const ir = createDocument({ openApiVersion: '3.1.0' });

      const result = writeOpenApi(ir);

      expect(result.openapi).toBe('3.2.0');
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

    it('writes x-ext mediaType components separately so x-ext refs remain reloadable', () => {
      const ir = createDocument({
        components: [
          {
            type: 'mediaType',
            name: 'EventStream',
            mediaType: {
              schema: { type: 'object', metadata: createMetadata() },
            },
          },
          {
            type: 'mediaType',
            name: 'EventStream',
            xExtKey: 'abc123',
            mediaType: {
              schema: { type: 'string', metadata: createMetadata() },
            },
          },
        ],
        operations: [
          {
            method: 'get',
            path: '/events',
            parameters: [],
            parametersByLocation: { query: [], path: [], header: [], cookie: [] },
            responses: [
              {
                statusCode: '200',
                description: 'OK',
                content: {
                  'application/json': {
                    $ref: '#/components/mediaTypes/EventStream',
                  },
                  'application/x-ndjson': {
                    $ref: '#/x-ext/abc123/components/mediaTypes/EventStream',
                  },
                },
              },
            ],
          },
        ],
      });

      const result = writeOpenApi(ir);
      const rebuilt = buildIR(result);
      const responseContent = rebuilt.operations[0]?.responses[0]?.content;

      expect(result.components?.mediaTypes?.['EventStream']).toBeDefined();
      expect(result['x-ext']).toEqual({
        abc123: {
          components: {
            mediaTypes: {
              EventStream: {
                schema: { type: 'string' },
              },
            },
          },
        },
      });

      if (!responseContent) {
        throw new Error('Expected response content after round-trip');
      }
      const jsonMediaType = responseContent['application/json'];
      const streamingMediaType = responseContent['application/x-ndjson'];

      if (!jsonMediaType || !streamingMediaType) {
        throw new Error('Expected both round-tripped media type entries');
      }

      expect(
        getSchemaFromIRMediaTypeEntry(
          rebuilt,
          jsonMediaType,
          '#/paths/~1events/get/responses/200/content/application~1json',
        )?.type,
      ).toBe('object');
      expect(
        getSchemaFromIRMediaTypeEntry(
          rebuilt,
          streamingMediaType,
          '#/paths/~1events/get/responses/200/content/application~1x-ndjson',
        )?.type,
      ).toBe('string');
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

    it('includes additionalOperations as custom path item methods', () => {
      const ir = createDocument({
        additionalOperations: [
          {
            operationId: 'purgeUsers',
            method: 'PURGE',
            path: '/users',
            parameters: [],
            parametersByLocation: { query: [], path: [], header: [], cookie: [] },
            responses: [{ statusCode: '202', description: 'Accepted' }],
          },
        ],
      });

      const result = writeOpenApi(ir);

      expect(result.paths?.['/users']?.additionalOperations?.['PURGE']).toBeDefined();
      expect(result.paths?.['/users']?.additionalOperations?.['PURGE']?.operationId).toBe(
        'purgeUsers',
      );
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

    it('sorts document-level security requirements by scheme name', () => {
      const ir = createDocument({
        security: [
          { schemeName: 'oauth2', scopes: ['read'] },
          { schemeName: 'apiKey', scopes: [] },
        ],
      });

      const result = writeOpenApi(ir);

      expect(result.security).toEqual([{ apiKey: [] }, { oauth2: ['read'] }]);
    });
  });

  describe('empty document', () => {
    it('handles minimal document', () => {
      const ir = createDocument();

      const result = writeOpenApi(ir);

      expect(result.openapi).toBe('3.2.0');
      expect(result.info).toBeDefined();
      expect(result.paths).toEqual({});
    });
  });
});
