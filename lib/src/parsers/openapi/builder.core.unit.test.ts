import { describe, test, expect } from 'vitest';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { buildPropertySchema, buildCompositionMember } from './builder.core.js';
import type { IRBuildContext } from './builder.types.js';

describe('buildPropertySchema', () => {
  test('buildPropertySchema creates property context with correct optionality', () => {
    const schema: SchemaObject = { type: 'string' };
    const parentRequired = ['id', 'name']; // 'email' is NOT in this list
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const context: IRBuildContext = {
      doc,
      path: [],
      required: false,
    };

    const result = buildPropertySchema('email', schema, parentRequired, context);

    expect(result.contextType).toBe('property');
    expect(result.name).toBe('email');
    expect(result.optional).toBe(true); // Not in required array
  });

  test('buildPropertySchema creates required property context', () => {
    const schema: SchemaObject = { type: 'string' };
    const parentRequired = ['id', 'email']; // 'email' IS in this list
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const context: IRBuildContext = {
      doc,
      path: [],
      required: false,
    };

    const result = buildPropertySchema('email', schema, parentRequired, context);

    expect(result.contextType).toBe('property');
    expect(result.name).toBe('email');
    expect(result.optional).toBe(false); // In required array
  });
});

describe('buildCompositionMember', () => {
  test('buildCompositionMember creates context without .optional()', () => {
    const memberSchema: SchemaObject = { type: 'string' };
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const context: IRBuildContext = {
      doc,
      path: [],
      required: false,
    };

    const result = buildCompositionMember(memberSchema, 'oneOf', 0, context);

    expect(result.contextType).toBe('compositionMember');
    expect(result.compositionType).toBe('oneOf');
    expect(result.schema.metadata.zodChain.presence).toBe(''); // NEVER .optional()
  });
});
