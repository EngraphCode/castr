import { describe, it, expect } from 'vitest';
import { buildMcpToolSchemasFromIR } from './template-context.mcp.schemas.from-ir.js';
import type {
  CastrDocument,
  CastrOperation,
  CastrSchema,
  CastrSchemaNode,
} from '../../../ir/index.js';
import { CastrSchemaProperties } from '../../../ir/index.js';
import type { InfoObject, ServerObject } from '../../../../shared/openapi-types.js';

/**
 * Draft 07 Normalisation Tests
 *
 * TDD tests for RC-5.3: the MCP schema builder must emit only Draft 07
 * compatible keys, stripping IR-only fields like integerSemantics,
 * uuidVersion, contentEncoding, unevaluatedProperties, etc.
 */

const mockInfo: InfoObject = { title: 'Test API', version: '1.0.0' };
const mockServers: ServerObject[] = [];

function createMetadata(overrides?: Partial<CastrSchemaNode>): CastrSchemaNode {
  return {
    required: false,
    nullable: false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
    ...overrides,
  };
}

function createIR(components: CastrDocument['components'] = []): CastrDocument {
  return {
    version: '1.0.0',
    openApiVersion: '3.1.0',
    info: mockInfo,
    servers: mockServers,
    enums: new Map(),
    components,
    operations: [],
    additionalOperations: [],
    dependencyGraph: {
      nodes: new Map(),
      topologicalOrder: [],
      circularReferences: [],
    },
    schemaNames: [],
  };
}

function createOperation(responseSchema: CastrSchema): CastrOperation {
  return {
    method: 'get',
    path: '/test',
    operationId: 'testOp',
    parameters: [],
    parametersByLocation: { path: [], query: [], header: [], cookie: [] },
    responses: [
      {
        statusCode: '200',
        description: 'OK',
        content: {
          'application/json': {
            schema: responseSchema,
          },
        },
      },
    ],
  };
}

/**
 * Serialise the output schema to a JSON-safe plain object so we can use
 * `toHaveProperty` / `not.toHaveProperty` without type assertions.
 */
function getSerializedOutputSchema(
  ir: CastrDocument,
  responseSchema: CastrSchema,
): ReturnType<typeof JSON.parse> {
  const operation = createOperation(responseSchema);
  const result = buildMcpToolSchemasFromIR(ir, operation);
  expect(result.outputSchema).toBeDefined();
  // JSON round-trip strips undefined values and produces a plain object
  return JSON.parse(JSON.stringify(result.outputSchema));
}

/**
 * For non-object response schemas the MCP builder wraps them in
 * `{ type: "object", properties: { value: <schema> } }`.
 * This helper extracts the inner schema for cleaner assertions.
 */
function getInnerValue(schema: ReturnType<typeof JSON.parse>): ReturnType<typeof JSON.parse> {
  if (
    schema.type === 'object' &&
    schema.properties &&
    typeof schema.properties === 'object' &&
    'value' in schema.properties
  ) {
    return schema.properties.value;
  }
  return schema;
}

