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

## Q-007 — markdown-links validator: what gate end-state? (TC3b)

- **Captured:** 2026-06-26 (Coppery Warming Magma / 48b4a5), at TC3a close.
- **Question:** how should the ported `validate-markdown-links` validator relate to the gate long-term —
  (a) Oak-parity report-only in `repo-validators:check` (visible, never blocking, as Oak ships it),
  (b) scoped-blocking on transplant-completed surfaces via globs (catches new dangling refs there without
  requiring repo-wide zero), or (c) standalone-forever (run on demand, never in the gate)?
- **Why it shapes future work:** determines whether new dangling references are caught automatically and where,
  and whether the 225-link census must be burned to zero (a/blocking) or only its transplant-origin subset (b/c).
- **Why not cheaply answerable now:** TC3a deliberately deferred it — the census (just produced) is the input,
  and TC2/TC4 must run first to reveal how much of the 225 is transplant-origin vs pre-existing castr debt
  (non-goals exclude the latter). assumptions-expert flagged "wire blocking after repo-wide zero" as unsupported
  (Oak never burned its own backlog).
- **Home:** [`../../plans/transplant/transplant-completeness-supporting-infrastructure.md`](../../plans/transplant/transplant-completeness-supporting-infrastructure.md) TC3b.
- **Status:** open — owner-decision-class once TC2/TC4 reveal the transplant-origin subset size.

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling, hook-matcher
precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
