---
title: The model's design (SPEC-N-1)
status: active
lane: active
created: 2026-11-24
last_updated: 2026-11-24
destination: docs/SPECIFICATION.md
parent: castr-course.md
owner_directive: >-
  Owner, 2026-11-24: "Please plan SPEC-N-1 using the OCE cognitive skills, once the
  plan is reviewed and you approve it, begin the implementation". The seat's reading:
  the owner delegated approval of this plan, and of this plan only, to the seat. An
  amendment to the specification is approved only by the owner, in their own words,
  naming the version (SPEC-CC-2).
todos:
  - id: M0-PLAN
    content: 'This plan is reviewed by the assumptions reviewer, with the conscience panel read as evidence in both stances; every finding has a row under "Review dispositions"; the seat approves it; it is on main with the one statement of order amended to match it; and the owner has been told in plain words what is frozen, what is stopped and what goes on beside it.'
    status: completed
    depends_on: []
  - id: M1-SURFACE
    content: 'The construct kinds of the formats in section 6 that the picture does not already list are listed beside its rows: JSON Schema Draft-07 computed from its meta-schema, Zod 4 computed from the installed package at a pinned version and set against Appendix A, and, for each format, the kinds no machine-readable file holds, listed by hand and marked so. A test recomputes each computed list.'
    status: in_progress
    depends_on: [M0-PLAN]
  - id: M2-CASES
    content: 'The hard cases and the equivalence sets are written as small valid documents, each with the sentence of the specification it tests and what a naive structure loses, attacked before the note lands by a reader who knows each format read: OpenAPI, JSON Schema and Zod.'
    status: pending
    depends_on: [M0-PLAN]
  - id: M3-SURVEY
    content: 'One bounded survey of how other compilers of data definitions hold shapes, references and evaluation that is not local, saved as a research note that says for each what it would cost Castr and what it loses. Budget: one pass of overlapping readers, synthesised by the seat.'
    status: pending
    depends_on: [M0-PLAN]
  - id: M4-DESIGN
    content: 'The structure is chosen, by the lenses, from the definitions of section 3 and the cases, never from the present model. It is held as a prototype of types on a branch nothing in src reads, on which acceptance proofs 1 to 6 pass. The owner is told the core of it in a few lines when it is chosen.'
    status: pending
    depends_on: [M1-SURFACE, M2-CASES, M3-SURVEY]
  - id: M5-AMEND
    content: 'The amendment that records the structure in the specification and retires SPEC-N-1 is drafted with the prototype and its proofs in the same pull request, attacked before its first push, put through two rounds of hosted review, and brought to the owner by one blocking question that asks for their words naming the version. Approved and merged, or withdrawn with the reason and the state of the freeze told to the owner.'
    status: pending
    depends_on: [M4-DESIGN]
  - id: M6-HANDOFF
    content: "The course holds, by name, the legs that build the structure and a leg for whatever of the writers' text assembly is left; the one statement of order says what follows; this plan moves to completion staging."
    status: pending
    depends_on: [M5-AMEND]
---

> **The frame. Read it first.** Castr was built incorrectly and this work is the
> remediation, so a pre-existing approach is always questioned and never a reason.
> Correcting the model is the work. The model and the writers use no string
> manipulation; where that is impossible it is flagged to the owner. Many formats in,
> many out. The authority is "The frame of this work" in
> [AGENT.md](../../directives/AGENT.md).

# The model's design (SPEC-N-1)

A companion to [the course](castr-course.md). It carries one of the two inputs the
course's PLOT todo names: the model's design.

## What the seat may and may not do

- The seat approves this plan, by the owner's delegation quoted above. Approved by
  Firefly binds Tallow on 24 November 2026, after the reviews recorded at its foot.
- Only the owner approves the amendment, in their own words naming the version.
- Nothing changes what the model holds before that approval, in any directory. Section
  12 of the specification: while an item is open, "no code assumes an answer to it".
- The owner's "begin the implementation" is therefore read as: carry this plan out, to
  the approval request. The other reading, that it reaches the model's code, breaks the
  card of 18 November, section 12 and SPEC-CC-2. The two readings part only at M5, where
  the owner is asked in any case.

