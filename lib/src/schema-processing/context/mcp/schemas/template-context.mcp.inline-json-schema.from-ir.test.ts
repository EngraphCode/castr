/**
 * Tests for IR-based JSON Schema ref inlining.
 *
 * These tests verify that `inlineJsonSchemaRefsFromIR` produces the same
 * output as `inlineJsonSchemaRefs`, but uses `CastrDocument.components`
 * instead of `OpenAPIObject.components.schemas`.
 *
 * @module template-context.mcp.inline-json-schema.from-ir.test
 */

import { describe, expect, test } from 'vitest';
import { createMockCastrDocument, createMockCastrSchemaNode } from '../../../ir/index.js';
import type { MutableJsonSchema } from '../../../conversion/json-schema/index.js';
import { inlineJsonSchemaRefsFromIR } from './template-context.mcp.inline-json-schema.js';
import type { CastrSchemaComponent } from '../../../ir/index.js';

/**
 * Create a mock schema component for the IR.
 */
function createSchemaComponent(name: string, schema: MutableJsonSchema): CastrSchemaComponent {
  return {
    type: 'schema',
    name,
    schema: {
      ...schema,
      metadata: createMockCastrSchemaNode(),
    },
    metadata: createMockCastrSchemaNode(),
  };
}

describe('inlineJsonSchemaRefsFromIR', () => {
  test('returns schema unchanged when no refs present', () => {
    const ir = createMockCastrDocument();
    const schema: MutableJsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const result = inlineJsonSchemaRefsFromIR(schema, ir);

    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    });
  });

  test('inlines #/definitions/ refs from IR components', () => {
    const ir = createMockCastrDocument({
      components: [
        createSchemaComponent('Address', {
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
        }),
      ],
    });

    const schema: MutableJsonSchema = {
      type: 'object',
      properties: {
        address: { $ref: '#/definitions/Address' },
      },
    };

    const result = inlineJsonSchemaRefsFromIR(schema, ir);

    expect(result).toEqual({
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
        },
      },
    });
  });

  test('preserves non-definitions refs unchanged', () => {
    const ir = createMockCastrDocument();
    const schema: MutableJsonSchema = {
      type: 'object',
      properties: {
        external: { $ref: 'https://example.com/schema.json' },
      },
    };

    const result = inlineJsonSchemaRefsFromIR(schema, ir);

    expect(result).toEqual({
      type: 'object',
      properties: {
        external: { $ref: 'https://example.com/schema.json' },
      },
    });
  });

  test('handles circular refs by preserving them', () => {
    // Create a self-referencing schema
    const ir = createMockCastrDocument({
      components: [
        createSchemaComponent('Node', {
          type: 'object',
          properties: {
            children: {
              type: 'array',
              items: { $ref: '#/definitions/Node' },
            },
          },
        }),
      ],
    });

    const schema: MutableJsonSchema = {
      $ref: '#/definitions/Node',
    };

    const result = inlineJsonSchemaRefsFromIR(schema, ir);

    // Should inline the Node schema, but preserve the circular ref
    expect(result).toMatchObject({
      type: 'object',
      properties: {
        children: {
          type: 'array',
          items: { $ref: '#/definitions/Node' },
        },
      },
    });
  });

  test('throws error when internal definition not found in IR', () => {
    const ir = createMockCastrDocument({
      components: [], // Empty - no schemas
    });

    const schema: MutableJsonSchema = {
      type: 'object',
      properties: {
        missing: { $ref: '#/definitions/NonExistent' },
      },
    };

    // Strictness: should throw error for unresolved internal refs
    expect(() => inlineJsonSchemaRefsFromIR(schema, ir)).toThrow(
      /Unresolvable schema reference.*NonExistent.*does not exist/,
    );
  });

  test('throws error when internal hash reference syntax is invalid', () => {
    const ir = createMockCastrDocument();
    const schema: MutableJsonSchema = {
      type: 'object',
      properties: {
        malformed: { $ref: '#/components/schemas/' },
      },
    };

    expect(() => inlineJsonSchemaRefsFromIR(schema, ir)).toThrow(
      /Invalid schema reference.*Expected format/,
    );
  });

  test('throws error when internal hash reference points to non-schema components', () => {
    const ir = createMockCastrDocument();
    const schema: MutableJsonSchema = {
      type: 'object',
      properties: {
        wrongType: { $ref: '#/components/parameters/UserId' },
      },
    };

    expect(() => inlineJsonSchemaRefsFromIR(schema, ir)).toThrow(
      /Unsupported schema reference.*Expected #\/components\/schemas\/\{name\}/,
    );
  });

  test('caches resolved refs to avoid redundant processing', () => {
    const ir = createMockCastrDocument({
      components: [
        createSchemaComponent('Shared', {
          type: 'string',
          format: 'uuid',
        }),
      ],
    });

    const schema: MutableJsonSchema = {
      type: 'object',
      properties: {
        id1: { $ref: '#/definitions/Shared' },
        id2: { $ref: '#/definitions/Shared' },
      },
    };

    const result = inlineJsonSchemaRefsFromIR(schema, ir);

    // Both refs should be inlined to the same structure
    expect(result).toEqual({
      type: 'object',
      properties: {
        id1: { type: 'string', format: 'uuid' },
        id2: { type: 'string', format: 'uuid' },
      },
    });
  });

  test('strips definitions keyword from output', () => {
    const ir = createMockCastrDocument();
    const schema: MutableJsonSchema = {
      type: 'object',
      definitions: {
        ShouldBeRemoved: { type: 'string' },
      },
      properties: {
        name: { type: 'string' },
      },
    };

    const result = inlineJsonSchemaRefsFromIR(schema, ir);

    expect(result).not.toHaveProperty('definitions');
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    });
  });
});
