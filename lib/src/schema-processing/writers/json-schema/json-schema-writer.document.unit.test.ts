/**
 * Unit tests for JSON Schema document writer.
 *
 * Tests writeJsonSchemaDocument (standalone mode) and writeJsonSchemaBundle
 * (bundled $defs mode). Follows TDD — tests written first.
 */

import { describe, it, expect } from 'vitest';

import type { CastrSchema, CastrSchemaNode, CastrSchemaComponent } from '../../ir/index.js';
import { CastrSchemaProperties } from '../../ir/index.js';
import type { JsonSchemaNode } from '../shared/json-schema-fields.js';
import { writeJsonSchemaDocument, writeJsonSchemaBundle } from './json-schema-writer.document.js';

const JSON_SCHEMA_2020_12_DIALECT = 'https://json-schema.org/draft/2020-12/schema';

/**
 * Narrows `writeJsonSchemaDocument` output to the object branch of its
 * union, for tests asserting object-document shape. Boolean-document
 * behaviour has its own dedicated tests below.
 */
function writeDocumentAsObject(schema: CastrSchema): JsonSchemaNode {
  const result = writeJsonSchemaDocument(schema);
  if (typeof result === 'boolean') {
    throw new Error(`Expected an object document but got boolean: ${String(result)}`);
  }
  return result;
}

/**
 * Narrows a `$defs` member to its object branch, for tests asserting
 * object-shaped definitions.
 */
function defAsObject(member: JsonSchemaNode | boolean | undefined): JsonSchemaNode {
  if (member === undefined || typeof member === 'boolean') {
    throw new Error('Expected an object $defs member');
  }
  return member;
}

/**
 * Creates a minimal valid CastrSchemaNode for testing.
 */
function createMetadata(overrides: Partial<CastrSchemaNode> = {}): CastrSchemaNode {
  return {
    required: false,
    nullable: false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
    ...overrides,
  };
}

/**
 * Creates a minimal CastrSchema for testing.
 */
function createSchema(overrides: Partial<CastrSchema> = {}): CastrSchema {
  return {
    metadata: createMetadata(),
    ...overrides,
  };
}

/**
 * Creates a CastrSchemaComponent for testing.
 */
function createSchemaComponent(name: string, schema: CastrSchema): CastrSchemaComponent {
  return {
    type: 'schema',
    name,
    schema,
    metadata: createMetadata(),
  };
}

describe('writeJsonSchemaDocument', () => {
  it('adds $schema dialect URI to output', () => {
    const schema = createSchema({ type: 'string' });

    const result = writeDocumentAsObject(schema);

    expect(result.$schema).toBe(JSON_SCHEMA_2020_12_DIALECT);
  });

  it('includes all schema fields', () => {
    const schema = createSchema({
      type: 'object',
      properties: new CastrSchemaProperties({
        name: createSchema({ type: 'string' }),
      }),
      required: ['name'],
    });

    const result = writeDocumentAsObject(schema);

    expect(result.$schema).toBe(JSON_SCHEMA_2020_12_DIALECT);
    expect(result.type).toBe('object');
    expect(result.properties?.['name']).toEqual({ type: 'string' });
    expect(result.required).toEqual(['name']);
  });

  it('handles $ref schema with $schema', () => {
    const schema = createSchema({ $ref: '#/$defs/User' });

    const result = writeDocumentAsObject(schema);

    expect(result.$schema).toBe(JSON_SCHEMA_2020_12_DIALECT);
    expect(result.$ref).toBe('#/$defs/User');
  });

  it('rejects int64 semantics because JSON Schema 2020-12 has no native int64 type', () => {
    const schema = createSchema({
      type: 'integer',
      format: 'int64',
      integerSemantics: 'int64',
    });

    expect(() => writeJsonSchemaDocument(schema)).toThrow(
      /JSON Schema 2020-12 cannot represent signed 64-bit integer semantics natively/,
    );
  });

  it('rejects bigint semantics because JSON Schema 2020-12 has no native bigint type', () => {
    const schema = createSchema({
      type: 'integer',
      integerSemantics: 'bigint',
    });

    expect(() => writeJsonSchemaDocument(schema)).toThrow(
      /JSON Schema 2020-12 cannot represent arbitrary-precision bigint natively/,
    );
  });
});

describe('writeJsonSchemaBundle', () => {
  it('emits $schema at root level', () => {
    const components: CastrSchemaComponent[] = [];

    const result = writeJsonSchemaBundle(components);

    expect(result.$schema).toBe(JSON_SCHEMA_2020_12_DIALECT);
  });

  it('handles empty component list', () => {
    const components: CastrSchemaComponent[] = [];

    const result = writeJsonSchemaBundle(components);

    expect(result.$defs).toBeUndefined();
  });

  it('writes components under $defs', () => {
    const components: CastrSchemaComponent[] = [
      createSchemaComponent('User', createSchema({ type: 'object' })),
      createSchemaComponent('Address', createSchema({ type: 'object' })),
    ];

    const result = writeJsonSchemaBundle(components);

    expect(result.$defs).toBeDefined();
    expect(result.$defs?.['User']).toEqual({ type: 'object', additionalProperties: false });
    expect(result.$defs?.['Address']).toEqual({ type: 'object', additionalProperties: false });
  });

  it('sorts $defs entries by name for determinism', () => {
    const components: CastrSchemaComponent[] = [
      createSchemaComponent('Zebra', createSchema({ type: 'string' })),
      createSchemaComponent('Alpha', createSchema({ type: 'number' })),
      createSchemaComponent('Middle', createSchema({ type: 'boolean' })),
    ];

    const result = writeJsonSchemaBundle(components);

    const defKeys = Object.keys(result.$defs ?? {});
    expect(defKeys).toEqual(['Alpha', 'Middle', 'Zebra']);
  });

  it('produces deterministic output for identical input', () => {
    const components: CastrSchemaComponent[] = [
      createSchemaComponent('B', createSchema({ type: 'string' })),
      createSchemaComponent('A', createSchema({ type: 'number' })),
    ];

    const result1 = writeJsonSchemaBundle(components);
    const result2 = writeJsonSchemaBundle(components);

    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
  });

  it('recursively converts nested schemas', () => {
    const components: CastrSchemaComponent[] = [
      createSchemaComponent(
        'User',
        createSchema({
          type: 'object',
          properties: new CastrSchemaProperties({
            address: createSchema({ $ref: '#/$defs/Address' }),
          }),
        }),
      ),
      createSchemaComponent('Address', createSchema({ type: 'object' })),
    ];

    const result = writeJsonSchemaBundle(components);

    expect(defAsObject(result.$defs?.['User']).properties?.['address']).toEqual({
      $ref: '#/$defs/Address',
    });
  });
});

describe('boolean schemas at the document seam', () => {
  it('writes a boolean-schema document as the bare boolean', () => {
    const schema = createSchema({ booleanSchema: false });

    expect(writeJsonSchemaDocument(schema)).toBe(false);
  });

  it('writes a true boolean-schema document as bare true', () => {
    const schema = createSchema({ booleanSchema: true });

    expect(writeJsonSchemaDocument(schema)).toBe(true);
  });

  it('writes a boolean $defs member as the bare boolean', () => {
    const components: CastrSchemaComponent[] = [
      createSchemaComponent('Never', createSchema({ booleanSchema: false })),
      createSchemaComponent('Anything', createSchema({ booleanSchema: true })),
    ];

    const result = writeJsonSchemaBundle(components);

    expect(result.$defs?.['Never']).toBe(false);
    expect(result.$defs?.['Anything']).toBe(true);
  });
});
