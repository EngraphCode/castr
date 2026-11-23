import { describe, expect, it } from 'vitest';

import type { ComponentsObject, SchemaObject } from '../../../shared/openapi-types.js';
import { assertSchemaComponent } from '../../ir/index.js';

import { buildCastrSchemas } from './index.js';

function read(schema: SchemaObject): ReturnType<typeof assertSchemaComponent>['schema'] {
  const components: ComponentsObject = { schemas: { Subject: schema } };
  return assertSchemaComponent(buildCastrSchemas(components)[0]).schema;
}

describe('the OpenAPI reader and const', () => {
  it.each([
    ['a string', 'all-years'],
    ['a number', 1.5],
    ['a boolean', false],
    ['null', null],
  ])('reads a const that is %s and stands with no type', (_name, value) => {
    expect(read({ const: value }).const).toBe(value);
  });

  it.each([
    ['string', 'a'],
    ['number', 1.5],
    ['integer', 2],
    ['number', 2],
    ['boolean', true],
    ['null', null],
  ] as const)('reads a const beside type %s that admits it', (type, value) => {
    const schema = read({ type, const: value });

    expect(schema.const).toBe(value);
    expect(schema.type).toBe(type);
  });

  it('reads a const beside words about the schema', () => {
    const schema = read({ type: 'string', const: 'a', description: 'the kind', title: 'Kind' });

    expect(schema.const).toBe('a');
    expect(schema.description).toBe('the kind');
  });

  const refused: readonly (readonly [string, SchemaObject, RegExp])[] = [
    ['a type that refuses the value', { type: 'number', const: 'a' }, /const.*type/],
    ['type integer and a fraction', { type: 'integer', const: 1.5 }, /const.*type/],
    ['a list of types', { type: ['string', 'null'], const: 'a' }, /const.*type/],
    ['a keyword that also decides', { type: 'string', const: 'a', minLength: 2 }, /minLength/],
    ['an enum', { const: 'a', enum: ['a', 'b'] }, /enum/],
    ['a format', { type: 'string', const: 'a', format: 'uri' }, /format/],
    ['an object value', { const: { a: 1 } }, /const.*object or an array/],
    ['an array value', { const: [1] }, /const.*object or an array/],
  ];

  it.each(refused)('refuses a const with %s', (_name, schema, message) => {
    expect(() => read(schema)).toThrow(message);
  });
});
