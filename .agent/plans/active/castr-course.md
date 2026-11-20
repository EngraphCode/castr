---
title: Castr course — from the present code to the specification
status: active
lane: active
created: 2026-09-21
last_updated: 2026-11-19
destination: docs/SPECIFICATION.md
owner_directive: >-
  Owner, 2026-09-21: "Before we go further we stop, and we define a destination,
  and we compare it to where we are, and we plot a course, not a course to
  justify sunk cost, and course to a better place, useful functionality, and
  excellence in engineering and software design and architecture."
todos:
  - id: ALERTS
    content: 'Dependency alerts on main reach zero through dependency-update pull requests that land without analysis; while main has an alert that holds merges, nothing else merges (SPEC-G-1). Done on 2 November 2026: #117 (SHA:31f49532) cured 30, #118 (SHA:acd9d2b0) the six raised after it; main had zero open alerts at 15:00Z and pnpm audit reported none. A new alert reopens the leg. Reopened on 13 November 2026 by two alerts on @hono/node-server, cured by #119 (SHA:d3077124) on 18 November; main has no open alerts'
    status: pending
    depends_on: []
  - id: PROBE
    content: "A read-only lint probe: OCE's lint configuration, with its type-aware rules, runs over Castr's product code without changing it, and the table of rule, hits and area is saved under .agent/analysis-and-reports/; it is the first step of the owner's question of 1 November 2026, 'run your analysis on the code as-is', an input to the reflection after MEASURE, and RULES's starting point; run on 2 November 2026, its table is .agent/analysis-and-reports/oce-lint-probe-2026-11-02.md, on main since #120 (SHA:3ff0fd2e)"
    status: completed
    depends_on: []
  - id: CURRENCY
    content: "After MEASURE and scoped by what the reflection decides travels (owner's decision card, 2 November 2026: 'After MEASURE, scoped'): if code travels, lib and the root tooling at latest within the holds the toolchain forces, TypeScript 6 (ts-morph 28 vendors it; typescript-eslint's peer range ends below 6.1), @types/node 24 (engines.node 24.x, ADR-049), vitest 4 and tsup 8 (OCE's majors), and the Scalar packages, which the C-1 OpenAPI reader replaces, one proof-gated commit per type-affecting cycle; if MOVE starts fresh, no pass on code that is archived; agent-tools is outside it either way, because it does not travel; the reflection of 18 November 2026 decided that code travels, so the pass runs, on the code PLOT says is kept"
    status: pending
    depends_on: [PLOT]
  - id: RATIFY
    content: "The owner approved draft 0.5.0 in this repository's working session on 2 November 2026 ('I approve draft 0.5.0 , if we need to review and change it later that is fine.'), recorded per SPEC-CC-2 with its SHA-256 at SHA:0e2ca07a; the owner then approved 0.5.1 ('I approve 0.5.1'), which reads SPEC-CC-3's latest approved record as the latest ever approved, recorded at SHA:1a7631ac; the SPEC-CC-3 check is written (SHA:5d264896) and enforces that reading; all of it landed on main with #120 (SHA:3ff0fd2e) on 18 November 2026, at version 0.5.2, which the owner approved that day ('I approve version 0.5.2')"
    status: completed
    depends_on: [ALERTS]
  - id: MEASURE
    content: "The coverage table for SPEC-C-1: what today's generator does on both Oak documents at their latest published versions, its Zod output loaded under the latest Zod 4, scored against the source document by an independent validator, never against the libraries being replaced; it makes no decision (owner's decision card, 2 November 2026: 'Measure without making decisions, drop the thresholds, we figure out what we have, then we reflect on it'); the owner and the agent then reflect on it and decide what travels; a throwaway probe, nothing red enters any repository; run on 18 November 2026 against the documents served that day (v1 1.1.1, v0 0.11.2), its table is .agent/analysis-and-reports/measure-2026-11-18.md; the reflection of 18 November 2026 decided that the code travels, made correct in this repository first (see Order of the legs)"
    status: completed
    depends_on: [RATIFY]
  - id: PICTURE
    content: "One repeatable command that shows what Castr does, judged from outside Castr: documents down the side (Oak's latest v1 document, by the owner's ruling of 19 November 2026, then the example documents; the picture is a drawing of what Castr does and is not SPEC-C-1's acceptance proof), what a consumer takes across the top (types, validators, endpoint definitions, the run's report), and in each cell right, refused with a plain reason and its place, wrong, missing or crashed; the MEASURE probe of 18 November 2026 is its first drawing; it lands in the repository asserting the cells that are already right and grows with the code that makes more cells right, so nothing red is ever committed; it is what the owner asked for on 18 November 2026: what working, working well and correct look like"
    status: pending
    depends_on: [MEASURE]
  - id: CORPUS
    content: "SPEC-C-1's corpus is the Oak API specification's v1 document at its latest published version, by specification 0.6.0, which the owner approved on 20 November 2026 ('I approve 0.6.0') after ruling on 19 November 'Drop v0, latest v1 only'; the corpus holds one pin, the 1.1.1 document"
    status: completed
    depends_on: []
  - id: HOME
    content: "Section 10 of the specification says when Castr moves; its phrase 'early in the course' is changed by an approved amendment, in the owner's words naming the version (SPEC-CC-2), so that the specification says what this course's Order of the legs says: Castr moves after it is working, working well and correct in its own repository; it is the last step before MOVE, after the legs PLOT writes, and PLOT places it behind its final leg"
    status: pending
    depends_on: [PLOT]
  - id: RULES
    content: "Only if code travels: OCE's lint rules are adopted in this repository for the code that travels, starting from the PROBE table, and that code is fixed until they pass with no suppression (SPEC-G-3), before MOVE; the owner's decision card, 2 November 2026: 'At move the OCE rules will apply, the point of applying them early is to fix issues in isolation before moving', and the owner confirmed by card the same day that this reading (after the reflection and CURRENCY, travelling code only, before MOVE) is right"
    status: pending
    depends_on: [CURRENCY, PROBE]
  - id: MOVE
    content: Held by the owner's decisions of 18 November 2026 until SPEC-C-1's first acceptance part passes in this repository on Oak's latest v1 document and the example library's standard holds on its OpenAPI documents (see Order of the legs); section 10 of the specification says 'early in the course' until HOME amends it. Castr moves into the Engraph Open Curriculum Ecosystem repository as workspaces and is fully integrated there (owner, 2 November 2026); what travels is the code, made correct here (the reflection, 18 November 2026); the specification travels as the only description of the destination, and its SPEC-CC-3 check is given a home in OCE; the approval record covers the specification's exact bytes, so if its arrival in OCE changes any byte above its change log (OCE's formatter or markdownlint), the move carries a format-only amendment approved in words (SPEC-CC-1); this repository is archived
    status: pending
    depends_on: [RULES, PLOT, HOME]
  - id: PLOT
    content: The legs to SPEC-C-1's first acceptance part are written into this plan from the MEASURE table and the model design (SPEC-N-1), each with an observable exit state, and reviewed by assumptions-expert; they run in this repository, before MOVE (owner's decision card, 18 November 2026), and they include the proof of SPEC-G-4 on Oak's latest v1 document as a check of Castr's own, the reader that holds the example library to its standard, and checks derived from what the consuming workspaces expect
    status: pending
    depends_on: [PICTURE, CORPUS]
