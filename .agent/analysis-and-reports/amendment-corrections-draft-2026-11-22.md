# Draft amendment 0.8.1: corrections to part one, and the two rows that stop Oak's document

Status: first draft, not yet attacked. It is not approved and changes nothing in
`docs/SPECIFICATION.md`. Approval is the owner's typed words naming a version (SPEC-CC-2).
The version this draft would carry is 0.8.1.

It does two things. It corrects part one (specification 0.8.0) in the places known when
0.8.0 was approved or found just after. And, by the owner's decision fifteen of 22
November 2026 ("Carry in 0.8.1"), it says what the Zod and TypeScript outputs carry for a
schema-valued `additionalProperties` and for `propertyNames`, the two rows that stop Oak's
v1 document. It classes no other row of the scope-and-fidelity tables (SPEC-N-5 stays
open), and it does not touch numbers in JavaScript targets (part two).

## What the owner has decided

- **22 November 2026, decision twelve.** A document that passes the published schema and
  breaks a rule the OpenAPI text states only in words is refused as invalid; each rule is
  listed in the specification with the section that states it.
- **22 November 2026, decision thirteen.** A reference that points at nothing is refused
  by design.
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
  `https://spec.openapis.org/oas/3.2/schema/2026-11-12`.
- Each version also has a `schema-base` at the same date. It is the document schema with
  `jsonSchemaDialect`, and the `$schema` of every Schema Object, fixed to the OpenAPI
  dialect. A document that states JSON Schema Draft 2020-12 as its dialect, which case 3
  reads, fails `schema-base` and passes `schema`.
- At revision 2026-11-05 the 3.1 schema spells the Link Object's field `server`, as the
  text does. Rule 7 of SPEC-FV-2 describes a difference that revision does not have.
- Both schemas give the version line as a pattern that admits a suffix after the patch
  number: `^3\.1\.[0-9]+(-.+)?$` and `^3\.2\.[0-9]+(-.+)?$`.
- Both schemas hold that a Link Object has exactly one of `operationRef` and
  `operationId` (`oneOf` over `required`). Neither holds that the operation named exists.
- Neither schema holds that a Server Variable's `default` is one of its `enum` values:
  `default` is a required string and `enum` is a list of at least one string.
- Neither schema holds anything about the names in a Security Requirement Object: it is
  an object whose values are lists of strings.

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
- **Link Object** (4.8.20; 4.20), the same words in both.
  - Of `operationRef`: "This field is mutually exclusive of the operationId field, and
    MUST point to an Operation Object."
  - "A linked operation MUST be identified using either an operationRef or operationId.
    The identified or referenced operation MUST be unique, and in the case of an
    operationId, it MUST be resolved within the scope of the OpenAPI Description (OAD)."
- **Server Variable Object** (4.8.6; 4.6), the same words in both.
  - Of `default`: "If the enum is defined, the value MUST exist in the enum's values."

### What Zod and TypeScript can say

Run in scratch with Zod 4.6.7 and the TypeScript compiler in `lib`; the thread record's
"Step log" has each line.

- `z.record(K, V)` refuses a property name that fails `K`. An intersection of an object
  schema with `z.record(K, z.unknown())` does not. So Zod's own checker holds
  `propertyNames` only where the whole object is a record: an object that names no
  property.
- `z.record` over an enum of names requires every name to be present;
  `z.partialRecord` does not, and refuses a name outside the enum.
- `z.record(z.string(), V)` and `z.strictObject({}).catchall(V)` accept and refuse the
  same values.
- In TypeScript `{ [key: string]: V }` accepts and refuses as the source does for an
  object that names no property. Where the object names a property whose type is not
  assignable to `V`, no type does: the direct form does not compile, the intersection
  refuses valid values, and an index signature over the union accepts invalid ones.

### Oak's two schemas

`{type: object, propertyNames: {type: string}, additionalProperties: {type: string,
enum: [...]}}`. They name no property.

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
> of a Schema Object to case 3 and its validity to the meta-schema of that dialect, and
> not the publisher's `schema-base`, which holds every Schema Object to the OpenAPI
> dialect.

Why: the picture now reads these revisions (N1). `schema-base` would refuse a document
that states Draft 2020-12 as its dialect, which case 3 reads.

