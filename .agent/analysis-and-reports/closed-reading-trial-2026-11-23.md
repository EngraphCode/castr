# The closed reading across composition: the trial of 23 November 2026

A record of what was run to decide how SPEC-P-1's closed reading works where an object
holds `oneOf`, `allOf`, `not`, `if` or a reference. The decision and its lens are in the
[plan](../plans/active/after-0.8.0-next-steps.md) under "The reframing of 23 November
2026" and in the thread record's "Step log". Nothing here is approved text.

The reading tried: an object that states no unknown-key policy is read as if it stated
`unevaluatedProperties: false`, at each outermost schema that describes objects. It is
never applied at a schema that is applied in place (a branch of `allOf`, `anyOf` or
`oneOf`, a `not`, an `if`, `then` or `else`, a reference's target reached in place), nor
under `contains`. A schema describes objects when its `type` admits `object`, or it
holds a keyword that applies only to objects, or a schema it applies in place does.

The judge is Ajv for JSON Schema 2020-12, reading own properties only. Each value has
the outcome expected by hand for the source and for the closed reading. Result: 15
schemas, 35 values, none unexpected, and no value accepted by the closed reading that
the source refuses. Two things were learned on the way and are in the script as it
stands: a schema under `contains` beside `maxContains` widens if it is closed, so it is
left unclosed; and one hand expectation was wrong (a `oneOf` of two open objects with
`{a: 1}`: the source accepts it and the closed reading refuses it, which is a narrowing).

Not covered: `patternProperties`, `dependentSchemas`, `$dynamicRef`, a reference to
another document, a list of types, and what the Zod writer must write for a named schema
that is used both by itself and inside `allOf`.

Run it from `lib/tests-picture/.tmp` with `npx tsx`.

```ts
import { Ajv2020 } from 'ajv/dist/2020.js';
// The closed reading as: unevaluatedProperties: false at each outermost schema that
// describes objects and states no policy; never at a schema applied in place
// (a branch of allOf/anyOf/oneOf, not, if/then/else, a $ref target reached in place).
// Expected by hand, [value, source, closed]. Claim under test: closed never accepts
// what the source refuses.
type S = Record<string, unknown>;
const OBJ = [
  'properties',
  'patternProperties',
  'additionalProperties',
  'propertyNames',
  'required',
  'dependentRequired',
  'dependentSchemas',
  'minProperties',
  'maxProperties',
];
const run = (root: S) => {
  const deref = (s: S): S =>
    typeof s['$ref'] === 'string'
      ? ((root['$defs'] as Record<string, S>)[(s['$ref'] as string).split('/').pop()!] as S)
      : {};
  const describes = (s: unknown): boolean => {
    if (typeof s !== 'object' || s === null) return false;
    const o = s as S;
    const t = o['type'];
    if (t === 'object' || (Array.isArray(t) && t.includes('object')) || OBJ.some((k) => k in o))
      return true;
    if ('$ref' in o && describes(deref(o))) return true;
    return (
      ['allOf', 'anyOf', 'oneOf'].some(
        (k) => Array.isArray(o[k]) && (o[k] as unknown[]).some(describes),
      ) || ['then', 'else'].some((k) => describes(o[k]))
    );
  };
  const walk = (s: unknown, inPlace: boolean): unknown => {
    if (typeof s !== 'object' || s === null || Array.isArray(s)) return s;
    const o: S = { ...(s as S) };
    for (const k of ['allOf', 'anyOf', 'oneOf'])
      if (Array.isArray(o[k])) o[k] = (o[k] as unknown[]).map((x) => walk(x, true));
    for (const k of ['not', 'if', 'then', 'else']) if (k in o) o[k] = walk(o[k], true);
    for (const k of ['contains']) if (typeof o[k] === 'object') o[k] = walk(o[k], true);
    for (const k of ['items', 'additionalProperties', 'propertyNames'])
      if (typeof o[k] === 'object') o[k] = walk(o[k], false);
    for (const k of ['properties', '$defs'])
      if (typeof o[k] === 'object')
        o[k] = Object.fromEntries(
          Object.entries(o[k] as S).map(([n, x]) => [n, walk(x, k === '$defs' ? true : false)]),
        );
    if (
      !inPlace &&
      describes(o) &&
      !('additionalProperties' in o) &&
      !('unevaluatedProperties' in o)
    )
      o['unevaluatedProperties'] = false;
    return o;
  };
  return walk(root, false) as S;
};
const A = { type: 'object', properties: { a: { type: 'string' } } };
const B = { type: 'object', properties: { b: { type: 'string' } } };
const branch = (v: string) => ({
  type: 'object',
  properties: { t: { const: v } },
  required: ['t'],
  additionalProperties: false,
});
const X = { $defs: { X: A } };
const cases: [string, S, [unknown, boolean, boolean][]][] = [
  [
    'plain',
    A,
    [
      [{ a: 'x' }, true, true],
      [{ a: 'x', z: 1 }, true, false],
    ],
  ],
  [
    'not',
    { not: A },
    [
      [{ a: 'x', z: 1 }, false, false],
      [{ a: 1 }, true, true],
      [3, true, true],
    ],
  ],
  [
    'oneOf',
    { oneOf: [A, B] },
    [
      [{ a: 'x' }, false, false],
      [{}, false, false],
      [{ a: 1 }, true, false],
      [{ a: 1, z: 1 }, true, false],
    ],
  ],
  [
    'if',
    { if: A, then: { required: ['a'] }, else: true },
    [
      [{ z: 1 }, false, false],
      [{ a: 'x' }, true, true],
      [{ a: 'x', z: 1 }, true, false],
    ],
  ],
  [
    'anyOf',
    { anyOf: [A, B] },
    [
      [{ a: 'x', b: 'y' }, true, true],
      [{ a: 'x', z: 1 }, true, false],
    ],
  ],
  [
    'allOf',
    { allOf: [A, B] },
    [
      [{ a: 'x', b: 'y' }, true, true],
      [{ a: 'x', z: 1 }, true, false],
      [{}, true, true],
    ],
  ],
  [
    'oak quiz',
    { type: 'object', oneOf: [branch('x'), branch('y')] },
    [
      [{ t: 'x' }, true, true],
      [{ t: 'x', z: 1 }, false, false],
      [{ t: 'q' }, false, false],
    ],
  ],
  [
    'typeless union',
    { oneOf: [branch('x'), { type: 'string' }] },
    [
      [{ t: 'x' }, true, true],
      ['s', true, true],
      [3, false, false],
    ],
  ],
  [
    'empty schema as a property',
    { type: 'object', properties: { p: {} } },
    [
      [{ p: { k: 1 } }, true, true],
      [{ p: 3 }, true, true],
    ],
  ],
  [
    'nested object',
    { type: 'object', properties: { p: { type: 'object', properties: { q: {} } } } },
    [
      [{ p: { q: 1 } }, true, true],
      [{ p: { q: 1, z: 2 } }, true, false],
    ],
  ],
  [
    'ref beside keywords',
    { ...X, type: 'object', $ref: '#/$defs/X', properties: { b: {} } },
    [
      [{ a: 'x', b: 1 }, true, true],
      [{ a: 'x', z: 1 }, true, false],
    ],
  ],
  [
    'ref as a property',
    { ...X, type: 'object', properties: { p: { $ref: '#/$defs/X' } } },
    [
      [{ p: { a: 'x' } }, true, true],
      [{ p: { a: 'x', z: 1 } }, true, false],
    ],
  ],
  [
    'bare object',
    { type: 'object' },
    [
      [{}, true, true],
      [{ z: 1 }, true, false],
    ],
  ],
  ['stated open', { type: 'object', additionalProperties: true }, [[{ z: 1 }, true, true]]],
  [
    'maxContains',
    { type: 'array', contains: A, minContains: 0, maxContains: 0 },
    [[[{ z: 1 }], false, false]],
  ],
];
const ajv = new Ajv2020({ strict: false, ownProperties: true });
let unexpected = 0,
  widened = 0,
  n = 0;
for (const [name, schema, values] of cases) {
  const s = ajv.compile(schema),
    c = ajv.compile(run(schema));
  for (const [v, es, ec] of values) {
    n++;
    const a = s(v),
      b = c(v);
    if (!a && b) widened++;
    if (a !== es || b !== ec) {
      unexpected++;
      console.log('UNEXPECTED', name, JSON.stringify(v), { source: a, closed: b, es, ec });
    } else if (!a && b) console.log('widens (as expected by hand):', name, JSON.stringify(v));
  }
}
console.log('values', n, 'unexpected', unexpected, 'widened', widened);
```
