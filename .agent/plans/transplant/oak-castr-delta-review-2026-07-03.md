---
title: Oak(OOCE) ↔ castr delta review + bring re-sequencing (2026-07-03)
status: complete
lane: current
created: 2026-07-03
completed: 2026-07-03
owner_directive: >-
  "plan a review of oak-open-curriculum-ecosystem for the Practice Core, the applied
  Practice (rules, hooks, skills, guidance, continuity surfaces, the learning loop, the
  agent tools and all other agentic enhancements and routing) and the same for castr, and
  the shapes of the similarities and differences … enhance Castr with all the powers of
  OCE, without forcing the transfer of concepts that are not relevant … bring over the
  in-repo enhanced statusline code and config … Do not bring over the oak logo, do bring
  over all code for handling logo creation and use" (owner, 2026-07-03).
method: >-
  DELTA review, not a from-scratch redo: the firsthand-verified two-pass rescan
  (oak-castr-gap-rescan-2026-06-28.md) remains the base map and the single ordered Axis-A
  backlog. This plan (1) classifies the Oak-main delta since that rescan, (2) runs the two
  owner-directed lanes (statusline, logo-handling code), (3) re-verifies the castr side,
  and (4) folds verified results back into the single backlog as a dated amendment.
  All subagent output is adversarially verified and every load-bearing claim is
  re-checked firsthand (owner mandate; distilled multi-agent-audit lessons apply).
measurement_window: >-
  Oak read live from main (git -C <oak> show main:<path>). Delta window measured
  2026-07-03: base = the last Oak main commit before 2026-06-28 (a7ff84e8, recorded here
  as measurement provenance for THIS dated review, not as a baseline anchor — the
  no-moving-targets invariant holds); tip = Oak main as pulled today (244 commits).
todos:
  - id: t1-oak-delta
    content: Classify the Oak-main delta since 2026-06-28 against the existing HAVE/HOLLOW/LACK map (ultracode workflow + adversarial verify + firsthand spot-checks)
    status: complete
  - id: t2-directed-lanes
    content: Produce the statusline + logo-handling bring-manifests (per-file disposition; oak logo art excluded; owner-directed)
    status: complete
  - id: t3-castr-verify
    content: Re-verify the castr side — rescan DONE items still hold; castr landings since 2026-06-28 reconciled into backlog state
    status: complete
  - id: t4-synthesis
    content: Fold verified deltas into oak-castr-gap-rescan-2026-06-28.md as a dated amendment section; update sequencing; update continuity pointers
    status: complete
---

> **✅ AS-BUILT (2026-07-03, Windswept Winging Cliff / 0ceb5f).** Executed same-session. W1: 14-agent
> classify→adversarial-verify workflow (`wf_929147cf-1a5`, 1.03M subagent tokens) over the 365 bring-relevant delta
> paths + completeness critic; verify phase produced real catches (one refuted lane claim — castr HAS PDR-078; one
> lane-scope false-alarm resolved by union check; ADR-127 coverage gap caught) and the critic surfaced the surfaces
> the lanes missed (encoding gate in .husky, agent-tools/package.json scripts, patterns/reports planes, root files,
> deletions/renames modality — all folded). ≥13 load-bearing claims re-verified firsthand, incl. every tier-gating
> one. W2: both manifests landed in
> [`statusline-logo-bring-manifests-2026-07-03.md`](./statusline-logo-bring-manifests-2026-07-03.md) with 8 authoring
> determinations (ENGRAPH\_ env prefix, engraph-logo.ts asset seam, default-'none', session-shape defect fixed
> in-slice + back-flow, Oak-copyright SVG exclusion). W3: all six Tier-1 DONEs re-verified holding; three stale
> backlog entries corrected in place. W4: the
> [`§Delta amendment (2026-07-03)`](./oak-castr-gap-rescan-2026-06-28.md) is live in the single spine with updated
> sequencing (owner-directed statusline lane leads). Proof contract met: zero unclassified paths (classify lanes +
> critic residual groups = 365), manifest checked against the full logo grep inventory, per-item castr checks named,
> single spine held (no competing map). Method lesson captured in the napkin (delta-rescan cadence, second instance
> of the audit-harness pattern → graduation candidate).

