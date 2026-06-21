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

## dependency-currency-discipline → PDR (candidate)

- **Substance:** a reusable method for keeping a types/codegen library's dependency estate current without
  regressing type fidelity, executed firsthand 2026-06-21 (DC0/DC0b/DC6/DC7/DC8). The method: split bumps by
  **type/emission/runtime-risk, not semver size**; classify each dep by its **actual call-sites firsthand**,
  not its reputation as "tooling"; **one type-affecting major per commit**; **capture an emitted/CLI baseline
  BEFORE install, diff AFTER** (a non-empty diff is STOP-and-understand); for tooling whose changelog is poorly
  version-mapped, the **empirical consumer-side test** is the decisive proof; **roll-forward-only** (revert a
  bad bump with a forward commit).
- **Home (owner-decided 2026-06-21, four-lenses pass):** a **practice-core `pdr_kind: pattern` PDR** in
  `.agent/practice-core/decision-records/` — portable (this is how any Practice-bearing repo should run
  dependency currency) and **Oak-bound** (flows back via the bidirectional-node policy). Currently captured in
  [`../../plans/current/dependency-currency.md`](../../plans/current/dependency-currency.md) (controlling) +
  five `distilled.md` entries.
- **Trigger (sharpened, owner-decided 2026-06-21):** graduate at **dependency-currency lane close — after the
  full DC2–DC5 emission tier completes** (not now). Rationale: DC1 (crown jewel, 2026-06-21) is the confirming
  second execution, but DC2 (IR-input vendor reconciliation) and DC3 (emission-formatter diff) still exercise
  parts of the method DC1 did not, and lane-close is the natural conservation moment (the plan moves to
  `complete/`, which would otherwise orphan the method). Instances so far: the low-risk tier
  (DC0/DC0b/DC6/DC7/DC8) and the DC1 emission crown jewel.
- `[captured: 2026-06-21 | source: dependency-currency lane (Woodland Bending Glade / dc3825); home+trigger sharpened 2026-06-21 (Soaring Lifting Current / f7e30d, owner four-lenses pass)]`
