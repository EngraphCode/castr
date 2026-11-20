# The picture

The picture is one repeatable command that shows what Castr does, judged from outside
Castr. Its rows are the construct kinds of the formats Castr reads. Its columns are what a
consumer takes: the Zod validators, the TypeScript types and the endpoint definitions.
Each cell says whether Castr is right, refuses in plain words, is wrong, emits nothing or
crashes.

This directory is being built in steps. It holds the rows and the outcome proposed for
each. No case runs Castr yet, so no cell says what Castr does today.

## Run it

```bash
pnpm picture        # print the rows and their proposed outcomes as tables
pnpm test:picture   # check the rows are whole and the proposals keep to the bars
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

## A newer definition

A newer revision of a definition is a new pin: add the file, record it in
`provenance.json` and in [`docs/THIRD_PARTY_NOTICES.md`](../../docs/THIRD_PARTY_NOTICES.md),
and keep the old file until nothing reads it.
