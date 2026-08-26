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

### Q-012 — Name and boundary of the second product (agent-tools + Practice kernel)

Captured: 2026-07-04 | source: `wide-deep-review-2026-07-04.md` §6.2 + owner overhaul directive.
The agentic-engineering estate (~2× the compiler's size, Oak back-flow proven) has no product
identity. Shapes future work: investment, extraction criteria, what "Oak parity" means once flow
reverses. Home:
[`strategy-vision-estate-overhaul.md`](../../plans/future/strategy-vision-estate-overhaul.md)
§W0. **Fork/determination split (2026-07-06, assumptions-expert fold):** the NAME is the genuine
owner fork (constitutively yours); keep-in-repo + ADR-048-style value-gated extraction criteria
are lens-settled determinations executed under the walk's acknowledgement.
Status: **DECIDED (owner, interactive walk, 2026-08-23): the second product's name is
"the Practice".** Consumed by the Q-14 doctrine wave (VISION.md/IDENTITY.md describe both
products by name); the keep-in-repo + value-gated-extraction determinations execute under
this walk's acknowledgement. Drain at next consolidation.

### Q-013 — Vision topology: umbrella + two product visions, or a split

Captured: 2026-07-04 | source: same. One VISION.md currently describes one product; the repo
holds two. Home: overhaul plan §W0/§W1. Recommendation: umbrella (verified-claims thesis) + one
vision surface per product. Status: **DISSOLVED to a determination (2026-07-06, assumptions-expert
fold via the Four-Lens test / PDR-057)** — the topology follows deductively from single-source +
impact-before-activity with no divergent product outcome; executed at W1 under the W0 walk's
acknowledgement, not owner-gated. **Acknowledged by the 2026-08-23 interactive walk** (the
Q-012/Q-014/Q-015 verdicts are that walk's residue); drain at next consolidation.

### Q-014 — Adopt preservation coverage % as product A's headline public metric

Captured: 2026-07-04 | source: review §6.1 (verb-model research verified). Computed support
claims replace asserted ✅ tables; aligns remediation-02, the representability matrix, and the
`check` verb. Home: overhaul plan §W0/§W5. Recommendation: adopt. Status: **DECIDED
(owner, interactive walk, 2026-08-23): ADOPT** — preservation-coverage % is the compiler's
headline public metric, computed by the proof estate, replacing asserted support tables.
Consumers: the proof-programme harness/matrix slices and the Q-14 vision rewrite. Drain at
next consolidation.

### Q-015 — principles.md truthing batch (protected-file approval)

Captured: 2026-07-04 | source: review R4/R5. **Fork/determination split (2026-07-06,
assumptions-expert fold):** the genuine fork is the **M1/R5 choice** — enforce the
`Object.*`/`Reflect.*` FORBIDDEN rule via lint (recommended, per strictest-of-three; 147
product-code uses today), or owner amends the doctrine. The staleness edits (the falsified
§Tooling Integration TSDoc claim etc.) are determinations forced by strictest-of-three, executed
under the protected-file approval the walk grants in one batch — principles.md must not be
edited without explicit owner approval. Home: overhaul plan §W3 + remediation 06.
Status: **DECIDED (owner, interactive walk, 2026-08-23): ENFORCE VIA LINT** — the
`Object.*`/`Reflect.*` FORBIDDEN rule becomes a lint gate and the ~147 product-code uses
are remediated in queue slices (enters the proof-programme queue at the Q-12 split, or
earlier on owner ask); the doctrine stands as written. The staleness-edit batch executes
under this walk's approval combined with B-09's doctrine-wave APPROVE. Drain at next
consolidation.

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

### Q-016 — Un-blind the eslint-plugin-boundaries gate: restructure the conversion layer or widen its ADR-036 matrix?

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
