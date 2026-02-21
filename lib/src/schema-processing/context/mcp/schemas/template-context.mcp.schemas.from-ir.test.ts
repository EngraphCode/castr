/**
 * Tests for IR-based MCP tool schema builder.
 *
 * These tests verify that `buildMcpToolSchemasFromIR` produces equivalent
 * output to `buildMcpToolSchemas`, but reads from `CastrDocument` and
 * `CastrOperation` instead of raw OpenAPI.
 *
 * @module template-context.mcp.schemas.from-ir.test
 */

import { describe, expect, test } from 'vitest';
import type { CastrSchema, CastrSchemaComponent, CastrOperation } from '../../../ir/index.js';
import {
  CastrSchemaProperties,
  createMockCastrDocument,
  createMockCastrSchemaNode,
} from '../../../ir/index.js';
import { buildMcpToolSchemasFromIR } from './template-context.mcp.schemas.from-ir.js';
import type { MutableJsonSchema } from '../../../conversion/json-schema/index.js';

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
 * Create a mock schema component for the IR.
 */
function createSchemaComponent(name: string, schema: CastrSchema): CastrSchemaComponent {
  return {
    type: 'schema',
    name,
    schema,
    metadata: createMockCastrSchemaNode(),
  };
}

/**
 * Create a minimal CastrOperation for testing.
 */
function createMockOperation(overrides: Partial<CastrOperation> = {}): CastrOperation {
  return {
    method: 'get',
    path: '/test',
    parametersByLocation: {
      path: [],
      query: [],
      header: [],
      cookie: [],
    },
    responses: [],
    security: [],
    ...overrides,
  } as CastrOperation;
}

/**
 * Type guard for JsonSchema that is an object (not boolean).
 */
function asSchemaObject(schema: unknown): MutableJsonSchema {
  if (typeof schema === 'boolean') {
    throw new Error('Expected schema object, got boolean');
  }
  return schema as MutableJsonSchema;
}

describe('buildMcpToolSchemasFromIR', () => {
  test('builds input schema with path parameters', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      parametersByLocation: {
        path: [{ name: 'userId', in: 'path', required: true, schema: createMockSchema('string') }],
        query: [],
        header: [],
        cookie: [],
      },
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);
    const inputSchema = asSchemaObject(result.inputSchema);

    expect(inputSchema).toBeDefined();
    expect(inputSchema['type']).toBe('object');
    expect(inputSchema['properties']).toHaveProperty('path');
  });

  test('builds input schema with query parameters', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      parametersByLocation: {
        path: [],
        query: [
          { name: 'search', in: 'query', required: false, schema: createMockSchema('string') },
        ],
        header: [],
        cookie: [],
      },
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);
    const inputSchema = asSchemaObject(result.inputSchema);

    expect(inputSchema['properties']).toHaveProperty('query');
  });

  test('builds input schema with request body', () => {
    const ir = createMockCastrDocument();
    const bodySchema = createMockSchema('object');
    const operation = createMockOperation({
      method: 'post',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: bodySchema },
        },
      },
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);
    const inputSchema = asSchemaObject(result.inputSchema);

    expect(inputSchema['properties']).toHaveProperty('body');
    expect(inputSchema['required']).toContain('body');
  });

  test('builds output schema from success response', () => {
    const ir = createMockCastrDocument();
    const responseSchema = createMockSchema('object');
    const operation = createMockOperation({
      responses: [
        {
          statusCode: '200',
          schema: responseSchema,
        },
      ],
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);

    expect(result.outputSchema).toBeDefined();
    const outputSchema = asSchemaObject(result.outputSchema);
    expect(outputSchema['type']).toBe('object');
  });

  test('returns undefined outputSchema when no success response', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      responses: [
        { statusCode: '400' }, // Error response only
      ],
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);

    expect(result.outputSchema).toBeUndefined();
  });

  test('inlines schema refs from IR components', () => {
    const addressProps = new CastrSchemaProperties({
      city: createMockSchema('string'),
    });
    const addressSchema = createSchemaComponent('Address', {
      type: 'object',
      properties: addressProps,
      metadata: createMockCastrSchemaNode(),
    });
    const ir = createMockCastrDocument({
      components: [addressSchema],
    });
    const operation = createMockOperation({
      responses: [
        {
          statusCode: '200',
          schema: {
            $ref: '#/definitions/Address',
            metadata: createMockCastrSchemaNode(),
          },
        },
      ],
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);

    // The ref should be inlined
    expect(result.outputSchema).toBeDefined();
    // The inlined schema should not have $ref at top level
    expect(result.outputSchema).not.toHaveProperty('$ref');
  });

  test('combines parameters and request body in input schema', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      method: 'post',
      parametersByLocation: {
        path: [{ name: 'id', in: 'path', required: true, schema: createMockSchema('string') }],
        query: [
          { name: 'filter', in: 'query', required: false, schema: createMockSchema('string') },
        ],
        header: [],
        cookie: [],
      },
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: createMockSchema('object') },
        },
      },
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);
    const inputSchema = asSchemaObject(result.inputSchema);

    expect(inputSchema['properties']).toHaveProperty('path');
    expect(inputSchema['properties']).toHaveProperty('query');
    expect(inputSchema['properties']).toHaveProperty('body');
    expect(inputSchema['required']).toContain('path');
    expect(inputSchema['required']).toContain('body');
  });
});
