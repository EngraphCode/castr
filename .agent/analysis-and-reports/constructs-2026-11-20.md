# Construct coverage: what a schema may say, and what today's Castr does with it, 20 November 2026

The owner, 20 November 2026: "What I want is to not have to rework Castr if Oak adds an
additional, valid field type to their spec". This report tries the keywords OpenAPI 3.1
allows in a schema (the JSON Schema 2020-12 vocabularies, the common formats, and OpenAPI's
own additions) against today's generator. It decides nothing.

## What ran

- **Generator:** `@engraph/castr`, `lib/dist/cli/index.js`, built from `main` at
  `SHA:58ecaabd`, with no options.
- **Method:** one construct per case. Each case is a minimal OpenAPI 3.1.0 document with one
  operation and one component schema that uses the construct. The generator ran on it and
  the emitted Zod schema was loaded under Zod 4.6.7.
- **Judge:** Ajv 8.20.0 (JSON Schema 2020-12, `ajv-formats` asserting) read the same
  schema and decided each sample value. A cell is **right** when Castr's validator and Ajv
  agree on every sample, **wrong** when they disagree on one, and **crashed** when the
  generator exited with a stack trace.

## Limits

- **It is a first list, not the whole surface.** `$vocabulary` is left out because it has
  meaning only in a meta-schema. Formats are the ones `ajv-formats` can judge; `idn-email`,
  `idn-hostname`, `iri` and `iri-reference` are not tried. A case added later changes the
  counts.
- **A few samples per construct,** so "right" means no disagreement was found, not proof.
  Review of this report moved several rows from right to wrong by adding one sample, so
  the wrong count is a floor. The repeatable command that follows this probe samples each
  construct far more widely and replaces these counts.
- **One construct at a time.** Each case uses only constructs measured right elsewhere in
  this report beside the one it names. Four cases cannot be built that way
  (`minContains` needs `contains`; `unevaluatedProperties`, an `allOf` of objects with
  different properties and the property counts on an open object need open objects); they are marked **not measurable alone** and are not counted as wrong or
  crashed. Combinations are not tried.
- **Validators only.** The TypeScript types and the endpoint definitions were not judged.
  A keyword that does not change which values are valid (annotations, content keywords,
  `discriminator`, `xml`, `externalDocs`) cannot be judged by comparing decisions, so its
  row says **not judged**: the generator did not fail on it, and nothing more is known.
- **Objects state their unknown-key policy,** so SPEC-P-1's reading of an unstated policy
  does not enter.

## Result

94 constructs: 44 right, 14 wrong, 19 crashed, 4 that cannot be measured alone because
they need a construct that fails, and 13 not judged because the keyword does not change which
values are valid. No construct was refused in plain words: every refusal is
a stack trace.

### Validation keywords

| Construct                                         | Today                | What happened                                                                    |
| ------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `type: string`                                    | right                |                                                                                  |
| `type: number`                                    | right                |                                                                                  |
| `type: integer`                                   | right                |                                                                                  |
| `type: boolean`                                   | right                |                                                                                  |
| `type: null`                                      | right                |                                                                                  |
| `type: array`                                     | right                |                                                                                  |
| `type: object`                                    | right                |                                                                                  |
| `type (list of types)`                            | right                |                                                                                  |
| `no type (any value)`                             | right                |                                                                                  |
| `enum (strings)`                                  | right                |                                                                                  |
| `enum (mixed types)`                              | right                |                                                                                  |
| `const (string)`                                  | wrong                | "b": source says invalid, Castr says valid. Emitted `z.unknown()`                |
| `const (number)`                                  | wrong                | 4: source says invalid, Castr says valid. Emitted `z.unknown()`                  |
| `const (object)`                                  | wrong                | {"a":2}: source says invalid, Castr says valid. Emitted `z.unknown()`            |
| `multipleOf`                                      | right                |                                                                                  |
| `maximum`                                         | right                |                                                                                  |
| `exclusiveMaximum`                                | right                |                                                                                  |
| `minimum`                                         | right                |                                                                                  |
| `exclusiveMinimum`                                | right                |                                                                                  |
| `maxLength`                                       | right                |                                                                                  |
| `minLength`                                       | right                |                                                                                  |
| `pattern`                                         | right                |                                                                                  |
| `maxItems`                                        | right                |                                                                                  |
| `minItems`                                        | right                |                                                                                  |
| `uniqueItems`                                     | wrong                | [1,1]: source says invalid, Castr says valid. Emitted `z.array(z.unknown())`     |
| `maxProperties`                                   | wrong                | {"a":1,"b":2}: source says invalid, Castr says valid. Emitted `z.strictObject({` |
| `minProperties`                                   | wrong                | {}: source says invalid, Castr says valid. Emitted `z.strictObject({`            |
| `maxProperties / minProperties on an open object` | not measurable alone | needs open objects, which fails; was: crashed (stack trace)                      |
| `required`                                        | right                |                                                                                  |
| `dependentRequired`                               | right                |                                                                                  |
| `minContains / maxContains`                       | not measurable alone | needs contains, which fails; was: crashed (stack trace)                          |