### 2. SPEC-FV-1 case 2: a version with a suffix

Before:

> 2. _Version._ The document has a `swagger` field, or its `openapi` field is absent or
>    does not match the pattern the publisher's schema gives for a version line in the
>    Read column. The rejection names the version stated, or that none is, and for a
>    3.0.x document, and no other, names SPEC-C-3 as the capability that will read it.

After:

> 2. _Version._ The document has a `swagger` field, whatever else it has, or its
>    `openapi` field is absent or does not match the pattern the publisher's schema gives
>    for a version line in the Read column. That pattern admits a suffix after the patch
>    number (`3.1.0-rc1`); such a document is read as its version line. The rejection
>    names the version stated, or that none is, and for a 3.0.x document, and no other,
>    names SPEC-C-3 as the capability that will read it.

Why: two findings of the adversarial review of part one. The publisher's pattern decides,
and it admits the suffix; no approved text excludes it. A document with both `swagger`
and `openapi` states two versions, and the clause as written already refuses it by its
first condition; "whatever else it has" says so.

### 3. SPEC-FV-1 case 3: a dialect stated inside a schema

Before:

> 3. _Dialect._ The document's `jsonSchemaDialect`, or the `$schema` of a schema in it,
>    names a dialect other than the OpenAPI dialect its publisher gives for the
>    document's version line, at any revision, and JSON Schema Draft 2020-12. The
>    rejection names the dialect and where it is stated.

After:

> 3. _Dialect._ The document's `jsonSchemaDialect`, or the `$schema` of a schema in it
>    at any depth, names a dialect other than the OpenAPI dialect its publisher gives for
>    the document's version line, at any revision, and JSON Schema Draft 2020-12. The
>    rejection names the dialect and where it is stated.

Why: a finding of the adversarial review of part one. A `$schema` nested inside a
2020-12 schema that names another dialect is the same case; "at any depth" says so.

### 4. SPEC-FV-1 case 4: a target in another document

Before (the last sentence of case 4):

> A document that breaks a rule listed in SPEC-FV-2 is refused under this case too.

After:

> A document that breaks a rule listed in SPEC-FV-2 is refused under this case too. So
> is one that refers to a target, in itself or in another document, that is not valid
> for the place the reference stands: the target is judged by the schema of the object
> that place holds, at the same revision.

Why: a hosted review of part one and the matrix pass of 22 November. Case 4 validated
the entry document only.

### 5. SPEC-FV-1 case 5: what a reference is

Before:

> 5. _A reference with no target._ After every document a reference names has been
>    read, its target is not there. This is a profile decision: the OpenAPI text states
>    no rule against it. The rejection names the reference and where it is. A target
>    that is there and that Castr does not reach is `NOT-YET-BUILT`.

After:

> 5. _A reference with no target._ After every document a reference names has been
>    read, its target is not there. A reference here is a `$ref`, a `$dynamicRef`, a
>    Link Object's `operationRef`, and a value of a Discriminator Object's `mapping`
>    that is a URI reference; a name resolved among the document's own components or
>    operations is not one, and SPEC-FV-2 lists the rules for those. A document that
>    cannot be fetched or opened has no target, and the rejection says that it could not
>    be read, so that the same inputs give the same rejection. This is a profile
>    decision: the OpenAPI text states no rule against it. The rejection names the
>    reference and where it is. A target that is there and that Castr does not reach is
>    `NOT-YET-BUILT`.

Why: two findings of the adversarial review of part one (what counts as a reference;
a failure while reading a referenced document).

### 6. SPEC-FV-2: the list

Before (rule 7):

> 7. In the pinned 3.1 schema, a Link Object's `body` is `server` in the text; the text
>    governs.

After (rule 7 is replaced, and rules 8 and 9 are added):

> 7. Each name in a Security Requirement Object corresponds to a security scheme declared
>    under the Components Object's `securitySchemes`; in 3.2 a name that corresponds to
>    none may instead be the URI of a Security Scheme Object (4.8.30; 4.30).
> 8. A Link Object's `operationId` names exactly one operation of the OpenAPI
>    Description (4.8.20; 4.20).
> 9. A Server Variable Object's `default` is one of its `enum` values, where it has an
>    `enum` (4.8.6; 4.6).

And the sentence before the list, before:

