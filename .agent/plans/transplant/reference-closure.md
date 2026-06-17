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
