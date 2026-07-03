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
commit and the permanent doc are the record (no tombstone; see
[`permanent-doc-is-the-consolidation-record`](../../rules/permanent-doc-is-the-consolidation-record.md)).

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
