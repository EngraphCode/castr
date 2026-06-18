# Phase 6 sub-plan — Memory layout + generator (the opening consolidation pass)

**Source:** owner-directed Phase-6 opener (2026-06-17) + firsthand measurement of the Oak `main` estate this session.
**Status:** authored 2026-06-17; executing now. Items marked **✅measured** were checked against Oak source this session;
items marked **⚠️execution-verify** are to be read firsthand at the moment of the edit per the firsthand rule.

> Why this file exists: Phase 6 (sub-agents / memory / state) is large. This sub-plan scopes its **opening move** — the
> memory-layout consolidation — and records the **baseline re-pin** and the **generator-first** framing that two owner
> steers established. The parent tracker carries only a one-line NEXT; the actionable design lived only in session
> context. Persisted here so the slice is resumable without it (continuity-practice; `important-state-not-in-temp-files`).

---

## 1. Baseline re-pin — `4470266` → Oak `main` `ad359a4f` (owner, 2026-06-17)

The transplant baseline was the pin `practice/transplant-to-castr` @ `4470266`. **Owner decision (2026-06-17): re-pin to
Oak `main` `ad359a4f` for all remaining phases (6–9).** This is NOT a moving-target violation — it adopts a _newer fixed
ref_, and the measurement proves it is clean:

