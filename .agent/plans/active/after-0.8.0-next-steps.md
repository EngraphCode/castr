---
title: After specification 0.8.0 — the next steps
status: active
lane: active
created: 2026-11-22
last_updated: 2026-11-22
destination: docs/SPECIFICATION.md
parent: castr-course.md
owner_directive: >-
  Owner, 2026-11-22: "Please plan the next steps, use the OCE cognitive and other
  skills as appropriate, make sure the plan includes requirements to periodically
  step back and assess value, and separately to run the decision matrix on
  unknowns. The next piece of work will happen in a fresh session, so make make
  sure that everything relevant is recorded in the repo". The same day, asked
  where a bounded fix of Oak's refusals goes: "Fix first". The same day, after the
  trace of N0, by question prompt: the two rows that stop Oak's document are carried
  in 0.8.1 ("Carry in 0.8.1"), and the fix is built once that text is approved
  ("Build with the text"). The same day, after two attacks showed the two rows cannot
  be written in 0.8.1, asked where their text comes from: "With the tables, in order".
todos:
  - id: N0-FIX
    content: 'The fix of what stops Oak''s document, built once part three of the amendment classes its two rows, proved by the picture. Its trace is done. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: pending
    depends_on: [N5-TABLES]
  - id: N1-REPIN
    content: 'The picture pins the latest revisions of the publisher schemas for OpenAPI 3.1 and 3.2. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: completed
    depends_on: []
  - id: N2-REFUSALS
    content: 'The picture has cells for what the reader refuses under SPEC-FV-1 and SPEC-FV-2, and they show what Castr does today. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: pending
    depends_on: []
  - id: N3-CORRECTIONS
    content: 'Specification 0.8.1, the corrections to part one, approved in the owner''s words or withdrawn. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: pending
    depends_on: [N1-REPIN]
  - id: N4-NUMBERS
    content: 'Part two of the amendment, numbers in JavaScript targets, approved in the owner''s words or withdrawn. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: pending
    depends_on: [N3-CORRECTIONS]
  - id: N5-TABLES
    content: 'Part three of the amendment, the table vocabulary with the tables (SPEC-N-5), approved in the owner''s words or withdrawn. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: pending
    depends_on: [N4-NUMBERS]
  - id: N6-PLOT
    content: 'The remaining legs that fix Castr are written into the course from the picture''s cells, each with an observable exit state, and reviewed. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: pending
    depends_on: [N0-FIX, N2-REFUSALS, N7-REFERENCES]
  - id: N7-REFERENCES
    content: 'An amendment on references across documents, written from the picture''s cells for what the reader refuses: what a reference is for case 5 of SPEC-FV-1, that a target must be valid for the place the reference stands, what a failed fetch says, and the rules of SPEC-FV-2 that turn on which documents make up a description. Approved in the owner''s words or withdrawn. Finished only when the thread record holds its step-back answers and matrix rows under "Step log".'
    status: pending
    depends_on: [N2-REFUSALS, N3-CORRECTIONS]
---

# After specification 0.8.0: the next steps

This plan is a companion to [the course](castr-course.md). It holds the next steps in
enough detail for a session that starts with no memory of the last one. It is the one
statement of what is next: the thread record, the continuity file and the course point
here, and where one of them says something else about the next step, this plan governs
and the other is corrected.

## Start here in a fresh session

1. Read the top of
   [the thread record](../../memory/operational/threads/castr-correction.next-session.md):
   "Start here: handover of 21 November 2026", "After the handover" and "The matrix
   pass of 22 November 2026". They hold what stands, the owner's decisions ten to
   fourteen, how work lands in this repository (with the commit helper), and the
   dispositions already made. Decisions one to nine are lower in that record, from "Six
   decisions, by question prompt, 20 November 2026".
2. Read this plan.
3. Check the live state before acting: `git status`, `git log -3`, open pull requests,
   open claims, open dependency alerts. A record is a pointer, not the truth.
4. Work in this repository only. The owner set one seat per repository on 21 November.
   Tell the Ecosystem repository's seat before anything is written there; nothing in
   this plan writes there.
5. Use the Ecosystem repository's copies of the cognitive skills and the decision
   lenses, never this repository's. The owner, 22 November 2026: "Don't use the local
   copies of the skills, use the OCE copies". They are in the sibling checkout
   `oak-open-curriculum-ecosystem`: the skills under `.agent/skills/cognition/`
   (`metacognition`, `proportionality`, `cricket`, `concept-exploration`, `reason`) and
   the lenses in `.agent/directives/principles.md` under "Decision Lenses". This
   repository holds copies of both at an older revision; they are not used. If the
   sibling checkout is absent, stop and say so; do not fall back to the local copies.
