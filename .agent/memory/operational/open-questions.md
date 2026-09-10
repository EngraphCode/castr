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

### Q-016: Orchestration above low-level conversion — direction resolved

- Raised by: C08 architecture review; owner decision recorded 6 September 2026.
- Context: separate orchestration from low-level conversion utilities, then make
  the architectural gate effective. Resolver wiring, dependency policy and
  prohibited-import proof land together. The applicable local architecture record
  is ADR-037; the original question's ADR-036 reference was mistaken.
- Why deferred: the direction is answered, while implementation remains a bounded
  architecture repair and cannot be represented by a documentation-only status change.
- Suggested resolution path: deliver the complete C08 resolver, classification,
  dependency policy and prohibited-import proof together.
- Status: answered-in-place
- Linked: [C08 of the correction plan](../../plans/active/castr-documentation-and-fidelity-correction.md#fidelity-repair-families-and-describing-surfaces)
  and the [conserved original question](archive/q016-direction-2026-09-06.md).

### Q-017: OpenAPI 3.0 `enum:[null]` without `nullable:true` — owner semantics ruling required

- Raised by: PR #15 review round and PR #10 commit
  `a0a1dda1573cb933b5d97d5471c1e9193c9ef4a2`, 18 July 2026. This was Q-016
  on the retained PR #10 source branch; it is renumbered because current Q-016
  owns the distinct orchestration direction.
- Context: should an OpenAPI 3.0 schema containing `enum: [null]` without
  `nullable: true` treat null as accepted at the parse boundary? The recorded
  default applies strict conjunction: the null member is dead under a
  non-nullable type. The other candidate policies are lenient inference, or
  fail-fast rejection of the contradictory input.
- Why deferred: the choice changes user-visible generated output and requires an
  owner semantics ruling; this custody pass does not decide it by analogy.
- Suggested resolution path: decide the policy once at the OpenAPI 3.0 parser
  boundary so every writer inherits the same rule, then add separating parser and
  writer proofs for the chosen semantics.
- Status: open
- Linked: finding `PR10/enum-null-policy-decision` in the
  [correction findings manifest](../../plans/correction-manifests/castr-correction-findings.json)
  and the [immutable source question](https://github.com/EngraphCode/castr/blob/2baa1ba50c97a0740c8a3d055bd8a8ca491363d5/.agent/memory/operational/open-questions.md#L89).

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling,
hook-matcher precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
