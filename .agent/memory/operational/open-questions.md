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

## Q-006 — Should castr pin `@types/node` to its runtime major, or chase latest?

- **Captured:** 2026-06-21 (dependency-currency DC6, Woodland Bending Glade / dc3825).
- **Question:** `@types/node` is dev-only (castr's own type-checking; not shipped). DC6 bumped it 25→26 while
  `engines.node` is `24.x`, so the typings now sit two majors ahead of the runtime. Policy: "track the runtime
  major" (pin `@types/node` to `^24`) or "chase latest" (current)?
- **Why it shapes future work:** governs every future `@types/node` bump and the dev-types-vs-runtime posture;
  a "track runtime" choice would also surface an `engines.node` floor alignment.
- **Why not cheaply answerable now:** a posture trade-off (newest-API typings vs runtime-accuracy guardrail),
  not a defect — needs an owner call. Low-stakes: `@types/node` is dev-only (cannot make castr ship or run a
  Node-26 API) and the Node-24 test suite already guards real runtime usage.
- **Home:** [`../../plans/current/dependency-currency.md`](../../plans/current/dependency-currency.md) §Progress (DC6 finding).
- **Status:** open — surfaced to owner at the 2026-06-21 dependency-currency handoff.

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling, hook-matcher
precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
