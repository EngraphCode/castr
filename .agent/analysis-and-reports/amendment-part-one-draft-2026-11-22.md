# Draft amendment, part one: what the reader refuses, and the versions read

Status: second draft, after one adversarial review broke the first. It is not approved
and changes nothing in `docs/SPECIFICATION.md`. Approval is the owner's typed words
naming a version (SPEC-CC-2). The version this part would carry is 0.8.0. The owner has decided the two points that were theirs. Two wait on text not yet read, and the draft is not ready for approval until they are closed.

This is the first of three parts. It does not touch the classes of the
scope-and-fidelity table, the fifth class, the "read" outcome or numbers in JavaScript
targets. Those are parts two and three.

## What the owner has decided

- **20 November 2026, decision five.** What the reader refuses by design (an unread
  dialect, OpenAPI 2.0, an invalid document) is a third kind of rejection. It never
  counts toward `NOT-YET-BUILT`, and its cases are listed in the specification.
- **20 November 2026, decision six.** The versions that must be complete before OpenAPI
  to Zod and TypeScript is done are 3.1 and 3.2. 3.0 follows later.
- **22 November 2026, decision ten.** Asked what Castr does with a 3.0 document until
  3.0 is built, the owner chose "Refuse it by version": one refusal naming the version
  and the later capability that will read it, and the third-party upgrade step is
  removed.

- **22 November 2026, decision eleven.** A Draft-07 schema inside an OpenAPI document,
  for the first capability: "Refuse until the second capability". Case 3 as drafted
  says this.
- **22 November 2026, decision twelve.** A document that passes the published schema
  and breaks a rule the OpenAPI text states only in words: "Refuse it as invalid".
  SPEC-FV-2 as drafted says this; its list is still to be written from the published
  text.

## Facts the draft rests on

Each was run or read on 22 November 2026 at `main` commit `11abb58e`.

- Castr converts an OpenAPI 2.0 document today. Section 6 says a 2.0 document is refused.
  The reader passes every document through a third-party upgrade
  (`lib/src/shared/load-openapi-document/upgrade-validate.ts`), which rewrites 2.0 and
  3.0 into 3.1 before Castr's parser sees it, and then stamps every document, Oak's
  included, as 3.2.0.
- Castr's parser therefore never reads a 3.0 construct. Eight of the 14 example
  documents in `lib/examples` are 3.0.
- The schema the OpenAPI Initiative publishes for a 3.1 document
  (`https://spec.openapis.org/oas/3.1/schema/2022-10-07`, pinned in
  `lib/tests-picture/__fixtures__/definitions`) describes itself as "without schema
  validation": it accepts any object or boolean as a Schema Object. The 3.2 one
  (`.../oas/3.2/schema/2025-09-17`) says the same. So a document's validity needs two
  things checked: the document against that schema, and each Schema Object against the
  meta-schema of its dialect.
- Those schemas give the version as a pattern (`^3\.1\.\d+(-.+)?$` and the same for
  3.2) and the default dialect as a URI
  (`https://spec.openapis.org/oas/3.1/dialect/base` and
  `https://spec.openapis.org/oas/3.2/dialect/2025-09-17`).
- Today's reader also refuses a document for two rules its own code checks and the
  publisher's schema does not: the syntax of a path template, and the method names under
  `additionalOperations`.
- SPEC-PR-6 and the definition of an advertised capability measure against "any valid
  document of its source format", and section 6 lists 3.0.x as read. With 3.0 later,
  those two cannot both stand.

## The rule every sentence was tested against

Every earlier draft had one loophole: a rule quantified over a hand list, so a missing
entry weakened the rule without anyone seeing. The first draft of this part repeated it
in three places, where Castr's own code decided the property: whether a reference
resolves, whether a Zod value is in the value domain, and which address counts as a
dialect.

In this draft a `NOT-READ` is given only where something outside Castr's reader decides
it, and the required check works that decision out again for every document it runs,
without the reader. A refusal the check cannot account for is `NOT-YET-BUILT`, and is
counted. A missing entry in a list can then only raise the count of unbuilt work.

## Scope of this part

SPEC-FV-1 is about the reader of an OpenAPI document, which is the only reader the first
capability has. The refusals of a reader of a standalone JSON Schema document and of a
Zod module keep their present words ("a located rejection") and get their kinds by
amendment before the capability that needs them. The first draft assigned them and the
review showed that Appendix A does not give every Zod row one kind: the function form of
`.default` and of `.prefault`, and `.optional` outside an object key, have none.

## The changes, before and after

### 1. Section 3, "Located rejection"

Before:

> A refusal that names the construct, where it is in the source, the format pair, and
> why. It has exactly one kind: `UNEXPRESSIBLE` (the target format has no way to say the
> meaning; permanent) or `NOT-YET-BUILT` (Castr has not built it; a defect that names its
> capability). It travels as a `Result` on library surfaces.

