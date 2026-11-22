# Draft amendment 0.8.1: corrections to part one

Status: third draft, not yet attacked. It is not approved and changes nothing in
`docs/SPECIFICATION.md`. Approval is the owner's typed words naming a version (SPEC-CC-2).
The version this draft would carry is 0.8.1.

This is the corrections alone. The [earlier draft](amendment-corrections-draft-2026-11-22.md)
also tried to class the two rows that stop Oak's document and to say what a reference is;
two attacks took both out, and that file holds every finding. By the owner's decision
seventeen of 22 November 2026 the two rows are classed with the tables (part three), and
the plan gives the references an amendment of their own after the picture's cells for
what the reader refuses (N7).

It changes four places in section 6: the revisions SPEC-FV-1 names, cases 2 and 3 of
SPEC-FV-1, and the list of SPEC-FV-2. It changes nothing for Oak's document.

## What the owner has decided

- **22 November 2026, decision eleven.** A Draft-07 schema inside an OpenAPI document is
  refused by dialect until the second capability.
- **22 November 2026, decision twelve.** A document that passes the published schema and
  breaks a rule the OpenAPI text states only in words is refused as invalid; each rule is
  listed in the specification with the section that states it, and an unlisted rule
  Castr trips over counts as unbuilt until an amendment lists it.
- **22 November 2026, decision seventeen.** The two rows that stop Oak's document are
  classed with the tables, in the accepted order.

## Facts the draft rests on

Each was read or run on 22 November 2026.

### The publisher's schemas, as the picture pins them

