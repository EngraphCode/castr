# Draft amendment 0.8.1: corrections to part one, and the two rows that stop Oak's document

Status: second draft, after one adversarial review broke the first in eleven places. It
is not approved and changes nothing in `docs/SPECIFICATION.md`. Approval is the owner's
typed words naming a version (SPEC-CC-2). The version this draft would carry is 0.8.1.

It does two things. It corrects part one (specification 0.8.0) where a correction can be
stated exactly today. And, by the owner's decision fifteen of 22 November 2026 ("Carry in
0.8.1"), it says what the Zod and TypeScript outputs carry for a schema-valued
`additionalProperties` and for `propertyNames`, for the shape of object Oak's v1 document
uses, and says that every other shape is unbuilt until the tables class it. These are
the first two rows of the scope-and-fidelity tables to be written; SPEC-N-5 stays open
for every other row. It does not touch numbers in JavaScript targets (part two).

The second draft is narrower than the first. The first tried to say what a reference
is, what its target must be, and what both outputs write for every shape of the two
rows. The review showed each of those was a list nothing forced to be complete. What
could not be said exactly is taken out and named under "Deferred".

## What the owner has decided

- **22 November 2026, decision twelve.** A document that passes the published schema and
  breaks a rule the OpenAPI text states only in words is refused as invalid; each rule is
  listed in the specification with the section that states it.
- **22 November 2026, decision fifteen.** The text for the two rows that stop Oak's
  document is brought for approval in 0.8.1.
- **22 November 2026, decision sixteen.** The fix is built with that text, not ahead of
  it.
- **20 November 2026, decision two** (recorded in the thread record). A Zod check Castr
  writes is carried and marked. The mark is part three's and is not defined here.

## Facts the draft rests on

Each was read or run on 22 November 2026 at `main` commit `e0794427`.

### The publisher's schemas

- The picture pins, and reads its rows from, the latest revisions the publisher listed
  that day: `https://spec.openapis.org/oas/3.1/schema/2026-11-05` and
  `https://spec.openapis.org/oas/3.2/schema/2026-11-12`, with the dialect meta-schemas
  `https://spec.openapis.org/oas/3.1/dialect/2024-11-10` and
  `https://spec.openapis.org/oas/3.2/dialect/2026-02-26`.
- Each version also has a `schema-base` at the same date. It is the document schema with
  `jsonSchemaDialect`, and the `$schema` of every Schema Object, fixed to the OpenAPI
  dialect. A document that states JSON Schema Draft 2020-12 as its dialect, which case 3
  reads, fails `schema-base` and passes `schema`.
- At revision 2026-11-05 the 3.1 schema spells the Link Object's field `server`, as the
  text does. Rule 7 of SPEC-FV-2 describes a difference that revision does not have.
- Both schemas give the version line as a pattern that admits a suffix after the patch
  number: `^3\.1\.[0-9]+(-.+)?$` and `^3\.2\.[0-9]+(-.+)?$`.
- The 3.2 schema holds rule 6 of SPEC-FV-2 itself: the names in `additionalOperations`
  may not be one of the nine methods a fixed field gives (`propertyNames` with `not` over
  an `enum`).
- Both schemas refuse a Callback Object that holds a specification extension. The
  definition is a reference to the extensions beside `additionalProperties` of a path
  item, and `additionalProperties` does not see what the reference allows. Run with a
  reference validator by the reviewer: a callback with `"x-note": "text"` fails both,
  and passes without it.
- Both schemas hold that a Link Object has exactly one of `operationRef` and
  `operationId`. Neither holds that the operation named exists.
- Neither schema holds that a Server Variable's `default` is one of its `enum` values,
  nor anything about the names in a Security Requirement Object, nor that a Tag Object's
  `parent` (3.2) names a tag.

### The OpenAPI text, word for word

Read from `https://spec.openapis.org/oas/v3.1.2.html` and
`https://spec.openapis.org/oas/v3.2.0.html`.

- **Security Requirement Object** (3.1.2 section 4.8.30; 3.2.0 section 4.30).
  - 3.1.2: "The name used for each property MUST correspond to a security scheme declared
    in the Security Schemes under the Components Object."
  - 3.2.0: "The name used for each property MUST either correspond to a security scheme
    declared in the Security Schemes under the Components Object, or be the URI of a
    Security Scheme Object. Property names that are identical to a component name under
    the Components Object MUST be treated as a component name."