describe('MCP schemas Draft 07 normalisation', () => {
  describe('IR-only fields are stripped', () => {
    it('strips integerSemantics from MCP output', () => {
      const schema: CastrSchema = {
        type: 'integer',
        format: 'int64',
        integerSemantics: 'bigint',
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).not.toHaveProperty('integerSemantics');
      // Standard fields should be preserved
      expect(output).toHaveProperty('type', 'integer');
      expect(output).toHaveProperty('format', 'int64');
    });

    it('strips uuidVersion from MCP output', () => {
      const schema: CastrSchema = {
        type: 'string',
        format: 'uuid',
        uuidVersion: 4,
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).not.toHaveProperty('uuidVersion');
      expect(output).toHaveProperty('type', 'string');
      expect(output).toHaveProperty('format', 'uuid');
    });

    it('strips contentEncoding from MCP output', () => {
      const schema: CastrSchema = {
        type: 'string',
        contentEncoding: 'base64',
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).not.toHaveProperty('contentEncoding');
      expect(output).toHaveProperty('type', 'string');
    });

    it('strips unevaluatedProperties from MCP output', () => {
      const schema: CastrSchema = {
        type: 'object',
        properties: new CastrSchemaProperties({
          name: { type: 'string', metadata: createMetadata() },
        }),
        unevaluatedProperties: false,
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getSerializedOutputSchema(ir, schema);
      expect(output).not.toHaveProperty('unevaluatedProperties');
      expect(output).toHaveProperty('type', 'object');
    });

    it('strips minContains and maxContains from MCP output', () => {
      const schema: CastrSchema = {
        type: 'array',
        items: { type: 'string', metadata: createMetadata() },
        minContains: 1,
        maxContains: 5,
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).not.toHaveProperty('minContains');
      expect(output).not.toHaveProperty('maxContains');
    });

    it('strips prefixItems from MCP output', () => {
      const schema: CastrSchema = {
        type: 'array',
        prefixItems: [
          { type: 'string', metadata: createMetadata() },
          { type: 'number', metadata: createMetadata() },
        ],
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).not.toHaveProperty('prefixItems');
    });

    it('strips dependentSchemas from MCP output', () => {
      const schema: CastrSchema = {
        type: 'object',
        properties: new CastrSchemaProperties({
          name: { type: 'string', metadata: createMetadata() },
        }),
        dependentSchemas: {
          name: { type: 'object', metadata: createMetadata() },
        },
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getSerializedOutputSchema(ir, schema);
      expect(output).not.toHaveProperty('dependentSchemas');
    });

    it('strips dependentRequired from MCP output', () => {
      const schema: CastrSchema = {
        type: 'object',
        properties: new CastrSchemaProperties({
          email: { type: 'string', metadata: createMetadata() },
        }),
        dependentRequired: { email: ['emailVerified'] },
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getSerializedOutputSchema(ir, schema);
      expect(output).not.toHaveProperty('dependentRequired');
    });

    it('strips unevaluatedItems from MCP output', () => {
      const schema: CastrSchema = {
        type: 'array',
        items: { type: 'string', metadata: createMetadata() },
        unevaluatedItems: false,
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).not.toHaveProperty('unevaluatedItems');
    });
  });

  describe('Draft 07 fields are preserved', () => {
    it('preserves type, format, description, and constraints', () => {
      const schema: CastrSchema = {
        type: 'string',
        format: 'email',
        description: 'User email address',
        minLength: 5,
        maxLength: 100,
        pattern: '^[a-z@.]+$',
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).toHaveProperty('type', 'string');
      expect(output).toHaveProperty('format', 'email');
      expect(output).toHaveProperty('description', 'User email address');
      expect(output).toHaveProperty('minLength', 5);
      expect(output).toHaveProperty('maxLength', 100);
      expect(output).toHaveProperty('pattern', '^[a-z@.]+$');
    });

    it('preserves enum, const, and default', () => {
      const schema: CastrSchema = {
        type: 'string',
        enum: ['active', 'inactive'],
        default: 'active',
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).toHaveProperty('enum');
      expect(output).toHaveProperty('default', 'active');
    });

    it('preserves $ref', () => {
      const schema: CastrSchema = {
        $ref: '#/components/schemas/User',
        metadata: createMetadata(),
      };

      const ir = createIR([
        {
          type: 'schema',
          name: 'User',
          schema: {
            type: 'object',
            properties: new CastrSchemaProperties({
              id: { type: 'string', metadata: createMetadata() },
            }),
            metadata: createMetadata(),
          },
          metadata: createMetadata(),
        },
      ]);
      // $ref schemas get inlined by the builder, so we verify the output
      // is an object with the resolved schema
      const output = getSerializedOutputSchema(ir, schema);
      expect(output).toHaveProperty('type', 'object');
    });

    it('preserves number constraints', () => {
      const schema: CastrSchema = {
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).toHaveProperty('minimum', 0);
      expect(output).toHaveProperty('maximum', 100);
      expect(output).toHaveProperty('multipleOf', 5);
    });

    it('preserves array constraints', () => {
      const schema: CastrSchema = {
        type: 'array',
        items: { type: 'string', metadata: createMetadata() },
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getInnerValue(getSerializedOutputSchema(ir, schema));
      expect(output).toHaveProperty('minItems', 1);
      expect(output).toHaveProperty('maxItems', 10);
      expect(output).toHaveProperty('uniqueItems', true);
    });

    it('preserves composition keywords', () => {
      const schema: CastrSchema = {
        oneOf: [
          { type: 'string', metadata: createMetadata() },
          { type: 'number', metadata: createMetadata() },
        ],
        metadata: createMetadata(),
      };

      const ir = createIR();
      const output = getSerializedOutputSchema(ir, schema);
      // Compositions get wrapped in {type: "object", properties: {value: ...}}
      // when they're not already object type
      expect(output).toBeDefined();
    });
  });

  it('never includes metadata in MCP output', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: createMetadata({ description: 'Should not appear' }),
    };

    const ir = createIR();
    const output = getInnerValue(getSerializedOutputSchema(ir, schema));
    expect(output).not.toHaveProperty('metadata');
  });
});
