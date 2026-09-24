# Castr lanes and plans, categorised against the specification

**Commissioned:** owner, 24 September 2026: "Review the active lanes in Castr, and all plans,
and categorise them: things that help us fix fundamental issues with the Castr approach or
model; things that help us fix issues with implementation; things that help us get ready to
move Castr into OCE; things that help none of the above. Use all appropriate planning and
cognitive skills to plan and structure the work and the resulting report."

**Author:** Quark stirs Latitude (claude-code, session `017FtN`). **Date:** 24 September 2026,
against `main` at `SHA:d41c4b3e`. **Yardstick:** [the specification](../../docs/SPECIFICATION.md),
draft 0.4.0, and [the course](../plans/active/castr-course.md).

**What this report is.** An analysis for the owner's re-assessment of the course. It moves,
edits, archives and schedules nothing, and asks the owner for nothing.

**Evidence bound.** Every plan file, thread record and register named in Appendix A was read by
this session or its read-only inventory passes, and the load-bearing claims were re-opened
first-hand (§5). Measurements of the Oak API specification and the consumer are carried forward
from [the review record](../research/castr-specification-review-2026-09-21.md), which says they
were not re-verified; this session could not re-measure them either, because the Oak document is
not in this repository. No product code was run. The statement in §2 (MEASURE) about a
whole-document run is a reading of the parser, not a measurement.

## 1. The answer

**Castr has one live lane: the course.** Every other lane is dormant, stopped or done. On
24 September 2026 there were no open pull requests, all three Castr Routines were disabled, and
no agent held a claim. The correction thread carries the course, and its next leg is RATIFY.

The register (Appendix A) has 202 rows: 17 lanes, 124 plan rows covering all 137 plan Markdown
files (the 14 template files share one row), 35 proof-programme queue rows, 18 tranche rows,
3 registers and 5 plan-shaped research files. Primary category by the course leg that would
use each row (unit: rows; computed in Appendix B):

| Primary | RATIFY | MEASURE | MOVE | PLOT | none | Total |
| ------- | ------ | ------- | ---- | ---- | ---- | ----- |
| A       | 3      | 5       | 2    | 21   | 1    | 32    |
| B       | 0      | 1       | 0    | 1    | 40   | 42    |
| C       | 0      | 0       | 4    | 0    | 0    | 4     |
| D       | 6      | 0       | 13   | 0    | 105  | 124   |
| Total   | 9      | 6       | 19   | 22   | 146  | 202   |

A row can also carry a secondary category: C is the primary category of 4 rows and
the secondary category of 20 more.

1. **A: the fundamental issues now have one owner, the specification and the course.** No
   dormant plan fixes them. What the estate still offers them is design input and evidence for
   MEASURE and PLOT (§2). Rows whose substance the specification already carries, or rules out,
   are D, with the clause named; the proof programme's obligation inventory, harness,
   certification and fidelity tranches are among them.

   The sharpest A finding is the history of the unknown-key doctrine. Completed plans narrowed
   it from four modes (9 March 2026) to reject or strip (12 March) to strict only (21 March), and
   two more built on strict only: boolean-only `additionalProperties` (24 March) and a real
   document rejected for its schema-valued `additionalProperties` (16 April). That rejection
   triggered a re-widening the same day: accept and emit explicit `additionalProperties`, never
   invent them (`.agent/IDENTITY.md:3-9`). SPEC-P-1 goes further, with four policies and a
   silent object read as closed. Today's parser still implements the 21 March doctrine.

2. **B: the implementation work is frozen, and its value is conditional.** The standing ruling
   puts nothing more into the present writer code unless it blocks a landing. The defect maps
   feed MEASURE either way. If MEASURE says evolve, the B rows are work again; if it says
   rebuild, the maps are all that survives.
3. **C: outside the course, little of the estate prepares the move.** The course's legs already
   name what MOVE needs. §2 lists the facts the estate adds, among them that no check here
   polices dependencies between workspaces.
4. **D: most of the estate serves none of the three.** 19 rows still declare live
   authority they no longer have (§3). MOVE archives this repository, so D needs no per-item
   work; what D rows hold that must travel is listed under MOVE in §2.

### Asked of the owner

Nothing. This report adds no entry to the ratification walk and disposes of nothing. Where it
reached a verdict itself, the verdict is stated (§3, §4); tell the author which is wrong.

Everything below is reference.

## 2. By course leg

### RATIFY

No estate item asks for a clause to change. What the estate holds is work the specification
overrules, which is the cost a decision card can state:

- **SPEC-P-1.** Confirming it finishes overturning two completed plans (PK-29, PK-32), already
  overturned in doctrine on 16 April 2026, and the present parser's rejection of schema-valued
  `additionalProperties`, which the Oak document uses twice. PK-47 is superseded by its own
  banner.
- **SPEC-G-4 and SPEC-G-7.** Confirming them rules out the estate's proof methods that compare
  Castr with itself or with another library:
  - the round-trip harness (PP-2);
  - the vendor oracle without a source leg (Q-24);
  - the `z.toJSONSchema` differential (Q-27);
  - the round-trip steps in RS-1.
- **SPEC-AR-6 and SPEC-N-3.** The estate argues for static-only Zod reading (PK-4; PC-2, whose
  TS-3 is Q-26; PF-2; RS-4). SPEC-AR-6 lets Castr import the operator's module and requires the
  call that reads a `z.lazy`, a getter or a default's value; the technique stays open under
  SPEC-N-3.
- **SPEC-CC-3.** It requires a check that the specification matches its approved record. None
  exists in `.github/`, `agent-tools/` or the root scripts, so the landing that sets the status to
  `ratified` has no check behind it.

The napkin's proposal to ratify first what SPEC-C-1 needs (its 23 September entry, "The review
loop grew the owner's decision load") has this estate evidence behind it. The Oak document
exercises SPEC-P-1 (253 closed objects, 2 constrained, 17 silent), SPEC-PR-7 (8 `allOf` sites
that accept no value), SPEC-P-3 (`format: uri`, 4 uses) and the reading of a source `default`
(14 uses) (`.agent/research/castr-specification-review-2026-09-21.md:28-50`).

### MEASURE

- **The corpus.** The course measures "on the pinned Oak corpus"
  (`.agent/plans/active/castr-course.md:22-25`), which is not yet in this repository.
  `lib/tests-transforms/__fixtures__/arbitrary/oak-api.json` is a different, older document:
  26 paths and 24 schemas, against the corpus's 34 and 33.
- **The parser stops the whole document.** `buildIR` builds components, then operations, and
  returns no partial document (`lib/src/schema-processing/parsers/openapi/index.ts:114-135`). A
  schema-valued `additionalProperties` throws
  (`lib/src/schema-processing/parsers/openapi/builder/builder.additional-properties.ts:22-34`).
  Oak's two such sites sit in the `check-restricted` 200 responses. A whole-document run would
  therefore end in `rejects` before anything is scored, so MEASURE's construct-by-outcome table
  needs constructs scored one at a time.
- **The oracle.** Q-02's runner has a source-oracle leg, which Q-04 uses with Ajv against the
  source schema (`lib/tests-transforms/__tests__/nested-boolean-schema.integration.test.ts:78`,
  `:180`). It lacks the generated-Zod leg, `format` assertion (formats are off) and SPEC-G-5
  sampling. Q-24's method has no source leg.

The defect knowledge on the corpus is RM-2's file:line map and PP-2's findings, limited to the
constructs Oak uses:

- **On the corpus:** closed, constrained and silent objects; `propertyNames` (PK-37); `allOf`;
  `default`; `format: uri`; status codes 200, 400, 401 and 404.
- **Off the corpus:** wildcard status ranges, conditional keywords, `contentEncoding` (Q-28),
  security algebra (Q-03), and everything about reading Zod.

### MOVE

The course's what-travels list (`.agent/plans/active/castr-course.md:97-104`) names the
specification, the course, the review record, the engineering doctrine Castr needs that OCE
lacks, and the product code only on an evolve verdict. The estate adds:

- **Castr engineering doctrine:**
  - ADR-026 and its ESLint enforcement (PK-2, PK-3);
  - one TypeScript version at the workspace root, without which the sonarjs rules misfire (PT-7);
  - ADR-043's core and companion boundary, as SPEC-N-2 input (PK-20);
  - the schema-domain reviewers (PT-11, PT-13).
- **Documents to correct once, in the new repository**, by the owner's ruling
  (`.agent/research/castr-specification-review-2026-09-21.md:123-139`). Q-08, Q-14 and the
  overhaul plan's W3 (PF-8) aimed at the same files here; that work in this repository is D.
- **Facts MOVE meets:**
  - **Checks.** SPEC-G-3 defines Castr's checks as the continuous-integration job list and the
    scripts it calls. Today that list includes the Practice gates
    (`.github/workflows/ci.yml:119-127`, `:243-246`), and MOVE changes the list.
  - **Boundaries.** MOVE's acceptance requires the boundary rule to be enforced by the new
    repository's checks (`.agent/plans/active/castr-course.md:153-154`). No check here polices
    dependencies between workspaces.
  - **Seams.** A rebuild-MOVE creates fresh workspaces, which presumes an answer to the open
    SPEC-N-2.
  - **History.** The home-directory paths in archived napkins (PC-1) travel only if the code
    travels with its history.

### PLOT

Design inputs, by open question:

| Open question                       | Estate input                                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPEC-N-1 model structure            | T-02B, T-02C and T-03 (value and interaction roots; accepted and produced facets; wire identity); PK-17 (references carried as keyword strings, which SPEC-AR-1 overrules); PK-30, PK-34 and PK-39 (keywords and Scalar OpenAPI types as model structure); RG-2 (persistence versioning); PP-2 (flat security) |
| SPEC-N-2 seams                      | PK-20 (ADR-043, which hands the compiler split to ADR-048); PF-2 (verb and surface architecture); RS-4 (atomisation gate); RS-2 treats the boundary as settled                                                                                                                                                 |
| SPEC-N-3 Zod reading                | PK-4 (ts-morph reading); PC-2 (probes and the static-only argument); PK-47 and PK-51 (measured Zod runtime facts)                                                                                                                                                                                              |
| SPEC-N-4 public surface             | PF-2, RS-4, T-04                                                                                                                                                                                                                                                                                               |
| SPEC-N-5 scope-and-fidelity tables  | PF-4 (the consumer's assumptions); RM-3 (per-keyword Zod dispositions); T-11 (directed pairs); PF-1 (precedent for SPEC-PR-6's count); RS-4 (a taxonomy that differs from the specification's classes)                                                                                                         |
| Proof standard (SPEC-G-5, SPEC-G-7) | Q-02 (mutant-bite runner with a source-oracle leg); PK-44 (proof honesty); PK-18 (gates green while the fidelity suite was red)                                                                                                                                                                                |

## 3. Lifecycle drift

Rows whose declared status claims live authority that the evidence does not support (computed
in Appendix B):

| Row   | Item                                                                           | Declared                      | Actual     |
| ----- | ------------------------------------------------------------------------------ | ----------------------------- | ---------- |
| LN-2  | Proof programme thread (`proof-programme.next-session.md`)                     | active                        | dormant    |
| LN-3  | Consolidation Routine and Watcher thread                                       | Routine ENABLED               | stopped    |
| LN-6  | Practice transplant thread                                                     | STOPPED; inner lanes "ACTIVE" | stopped    |
| PA-3  | `.agent/plans/active/proof-programme-loop-review.md`                           | active                        | done       |
| PC-1  | `.agent/plans/current/archive-pii-scrub.md`                                    | active                        | dormant    |
| PC-2  | `.agent/plans/current/zod-truth-surface-and-dependency-currency.md`            | current                       | dormant    |
| PG-1  | `.agent/plans/proof-programme/parent-plan.md`                                  | live                          | dormant    |
| Q-34  | Q-34 inherited PR and orphaned-work end states                                 | in_progress                   | superseded |
| PT-9  | `.agent/plans/transplant/first-run-friction-inventory.md`                      | open worklist                 | stopped    |
| PT-13 | `.agent/plans/transplant/oak-castr-gap-rescan-2026-06-28.md`                   | current                       | stopped    |
| PT-14 | `.agent/plans/transplant/oak-parity-program.md`                                | active                        | stopped    |
| PT-15 | `.agent/plans/transplant/practice-loop-closure-remediation.md`                 | current                       | stopped    |
| PT-16 | `.agent/plans/transplant/reason-skill-parity-bring.md`                         | current                       | done       |
| PT-19 | `.agent/plans/transplant/statusline-logo-bring-manifests-2026-07-03.md`        | current                       | stopped    |
| PT-20 | `.agent/plans/transplant/transplant-completeness-supporting-infrastructure.md` | current                       | stopped    |
| PK-13 | `.agent/plans/current/complete/3.3b-04-format-parity-hostname-float.md`        | active                        | unverified |
| PK-41 | `.agent/plans/current/complete/practice-equality-identity-and-cognition.md`    | current                       | done       |
| PX-7  | `.agent/plans/archive/phase-1-completion-plan.md`                              | in progress                   | historical |
| PX-16 | `.agent/plans/archive/zod4-ir-improvements-plan-3.1b-complete.md`              | in progress                   | historical |

`.agent/plans/delivery-ledger.md` (PO-2) has no status line, but its rows at `:207-219` show the
pull requests reopened on 20 September as "Open"; all were closed on 21 September. Two archived
plans (PX-1, PX-11) are still cited as authority by the parent plan, the ledger and Q-34.

**Verdict: no action.** MOVE archives this repository; until then this table is the list.

## 4. Estate-held obligations the specification does not state

| Obligation                                                | Where                                                                              | Verdict                                                                                                                                                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod input `>=4.5 <5`, output the latest 4.x               | `.agent/plans/current/zod-truth-surface-and-dependency-currency.md:266-274`        | No card. SPEC-C-1's acceptance in the consumer's workspaces binds the output side; the input bound concerns reading Zod, which is SPEC-C-2; the ruling's premise, no external consumers, no longer holds |
| QD-12: the OpenAPI writer refuses boolean schemas         | `.agent/plans/proof-programme/queued-decisions.md:29`                              | Subsumed. OpenAPI 3.2 can state a boolean schema, so under the Definitions the refusal is `NOT-YET-BUILT`, never `UNEXPRESSIBLE`, and SPEC-PR-6 counts it                                                |
| Q-017: OpenAPI 3.0 `enum: [null]` without `nullable`      | `.agent/memory/operational/open-questions.md:65`                                   | Subsumed by the Profile's rule that the source's specification governs, and by SPEC-PR-7; OpenAPI 3.0 only, so SPEC-C-1 does not depend on it                                                            |
| QD-9: model persistence versioning                        | `.agent/plans/proof-programme/queued-decisions.md:25`                              | Input to SPEC-N-1; moot if the model is replaced                                                                                                                                                         |
| External-reference I/O policy                             | `.agent/plans/roadmap.md:42-50`                                                    | No SPEC-C-1 dependency: the review record counts all 129 of Oak's `$ref` as local (carried forward, not re-measured)                                                                                     |
| Hostile-input containment (T-10)                          | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1703` | No SPEC-C-1 dependency: the corpus is the consumer's own document                                                                                                                                        |
| Q-018, Q-019: Codex permissions and worktree installation | `.agent/memory/operational/open-questions.md:91-123`                               | Practice only                                                                                                                                                                                            |
| QD-14: non-code slices and red-first                      | `.agent/plans/proof-programme/queued-decisions.md:31`                              | Paused with the programme; the course's "test and cure land together" covers product work                                                                                                                |

## 5. Method

**Populations.**

- Lanes: the six thread records under `.agent/memory/operational/threads/`, the course's five
  legs, and platform state read on 24 September 2026.
- Every file matched by `find .agent/plans -name '*.md'` (137). The six CSV and JSON files in
  `.agent/plans/correction-manifests/` are evidence data for the archived correction plan, not
  plans.
- The 35 queue rows in `parent-plan.md`'s frontmatter, and the 18 tranche identifiers in the
  programme report's `TrancheId` union
  (`.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:393-411`).
- The open-questions and pending-graduations registers and the napkin, and the five plan-shaped
  files under `.agent/research/`. `.agent/memory/operational/tracks/` holds only its README.

**Category tests.** Each row has one primary category, by its substance, and at most one
secondary:

- **A:** its substance is the specification, the model design (SPEC-N-1 to SPEC-N-5), the proof
  standard, or evidence for MEASURE's evolve-or-rebuild verdict.
- **B:** its substance is work on the present product code: fixing, testing or hardening it.
- **C:** it is needed by MOVE's acceptance or its what-travels list.
- **D:** none of these now. This includes substance the specification already carries
  (`subsumed`) and substance it rules out.

**Markers.**

- **Declared** is read from each file's own status line. **Actual** is one of `live`,
  `dormant`, `stopped`, `done`, `reversed` (a completed plan whose conclusion the specification
  overturns), `superseded`, `historical`, `reference`, `unverified` or `none`.
- **Relation to the specification** names the clause, or the section heading where no clause
  exists. Where a plan's goal, method and findings differ, the relation is given per facet:
  `supports`, `subsumed by`, `contradicts`, `pre-empts` (settles an open SPEC-N question),
  `excluded`, `later`, or `silent`.
- **Leg** is the course leg that would use the row, for either of its categories, or `none`.

**Independence.** Read-only inventory passes, one independent design pass, and a Cricket panel
of eight returns contributed. All eight Cricket returns were ON-TRACK in both stances, and their
redirections were adopted: §1 stands alone, the asks are a closed list, findings were held as
hypotheses until the register confirmed them, and reviewers were told that deleting text beats
adding it. Every agent runs on one model family, so their agreement is dependent evidence.

**Conserve by default.** A D row is not a discard. This report disposes of nothing; the owner
decides every disposition.

### Review

Three reviewers read the draft: `assumptions-expert`, `docs-adr-expert` and
`architecture-expert-fred`. Each finding was checked against the cited files before it was
taken. Taken:

- Both owner asks were dropped. The Zod range is bound by SPEC-C-1's acceptance and its premise
  has lapsed; the drift now carries a verdict.
- The unknown-key history now includes the 16 April re-widening. PK-26 supports SPEC-P-1, PK-47
  is superseded by its own banner, and PK-45's writing is marked as contradicting SPEC-P-1.
- Rows whose substance the specification carries became D, and the category tests now classify
  by substance, with the secondary category and the leg carrying the rest.
- ADR-036 was corrected to ADR-037, and the boundary finding was narrowed to the fact MOVE
  needs.
- The MEASURE oracle statement was corrected (Q-02's runner has a source leg), and the
  whole-document statement was re-anchored on the parser code.
- The specification is cited by clause or section heading, never by section number. The
  remediation rows were renamed RM-n so they no longer collide with SPEC-PR-n.
- Evidence pointers were corrected for PK-17, PK-26, PK-30, PK-32, PK-37, PO-2 and RS-4.
- A confirmation pass by `assumptions-expert` and `architecture-expert-fred` found every finding
  cured and three cell-level regressions, also cured: PK-29 and PK-32 to D, and PK-45's leg to
  `none`.

Not taken:

- Deleting §3, §4 and the §1 matrix. §3 is the only list of rows that claim authority they lack,
  §4 records that each estate-held ruling was checked, and the matrix is the one-screen count the
  commission asks for. All three sit outside the owner-facing part or are the answer itself.
- Making PP-2 and RM-3 primary A. Their substance is work on the present code; their secondary
  category and leg carry the evidence they hold.
- Adding ADR-040 to the SPEC-P-1 card's cost. It is an addition not needed for correctness.

## Appendix A. The register

<!-- register:start -->

### Lanes: threads

| ID   | Item                                                         | Declared                       | Actual  | Primary | Secondary | Relation to the specification                                                | Leg    | Evidence                                                                                                                                         |
| ---- | ------------------------------------------------------------ | ------------------------------ | ------- | ------- | --------- | ---------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| LN-1 | Castr correction thread (`castr-correction.next-session.md`) | active                         | live    | A       | C         | carries the course; route to RATIFY                                          | RATIFY | `.agent/memory/operational/repo-continuity.md:20`                                                                                                |
| LN-2 | Proof programme thread (`proof-programme.next-session.md`)   | active                         | dormant | D       | —         | execution paused; authority subsumed by the course                           | none   | `.agent/memory/operational/threads/proof-programme.next-session.md:5-9`                                                                          |
| LN-3 | Consolidation Routine and Watcher thread                     | Routine ENABLED                | stopped | D       | —         | silent                                                                       | none   | `.agent/memory/operational/threads/consolidation-routine-and-watcher.next-session.md:24`; platform: Routine disabled, last run failed 2026-08-27 |
| LN-4 | Initial Castr review thread                                  | review complete; W1–W5 pending | dormant | D       | C         | destination statement superseded by the specification; W3 contradiction list | MOVE   | `.agent/memory/operational/threads/initial-castr-review.next-session.md:23-28`                                                                   |
| LN-5 | Proof-programme loop review thread                           | executed                       | done    | D       | —         | silent                                                                       | none   | `.agent/memory/operational/threads/proof-programme-review.next-session.md:13-27`                                                                 |
| LN-6 | Practice transplant thread                                   | STOPPED; inner lanes "ACTIVE"  | stopped | D       | —         | silent                                                                       | none   | `.agent/memory/operational/threads/practice-transplant.next-session.md:3-6`, `:130`, `:155`                                                      |

### Lanes: course legs

| ID   | Item                                                       | Declared | Actual | Primary | Secondary | Relation to the specification                                                     | Leg     | Evidence                                    |
| ---- | ---------------------------------------------------------- | -------- | ------ | ------- | --------- | --------------------------------------------------------------------------------- | ------- | ------------------------------------------- |
| CL-1 | ALERTS — dependency alerts on `main` to zero               | done     | done   | B       | —         | supports G-1                                                                      | none    | `.agent/plans/active/castr-course.md:14-17` |
| CL-2 | RATIFY — owner ratifies the specification                  | pending  | live   | A       | C         | ratification fixes the destination (CC-1, CC-2); the specification travels (Home) | RATIFY  | `.agent/plans/active/castr-course.md:18-21` |
| CL-3 | MEASURE — score today's generator on the pinned Oak corpus | pending  | live   | A       | C         | C-1 corpus; G-4 and G-7 method; verdict decides what MOVE carries                 | MEASURE | `.agent/plans/active/castr-course.md:22-25` |
| CL-4 | MOVE — Castr into OCE as workspaces                        | pending  | live   | C       | —         | Home                                                                              | MOVE    | `.agent/plans/active/castr-course.md:26-29` |
| CL-5 | PLOT — legs to SPEC-C-1 from MEASURE and the model design  | pending  | live   | A       | —         | N-1 to N-5, AR-2                                                                  | PLOT    | `.agent/plans/active/castr-course.md:30-33` |

### Lanes: platform state

| ID   | Item                                                       | Declared               | Actual     | Primary | Secondary | Relation to the specification                       | Leg  | Evidence                                                                      |
| ---- | ---------------------------------------------------------- | ---------------------- | ---------- | ------- | --------- | --------------------------------------------------- | ---- | ----------------------------------------------------------------------------- |
| PS-1 | Open pull requests                                         | none                   | none       | D       | —         | silent                                              | none | GitHub, 2026-09-24: 0 open                                                    |
| PS-2 | 23 remote branches besides `main`                          | written off 2026-09-21 | historical | D       | —         | silent                                              | none | GitHub branch list, 2026-09-24; `.agent/plans/active/castr-course.md:127-132` |
| PS-3 | Routine "Castr proof-programme (ADR-051)"                  | paused                 | stopped    | D       | —         | silent                                              | none | platform: disabled; last run 2026-08-26                                       |
| PS-4 | Routine "Castr Dedicated consolidation — every three days" | disabled (platform)    | stopped    | D       | —         | silent; the thread record (LN-3) still says ENABLED | none | platform: disabled; last run failed 2026-08-27                                |
| PS-5 | Routine "Castr Adversarial PR Evaluation"                  | none                   | stopped    | D       | —         | silent                                              | none | platform: disabled; last run 2026-08-27                                       |
| PS-6 | Routine "OCE fork sync watch → Slack" (not a Castr lane)   | enabled                | live       | D       | —         | silent; an OCE fork watch, not a Castr lane         | none | platform: enabled, four runs each weekday                                     |

### Plans: active

| ID   | Item                                                 | Declared | Actual    | Primary | Secondary | Relation to the specification   | Leg    | Evidence                                               |
| ---- | ---------------------------------------------------- | -------- | --------- | ------- | --------- | ------------------------------- | ------ | ------------------------------------------------------ |
| PA-1 | `.agent/plans/active/README.md`                      | guide    | reference | D       | —         | silent                          | none   | `.agent/plans/active/README.md:4`                      |
| PA-2 | `.agent/plans/active/castr-course.md`                | active   | live      | A       | C         | the course to the specification | RATIFY | `.agent/plans/active/castr-course.md:1-34`             |
| PA-3 | `.agent/plans/active/proof-programme-loop-review.md` | active   | done      | D       | —         | silent; all six todos completed | none   | `.agent/plans/active/proof-programme-loop-review.md:3` |

### Plans: current

| ID   | Item                                                                | Declared | Actual  | Primary | Secondary | Relation to the specification                                                                                      | Leg  | Evidence                                                                    |
| ---- | ------------------------------------------------------------------- | -------- | ------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------- |
| PC-1 | `.agent/plans/current/archive-pii-scrub.md`                         | active   | dormant | D       | C         | silent; matters only if code travels with its history                                                              | MOVE | `.agent/plans/current/archive-pii-scrub.md:3`                               |
| PC-2 | `.agent/plans/current/zod-truth-surface-and-dependency-currency.md` | current  | dormant | A       | B         | findings support G-7 (`:95-99`); TS-1b (Q-27) contradicts G-7; TS-3 (Q-26) pre-empts N-3 against AR-6 (`:373-377`) | PLOT | `.agent/plans/current/zod-truth-surface-and-dependency-currency.md:299-307` |

### Plans: paused

| ID   | Item                                                                    | Declared | Actual    | Primary | Secondary | Relation to the specification                                                                                                               | Leg     | Evidence                                                                      |
| ---- | ----------------------------------------------------------------------- | -------- | --------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| PP-1 | `.agent/plans/current/paused/README.md`                                 | guide    | reference | D       | —         | silent                                                                                                                                      | none    | `.agent/plans/current/paused/README.md:4`                                     |
| PP-2 | `.agent/plans/current/paused/02-ir-fidelity-proof-harness.md`           | backlog  | dormant   | B       | A         | findings: C3 → PR-3, C2 → N-1; method (round-trip IR equality) contradicts G-7                                                              | MEASURE | `.agent/plans/current/paused/02-ir-fidelity-proof-harness.md:62`, `:83`       |
| PP-3 | `.agent/plans/current/paused/explicit-additional-properties-support.md` | paused   | dormant   | A       | B         | goal (carry explicit and schema-valued policies) supports P-1; its "never invent" rule conflicts with P-1 reading a silent object as closed | MEASURE | `.agent/plans/current/paused/explicit-additional-properties-support.md:29-41` |
| PP-4 | `.agent/plans/current/paused/oak-practice-transplant.md`                | stopped  | stopped   | D       | —         | silent; its "castr emits MCP tools" contradicts Not part of Castr for now                                                                   | none    | `.agent/plans/current/paused/oak-practice-transplant.md:18`                   |
| PP-5 | `.agent/plans/current/paused/practice-equality-parity-follow-up.md`     | paused   | dormant   | D       | C         | silent; HO-1 notes on running OCE's gates in a container                                                                                    | MOVE    | `.agent/plans/current/paused/practice-equality-parity-follow-up.md:39-52`     |

### Plans: future

| ID   | Item                                                                   | Declared        | Actual     | Primary | Secondary | Relation to the specification                                                                                        | Leg  | Evidence                                                                   |
| ---- | ---------------------------------------------------------------------- | --------------- | ---------- | ------- | --------- | -------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| PF-1 | `.agent/plans/future/castr-check-verb.md`                              | planned         | dormant    | A       | —         | idea precedes PR-6's count; `normalised`/`widened` classes contradict PR-2; percentage threshold contradicts PR-6    | PLOT | `.agent/plans/future/castr-check-verb.md:3`                                |
| PF-2 | `.agent/plans/future/castr-surface-architecture-and-verb-model.md`     | planned         | dormant    | A       | —         | design input for N-2, N-4, AR-5; static-only Zod contradicts AR-6; `mcp` target excluded (Not part of Castr for now) | PLOT | `.agent/plans/future/castr-surface-architecture-and-verb-model.md:134-135` |
| PF-3 | `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`   | planned         | dormant    | D       | —         | silent                                                                                                               | none | `.agent/plans/future/gemini-antigravity-agentic-platform-support.md:3`     |
| PF-4 | `.agent/plans/future/oak-adapter-boundary-replacement.md`              | planned         | dormant    | A       | C         | subsumed by C-1; its assumptions are N-5 profile questions                                                           | PLOT | `.agent/plans/future/oak-adapter-boundary-replacement.md:55-58`            |
| PF-5 | `.agent/plans/future/oak-code-first-openapi-generation-replacement.md` | planned         | dormant    | D       | —         | later (Capabilities: Later) (ingest needs change control)                                                            | none | `.agent/plans/future/oak-code-first-openapi-generation-replacement.md:3`   |
| PF-6 | `.agent/plans/future/oak-wider-openapi-stack-replacement.md`           | planned         | superseded | D       | —         | subsumed by C-1 (`openapi-typescript`); REST client excluded (Not part of Castr for now)                             | none | `.agent/plans/future/oak-wider-openapi-stack-replacement.md:3`             |
| PF-7 | `.agent/plans/future/phase-5-ecosystem-expansion.md`                   | planned         | dormant    | D       | —         | excluded (Not part of Castr for now) or later (Capabilities: Later)                                                  | none | `.agent/plans/future/phase-5-ecosystem-expansion.md:3`                     |
| PF-8 | `.agent/plans/future/strategy-vision-estate-overhaul.md`               | strategic brief | dormant    | D       | C         | destination statement superseded by the specification; W3 contradiction list; holds the Q-012 to Q-015 verdicts      | MOVE | `.agent/plans/future/strategy-vision-estate-overhaul.md:1-12`              |
| PF-9 | `.agent/plans/future/temporal-first-js-ts-date-time-doctrine.md`       | planned         | superseded | D       | —         | settled by P-5 and Not part of Castr for now                                                                         | none | `.agent/plans/future/temporal-first-js-ts-date-time-doctrine.md:3`         |

### Plans: remediation

| ID   | Item                                                           | Declared | Actual    | Primary | Secondary | Relation to the specification                                                                             | Leg     | Evidence                                                             |
| ---- | -------------------------------------------------------------- | -------- | --------- | ------- | --------- | --------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| RM-1 | `.agent/plans/remediation/README.md`                           | none     | dormant   | D       | —         | silent; indexes 01–07, of which 01 and 02 are gone                                                        | none    | `.agent/plans/remediation/README.md:1`                               |
| RM-2 | `.agent/plans/remediation/02-preflight-scouting-2026-07-06.md` | none     | reference | A       | B         | a file:line map of present defects, evidence for MEASURE: C2 seams → N-1, C3 sanitiser → PR-3, M10 → PR-2 | MEASURE | `.agent/plans/remediation/02-preflight-scouting-2026-07-06.md:48-63` |
| RM-3 | `.agent/plans/remediation/03-zod-2020-12-keyword-semantics.md` | backlog  | dormant   | B       | A         | pre-empts N-5 (per-keyword Zod dispositions); writer work under the freeze                                | PLOT    | `.agent/plans/remediation/03-zod-2020-12-keyword-semantics.md:3`     |
| RM-4 | `.agent/plans/remediation/04-zod-parser-strict-whitelist.md`   | backlog  | dormant   | B       | —         | agrees with P-2 and Appendix A; Zod reading is C-2 scope; N-3 open                                        | none    | `.agent/plans/remediation/04-zod-parser-strict-whitelist.md:3`       |
| RM-5 | `.agent/plans/remediation/05-single-source-type-guards.md`     | backlog  | dormant   | B       | —         | AR-7 hygiene                                                                                              | none    | `.agent/plans/remediation/05-single-source-type-guards.md:3`         |
| RM-6 | `.agent/plans/remediation/06-doctrine-enforcement-truthing.md` | backlog  | dormant   | B       | A         | M2 → AR-3; ungoverned suppressions → G-3; the `principles.md` rewrite belongs to MOVE                     | none    | `.agent/plans/remediation/06-doctrine-enforcement-truthing.md:3`     |
| RM-7 | `.agent/plans/remediation/07-test-hygiene.md`                  | backlog  | dormant   | B       | —         | AR-7 hygiene                                                                                              | none    | `.agent/plans/remediation/07-test-hygiene.md:3`                      |

### Plans: proof programme

| ID   | Item                                                          | Declared | Actual     | Primary | Secondary | Relation to the specification                                                                          | Leg  | Evidence                                                        |
| ---- | ------------------------------------------------------------- | -------- | ---------- | ------- | --------- | ------------------------------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------- |
| PG-1 | `.agent/plans/proof-programme/parent-plan.md`                 | live     | dormant    | D       | A         | execution paused; its A content subsumed by G-1 to G-7, AR-1 to AR-5, N-1 to N-5                       | none | `.agent/plans/proof-programme/parent-plan.md:135`, `:170-178`   |
| PG-2 | `.agent/plans/proof-programme/ballot-2026-08-owner-walk.md`   | closed   | historical | D       | —         | B-01 charter superseded by the specification                                                           | none | `.agent/plans/proof-programme/ballot-2026-08-owner-walk.md:3`   |
| PG-3 | `.agent/plans/proof-programme/incidents.md`                   | none     | historical | D       | —         | silent                                                                                                 | none | `.agent/plans/proof-programme/incidents.md:30-66`               |
| PG-4 | `.agent/plans/proof-programme/loop-test-kingfisher-report.md` | none     | historical | D       | —         | silent                                                                                                 | none | `.agent/plans/proof-programme/loop-test-kingfisher-report.md:1` |
| PG-5 | `.agent/plans/proof-programme/queued-decisions.md`            | none     | reference  | D       | —         | QD-12 subsumed by the Definitions' `UNEXPRESSIBLE`; QD-9 is N-1 input; QD-14 paused with the programme | none | `.agent/plans/proof-programme/queued-decisions.md:17-31`        |
| PG-6 | `.agent/plans/proof-programme/routine-prompt.md`              | none     | dormant    | D       | —         | silent                                                                                                 | none | `.agent/plans/proof-programme/routine-prompt.md:9-23`           |

### Proof-programme queue rows

| ID   | Item                                               | Declared    | Actual     | Primary | Secondary | Relation to the specification                                                     | Leg    | Evidence                                                                    |
| ---- | -------------------------------------------------- | ----------- | ---------- | ------- | --------- | --------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| Q-00 | Q-00 W-0 owner walk                                | completed   | historical | D       | —         | charter superseded by the specification                                           | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-01 | Q-01 loop readiness                                | completed   | historical | D       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-02 | Q-02 harness extraction (mutant-bite, non-vacuity) | completed   | done       | A       | B         | supports G-5 and G-7; travels only if MEASURE says evolve                         | PLOT   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-03 | Q-03 security AND→OR                               | completed   | done       | B       | —         | off the C-1 corpus (Oak applies one scheme to every operation)                    | none   | `.agent/research/castr-specification-review-2026-09-21.md:33`               |
| Q-04 | Q-04 nested booleans                               | completed   | done       | B       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-05 | Q-05 placebo refinements and nested Zod loss       | pending     | dormant    | B       | —         | writer freeze; C-2 scope                                                          | none   | `.agent/plans/active/castr-course.md:80-82`                                 |
| Q-06 | Q-06 #14 Draft-04 dependency                       | completed   | done       | B       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-07 | Q-07 hygiene-gate gap (#21)                        | pending     | dormant    | B       | —         | stranded: #21 written off                                                         | none   | `.agent/plans/active/castr-course.md:127-132`                               |
| Q-08 | Q-08 ADR estate integrity                          | pending     | dormant    | D       | C         | owner ruling: contradicting documents are corrected once in the new repository    | MOVE   | `.agent/research/castr-specification-review-2026-09-21.md:138-139`          |
| Q-09 | Q-09 PR closure wave 1                             | completed   | historical | D       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-10 | Q-10 Tranche 00 obligation inventory               | pending     | dormant    | D       | —         | subsumed by PR-6 and N-5                                                          | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-11 | Q-11 Tranche 01 full harness                       | pending     | dormant    | D       | —         | subsumed by G-4 to G-7                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-12 | Q-12 tranche tail 02A–14 and PR extraction         | pending     | dormant    | D       | —         | subsumed by the specification; PR extraction contradicts the 2026-09-21 write-off | none   | `.agent/plans/proof-programme/parent-plan.md:1028`                          |
| Q-13 | Q-13 PR #23 end state                              | pending     | superseded | D       | —         | moot: #23 closed 2026-09-21                                                       | none   | `.agent/plans/active/castr-course.md:127-132`                               |
| Q-14 | Q-14 doctrine amendment wave                       | pending     | dormant    | D       | C         | the same files MOVE rewrites, aimed at a superseded charter                       | MOVE   | `.agent/plans/active/castr-course.md:100-104`                               |
| Q-15 | Q-15 fresh-container full-chain readiness          | pending     | dormant    | D       | —         | `.agent` machinery, a course non-goal                                             | none   | `.agent/plans/active/castr-course.md:158-161`                               |
| Q-16 | Q-16 plan-architecture repair                      | pending     | dormant    | D       | —         | `.agent` machinery, a course non-goal                                             | none   | `.agent/plans/active/castr-course.md:158-161`                               |
| Q-17 | Q-17 diagnostic-walker hardening                   | pending     | dormant    | B       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-18 | Q-18 predecessor-slot attestation                  | pending     | dormant    | D       | —         | stranded by the pause                                                             | none   | `.agent/plans/proof-programme/parent-plan.md:170-175`                       |
| Q-19 | Q-19 review-round tally                            | completed   | done       | D       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-20 | Q-20 Q-15 brief re-scope                           | pending     | dormant    | D       | —         | stranded by the pause                                                             | none   | `.agent/plans/proof-programme/parent-plan.md:170-175`                       |
| Q-21 | Q-21 merge-authority line                          | completed   | done       | D       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-22 | Q-22 fixture-generator repair                      | pending     | dormant    | B       | A         | a fixture that certifies an older generator is a G-7 defect; evolve only          | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-23 | Q-23 dependency currency (Zod 4.5.4)               | completed   | done       | B       | —         | supports G-1                                                                      | none   | `.agent/plans/current/complete/dependency-currency.md` status               |
| Q-24 | Q-24 Scenario 8 vendor oracle                      | pending     | dormant    | D       | —         | method contradicts G-4 (no source-document leg)                                   | RATIFY | `.agent/plans/current/zod-truth-surface-and-dependency-currency.md:259-265` |
| Q-25 | Q-25 Zod dialect manifest                          | pending     | dormant    | B       | —         | writer freeze; overlaps P-2, Appendix A, N-3                                      | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-26 | Q-26 ADR ratifying static Zod parsing              | pending     | dormant    | D       | —         | pre-empts N-3 against AR-6; the argument lives in PC-2                            | RATIFY | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-27 | Q-27 `z.toJSONSchema` differential                 | pending     | dormant    | D       | —         | contradicts G-7 (another library as oracle)                                       | RATIFY | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-28 | Q-28 base64 writer fidelity                        | pending     | dormant    | B       | —         | writer freeze; off the C-1 corpus (no `contentEncoding` in Oak)                   | none   | `.agent/research/castr-specification-review-2026-09-21.md:30-38`            |
| Q-29 | Q-29 Zod runtime performance guidance              | pending     | dormant    | D       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-30 | Q-30 correction commission                         | superseded  | superseded | D       | —         | superseded by #110 and the course                                                 | none   | `.agent/plans/proof-programme/parent-plan.md:39-41`                         |
| Q-31 | Q-31 merge-driver cure                             | completed   | done       | D       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-32 | Q-32 revised repair plan                           | pending     | superseded | D       | —         | superseded by PLOT                                                                | none   | `.agent/plans/active/castr-course.md:30-33`                                 |
| Q-33 | Q-33 land PRs #101 and #102                        | completed   | done       | D       | —         | silent                                                                            | none   | `.agent/plans/proof-programme/parent-plan.md` frontmatter                   |
| Q-34 | Q-34 inherited PR and orphaned-work end states     | in_progress | superseded | D       | —         | contradicts the 2026-09-21 write-off and the course non-goal                      | none   | `.agent/plans/active/castr-course.md:127-132`, `:158-161`                   |

### Plans: transplant

| ID    | Item                                                                           | Declared      | Actual     | Primary | Secondary | Relation to the specification                                                             | Leg  | Evidence                                                                         |
| ----- | ------------------------------------------------------------------------------ | ------------- | ---------- | ------- | --------- | ----------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| PT-1  | `.agent/plans/transplant/README.md`                                            | none          | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/README.md:24-35`                                        |
| PT-2  | `.agent/plans/transplant/02-agent-tools-build-design.md`                       | design record | done       | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/02-agent-tools-build-design.md:3`                       |
| PT-3  | `.agent/plans/transplant/06-memory-and-generator-consolidation.md`             | authored      | done       | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/06-memory-and-generator-consolidation.md:4`             |
| PT-4  | `.agent/plans/transplant/07-adapters-and-gate-flips.md`                        | complete      | done       | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/07-adapters-and-gate-flips.md:5`                        |
| PT-5  | `.agent/plans/transplant/08-collaboration-active.md`                           | authored      | done       | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/08-collaboration-active.md:4`                           |
| PT-6  | `.agent/plans/transplant/corpus-analysis-suite-bring.md`                       | future        | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/corpus-analysis-suite-bring.md:3`                       |
| PT-7  | `.agent/plans/transplant/d1-sonarjs-findings.md`                               | resolved      | done       | C       | B         | silent; lint correctness needs one TypeScript version at the workspace root               | MOVE | `.agent/plans/transplant/d1-sonarjs-findings.md:12-37`                           |
| PT-8  | `.agent/plans/transplant/dangling-reference-census.md`                         | none          | historical | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/dangling-reference-census.md:1`                         |
| PT-9  | `.agent/plans/transplant/first-run-friction-inventory.md`                      | open worklist | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/first-run-friction-inventory.md:14`                     |
| PT-10 | `.agent/plans/transplant/oak-backflow/castr-feedback-2026-06-10.md`            | none          | stopped    | D       | —         | silent; Practice defects and enhancements for OCE, never delivered                        | none | `.agent/plans/transplant/oak-backflow/castr-feedback-2026-06-10.md:1-5`          |
| PT-11 | `.agent/plans/transplant/oak-backflow/castr-innovations-ledger.md`             | none          | stopped    | D       | C         | silent; inventory of what Castr has that OCE lacks, including the schema-domain reviewers | MOVE | `.agent/plans/transplant/oak-backflow/castr-innovations-ledger.md:16-60`         |
| PT-12 | `.agent/plans/transplant/oak-castr-delta-review-2026-07-03.md`                 | complete      | historical | D       | C         | silent; the last dated Castr↔OCE map                                                      | MOVE | `.agent/plans/transplant/oak-castr-delta-review-2026-07-03.md:3`                 |
| PT-13 | `.agent/plans/transplant/oak-castr-gap-rescan-2026-06-28.md`                   | current       | stopped    | D       | C         | silent; its `castr_extras` list names Castr-only doctrine                                 | MOVE | `.agent/plans/transplant/oak-castr-gap-rescan-2026-06-28.md:301-312`             |
| PT-14 | `.agent/plans/transplant/oak-parity-program.md`                                | active        | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/oak-parity-program.md:3`                                |
| PT-15 | `.agent/plans/transplant/practice-loop-closure-remediation.md`                 | current       | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/practice-loop-closure-remediation.md:3`                 |
| PT-16 | `.agent/plans/transplant/reason-skill-parity-bring.md`                         | current       | done       | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/reason-skill-parity-bring.md:3`                         |
| PT-17 | `.agent/plans/transplant/reference-closure.md`                                 | none          | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/reference-closure.md:8`                                 |
| PT-18 | `.agent/plans/transplant/relevance-ledger.md`                                  | seeded        | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/relevance-ledger.md:3`                                  |
| PT-19 | `.agent/plans/transplant/statusline-logo-bring-manifests-2026-07-03.md`        | current       | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/statusline-logo-bring-manifests-2026-07-03.md:3`        |
| PT-20 | `.agent/plans/transplant/transplant-completeness-supporting-infrastructure.md` | current       | stopped    | D       | —         | silent                                                                                    | none | `.agent/plans/transplant/transplant-completeness-supporting-infrastructure.md:3` |

### Plans: complete

| ID    | Item                                                                                                   | Declared    | Actual     | Primary | Secondary | Relation to the specification                                                                                                    | Leg     | Evidence                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------ | ----------- | ---------- | ------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| PK-1  | `.agent/plans/current/complete/01-packaging-and-types-integrity.md`                                    | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/01-packaging-and-types-integrity.md:3`                                    |
| PK-2  | `.agent/plans/current/complete/3.3a-01-adr026-scope.md`                                                | complete    | done       | A       | C         | anticipates AR-3 on the reading side only; ADR-026 is doctrine that travels                                                      | MOVE    | `.agent/plans/current/complete/3.3a-01-adr026-scope.md:3`                                                |
| PK-3  | `.agent/plans/current/complete/3.3a-02-eslint-enforcement-redesign.md`                                 | complete    | done       | C       | A         | ESLint enforcement of ADR-026 travels with the doctrine                                                                          | MOVE    | `.agent/plans/current/complete/3.3a-02-eslint-enforcement-redesign.md:3`                                 |
| PK-4  | `.agent/plans/current/complete/3.3a-03-zod-parser-semantic-parsing.md`                                 | complete    | done       | A       | —         | AR-3 evidence; N-3 input (ts-morph reading)                                                                                      | PLOT    | `.agent/plans/current/complete/3.3a-03-zod-parser-semantic-parsing.md:3`                                 |
| PK-5  | `.agent/plans/current/complete/3.3a-04-centralize-data-string-parsing.md`                              | complete    | done       | B       | A         | partial AR-3 (grammar strings parsed once)                                                                                       | none    | `.agent/plans/current/complete/3.3a-04-centralize-data-string-parsing.md:3`                              |
| PK-6  | `.agent/plans/current/complete/3.3a-05-remove-permissive-fallbacks.md`                                 | complete    | done       | B       | —         | supports AR-5                                                                                                                    | none    | `.agent/plans/current/complete/3.3a-05-remove-permissive-fallbacks.md:3`                                 |
| PK-7  | `.agent/plans/current/complete/3.3a-06-remove-swallowed-errors.md`                                     | complete    | done       | B       | —         | supports PR-2                                                                                                                    | none    | `.agent/plans/current/complete/3.3a-06-remove-swallowed-errors.md:3`                                     |
| PK-8  | `.agent/plans/current/complete/3.3a-07-remove-escape-hatches.md`                                       | complete    | done       | B       | —         | supports AR-7                                                                                                                    | none    | `.agent/plans/current/complete/3.3a-07-remove-escape-hatches.md:3`                                       |
| PK-9  | `.agent/plans/current/complete/3.3a-08-prove-determinism.md`                                           | complete    | done       | B       | —         | supports PR-4                                                                                                                    | none    | `.agent/plans/current/complete/3.3a-08-prove-determinism.md:3`                                           |
| PK-10 | `.agent/plans/current/complete/3.3b-01-transform-sample-suite-strictness.md`                           | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/3.3b-01-transform-sample-suite-strictness.md:3`                           |
| PK-11 | `.agent/plans/current/complete/3.3b-02-scenario3-reference-composition.md`                             | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/3.3b-02-scenario3-reference-composition.md:3`                             |
| PK-12 | `.agent/plans/current/complete/3.3b-03-reject-z-undefined.md`                                          | complete    | done       | B       | —         | supports P-5                                                                                                                     | none    | `.agent/plans/current/complete/3.3b-03-reject-z-undefined.md:3`                                          |
| PK-13 | `.agent/plans/current/complete/3.3b-04-format-parity-hostname-float.md`                                | active      | unverified | B       | —         | P-3 formats; declared "Active" inside `complete/`                                                                                | none    | `.agent/plans/current/complete/3.3b-04-format-parity-hostname-float.md:7`                                |
| PK-14 | `.agent/plans/current/complete/3.3b-05-validation-parity-scenarios-2-4.md`                             | complete    | done       | B       | A         | parity proof predates G-4 and G-7                                                                                                | none    | `.agent/plans/current/complete/3.3b-05-validation-parity-scenarios-2-4.md:8`                             |
| PK-15 | `.agent/plans/current/complete/3.3b-06-expand-zod-fixtures.md`                                         | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/3.3b-06-expand-zod-fixtures.md:3`                                         |
| PK-16 | `.agent/plans/current/complete/3.3b-07-nullability-chain-normalization.md`                             | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/3.3b-07-nullability-chain-normalization.md:3`                             |
| PK-17 | `.agent/plans/current/complete/anchor-and-dynamic-references.md`                                       | complete    | done       | A       | B         | references carried as keyword strings is AR-1 and N-1 evidence; TypeScript fail-fast "not yet wired"                             | PLOT    | `.agent/plans/current/complete/anchor-and-dynamic-references.md:26`, `:48`                               |
| PK-18 | `.agent/plans/current/complete/architecture-review-packs.md`                                           | complete    | done       | A       | —         | G-3 and G-7 evidence: gates green while the IR-fidelity suite was red                                                            | PLOT    | `.agent/plans/current/complete/architecture-review-packs.md:34`                                          |
| PK-19 | `.agent/plans/current/complete/core-agent-system-and-codex-agent-adapters.md`                          | complete    | done       | D       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/core-agent-system-and-codex-agent-adapters.md:3`                          |
| PK-20 | `.agent/plans/current/complete/core-vs-companion-workspaces-plan-alignment.md`                         | complete    | done       | A       | C         | N-2 input (ADR-043 core and companion boundary); a fresh-workspace MOVE needs it                                                 | MOVE    | `.agent/plans/current/complete/core-vs-companion-workspaces-plan-alignment.md:3`                         |
| PK-21 | `.agent/plans/current/complete/cricket-platform-parity.md`                                             | none        | done       | D       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/cricket-platform-parity.md:1`                                             |
| PK-22 | `.agent/plans/current/complete/dependency-currency.md`                                                 | complete    | done       | B       | —         | found the ADR-037 direction gate blind (the estate labels it ADR-036): a check pointed at nothing (G-7)                          | none    | `.agent/plans/current/complete/dependency-currency.md:169-178`                                           |
| PK-23 | `.agent/plans/current/complete/discovery-and-prioritisation.md`                                        | executed    | done       | D       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/discovery-and-prioritisation.md:7`                                        |
| PK-24 | `.agent/plans/current/complete/doctor-rescue-loop-runtime-redesign.md`                                 | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/doctor-rescue-loop-runtime-redesign.md:3`                                 |
| PK-25 | `.agent/plans/current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md` | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md:3` |
| PK-26 | `.agent/plans/current/complete/eperusteet-real-spec-validation.md`                                     | complete    | done       | A       | —         | a real document with schema-valued `additionalProperties`; its rejection triggered the 16 April 2026 re-widening; supports P-1   | MEASURE | `.agent/plans/current/complete/eperusteet-real-spec-validation.md:19`                                    |
| PK-27 | `.agent/plans/current/complete/feature-parity-planning-input-alignment.md`                             | complete    | done       | D       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/feature-parity-planning-input-alignment.md:3`                             |
| PK-28 | `.agent/plans/current/complete/format-specific-drift-remediation.md`                                   | complete    | done       | B       | A         | supports P-3                                                                                                                     | none    | `.agent/plans/current/complete/format-specific-drift-remediation.md:3`                                   |
| PK-29 | `.agent/plans/current/complete/identity-doctrine-alignment.md`                                         | complete    | reversed   | D       | —         | strict-only objects, `z.object` read as strict; overturned in doctrine on 16 April 2026 and by P-1                               | RATIFY  | `.agent/plans/current/complete/identity-doctrine-alignment.md:13`, `:28-40`                              |
| PK-30 | `.agent/plans/current/complete/if-then-else-conditional-applicators.md`                                | complete    | done       | A       | —         | AR-1 evidence: conditional keywords as model structure                                                                           | PLOT    | `.agent/plans/current/complete/if-then-else-conditional-applicators.md:18`                               |
| PK-31 | `.agent/plans/current/complete/int64-bigint-semantics-investigation.md`                                | complete    | done       | D       | —         | subsumed by P-5                                                                                                                  | none    | `.agent/plans/current/complete/int64-bigint-semantics-investigation.md:3`                                |
| PK-32 | `.agent/plans/current/complete/ir-and-runtime-validator-remediation.md`                                | complete    | reversed   | D       | —         | `additionalProperties` boolean-only; overturned in doctrine on 16 April 2026 and by P-1 (constrained)                            | RATIFY  | `.agent/plans/current/complete/ir-and-runtime-validator-remediation.md:11`                               |
| PK-33 | `.agent/plans/current/complete/json-schema-parser.md`                                                  | complete    | done       | B       | A         | `$dynamicRef` and external `$ref` open; C-2 scope                                                                                | none    | `.agent/plans/current/complete/json-schema-parser.md:3`                                                  |
| PK-34 | `.agent/plans/current/complete/oas-3.2-full-feature-support.md`                                        | complete    | done       | A       | B         | AR-1 evidence: the model typed on Scalar OpenAPI types                                                                           | PLOT    | `.agent/plans/current/complete/oas-3.2-full-feature-support.md:73-94`                                    |
| PK-35 | `.agent/plans/current/complete/oas-3.2-version-plumbing.md`                                            | complete    | done       | B       | —         | supports P-4                                                                                                                     | none    | `.agent/plans/current/complete/oas-3.2-version-plumbing.md:3`                                            |
| PK-36 | `.agent/plans/current/complete/openapi3-ts-dependency-exit.md`                                         | superseded  | superseded | D       | —         | superseded by ADR-044; the AR-1 evidence is carried by PK-34 and PK-39                                                           | none    | `.agent/plans/current/complete/openapi3-ts-dependency-exit.md:3`                                         |
| PK-37 | `.agent/plans/current/complete/pattern-properties-and-property-names.md`                               | complete    | done       | A       | B         | the constrained policy supports P-1; the `.refine()` default it led to (ADR-047) contradicts P-2; Oak uses `propertyNames` twice | MEASURE | `.agent/plans/current/complete/pattern-properties-and-property-names.md:3-4`, `:31`                      |
| PK-38 | `.agent/plans/current/complete/phase-4-json-schema-and-parity.md`                                      | complete    | done       | B       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/phase-4-json-schema-and-parity.md:3`                                      |
| PK-39 | `.agent/plans/current/complete/phase-a2-type-migration.md`                                             | complete    | done       | A       | —         | AR-1 evidence: the model typed on Scalar OpenAPI types                                                                           | PLOT    | `.agent/plans/current/complete/phase-a2-type-migration.md:3`                                             |
| PK-40 | `.agent/plans/current/complete/practice-core-integration-and-practice-restructuring.md`                | complete    | done       | D       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/practice-core-integration-and-practice-restructuring.md:3`                |
| PK-41 | `.agent/plans/current/complete/practice-equality-identity-and-cognition.md`                            | current     | done       | D       | —         | silent; declared `current` inside `complete/`                                                                                    | none    | `.agent/plans/current/complete/practice-equality-identity-and-cognition.md:3`                            |
| PK-42 | `.agent/plans/current/complete/pre-castr-doctrine-sync.md`                                             | executed    | done       | D       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/pre-castr-doctrine-sync.md:19`                                            |
| PK-43 | `.agent/plans/current/complete/prefixitems-tuple-and-contains.md`                                      | complete    | done       | B       | A         | `unevaluatedItems` fail-fast; C-2 scope                                                                                          | none    | `.agent/plans/current/complete/prefixitems-tuple-and-contains.md:8`                                      |
| PK-44 | `.agent/plans/current/complete/proof-system-and-doctrine-remediation.md`                               | complete    | done       | A       | —         | G-7 evidence (proof honesty)                                                                                                     | PLOT    | `.agent/plans/current/complete/proof-system-and-doctrine-remediation.md:3`                               |
| PK-45 | `.agent/plans/current/complete/recursive-unknown-key-semantics-remediation.md`                         | implemented | done       | A       | —         | goal (four unknown-key modes) supports P-1; its `x-castr-unknownKeyBehavior` writing contradicts P-1's writing rule              | none    | `.agent/plans/current/complete/recursive-unknown-key-semantics-remediation.md:14`, `:25-27`              |
| PK-46 | `.agent/plans/current/complete/recursive-wrapper-remediation.md`                                       | complete    | done       | B       | A         | supports P-2 (getter and `z.lazy` reading)                                                                                       | none    | `.agent/plans/current/complete/recursive-wrapper-remediation.md:3`                                       |
| PK-47 | `.agent/plans/current/complete/strict-object-semantics-enforcement.md`                                 | complete    | superseded | A       | —         | superseded 2026-06-04 by its own banner; holds measured Zod runtime facts for N-3                                                | PLOT    | `.agent/plans/current/complete/strict-object-semantics-enforcement.md:3-5`, `:187-196`                   |
| PK-48 | `.agent/plans/current/complete/turbo-caching-and-branch-model.md`                                      | none        | done       | D       | —         | silent                                                                                                                           | none    | `.agent/plans/current/complete/turbo-caching-and-branch-model.md:1`                                      |
| PK-49 | `.agent/plans/current/complete/type-safety-remediation-follow-up.md`                                   | complete    | done       | B       | —         | supports AR-7                                                                                                                    | none    | `.agent/plans/current/complete/type-safety-remediation-follow-up.md:3`                                   |
| PK-50 | `.agent/plans/current/complete/type-safety-remediation.md`                                             | complete    | done       | B       | —         | supports AR-7                                                                                                                    | none    | `.agent/plans/current/complete/type-safety-remediation.md:3`                                             |
| PK-51 | `.agent/plans/current/complete/zod-defect-quarantine-remediation.md`                                   | complete    | done       | A       | B         | measured Zod runtime facts for N-3                                                                                               | PLOT    | `.agent/plans/current/complete/zod-defect-quarantine-remediation.md:108-112`                             |

### Plans: archive

| ID    | Item                                                                                                                          | Declared    | Actual     | Primary | Secondary | Relation to the specification                               | Leg  | Evidence                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------- | --------- | ----------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| PX-1  | `.agent/plans/archive/castr-documentation-and-fidelity-correction.md`                                                         | superseded  | superseded | D       | —         | superseded by the course; still cited as live authority     | none | `.agent/plans/archive/castr-documentation-and-fidelity-correction.md:3`                                                         |
| PX-2  | `.agent/plans/archive/castr-strict-test-plan-INTEGRATED.md`                                                                   | none        | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/castr-strict-test-plan-INTEGRATED.md:1`                                                                   |
| PX-3  | `.agent/plans/archive/correction-sequencing-2026-09-06.md`                                                                    | none        | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/correction-sequencing-2026-09-06.md:1`                                                                    |
| PX-4  | `.agent/plans/archive/future-artefact-expansion.md`                                                                           | planned     | historical | D       | —         | MCP and client writers excluded (Not part of Castr for now) | none | `.agent/plans/archive/future-artefact-expansion.md:3`                                                                           |
| PX-5  | `.agent/plans/archive/ir-semantic-audit-plan-3.1a-complete.md`                                                                | complete    | historical | D       | —         | its "the IR is format-agnostic" is falsified by AR-1        | none | `.agent/plans/archive/ir-semantic-audit-plan-3.1a-complete.md:3`                                                                |
| PX-6  | `.agent/plans/archive/openapi-compliance-plan-2.6-2.7-complete.md`                                                            | complete    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/openapi-compliance-plan-2.6-2.7-complete.md:4`                                                            |
| PX-7  | `.agent/plans/archive/phase-1-completion-plan.md`                                                                             | in progress | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/phase-1-completion-plan.md:4`                                                                             |
| PX-8  | `.agent/plans/archive/session-2.9-polish-plan.md`                                                                             | complete    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/session-2.9-polish-plan.md:4`                                                                             |
| PX-9  | `.agent/plans/archive/superseded-structural-planning-stubs/3.3a-06-architectural-enforcement.md`                              | none        | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/superseded-structural-planning-stubs/3.3a-06-architectural-enforcement.md:1`                              |
| PX-10 | `.agent/plans/archive/superseded-structural-planning-stubs/3.3a-09-directory-complexity-limits.md`                            | planning    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/superseded-structural-planning-stubs/3.3a-09-directory-complexity-limits.md:3`                            |
| PX-11 | `.agent/plans/archive/unmerged-work-to-main-or-deleted.md`                                                                    | superseded  | superseded | D       | —         | superseded by the 2026-09-21 write-off; still cited by Q-34 | none | `.agent/plans/archive/unmerged-work-to-main-or-deleted.md:3`                                                                    |
| PX-12 | `.agent/plans/archive/zod-limitations-historical-cluster/recursive-unknown-key-preserving-zod-emission-investigation.md`      | complete    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/zod-limitations-historical-cluster/recursive-unknown-key-preserving-zod-emission-investigation.md:3`      |
| PX-13 | `.agent/plans/archive/zod-limitations-historical-cluster/transform-proof-budgeting-and-runtime-architecture-investigation.md` | complete    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/zod-limitations-historical-cluster/transform-proof-budgeting-and-runtime-architecture-investigation.md:3` |
| PX-14 | `.agent/plans/archive/zod-limitations-historical-cluster/zod-limitations-architecture-investigation.md`                       | complete    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/zod-limitations-historical-cluster/zod-limitations-architecture-investigation.md:3`                       |
| PX-15 | `.agent/plans/archive/zod-limitations-historical-cluster/zod-round-trip-limitations.md`                                       | complete    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/zod-limitations-historical-cluster/zod-round-trip-limitations.md:3`                                       |
| PX-16 | `.agent/plans/archive/zod4-ir-improvements-plan-3.1b-complete.md`                                                             | in progress | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/zod4-ir-improvements-plan-3.1b-complete.md:3`                                                             |
| PX-17 | `.agent/plans/archive/zod4-parser-plan-3.2-complete.md`                                                                       | complete    | historical | D       | —         | silent                                                      | none | `.agent/plans/archive/zod4-parser-plan-3.2-complete.md:3`                                                                       |

### Plans: other

| ID   | Item                                       | Declared | Actual     | Primary | Secondary | Relation to the specification                                                                                                                | Leg  | Evidence                                     |
| ---- | ------------------------------------------ | -------- | ---------- | ------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------- |
| PO-1 | `.agent/plans/roadmap.md`                  | none     | reference  | D       | C         | its "Full JSON Schema support" section restates C-2 against the specification's "only description"; on the review record's disagreement list | MOVE | `.agent/plans/roadmap.md:17-25`              |
| PO-2 | `.agent/plans/delivery-ledger.md`          | none     | historical | D       | C         | archival record; its rows show the pull requests reopened on 20 September as "Open"                                                          | MOVE | `.agent/plans/delivery-ledger.md:207-219`    |
| PO-3 | `.agent/plans/practice-alignment-brief.md` | brief    | historical | D       | —         | silent                                                                                                                                       | none | `.agent/plans/practice-alignment-brief.md:3` |
| PO-4 | `.agent/plans/templates/` (14 files)       | none     | reference  | D       | —         | silent                                                                                                                                       | none | `.agent/plans/templates/README.md`           |

### Proof-programme tranches

| ID    | Item                                                                  | Declared                | Actual  | Primary | Secondary | Relation to the specification                                      | Leg  | Evidence                                                                           |
| ----- | --------------------------------------------------------------------- | ----------------------- | ------- | ------- | --------- | ------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------- |
| T-00  | Tranche 00 contract court                                             | T00a done; rest pending | dormant | D       | —         | subsumed by the specification and RATIFY                           | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:708`  |
| T-01  | Tranche 01 harness, independent oracles, fixture provenance           | pending                 | dormant | D       | —         | subsumed by G-4 to G-7 and the the Definitions' Corpus             | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:814`  |
| T-02A | Tranche 02A fidelity foundation                                       | pending                 | dormant | D       | —         | subsumed by PR-2, AR-1, AR-2                                       | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:886`  |
| T-02B | Tranche 02B value-contract and interaction-contract roots             | pending                 | dormant | A       | —         | pre-empts N-1                                                      | PLOT | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:887`  |
| T-02C | Tranche 02C semantic facets (accepted, produced, identity, reference) | pending                 | dormant | A       | —         | subsumed by the Definitions' accepted and produced sets; N-1 input | PLOT | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:888`  |
| T-03  | Tranche 03 wire identity, reference graph, security algebra           | pending                 | dormant | A       | —         | subsumed by PR-3; N-1 input                                        | PLOT | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:997`  |
| T-04  | Tranche 04 source admission and target preflight                      | pending                 | dormant | A       | —         | N-4 input                                                          | PLOT | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1080` |
| T-05  | Tranche 05 JSON Schema dialect fidelity                               | pending                 | dormant | D       | —         | subsumed by C-2                                                    | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1156` |
| T-06  | Tranche 06 OpenAPI document and operation fidelity                    | pending                 | dormant | D       | —         | subsumed by C-1 and P-4                                            | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1245` |
| T-07  | Tranche 07 bounded Zod 4 grammar                                      | pending                 | dormant | D       | —         | replaced by P-2, AR-6, N-3; pinned to Zod 4.4.3                    | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1343` |
| T-08  | Tranche 08 generated TypeScript and Zod correctness                   | pending                 | dormant | D       | —         | subsumed by C-1, G-6 and AR-3                                      | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1431` |
| T-09  | Tranche 09 MCP tool projection                                        | pending                 | dormant | D       | —         | excluded (Not part of Castr for now)                               | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1491` |
| T-09G | Tranche 09G graph interoperability (conditional)                      | conditional             | dormant | D       | —         | silent (QD-1 deferred the graph product)                           | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1552` |
| T-10  | Tranche 10 resource containment and hostile input                     | pending                 | dormant | B       | —         | silent; no C-1 dependency                                          | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1703` |
| T-11  | Tranche 11 typed transformation graph                                 | pending                 | dormant | A       | —         | subsumed by the Capabilities directed pairs and N-5                | PLOT | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1768` |
| T-12  | Tranche 12 determinism, metamorphic and mutation tests                | pending                 | dormant | D       | —         | subsumed by PR-4, G-5, G-7                                         | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1845` |
| T-13  | Tranche 13 packed artefact and CLI smoke                              | pending                 | dormant | C       | —         | Home (extractable and publishable)                                 | MOVE | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1939` |
| T-14  | Tranche 14 certification gate                                         | pending                 | dormant | D       | —         | replaced by G-1 to G-3                                             | none | `.agent/report/castr-completeness-losslessness-proof-programme-2026-08-21.md:1991` |

### Registers

| ID   | Item                                                           | Declared          | Actual    | Primary | Secondary | Relation to the specification                                                                                                                        | Leg  | Evidence                                                   |
| ---- | -------------------------------------------------------------- | ----------------- | --------- | ------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------- |
| RG-1 | `.agent/memory/operational/open-questions.md` (Q-016 to Q-019) | open              | reference | D       | A         | Q-016 subsumed by AR-4 (seams open as N-2); Q-017 answered in substance by the Profile's source-meaning rule and PR-7; Q-018 and Q-019 Practice-only | none | `.agent/memory/operational/open-questions.md:50-123`       |
| RG-2 | `.agent/memory/operational/pending-graduations.md` (18 rows)   | 14 pending        | dormant   | D       | C         | one product-doctrine row (model persistence versioning) is moot if the model is replaced; the rest Practice                                          | MOVE | `.agent/memory/operational/pending-graduations.md:106-117` |
| RG-3 | `.agent/memory/active/napkin.md` (about 1,490 lines)           | consolidation due | dormant   | D       | C         | deferred deep consolidation names MOVE as the buffers' destination                                                                                   | MOVE | `.agent/memory/operational/repo-continuity.md:60-77`       |

### Plan-shaped research

| ID   | Item                                                                              | Declared                | Actual     | Primary | Secondary | Relation to the specification                                                                                                                                                              | Leg    | Evidence                                                                                  |
| ---- | --------------------------------------------------------------------------------- | ----------------------- | ---------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------- |
| RS-1 | `.agent/research/feature-parity/plan-overview.md`                                 | none                    | historical | D       | —         | step 1 subsumed by C-1 and AR-3; step 3 later (Capabilities: Later); round-trip proof contradicts G-7                                                                                      | RATIFY | `.agent/research/feature-parity/plan-overview.md:24`                                      |
| RS-2 | `.agent/research/feature-parity/plans-review.md`                                  | none                    | historical | D       | —         | gap list subsumed by C-1; treats the companion boundary as settled, pre-empting N-2                                                                                                        | none   | `.agent/research/feature-parity/plans-review.md:47`                                       |
| RS-3 | `.agent/research/openapi-ts/openapi-ts-reuse-plan.md`                             | none                    | historical | D       | —         | silent; licence caution for reused third-party code (Hey API, not `openapi-typescript`)                                                                                                    | none   | `.agent/research/openapi-ts/openapi-ts-reuse-plan.md:68-70`                               |
| RS-4 | `.agent/research/zod-compiler-comparison-and-surface-architecture.report-plan.md` | Proposed                | dormant    | A       | —         | representability kept out of the model supports AR-1 and N-5 in concept; pre-empts N-4 and N-5; `widened` contradicts PR-2; `.refine` helper contradicts P-2; static-only contradicts AR-6 | PLOT   | `.agent/research/zod-compiler-comparison-and-surface-architecture.report-plan.md:138-145` |
| RS-5 | `.agent/research/oak-open-curriculum-sdk/oak-support-plan.md`                     | historical (superseded) | historical | D       | —         | consumer surface subsumed by C-1; the review record is fresher                                                                                                                             | none   | `.agent/research/oak-open-curriculum-sdk/oak-support-plan.md:64-69`                       |

<!-- register:end -->

## Appendix B. Counts and reconciliation

Run from the repository root; every count in this report comes from this output.

```python
import collections
import pathlib
import re

REPORT = pathlib.Path('.agent/analysis-and-reports/castr-lanes-and-plans-categorised-2026-09-24.md')
body = REPORT.read_text(encoding='utf-8').split('<!-- register:start -->')[1].split('<!-- register:end -->')[0]

rows, population = [], None
for line in body.splitlines():
    if line.startswith('### '):
        population = line[4:].split(':')[0]
    elif line.startswith('|'):
        cells = [c.strip() for c in re.split(r'(?<!\\)\|', line)[1:-1]]
        if cells[0] != 'ID' and not all(re.fullmatch(r':?-+:?', c) for c in cells):
            rows.append((population, cells))

legs = ['RATIFY', 'MEASURE', 'MOVE', 'PLOT', 'none']
print(f'rows: {len(rows)}')
print('primary by leg:')
print('  ' + ' '.join(f'{leg:>7}' for leg in legs) + '   total')
for cat in 'ABCD':
    n = [sum(1 for _, c in rows if c[4] == cat and c[7] == leg) for leg in legs]
    print(f'{cat} ' + ' '.join(f'{x:>7}' for x in n) + f' {sum(n):>7}')
print('secondary:', dict(sorted(collections.Counter(c[5] for _, c in rows).items())))
print('primary by population:')
by_pop = collections.defaultdict(collections.Counter)
for pop, c in rows:
    by_pop[pop][c[4]] += 1
for pop, counts in by_pop.items():
    print(f'  {pop}: {sum(counts.values())} {dict(sorted(counts.items()))}')

live = re.compile(r'\b(active|current|live|in.progress|enabled|open worklist)\b', re.I)
drift = [c[0] for _, c in rows if live.search(c[2]) and c[3] != 'live']
print(f'declared live, actually not live: {len(drift)}: {", ".join(drift)}')

files = {str(p) for p in pathlib.Path('.agent/plans').rglob('*.md')}
named = set()
for _, c in rows:
    for path in re.findall(r'`(\.agent/plans/[^`]+)`', c[1]):
        named |= {f for f in files if f.startswith(path)} if path.endswith('/') else {path}
print(f'plan Markdown files: {len(files)}; named in the register: {len(files & named)}')
print('missing:', sorted(files - named) or 'none')
print('named but absent:', sorted(named - files) or 'none')
```

```text
rows: 202
primary by leg:
   RATIFY MEASURE    MOVE    PLOT    none   total
A       3       5       2      21       1      32
B       0       1       0       1      40      42
C       0       0       4       0       0       4
D       6       0      13       0     105     124
secondary: {'A': 13, 'B': 9, 'C': 20, '—': 160}
primary by population:
  Lanes: 17 {'A': 4, 'B': 1, 'C': 1, 'D': 11}
  Plans: 124 {'A': 21, 'B': 30, 'C': 2, 'D': 71}
  Proof-programme queue rows: 35 {'A': 1, 'B': 10, 'D': 24}
  Proof-programme tranches: 18 {'A': 5, 'B': 1, 'C': 1, 'D': 11}
  Registers: 3 {'D': 3}
  Plan-shaped research: 5 {'A': 1, 'D': 4}
declared live, actually not live: 19: LN-2, LN-3, LN-6, PA-3, PC-1, PC-2, PG-1, Q-34, PT-9, PT-13, PT-14, PT-15, PT-16, PT-19, PT-20, PK-13, PK-41, PX-7, PX-16
plan Markdown files: 137; named in the register: 137
missing: none
named but absent: none
```