- **Link Object** (4.8.20; 4.20), the same words in both. "A linked operation MUST be
  identified using either an operationRef or operationId. The identified or referenced
  operation MUST be unique, and in the case of an operationId, it MUST be resolved within
  the scope of the OpenAPI Description (OAD)."
- **Server Variable Object** (4.8.6; 4.6), the same words in both, of `default`: "If the
  enum is defined, the value MUST exist in the enum's values."
- **Tag Object** (3.2.0 section 4.22), of `parent`: "The named tag MUST exist in the API
  description, and circular references between parent and child tags MUST NOT be used."
- **Callback Object** (4.8.18; 4.18), the same words in both: "This object MAY be
  extended with Specification Extensions."

### What Zod and TypeScript can say

Run in scratch with Zod 4.6.7, the TypeScript compiler in `lib` and a reference
validator; the thread record's "Step log" has the seat's runs and the reviewer's.

- For an object that names no property, `z.strictObject({}).catchall(V)` accepts and
  refuses as the source does, with one exception below. `{ [key: string]: V }` in
  TypeScript accepts and refuses as the source does, and is assignable in both
  directions with the input type of that Zod schema.
- **The exception.** For the value `{"__proto__": "zzz"}`, which the source refuses when
  `"zzz"` fails `V`, a Zod catchall, a Zod loose object and a Zod record all accept, and
  leave the property out of the value they return. A Zod strict object refuses it.
- Zod's own checker holds a `propertyNames` only where the whole object is a record. An
  intersection of an object schema with a record does not refuse a name that fails.
- In TypeScript, an object that names a property whose type its `additionalProperties`
  does not admit has no exact type. An index signature over the union does not compile
  when a named property is optional, and is not assignable to the input type of the Zod
  schema, which SPEC-G-4 requires.
- A `patternProperties` beside a schema-valued `additionalProperties` makes `.catchall`
  wrong: the source accepts a value under the pattern that the catchall refuses.

### Oak's two schemas

`{type: object, propertyNames: {type: string}, additionalProperties: {type: string,
enum: [...]}, example: {...}}`. They name no property. A property name is always a
string, so this `propertyNames` holds no name to anything.

## The clauses, before and after

### 1. SPEC-FV-1: the revisions named

Before:

> The revisions are `https://spec.openapis.org/oas/3.1/schema/2022-10-07` and
> `https://spec.openapis.org/oas/3.2/schema/2025-09-17`; a change of revision is a
> change to this document.

After:

> The revisions are `https://spec.openapis.org/oas/3.1/schema/2026-11-05` and
> `https://spec.openapis.org/oas/3.2/schema/2026-11-12`; a change of revision is a
> change to this document. They are the publisher's `schema`, which leaves the dialect
> of a Schema Object to case 3, and not its `schema-base`, which holds every Schema
> Object to the OpenAPI dialect. A Schema Object in the OpenAPI dialect is judged by
> that dialect's meta-schema at `https://spec.openapis.org/oas/3.1/dialect/2024-11-10`
> or `https://spec.openapis.org/oas/3.2/dialect/2026-02-26`, whichever revision of the
> dialect the document names.

Why: the picture now reads these revisions (N1). `schema-base` would refuse a document
that states Draft 2020-12 as its dialect, which case 3 reads. Case 3 reads the OpenAPI
dialect "at any revision" and 0.8.0 did not say which revision's meta-schema judges.

### 2. SPEC-FV-1 case 2: a version with a suffix, and two versions stated

Before:

> 2. _Version._ The document has a `swagger` field, or its `openapi` field is absent or
>    does not match the pattern the publisher's schema gives for a version line in the
>    Read column. The rejection names the version stated, or that none is, and for a
>    3.0.x document, and no other, names SPEC-C-3 as the capability that will read it.

After:

> 2. _Version._ The document has a `swagger` field, or its `openapi` field is absent or
>    does not match the pattern the publisher's schema gives for a version line in the
>    Read column. That pattern admits a suffix after the patch number (`3.1.0-rc1`); such
>    a document is read as its version line. A document with a `swagger` field is refused
>    as OpenAPI 2.0 whatever its `openapi` field says. The rejection names the version
>    stated, or that none is, and for a 3.0.x document with no `swagger` field, and no
>    other, names SPEC-C-3 as the capability that will read it.

