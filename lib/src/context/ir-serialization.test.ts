import { describe, it, expect } from 'vitest';
import type { IRDocument } from './ir-schema.js';
import { serializeIR, deserializeIR } from './ir-serialization.js';
import { IRSchemaProperties } from './ir-schema.js';
import { assertSchemaComponent } from './ir-test-helpers.js';

describe('IR Serialization', () => {
  const mockIR: IRDocument = {
    version: '1.0.0',
    openApiVersion: '3.1.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'A test API',
    },
    components: [
      {
        type: 'schema',
        name: 'TestSchema',
        schema: {
          type: 'object',
          properties: new IRSchemaProperties({
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
    enums: new Map(),
  };

  it('should serialize IRDocument to string', () => {
    const serialized = serializeIR(mockIR);
    expect(typeof serialized).toBe('string');
    expect(serialized).toContain('"version": "1.0.0"');
    expect(serialized).toContain('"title": "Test API"');
  });

  it('should deserialize string to IRDocument', () => {
    const serialized = serializeIR(mockIR);
    const deserialized = deserializeIR(serialized);
    expect(deserialized).toEqual(mockIR);
  });

  it('should handle undefined fields correctly', () => {
    const irWithUndefined: IRDocument = {
      ...mockIR,
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: undefined as unknown as string,
      },
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

    const complexIR: IRDocument = {
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
});
