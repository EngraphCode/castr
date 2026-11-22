# Draft amendment, part one: what the reader refuses, and the versions read

Status: a draft for review. It is not approved and changes nothing in
`docs/SPECIFICATION.md`. Approval is the owner's typed words naming a version
(SPEC-CC-2). The version this part would carry is 0.8.0.

This is the first of three parts. It does not touch the classes of the
scope-and-fidelity table, the fifth class, the "read" outcome or numbers in JavaScript
targets. Those are parts two and three.

## What the owner has decided

- **20 November 2026, decision five.** What the reader refuses by design (an unread
  dialect, OpenAPI 2.0, an invalid document) is a third kind of rejection. It never
  counts toward `NOT-YET-BUILT`, and its cases are listed in the specification.
- **20 November 2026, decision six.** The versions that must be complete before OpenAPI
  to Zod and TypeScript is done are 3.1 and 3.2. 3.0 follows later.
- **22 November 2026.** Asked what Castr does with a 3.0 document until 3.0 is built, the
  owner chose "Refuse it by version": one refusal naming the version and the later
  capability that will read it, and the third-party upgrade step is removed.

## Facts the draft rests on

Each was run or read on 22 November 2026 at `main` commit `11abb58e`.

- Castr converts an OpenAPI 2.0 document today. Section 6 says a 2.0 document is refused.
  The reader passes every document through a third-party upgrade
  (`lib/src/shared/load-openapi-document/upgrade-validate.ts`), which rewrites 2.0 and
  3.0 into 3.1 before Castr's parser sees it.
- Castr's parser therefore never reads a 3.0 construct. Eight of the 14 example
  documents in `lib/examples` are 3.0.
- The definition of a located rejection says it has exactly one of two kinds.
- SPEC-PR-6 and the definition of an advertised capability measure against "any valid
  document of its source format", and section 6 lists 3.0.x as read. With 3.0 later,
  those two cannot both stand.
- SPEC-G-7 already says the oracle for a format is that format's specification at its
  named version, exercised by a conforming validator.

## The rule every sentence was tested against

Every earlier draft had one loophole: a rule quantified over a hand list, so a missing
entry weakened the rule without anyone seeing. Here the third kind is defined by a
property that something outside Castr's parser decides (the version the document states,
the dialect a schema states, a validator's verdict, a row of Appendix A). A refusal that
has none of those properties is `NOT-YET-BUILT`, and so is counted. A missing entry in a
list can only raise the count of unbuilt work; it can never hide any.

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
> meaning; permanent), `NOT-YET-BUILT` (Castr has not built it; a defect that names its
> capability) or `NOT-READ` (the reader refuses the document by this document's design;
> SPEC-FV-1 says exactly when). It travels as a `Result` on library surfaces.

### 2. Section 6, the table and the paragraph under it

Before, the OpenAPI row: Read `3.0.x, 3.1.x, 3.2.x`, Written `3.2.1`.

After, the OpenAPI row: Read `3.1.x, 3.2.x`, Written `3.2.1`.

Before, the paragraph:

> OpenAPI 2.0 is not read: a 2.0 document receives a located rejection naming its
> version. A JSON Schema dialect change is always explicit; Castr never infers, upgrades
> or downgrades a dialect. A change to this table is a change to this document.

After:

> OpenAPI 2.0 and 3.0.x are not read (SPEC-FV-1). Reading 3.0.x is a later capability,
> SPEC-C-3. A reader reads the document it is given: Castr never infers a version or a
> dialect, and never has a document rewritten from one version or dialect into another
> before it is read. A JSON Schema dialect change is always explicit. A change to this
> table is a change to this document.

### 3. Section 6, two new clauses

> - **SPEC-FV-1 What the reader refuses.** A reader gives a `NOT-READ` rejection in the
>   four cases below and in no other.
>   1. _Version._ The document states a version of its format that the Read column does
>      not list, or states none. The rejection names the version stated. It is the only
>      thing the reader does with the document: nothing in it is read first.
>   2. _Dialect._ A schema states, by its own `$schema` or by its document's
>      `jsonSchemaDialect`, a JSON Schema dialect that is not Draft 2020-12, not Draft-07
>      and not the OpenAPI dialect of the document's own version. The rejection names the
>      dialect and where it is stated.
>   3. _Validity._ The document is not valid in the version and dialects it states, or a
>      reference in it resolves to nothing. Validity is decided before Castr's parser
>      runs, by the schema that the format's publisher gives for that version, exercised
>      by a validator that shares no code with Castr's parser (SPEC-G-7). The rejection
>      carries every failure that validator reports, each with its location. A rule the
>      format's specification states in words and its schema does not hold is checked by
>      Castr only where SPEC-FV-2 lists it.
>   4. _A Zod source outside the profile._ A Zod module holds a construct that
>      Appendix A marks rejected and gives no kind for, a value outside the value domain
>      (SPEC-P-5), or a call that fails as SPEC-AR-6 describes. The rejection names the
>      construct and where it is.
>
>   A document that is valid, at a listed version, with every schema in one of the
>   dialects named in case 2, never receives `NOT-READ`. Whatever Castr cannot do with
>   such a document is `NOT-YET-BUILT` or `UNEXPRESSIBLE`. A document that receives
>   `NOT-READ` produces no output for any target. A `NOT-READ` rejection is not unbuilt
>   work and SPEC-PR-6 does not count it.
>
>   The required check of SPEC-PR-6 runs at least one document for each of the four
>   cases, and for case 1 one document for each of OpenAPI 2.0 and OpenAPI 3.0.x. Each
>   must end in `NOT-READ` with the content its case names. The same check gives the
>   reader a valid document at each listed version and fails if any receives `NOT-READ`.
>
> - **SPEC-FV-2 Validity rules a schema does not hold.** A rule listed here is one the
>   format's specification states in words, at the section named beside it, and the
>   publisher's schema does not hold. Castr checks it and a document that breaks it
>   receives `NOT-READ` under case 3. A refusal for a reason that is neither a failure of
>   the publisher's schema nor a rule listed here is `NOT-YET-BUILT`. A rule is listed
>   only by amendment. Listed: none.