Why: two findings of the adversarial review of part one. The publisher's pattern decides,
and it admits the suffix. A document with both fields states two versions; the clause
already refused it, and now says as what.

### 3. SPEC-FV-1 case 3: a dialect stated inside a schema

Before:

> 3. _Dialect._ The document's `jsonSchemaDialect`, or the `$schema` of a schema in it,
>    names a dialect other than

After:

> 3. _Dialect._ The document's `jsonSchemaDialect`, or the `$schema` of a schema in it
>    at any depth, names a dialect other than

The rest of the case is unchanged.

Why: a finding of the adversarial review of part one. A `$schema` nested inside a
2020-12 schema that names another dialect is the same case.

### 4. SPEC-FV-2: the list

Before (the sentence that introduces the list, and rules 6 and 7):

> a place where the schema refuses what the text allows is listed here too, and the
> document is then read. Listed, by the section numbers of 3.1.2 and of 3.2.0:
>
> 6. In 3.2, `additionalOperations` holds no entry for a method that a fixed field of
>    the Path Item gives (4.9.1).
> 7. In the pinned 3.1 schema, a Link Object's `body` is `server` in the text; the text
>    governs.

After:

> a place where the schema refuses what the text allows is listed here too, marked
> "allowed", and the document is then read. Listed, by the section numbers of 3.1.2 and
> of 3.2.0:
>
> 6. Each name in a Security Requirement Object corresponds to a security scheme declared
>    in the Security Schemes under the Components Object; in 3.2 a name that corresponds
>    to none may instead be the URI of a Security Scheme Object (4.8.30; 4.30).
> 7. A Link Object's `operationId` identifies exactly one operation, resolved within the
>    scope of the OpenAPI Description (4.8.20; 4.20).
> 8. A Server Variable Object's `default` is one of its `enum` values, where it has an
>    `enum` (4.8.6; 4.6).
> 9. In 3.2, a Tag Object's `parent` names a tag that exists in the API description, and
>    no tag is its own ancestor (4.22).
> 10. Allowed: a Callback Object may hold specification extensions (4.8.18; 4.18). Both
>     schemas refuse one.

Rules 1 to 5 are unchanged.

Why. The old rule 6 is held by the 3.2 schema at the revision now named, so it is no
longer a rule "the publisher's schema does not hold". The old rule 7 described revision
2022-10-07. The new rules 6 to 9 are each a rule the text states (above, word for word)
and neither schema holds; each uses the text's own words for its scope. Rule 10 is the
one place found where the schema refuses what the text allows. The draft does not say
there is no other: decision twelve says what an unlisted place costs.

### 5. SPEC-P-1: a constrained object, in both outputs

Before (the _Writing_ paragraph ends):

> In Zod, closed is `z.strictObject`, open is `z.looseObject`, constrained is
> `.catchall(S)`, stripped is `z.object`.

After:

> In Zod, closed is `z.strictObject`, open is `z.looseObject`, constrained is
> `.catchall(S)`, stripped is `z.object`.
>
> - _A map._ An object schema whose only keywords are `type: object`,
>   `additionalProperties`, `propertyNames` (SPEC-P-7) and annotations names no property
>   and is a map from names to values. A constrained map is carried in both outputs: in
>   Zod as `.catchall(S)` on a strict object with no properties, and in TypeScript as an
>   index signature over `string` whose value type is the type of `S`.
> - _Any other constrained object._ The outcome is a `NOT-YET-BUILT` rejection until the
>   scope-and-fidelity table classes it. TypeScript has no type that accepts exactly the
>   values of an object that names a property its `S` does not admit, and a
>   `patternProperties` beside `S` is not a catchall.
> - _A property named `__proto__`._ Under `.catchall`, `z.looseObject` and `z.record`,
>   Zod does not check a property of that name and leaves it out of the value it
>   returns. For that one name the generated validator behaves as stripped, whatever the
>   policy. Castr states this in the run's report for each such object, the samples of
>   SPEC-G-5 include the name, and SPEC-G-4 expects that decision and that returned
>   value for it.

Why: decision fifteen. Only the map is stated, because it is the only shape both outputs
can say exactly with what section 3 already defines. The `__proto__` paragraph declares a
difference the review found by running it. It is in the Zod forms 0.5.0 already
approved, and without the paragraph the class "carried" is false for one value.

