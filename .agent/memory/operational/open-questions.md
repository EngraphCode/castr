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
- **Status:** ✅ RESOLVED (owner challenge + firsthand measurement, 2026-06-21). The "wait for a sonarjs TS-6 peer"
  framing was WRONG. Measured: `eslint-plugin-sonarjs@4.1.0` (latest) STILL declares `typescript: ">=5"` as a regular
  **dependency** (not a peer), so it keeps pulling its own TS copy — bumping sonarjs does NOT retire the override. TS 6 is
  not the problem (SonarQube Cloud, a different product, runs TS 6 fine); the dual-TS-instance TypeFlags skew is. **The
  single-TS pnpm override is the correct PERMANENT fix** (pre-override lock had 80 `typescript@5.9.3` refs incl. sonarjs's
  own; post-override has zero). Optional refinement: adopt a pnpm `catalog` as the single-source mechanism. The only
  (~indefinite) event that would change this is sonarjs moving `typescript` to a peer dep. Drainable.

## Q-003 — Wire the PDR-027 statusline now, or defer to the friction tranche?

- **Captured:** 2026-06-20 (first director-led concurrent stream; owner Q2).
- **Question:** castr transplanted the statusline renderer (`agent-tools/src/claude/statusline-*`, built + chmod +x) but
  NOT the `.claude/` wiring Oak has at the pin: `.claude/scripts/statusline-identity.mjs` (a soft-fail shim spawning the
  built adapter — castr has **no `.claude/scripts/` dir**) + the `statusLine` block in `.claude/settings.json`. Should
  these two pieces be brought now (a ~2-file copy from the Oak pin, routable to a seat), or deferred?
- **Why it shapes future work:** PDR-027 identities resolve under the hood (the SessionStart hook sets
  `PRACTICE_AGENT_SESSION_ID_CLAUDE`) but are **invisible in every session's status bar** — so "no one has a visible
  agent identity," which directly degrades multi-agent legibility (the owner's Q2). It is a clean transplant-completion
  gap, in scope for "fix castr's known issues."
- **Why not cheaply answerable now / why owner-owned:** it modifies the **owner's harness config**
  (`.claude/settings.json` changes how the owner's own Claude Code sessions render); the Director declined to touch it
  unprompted.
- **Owning artefact / home:** `.claude/settings.json` + a new `.claude/scripts/statusline-identity.mjs`; Oak pin
  `practice/castr-pin:.claude/scripts/statusline-identity.mjs` is the source. Recorded in
  [`repo-continuity.md §Open Owner-Decision Items`](repo-continuity.md).
- **Status:** ✅ RESOLVED (owner, 2026-06-20 — "fix now", Lane 3). Both wiring pieces landed on
  `feat/transplant-engraph-practice`: new `.claude/scripts/statusline-identity.mjs` (soft-fail shim, ported verbatim from
  the Oak pin after confirming it is generic) + a top-level `statusLine` block in `.claude/settings.json`. Verified
  firsthand end-to-end (8 adapter/shim invocations: full payload renders `Stormy Sailing Archipelago ➜ castr
git:(branch) ✗ ctx:N% [model]`; empty stdin + missing adapter both soft-fail to silent exit 0; `CLAUDE_PROJECT_DIR`
  override resolves). Gates green: format/lint/portability/skills/repo-validators/madge:orphans/knip. Reviewed
  config-expert (PASS) + code-reviewer (PASS), both load-bearing claims re-verified firsthand. **Optional hardening
  follow-up** (both reviewers, independently): a `validate-statusline-routing` validator asserting
  `settings.json.statusLine.command` → an extant shim whose adapter target resolves — captured in `pending-graduations.md`
  (out of scope for the wiring itself; routable to the friction-fix tranche).

## Q-004 — Release automation: semantic-release (Oak parity) vs changesets?

- **Captured:** 2026-06-20 (arc-D3 stream; Director ruling comms `fa53d0af`).
- **Question:** castr has **no release tooling** (no `.changeset`, no changesets/semantic-release in any package.json, no
  `release` script); the inherited `publish.yml` invoked a non-existent `pnpm release` and was **removed** in the D3
  slice (fail-fast; a disabled stub would be a tombstone). What release path should castr adopt — semantic-release (Oak
  parity) or changesets — and when?
- **Why it shapes future work:** without release automation there is no publish path; the choice is cross-surface
  (package.json + config + a CI release job) and sets the delivery story.
- **Why not cheaply answerable now / why owner-owned:** it is a release-strategy decision the owner owns, cross-surface
  beyond any single lane, and delivery is currently deprioritised ("not in a rush to merge").
- **Owning artefact / home:** the **release-automation deferred lane** in
  [`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md) +
  [`delivery-ledger.md`](../../plans/delivery-ledger.md).
- **Status:** ✅ RESOLVED (owner, 2026-06-21) — **changesets.** Lower-ceremony, single-package/monorepo-friendly fit;
  semantic-release was considered (Oak parity) but heavier. Execution stays deferred until delivery is on the table
  (delivery deprioritised). The release-automation lane in the thread record now carries `tooling = changesets`. Drainable.

## Q-005 — Tighten the `stress-ng` host-load matcher to word-boundary (parity-or-better refinement)?

- **Captured:** 2026-06-21 (Oak parity Tranche 2 / A2 hook-policy; config-expert measured + metacognition surfaced).
- **Question:** the four host-load shapes in `policy.json` all use `match: "substring"` (whitespace-stripped raw
  `includes`). For `for(;;)` / `while(1)` / the fork bomb this is **correct** — they hide inside one quoted token with no
  clean word boundary. But `stress-ng` is a binary NAME, and substring mode also blocks benign substrings
  (`libstress-ng`, `apt install …`, a path/test containing `distress-ng`). Should `stress-ng` specifically move to a
  word-boundary/token match — catching `stress-ng --cpu 8` and `./tools/stress-ng` while sparing benign substrings?
- **Why it shapes future work:** the owner directive is parity-**or-better** ("not meant to stay simple"); this is a
  candidate "better-than-Oak" precision improvement to the innate-immunity matcher. It would add a per-pattern matcher
  variation beyond the Oak pin, so it is a deliberate-divergence decision, not a bug fix.
- **Why not cheaply answerable now / why owner-owned:** it trades pin-fidelity + matcher simplicity against precision;
  PDR-044 names innate-layer false positives a design property and the deny TEACHES + is overridable, so the current
  Oak-faithful behaviour is defensible. The owner weighs whether "better-than-Oak precision" is worth the divergence.
- **Owning artefact / home:** the `stress-ng` ACCEPTED decision in
  [`oak-parity-program.md`](../../plans/transplant/oak-parity-program.md) §Tranche-2 firsthand verification; the matcher
  lives at `agent-tools/src/hook-policy/blocked-patterns.ts`.
- **Status:** ✅ RESOLVED (owner, 2026-06-21) — **INVEST in precision** (overrode my "keep Oak-faithful"
  recommendation). Build word-boundary matching for binary-name patterns (`stress-ng`) + command-position anchoring for
  the git over-match family (N7/N11), RED-first against the founding false positives, **with comprehensive Oak back-flow
  notes** so the precision returns upstream (castr improves Oak, not just consumes it). Substring stays correct for the
  shapes that genuinely hide inside one quoted token (`for(;;)`/`while(1)`/fork bomb). Now a tracked work item — the
  hook-matcher-precision lane in the thread record; folds the N7/N11 pending-graduation item. Drainable.