---

# Castr course

## Goal

Reach the destination in [the specification](../../../docs/SPECIFICATION.md): SPEC-C-1
first, then SPEC-C-2, on an architecture that meets its architecture requirements and a
proof standard that meets its definition of green.

## Mechanism

The destination is fixed by a change-controlled document, so the course can change while
the target stays still. A consumer in the same repository makes the first target finite
and its acceptance a workspace dependency. The specification's computed count of
`NOT-YET-BUILT` rejections (SPEC-PR-6) is the measure of distance remaining.

## Order of the legs

Owner decision, 21 September 2026 (recorded 23 September): MEASURE precedes MOVE. The
measure is one session of throwaway probing and it answers the question that decides what
is worth moving — evolve the present model, or rebuild it. If the answer is rebuild,
carrying the present product code and its history into the new repository imports the
clutter the owner wrote off on 21 September; the move is then the specification plus fresh
workspaces. Where Castr ends up is unchanged; only the order is.

Owner decisions by card, 2 November 2026, after the approval of 0.5.0. MEASURE measures
and decides nothing: "Measure without making decisions, drop the thresholds, we figure out
what we have, then we reflect on it". What travels is decided at that reflection, with the
owner. CURRENCY follows MEASURE and is scoped by what travels ("After MEASURE, scoped"):
no pass on code that is archived, and `agent-tools` is outside it either way. OCE's lint
rules are applied here, before the move, to the code that travels: "At move the OCE rules
will apply, the point of applying them early is to fix issues in isolation before moving".
The agent read this as a RULES leg after CURRENCY and before MOVE, which restores the
owner's 1 November order, "dependencies, then rules"; the owner confirmed that reading by
card the same day ("Yes, as read"). The order is therefore ALERTS, RATIFY, MEASURE, the
reflection, CURRENCY, RULES, MOVE, PLOT, with PROBE (read-only) at any time before the
reflection.