# Oak(OOCE) ↔ castr delta review + bring re-sequencing (2026-07-03)

## End goal, mechanism, means

- **End goal (user impact):** castr carries every OCE Practice/agentic power that is not
  utterly irrelevant to it (PDR-005 §Default disposition), with ONE current, sequenced,
  trustworthy bring backlog — and the owner gets the enhanced statusline (with castr's own
  logo pipeline) as a directed near-term bring.
- **Mechanism:** the 2026-06-28 rescan is already the verified similarity/difference map
  (HAVE / HOLLOW / LACK / OUT-OF-SCOPE / castr_extras). Oak main has advanced 244 commits
  since (measured firsthand 2026-07-03; ~134 new agent-tools src files, 4 new PDRs
  (120–123), 1 new rule, 1 new skill, 5 new sub-agent templates, 8 new experience files,
  6 amended directives, 18 amended rules). Re-running the full 49-agent rescan would
  re-derive what is already verified; classifying only the delta + re-verifying the castr
  side updates the map completely at a fraction of the cost, and keeps a SINGLE next-step
  spine (the plan-system coherence lesson, 2026-06-28).
- **Means:** the four workstreams below.

## Firsthand ground truth already established (2026-07-03, pre-workflow)

Computed directly, before any subagent ran (arms the critical assessment):

- Delta by surface (`git -C <oak> diff --name-status <base>..main`): agent-tools/src
  A=134 M=34; .agent/rules A=1 M=18; .agent/skills A=1 M=7 (new: `pr-lifecycle`);
  .agent/practice-core A=4 M=7 (new PDRs 120 runbooks-content-kind, 121
  planning-vocabulary, 122 agentic-judgment-pipelines, 123 agentic-design-panel-protocol);
  .agent/sub-agents A=5 M=2 (corpus-mapper/meta/reducer/voter + prose-expert);
  .agent/experience A=8 M=2; .agent/directives M=6; .codex A=5 M=1.
- Dominant new agent-tools subsystem: `corpus-analysis/` (judgment pipelines — pairs with
  PDR-122/123 and the corpus-* sub-agent templates). Also new: `core/trusted-gh.ts`,
  `core/cli-arg-parser.ts`, `core/command-runner.ts`, `core/path-exists.ts`,
  `ci/ci-schema-drift-eval.ts`, collaboration-state `watcher-supervisor.ts`,
  `peer-liveness.ts`, `work-state-view.ts`, `claim-{active,closed}-path.ts`,
  `cli-spec-factory.ts`, `git-worktree-list.ts`; statusline `statusline-countdown.ts` +
  `statusline-usage.ts`.
- Statusline estate on Oak main (`agent-tools/src/claude/`): 13 `statusline-*.ts` modules
  (ansi, countdown, frame-store, git-io, git-location, identity-input, identity,
  indicators, logo-cycle, render, segments, session-shape, usage) + `oak-logo.ts` +
  `session-identity-hook.ts`, with tests under `agent-tools/tests/claude/`; wiring =
  `.claude/scripts/statusline-identity.mjs` + `settings.json` `statusLine` block
  (`refreshInterval: 10`).
- Logo estate: handling/creation CODE = `statusline-logo-cycle.ts` (+ test),
  `.agent/research/developer-experience/statusline-logos/` docs + python generators
  (`generate-braille-sharp-variants.py`, `terminal-animation-toolkit/generators/*.py`) +
  shell statusline prototypes (`statusline/*.sh`); Oak ART = `oak-logo.ts` frame data,
  `renders/*.{png,gif}`, acorn-named assets. Oak also has a live
  `statusline-logo-modularisation.plan.md` — read it in W2 (the art/code seam may already
  be modularised upstream, which is exactly the seam castr needs).

## Workstreams

### W1 — Oak-delta classification (t1-oak-delta)