- **✅measured — `main` is a clean superset of the pin.** `4470266` is a direct ancestor of `origin/main` (`ad359a4f`),
  +429 commits, **no divergence / no merge cost**. (`ad649710` and `2c85bc01`, the Phase 3/4 and Phase 2 baselines, are
  NOT on main's first-parent line — only the pin is.)
- **Consequence for the estate:** Phases 6–9 read their estates from `ad359a4f`. The already-landed Phase 3/4 skills/rules
  came from `ad649710` (off-main); where those surfaces _populate or govern_ Phase-6 infrastructure they are re-synced to
  main forms here (see §2). A full skill/rule re-sweep to main is the broader **D4** sweep, enumerated at the Phase-9
  verification pass — not pulled wholesale into this slice.
- **Back-flow target (OPEN, Phase 9):** castr has pushed upstream feedback to the `practice/transplant-to-castr` branch.
  Re-pinning to main does not yet decide where back-flow lands (that branch vs main vs a fresh branch). Deferred to the
  Phase-9 feedback step with explicit deferral-honesty (named dependency: the back-flow report is a Phase-9 deliverable).

## 2. Generator-first — the memory dir is a _generated artefact_ (owner, 2026-06-17)

Owner steer: _"it's not just the memory dir, it's the skills that cause it to be populated."_ The memory substrate is the
**output**; the **skills are the generator** (`generator-first-mindset`). So this pass aligns the generator, not just the
directory shape.

- **✅measured — the split is clean: doctrine stable, procedure moved.**
  - Memory-governing **rules** (`per-user-memory-is-a-buffer`, `executive-memory-drift-capture`,
    `consolidate-at-third-consumer`, `permanent-doc-is-the-consolidation-record`,
    `knowledge-preservation-over-fitness-warnings`, `napkin`, `capture-practice-tool-feedback`): **zero** change
    `ad649710`→main. No rework.
  - Structural **contracts** (`memory/README.md`, `operational/README.md`, `executive/README.md`,
    `executive/memory-state-substrate-contracts.{md,schema.json}`, `ephemeral-to-permanent-homing.md`, directive
    `orientation.md`, directive `agent-collaboration.md`): byte-identical pin→main. Replicate as-is (localised).
  - Memory-**populating skills** (the generator): substantive refinement pin→main —
    `consolidate-docs` (+113), `session-handoff` (+53; the larger `ad649710` figure folded castr's local step-11
    divergence), `curator-pass` (~59), `start-right-quick/shared` (+21), `start-right-team` (+23). Section headings are
    stable (changes are in-body guidance), so these are bounded reconciliations, not rewrites.
    `napkin` / `consolidate-until-done` / `metacognition` / `start-right-thorough`: **unchanged** — no-op.

## 3. Target layout (Oak `main` `memory/README.md` — three modes)

```
.agent/memory/
  README.md                         # three-mode taxonomy + authority order
  active/                           # learning-loop (read: start-right step 3)
    napkin.md                       # ephemeral capture; ~500-line rotation
    distilled.md                    # refined cross-session lessons; fitness frontmatter
    patterns/                       # ecosystem-grounded pattern instances (full import = later P6 step)
    archive/                        # napkin rotations / historical capture
  operational/                      # continuity (read: start-right step 4)
    README.md  repo-continuity.md  open-questions.md
    threads/README.md  tracks/README.md
    ephemeral-to-permanent-homing.md   # shared homing methodology (drain procedure)
    pending-graduations.md          # owner-gated graduation register
  executive/                        # contracts (read: ad-hoc lookup)
    README.md  artefact-inventory.md  invoke-code-experts.md
    cross-platform-agent-surface-matrix.md  agent-collaboration-channels.md
    agent-capability-vocabulary.md
    memory-state-substrate-contracts.{md,manifest.json,schema.json}
  collaboration/                    # Phase-8 machinery placeholder
```

castr's already-landed `continuity-practice.md` (Phase 5) and the `start-right` shared workflow **already name every one
of these paths** as forward-references — this pass materialises the layout they describe; it does not invent it.

## 4. Scope — the OPENING pass vs the rest of Phase 6

**IN (this opening pass):**

1. **Layout + structural/contract docs** — create the tree; bring the READMEs + `ephemeral-to-permanent-homing.md`
   (localised, reconciled — §6). NOT Oak runtime data.
2. **Generator skills re-sync** — `consolidate-docs`, `session-handoff`, `curator-pass`, `start-right-quick/shared`,
   `start-right-team` to main forms; re-localise `oak-`→`engraph-`; preserve castr's gate/domain folds and the local
   session-handoff step-11 (adversarial continuity-falsification); regenerate `engraph-` adapters. Confirm the four
   unchanged skills are genuine no-ops.
3. **Reconcile castr's flat memory → `active/`** — relocate `napkin.md`, `distilled.md`, `code-patterns/` into the layout.
4. **Drain the napkin** — graduate captured learnings into their enforcement homes through the _now-current_ homing
   procedure: the manufactured-permission rule candidate (→ `new-rule-vs-pdr-clause` decision), transplant-method lessons
   (→ distilled / pattern / PDR candidates), per `ephemeral-to-permanent-homing.md`.
5. **Author castr's `repo-continuity.md`** from castr's real current state (NOT copied from Oak) + seed `open-questions.md`
   / `pending-graduations.md` / `threads/` register.
6. **Close forward-references** (reference-closure §P6 placeholders lines 129–130, 247, 334–336) + `pnpm check` + tag
   `transplant/phase-6` only when the whole Phase-6 surface lands (sub-agents/state follow — see OUT).

**Execution reorder (2026-06-17, measured — supersedes the IN numbering above).** A metacognition pass + firsthand
dependency measurement corrected the order:

- The operational/executive **READMEs link to their siblings**, so they come **last** in their unit, not first (bring
  leaf docs before the overview that links them).
- The operational contract docs and the generator skills are **coupled by step-number cites** (`threads/README` →
  `consolidate-docs` step 7c `#thread-register-freshness`; `pending-graduations` → steps 3a/8), so those docs follow the
  skill re-sync.
- castr's Phase-3 `consolidate-docs`/`session-handoff` **already dangle on `ephemeral-to-permanent-homing.md`** (3 refs;
  doc was absent) — so the homing doc is a genuine prerequisite that also resolves a standing dangling ref.