> a place where the schema refuses what the text allows is listed here too, and the
> document is then read. Listed, by the section numbers of 3.1.2 and of 3.2.0:

After:

> a place where the schema refuses what the text allows is listed here too, and the
> document is then read; at the revisions SPEC-FV-1 names there is none. Listed, by the
> section numbers of 3.1.2 and of 3.2.0:

Why: the three rules were read in summary or reported by a reviewer when 0.8.0 was
approved, and are now read word for word (above). Each is a rule the text states and
neither schema holds. That a Link Object has exactly one of `operationRef` and
`operationId` is held by both schemas and is not listed. That an `operationRef` has a
target is case 5. The old rule 7 described revision 2022-10-07.

### 7. SPEC-P-1: a constrained object in TypeScript

Before (the _Writing_ paragraph ends):

> In Zod, closed is `z.strictObject`, open is `z.looseObject`, constrained is
> `.catchall(S)`, stripped is `z.object`.

After:

> In Zod, closed is `z.strictObject`, open is `z.looseObject`, constrained is
> `.catchall(S)`, stripped is `z.object`. In TypeScript, a constrained object is an
> object type with an index signature. Where the object names no property the
> signature's value type is the type of `S`, and the class is carried. Where it names a
> property, the value type is the union of the type of `S` and the types of the named
> properties, the class is carried by companion, and a comment on the type states `S`:
> TypeScript has no type that accepts exactly those values, and the Zod output of the
> same run holds them.

Why: decision fifteen. TypeScript states a constrained object exactly only where no
named property is at odds with `S`; the simple rule (no named property) is one a
generator can decide from the model alone.

### 8. A new SPEC-P-7: property names

After SPEC-P-6, new:

> - **SPEC-P-7 Property names.** `propertyNames: K` holds every property name of an
>   object to `K`.
>   - _An object that names no property._ It has no `properties`, `patternProperties`,
>     `required`, `dependentRequired` or `dependentSchemas`, and its policy is open or
>     constrained. It is a map from names to values. In Zod it is written as a record of
>     `K` and of `S`, or of any value where the policy is open: `z.record` where `K` is
>     written as a string schema, `z.partialRecord` where `K` is an `enum` or a `const`
>     of strings. This is the form of SPEC-P-1's constrained and open policies for such
>     an object, in place of `.catchall` and `z.looseObject`, and the class is carried.
>     In TypeScript it is an index signature over `string` where `K` admits every
>     string, and a mapped type with optional members where `K` is an `enum` or a
>     `const` of strings; the class is carried. For any other `K` it is an index
>     signature over `string` with a comment that states `K`, and the class is carried
>     by companion.
>   - _Any other object,_ and a `K` whose Zod form is not a schema of strings. The
>     outcome is a `NOT-YET-BUILT` rejection until the scope-and-fidelity table classes
>     a check Castr writes.

Why: decision fifteen. Zod's own checker holds `propertyNames` only for a record. A
check Castr writes is the owner's decision two, and its mark is part three's; nothing
here assumes it.

## What this makes of Oak's document

Each of its two schemas is an object that names no property, with a `K` that admits
every string and an `S` that is an enum of two strings. Under clauses 7 and 8 the Zod
output is a record of strings to that enum and the TypeScript output is an index
signature over `string` of the union of the two strings; both are carried. Nothing else
in 0.8.1 bears on Oak's document. Whether anything stops the document after these two
is not known until the fix is built: a document refused at its first stop shows no
later one.

## What this does not do

- It does not class `additionalProperties: true`, which the reader refuses today and
  SPEC-P-1 calls open. Oak's document has none.
- It does not class `propertyNames` on an object that names properties.
- It does not sweep the two texts for every "MUST". The owner's decision twelve says
  what an unlisted rule costs.
- It does not say who decides well-formedness where YAML libraries differ, whether a
  file with no `openapi` field is read when referred to, or that a `$ref` written as
  data is not followed. Those are for the picture's cells of what the reader refuses
  (N2), and an amendment follows if a cell shows the text is not enough.

## Open before approval

- The attack this draft has not yet had.

Closed on 22 November: whether changing the model's validator waits on the model's
design. A principles-first reviewer tried to break the matrix row that says it does not,
and it held, with four conditions on how the fix is built. The thread record's "Step
log" has them. None changes this draft.
