import { describe, it, expect } from 'vitest';
import { serializeIR, deserializeIR } from './serialization.js';
import { CastrSchemaProperties } from './models/schema.js';
import { assertSchemaComponent, createMockRawOpenApiComponents } from './test-helpers.js';
import type { CastrDocument } from './models/schema-document.js';

describe('IR Serialization', () => {
  const mockIR: CastrDocument = {
    version: '1.0.0',
    openApiVersion: '3.1.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'A test API',
    },
    servers: [],
    components: [
      {
        type: 'schema',
        name: 'TestSchema',
        schema: {
          type: 'object',
          properties: new CastrSchemaProperties({
            prop1: {
              type: 'string',
              metadata: {
                required: true,
                nullable: false,
                zodChain: { presence: 'required', validations: [], defaults: [] },
                dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                circularReferences: [],
              },
            },
          }),
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: 'optional', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: 'optional', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
    ],
    operations: [
      {
        operationId: 'getTest',
        method: 'get',
        path: '/test',
        parameters: [],
        parametersByLocation: {
          query: [],
          path: [],
          header: [],
          cookie: [],
        },
        responses: [],
        tags: ['test'],
      },
    ],
    dependencyGraph: {
      nodes: new Map(),
      topologicalOrder: [],
      circularReferences: [],
    },
    schemaNames: [],
    enums: new Map(),
  };

  it('should serialize CastrDocument to string', () => {
    const serialized = serializeIR(mockIR);
    expect(typeof serialized).toBe('string');
    expect(serialized).toContain('"version": "1.0.0"');
    expect(serialized).toContain('"title": "Test API"');
  });

  it('should deserialize string to CastrDocument', () => {
    const serialized = serializeIR(mockIR);
    const deserialized = deserializeIR(serialized);
    expect(deserialized).toEqual(mockIR);
  });

  it('should handle undefined fields correctly', () => {
    const infoWithUndefinedDescription = { ...mockIR.info };
    Object.defineProperty(infoWithUndefinedDescription, 'description', {
      value: undefined,
      enumerable: true,
      writable: true,
      configurable: true,
    });

    const irWithUndefined: CastrDocument = {
      ...mockIR,
      info: infoWithUndefinedDescription,
    };
    const serialized = serializeIR(irWithUndefined);
    const deserialized = deserializeIR(serialized);

    // JSON.stringify removes undefined fields, so we expect the description to be missing
    expect(deserialized.info.description).toBeUndefined();

    // Create expected object by removing undefined field from mockIR
    const expected = { ...mockIR, info: { ...mockIR.info } };
    delete expected.info.description;

    expect(deserialized).toEqual(expected);
  });

  it('should handle complex nested structures', () => {
    const baseComponent = mockIR.components[0];
    const baseMetadata = assertSchemaComponent(baseComponent).metadata;

    const complexIR: CastrDocument = {
      ...mockIR,
      components: [
        {
          type: 'schema',
          name: 'Complex',
          schema: {
            allOf: [{ $ref: '#/components/schemas/Base', metadata: baseMetadata }],
            metadata: baseMetadata,
          },
          metadata: baseMetadata,
        },
      ],
    };

    const serialized = serializeIR(complexIR);
    const deserialized = deserializeIR(serialized);
    expect(deserialized).toEqual(complexIR);
  });

  it('should deserialize valid documents containing preserved raw OpenAPI components', () => {
    const rawComponentIR: CastrDocument = {
      ...mockIR,
      components: createMockRawOpenApiComponents(),
    };

    const deserialized = deserializeIR(serializeIR(rawComponentIR));

    expect(deserialized).toEqual(rawComponentIR);
  });

  it('should reject contradictory integer semantics during deserialization', () => {
    const invalidIR = {
      ...mockIR,
      components: [
        {
          type: 'schema',
          name: 'Signed64ButInt32',
          schema: {
            type: 'integer',
            format: 'int32',
            integerSemantics: 'int64',
            metadata: {
              required: false,
              nullable: false,
              zodChain: { presence: '', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: 'optional', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      ],
    };

    expect(() => deserializeIR(JSON.stringify(invalidIR))).toThrow(
      'Invalid CastrDocument structure',
    );
  });

  it('should reject contradictory integer semantics inside request body schemas during deserialization', () => {
    const invalidIR = {
      ...mockIR,
      operations: [
        {
          operationId: 'createTest',
          method: 'post',
          path: '/test',
          parameters: [],
          parametersByLocation: {
            query: [],
            path: [],
            header: [],
            cookie: [],
          },
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'integer',
                  format: 'int32',
                  integerSemantics: 'int64',
                  metadata: {
                    required: true,
                    nullable: false,
                    zodChain: { presence: '', validations: [], defaults: [] },
                    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                    circularReferences: [],
                  },
                },
              },
            },
          },
          responses: [],
        },
      ],
    };

    expect(() => deserializeIR(JSON.stringify(invalidIR))).toThrow(
      'Invalid CastrDocument structure',
    );
  });
});