Owner ruling, 18 November 2026, at the start of the reflection, verbatim: "I don't want to
move the code until we have defined what working and working well looks like, what
correctness means, and explored if we can reach that state in isolation. Moving broken code
into another repo seems like it can only cause further problems". MOVE therefore does not
start until both are done, whatever the todos above say about its order; the order of the
legs before it is rewritten when the reflection settles them.

Asked the same day which of two things "in isolation" meant, the owner answered, verbatim:
"I mean make the Castr code in Castr as correct as we can, and working with Oak documents
(specifically the latest v1 open api spec for the curriculum api) and a variety of other
examples specs, which I assume corresponds to the example input library. Are there any
tensions or inconsistencies in my request?" The seat found six and put three to the owner
by decision card. Each answer below is the option the owner chose, in the card's words.

- **Whether correct includes how the code is built:** "As the specification says
  (Recommended)". Correct includes SPEC-AR-1 and SPEC-AR-3. A repair that adds no
  text-building goes into today's code; anything that needs new writer output is built as
  syntax-tree nodes; the model is redesigned by an approved amendment (SPEC-N-1) before it
  changes.
- **How much must be true here before the move:** "Oak documents pass here first
  (Recommended)". SPEC-C-1's first acceptance part passes in this repository on Oak's
  latest v1 document before MOVE. Section 10 of the specification says "early in the course"; that
  phrase changes by an approved amendment, and until then the sentence stands as written
  and MOVE does not start.
- **What working with other example documents means:** the owner, 20 November 2026,
  verbatim: "What I want is to not have to rework Castr if Oak adds an additional, valid
  field type to their spec". On every OpenAPI document in the
  [example library](example-input-library.md), each valid construct is converted exactly,
  checked against an independent validator. A refusal, in plain words with its place, is
  for an invalid document or an exclusion the owner approves. This replaces the card of
  18 November, which allowed a located refusal of any construct.
  Full support stays required only for Oak's v1 document, so SPEC-C-1 stays finite. The
  library's JSON Schema documents wait for SPEC-C-2.