## Goal

The specification says what the model is: its concrete structure, designed once against
every format in section 6, approved by the owner. SPEC-N-1 is then answered, and a
change to the model is a step toward a stated structure and no longer an answer assumed
by whoever makes it.

## Who this is for, and what each gets

- **The owner.** A valid construct of a format in section 6 has a place to go that was
  designed for it. The owner, 20 November 2026: "What I want is to not have to rework
  Castr if Oak adds an additional, valid field type to their spec".
- **The Ecosystem repository's workspaces that will consume Castr.** SPEC-C-1 becomes
  reachable: its outputs are written from a model that holds what the document says.
- **A session working on Castr.** "Is this right?" is answered against a stated
  structure. Today the only answer is the code as it stands, which the frame says is
  evidence and never a reason.
- **A reviewer.** A finding about the model is checked against text, once, and a fault
  in the structure is found in a prototype before the 26,500 lines the course measured
  are written against it again.

The claim is bounded: this plan delivers a design and its approval. It makes no cell of
`pnpm picture` right. The step log says so at each boundary.

## Why now, and what was wrong before

The card the owner chose on 18 November 2026 says, in the card's words, that the model
"is redesigned by an approved amendment (SPEC-N-1) before it changes". The plan that ordered the work said the design
"has no step here". Pull requests 191 and 193 then changed the model, and more changes
were queued, each assuming an answer to the open item. On 24 November: the model is the
keyword set of OpenAPI and JSON Schema with Zod output text on its nodes (the course,
"Known on 21 September 2026"); a reference an operation is given a thing by is held as
OpenAPI text (`ref`, `pathItemRef`); a document's `$defs` is not held, and the order plan
records that a path with no operation is not.

## Mechanism

A structure is believed when four things hold, and each is checked by something other
than the seat's reading of its own prose.

1. **It is complete against a listed surface.** The keywords and fields of each format
   are computed from the publisher's artefacts, as the picture already does for OpenAPI
   and JSON Schema 2020-12. What no machine-readable file holds is listed by hand, from a
   reading of each text section by section, and marked so: `format` values, boolean schemas, extensions, and a construct made of
   several keywords standing together (Appendix B.1). A coverage map gives every kind
   one element of the structure, or a refusal that cites the clause putting it outside.
2. **One meaning is one value.** A meaning two formats write differently is one value
   in the structure. This is what tells a structure from a list of every format's
   keywords under neutral names.
3. **It holds the cases that break a naive structure,** and for the two things SPEC-N-1
   names, a writer can write from the value without knowing which format it came from.
4. **It has been attacked by readers who know each format,** before the owner is asked.

The structure is derived from the specification's own definitions (section 3: shape,
the three parts of meaning, the accepted and produced sets, value, boundary, document
content) and from the formats' texts. The present model is read only as evidence of
where meaning is lost.

The method for the design step is the Ecosystem repository's
[`specify`](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/main/.agent/skills/specification/specify/SKILL-CANONICAL.md)
skill (one
successful case and the adverse cases before any general statement; obligations with
their conditions; every unknown given a treatment), and
[`assess-specification`](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/main/.agent/skills/specification/assess-specification/SKILL-CANONICAL.md)
judges
the draft for the one reliance asked of it: implementation. Both are used as written, with no local
form.

## The boundary of the design

The surface is section 6's table at specification 0.11.1: OpenAPI 3.1.x and 3.2.x read
and 3.2.1 written; JSON Schema Draft 2020-12 and Draft-07, both ways; Zod 4 read in its
declarative subset (Appendix A) and written; TypeScript types written.

- **TypeScript has no list of its own.** It is not read, so nothing enters the model
  from it. What it must be able to say is what the tables require of it.
- **The Zod row moves.** Appendix A was verified at 4.5.4 and 4.6.7 is installed; section
  6 reads a range and writes the latest release. M1 pins the version its list is computed
  at, and the amendment says what a release that adds a construct does: the list's check
  fails, and the construct gets an element or a cited refusal by amendment.

