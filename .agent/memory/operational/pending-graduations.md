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
(PDR / ADR / rule / distilled / pattern / README), why it is owner-gated or
pending, and a `[captured: <date> | source: <surface>]` provenance stamp. When
an item graduates, replace it with a one-line tombstone naming where it landed
(commit / permanent doc) so a future drain does not re-capture it.

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr. Items below are populated by the Phase-6 napkin drain and subsequent
> consolidation passes from castr's own state — not copied from any other repo.

<!-- Entries appended below by napkin drains and consolidation passes. -->

## 2026-06-18 capture (Phase-6 session-completion consolidation)

- **Single-stream continuity scale — the repo-continuity Active-Threads row IS
  the record; per-thread `next-session.md` records deferred until concurrent
  threads arise.** Candidate home: a **PDR-027 amendment** (or clause) extending
  the 2026-04-21 workstream-retirement logic from the workstream layer to the
  thread-record layer — at 1:1 thread↔stream scale a separate per-thread file
  pays coordination cost without structural value, so the identity attribution
  folds into the repo-continuity row. **Owner-gated:** PDR amendment is owner
  governance; also part of the periodic PDR-currency sync (D4/P9), so route there
  rather than authoring a one-off.
  `[captured: 2026-06-18 | source: repo-continuity block-f + this consolidation]`
- **Pattern: a transplanted surface carries the source repo's phenotype — read
  the body, reconcile per-surface, and _regenerate_ host-estate catalogues
  rather than localise them.** Multi-instance, proven every transplant phase
  (P3 portability; P4 a KEEP-classed rule contradicting principles + false
  §-cites; P5 a false TDD cite; P6 an Oak relative-path depth bug + the
  three-forms-aspirational index + regenerate-not-localise catalogues). Candidate
  home: a `.agent/memory/active/patterns/` instance, or a PDR with
  `pdr_kind: pattern` if it generalises beyond the transplant. **Pending:** the
  instances are conserved in `distilled.md` §Transplant method; this is the
  graduation-upward step, owner-confirmable at a dedicated-curation pass.
  **New instances (2026-06-19 s2, sub-agent roster):** (a) the negative-space sweep
  of the host's OWN rules before a DON'T-BRING verdict — castr's `invoke-*` rules
  already required experts whose templates did not exist (completing a half-built
  system, not a free choice); (b) author reviewer templates NATIVE to the host, not
  copy-and-AMEND the source's, because a template instructs against a real estate.
  `[captured: 2026-06-18, extended 2026-06-19 | source: distilled.md §Transplant method]`

## 2026-06-19 capture (session 3 — Phase-6 close)

- **ADR candidate: pin a single workspace TypeScript via a `pnpm-workspace.yaml`
  override.** castr-local toolchain decision (genuine local need → ADR, not a
  portable PDR, per PDR-079): `eslint-plugin-sonarjs` bundles its own TypeScript
  (`>=5` → 5.9.3) while the workspace runs 6.0.3, and the two releases renumber
  `ts.TypeFlags`, so the plugin's type-aware rules masked the wrong bits and
  mis-fired (the D1 126-violation arc). The fix pins `typescript` to one version
  workspace-wide. **graduation-target:** a castr ADR recording the decision +
  rationale + the revisit trigger (sonarjs ships a TS-6 peer, or root TS major
  changes). **trigger-condition:** a second cross-tool version-skew incident, OR
  a curation pass, OR owner direction. **status:** pending — the decision is
  conserved in `pnpm-workspace.yaml` (comment) + `d1-sonarjs-findings.md` §0; the
  ADR is the graduation-upward step, not yet authored.
  `[captured: 2026-06-19 | source: d1-sonarjs-findings.md §0 + pnpm-workspace.yaml]`
- **GRADUATED 2026-06-20** (owner sign-off): the periodic `main`→branch sync-check
  doctrine landed as `delivery-ledger.md §Main→branch sync discipline` + the
  `repo-continuity.md §Repo-Wide Invariants` periodic-sync line (commit graduating
  phase-8 task-3b follow-on).
