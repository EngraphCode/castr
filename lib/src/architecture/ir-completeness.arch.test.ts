/**
 * IR Completeness Tests
 *
 * These tests verify that IR types (CastrDocument, CastrSchema, etc.) contain
 * all the fields required for code generation without accessing the original
 * OpenAPI document.
 *
 * These tests use TypeScript's structural typing to ensure that:
 * 1. Required fields exist on IR types
 * 2. IR types contain all metadata needed by writers and MCP layers
 * 3. No "reach back" to source documents is needed
 *
 * @see ADR-024 for the architectural decision
 * @module architecture/ir-completeness
 */

import { describe, it, expect } from 'vitest';
import type {
  CastrDocument,
  CastrSchema,
  CastrSchemaNode,
  CastrOperation,
  CastrParameter,
  CastrResponse,
  IRDependencyGraph,
  IRDependencyNode,
  IRZodChainInfo,
  CastrSchemaDependencyInfo,
} from '../ir/schema.js';

describe('IR Completeness', () => {
  describe('CastrDocument', () => {
    it('has all required fields for code generation orchestration', () => {
      // If any required field is missing, this will fail at compile time
      const minimalDoc: CastrDocument = {
        version: '1.0.0',
        openApiVersion: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        servers: [],
        components: [],
        operations: [],
        dependencyGraph: {
          nodes: new Map(),
          topologicalOrder: [],
          circularReferences: [],
        },
        schemaNames: [],
        enums: new Map(),
      };

      expect(minimalDoc.version).toBeDefined();
      expect(minimalDoc.schemaNames).toEqual([]);
      expect(minimalDoc.dependencyGraph.topologicalOrder).toEqual([]);
      expect(minimalDoc.operations).toEqual([]);
      expect(minimalDoc.components).toEqual([]);
    });

    it('supports optional global security requirements', () => {
      const docWithSecurity: CastrDocument = {
        version: '1.0.0',
        openApiVersion: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        servers: [],
        components: [],
        operations: [],
        dependencyGraph: {
          nodes: new Map(),
          topologicalOrder: [],
          circularReferences: [],
        },
        schemaNames: [],
        enums: new Map(),
        security: [{ schemeName: 'apiKey', scopes: [] }],
      };

      expect(docWithSecurity.security).toBeDefined();
      expect(docWithSecurity.security).toHaveLength(1);
    });
  });

  describe('CastrSchema', () => {
    it('has required metadata field for code generation context', () => {
      const schema: CastrSchema = {
        type: 'string',
        metadata: {
          required: true,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: [],
        },
      };

      expect(schema.metadata).toBeDefined();
      expect(schema.metadata.required).toBe(true);
      expect(schema.metadata.nullable).toBe(false);
    });

    it('supports all schema type variants', () => {
      const objectSchema: CastrSchema = {
        type: 'object',
        metadata: {
          required: true,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: [],
        },
      };

      const arraySchema: CastrSchema = {
        type: 'array',
        items: objectSchema,
        metadata: {
          required: true,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: [],
        },
      };

      const refSchema: CastrSchema = {
        $ref: '#/components/schemas/Pet',
        metadata: {
          required: false,
          nullable: true,
          dependencyGraph: {
            references: ['#/components/schemas/Pet'],
            referencedBy: [],
            depth: 1,
          },
          zodChain: { presence: '.optional().nullable()', validations: [], defaults: [] },
          circularReferences: [],
        },
      };

      expect(objectSchema.type).toBe('object');
      expect(arraySchema.items).toBeDefined();
      expect(refSchema.$ref).toBeDefined();
    });
  });

  describe('CastrSchemaNode (metadata)', () => {
    it('has all fields needed for Zod writer', () => {
      const metadata: CastrSchemaNode = {
        required: true,
        nullable: false,
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: {
          presence: '.optional()',
          validations: ['.min(1)', '.max(100)'],
          defaults: ['.default("unknown")'],
        },
        circularReferences: [],
      };

      // Zod writer needs these for chain generation
      expect(metadata.zodChain.validations).toBeDefined();
      expect(metadata.zodChain.defaults).toBeDefined();
      expect(metadata.zodChain.presence).toBeDefined();
    });

    it('has dependency information for circular reference detection', () => {
      const metadata: CastrSchemaNode = {
        required: true,
        nullable: false,
        dependencyGraph: {
          references: ['#/components/schemas/Child'],
          referencedBy: ['#/components/schemas/Parent'],
          depth: 2,
        },
        zodChain: { presence: '', validations: [], defaults: [] },
        circularReferences: ['#/components/schemas/Circular'],
      };

      expect(metadata.dependencyGraph.references).toContain('#/components/schemas/Child');
      expect(metadata.dependencyGraph.referencedBy).toContain('#/components/schemas/Parent');
      expect(metadata.circularReferences).toHaveLength(1);
    });
  });

  describe('CastrOperation', () => {
    it('has all fields required for endpoint generation', () => {
      const operation: CastrOperation = {
        method: 'get',
        path: '/pets/{petId}',
        parameters: [],
        parametersByLocation: { query: [], path: [], header: [], cookie: [] },
        responses: [],
      };

      expect(operation.method).toBe('get');
      expect(operation.path).toBe('/pets/{petId}');
      expect(operation.parametersByLocation).toBeDefined();
    });

    it('has all fields required for MCP tool generation', () => {
      const parameter: CastrParameter = {
        name: 'petId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          metadata: {
            required: true,
            nullable: false,
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
            circularReferences: [],
          },
        },
      };

      const response: CastrResponse = {
        statusCode: '200',
        description: 'Successful response',
        schema: {
          type: 'object',
          metadata: {
            required: true,
            nullable: false,
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
            circularReferences: [],
          },
        },
      };

      const operation: CastrOperation = {
        operationId: 'getPetById',
        method: 'get',
        path: '/pets/{petId}',
        summary: 'Get a pet by ID',
        description: 'Returns a single pet',
        parameters: [parameter],
        parametersByLocation: { query: [], path: [parameter], header: [], cookie: [] },
        responses: [response],
        tags: ['pets'],
        security: [{ schemeName: 'apiKey', scopes: [] }],
      };

      // MCP tool generation needs these
      expect(operation.operationId).toBeDefined();
      expect(operation.summary).toBeDefined();
      expect(operation.description).toBeDefined();
      expect(operation.parameters).toHaveLength(1);
      expect(operation.responses).toHaveLength(1);
      expect(operation.security).toBeDefined();
      expect(operation.tags).toBeDefined();
    });
  });

  describe('IRDependencyGraph', () => {
    it('has topological order for schema generation ordering', () => {
      const node: IRDependencyNode = {
        ref: '#/components/schemas/Pet',
        dependencies: ['#/components/schemas/Category'],
        dependents: ['#/components/schemas/Store'],
        depth: 1,
        isCircular: false,
      };

      const graph: IRDependencyGraph = {
        nodes: new Map([['#/components/schemas/Pet', node]]),
        topologicalOrder: ['Category', 'Pet', 'Store'],
        circularReferences: [],
      };

      expect(graph.topologicalOrder).toEqual(['Category', 'Pet', 'Store']);
      expect(graph.nodes.get('#/components/schemas/Pet')).toBeDefined();
      expect(graph.circularReferences).toEqual([]);
    });

    it('tracks circular references for z.lazy() generation', () => {
      const graph: IRDependencyGraph = {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [['Node', 'Tree', 'Node']],
      };

      expect(graph.circularReferences).toHaveLength(1);
      expect(graph.circularReferences[0]).toContain('Node');
    });
  });

  describe('IRZodChainInfo', () => {
    it('has all chain types for complete Zod generation', () => {
      const zodChain: IRZodChainInfo = {
        presence: '.optional().nullable()',
        validations: ['.email()', '.min(5)', '.max(100)'],
        defaults: ['.default("user@example.com")'],
      };

      expect(zodChain.presence).toBeDefined();
      expect(zodChain.validations).toBeDefined();
      expect(zodChain.defaults).toBeDefined();
    });
  });

  describe('CastrSchemaDependencyInfo', () => {
    it('has bidirectional reference tracking', () => {
      const depInfo: CastrSchemaDependencyInfo = {
        references: ['#/components/schemas/Address', '#/components/schemas/Phone'],
        referencedBy: ['#/components/schemas/User'],
        depth: 2,
      };

      expect(depInfo.references).toHaveLength(2);
      expect(depInfo.referencedBy).toHaveLength(1);
      expect(depInfo.depth).toBe(2);
    });
  });
});
