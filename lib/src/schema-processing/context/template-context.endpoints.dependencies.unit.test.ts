import { describe, expect, it } from 'vitest';
import type { EndpointDefinition } from '../../endpoints/definition.types.js';
import type { CastrSchema, CastrSchemaNode } from '../ir/schema.js';
import {
  normalizeSchemaNameForDependency,
  collectEndpointDependencies,
  processTransitiveDependenciesForGroup,
  type MinimalTemplateContext,
} from './template-context.endpoints.dependencies.js';

function createSchemaNode(references: string[] = []): CastrSchemaNode {
  return {
    required: true,
    nullable: false,
    zodChain: {
      presence: '',
      validations: [],
      defaults: [],
    },
    dependencyGraph: {
      references,
      referencedBy: [],
      depth: 0,
    },
    circularReferences: [],
  };
}

function createSchema(references: string[] = []): CastrSchema {
  return {
    type: 'object',
    metadata: createSchemaNode(references),
  };
}

function createEndpoint(overrides: Partial<EndpointDefinition> = {}): EndpointDefinition {
  return {
    method: 'get',
    path: '/users/{id}',
    requestFormat: 'json',
    parameters: [],
    errors: [],
    response: createSchema(),
    ...overrides,
  };
}

function createGroup(): MinimalTemplateContext {
  return {
    schemas: {},
    endpoints: [],
    types: {},
  };
}

describe('template-context.endpoints.dependencies', () => {
  describe('normalizeSchemaNameForDependency', () => {
    it('returns null when schema has no ref', () => {
      expect(normalizeSchemaNameForDependency({})).toBeNull();
    });

    it('returns root name for chained component refs', () => {
      expect(normalizeSchemaNameForDependency({ $ref: '#/components/schemas/User.address' })).toBe(
        'User',
      );
    });

    it('returns full schema name when no chain is present in ref', () => {
      expect(normalizeSchemaNameForDependency({ $ref: '#/components/schemas/User' })).toBe('User');
    });
  });

  describe('collectEndpointDependencies', () => {
    it('collects dependency refs from response, parameters, and errors', () => {
      const endpoint = createEndpoint({
        response: createSchema(['#/components/schemas/User', '#/components/schemas/Profile']),
        parameters: [
          {
            name: 'filter',
            type: 'Query',
            schema: createSchema(['#/components/schemas/Filter']),
          },
        ],
        errors: [
          {
            status: 400,
            schema: createSchema(['#/components/schemas/ErrorBody']),
          },
        ],
      });

      const dependencies = collectEndpointDependencies(endpoint);

      expect(dependencies).toEqual(['User', 'Profile', 'Filter', 'ErrorBody']);
    });

    it('throws on malformed dependency refs with endpoint context', () => {
      const endpoint = createEndpoint({
        response: createSchema(['not-a-ref']),
      });

      expect(() => collectEndpointDependencies(endpoint)).toThrow(
        /Invalid schema dependency reference "not-a-ref".*get \/users\/\{id\}.*response/,
      );
    });

    it('throws on non-schema component refs with endpoint context', () => {
      const endpoint = createEndpoint({
        response: createSchema(['#/components/parameters/UserId']),
      });

      expect(() => collectEndpointDependencies(endpoint)).toThrow(
        /Unsupported schema dependency reference "#\/components\/parameters\/UserId".*get \/users\/\{id\}.*response/,
      );
    });

    it('collects valid x-ext schema refs', () => {
      const endpoint = createEndpoint({
        response: createSchema(['#/x-ext/abc123/components/schemas/User']),
      });

      const dependencies = collectEndpointDependencies(endpoint);

      expect(dependencies).toEqual(['User']);
    });
  });

  describe('processTransitiveDependenciesForGroup', () => {
    it('adds normalized transitive dependency names and copies schema/type payloads', () => {
      const dependencyGraph: Record<string, Set<string>> = {
        '#/components/schemas/Order': new Set([
          '#/components/schemas/User.address',
          '#/components/schemas/Product',
        ]),
      };
      const types: Record<string, string> = {
        'User.address': 'type UserAddress = string;',
        Product: 'type Product = { id: string };',
      };
      const schemas: Record<string, string> = {
        'User.address': 'export const UserAddress = z.string();',
        Product: 'export const Product = z.object({ id: z.string() });',
      };
      const dependencies = new Set<string>();
      const group = createGroup();

      processTransitiveDependenciesForGroup(
        'Order',
        dependencyGraph,
        types,
        schemas,
        dependencies,
        group,
      );

      expect(dependencies).toEqual(new Set(['User', 'Product']));
      expect(group.types).toEqual(types);
      expect(group.schemas).toEqual(schemas);
    });

    it('ignores missing graph entries and leaves group/dependencies unchanged', () => {
      const dependencies = new Set<string>(['Existing']);
      const group = createGroup();

      processTransitiveDependenciesForGroup(
        'Unknown',
        {},
        { Existing: 'type Existing = string;' },
        { Existing: 'export const Existing = z.string();' },
        dependencies,
        group,
      );

      expect(dependencies).toEqual(new Set(['Existing']));
      expect(group.types).toEqual({});
      expect(group.schemas).toEqual({});
    });
  });
});
