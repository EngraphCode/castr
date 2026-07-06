---
todos:
  - id: W0-frame
    content: 'Owner walk: ratify the two-product frame, the verified-claims principle, and naming'
    status: pending
  - id: W1-vision
    content: 'Rebuild the vision layer around impacts (product A vision; product B vision surface)'
    status: pending
  - id: W2-strategy
    content: 'Rebuild roadmap + continuity current-truth layer; archive the superseded-block stratigraphy'
    status: pending
  - id: W3-claims-truthing
    content: 'Fix R4 doctrine contradictions and build + wire the doctrine-claims validator (TDD)'
    status: pending
  - id: W4-plans-tree
    content: 'Reorganise the plans tree into impact-aligned collections; land plan-templates (TC2)'
    status: pending
  - id: W5-measurement
    content: 'Define the preservation-coverage metric surface and the product-B fitness frame'
    status: pending
---

# Plan: Strategy, Vision & Planning Estate Overhaul

**Status:** STRATEGIC BRIEF (`future/` lane) — authored 2026-07-04 on owner directive ("start
planning a total overhaul of the current planning, strategy and vision estate so it is organised
around the appropriate impacts and principles"). Readiness reviews run and folded same day
(assumptions-expert + docs-adr-expert; lane placement, W3 scope widening, owner-walk
minimisation, and the acceptance-determinism fixes below all originate there).
**Promotion trigger → `current/`:** the W0 owner walk completes (the three genuine forks below
decided). Promotion mines the workstreams into cycle-level executable todos with `depends_on`
fields and the quality-gates / lifecycle-triggers component references; execution decisions are
finalised only at that promotion, per the plan skill's strategic-plan contract. W3's validator
cycle and W2's mechanical archaeology are parallel-safe from the moment W0 ratifies the frame.
**Source findings:** [`wide-deep-review-2026-07-04.md`](../../report/wide-deep-review-2026-07-04.md)
(esp. §1 two products, §2.4 R1–R6, §6 emergent patterns, §7 small-changes-big-impacts) building
on [`initial-review/`](../../report/initial-review/).

## Problem

The strategy estate describes one product and the repo contains two; its claims drift from
reality faster than review cadence catches them (a principles.md claim went stale within one
day of the change that falsified it); its current-truth surfaces have grown by superseded-block
accretion (repo-continuity §Next Safe Steps is a palimpsest of nested CURRENT TRUTH banners);
and its organising frame is still the discharged transplant era ("one deep enhancement", Axis
A/B/C) rather than the impacts the work now serves. Who it harms: the owner (misallocated
attention), agents (inherited false claims — the repo's own named failure family), and
consumers (support claims that are asserted, not computed).

## End goal (user impact)

A strategy estate where **every layer is organised by the impact it serves and every claim is
verifiable**:

- **I1 — schema-tooling consumers:** provably faithful transformation; support claims computed
  (preservation coverage per input→output pair), never asserted.
- **I2 — engineering organisations:** the agentic-engineering kernel (agent-tools + Practice)
  named, bounded, and steerable as a product in its own right.
- **I3 — the agents themselves:** doctrine an agent can trust — contradictions structurally
  detected, current-truth surfaces single-voiced ("excellent agent experience" is already a
  standing concern in principles.md §Decision Lenses; this makes it real at the estate level).

## Mechanism

Impact-first organisation makes stale framing visible (a surface that serves no named impact is
archaeology); verified-claims enforcement (the same loop-closure pattern already proven on pnpm
scripts and references) makes drift a gate failure instead of a review finding. Together they
convert the estate from narrative-that-decays to structure-that-self-corrects.

## Governing principles (the "appropriate principles")

1. **Verified claims** — a claim is only as good as its machine-checkable proof (the unifying
   thesis of both products; CANDIDATE, ratified at W0 — pending-graduations carries the PDR
   candidate; do not treat as settled doctrine until the walk).
2. **Impact before activity** — every strategy surface names the impact (I1/I2/I3) it serves.
3. **Single source, referenced everywhere** — one authoritative home per fact (per the
   no-moving-targets rule and the document-hierarchy discipline in the plan skill; Oak's
   ADR-117 is the origin record, **pending bring via W4/TC2** — castr's ADRs top out at
   ADR-050, so cite it as pending, never as a resolvable local authority);
   current-truth is one block, history is archived, never layered.
4. **No moving targets in permanent docs**; computed tables over hand-maintained ✅ marks.
5. **First Question** — at every step: could it be simpler without compromising quality?

## Workstreams

### W0 — Ratify the frame (owner walk; blocking for W1/W2 shape)

Per the Four-Lens Dissolution Test (PDR-057; assumptions-expert fold), the walk is minimised to
its irreducible core — the **three genuine forks** only the owner can decide:

| Genuine fork                                                                                    | Recommendation                                                 |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **The second product's NAME** (Q-012, naming part)                                              | Name it now (the review deliberately leaves the name to you)   |
| **Preservation coverage % as product A's headline PUBLIC metric** (Q-014)                       | Adopt (it is also the honest cure for asserted support claims) |
| **M1/R5 resolution: enforce the `Object.*`/`Reflect.*` ban via lint, or amend it** (Q-015 fork) | Enforce via lint per the strictest-of-three rule               |

The remaining items are **determinations executed under approval**, not forks (the lenses
settle them; outcomes do not diverge): Q-013 vision topology → umbrella + one vision surface
per product (follows from single-source + impact-before-activity); Q-012 non-naming parts →
keep in-repo, ADR-048-style value-gated extraction criteria (decision, not extraction); Q-015
staleness edits (the falsified TSDoc claim etc.) → forced by strictest-of-three, executed under
the standing principles.md protected-file approval that the walk grants in one batch.

Registered as Q-012..Q-015 in `open-questions.md` (with the fork/determination split mirrored
there). Exit: the three forks decided and recorded; the determinations acknowledged in the same
walk.

### W1 — Vision layer rebuild

Rewrite `VISION.md` (umbrella + product A) around I1; author the product-B vision surface
(location per W0 naming) around I2; state the verified-claims principle once (umbrella) and
reference it from both. Fold the multi-verb fidelity-compiler model (doctor / upgrade /
transform / validate / check) into product A's vision as the surface architecture direction,
referencing `plans/future/castr-surface-architecture-and-verb-model.md` rather than duplicating
it. Acceptance: both products have a named impact, consumer, and headline metric; and the W3
validator (whose scope EXPLICITLY includes cross-surface contradiction pairs — see W3) passes
green over the rebuilt vision layer. If W1 lands before the W3 validator, the contradiction
check is a named non-code reviewer pass (docs-adr-expert) recorded in the plan's as-built, and
the validator re-proves it when it lands.

### W2 — Strategy + continuity layer rebuild

- Replace `plans/roadmap.md`'s transplant-era frame with an impact-organised roadmap: product A
  (remediation 02–07 → verb model → conformance/corpus → release), product B (kernel roadmap:
  loop-closure completion, coordination hardening, Oak back-flow), Practice/meta.
- Collapse `repo-continuity.md` §Next Safe Steps to ONE current-truth block; move the
  superseded dated blocks to `memory/operational/archive/` (conserved verbatim, per
  never-trim-always-curate).
- Reconcile `delivery-ledger.md` and the session-continuation prompt to the same single frame.
  Acceptance (mechanical): the continuity spine is at most three linked surfaces
  (repo-continuity, session-continuation prompt, roadmap), each carrying EXACTLY ONE
  current-truth block — verified by grep for the CURRENT-TRUTH banner marker returning one hit
  per surface and zero "supersedes" qualifiers on the read path; all moved content
  byte-conserved in archive (diff of moved blocks against their archive copies is empty). A
  fresh-agent comprehension trial is a useful non-code review, not an acceptance gate.

### W3 — Claims truthing + the doctrine-claims validator (TDD; parallel-safe after W0)

- Fix the R4 contradictions across ALL THREE claim-bearing surfaces: requirements.md §Current
  Focus ("JSON Schema: Deferred") vs VISION progress table vs **`plans/roadmap.md` §Supported
  Formats (its "JSON Schema Input ✅ Output ✅ … full parser, writer" row is the same
  R1-falsified claim on a third surface — docs-adr fold)**; principles.md §Tooling Integration
  (TSDoc claim); requirements §6 ✅ table entries whose end-to-end claims are falsified by the
  review (mark honestly per the strictest-of-three rule — raise code to doc via remediation
  plans, never silently relax).
- **Build `validate-doctrine-claims`** (agent-tools validator, TDD), with TWO capabilities:
  (a) **proof-anchor resolution** — every ✅ / "MUST … with tests proving" row in
  requirements.md, every VISION progress-table cell, and every roadmap §Supported Formats cell
  must cite a resolvable proof anchor (test file / validator / report section); unresolvable
  claim = gate failure; (b) **cross-surface contradiction pairs** — the named claim tables are
  checked pairwise for contradicting support statuses (the R4 instances are the red-first
  fixture set; this is the capability W1's acceptance consumes). Extends the proven
  loop-closure-references pattern. Wire into
  `repo-validators:check` blocking once the estate is truthed (red-first against today's known
  contradictions — the falsifying fixture set already exists in the review).
  Acceptance: validator red on today's estate for exactly the known contradictions, green after
  the truthing edits; wired blocking; `pnpm check` green.

### W4 — Plans-tree reorganisation

Reorganise `.agent/plans/` into impact-aligned collections (product-a/, product-b-kernel/,
practice/, plus the lifecycle lanes within each — the `<collection>` shape the plan skill
already names); archive transplant-era organisation (tracker, folded plans) with provenance
banners; land the plan-templates estate (TC2 graft from Oak/resonance) so the plan skill's
live-inventory reference stops dangling. Acceptance: every live plan reachable from the roadmap
by impact; `plans/templates/README.md` exists and the plan-skill self-check commands run
against it; no dangling plan links (markdown-links validator scope).

### W5 — Measurement layer

Define the preservation-coverage metric surface (per input→output pair; fed by the
remediation-02 harness and, later, the representability matrix — reference those plans, do not
duplicate their scope) and the product-B fitness frame (what "kernel health" means: gate
latency, coordination-collision rate, drift-detection coverage). Acceptance: metric definitions
have a computing owner (script/harness) named, even where the first computation is deferred to
the referenced plan.

## Prerequisites

- **Blocking:** W0 owner walk (for W1/W2/W4 shape). W3's contradiction list is already known —
  its validator cycle may start immediately (the fixes to principles.md still gate on W0's
  approval row).
- **Beneficial:** remediation-02 landing first (gives W5 its first computed metric). Minimum
  shippable without it: metric defined, computation deferred with a named owner.

## Non-goals

- Executing product remediation (02–07 own it) or the verb-model implementation (its future
  plan owns it).
- Extracting agent-tools to a separate repo (W0 decides criteria only).
- Rewriting the Practice Core / PDR layer (genotype is Oak-shared; this plan touches castr's
  phenotype surfaces).
- Trimming or rewriting history (archival moves are conservation, not curation-by-deletion).

## Risks

- **Frame churn**: rewriting vision while remediation runs risks divergence — mitigated by W3's
  validator landing early (drift becomes a gate failure during the overhaul itself).
- **Owner-gating stall**: W0 needs a walk; W3-validator and W2 archaeology are deliberately
  parallel-safe so the plan cannot stall whole.
- **Estate-wide link breakage** from W4 moves — mitigated: markdown-links validator runs in the
  same cycles as the moves.

## Foundation alignment & first-principles check

principles.md §Decision Lenses (long-term excellence → strict-everywhere → simpler → change-the-
system → user value) is the resolution order for every W-decision; testing-strategy.md governs
the W3 validator's TDD cycle; requirements.md remains the source of truth its own §Acceptance
names — this plan edits it only under the strictest-of-three rule. Plan-body first-principles
clauses fire at: the W3 validator's fixture design (shape clause — fixtures must be the real
contradiction instances, not synthetic lookalikes), the W2 archive moves (landing-path clause —
stage renames with the moves), and the W1 vision rewrite (vendor-literal clause — quote
requirements/VISION text exactly when citing contradictions).

## Proof contract

Completion claims: W0 `non-code` (open-questions Q-012..Q-015 decided rows); W1/W2/W4
`non-code` + deterministic validator runs (doctrine-claims, markdown-links, portability,
repo-validators all green); W3 `unit` + `integration` (validator TDD suite red→green +
blocking-wire proof — the gate fails on a seeded contradiction); W5 `non-code` (definitions) +
`value-proxy` (first computed coverage number when remediation-02 feeds it). The plan is
complete only when all workstream acceptance rows above are proven; a landed slice is not
completion.

## Readiness reviewers

Before execution starts: `assumptions-expert` (proportionality — is a "total overhaul" the
simplest sufficient move?) and `docs-adr-expert` (estate-move completeness + ADR-117
compliance). Their findings fold into this plan before W1 begins.

## Learning loop & lifecycle

Each workstream close routes capture through the napkin; plan completion runs
`consolidate-docs`; the verified-claims principle and the audit-harness lessons graduate per
their pending-graduations entries when their triggers fire. Lifecycle touch points (claims,
comms, commit ceremony, session close) apply per the standing rules; no exceptions needed.