### 4. Section 3, "Advertised capability"

Before:

> A directed format pair or generator whose corpus passes §8 with no `NOT-YET-BUILT`
> rejection reachable from any valid document of its source format. The README's
> capability table is generated from that fact.

After:

> A directed format pair or generator whose corpus passes §8 with no `NOT-YET-BUILT`
> rejection reachable from any valid document of its source format at a version and in
> the dialects §6 lists as read. The README's capability table is generated from that
> fact.

### 5. SPEC-PR-6

Before, its first sentence:

> A capability is advertised, accepted or called done only when no `NOT-YET-BUILT`
> rejection is reachable from any valid document of its source format.

After:

> A capability is advertised, accepted or called done only when no `NOT-YET-BUILT`
> rejection is reachable from any valid document of its source format at a version and
> in the dialects §6 lists as read.

Nothing else in the clause changes. Its last sentence stands: capability granularity is
the directed pair, and every version in the Read column is inside the pair.

### 6. SPEC-P-2, last sentence

Before:

> Everything outside the subset receives a located rejection.

After:

> Everything outside the subset receives a `NOT-READ` rejection (SPEC-FV-1), except where
> Appendix A names another kind.

### 7. Appendix A, one sentence under the table

> A row whose Profile column reads "rejected" and names no kind is `NOT-READ`
> (SPEC-FV-1, case 4). A row that names `NOT-YET-BUILT` is unbuilt work and is counted.

### 8. Section 7, under "Later"

> ### SPEC-C-3 OpenAPI 3.0.x as a source (later)
>
> Castr's own reader reads an OpenAPI 3.0.x document, with a table row for each
> construct that only 3.0 has. Until this capability is advertised a 3.0.x document is
> refused by version (SPEC-FV-1). Its corpus and its acceptance are written here by
> change control before work on it starts. The owner, 20 November 2026: 3.1 and 3.2 come
> first; 22 November 2026: "Refuse it by version".

### 9. Front matter and change log

Version 0.8.0, with a change-log row that names changes 1 to 8 and the three owner
decisions above.

## Every rejection the specification names, and its kind

Only reader-side clauses change in this part. The writer-side ones are listed so that
none is left unread; their words already say the target cannot express the thing.

| Clause                                                 | What is refused                                                  | Kind                  | Changed here |
| ------------------------------------------------------ | ---------------------------------------------------------------- | --------------------- | ------------ |
| Section 6                                              | OpenAPI 2.0, OpenAPI 3.0.x                                       | `NOT-READ`, case 1    | yes          |
| SPEC-P-2, Appendix A rows marked rejected with no kind | A Zod construct outside the declarative subset                   | `NOT-READ`, case 4    | yes          |
| SPEC-P-5                                               | A host-language object with no serialised form, in a Zod source  | `NOT-READ`, case 4    | by SPEC-FV-1 |
| SPEC-AR-6                                              | A call that throws or returns no schema; a function-form default | `NOT-READ`, case 4    | by SPEC-FV-1 |
| Appendix A, `.prefault` and `.brand`                   | Named `NOT-YET-BUILT` already                                    | `NOT-YET-BUILT`       | no           |
| SPEC-PR-3                                              | Two names that collide in the target's identifiers               | `UNEXPRESSIBLE`       | no           |
| SPEC-P-1                                               | A dialect that cannot close an object across composition         | `UNEXPRESSIBLE`       | no           |
| SPEC-P-4                                               | A construct the written version cannot express                   | `UNEXPRESSIBLE`       | no           |
| SPEC-C-2                                               | Named `UNEXPRESSIBLE` already                                    | `UNEXPRESSIBLE`       | no           |
| SPEC-AR-5                                              | A construct a writer cannot express in its class                 | as its table row says | no           |

## What this does to Castr and to the picture

- The code that upgrades 2.0 and 3.0 documents is removed when Castr is fixed. Until
  then the picture shows it: the eight 3.0 examples convert today and would read as
  wrong against this text, since each should be refused by version.
- Today's reader refuses some documents for reasons the publisher's schema does not hold
  (a path template whose parameters do not match, for one). With SPEC-FV-2 listing none,
  each such refusal counts as `NOT-YET-BUILT` until an amendment lists its rule with the
  section of the format's specification that states it. That is deliberate: the list can
  only be too short in the direction that shows.
- Oak's document is 3.1 and is not touched by this part.

## Points the draft does not settle

1. **Draft-07 inside an OpenAPI document.** Section 6 lists Draft-07 as read, and full
   Draft-07 support is SPEC-C-2, the second capability. As drafted, a valid 3.1 document
   holding a Draft-07 schema is inside SPEC-C-1's measure, so SPEC-C-1 cannot be
   advertised until Draft-07 schemas inside OpenAPI are built. The other reading treats
   it as 3.0 is treated: refused by dialect until SPEC-C-2. The owner has not decided
   this.
2. **Which validator.** SPEC-FV-1 names the publisher's schema and requires independence
   from Castr's parser. It names no library, as SPEC-G-4 names none.
3. **A document that states no version.** The draft refuses it under case 1. A document
   with no `openapi` field is also invalid under case 3; case 1 is tried first.
