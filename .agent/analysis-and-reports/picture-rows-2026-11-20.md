# PICTURE's row list: the construct kinds of OpenAPI 3.1, with a proposed class per row

20 November 2026. Written by Ingot binds Patina (claude-code, claude-fable-5-2) on the
owner's word of that day: "go ahead with PICTURE's row list".

This is a proposal for the owner. Nothing here is in the specification. The
scope-and-fidelity table (SPEC-N-5) is unwritten, and writing it is an amendment that
PLOT sequences.

## What this is for

SPEC-PR-6 promises that no valid document of the source format reaches unbuilt work, and
its check runs "one case for every construct kind the scope-and-fidelity table lists".
That table does not exist, so the check has nothing to count. This report supplies the
list of rows, taken from the format's published definition and not from what Castr
handles today, and proposes for each row the class it would have for the two pairs of
SPEC-C-1: OpenAPI to Zod and OpenAPI to TypeScript.

## How the rows were found

- **Schema keywords:** every property of the seven JSON Schema 2020-12 vocabulary
  meta-schemas, read from the copies ajv 8.20.0 ships. 57 keywords, and the seven values
  of `type`.
- **OpenAPI objects and fields:** every property name any branch of each object
  definition declares in the OpenAPI 3.1 document schema
  (`https://spec.openapis.org/oas/3.1/schema/2022-10-07`), read from the copy
  `@scalar/openapi-validator` 0.1.0 ships. 40 objects, 132 fields, and 15 objects whose
  entries are keyed by a pattern or by any key.
- **Rows from prose:** the values of `format`, the OpenAPI base vocabulary
  (`discriminator`, `xml`, `externalDocs`, `example`), boolean schemas, unknown keywords
  and extensions are defined in the specifications' text and in no machine-readable file
  on this machine. Sections C and D list them by hand and name the section each comes
  from. A reader should treat those two sections as the part of the list most likely to
  be missing a row.

The appendix holds the two programs. The second fails if a computed row has no proposed
class, or a proposed class names a row that was not computed. It passed.

## The classes

The specification (section 3) has four: **carried** (the target says it and its own
checker enforces it), **carried as structure** (it appears as type or registry
structure), **carried by companion** (the target cannot enforce it; the same run emits
an artefact that does, and the target shows it as documentation), and **unexpressible**
(a located rejection). The tables shorten the middle two to "structure" and "companion".

For TypeScript the companion is the Zod output of the same run.

Three more labels appear in the tables. They are this report's and are not classes:

- **carried, by a check Castr writes:** Zod enforces it, but only through a function the
  writer emits, because Zod has no constructor for it.
- **no class fits** and **read by the parser:** findings 1 and 2 below.

## What the list shows

1. **The four classes do not cover 100 of the 247 rows for Zod, and 87 for TypeScript.**
   The classes describe a construct the target is asked to express. Most of an OpenAPI
   document is not that:
   - 62 rows are document content (`info`, `servers`, `tags`, security schemes, links).
     The specification says the model carries it and the OpenAPI writer writes it back.
     Zod and TypeScript have no place for it, and refusing it would refuse every
     document.
   - 15 rows are serialisation rules (`style`, `explode`, `allowReserved`, `encoding`,
     `xml`). The specification calls a parameter's serialisation rule meaning. Neither
     target can say it; the endpoint definitions are the natural place, and their content
     is not yet specified.
   - 13 rows are things said about a boundary (an operation's `summary`, a parameter's
     `description`). TypeScript can show a comment. Zod has no schema to attach them to.
   - 10 rows are examples of bodies and parameters, and extensions outside schemas.

   My position: the table needs a fifth class for meaning that lies outside a target's
   subject, with a guard that it can never be given to a schema keyword, a `type` value
   or a `format` value. Without the guard it becomes the place a gap is hidden. The
   alternative is to say the endpoint definitions carry all of it, which decides their
   content. This is the owner's decision.

2. **Five rows are spent by the parser** (`openapi`, `jsonSchemaDialect`, `$schema`,
   `$vocabulary`, and a dialect Castr does not read). They select how the rest is read
   and leave nothing to write. A valid 3.1 document may name any dialect, so the last of
   them is a valid document Castr must refuse. That refusal is neither `UNEXPRESSIBLE`
   nor `NOT-YET-BUILT`. It is the third rejection kind the pause record already asks
   for.

