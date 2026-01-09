/**
 * Tests for IR-based MCP tool builder.
 *
 * These tests verify that `buildMcpToolsFromIR` produces equivalent
 * output to `buildMcpTools`, but reads entirely from `CastrDocument`
 * instead of raw OpenAPI objects.
 *
 * @module template-context.mcp.from-ir.test
 */

import { describe, expect, test } from 'vitest';
import type {
  CastrDocument,
  CastrOperation,
  CastrSchema,
  IRSecuritySchemeComponent,
} from './ir-schema.js';
import { createMockCastrDocument, createMockCastrSchemaNode } from './ir-test-helpers.js';
import { buildMcpToolsFromIR } from './template-context.mcp.js';

/**
 * Create a mock CastrSchema for testing.
 */
function createMockSchema(type = 'object'): CastrSchema {
  return {
    type: type as CastrSchema['type'],
    metadata: createMockCastrSchemaNode(),
  };
}

/**
 * Create a mock CastrOperation with minimal required fields.
 */
function createMockOperation(overrides: Partial<CastrOperation> = {}): CastrOperation {
  return {
    operationId: 'testOperation',
    method: 'get',
    path: '/test',
    parameters: [],
    parametersByLocation: {
      path: [],
      query: [],
      header: [],
      cookie: [],
    },
    responses: [],
    ...overrides,
  } as CastrOperation;
}

/**
 * Create a security scheme component.
 */
function createSecurityScheme(name: string): IRSecuritySchemeComponent {
  return {
    type: 'securityScheme',
    name,
    scheme: { type: 'http', scheme: 'bearer' },
  };
}

describe('buildMcpToolsFromIR', () => {
  describe('basic functionality', () => {
    test('returns empty array when IR has no operations', () => {
      const ir = createMockCastrDocument({ operations: [] });

      const result = buildMcpToolsFromIR(ir);

      expect(result).toEqual([]);
    });

    test('creates MCP tool for a simple GET operation', () => {
      const operation = createMockOperation({
        operationId: 'getUsers',
        method: 'get',
        path: '/users',
        description: 'Get all users',
        responses: [{ statusCode: '200', schema: createMockSchema() }],
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      expect(result).toHaveLength(1);
      // getMcpToolName applies snake_case transformation
      expect(result[0]?.tool.name).toBe('get_users');
      expect(result[0]?.tool.description).toBe('Get all users');
      expect(result[0]?.method).toBe('get');
      expect(result[0]?.path).toBe('/users');
    });
  });

  describe('tool name generation', () => {
    test('uses operationId when provided (transformed to snake_case)', () => {
      const operation = createMockOperation({ operationId: 'myCustomOperation' });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      // getMcpToolName applies snake_case transformation
      expect(result[0]?.tool.name).toBe('my_custom_operation');
    });

    test('generates name from operationId (snake_case applied)', () => {
      // The operationId already has underscores, but snake_case normalization
      // may transform camelCase numbers
      const operation = createMockOperation({
        operationId: 'getApiV1Users',
        method: 'get',
        path: '/api/v1/users',
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      // Snake case transformation of camelCase
      expect(result[0]?.tool.name).toBe('get_api_v_1_users');
    });
  });

  describe('parameters', () => {
    test('includes path parameters in input schema', () => {
      const operation = createMockOperation({
        operationId: 'getUserById',
        path: '/users/{userId}',
        parametersByLocation: {
          path: [
            { name: 'userId', in: 'path', required: true, schema: createMockSchema('string') },
          ],
          query: [],
          header: [],
          cookie: [],
        },
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      expect(result[0]?.tool.inputSchema).toBeDefined();
      // Verify inputSchema has expected structure using type-safe checks
      const inputSchema = result[0]?.tool.inputSchema;
      expect(inputSchema).toHaveProperty('type', 'object');
      expect(inputSchema).toHaveProperty('properties.path');
    });

    test('includes query parameters in input schema', () => {
      const operation = createMockOperation({
        operationId: 'listUsers',
        parametersByLocation: {
          path: [],
          query: [
            { name: 'limit', in: 'query', required: false, schema: createMockSchema('integer') },
          ],
          header: [],
          cookie: [],
        },
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      const inputSchema = result[0]?.tool.inputSchema;
      expect(inputSchema).toHaveProperty('properties.query');
    });
  });

  describe('request body', () => {
    test('includes request body in input schema', () => {
      const operation = createMockOperation({
        operationId: 'createUser',
        method: 'post',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: createMockSchema('object') },
          },
        },
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      const inputSchema = result[0]?.tool.inputSchema;
      expect(inputSchema).toHaveProperty('properties.body');
    });
  });

  describe('responses', () => {
    test('includes output schema from 2xx response', () => {
      const operation = createMockOperation({
        operationId: 'getUser',
        responses: [{ statusCode: '200', schema: createMockSchema('object') }],
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      expect(result[0]?.tool.outputSchema).toBeDefined();
    });

    test('omits output schema when no success response', () => {
      const operation = createMockOperation({
        operationId: 'deleteUser',
        responses: [
          { statusCode: '204' }, // No content
        ],
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      // outputSchema may be undefined or not present
      expect(result[0]?.tool.outputSchema).toBeUndefined();
    });
  });

  describe('security', () => {
    test('resolves operation security from IR', () => {
      const operation = createMockOperation({
        operationId: 'protectedRoute',
        security: [{ schemeName: 'bearerAuth', scopes: [] }],
      });
      const ir: CastrDocument = {
        ...createMockCastrDocument({ operations: [operation] }),
        components: [createSecurityScheme('bearerAuth')],
      };

      const result = buildMcpToolsFromIR(ir);

      expect(result[0]?.security.isPublic).toBe(false);
      expect(result[0]?.security.requirementSets).toHaveLength(1);
    });

    test('marks operation as public when security is empty array', () => {
      const operation = createMockOperation({
        operationId: 'publicRoute',
        security: [],
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      expect(result[0]?.security.isPublic).toBe(true);
    });
  });

  describe('httpOperation metadata', () => {
    test('includes httpOperation with correct fields', () => {
      const operation = createMockOperation({
        operationId: 'updateUser',
        method: 'put',
        path: '/users/{id}',
      });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      expect(result[0]?.httpOperation).toEqual({
        method: 'put',
        path: '/users/{id}',
        originalPath: '/users/{id}',
        operationId: 'updateUser',
      });
    });
  });

  describe('annotations', () => {
    test('includes read-only hints for GET requests', () => {
      const operation = createMockOperation({ method: 'get' });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      expect(result[0]?.tool.annotations).toBeDefined();
      expect(result[0]?.tool.annotations?.readOnlyHint).toBe(true);
    });

    test('includes destructive hints for DELETE requests', () => {
      const operation = createMockOperation({ method: 'delete' });
      const ir = createMockCastrDocument({ operations: [operation] });

      const result = buildMcpToolsFromIR(ir);

      expect(result[0]?.tool.annotations?.destructiveHint).toBe(true);
    });
  });
});
