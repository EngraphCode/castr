import { describe, test, expect } from 'vitest';
import type { OpenAPIDocument, SchemaObject } from '../../../../shared/openapi-types.js';
import { buildComponentSchema } from './builder.schemas.js';

describe('buildComponentSchema', () => {
  test('buildComponentSchema returns component context', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: { id: { type: 'string' } },
    };
    const doc: OpenAPIDocument = {
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

  test('keeps the wire name of a component whose name is not a valid identifier', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    expect(
      buildComponentSchema('1Name-With-Special---Characters', { type: 'string' }, doc).name,
    ).toBe('1Name-With-Special---Characters');
    expect(buildComponentSchema('class', { type: 'string' }, doc).name).toBe('class');
    expect(buildComponentSchema('Basic.Thing', { type: 'string' }, doc).name).toBe('Basic.Thing');
  });
});
