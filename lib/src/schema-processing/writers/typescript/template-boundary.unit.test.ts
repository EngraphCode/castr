import { describe, it, expect } from 'vitest';
import { writeTypeScript } from './index.js';
import type { TemplateContext } from '../../context/index.js';
import type { CastrSchema, CastrDocument } from '../../ir/index.js';
import { CastrSchemaProperties } from '../../ir/index.js';
import type { InfoObject, SchemaObjectType, ServerObject } from '../../../shared/openapi-types.js';

/**
 * Template Boundary Tests
 *
 * TDD tests for RC-5.1: the TypeScript writer must respect the template
 * selection, suppressing endpoints and MCP tools when schemas-only is selected.
 */

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

/**
 * Build a TemplateContext with schemas, endpoints, and MCP tools present.
 */
function createFullContext(template?: string): TemplateContext {
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

  return {
    sortedSchemaNames: ['#/components/schemas/User'],
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
    mcpTools: [
      {
        tool: {
          name: 'getUsers',
          description: 'Get users',
          inputSchema: { type: 'object' },
        },
        method: 'get',
        path: '/users',
        originalPath: '/users',
        operationId: 'getUsers',
        httpOperation: {
          method: 'get',
          path: '/users',
          originalPath: '/users',
          operationId: 'getUsers',
        },
        security: { isPublic: true, usesGlobalSecurity: false, requirementSets: [] },
      },
    ],
    _ir: ir,
    options: {
      ...(template !== undefined ? { template } : {}),
    },
  };
}

describe('writers/typescript template boundary', () => {
  describe('schemas-only template', () => {
    it('suppresses endpoint exports', () => {
      const context = createFullContext('schemas-only');
      const output = writeTypeScript(context);
      expect(output).not.toContain('export const endpoints');
      expect(output).not.toContain('// Endpoints');
    });

    it('suppresses MCP tool exports', () => {
      const context = createFullContext('schemas-only');
      const output = writeTypeScript(context);
      expect(output).not.toContain('export const mcpTools');
      expect(output).not.toContain('// MCP Tools');
    });

    it('preserves schema exports', () => {
      const context = createFullContext('schemas-only');
      const output = writeTypeScript(context);
      expect(output).toContain('// Type Definitions');
      expect(output).toContain('export type User =');
      expect(output).toContain('// Zod Schemas');
      expect(output).toContain('export const User = z.strictObject(');
    });

    it('suppresses validation helpers even if enabled in options', () => {
      const context = createFullContext('schemas-only');
      context.options = { ...context.options, withValidationHelpers: true };
      const output = writeTypeScript(context);
      expect(output).not.toContain('export function validateRequest');
      expect(output).not.toContain('export function validateResponse');
    });

    it('suppresses schema registry even if enabled in options', () => {
      const context = createFullContext('schemas-only');
      context.options = { ...context.options, withSchemaRegistry: true };
      const output = writeTypeScript(context);
      expect(output).not.toContain('schemaRegistry');
    });
  });

  describe('schemas-with-metadata template', () => {
    it('emits endpoint exports', () => {
      const context = createFullContext('schemas-with-metadata');
      const output = writeTypeScript(context);
      expect(output).toContain('export const endpoints');
    });

    it('emits MCP tool exports', () => {
      const context = createFullContext('schemas-with-metadata');
      const output = writeTypeScript(context);
      expect(output).toContain('export const mcpTools');
    });

    it('emits schema exports', () => {
      const context = createFullContext('schemas-with-metadata');
      const output = writeTypeScript(context);
      expect(output).toContain('export const User = z.strictObject(');
    });
  });

  describe('default template (undefined)', () => {
    it('emits endpoint exports when template is not specified', () => {
      const context = createFullContext(undefined);
      const output = writeTypeScript(context);
      expect(output).toContain('export const endpoints');
    });

    it('emits MCP tool exports when template is not specified', () => {
      const context = createFullContext(undefined);
      const output = writeTypeScript(context);
      expect(output).toContain('export const mcpTools');
    });
  });
});