6. Before a step's first edit, do its step back and run the decision matrix on its
   unknowns, and write both under "Step log" in the thread record. N0's are there,
   dated 22 November. N1 is done. The next step is N3 ("Where it stands" under N3
   says how far it has got); N2 waits on nothing and may be worked beside it.
7. Read "Review dispositions" at the foot of this plan and give each row its
   disposition before starting the step it names.

## What this serves

- **Outcome.** Castr converts Oak's latest v1 document to Zod, TypeScript and endpoint
  definitions, right in every cell the picture has, and the specification says exactly
  what "right" is for every construct a valid OpenAPI 3.1 or 3.2 document can hold.
- **Impact.** The third-party generators in the Ecosystem repository can be replaced
  with nothing rewritten afterwards. The owner, 20 November 2026: "What I want is to not
  have to rework Castr if Oak adds an additional, valid field type to their spec".
- **Mechanism.** The specification is the only description of the destination, and it
  changes only by the owner's approval. The picture shows what Castr does against it,
  judged from outside Castr. The code is fixed until the picture reads right. The
  owner, 18 November 2026, asked for both halves: to define "what working and working
  well looks like, what correctness means", and to have "explored if we can reach that
  state in isolation". The amendment is the first half. N0 is the first act of the
  second.

## Who this is for

- **The Ecosystem repository's maintainers and its agents.** They replace three
  third-party generators and a layer of string rewriting with one tool whose output
  they do not have to patch. They feel it as generation that works on the document Oak
  serves that day, and as a refusal that says what and where when it does not.
- **A teacher or developer using Oak's curriculum tools.** They never see Castr. They
  get validators and types that agree with the API. This is a proxy claim: nothing here
  measures it.
- **The owner.** A destination that changes only by their word, and a picture they can
  read in one command to see how far the code is from it.
- **The next agent.** A plan and records that can be picked up cold.

## Where things stand on 22 November 2026

- Specification 0.8.0 is on `main` (merge `c320004f`): the reader's refusals
  (`NOT-READ`, SPEC-FV-1, SPEC-FV-2) and 3.0.x as a later capability. It is part one of
  three.
- The picture (`lib/tests-picture/`, `pnpm picture`, `pnpm test:picture`) has cells for
  315 rows in three columns and for whole documents (317 before the re-pin of N1).
- Castr refuses Oak's v1 document in every output. `pnpm picture` lists the rows Oak's
  document uses that are not right: 31 of 74.
- No commit has touched `lib/src` since 18 November (`git log --since=2026-11-18 --
lib/src` is empty). Every pull request since has been the picture, the specification
  or the record.

## Order, and whose it is

- **N3, N4, N5, then N0 is the owner's**, 22 November. After the trace of N0 the owner
  chose that the fix is built with its text ("Build with the text") and that the text
  for the two rows is carried in 0.8.1 ("Carry in 0.8.1"). Two attacks on the draft of
  0.8.1 then showed the two rows cannot be written there: they need words only part
  three defines. Asked where their text comes from now, the owner chose "With the
  tables, in order" (decision seventeen). So 0.8.1 is the corrections alone, numbers
  follow, the tables class the two rows with every other, and the fix is built after
  the tables are approved. This replaces "Fix first" and "Carry in 0.8.1" for where
  the fix sits. N0 waits on N5 ending with the two rows classed in approved text. If part three is
  withdrawn, or is approved without them, N0 does not start and where its text comes
  from goes back to the owner.
- **N1 before N3 is the seat's.** N3 names the revisions N1 pins, so it waits on the
  re-pin.
- **N4 then N5 is the owner's** accepted order for the amendment's remaining parts.
- **N3 before N4 is the seat's** disposition (the matrix pass: one concern per change).
  Numbers share no clause with the reader's refusals; only landing is serial, because
  the approval check allows one approved text at a time.
- **N1 and N2 wait on nothing** and are not ordered between themselves: only SPEC-FV-1
  case 4 uses the publisher's schema, so N2 does not wait on N1. N3 does, for the
  revisions it names. N1 is first because N3 waits on it; N2 is fitted in
  where it does not hold them. The todos' `depends_on` say the same.
- **N7 waits on N2 and N3, and is the seat's.** It is the three things on references
  that 0.8.1 could not say exactly, with the three rules that turn on which documents
  make up a description. N2's cells give it a judge outside Castr, and it
  amends the text 0.8.1 leaves. It is not ordered against N4 and N5; only landing is
  serial.
- **N6 waits on N0, N2 and N7.** What N0 learns is its main input, and N2's cells for
  what the reader refuses, with N7's text for references, are work the legs must hold. A leg whose "right" the
  tables define waits on N5; the others do not. N6 writes the legs; it does not by
  itself complete the course's PLOT todo, which keeps its own dependencies (PICTURE and
  CORPUS) and is marked complete in the course when they are.

