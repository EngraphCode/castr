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

Entries follow the practice-substrate evaluator contract
(`agent-tools/src/practice-substrate/open-questions-evaluator.ts`): a heading of
exactly `### Q-NNN: <title>`, then the six required bullet fields `- Raised by:`,
`- Context:`, `- Why deferred:`, `- Suggested resolution path:`, `- Status:`,
`- Linked:`. The status value's first word must be one of `open`,
`answered-in-place`, `surfaced-to-owner`, `withdrawn`. (Shape reconciled
2026-07-18, PR #10 round 9 — the previous em-dash headings and prose bodies were
invisible to the evaluator's discovery regex, so the register read as silently
green with zero entries.)

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr; entries are populated from castr's own state by the Phase-6 napkin
> drain and later consolidation passes — not copied from any other repo.

<!-- Q-entries appended below by drains and consolidation passes. -->

### Q-012: Name and boundary of the second product (agent-tools + Practice kernel)

- Raised by: `wide-deep-review-2026-07-04.md` §6.2 + owner overhaul directive (captured 2026-07-04)
- Context: the agentic-engineering estate (~2× the compiler's size, Oak back-flow proven) has no
  product identity. Fork/determination split (2026-07-06, assumptions-expert fold): the NAME is
  the genuine owner fork (constitutively yours); keep-in-repo + ADR-048-style value-gated
  extraction criteria are lens-settled determinations executed under the walk's acknowledgement.
- Why deferred: shapes investment, extraction criteria, and what "Oak parity" means once flow
  reverses; the naming fork is constitutively the owner's, gated on the W0 walk.
- Suggested resolution path: owner names the product at the W0 walk; the determinations execute
  under that acknowledgement.
- Status: open (owner walk — the naming fork)
- Linked: [`strategy-vision-estate-overhaul.md`](../../plans/future/strategy-vision-estate-overhaul.md) §W0

### Q-013: Vision topology — umbrella + two product visions, or a split

- Raised by: `wide-deep-review-2026-07-04.md` (captured 2026-07-04)
- Context: one VISION.md currently describes one product; the repo holds two. Recommendation was
  umbrella (verified-claims thesis) + one vision surface per product.
- Why deferred: originally held for the W0 owner walk; dissolved instead via the Four-Lens test.
- Suggested resolution path: execute at W1 under the W0 walk's acknowledgement, not owner-gated;
  kept here until the walk acknowledges it (no tombstone after).
- Status: answered-in-place — DISSOLVED to a determination (2026-07-06, assumptions-expert fold
  via the Four-Lens test / PDR-057): the topology follows deductively from single-source +
  impact-before-activity with no divergent product outcome.
- Linked: overhaul plan §W0/§W1

### Q-014: Adopt preservation coverage % as product A's headline public metric

- Raised by: review §6.1, verb-model research verified (captured 2026-07-04)
- Context: computed support claims replace asserted ✅ tables; aligns remediation-02, the
  representability matrix, and the `check` verb.
- Why deferred: headline-metric adoption is an owner call at the W0 walk.
- Suggested resolution path: owner adopts (recommended) or declines at the walk.
- Status: open (owner walk)
- Linked: overhaul plan §W0/§W5

### Q-015: principles.md truthing batch (protected-file approval)

- Raised by: review R4/R5 (captured 2026-07-04)
- Context: fork/determination split (2026-07-06, assumptions-expert fold): the genuine fork is
  the M1/R5 choice — enforce the `Object.*`/`Reflect.*` FORBIDDEN rule via lint (recommended,
  per strictest-of-three; 147 product-code uses today), or owner amends the doctrine. The
  staleness edits (the falsified §Tooling Integration TSDoc claim etc.) are determinations
  forced by strictest-of-three, executed under the protected-file approval the walk grants in
  one batch.
- Why deferred: principles.md must not be edited without explicit owner approval; the M1/R5 fork
  and the batch approval both belong to the owner walk.
- Suggested resolution path: owner walks the M1/R5 fork and grants the batch approval; the
  truthing batch executes in one pass.
- Status: open (owner walk — the M1/R5 fork + the batch approval)
- Linked: overhaul plan §W3 + remediation 06

### Q-016: Should OpenAPI 3.0 `enum: [null]` without `nullable: true` imply nullable at the parse boundary?

- Raised by: PR #15 review round, lane L-K3+K5+K7, commit 72939c9a (captured 2026-07-18)
- Context: the TS type-writer now applies strict 2020-12 conjunction semantics — a null enum
  member under a non-nullable type is a dead member (drops from the literal union; a null-only
  enum emits `never`). The same question reaches the Zod writer (untouched `z.literal(null)`
  lines in the enum-null snapshot are the evidence). Three candidate policies: (a) strict
  conjunction (current recorded default — dead members drop); (b) lenient inference (treat the
  widespread real-world idiom as implying `nullable`); (c) strictest-of-three: fail fast at the
  parser on the contradiction, forcing the input to say what it means.
- Why deferred: a semantics ruling with user-visible output consequences — the owner rules;
  agents do not decide unilaterally (standing directive in the thread record).
- Suggested resolution path: owner rules the policy; whichever is chosen lands ONCE at the
  parser boundary and both writers inherit it; if (b) or (c), a small parser-lane change +
  writer snapshot updates follow as a named micro-lane.
- Status: open (owner semantics ruling; current default = (a) strict conjunction)
- Linked: PR #15 review threads; `threads/remediation-parallel-program.next-session.md`

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

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling,
hook-matcher precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
