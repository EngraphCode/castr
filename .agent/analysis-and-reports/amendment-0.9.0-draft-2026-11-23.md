# Amendment 0.9.0, proposed: the two rows that stop Oak's document

**Approved, and adjusted, on 23 November 2026.** The owner approved the text below as
revision 0.9.0 ("I approve revision 0.9.0 and minor adjustement to revision 0.9.1"). The
hosted review of the specification change then found three things in the two rows, and
they were adjusted as revision 0.9.1: the `propertyNames` row covers `{type: string}`
only with no other keyword, because an annotation beside it is meaning and writing
nothing would drop it; its endpoint-definitions cell names its class; and a sentence says
each row classes its own keyword and no other. The specification is the text of record;
this file is the draft as it was brought, kept as the record of how it was reached.

A draft for the owner's approval, written on 23 November 2026 by the seat Firefly mends
Quench. Nothing here is in `docs/SPECIFICATION.md`, which stays at 0.8.0 until the owner
approves this text in their own words, naming the version (SPEC-CC-2).

## What it is for

Castr refuses Oak's v1 document at two response schemas. Each is a map:

```json
{
  "type": "object",
  "propertyNames": { "type": "string" },
  "additionalProperties": { "type": "string", "enum": ["ogl-compatible", "restricted"] }
}
```

The fix of that refusal (N0 of the [plan](../plans/active/after-0.8.0-next-steps.md))
changes how Castr treats two constructs, and section 12 says no code assumes an answer to
an open item. The scope-and-fidelity tables are open item SPEC-N-5. This amendment
answers it for those two constructs and for nothing else, and says how the rest of the
tables arrive. It is five changes.

## What changed since the first slice's draft

