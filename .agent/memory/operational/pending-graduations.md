---
fitness_line_target: 1100
fitness_line_limit: 1467
fitness_char_limit: 200000
fitness_line_length: 100
lifecycle_model: >-
  canonical pending-graduations register — owner-gated and pending items live
  here until graduated, duplicated, stale-withdrawn, or owner-resolved
access_pattern: >-
  consolidation-pass-only — read at consolidations and drain sessions; not
  loaded every session by every agent
drain_strategy: >-
  Graduate items to PDRs/ADRs/rules/permanent docs; keep owner-gated items here
  until owner direction resolves them; do not split, shard, or hide buffer depth
fitness_rationale: >-
  Fitness on a drainable buffer is a drain-cadence signal, not a size cap. The
  register reads `hard` while an owner-gated backlog waits to be walked down with
  the owner present; it goes green when the backlog is genuinely graduated, not by
  tombstone-removal. Fitness here is informational-only (not wired into any
  commit/push hook), so a standing `hard` never blocks a commit and must be
  reported, not chased: owner-gated items that legitimately wait are never trimmed
  to clear it. Materialised fresh in castr by the Practice transplant (Phase 6,
  2026-06-18); the register starts near-empty and is populated by napkin drains and
  consolidation passes.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Pending Graduations

This is the canonical pending-graduations register. Do not create dated,
windowed, backlog, split, or shard-like pending-graduation files. New capture,
owner-gated items, and unresolved pending-graduation decisions belong here until
they graduate, duplicate, become stale-withdrawn, or receive owner direction.

Each entry should record: the captured substance, its candidate permanent home
(PDR / ADR / rule / distilled / pattern / README), and a
`[captured: <date> | source: <surface>]` provenance stamp. When an item
graduates, route its substance to the permanent home and remove it here — the
commit and the permanent doc are the record (no tombstone; see the
[consolidation-record rule](../../rules/permanent-doc-is-the-consolidation-record.md)).

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr. Items below are populated by napkin drains and consolidation passes
> from castr's own state — not copied from any other repo.

<!-- Entries appended below by napkin drains and consolidation passes. -->

### Loop-closure completeness test + the "verify workflow output firsthand" sharpening

The loop-closure-as-completeness-test (doctrine→mechanism→wiring→signal) + the Class-B
false-claim failure mode + the sharpening that **an adversarially-verified workflow/subagent
bring-plan is still a claim to measure firsthand, especially for transitive dependencies** (the
audit-method-under-counts root recurs at the workflow-output level — worked LC1 instance: the
bring-plan missed the heartbeat-path writer dependency). Candidate permanent home: a **PDR-096
amendment** (or sibling PDR) graduated when the loop-closure remediation lane (LC0–LC5)
completes; the firsthand-verify sharpening may instead amend `verify-agent-claims-firsthand`.
Live in `distilled.md` (two entries) + `practice-loop-closure-remediation.md`.
`[captured: 2026-06-27 | source: distilled.md + practice-loop-closure-remediation.md]`
trigger-condition: loop-closure lane completes (all of LC0–LC5 + LC-reopen done; as of
2026-07-03 LC0/1/2/3a/3c are done — LC3b, LC3d, LC4, LC5 remain). status: pending.

### Verified-claims engineering (the unifying thesis of both products)

The 2026-07-04 review named the frame that unifies the compiler and the Practice: **a claim is
only as good as its machine-checkable proof** — product level (lossless/fail-fast must be proven
by round-trip + executed-validator suites; support claims computed as preservation coverage,
never asserted) and process level (green-gates-mask-gaps, prove-it-fires, loop-closure,
inherited-classifications are all instances of the same principle). Candidate permanent home: a
**pattern-PDR** ("verified-claims engineering" — likely subsuming or federating the
loop-closure/PDR-096 family) + the umbrella statement in the rebuilt VISION (overhaul plan §W1).
`[captured: 2026-07-04 | source: wide-deep-review-2026-07-04.md §6.4]`
trigger-condition: re-armed — **owner ruled 2026-08-27 (in-session, this consolidation
pass): hold to ride the W1 vision rewrite** — the pattern-PDR and its companion umbrella
statement land together when W1 runs. The 2026-08-23 walk's ratification stands as the
substantive go-ahead; W1 is now the landing vehicle, not a new decision gate.
status: pending (trigger: the W1 vision rebuild opens). Evidence a future agent can
check — the PDR does not exist in `.agent/practice-core/decision-records/`, and
`.agent/directives/VISION.md` does not yet describe both products.

