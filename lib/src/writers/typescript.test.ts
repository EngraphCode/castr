import { describe, it, expect } from 'vitest';
import { writeTypeScript, writeIndexFile, writeCommonFile } from './typescript.js';
import type { TemplateContext } from '../context/index.js';
import type { CastrDocument, CastrSchema } from '../context/ir-schema.js';
import { CastrSchemaProperties } from '../context/ir-schema-properties.js';
import type { SchemaObjectType, InfoObject, ServerObject } from 'openapi3-ts/oas31';

function createMockSchema(
  type: SchemaObjectType,
  properties?: Record<string, CastrSchema>,
): CastrSchema {
  const schema: CastrSchema = {
    type,
    metadata: {
      required: true,
      nullable: false,
      zodChain: { presence: '', validations: [], defaults: [] },
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: [],
    },
  };

  if (properties) {
    schema.properties = new CastrSchemaProperties(properties);
  }

  return schema;
}

function createMockRefSchema(ref: string): CastrSchema {
  return {
    $ref: ref,
    metadata: {
      required: true,
      nullable: false,
      zodChain: { presence: '', validations: [], defaults: [] },
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: [],
    },
  };
}

const mockInfo: InfoObject = { title: 'Test API', version: '1.0.0' };
const mockServers: ServerObject[] = [];

describe('writers/typescript', () => {
  describe('writeTypeScript', () => {
    it('should generate basic imports and schemas', () => {
      const ir: CastrDocument = {
        version: '1.0.0',
        openApiVersion: '3.1.0',
        info: mockInfo,
        servers: mockServers,
        enums: new Map(),
        components: [
          {
            type: 'schema',
            name: 'User',
            schema: createMockSchema('object', { name: createMockSchema('string') }),
            metadata: {
              required: false,
              nullable: false,
              zodChain: { presence: '', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
        ],
        operations: [],
        dependencyGraph: {
          nodes: new Map(),
          topologicalOrder: [],
          circularReferences: [],
        },
        schemaNames: [],
      };

      const context: TemplateContext = {
        sortedSchemaNames: ['#/components/schemas/User'],
        endpoints: [],
        endpointsGroups: {},
        mcpTools: [],
        _ir: ir,
      };

      const output = writeTypeScript(context);
      expect(output).toContain('import { z } from "zod";');
      expect(output).toContain('// Type Definitions');
      expect(output).toContain('export type User =');
      expect(output).toContain('// Zod Schemas');
      expect(output).toContain('export const User = z.object(');
      expect(output).toContain('name: z.string()');
    });

    it('should generate endpoints', () => {
      const context: TemplateContext = {
        sortedSchemaNames: [],
        endpoints: [
          {
            method: 'get',
            path: '/users',
            requestFormat: 'json',
            parameters: [],
            errors: [],
            response: {
              ...createMockSchema('array'),
              items: createMockRefSchema('#/components/schemas/User'),
            },
          },
        ],
        endpointsGroups: {},
        mcpTools: [],
        _ir: {
          version: '1.0.0',
          openApiVersion: '3.1.0',
          info: mockInfo,
          servers: mockServers,
          enums: new Map(),
          components: [],
          operations: [],
          dependencyGraph: {
            nodes: new Map(),
            topologicalOrder: [],
            circularReferences: [],
          },
          schemaNames: [],
        },
      };

      const output = writeTypeScript(context);
      expect(output).toContain('export const endpoints = [');
      expect(output).toContain('method: "get"');
      expect(output).toContain('path: "/users"');
      // Note: Response will be z.unknown() since User schema is not in IR
      expect(output).toContain('response:');
    });

    it('should generate validation helpers when enabled', () => {
      const context: TemplateContext = {
        sortedSchemaNames: [],
        endpoints: [],
        endpointsGroups: {},
        mcpTools: [],
        _ir: {
          version: '1.0.0',
          openApiVersion: '3.1.0',
          info: mockInfo,
          servers: mockServers,
          enums: new Map(),
          components: [],
          operations: [],
          dependencyGraph: {
            nodes: new Map(),
            topologicalOrder: [],
            circularReferences: [],
          },
          schemaNames: [],
        },
        options: {
          withValidationHelpers: true,
        },
      };

      const output = writeTypeScript(context);
      expect(output).toContain('export function validateRequest');
      expect(output).toContain('export function validateResponse');
    });
  });

  describe('writeIndexFile', () => {
    it('should generate exports for groups', () => {
      const groups = {
        users: 'users-group',
        posts: 'posts-group',
      };

      const output = writeIndexFile(groups);
      expect(output).toContain('export * as users from "./users-group";');
      expect(output).toContain('export * as posts from "./posts-group";');
    });
  });

  describe('writeCommonFile', () => {
    it('should generate common schemas and types', () => {
      const ir: CastrDocument = {
        version: '1.0.0',
        openApiVersion: '3.1.0',
        info: mockInfo,
        servers: mockServers,
        enums: new Map(),
        components: [
          {
            type: 'schema',
            name: 'Error',
            schema: createMockSchema('object', { message: createMockSchema('string') }),
            metadata: {
              required: false,
              nullable: false,
              zodChain: { presence: '', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
        ],
        operations: [],
        dependencyGraph: {
          nodes: new Map(),
          topologicalOrder: [],
          circularReferences: [],
        },
        schemaNames: [],
      };

      const context: TemplateContext = {
        sortedSchemaNames: ['#/components/schemas/Error'],
        endpoints: [],
        endpointsGroups: {},
        mcpTools: [],
        _ir: ir,
      };

      const output = writeCommonFile(context, ['#/components/schemas/Error']);
      expect(output).toContain('import { z } from "zod";');
      expect(output).toContain('// Type Definitions');
      expect(output).toContain('export type Error =');
      expect(output).toContain('// Zod Schemas');
      expect(output).toContain('export const Error = z.object(');
      expect(output).toContain('message: z.string()');
    });
  });
});