After:

> A refusal that names the construct, where it is in the source, the format pair, and
> why. It has exactly one kind: `UNEXPRESSIBLE` (the target format has no way to say the
> meaning; permanent), `NOT-YET-BUILT` (Castr has not built something this document
> requires of a document it reads; a defect that names its capability) or `NOT-READ`
> (the reader refuses the whole document by this document's design; SPEC-FV-1 says
> exactly when, and the rejection names the reader in place of a pair). It travels as a
> `Result` on library surfaces.

### 2. Section 6, the table and the paragraph under it

Before, the OpenAPI row: Read `3.0.x, 3.1.x, 3.2.x`, Written `3.2.1`.

After, the OpenAPI row: Read `3.1.x, 3.2.x`, Written `3.2.1`.

Before, the paragraph:

> OpenAPI 2.0 is not read: a 2.0 document receives a located rejection naming its
> version. A JSON Schema dialect change is always explicit; Castr never infers, upgrades
> or downgrades a dialect. A change to this table is a change to this document.

After:

> OpenAPI 2.0 and 3.0.x are not read (SPEC-FV-1). A 3.0.x document is read when
> SPEC-C-3 adds it to this table. A reader reads the document it is given: nothing
> rewrites a document from one version or dialect into another before Castr's parser
> reads it. A JSON Schema dialect change is always explicit; Castr never infers,
> upgrades or downgrades a dialect. A change to this table is a change to this document.

### 3. Section 6, two new clauses

> - **SPEC-FV-1 What the reader of an OpenAPI document refuses.** The reader gives one
>   `NOT-READ` rejection, and reads nothing further, in the first of these cases that
>   holds, and in no other.
>   1. _Not well formed._ The input is text that is not well-formed JSON or YAML 1.2.
>      The rejection names the place the text stops being well formed.
>   2. _Version._ The document has a `swagger` field, or its `openapi` field is absent
>      or does not match the pattern the publisher's schema gives for a version line in
>      the Read column. The rejection names the version stated, or that none is, and
>      SPEC-C-3 where that capability will read it.
>   3. _Dialect._ The document's `jsonSchemaDialect`, or the `$schema` of a schema in
>      it, names a dialect other than the OpenAPI dialect its publisher gives for the
>      document's version line, at any revision, and JSON Schema Draft 2020-12. The
>      rejection names the dialect and where it is stated.
>   4. _Validity._ The document fails the schema its publisher gives for its version
>      line, at the revision this section names, or a Schema Object in it fails the
>      meta-schema of the dialect it is in, with `format` treated as that meta-schema's
>      vocabularies declare. The rejection carries every failure, each with its
>      location. A document that breaks a rule listed in SPEC-FV-2 is refused under this
>      case too.
>
>   The revisions are `https://spec.openapis.org/oas/3.1/schema/2022-10-07` and
>   `https://spec.openapis.org/oas/3.2/schema/2025-09-17`; a change of revision is a
>   change to this document.
>
>   A document that none of the four cases describes never receives `NOT-READ`.
>   Whatever Castr cannot do with it is `NOT-YET-BUILT` or `UNEXPRESSIBLE`. A reader's
>   refusal for a reason that is none of the four cases is `NOT-YET-BUILT`. A document
>   that receives `NOT-READ` produces no output for any target. A `NOT-READ` rejection
>   is not unbuilt work and SPEC-PR-6 does not count it.
>
>   The required check of SPEC-PR-6 decides the four cases itself for every document it
>   runs, with a loader and a validator that are not Castr's reader, and fails when the
>   reader gives `NOT-READ` where no case holds, gives none where one holds, or gives it
>   for a different case. The documents it runs include at least one for each case, one
>   OpenAPI 2.0 document, one 3.0.x document, and one valid document for each version
>   line in the Read column.
>
> - **SPEC-FV-2 Validity rules a schema does not hold.** A rule listed here is one the
>   OpenAPI specification states in words, at the section named beside it, and the
>   publisher's schema does not hold. A document that breaks it receives `NOT-READ`
>   under case 4, and the required check decides each listed rule itself as it decides
>   the cases. A rule is listed only by amendment. Listed: (to be written; see the
>   points that wait).

### 4. Section 3, "Advertised capability"

Before:

> A directed format pair or generator whose corpus passes §8 with no `NOT-YET-BUILT`
> rejection reachable from any valid document of its source format. The README's
> capability table is generated from that fact.

After:

> A directed format pair or generator whose corpus passes §8 with no `NOT-YET-BUILT`
> rejection reachable from any document of its source format that its reader does not
> refuse as `NOT-READ`. The README's capability table is generated from that fact.

### 5. SPEC-PR-6

Before, its first sentence:

