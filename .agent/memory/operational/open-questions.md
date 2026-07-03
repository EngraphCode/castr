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

_Register emptied 2026-06-26. Q-006 graduated to ADR-049; Q-007 decided by the owner
(markdown-links gate end-state → scoped-blocking on transplant-completed surfaces, recorded in
the transplant-completeness plan TC3b). Q-009 and Q-011 were decided by the owner and drained
at the 2026-07-03 pass (homes: the gap-rescan doc's mapping-table note; repo-continuity's
Axis-A-first block). The permanent homes are the record, not a tombstone here. New questions
are appended below by future drains and consolidation passes._

### Q-008 — should the machine-local-paths invariant also clean `archive/` before any publish?

`Captured: 2026-06-28 | source: LC3a (machine-local-paths validator) consolidation`

**Question:** the `no-machine-local-paths` rule's own Detection scope exempts `archive/` (frozen
historical records), and the LC3a validator + write-time guard honour that exemption. But
archived napkins still contain real user-home segments (e.g. `/Users/<user>/...`) that would
leak a username (PII) if the repo is ever made public. Should there be a publish-time (or
pre-publish) pass that de-PII's archives, or is the archive-exemption acceptable because castr
is private?

**Why it shapes future work:** it is a release/publication-boundary decision (affects whether a
public-repo move needs an archive-scrubbing step), and it is the kind of latent PII exposure
that is cheap to fix before publish and expensive after.

**Why not cheaply answerable now:** depends on the owner's intent for ever publishing this
repo, and on whether archives should be rewritten (history-altering) vs scrubbed-at-export.
Owner-decision-class.

**Owning artefact:**
[`../../plans/current/archive-pii-scrub.md`](../../plans/current/archive-pii-scrub.md).
**Status:** **DECIDED 2026-07-03 (owner, at the consolidation owner-walk) → mechanise the
scrub now.** The executable plan (two-layer precondition: working-tree scrub tool now;
history-level scrub or explicit exposure-acceptance at publish time — a working-tree scrub
cannot clean git history) is the owning artefact above. One sub-fork re-asked (tool shape:
rewriting scrub / detector-only / plan-first); the plan is required under every answer and is
authored. (Drained at next consolidate-docs once the shape answer lands.)

### Q-010 — reconcile principles.md `Result<T,E>` examples with castr's fail-fast doctrine

`Captured: 2026-06-28 | source: Oak→castr gap rescan (use-result-pattern reclassification)`

**Question (original):** `.agent/directives/principles.md` carries `Result<T,E>` examples
while several castr dispositions were made on we-are-fail-fast-therefore-no-Result grounds
(the D4 lane reconciled Oak's Result-based modules to typed throws; Oak's
`use-result-pattern` rule was classified a deliberate non-bring).
**RULED 2026-07-03 (owner, verbatim substance):** _"Result in no way precludes fail fast,
Result<T,E> IS the correct pattern, and fail fast is absolutely required everywhere."_ The
"tension" was a false dichotomy — Result and fail-fast COMPOSE; principles.md's examples are
CORRECT and stand unchanged. **Remaining open sub-question (narrowed):** how far does the
ruling reach retroactively — bring the `use-result-pattern` rule? queue a migration of the D4
throw-based reconciliation (and similar seams) to `Result<T,E>`? or forward-only? Asked
2026-07-03 (owner away; re-ask queued). **Owning artefact:** `principles.md` (ruling) + this
entry (scope). **Status:** open-narrowed — scope-of-reach is the only remaining fork; the
doctrine itself is settled.

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling,
hook-matcher precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
