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
import type { Schema as JsonSchema } from 'ajv';
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
function createMockSchema(type: CastrSchema['type'] = 'object'): CastrSchema {
  return {
    type,
    metadata: createMockCastrSchemaNode(),
  };
}

function createCrossRealmLikeProperties(properties: Record<string, CastrSchema>): unknown {
  const live = new CastrSchemaProperties(properties);
  const crossRealmLike = {
    get: live.get.bind(live),
    has: live.has.bind(live),
    entries: live.entries.bind(live),
  };

  Object.defineProperty(crossRealmLike, Symbol.for('@engraph/castr/CastrSchemaProperties'), {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return crossRealmLike;
}

function assignSchemaProperties(schema: CastrSchema, properties: unknown): void {
  Reflect.set(schema, 'properties', properties);
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
    parameters: [],
    parametersByLocation: {
      path: [],
      query: [],
      header: [],
      cookie: [],
    },
    responses: [],
    security: [],
    ...overrides,
  };
}

/**
 * Type guard for JsonSchema that is an object (not boolean).
 */
function assertSchemaObject(schema: JsonSchema | undefined): asserts schema is MutableJsonSchema {
  if (schema === undefined) {
    throw new Error('Expected schema object, got undefined');
  }
  if (typeof schema === 'boolean') {
    throw new Error('Expected schema object, got boolean');
  }
}

describe('buildMcpToolSchemasFromIR', () => {
  test('emits a strict empty object input schema for parameterless operations', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation();

    const result = buildMcpToolSchemasFromIR(ir, operation);
    const inputSchema = result.inputSchema;
    assertSchemaObject(inputSchema);

    expect(inputSchema).toEqual({
      type: 'object',
      additionalProperties: false,
    });
  });

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
    const inputSchema = result.inputSchema;
    assertSchemaObject(inputSchema);

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
    const inputSchema = result.inputSchema;
    assertSchemaObject(inputSchema);

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
    const inputSchema = result.inputSchema;
    assertSchemaObject(inputSchema);

    expect(inputSchema['properties']).toHaveProperty('body');
    expect(inputSchema['required']).toContain('body');
  });

  test('fails fast when MCP schema generation encounters itemSchema', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      method: 'post',
      requestBody: {
        required: true,
        content: {
          'application/x-ndjson': {
            schema: createMockSchema('array'),
            itemSchema: createMockSchema('string'),
          },
        },
      },
    });

    expect(() => buildMcpToolSchemasFromIR(ir, operation)).toThrow(/itemSchema/i);
  });

  test('fails fast when MCP schema generation encounters itemSchema in responses', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      responses: [
        {
          statusCode: '200',
          content: {
            'application/x-ndjson': {
              schema: createMockSchema('array'),
              itemSchema: createMockSchema('string'),
            },
          },
        },
      ],
    });

    expect(() => buildMcpToolSchemasFromIR(ir, operation)).toThrow(/itemSchema/i);
  });

  test('fails fast when MCP schema generation encounters itemSchema in parameter content', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      parameters: [
        {
          name: 'stream-filter',
          in: 'query',
          required: false,
          schema: createMockSchema('object'),
          content: {
            'application/x-ndjson': {
              itemSchema: createMockSchema('string'),
            },
          },
        },
      ],
      parametersByLocation: {
        path: [],
        query: [
          {
            name: 'stream-filter',
            in: 'query',
            required: false,
            schema: createMockSchema('object'),
            content: {
              'application/x-ndjson': {
                itemSchema: createMockSchema('string'),
              },
            },
          },
        ],
        header: [],
        cookie: [],
      },
    });

    expect(() => buildMcpToolSchemasFromIR(ir, operation)).toThrow(/itemSchema/i);
  });

  test('fails fast when MCP schema generation encounters itemSchema in response headers', () => {
    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      responses: [
        {
          statusCode: '200',
          headers: {
            'X-Stream-Acks': {
              schema: createMockSchema('object'),
              content: {
                'application/x-ndjson': {
                  itemSchema: createMockSchema('string'),
                },
              },
            },
          },
        },
      ],
    });

    expect(() => buildMcpToolSchemasFromIR(ir, operation)).toThrow(/itemSchema/i);
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
    const outputSchema = result.outputSchema;
    assertSchemaObject(outputSchema);
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

  test('accepts cross-realm-like CastrSchemaProperties when converting IR object schemas', () => {
    const outputSchema = createMockSchema('object');
    assignSchemaProperties(
      outputSchema,
      createCrossRealmLikeProperties({
        city: createMockSchema('string'),
      }),
    );

    const ir = createMockCastrDocument();
    const operation = createMockOperation({
      responses: [
        {
          statusCode: '200',
          schema: outputSchema,
        },
      ],
    });

    const result = buildMcpToolSchemasFromIR(ir, operation);
    assertSchemaObject(result.outputSchema);

    expect(result.outputSchema['properties']).toHaveProperty('city');
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
    const inputSchema = result.inputSchema;
    assertSchemaObject(inputSchema);

    expect(inputSchema['properties']).toHaveProperty('path');
    expect(inputSchema['properties']).toHaveProperty('query');
    expect(inputSchema['properties']).toHaveProperty('body');
    expect(inputSchema['required']).toContain('path');
    expect(inputSchema['required']).toContain('body');
  });
});
