import type { SchemaCase } from './schema-case.js';

const STRING = { type: 'string' };
const NUMBER = { type: 'number' };

/** An object that states every key it allows, so a case never leans on a default. */
function closed(properties: object, extra: object = {}): object {
  return { type: 'object', properties, additionalProperties: false, ...extra };
}

function keyword(name: string, schema: unknown, samples: readonly unknown[]): SchemaCase {
  return { rowId: `keyword:${name}`, schema, samples };
}

function typeValue(name: string, samples: readonly unknown[]): SchemaCase {
  return { rowId: `type:${name}`, schema: { type: name }, samples };
}

function format(name: string, ...samples: readonly string[]): SchemaCase {
  return {
    rowId: `text:format: ${name}`,
    schema: { type: 'string', format: name },
    samples,
  };
}

/**
 * One case for each row of a schema whose construct decides which values are accepted.
 * Every case holds a value its construct accepts and one it refuses.
 */
export const SCHEMA_CASES: readonly SchemaCase[] = [
  // The values of `type`.
  typeValue('string', ['a', 1, null]),
  typeValue('number', [1.5, 1, 'a']),
  typeValue('integer', [1, 1.5, 'a']),
  typeValue('boolean', [true, 'true', 0]),
  typeValue('null', [null, 0, '']),
  typeValue('array', [[], [1, 'a'], {}]),
  { rowId: 'type:object', schema: closed({ a: STRING }), samples: [{}, { a: 'x' }, [], 'a'] },

  // Validation.
  keyword('type', { type: 'boolean' }, [false, 'false']),
  keyword('const', { const: 'a' }, ['a', 'b', 1]),
  keyword('enum', { enum: ['a', 1, null, true] }, ['a', 1, null, true, 'b', 2, false]),
  keyword('multipleOf', { type: 'number', multipleOf: 0.5 }, [1.5, 2, 1.25]),
  keyword('maximum', { type: 'number', maximum: 3 }, [3, 2.9, 3.1]),
  keyword('exclusiveMaximum', { type: 'number', exclusiveMaximum: 3 }, [2.9, 3]),
  keyword('minimum', { type: 'number', minimum: 3 }, [3, 3.1, 2.9]),
  keyword('exclusiveMinimum', { type: 'number', exclusiveMinimum: 3 }, [3.1, 3]),
  keyword('maxLength', { type: 'string', maxLength: 2 }, ['ab', 'abc', '😀😀', '😀😀😀']),
  keyword('minLength', { type: 'string', minLength: 2 }, ['ab', 'a', '😀😀', '😀']),
  keyword('pattern', { type: 'string', pattern: '^a+$' }, ['aa', 'ab', '']),
  keyword('maxItems', { type: 'array', maxItems: 1 }, [[], [1], [1, 2]]),
  keyword('minItems', { type: 'array', minItems: 1 }, [[1], []]),
  keyword('uniqueItems', { type: 'array', uniqueItems: true }, [
    [1, 2],
    [1, 1],
    [{ a: 1 }, { a: 1 }],
    [1, '1'],
  ]),
  keyword('maxContains', { type: 'array', contains: NUMBER, maxContains: 2 }, [
    ['a', 1],
    [1, 2],
    [1, 2, 3],
  ]),
  keyword('minContains', { type: 'array', contains: NUMBER, minContains: 2 }, [
    [1, 2],
    ['a', 1],
  ]),
  keyword('maxProperties', closed({ a: NUMBER, b: NUMBER }, { maxProperties: 1 }), [
    {},
    { a: 1 },
    { a: 1, b: 2 },
  ]),
  keyword('minProperties', closed({ a: NUMBER, b: NUMBER }, { minProperties: 1 }), [{ a: 1 }, {}]),
  keyword('required', closed({ a: STRING }, { required: ['a'] }), [{ a: 'x' }, {}]),
  keyword(
    'dependentRequired',
    closed({ a: STRING, b: STRING }, { dependentRequired: { a: ['b'] } }),
    [{ a: 'x', b: 'y' }, { b: 'y' }, {}, { a: 'x' }],
  ),

  // Applicators.
  keyword('properties', closed({ a: STRING }), [{ a: 'x' }, {}, { a: 1 }]),
  keyword(
    'additionalProperties',
    { type: 'object', properties: { a: STRING }, additionalProperties: NUMBER },
    [{ a: 'x' }, { a: 'x', b: 1 }, { a: 'x', b: 'y' }],
  ),
  keyword(
    'patternProperties',
    { type: 'object', patternProperties: { '^n_': NUMBER }, additionalProperties: false },
    [{}, { n_a: 1 }, { n_a: 'x' }, { other: 1 }],
  ),
  keyword(
    'propertyNames',
    closed({ ab: NUMBER, A1: NUMBER }, { propertyNames: { pattern: '^[a-z]+$' } }),
    [{}, { ab: 1 }, { A1: 1 }],
  ),
  keyword('items', { type: 'array', items: STRING }, [[], ['a'], ['a', 1]]),
  keyword('prefixItems', { type: 'array', prefixItems: [STRING, NUMBER] }, [
    ['a', 1],
    ['a'],
    ['a', 1, true],
    [1, 'a'],
  ]),
  keyword('contains', { type: 'array', contains: NUMBER }, [['a', 1], [1], ['a'], []]),
  keyword(
    'dependentSchemas',
    closed({ a: STRING, b: {} }, { dependentSchemas: { a: { properties: { b: NUMBER } } } }),
    [{ a: 'x', b: 1 }, { b: 'y' }, { a: 'x', b: 'y' }],
  ),
  keyword(
    'if',
    { type: 'number', if: { minimum: 10 }, then: { multipleOf: 10 }, else: { multipleOf: 1 } },
    [20, 5, 15, 5.5],
  ),
  keyword('then', { type: 'number', if: { minimum: 10 }, then: { multipleOf: 10 } }, [20, 5.5, 15]),
  keyword('else', { type: 'number', if: { minimum: 10 }, else: { multipleOf: 1 } }, [15.5, 5, 5.5]),
  keyword(
    'allOf',
    {
      allOf: [
        { type: 'string', minLength: 2 },
        { type: 'string', maxLength: 3 },
      ],
    },
    ['ab', 'abc', 'a', 'abcd'],
  ),
  keyword('anyOf', { anyOf: [STRING, NUMBER] }, ['a', 1, true]),
  keyword(
    'oneOf',
    {
      oneOf: [
        { type: 'number', multipleOf: 2 },
        { type: 'number', multipleOf: 3 },
      ],
    },
    [2, 3, 6, 5],
  ),
  keyword('not', { not: STRING }, [1, null, 'a']),

  // Unevaluated.
  keyword('unevaluatedItems', { type: 'array', prefixItems: [STRING], unevaluatedItems: false }, [
    ['a'],
    [],
    ['a', 1],
  ]),
  keyword(
    'unevaluatedProperties',
    {
      type: 'object',
      allOf: [{ properties: { a: STRING } }],
      properties: { b: NUMBER },
      unevaluatedProperties: false,
    },
    [{ a: 'x', b: 1 }, {}, { a: 'x', c: 1 }],
  ),

  // Core.
  {
    rowId: 'keyword:$ref',
    schema: { $ref: '#/components/schemas/Named' },
    components: { Named: { type: 'string', minLength: 2 } },
    samples: ['ab', 'a', 1],
  },
  // The outer schema overrides the tree's `node` anchor and closes every node. A reader
  // that treats `$dynamicRef` as `$ref` leaves the nested node open, so the third sample
  // tells the two apart.
  keyword(
    '$dynamicRef',
    {
      $id: 'https://castr.invalid/strict-tree',
      $dynamicAnchor: 'node',
      $ref: 'tree',
      unevaluatedProperties: false,
      $defs: {
        tree: {
          $id: 'tree',
          $dynamicAnchor: 'node',
          type: 'object',
          properties: { value: NUMBER, next: { $dynamicRef: '#node' } },
        },
      },
    },
    [
      { value: 1 },
      { value: 1, next: { value: 2 } },
      { value: 1, next: { value: 2, extra: 1 } },
      { value: 1, next: { value: 'x' } },
    ],
  ),

  // `format`.
  keyword('format', { type: 'string', format: 'date' }, ['2026-11-20', '20/11/2026']),
  format('date-time', '2026-11-20T09:00:00+01:00', 'yesterday'),
  format('date', '2026-11-20', '20/11/2026'),
  format('time', '09:00:00Z', '9am'),
  format('duration', 'P1D', 'one day'),
  // RFC 5321 allows `!` in the local part; a check narrower than the format refuses it.
  format('email', 'a@example.com', 'a!b@example.com', 'not an email'),
  format('idn-email', 'a@example.com', 'not an email'),
  format('hostname', 'example.com', 'not a host!'),
  format('idn-hostname', 'example.com', 'not a host!'),
  format('ipv4', '127.0.0.1', '999.1.1.1'),
  format('ipv6', '::1', 'zz::1'),
  format('uri', 'https://example.com/a', 'not a uri'),
  format('uri-reference', '/a/b', String.raw`not a uri \ ^`),
  format('iri', 'https://example.com/ä', 'not an iri'),
  format('iri-reference', '/ä/b', String.raw`not an iri \ ^`),
  format('uuid', '123e4567-e89b-12d3-a456-426614174000', 'not-a-uuid'),
  format('uri-template', '/a/{b}', '/a/{b'),
  format('json-pointer', '/a/b', 'a/b'),
  format('relative-json-pointer', '1/a', '/a'),
  format('regex', '^a+$', '(('),
  {
    rowId: 'text:format: int32',
    schema: { type: 'integer', format: 'int32' },
    samples: [1, 2147483647, 2147483648, 1.5],
  },
  {
    rowId: 'text:format: int64',
    schema: { type: 'integer', format: 'int64' },
    samples: [1, 9007199254740991, 1.5, 'a'],
  },
  {
    rowId: 'text:format: float',
    schema: { type: 'number', format: 'float' },
    samples: [1.5, 1, 'a'],
  },
  {
    rowId: 'text:format: double',
    schema: { type: 'number', format: 'double' },
    samples: [1.5, 1, 'a'],
  },

  // Schema constructs that are not a keyword of their own.
  { rowId: 'text:`true` as a schema', schema: true, samples: [1, 'a', null, {}] },
  {
    rowId: 'text:`false` as a schema',
    schema: closed({ never: false, free: true }),
    samples: [{}, { free: 1 }, { never: 1 }],
  },
  {
    rowId: 'text:a list of types (`type: [..]`)',
    schema: { type: ['string', 'null'] },
    samples: ['a', null, 1],
  },
  {
    rowId: 'text:`const` or an `enum` member that is an object or array',
    schema: { enum: [{ a: 1 }, [1, 2]] },
    samples: [{ a: 1 }, [1, 2], { a: 2 }, { a: 1, b: 2 }, [2, 1]],
  },
];