What travels is therefore the code, made correct here. The order is now ALERTS, RATIFY,
MEASURE and the reflection (all done but ALERTS's standing check), CORPUS, PICTURE, PLOT, the legs
PLOT writes, HOME, MOVE; CURRENCY and RULES still precede MOVE, and PLOT places them among its
legs. Three things follow that the seat wrote and the owner can strike:

- The owner's sentence names v1, and on 19 November 2026 the owner ruled, verbatim: "Drop
  v0, latest v1 only". The work is scoped to Oak's v1 document at its latest published
  version; specification 0.6.0, approved on 20 November 2026, makes it SPEC-C-1's corpus.
- The card on the move named the Oak documents, and the owner's sentence names the example
  documents beside them, so the library's standard is read as part of the state reached
  before MOVE.
- Work this plan tied to MOVE and that the building needs happens here first. The passages
  of `README.md`, `principles.md`, `requirements.md` and `IDENTITY.md` that contradict the
  specification are rewritten in this repository, each shown to the owner before it merges,
  as "MOVE: what travels" already requires. `README.md` says strictness does not authorise
  closing an object whose source permits additional properties, and `principles.md` says
  objects are always closed; SPEC-P-1 says neither.

The three tensions the seat did not card: "working well" is defined nowhere and the
per-construct tables (SPEC-N-5) and the model's structure (SPEC-N-1) are unwritten, and
those are amendments that PLOT sequences; a definition cannot land
as a failing check, so each check lands with the cure that passes it; and this repository
can prove only the first of SPEC-C-1's two acceptance parts, so PLOT's legs include checks
derived from what the consuming workspaces expect.

What working looks like, settled on 19 November 2026. The owner had asked what working,
working well and correct look like. The answer is a picture, produced by one repeatable
command and judged from outside Castr (PICTURE in the todos): documents down the side, what
a consumer takes across the top, and in each cell right, refused in plain words with its
place, wrong, missing or crashed. The MEASURE table is its first drawing.

- **Working** is every Oak cell right, with the consuming repository's own generation step
  then building on the result, its generator packages removed and nothing rewritten
  afterwards.
- **Working well** is every valid construct on every other document converted and right,
  no crash, a second run changing nothing, and an invalid document refused in plain words
  with its place.
- **Correct** is the decision an independent validator makes reading the document itself,
  and code built as §9 requires, which the picture cannot show.

Measured that day, and the legs PLOT writes account for each:

- About 26,500 of 35,655 product lines under `lib/src` are the model or are written
  against its shape, and §9 replaces the model. What moves after being made correct is
  mostly code not yet written. The owner's word of 18 November is to make it correct here.
- The consuming repository generates from Oak's v0 document (so SPEC-C-1's second
  acceptance part needs it moved onto v1 first, a change in that repository), from a copy last changed on
  3 August 2026 that it alters before generating, and does not consume v1. The served
  documents have 3 named components where that copy has 33, and its code addresses
  validators by component name, so moving it onto a served document is a change of its
  own there.
- Its current validators write `const` as a plain string at 81 places and insert `default`
  at 12. A correct generator is stricter on the first and, by the owner's decision of
  2 November, stops the second. Whether live Oak data satisfies the constants is checked,
  by running both sets of validators over recorded responses, before any swap.
- Where code lives and where it is judged are separate. The consuming repository's
  generation step can run locally against a Castr build with no file moved, so the second
  half of SPEC-C-1's acceptance is rehearsed before MOVE.
- Today every refusal a user sees is a stack trace, and two invalid fixtures are accepted
  silently (the program run on 39 documents).

The order is ALERTS, RATIFY, MEASURE and the reflection, CORPUS, PICTURE, PLOT, the legs PLOT
writes, HOME, MOVE.

## RATIFY: how the specification is ratified

The owner walked the ratification checklist on 2 November 2026, one decision card per
clause, each stating the clause in plain language with its reason and its cost; cards 17
to 20 were settled by the owner's word "In each case take the default", and cards 21 to
30 together on one card that listed each clause with its recommended answer. Two profile
mismatches raised by the Engraph Open Curriculum Ecosystem were decided on cards the same
day. Draft 0.5.0 carries every decision, and its change log names what changed. The owner
approved it in a working session the same day, in their own words: "I approve draft 0.5.0 ,
if we need to review and change it later that is fine." The agent recorded the words, the
date and the SHA-256 of the text above the change log in the change that set the status to
`ratified` (`SHA:0e2ca07a`, SPEC-CC-2). From that ratification the document changes only by
approved amendment (SPEC-CC-1): an amended text is committed only together with its
version, its change-log row and its approval record, because the SPEC-CC-3 check fails on
committed text that does not match the latest approved record. That check does not exist
yet; it is written test-first and lands in the same pull request as the ratified file.

