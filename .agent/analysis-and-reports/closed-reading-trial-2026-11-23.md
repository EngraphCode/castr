# The closed reading across composition: the trial of 23 November 2026

A record of what was run to decide how SPEC-P-1's closed reading works where an object
holds `oneOf`, `allOf`, `not`, `if` or a reference. The decision and its lens are in the
[plan](../plans/active/after-0.8.0-next-steps.md) under "The reframing of 23 November
2026" and in the thread record's "Step log". Nothing here is approved text.

The reading tried: an object that states no unknown-key policy is read as if it stated
`unevaluatedProperties: false`, at each outermost schema that describes objects. It is
never applied at a schema that is applied in place (a branch of `allOf`, `anyOf` or
`oneOf`, a `then` or `else`, a reference's target reached in place). It is never applied
at any depth under `not`, `if`, `contains` or a branch of `oneOf`, the schema itself or
anything nested in it, nor inside a definition reached from there: under those keywords
a narrower child can make the parent accept more. A schema describes objects when its `type` admits
`object`, or it holds a keyword that applies only to objects, or a schema it applies in
place by `allOf`, `anyOf`, `oneOf`, `then`, `else` or a reference does. A `not` or an
`if` does not make the schema that holds it describe objects.

The judge is Ajv for JSON Schema 2020-12, reading own properties only. Each value has
the outcome expected by hand for the source and for the closed reading. Result on the
cases run: 22 schemas, 51 values, none unexpected, and none accepted by the closed
reading that the source refuses. That is a result about these cases. It is not a proof
that the reading narrows for every schema; the plan's act for a generated-schema check
is where that is tested more widely.

Four things were learned on the way and are in the script as it stands:

- A schema under `contains` beside `maxContains` widens if it is closed, so it is left
  unclosed.
- One hand expectation was wrong: a `oneOf` of two open objects with `{a: 1}`. The
  source accepts it and the closed reading refuses it, which is a narrowing.
- The first version of this record (15 schemas, 35 values) closed an object nested as a
  property or an item under `not`, `if` or `contains`, and that widens:
  `{not: {properties: {p: A}}}` with `A` an open object refuses `{p: {a: "x", z: 1}}`
  in the source and accepted it once `A` was closed. A review of pull request 172 found
  it; the seat reproduced it (4 of 13 values widened) and changed the rule to the one
  above (0 of 13). The same holds through a reference, so a definition reached from
  under those keywords is left unclosed throughout.

- A second review of pull request 172 found the same fault one keyword along: an object
  nested in a branch of `oneOf`. `{oneOf: [{properties: {p: {}}}, {properties: {p: A}}]}`
  refuses `{p: {a: "x", z: 1}}` in the source, because both branches match, and accepted
  it once `A` was closed, because then one does. The seat reproduced it and added
  branches of `oneOf` to the keywords under which nothing is closed. Run without that
  change, the script fails on the case.

Two reviews in a row each found a position this record had not thought of. So the list
of keywords above is what has been found, not a list known to be whole, and cases
written by hand are not the instrument that will show it whole. The plan's check over
generated schemas is, and the reading is a candidate until that check has run.

A cost of the rule for definitions: a definition used both under `not` and by itself is left
unclosed in both places, which narrows less than the reading asks where it stands by
itself. Closing it exactly needs two copies of the definition. That is not tried here.

Not covered: an object under `prefixItems` (the script does not visit it, so it is left
open, which narrows less than the reading asks and widens nothing), `patternProperties`, `dependentSchemas`, `$dynamicRef`, a reference to
another document, a local reference that is not `#/$defs/<one name>` (a nested
definition, or a name that holds `/`), a definition that refers to itself (the script
does not guard a cycle of references), a list of types, and what the Zod writer must
write for a named schema that is used both by itself and inside `allOf`.

To run it: save the block below as a `.mts` file in `lib/tests-picture/.tmp` and run
`npx tsx tests-picture/.tmp/<name>.mts` from `lib`. It exits with a failure if any value
is unexpected or widened.

```ts
import { Ajv2020 } from 'ajv/dist/2020.js';
// The closed reading as: unevaluatedProperties: false at each outermost schema that
// describes objects and states no policy. Never at a schema applied in place (a branch
// of allOf/anyOf/oneOf, then/else, a $ref target reached in place). Never at any depth
// under not, if, contains or a branch of oneOf: there a narrower child can make the
// parent accept more.
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
const NEG = ['not', 'if', 'contains', 'oneOf'];
const isObj = (s: unknown): s is S => typeof s === 'object' && s !== null && !Array.isArray(s);
const run = (root: S) => {
  const defs = (root['$defs'] ?? {}) as Record<string, S>;
  const name = (s: S): string | undefined =>
    typeof s['$ref'] === 'string' ? (s['$ref'] as string).split('/').pop() : undefined;
  const deref = (s: S): S => defs[name(s) ?? ''] ?? {};
  // Definitions reached from under not/if/contains, directly or through other definitions.
  const negDefs = new Set<string>();
  const scan = (s: unknown, neg: boolean): void => {
    if (Array.isArray(s)) return s.forEach((x) => scan(x, neg));
    if (!isObj(s)) return;
    const n = name(s);
    if (neg && n !== undefined && !negDefs.has(n)) {
      negDefs.add(n);
      scan(defs[n], true);
    }
    for (const [k, v] of Object.entries(s)) if (k !== '$defs') scan(v, neg || NEG.includes(k));
  };
  scan(root, false);
  for (const [n, d] of Object.entries(defs)) if (!negDefs.has(n)) scan(d, false);
  const describes = (s: unknown): boolean => {
    if (!isObj(s)) return false;
    const t = s['type'];
    if (t === 'object' || (Array.isArray(t) && t.includes('object')) || OBJ.some((k) => k in s))
      return true;
    if ('$ref' in s && describes(deref(s))) return true;
    return (
      ['allOf', 'anyOf', 'oneOf'].some(
        (k) => Array.isArray(s[k]) && (s[k] as unknown[]).some(describes),
      ) || ['then', 'else'].some((k) => describes(s[k]))
    );
  };
  const walk = (s: unknown, inPlace: boolean, neg: boolean): unknown => {
    if (!isObj(s)) return s;
    const o: S = { ...s };
    for (const k of ['allOf', 'anyOf'])
      if (Array.isArray(o[k])) o[k] = (o[k] as unknown[]).map((x) => walk(x, true, neg));
    if (Array.isArray(o['oneOf']))
      o['oneOf'] = (o['oneOf'] as unknown[]).map((x) => walk(x, true, true));
    for (const k of ['then', 'else']) if (k in o) o[k] = walk(o[k], true, neg);
    for (const k of ['not', 'if', 'contains']) if (k in o) o[k] = walk(o[k], true, true);
    for (const k of ['items', 'additionalProperties', 'propertyNames'])
      if (isObj(o[k])) o[k] = walk(o[k], false, neg);
    if (isObj(o['properties']))
      o['properties'] = Object.fromEntries(
        Object.entries(o['properties']).map(([n, x]) => [n, walk(x, false, neg)]),
      );
    if (isObj(o['$defs']))
      o['$defs'] = Object.fromEntries(
        Object.entries(o['$defs']).map(([n, x]) => [n, walk(x, true, negDefs.has(n))]),
      );
    if (
      !inPlace &&
      !neg &&
      describes(o) &&
      !('additionalProperties' in o) &&
      !('unevaluatedProperties' in o)
    )
      o['unevaluatedProperties'] = false;
    return o;
  };
  return walk(root, false, false) as S;
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
const P = { properties: { p: A }, required: ['p'] };
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
  // An object nested under not, if or contains (review of pull request 172).
  [
    'not > property',
    { not: P },
    [
      [{ p: { a: 'x', z: 1 } }, false, false],
      [{ p: { a: 1 } }, true, true],
      [{}, true, true],
    ],
  ],
  [
    'if > property',
    { if: P, then: false },
    [
      [{ p: { a: 'x', z: 1 } }, false, false],
      [{ p: 3 }, true, true],
    ],
  ],
  [
    'maxContains > property',
    { type: 'array', contains: P, minContains: 0, maxContains: 0 },
    [
      [[{ p: { a: 'x', z: 1 } }], false, false],
      [[{ p: { a: 1 } }], true, true],
    ],
  ],
  [
    'not > items',
    { not: { type: 'array', items: A, minItems: 1 } },
    [
      [[{ a: 'x', z: 1 }], false, false],
      [[{ a: 1 }], true, true],
    ],
  ],
  [
    'not > ref > property',
    { $defs: { X: P }, not: { $ref: '#/$defs/X' } },
    [
      [{ p: { a: 'x', z: 1 } }, false, false],
      [{ p: { a: 1 } }, true, true],
    ],
  ],
  [
    'oneOf > property',
    { oneOf: [{ properties: { p: {} } }, { properties: { p: A } }] },
    [
      [{ p: { a: 'x', z: 1 } }, false, false],
      [{ p: { a: 1 } }, true, true],
      [{ p: { a: 1 }, z: 1 }, true, false],
    ],
  ],
  [
    'not > ref > ref',
    {
      $defs: {
        X: { properties: { p: { $ref: '#/$defs/Y' } }, required: ['p'] },
        Y: { type: 'object', properties: { q: A } },
      },
      not: { $ref: '#/$defs/X' },
    },
    [
      [{ p: { q: { a: 'x', z: 1 } } }, false, false],
      [{ p: 3 }, true, true],
    ],
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
    if (!a && b) {
      widened++;
      console.log('WIDENED', name, JSON.stringify(v));
    }
    if (a !== es || b !== ec) {
      unexpected++;
      console.log('UNEXPECTED', name, JSON.stringify(v), { source: a, closed: b, es, ec });
    }
  }
}
console.log('schemas', cases.length, 'values', n, 'unexpected', unexpected, 'widened', widened);
if (unexpected > 0 || widened > 0) process.exit(1);
```
