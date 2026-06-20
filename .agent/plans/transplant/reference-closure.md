# Reference-Closure Ledger — Oak → castr transplant

Running classification of every cross-reference in transplanted Practice surfaces, per PEEN's method:
**resolve** (target exists in castr), **rewrite** (re-point to a castr equivalent), **placeholder** (dangling, scheduled
for a later phase), or **retained-cross-host** (an honest, intentional reference to the originating host's phenotype that
castr does not and will not mirror — a _resolved_ disposition, not an open placeholder).

Phase-9 acceptance = **zero open `placeholder` entries**; `retained-cross-host` entries are accepted dispositions.

**Governance — PDR vs ADR (owner, 2026-06-05; sharpens PDR-079):** PDRs are **portable governance and never
repo-specific**; anything genuinely repo-specific **necessarily goes in a castr ADR**. When operationalising a
transplanted PDR, author a **castr ADR only if the portable PDR is not sufficient** for a repo-specific need — do not mint
an ADR by reflex. So Oak-ADR cites reference-close to the portable PDR wherever one suffices, and become a castr ADR only
when castr has a genuinely local decision to record.

---

## Phase 1 — Practice Core / PDRs

### PDR → Oak-ADR citations — disposition: **retained-cross-host**

The 91 transplanted PDRs cite **8 distinct Oak ADRs** (all > castr's ADR-047, so non-resolvable in castr):
`ADR-131, ADR-150, ADR-176, ADR-177, ADR-178, ADR-183, ADR-185, ADR-186`, across 10 PDR files (`PDR-011, PDR-053,
PDR-054, PDR-055, PDR-059, PDR-060, PDR-074, PDR-075, PDR-077, PDR-078`).

**Why retained, not rewritten or placeholdered:**

- PDRs are **portable governance and immutable once numbered** (PDR-001, PDR-079). They are not edited on receipt.
- Per the PDR/ADR distinction (PDR-079), a PDR names the portable principle and its **host-repo operationalisation lands
  as a repo-bound ADR**. These cites are honest statements that _in the originating Oak host_ the PDR is operationalised
  as ADR-NNN ("the host-repo implementation lands as ADR-176", "per ADR-185", etc.). They are **not instructions castr
  must follow** and not broken governance.
- castr has no equivalent ADRs and will not import Oak's product ADRs (owner decision). When castr later operationalises
  one of these PDRs, it authors its **own** ADR — at which point that PDR's castr phenotype is castr-local, and the Oak
  cite remains accurate origin history.
- The ~5 markdown-link forms (`[ADR-131](../../../docs/architecture/architectural-decisions/…)`) resolve to Oak's tree,
  not castr's, so the _links_ are non-functional in castr — but they are **non-load-bearing historical context**, and
  castr has no markdown-link gate. Editing immutable PDRs to de-link them would violate PDR-001 retention for cosmetic
  gain.

**Disposition:** retained-cross-host (resolved). No PDR edits. Re-evaluate only if castr adopts a markdown-link gate, in
which case the link _targets_ (not the references) get neutralised to plain text in a single governed sweep.

### PDR → PDR citations — disposition: **resolve**

90 distinct intra-PDR cites; every transplanted PDR file (now 92 files / 90 numbered slots — PDR-086 vacant, inherited from Oak; PDR-076 split into 076/076a/076b; PDR-091 folded at Phase 5) resolves, so every intra-PDR reference resolves. ✓

### PDR / practice-verification → no `@oaknational`/`oak-` naming

Verified: 0 files carry Oak-package naming. No localisation required for the PDR estate or `practice-verification.md`. ✓

---

## Phase 1b — Core generation merge + provenance + practice-context retirement

### `provenance.yml` created (history union) — disposition: **resolve**

Phase 1a left the trinity + `practice-verification.md` pointing at `provenance: provenance.yml` with no such file
present (a dangling pointer). Phase 1b creates `.agent/practice-core/provenance.yml` as the union of Oak's four
per-file chains + castr's branch-local entries (the 2026-03-22 entry on `practice.md` + `practice-lineage.md`) + a
2026-06-05 merge node per tracked file. All four `provenance: provenance.yml` pointers now resolve. Identity-deduped
(castr's inline indices 0–7 ≡ Oak's shared-ancestry entries — not re-added); zero duplicate ids. ✓

### Core generation converged to Oak's current portable trinity — disposition: **resolve**

`practice.md`, `practice-lineage.md`, `practice-bootstrap.md`, `index.md`, `README.md` adopted from Oak's current
generation (0 `@oaknational`/`oak-` naming; self-containment clean — no navigable external links except
`../practice-index.md`). Verified castr's portable trinity carried no generic content Oak lacks (learned principles are
an Oak superset; "Paused is not future" already in Oak; the 2026-03-22 wording survives as provenance history).
`practice-verification.md` already current from 1a (cosmetic bullet style only). `CHANGELOG.md` = Oak's canonical
history (already carries `[castr] 2026-03-09`) + inserted `[castr] 2026-03-22` + prepended `[castr] 2026-06-05`
transplant entry. No localisation needed — every `oak-` hit is `[oak-open-curriculum-ecosystem]` repo-name provenance.

### `.agent/practice-context/` retirement — disposition: **rewrite (live) / retained-historical (immutable)**

Retired per PDR-007 amendment (2026-04-29). Directory removed; castr's 4 authored `outgoing/` notes archived to
`.agent/archive/practice-context-outgoing/` (git-mv, history preserved; README explains provenance).

- **Live navigational references repointed (rewrite):** `.agent/directives/AGENT.md` (structure list — surgical line
  removal, PRESERVE-safe), `.agent/README.md` (tree diagram), `.agent/practice-index.md` (removed the one navigable
  `](practice-context/)` table row — the only broken-link risk). 0 navigable `practice-context` links remain in `.agent`.
- **Core prose:** the adopted Core mentions `practice-context` only to document its retirement — correct, kept.
- **Retained-historical (NOT edited):** `practice-context` references inside 7 immutable PDRs + `decision-records/README.md`
  (PDR-001/PDR-079 immutability — they record the decision), 2 archived files, and 3 completed/future plans (historical
  record). Editing these for cosmetic cleanup would violate immutability and lose history.
- **Known cross-host prose inconsistency (retained-cross-host):** Oak's adopted Core prose names `decision-records/incoming/`
  as the inbound surface, but the actual Practice Box is `practice-core/incoming/` (present in both Oak and castr).
  Code-text only, non-breaking; mirrors Oak's own doc/disk state. Not corrected in 1b.

---

## Phase 3 — Skills

18 Oak skills brought (current `ad649710` forms); `ground-truth-design`/`-evaluation` not brought.

### Naming localisation — disposition: **rewrite (done)**

The relevance-ledger's "zero `@oaknational`/`oak-` naming in skill bodies" was **overstated**: ~20 internal refs
existed (`oak-consolidate-docs`, `oak-start-right-quick`, `oak-metacognition`, `oak-commit`, `oak-undo-change`,
`@oaknational/agent-tools`, `oak-session-identity`). All localised `oak-`→`engraph-`, `@oaknational/`→`@engraph/`.
Cross-skill refs now resolve to the `engraph-`-prefixed adapters generated this phase.

