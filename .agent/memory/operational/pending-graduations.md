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