Ultracode workflow over the delta file-set (not the whole estate). Lanes by surface
family: (a) agent-tools new modules (corpus-analysis; collaboration-state hardening;
core; ci), (b) practice-core PDRs 120–123 + amended PDRs, (c) rules/skills/sub-agents/
experience/directives amendments, (d) adapters/codex/github/config. Each lane classifies
every delta file: **NEW-capability** (append to backlog with oak_path + tier),
**AMENDS-already-classified** (update the existing backlog entry — e.g. watcher-supervisor
amends the watcher items; trusted-gh joins trusted-git), **Oak-internal noise**
(release/continuity/memory churn — record the class, not each file), or **OUT-OF-SCOPE**
(utterly irrelevant because product-coupled, per PDR-005 — recorded so future audits do
not re-flag). Adversarial verify phase per lane; synthesis returns a machine-checkable
list (path + classification + one-line why).

- **Acceptance (t1):** every one of the ~200 delta paths on bring-relevant surfaces has a
  recorded classification (disposition-ledger discipline — decisions, not per-file
  cycles); ≥10 load-bearing claims re-verified firsthand by the authoring agent (`git -C
<oak> show main:<path>`), including EVERY claim that gates a tier assignment; the three
  known critic failure modes guarded (no drive-by presence verdicts accepted).
- **Validation:** the classification list cross-checked against the firsthand `diff
--name-status` inventory — zero unclassified paths.

### W2 — Directed lanes: statusline + logo-handling (t2-directed-lanes)

Owner-directed brings (not gated on W1). Produce two bring-manifests with per-file
disposition, transitive-iceberg enumeration (PDR-096: tests, wiring, settings blocks,
validators, script proxies), and castr-side seam notes:

- **Statusline:** the full `statusline-*.ts` module set + tests + `.claude` wiring +
  config, reconciled against what castr already has (Q-003 shim `ebf08b5`; trusted-git
  statusline read; the Tier-2 "Statusline coordination" entry). Read Oak's live
  statusline plans (`session-and-team-state-statusline-icons`, `statusline-primary-
worktree-rows`, `statusline-logo-modularisation`) so the bring lands on Oak's current
  design, not a stale midpoint. Cursor statusline wiring (`install-cursor-statusline`)
  included per bring-by-default.
- **Logo-handling:** bring the logo-cycle machinery, frame-store, the research toolkit
  docs + generators + shell prototypes; EXCLUDE Oak art (`oak-logo.ts` frame data,
  `renders/*`, acorn assets) — the owner directive: castr gets the full logo
  creation/use pipeline and will author its own logo art in a follow-on slice.
- **Acceptance (t2):** two manifests, every file dispositioned bring / adapt / exclude-art
  / already-present, each with its transitive deps named; the no-oak-logo exclusion is
  explicit and complete (verified by checking the manifest against the full
  `grep -i logo` inventory).

### W3 — castr-side re-verification (t3-castr-verify)

The rescan doc's DONE markers and castr_extras are themselves claims that age. Firsthand
(cheap, no workflow needed unless surprises): (a) each Tier-1 item marked DONE still
holds on the current branch; (b) castr landings since 2026-06-28 (coverage wiring,
dependency-currency sweep, CodeQL default-setup, audit-zero, Codex-findings closure —
per the Moth sessions) reconciled into backlog state; (c) the parallel castr-internal
lanes list still accurate.

- **Acceptance (t3):** every Tier-1 DONE re-verified (command or file check named per
  item); the backlog's "next execution slices" line reflects reality as of today.

### W4 — Synthesis + re-sequencing (t4-synthesis)