Out, by name: OpenAPI 3.0.x (SPEC-C-3) and 2.0; the "Later" capabilities of section 7;
the MCP projection and the Markdown writer, which section 11 says are deleted in the
landing that replaces the model.

Open items the design touches and does not answer. Where the structure meets one, the
amendment says so and assumes nothing:

- **SPEC-N-2**, the workspace and package seams.
- **SPEC-N-3**, the technique by which Zod is read. The structure holds what Zod can
  mean; it says nothing of how a reader finds it.
- **SPEC-N-4**, the public surface. Whether a stored model is a public input, how it is
  versioned and serialised, and whether the structure's types are exported, are N-4's.
  The design states the model's own invariants only.
- **SPEC-N-5**, the remaining rows of the tables. The design records which formats can
  state an element. What each target can write of it is a row's class, and stays there.

## The cases the design must hold

The first list. M2 writes each as a document; M3 and the reviews add to it.

- **Names, identity and references.** A reference to each kind of thing that can be
  named, held as the thing referred to and not as one format's way of writing it; a path
  item given by reference; a reference with keywords beside it, and Draft-07's rule that
  they are ignored; a cycle; a JSON Schema resource with `$id`, `$anchor` and embedded
  resources; `$defs` and Draft-07's `definitions`; a reference into another document; a
  reference by name (a link's `operationId`, a discriminator's `mapping`, a security
  requirement's name: the kinds the references amendment, N7, has open); a name a
  target's identifier grammar cannot carry (SPEC-PR-3).
- **Evaluation that is not local to one node.** `unevaluatedProperties` and
  `unevaluatedItems` across `allOf`, `anyOf`, `oneOf`, `if` and a reference;
  `$dynamicRef` with `$dynamicAnchor`; `dependentSchemas`; the closed reading of
  SPEC-P-1 across composition.
- **The four unknown-key policies,** each with whether the source stated it or Castr
  supplied it (SPEC-P-1's report).
- **The two sides.** A Zod `.default`, which inserts; a JSON Schema `default`, which is
  an annotation (SPEC-P-6); a stripped object.
- **Values held exactly.** A bound beyond a JavaScript number; `int64`; a decimal
  `multipleOf`; a boolean schema; `const` and `enum` beside a keyword that also decides;
  a shape no value satisfies (SPEC-PR-7).
- **Boundaries.** A path with no operation; parameters stated on a path item and on its
  operation (Appendix B.4's row for them); the four parameter locations and
  `querystring`; a parameter with `content`; a status given as a code, a range and
  `default`; a response with no body; a header OpenAPI says is ignored;
  `additionalOperations` and `query`; webhooks and callbacks.
- **Document content.** `info`, servers, security schemes and requirements, tags, links,
  external documentation, and a specification extension at each place one may stand.
- **What a report needs.** The place in the source of every construct (SPEC-PR-8).
- **What Zod alone can say.** `z.templateLiteral`, `.exactOptional`, `.readonly`, a
  getter in an object shape, `.catchall`.
- **Equivalence sets: one meaning, written two or three ways.** Closed, as
  `z.strictObject`, as `additionalProperties: false`, and as `unevaluatedProperties:
false` over an `allOf`; a tuple, as Draft-07's array-form `items` and as `prefixItems`;
  Draft-07's `dependencies` and 2020-12's `dependentSchemas` with `dependentRequired`;
  nullable, as a `type` array, as `anyOf` with `null`, and as `.nullable()`.

## Acceptance, each with its proof

All `repo-safe` but the last. A structure that is every format's keywords under neutral
names must fail at least one of 2, 3 and 6.

1. **Whole (SPEC-AR-2).** Every listed construct kind has one element of the structure,
   or a refusal that cites the clause putting it outside the model (SPEC-P-2 with
   Appendix A, SPEC-P-5, SPEC-FV-1, section 11). Proof: a check that recomputes the
   computed lists, reads the hand lists, and fails on a kind with no entry, an entry
   that names no element, or a refusal with no clause.
2. **One meaning, one value.** Each equivalence set is one typed value. Proof: a
   type-level test that the members of a set are the same value, with a set that fails
   shown once.
3. **Format-agnostic (SPEC-AR-1).** For each element the amendment lists the formats
   that can state it. No element is named in one format's vocabulary. Proof: the list; a
   reader for each format has attacked it; an element only one format can state says in
   a sentence what meaning it is, or is redesigned.
4. **Closed (SPEC-AR-5).** The kinds of element are closed sets, so a writer that
   misses one fails to compile. Proof: an exhaustive function over each set in the
   prototype, with one removed branch shown to be a compile error.
5. **No text where a grammar is defined (SPEC-AR-3).** The check lists every string leaf
   of the prototype with its reason, and fails on one unlisted. A leaf whose grammar a
   specification defines is data, or is an exception the amendment itself enters in the
   specification for the owner to approve with it; a flag alone passes nothing, since
   SPEC-AR-3 says an exception "exists only as an owner-approved entry in this
   document". Such a leaf is put to the owner by name when it is found, in M4, as the
   frame requires. The grammars: the six SPEC-AR-3 gives, and the others the formats hold, such as
   `pattern`, a runtime expression, a server URL template, a header name, `$anchor` and
   the parts of a Zod template literal.
6. **The cases, and the two things SPEC-N-1 names.** Every hard case is a typed value
   that compiles under `strict`. For reference identity and for evaluation that is not
   local, a function over the prototype states what a writer reads from the value,
   taking no fact about the source format. Each row of Appendix B.2 to B.4 names the
   elements it is written from. Proof: the prototype's type-level tests, checked to have
   teeth by a wrong value that fails.
7. **Recorded and approved (SPEC-CC-1 to SPEC-CC-3).** The specification holds the
   structure above its change log, so it is under the approval's digest; SPEC-N-1 is
   retired in the change log (an identifier is never reused); the approval check passes.
   Proof: the check in the aggregate gate, and, `owner-held`, the owner's words naming
   the version, recorded verbatim.

## The queue, each item disposed

Two tests for every item the one statement of order holds. Does it change what the model
holds? Does it assume an answer to SPEC-N-2 to SPEC-N-5, or meet a silence in the
specification (SPEC-I-1)?

The freeze rests on the owner's card of 18 November, not on this plan. If the amendment
is withdrawn the frozen items stay frozen, and the seat tells the owner, by a blocking
question, why it was withdrawn and what would end the freeze.

| Item                                                                                                                                                                                                                                               | Changes the model      | Open item or silence                                                          | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pull requests 191 and 193: the marks `pathItemRef` and `ref`                                                                                                                                                                                       | Yes, and merged        | SPEC-N-1                                                                      | They stand. The owner had them merged on 24 November; taking them out would be a change to the model before an approved amendment, and would bring back the inlining 193 cured (SPEC-PR-3). The marks hold a reference as text, a standing fault under SPEC-AR-3. Nothing extends them                                                                                                                                                                  |
| The model keeps a path with no operation, the reference a path item is given by, and `$defs`; the ignored header definitions leave it                                                                                                              | Yes                    | SPEC-N-1                                                                      | Frozen until the amendment is approved. Each is a case in M2                                                                                                                                                                                                                                                                                                                                                                                            |
| The refusals for what Appendix B.4 leaves in no row, and the `paths` module in `src`                                                                                                                                                               | They need it to        | SPEC-N-1; how the module is requested is SPEC-N-4                             | Frozen. They are refusals of the `paths` output alone (Appendix B.1: a rejection in one column rejects that output), so the writer of that output makes them. That writer is not built, and some of what it must refuse the model does not hold. No refusal of the reader's and no other writer is held by this row                                                                                                                                     |
| The writers assemble target syntax as text (about 142 writes in 15 files), the text gained after the card among it: `const` and `enum` literals in the TypeScript writer (pull requests 177, 178) and `default` in the Zod writer's `.meta(` (187) | No, with one exception | None, with the same exception: SPEC-N-1                                       | Not frozen. Section 12 says section 9 binds the present code today, and a syntax-tree node built from a value outlives the model. Worked one unit at a time, the text gained after the card first. The exception: where the Zod writer writes text the model holds (`metadata.zodChain`), it cannot change before the model does. M6 puts whatever is left in the course as a named leg, with the check SPEC-AR-3 requires, which no gate carries today |
| The reader refuses any keyword it does not read, by one rule (the leftovers of unit 5, in the OpenAPI reader)                                                                                                                                      | No                     | None                                                                          | Not frozen. A refusal only                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `const` and `enum` beside a keyword that also decides, in the Zod writer; the OpenAPI writer's refusal of a boolean schema                                                                                                                         | No                     | None                                                                          | Not frozen. Repairs of today's code                                                                                                                                                                                                                                                                                                                                                                                                                     |
| The Zod reader passes over a declaration it cannot read (SPEC-PR-2)                                                                                                                                                                                | No                     | A silence: 0.8.0's change log says a Zod reader's refusals "have no kind yet" | Stopped by SPEC-I-1 until text gives the kind. It keeps its place in the order plan, with this stop named there                                                                                                                                                                                                                                                                                                                                         |
| Unit 9: the reader's document pass, position by position, and the places refusals name                                                                                                                                                             | No                     | None found                                                                    | Unchanged, where the order plan puts it                                                                                                                                                                                                                                                                                                                                                                                                                 |
| The second part of unit 6: the endpoint definition's shape and the run report                                                                                                                                                                      | No                     | SPEC-N-4                                                                      | Its own amendment, after this one. That is a choice of order: only where a report's facts come from depends on the model                                                                                                                                                                                                                                                                                                                                |
| N7, the amendment on references across documents                                                                                                                                                                                                   | No                     | Its own text                                                                  | Not frozen and not moved. Its open kinds of reference are cases in M2, so the structure is designed to hold them                                                                                                                                                                                                                                                                                                                                        |
| The picture's format walk; the approval check reading only the quoted words; N2's slices; N5's tables; the four waits of the order plan's act 4; cutting that plan to one order (act 5)                                                            | No                     | None                                                                          | Unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| N6, the remaining legs                                                                                                                                                                                                                             | It depends on M5       | SPEC-N-1                                                                      | After M6                                                                                                                                                                                                                                                                                                                                                                                                                                                |

The items not frozen are independent of this plan. They are worked when a step here
waits on a review or on the owner, one at a time, and otherwise after M6.

## The steps

Each step opens with a step back and the decision matrix on its unknowns, written under
"Step log" in the thread record, as the plan that orders the work requires. Each is
committed before the next starts. Review rounds are the course's: two for a pull
request, and for a pull request of documents alone a point raised after the second is
answered on the thread and taken into the next change.

- **M1, the surface.** Three parts. First, JSON Schema Draft-07's keywords, computed
  from its pinned meta-schema beside the 2020-12 vocabularies the picture already pins.
  Second, what only a format's text defines, for OpenAPI and both JSON Schema dialects:
  the picture's hand list says of itself that it is the part "most likely to be missing
  one", so each text is read section by section for a construct that carries meaning the
  model must hold, and the list names every section read. A rule that says only which
  documents are valid adds nothing to the model; those are the reader's, and the sweep
  of them stays with the references amendment (N7). Third, Zod's constructs, read from
  the installed package's types through the compiler at a pinned version. All of it
  lands on `main` beside the picture's rows, because a list of what a format holds
  assumes nothing about the model. Exit: each computed list has a test that fails when
  its artefact changes, and each hand list names the text and the sections it was read
  from. A hand list is a floor and is called one: a kind found after approval gets an
  element or a cited refusal by amendment, as a new Zod construct does. Three pull
  requests, one for each part: the reading of the texts is a different kind of work
  from a computed list, and is reviewed by different readers.
- **M2, the cases.** One note under `.agent/analysis-and-reports/`, with each case's
  document in a fence. A reader who knows OpenAPI, one who knows JSON Schema and one who knows Zod attack the
  list before it lands. One pull request, with M3.
- **M3, the survey.** What decision it can change: the core of the structure (a
  set-theoretic reading of shapes, an existing compiler's model, or neither). Its exit:
  one pass, then the note is written whatever it found.
- **M4, the design.** Candidates are compared by the five lenses in order, and each
  choice is a row in the step log with its lens. Among its unknowns: the notation in
  which the specification states the structure. Exit: acceptance proofs 1 to 6 pass on
  the branch. A new case the structure holds is added and the work goes on. A case it
  cannot hold changes the structure; a case is never dropped.
- **M5, the amendment.** The structure's text goes into the specification, and the
  prototype, its proofs, the coverage map and its check ride the same pull request,
  which merges only on approval, so nothing in `src` assumes the answer before then.
  Readers who know each format attack the draft before the first push. Then two rounds
  of hosted review; a third only for a fault in what the structure says. Then one
  blocking question to the owner. A round that shows a case the structure cannot hold
  returns the work to M4, and the pull request is closed, not patched.
- **M6, the handoff.** One pull request to the course and the one statement of order.

**Size.** Five merged pull requests before the amendment (this plan; three for M1; one for
M2 with M3), one for the amendment, one for the handoff: seven. Each push runs the full
check for about ten minutes. The items that are not frozen are outside the count. The
base rate is against a quick approval: an amendment of sixteen rows took three rounds,
and two earlier ones were withdrawn, after four attacks and after three drafts.

**The limit.** Two whole reworkings of the structure, counting every return from M5 to
M4. At the third the seat stops and tells the owner what does not fit.

## Not in this plan

- Any change to what the model holds, and the rebuild of the readers and writers. PLOT
  writes those legs from the approved structure.
- Answers to SPEC-N-2, SPEC-N-3, SPEC-N-4 and SPEC-N-5.
- The example-input library, CURRENCY, RULES, HOME and MOVE, which stay where the
  course puts them.

## Risks

- **The design grows without end.** The lists are bounded and counted. The cases are
  not: reviews supply one more for as long as they are asked. So a case the structure
  already holds costs one line, and only a case it cannot hold reopens the design, under
  the limit above.
- **A structure that reads well and does not build.** The prototype is the cure, and the
  owner's word on approval stands: "if we need to review and change it later that is
  fine" (2 November 2026, of 0.5.0).
- **The frame is lost again,** and the design becomes today's model renamed. Acceptance
  2 is the check, with 3 and 6 behind it.
- **Nothing changes for Oak's document while this runs.** Stated above; the repairs
  that are not frozen are the product work in the waits.

## Review dispositions

Reviews of this plan's first draft, 24 November 2026. Each finding was checked against
the files before it was accepted.

| Source                             | Finding                                                                                                                                                                                                                                                                           | Disposition                                                                                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Assumptions reviewer               | The criteria let today's model renamed pass: no test that one meaning is one value, refusals unbounded, compiling the only proof for the two things SPEC-N-1 names, nothing tied to approved rows                                                                                 | Applied: equivalence sets and acceptance 2; a refusal cites a clause; a writer's function over the prototype; Appendix B's rows name their elements                                                        |
| Assumptions reviewer               | The queue table claimed every item and left several out, and tested one thing only                                                                                                                                                                                                | Applied: a second column, and every item of the order plan's lines 380 to 640 disposed                                                                                                                     |
| Assumptions reviewer               | The Zod reader's refusal has no kind in the specification                                                                                                                                                                                                                         | Applied: checked in the 0.8.0 change-log row; the repair is stopped by SPEC-I-1, not unfrozen                                                                                                              |
| Assumptions reviewer               | No exit if the amendment is withdrawn; returns from M5 uncounted; the case list only grows                                                                                                                                                                                        | Applied: the freeze's ground and its exit stated; one limit; a held case costs a line                                                                                                                      |
| Assumptions reviewer; a panel seat | Holding the writers' repair had no forcing rule, and "does not change the model" is false for the Zod writer                                                                                                                                                                      | Applied, and taken further by the second round below: none of it is held but the Zod writer's use of text the model holds (checked at `writers/zod/index.ts`)                                              |
| Assumptions reviewer               | N7 is made to wait though it does not change the model                                                                                                                                                                                                                            | Applied: not frozen, not moved; its kinds of reference are cases                                                                                                                                           |
| Assumptions reviewer; a panel seat | "A computed fact" and "a closed table" claim more than is so; 2020-12 is already computed; TypeScript has no list; Zod moves                                                                                                                                                      | Applied: the claim reworded, M1 shrunk to Draft-07 and Zod, the hand lists marked, the Zod version pinned                                                                                                  |
| Assumptions reviewer               | The prose and the prototype are not tied, and the proof is off the reviewed pull request                                                                                                                                                                                          | Applied: they ride the amendment's pull request; the structure is under the digest                                                                                                                         |
| Assumptions reviewer               | Acceptance on grammar strings closes a list the specification gives as examples                                                                                                                                                                                                   | Applied: every string leaf listed with its reason                                                                                                                                                          |
| Assumptions reviewer               | "Formats that can write it" answers rows of the tables (SPEC-N-5)                                                                                                                                                                                                                 | Applied: only which formats can state an element                                                                                                                                                           |
| Assumptions reviewer               | "Or a format that Castr adds" is delivered by no criterion; the freeze is stated by directory; review rounds differ from the course                                                                                                                                               | Applied, all three                                                                                                                                                                                         |
| A panel seat                       | 191 and 193 "stand" with no ground                                                                                                                                                                                                                                                | Applied: the ground is in the table                                                                                                                                                                        |
| Two panel seats                    | The count of pull requests adds to six                                                                                                                                                                                                                                            | Applied                                                                                                                                                                                                    |
| A panel seat                       | "Typed words" is not the specification's wording; the panel is written as a gate                                                                                                                                                                                                  | Applied: SPEC-CC-2's words; the panel is evidence                                                                                                                                                          |
| A panel seat                       | An untracked copy of this plan is in the Ecosystem checkout                                                                                                                                                                                                                       | Rejected: checked, there is none                                                                                                                                                                           |
| Assumptions reviewer               | `requirements.md` still describes reading OpenAPI 3.0.x                                                                                                                                                                                                                           | Out of scope: the course's "MOVE: what travels" already schedules that rewrite                                                                                                                             |
| A panel seat, adversarial          | Holding the older text assembly contradicts section 12: by the plan's own two tests it is not frozen                                                                                                                                                                              | Applied: one row for all of it, not frozen, with the one exception the model forces                                                                                                                        |
| A panel seat, adversarial          | The refusals for Appendix B.4 are frozen while a reader's refusal is not                                                                                                                                                                                                          | Kept, with the reason added: they are refusals of one output, which a reader cannot make (Appendix B.1)                                                                                                    |
| A panel seat, adversarial          | The card's sentence is the card's words, chosen by the owner, not the owner's own; M1 starts only once this plan is on main                                                                                                                                                       | Applied, both                                                                                                                                                                                              |
| Hosted review of 196               | The order plan still sent a fresh session to the order of 23 November; the cases were to be attacked by readers of two formats of three; the row for Appendix B.4's refusals mixed a reader's refusal with an output's; the practice index still called the specification a draft | Applied, all four                                                                                                                                                                                          |
| Hosted review of 196               | The thread record's note that every skill is read from the Ecosystem checkout should be limited to the cognitive skills                                                                                                                                                           | Applied in part: the owner's words are about skills, said where that checkout was present; the note now gives them, their setting and what they leave open                                                 |
| Hosted review of 196, round 2      | The picture's hand list of what only the texts define is likely incomplete, so a construct could miss the coverage map                                                                                                                                                            | Applied in part: M1 reads each text section by section for constructs that carry meaning and names the sections; the sweep of validity rules stays with N7, since such a rule adds nothing the model holds |
| Hosted review of 196, round 2      | A grammar-defined string could pass by being flagged alone                                                                                                                                                                                                                        | Applied: it is data, or an exception entered in the amendment for the owner to approve (SPEC-AR-3)                                                                                                         |
| Hosted review of 196, round 3      | The plan adopts two of the Ecosystem repository's skills with no link to them                                                                                                                                                                                                     | Applied with the first change after the exit: both linked, used as written                                                                                                                                 |
| Hosted review of 196, round 3      | The first commit carried the continuity file and the thread record with the plan                                                                                                                                                                                                  | True and not curable without rewriting history; recorded in the napkin; records land in their own commit from here                                                                                         |