3. **No schema row is proposed as unexpressible.** Every keyword, type and listed format
   can be enforced by Zod and at least shown by TypeScript. That is what the owner's
   sentence of 20 November needs ("What I want is to not have to rework Castr if Oak adds
   an additional, valid field type to their spec"). It holds only if the next finding is
   accepted.

4. **26 of the Zod rows need a check function Castr writes** (`uniqueItems`, `not`,
   `if`/`then`/`else`, `contains`, `patternProperties`, `propertyNames`,
   `dependentSchemas`, `dependentRequired`, the property counts, the `unevaluated` pair
   where the parser cannot settle them, and ten formats). Zod's own checker runs the
   function, so by the definition the row is carried. The cost comes later: SPEC-P-2
   refuses a Zod document that holds an author's function, so Castr could not read back
   its own Zod output for these rows when SPEC-C-2 arrives. The model must mark such a
   check as Castr's own, or SPEC-C-2 must name it. The owner should see this before the
   class is fixed.

5. **Two profile clauses need words for a valid input they do not cover.** SPEC-P-3 says
   `format` asserts, and does not say what an unlisted format value does; the proposal is
   that it is carried as an annotation and reported, never refused. A keyword no
   vocabulary defines is the same case, and JSON Schema already says it is an annotation.

6. **Five rows are carried only if SPEC-G-4 agrees.** `multipleOf` (Zod divides in
   binary floating point; the model holds exact decimals), `maxLength` and `minLength`
   (characters against UTF-16 units), `email` (Zod's pattern is narrower than the RFC),
   and `int64` (a JavaScript number is exact only to 2^53). `int64` needs a decision of
   its own, because the value domain in SPEC-P-5 excludes `bigint`.

7. **OpenAPI is three formats in the "read" column.** Section 6 reads 3.0.x, 3.1.x and
   3.2.x, and SPEC-PR-6 measures against "any valid document of its source format". 3.2
   adds 26 fields and values to the 3.1 list (among them `query` and
   `additionalOperations` on a path item, `itemSchema` on a media type, and the
   `querystring` location); three further entries in section F are 3.1 rows that the 3.2
   schema regroups. 3.0 adds `nullable` and reads four keywords by draft-04's
   rules. Section F lists them. They have no proposed class yet.

## Limits

- The classes are a proposal made by reading, not by running anything. The
  [construct report](constructs-2026-11-20.md) holds what Castr does today for 94
  constructs; this list has more rows than that report measured.
- The two definitions were read from copies in installed packages, not fetched from
  their publishers. Each carries its publisher's identifier, quoted above.
- The OpenAPI document schema does not validate the schema object ("without schema
  validation", in its own description). The schema rows come from the JSON Schema
  vocabularies and from prose.
- A field that two branches of one object declare is one row. A field whose meaning
  changes with a sibling (a parameter with `schema` against one with `content`) is still
  one row.
- No row is given for a combination of keywords. The construct report found defects that
  exist only in combination (a closed object under `allOf`; keywords beside `$ref`). The
  PICTURE command needs cases for those in addition to one per row.

## The rows

### Counts

Rows with a proposed class: 247 (57 keywords, 7 type values, 25 format values, 11 other schema rows, 132 fields and 15 keyed-entry rows over 40 objects).

- To Zod: carried 64; carried, by a check Castr writes 26; structure 52; companion 0; unexpressible 0; no class fits 100; read by the parser 5.
- To TypeScript: carried 37; carried, by a check Castr writes 0; structure 35; companion 83; unexpressible 0; no class fits 87; read by the parser 5.

### A. Schema keywords (computed: the 2020-12 vocabularies)

| Keyword                 | Vocabulary        | To Zod                           | To TypeScript      | Note                                                                                                                 |
| ----------------------- | ----------------- | -------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `prefixItems`           | applicator        | carried                          | carried            | Tuple, with `items` as its rest.                                                                                     |
| `items`                 | applicator        | carried                          | carried            |                                                                                                                      |
| `contains`              | applicator        | carried, by a check Castr writes | companion          |                                                                                                                      |
| `additionalProperties`  | applicator        | carried                          | companion          | Zod: strict, loose or catchall. TypeScript cannot close an object and cannot constrain extra keys beside named ones. |
| `properties`            | applicator        | carried                          | carried            |                                                                                                                      |
| `patternProperties`     | applicator        | carried, by a check Castr writes | companion          | TypeScript shows an index signature; the key pattern is the companion's.                                             |
| `dependentSchemas`      | applicator        | carried, by a check Castr writes | companion          |                                                                                                                      |
| `propertyNames`         | applicator        | carried, by a check Castr writes | companion          |                                                                                                                      |
| `if`                    | applicator        | carried, by a check Castr writes | companion          | With `then` and `else`, one construct.                                                                               |
| `then`                  | applicator        | carried, by a check Castr writes | companion          |                                                                                                                      |
| `else`                  | applicator        | carried, by a check Castr writes | companion          |                                                                                                                      |
| `allOf`                 | applicator        | carried                          | carried            | Closed objects under `allOf` are merged before writing (SPEC-P-1, writing).                                          |
| `anyOf`                 | applicator        | carried                          | carried            |                                                                                                                      |
| `oneOf`                 | applicator        | carried                          | companion          | Zod: `z.xor`. A TypeScript union is `anyOf`; exactly-one is the companion's.                                         |
| `not`                   | applicator        | carried, by a check Castr writes | companion          | TypeScript has no negated type.                                                                                      |
| `contentEncoding`       | content           | structure                        | companion          | An annotation in 2020-12; it asserts nothing.                                                                        |
| `contentMediaType`      | content           | structure                        | companion          | As above.                                                                                                            |
| `contentSchema`         | content           | structure                        | companion          | As above.                                                                                                            |
| `$id`                   | core              | structure                        | structure          | Identity of an embedded resource; references resolve through it.                                                     |
| `$schema`               | core              | read by the parser               | read by the parser | Selects the dialect the schema is read in.                                                                           |
| `$ref`                  | core              | carried                          | carried            | Written as a reference to a named definition (SPEC-PR-3). Keywords beside it apply too.                              |
| `$anchor`               | core              | structure                        | structure          | A name a reference can target.                                                                                       |
| `$dynamicRef`           | core              | carried                          | carried            | Resolved by the parser for each scope that reaches it. The hardest row to build.                                     |
| `$dynamicAnchor`        | core              | structure                        | structure          | With `$dynamicRef`.                                                                                                  |
| `$vocabulary`           | core              | read by the parser               | read by the parser | Has meaning only in a meta-schema.                                                                                   |
| `$comment`              | core              | structure                        | companion          | A note for the schema's author.                                                                                      |
| `$defs`                 | core              | structure                        | structure          | Named definitions, each written once.                                                                                |
| `format`                | format-annotation | carried                          | companion          | One row per format value, below.                                                                                     |
| `title`                 | meta-data         | structure                        | companion          | Zod: the schema's registry entry. TypeScript: a documentation comment.                                               |
| `description`           | meta-data         | structure                        | companion          | As `title`.                                                                                                          |
| `default`               | meta-data         | structure                        | companion          | An annotation, reported as a warning (SPEC-P-6). It inserts nothing.                                                 |
| `deprecated`            | meta-data         | structure                        | companion          | TypeScript: `@deprecated`.                                                                                           |
| `readOnly`              | meta-data         | structure                        | companion          | An annotation in 3.1. TypeScript `readonly` means something else and is not used.                                    |
| `writeOnly`             | meta-data         | structure                        | companion          |                                                                                                                      |
| `examples`              | meta-data         | structure                        | companion          |                                                                                                                      |
| `unevaluatedItems`      | unevaluated       | carried, by a check Castr writes | companion          | Becomes the tuple's rest where the parser can settle it; a check otherwise.                                          |
| `unevaluatedProperties` | unevaluated       | carried, by a check Castr writes | companion          | Becomes the unknown-key policy where the parser can settle it; a check otherwise.                                    |
| `type`                  | validation        | carried                          | carried            | One row per value, below. `integer` is the companion's in TypeScript.                                                |
| `const`                 | validation        | carried                          | carried            | Any JSON value: an object or array is written as a closed shape of literals.                                         |
| `enum`                  | validation        | carried                          | carried            | Members of any JSON type.                                                                                            |
| `multipleOf`            | validation        | carried                          | companion          | Zod divides in binary floating point; SPEC-G-4 decides whether that agrees with exact decimals.                      |
| `maximum`               | validation        | carried                          | companion          |                                                                                                                      |
| `exclusiveMaximum`      | validation        | carried                          | companion          |                                                                                                                      |
| `minimum`               | validation        | carried                          | companion          |                                                                                                                      |
| `exclusiveMinimum`      | validation        | carried                          | companion          |                                                                                                                      |
| `maxLength`             | validation        | carried                          | companion          | JSON Schema counts characters; Zod counts UTF-16 units. They differ on astral characters.                            |
| `minLength`             | validation        | carried                          | companion          | As `maxLength`.                                                                                                      |
| `pattern`               | validation        | carried                          | companion          | Both are ECMA-262 expressions.                                                                                       |
| `maxItems`              | validation        | carried                          | companion          |                                                                                                                      |
| `minItems`              | validation        | carried                          | companion          |                                                                                                                      |
| `uniqueItems`           | validation        | carried, by a check Castr writes | companion          | Equality is JSON Schema's: by value, with `1` equal to `1.0`.                                                        |
| `maxContains`           | validation        | carried, by a check Castr writes | companion          | With `contains`.                                                                                                     |
| `minContains`           | validation        | carried, by a check Castr writes | companion          | With `contains`.                                                                                                     |
| `maxProperties`         | validation        | carried, by a check Castr writes | companion          |                                                                                                                      |
| `minProperties`         | validation        | carried, by a check Castr writes | companion          |                                                                                                                      |
| `required`              | validation        | carried                          | carried            |                                                                                                                      |
| `dependentRequired`     | validation        | carried, by a check Castr writes | companion          |                                                                                                                      |

### B. Values of `type` (computed)

| Value     | To Zod  | To TypeScript | Note                            |
| --------- | ------- | ------------- | ------------------------------- |
| `array`   | carried | carried       |                                 |
| `boolean` | carried | carried       |                                 |
| `integer` | carried | companion     | TypeScript has one number type. |
| `null`    | carried | carried       |                                 |
| `number`  | carried | carried       |                                 |
| `object`  | carried | carried       |                                 |
| `string`  | carried | carried       |                                 |

### C. Values of `format` (from prose; not computed)

| Value                   | To Zod                           | To TypeScript | Source           | Note                                                                                                                                   |
| ----------------------- | -------------------------------- | ------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `date-time`             | carried                          | companion     | Validation 7.3.1 | `z.iso.datetime` with offsets allowed.                                                                                                 |
| `date`                  | carried                          | companion     | Validation 7.3.1 |                                                                                                                                        |
| `time`                  | carried                          | companion     | Validation 7.3.1 | RFC 3339 full-time has an offset; `z.iso.time` refuses one, so a pattern is written.                                                   |
| `duration`              | carried                          | companion     | Validation 7.3.1 |                                                                                                                                        |
| `email`                 | carried                          | companion     | Validation 7.3.2 | Zod's pattern is narrower than RFC 5321; SPEC-G-4 decides.                                                                             |
| `idn-email`             | carried, by a check Castr writes | companion     | Validation 7.3.2 |                                                                                                                                        |
| `hostname`              | carried                          | companion     | Validation 7.3.3 |                                                                                                                                        |
| `idn-hostname`          | carried, by a check Castr writes | companion     | Validation 7.3.3 |                                                                                                                                        |
| `ipv4`                  | carried                          | companion     | Validation 7.3.4 |                                                                                                                                        |
| `ipv6`                  | carried                          | companion     | Validation 7.3.4 |                                                                                                                                        |
| `uri`                   | carried, by a check Castr writes | companion     | Validation 7.3.5 | `z.url` follows the WHATWG parser, not RFC 3986.                                                                                       |
| `uri-reference`         | carried, by a check Castr writes | companion     | Validation 7.3.5 |                                                                                                                                        |
| `iri`                   | carried, by a check Castr writes | companion     | Validation 7.3.5 |                                                                                                                                        |
| `iri-reference`         | carried, by a check Castr writes | companion     | Validation 7.3.5 |                                                                                                                                        |
| `uuid`                  | carried                          | companion     | Validation 7.3.5 | `z.guid`: RFC 4122 form with no version check.                                                                                         |
| `uri-template`          | carried, by a check Castr writes | companion     | Validation 7.3.6 |                                                                                                                                        |
| `json-pointer`          | carried, by a check Castr writes | companion     | Validation 7.3.7 |                                                                                                                                        |
| `relative-json-pointer` | carried, by a check Castr writes | companion     | Validation 7.3.7 |                                                                                                                                        |
| `regex`                 | carried, by a check Castr writes | companion     | Validation 7.3.8 |                                                                                                                                        |
| `int32`                 | carried                          | companion     | OpenAPI 3.1, 4.3 |                                                                                                                                        |
| `int64`                 | carried                          | companion     | OpenAPI 3.1, 4.3 | A JavaScript number is exact only to 2^53; the value domain (SPEC-P-5) holds numbers exactly, so this row needs a decision of its own. |
| `float`                 | carried                          | companion     | OpenAPI 3.1, 4.3 |                                                                                                                                        |
| `double`                | carried                          | companion     | OpenAPI 3.1, 4.3 |                                                                                                                                        |
| `password`              | structure                        | companion     | OpenAPI 3.1, 4.3 | A hint to user interfaces; it asserts nothing.                                                                                         |
| any other value         | structure                        | companion     | OpenAPI 3.1, 4.3 | Carried as an annotation and named in the run report; never a refusal. SPEC-P-3 does not say this yet.                                 |

### D. Schema rows the two definitions do not list (from prose; not computed)

| Construct                                                     | To Zod             | To TypeScript      | Source                 | Note                                                                                          |
| ------------------------------------------------------------- | ------------------ | ------------------ | ---------------------- | --------------------------------------------------------------------------------------------- |
| `true` and `false` as a schema                                | carried            | carried            | JSON Schema Core 4.3.2 | `z.unknown()` and `z.never()`.                                                                |
| a list of types (`type: [..]`)                                | carried            | carried            | Validation 6.1.1       |                                                                                               |
| a keyword no vocabulary defines                               | structure          | companion          | Core 6.5               | Collected as an annotation and named in the run report; never a refusal.                      |
| `x-` extension on a schema                                    | structure          | companion          | OpenAPI 3.1, 4.9       | Named among the parts of meaning (specification section 3).                                   |
| `x-` extension on any other object                            | no class fits      | no class fits      | OpenAPI 3.1, 4.9       |                                                                                               |
| `discriminator` (`propertyName`, `mapping`)                   | structure          | structure          | OpenAPI 3.1, 4.8.25    | A hint in 3.1: it changes no accepted value.                                                  |
| `xml` (`name`, `namespace`, `prefix`, `attribute`, `wrapped`) | no class fits      | no class fits      | OpenAPI 3.1, 4.8.26    | How a value is serialised as XML.                                                             |
| `externalDocs` on a schema                                    | structure          | companion          | OpenAPI 3.1, 4.8.24.2  |                                                                                               |
| `example` on a schema (deprecated)                            | structure          | companion          | OpenAPI 3.1, 4.8.24.2  |                                                                                               |
| `nullable` (3.0 documents only)                               | carried            | carried            | OpenAPI 3.0.4, 4.7.24  | Read as a union with `null`.                                                                  |
| `jsonSchemaDialect` naming a dialect section 6 does not list  | read by the parser | read by the parser | OpenAPI 3.1, 4.8.1     | The document is valid and Castr cannot read its schemas. This needs the third rejection kind. |

### E. OpenAPI objects and their fields (computed: the 3.1 document schema)

| Object                   | Field                                                                                          | To Zod             | To TypeScript      | Note                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------ | ------------------ | ----------------------------------------------------------------------------------------------- |
| openapi (document root)  | `components`                                                                                   | structure          | structure          |                                                                                                 |
| openapi (document root)  | `externalDocs`                                                                                 | no class fits      | no class fits      | Document content.                                                                               |
| openapi (document root)  | `info`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| openapi (document root)  | `jsonSchemaDialect`                                                                            | read by the parser | read by the parser | Selects the dialect its schemas are read in.                                                    |
| openapi (document root)  | `openapi`                                                                                      | read by the parser | read by the parser | Selects the version the document is read as.                                                    |
| openapi (document root)  | `paths`                                                                                        | structure          | structure          | Each path template is a key.                                                                    |
| openapi (document root)  | `security`                                                                                     | no class fits      | no class fits      | Document content.                                                                               |
| openapi (document root)  | `servers`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| openapi (document root)  | `tags`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| openapi (document root)  | `webhooks`                                                                                     | structure          | structure          |                                                                                                 |
| openapi (document root)  | entries keyed by any key                                                                       | structure          | structure          |                                                                                                 |
| info                     | `contact`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| info                     | `description`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| info                     | `license`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| info                     | `summary`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| info                     | `termsOfService`                                                                               | no class fits      | no class fits      | Document content.                                                                               |
| info                     | `title`                                                                                        | no class fits      | no class fits      | Document content.                                                                               |
| info                     | `version`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| contact                  | `email`                                                                                        | no class fits      | no class fits      | Document content.                                                                               |
| contact                  | `name`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| contact                  | `url`                                                                                          | no class fits      | no class fits      | Document content.                                                                               |
| license                  | `identifier`                                                                                   | no class fits      | no class fits      | Document content.                                                                               |
| license                  | `name`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| license                  | `url`                                                                                          | no class fits      | no class fits      | Document content.                                                                               |
| server                   | `description`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| server                   | `url`                                                                                          | no class fits      | no class fits      | Document content.                                                                               |
| server                   | `variables`                                                                                    | no class fits      | no class fits      | Document content.                                                                               |
| server                   | entries keyed by any key                                                                       | no class fits      | no class fits      | Document content.                                                                               |
| server-variable          | `default`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| server-variable          | `description`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| server-variable          | `enum`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| components               | `callbacks`                                                                                    | structure          | structure          | A named component stays named (SPEC-PR-3).                                                      |
| components               | `examples`                                                                                     | no class fits      | no class fits      |                                                                                                 |
| components               | `headers`                                                                                      | structure          | structure          | A named component stays named (SPEC-PR-3).                                                      |
| components               | `links`                                                                                        | no class fits      | no class fits      | Document content.                                                                               |
| components               | `parameters`                                                                                   | structure          | structure          | A named component stays named (SPEC-PR-3).                                                      |
| components               | `pathItems`                                                                                    | structure          | structure          | A named component stays named (SPEC-PR-3).                                                      |
| components               | `requestBodies`                                                                                | structure          | structure          | A named component stays named (SPEC-PR-3).                                                      |
| components               | `responses`                                                                                    | structure          | structure          | A named component stays named (SPEC-PR-3).                                                      |
| components               | `schemas`                                                                                      | carried            | carried            | Each named schema is written once.                                                              |
| components               | `securitySchemes`                                                                              | no class fits      | no class fits      | Document content.                                                                               |
| components               | entries keyed by any key                                                                       | structure          | structure          |                                                                                                 |
| paths                    | entries keyed by `^/`                                                                          | structure          | structure          | The path template is the key.                                                                   |
| path-item                | `delete`                                                                                       | structure          | structure          | The method is a key.                                                                            |
| path-item                | `description`                                                                                  | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| path-item                | `get`                                                                                          | structure          | structure          | The method is a key.                                                                            |
| path-item                | `head`                                                                                         | structure          | structure          | The method is a key.                                                                            |
| path-item                | `options`                                                                                      | structure          | structure          | The method is a key.                                                                            |
| path-item                | `parameters`                                                                                   | carried            | carried            | Apply to every operation of the path.                                                           |
| path-item                | `patch`                                                                                        | structure          | structure          | The method is a key.                                                                            |
| path-item                | `post`                                                                                         | structure          | structure          | The method is a key.                                                                            |
| path-item                | `put`                                                                                          | structure          | structure          | The method is a key.                                                                            |
| path-item                | `servers`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| path-item                | `summary`                                                                                      | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| path-item                | `trace`                                                                                        | structure          | structure          | The method is a key.                                                                            |
| operation                | `callbacks`                                                                                    | structure          | structure          |                                                                                                 |
| operation                | `deprecated`                                                                                   | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| operation                | `description`                                                                                  | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| operation                | `externalDocs`                                                                                 | no class fits      | no class fits      | Document content.                                                                               |
| operation                | `operationId`                                                                                  | structure          | structure          | The boundary's identity.                                                                        |
| operation                | `parameters`                                                                                   | carried            | carried            |                                                                                                 |
| operation                | `requestBody`                                                                                  | carried            | carried            |                                                                                                 |
| operation                | `responses`                                                                                    | carried            | carried            |                                                                                                 |
| operation                | `security`                                                                                     | no class fits      | no class fits      | Document content.                                                                               |
| operation                | `servers`                                                                                      | no class fits      | no class fits      | Document content.                                                                               |
| operation                | `summary`                                                                                      | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| operation                | `tags`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| operation                | entries keyed by any key                                                                       | structure          | structure          |                                                                                                 |
| external-documentation   | `description`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| external-documentation   | `url`                                                                                          | no class fits      | no class fits      | Document content.                                                                               |
| parameter                | `allowEmptyValue`                                                                              | no class fits      | no class fits      | A serialisation rule.                                                                           |
| parameter                | `allowReserved`                                                                                | no class fits      | no class fits      | A serialisation rule.                                                                           |
| parameter                | `content`                                                                                      | carried            | carried            | Keyed by media type.                                                                            |
| parameter                | `deprecated`                                                                                   | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| parameter                | `description`                                                                                  | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| parameter                | `explode`                                                                                      | no class fits      | no class fits      | A serialisation rule.                                                                           |
| parameter                | `in` (`cookie`, `header`, `path`, `query`)                                                     | structure          | structure          | Four locations, each a key.                                                                     |
| parameter                | `name`                                                                                         | structure          | structure          |                                                                                                 |
| parameter                | `required`                                                                                     | carried            | carried            |                                                                                                 |
| parameter                | `schema`                                                                                       | carried            | carried            |                                                                                                 |
| parameter                | `style` (`deepObject`, `form`, `label`, `matrix`, `pipeDelimited`, `simple`, `spaceDelimited`) | no class fits      | no class fits      | A serialisation rule.                                                                           |
| request-body             | `content`                                                                                      | carried            | carried            | Keyed by media type.                                                                            |
| request-body             | `description`                                                                                  | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| request-body             | `required`                                                                                     | carried            | carried            |                                                                                                 |
| content                  | entries keyed by any key                                                                       | structure          | structure          | The media type is the key.                                                                      |
| media-type               | `encoding`                                                                                     | no class fits      | no class fits      | A serialisation rule.                                                                           |
| media-type               | `schema`                                                                                       | carried            | carried            |                                                                                                 |
| media-type               | entries keyed by any key                                                                       | no class fits      | no class fits      | A serialisation rule.                                                                           |
| encoding                 | `allowReserved`                                                                                | no class fits      | no class fits      | A serialisation rule.                                                                           |
| encoding                 | `contentType`                                                                                  | no class fits      | no class fits      | A serialisation rule.                                                                           |
| encoding                 | `explode`                                                                                      | no class fits      | no class fits      | A serialisation rule.                                                                           |
| encoding                 | `headers`                                                                                      | no class fits      | no class fits      | A serialisation rule.                                                                           |
| encoding                 | `style` (`deepObject`, `form`, `pipeDelimited`, `spaceDelimited`)                              | no class fits      | no class fits      | A serialisation rule.                                                                           |
| encoding                 | entries keyed by any key                                                                       | no class fits      | no class fits      | A serialisation rule.                                                                           |
| responses                | `default`                                                                                      | structure          | structure          | Kept apart from every status (SPEC-C-1).                                                        |
| responses                | entries keyed by `^[1-5](?:[0-9]{2}\|XX)$`                                                     | structure          | structure          | An exact code or a range; neither becomes the other.                                            |
| response                 | `content`                                                                                      | carried            | carried            | Keyed by media type.                                                                            |
| response                 | `description`                                                                                  | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| response                 | `headers`                                                                                      | carried            | carried            |                                                                                                 |
| response                 | `links`                                                                                        | no class fits      | no class fits      | Document content.                                                                               |
| response                 | entries keyed by any key                                                                       | structure          | structure          |                                                                                                 |
| callbacks                | entries keyed by any key                                                                       | structure          | structure          | The expression is the key.                                                                      |
| example                  | `description`                                                                                  | no class fits      | no class fits      | An example of a body or parameter, not of a schema.                                             |
| example                  | `externalValue`                                                                                | no class fits      | no class fits      | An example of a body or parameter, not of a schema.                                             |
| example                  | `summary`                                                                                      | no class fits      | no class fits      | An example of a body or parameter, not of a schema.                                             |
| example                  | `value`                                                                                        | no class fits      | no class fits      | An example of a body or parameter, not of a schema.                                             |
| link                     | `body`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| link                     | `description`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| link                     | `operationId`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| link                     | `operationRef`                                                                                 | no class fits      | no class fits      | Document content.                                                                               |
| link                     | `parameters`                                                                                   | no class fits      | no class fits      | Document content.                                                                               |
| link                     | `requestBody`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| header                   | `content`                                                                                      | carried            | carried            |                                                                                                 |
| header                   | `deprecated`                                                                                   | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| header                   | `description`                                                                                  | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| header                   | `explode`                                                                                      | no class fits      | no class fits      | A serialisation rule.                                                                           |
| header                   | `required`                                                                                     | carried            | carried            |                                                                                                 |
| header                   | `schema`                                                                                       | carried            | carried            |                                                                                                 |
| header                   | `style`                                                                                        | no class fits      | no class fits      | A serialisation rule.                                                                           |
| tag                      | `description`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| tag                      | `externalDocs`                                                                                 | no class fits      | no class fits      | Document content.                                                                               |
| tag                      | `name`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| reference                | `$ref`                                                                                         | carried            | carried            | Written as a reference (SPEC-PR-3).                                                             |
| reference                | `description`                                                                                  | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| reference                | `summary`                                                                                      | no class fits      | companion          | Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment. |
| security-scheme          | `bearerFormat`                                                                                 | no class fits      | no class fits      | Document content.                                                                               |
| security-scheme          | `description`                                                                                  | no class fits      | no class fits      | Document content.                                                                               |
| security-scheme          | `flows`                                                                                        | no class fits      | no class fits      | Document content.                                                                               |
| security-scheme          | `in` (`cookie`, `header`, `query`)                                                             | no class fits      | no class fits      | Document content.                                                                               |
| security-scheme          | `name`                                                                                         | no class fits      | no class fits      | Document content.                                                                               |
| security-scheme          | `openIdConnectUrl`                                                                             | no class fits      | no class fits      | Document content.                                                                               |
| security-scheme          | `scheme`                                                                                       | no class fits      | no class fits      | Document content.                                                                               |
| security-scheme          | `type` (`apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`)                              | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `authorizationCode`                                                                            | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `authorizationUrl`                                                                             | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `clientCredentials`                                                                            | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `implicit`                                                                                     | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `password`                                                                                     | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `refreshUrl`                                                                                   | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `scopes`                                                                                       | no class fits      | no class fits      | Document content.                                                                               |
| oauth-flows              | `tokenUrl`                                                                                     | no class fits      | no class fits      | Document content.                                                                               |
| security-requirement     | entries keyed by any key                                                                       | no class fits      | no class fits      | Document content.                                                                               |
| specification-extensions | entries keyed by `^x-`                                                                         | no class fits      | no class fits      | On a schema it is carried as structure; see the rows the definitions do not list.               |
| examples                 | `example`                                                                                      | no class fits      | no class fits      | An example of a body or parameter, not of a schema.                                             |
| examples                 | `examples`                                                                                     | no class fits      | no class fits      | An example of a body or parameter, not of a schema.                                             |
| examples                 | entries keyed by any key                                                                       | no class fits      | no class fits      |                                                                                                 |
| map-of-strings           | entries keyed by any key                                                                       | no class fits      | no class fits      | Document content.                                                                               |

Objects with no field of their own (a choice between an object and a reference, or the schema object, whose rows are A to D): path-item-or-reference, parameter-or-reference, request-body-or-reference, response-or-reference, callbacks-or-reference, example-or-reference, link-or-reference, header-or-reference, schema, security-scheme-or-reference.

### F. What 3.2 and 3.0 documents add (computed; no class proposed yet)

| Object                  | Field                    | New in 3.2           |
| ----------------------- | ------------------------ | -------------------- |
| openapi (document root) | `$self`                  | field                |
| server                  | `name`                   | field                |
| components              | `mediaTypes`             | field                |
| path-item               | `additionalOperations`   | field                |
| path-item               | `query`                  | field                |
| parameters              | `in`                     | object and field     |
| parameter               | `in`                     | values `querystring` |
| parameter               | `style`                  | values `cookie`      |
| media-type              | `description`            | field                |
| media-type              | `itemEncoding`           | field                |
| media-type              | `itemSchema`             | field                |
| media-type              | `prefixEncoding`         | field                |
| encoding                | `encoding`               | field                |
| encoding                | `itemEncoding`           | field                |
| encoding                | `prefixEncoding`         | field                |
| response                | `summary`                | field                |
| example                 | `dataValue`              | field                |
| example                 | `serializedValue`        | field                |
| link                    | `server`                 | field                |
| header                  | `allowReserved`          | field                |
| tag                     | `kind`                   | field                |
| tag                     | `parent`                 | field                |
| tag                     | `summary`                | field                |
| security-scheme         | `deprecated`             | field                |
| security-scheme         | `oauth2MetadataUrl`      | field                |
| oauth-flows             | `deviceAuthorization`    | field                |
| oauth-flows             | `deviceAuthorizationUrl` | field                |
| styles-for-form         | `explode`                | object and field     |
| styles-for-form         | `style`                  | object and field     |

The 3.0 schema object (`https://spec.openapis.org/oas/3.0/schema/2021-09-28`) lists 35 keywords. Not in 2020-12: `nullable`, `discriminator`, `example`, `externalDocs`, `xml`. It has no place for 27 of the 2020-12 keywords, and its `type`, `exclusiveMaximum`, `exclusiveMinimum` and `items` are read by draft-04's rules.

## Appendix: the programs

Run from any directory with the repository root as the argument: `node rows.mjs <root> > rows.json`, then `node report.mjs rows.json`.

`rows.mjs`:

```js
// Computes the construct kinds of OpenAPI 3.1 from two published definitions:
//  - the OpenAPI 3.1 document schema ($id .../oas/3.1/schema/2022-10-07), as shipped in
//    @scalar/openapi-validator;
//  - the JSON Schema 2020-12 vocabulary meta-schemas, as shipped in ajv.
// usage: node rows.mjs <castr-root>   -> JSON on stdout
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2];
const pnpm = join(root, 'node_modules/.pnpm');
const oasPath = join(
  pnpm,
  '@scalar+openapi-validator@0.1.0/node_modules/@scalar/openapi-validator/dist/schemas/v3.1/schema.js',
);
const metaDir = join(pnpm, 'ajv@8.20.0/node_modules/ajv/dist/refs/json-schema-2020-12/meta');

const oas = (await import(pathToFileURL(oasPath).href)).default;
const oas32 = (await import(pathToFileURL(oasPath.replace('v3.1', 'v3.2')).href)).default;
const oas30 = (await import(pathToFileURL(oasPath.replace('v3.1', 'v3.0')).href)).default;

// ---- JSON Schema 2020-12 keywords, per vocabulary --------------------------------------
const keywords = [];
for (const file of readdirSync(metaDir).sort()) {
  const meta = JSON.parse(readFileSync(join(metaDir, file), 'utf8'));
  for (const name of Object.keys(meta.properties ?? {})) {
    keywords.push({
      vocabulary: file.replace('.json', ''),
      keyword: name,
      deprecated: meta.properties[name].deprecated === true,
    });
  }
}
const validation = JSON.parse(readFileSync(join(metaDir, 'validation.json'), 'utf8'));
const typeValues = validation.$defs.simpleTypes.enum;

// ---- OpenAPI 3.1 objects and their fields ------------------------------------------------
// Walk one object definition without following $ref, collecting every property name that
// any branch declares, the fixed values it may take, and how the object is extended.
function walk(node, acc) {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, acc);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === 'properties' && value && typeof value === 'object') {
      for (const [prop, sub] of Object.entries(value)) {
        const entry = (acc.fields[prop] ??= { values: new Set(), refs: new Set() });
        if (sub && typeof sub === 'object') {
          if (Array.isArray(sub.enum)) for (const v of sub.enum) entry.values.add(String(v));
          if ('const' in sub) entry.values.add(String(sub.const));
          if (typeof sub.$ref === 'string') entry.refs.add(sub.$ref.replace('#/$defs/', ''));
          if (sub.additionalProperties?.$ref)
            entry.refs.add('map of ' + sub.additionalProperties.$ref.replace('#/$defs/', ''));
          if (sub.items?.$ref) entry.refs.add('list of ' + sub.items.$ref.replace('#/$defs/', ''));
        }
        walk(sub, acc);
      }
      continue;
    }
    if (key === 'patternProperties' && value && typeof value === 'object') {
      for (const [pattern, sub] of Object.entries(value)) {
        acc.patterns.add(pattern + (sub?.$ref ? ' -> ' + sub.$ref.replace('#/$defs/', '') : ''));
        walk(sub, acc);
      }
      continue;
    }
    if (key === 'additionalProperties' && value && typeof value === 'object') {
      acc.patterns.add(
        '* -> ' + (value.$ref ? value.$ref.replace('#/$defs/', '') : JSON.stringify(value)),
      );
    }
    if (key === '$ref' && typeof value === 'string') {
      if (value === '#/$defs/specification-extensions') acc.extensions = true;
      continue;
    }
    walk(value, acc);
  }
}

function describe(name, def) {
  const acc = { fields: {}, patterns: new Set(), extensions: false };
  walk(def, acc);
  return {
    object: name,
    source: def.$comment ?? null,
    extensions: acc.extensions,
    patterns: [...acc.patterns].sort(),
    fields: Object.entries(acc.fields)
      .map(([field, e]) => ({ field, values: [...e.values].sort(), refs: [...e.refs].sort() }))
      .sort((a, b) => a.field.localeCompare(b.field)),
  };
}

const { $defs, ...rootDef } = oas;
const objects = [describe('openapi (document root)', rootDef)];
for (const [name, def] of Object.entries($defs)) objects.push(describe(name, def));

// ---- What 3.2 and 3.0 documents add ----------------------------------------------------
const objects32 = [describe('openapi (document root)', (({ $defs: _d, ...r }) => r)(oas32))];
for (const [name, def] of Object.entries(oas32.$defs)) objects32.push(describe(name, def));
const have = new Map(objects.map((o) => [o.object, o]));
const added32 = [];
for (const o of objects32) {
  const base = have.get(o.object);
  for (const f of o.fields) {
    const old = base?.fields.find((x) => x.field === f.field);
    const newValues = f.values.filter((v) => !old?.values.includes(v));
    if (!old)
      added32.push({ object: o.object, field: f.field, values: f.values, newObject: !base });
    else if (newValues.length)
      added32.push({ object: o.object, field: f.field, values: newValues, newValuesOnly: true });
  }
  for (const p of o.patterns)
    if (!base?.patterns.includes(p))
      added32.push({ object: o.object, pattern: p, newObject: !base });
}
const all2020 = new Set(keywords.map((k) => k.keyword));
const schema30 = Object.keys(oas30.definitions.Schema.properties);
const added30 = schema30.filter((k) => !all2020.has(k));
const absent30 = [...all2020].filter((k) => !schema30.includes(k));

console.log(
  JSON.stringify(
    {
      added32,
      schema30: {
        id: oas30.id ?? oas30.$id,
        keywords: schema30,
        notIn2020: added30,
        keywords2020NotIn30: absent30,
      },
      id32: oas32.$id,
      sources: {
        openapi: oas.$id,
        jsonSchema: 'https://json-schema.org/draft/2020-12 (ajv 8.20.0 refs)',
      },
      keywords,
      typeValues,
      objects,
    },
    null,
    1,
  ),
);
```

`classes.mjs` (the proposals, as data):

```js
// Proposed class per row, for the two pairs of SPEC-C-1. Hand-written; report.mjs fails if a
// computed row has no proposal here or a proposal names a row that was not computed.
// C carried · S carried as structure · K carried by companion · U unexpressible
// N no class fits · R read by the parser (no class fits)
// A trailing '*' on a Zod class means: Zod has no constructor for it, so the writer emits
// a check function of Castr's own.

// keyword: [zod, typescript, note]
export const keywordClass = {
  // applicator
  prefixItems: ['C', 'C', 'Tuple, with `items` as its rest.'],
  items: ['C', 'C', ''],
  contains: ['C*', 'K', ''],
  additionalProperties: [
    'C',
    'K',
    'Zod: strict, loose or catchall. TypeScript cannot close an object and cannot constrain extra keys beside named ones.',
  ],
  properties: ['C', 'C', ''],
  patternProperties: [
    'C*',
    'K',
    "TypeScript shows an index signature; the key pattern is the companion's.",
  ],
  dependentSchemas: ['C*', 'K', ''],
  propertyNames: ['C*', 'K', ''],
  if: ['C*', 'K', 'With `then` and `else`, one construct.'],
  then: ['C*', 'K', ''],
  else: ['C*', 'K', ''],
  allOf: ['C', 'C', 'Closed objects under `allOf` are merged before writing (SPEC-P-1, writing).'],
  anyOf: ['C', 'C', ''],
  oneOf: ['C', 'K', "Zod: `z.xor`. A TypeScript union is `anyOf`; exactly-one is the companion's."],
  not: ['C*', 'K', 'TypeScript has no negated type.'],
  // content
  contentEncoding: ['S', 'K', 'An annotation in 2020-12; it asserts nothing.'],
  contentMediaType: ['S', 'K', 'As above.'],
  contentSchema: ['S', 'K', 'As above.'],
  // core
  $id: ['S', 'S', 'Identity of an embedded resource; references resolve through it.'],
  $schema: ['R', 'R', 'Selects the dialect the schema is read in.'],
  $ref: [
    'C',
    'C',
    'Written as a reference to a named definition (SPEC-PR-3). Keywords beside it apply too.',
  ],
  $anchor: ['S', 'S', 'A name a reference can target.'],
  $dynamicRef: [
    'C',
    'C',
    'Resolved by the parser for each scope that reaches it. The hardest row to build.',
  ],
  $dynamicAnchor: ['S', 'S', 'With `$dynamicRef`.'],
  $vocabulary: ['R', 'R', 'Has meaning only in a meta-schema.'],
  $comment: ['S', 'K', "A note for the schema's author."],
  $defs: ['S', 'S', 'Named definitions, each written once.'],
  // format
  format: ['C', 'K', 'One row per format value, below.'],
  // meta-data
  title: ['S', 'K', "Zod: the schema's registry entry. TypeScript: a documentation comment."],
  description: ['S', 'K', 'As `title`.'],
  default: ['S', 'K', 'An annotation, reported as a warning (SPEC-P-6). It inserts nothing.'],
  deprecated: ['S', 'K', 'TypeScript: `@deprecated`.'],
  readOnly: [
    'S',
    'K',
    'An annotation in 3.1. TypeScript `readonly` means something else and is not used.',
  ],
  writeOnly: ['S', 'K', ''],
  examples: ['S', 'K', ''],
  // unevaluated
  unevaluatedItems: [
    'C*',
    'K',
    "Becomes the tuple's rest where the parser can settle it; a check otherwise.",
  ],
  unevaluatedProperties: [
    'C*',
    'K',
    'Becomes the unknown-key policy where the parser can settle it; a check otherwise.',
  ],
  // validation
  type: ['C', 'C', "One row per value, below. `integer` is the companion's in TypeScript."],
  const: ['C', 'C', 'Any JSON value: an object or array is written as a closed shape of literals.'],
  enum: ['C', 'C', 'Members of any JSON type.'],
  multipleOf: [
    'C',
    'K',
    'Zod divides in binary floating point; SPEC-G-4 decides whether that agrees with exact decimals.',
  ],
  maximum: ['C', 'K', ''],
  exclusiveMaximum: ['C', 'K', ''],
  minimum: ['C', 'K', ''],
  exclusiveMinimum: ['C', 'K', ''],
  maxLength: [
    'C',
    'K',
    'JSON Schema counts characters; Zod counts UTF-16 units. They differ on astral characters.',
  ],
  minLength: ['C', 'K', 'As `maxLength`.'],
  pattern: ['C', 'K', 'Both are ECMA-262 expressions.'],
  maxItems: ['C', 'K', ''],
  minItems: ['C', 'K', ''],
  uniqueItems: ['C*', 'K', "Equality is JSON Schema's: by value, with `1` equal to `1.0`."],
  maxContains: ['C*', 'K', 'With `contains`.'],
  minContains: ['C*', 'K', 'With `contains`.'],
  maxProperties: ['C*', 'K', ''],
  minProperties: ['C*', 'K', ''],
  required: ['C', 'C', ''],
  dependentRequired: ['C*', 'K', ''],
};

// The seven values of `type`.
export const typeClass = {
  array: ['C', 'C', ''],
  boolean: ['C', 'C', ''],
  integer: ['C', 'K', 'TypeScript has one number type.'],
  null: ['C', 'C', ''],
  number: ['C', 'C', ''],
  object: ['C', 'C', ''],
  string: ['C', 'C', ''],
};

// Rows the two machine-readable definitions do not list. Each names its source.
export const proseRows = [
  [
    '`true` and `false` as a schema',
    'C',
    'C',
    'JSON Schema Core 4.3.2',
    '`z.unknown()` and `z.never()`.',
  ],
  ['a list of types (`type: [..]`)', 'C', 'C', 'Validation 6.1.1', ''],
  [
    'a keyword no vocabulary defines',
    'S',
    'K',
    'Core 6.5',
    'Collected as an annotation and named in the run report; never a refusal.',
  ],
  [
    '`x-` extension on a schema',
    'S',
    'K',
    'OpenAPI 3.1, 4.9',
    'Named among the parts of meaning (specification section 3).',
  ],
  ['`x-` extension on any other object', 'N', 'N', 'OpenAPI 3.1, 4.9', ''],
  [
    '`discriminator` (`propertyName`, `mapping`)',
    'S',
    'S',
    'OpenAPI 3.1, 4.8.25',
    'A hint in 3.1: it changes no accepted value.',
  ],
  [
    '`xml` (`name`, `namespace`, `prefix`, `attribute`, `wrapped`)',
    'N',
    'N',
    'OpenAPI 3.1, 4.8.26',
    'How a value is serialised as XML.',
  ],
  ['`externalDocs` on a schema', 'S', 'K', 'OpenAPI 3.1, 4.8.24.2', ''],
  ['`example` on a schema (deprecated)', 'S', 'K', 'OpenAPI 3.1, 4.8.24.2', ''],
  [
    '`nullable` (3.0 documents only)',
    'C',
    'C',
    'OpenAPI 3.0.4, 4.7.24',
    'Read as a union with `null`.',
  ],
  [
    '`jsonSchemaDialect` naming a dialect section 6 does not list',
    'R',
    'R',
    'OpenAPI 3.1, 4.8.1',
    'The document is valid and Castr cannot read its schemas. This needs the third rejection kind.',
  ],
];

// format value: [zod, typescript, source, note]
export const formatRows = [
  ['date-time', 'C', 'K', 'Validation 7.3.1', '`z.iso.datetime` with offsets allowed.'],
  ['date', 'C', 'K', 'Validation 7.3.1', ''],
  [
    'time',
    'C',
    'K',
    'Validation 7.3.1',
    'RFC 3339 full-time has an offset; `z.iso.time` refuses one, so a pattern is written.',
  ],
  ['duration', 'C', 'K', 'Validation 7.3.1', ''],
  [
    'email',
    'C',
    'K',
    'Validation 7.3.2',
    "Zod's pattern is narrower than RFC 5321; SPEC-G-4 decides.",
  ],
  ['idn-email', 'C*', 'K', 'Validation 7.3.2', ''],
  ['hostname', 'C', 'K', 'Validation 7.3.3', ''],
  ['idn-hostname', 'C*', 'K', 'Validation 7.3.3', ''],
  ['ipv4', 'C', 'K', 'Validation 7.3.4', ''],
  ['ipv6', 'C', 'K', 'Validation 7.3.4', ''],
  ['uri', 'C*', 'K', 'Validation 7.3.5', '`z.url` follows the WHATWG parser, not RFC 3986.'],
  ['uri-reference', 'C*', 'K', 'Validation 7.3.5', ''],
  ['iri', 'C*', 'K', 'Validation 7.3.5', ''],
  ['iri-reference', 'C*', 'K', 'Validation 7.3.5', ''],
  ['uuid', 'C', 'K', 'Validation 7.3.5', '`z.guid`: RFC 4122 form with no version check.'],
  ['uri-template', 'C*', 'K', 'Validation 7.3.6', ''],
  ['json-pointer', 'C*', 'K', 'Validation 7.3.7', ''],
  ['relative-json-pointer', 'C*', 'K', 'Validation 7.3.7', ''],
  ['regex', 'C*', 'K', 'Validation 7.3.8', ''],
  ['int32', 'C', 'K', 'OpenAPI 3.1, 4.3', ''],
  [
    'int64',
    'C',
    'K',
    'OpenAPI 3.1, 4.3',
    'A JavaScript number is exact only to 2^53; the value domain (SPEC-P-5) holds numbers exactly, so this row needs a decision of its own.',
  ],
  ['float', 'C', 'K', 'OpenAPI 3.1, 4.3', ''],
  ['double', 'C', 'K', 'OpenAPI 3.1, 4.3', ''],
  ['password', 'S', 'K', 'OpenAPI 3.1, 4.3', 'A hint to user interfaces; it asserts nothing.'],
  [
    'any other value',
    'S',
    'K',
    'OpenAPI 3.1, 4.3',
    'Carried as an annotation and named in the run report; never a refusal. SPEC-P-3 does not say this yet.',
  ],
];

// OpenAPI objects. '_' is the default for the object's fields; a field name overrides it.
// Value: [zod, typescript, note]
const DOC = ['N', 'N', 'Document content.'];
const SER = ['N', 'N', 'A serialisation rule.'];
const SAY = [
  'N',
  'K',
  'Said about a boundary, not about a schema: Zod has no place for it; TypeScript shows a comment.',
];
export const objectClass = {
  'openapi (document root)': {
    _: DOC,
    openapi: ['R', 'R', 'Selects the version the document is read as.'],
    jsonSchemaDialect: ['R', 'R', 'Selects the dialect its schemas are read in.'],
    paths: ['S', 'S', 'Each path template is a key.'],
    webhooks: ['S', 'S', ''],
    components: ['S', 'S', ''],
    '{pattern}': ['S', 'S', ''],
  },
  info: { _: DOC },
  contact: { _: DOC },
  license: { _: DOC },
  server: { _: DOC, '{pattern}': DOC },
  'server-variable': { _: DOC },
  components: {
    _: ['S', 'S', 'A named component stays named (SPEC-PR-3).'],
    schemas: ['C', 'C', 'Each named schema is written once.'],
    examples: ['N', 'N', ''],
    links: DOC,
    securitySchemes: DOC,
    '{pattern}': ['S', 'S', ''],
  },
  paths: { '{pattern}': ['S', 'S', 'The path template is the key.'] },
  'path-item': {
    _: ['S', 'S', 'The method is a key.'],
    parameters: ['C', 'C', 'Apply to every operation of the path.'],
    servers: DOC,
    summary: SAY,
    description: SAY,
  },
  operation: {
    _: SAY,
    operationId: ['S', 'S', "The boundary's identity."],
    parameters: ['C', 'C', ''],
    requestBody: ['C', 'C', ''],
    responses: ['C', 'C', ''],
    callbacks: ['S', 'S', ''],
    security: DOC,
    servers: DOC,
    tags: DOC,
    externalDocs: DOC,
    '{pattern}': ['S', 'S', ''],
  },
  'external-documentation': { _: DOC },
  parameter: {
    _: SER,
    name: ['S', 'S', ''],
    in: ['S', 'S', 'Four locations, each a key.'],
    required: ['C', 'C', ''],
    schema: ['C', 'C', ''],
    content: ['C', 'C', 'Keyed by media type.'],
    description: SAY,
    deprecated: SAY,
  },
  'request-body': {
    content: ['C', 'C', 'Keyed by media type.'],
    required: ['C', 'C', ''],
    description: SAY,
  },
  content: { '{pattern}': ['S', 'S', 'The media type is the key.'] },
  'media-type': { schema: ['C', 'C', ''], encoding: SER, '{pattern}': SER },
  encoding: { _: SER, '{pattern}': SER },
  responses: {
    default: ['S', 'S', 'Kept apart from every status (SPEC-C-1).'],
    '{pattern}': ['S', 'S', 'An exact code or a range; neither becomes the other.'],
  },
  response: {
    content: ['C', 'C', 'Keyed by media type.'],
    headers: ['C', 'C', ''],
    description: SAY,
    links: DOC,
    '{pattern}': ['S', 'S', ''],
  },
  callbacks: { '{pattern}': ['S', 'S', 'The expression is the key.'] },
  example: { _: ['N', 'N', 'An example of a body or parameter, not of a schema.'] },
  link: { _: DOC },
  header: {
    _: SER,
    required: ['C', 'C', ''],
    schema: ['C', 'C', ''],
    content: ['C', 'C', ''],
    description: SAY,
    deprecated: SAY,
  },
  tag: { _: DOC },
  reference: {
    $ref: ['C', 'C', 'Written as a reference (SPEC-PR-3).'],
    summary: SAY,
    description: SAY,
  },
  'security-scheme': { _: DOC },
  'oauth-flows': { _: DOC },
  'security-requirement': { '{pattern}': DOC },
  'specification-extensions': {
    '{pattern}': [
      'N',
      'N',
      'On a schema it is carried as structure; see the rows the definitions do not list.',
    ],
  },
  examples: {
    _: ['N', 'N', 'An example of a body or parameter, not of a schema.'],
    '{pattern}': ['N', 'N', ''],
  },
  'map-of-strings': { '{pattern}': DOC },
};
```

`report.mjs`:

```js
// usage: node report.mjs rows.json  -> the tables of the report, as markdown, on stdout
import { readFileSync } from 'node:fs';
import { keywordClass, typeClass, proseRows, formatRows, objectClass } from './classes.mjs';

const rows = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const NAME = {
  C: 'carried',
  'C*': 'carried, by a check Castr writes',
  S: 'structure',
  K: 'companion',
  U: 'unexpressible',
  N: 'no class fits',
  R: 'read by the parser',
};
const problems = [];
const tally = { zod: {}, ts: {} };
const count = (z, t) => {
  tally.zod[z] = (tally.zod[z] ?? 0) + 1;
  tally.ts[t] = (tally.ts[t] ?? 0) + 1;
};
const cell = (c) => NAME[c] ?? (problems.push('unknown class ' + c), c);
const out = [];
const table = (head, lines) => {
  out.push(
    '| ' + head.join(' | ') + ' |',
    '| ' + head.map(() => '---').join(' | ') + ' |',
    ...lines,
    '',
  );
};

// A. keywords
out.push('### A. Schema keywords (computed: the 2020-12 vocabularies)', '');
const seen = new Set();
const kwLines = [];
for (const k of rows.keywords) {
  seen.add(k.keyword);
  const c = keywordClass[k.keyword];
  if (!c) {
    problems.push('no proposal for keyword ' + k.keyword);
    continue;
  }
  count(c[0], c[1]);
  kwLines.push(`| \`${k.keyword}\` | ${k.vocabulary} | ${cell(c[0])} | ${cell(c[1])} | ${c[2]} |`);
}
for (const k of Object.keys(keywordClass))
  if (!seen.has(k)) problems.push('proposal for a keyword not computed: ' + k);
table(['Keyword', 'Vocabulary', 'To Zod', 'To TypeScript', 'Note'], kwLines);

out.push('### B. Values of `type` (computed)', '');
const tLines = [];
for (const t of rows.typeValues) {
  const c = typeClass[t];
  if (!c) {
    problems.push('no proposal for type ' + t);
    continue;
  }
  count(c[0], c[1]);
  tLines.push(`| \`${t}\` | ${cell(c[0])} | ${cell(c[1])} | ${c[2]} |`);
}
table(['Value', 'To Zod', 'To TypeScript', 'Note'], tLines);

out.push('### C. Values of `format` (from prose; not computed)', '');
table(
  ['Value', 'To Zod', 'To TypeScript', 'Source', 'Note'],
  formatRows.map(([v, z, t, src, note]) => {
    count(z, t);
    return `| ${v === 'any other value' ? v : '`' + v + '`'} | ${cell(z)} | ${cell(t)} | ${src} | ${note} |`;
  }),
);

out.push('### D. Schema rows the two definitions do not list (from prose; not computed)', '');
table(
  ['Construct', 'To Zod', 'To TypeScript', 'Source', 'Note'],
  proseRows.map(([v, z, t, src, note]) => {
    count(z, t);
    return `| ${v} | ${cell(z)} | ${cell(t)} | ${src} | ${note} |`;
  }),
);

// E. OpenAPI objects
out.push('### E. OpenAPI objects and their fields (computed: the 3.1 document schema)', '');
let fieldCount = 0;
let patternCount = 0;
const empty = [];
const oLines = [];
const seenObjects = new Set();
for (const o of rows.objects) {
  seenObjects.add(o.object);
  const cls = objectClass[o.object] ?? {};
  const used = new Set();
  if (o.fields.length === 0 && o.patterns.length === 0) {
    empty.push(o.object);
    if (objectClass[o.object]) problems.push('proposal for an object with no rows: ' + o.object);
    continue;
  }
  for (const f of o.fields) {
    fieldCount++;
    const c = cls[f.field] ?? cls._;
    if (cls[f.field]) used.add(f.field);
    if (!c) {
      problems.push(`no proposal for ${o.object}.${f.field}`);
      continue;
    }
    count(c[0], c[1]);
    const values =
      f.values.length > 1 ? ' (' + f.values.map((v) => '`' + v + '`').join(', ') + ')' : '';
    oLines.push(
      `| ${o.object} | \`${f.field}\`${values} | ${cell(c[0])} | ${cell(c[1])} | ${c[2]} |`,
    );
  }
  const keyed = o.patterns.filter((p) => !p.startsWith('^(schemas|'));
  if (keyed.length) {
    patternCount++;
    const c = cls['{pattern}'];
    used.add('{pattern}');
    if (!c) problems.push(`no proposal for the keyed entries of ${o.object}`);
    else {
      count(c[0], c[1]);
      const what = [...new Set(keyed.map((p) => p.split(' -> ')[0]))]
        .map((p) => (p === '*' ? 'any key' : '`' + p.replaceAll('|', '\\|') + '`'))
        .join(', ');
      oLines.push(
        `| ${o.object} | entries keyed by ${what} | ${cell(c[0])} | ${cell(c[1])} | ${c[2]} |`,
      );
    }
  }
  for (const k of Object.keys(cls))
    if (k !== '_' && !used.has(k))
      problems.push(`proposal for a field not computed: ${o.object}.${k}`);
}
for (const k of Object.keys(objectClass))
  if (!seenObjects.has(k)) problems.push('proposal for an object not computed: ' + k);
table(['Object', 'Field', 'To Zod', 'To TypeScript', 'Note'], oLines);
out.push(
  `Objects with no field of their own (a choice between an object and a reference, or the schema object, whose rows are A to D): ${empty.join(', ')}.`,
  '',
);

// F. other versions
out.push('### F. What 3.2 and 3.0 documents add (computed; no class proposed yet)', '');
const add = rows.added32.filter((a) => !a.pattern);
table(
  ['Object', 'Field', 'New in 3.2'],
  add.map(
    (a) =>
      `| ${a.object} | \`${a.field}\` | ${a.newValuesOnly ? 'values ' + a.values.map((v) => '`' + v + '`').join(', ') : a.newObject ? 'object and field' : 'field'} |`,
  ),
);
out.push(
  `The 3.0 schema object (\`${rows.schema30.id}\`) lists ${rows.schema30.keywords.length} keywords. Not in 2020-12: ${rows.schema30.notIn2020.map((k) => '`' + k + '`').join(', ')}. ` +
    `It has no place for ${rows.schema30.keywords2020NotIn30.length} of the 2020-12 keywords, and its \`type\`, \`exclusiveMaximum\`, \`exclusiveMinimum\` and \`items\` are read by draft-04's rules.`,
  '',
);

// counts
const total = Object.values(tally.zod).reduce((a, b) => a + b, 0);
const line = (t) =>
  Object.keys(NAME)
    .map((k) => `${NAME[k]} ${t[k] ?? 0}`)
    .join('; ');
out.unshift(
  '### Counts',
  '',
  `Rows with a proposed class: ${total} (${rows.keywords.length} keywords, ${rows.typeValues.length} type values, ${formatRows.length} format values, ${proseRows.length} other schema rows, ${fieldCount} fields and ${patternCount} keyed-entry rows over ${rows.objects.length} objects).`,
  '',
  `- To Zod: ${line(tally.zod)}.`,
  `- To TypeScript: ${line(tally.ts)}.`,
  '',
);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(out.join('\n'));
```
