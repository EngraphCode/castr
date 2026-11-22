# Repo continuity

Current scope comes from plans; this file routes sessions to their authority.
Read the [thread convention](threads/README.md) before joining a thread.

## Current state

The destination is [the specification](../../../docs/SPECIFICATION.md) and the course is
[castr-course.md](../../plans/active/castr-course.md). On 21 September 2026 the owner wrote
off every inherited worktree, orphaned branch and open pull request, and ruled that Castr
moves into the Engraph Open Curriculum Ecosystem repository as workspaces, after the
present generator has been measured against the specification. `main` had zero open dependency alerts from #111 until new advisories arrived; on 2 November 2026 it had 30, and #117 and #118 brought it back to zero the same day (SPEC-G-1). Two more arrived on 13 November on `@hono/node-server`; #119 cured them on 18 November 2026. `main` has no open dependency alerts. The platform-neutral autonomous-development experiment stays paused.
The Practice-enhancement lane in this repository is stopped. On 25 September 2026 the
categorisation of every lane and plan landed (#113), both served Oak documents were pinned
as the corpus with a recomputing validator and the specification moved to draft 0.4.1
(#114), and the example-input library plan sits in `current/` awaiting pickup (#115).

On 1 November 2026 the owner named two goals: "bringing Castr into a requires compliant
and functioning shape" and "migrating Castr into OCE". In the owner's words, "Those
priorities do not supersede previous plans, they are part of enacting the previous plans".
The same day, on the owner's word, every linked worktree was deleted. Only the main
checkout remains; branches and the stash were kept. The record of the deletion is in the
napkin. Two facts from that day's review:

- **OCE has started receiving Castr.** On 10 October 2026 the Engraph Open Curriculum
  Ecosystem repository added `docs/architecture/oce-integrity-and-castr.md` and two
  unratified sketch plans, `oce-castr-integration-profile` and
  `oce-castr-generator-replacement`, pinned at `SHA:851c7efe`. They follow this course's
  order. The architecture document lists five profile mismatches to resolve before
  replacement: defaults, the boundary check, extractability, labelling the unknown-key
  reading as a Castr profile, and OpenAPI 3.2.1 against a 3.2.0 writer target. The owner
  decided all five on 2 November 2026.
- **The Sonar issues are recorded in
  [the 1 November analysis](../../analysis-and-reports/sonar-issues-2026-11-01.md).** It
  counts 380 open issues on `main`, with nothing urgent. 211 of them are in Practice
  tooling and 117 are in code the specification condemns.

On 2 November 2026 the owner had every open question run through OCE's decision matrix and
answered the survivors by decision card: the specification's whole ratification checklist
and OCE's two further mismatches, 30 cards. The answers, and the owner's ruling "All Castr
work happens via AST not via string manipulation. Where string manipulation is
unavoidable, ask _why_", are folded into draft 0.5.0 and ADR-026's amendment; the course
gained PROBE and CURRENCY. The owner approved 0.5.0 the same day ("I approve draft 0.5.0 ,
if we need to review and change it later that is fine."), recorded per SPEC-CC-2 in
`SHA:0e2ca07a`, and then decided by card how the course continues: MEASURE decides
nothing and a reflection with the owner decides what travels; CURRENCY and a new RULES leg
follow it, only for code that travels. The owner then approved 0.5.1 ("I approve 0.5.1",
`SHA:1a7631ac`), which reads SPEC-CC-3's latest approved record as the latest ever approved.
The ratified file, the SPEC-CC-3 check that enforces it, the PROBE table and the records
landed on `main` on 18 November 2026 with #120 (`SHA:3ff0fd2e`), at version 0.5.2, which the
owner approved that day ("I approve version 0.5.2"). RATIFY is complete. The pins of both
Oak documents as served that day landed with #123 (`SHA:ca6ba049`).

On 18 November 2026 the owner had the items left open by that day's work run through the
same matrix. Three survived, all the owner's: what travels into OCE, which the reflection on
the MEASURE table decides; whether this repository, which is public, gets a licence
file (it had none that morning; `package.json` declares MIT); and whether the user-home paths in three
archived napkins stay. By card that day the owner chose to reflect now, to add the
MIT text in the owner's own name, and to scrub the seven user-home paths from three archived
napkins. The scrub landed with #125 (`SHA:f17e6e8f`) and the licence file, the MIT text
alone by the owner's ruling, with #126 (`SHA:c3669e36`). The seat settled the rest; each
disposition is in the napkin's entry for that pass. The
[example-input library](../../plans/active/example-input-library.md) began on 19 November
with EC-0: `ATTRIBUTION.md` and `docs/THIRD_PARTY_NOTICES.md` record who wrote the example
documents Castr holds, their licences, and which files Castr has modified.

The reflection ran the same day. The owner asked whether their request held tensions; the
seat found six and the owner decided three by card. The code travels, made correct here
first: correct includes how the code is built, SPEC-C-1's first acceptance part passes in
this repository on Oak's latest v1 document before MOVE (the owner dropped v0 on 19 November), and the example library's OpenAPI
documents are each converted exactly or refused with a located rejection. The
[course](../../plans/active/castr-course.md) carries the decisions in "Order of the legs",
with a PICTURE leg ahead of PLOT. On 19 November the owner sent back a draft amendment that
only reflected those decisions; the course records the correction and what stepping back
found, including that most of today's product code is replaced by the construction rules.

## Active threads

| Thread                                                       | Role and next step                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Latest identity                                                                                                                                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Castr correction](threads/castr-correction.next-session.md) | The steps of [after-0.8.0-next-steps.md](../../plans/active/after-0.8.0-next-steps.md), in the order that plan gives and says whose each part is: the tables with numbers written in them (owner decision eighteen), then the fix of what stops Oak's document, with the picture's cells for what the reader refuses worked beside them, an amendment written from those cells (references across documents, and the corrections the withdrawn draft of 0.8.1 leaves), and the remaining legs written after both that and the fix; then the course's CURRENCY, RULES, HOME and MOVE. | claude-code / claude-fable-5-2 / Firefly mends Quench / N0 trace, the re-pin, four drafts of 0.8.1 and its withdrawal, three drafts of part two and its withdrawal; next N2 (its validator first) and the start of N5 / 2026-11-22 |
| [Proof programme](threads/proof-programme.next-session.md)   | Programme authority and additive identity history; scheduled execution paused.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | claude-code / claude-opus-5-5 / Mussel mends Buoy / Q-30 superseded, links repointed (#110) / 2026-09-23                                                                                                                           |

## Paused threads and historical records

The wholesale transplant is stopped under QD-2. Distinct paused workstreams and
future intentions retain their [plan homes](../../plans/roadmap.md#retained-work-and-lifecycle).
C09 reconciles every thread and plan against its acceptance; the former thread
inventory and all prior next-step narratives are [conserved verbatim](archive/correction-entry-paths-2026-09-06.md).
The loop-review record's completed rows await evidence-based lifecycle staging.

The retained thread index below preserves direct custody until C09 reconciles
acceptance, current framing and lifecycle. A dated thread claim is historical
evidence; this index does not declare these threads retired or reactivate them.

| Thread                                                                                         | Retained custody and next check                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Consolidation Routine and Watcher](threads/consolidation-routine-and-watcher.next-session.md) | Separate knowledge-curation Routine and Watcher history. Current platform state is unverified; the proof-programme pause does not establish it. C09 owns record and lifecycle reconciliation. |
| [Initial Castr review](threads/initial-castr-review.next-session.md)                           | Initial review evidence and strategy-estate intentions. C09 reconciles surviving obligations with the correction plan before changing lifecycle.                                              |
| [Proof-programme loop review](threads/proof-programme-review.next-session.md)                  | Review evidence, routed findings and additive identities. C09 verifies original acceptance before completion staging; this review record does not authorise queue execution.                  |

## Repo-wide invariants

Use fresh feature branches/worktrees from current main, one coherent outcome per
PR, and merge commits when current-head checks and reviews are settled. Preserve
source PR #81 and all other work; no history rewriting or implicit branch deletion.
Read [delivery-ledger.md](../../plans/delivery-ledger.md) for PR custody. Keep hooks
intact and use canonical `pnpm check`; green gates do not establish semantic truth.
Identity/claims/coordination follow [AGENT.md](../../directives/AGENT.md) and the
thread convention. Re-read live claims and queue entries before writing/staging.

## Next safe steps

0. **What is next is in one place:
   [after-0.8.0-next-steps.md](../../plans/active/after-0.8.0-next-steps.md).**
   Specification 0.8.0 was approved on 22 November 2026 ("I approve revision 0.8.0"): it
   is part one of the amendment, what the reader refuses. That plan orders the steps
   after it and says how a fresh session starts. Where anything below says something
   else about the next step, the plan governs.
1. **Then read "Start here: handover of 21 November 2026" at the top of the
   [thread record](threads/castr-correction.next-session.md) first.** It is the newest
   state, written at an account change, and holds how work lands here. The paragraph
   below is the history that led to it. On 20 November 2026
   the seat stopped at the owner's word with #134 open and a draft amendment withdrawn.
   The next work is PICTURE, below, and its first part is its row list: the construct
   kinds computed from OpenAPI 3.1's published definition, with a proposed class per row,
   taken to the owner. Writing that list into the specification as the scope-and-fidelity
   table (SPEC-N-5) is an amendment that PLOT sequences, as the course says.
   The row list landed on 20 November (#135) and the owner decided nine questions from it
   by prompt the same day; the thread record holds all nine. The next work is still
   PICTURE, as the course orders it: the command, with rows for OpenAPI 3.1 and 3.2 and
   columns for Zod, TypeScript and the endpoint definitions. The amendment that carries
   the nine decisions follows it, in three parts, with the tables.
   The picture's rows and proposed outcomes are on `main` (#138, #140): `pnpm picture`
   prints 317 rows in three columns, and the cells of 74 schema cases (#142). Castr's
   Zod output was run for 70 of them: right 35, wrong 21, refused 13, crashed 1. The
   other four are not judged, and what Castr does there is unknown. The TypeScript
   column has cells for the same 74 cases (#144), judged by the TypeScript compiler:
   right 50, wrong 6, refused 13, crashed 1, not judged 4. The endpoint-definition
   column has a cell for every one of its 98 rows outside a schema (#146 to #148 and the
   component family): right 29, wrong 3, refused 1, crashed 1, missing 60, not judged 4.
   The 39 rows of a schema that the Zod output is proposed to carry as structure have
   cells, read from the validators Castr generates: right 19, refused 3, missing 17.
   The 63 rows the TypeScript output is proposed to carry that no value of a shape
   shows (56 outside a schema, seven of a schema) have cells, read from the types the
   module exports: right 3, refused 2, missing 57, not judged 1.
   The 56 rows of the document outside a schema have no case kind in the Zod column.
   SPEC-C-1 says where they are carried (Zod schemas addressable by operation, status
   and media type); the cases wait on the form of that addressing (SPEC-N-4), and the
   thread record has the trial. Whole documents have a line each: Castr refuses Oak's
   v1 document at a schema-valued `additionalProperties`, and refuses none of the 14
   examples in the repository. Each document's rows are named and set against the
   cells: Oak's uses 74 rows, two refused in the Zod output (`additionalProperties`,
   `propertyNames`), three wrong, one missing. What PICTURE has left: seven rows in each deciding column, which need a
   second judge (four formats the reference has no checker for are not judged, and
   `int64`, `float` and `double` have cells that decide nothing); the Zod cells for rows outside a schema, which
   wait on SPEC-N-4; and the library's documents, which wait on EC-1. On 22 November part one of
   the amendment was approved as specification 0.8.0; the steps after it are in the plan
   named at the top of this list.
2. **PICTURE: one repeatable command that shows what Castr does, judged from outside it.**
   The owner asked on 18 November 2026 what working, working well and correct look like.
   The seat answered with cards and a draft amendment, and on 19 November the owner sent it
   back, verbatim: "Reflecting the decision back to me is not helpful." (the whole
   correction is in the [thread record](threads/castr-correction.next-session.md) and the
   [course](../../plans/active/castr-course.md), "Order of the legs"). The answer is a
   picture: documents down the side, what a consumer takes across the top, each cell right,
   refused in plain words with its place, wrong, missing or crashed. The MEASURE probe is
   its first drawing; it lands asserting the cells already right and grows with the code.
   Specification 0.6.0, approved on 20 November 2026 ("I approve 0.6.0"), makes Oak's latest
   v1 document the corpus and names no alert in SPEC-G-1. The same day the owner set the
   standard the picture must show, verbatim: "What I want is to not have to rework Castr if
   Oak adds an additional, valid field type to their spec". So a valid construct is
   converted, never refused; the picture's columns are the constructs OpenAPI 3.1 allows;
   and the example documents must convert fully. Specification 0.7.0, approved the same day ("I approve
   0.7.0"), makes it SPEC-PR-6: nothing unbuilt is reachable from any valid document of the
   source format. The [construct report](../../analysis-and-reports/constructs-2026-11-20.md)
   is a first list: 94 constructs, 44 right, 14 wrong, 19 crashed, 4 not measurable alone,
   13 not judged; the wrong count is a floor. One more owner step
   lies ahead: before MOVE, the course's HOME todo changes section 10's "early in the
   course".
3. **The example-input library continues at EC-1**, the pin record's shape for many
   sources ([its plan](../../plans/active/example-input-library.md)). EC-0, attribution and
   third-party notices, is done: a newer copy of any example is a new pin recorded in the
   notices file, and the directory is never re-fetched as a whole. Its OpenAPI tranches
   precede MOVE and its JSON Schema tranches wait for SPEC-C-2. The owner asked for the
   library on 25 September 2026; the course's "MOVE: what travels" names what travels
   with it.
4. **Dependency alerts.** `main` has none open. An alert that arrives holds merges until
   its cure lands (SPEC-G-1); one with no patched version needs a trace (is the code used,
   can the function go, can it be done another way) before anything else is decided.
5. **The SPEC-CC-3 check compares approval records with `main`'s.** An approval record that
   `origin/main` holds must still open the branch's records, in order and with the same
   approver, date, words and digest. The check reads `origin/main` from git, so a checkout
   that has not fetched it exits 2.

## Deep consolidation status

Not run, by owner ruling of 1 November 2026, verbatim: "we are not going to run the
consolidation, unless it would help with the goals of - bringing Castr into a requires
compliant and functioning shape - migrating Castr into OCE". A consolidation pass, or any
part of one, runs only where it serves one of those two goals. The buffers stand as they
are: the napkin is about 1,650 lines, and the pending-graduations register holds the
eighteen rows counted on 23 September.