### 6. A new SPEC-P-7: property names

After SPEC-P-6, new:

> - **SPEC-P-7 Property names.** `propertyNames: K` holds every property name of an
>   object to `K`. A property name is a string. A `K` that is `true`, or is an object
>   with no keyword but `type: string` and annotations, holds no name to anything: it is
>   read into the model, each output is the same with it as without it, and the run's
>   report lists it. For any other `K` the outcome is a `NOT-YET-BUILT` rejection until
>   the scope-and-fidelity table classes it.

Why: decision fifteen. Zod's own checker holds a `propertyNames` only as a whole-object
record, and a check Castr writes is part three's (decision two). Oak's `K` is
`{type: string}`. SPEC-G-5 already excuses a constraint that the source itself shows
changes nothing when deleted, which is this case.

## What this makes of Oak's document

Each of its two schemas is a constrained map with a `K` that holds no name to anything
and an `S` that is an enum of two strings. Under clauses 5 and 6 the Zod output is a
strict object with no properties and a catchall of that enum, and the TypeScript output
is an index signature over `string` of the union of the two strings; both are carried.
Nothing else in 0.8.1 bears on Oak's document. Whether anything stops the document
after these two is not known until the fix is built: a document refused at its first
stop shows no later one.

## Deferred, each with where it goes

The first draft tried these and the review showed each incomplete. They follow the
picture's cells for what the reader refuses (N2), which give a judge outside Castr for
references across documents; an amendment is written from those cells.

- What a reference is for case 5 (`$ref`, `$dynamicRef`, `operationRef`, a discriminator
  `mapping` or `defaultMapping` value, a 3.2 security requirement name that is a URI).
  The 3.2 text calls a mapping value that is both a schema name and a relative URI
  reference implementation-defined, and a `$ref` written as data is not a reference.
- That a reference's target must be valid for the place the reference stands, and that
  cases 1 to 3 apply to every document read, not only the entry document.
- What the rejection says when a referenced document cannot be fetched.

## What this does not do

- It does not class `additionalProperties: true`, which the reader refuses today and
  SPEC-P-1 calls open. Oak's document has none.
- It does not class a constrained object that names a property, or a `propertyNames`
  that holds names to something. Both stay `NOT-YET-BUILT`, and the count of SPEC-PR-6
  shows them.
- It does not sweep the two texts for every "MUST".

## The review, finding by finding

One adversarial review, 22 November 2026, instructed to find a document that gets the
design refusal and is really a defect, and a schema for which the two rows' output
decides differently from the source while claiming "carried". Each finding and what
became of it:

| Finding                                                                                               | Disposition                                                                                |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| "There is none" (no place where the schema refuses what the text allows) is false: a callback's `x-`  | Checked against both texts and both schemas. The claim is removed and the place is rule 10 |
| `z.record` over a finite `K` requires every name                                                      | No record is written in this draft: only a `K` that holds no name to anything is carried   |
| `__proto__` is accepted and dropped by catchall, loose and record                                     | Run by the seat as well. Declared in SPEC-P-1                                              |
| The list of keywords that make "an object that names no property" was open                            | Inverted: the map is defined by the only keywords it may have                              |
| The union index signature fails SPEC-G-4 and does not compile with an optional property               | Removed. A constrained object that names a property is `NOT-YET-BUILT`                     |
| A mapped type over an enum `K` does not hold `K`; "admits every string" had no rule                   | The enum form is removed, and the rule for a `K` that holds nothing is stated              |
| The list of what a reference is was incomplete and partly undecidable                                 | Deferred to follow N2                                                                      |
| A tag's `parent` is a rule no schema holds; rule 6 is held by the schema; rule scopes were the seat's | Rule 9 added from the text; old rule 6 removed; rules 6 and 7 use the text's words         |
| Cases 3 and 4 across documents                                                                        | Deferred to follow N2                                                                      |
| The dialect meta-schema revisions were not named                                                      | Named in clause 1                                                                          |
| The record form contradicted "constrained is `.catchall(S)`"; open was classed in one place only      | No record form remains, and nothing here classes open                                      |

## Open before approval

- A second attack on this narrower draft, and the conscience check the plan asks for at
  this step's start.