## The steps

Each step has what it serves, when it is finished, and its size. A step that turns out
larger than its size is stopped and re-sized before it continues. Every step is
finished only when, besides its own condition, the thread record's "Step log" holds its
step-back answers and a row for each of its unknowns (see the two sections after the
steps). Each "finished when" is proved in the repository: by `pnpm test:picture`, by
the approval check (`pnpm --filter @engraph/agent-tools
validate-specification-approval`), or by the record.

### N0-FIX: what stops Oak's document

- **Serves.** "explored if we can reach that state in isolation". It is the first
  change to product code since 18 November. By the owner's word of 22 November it is
  built once part three is approved, as one change in which the picture's cells turn right.
- **What is known, checked on 22 November.**
  - Oak's document is refused at two response schemas (the 200 responses of
    `/lessons/check-restricted` and
    `/key-stages/{keyStage}/subject/{subject}/check-restricted` in
    `lib/tests-transforms/__fixtures__/corpus/oak-curriculum-api-v1-1.1.1.json`). Each
    holds a schema-valued `additionalProperties` and a `propertyNames` in the same
    object.
  - What is right for `additionalProperties` in Zod is already specified: SPEC-P-1
    names the policy (constrained) and how Zod writes it (`.catchall`).
  - The model's type can hold it: `additionalProperties?: boolean | CastrSchema`
    (`lib/src/schema-processing/ir/models/schema.ts`).
  - The reader refuses it on purpose (`lib/src/schema-processing/object-semantics.ts`,
    called from the OpenAPI, JSON Schema and Zod parsers), under a rule that every
    object is closed, which SPEC-P-1 contradicts. About fifteen test files assert the
    refusal's message.
  - The model's own validator also refuses it
    (`lib/src/schema-processing/ir/validation/validators.schema.ts`, headed
    "boolean-only").
  - The Zod writer never writes `.catchall`
    (`lib/src/schema-processing/writers/zod/additional-properties.ts`), and it builds
    its output as text (`CodeBlockWriter`).
  - The TypeScript writer has no handling of `additionalProperties`, and throws on any
    `propertyNames` as impossible
    (`lib/src/schema-processing/writers/typescript/type-writer/fail-fast.ts`).
- **There is no prior work to build on.** Two branches of April 2026 had attempted this
  ("Support explicit additionalProperties honestly"). The owner ruled on 22 November that they be removed: "remove the april work, it is superseded and likely wrong". The fix is
  written from the specification and the picture, not from them. They are gone only when `git branch --list 'feat/explicit-additional-properties*'` and `git ls-remote --heads origin 'feat/explicit-additional-properties*'` both print nothing (the second asks the remote; a local listing can be stale). Until then neither `feat/explicit-additional-properties-2026-04` nor `feat/explicit-additional-properties-rebased` is read or merged.
- **Two outcomes older todos wanted, restated here.** W1-09 and W1-10 of the archived
  unmerged-work plan wanted a schema-valued `additionalProperties` read and written,
  and a recursive catchall written. Their instructions are void: they say to apply
  files and rewrite a test from the April branches, which are ruled removed and are not
  read. Only the two outcomes carry over, with this step's own tests and finish
  condition, and a schema whose `additionalProperties` refers back to itself is one of
  the cases this step's trace and tests cover.
- **What the first telling got wrong.** The seat told the owner the fix "does not wait
  on any part of the amendment", and the owner chose "Fix first" on that. A reviewer
  then showed it holds for the Zod column only. Fixing `additionalProperties` alone
  does not make Oak's document convert, because `propertyNames` stops the same two
  schemas, and two parts of the fix have no approved answer yet. The owner was told
  this on 22 November.
- **The five unknowns this step opened with, each now disposed.** The thread record's
  "Step log" has the row for each.
  1. Whether changing the model's validator is "the model changes" (SPEC-N-1): it is
     not; the validator is made to agree with the type the model already declares.
  2. What TypeScript writes for a constrained object: part three says (N5).
  3. `propertyNames` in Zod and in TypeScript: part three says (N5).
  4. The size of moving the Zod writer to syntax-tree nodes: the touched path moves,
     in one pull request.
  5. Whether a narrow amendment is the right instrument for 2 and 3: it is not. The
     owner first chose to carry the two rows in 0.8.1; two attacks showed they need
     part three's words, and the owner then chose "With the tables, in order".