Settled by the owner on 21 September 2026 and already in the draft: the value-domain
reading (SPEC-P-5); OpenAPI 2.0 is not read; zero open dependency alerts on `main` to
merge (SPEC-G-1); the approval mechanism. Approval is the spoken word recorded under
SPEC-CC-2; merging the specification's pull request is mechanics that an agent performs
(owner, 23 September 2026).

## ALERTS

`main` had seven open dependency alerts on 21 September 2026. Pull request #111 cured all
seven with capped security floors (`SHA:fc94488f`). New advisories reopened the leg: on
2 November 2026 `main` had 30 open alerts (3 critical, 8 high, 15 medium, 4 low). The owner
confirmed SPEC-G-1's cure-only rule that day, so until they are cured only alert-cure pull
requests merge. Pull request #117 cured all 30 the same day (`SHA:31f49532`). After its
lockfile change, Dependabot raised six advisories that `pnpm audit` had already reported
(the cause is inferred from the timing, not observed); five
cure within declared ranges, and minimatch is fixed only in 11, which breaks
eslint-plugin-import-x. By the owner's decision card ("Patch import-x"), pull request #118
forces minimatch 11, glob 14 and KaTeX 0.19 and patches import-x with the change in
upstream pull request un-ts/eslint-plugin-import-x#570; each forced floor and the patch go
once their consumers declare the patched major. Two alerts on `@hono/node-server` arrived
on 13 November 2026 and #119 cured them on 18 November (`SHA:d3077124`). Pull request #109, the identity-chain cure, merged after #111
(`SHA:8b0aa438`) at the end of its second review round. The owner's ruling on #109 was
"land it frozen". From it the agent drew a working rule, which is the agent's wording and
not the owner's: nothing more goes into the present writer code, and a review finding
against the present model is cured only when it blocks a landing, otherwise dropped with
the reason stated. Agents merge green-and-clean pull requests; the owner granted that on
21 September 2026, and the permission rule lives in the agent's local settings, outside
version control.

## The Oak API specification's unsatisfiable shapes

Owner decision, 21 September 2026: the eight `allOf` sites that accept no value are fixed
in the document at source. Castr reports each with its location and carries it faithfully
(SPEC-PR-7); it never guesses intent.

Measured on 18 November 2026: none of the eight sites is in a document Oak serves or Castr
pins. The review record measured the consumer's cached copy
(`packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json` in the Engraph Open
Curriculum Ecosystem repository), which that day held `info.version` 0.7.0-3b4b01e6 and
eight `allOf`; the documents Oak served that day (v1 1.1.1 and v0 0.11.2) and all four pins
hold none. The owner's decision stands and has nothing left to act on in what Oak serves.
SPEC-PR-7 has no instance in the corpus, so a proof of it needs a document that has one.

The measured evidence behind the specification is in
[the review record](../../research/castr-specification-review-2026-09-21.md).

## MOVE: what travels

The specification, the course plan, the review record, the engineering doctrine Castr
needs that the new repository lacks, and the product code with its history, made correct
here first (the reflection, 18 November 2026). The corpus and the example library travel
with their provenance validator, `ATTRIBUTION.md` and `docs/THIRD_PARTY_NOTICES.md`, and so
does [the example-input library plan](example-input-library.md) with its survey while any
of its todos is open. Every other
statement of Castr's destination, fidelity contract or capability list (the review record
lists them) is left behind or rewritten to state the specification's position, once, in
the new repository. The owner approved rewriting the contradicting passages of
`principles.md`, `requirements.md`, `IDENTITY.md` and the input-output pair rule as part
of this work, each shown to the owner before it merges.

## Known on 21 September 2026

- The present model fails SPEC-AR-1 on two counts: its vocabulary is the OpenAPI and JSON
  Schema keyword set, and every node carries mandatory Zod output text built by the
  OpenAPI parser. The design question for PLOT is therefore the cost and order of
  replacing the model, and SPEC-AR-2 says its structure is designed whole first.