### Oak-PRODUCT coupling reconciled to castr — disposition: **rewrite (done)**

Correcting the ledger's "portable, localise-naming-only" assessment: several skills embedded Oak's **real, current**
product specifics (correct for Oak, wrong for castr), reconciled to castr this phase:

- `gates` + `start-right-quick/shared/start-right.md` + `start-right-thorough/shared/start-right-thorough.md` carried
  Oak gate commands (`sdk-codegen`, `doc-gen`, `test:widget`/`:ui`/`:a11y`, `markdownlint:root`, `format:root`,
  `secrets:scan`) → reconciled to castr's `qg` chain (`pnpm check`/`check:ci`).
- SDK-specific "Schema-First Nuance" prose → castr **IR-honesty domain grounding** (the gap taxonomy, fail-fast,
  schema-expert roster) — folding castr's retired `castr-start-right` into the shared core (owner directive).
- Oak ADR-index navigational paths (`docs/architecture/architectural-decisions/`) → castr's
  `docs/architectural_decision_records/`; `docs/engineering/*` doc pointers → generalised/castr equivalents.
- `schema-first-execution.md` directive cites (DON'T-BRING) → re-pointed to `requirements.md` (castr's schema-first home).

### Upstream Oak bug — disposition: **rewrite (done) + back-flow to Oak**

`consolidate-docs` cited `.agent/practice-context/outgoing/`, but Oak **retired practice-context on 2026-04-29
(`54f07f63`)** and did not update the skill — it is the only Oak skill still referencing it. Not a castr decision; a
stale upstream ref. castr's copy repointed to the three durable homes (PDR / pattern-PDR / `.agent/reference/`). **Flag
to Oak** as Practice-shaped feedback (the fix belongs upstream).

### Forward-refs — disposition: **placeholder** (resolve at their phase)

- Skill → **rule** cites (incl. `permanent-doc-is-the-consolidation-record`, `collaboration-is-value-contingent`,
  `documentation-hygiene`, `pre-merge-divergence-analysis`, the collaboration cluster) → **P4**. `invoke-reviewers`
  resolves now (castr rule present).
- Skill → **memory** paths (`memory/active|operational|executive/…`) → **P6 ✅ (2026-06-17, opening pass)**: the flat
  `.agent/memory/{napkin,distilled}.md` + `code-patterns/` were `git mv`'d into `.agent/memory/active/{napkin,distilled}.md`
  - `active/patterns/` (renames, history preserved), so the skill/directive/start-right `memory/active/…` forward-refs now
    resolve on disk. `operational/` + `executive/` contract docs land in the same Phase-6 surface (sub-plan
    `06-memory-and-generator-consolidation.md`).
- Skill → **state/collaboration** paths → **P8**.
- `RULES_INDEX.md` → **P4**.
- Skill → **directive** `orientation`/`tdd-as-design`/`continuity-practice` → **P5**.

### Skill → Oak-ADR cites — disposition: **retained-cross-host**

Doctrine cites to Oak ADRs > 047 (`ADR-117` in `plan`, `ADR-150` in `session-handoff`, `ADR-182` in `start-right-team`,
plus ADR-121/125/131/144/172/176/183 across skills) — honest origin references to where the Practice pattern is
operationalised in Oak, exactly as the Phase-1 PDR→Oak-ADR disposition. Not edited.

### Resolved now

Skill → PDR cites (PDR-007/011/014/018/026/027/029/…) ✓; skill → castr directives (AGENT/principles/testing-strategy/
requirements/DEFINITION_OF_DONE/metacognition) ✓; skill → skill (within the 18) ✓.

**Phase-3 result: 0 `rewrite`-class entries remain open in touched files; all dangles are `placeholder`(→P4/P5/P6/P8) or
`retained-cross-host`.**

---

## Pre-Phase-4 hygiene (2026-06-09) — reverse closure of the Phase-3 retirements

The per-phase scan covers references _out of touched files_; retiring a surface dangles references _in untouched
files_. This sweep closes that gap for Phase 3's retirements (`jc-*`, `castr-start-right`, `distillation`,
`.agent/commands/`, `SKILL.md`→`SKILL-CANONICAL.md`); the sweep is now a standing step in the contract's per-phase
verification.

- **Live navigational refs repointed (rewrite, done):** `directives/AGENT.md` (start-right guidance, infrastructure
  lists, adapter wording), `practice-index.md` (Tools table → canonical skills; artefact rows), `.agent/README.md`
  (tree), `rules/napkin.md` and `workflows/start-right.md` (→ `SKILL-CANONICAL.md` targets; the latter repointed to
  `start-right-quick`), `.codex/README.md` (adapter wording), `plans/remediation/README.md` (`jc-plan` → the `plan`
  skill).
- **Upstream Oak bug — rewrite (done) + back-flow:** `practice-core/practice-lineage.md` named `jc-consolidate-docs`
  as the live consolidation vehicle in two present-tense protocol lines; Oak's `ad649710` copy carries the same lines.
  castr's copy now names the canonical `consolidate-docs` skill. Second back-flow item (with Phase 3's
  `consolidate-docs` practice-context ref) for the Phase-9 feedback report.
- **Retained-historical (NOT edited):** napkin session history, archived practice-context notes, completed/historical
  plans, the transplant ledgers' own retirement records, immutable PDR-026/PDR-029 `jc-*` mentions, practice-core
  `CHANGELOG.md` history.
- **Orphan noted:** `.agent/workflows/` (single file, zero inbound references) — repointed truthfully now; disposition
  folds into the directives/adapters phases (P5/P7).

---

## Phase 4 — Rules + RULES_INDEX

**80** Oak rules brought (held baseline `ad649710` forms) + castr's 5 merged in place = **85** canonical rules;
root `RULES_INDEX.md` hand-authored (85 rows, Oak grammar; index↔disk verified exact). Every rule body read
firsthand; per-surface reconciliation throughout (the Phase-3 lesson held: naming-localisation was nowhere near
sufficient).

### Disposition change vs the grounded plan — `use-result-pattern` DON'T-BRING (9th drop)

Firsthand reading found `use-result-pattern` ("never throw exceptions") in **direct contradiction with castr's
`principles.md` §Fail-Fast** ("errors MUST be thrown IMMEDIATELY"), with no true estate here (1 of ~340
agent-tools files uses `Result<`; its enforcement mechanics are Oak-workspace ESLint). The locked hierarchy (castr
product doctrine always wins) forces the verdict — dropped, not escalated. KEEP count corrected 81→80. Its
cause-preservation nugget (`{ cause }` chains — castr-compatible since castr throws) is a future castr-rule
candidate, napkin-noted.

### Naming localisation — disposition: **rewrite (done)**

