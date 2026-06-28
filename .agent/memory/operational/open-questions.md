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

_Register empty (2026-06-26). Q-006 graduated to ADR-049; Q-007 decided by the owner (markdown-links gate
end-state → scoped-blocking on transplant-completed surfaces, recorded in the transplant-completeness plan
TC3b). The permanent homes are the record, not a tombstone here. New questions are appended below by future
drains and consolidation passes._

### Q-008 — should the machine-local-paths invariant also clean `archive/` before any publish?

`Captured: 2026-06-28 | source: LC3a (machine-local-paths validator) consolidation`

**Question:** the `no-machine-local-paths` rule's own Detection scope exempts `archive/` (frozen historical
records), and the LC3a validator + write-time guard honour that exemption. But archived napkins still contain
real user-home segments (e.g. `/Users/<user>/...`) that would leak a username (PII) if the repo is ever made
public. Should there be a publish-time (or pre-publish) pass that de-PII's archives, or is the archive-exemption
acceptable because castr is private?

**Why it shapes future work:** it is a release/publication-boundary decision (affects whether a public-repo move
needs an archive-scrubbing step), and it is the kind of latent PII exposure that is cheap to fix before publish
and expensive after.

**Why not cheaply answerable now:** depends on the owner's intent for ever publishing this repo, and on whether
archives should be rewritten (history-altering) vs scrubbed-at-export. Owner-decision-class.

**Owning artefact:** the `no-machine-local-paths` rule + the LC3 lane (`practice-loop-closure-remediation.md`).
**Status:** open — surfaced to owner at the LC3a closeout (2026-06-28).

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling, hook-matcher
precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