The [first slice's draft](tables-first-slice-draft-2026-11-23.md) proposed more. Four
things in it are not here.

- **The refusal of `__proto__`** was withdrawn on 23 November (the plan's reframing). A
  sentence that declares the limit is here in its place.
- **The check Castr writes and its mark** are not here. The first draft wrote a check for
  every `propertyNames`, with a mark so a reader could tell it from an author's function,
  and that needed an addition to SPEC-P-2, a change to section 11 and a fifth vocabulary
  sentence. Oak's `propertyNames` is `{type: string}`, which refuses nothing: JSON Schema
  says a property name "will always be a string". A check that cannot fail is noise in
  the consumer's code. So this amendment classes only a `propertyNames` that refuses no
  name, and writes nothing for it. Any other `propertyNames` stays in no row until a later amendment
  brings the check and its mark, and this amendment changes nothing for it. What Castr
  does with one today, read from the code on 23 November: the reader keeps it, the Zod
  writer writes a refinement for it, and the TypeScript writer refuses it as impossible;
  because one module holds both outputs, that refusal refuses the conversion. This is the seat's decision by the owner's lenses of 23 November ("what
  creates value", "what makes sense"); it is smaller than the plan's third act as
  written, and the plan is changed to match.
- **The sentence "no row, no default"** (a construct in no row receives `NOT-YET-BUILT`)
  is not here. It is right for a finished table. Approved beside a table of two rows it
  would require Castr to refuse every construct it converts today. It comes with the
  amendment that finishes a table.
- **Rows A, B, C and E** (closed, closed by reading, open, and a constrained object that
  names a property) are not here. Nothing in the fix touches them, and row E's two types
  and the rows for `properties` and `required` they lean on are not settled.

## The proposed text

### 1. Section 5, a new clause after SPEC-P-6

> - **SPEC-P-7 A property named `__proto__`.** A Zod object that allows unknown keys
>   neither checks nor returns a property named `__proto__` that a value holds as its own.
>   Castr writes no check for it. For a value that holds one, the generated Zod validator
>   can accept what the source refuses, and it returns the value without that property.
>   This is a declared limit of the Zod that Castr writes, not fidelity to the source. The
>   samples of SPEC-G-4 hold no property of that name, and every run's report states the
>   limit once.

### 2. SPEC-G-5, a third route to its one exception

The sentence that begins "The one exception is" ends "or by showing that the shape stays
unsatisfiable without it (SPEC-PR-7)." It gains, before that full stop:

> , or by naming the rule of the source format's own text under which the constraint
> refuses no value where it stands (JSON Schema Core 10.3.2.4 says of `propertyNames`
> that the name tested "will always be a string", so `propertyNames: {type: string}`
> refuses none). The check holds each such rule with the section that states it, and a
> constraint that no rule it holds names is not excused

### 3. Section 12, SPEC-N-5 reworded

From:

> - **SPEC-N-5** The scope-and-fidelity tables for the pairs of SPEC-C-1.

To:

> - **SPEC-N-5** The rows of the scope-and-fidelity tables for the pairs of SPEC-C-1
>   that Appendix B does not hold. The tables are written row by row, each row by
>   amendment.

### 4. A new Appendix B, after Appendix A and before the change log

> ## Appendix B. Scope-and-fidelity tables
>
> ### B.1 How a table is read
>
> 1. **A row is one construct kind.** It is a keyword, one value of a keyword, or
>    several keywords standing together. Where the outcome of a keyword turns on its
>    value or on the keywords beside it, the table has a row for each case, and the cases
>    are stated so that a schema holding the keyword falls in at most one.
> 2. **A row classes its own construct.** Its class is the outcome when every schema
>    inside the construct is written. A schema that holds, at any depth, a construct
>    whose outcome in a column is a located rejection receives that rejection in that
>    column.
> 3. **The columns are classed separately.** A located rejection in one column is a
>    rejection of that output. A construct carried by companion in one column names the
>    column that enforces it, and is a located rejection wherever that column rejects.
>
> ### B.2 OpenAPI 3.1 and 3.2 to Zod, TypeScript and endpoint definitions: maps
>
> These rows are for a schema whose `type` is `object` and which holds none of
> `properties`, `required`, `patternProperties`, `unevaluatedProperties`, `$ref`,
> `$dynamicRef`, `allOf`, `anyOf`, `oneOf`, `not`, `if` and `dependentSchemas`. A schema
> that holds one of those beside the keywords below is in neither row, and this appendix
> says nothing of it. `S` is the value
> of `additionalProperties` and `K` the value of `propertyNames`.
>
> | Row                                                                                           | Zod                                                                             | TypeScript                                                   | Endpoint definitions |
> | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------- |
> | `additionalProperties: S`, where `S` is a schema other than `true`, `{}` and `false`          | Carried: `.catchall(S)` on `z.strictObject` with no properties                  | Carried: an index signature over `string` of the type of `S` | By companion (Zod)   |
> | `propertyNames: K`, where `K` is `true`, `{}`, or `type: string` with only annotations beside | Carried: nothing is written, because every property name is a string (SPEC-G-5) | Carried: nothing is written                                  | Nothing is written   |
>
> The annotations are the keywords of JSON Schema Validation section 9 (`title`,
> `description`, `default`, `deprecated`, `readOnly`, `writeOnly`, `examples`).

### 5. The front matter and the change log

`version: 0.9.0`, the date of approval, and a change-log row that names the four changes
above, with the owner's words and the hash as SPEC-CC-2 requires.

## What was run

In scratch under `lib/tests-picture/.tmp`, with Zod 4.6.7, Ajv for JSON Schema 2020-12
reading own properties, and the TypeScript compiler. Every expected outcome was written
by hand first.

- **The two rows.** Seven schemas, 26 values: Oak's shape; `K` as `true`, as `{}`, and as
  `{type: string}` with annotations; no `propertyNames`; `S` an object; `S` a reference
  to the map itself. The hand expectation, the reference validator on the source and the
  Zod the rows give agreed on all 26. The value the Zod returns equals the input.
- **The TypeScript.** `{ [key: string]: V }` is assignable both ways with the input type
  and with the output type of the Zod, under `strict`, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess` and `noPropertyAccessFromIndexSignature`. With the value
  type changed to one that is wrong, the compiler refuses it, so the check can fail.
- **The limit of SPEC-P-7.** `{"__proto__": "zzz"}` is refused by the reference validator
  on Oak's shape and accepted by the Zod. That is the difference the clause declares.
- **The first slice's sixteen composition cases, without its check for `__proto__` and
  without the samples that hold the name:** 64 values, none differ.

## What the amendment leaves open, on purpose

- Every schema row but these two, and every `propertyNames` that can refuse a name.
- The closed reading across composition. It is a candidate under test (the
  [trial](closed-reading-trial-2026-11-23.md)) and no words on it are proposed.
- Whether anything stops Oak's document after these two schemas. A document refused at
  its first stop shows no later one.

## What follows approval

The specification changes in its own pull request, with the owner's words and the hash in
the change log. Then the fix (N0), test first, under the conditions the plan records.

## Appendix: the cases for the two rows, as run

Save the block as a `.mts` file in `lib/tests-picture/.tmp` and run
`npx tsx tests-picture/.tmp/<name>.mts` from `lib`. It exits with a failure if any value
differs, or if the value the Zod returns for any accepted value is not the input (twelve of
the 26 are accepted). The four assignments near its end are the
TypeScript check, read by the compiler (`npx tsc --ignoreConfig --noEmit --strict
--exactOptionalPropertyTypes --noUncheckedIndexedAccess
--noPropertyAccessFromIndexSignature --module nodenext --moduleResolution nodenext
--target es2022 --skipLibCheck` on the file; the one error it reports is the missing
Node types for `process`). The fourth case holds annotations beside `type: string`,
which revision 0.9.1 takes out of the row; it was run and agrees on what is accepted.

```ts
import { z } from 'zod';
import { Ajv2020 } from 'ajv/dist/2020.js';
// The rows proposed for 0.9.0, each expectation written by hand first.
// D: additionalProperties S (not true, {} or false), no named property -> z.strictObject({}).catchall(S).
// F: propertyNames K where K refuses no string (true, {}, {type: string}) -> nothing written.
const P = (j: string) => JSON.parse(j) as unknown;
const ab = z.enum(['ogl-compatible', 'restricted']);
const S = { type: 'string', enum: ['ogl-compatible', 'restricted'] };
const map = z.strictObject({}).catchall(ab);
const Tree: z.ZodType = z.strictObject({}).catchall(z.lazy(() => Tree));
const cases: { name: string; schema: object; zod: z.ZodType; values: [string, boolean][] }[] = [
  {
    name: 'Oak: names {type: string}',
    schema: {
      type: 'object',
      propertyNames: { type: 'string' },
      additionalProperties: S,
      example: { a: 'restricted' },
    },
    zod: map,
    values: [
      ['{}', true],
      ['{"x":"restricted"}', true],
      ['{"x":"restricted","y":"ogl-compatible"}', true],
      ['{"x":"zzz"}', false],
      ['{"x":1}', false],
      ['{"":"restricted"}', true],
      ['3', false],
      ['null', false],
      ['[]', false],
      ['"s"', false],
    ],
  },
  {
    name: 'names true',
    schema: { type: 'object', propertyNames: true, additionalProperties: S },
    zod: map,
    values: [
      ['{"x":"restricted"}', true],
      ['{"x":1}', false],
    ],
  },
  {
    name: 'names {}',
    schema: { type: 'object', propertyNames: {}, additionalProperties: S },
    zod: map,
    values: [
      ['{"x":"restricted"}', true],
      ['{"x":null}', false],
    ],
  },
  {
    name: 'names {type: string} with annotations',
    schema: {
      type: 'object',
      propertyNames: { type: 'string', description: 'a slug', title: 'Slug' },
      additionalProperties: S,
    },
    zod: map,
    values: [
      ['{"x":"restricted"}', true],
      ['{"x":[]}', false],
    ],
  },
  {
    name: 'no names keyword',
    schema: { type: 'object', additionalProperties: { type: 'integer', minimum: 0 } },
    zod: z.strictObject({}).catchall(z.int().min(0)),
    values: [
      ['{}', true],
      ['{"a":0}', true],
      ['{"a":-1}', false],
      ['{"a":1.5}', false],
    ],
  },
  {
    name: 'S is an object',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: { n: { type: 'number' } },
        required: ['n'],
        additionalProperties: false,
      },
    },
    zod: z.strictObject({}).catchall(z.strictObject({ n: z.number() })),
    values: [
      ['{"a":{"n":1}}', true],
      ['{"a":{"n":1,"z":2}}', false],
      ['{"a":{}}', false],
    ],
  },
  {
    name: 'S refers to the map itself',
    schema: {
      $defs: { T: { type: 'object', additionalProperties: { $ref: '#/$defs/T' } } },
      $ref: '#/$defs/T',
    },
    zod: Tree,
    values: [
      ['{}', true],
      ['{"a":{"b":{}}}', true],
      ['{"a":{"b":1}}', false],
    ],
  },
];
const ajv = new Ajv2020({ strict: false, ownProperties: true });
let wrong = 0,
  n = 0,
  produced = 0;
for (const c of cases) {
  const v = ajv.compile(c.schema);
  for (const [text, expected] of c.values) {
    n++;
    const value = P(text);
    const r = v(value),
      parsed = c.zod.safeParse(value),
      zz = parsed.success;
    if (r !== expected || zz !== expected) {
      wrong++;
      console.log('DIFFERS', c.name, text, { expected, reference: r, zod: zz });
    }
    if (parsed.success) {
      produced++;
      if (JSON.stringify(parsed.data) !== JSON.stringify(value)) {
        wrong++;
        console.log('PRODUCED DIFFERS', c.name, text, JSON.stringify(parsed.data));
      }
    }
  }
}
// Every accepted value is also compared with what the Zod returns (SPEC-G-4, produced side).
// The declared limit: an own property named __proto__ is dropped, so a value the source refuses is accepted.
const proto = P('{"__proto__":"zzz"}');
console.log(
  'cases',
  cases.length,
  'values',
  n,
  'differ',
  wrong,
  '| accepted values whose returned value was compared',
  produced,
  '| limit: reference',
  ajv.compile(cases[0]!.schema)(proto),
  'zod',
  map.safeParse(proto).success,
);
// Types: the TypeScript the row gives, mutually assignable with each side of the Zod.
type T = { [key: string]: 'ogl-compatible' | 'restricted' };
const a1: T = {} as z.input<typeof map>;
const a2: z.input<typeof map> = {} as T;
const a3: T = {} as z.output<typeof map>;
const a4: z.output<typeof map> = {} as T;
void [a1, a2, a3, a4];
if (wrong > 0) process.exit(1);
```