`oak-` skill/command names (`oak-consolidate-docs`, `oak-session-handoff`, `oak-plan`, `oak-start-right-team`),
`OAK_AGENT_IDENTITY_OVERRIDE`→`ENGRAPH_AGENT_IDENTITY_OVERRIDE` (matches castr's transplanted code),
`.cursor` hook/mirror names → `engraph-` forms (match `agent-tools/src/cursor/`), `@oaknational` references.

### Oak-PRODUCT/host coupling reconciled to castr — disposition: **rewrite (done)**

- **False principles-section cites** (castr's principles has no "Owner Direction Beats Plan", "Code Quality /
  Misleading docs are blocking", "Document Everywhere", "No machine-local paths", "§Refactoring", or no-verify
  language): generalised in-rule or repointed to castr's real anchors (`§Core Philosophy: Engineering Excellence
Over Speed`, `§Strict And Complete Everywhere, All The Time`, `§Comprehensive TSDoc Standards`, `§Type System
Discipline`, `§Strict-By-Default and Fail-Fast`) and to `DEFINITION_OF_DONE.md` + `quality-gate-failures.md`
  (castr's blocking-gate doctrine) across ~12 rules.
- **Oak gate/tooling estate** → castr's chain: markdownlint/secrets-scan/esbuild/Sentry enforcement sections
  reconciled (prettier + `.prettierignore` as the format-gate record; castr test-suite names; ESLint thresholds
  corrected 250/50 → castr's real **220/45**; `sha-prefix` and `markdown-code-blocks` enforcement honestly
  attributed cross-host).
- **`generator-first-mindset`** rebound from Oak's SDK-codegen phenotype (sdk-codegen command,
  `schema-first-execution.md`) to castr's IR→writers/codegen phenotype + `requirements.md`, principle preserved.
- **`invoke-mcp-expert`** trimmed from MCP-server-product triggers to castr's MCP-emission domain; DON'T-BRING
  expert cross-refs (clerk, elasticsearch) removed; roster names reconciled (current castr gateway =
  `code-reviewer`; P6-arriving specialists keep Oak names).
- **`no-skipped-tests`** now carries castr's testing-strategy upstream-quarantine shape (`DEFECT_FIXTURES` +
  `it.skip.each()`) — castr's authority wins over Oak's absolute form.
- **`directive-file-context-budget`** Oak directive enumeration dropped (drift-prone; included DON'T-BRING
  `schema-first-execution.md`).
- **session-handoff step renumbering**: castr's step-11 adversarial insertion shifted Oak's ≥11 cites —
  `check-singleton-per-window` §11→§12 fixed; step ≤10 cites verified unshifted.
- `pnpm agent-tools:*` root aliases the rules canonically invoke added to `package.json` (mirror of Oak's form,
  localised; CLIs exist and build — absent-infra invocations hard-fail truthfully per the deferred-validator
  lesson).

### Oak-ADR cites — dispositions

- **7 numeric collisions with castr ADR≤047** (ADR-011/029/030/031/032/034/038, across the test/type/generator
  rules): all were cited as operative "Operationalises" authority — actively misleading in castr. Re-pointed to
  castr's real authorities (`testing-strategy.md`, `principles.md` sections) with explicit **"Origin: Oak ADR-NNN
  (cross-host; castr's ADRs with those numbers are unrelated decisions)"** disambiguation.
- **>047 cites** (ADR-114/117/119/121/123/124/125/127/129/131/141/146/150/153/161/163/167/182/183/186):
  **retained-cross-host** — honest origin references, exactly the Phase-1 PDR and Phase-3 skill disposition. Link
  forms left intact (non-load-bearing; castr has no link gate). Where a collision-range or operative-authority
  rewrite touched the surrounding text, Oak-tree links were de-linked to plain cross-host attributions.
- **Oak-local plan/doc cites** (gate-recovery-cadence plan, multi-agent-collaboration plan, docs/engineering
  guides, docs/governance/typescript-practice, `.gitleaks.toml`): de-linked to plain-text cross-host origin notes;
  castr equivalents named where they exist.

### Phase-3 placeholders pointing here — disposition: **resolve** ✓

Skill→rule cites (`permanent-doc-is-the-consolidation-record`, `collaboration-is-value-contingent`,
`documentation-hygiene`, `pre-merge-divergence-analysis`, the collaboration cluster) and `RULES_INDEX.md` all
resolve on this tree. `new-rule-vs-pdr-clause` → `RULES_INDEX.md` resolves same-phase.

### Forward placeholders out of rules

- Rule → **directive** cites (`agent-collaboration`, `user-collaboration`, `orientation`) → **P5**.
- Rule → **memory** paths (`memory/active/patterns/*`, `memory/operational/*` incl. `pending-graduations`,
  quarantine, threads, `distilled.md`) → **P6**; rule → P6-arriving sub-agent templates/experts (assumptions,
  docs-adr, onboarding, security, config, release-readiness, architecture personas, subagent-architect) → **P6**.
- Rule → `.claude/rules`/`.cursor/rules`/`.agents` forwarder tiers + `.cursor` hooks → **P7** (the index's
  three-form authoring contract becomes fully realised then; rules do not auto-load on any platform until P7).
- Rule → **state/collaboration** paths (schemas, claims, comms, conversations, escalations, handoffs,
  `.agent/reference/comms-watch-mechanism.md`) → **P8**.

### Upstream Oak bugs — **back-flow items** (for the Phase-9 feedback report)

**Back-flow target — DECIDED (owner, 2026-06-19 s3): a fresh branch off current Oak `main`** (e.g.
`practice/castr-backflow`), PR'd to Oak `main` — **not** the stale `practice/transplant-to-castr` branch and not a
direct-to-main PR with no staging branch. The items below (plus the substrate magic-number removal §"Substrate consumer
magic numbers", the `validate-patterns-index` generator, the WS7 schema-relocation if Oak ever regresses, and **the
Phase-7 agent-adapter generator** — Oak `ad359a4f` hand-maintains its `.cursor/agents`/`.claude/agents` wrappers and
`.cursor/rules/*.mdc` triggers with no generator; castr building one replaces that hand-maintenance, the exact fragility
the `reviewer-adapter-parity` validator polices) land there as the **Phase-9** feedback deliverable; only the destination
is now fixed.

3. `capture-practice-tool-feedback` cites `skills/napkin/SKILL.md` — Oak's own napkin skill is
   `SKILL-CANONICAL.md` (stale upstream; fixed here).
4. `dont-break-build-without-fix-plan` cites `../commands/consolidate-docs.md` — Oak retired `commands/`
   2026-05-10 (fixed here → skill path).
5. `present-verdicts-not-menus` carries machine-local `~/.claude` reference links with Oak's flattened project
   id — the founding violation class of Oak's own `no-machine-local-paths` (fixed here → templated prose).
6. `present-verdicts-not-menus` cites PDR-057 by a wrong filename (`-pre-question-gate` suffix; actual file is
   `PDR-057-empirical-answerability.md`) (fixed here).
7. `register-identity-on-thread-join` cites `../commands/session-handoff.md` + `../commands/consolidate-docs.md`
   — the retired Oak `commands/` paths again (fixed here → skill paths).

### Hook-policy citations completed in data↔test lockstep — disposition: **resolve** ✓ (2026-06-09 follow-on)

castr's live `policy.json` cited `distilled.md §Stage by explicit pathspec` (a doc absent until P6) and
`principles.md §Architectural Excellence Over Expediency` (a section name castr's principles does not have). Both
resolved under the owner direction _"known issues are always blocking"_: staging-deny citations → the permanent
home `.agent/rules/stage-by-explicit-pathspec.md`; hedging/menu-framing-deny citations → castr's real
`principles.md §Core Philosophy: Engineering Excellence Over Speed`. Changed **together with their pinning
tests** (`check-blocked-patterns.integration.test.ts` contract pin + the fixture mirrors) — hook-policy suites
114/114 green. (A first attempt changed data alone and was caught by the contract test — the lockstep lesson.)

### `stale-script` validator — **GREEN and BLOCKING** ✓ (2026-06-09 follow-on)

Its single finding — `principles.md:1729` invoking non-existent `scripts/validate-jsdoc-examples.ts` — was fixed
at source under the same owner direction (the whole aspirational §Tooling Integration block reconciled to castr's
real review-time TSDoc enforcement; an impossible sweep item dropped). Validator now green and added to the
blocking `repo-validators:check` chain (5 blocking; 3 deferred: `collaboration-state`→P8, `subagents`→P6, Oak
`portability`→P7). Informational suite stands at 13/885 failures, all P6/P8 content (incl.
codex-project-agents' `clerk-expert` parity expectation — a P7 reconciliation item; castr never hosts
clerk-expert).

**Phase-4 result: 0 `rewrite`-class entries remain open in touched files; all dangles are
`placeholder`(→P5/P6/P7/P8) or `retained-cross-host`.**

---

## Phase 5 — Directives (7 generic, additive) + Oak rules-delta fold

7 directives brought from the pinned Oak branch (`practice/transplant-to-castr`, read at pinned commit `4470266`;
verified that the branch tip `518b34af` differs only by one file — castr's own back-flow feedback doc — so the 7
directives, `AGENT.md`, and `principles.md` are byte-identical at pin and tip). Brought additively; the PRESERVE'd
sacred directives (`principles`, `requirements`, `testing-strategy`, `AGENT`, `metacognition`) were not overwritten —
`AGENT.md` gained an additive index of the 7. `schema-first-execution.md` stays DON'T-BRING.

### Naming + host-product reconciliation — disposition: **rewrite (done)**

- `continuity-practice.md` + `operationalisation-contract.md`: `oak-consolidate-docs` / `/oak-consolidate-docs` →
  `consolidate-docs` (castr's canonical skill).
- `definition-of-delivery.md`: `@oaknational/*` → `@engraph/*`; dropped the Oak-only "(per ADR-162)" telemetry cite and
  the Oak EEF gate-1a "first application" cross-ref; `docs/engineering/` split-strategy → `docs/architecture/`.
- `operationalisation-contract.md` mechanism catalogue reconciled to castr surfaces: `.claude/agents/`/`.cursor/`/`.agents/`
  → `.agent/sub-agents/` (+ adapters); `packages/core/oak-eslint/` → `lib/eslint-rules/` (+ `lib/eslint.config.ts`);
  `docs/architecture/architectural-decisions/` → `docs/architectural_decision_records/`; `docs/governance/*.md` →
  `docs/architecture/*.md`.
- `tdd-as-design.md`: false `principles.md §Code Quality` cite → castr's real `§Testing Standards` (the
  **MANDATORY: TDD** block); Oak `validation-strategy.md` + `validation-and-tdd-doctrine-restructure` plan refs and the
  `docs/engineering/testing-{tdd-recipes,patterns}.md` cross-refs → castr's `testing-strategy.md` (its real recipe home);
  added a castr-headless grounding note to the scales table (UI/a11y/visual apply to companion UI workspaces, not `lib`);
  rule-surface list now names castr's `tdd.md` + `tdd-for-refactoring.md` (bidirectional with the tdd.md-rule reconcile).
- `agent-collaboration.md`: the two Oak-local **plan** citations (`multi-agent-collaboration-protocol.plan.md`,
  `gate-recovery-cadence.plan.md`) de-linked to plain text — they were `permanent → ephemeral` + cross-host, forbidden
  by `no-moving-targets-in-permanent-docs` (the rule `operationalisation-contract.md` itself cites); the build invariant
  re-attributed to castr's `principles.md §Strict And Complete` + `dont-break-build-without-fix-plan` rule.
- `orientation.md`: removed `schema-first-execution` from the Doctrine-layer row (DON'T-BRING); listed castr's real
  doctrine set.
- `user-collaboration.md`: port-clean (its only non-castr refs are bare Oak-ADR mentions = retained-cross-host).

### Phase-3/4 placeholders pointing here — disposition: **resolve** ✓

All `→P5` directive placeholders recorded in §Phase 3 and §Phase 4 now resolve on disk: skill→directive
(`orientation`/`tdd-as-design`/`continuity-practice` from `start-right`/`session-handoff`/`napkin`) and rule→directive
(`agent-collaboration`/`user-collaboration`/`orientation` from the collaboration + memory-drift rules). Reverse-closure
audit confirmed every inbound reference lands on `.agent/directives/<name>.md`.

### Forward placeholders out of the directives — disposition: **placeholder**

The directives reference castr-future surfaces that land at later phases (left as forward-links to correct future castr
paths, exactly as Phases 3–4): `.agent/memory/{active,operational,executive}/…` incl. `repo-continuity.md`,
`threads/`, `collaboration-state-conventions.md`, `agent-collaboration-channels.md`, the patterns library, and
`napkin.md`/`distilled.md` at their `active/` home → **P6**; `.agent/state/collaboration/…` (schemas, claims, comms,
conversations, escalations) → **P8**; `.gemini`/`.windsurf` adapters → **P7**.

### Retained-cross-host — disposition: **retained-cross-host**

Bare Oak-ADR mentions (`ADR-150`, `ADR-125` in `agent-collaboration`; `ADR-166` in `user-collaboration`) — honest origin
references > castr ADR-047, exactly the Phase-1/3/4 disposition. The `agent-collaboration` Founding Pattern (Frodo/Pippin/
Jazzy 2026-04 incidents) is retained as honest origin history, not a castr claim.

### Oak rules-delta fold (`ad649710` → pin) — disposition: **resolve**

The pinned-branch rules delta since the held baseline was exactly: new rule `precedence-is-not-approval.md` (+ its
portable backing `PDR-091-precedence-is-not-approval.md`) and a 6-line append to `verify-dont-trust.md`. All folded:
the rule (canonical only — forwarder tiers remain P7 for all transplanted rules) + `RULES_INDEX.md` row (86 rows == 86
files); PDR-091 + `decision-records/README.md` index row (PDR estate 91→**92 files / 90 numbered slots**; the drift
validator's definite count-claims updated in this ledger + the tracker); the verify-dont-trust status-pointer append.
Its 5 composition cross-refs (`verify-dont-trust`, `no-tombstones-for-removed-ideas`, `present-verdicts-not-menus`,
`owner-attention-at-action-moments`, PDR-091) all resolve.

### DON'T-BRING closure + discovered Phase-2-doc residue

`schema-first-execution.md` DON'T-BRING closure: the dangling `agent-tools/docs/agent-support-tools-specification.md`
reference (a Phase-2 localisation miss pointing at the never-brought directive on a wrong `../../directives/` path) →
repointed to castr's schema-first home `requirements.md` with the correct `../../.agent/directives/` path; its sibling
`testing-strategy` link on the same broken path fixed too. **Discovered (scoped to a later Phase-2-doc cleanup, not
Phase 5):** that doc's References section also carries Oak-product links (`ADR-058`/`ADR-059` under Oak's
`docs/architecture/architectural-decisions/`, OpenAI-apps / MCP-SDK refs) — recorded here so the residue is not lost.

**Phase-5 result: 0 `rewrite`-class entries remain open in touched files; all dangles are `placeholder`(→P6/P7/P8) or
`retained-cross-host`. The Oak rules-delta is folded; the PDR/rule counts and the drift-checked count-claims are
consistent with disk.**

---

## Phase 6 — Memory layout (operational registers seeded)

### Operational register seeding — disposition: **rewrite (done)** (2026-06-18)

Five operational-memory surfaces materialised from Oak `main` `ad359a4f`, localised + host-phenotype reconciled (the
structural **contracts**, not Oak runtime data — sub-plan `06` §5):

- `operational/README.md` — Oak-local OAC plan-path cite (`operational-awareness-and-continuity-surface-separation.plan.md`)
  **de-linked** per `no-moving-targets` → cite PDR-011 only; the two `collaboration-state-*.md` surface rows marked
  **(Phase 8)** un-linked (machinery not installed); the Oak `workstreams/README.md` retirement-notice rewritten to
  castr's end-state ("No workstream surface; lane state inline per PDR-027") — castr never had that surface.
- `threads/README.md` — Oak "not yet ratified / jc-consolidate-docs candidate" header rewritten (PDR-027 **is** ratified
  in castr); `jc-consolidate-docs`→`consolidate-docs`, `$jc-start-right-team`→`start-right-team`,
  `/jc-metacognition`→`metacognition`; `schema-first-execution.md` **removed** from the foundation-directive list
  (castr DON'T-BROUGHT it); the `session-discipline.md` plan-component conditional removed (castr has no such component);
  `workstreams/README.md` cites dropped; `state/collaboration/` cite marked **(Phase 8)** un-linked.
- `tracks/README.md` — OAC-phase / `runtime/tracks/` provenance rewritten to castr's Phase-6 origin; the Oak-local
  `cross-vendor-session-sidecars.plan.md` cite **de-linked** to neutral prose.
- `pending-graduations.md`, `open-questions.md` — **contract only** (frontmatter + preamble) brought; all Oak runtime
  content (owner-walk, Q-items, dated captures) is **DON'T-BRING**; `fitness_rationale` reconciled to castr (Oak ADR-144
  / dated-recalibration history dropped); castr authors entries via the napkin drain.

### New upstream Oak bug — back-flow item (Phase-9 feedback report)

8. `memory/operational/threads/README.md` cites `consolidate-docs` via `../../skills/...` (resolves to
   `.agent/memory/skills/`, nonexistent) — wrong relative depth; its sibling PDR cites in the same file correctly use
   `../../../`. Fixed here → `../../../skills/consolidate-docs/SKILL-CANONICAL.md`. (Continues the items-1–7 series above.)

### Forward placeholders out of the registers — disposition: **placeholder** (resolve later in Phase 6)

- `repo-continuity.md` (cited by `operational/README.md`, `threads/README.md`) — **RESOLVED ✅ (block f,
  2026-06-18):** castr's own continuity contract authored at `memory/operational/repo-continuity.md` (lean structural
  contract; single-stream scale; points to prompt/delivery-ledger/tracker for scope; all internal links resolve).
- `../README.md` / `../../README.md` → root `.agent/memory/README.md` (cited by `operational/README.md`,
  `tracks/README.md`, `repo-continuity.md`) — **RESOLVED ✅ (block g structure tier, 2026-06-18):** root
  `memory/README.md` (three-mode taxonomy, localised — castr directive set, `.agent/reference/` row, no `workstreams`
  surface) + `executive/README.md` authored. **The full `.agent/memory` dangling-link sweep is now empty.**

### Block (g) structure tier — disposition: **rewrite (done)** (2026-06-18)

- `memory/README.md` — Oak `schema-first-execution.md` dropped from the directives table (castr DON'T-BROUGHT); the
  `workstreams/` retirement paragraph rewritten to castr's no-workstream end-state; per-file executive enumeration
  deferred to `executive/README.md` (avoids dangling the not-yet-authored catalogues).
- `executive/README.md` — surfaces table marks each surface's **bring-status** (catalogues → Phase-6 executive-catalogue
  sub-block; `agent-collaboration-channels` → P8; substrate `.md/.manifest/.schema` → substrate sub-block); Oak host
  **ADR-125/114/129 re-pointed to castr portable PDRs** (PDR-079 portability, PDR-003 sub-agent, **PDR-010
  domain-specialist (exact)**, **PDR-050 substrate (exact)**); Oak `agent-capability-vocabulary.md` recorded
  **DON'T-BRING** (Oak developer/curriculum capability axis; no castr analogue).

### Block (g) executive catalogues — disposition: **rewrite (done)** (2026-06-18)

The three executive **catalogues** were **regenerated from castr's real estate** (firsthand-grounded against the
sub-agents roster, the adapter topology, and the `invoke-reviewers` rule — host-phenotype documents, not Oak
localisations):

- `artefact-inventory.md` — castr's canonical-vs-adapter taxonomy + how-to (skills via `skills-adapter-generate`; rules
  canonical + index, with an **honest forwarder note** that the "three on-disk forms" model is aspirational/P7;
  sub-agents canonical template + Codex adapter).
- `invoke-code-experts.md` — castr's **6-reviewer roster** (code/test/type-reviewer + openapi/zod/json-schema-expert),
  triage ladder, Codex-adapter + in-session-template invocation, worked examples; points to the `invoke-reviewers` rule
  as the firing doctrine.
- `cross-platform-agent-surface-matrix.md` — castr's **real** adapter parity (skills broad; rules forwarder-less →
  P7 ⚠️; sub-agents Codex-only ⚠️; hooks Claude-only ⚠️) with each gap named.

`executive/README.md` surfaces table flipped these three to ✅ Landed.

### Block (g) substrate — disposition: **CLOSED (2026-06-18)**

The **substrate** contract (`memory-state-substrate-contracts.{md,manifest.json,schema.json}`, consumer
`agent-tools/src/practice-substrate/`) was re-authored to castr roots and verified firsthand against the live consumer
(22 surfaces; manifest-validates-against-schema; only the absent Phase-8 collaboration plane reports the expected
`live-reader-failure`). Reconciliations from Oak: castr identity/`generated_at`; PDR-049+050 doctrine cites (castr has
both); `plan_roots` re-pointed to `transplant/06-memory-and-generator-consolidation.md` (Oak `agent-tooling` doctor plan
**de-linked** per `no-moving-targets` — back-flow not needed, the Oak plan path is host-local); reviewer routes mapped off
Oak's `docs-adr-expert`/`architecture-expert-fred`/`assumptions-expert` (castr lacks them) to castr's real `code-reviewer`
/`type-reviewer` + workflow labels; `fixture_roots` corrected to castr's `agent-tools/tests/collaboration-state/` (no
`/fixtures/` subdir); the Oak retired-YAML-seed evidence link dropped (Oak-local). `executive/README.md` substrate row
flipped to ✅ Landed.

### Substrate consumer magic numbers — disposition: **fixed in castr + Oak back-flow item** (2026-06-18)

Owner-directed removal of two anti-pattern magic numbers in `agent-tools/src/practice-substrate/`:
`EXPECTED_MANIFEST_SURFACES = 22` (`live-report.ts`) and `expectedEntryCount: 114` (`live-json.ts`). Both were **stored
derived values that the substrate manifest's own `surface_defaults.stored_derived_values_rule` forbids** ("allowed only
when the validator recomputes and compares them") — frozen literals hand-edited on every change, guaranteeing future
staleness; `22` did not even describe disk reality (11 of 22 surfaces are forward-references). Removed both count checks
(`evaluateManifestSurfaceCount`, `evaluateMigrationLedgerCount`) + their `ManifestSnapshot.expectedSurfaceCount` /
`MigrationLedgerSnapshot.expectedEntryCount` fields; the recompute-against-state integrity checks remain (unique ids,
required fields, valid PDR-049 merge classes, schema validation; ledger dup-paths + byte-count + SHA-256 recompute). Tests
updated in lockstep; `practice-substrate` 41/41 green; type-check + lint + build green; the live consumer is behaviourally
unchanged (only the 2 expected Phase-8 `live-reader-failure` signals).

- **Oak back-flow item (Phase-9 feedback report):** Oak's `agent-tools/src/practice-substrate/` carries the **identical**
  code at the pin `ad359a4f` _and_ at Oak `main` HEAD (same three files, same line numbers). The same removal should land
  upstream. **Destination is the open Phase-9 back-flow decision** (`practice/transplant-to-castr` vs `main` vs a fresh
  branch); not applied to the pinned Oak working tree to avoid dirtying the Phases 6–9 source.

### Block (g) remaining — disposition: **rewrite (done)** (2026-06-19 s3, owner-directed P6)

`agent-collaboration-channels.md` **authored in Phase 6** (owner direction 2026-06-19: "resolve all open questions and
deferred items"; supersedes the earlier "lands at P8" placeholder). It is the routing **index/contract** for the channels
in [`agent-collaboration.md`](../../directives/agent-collaboration.md), reconciled to castr: schema cross-refs re-pointed
to the WS7 source location (`agent-tools/src/collaboration-state/schemas/`); the Oak-local
`collaboration-state-write-safety.plan.md` cite **de-linked** per `no-moving-targets`; channel-5 reviewer experts
(`docs-adr-expert`/`assumptions-expert`) now real. The `.agent/state/collaboration/` **runtime surfaces** it indexes
remain **Phase-8** (the card carries an explicit materialisation-status note, so it is an honest forward-looking contract,
not a claim the runtime plane exists). `executive/README.md` row flipped to ✅ Landed.

### `active/patterns/` import — disposition: **rewrite (done) + new tooling + Oak back-flow** (2026-06-19)

130 patterns imported from Oak `ad359a4f` (132 − 2 UI-only). Dispositions:

- **`proven_in` — disposition: rewrite (done).** Owner-directed: set to the literal `imported` on all 130 (keep
  `proven_date`); **no source-repo reference at all** — this **diverges from** the `retained-cross-host` convention used for
  PDR/rule/skill Oak-ADR cites. The owner extended "do not reference the source repo" to **all** source-repo references in
  pattern bodies (not just `proven_in`).
- **Broad source-repo neutralization — disposition: rewrite (done).** Removed every Oak reference from pattern bodies: 16
  distinct Oak ADR refs (`ADR-078`…`ADR-185`, genericized in prose/tables/de-linked), 11 dangling `.md` links to Oak-estate
  ADRs/docs/plans/reports/experience (de-linked), and product/path/package tokens (oak-curriculum apps, `@oaknational/*`,
  EEF/opal/KS5/sdk-codegen). Verified firsthand: **zero** Oak identifiers remain (agent codenames like Opalescent and generic
  third-party vendors Sentry/Clerk/Elasticsearch retained — neither is source-repo identity). Justified by the patterns
  README's own "patterns are abstract" doctrine.
- **Frontmatter taxonomy — disposition: rewrite (done), NORMALIZE not expand.** Real estate had drifted to 10 categories;
  normalized by substance to the canonical 5 (planning→process, test-architecture→testing, build-system→architecture,
  coordination\*→agent as P8 collaboration-class candidates); polarity typos fixed; `use_this_when` backfilled (36 files);
  `title:`→`name:` (3). Expanding the taxonomy was rejected as ratifying accidental drift.
- **Index generator — disposition: NEW tooling + Oak back-flow item (Phase-9).** The README `## Pattern Index` is now a
  **generated** sentinel-delimited region produced by `agent-tools/src/validators/patterns-index/validate-patterns-index.ts`
  (`--check` wired into `repo-validators:check`; `--fix` regenerates; strict conformance gate). Repo-agnostic
  (`resolveRepoRoot`, no repo names) → ports to Oak verbatim and **fixes Oak's stale hand-kept index (87 listed / 132 on
  disk)**. Destination is the open Phase-9 back-flow decision (`practice/transplant-to-castr` vs `main` vs fresh branch),
  same as the substrate-consumer item above.

### Sub-agent roster — disposition: **complete the half-built expert system (done)** (2026-06-19)

The opener's "bring Oak's 13 generic templates + components" was a hypothesis; firsthand grounding overturned it twice
(napkin 2026-06-19 s2). The real driver was a **negative-space sweep of castr's own `invoke-*` rules**: three rules
authored in Phases 4–5 — `invoke-assumptions-expert`, `invoke-mcp-expert`, and
`invoke-doc-and-onboarding-experts-on-significant-changes` (the last is **owner standing doctrine 2026-05-02**) — each
cited a `.agent/sub-agents/templates/<x>.md` that **did not exist**. So Phase 6's sub-agent step was **completing the
missing half of an expert system castr already committed to**, not a free roster choice. Owner confirmed (2026-06-19):
author the full rule-required set + `config`/`release-readiness`, keep the 4-persona architecture device, keep the
DON'T-BRING-7.

- **9 new lean castr-native templates** (`.agent/sub-agents/templates/`): `architecture-expert` (one template, four
  persona lenses), `assumptions-expert`, `config-expert`, `docs-adr-expert`, `mcp-expert` (narrow: the IR→MCP-Tools
  **writer** / emitted definitions, NOT servers/Apps/auth), `onboarding-expert` (narrow: castr's AI-agent + contributor
  paths, NOT Oak's curriculum/VISION journey), `release-readiness-expert`, `security-expert` (re-scoped:
  untrusted-input / ReDoS / billion-laughs / prototype-pollution / unsafe-deserialisation — castr has no auth/PII
  surface), `subagent-architect`. **Authored native, not copied** — castr's existing 6 are lean (76-line) templates
  referencing `principles/dry-yagni.md`, so Oak's ~300-line monorepo/product templates were reference-for-essence only;
  zero Oak phenotype carried in. Roster **6 → 15** templates.
- **Components** (`.agent/sub-agents/components/`): `architecture/reviewer-team.md` + `personas/{barney,betty,fred,wilma}.md`
  brought + localised ("monorepo" → "repository"); `subagent-principles.md` **DON'T-BRING** (castr's existing templates
  use the leaner `dry-yagni.md`). DON'T-BRING-7 unchanged (accessibility, clerk, design-system, elasticsearch,
  react-component, sentry, ground-truth-designer — no castr surface).
- **Codex adapters** (`.codex/agents/` + `config.toml`): 12 new adapters (4 architecture personas each loading the shared
  template + persona component, Oak's mechanism; 8 singles) + 12 registrations; **existing 6 backfilled** with the
  validator-required `name`+`description` (a latent gap — the deferred validator never caught it). **Two subagent
  validators with CONTRADICTORY `config_file` path resolution (P7 reconciliation item):** castr's LIVE
  `portability:check` (`scripts/validate-portability.mjs`, in `pnpm check`) resolves `config_file` **relative to repo
  root** → requires `.codex/agents/X.toml`; the **deferred** Oak `validate-subagents.ts` resolves **relative to
  `.codex/`** → requires `agents/X.toml`. No single string satisfies both. castr keeps the **live** form
  (`.codex/agents/X.toml`, its historical gate-passing shape); the Oak validator's double-nesting is a **Phase-7**
  reconciliation (row 7 = "flip portability/subagents gates"). **`validate-portability.mjs` refactored to recompute**
  the roster from disk (template dir + adapter dir + config registrations, with a registration↔adapter bijection and a
  persona-aware "adapter loads SOME canonical template" check) instead of a **hardcoded `expectedAgents` list of 6 + an
  `=== 6` count assertion** — the same drift-detector-as-frozen-literal anti-pattern removed from the substrate consumer
  (2026-06-18); adding a reviewer now never requires editing a frozen list. (Caught by the session-handoff full
  `pnpm check`: the intra-phase commit `d5cd4eb` had been made after only a gate _subset_, so it carried a red
  `portability:check`; rolled forward — never rewritten — to a green tip.)
  **RESOLVED Phase 7 (2026-06-20, `transplant/phase-7` `b5a7538`):** the bespoke `scripts/validate-portability.mjs` was
  **retired** (its checks subsumed by Oak's `validate-subagents` + `validate-portability`), removing the repo-root-form
  constraint; `config_file` switched to the `.codex/`-relative `agents/X.toml` form Oak's resolver wants (matches Oak at
  pin `ad359a4f`). `portability:check` now runs Oak `validate-portability`; `validate-subagents` joined
  `repo-validators:check`; both blocking-green. No double-nesting, single source.
- **Dangling-rule reconciliation:** the three rules above now point at real templates; their Oak naming reconciled —
  `code-expert`→`code-reviewer`, `test-expert`→`test-reviewer`; Oak ADR-path cites re-pointed to castr homes (ADR-129 →
  **PDR-010**, ADR-114 → **PDR-003**; the proportionality doctrine → `principles.md`); Oak MCP-server/Apps ADRs
  (123/141) **de-linked** (castr emits, has no server). Roster-of-record surfaces updated in lockstep: `AGENT.md`,
  `sub-agents/README.md`, `executive/invoke-code-experts.md`, `invoke-reviewers.md`, `start-right.md`.
- **`subagents` validator stays deferred → Phase 7.** It hard-requires a `.cursor/agents` wrapper per template (line 198),
  and `.cursor`/`.claude` platform adapters are the Phase-7 deliverable (tracker phase-table row 7: "Adapters + flip
  portability/subagents gates"). Firsthand proof the Codex+template+component layer is otherwise fully compliant: with a
  temp empty `.cursor/agents`, the validator reports **only** the 15 expected "no wrapper in .cursor/agents" issues and
  zero adapter/registration/setting/component errors. `validate-subagents` is **not** in `repo-validators:check`, so
  `pnpm check` is unaffected.
- **Named boundary (not silent):** `code-expert`/`test-expert`/`type-expert` naming and Oak ADR-path cites remain
  **pervasive** across the pre-existing transplanted estate (practice-core PDRs — which use Oak's portable generic names
  by design — plus ~25 rules and several skills/patterns). That broad estate sweep is the existing reference-closure /
  **D4** backlog, **not** this slice; only the three rules being resolved here were reconciled. The substrate manifest's
  reviewer-route mapping (which earlier mapped off `docs-adr-expert`/`assumptions-expert` because castr lacked them) was
  **re-pointed to the real experts (done, 2026-06-19 s3)** — all 22 substrate surfaces mirror Oak's per-surface routing
  reconciled to castr's roster (`docs-adr`→`docs-adr-expert`, `architecture`→`architecture-expert`,
  `assumptions`→`assumptions-expert`; Oak's `agent-tooling`, which castr has no equivalent for, → `code-reviewer`;
  `code-reviewer` retained as gateway and castr's owner-gate clauses preserved). Manifest re-validated against its schema.

### Collaboration state schemas — disposition: **bring Oak WS7 (done)** (2026-06-19 s3)

The opener framed the remaining Phase-6 item as "`.agent/state/collaboration/` schemas + empty dirs (P8 machinery
structure-only)" and the ledger §State location as stale. Firsthand grounding against the **Oak pin** (`ad359a4f`)
overturned that framing: Oak had already solved the location contention in commit `6d1e45f3` (**WS7**, 2026-06-13),
which **relocated the 5 collaboration `*.schema.json` out of `.agent/state/collaboration/` into committed source at
`agent-tools/src/collaboration-state/schemas/`** and **decoupled the validator's schema-root from the validated data
file's path** (module-relative `package.json`-walk, so the schemas always exist independent of the runtime data plane).
castr was on the **pre-WS7** design (validator looked for schemas beside the data → the 5 schema files were "missing"
and the agent-tools `collaboration-state`/`practice-substrate` suites failed at setup). Owner decision (2026-06-19):
**bring WS7 now as a Phase-6 source/contract bring.**

- **Schemas relocated, not authored — disposition: replicate-as-is.** The 5 schemas (`active-claims`, `closed-claims`,
  `comms-event`, `conversation`, `escalation`) brought verbatim from the Oak pin to
  `agent-tools/src/collaboration-state/schemas/`; phenotype-clean (standard draft-2020-12, bare-filename `$id` matching
  the Ajv lookup key; no Oak/product/ADR tokens) — the structural-contract "byte-identical, replicate as-is" case.
- **Validator decouple — disposition: rewrite (done).** `collaboration-json-validation.ts` adopts the WS7
  `resolveSchemasDir()` (`package.json`-walk → `src/collaboration-state/schemas/`) + no-arg
  `createCollaborationJsonSchemaValidator()`; `state-integrity.ts` drops the data-dir schema-root argument;
  `live-types.ts` repoints the 5 `*_SCHEMA_PATH` constants to source (the data-path constants stay
  `.agent/state/collaboration/`). Readers repointed: the two compile-time schema fixtures (castr's `readFileSync` form
  kept, path only changed) and the `temp-collaboration-state` copy-source. `practice-substrate.unit.test.ts` needed **no**
  change (its schema paths are synthetic inputs, not constant-coupled — verified by running the suite).
- **Excluded from the bring (named):** WS7 also bundled a separate statusline `listExperiments` ArcAngel rapid-comms
  repoint (`.agent/collaboration/rapid-comms`, Bugbot ccc37502/de9f2522) — a different workstream; castr has no such code,
  so it is **out of scope**. No `.agent/state/` runtime data was created — the runtime data plane stays Phase-8.
- **Substrate-contract reconciled to truth — disposition: rewrite (done).** The manifest's 5 `schema_or_parser` fields
  and the `.md` (findings framing + Known-Contract-Gaps row) flipped from "schemas are a Phase-8 item / colocated
  `.schema.json` not yet on disk" to "schemas committed source at `agent-tools/src/collaboration-state/schemas/`
  (WS7-decoupled); only the runtime data plane is Phase-8." Verified firsthand: the substrate consumer now reports the
  schema reads as resolving — its remaining 2 `live-reader-failure` findings are both **runtime data** (`active-claims.json`,
  `shared-comms-log.md`), the honest Phase-8-absent signal that **must not be silenced**. The agent-tools informational
  suite went **13 → 1** failures; the lone remaining is the pre-existing `clerk-expert` parity expectation (P7 item).
- **Effect on the Phase-6/8 boundary:** WS7 makes "schemas-as-committed-source" (Phase 6, this slice) cleanly separable
  from the "`.agent/state/collaboration/` runtime skeleton + activation" (Phase 8, `08-collaboration-active.md` §1–2).
  `08` §2's "open design point" (emit JSON-Schema from Zod **or** reconcile the consumer) is **moot** — Oak chose neither;
  it committed hand-authored schemas in source, which this slice adopts.

**Phase-6 result (state schemas): full `pnpm check` green; the bring is a `agent-tools` source/contract change touching
no runtime `.agent/state/` plane.** The two follow-on Phase-6 items the owner directed (2026-06-19 s3, "resolve all open
questions and deferred items") are **both done**: the substrate reviewer-route re-point (above) and
`agent-collaboration-channels.md` (Block (g) remaining, above). All three standing deferred items are also **resolved**
(back-flow target → fresh branch off Oak main; D1 → TS-version-skew root-fixed via a single-TS pnpm override, rules at
`error`, 0 violations; Q-001 → D3-before-merge + split PRs). **`transplant/phase-6` ✅ CUT (`a63aee3`) + pushed — Phase 6
COMPLETE; reference-closure-clean (no open P6 placeholders).** Next = Phase 7.

## Phase 8 (partial) — Collaboration substrate skeleton + `collaboration-state` gate flip (2026-06-20)

Owner-approved partial Phase-8 landing ("skeleton + replan reconcile"). Materialised the `.agent/state/collaboration/`
runtime substrate (seeded empty) and flipped the last deferred validator blocking. The remaining Phase-8 tasks
(SessionStart live-registration, test-exclusion removal, per-thread records, generic-surface reconciliation) carry the
`transplant/phase-8` tag — this is a **green-gated intra-phase commit**, not the phase tag.

### Substrate skeleton — disposition: **rewrite (done)**

`.agent/state/README.md` + `collaboration/{.gitignore, conversations/.gitkeep, escalations/README.md,
handoffs/README.md, sidebars/.gitkeep, comms-archive/.gitkeep}` authored castr-native, seeded **empty** (no upstream
event data — Oak's committed `conversations/`/`sidebars/` carry real Oak decision data, DON'T-BRING). The two-tier
tracked/untracked model (repo-tier `conversations/`/`escalations/`/`sidebars/` tracked; instance-tier
`comms/`/`active-claims.json`/`closed-claims.archive.json`/`comms-archive/*`/`handoffs/*` untracked) is enforced by
`collaboration/.gitignore`, brought near-verbatim (portable).

### `state-integrity.ts` ENOENT-tolerance — disposition: **complete the WS7 bring (done)**

The earlier WS7 pass (2026-06-19 s3) brought an **older** `state-integrity.ts` that threw unconditionally on absent
surfaces — so the deferred validator could never be green on a fresh checkout (instance-tier files are git-ignored,
absent in CI). Brought the Oak pin's `optionalWhenAbsent` hardening: `active-claims.json` / `closed-claims.archive.json`
/ `comms/` are optional-when-absent (the clean state, not a fault); `conversations/` / `escalations/` stay required.
TDD: brought the Oak pin's "treats absent untracked-by-design surfaces as clean" test (red against castr's throwing
code) → brought the hardened source (green). castr's `state-integrity.ts` is now **byte-identical to the Oak pin**.

### `collaboration-state` gate flip — disposition: **flipped blocking (done)**

`validate-collaboration-state` added to `repo-validators:check`; green against the empty skeleton
(`collaboration-state validate: OK`). The deferred-validator note in the tracker is updated — `collaboration-state` is
no longer in the deferred set. **The `agent-tools` test exclusion is also resolved (Phase 8 task 4b, 2026-06-20):** the
"clerk-expert P7" blocker was a **phantom** — an Oak-phenotype assertion (`codex-project-agents.integration.test.ts`
demanded a `clerk-expert` castr never hosts, per §Phase-4 above), reconciled to castr's real `code-reviewer` roster;
suite 943/0 and `turbo test --filter=!@engraph/agent-tools` removed, so agent-tools now gates in `pnpm check`.

### Cross-host + local cites introduced — disposition: **retained-cross-host / resolve**

- **Retained-cross-host** (Oak refs castr's estate lacks; the design genuinely originates in Oak, per the Phase-4 >047
  precedent): `ADR-199` / `PDR-094` (untracked-instance-tier + class-tiered archive doctrine, in `.agent/state/README.md`
  - `.gitignore`); `ADR-182` (mid-cycle-handoff-record substrate phenotype, in `handoffs/README.md`).
- **Resolved castr-local**: `PDR-063-mid-cycle-retirement-protocol.md` (handoffs genotype — castr-resolvable link);
  the escalation-schema cite repointed from Oak's old `../escalation.schema.json` to the WS7 committed source
  `agent-tools/src/collaboration-state/schemas/escalation.schema.json`; Oak's `../fixtures/escalations/` (castr has no
  such dir) repointed to the `agent-tools/tests/collaboration-state/` suite.

**Phase-8 (partial) result: full `pnpm check` green; intra-phase commit (no `transplant/phase-8` tag — phase incomplete).**
