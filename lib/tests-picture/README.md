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
- the example input library's documents, which are not pinned yet.

[`unexercised`](cases/coverage.ts) computes the first, `pnpm picture` prints the count
for each output, and [`cases/coverage.e2e.test.ts`](cases/coverage.e2e.test.ts) holds
them.

It also runs Castr on whole documents: Oak's, and the examples already in the
repository. See [Whole documents](#whole-documents).

And it judges small documents against the publisher's own schemas, with a validator
that is not Castr's. See [What the reader refuses](#what-the-reader-refuses).

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

## Whole documents

[`documents/documents.ts`](documents/documents.ts) lists Oak's curriculum API document at
the version the specification names as its corpus, and the 14 example documents in
[`lib/examples`](../examples). `pnpm picture` runs Castr on each from its file, as a
consumer would, and prints one line for each with a cell for each output:

- **converted**: Castr generated a module and the output in it can be used. The module
  compiles and loads, and holds at least one of the output. The cell gives the count.
- **nothing**: the module compiles and loads, and holds none of the output. That does
  not say whether the document asks for any: a document of webhooks alone gives no
  endpoint definition, and one with no named schema gives no validator and no type.
- **refused**: Castr raised an error of its own and generated nothing.
- **crashed**: the runtime faulted, or the module does not load or compile.

A document has no proposal: what is proposed is said row by row. And converted is not
right. A document converts when none of its constructs is refused or crashes, and the
rows say which of the constructs it uses are then held wrongly or dropped.

Today Castr converts Oak's document in every output, and no example is refused or
crashes: ten convert in every output, and four have an output the module holds none of.
[`documents/documents.gen.test.ts`](documents/documents.gen.test.ts) holds that.

### The rows a document uses

A document's line says whether it converts. What stands between it and a right
conversion is said by the rows, so `pnpm picture` also walks each document
([`documents/rows-used.ts`](documents/rows-used.ts)) and names every row it states a
construct of, then sets those rows against today's cells
([`documents/usage.ts`](documents/usage.ts)). It prints a count for each document and
each output, and for Oak's document the rows that are not right.

In the Zod output none of the rows Oak's document uses is refused, and
[`documents/documents.gen.test.ts`](documents/documents.gen.test.ts) holds that no row it
uses stops it. Which of its rows are not right is printed by `pnpm picture` and is not
repeated here, where it would go out of date.

Three rows are narrower than the row of their keyword, and a schema in one of them is
named by it and not by the keyword ([`documents/map-rows.ts`](documents/map-rows.ts)):
`additionalProperties: false`, and the two rows of a map the specification's Appendix B.2
holds. The keywords' own rows keep their cases, which are schemas none of the three
covers, and Castr still refuses those. The `false` of a closed object is part of its row
and is not counted again as a schema: every `false` that stands where a schema stands in
Oak's document is the value of `additionalProperties`.

How to read it:

- **A row is used where the document writes its construct.** A construct in force by
  default, such as a parameter's `style`, is not named unless written. A reference is
  not followed; what it points at is walked where it is declared, so a file a document
  refers to outside itself is not walked.
- **The cells are the cases' cells.** Each was made from a small document written for
  one row. A construct right there is not thereby right beside the others a real
  document holds, and the count says nothing of a combination.
- **The walk is checked against every case**
  ([`documents/rows-used.e2e.test.ts`](documents/rows-used.e2e.test.ts)): each of the
  211 cases' documents must name the row it was written for, and no whole document may
  state a field that is no row.
- **Where each object of a document is found is a table written by hand** in the walk,
  not computed from the definitions. That check is what holds it.
- **A keyword only OpenAPI 3.0 has**, such as `nullable`, is named as a keyword no
  vocabulary defines, which is what it is in 3.1.

Eight of the examples say they are OpenAPI 3.0, which the specification has Castr
read. The picture's rows are those of 3.1 and 3.2, so no row speaks for a construct only
3.0 has, and those lines say what happens to the document and no more. Where an example
is held as YAML and as JSON the YAML is read.

## What the reader refuses

Specification 0.8.0 says when the reader of an OpenAPI document refuses it (SPEC-FV-1)
and which rules it holds that no schema does (SPEC-FV-2). The picture's cells for that
are being built in slices. Two are here: the judge of case 4 with what a change of the
publisher's schema revision does, and an input for each of cases 1 to 4 with what Castr
does with it.

- **The cases are decided outside Castr.**
  [`refusals/reader-cases.ts`](refusals/reader-cases.ts) holds 29 small inputs and
  decides, for each, the first case of SPEC-FV-1 that holds: the text parses as neither
  JSON nor YAML 1.2 (the `yaml` package, which Castr's reader does not use); a `swagger`
  field, or an `openapi` field that does not match the pattern either pinned schema
  gives; a `jsonSchemaDialect`, or the `$schema` of a schema directly under
  `components.schemas`, that is a string and is neither the line's OpenAPI dialect nor
  Draft 2020-12; a failure of the publisher's schema at the revision 0.8.0 names.
- **What Castr does is set against it.** Each input is written to a file and given to
  Castr as a consumer would give it. No case and Castr reads it: right. A case holds and
  Castr reads it: `reads it`, which is wrong. A case holds and Castr refuses:
  `refuses, with no kind`, because the specification's refusal is a `NOT-READ` rejection
  that names its case, and nothing in what Castr says is that yet. Such a cell is not
  counted right, and it does not say Castr refused for the right reason: `openapi:
4.0.0` is refused today with "version must be a string". Castr's own words are shown
  beside each verdict for that. `pnpm picture` prints the section, and
  [`refusals/reader-cases.gen.test.ts`](refusals/reader-cases.gen.test.ts) holds, for
  every input, the case decided, Castr's verdict and Castr's words.
- **Limits of what is decided.** The line's dialect is taken to be the address its
  publisher gives: `.../oas/3.1/dialect/base` or that with a date for `base`, and for
  3.2 the address with a date. Of those, only an address that some pinned file of the
  publisher's names is known to be one it gives; another of that form, such as a date
  it never issued, is not decided. Addresses are compared as written, with no equivalence
  of URIs applied; whether a fragment or a difference of case names the same dialect is
  for the amendment on references to say. A dialect that is not a string names none: as the
  document's it is left to case 4, and as a schema's it is not decided, because the
  publisher's plain schema does not look inside a Schema Object. A text that is well formed and holds a value JSON cannot state,
  such as `1e999`, is not decided, unless case 2 or 3 already holds for it. JSON with a key twice is read last wins. A `$schema`
  deeper than a component schema is not looked for. Case 4 is the document against the publisher's schema; whether each Schema
  Object passes its dialect's meta-schema is not decided, because `schema-base` is
  pinned only at the latest revision. A text that both parsers refuse is case 1 even
  where one of them is stricter than its format's text.

- **The judge is outside Castr.** [`refusals/judge.ts`](refusals/judge.ts) runs a
  document against one pinned schema of the OpenAPI Initiative's and says whether it
  passes and where it fails. The validator is `@hyperjump/json-schema`. Of the
  publisher's schemas it judges only by the pinned files: a schema that is not pinned
  is an error, including the undated copies the validator carries, and the http, https
  and file schemes are removed before anything is judged. The JSON Schema 2020-12
  meta-schema that the two dialects refer to is the validator's own copy; the picture's
  pinned copies of its vocabularies are not what the judge reads.
- **Why not Ajv,** which judges the values of the other cases. The publisher's schemas
  reach a Schema Object through `"$dynamicRef": "#meta"` with the anchor under `$defs`.
  Ajv 8.20.0 honours a dynamic anchor only at a schema's root, so under those schemas it
  refuses `{"type": "string"}` as a Schema Object.
- **How the judge was chosen.** On 22 November 2026, in a trial outside this
  repository, 31 small documents were each judged against three pinned schemas of 3.1
  and three of 3.2 by this validator and by the Python `jsonschema` 4.25.1, which shares
  no code with it. They agreed on all 186 outcomes. A third, `json-schema-library`
  11.6.16, disagreed with both on two and was wrong on each: it loses a property
  evaluated through `dependentSchemas`. The trial's documents are the ones in
  [`refusals/revision-cases.e2e.test.ts`](refusals/revision-cases.e2e.test.ts), where
  two that repeated others are left out: 28 cases and a document with no `info`, each as
  3.1 and as 3.2, each against three schemas, 174 outcomes. The test recomputes them
  with the judge. The Python validator is not in this repository.
- **What a change of revision does.** Case 4 is judged "at the revision this section
  names". [`refusals/revision-cases.ts`](refusals/revision-cases.ts) holds 28 small
  documents, each stamped as 3.1 and as 3.2, and `pnpm picture` lists the ones the
  revision 0.8.0 names and the latest pinned revision judge differently: 16 of 56. The
  list is of the documents tried, not of every document that differs.
- **`schema` and `schema-base`.** The plain `schema` accepts any object or boolean as a
  Schema Object; `schema-base` also judges each by the line's dialect, so it refuses
  `{"type": 5}`. The test holds both. The picture's section compares the plain `schema`,
  which is the one 0.8.0 names.

Not built yet: an input for case 5, which needs a resolver of references outside Castr;
a judge outside Castr for each rule SPEC-FV-2 lists; a 3.0.x and a 2.0 document from the
example library, which the specification's check also runs.

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

A published definition is evidence about a format. It is not the format. Revision
2022-10-07 of the OpenAPI 3.1 document schema spelt the Link Object's `server` field as
`body`, and revision 2025-09-17 of the 3.2 one gave a Media Type Object a `description`
and a Header Object an `allowReserved` that the specification's text does not; the
revisions read now agree with the text in all three. Where a definition and the text
differ, [`rows/published-rows.ts`](rows/published-rows.ts) corrects the field by name, and
the reading reports a correction that stops applying. No correction is needed today.
The keywords of JSON Schema Draft-07 are computed the same way, from its one pinned
meta-schema. No row of the picture uses them: Draft-07 is not a schema dialect of OpenAPI
3.1 or 3.2. They are listed because the model's design is made against every format the
specification names (SPEC-AR-2), and the tests state how the two drafts differ: three
keywords of Draft-07 that no vocabulary of Draft 2020-12 holds (`additionalItems`,
`definitions` and `dependencies`), and fourteen that only Draft 2020-12 has.

The vocabularies are not the whole of what a Draft 2020-12 document may hold. The
dialect's meta-schema, pinned beside them, names the seven vocabularies and also
constrains four names that are in none of them, marking each deprecated: `definitions`,
`dependencies`, `$recursiveAnchor` and `$recursiveRef`. They are not keywords of a
vocabulary, and the picture lists them apart from the keywords. So the 2020-12 dialect
still constrains two of Draft-07's three, and neither defines nor constrains
`additionalItems`.

That does not keep `additionalItems`, or any other name, out of a 2020-12 document. The
core text says a schema may hold properties that are not keywords and that an unknown
keyword should be treated as an annotation (section 4.3.1), and the meta-schema forbids
no name. The validation text (Appendix A) says implementations should assume
`definitions` behaves as `$defs` under that meta-schema, and says what `dependencies`
was replaced by without saying what it now does. What a document that uses any of these
means is for the list made by hand.

Zod's constructs are read from the installed package's own types, through the compiler
([`rows/zod-constructs.ts`](rows/zod-constructs.ts)). Every schema and every check of
Zod holds a definition, and Zod's core module exports an interface for each. The reading
takes every exported interface that holds a definition: 48 schemas across 39 kinds, each
with the fields its definition holds, and 16 checks each with its fields. It also lists
the 50 string formats Zod defines a schema or a check for, each with its own fields, and
the number and bigint formats. No row of the picture uses them; they are listed for the
same reason as Draft-07's keywords.

Zod states unions of its own for its schemas, its checks and the names of its string
formats, and none of the three is complete. Each entry says whether Zod's union lists
it. Nine schemas are left out, among them `$ZodDiscriminatedUnion`, `$ZodXor`,
`$ZodExactOptional` and `$ZodCodec`; so is one check, `$ZodCheckProperties`; and the
list of format names holds 32, leaving out 19 formats Zod defines (`mac`, `hex`,
`hostname`, the currency code and the fifteen hash formats) and naming one,
`json_string`, with no definition of its own.

The list is read at one pinned version, and the test that compares the installed version
with the pin fails on any other, so the list is read again when Zod moves.

A definition is what a schema holds; a function or a method is how an author gets one.
[`rows/zod-builders.ts`](rows/zod-builders.ts) reads the second and sets it against the
first and against Appendix A of the specification:

- **By type:** the 146 functions Zod exports that return a schema or a check, the 24
  methods every schema has that return one, and, for each of 23 kinds, the 118 methods
  only that kind has that return one (an object's `strict`, `loose`, `strip`,
  `passthrough` and `catchall` among them). A method that returns anything else, such as
  a function schema's `implement`, is not listed.
- **By running:** one example of each construct Appendix A names is built, and what it
  leaves in the schema is read: its class, its kind, its fields, its checks, and the kind
  of each field that is itself a schema. A schema held inside a list or a map, such as an
  object's shape, is not read. This shows what no type states. `z.strictObject` and
  `z.looseObject` leave an object whose `catchall` is `never` or `unknown`, and a plain
  `z.object` leaves none, so the four policies for unknown keys are one field. An exact
  optional differs from an optional only in its class. `.refine` and `.superRefine`
  leave a check that states `custom`. `.brand` leaves nothing. `.meta` and `.describe`
  leave nothing in the schema either: they enter it in Zod's registry of metadata, which
  is one for the whole process, so the reading takes each entry out again.
- **Against Appendix A:** a test reads the appendix's first column from the
  specification and requires an example for every name in it and for no other. Every
  name is a construct Zod has. What the appendix does not name is listed in the test: 120
  functions and methods of every schema, and 117 of the 118 methods of one kind, `.catchall`
  being the one it names. Most are plain kinds and checks, and some are constructs of
  their own that the appendix is silent on: `z.discriminatedUnion`, `z.xor`, `z.json`,
  `z.function`, `z.promise`, `z.success` and `z.nonoptional`, and an object's `strict`,
  `loose`, `extend`, `pick`, `omit` and `partial`, among them.

Two things neither reading shows. A return type cannot say whether a schema was made or
was already there, so `.unwrap` and `z.getDiscriminatedOption`, which hand back a schema
they were given, are listed beside the functions that make one; telling them apart is
for the list made by hand. And nothing here shows what a method does to the fields of
the kind it returns, beyond the examples run.

Constructs that only the specifications' text
defines (the values of `format`, boolean schemas, a keyword no vocabulary defines) cannot
be computed. They are listed by hand in [`rows/schema-proposals.ts`](rows/schema-proposals.ts),
each with the section that defines it, and are the part of the rows most likely to be
missing one.

What the OpenAPI text defines beyond its schemas is a second list made by hand,
[`__fixtures__/texts/openapi-text-constructs.json`](__fixtures__/texts/openapi-text-constructs.json),
read and checked for shape by [`rows/openapi-text-constructs.ts`](rows/openapi-text-constructs.ts): 140 rows, read
from versions 3.1.2 and 3.2.1, the latest patch of each line the publisher serves. A
schema says what fields an object has. The text also says what an absent field means,
which of two fields wins, what a name refers to and what a string's grammar is, and no
schema holds those. Each row gives the sections it was read from, the version lines it
is true of, what the text defines in this repository's own words, and one of seven
kinds:

| Kind        | What the row is                                                        | Rows |
| ----------- | ---------------------------------------------------------------------- | ---- |
| `holds`     | A fact a model of the document must hold, because no field states it   | 52   |
| `default`   | What an absent field means                                             | 11   |
| `reading`   | A rule for reading a document; the model holds the result              | 31   |
| `runtime`   | What a field means when a request is made; the model holds the field   | 14   |
| `validity`  | Which documents are valid; for the sweep of validity rules (SPEC-FV-2) | 9    |
| `grammar`   | A string whose grammar a specification defines                         | 11   |
| `undefined` | Something the text says is undefined or left to the implementation     | 12   |

The list is a floor, and says so. Three things are proved by test and one is not:

- **Proved:** every section a row cites exists in the version it was read from. The
  section numbers of both texts are pinned in
  [`__fixtures__/texts/openapi-sections.json`](__fixtures__/texts/openapi-sections.json),
  with each page's address and digest; numbers only, so no text of the specification is
  reproduced.
- **Proved:** each of the thirty objects of chapter 4 of 3.2.1 is cited by a row or is
  named as read with nothing to hold, and none is both.
- **Proved, once, by program:** every quotation in the readers' reports the list was
  made from is in the text it cites (`.agent/research/model-design-2026-11-24/`).
- **Not proved:** that a row says what its section says. That was read, row by row
  against its quotation, and a reader can be wrong.

Versions 3.1.0 and 3.1.1 were not read apart from 3.1.2. The specification's format
registry was not read.

What the JSON Schema texts define beyond their meta-schemas is a third list made by hand,
[`__fixtures__/texts/json-schema-text-constructs.json`](__fixtures__/texts/json-schema-text-constructs.json),
read and checked for shape by
[`rows/json-schema-text-constructs.ts`](rows/json-schema-text-constructs.ts): 136 rows
from the core and the validation text of Draft 2020-12 and of Draft-07. 36 are true of
both drafts, 66 of 2020-12 alone and 34 of Draft-07 alone. The kinds are the same seven:
88 hold a fact, 3 a default, 13 a rule for reading, 2 a rule for a tool at run time, 3 a
validity rule, 18 a grammar, and 9 something a text leaves undefined.

A meta-schema says what keywords a schema may hold. The texts say what the model has to
be able to state about them:

- what "adjacent" means, and which keywords depend on the ones beside them;
- what an annotation is, where it attaches, when it is dropped, and which keywords read
  another's annotation, which is how `unevaluatedProperties` and `unevaluatedItems`
  reach past their own schema object;
- that an absent keyword is not the same as the keyword given with a value that asserts
  nothing;
- the two scopes of a schema, lexical and dynamic, and what `$dynamicRef` binds to;
- what a resource is, what `$id` is resolved against, and the two grammars of an anchor;
- where the drafts differ in meaning and not only in keywords: an unknown keyword is an
  annotation in 2020-12 and is ignored in Draft-07; a `$ref` in Draft-07 makes its whole
  object the reference; two formats cite different standards.

The same is proved and not proved as for the OpenAPI list. The section numbers of the
four texts are pinned in
[`__fixtures__/texts/json-schema-sections.json`](__fixtures__/texts/json-schema-sections.json),
and a test proves every cited section exists in the text and the draft the row was read
from. The standard each format cites was read in the texts for every row that names one.
Coverage of every section is not proved for these texts, as it is for chapter 4 of
OpenAPI: the reader's report names the sections it read, and that list is not computed.

The rows are read from the latest revisions the publisher listed on 22 November 2026: for
OpenAPI 3.1, the document schema of 2026-11-05 and the vocabulary of 2024-11-10; for 3.2,
the document schema of 2026-11-12 and the vocabulary of 2026-02-26.

Pinned with the rest, and read by no code yet: the two dialect files; each version's
`schema-base`, which is the document schema with every Schema Object held to the OpenAPI
dialect; the format-assertion vocabulary; and the two document schemas the specification
names at version 0.8.0 (3.1 of 2022-10-07, 3.2 of 2025-09-17), which stay until the
specification names others.

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

A limit the specification declares is held as a case of its own and is no cell
([`cases/declared-limits.gen.test.ts`](cases/declared-limits.gen.test.ts)): for a value
with an own property named `__proto__`, the reference refuses, Castr's Zod accepts, and
the value it returns lacks the property (SPEC-P-7). No sample of a case holds one.
A second is held beside it: `format: uri` is written `z.url()`, which accepts some strings
RFC 3986 refuses and refuses `http://`, which it accepts (SPEC-P-8). The row's samples
hold none of those strings, so its cell reads right on the strings the two agree on. `pnpm picture`
prints both limits above the cells, so a right cell is not read as free of them.

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
- **An intersection is read as its parts**, not as the single object it comes to.
  Castr writes `allOf` as an intersection, so two documents whose `allOf` comes to the
  same object by different parts read as different.
- **Not seen:** a property made readonly by a mapped type such as `Readonly`, a readonly
  index signature, a label in a tuple, and a type inside an exported namespace. A
  function type is told apart by its signature as the compiler writes it. The type
  writer has no code that writes a mapped type or a namespace today.
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