- **Conditions on the building,** set by reviews on 22 November and recorded in the
  thread record's "Step log": the model's files and version are unchanged; every writer
  writes the construct or gives a located rejection, each proved from a model value
  with no reader; the validator's test is inverted first and the validator is shown to
  end on a schema that refers to its own parent; a schema-valued
  `additionalProperties` inside a branch of `allOf`, or beside `patternProperties`, is a
  located rejection until the specification says otherwise; and the picture gains a
  case for a constrained object that names no property beside its case for one that
  does.
- **Do.** The trace and the matrix are done. Once part three is approved: test first, the
  reader and the model's validator accept a schema-valued `additionalProperties`, and
  each writer writes what part three says, with new writer output as syntax-tree nodes. The
  picture's cells are the proof. The TypeScript writer today neither writes nor refuses
  `additionalProperties`: it writes the named properties and drops the rest, so the
  reader is not changed ahead of the writers; a constraint is never dropped silently
  (SPEC-PR-2). The tests that pin the old refusal change in the same commit.
- **What the trace found, 22 November.** The picture's columns are one module: every
  case generates the types and the Zod schemas together, and a refusal by either writer
  refuses both. So the Zod cell cannot read right while the TypeScript cell reads
  refused, which this step first asked for. The owner then chose that the fix is built
  with its text, and, after 0.8.1 proved unable to hold that text, that the two rows are
  classed in part three. The trace, the step back and the matrix rows are in the thread
  record's "Step log".
- **Finished when.** Part three of the amendment classes `additionalProperties` and
  `propertyNames` for the Zod and TypeScript outputs, and in one change: the reader and
  the model's validator accept a schema-valued `additionalProperties`; each writer
  writes what part three says, with new output built as syntax-tree nodes; the shared JSON
  Schema writer no longer narrows it; the picture's cells for the two rows read right
  in every column part three classes as carried, and are held by their tests; no cell that
  read right reads otherwise; Oak's whole-document line says exactly what stops it
  next, or that nothing does; and the thread record says what is fixed and what is not.
- **Size.** Sized at its start, from part three's text. The Zod side is one pull request by
  the scratch trial of 22 November (the thread record has it). If the whole step
  passes three pull requests, step back.

### N1-REPIN: the latest publisher schemas

- **Serves.** SPEC-FV-1 case 4 names the publisher's schema by revision, and 0.8.0
  names the revisions the picture pins, which are old.
- **Done on 22 November 2026.** The publisher's index is
  `https://spec.openapis.org/oas/`. The picture reads its rows from the latest revisions
  listed that day: for 3.1 the schema of 2026-11-05 and the vocabulary of 2024-11-10,
  for 3.2 the schema of 2026-11-12 and the vocabulary of 2026-02-26. It pins ten
  OpenAPI files (`lib/tests-picture/__fixtures__/definitions/provenance.json`): for each
  version the latest schema, its `schema-base`, the dialect and the vocabulary, and the
  schema that specification 0.8.0 names, which stays until 0.8.1 names another. The
  dated 3.1 dialect and vocabulary replaced the undated `base` pair. The thread record's
  "Step log" has the matrix rows for those choices and the rows that changed.