> A capability is advertised, accepted or called done only when no `NOT-YET-BUILT`
> rejection is reachable from any valid document of its source format.

After:

> A capability is advertised, accepted or called done only when no `NOT-YET-BUILT`
> rejection is reachable from any document of its source format that its reader does not
> refuse as `NOT-READ`.

Before, a later sentence:

> That computed count is the whole record of unbuilt work: a known gap lives in a tested
> rejection, in code.

After:

> That computed count is the whole record of unbuilt work on the documents a reader does
> not refuse: a known gap lives in a tested rejection, in code. What a later capability
> will read is named in §7 and is not in the count.

### 6. Section 7, under "Later"

> ### SPEC-C-3 OpenAPI 3.0.x as a source (later)
>
> Castr's own reader reads an OpenAPI 3.0.x document. Its corpus, its tables and its
> acceptance are written here by change control before work on it starts, and the same
> amendment adds 3.0.x to the Read column of §6. The owner, 20 November 2026: 3.1 and
> 3.2 come first; 22 November 2026: "Refuse it by version".

### 7. Front matter and change log

Version 0.8.0, with a change-log row that names changes 1 to 6 and the owner decisions
above.

## Clauses the review said this part contradicts, and what was done

| Clause                                         | The review's point                                                           | Disposition                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| SPEC-PR-6, "the whole record of unbuilt work"  | False once 3.0 is unbuilt and uncounted                                      | Taken: change 5                                                                                                                      |
| SPEC-PR-6, "granularity is the directed pair"  | SPEC-C-3 is finer than a pair                                                | Taken: SPEC-C-3 adds a version to the pair's Read column and is not a pair of its own                                                |
| Section 3, the kept words of `NOT-YET-BUILT`   | A 3.0 refusal that names a later capability also fits them                   | Taken: change 1 limits `NOT-YET-BUILT` to a document Castr reads                                                                     |
| Section 3, "names the format pair"             | A `NOT-READ` has no pair                                                     | Taken: change 1                                                                                                                      |
| SPEC-C-2, "carried or `UNEXPRESSIBLE`"         | Leaves no room for a JSON Schema reader's `NOT-READ`                         | Not changed here: this part gives no `NOT-READ` to a JSON Schema reader. It is owed to the amendment that does                       |
| SPEC-G-7, the oracle is the format's own text  | Case 4 uses the publisher's schema and changes what "valid" means in passing | Taken: changes 4 and 5 no longer use the word "valid"; the measure is "not refused", and SPEC-FV-1 says what refuses                 |
| SPEC-AR-2, the model is designed for all of §6 | Removing 3.0.x takes its constructs out of that design                       | Not changed: that is the meaning of the owner's decisions six and ten. SPEC-C-3 brings them back, and the owner should know it costs |
| SPEC-P-2, SPEC-P-5, SPEC-AR-6 and Appendix A   | A Zod reader's refusals have no kind                                         | Not changed here: see "Scope of this part"                                                                                           |

## What this does to Castr and to the picture

- The code that upgrades 2.0 and 3.0 documents and stamps every document as 3.2.0 is
  removed when Castr is fixed. Until then the picture shows it: the eight 3.0 examples
  convert today and would read as wrong against this text.
- No check in the repository computes a count of `NOT-YET-BUILT` today; the words
  appear nowhere under `lib/src`. So the first count is taken after this text, and it
  starts with SPEC-FV-2 populated.
- Oak's document is 3.1 in the OpenAPI dialect and is read. Its refusal today, at a
  schema-valued `additionalProperties`, is `NOT-YET-BUILT` under this text.

## Points that wait

1. **Decided on 22 November (decision eleven).** A Draft-07 schema inside an OpenAPI
   document is refused by dialect until the second capability. Case 3 needs a few more
   words to name SPEC-C-2 as the capability that will read it.
2. **Decided on 22 November (decision twelve).** A rule stated only in words is listed
   in SPEC-FV-2 and a document that breaks it is refused as invalid.
3. **To read before the list is written.** If rules are listed, each needs the section
   of the OpenAPI text that states it, read from the published text and not from
   memory: a reference whose target is absent, a path template and its parameters, a
   unique `operationId`, and the two rules today's code checks.
4. **To check before asking for approval.** That the dated revisions of the OpenAPI
   dialect for 3.1 are what "at any revision" in case 3 needs to cover; and one more
   adversarial review of this draft.

## What the first review found, in short

Six findings broke the first draft and seven needed words; all were checked against the
files and taken, except where the table above says otherwise. The largest: the closing
guarantee contradicted two of its own cases; "a reference resolves to nothing" was
decided by Castr's own resolver; "states no version" refused every Zod module and every
JSON Schema with no `$schema`; "the dialects §6 lists" left Oak's own document outside
the measure; the publisher's schema does not validate schemas; and the required check
could pass with one trivial document per case.