Resulting order: **(a) `ephemeral-to-permanent-homing.md` ✅ (2026-06-17 — landed, reconciled, resolves the 3 dangling
refs)** → **(b) leaf operational docs (`tracks/README`) ✅ (2026-06-18)** + decision on the skill re-sync **✅ (block c
below — bringable-now layer done; remainder folds to P8)** → (c) generator skill re-sync to
main **✅ (bringable-now layer)** → **(d) coupled docs (`threads/README`, `pending-graduations`, `open-questions`) +
`operational/README` overview ✅ (2026-06-18 — all five registers seeded, host-phenotype reconciled per §5; dispositions
in `reference-closure.md` §Phase 6)** → **(e) drain the napkin ✅ (2026-06-18)** — graduated the two named targets
(manufactured-permission → new rule `no-manufactured-permission.md` per owner's `new-rule-vs-pdr-clause` choice;
transplant-method lessons → `distilled.md`), tombstoned the candidate, rotated the pre-transplant April/March block to
`active/archive/napkin-2026-03-to-04.md`; active napkin back under the ~500-line threshold (480) → **(f) author
`repo-continuity.md` ✅ (2026-06-18)** — castr's own continuity contract from castr's live state (NOT copied from Oak;
lean structural contract that points to prompt/delivery-ledger/tracker for scope rather than restating; single-stream
scale, per-thread records deferred until concurrent threads arise); closes the `repo-continuity.md` forward-refs from
`operational/README` + `threads/README` → **(g) structure tier ✅ (2026-06-18)** — root `memory/README.md` (three-mode
taxonomy, localised) + `executive/README.md` (surfaces table with per-surface bring-status; Oak ADR-125/114/129 →
castr PDR-079/003/010 + PDR-050; `agent-capability-vocabulary` DON'T-BRING); **the full `.agent/memory` dangling-link
sweep is now empty.** Executive **catalogues ✅ (2026-06-18)** — `artefact-inventory` / `invoke-code-experts` /
`cross-platform-agent-surface-matrix` regenerated firsthand from castr's real estate (6-reviewer roster, real adapter
topology with named P7/Codex-only/Claude-only gaps, honest forwarder note). **Remaining in (g) ← NEXT:** the **substrate**
contract (`.md`/`.manifest`/`.schema`) re-authored to castr roots (consumer `agent-tools/src/practice-substrate/`); then
the OUT items (full `active/patterns/` import, sub-agent roster, `.agent/state/collaboration/` schemas + P8
`agent-collaboration-channels`) before the `transplant/phase-6` tag + full green `pnpm check`.

### Generator re-sync — measured outcome (2026-06-17)

Per-hunk triage of the `ad649710`→main delta for all five memory-populating skills (the `git merge-file` three-way
degenerated — castr localised 778/768 lines vs base, swamping the 111-line real delta — so triage was manual per-hunk,
the Phase-5 method). **Finding: the generator's evolution since `ad649710` is ~95% Phase-8 comms/collaboration
infrastructure + Oak product; only a thin generic layer is bringable now without dangling cites.**

| Skill              | Brought now (generic, no dangling)                                                            | Deferred to **P8** (or later sweep) — reason                                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| consolidate-docs   | ✅ "Trigger-firing discipline" safeguard (step 7, drain-relevant)                             | comms-archive class-tiered rotation (ADR-199/PDR-094 absent); Oak `oak-ecosystem-progress-*`/onboarding (product); the multi-agent "napkin-is-a-moving-surface" safeguard (no concurrency pre-P8); `state/collaboration/*.schema.json`→`agent-tools/.../schemas/` path move |
| session-handoff    | — (6a.2 grounded-execution-knowledge cites a PDR-011 §amendment castr lacks → would dangle)   | comms-log untrack-curation (ADR-199/PDR-094); 6a.2 (with the PDR-011 amendment, later sweep)                                                                                                                                                                                |
| curator-pass       | — (per-pass-log supersession is sound but its mechanism is the close-of-pass comms broadcast) | per-pass-log supersession + comms broadcast (P8 comms)                                                                                                                                                                                                                      |
| start-right/shared | — (host-health cites `no-unbounded-host-load` rule castr lacks)                               | `claims open --role` (P8 registry); host-health section (with its rule, later sweep)                                                                                                                                                                                        |
| start-right-team   | nothing                                                                                       | all — ArcAngel + canonical comms watchers, `--role` (entirely P8)                                                                                                                                                                                                           |

