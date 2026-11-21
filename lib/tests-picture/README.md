# The picture

The picture is one repeatable command that shows what Castr does, judged from outside
Castr. Its rows are the construct kinds of the formats Castr reads. Its columns are what a
consumer takes: the Zod validators, the TypeScript types and the endpoint definitions.
Each cell says whether Castr is right, refuses in plain words, is wrong, emits nothing or
crashes.

This directory is being built in steps. It holds the rows, the outcome proposed for each,
and a case for every row of a schema whose construct decides which values are accepted.
Those cases fill two columns: the Zod output and the TypeScript output. The
endpoint-definition column, the rows that are carried as structure, the rows of the
document outside a schema, Oak's document and the example documents have no case yet.

## Run it

```bash
pnpm picture        # print what Castr does today, and the rows with their proposed outcomes
pnpm test:picture   # check the rows are whole, the bars hold, and the cells that are right stay right
```

## Where the rows come from

A row list written by hand is only as complete as its writer. So the rows are computed
from the formats' own published definitions, copied into
[`__fixtures__/definitions/`](__fixtures__/definitions/) and pinned by SHA-256 in
[`provenance.json`](__fixtures__/definitions/provenance.json). Every read recomputes the
hash and refuses bytes that do not match.

| Rows                                       | Read from                                       |
| ------------------------------------------ | ----------------------------------------------- |
| The 57 schema keywords                     | the seven JSON Schema 2020-12 vocabulary files  |
| The keywords OpenAPI adds to a schema      | the OpenAPI 3.1 base vocabulary and the 3.2 one |
| Every other object and field of a document | the OpenAPI 3.1 and 3.2 document schemas        |

A published definition is evidence about a format. It is not the format. The OpenAPI 3.1
document schema spells the Link Object's `server` field as `body`;
[`rows/published-rows.ts`](rows/published-rows.ts) corrects that by name, and the reading
reports a correction that stops applying. Constructs that only the specifications' text
defines (the values of `format`, boolean schemas, a keyword no vocabulary defines) cannot
be computed. They are listed by hand in [`rows/schema-proposals.ts`](rows/schema-proposals.ts),
each with the section that defines it, and are the part of the rows most likely to be
missing one.

The two dialect files and the format-assertion vocabulary are pinned with the rest and
no code reads them yet.

## How a definition is read

[`rows/inventory.ts`](rows/inventory.ts) reads one definition into objects and fields:

- A reference that composes an object is resolved, so a field factored out of an object
  is still counted on it (`example` on a parameter).
- A reference that is a field's value is another object and is not followed.
- A field with a fixed set of values lists them, because each value is a construct of its
  own (the four parameter locations).
- A definition that is a choice between an object and a reference is not an object.

Each rule is proved on a small definition in
[`rows/inventory.unit.test.ts`](rows/inventory.unit.test.ts), with no file read.
[`rows/published-rows.e2e.test.ts`](rows/published-rows.e2e.test.ts) then reads the pinned
files and states facts the specifications give, so a rule that loses a field or merges
two objects on the real definitions fails. A reference with no target, a correction that
stops applying and fields declared where the reading does not look are all reported, and
that test fails on any report.

## The proposed outcomes

Every row has a proposed outcome in each of three columns: the Zod output, the TypeScript
output and the endpoint definitions. An outcome is one of the specification's four
classes (carried, carried as structure, carried by companion, unexpressible), or one of
two the owner decided on 20 November 2026 and the specification does not yet hold:

- **outside the target:** the target is not a place for this part of meaning. No part of
  a schema is ever outside a target.
- **read:** a declaration a reader spends in reading. There are four: `openapi`,
  `jsonSchemaDialect`, `$schema` and `$vocabulary`.

The proposals are in [`rows/schema-proposals.ts`](rows/schema-proposals.ts) and
[`rows/object-proposals.ts`](rows/object-proposals.ts). They are proposals: the
specification's scope-and-fidelity tables are not yet written, and nothing here amends
it. [`rows/table.ts`](rows/table.ts) joins them to the computed rows and reports:

- a computed row with no proposal, and a proposal for a row that was not computed;
- a part of a schema proposed as outside a target;
- a row proposed as read that is not one of the four, and one of the four proposed as
  anything else.

[`rows/picture-rows.e2e.test.ts`](rows/picture-rows.e2e.test.ts) fails on any report.

