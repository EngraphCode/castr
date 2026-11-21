# The picture

The picture is one repeatable command that shows what Castr does, judged from outside
Castr. Its rows are the construct kinds of the formats Castr reads. Its columns are what a
consumer takes: the Zod validators, the TypeScript types and the endpoint definitions.
Each cell says whether Castr is right, refuses in plain words, is wrong, emits nothing or
crashes.

This directory is being built in steps. It holds the rows, the outcome proposed for each,
and four kinds of case:

- **A deciding case** for every row of a schema whose construct decides which values are
  accepted. It fills the Zod and TypeScript columns.
- **A structure case read from the Zod validators** for every row of a schema that
  decides no value and that the Zod output is proposed to carry as structure (39 rows).
- **A structure case read from the endpoint definitions** for every row of the document
  outside a schema that they are proposed to carry as structure. It fills the
  endpoint-definition column.
- **A structure case read from the exported types** for every row the TypeScript output
  is proposed to carry and that no value of a shape shows (63 rows: 56 outside a schema
  and seven of a schema).

Not built yet:

- the rows of the document outside a schema, in the Zod column (56 rows proposed as
  carried or carried as structure there);
- Oak's document and the example documents.

[`unexercised`](cases/coverage.ts) computes the first, `pnpm picture` prints the count
for each output, and [`cases/coverage.e2e.test.ts`](cases/coverage.e2e.test.ts) holds
them.

### Why the first has no cases yet

The specification says where these rows are carried (SPEC-C-1): the types are a `paths`
type keyed by path template, method, parameter location, status and media type, and the
Zod schemas are "addressable by component name and by operation, response status and
media type". It does not yet say what form that addressing takes, which is the public
surface (SPEC-N-4).

A trial that read the validators alone, with nothing that contains them, found what they
hold by themselves: a parameter's name, whether it is required, and the schema in a
parameter, a request body and a response. Nothing in them holds a path, a method, a
status code or a media type. Today the only thing in the generated module that addresses
a validator by any of those is the endpoint definitions, and that column has its cells.
Castr emits no `paths` type.

So a case for these rows has to know where to look, and for Zod that waits on the form
of the addressing. The proposals are left as they are. The TypeScript column does not
wait: its cases read every type the module exports, wherever it is, and say so below.

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

### The Zod column, for a construct that decides no value

A row such as `title` decides no value, so no sample can show it. Its case is of the
kind the endpoint-definition column uses, described below
([`cases/schema-structure-cases.ts`](cases/schema-structure-cases.ts)): two whole
documents, one whose schema holds the construct and a control without it, or with another
value. Castr generates a module from each and the module is loaded. Every Zod validator it
exports is read as the JSON Schema Zod gives for it, under the name it is exported by, and
the same judge says whether what the construct states is held there and not in the
control's.

Nine of the 39 cases state no value that can be searched for, and ask only that the
validators differ from the control's. That is the weaker proof.

What a cell here does not show:

- **A source comment is not held.** A construct Castr wrote only as a comment in the
  generated text would read missing. When the cases were written the generated text was
  read beside the validators for each, and no stated value was in one and not the other.
  No test holds that.
- **What Zod's JSON Schema does not show is not seen**, with one exception. Zod gives the
  same JSON Schema for a discriminated union as for a plain choice, so the property a
  discriminated union discriminates on is added to the reading
  ([`cases/projection.ts`](cases/projection.ts)).
- **Right includes copying without understanding.** Castr copies the `xml` and
  `externalDocs` objects whole into the validator's metadata, including a field that does
  not exist. The 15 right cells for those objects' fields record that one behaviour, and
  do not show that Castr knows any field.
- **Held is not the same as held harmlessly.** A `default` written as Zod's `.default()`
  would read right, and it also changes what the validator accepts. `example` reads right
  today because its value is held under `examples`, another keyword.
- **A refusal is the module's, not the column's.** Castr writes the validators and the
  types into one module, so a refusal that gives TypeScript as its reason, as the one for
  `$dynamicAnchor` does, leaves the Zod cell refused too.

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

### The TypeScript column, for a construct that decides no value

A row outside a schema, and a row of a schema that decides no value, has no sample for
the compiler to decide. Its case is a pair of documents
([`cases/typescript-structure-cases.ts`](cases/typescript-structure-cases.ts)): the pair
the Zod or the endpoint-definition column uses for the row, and one pair of its own, for
a named schema. They are read from the types: the compiler resolves every type the
generated module exports at its top level, and each is reduced to plain values under
the name it is exported by
([`cases/typescript-structure.ts`](cases/typescript-structure.ts)). The module read is
the one generated without endpoint definitions, as for the other TypeScript cases. The
verdicts are those of the endpoint-definition column, described next.

