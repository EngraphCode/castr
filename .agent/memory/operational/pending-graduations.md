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
trigger-condition: overhaul plan W0 walk ratifies the frame (Q-012..Q-015), or the
doctrine-claims validator (W3) lands — whichever first gives the thesis an enforced instance.
status: pending.

### Generator-output must be formatter-stable (fixpoint contract)

Any generator whose output lands in a prettier-formatted tree must emit formatter-stable bytes,
or pre-commit auto-format re-drifts the artefacts and the drift gate refuses every subsequent
push (worked castr instance: skills-adapter YAML quoting, two refused pushes, 2026-07-03;
cure recipe: prettier-check the generator OUTPUT inside the generator's own tests). Candidate
permanent
home: a **generator-fixpoint clause** in the relevant validator/generator doctrine (PDR-096
family or a testing-strategy corollary) + the generator-side quoting fix.
`[captured: 2026-07-03 | source: napkin part-3 + PR #4 push refusals]`
trigger-condition: a 2nd generator-formatter fixpoint instance, or the generator-side fix lands.
status: pending.

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

### Cloud single-agent sessions skip commit-queue/comms ceremony (owner ruling)

Owner ruling 2026-08-25 (in-session; verbatim substance in the napkin's 2026-08-25
entry): cloud environments with a single agent do not need commit queues, and until
the Slack work completes cannot partake in comms — that ceremony can and should be
skipped in such sessions. Candidate permanent home: a cloud-single-agent clause in
the commit skill canonical (§Commit Queue And Window Protocol) plus the
claims/comms session-open and session-close rules; the blocking husky gates are
untouched by the ruling.
`[captured: 2026-08-25 | source: napkin 2026-08-25 (Sardine turns Coral)]`
trigger-condition: already fired (unconditional owner ruling); lands at the next
consolidation pass or the next session touching those canonicals.
status: due.

### Single environment definition serves every Practice repo (owner ruling)

Owner ruling 2026-08-25 (in-session to the PR-drive seat, Kraken calls Abyss
0178h2): "We are going to use a single environment definition for both OCE and
Castr instances." This repo's
`.agent/claude-harness-integrations/cloud-environment.md` (post PR #58) is the
definition of record for BOTH estates. Candidate permanent home: a scope
statement in that document's preamble naming every Practice repo as its
consumer, plus the OCE environment doc becoming a GitHub-URL pointer at it
(the OCE half is routed in OCE's 2026-08-25 closeout napkin entry).
`[captured: 2026-08-25 | source: owner word, PR-drive session (napkin 2026-08-25 closeout entry)]`
trigger-condition: already fired (unconditional owner ruling); lands at the next
consolidation pass or the next session touching the environment doc.
status: due.

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

### Verify a bot-cited SHA exists before reading its argument

PR #69 round 6: a review bot re-raised an already-rejected finding citing "fresh evidence in
`5b63e55f`" — a commit that does not exist anywhere in the repository (`git cat-file -t`
fails). Sharpens verify-the-reviewer's-warrant: for any bot finding whose evidence is a
commit SHA, `git cat-file -t <sha>` FIRST; a nonexistent object voids the finding and is the
non-convergence signal that invokes the review cap. Candidate permanent home: a sharpening of
the review-bot convergence-cap doctrine (ADR-051 clause 4 family / the
autonomous-background-programme pattern item 8) or `verify-dont-trust`.
`[captured: 2026-08-27 | source: napkin (PR #69 review-drive entry) + PR #69 thread r3872515171]`
trigger-condition: second fabricated-citation instance, or the next convergence-cap doctrine
edit. status: pending.