### Autonomous-programme operating pattern → PDR

The `autonomous-background-programme` pattern (with `owner-decision-ballot` as its
decision-transport companion) is Practice-governance-grade: the operating shape for
unattended scheduled-session programmes — ballot front-loading, condition-based merge
authority, queue-as-frontmatter with durable counters, reports-follow-the-audience,
collision machinery for a shared remote, and the tap-to-answer owner ballot. Candidate
permanent home: a **PDR** once a second autonomous programme (or a second host repo)
consumes the pattern, or on owner direction. Live in `.agent/memory/active/patterns/`.
`[captured: 2026-08-23 | source: QD-6 landing (proof-programme)]`
trigger-condition: a second autonomous programme is stood up, or the owner directs
graduation.
status: pending.

### PDR-056 cloud-seat channel-availability extension

The 2026-08-27 ruling refinement (one agent per cloud instance; filesystem comms substrate
absent by construction; Slack via a live Watcher is the working cloud channel) is landed as
phenotype (commit skill + claims/comms rules) but not in the portable Core. Candidate
permanent home: a small extension to **PDR-056** (inter-agent collaboration protocol) so the
channel-availability fact travels with the Core. Core edits are owner-approved; the drafting
offer was made in-session 2026-08-27 and not yet answered.
`[captured: 2026-08-27 | source: consolidation session (Limpet guards Moorings), Core review step]`
trigger-condition: owner approves (or declines) the extension. status: owner-gated.

### IR persistence schema-versioning policy → ADR

Q-03 (2026-08-24 firing) landed hard version pinning at `serializeIR`/`deserializeIR`
(foreign versions rejected both directions, no migration machinery,
regenerate-from-source contract) via review convergence on PR #50 rather than an
upfront decision record. Candidate permanent home: an **ADR** stating the IR
persistence versioning policy, authored from the PR #50 thread record rather than
re-derived.
`[captured: 2026-08-24 | source: napkin (Luminous Waning Orbit)]` — registered here at the
2026-08-27 napkin rotation.
trigger-condition: the first time IR migration machinery or a multi-version read
window is proposed. status: pending.

### Slack-watcher skill: editable-deadman fallback for surfaces without message edit

The 2026-08-27 Watcher stand-up measured that the Slack MCP surface available to cloud
sessions has NO message-edit tool, making the skill's "EDIT the tenure status message every
tick" deadman unimplementable as written. The worked cure: a Slack **canvas** as the
always-current tenure status surface (created at stand-up, anchored from the intro's threaded
reply, edited every tick, final-edited at teardown — full tenure `F0BT7TXQ3PW` ran on it
end-to-end). Candidate permanent home: an amendment to
`.agent/skills/slack-watcher/SKILL-CANONICAL.md` §2/§3 naming the canvas fallback (or
per-tick threaded replies where canvases are unavailable) for surfaces lacking `chat.update`.
`[captured: 2026-08-27 | source: napkin (Slack Watcher stand-up entry) + tenure F0BT7TXQ3PW]`
trigger-condition: next slack-watcher skill edit, or the next Watcher stand-up on an
edit-capable surface (either confirms or retires the fallback shape). status: pending.

### Retrospective proposals, 20 September 2026 (value-proof arc)