Fold W1–W3 verified results into `oak-castr-gap-rescan-2026-06-28.md` as a dated
**§Delta amendment (2026-07-03)** — the single-spine discipline: ONE backlog, amended in
place, no competing map. Re-sequence: the owner-directed statusline+logo lanes take a
named near-term position; new Oak capabilities slot into tiers by the same impact logic;
new OUT-OF-SCOPE entries appended with their utterly-irrelevant reasons. Update the
thread record lane pointer + (once the peer's staged continuity commit has landed)
repo-continuity Next Safe Steps.

- **Acceptance (t4):** the rescan doc carries the amendment with every W1 classification;
  sequencing names the single next execution slice; continuity surfaces point at one
  spine; this plan flips `status: complete` with an as-built note.

## Prerequisites

- **Blocking:** none — Oak checkout current (verified: main tip 2026-07-03); the rescan
  doc present; workflows available.
- **Beneficial:** Penumbral Slipping Moth's staged continuity commit landing (frees
  napkin/repo-continuity for W4 edits). Minimum shape without it: W4 updates the rescan
  doc + thread record only, and leaves a comms note for the continuity pointer.

## Non-goals

- **No brings are executed by this plan** — it produces the verified map, manifests, and
  sequence; each bring remains its own TDD/gate-green slice per the backlog.
- No castr logo design (follow-on slice; explicitly owner-flagged "we will create a new
  logo for this repo").
- No re-classification of the 2026-06-28 base map where the delta doesn't touch it.
- No Axis-B (product remediation) or Axis-C (delivery) changes.

## Risk assessment

- **Host load** (8.77 on 8 cores at session open, rising): re-measure before each
  workflow fan-out; cap workflow concurrency (the runtime cap is already
  min(16, cores−2)=6; keep lanes ≤4 concurrent if load stays high); abort fan-out and
  fall back to serial firsthand reads if load exceeds ~1.5× cores
  (`no-unbounded-host-load`).
- **Subagent false claims:** known failure modes (critic presence re-checks 3/3 wrong on
  pass-1) — cure: lane audits only, adversarial verify phase, firsthand re-check of every
  load-bearing claim, ground-truth inventory computed BEFORE reading synthesis (done, in
  this plan).
- **Oak moves mid-review:** record the measurement window (done); W4 notes any post-window
  commits without chasing them (the next delta pass catches them).
- **Concurrent peer (n=2):** Moth holds `git:index/head` intermittently; all commits go
  through the commit skill + queue; my claim covers this plan file + thread record;
  extend the claim before touching the rescan doc in W4.

## Foundation alignment + first-principles check

- `principles.md` Decision Lenses: long-term excellence (one trustworthy spine beats a
  fresh parallel map) → strict-everywhere (every path classified, no silent truncation) →
  simpler (delta, not redo) → dissolve (statusline "should we bring?" dissolved by owner
  directive + PDR-005) → user value (owner sees the statusline).
- Plan-body first-principles check (`plan-body-first-principles-check`): fires at each
  workstream boundary — before executing W1's workflow (does the lane decomposition still
  match the measured delta?), before W2 manifests (read Oak's live statusline plans first
  — vendor-truth at author time), before W4 edits (re-read live claims/comms; the
  session-start snapshot is already known stale once this session).
- `verify-dont-trust`, `verify-agent-claims-firsthand`, PDR-096 bring-the-iceberg,
  PDR-005 bring-by-default, PDR-105 reference direction (this dated review may cite
  ephemeral surfaces; permanent homes must not cite this plan as authority).

## Proof contract

| Claim                       | Proof level | Proof                                                                           |
| --------------------------- | ----------- | ------------------------------------------------------------------------------- |
| Delta fully classified (t1) | non-code    | zero-diff between classification list and firsthand name-status inventory       |
| Manifests complete (t2)     | non-code    | manifest checked against full logo grep inventory; per-file disposition present |
| castr side current (t3)     | non-code    | per-item named command/file check recorded in the amendment                     |
| Single spine holds (t4)     | non-code    | rescan doc amendment present; continuity points at it; no new competing map     |

## Learning loop + lifecycle

On completion: as-built note in this plan; napkin capture of method lessons (delta-rescan
as a repeatable cadence is a PDR-097-style pattern candidate — a second instance would
graduate it); consolidation per `session-handoff`/`consolidate-docs` at session close;
this plan then moves to `current/complete/` per ADR-117 practice.
