# Repo continuity

Current scope comes from plans; this file routes sessions to their authority.
Read the [thread convention](threads/README.md) before joining a thread.

## Current state

The destination is [the specification](../../../docs/SPECIFICATION.md) and the course is
[castr-course.md](../../plans/active/castr-course.md). On 21 September 2026 the owner wrote
off every inherited worktree, orphaned branch and open pull request, and ruled that Castr
moves into the Engraph Open Curriculum Ecosystem repository as workspaces, after the
present generator has been measured against the specification. `main` had zero open dependency alerts from #111 until new advisories arrived; on 2 November 2026 it had 30, and #117 and #118 brought it back to zero the same day (SPEC-G-1). Two more arrived on 13 November on `@hono/node-server`; #119 cured them on 18 November 2026. The same day Dependabot raised a high alert on picomatch (GHSA-fc5q-39xc-vjpf) covering every release up to 4.0.7, the latest: no patched release exists, so `main` has one open alert that no pull request can cure yet. Specification 0.5.2, approved by the owner that day, names that alert in SPEC-G-1 so that it does not hold merges while no patched version exists. The platform-neutral autonomous-development experiment stays paused.
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
file (it has none; `package.json` declares MIT); and whether the user-home paths in three
archived napkins stay. By card that day the owner chose to reflect now, to add the
MIT text in the owner's own name, and to scrub the seven user-home paths from three archived
napkins. The scrub landed with #125 (`SHA:f17e6e8f`) and the licence file, the MIT text
alone by the owner's ruling, with #126 (`SHA:c3669e36`). The seat settled the rest; each
disposition is in the napkin's entry for that pass. The
[example-input library](../../plans/current/example-input-library.md) proceeds beside the
reflection, from EC-0.

## Active threads

| Thread                                                       | Role and next step                                                                                            | Latest identity                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Castr correction](threads/castr-correction.next-session.md) | The reflection with the owner on the MEASURE table decides what travels; then CURRENCY, RULES, MOVE and PLOT. | claude-code / claude-fable-5-2 / Ingot binds Patina / alert cure, RATIFY landing, MEASURE, 0.5.2 / 2026-11-18 |
| [Proof programme](threads/proof-programme.next-session.md)   | Programme authority and additive identity history; scheduled execution paused.                                | claude-code / claude-opus-5-5 / Mussel mends Buoy / Q-30 superseded, links repointed (#110) / 2026-09-23      |

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

1. **The reflection began on 18 November 2026 with the owner's ruling**, verbatim: "I don't
   want to move the code until we have defined what working and working well looks like, what
   correctness means, and explored if we can reach that state in isolation. Moving broken
   code into another repo seems like it can only cause further problems". MOVE therefore
   waits on that definition and that exploration; the course's order below predates it and
   is rewritten when the reflection settles the legs.
   **The reflection on the MEASURE table** continues from there. MEASURE ran on
   18 November 2026 and decides nothing: its table is
   [measure-2026-11-18.md](../../analysis-and-reports/measure-2026-11-18.md). Run the
   reflection with the owner as concept exploration over the table; it decides what travels.
   CURRENCY, RULES, MOVE and PLOT follow in the course's order. The
   [thread record](threads/castr-correction.next-session.md) carries each leg's state.
2. **The example-input library starts at EC-0**, attribution and third-party notices
   ([its plan](../../plans/current/example-input-library.md)). It gates nothing in the course
   and nothing gates it. The owner asked for it on 25 September 2026 and reads one sentence
   of the course in EC-0's pull request.
3. **The picomatch alert stays open** (GHSA-fc5q-39xc-vjpf, high). SPEC-G-1 at 0.5.2 names
   it, so it does not hold merges while its advisory names no patched version; it is never
   dismissed. When the advisory names a patched version old enough to install, it holds
   merges again and its cure, a floor in `pnpm-workspace.yaml`, goes first. The clause names
   it only while nothing a user of Castr supplies reaches the vulnerable code, so a change
   that lets user input reach picomatch goes to the owner before it merges. Any other alert
   holds merges as before; one with no patched version needs the same trace (is the code
   used, can the function go, can it be done another way) and its own amendment.
4. **The SPEC-CC-3 check compares approval records with `main`'s.** An approval record that
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
