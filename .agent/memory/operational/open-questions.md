---
fitness_line_target: 180
fitness_line_limit: 240
fitness_char_limit: 14000
fitness_line_length: 100
drain_strategy: >-
  Surface owner-decision items during consolidate-docs; move answered or
  withdrawn entries to an archive when the register needs rotation.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Open Questions

Register of non-urgent unresolved planning, design, or process questions —
questions that shape future work but do not block any current cycle. Urgent
or cycle-blocking questions belong in the active plan or an owner escalation,
not here. Answered or withdrawn entries are drained at `consolidate-docs`.

Each entry should carry: a `Q-NNN` id, a `Captured` provenance stamp, the
question, why it shapes future work, why it is not cheaply answerable now, its
owning artefact / discussion home (if any), and a status line.

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr; entries are populated from castr's own state by the Phase-6 napkin
> drain and later consolidation passes — not copied from any other repo.

<!-- Q-entries appended below by drains and consolidation passes. -->

## Q-001 — Transplant PR delivery strategy + D3-before-merge timing

- **Captured:** 2026-06-18 (strategic-assessment pass, Phase 6).
- **Question:** At transplant close, does the single-branch work land as **one PR to
  `main`** (currently ~74 commits / 743 files / +102k lines, per the delivery ledger),
  or as a **staged / stacked merge** for reviewability — and should **D3** (CI brought
  to the Oak standard, so CI actually runs `check:ci`) land **before** that merge?
- **Why it shapes future work:** castr's CI today runs only `build` + `test`, not the
  `check:ci` gate chain, so the per-phase `check:ci` discipline has been **local-only**;
  the eventual merge to `main` would currently carry no CI gate enforcement, and a
  100k-line PR is effectively un-reviewable. The answer sets the close sequence (D3
  relative to the PR) and the PR shape.
- **Why not cheaply answerable now:** it is a transplant-close / Phase-9 decision; the
  diff size and arc-D3 scope are still growing, and sequencing within the arc is
  owner-directed at execution.
- **Owning artefact / home:** [`delivery-ledger.md`](../../plans/delivery-ledger.md) +
  transplant tracker §Deep-enhancement arc **D3**.
- **Status:** RESOLVED (owner, 2026-06-19 s3) — **D3 before the merge, split PRs.** Land D3
  (CI runs the full `check:ci` chain, SHA-pinned actions) **before** the transplant merge, and
  split the ~100k-line transplant into reviewable PRs rather than one un-reviewable PR. This
  removes the ungated-big-merge risk and makes review tractable. Execution is the transplant-close
  / arc-D3 sequence; this entry records the decision and is drainable at the next `consolidate-docs`.
  Not a reopening of the single-branch decision (owner, 2026-06-15).

## Q-002 — Retire the single-TypeScript pnpm override once sonarjs ships a TS-6 peer

- **Captured:** 2026-06-19 (session 3, D1 resolution).
- **Question:** The D1 fix pins `typescript` workspace-wide via a `pnpm-workspace.yaml`
  override because `eslint-plugin-sonarjs@4.0.3` resolves its own bundled TS (5.9.3) and the
  `TypeFlags` skew vs the workspace 6.0.3 made its type-aware rules mis-fire. When sonarjs ships
  a release that declares a TypeScript-6 peer (or otherwise resolves the workspace TS), should the
  override be **retired** so version resolution is driven by declared peers rather than a pinned
  literal — and is a pnpm **catalog** the better single-source mechanism than the version pin?
- **Why it shapes future work:** the override is a workaround for an upstream packaging gap; the
  clean end-state is sonarjs resolving the workspace TS natively. Leaving the pin indefinitely is a
  silent literal that must be bumped in lockstep with every TS major (a drift surface).
- **Why not cheaply answerable now:** depends on an upstream sonarjs release that does not yet exist;
  re-evaluate at a dependency-cooldown/`pnpm outdated` pass.
- **Owning artefact / home:** `pnpm-workspace.yaml` (the override + its comment) + the D1 ADR
  candidate in [`pending-graduations.md`](pending-graduations.md).
- **Status:** OPEN — watch for a sonarjs TS-6-peer release; low priority.