## The cases

A case is a schema that exercises one construct kind, and sample values the construct
decides ([`cases/schema-cases.ts`](cases/schema-cases.ts)). Each case is one whole
document, read by a reference and by Castr:

- **The reference:** Ajv for JSON Schema 2020-12, with `format` asserting. It is
  independent of Castr ([`cases/reference.ts`](cases/reference.ts)).
- **Castr:** its public generation function, and the one module it generates
  ([`cases/castr-convert.ts`](cases/castr-convert.ts)). That module holds a Zod validator
  and a TypeScript type for the shape, and each has a column.

### The Zod column

The generated module is loaded and its validator is run on every sample. The cell is what
comparing its decisions with the reference's gives ([`cases/verdict.ts`](cases/verdict.ts)):

| Cell       | Meaning                                                                           |
| ---------- | --------------------------------------------------------------------------------- |
| right      | Castr decides every sample as the reference does.                                 |
| wrong      | Castr decides at least one sample differently; the cell names each.               |
| refused    | Castr gave an error of its own for a valid document.                              |
| crashed    | Castr failed with a fault of the runtime, or emitted a module that does not load. |
| missing    | Castr ran and emitted no validator for the shape.                                 |
| not judged | The reference has no checker for the case, so nothing is claimed.                 |

A right cell means Castr agreed with the reference on that case's samples. The count of
right cells is therefore an upper bound: review of the first cases moved six cells from
right to wrong by supplying a sample that told the two validators apart, and a sharper
sample can move more. It does not
mean the construct is right in every combination, and it is not the proof the
specification asks for (SPEC-G-4, SPEC-G-5).

### The TypeScript column

The judge of a type is the TypeScript compiler, which is outside Castr
([`cases/typescript-type.ts`](cases/typescript-type.ts)). Each sample is declared as a
constant of the type that only that value inhabits, and assigned to the generated type:
the compiler's error, or its silence, is the type's decision on the sample. The constant
is not a literal, so a property the type does not name is not an error.

What right means depends on what is proposed for the row
([`typescriptReadingFor`](cases/coverage.ts)):

- **A row TypeScript is proposed to carry** (20 cases): the type decides every sample as
  the reference does.
- **A row proposed as carried by companion** (54 cases): the type admits every sample the
  reference accepts. It may admit more, because the Zod validator is what refuses them.
  This is a weak statement: a type of `unknown` passes it. It catches a type that is
  narrower than the source, as `bigint` is for an `int64` that arrives as a JSON number.

A module that does not compile is a crashed cell, and a module with no exported type for
the shape is a missing one. The other cells are as for Zod.

Where a case's schema leans on a second construct that only a validator can decide, a
type that is right about the first still disagrees with the reference. The `allOf` and
`$ref` cases were changed for that reason, to schemas that `type` alone decides.

[`cases/right-today.ts`](cases/right-today.ts) lists the rows that are right today, for each column.
[`cases/schema-cases.gen.test.ts`](cases/schema-cases.gen.test.ts) holds that list to
exactly the rows that are right: a row that stops being right fails it, and so does a row
that becomes right and is not added. The list records what is true. It does not accept
the rows that are missing from it. The same test fails if a row that needs a case has
none, and if a case holds no value its schema refuses.

The reference is not the source. Where Ajv is looser than the text that defines a
construct, a case cannot show Castr wrong by it, and a sample that only exposes Ajv's
looseness is left out: Ajv accepts every number for `format: float`, so a number beyond the
single-precision range, which Castr's output refuses, is not a sample. Those cells need a
second reference, or a case judged against the text.

Each case is also run against a control: its schema with the named keyword taken out
([`cases/control.ts`](cases/control.ts)). A case whose samples are decided the same with
the keyword as without it exercises nothing. Three cases are in that state, and the test
names them: `int64`, `float` and `double`, for which the reference accepts every number.
The `float` and `double` cells read right and prove nothing about the format.

Four `format` values are not judged, because Ajv has no checker for them (`idn-email`,
`idn-hostname`, `iri`, `iri-reference`).

## A newer definition

A newer revision of a definition is a new pin: add the file, record it in
`provenance.json` and in [`docs/THIRD_PARTY_NOTICES.md`](../../docs/THIRD_PARTY_NOTICES.md),
and keep the old file until nothing reads it.