What is read:

- **The resolved type, not its text.** An alias and an interface of one type read the
  same, as does a union whatever order its members were written in, and a type exported
  after it is declared.
- **Documentation comments and their tags**, on a type and on a property, because a
  description and a deprecation are carried there. Any other comment is not read, nor
  is the documentation of a value that shares a type's name.
- **Whether a property is optional, and whether it is written `readonly`.**
- **Only types.** A value the module exports is not read, whatever its type.
- **A module that exports no type** reads as a set of types with nothing in it, so a
  construct that adds the first type is seen.

The limits of the reading:

- **Right says the value is somewhere in the exported types.** The specification names
  the place for a row outside a schema: a `paths` type, with `operations`, `components`
  and `webhooks` (SPEC-C-1). Castr exports none of those today, and the cases do not
  look for them. The three cells that read right are a named schema, exported as a type
  under its name (two rows), and a request body written in place, exported as a type
  named for its operation.
- **Missing has one reason on all 57 rows:** the types are the same with the construct
  and without it. In these cases Castr exports a type for a named schema and for a
  request body, and for nothing else of a document.
- **A use of a named type reads as the type written in place.** The type is resolved,
  so a reference to a component and the component's content written out are the same.
  The `$ref` row can therefore only read missing here, however the reference is held.
- **Some rows have no place in a type.** A discriminator changes no member of a union,
  and `$id`, `$anchor` and `$defs` change no type; only a documentation comment could
  hold them. Their cell does not tell "dropped" from "nowhere to go". That is a
  question about what is proposed for them.
- **Not seen:** a property made readonly by a mapped type such as `Readonly`, a readonly
  index signature, a rest element or a label in a tuple, a type inside an exported
  namespace, and an intersection as the single object it comes to. A function type is
  told apart by its signature as the compiler writes it. Castr writes none of these
  today.
- **A type is read 40 levels deep.** A type that contains a part more than once is read
  again each time, which is slow for a large document.
- **A refusal is the module's**, as in the Zod column.

### The endpoint-definition column

A row of the document outside a schema decides no value, so its case is of another kind
([`cases/structure-cases.ts`](cases/structure-cases.ts)): two whole documents, one that
holds the construct and a control that is the same without it, or with another value.
Castr generates a module from each, the module is loaded, and what it exports as
`endpoints` is reduced to plain values ([`cases/projection.ts`](cases/projection.ts)); a
Zod validator there is read as the JSON Schema Zod gives for it. The names the module
exports are read with it, because a named component is held by the name it is exported
under and by no value inside the definitions.

The judge assumes nothing about the shape of the endpoint definitions
([`cases/structure-verdict.ts`](cases/structure-verdict.ts)):

| Cell       | Meaning                                                                               |
| ---------- | ------------------------------------------------------------------------------------- |
| right      | The value the construct states is in the definitions, and is not in the control's.    |
| wrong      | The definitions change and do not hold the value, or do not tell it from another.     |
| missing    | The definitions are the same without the construct, or the module exports none.       |
| refused    | Castr gave an error of its own for the document.                                      |
| crashed    | Castr failed with a fault of the runtime, or emitted a module that does not load.     |
| not judged | The control holds the value too, or could not be converted: the case decides nothing. |

Some constructs are a choice among values, as the location of a parameter is. Such a
case also names documents that give the construct each other value, and the definitions
must differ from those made from each. Without that, a cookie parameter written as a
header parameter would read right, because its name is held.

A row that no pair of valid documents can isolate has no case, and its cell is not
judged, with the reason ([`ROWS_NO_CASE_ISOLATES`](cases/structure-cases.ts)). There are
two: a parameter in the path cannot move to another location while its template stays,
and `simple` is the only style a header has.

Where a construct states no value that can be searched for, as a boolean does, the case
asks only that the definitions differ from the control's. That is the weaker proof.

A right cell says the value is somewhere in the endpoint definitions. It does not say the
value is in the right place, or that a consumer can use it there.

[`cases/right-today.ts`](cases/right-today.ts) lists the rows that are right today, for each kind of case.
The `*-cases.gen.test.ts` file for each kind of case holds its list to exactly the rows
that are right: a row that stops being right fails it, and so does a row
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
