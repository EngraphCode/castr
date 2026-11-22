# Draft amendment 0.8.1: corrections to part one

Status: fourth draft, not yet attacked. It is not approved and changes nothing in
`docs/SPECIFICATION.md`. Approval is the owner's typed words naming a version (SPEC-CC-2).
The version this draft would carry is 0.8.1.

It changes two places in section 6: the revisions SPEC-FV-1 names, and the list of
SPEC-FV-2. It changes nothing for Oak's document.

## How this draft was cut

Three drafts were attacked and each broke: in eleven places, in ten, and in fifteen. The
findings of the first two are in the
[earlier draft](amendment-corrections-draft-2026-11-22.md); the third review is the
table at the end of this file. Most findings fell on words that no correction forced:
new definitions, and clarifications of text that is unclear but not false.

This draft keeps a change only when both of these hold.

1. 0.8.0 is false or out of date against a primary source.
2. The correction can be written without a definition the specification does not have.

Everything else has a named home in the table at the end.

## What it serves

The owner's words of 20 November 2026: "What I want is to not have to rework Castr if
Oak adds an additional, valid field type to their spec". Whether a field is valid is
decided by case 4 of SPEC-FV-1, against the publisher's schema at the revision the
specification names. The picture has read the schemas of November 2026 since pull
request #162, and 0.8.0 still names those of October 2022 and September 2025. Until the
text names the schemas the check uses, the approved text and the check disagree about
which documents are valid. This amendment closes that, and takes out two rules the new
revisions make untrue.

## What the owner has decided

- **22 November 2026, decision twelve.** A document that passes the published schema and
  breaks a rule the OpenAPI text states only in words is refused as invalid; each rule is
  listed in the specification with the section that states it, and an unlisted rule
  Castr trips over counts as unbuilt until an amendment lists it.
- **22 November 2026, decision seventeen.** The two rows that stop Oak's document are
  classed with the tables, in the accepted order.

## Facts the draft rests on

Each was run or read on 22 November 2026, by a reviewer and then by the seat, or by the
seat alone where it says so.

### The publisher's schemas, as the picture pins them