- **For a later re-pin.** A newer revision is a new pin: it is added beside the old
  file, recorded in `docs/THIRD_PARTY_NOTICES.md`, and the old file stays until nothing
  reads it (the picture's README says so). `lib/tests-picture/rows/published-rows.ts`
  names the files read, and `lib/tests-picture/documents/rows-used.ts` holds what the
  document walker assumes about where a path item may be a reference; both are read
  again against the new revision and the text.
- **Finished when.** `pnpm test:picture` passes; every row that appears, disappears or
  changes is named in the pull request with the reason; each correction to the old
  schema is either still needed or removed, and what that does to the entry of
  SPEC-FV-2 on a Link Object's `body` (rule 7 in 0.8.0) is noted for N3.
- **Size, as it turned out.** One pull request of 25 files, 12 of them pinned
  definitions added or removed, and two pushes.

### N2-REFUSALS: cells for what the reader refuses

- **Serves.** 0.8.0 says what the reader refuses and nothing shows what Castr does
  there. Known by running it: Castr converts an OpenAPI 2.0 document, converts a 3.0
  document through a third-party rewrite, and stamps every document as 3.2.0.
- **Do.** One document for each case of SPEC-FV-1 and each rule SPEC-FV-2 lists, with
  the outcome decided outside Castr's reader, and Castr's outcome set against it. Until
  0.8.1 lands, case 4 is judged at the revisions 0.8.0 names, and no cell is built for
  a rule or an "Allowed" place that only the draft of 0.8.1 lists. The 3.0 example
  documents read wrong, not converted.
- **The judge is chosen and proved first.** Ajv 8.20.0, the validator installed here,
  cannot judge the pinned schemas as published. Run on 22 November 2026 against the 3.1
  schema of 2026-11-05 and the 3.2 schema of 2026-11-12: a document whose
  `components.schemas` holds `{"type": "string"}` is refused with
  `unevaluatedProperties`, and one that holds `true` is refused with `type`; only `{}`
  passes. The schemas reach a Schema Object through `"$dynamicRef": "#meta"`. Before a
  cell is written, pick the validator by the matrix and prove it on those three
  documents and on one invalid Schema Object. Any earlier result in this repository's
  records that ran a document holding a Schema Object through Ajv is not evidence.
- **Finished when.** `pnpm picture` prints a section for the reader's refusals; the
  cells are held by a test; the README says what is judged and by what.
- **Size.** One pull request, about ten files, two or three pushes. Before the first
  push, have the test reviewer (`test-reviewer` in this repository, `test-expert` in the Ecosystem repository) run inputs against any new reader: on the
  picture's type reader it found seven defects that way, and the hosted reviews then
  found four more.

### N3-CORRECTIONS: specification 0.8.1

- **Serves.** Things known when 0.8.0 was approved or found just after.
  1. Name the revisions N1 pins, and settle the entry of SPEC-FV-2 on a Link Object's
     `body` (rule 7 in 0.8.0) against them.
  2. List the rules read only in summary or reported by a reviewer: a security
     requirement names a declared scheme; a Link Object's `operationRef` and
     `operationId` identify an operation; a server variable's default is one of its
     `enum` values. Read each word for word from the published text
     (`https://spec.openapis.org/oas/v3.1.2.html` and `v3.2.0.html`) first.
- **Where it stands, 22 November.** The draft
  (`.agent/analysis-and-reports/amendment-corrections-draft-2026-11-22.md`) has had two
  attacks, and holds every finding. Three things follow.
  - The two rows that stop Oak's document are not in 0.8.1 (the owner's decision
    seventeen). The draft's clauses 5 and 6 come out; what was learnt about the two rows
    is input to N5.
  - What a reference is for case 5, that a reference's target must be valid for the
    place it is used, and what a failed fetch says are not in 0.8.1 either. Each was
    tried and was a list nothing forced complete. They are written from N2's cells,
    which give a judge outside Castr, as an amendment of their own after N2 (N7).
  - The corrections that remained (the revisions, cases 2 and 3, the list of
    SPEC-FV-2) were redrafted and attacked a third time, and broke in fifteen places.
    The redraft
    (`.agent/analysis-and-reports/amendment-corrections-redraft-2026-11-22.md`) holds
    every finding and where it went.
  - The seat had read the 3.2.0 text where the specification names 3.2.1. The 3.2.1
    text names the OpenAPI dialect by an address "of the form
    https://spec.openapis.org/oas/3.2/dialect/YYYY-MM-DD", which is what case 3 as
    approved says. Case 3 has no fault there and is not changed. From here the texts
    read are 3.1.2 and 3.2.1, the latest the publisher's index lists.
  - The fourth draft, in the same file, keeps a change only where 0.8.0 is false or out
    of date against a primary source and the correction needs no definition the
    specification lacks. That leaves the revisions named, the two entries of SPEC-FV-2
    the new revisions make untrue, one rule on a Server Variable Object, and one
    "Allowed" place on a Callback Object. Cases 2 and 3 are unchanged. The rules that
    turn on which documents make up a description go to N7; the unclear places in
    cases 2 and 3 go to N2's cells ("Review dispositions").
  - It is attacked once more. If that attack finds an "after" text that is false, says
    two things, or refuses or reads the wrong document, 0.8.1 is withdrawn with the
    reason recorded, and the forced corrections are carried in the next amendment.
- **Not in this step unless the matrix puts it there.** A sweep of every "MUST" and
  "MUST NOT" in the two texts. The owner's decision twelve already says what an
  unlisted rule costs: Castr reads the document, and a refusal it then gives counts as
  unbuilt until an amendment lists the rule. Completeness now is a choice to size, not
  a need.
- **Do.** A tracked draft beside the last one
  (`.agent/analysis-and-reports/amendment-part-one-draft-2026-11-22.md` shows the form:
  the before and after of each clause). One adversarial review before the first push,
  with the instruction that worked: "find a document that gets the design refusal and
  is really a defect". Then the owner's words, asked for once the findings are closed.
- **Finished when.** The owner's typed words name 0.8.1 and it is on `main` with the
  approval check passing, or the draft is withdrawn with the reason recorded.
- **How an approved amendment lands.** The specification cannot hold a draft: the
  approval check compares it with its latest approved record. After the owner's words:
  apply the draft's "after" text unchanged in wording; set the version and date in the
  front matter; run prettier; run the approval check and take the SHA-256 from its
  message (do not compute it by hand: the words `## Change log` also appear inside
  SPEC-CC-2, so a search for the heading finds the wrong place); add the change-log row
  with the owner's words exactly, the date and that hash; run prettier and the check
  again. Commit the specification alone, and the record in a commit of its own. Then
  search the repository for sentences the amendment makes false and correct or mark
  them in the same pull request.
