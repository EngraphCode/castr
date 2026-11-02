# Repo continuity

Current scope comes from plans; this file routes sessions to their authority.
Read the [thread convention](threads/README.md) before joining a thread.

## Current state

The destination is [the specification](../../../docs/SPECIFICATION.md) and the course is
[castr-course.md](../../plans/active/castr-course.md). On 21 September 2026 the owner wrote
off every inherited worktree, orphaned branch and open pull request, and ruled that Castr
moves into the Engraph Open Curriculum Ecosystem repository as workspaces, after the
present generator has been measured against the specification. `main` had zero open
dependency alerts from #111 until new advisories arrived; on 2 November 2026 it had 30
(3 critical, 8 high), so only alert cures merge (SPEC-G-1). The platform-neutral autonomous-development experiment stays paused.
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
gained PROBE and CURRENCY. No version is approved. The draft and the records sit on
`feat/prepare-for-migration`, the branch the owner opened on 1 November, and merge after
the alert cure.

## Active threads

| Thread                                                       | Role and next step                                                                                                                                 | Latest identity                                                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [Castr correction](threads/castr-correction.next-session.md) | RATIFY: draft 0.5.0 awaits the owner's approval words (SPEC-CC-2). ALERTS is open again (30 alerts on 2 November 2026), so only alert cures merge. | claude-code / claude-opus-5-5 / Bilby hunts Dreamscape / ratification walk and draft 0.5.0 / 2026-11-02  |
| [Proof programme](threads/proof-programme.next-session.md)   | Programme authority and additive identity history; scheduled execution paused.                                                                     | claude-code / claude-opus-5-5 / Mussel mends Buoy / Q-30 superseded, links repointed (#110) / 2026-09-23 |

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

1. **The alert cure.** A dependency-update pull request from `main` that brings the open
   alerts to zero and lands without analysis (SPEC-G-1; the dependency-currency skill's
   survey and override floors). Until it merges, nothing else merges.
2. **Approval of draft 0.5.0.** The owner reads it and approves it in their own words
   naming the version; the agent records the words, the date and the SHA-256 per SPEC-CC-2
   in the change that sets the status to `ratified`. An agent never writes an approval it
   was not given in that session.
3. **The pull request for `feat/prepare-for-migration`** (draft 0.5.0, the course, ADR-026,
   the Sonar analysis and the continuity records) opens and merges once the alerts are
   at zero.
4. **PROBE** runs any time, read-only; **CURRENCY** follows ALERTS; then MEASURE, MOVE and
   PLOT in the course's order. The [thread record](threads/castr-correction.next-session.md)
   carries each leg's state as of 2 November 2026.

## Deep consolidation status

Not run, by owner ruling of 1 November 2026, verbatim: "we are not going to run the
consolidation, unless it would help with the goals of - bringing Castr into a requires
compliant and functioning shape - migrating Castr into OCE". A consolidation pass, or any
part of one, runs only where it serves one of those two goals. The buffers stand as they
are: the napkin is about 1,650 lines, and the pending-graduations register holds the
eighteen rows counted on 23 September.
