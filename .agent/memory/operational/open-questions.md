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

_Q-012..Q-015 drained 2026-08-27: all four were decided or acknowledged by the owner's
2026-08-23 interactive walk. Verdicts (second product named "the Practice"; umbrella vision
topology; preservation-coverage % adopted; `Object.*`/`Reflect.*` ban lint-enforced) ride
the [overhaul plan](../../plans/future/strategy-vision-estate-overhaul.md) preamble +
decision table as the interim record until W1 lands their durable doctrine homes —
VISION.md/IDENTITY.md and the verified-claims pattern-PDR, which the owner held to ride W1
(2026-08-27; that dependency is tracked owner-visibly in pending-graduations). The plan
must not archive before W1 conserves the verdicts._

_Register emptied 2026-06-26 and again 2026-07-03. Q-006 graduated to ADR-049; Q-007 decided
(markdown-links gate end-state → scoped-blocking, transplant-completeness plan TC3b); Q-009
(PDR mapping-table) and Q-011 (Axis A first) decided and drained 2026-07-03 (homes: the
gap-rescan doc; repo-continuity). Q-008 decided mechanise-now → owned by
`plans/current/archive-pii-scrub.md` (full tool, two-layer publish precondition). Q-010 ruled
by the owner — Result and fail-fast COMPOSE (`Result<T,E>` is the correct pattern, fail-fast
required everywhere), FULL reach: the use-result-pattern bring + D4 seam migration are named
items in the gap-rescan backlog §Owner-ruling additions. The permanent homes are the record,
not a tombstone here. New questions are appended below by future drains and consolidation
passes._

### Q-016 — Un-blind the boundaries gate: restructure conversion, or widen ADR-036?

Captured: 2026-08-26 (dependency-currency reopening, PR #62; measured firsthand at
boundaries v6 AND v7). The ADR-036 "strict architectural domain boundaries" gate has
been blind since installation: the plugin reads the classic `import/resolver` settings
key, castr sets only `import-x/resolver`, so ESM `.js`-suffixed imports never resolve
and every intra-src dependency classifies as unknown. The one-line cure
(`'import/resolver': { typescript: { alwaysTryTypes: true } }` in the boundaries
settings block, documented in `lib/eslint.config.ts` beside the gap) un-blinds the
gate — and the live gate then reports 3 real violations: `conversion/typescript`
imports parsers + writers, `conversion/zod` imports parsers (value imports; the
conversion layer composes parser+writer against its declared allow-matrix). The fork:
restructure the conversion layer to honour the declared matrix, or amend ADR-036's
matrix to name conversion as a legitimate composition layer. Owner-shaped because
either answer amends the architecture doctrine; not cheaply answerable in a
dependency lane. Owning artefact: `lib/eslint.config.ts` settings-block comment +
the completed dependency-currency plan's routed-findings section. Status: OPEN —
the resolver wiring lands with whichever answer is chosen, and the gate is not
"enforced" until then.

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling,
hook-matcher precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