**Consequence:** the bulk of the generator re-sync is correctly a **Phase-8 activity** — the comms/collaboration skill
prose lands with the infrastructure it cites (relevance-ledger collaboration→P8). castr's installed `ad649710` skill
forms remain valid generic procedure in the interim (memory-governing **rules** were unchanged `ad649710`→main, so the
doctrine is current; only the comms-specific prose is stale, and it is a P8 forward-placeholder either way). Block (c) of
the reorder is therefore **DONE for the bringable-now layer**; its remainder folds into Phase 8.

**OUT (rest of Phase 6, after this pass):** full `active/patterns/` import (133 on main − ~2 UI, AMEND `proven_in:`,
regenerate index); executive catalogue regeneration to castr's estate (`artefact-inventory`, `invoke-code-experts`,
`cross-platform-agent-surface-matrix`) + the substrate-contract manifest/schema re-authored to castr roots; the 13
generic sub-agent templates + `components/`; `.agent/state/collaboration/` schemas + empty dirs. These are tracked in the
parent README Phase-6 row and land before the phase tag.

## 5. Contract-doc reconciliation map (KEEP-localise vs reconcile vs DON'T-BRING)

⚠️execution-verify each cross-reference against castr's real estate before writing (the Phase 3/4 lesson: Oak surfaces
carry host phenotype — false PDR/ADR cites, Oak-local plan paths, retired-directive references).

- `memory/README.md` — directives table cites `schema-first-execution.md` (castr DON'T-BROUGHT) → reconcile to castr's
  directive set (`AGENT`, `principles`, `testing-strategy`, `requirements`, `metacognition`, `orientation`).
- `operational/README.md` — cites PDR-011/PDR-027 (castr HAS) ✅ + an Oak OAC plan path (Oak-local → de-link per
  `no-moving-targets`).
- `executive/README.md` — cites Oak ADR-125/114/129 → re-point to the backing PDRs or retain cross-host with
  disambiguation (reference-closure).
- `ephemeral-to-permanent-homing.md` — cites PDR-007/011/014/024/026/050 + `documentation-hygiene` rule (castr HAS) ✅;
  bring localised.
- `executive/memory-state-substrate-contracts.{md,manifest,schema}` — explicitly a HOST-LOCAL instance naming Oak roots /
  the Oak `agent-tools` doctor plan → **defer to the executive step** (re-author manifest to castr roots); bring the
  README row as structure now.
- **DON'T-BRING (Oak runtime data):** Oak's `repo-continuity.md` session history, all `threads/*.next-session.md`,
  `pending-graduations.md` content, `collaboration/` data, `archive/` rotations, `curator-passes/`, `diagnostics/`,
  `quarantine/`. castr authors its own equivalents from its own state.

## 6. Acceptance + validation

- The `.agent/memory/{active,operational,executive}` layout exists; castr's napkin/distilled/patterns live in `active/`;
  the flat `.agent/memory/{napkin,distilled}.md` + `code-patterns/` are gone (moved, not copied).
- Every Phase-5 forward-reference to a memory path resolves on disk (reference-closure §P6 closed).
- The generator skills are at main forms (localised); `engraph-` adapters regenerated; `skills:check` green.
- Napkin drained: each retained entry has a permanent home or is removed per the homing methodology; deferrals satisfy
  PDR-026 deferral-honesty. The napkin returns under its ~500-line rotation threshold.
- `pnpm check` green (ALL gates — the latent-gap lesson: never omit a gate). `subagents` validator stays deferred until
  the sub-agent step lands; do NOT silence it (it truthfully reports absent P6 infra).
- Tracker + reference-closure + relevance-ledger updated; baseline re-pin recorded.