- The latest revisions the publisher listed that day are
  `https://spec.openapis.org/oas/3.1/schema/2026-11-05` and
  `https://spec.openapis.org/oas/3.2/schema/2026-11-12`, with the dialect meta-schemas
  `https://spec.openapis.org/oas/3.1/dialect/2024-11-10` and
  `https://spec.openapis.org/oas/3.2/dialect/2026-02-26`. The picture reads its rows
  from them (pull request #162).
- Each version also has a `schema-base` at the same date: the document schema with
  `jsonSchemaDialect`, and the `$schema` of every Schema Object, fixed to that version's
  dated dialect address. A document that states JSON Schema Draft 2020-12 as its
  dialect, which case 3 reads, fails `schema-base` and passes `schema`.
- At revision 2026-11-05 the 3.1 schema spells the Link Object's field `server`, as the
  text does. The present rule 7 describes revision 2022-10-07.
- The 3.2 schema at 2026-11-12 holds the present rule 6 itself: a name in
  `additionalOperations` may not be one of the nine methods a fixed field gives, in the
  capitals the text uses. A reviewer ran it: `POST` and `QUERY` are refused; `post` is
  not, which agrees with the text.
- Both schemas give the version line as a pattern that admits a suffix after the patch
  number: `^3\.1\.[0-9]+(-.+)?$` and `^3\.2\.[0-9]+(-.+)?$`. A reviewer ran `3.1.0-`,
  `3.10.0` and the number `3.1`: each is refused by the pattern.
- Neither schema holds any of these, and a reviewer ran a document that breaks each and
  passes both schemas: a name in a Security Requirement Object that no security scheme
  has; a Link Object's `operationId` that no operation has; a Server Variable Object
  whose `default` is not among its `enum`; in 3.2, a Tag Object whose `parent` names no
  tag. The 3.1 schema refuses `parent` altogether.
- Both schemas read a field of a Callback Object whose name begins `x-` as a Path Item.
  A reviewer ran it: `"x-note": "text"`, a number, `null` or a list is refused; an
  object that happens to be a valid Path Item passes.

### The OpenAPI text, word for word

Read from `https://spec.openapis.org/oas/v3.1.2.html` and
`https://spec.openapis.org/oas/v3.2.0.html`.

- **The dialect** (3.1.2 section 4.8.24.1; 3.2.0 section 4.24.1), the same words in
  both: "The OpenAPI Schema Object dialect for this version of the specification is
  identified by the URI https://spec.openapis.org/oas/3.1/dialect/base (the "OAS dialect
  schema id")." The 3.2 text names the 3.1 address.
- **Security Requirement Object** (4.8.30; 4.30).
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

## The clauses, before and after

### 1. SPEC-FV-1: the revisions named

Before:

> The revisions are `https://spec.openapis.org/oas/3.1/schema/2022-10-07` and
> `https://spec.openapis.org/oas/3.2/schema/2025-09-17`; a change of revision is a
> change to this document.

After:

> The revisions are `https://spec.openapis.org/oas/3.1/schema/2026-11-05` and
> `https://spec.openapis.org/oas/3.2/schema/2026-11-12`. They are the publisher's
> `schema`, and not its `schema-base`, which would refuse a document that states Draft
> 2020-12 as its dialect. A Schema Object in the OpenAPI dialect is judged by the
> meta-schema at `https://spec.openapis.org/oas/3.1/dialect/2024-11-10` in a 3.1
> document and at `https://spec.openapis.org/oas/3.2/dialect/2026-02-26` in a 3.2
> document, whichever address of that dialect the document states and whether it
> states one or none. A change of any of these revisions is a change to this document.

Why. The picture now reads these revisions. 0.8.0 named a revision for the document
schema and none for the meta-schema that judges a Schema Object, though case 4 uses one.
The version line fixes it, so that a document that names an older address of the dialect,
or none, still has one judge.

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

Why. Two findings of the review of part one. The publisher's pattern is what case 2
names as deciding, and it admits the suffix. A document with both fields states two
versions; the clause already refused it and now says as what.

### 3. SPEC-FV-1 case 3: which dialects are read, and where a dialect is stated

Before:

> 3. _Dialect._ The document's `jsonSchemaDialect`, or the `$schema` of a schema in it,
>    names a dialect other than the OpenAPI dialect its publisher gives for the
>    document's version line, at any revision, and JSON Schema Draft 2020-12. The
>    rejection names the dialect and where it is stated.

After:

> 3. _Dialect._ The document's `jsonSchemaDialect`, or the `$schema` of a Schema Object
>    in it, however deeply the Schema Object is nested, names a dialect that is not
>    read. The dialects read are JSON Schema Draft 2020-12 and the OpenAPI dialect. The
>    OpenAPI dialect is named by the address the text of 3.1 and of 3.2 both give,
>    `https://spec.openapis.org/oas/3.1/dialect/base`, and by any address under
>    `https://spec.openapis.org/oas/3.1/dialect/` in a 3.1 document or under
>    `https://spec.openapis.org/oas/3.2/dialect/` in a 3.2 document. A `$schema` that is
>    part of a value (inside `const`, `enum`, `default`, `example` or `examples`) is data
>    and states no dialect. The rejection names the dialect and where it is stated.

Why. Read word for word on 22 November: the 3.2 text names the 3.1 `base` address as
the OpenAPI dialect, and the publisher's 3.2 schemas give a 3.2 address. As approved,
case 3 did not say whether a 3.2 document that names the address its own text names is
read; it is. "A schema in it" also reached a `$schema` written inside data, which is not
a statement of dialect, and did not say that nesting makes no difference.

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
> "Allowed", and the document is then read. Listed, by the section numbers of 3.1.2 and
> of 3.2.0:
>
> 6. In 3.1, each name in a Security Requirement Object corresponds to a security scheme
>    declared in the Security Schemes under the Components Object (4.8.30).
> 7. A Link Object's `operationId` is the `operationId` of an operation in the OpenAPI
>    Description (4.8.20; 4.20).
> 8. A Server Variable Object's `default` is one of its `enum` values, where it has an
>    `enum` (4.8.6; 4.6).
> 9. In 3.2, a Tag Object's `parent` is the name of a tag in the document's `tags`, and
>    following `parent` from a tag never returns to that tag (4.22).
> 10. Allowed: a field of a Callback Object whose name begins `x-` is a specification
>     extension, whatever its value (4.8.18; 4.18). Both schemas read it as a Path Item.
>     The document is judged as if the Callback Object did not have those fields.

Rules 1 to 5 are unchanged.

Why.

- The present rule 6 is held by the 3.2 schema at the revision now named, so it is no
  longer a rule "the publisher's schema does not hold", and case 4 refuses a document
  that breaks it without it.
- The present rule 7 describes revision 2022-10-07.
- The new rules 6 to 9 are each a rule the text states and neither schema holds.
- Rule 6 is stated for 3.1 only. In 3.2 a name that corresponds to no declared scheme
  may be the URI of a Security Scheme Object, and whether that URI has a target is a
  question about references, which the amendment on references (N7) answers. Until it
  does, a 3.2 document with such a name is read, and decision twelve says what follows.
- Rule 7 says the operation exists. That it is the only one with that `operationId` is
  rule 1. That a Link Object's `operationRef` points to an Operation Object is a
  question about references, and is N7's.
- Rule 9 says "in the document's `tags`" where the text says "in the API description":
  the `tags` field of the OpenAPI Object is the only place the text gives for declaring
  a tag.
- Rule 10 is the one place found where the schema refuses what the text allows. The
  draft does not say there is no other.

## What this does not do

- It does not class any row of the scope-and-fidelity tables.
- It does not say what a reference is, that a reference's target must be valid for the
  place it stands, or what a failed fetch says. Those are N7.
- It does not sweep the two texts for every "MUST".
- It does not say who decides well-formedness where YAML libraries differ, including
  whether `openapi: 3.0` written as a YAML number is a 3.0.x document. That is for the
  picture's cells for what the reader refuses (N2).

## When it lands

The two document schemas 0.8.0 names (3.1 of 2022-10-07, 3.2 of 2025-09-17) are pinned
in the picture only because 0.8.0 names them. The change that lands 0.8.1 removes them
and their pins, with the sentences in the picture's README and the notices file that
mention them.

## Open before approval

- An attack on this draft, and the conscience check on the plan as it now stands.
