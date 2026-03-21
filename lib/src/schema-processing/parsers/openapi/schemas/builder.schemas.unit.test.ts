import { describe, test, expect } from 'vitest';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { buildComponentSchema } from './builder.schemas.js';

describe('buildComponentSchema', () => {
  test('buildComponentSchema returns component context', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: { id: { type: 'string' } },
    };
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const result = buildComponentSchema('User', schema, doc);

    expect(result.contextType).toBe('component');
    expect(result.name).toBe('User');
    expect(result.schema).toBeDefined();
    // Component schemas should NEVER be optional
    expect(result.metadata.zodChain.presence).toBe('');
  });
});