Source record:
[why-the-zero-prs-arc-ended-plus-one-2026-09-20.md](../../reports/agentic-engineering/why-the-zero-prs-arc-ended-plus-one-2026-09-20.md),
which carries each proposal's warrant in full. `[captured: 2026-09-20 | source:
retrospective record]` Fast-lane rows, each with its expected effect and falsifier per
PDR-130:

- **R2, a review response that adds new code re-opens the PDR-132 second-story check.**
  Target: `pr-lifecycle` triage step. Effect: plan-class and record-class PRs on the
  castr-correction thread settle within the two-round budget. Falsifier: two such PRs
  exceed the budget with their evidence shipped separately. trigger-condition: the next
  `pr-lifecycle` edit, or the next review finding that asks for new tooling. status: pending.
- **R3, opening or driving a PR loads `pr-lifecycle` mechanically.** Target: a validator
  that fails a push when the branch's open PR has no REVIEW-TALLY comment. Effect: every PR
  born after it carries a tally from first triage. Falsifier: tallies exist and median
  rounds per PR does not fall at PDR-132's one-month measurement. trigger-condition: the
  next budget overrun, or the next agent-tools validator lane. status: pending.
- **R4, scripts cited as evidence are code, written probe-first.** Merges into the
  13 September candidate "a script cited as evidence must be shown exiting non-zero on a
  failing input" when PR #101 lands. Warrant, revised by the record's Addendum 1: the 5, 3,
  1 findings-per-round series measured what one bot raised per round, not what remained;
  the deep review of 20 September found six further defects in the same scripts, three
  reproduced in a disposable fixture. The probe-first segment lowered findings on the code
  it touched and did not make the scripts reliable. Effect: a probe-first evidence script
  carries no exit-status or inventory-correctness defect that a deep review can reproduce
  in a disposable fixture. Falsifier: the next deep review of a probe-first evidence script
  reproduces one such defect. status: re-evaluate against the next deep review before
  graduation.
- **R5, a handoff states whether its continuity is on `main`.** Target: `wrap` step 2 and
  `session-handoff` step 1. Effect: a successor branching from `main` finds live
  instructions within its start-right reads. Falsifier: a from-`main` session starts Q-07
  as container salvage after the amendment lands. trigger-condition: the next `wrap` or
  `session-handoff` edit. status: pending.
- **R6, correct the wrap skill's sentence that this estate has no retrospective skill.**
  The skill arrived in `3bdabb3c` on 24 August 2026. trigger-condition: the next `wrap`
  edit. status: pending.
- **R7, a scoped owner instruction is recorded with its scope.** Target: the napkin skill's
  owner-ruling capture shape. Effect: zero recorded scope generalisations in the next three
  sessions on the thread. Falsifier: one recurs with the capture discipline in force.
  trigger-condition: the next napkin skill edit or a third generalisation. status: pending.

## Slow lane

Rows here follow PDR-130 §Decision 2: a concept, its prediction, its falsifier and a
review date at which it is decided. They are not decision-debt in the drain metric.

### Nearest-proxy closure

Concept: under a demand to close (a stop instruction, a review thread, a session end) an
agent reaches for the nearest thing that can be recorded as done and treats recording it
as reaching the goal; an estate rich in registers and rules shortens the reach. Check:
every stop report, PR description and handoff on a thread with a stated terminal count
opens with that count, before and after. Comparison set, fixed before observations
accumulate: a comparable arc is a run of consecutive sessions on one thread that carries a
stated terminal count in its plan, spanning at least three sessions or two PRs, and ending
at an owner-declared stop or a merge; the 12 to 13 September arc on the castr-correction
thread is the baseline. A proxy-class correction is an owner message, recorded verbatim or
in substance in the napkin entry for that session, that rejects a closure claim because it
recorded something other than the stated count (a commit, a push, a PR, a document, a
container) as reaching the goal; the measurement source is the napkin entries of the
arc's sessions, counted by the reviewer at the review date and listed in the review note.
Prediction: proxy-class corrections fall from 8 in the baseline arc to 2 or fewer per
comparable arc. Falsifier: two comparable arcs with 5 or more proxy-class corrections while
the measure is present at the closure points. Source: the retrospective record above,
§Meta root.
`[captured: 2026-09-20]` review-date: 2026-12-20. status: open.