### Applicators

| Construct                                   | Today                | What happened                                                                             |
| ------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `properties`                                | right                |                                                                                           |
| `additionalProperties: false`               | right                |                                                                                           |
| `additionalProperties: true`                | crashed              | throw new Error(buildNonStrictObjectRejectionMessage(inputDescription));                  |
| `additionalProperties: schema`              | crashed              | throw new Error(buildNonStrictObjectRejectionMessage(inputDescription));                  |
| `patternProperties`                         | crashed              | throw new Error(                                                                          |
| `propertyNames`                             | crashed              | throw new Error(                                                                          |
| `items`                                     | right                |                                                                                           |
| `prefixItems`                               | wrong                | ["a"]: source says valid, Castr says invalid. Emitted `z.tuple([z.string(), z.number()])` |
| `prefixItems with items: false`             | wrong                | ["a"]: source says valid, Castr says invalid. Emitted `z.tuple([z.string(), z.number()])` |
| `contains`                                  | crashed              | throw new Error(                                                                          |
| `allOf`                                     | right                |                                                                                           |
| `allOf (objects with different properties)` | not measurable alone | needs open objects, which fails; was: crashed (stack trace)                               |
| `anyOf`                                     | right                |                                                                                           |
| `oneOf`                                     | right                |                                                                                           |
| `not`                                       | wrong                | "a": source says invalid, Castr says valid. Emitted `z.unknown()`                         |
| `if / then / else`                          | wrong                | 15: source says invalid, Castr says valid. Emitted `z.number()`                           |
| `dependentSchemas`                          | wrong                | {"a":"x","b":"y"}: source says invalid, Castr says valid. Emitted `z`                     |

### Unevaluated

| Construct                      | Today                | What happened                                               |
| ------------------------------ | -------------------- | ----------------------------------------------------------- |
| `unevaluatedProperties: false` | not measurable alone | needs open objects, which fails; was: crashed (stack trace) |
| `unevaluatedItems: false`      | crashed              | throw new Error(                                            |

### Core (references and identity)

| Construct                             | Today      | What happened                                                                            |
| ------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `schema true`                         | right      |                                                                                          |
| `schema false`                        | crashed    | throw new Error('Schema '${name}' not found in ${formatSearchLocations(xExtKey)}');      |
| `$ref to a component`                 | right      |                                                                                          |
| `$ref with sibling keywords`          | wrong      | "abcd": source says invalid, Castr says valid. Emitted `U`                               |
| `$ref, recursive`                     | right      |                                                                                          |
| `$defs with a local $ref`             | crashed    | throw new Error('Schema '${name}' not found in ${formatSearchLocations(xExtKey)}');      |
| `$anchor`                             | crashed    | throw new Error(                                                                         |
| `$dynamicRef / $dynamicAnchor`        | crashed    | throw new Error(                                                                         |
| `$comment`                            | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `$schema`                             | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `$id with a $ref resolved against it` | crashed    | return new Error('Failed to load OpenAPI document (${descriptor}): ${message}', {        |

### Formats

| Construct                       | Today   | What happened                                                              |
| ------------------------------- | ------- | -------------------------------------------------------------------------- |
| `format: date-time`             | right   |                                                                            |
| `format: date`                  | right   |                                                                            |
| `format: time`                  | wrong   | "09:00:00Z": source says valid, Castr says invalid. Emitted `z.iso.time()` |
| `format: duration`              | right   |                                                                            |
| `format: email`                 | right   |                                                                            |
| `format: hostname`              | right   |                                                                            |
| `format: ipv4`                  | right   |                                                                            |
| `format: ipv6`                  | right   |                                                                            |
| `format: uri`                   | right   |                                                                            |
| `format: uri-reference`         | crashed | throw new Error(                                                           |
| `format: uuid`                  | right   |                                                                            |
| `format: uri-template`          | crashed | throw new Error(                                                           |
| `format: json-pointer`          | crashed | throw new Error(                                                           |
| `format: relative-json-pointer` | crashed | throw new Error(                                                           |
| `format: regex`                 | crashed | throw new Error(                                                           |
| `format: int32`                 | right   |                                                                            |
| `format: int64`                 | wrong   | 1: source says valid, Castr says invalid. Emitted `z.int64()`              |
| `format: float`                 | right   |                                                                            |
| `format: double`                | right   |                                                                            |
| `format: byte`                  | crashed | throw new Error(                                                           |
| `format: binary`                | crashed | throw new Error(                                                           |
| `format: password`              | crashed | throw new Error(                                                           |

### Content

| Construct                            | Today      | What happened                                                                            |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------------------------- |
| `contentEncoding / contentMediaType` | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `contentSchema`                      | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |

### Annotations

| Construct              | Today      | What happened                                                                            |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `title / description`  | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `default`              | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `deprecated`           | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `readOnly / writeOnly` | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `examples / example`   | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |

### OpenAPI additions

| Construct                    | Today      | What happened                                                                            |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `discriminator`              | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `discriminator with mapping` | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `externalDocs`               | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |
| `xml (on a property)`        | not judged | validation is unaffected; whether the keyword is carried into the output was not checked |

## Reading the gaps

- **Silently too loose (the dangerous kind).** `const`, `not`, `if`/`then`/`else`,
  `dependentSchemas`, `uniqueItems`, `maxProperties`, `minProperties` and keywords beside a
  `$ref` all produce a validator that accepts values the source forbids.
- **Too strict.** `prefixItems`, with or without `items: false` (a shorter array is valid
  and the emitted tuple rejects it), `format: time` and `format: int64` reject values the source allows. `int64` is emitted as
  a big integer, which no JSON number satisfies.
- **Open objects crash.** Every object that admits unknown keys (`additionalProperties`
  true or a schema, `patternProperties`) ends in a stack trace. `propertyNames` crashes
  on a closed object too.
  `patternProperties` is refused on the grounds that TypeScript cannot express it.
- **References beyond components crash.** `$defs`, `$anchor`, `$dynamicRef`, and a `$ref`
  resolved against a nested `$id`.
- **Eight formats crash,** including `byte`, `binary` and `password`, which OpenAPI
  documents commonly use.
- **`discriminator` is not judged.** With branches told apart by a one-value `enum` the
  validator decides correctly, but the `oneOf` alone explains that; whether the
  discriminator itself is read was not checked.

## Appendix. The probe

Run from a directory holding `ajv`, `ajv-formats` and `zod`:
`node constructs.mjs <path to lib/dist/cli/index.js>`.

```js
// Construct probe (throwaway): one JSON Schema 2020-12 / OpenAPI 3.1 keyword per case.
// Castr generates from a minimal document; Ajv, reading the same schema, decides each sample.
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const CLI = process.argv[2];
const dir = path.resolve('constructs/run');
if (existsSync(dir)) rmSync(dir, { recursive: true });
mkdirSync(dir, { recursive: true });
const O = (props, extra = {}) => ({
  type: 'object',
  properties: props,
  additionalProperties: false,
  ...extra,
});
const S = { type: 'string' },
  N = { type: 'number' },
  I = { type: 'integer' };
const fmt = (f, good, bad) => [
  `format: ${f}`,
  'format',
  { type: 'string', format: f },
  [good, bad, 5],
];
// [name, vocabulary, schema, samples, extra component schemas]
const cases = [
  ['type: string', 'validation', S, ['a', 1, null]],
  ['type: number', 'validation', N, [1.5, 'a', null]],
  ['type: integer', 'validation', I, [1, 1.5, 'a']],
  ['type: boolean', 'validation', { type: 'boolean' }, [true, 'true', 0]],
  ['type: null', 'validation', { type: 'null' }, [null, 0, '']],
  ['type: array', 'validation', { type: 'array' }, [[], [1, 'a'], {}]],
  ['type: object', 'validation', O({ a: S }), [{}, { a: 'x' }, [], 'a']],
  ['type (list of types)', 'validation', { type: ['string', 'null'] }, ['a', null, 1]],
  ['no type (any value)', 'validation', {}, [1, 'a', null, {}, []]],
  ['schema true', 'core', true, [1, 'a', null]],
  ['schema false', 'core', false, [1, 'a', null]],
  ['enum (strings)', 'validation', { enum: ['a', 'b'] }, ['a', 'c', 1]],
  [
    'enum (mixed types)',
    'validation',
    { enum: ['a', 1, null, true] },
    ['a', 1, null, true, 'b', 2],
  ],
  ['const (string)', 'validation', { const: 'a' }, ['a', 'b', 1]],
  ['const (number)', 'validation', { const: 3 }, [3, 4, '3']],
  ['const (object)', 'validation', { const: { a: 1 } }, [{ a: 1 }, { a: 2 }, {}]],
  ['multipleOf', 'validation', { type: 'number', multipleOf: 0.5 }, [1.5, 1.25]],
  ['maximum', 'validation', { type: 'number', maximum: 3 }, [3, 3.1]],
  ['exclusiveMaximum', 'validation', { type: 'number', exclusiveMaximum: 3 }, [2.9, 3]],
  ['minimum', 'validation', { type: 'number', minimum: 3 }, [3, 2.9]],
  ['exclusiveMinimum', 'validation', { type: 'number', exclusiveMinimum: 3 }, [3.1, 3]],
  ['maxLength', 'validation', { type: 'string', maxLength: 2 }, ['ab', 'abc']],
  ['minLength', 'validation', { type: 'string', minLength: 2 }, ['ab', 'a']],
  ['pattern', 'validation', { type: 'string', pattern: '^a+$' }, ['aa', 'ab']],
  ['maxItems', 'validation', { type: 'array', maxItems: 1 }, [[1], [1, 2]]],
  ['minItems', 'validation', { type: 'array', minItems: 1 }, [[1], []]],
  [
    'uniqueItems',
    'validation',
    { type: 'array', uniqueItems: true },
    [
      [1, 2],
      [1, 1],
      [{ a: 1 }, { a: 1 }],
    ],
  ],
  [
    'maxProperties',
    'validation',
    O({ a: N, b: N }, { maxProperties: 1 }),
    [{ a: 1 }, { a: 1, b: 2 }],
  ],
  ['minProperties', 'validation', O({ a: N, b: N }, { minProperties: 1 }), [{ a: 1 }, {}]],
  [
    'maxProperties / minProperties on an open object',
    'validation',
    { type: 'object', additionalProperties: true, minProperties: 1, maxProperties: 2 },
    [{ a: 1 }, {}, { a: 1, b: 2, c: 3 }],
    {},
    'open objects',
  ],
  ['required', 'validation', O({ a: S }, { required: ['a'] }), [{ a: 'x' }, {}]],
  [
    'dependentRequired',
    'validation',
    O({ a: S, b: S }, { dependentRequired: { a: ['b'] } }),
    [{ a: 'x', b: 'y' }, { a: 'x' }, {}],
  ],
  ['properties', 'applicator', O({ a: S }), [{ a: 'x' }, { a: 1 }, {}]],
  ['additionalProperties: false', 'applicator', O({ a: S }), [{ a: 'x' }, { a: 'x', b: 1 }]],
  [
    'additionalProperties: true',
    'applicator',
    { type: 'object', properties: { a: S }, additionalProperties: true },
    [{ a: 'x', b: 1 }, { a: 1 }],
  ],
  [
    'additionalProperties: schema',
    'applicator',
    { type: 'object', properties: { a: S }, additionalProperties: N },
    [
      { a: 'x', b: 1 },
      { a: 'x', b: 'y' },
    ],
  ],
  [
    'patternProperties',
    'applicator',
    { type: 'object', patternProperties: { '^n_': N }, additionalProperties: false },
    [{ n_a: 1 }, { n_a: 'x' }, { other: 1 }],
  ],
  [
    'propertyNames',
    'applicator',
    O({ ab: N, A1: N }, { propertyNames: { pattern: '^[a-z]+$' } }),
    [{ ab: 1 }, { A1: 1 }, {}],
  ],
  ['items', 'applicator', { type: 'array', items: S }, [['a'], ['a', 1], []]],
  [
    'prefixItems',
    'applicator',
    { type: 'array', prefixItems: [S, N] },
    [['a', 1], [1, 'a'], ['a'], ['a', 1, true]],
  ],
  [
    'prefixItems with items: false',
    'applicator',
    { type: 'array', prefixItems: [S, N], items: false },
    [['a', 1], ['a', 1, 2], ['a'], []],
  ],
  ['contains', 'applicator', { type: 'array', contains: N }, [['a', 1], ['a']]],
  [
    'minContains / maxContains',
    'validation',
    { type: 'array', contains: N, minContains: 2, maxContains: 3 },
    [[1, 2], [1], [1, 2, 3, 4]],
    {},
    'contains',
  ],
  [
    'allOf',
    'applicator',
    {
      allOf: [
        { type: 'string', minLength: 2 },
        { type: 'string', maxLength: 3 },
      ],
    },
    ['ab', 'a', 'abcd'],
  ],
  [
    'allOf (objects)',
    'applicator',
    {
      allOf: [
        { type: 'object', properties: { a: S }, required: ['a'], additionalProperties: true },
        { type: 'object', properties: { b: N }, required: ['b'], additionalProperties: true },
      ],
    },
    [{ a: 'x', b: 1 }, { a: 'x' }, { b: 1 }],
    {},
    'open objects',
  ],
  ['anyOf', 'applicator', { anyOf: [S, N] }, ['a', 1, true]],
  [
    'oneOf',
    'applicator',
    {
      oneOf: [
        { type: 'number', multipleOf: 2 },
        { type: 'number', multipleOf: 3 },
      ],
    },
    [2, 3, 6, 5],
  ],
  ['not', 'applicator', { not: S }, [1, 'a']],
  [
    'if / then / else',
    'applicator',
    { type: 'number', if: { minimum: 10 }, then: { multipleOf: 10 }, else: { multipleOf: 1 } },
    [20, 15, 5, 5.5],
  ],
  [
    'dependentSchemas',
    'applicator',
    {
      type: 'object',
      properties: { a: S, b: {} },
      additionalProperties: false,
      dependentSchemas: { a: { properties: { b: N } } },
    },
    [{ a: 'x', b: 1 }, { a: 'x', b: 'y' }, { b: 'y' }],
  ],
  [
    'unevaluatedProperties: false',
    'unevaluated',
    {
      allOf: [{ type: 'object', properties: { a: S }, additionalProperties: true }],
      properties: { b: N },
      unevaluatedProperties: false,
    },
    [
      { a: 'x', b: 1 },
      { a: 'x', c: 1 },
    ],
    {},
    'open objects',
  ],
  [
    'unevaluatedItems: false',
    'unevaluated',
    { type: 'array', prefixItems: [S], unevaluatedItems: false },
    [['a'], ['a', 1]],
  ],
  [
    '$ref to a component',
    'core',
    { $ref: '#/components/schemas/U' },
    ['ab', 'a', 1],
    { U: { type: 'string', minLength: 2 } },
  ],
  [
    '$ref with sibling keywords',
    'core',
    { $ref: '#/components/schemas/U', maxLength: 3 },
    ['ab', 'abcd', 'a'],
    { U: { type: 'string', minLength: 2 } },
  ],
  [
    '$ref, recursive',
    'core',
    { $ref: '#/components/schemas/Tree' },
    [
      { v: 1, kids: [{ v: 2, kids: [] }] },
      { v: 1, kids: [{ v: 'x', kids: [] }] },
    ],
    {
      Tree: O(
        { v: N, kids: { type: 'array', items: { $ref: '#/components/schemas/Tree' } } },
        { required: ['v', 'kids'] },
      ),
    },
  ],
  [
    '$defs with a local $ref',
    'core',
    {
      $defs: { n: { type: 'number' } },
      type: 'array',
      items: { $ref: '#/components/schemas/T/$defs/n' },
    },
    [[1], ['a']],
  ],
  [
    '$anchor',
    'core',
    { type: 'array', items: { $ref: '#num' } },
    [[1], ['a']],
    { U: { $anchor: 'num', type: 'number' } },
  ],
  [
    '$dynamicRef / $dynamicAnchor',
    'core',
    {
      $dynamicAnchor: 'node',
      type: 'object',
      properties: { next: { $dynamicRef: '#node' }, v: N },
      additionalProperties: false,
    },
    [
      { v: 1, next: { v: 2 } },
      { v: 1, next: { v: 'x' } },
    ],
  ],
  [
    'discriminator',
    'openapi',
    {
      oneOf: [{ $ref: '#/components/schemas/Cat' }, { $ref: '#/components/schemas/Dog' }],
      discriminator: { propertyName: 'kind' },
    },
    [
      { kind: 'cat', purrs: true },
      { kind: 'dog', barks: true },
      { kind: 'cat', barks: true },
      { kind: 'fish' },
    ],
    {
      Cat: O(
        { kind: { enum: ['cat'] }, purrs: { type: 'boolean' } },
        { required: ['kind', 'purrs'] },
      ),
      Dog: O(
        { kind: { enum: ['dog'] }, barks: { type: 'boolean' } },
        { required: ['kind', 'barks'] },
      ),
    },
  ],
  [
    'discriminator with mapping',
    'openapi',
    {
      oneOf: [{ $ref: '#/components/schemas/Cat' }, { $ref: '#/components/schemas/Dog' }],
      discriminator: {
        propertyName: 'kind',
        mapping: { cat: '#/components/schemas/Cat', dog: '#/components/schemas/Dog' },
      },
    },
    [
      { kind: 'cat', purrs: true },
      { kind: 'dog', barks: true },
      { kind: 'cat', barks: true },
      { kind: 'fish' },
    ],
    {
      Cat: O(
        { kind: { enum: ['cat'] }, purrs: { type: 'boolean' } },
        { required: ['kind', 'purrs'] },
      ),
      Dog: O(
        { kind: { enum: ['dog'] }, barks: { type: 'boolean' } },
        { required: ['kind', 'barks'] },
      ),
    },
  ],
  fmt('date-time', '2026-11-20T09:00:00Z', 'yesterday'),
  fmt('date', '2026-11-20', '20/11/2026'),
  fmt('time', '09:00:00Z', '9am'),
  fmt('duration', 'P1D', 'one day'),
  fmt('email', 'a@example.com', 'not an email'),
  fmt('hostname', 'example.com', 'not a host!'),
  fmt('ipv4', '127.0.0.1', '999.1.1.1'),
  fmt('ipv6', '::1', 'zz::1'),
  fmt('uri', 'https://example.com/a', 'not a uri \\ ^'),
  fmt('uri-reference', '/a/b', 'not a uri \\ ^'),
  fmt('uuid', '123e4567-e89b-12d3-a456-426614174000', 'not-a-uuid'),
  fmt('uri-template', '/a/{b}', '/a/{b'),
  fmt('json-pointer', '/a/b', 'a/b'),
  fmt('relative-json-pointer', '1/a', '/a'),
  fmt('regex', '^a+$', '(('),
  ['format: int32', 'format', { type: 'integer', format: 'int32' }, [1, 2147483648, 'a']],
  ['format: int64', 'format', { type: 'integer', format: 'int64' }, [1, 1.5, 'a']],
  ['format: float', 'format', { type: 'number', format: 'float' }, [1.5, 'a']],
  ['format: double', 'format', { type: 'number', format: 'double' }, [1.5, 'a']],
  ['format: byte', 'format', { type: 'string', format: 'byte' }, ['aGVsbG8=', 'not base64!', 5]],
  ['format: binary', 'format', { type: 'string', format: 'binary' }, ['anything', 5]],
  ['format: password', 'format', { type: 'string', format: 'password' }, ['anything', 5]],
  [
    'contentEncoding / contentMediaType',
    'content',
    { type: 'string', contentEncoding: 'base64', contentMediaType: 'image/png' },
    ['aGVsbG8=', 5],
  ],
  [
    'contentSchema',
    'content',
    { type: 'string', contentMediaType: 'application/json', contentSchema: { type: 'object' } },
    ['{}', 5],
  ],
  ['title / description', 'annotation', { type: 'string', title: 'T', description: 'd' }, ['a', 1]],
  ['default', 'annotation', O({ a: { type: 'string', default: 'x' } }), [{}, { a: 'y' }, { a: 1 }]],
  ['deprecated', 'annotation', { type: 'string', deprecated: true }, ['a', 1]],
  [
    'readOnly / writeOnly',
    'annotation',
    O({ a: { type: 'string', readOnly: true }, b: { type: 'string', writeOnly: true } }),
    [{ a: 'x', b: 'y' }, { a: 1 }],
  ],
  ['examples / example', 'annotation', { type: 'string', examples: ['a'], example: 'a' }, ['a', 1]],
  ['$comment', 'core', { type: 'string', $comment: 'c' }, ['a', 1]],
  [
    '$schema',
    'core',
    { $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'string' },
    ['a', 1],
  ],
  [
    '$id with a $ref resolved against it',
    'core',
    O(
      { n: { $id: 'n', type: 'number' }, list: { type: 'array', items: { $ref: 'n' } } },
      { $id: 'https://example.com/schemas/t' },
    ),
    [{ list: [1] }, { list: ['a'] }],
  ],
  [
    'externalDocs',
    'openapi',
    { type: 'string', externalDocs: { url: 'https://example.com' } },
    ['a', 1],
  ],
  [
    'xml (on a property)',
    'openapi',
    O({ a: { type: 'string', xml: { name: 'x', attribute: true } } }),
    [{ a: 'x' }, { a: 1 }],
  ],
];
const rows = [];
let i = 0;
for (const [name, vocab, schema, samples, extra = {}, needs] of cases) {
  const id = `c${String(i++).padStart(2, '0')}`;
  const doc = {
    openapi: '3.1.0',
    info: { title: 't', version: '1' },
    paths: {
      '/t': {
        get: {
          operationId: 'getT',
          responses: {
            200: {
              description: 'ok',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/T' } } },
            },
          },
        },
      },
    },
    components: { schemas: { T: schema, ...extra } },
  };
  writeFileSync(`${dir}/${id}.json`, JSON.stringify(doc));
  const ajv = new Ajv2020({ strict: false, validateFormats: true });
  addFormats(ajv);
  let ref;
  try {
    ajv.addSchema({ $id: 'https://t/doc', ...doc });
    ref = ajv.getSchema('https://t/doc#/components/schemas/T');
    ref(samples[0]);
  } catch (e) {
    rows.push({
      name,
      vocab,
      verdict: 'reference validator could not read it',
      detail: String(e.message).slice(0, 90),
    });
    continue;
  }
  const run = spawnSync('node', [CLI, `${dir}/${id}.json`, '-o', `${dir}/${id}.ts`], {
    encoding: 'utf8',
  });
  const log = (run.stdout || '') + (run.stderr || '');
  if (run.status !== 0 || !existsSync(`${dir}/${id}.ts`)) {
    const trace = /\n\s+at .+\(.+:\d+:\d+\)/.test(log);
    rows.push({
      name,
      vocab,
      verdict: trace ? 'crashed (stack trace)' : 'refused',
      detail: (log.split('\n').find((l) => /Error|error/.test(l)) || log.split('\n')[0] || '')
        .trim()
        .slice(0, 110),
    });
    continue;
  }
  let mod;
  try {
    mod = await import(`${dir}/${id}.ts`);
  } catch (e) {
    rows.push({
      name,
      vocab,
      verdict: 'output does not load',
      detail: String(e.message).split('\n')[0].slice(0, 110),
    });
    continue;
  }
  const src =
    readFileSync(`${dir}/${id}.ts`, 'utf8')
      .split('\n')
      .find((l) => l.startsWith('export const T ')) || '';
  if (!mod.T?.safeParse) {
    rows.push({ name, vocab, verdict: 'missing (no validator emitted)', detail: '' });
    continue;
  }
  const bad = [];
  for (const v of samples) {
    const want = ref(v) === true;
    const got = mod.T.safeParse(v).success;
    if (want !== got)
      bad.push(
        `${JSON.stringify(v)}: source says ${want ? 'valid' : 'invalid'}, Castr says ${got ? 'valid' : 'invalid'}`,
      );
  }
  rows.push({
    name,
    vocab,
    verdict: bad.length ? 'wrong' : 'right',
    detail: bad.length ? bad[0] : '',
    src: src.replace('export const T = ', '').slice(0, 80),
  });
}
for (const r of rows) {
  const c = cases.find((k) => k[0] === r.name);
  if (c[5] && r.verdict !== 'right') {
    r.detail = `needs ${c[5]}, which fails; was: ${r.verdict}`;
    r.verdict = 'not measurable alone';
  }
}
writeFileSync('constructs/result.json', JSON.stringify(rows, null, 1));
const tally = {};
for (const r of rows) tally[r.verdict] = (tally[r.verdict] || 0) + 1;
console.log(rows.length, 'constructs', JSON.stringify(tally));
for (const r of rows)
  if (r.verdict !== 'right')
    console.log(`${r.verdict.padEnd(22)} | ${r.name.padEnd(34)} | ${r.detail}`);
```