- **Size.** First given as one pull request of three to five pushes. As it turned out,
  the record of the draft as attacked, with the owner's decision seventeen, landed as a
  pull request of its own (#163). The redraft with its attacks is a second pull
  request, merged before the owner is asked so that the text they read is on `main`;
  the landing of the approved text is a third. If either passes five pushes, step back.
  The 0.8.0 pull request took about ten.

### N4-NUMBERS: part two of the amendment

- **Serves.** The owner's decisions four and seven of 20 November: every integer is
  kept exactly in the model; Zod and TypeScript write `number`, and Zod asserts a safe
  integer, so a value too large is refused and never accepted rounded; the narrowing is
  stated in the run report, a TypeScript comment and a Zod annotation; a decimal with
  more digits than a JavaScript number holds is declared once per run.
- **Must also say.** From the matrix pass: a bound the safe range already implies adds
  nothing; a bound that excludes the whole safe range, and a `const` or `enum` member
  beyond it, accept no value; each is reported.
- **Touches part three in two places,** and each is settled by the matrix at this
  step's start: the picture's cell for a declared narrowing, and whether the Zod
  annotation needs the mark that part three defines. If either cannot be said without
  part three's vocabulary, that piece moves to N5.
- **Finished when.** As N3, for the version this part carries.
- **Size.** One pull request, three to five pushes.

### N5-TABLES: part three of the amendment

- **Serves.** SPEC-N-5 is open: the scope-and-fidelity tables for the pairs of
  SPEC-C-1. The owner's decisions one, two, three, eight and nine give the vocabulary:
  a fifth class, outside the target, barred from schema keywords; a Zod check Castr
  writes is carried and marked; an unknown `format` is carried and reported; the
  endpoint definitions are a third column; four declarations the parser spends have a
  sixth outcome, read.
- **Do.** The picture's proposals (`lib/tests-picture/rows/`) are the first draft of
  the tables. From the matrix pass: the three discriminator rows are carried by
  companion for TypeScript; `$id`, `$anchor` and `$defs` stay carried as structure,
  shown as a type exported under the name. No rule quantified over a list that nothing
  forces to be complete.
- **Starts with the design of SPEC-N-4.** The 56 Zod cells for rows outside a schema
  need the form of addressing a validator, which is the public surface and is not
  designed. It is the first piece of this step, in a pull request of its own: read how
  the Ecosystem repository uses the output, ask its seat for facts, write the design as
  a tracked draft, have it attacked, and bring it to the owner as an amendment. The
  tables for those 56 cells follow it; the other tables do not wait on it.
- **Finished when.** As N3, for the version this part carries, with the tables in the
  specification and the picture's proposals computed from them and not kept beside them.
  Where N6 has already written legs, they are read again against the approved tables
  in this step's pull request, and any leg whose exit state a table changed is
  corrected in the course.
- **Size.** The largest step: 315 rows in three columns. At least two pull requests.
  Size it at its start with what is known then.

### N7-REFERENCES: references across documents

- **Serves.** Three corrections to part one that the draft of 0.8.1 tried and could not
  state exactly (its record is
  `.agent/analysis-and-reports/amendment-corrections-draft-2026-11-22.md`, "Deferred"
  and both reviews): what a reference is for case 5 of SPEC-FV-1; that a reference's
  target, in the document or another, must be valid for the place the reference stands,
  and that cases 1 to 3 apply to every document read; and what the rejection says when
  a referenced document cannot be fetched. With them, three rules the OpenAPI text
  states and no schema holds, which cannot be listed in SPEC-FV-2 until the text says
  which documents make up a description: a security requirement's name corresponds to
  a declared security scheme (and in 3.2 may be a URI); a Link Object's `operationId`
  is that of an operation; a 3.2 Tag Object's `parent` names a tag and no chain of
  parents returns to its start. The redraft of 0.8.1 has each sentence word for word in
  its third review.
- **Do.** Write it from N2's cells, which decide each case outside Castr. Known hard
  places, from the reviews: a discriminator `mapping` value that is both a schema name
  and a relative URI reference, which the 3.2 text calls implementation-defined; a
  `$ref` written as data; a 3.2 security requirement name that is a URI; a Link
  Object's `operationRef`, which "MUST point to an Operation Object"; a target inside a
  file with no `openapi` field. A tracked draft, attacked before the owner sees it, as
  N3.
- **Finished when.** As N3, for the version this amendment carries.
- **Size.** One pull request for the draft and its landing. Size it at its start from
  N2's cells.

### N6-PLOT: the remaining legs

- **Serves.** The course's PLOT todo. The picture's cells that are not right are the
  work; this step orders what N0 leaves.
- **Do.** Write the legs into the course, each with an observable exit state read from
  the picture. Inputs: what N0 found; three of Oak's rows read wrong in the Zod column
  (`const`, `format: uri`, `false` as a schema) and one is missing (`default`); the
  reader converts what 0.8.0 refuses. Say where the model's design (SPEC-N-1) is done:
  the course says the model changes only after that design is an approved amendment,
  and no step here produces it. Have the `assumptions-expert` reviewer read the legs
  before the first runs.
- **Finished when.** The course holds the legs and the owner has seen their order.
- **Size.** One pull request to the course.

## Stepping back to assess value

This is a requirement of the plan. Use `metacognition` to look at the work and
`proportionality` to size it. Use the `cricket` panel at the start of N0, N3, N5, N6
and N7, and whenever a step back leaves doubt; not at every step back.

**When.** Before the next action, at each of these:

- the start of each step, and its end;
- a pull request reaching its fifth push;
- a step passing the size it was given.

**Ask, and write the answers under "Step log" in the thread record, dated, a few lines
each:**

1. Which sentence of "What this serves" does the step in hand move, and how would a
   reader of `pnpm picture` see it?
2. What has changed for Oak's document since the last step back? Steps N1 to N5 change
   nothing for it by their nature. The owner knows that the amendment's three parts come
   before the fix and chose it on 22 November. If two steps in a row end with nothing changed for Oak's
   document, say so to the owner in plain words before the third starts.
3. Is the step still the size it was given? If not, is it one step or two?
4. Is anything being built to check the work that is larger than the work?
5. What would be lost if the step stopped here?

**What the first reviewers of this plan found,** as the first entry: a conscience check
on 22 November called the plan's first form drifting, since none of its steps changed
product code and the owner's own words asked for reaching the state to be explored.
The owner then put the fix first.

## Running the decision matrix on unknowns

Separate from stepping back, and also a requirement. An unknown is anything the work
depends on that no record answers. Some are decided and some are found by doing; only
the first kind goes through the matrix.

**When.** At the start of each step for the unknowns listed under it, and at once for
any new one met during a step.

**How.** As the Ecosystem repository's `principles.md` says under "Decision Lenses":

1. If the question is not yet formed, or its options may be the wrong options, run
   `concept-exploration` first.
2. Size it with `proportionality`: is it this step's question, and at what level is it
   answered?
3. Apply the five lenses in order, and stop at the first that settles it:
   architectural excellence; strict, everywhere, all the time; could it be simpler
   without losing quality; would it be simpler if the system changed; user value.
4. Record the question, the lens and the disposition as a row under "Step log" in the
   thread record, in the form of the matrix pass of 22 November.
5. Take to the owner only what the lenses do not settle, or what is theirs by its
   nature: a change to the specification's text, product scope, the order of the plan.
   Ask through a question prompt, with enough context to decide without the history,
   and with no recommendation attached to an option. Read the record before asking.

**Two cautions from 22 November.** A disposition is a hypothesis until it has been
attacked: the seat settled one question by a lens (drop the schema revision from the
specification) and two reviewers reversed it within the hour. And a fact told to the
owner is checked to its edges first: the seat told the owner a fix did not wait on the
amendment, the owner decided on it, and a reviewer then showed it held for one column
of three.

**Unknowns to decide by the lenses.**

| Step | Unknown                                                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| N0   | Nine rows disposed on 22 November in the thread record (the five listed under N0 and four found by the trace); any new one met when it is built |
| N1   | Whether the picture pins `schema-base` as well as `schema`, and dated revisions in place of `base`                                              |
| N2   | What decides a reference's target outside Castr, across files                                                                                   |
| N2   | Whether a document Castr converts today and 0.8.0 refuses is a cell of its own or the existing "wrong"                                          |
| N3   | Whether a rule that differs between 3.1 and 3.2 is one entry or two                                                                             |
| N3   | Whether the sweep of every "MUST" belongs in this step                                                                                          |
| N4   | What the picture's cell for a declared narrowing is called and how it is judged                                                                 |
| N5   | The form of addressing a validator (SPEC-N-4), designed as this step's first piece                                                              |
| N5   | How the tables are held so that the picture's proposals are computed from them                                                                  |
| N5   | What the mark on a Zod check Castr writes is, given that reading Zod is not designed (SPEC-N-3)                                                 |
| N6   | Where the model's design (SPEC-N-1) is done                                                                                                     |
| N6   | The seven rows with no second judge: which validator or which text judges each                                                                  |
| N7   | What a discriminator `mapping` value is read as when it is both a schema name and a relative URI reference                                      |
| N7   | Whether a target is judged by the schema of the place the reference stands, and what that is for an `operationRef`                              |

**Unknowns found by doing,** recorded when found and not run through the lenses: which
rows change under the latest revisions (N1); how many more word-only rules the two
texts hold (N3); what the trace of Oak's two schemas shows (N0).

## Review dispositions

Findings from the adversarial review of part one's first draft that 0.8.0 did not
settle and no record disposed of. Each gets a disposition, by the matrix, before the
step it names starts.

| Date       | Source                   | Finding                                                                                                                                   | Step |
| ---------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 2026-11-22 | Adversarial review, #156 | A reference into another file that has no `openapi` field (`lib/examples/openapi/multi-file/main.yaml`): is that file read, and as what   | N2   |
| 2026-11-22 | Adversarial review, #156 | What counts as a reference for case 5: a link's `operationId`, a discriminator's `mapping` value, a security requirement's name           | N7   |
| 2026-11-22 | Adversarial review, #156 | A reference written as data, such as a property named `$ref` or a `$ref` inside an example, must not be followed                          | N2   |
| 2026-11-22 | Adversarial review, #156 | A network or file failure while reading a referenced document makes the refusal differ between runs (SPEC-PR-4)                           | N7   |
| 2026-11-22 | Adversarial review, #156 | A version such as `3.1.0-rc1` matches the publisher's pattern: case 2 says the pattern decides, so it is read; a cell shows it            | N2   |
| 2026-11-22 | Adversarial review, #156 | A document with both `swagger` and `openapi` fields states two versions                                                                   | N2   |
| 2026-11-22 | Adversarial review, #156 | YAML that parses differently between libraries (merge keys, duplicate keys, `openapi: 3.1` read as a number): who decides well-formedness | N2   |
| 2026-11-22 | Adversarial review, #156 | JSON Schema that Castr writes declares the format-assertion vocabulary, so its `$schema` may be one case 3 refuses on reading back        | N5   |
| 2026-11-22 | Adversarial review, #156 | A nested `$schema` naming another dialect inside a 2020-12 schema: which meta-schema judges it, and where each dialect's judgement stops  | N2   |
| 2026-11-22 | Hosted review, #156      | The resolved target of a reference must be valid for the place it is used                                                                 | N7   |
| 2026-11-22 | Third review of 0.8.1    | A 3.2 document that names `https://spec.openapis.org/oas/3.1/dialect/base`, which the 3.2.0 text names and the 3.2.1 text does not        | N2   |
| 2026-11-22 | Third review of 0.8.1    | Case 3's "at any revision" reaches dialect addresses the publisher does not serve                                                         | N2   |
| 2026-11-22 | Third review of 0.8.1    | Case 3 gives no address for Draft 2020-12: a trailing `#`, the `http:` form, a value that is not a URI                                    | N2   |
| 2026-11-22 | Third review of 0.8.1    | A `$schema` key that is data (a discriminator's `mapping`, an extension's value) or stands where no schema resource root is               | N2   |
| 2026-11-22 | Third review of 0.8.1    | Case 2: a number for `openapi` is refused by `type`, not the pattern; "a 3.0.x document" is not defined                                   | N2   |
| 2026-11-22 | Third review of 0.8.1    | Fields a schema refuses where the text says only that they "apply" elsewhere: `allowReserved` on a header, `bearerFormat`, `scheme`       | N2   |
| 2026-11-22 | Third review of 0.8.1    | Which document's Components Object, operations or `tags` a name is resolved in, for the three rules N7 now carries                        | N7   |

## What is not in this plan

- The example input library ([its plan](example-input-library.md)) continues at EC-1 and
  is not ordered here.
- HOME and MOVE stay in the course. Nothing moves until the picture reads right.
- Kinds for the refusals of a JSON Schema reader and of a Zod reader: written by the
  amendment that opens the capability needing them.
- The model's design (SPEC-N-1) has no step here; N6 says where it goes.

## Risks

- **Review rounds on documents cost more than the documents.** The 0.8.0 pull request
  took about ten pushes, each behind a gate of several minutes. A draft that is
  attacked before its first push costs fewer.
- **A record written from memory is wrong.** Three times in three days a sentence about
  the specification or the code was written without reading it. Read, then write.
- **A push gate must have a quiet tree.** Write nothing in the tree while a push runs.
- **The hosted review of a head commit may report "failed".** That is not "completed";
  #155 was merged that way and the owner was told.
- **N0 touches code that about fifteen test files pin.** A test that asserts the old
  refusal is a test of a rule the specification contradicts; it changes with the code,
  in the same commit, and is not deleted to make a gate pass.