- The publisher's index (`https://spec.openapis.org/oas/`) lists
  `https://spec.openapis.org/oas/3.1/schema/2026-11-05` and
  `https://spec.openapis.org/oas/3.2/schema/2026-11-12` as the latest revisions. The
  picture reads its rows from them (pull request #162), and the pinned files match the
  fetched ones byte for byte.
- At revision 2026-11-05 the 3.1 schema spells the Link Object's field `server`, as the
  text does: a Link Object with `server` passes and one with `body` fails. At
  2022-10-07 it is the other way round. The present rule 7 describes revision
  2022-10-07.
- The 3.2 schema at 2026-11-12 holds the present rule 6 itself: a name in
  `additionalOperations` may not be one of the nine methods a fixed field gives, in the
  capitals the text uses. All nine are refused; `post`, `Post`, `query` and `COPY`
  pass, which agrees with the text.
- Neither schema holds this: a Server Variable Object whose `default` is not among its
  `enum` passes both. Both schemas already require an `enum` to have at least one
  value.
- Both schemas read a field of a Callback Object whose name begins `x-` as a Path Item:
  `"x-note": "text"`, a number, `null`, `true` or a list is refused; an object that is
  a valid Path Item passes. A sweep of every object that carries the extension sentence
  found no other object where a schema refuses an `x-` field.

### The OpenAPI text, word for word

Read from `https://spec.openapis.org/oas/v3.1.2.html`, `v3.2.0.html` and `v3.2.1.html`.
The publisher's index lists 3.1.2 as the latest 3.1 text and 3.2.1 (10 September 2026)
as the latest 3.2 text. Each sentence below is the same in all three, and the section
numbers of 3.2.0 and 3.2.1 are the same for every section section 6 cites (seat's
reading: the headings of both, and a comparison of every sentence holding "MUST",
"SHALL" or "REQUIRED").

- **Server Variable Object** (4.8.6; 4.6), of `default`: "If the enum is defined, the
  value MUST exist in the enum's values."
- **Callback Object** (4.8.18; 4.18): "This object MAY be extended with Specification
  Extensions."

## The clauses, before and after

### 1. SPEC-FV-1: the revisions named

Before:

> The revisions are `https://spec.openapis.org/oas/3.1/schema/2022-10-07` and
> `https://spec.openapis.org/oas/3.2/schema/2025-09-17`; a change of revision is a
> change to this document.

After:

> The revisions are `https://spec.openapis.org/oas/3.1/schema/2026-11-05` and
> `https://spec.openapis.org/oas/3.2/schema/2026-11-12`; a change of revision is a
> change to this document.

Why. Out of date: the publisher has later revisions and the picture reads them.

### 2. SPEC-FV-2: the list

Before (the end of the sentence that introduces the list, and rules 6 and 7):

> a place where the schema refuses what the text allows is listed here too, and the
> document is then read. Listed, by the section numbers of 3.1.2 and of 3.2.0:
>
> 6. In 3.2, `additionalOperations` holds no entry for a method that a fixed field of
>    the Path Item gives (4.9.1).
> 7. In the pinned 3.1 schema, a Link Object's `body` is `server` in the text; the text
>    governs.

After:

> a place where the schema refuses what the text allows is listed here too, marked
> "Allowed"; the document is then read, and the required check runs a document for
> each such place as it does for each rule. Listed, by the section numbers of 3.1.2 and
> of 3.2.0:
>
> 6. A Server Variable Object's `default` is one of its `enum` values, where it has an
>    `enum` (4.8.6; 4.6).
> 7. Allowed: a field of a Callback Object whose name begins `x-` is a specification
>    extension, whatever its value (4.8.18; 4.18). Both schemas read it as a Path Item.
>    For every case of SPEC-FV-1 and every rule listed here, the document is judged as
>    if the Callback Object did not have those fields.

Rules 1 to 5 are unchanged.

Why.

- The present rule 6 is held by the 3.2 schema at the revision now named. It is no
  longer a rule "the publisher's schema does not hold", and case 4 refuses a document
  that breaks it without it.
- The present rule 7 describes revision 2022-10-07, and is untrue of 2026-11-05.
- The new rule 6 is a rule the text states and neither schema holds. It concerns one
  object and nothing outside it.
- The new entry 7 is a place where 0.8.0 refuses a document the text allows. With the
  present rule 7 gone it is the only "Allowed" entry. An extension's value is not the
  format's, so nothing inside it is judged: the last sentence says so for the cases as
  well as the rules, because case 3 is decided before case 4.
- The words about the required check are added because SPEC-FV-1 says the check runs
  "one for each rule SPEC-FV-2 lists", and an "Allowed" place is not a rule.
- The numbers 6 and 7 are used again with new meanings. An ordered list cannot leave a
  gap. The plan's two mentions of "rule 7" in the old meaning are reworded in the
  change that carries this draft; dated entries in the thread record stand as written.

## What this does not do

- It does not class any row of the scope-and-fidelity tables.
- It does not change case 2 or case 3 of SPEC-FV-1.
- It does not list any rule that turns on which documents make up a description.
- It does not sweep the texts for every "MUST".
- It does not say there is no other place where a schema refuses what the text allows.
  Four candidates of another shape are in the table below.

## When it lands

The plan's "How an approved amendment lands" gives the steps, including the version,
the date and the change-log row SPEC-CC-1 requires. Beyond those:

- The two document schemas 0.8.0 names (3.1 of 2022-10-07, 3.2 of 2025-09-17) are
  pinned in the picture only because 0.8.0 names them. The landing change removes them
  and their pins, and corrects each sentence that mentions them: the picture's README,
  the notices file, and the comment at `lib/tests-picture/rows/published-rows.ts` that
  names 2022-10-07.

## The third review, and where each finding went

One adversarial review of the third draft (commit `86edae41`), 22 November 2026. The
seat reproduced findings 1 and 12 itself; the others are taken on the review's runs,
which are named in its report. "N2" is the plan's step for the picture's cells for what
the reader refuses, which decide each case outside Castr; "N7" is the amendment on
references across documents.

| No. | Finding                                                                                                                                                                                                                                                                                              | Disposition                                                                                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The third draft said the 3.1 and 3.2 texts both name `https://spec.openapis.org/oas/3.1/dialect/base`. True of 3.2.0, false of 3.2.1, which names an address "of the form https://spec.openapis.org/oas/3.2/dialect/YYYY-MM-DD". The seat had read 3.2.0 where the specification names 3.2.1.        | Withdrawn. Case 3 as approved agrees with 3.2.1 and is not changed. The seat's record of a "fault in approved text" is corrected in the thread record and the plan. A 3.2 document that names the 3.1 `base` address is a cell for N2.                                                |
| 2   | The rule on a Link Object's `operationId` was not limited to one document, though the second review asked for it. The texts call resolution across documents "implementation-defined".                                                                                                               | Routed to N7. The rule cannot be stated without saying which documents count.                                                                                                                                                                                                         |
| 3   | The rules on a security requirement's name and a tag's `parent` do not say which document's Components Object or `tags`. The texts recommend the entry document and call it implementation-defined.                                                                                                  | Routed to N7, for the same reason.                                                                                                                                                                                                                                                    |
| 4   | "Any address under .../dialect/" reads addresses the publisher does not serve.                                                                                                                                                                                                                       | Withdrawn with the clause. That case 3's "at any revision" has the same reach is a row for N2.                                                                                                                                                                                        |
| 5   | Case 3 gives no address for Draft 2020-12, and is silent on a trailing `#`, the `http:` form and a value that is not a URI.                                                                                                                                                                          | Routed to N2. Unclear in 0.8.0, not false.                                                                                                                                                                                                                                            |
| 6   | The list of places where `$schema` is data was not complete: a discriminator's `mapping`, an extension's value, a property named `$schema`.                                                                                                                                                          | Withdrawn with the clause; routed to N2. It needs a definition of where a Schema Object stands.                                                                                                                                                                                       |
| 7   | A Callback Object's `x-` field that holds a Path Item with a Draft-07 `$schema` or a duplicate `operationId`: refused under one reading, read under another.                                                                                                                                         | Fixed: "For every case of SPEC-FV-1 and every rule listed here".                                                                                                                                                                                                                      |
| 8   | The texts allow `$schema` only at a schema resource root; case 3 reads it anywhere.                                                                                                                                                                                                                  | Routed to N2. Inherited from 0.8.0; it needs a definition of a resource root.                                                                                                                                                                                                         |
| 9   | No judge is named for a resource nested inside a Schema Object and stating another dialect.                                                                                                                                                                                                          | Routed to N2, with the dialect meta-schema revisions, which this draft no longer names: naming them without saying where each dialect's judgement stops was new behaviour.                                                                                                            |
| 10  | A 3.2 document whose security requirement names nothing declared is unjudged, and the reader and the check may differ on it.                                                                                                                                                                         | Routed to N7 with finding 3. Decision twelve says what holds meanwhile.                                                                                                                                                                                                               |
| 11  | Case 2: which version a rejection names when `swagger` and `openapi` are both present; a number for `openapi` is refused by `type`, not by the pattern; "a 3.0.x document" is not defined.                                                                                                           | Routed to N2, which already holds the rows for two versions stated and for a number. Case 2 already says the publisher's pattern decides, so a suffix such as `3.1.0-rc1` is read without a change of words; a cell shows it.                                                         |
| 12  | Ajv 8.20.0 cannot judge the pinned schemas as published: it refuses any document holding a Schema Object other than `{}`. Reproduced by the seat: `{"type": "string"}` under `components.schemas` gives `unevaluatedProperties`, and `true` gives `type`, for both versions.                         | Recorded in the plan under N2: the check's validator is chosen and proved there. No fact this draft rests on used a document with a Schema Object.                                                                                                                                    |
| 13  | The numbers 6 and 7 are reused, and the plan and thread record cite "rule 7" in the old meaning.                                                                                                                                                                                                     | Accepted, with the plan reworded now. See "Why" above.                                                                                                                                                                                                                                |
| 14  | Landing: a comment in `published-rows.ts` names 2022-10-07; SPEC-CC-1 needs the version, date and change-log row; the check's "one for each rule" does not cover an "Allowed" place.                                                                                                                 | Fixed: "When it lands" names the comment and the plan's steps; the introducing sentence now covers an "Allowed" place.                                                                                                                                                                |
| 15  | Other places a schema may refuse what the text allows, not demonstrated: `allowReserved` on a header parameter; `bearerFormat` on `http` basic; `scheme` on `apiKey`; `style` or `explode` beside `content`. The texts say such a field "applies" only elsewhere, and do not say it MUST NOT appear. | Not changed here. Each is a reading of the text nobody has shown either way; under 0.8.0 such a document is refused under case 4. Added to the plan's review dispositions for N2, where a cell records what the check and the reader each do, and the reading goes to the owner then. |

Two statements of fact in the third draft were wrong and are gone: that the number
`3.1` is refused "by the pattern" (the refusing keyword is `type`), and that the
dialect sentence is the same in every text.

## Open before approval

- One attack on this draft. If it finds a place where an "after" text is false, says
  two things, or refuses or reads the wrong document, the draft is withdrawn by the
  plan's path, and the two forced corrections wait for the next amendment.
