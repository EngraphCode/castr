# Amendment 0.9.0, proposed: the two rows that stop Oak's document

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
  name, and writes nothing for it. Any other `propertyNames` stays in no row, and Castr
  goes on refusing it as it does today, until a later amendment brings the check and its
  mark. This is the seat's decision by the owner's lenses of 23 November ("what
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
