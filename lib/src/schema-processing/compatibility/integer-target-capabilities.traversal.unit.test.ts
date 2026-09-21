import { describe, expect, it } from 'vitest';
import { createMockCastrSchema } from '../ir/index.js';
import type { CastrSchema } from '../ir/index.js';
import { visitSchemaChildren } from './integer-target-capabilities.traversal.js';

function leaf(marker: string): CastrSchema {
  return createMockCastrSchema({ $ref: `#/components/schemas/${marker}` });
}

describe('visitSchemaChildren', () => {
  it('reaches every keyword position that carries a schema', () => {
    const schema = createMockCastrSchema({
      type: 'object',
      patternProperties: { '^x-': leaf('pattern') },
      contains: leaf('contains'),
      propertyNames: leaf('propertyNames'),
      if: leaf('if'),
      then: leaf('then'),
      else: leaf('else'),
      dependentSchemas: { a: leaf('dependent') },
      not: leaf('not'),
      additionalProperties: leaf('additional'),
      unevaluatedProperties: leaf('unevaluated'),
      unevaluatedItems: leaf('unevaluatedItems'),
      items: leaf('items'),
      prefixItems: [leaf('prefix')],
      allOf: [leaf('allOf')],
      oneOf: [leaf('oneOf')],
      anyOf: [leaf('anyOf')],
    });

    const reached: string[] = [];
    visitSchemaChildren(schema, new Set(), (child) => {
      reached.push(child.$ref ?? '');
    });

    expect(reached.sort()).toEqual(
      [
        'pattern',
        'contains',
        'propertyNames',
        'if',
        'then',
        'else',
        'dependent',
        'not',
        'additional',
        'unevaluated',
        'unevaluatedItems',
        'items',
        'prefix',
        'allOf',
        'oneOf',
        'anyOf',
      ]
        .map((marker) => `#/components/schemas/${marker}`)
        .sort(),
    );
  });
});