- The present Zod and TypeScript writers assemble target syntax as text; SPEC-AR-3
  requires syntax-tree construction.
- The Oak API specification (OpenAPI 3.1.0, 34 paths, 33 component schemas) uses `$ref`,
  explicit closed objects, two constrained records with `propertyNames`, `allOf`, `anyOf`,
  `oneOf`, `const`, `enum`, `default`, `example`, `description`, `format: uri`, `maximum`
  and `minItems`, with responses 200, 400, 401 and 404. Eight of its `allOf` sites combine
  two closed objects and accept no value under a conforming validator; SPEC-PR-7 says
  Castr reports that, and the owner decides whether the document is corrected at source
  before SPEC-C-1's second acceptance part can pass.
- The consuming code applies about seventeen string and regular-expression rewrites to
  generated output today; SPEC-C-1 removes them, and any decision one of them encodes
  becomes a profile decision in the specification.
- The consumer's typed client resolves responses through numeric status keys; a `paths`
  type with string keys compiles and types every response as `never`.

## History

On 21 September 2026 the owner wrote off every dirty worktree and orphaned branch and the
thirteen open pull requests #11–#13, #15–#18, #20, #21, #23, #26, #27 and #81 were closed;
their commits stay reachable at `refs/pull/<n>/head`. The identity-chain cure, complete
before the ruling, is pull request #109.

## Fixed properties of every leg

- Every leg ends merge-green (SPEC-G-1) with the README advertising only what holds.
- Test and cure land together in one small pull request; nothing red is ever committed,
  pushed or opened.
- No leg carries a list of things for later. A finding outside a pull request's story is
  cured in its own next pull request or dropped with the reason stated to the owner.
- Records trail reality: nothing is marked done before it is merged.
- Per pull request: a pre-execution `code-reviewer`, at most three gateway reviewers,
  freeze, open, two review rounds. A specification amendment gets the reviewers its
  substance needs.

## Acceptance

- **RATIFY:** the specification's status is `ratified`, its approval is recorded per
  SPEC-CC-2, the SPEC-CC-3 check passes in the aggregate gate, and both are on `main`.
- **MEASURE:** a table of construct by outcome (`exact`, `wrong output`, `rejects`,
  `absent`, `vacuous proof`) for both Oak documents, every cell backed by a command and its
  output, with no verdict; then the owner's reflection decides what travels.
- **RULES:** OCE's lint rules pass, with no suppression, on the code that travels; or, if
  nothing travels, the leg is closed with that reason.
- **PICTURE:** the command is on `main`, anyone can run it, and its output is the table.
- **CORPUS:** met by specification 0.6.0; the corpus holds one pin, the latest v1 document.
- **HOME:** the amendment is approved in words, recorded per SPEC-CC-2, and on `main`.
- **MOVE:** Castr's gates pass inside the new repository and this repository is archived.
- **PROBE:** the table is saved and every row is backed by the command that produced it.
- **CURRENCY:** in the code that travels, only the named holds are outdated, `pnpm audit`
  reports zero and the gates are green; or, if nothing travels, the leg is closed with that
  reason.
- **PLOT:** this file's todos name every leg to SPEC-C-1's first acceptance part with an
  observable exit state.
- **Plan complete:** SPEC-C-1 and SPEC-C-2 are advertised and SPEC-G-2 holds.

## Non-goals

What the specification's "Not part of Castr for now" section excludes; any work on this
repository's `.agent` machinery; recovering anything written off.

## Risks

- **The course drifts again.** The specification's change control is the cure; this plan
  changes freely, the destination changes only by approval.
- **Building here delays the consumer's view.** SPEC-C-1's second acceptance part runs only
  after MOVE, so a mismatch with the consuming workspaces shows late. PLOT's legs include
  checks derived from what those workspaces expect, read from the ecosystem repository.
- **The consumer's document is unsatisfiable in places.** Reported by Castr, decided by
  the owner, corrected at source.
