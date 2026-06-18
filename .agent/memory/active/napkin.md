# Napkin

This file captures session-scoped discoveries, mistakes, corrections, and useful patterns before they are distilled or promoted into permanent docs.

## 2026-06-18

- **Owner correction — single-branch operation is a CONSTRAINT, not a fit (inverted-causality).** I answered "are we
  ready for per-thread continuity records?" with "no — wait until concurrent threads arise; no structural value yet."
  Owner: _"that's backwards, I am operating in a single branch because that is all the agent support framework can
  currently handle."_ Multi-agent concurrency is the explicit **goal** of this branch (primary plan user-impact line);
  per-thread continuity + the collaboration substrate are **enabling infrastructure on the path to it**, not a downstream
  consequence to wait for. My "wait for the trigger" deferral was **circular** — concurrency cannot arise until the
  framework (which _includes_ per-thread continuity) is built. Root error: I inherited Oak's steady-state deferral
  rationale (per-thread records "without structural value" at single-thread scale, PDR-027 §Amendment 2026-04-21) and
  applied it to castr **without reconciling to castr's build-toward-concurrency context** — the per-surface transplant
  lesson applied to a doctrine's _rationale_, and I missed it. **Meta-lesson (distill candidate): mistook a constraint
  for a fit.** Same family as green-gates-mask-gaps and manufactured-parking — reading a current limitation/absence as
  the intended steady state. **Cure:** when a surface asserts "X is fine / sufficient / 1:1 / deferred-no-value", ask
  whether X is _chosen_ or merely _imposed by an unbuilt capability_; if imposed, the surface should name the constraint
  and the enabling work, not present it as a fit. Reframed `repo-continuity.md` §Active Threads. The binding gap to lift
  the constraint is the Phase-8 collaboration substrate (+ branch/CI coordination, D3); per-thread records are its
  cheapest leaf.

- **Removed two anti-pattern magic numbers from the substrate consumer (owner-directed) — `EXPECTED_MANIFEST_SURFACES = 22`
  and `expectedEntryCount: 114`.** Owner: _"I don't want either of those magic numbers to exist in either repo… all they
  achieve is guaranteeing they will be out of date."_ Sharper framing found in the metacognition pass: a hardcoded
  expected-count is a **stored derived value** that the substrate manifest's own `surface_defaults.stored_derived_values_rule`
  ("allowed only when the validator recomputes and compares them") **forbids** — so the consumer was violating the very
  contract it enforces. And `22` never described reality (only 11 of 22 surfaces exist on disk) — it compared the manifest's
  length against a copy of its own count: a tautology with a maintenance tax. Removed both count checks + their interface
  fields (`ManifestSnapshot.expectedSurfaceCount`, `MigrationLedgerSnapshot.expectedEntryCount`) + the two now-dead functions
  (`evaluateManifestSurfaceCount`, `evaluateMigrationLedgerCount`); kept the integrity checks that **do** recompute against
  state (unique ids, required fields, valid merge classes, schema validation; ledger dup-paths + byte-count + SHA-256
  recompute-vs-recorded). Tests updated in lockstep (the enforcement-data↔test pairing lesson). **Lesson: a "drift detector"
  that is itself a hand-edited literal is not a drift detector — it is a second source of truth that drifts. The honest
  anti-drift pattern is recompute-and-compare against the artefact, never a frozen count.** Castr done + verified; Oak
  carries the identical code (pin + HEAD) → recorded as a precise Phase-9 back-flow item (destination is the open
  owner-decision). **This supersedes the "keep all 22 / lockstep code change avoided" note below** — the better answer was
  to delete the coupling, not work around it.

- **Phase 6 block (g) substrate contract LANDED — `memory-state-substrate-contracts.{md,manifest.json,schema.json}` to
  castr roots, verified against the live consumer.** The durable record is the commit + `reference-closure.md` §Block (g)
  substrate + sub-plan §4 + the executive README row; only the surprises live here:
  - **The consumer pins the contract: `EXPECTED_MANIFEST_SURFACES = 22` is hardcoded in `live-report.ts`.** The manifest
    is **consumed at runtime**, not just docs — `readManifest` Ajv-2020-compiles the sibling schema and validates the
    manifest against it (`schema-incoherence`/`invalid-json` findings), checks count==22, unique ids, all 13
    `required_contract_fields` present, valid PDR-049 `merge_class`. So "re-author to castr roots" = keep all 22 surfaces
    (the layout is byte-identical Oak↔castr; the unbuilt collaboration/diagnostics surfaces are **named Phase-8
    positions**, not drift) and reconcile only the host-local fields. Reducing the surface set would have forced a
    lockstep `EXPECTED_MANIFEST_SURFACES` code change — avoided.
  - **`practice-substrate` is NOT wired into `pnpm check`** (only a standalone `agent-tools` script). So I could run it as
    a **firsthand verification harness** for the contract without gate-blast-radius. Result: all structural checks green;
    the only 2 blocking findings are `live-reader-failure` reading `.agent/state/collaboration/{active-claims.schema.json,
shared-comms-log.md}` — the **expected, honest Phase-8-absent signal** (`collaborationAjv` readFile's the schemas with
    NO catch → throws → caught one level up as one finding per always-live evaluator). Documented in the `.md` as
    must-not-silence (the napkin's own "a failing check may be a TRUE signal" lesson, 2026-06-07).
  - **Oak phenotype in the contract, reconciled per-surface (the per-body lesson again):** Oak's reviewer routes name
    sub-agents castr lacks (`docs-adr-expert`/`architecture-expert-fred`/`assumptions-expert`) → mapped to castr's real
    `code-reviewer`/`type-reviewer` + workflow labels; `plan_roots` pointed at two Oak-local plans (incl. an `agent-tooling`
    doctor plan castr has no analogue for) → re-pointed to the transplant sub-plan, Oak doctor plan **de-linked** per
    `no-moving-targets`; `fixture_roots` named `agent-tools/tests/collaboration-state/fixtures/` (castr has the dir but no
    `/fixtures/` subdir — schemas are in-code/TS fixtures) → corrected; the Oak retired-YAML-seed evidence link dropped.
  - **The portable schema is genuinely portable — brought as-is.** It encodes the PDR-049 merge-class enum + PDR-050
    required-field set, zero host phenotype; matches sub-plan §2's "structural contracts byte-identical, replicate as-is."
    Confirmed castr's PDR-049 (5 merge tokens incl. `append-only-structured-by-<key>`) + PDR-050 (field set, tiers,
    severity/repair split) define exactly what the manifest asserts — faithful to castr's own doctrine, not just Oak text.

- **Phase 6 (memory) continued — operational registers seeded + napkin drained.** Materialised the five operational
  registers from Oak `main` `ad359a4f` (commit `d80e49f`): `operational/README`, `threads/README`, `tracks/README`
  (convention contracts, host-phenotype reconciled per sub-plan §5) + `pending-graduations`/`open-questions`
  (frontmatter + preamble **contract only**; Oak runtime content is DON'T-BRING; castr authors entries). The napkin drain
  graduated its two named targets (commit `ce57dd1`): the manufactured-permission rule + the transplant-method lessons →
  `distilled.md`. Then rotated the pre-transplant April/March block to `archive/napkin-2026-03-to-04.md`; active napkin
  back under the ~500-line threshold (454).
- **The RULES_INDEX "three on-disk forms" contract is aspirational, not implemented** — castr's 83 transplanted rules
  have **no** `.claude`/`.cursor`/`.agents` forwarders (verified firsthand: `precedence-is-not-approval`, added the same
  way in Phase 5, has none; `.claude/rules/` and `.agents/rules/` don't exist; only 3 legacy castr rules have
  `.cursor/*.mdc`). The Oak `portability` validator that would enforce forwarder-alignment is **deferred to P7**, which is
  why the forwarder-less estate is green. So I matched the **real precedent** (canonical `.md` + a `RULES_INDEX.md` row
  only), not the index prose. The index's own "three forms / land all three" text is itself a classification-claim to
  verify against the estate — the per-surface lesson, now turned on castr's own transplanted index. (Index↔reality drift
  across 83 rules is pre-existing, not mine; a P7/D4 cleanup — either generate forwarders or correct the prose.)
- **Phantom alias: `pnpm agent-tools:check-commit-message` is NOT wired in castr** (the commit skill assumes it). The
  real, firsthand-verified path is `pnpm exec commitlint --edit <file>` (the napkin's own 2026-06-17 note). The
  `check-commit-skill-advisories` orchestrator the skill describes is likewise an Oak surface; castr's `.husky/pre-commit`
  is **prettier-only** and `.husky/commit-msg` is **empty** — no commit-time commitlint hook, so the message check is a
  manual pre-screen. The skill's full commit-queue ceremony depends on P8 collaboration-state (absent) → bootstrap
  fast-path (single agent, commit directly).
- **Inherited Oak bug (back-flow #8):** Oak's `threads/README.md` cites `consolidate-docs` via `../../skills/...` (wrong
  depth → `.agent/memory/skills/`); its sibling PDR cites in the same file correctly use `../../../`. Fixed in castr's
  copy; logged in `reference-closure.md` §Phase 6.

## 2026-06-17

- **Manufactured a false dichotomy + escalated a fix as a decision (owner correction).** At session close I claimed a
  "contradiction" between the owner directing Phase 6 next and the continuity surfaces' "(1) NOW remediation / position
  1" framing, and asked the owner to pick a sequence. Owner: there is **no** contradiction — bringing the entire
  Practice / agentic framework / agent-tools / skill+rule+subagent+hook definitions over AND fixing castr's known
  issues are the **same** deep enhancement, not competing priorities; the "sequence positions" are an ordering guide,
  not a gate, and owner direction names the next slice. **I failed to apply the very doctrine I transplanted hours
  earlier** — `orientation.md` §Owner Precedence (owner-direction-beats-plan) and the new `precedence-is-not-approval`
  rule: a stale plan-sequence is precedence, not authority, and a known issue gets **fixed**, not escalated as a
  permission gate. Same family as this napkin's manufactured-permission rule candidate (2026-06-10). Cure: reframed all
  continuity surfaces to the unified deep-enhancement model and fixed the dead `fix/*`-branch routing.
- **Date discipline — use `currentDate`, not the inherited prior-session date.** Dated Phase 5 "2026-06-15" (the prior
  session's date) across surfaces; today is 2026-06-17. The prior session's D1 / single-branch / commitlint work is
  legitimately 2026-06-15; Phase 5 is today's. Corrected the live surfaces (commit timestamps are the authoritative
  record). The date is a claim to verify firsthand like any other.

- **Phase 6 opened — baseline RE-PINNED `4470266` → Oak `main` `ad359a4f` (owner, load-bearing).** Owner steered:
  for deciding the memory _structure_ we're better off from Oak's current main than the stale pin. Measured firsthand
  before acting: `main` is a **clean superset** of the pin (pin is a direct ancestor, +429 commits, no divergence/merge
  cost). Decision: re-pin all remaining phases (6–9) to `ad359a4f` — a _newer fixed ref_, not a moving target. **Key
  measured nuance:** the memory _structure_ is **byte-identical** pin→main (READMEs, substrate-contract, `orientation`,
  dir taxonomy all unchanged); only _content_ moved (patterns 122→133, generator skills). So "work from main" was right
  for the reason of getting current _content/skills_, but it does **not** change the layout I build. Back-flow target is
  now OPEN (old pin's "push to `practice/transplant-to-castr`" no longer self-evident) → deferred to Phase 9.
- **Generator-first (owner): the memory dir is a _generated artefact_ — align the skills, not just the directory.**
  Owner: _"it's not just the memory dir, it's the skills that cause it to be populated."_ `generator-first-mindset`
  vindicated. Measured split `ad649710`→main: memory-governing **rules** = zero change; structural **contracts** =
  byte-identical; the memory-**populating skills** (`consolidate-docs`/`session-handoff`/`curator-pass`/`start-right`)
  **moved** → re-sync those to main forms in this phase. `napkin`/`consolidate-until-done`/`metacognition`/
  `start-right-thorough` unchanged.
- **Opening move LANDED — flat memory → `active/` (git mv, history preserved).** `.agent/memory/{napkin,distilled}.md`
  - `code-patterns/` → `active/{napkin,distilled}.md` + `active/patterns/`. **The flat files were the only lagging
    surface** — every skill (napkin/consolidate-docs/session-handoff/start-right) AND `policy.json` (grounding_reminder
    line 430) already pointed at `active/`. **Lockstep landmine cleared firsthand** (the Phase-4 warning): `policy.json`'s
    17 `"distilled.md"` entries + the hook-policy test citation are **bare basenames / labels — location-independent**, so
    the move doesn't touch them; `practice-fitness`/`fitness-vocabulary` **discover by frontmatter, not hardcoded path**.
    Verified: format clean, all 5 blocking validators green (drift `92 PDR files` consistent). Sub-plan
    `06-memory-and-generator-consolidation.md` written; tracker re-pinned. **Next blocks:** operational/executive contract
    docs (localised) → generator skill re-sync → napkin drain.

- **Homing doc landed + generator-resync triaged (block c).** Brought `ephemeral-to-permanent-homing.md` (reconciled —
  resolves 3 dangling Phase-3 refs from consolidate-docs/session-handoff). **`git merge-file` three-way DEGENERATED** for
  the skill re-sync (castr localised 778/768 lines vs base → localisation noise swamps the real 111-line delta) → fell
  back to manual per-hunk triage (Phase-5 method). **Finding:** the generator's `ad649710`→main evolution is ~95%
  Phase-8 comms/collaboration + Oak-product; only 1 clean generic fold bringable now (consolidate-docs "trigger-firing
  discipline"). The bulk is correctly a P8 activity. Lesson: **a "skill re-sync" is a per-hunk relevance triage, not a
  wholesale bring** (Phase-3/4 lesson, deeper) — and **merge tools degenerate when ours-vs-base localisation is large;
  measure the conflict surface before trusting the tool.**
- **Main re-pin delta ledger built (owner asked "do you have a plan to bring ALL materials?").** Firsthand slug-diff +
  per-file diff vs main — **corrected my own asserted numbers**: NEW rules = **1** (`no-unbounded-host-load`), not ~10
  (9 are the DON'T-BRING set, resolved-by-design); patterns = **~131** (castr has 0; main 133), not 11; and surfaced
  **≈30 PDRs amended on main** — real upstream content (new Decisions/amendment-logs), a workstream the transplant
  **never tracked** (treated PDRs as bring-once at P1). Folded into `relevance-ledger.md` §Main re-pin delta (Tier-1 NEW
  / Tier-2 AMENDED / agent-tools by subsystem; every item phase-positioned). **Lesson: aggregate `git diff` counts
  mislead — a bring-manifest needs slug-diff cross-checked against existing DON'T-BRING dispositions, or it over-counts.**
- **OWNER DECISION (2026-06-17): PDR currency = adopt Oak's amendments at a periodic "PDR currency sync" (D4/P9).** PDRs
  are portable governance castr _hydrates_ from Oak upstream; castr appends Oak's amendment-logs **verbatim**; immutability
  (PDR-001) means append-upstream, not freeze. **The castr↔Oak Practice relationship is a periodic upstream merge, not a
  one-time copy** — reframes the transplant's tail (and ties to the Phase-9 back-flow target, still open).

- **Transplant Phase 5 LANDED — tag `transplant/phase-5` (commit `6895b4b`).** 7 generic directives brought additive +
  the Oak rules-delta folded (`precedence-is-not-approval` + `PDR-091` + `verify-dont-trust` +6). The durable record is
  the commit + `reference-closure.md` §Phase 5 + the tracker (per `permanent-doc-is-the-consolidation-record`); only the
  surprises live here:
  - **commitlint is now LIVE and enforces `subject-case`** (lowercase-start subject). `feat(transplant): Phase 5 …` was
    REJECTED; `… phase 5 …` passed. The older `Phase 4` tag commit predates commitlint. Draft subjects lowercase-first;
    validate with `pnpm exec commitlint --edit <file>` before `git commit`.
  - **"Oak moved" was benign — measured before trusting.** The pin had advanced `4470266`→`518b34af`, but the delta is a
    single file (castr's own back-flow feedback doc); all 7 directives + AGENT/principles are byte-identical at pin and
    tip. Read Phase-5 estates at the pin `4470266`.
  - **A foundational directive carried a false cross-host cite:** `tdd-as-design` cited `principles.md §Code Quality`
    for TDD-as-non-negotiable; castr names it in §Testing Standards. Same class as the Phase-4 false principles-cites —
    every directive-section cite is a claim to verify against castr's real headings.
  - **The edit-surface-bounding rule for a directive transplant:** reconcile Oak-LOCAL refs NOW (Oak plans,
    `@oaknational`, `oak-eslint`, `docs/engineering`, EEF, `oak-consolidate-docs`, Oak ADR paths); leave castr-FUTURE
    refs (P6 memory, P8 state — correct future castr paths) as forward-placeholders, exactly as Phases 3–4. Oak-local
    PLAN citations in a permanent doc also violate `no-moving-targets` — de-link, don't just leave.
  - **Adding PDR-091 tripped the drift validator's count check** (it counts PDR files vs definite count-claims): the
    estate went 91→92 files / 90 numbered slots; two definite "91-PDR"/"all 91 PDR" claims in the scanned ledgers had to
    be recomputed. The validator working as designed — recompute counts, don't just record.
  - **zsh word-splitting bit again:** `grep … $FILES` (newline-joined var) was read as one filename → false "CLEAN".
    Known lesson held: pass explicit file args / globs, never an unquoted multi-file `$var`.

## 2026-06-10

- **✅ GRADUATED (2026-06-18, Phase-6 napkin drain) — the manufactured-permission rule candidate is now a rule.**
  Owner ran `new-rule-vs-pdr-clause` and chose **new rule** (over a clause / pattern / new PDR): a cross-cutting
  tripwire spanning all four absolutes hides if buried in one rule's clause. Landed as
  `.agent/rules/no-manufactured-permission.md` (always-on; composes `never-disable-checks` /
  `rules-have-no-exceptions` / `precedence-is-not-approval` (PDR-091) / no-parking; the three worked instances carried
  over) + a `RULES_INDEX.md` row (87 canonical rules; drift green). The candidate is graduated; the rule is the home.

- **Prioritisation decision (owner, 2026-06-10): keep the plan — do NOT pull the memory surfaces forward.** Asked
  whether to prioritise P6 memory surfaces to "help the repo learn from the transplant." Verdict (owner-confirmed):
  no — shipped Criticals outrank practice infrastructure, and the learnings are NOT at risk (castr already has both
  `memory/napkin.md` and `memory/distilled.md`, committed; capture+distil pair is live). The real cost is hygiene,
  not loss: the napkin is ≈1459 lines (~3× threshold), a per-session read tax. Resolution: memory stays at **P6**,
  which **opens with a consolidation pass** (napkin-drain + graduate the manufactured-permission rule candidate and
  transplant-method lessons) — recorded as a named position in the contract's Phase 6, so it is not an
  undefined-later. Question closed; do not re-litigate.

- **Three owner decisions captured (2026-06-10, all now homed in the plan):**
  1. **Node 24 everywhere; stable LTS is always the right choice; advance to 26 only once GitHub _and_ Vercel
     support it** (named tripwire). Owner executed the config (`engines: 24.x` root+lib; `ci.yml` single-Node-24,
     matrix removed). Remaining = single-source (`.nvmrc`/`node-version-file`) + ADR-048. → tracker D2.
  2. **No lint rule ever off; in-flight rules MAY be `warn` transitionally; DoD = all back to `error` before the
     deep enhancement is complete.** This is the doctrine-correct resolution of the 126-error lint red (it is NOT
     disabling — `warn` still runs+reports, with a hard completion gate). → `DEFINITION_OF_DONE.md` §Transitional
     gate states + tracker D1.
  3. **The deep enhancement is broader than Phases 0–9** — "plenty more Practice, rules, agent tool, agentic
     engineering, CI, quality gates" to bring over; CI to the Oak SHA-pinned-actions standard. → tracker
     §Deep-enhancement arc D1–D4. "Phases done" ≠ "deep enhancement complete."
- **PR #1 verified GREEN firsthand** (Build 24.x + 26.x + Analyze + CodeQL all SUCCESS; mergeable; no review
  comments). CI does not run lint, so the local lint-red is not a PR blocker. Cross-branch `ci.yml` drift noted in
  the delivery ledger (remediation branch `[24.x,26.x]` vs transplant single-24).
- **Adversarial sweep (session-handoff step 11) findings + fixes:** (a) `DEFINITION_OF_DONE.md` packaging paragraph
  said "Node ≥ 22" — stale under the Node-24 decision → fixed to "Node 24 LTS". (b) delivery-ledger PR#1 row said
  "CI (Node 24/26) should run build+test" (speculative/future-tense) → replaced with the verified-green result. (c)
  Confirmed no other surface still says Node 22 / `>=24` / `[24.x,26.x]`-as-intended (grep below). The owner's own
  config edits (engines 24.x, single-node ci.yml) are owner-authored, preserved verbatim, committed this close.

- **pnpm toolchain integrity + release-age cooldown fixed on branch `fix/remediation-01-packaging-and-types` (commit `31ba0f0`, committed with `--no-verify` by one-time user grant).** Symptom reported: `pnpm check` triggered an install that "replaced the lockfile" and left `turbo: command not found`, with turbo flapping in/out of `node_modules/.bin` across identical runs. Three distinct root causes, all first-hand verified:
  - **Dominant cause — `pnpm` was a devDependency (`^10.33.0` → installed `10.34.1`).** pnpm puts `node_modules/.bin` first on `PATH`, so every nested `pnpm` call inside the `check` script (`clean && install && fix && qg`) ran **10.34.1**, while the terminal ran the `packageManager`-pinned **11.5.2**. The two versions fought over `node_modules`/the lockfile each run (the "reinstall from scratch" prompt + `ERROR Worker pnpm#4 exited with code 1`, stack rooted in `node_modules/.pnpm/pnpm@10.34.1/.../pnpm.cjs`). This is the engine of the churn, flapping, and crash. Fix: removed the devDependency; `packageManager: pnpm@11.5.2` is the single source of truth. It was vestigial since the initial commit and referenced nowhere.
  - **Secondary — pnpm v11 default `minimumReleaseAge: 1440` (24h supply-chain cooldown) held back `turbo@2.9.17`** (published 2026-06-09T16:10Z, ~6h before the session). pnpm fetched turbo to the store but refused to _link_ it until 24h old; since every script is `turbo …`, the whole toolchain broke. The pre-existing `minimumReleaseAgeExclude` was a brittle `name@version` list (`turbo@2.9.17` + 6 platform entries) — **and it was pnpm auto-generated**, not hand-written: under non-strict fallback pnpm appends the too-new `name@version` ids to the exclude list itself (proved in a temp probe: `Added 7 entries to minimumReleaseAgeExclude … (set minimumReleaseAgeStrict to true to gate these updates with a prompt)`). Fix: replaced with durable name/glob `- turbo` / `- '@turbo/*'` (matching is by package name, all versions; the correct documented form), and set `minimumReleaseAge: 1440` + `minimumReleaseAgeStrict: true` **explicitly** so the value is visible and resolution **fails fast** (`ERR_PNPM_NO_MATURE_MATCHING_VERSION`) instead of silently adopting a fresh release. Strict was confirmed empirically: explicit age → install fails on a too-new-only range; `minimumReleaseAgeStrict: false` → silent fallback + auto-exclude.
  - **Tertiary — `check` ran a non-frozen `pnpm install`** (a quality gate mutating the lockfile). Changed to `pnpm install --frozen-lockfile` (matches `check:ci`), per user decision.
- **Verified pnpm behaviour facts (temp-dir probes, pnpm 11.5.2):** `pnpm outdated` and `pnpm update`/`update --latest` already honour `minimumReleaseAge` — `outdated` reports only the newest age-eligible version as "Latest" (hides too-new), `update` adopts only age-eligible and annotates `(X is available)` for what it withholds. No per-command config needed. Settings keys: `minimumReleaseAge` (default 1440 since v11), `minimumReleaseAgeExclude` (by name/glob), `minimumReleaseAgeStrict` (derives true when age is set explicitly), `minimumReleaseAgeIgnoreMissingTime` (default true). The serialized `node_modules/.pnpm-workspace-state-v1.json` only refreshes on a non-no-op install, so its `settings` can lag the live config — force-refresh (rm the file + install) before trusting it.
- **Caveat — open pnpm v11 bugs:** `minimumReleaseAge` is reportedly not respected in monorepos under v11 ([pnpm/pnpm#11433](https://github.com/pnpm/pnpm/issues/11433)); `pnpx`/`self-update` ignore it (#11183, #11655). castr is a workspace, so don't treat the cooldown as a hard guarantee.
- **Metacognition correction worth keeping:** I burned the first pass deep inside the exotic `minimumReleaseAge` machinery and explicitly waved away the stray `pnpm` devDependency as "weird but mostly harmless" — that dismissal was the miss. When the symptom is _a tool behaving inconsistently across identical runs_, the first question is "which binary is actually running?", not the most novel policy explanation. Promote unexplained anomalies; don't park them. The crash stack trace naming the exact `pnpm@10.34.1` path is what forced the correction.
- **⚠️ OPEN / NOT MINE — lint is red on this branch:** `pnpm lint` fails with 126 `sonarjs/function-return-type` errors across `lib/src/shared/**` (from the sonarjs _recommended_ preset, `lib/eslint.config.ts:8`). Commit `31ba0f0` bumped `eslint-plugin-sonarjs` 4.0.2→4.0.3 via the lockfile regen, but none of the flagged files are in the commit. **User states this is a known new stricter rule, not a real failure, and will handle it separately** — do not "fix" it as part of the pnpm work. This is why `--no-verify` was used (one-time grant; not to be repeated).
- **Uncommitted branch work left intact (unstaged):** the plan-file moves (`remediation/01…` → `current/complete/`, `remediation/02…` → `active/`) now show as old-path deletions + new-path untracked (re-stage with `git add -A .agent/plans/` to re-detect as renames); plus `DEFINITION_OF_DONE.md`, `lib/src/**` edits, and 4 untracked files (`lib/tests-e2e/packaging-integrity.test.ts`, `lib/tests-helpers/generation-result-assertions.d.ts(+.map)`, `lib/tsconfig.build.json`). None of this was touched by the pnpm commit.

- **Plan-01 work restored post-sweep + Node 24/26 (owner-directed), same branch:** the pnpm migration had reverted
  `lib/package.json`'s four plan-01 pieces — restored under pnpm 11 (build → `tsc -p tsconfig.build.json`;
  `packaging:check` = `publint --strict && attw --pack . --profile esm-only`; `./parsers/zod` export repointed to the
  real `dist/schema-processing/...` path; publint/attw devDeps re-added). Build, packaging gate, and the 4 e2e tarball
  proofs re-verified green. Stray `tests-helpers/*.d.ts(.map)` artefacts (from the earlier mis-rooted tsc run) deleted.
  **Node 24/26 everywhere (owner):** root engines were already `>=24` (owner's fix — form mirrored); added engines to
  the published `lib` package (it had NONE); CI matrix 16/18/20 → 24.x/26.x; publish 16.x → 24.x; pnpm action v8 → 11
  (v8 cannot read an 11.x lockfile — CI was hard-broken).
- **CI workflows are stale beyond Node (named follow-up, sequenced):** path filters reference `lib/pnpm-lock.yaml`
  (lockfile lives at root), publish invokes a non-existent `pnpm release` via changesets the repo doesn't use, actions
  pinned by movable tags. **Owner requirement (2026-06-10): adopt Oak's SHA-pinned actions convention** (pin to commit
  SHAs with a tag comment) — recorded in the transplant contract; apply with the CI-modernisation slice.
- **Lint inventory for the owner discussion (captured, untouched per owner directive):** 126 errors =
  `sonarjs/function-return-type` ×121 + `sonarjs/in-operator-type-error` ×5. Cause: sonarjs 4.0.2→4.0.3 via lockfile
  regen shifted the recommended set. Cause beneath: `function-return-type` is a single-return-type heuristic that
  collides head-on with castr's deliberate discriminated-union returns (principles §Discriminated unions; the
  IR/writer architecture). Discussion question: rule-selection (does the rule belong in castr's gate?), NOT
  disable-to-dodge; the 5 `in-operator` hits look like genuine narrowing fixes either way.
- **Pushes + draft PR (owner-authorised hook skip, recorded verbatim):** owner asked "has the local castr branch
  been pushed? I think it would be beneficial to have a draft PR"; after being told the pre-push `check:ci` would
  fail on the owner-sequenced lint red and that bypass is owner-initiated only, owner said **"yes, please push
  all"** — treated as the per-invocation grant for this push set (mechanism: `HUSKY=0`, since the live guard
  blocks the flag literal). Pushed: `docs/initial-deep-review`, `fix/remediation-01-packaging-and-types`,
  `feat/transplant-engraph-practice` + `transplant/*` tags. **Draft PR #1 opened** (remediation 01 → main).
  Push-time find: `repository`/`homepage` metadata pointed at the historical `jimcresswell/openapi-zod-validation`
  repo, not `EngraphCode/castr` — fixed on both branches (same published-metadata class as C1).
- **Session close (handoff):** remediation branch committed (`a2c86ab` + `e1eaffc`) and **merged into the transplant
  branch** (owner-sanctioned concern-mix; `8ed2b0a` + napkin repair `62c529c`) — pnpm 11 now governs both branches;
  skills:check + 5 validators green under 11. **Merge gotchas worth keeping:** (1) staging a conflicted file marks it
  resolved — ALWAYS `grep '<<<<<<<'` before the merge commit (markers landed once; prettier then mangled `>>>>>>>`
  into blockquotes — repair needed parent-tree reconstruction); (2) an earlier napkin insertion had silently eaten the
  `## 2026-06-07` heading (date-attribution drift) — restored; heading-adjacent Edits must re-check section
  boundaries. **Delivery concept landed (owner enhancement):** a plan's _delivery_ = branches+PRs+release acts
  reaching the beneficiary (PDR-085); single DRY home `.agent/plans/delivery-ledger.md` incl. PR comment/CI
  monitoring discipline. **Oak pinned** on `practice/transplant-to-castr` @ `4470266` (no moving target; back-flow
  commits+pushes go directly to Oak — feedback file now lives THERE). **Owner feedback (standing): put visible
  signposts of reasoning/decisions in chat output as work proceeds** — so misconceptions are spottable on scroll-back
  (this session's fabricated-parking and SACRED misreads were caught exactly that way) → feedback memory written.

## 2026-06-09

- **Owner correction (load-bearing, repo-wide): the continuity surfaces had FABRICATED an owner decision.** The
  recorded "explicit-additional-properties-support is parked-in-place; remediation/ untouched (owner, 2026-06-05)"
  was never an owner instruction — _"I have never decided anything should be 'parked in place' and I never would.
  All issues MUST be fixed, mostly now, but in some cases sequencing in the current plan is acceptable. Leaving
  them until some undefined 'later' is never acceptable."_ A 2026-06-05 session reached for the lifecycle's
  parking-exception mechanism and attributed it to the owner; every later session (including this one, an hour
  earlier) inherited it as settled law and even cited it back at the owner. **`precedence-is-not-approval` names
  this exact pathology** — and behind the fabricated parking sat six shipped Critical defects for four days.
  - **Cure executed:** plan-of-record re-sequenced (owner): **(1) NOW remediation 01→07** (01 promoted, branch
    `fix/remediation-01-packaging-and-types` off `docs/initial-deep-review`, PR'd to `main` independently);
    **(2) transplant Phases 5–9**; **(3) the product feature slice** (moved to `current/paused/`, sequenced not
    parked). The lifecycle's parking exception rewritten to "No Parking — Sequenced Positions Only"; the
    bulk-archive deferral given a named slot (transplant P9); every "parked/deferred/later" framing on live
    surfaces corrected.
  - **Lesson (graduation candidate):** an owner-attributed decision in a continuity surface is **precedence, not
    approval** — it must trace to the owner's actual words; when the owner contradicts it, the record is wrong and
    gets fixed everywhere it propagated. Compression is the vector: "X is primary now" became "Y is parked
    (owner)". Never record an owner decision without the owner's words; never inherit one without locating them.

- **Phase 4 (rules transplant) LANDED — tag `transplant/phase-4`.** 80 Oak rules (ad649710) + castr's 5 = 85; root
  `RULES_INDEX.md` (85 rows). Owner ran the principles-filter over the five grounding decisions — all resolved, zero
  survived as questions (hold baseline + schedule one pre-Phase-9 delta-sync; fix stale refs now; per-rule three-way
  merge; collaboration rules land vanilla self-gated by `collaboration-is-value-contingent`; flip validators only when
  truthfully green). Gotchas + lessons:
  - **A KEEP-classed rule can contradict principles doctrine — only per-body reading catches it.** `use-result-pattern`
    ("never throw") vs `principles.md` §Fail-Fast ("MUST throw immediately"); 1/340 agent-tools files used `Result<`.
    Dropped (9th DON'T-BRING; KEEP 81→80). The relevance-ledger's surface-level KEEP read could not see this. _(Same
    family as the Phase-3 portability lesson, one level deeper: classification reads lie; bodies do not.)_
  - **castr's session-handoff step-11 insertion shifted Oak's step numbering** — Oak rules citing handoff steps ≥11
    are off-by-one in castr (`check-singleton-per-window` §11→§12 fixed); cites ≤10 verified unshifted. Expect the
    same on any future castr-local step insertion into a transplanted skill.
  - **False principles-section cites are pervasive in Oak rules** (~12 rules cited sections castr's principles.md
    does not have — "Owner Direction Beats Plan", "Misleading docs are blocking", "Document Everywhere", "No
    machine-local paths"…). Every directive-section cite in a transplanted surface is a claim to verify against the
    actual headings.
  - **Five new upstream Oak bugs** flagged for Phase-9 back-flow (stale `SKILL.md`/`commands/` cites in 3 rules;
    machine-local `~/.claude` links + wrong PDR-057 filename in `present-verdicts-not-menus`) — Oak's own
    `no-machine-local-paths` founding violation class, alive in its rule estate.
  - **`policy.json` deny citations point at `distilled.md` (absent until P6)** while the permanent home
    (`stage-by-explicit-pathspec`) landed this phase. A citation re-point was attempted and REVERTED: the
    hook-policy integration test pins the exact citation string — **policy data and its test are a lockstep pair;
    change neither alone.** Truthful re-point deferred to an agent-tools-touching phase (P7/final sync). _(Cure
    shape generalised: a transplanted enforcement layer's data is contract-tested; treat data edits as code edits.)_
  - **`stale-script` validator enumerated ONE finding — inside `principles.md`** (line 1729 invoked non-existent
    `scripts/validate-jsdoc-examples.ts`). Initially parked as an "owner action-moment behind the SACRED label" —
    **owner corrected same-day: "Nothing is sacred, this is engineering discipline, not dogma. Known issues are
    always blocking, resolve them."** Resolved: the whole aspirational §Tooling Integration block (typedoc/ts-node/
    jsdoc commands that never existed) reconciled to castr's real review-time TSDoc enforcement; validator GREEN and
    flipped BLOCKING into `repo-validators:check` (5 blocking / 3 deferred). Suite informational count 18→13
    (RULES*INDEX slice green). *(Lesson graduated: protection labels mean edit-with-rigour, never park-the-defect —
    my deferral violated the just-transplanted `no-warning-toleration`'s own text, "fix the root cause in the same
    work-item that surfaced the warning". The transplanted rules apply to the transplanting agent.)\_
  - **policy.json citations completed properly second try (data↔test lockstep):** staging-deny → the
    `stage-by-explicit-pathspec` rule path; hedging/menu-deny → castr's real `§Core Philosophy: Engineering
Excellence Over Speed`; contract pin + fixture mirrors updated in the same change; hook-policy 114/114.
  - **PDR candidate (cause-preservation):** castr throws by doctrine; a castr-shaped rule mandating `{ cause }`
    chains on re-thrown errors would keep the one good nugget of the dropped Result rule.

## 2026-06-07

- **Phase 3 (skills transplant) LANDED — tag `transplant/phase-3`, full `qg` green.** Gotchas + method lessons worth
  carrying into Phase 4+ (capture edge; some are PDR/back-flow candidates):
  - **Oak surfaces embed host-PRODUCT specifics, not just naming.** The relevance-ledger's "skills are portable /
    localise-naming-only" read was WRONG: `gates` + both start-right shared cores carried Oak's real gate commands
    (`sdk-codegen`/`test:widget`/`test:a11y`/`markdownlint:root`), Oak ADR-index paths, and SDK schema-first prose — all
    needing per-surface castr reconciliation. **Apply to P4–9: verify each transplanted surface against castr reality
    before assuming portability; naming-localisation is necessary, not sufficient.** _(PDR candidate: "transplanted
    Practice surfaces carry host-product phenotype; reconcile per-surface.")_
  - **Upstream Oak bug — back-flow item (for the Phase-9 feedback report):** `consolidate-docs` cited retired
    `.agent/practice-context/outgoing/` (Oak retired it 2026-04-29 `54f07f63`; the only Oak skill still citing it). Fixed
    in castr's copy; the fix belongs upstream.
  - **prettier is non-idempotent in ONE pass on some Oak markdown** (nested ordered lists + glued inline code like
    `` `x`and ``): `--write` changes it, `--check` still flags; a SECOND `--write` converges. Oak formats `.agent` md with
    markdownlint, castr prettier-checks it → expect this on more Oak md in P4–8. Run `pnpm format` (prettier `--write`)
    twice on flagged Oak-sourced md.
  - **`skills-adapter-generate`:** resolves `.agent/skills/<id>/SKILL-CANONICAL.md` ONLY (no `SKILL.md` fallback despite
    the stale docstring); `repoRoot = process.cwd()` (run from repo root); `--clear` wipes `.claude/skills` +
    `.agents/skills` then writes 2 stubs/skill; frontmatter edits require re-running it.
  - **zsh does NOT word-split unquoted `$vars`** (unlike bash) → `perl -i … $files` took the whole list as one arg
    ("File name too long"). Use `find … -exec perl -i -pe '…' {} +`.
  - **Agent fan-out is a lead, never fact:** both Explore agents miscounted PDRs (claimed 92; actual 91), claimed "zero
    oak-naming" (false; ~20 refs), one misread `skills-lock.json` as "3 external entries" (it is empty). Firsthand checks
    caught each — reinforces [[verify-agent-claims-firsthand]].
  - **Process lessons:** (1) verify the load-bearing PREMISE (here: skill portability) BEFORE planning, not mid-execution
    — the approved plan was built on a false "naming-only" assessment. (2) Don't re-litigate settled owner direction
    (less-ceremony applies to reasoning, not just artefacts). (3) Make ALL edits before gating — launched `qg` early and
    had to kill + restart.

- **Adversarial context-loss review — PROVEN load-bearing (owner-affirmed 2026-06-07); caught real continuity drift
  ≥3×:** `e790b0e` (stale PR-ordering note), `1710275` (stale napkin pointer), `1077476` (two stale Phase-2/Step-2 claims
  this session). **Structural gap CLOSED (2026-06-09, owner-directed):** added step 11 "Adversarially falsify the
  continuity surfaces" to castr's `session-handoff` skill — the review now fires every close by the mechanism, not manual
  habit (discharges part of §6's "make it structural"). **Still an Oak back-flow + PDR candidate** (the step is portable;
  Oak's `session-handoff` lacks it).

- **Session-close (Phase-2 follow-on): validator "crashes" diagnosed as a non-bug; Oak reverted clean; surfaces
  re-pointed.** Investigated the two "crashing" deferred validators (`collaboration-state`, `subagents`). **Reframe:** they
  are _designed_ to hard-fail on absent canonical infrastructure (Oak tests: `rejects.toThrow('…/conversations')`,
  `toThrow(/missing adapter/)`) — truthfully reporting that castr's P6/P8 infra isn't installed yet. A trial
  "tolerate-missing → `[]`" fix **broke the hard-fail test** and was **reverted byte-exact**; nothing committed/pushed to
  Oak (**clean at `ad649710`**). castr's "problem" is **missing future-phase infrastructure, not a code/config bug**.
  Corrected the wrong ledger record, graduated the lesson (2026-06-05 insight #8 — _a failing check may be a true signal;
  don't silence it_), and swept + fixed two residual stale "92" PDR-estate claims (→91) the drift validator's
  conservative patterns miss.
- **Oak moved a THIRD time:** `06018bc3`→`2c85bc01`→`ad649710`. The `2c85bc01`→`ad649710` agent-tools delta is docs-only
  (README + `agent-identity.md`); the WHOLE-estate delta is **unscanned** → next session's **Step 0** (owner-directed:
  review the updated Oak agentic estate before resuming, esp. Phase-3 skills). castr's synced baseline stays `2c85bc01`.
- **Next steps recorded in the tracker + start statement:** Step 0 (review Oak estate) → Step 1 (reconcile design doc to
  as-built) → Step 2 (Phase 3 skills) → Step 3 (Oak follow-ups at their phases). **Anti-footgun preserved prominently:**
  the validator "crashes" are intended hard-fails — do NOT re-attempt to "fix" them.

## 2026-06-05

- **Oak → castr wholesale Practice transplant: planned (approved) and execution begun.** Spec:
  `.agent/plans/practice-alignment-brief.md`; operating manual: PEEN field report at
  `/Users/jim/code/project-explorer-especially-names/.agent/reports/practice-integration-feedback.md` (read in full).
  Durable surfaces: primary plan `.agent/plans/active/oak-practice-transplant.md`; tracker
  `.agent/plans/transplant/README.md`; ledgers `relevance-ledger.md` + `reference-closure.md`.
  - **Branch:** `feat/transplant-engraph-practice` off **`docs/initial-deep-review`** (NOT `main`). Firsthand git check:
    `main` (393e476) does **not** contain the PRESERVE set (initial-review report, remediation backlog, ADR-047, the
    brief) — those live only on `docs/initial-deep-review`, 2 commits unmerged. Branching off `main` would have orphaned
    the must-not-lose set. **PR implication:** a PR to `main` will carry the 2 deep-review commits unless that branch
    merges to `main` first (owner's merge-ordering call). Baseline tag `transplant/phase-0-baseline` = e0541f6.
  - **Owner-locked scope (2026-06-05):** fully populate scale surfaces (patterns/executive memory/.gemini/.windsurf);
    **collaboration machinery ACTIVE** full + PEEN-hardened, seeded empty — _"the collaboration surface is about agents,
    not humans; we WILL work with multiple agents"_; transplant = **primary active plan**, product slice
    `explicit-additional-properties-support.md` **parked-in-place** (per `active/README.md` parking exception); **all ~13
    generic experts** incl. `mcp-expert`. Tightenings: drop ground-truth search-eval triplet + Oak SonarQube/secrets infra
    - ~2 UI patterns; AMEND pattern `proven_in:` provenance + regenerate derived indexes; `practice-fitness`
      informational-first.
  - **Firsthand corrections to the 3-agent fan-out (agents are candidate leads only):** (1) `mcp-expert` IS relevant —
    castr emits MCP tools → KEEP (fan-out said drop); (2) the 121-file pattern estate is **mostly substrate** (frontmatter
    categories: process/agent/code/testing/architecture, zero UI/search) → fully-populate holds; only ~2 patterns are UI
    (fan-out overstated "Oak-specific"); my own grep "66 product-coupled" was substring noise (`aria`→v**aria**ble); (3)
    `ground-truth` triplet IS product (Oak semantic-**search** quality, MRR) → drop; (4) skills-adapter `--prefix` is a CLI
    flag, not hardcoded → `--prefix=engraph-`; (5) castr `scripts/validate-portability.mjs` is a **subagents/Codex-adapter
    validator** (misnamed) with 5 Codex assertions Oak lacks — preserve before retiring; (6) discount "castr 49 ADRs / Oak
    183" — castr ADRs are 001–047.
  - **Build/gate gotchas (firsthand-verified — feed the per-phase verification):** agent-tools `src/` has **0**
    `@oaknational` imports (tiny localisation surface: package.json name, new local eslint config, self-contained
    tsconfig, one validator's path constants); **`.agent` is NOT prettier-ignored** so every phase must `pnpm format` new
    docs (and `check:ci`/pre-push does **not** run `fix`); `practice-fitness` informational mode **always exits 0** → safe,
    never red-gates sacred `principles.md`; `knip`/`depcruise`/`madge` are **lib-scoped** so agent-tools needs its own
    minimal configs; **Phase 2 commit must include the regenerated `pnpm-lock.yaml`** (frozen-lockfile pre-push); add
    `agent-tools` as a 2nd turbo workspace + `postinstall: turbo run build --filter=@engraph/agent-tools`.
  - **Reference-closure:** Oak rules carry **36 distinct Oak-ADR cites** vs castr ADR≤047; low-number overlaps are
    _semantic_ mismatches (Oak ADR-038 ≠ castr ADR-038) → re-point to PDRs, never assume resolved (Phase 4). PDR→Oak-ADR
    cites (8, in 10 PDRs) = **retained-cross-host** (immutable governance honestly naming Oak's phenotype).
  - **Status:** Phase 0 ✅ (branch/baseline/plan-promotion/park). Phase 1 🔄: **1a landed** — 91 PDRs (zero oak-naming,
    fully portable) + `practice-verification.md` committed green. **Phase 1b remaining:** Core-generation reconciliation +
    provenance migration (castr inline `provenance:`+`fitness_ceiling` → Oak `provenance: provenance.yml` pointer +
    multi-dim fitness; **history MERGE** — union both branches' provenance + a 2026-06-05 merge node, preserving castr's
    2026-03-22 entry which Oak's file lacks) + entangled `practice-context` retirement (10 refs incl. PRESERVE'd
    `AGENT.md`). Then Phases 2–9. Each phase = atomic commit + `transplant/phase-N` tag.
  - **Conceptual correction (owner, 2026-06-05): Practice histories are branchy (a DAG, like git) — this transplant is a
    MERGE, not a linear copy/append.** castr's Practice is a branch diverged from the shared network ≈2026-03-09 that
    evolved locally; Oak's is a parallel branch. Where castr already has a surface (Core docs, provenance, directives),
    reconcile as a **three-way merge** (ancestor = last shared sync; ours = castr; theirs = Oak current) — adopt Oak's
    advances, preserve castr's divergence, never clobber. Re-frames Phase 1b (Phase 1a was additive → unaffected). See
    `practice-lineage.md`'s integration protocol (~⅓ port clean, ⅓ selective-edit, ⅓ rewrite).
  - **Method/value reminders:** treat ALL agent output as candidate leads, verify load-bearing claims firsthand (Jim's
    standing rule); don't rush breadth — the deep-review lesson is that green gates mask gaps; PDRs are immutable portable
    governance (don't edit on receipt); collaboration runtime = bring **machinery** (schemas + empty dirs), never Oak's
    **2,936** comms events / claims history / logs.
  - **Phase 1b LANDED (2026-06-05) — Practice Core generation merged, tagged `transplant/phase-1`.** Firsthand: (1) **no
    `pned` tool exists** anywhere (castr / PATH / `scripts/` / Oak) — the "merge-history" is a manual YAML/Markdown
    three-way merge (`uuidgen` for ids); (2) provenance is **per-file** (bootstrap never had the 2026-03-22 entry); (3)
    the portable trinity carried **zero** generic content Oak lacks ("Paused is not future" already in Oak; learned
    principles an Oak superset) → converged to Oak's current generation; castr identity preserved via `provenance.yml` +
    the untouched PRESERVE set; (4) **Oak's Core is NOT stale on practice-context** — it documents the PDR-007 retirement
    correctly (my earlier grep-count "stale" read was wrong — verify firsthand!); (5) Oak's `CHANGELOG.md` already carries
    `[castr] 2026-03-09`, so a blind append would have duplicated it. `provenance.yml` = union (no loss, no dup,
    identity-deduped); practice-context retired (dir gone, 4 authored notes archived, 3 live nav refs repointed, immutable
    PDRs left intact). Oak's 2026-06-05 pull changed **agent-tools** (tsx `postinstall` not turbo; new validators;
    hook-policy fail-closed) → `02-agent-tools-build-design.md` partly stale for Phase 2; re-read Oak fresh then.
  - **Oak post-pull reconciliation done (2026-06-05, commit `8abdbb7`).** Reconciled the forward-looking transplant docs
    to Oak's pulled state (HEAD `06018bc3`). Scouted first: the pull's transplant-relevant delta is concentrated in
    **agent-tools/hook-policy** (Phase 2); the rest was Oak _product_ work (eef/oak-kg/graph/school-data-search) castr
    doesn't bring. Updated `02-agent-tools-build-design.md` (postinstall = `tsx` bootstrap not turbo, enforced by
    `validate-lifecycle-scripts`; dist fail-closed guards; 7 validators; `tsx` devDep + dep majors), the parent plan, and
    the relevance-ledger (+`bootstrap` module; patterns 121→122). Other counts stable (rules 87, skills 20, sub-agent
    templates 19, PDRs 91). **Method learning:** when a source repo you're transplanting from moves, treat the design
    docs as **dated snapshots of a moving target** — reconcile to a dated state _and_ keep a standing "re-verify at
    execution"; don't pretend frozen-correct. Phase 1 (Core) was unaffected — the merge already used Oak's current Core.
  - **PR-ordering resolved (owner, 2026-06-05):** the transplant PR to `main` **carries** its 2 deep-review commits;
    `docs/initial-deep-review` is **not** merged to `main` separately — now recorded in the parent plan. (Supersedes the
    "owner's merge-ordering call" open-question note in the planning bullet above.)
  - **Transferable insights (reflection — generalised beyond the transplant; candidate structural learnings for the next
    consolidation):**
    1. **Verify a handoff's named tool/command exists before designing around it** (the `pned` phantom — a confidently
       named command in a brief is a claim, not a fact).
    2. **A term's frequency ≠ its meaning** — read context, don't conclude from grep _counts_ (the practice-context
       "stale" misread: every ref was retirement-_documentation_).
    3. **Merging histories/changelogs: the upstream often already carries your entries — dedup by identity, never
       blind-append** (Oak's changelog already held `[castr] 2026-03-09`).
    4. **Before assuming local divergence, verify it exists** — castr's portable trinity had _zero_ generic content Oak
       lacked, so convergence beat a selective merge; identity lives in `provenance.yml` + the PRESERVE set, not in
       divergent prose.
    5. **Design docs bound to a moving external source are dated snapshots** — reconcile to a dated state _and_ keep a
       standing "re-verify at execution"; never treat them as frozen-correct.
    6. **Load-bearing decisions belong in the in-repo execution contract, not memory-only** — recalled memory is
       non-authoritative; keep directed-read surfaces (this napkin) consistent with the contract.
    7. **An adversarial "what would be lost if context vanished?" pass is the falsification test of state-recording** —
       run it to find contradictions (it caught a stale PR-ordering note here), not to confirm completeness.
    8. **`format:check`/linters validate style, not content** — verify the _rendered_ structure after editing padded
       markdown tables / list-continuations; prefer prose anchors over padded-cell matches (tooling-friction; cf. PDR-060).
  - **Reflection/grounding pass (2026-06-05, session 2) — Phase-2 entry re-verification.** Firsthand, treating the pasted
    Start Statement as a candidate lead: (1) **PDR estate is lossless vs Oak** — castr **91 files / 89 numbered slots ==
    Oak 91/89 exactly**; **PDR-086 is vacant in BOTH** (not a transplant drop) and **PDR-076 is split 076/076a/076b in
    both**. The "**92**" in this napkin (the 1a-landed bullet above), `README`, `reference-closure`, and the continuation
    prompt was a **propagated miscount** (`90 range + 076a/b`, forgetting 086 is absent) — corrected to **91**; the true
    count was already firsthand-recorded above ("PDRs 91"). (2) **Oak unmoved** — still HEAD `06018bc3`; **seven validator
    families + `tsx` postinstall re-confirmed** against Oak's working tree (breaks the design-doc↔statement circularity —
    the claim holds against source, not just against castr's own docs). (3) **Paste-artifact caution:** the pasted Start
    Statement carried a `.ive/oak-practice-transplant.md` phantom path and a decapitated bullet that **do not exist in the
    committed prompt** (correct path + intact bullet on disk) — verify the committed surface before "fixing" from a mangled
    copy. (4) **§6 candidate (propose to owner before implementing):** a drift-validator — every PDR-count claim == file
    count; every contract/handoff path resolves on disk — is the structural form of this manual catch ("if a behaviour
    must be automatic, it needs a rule, not just a skill").
  - **Oak re-sync mid-Phase-2 (2026-06-05) — moving target moved, owner-flagged.** Oak advanced
    `06018bc3` → `2c85bc01` (8 commits). Firsthand delta vs the transplant baseline: **agent-tools = 5 files, all
    hook-policy/guard** (owner-authored `89ec8dcf fix(hook-policy): fail OPEN when the PreToolUse guard artefact is
unbuilt`) — split the failure shapes: **unbuilt `dist` → fail OPEN (exit 0 + loud warning)**, built-but-broken → still
    fail CLOSED (exit 2). `policy.json` **unchanged**. Synced the 5 files into castr Phase-2 (localised, green; suite
    854→860/878 — the update added 6 passing fail-open tests). **Method insight:** a rescan isn't just "get latest code" —
    it re-examines the _decisions_ that rested on the old state. Here the owner's own fix **removed the exact brick-risk
    (fail-closed on unbuilt dist) I had cited to justify deferring guard activation** → the deferral's rationale is now
    obsolete; re-surfaced the activation decision. **Out-of-Phase-2 deltas (note, don't conflate phases):** `PDR-089` grew
    a Decision-7 clause (Phase-1 append — accretion, not mutation-violation); `documentation-hygiene.md` rule (Phase 4),
    one `.cursor` adapter (Phase 7) — bring at those phases (re-read Oak fresh then anyway). Everything else = Oak product
    (eef/school-data-search/graph-core) or memory — DON'T-BRING. New baseline for Phase 2: **`2c85bc01`**.
  - **Phase 2 CLOSED + session-close insights (2026-06-05; candidate graduations).** Phase 2 landed green + tagged
    `transplant/phase-2` (`55a6788`). The build's transferable lessons — most caught my OWN first instinct, i.e. the
    verify-firsthand discipline cutting against the executor, not just the handoff:
    1. **File-count ≠ effort.** "340 files = multi-session grind" was wrong — proven upstream code mostly just built and
       passed; a workspace transplant is copy + wire-in + localise-the-small-coupled-surface, not 340 files of work.
    2. **Probe before deferring on assumed difficulty.** Nearly deferred knip as "too noisy"; the firsthand probe found
       zero real dead code (findings were my own incomplete entry config). The discipline cuts against pessimism too.
    3. **A drift-validator must be MORE conservative than the drift it catches, or it becomes the drift** — a false
       positive red-gates the build. `validate-drift` matches only definite estate phrasings; skips sub-counts/approximates.
    4. **"Bring X" can hide the highest-blast-radius action.** "Bring the hook policy" split into safe data vs LIVE
       PreToolUse activation (intercepts every tool call, fail-shape-dependent) — separate them; the environment-altering
       half needs explicit owner sign-off, not autonomy.
    5. **A rescan re-examines decisions, not just code.** The owner's own fail-open fix removed the exact risk basis for a
       deferral we had just agreed → the right answer flipped. Re-scan the _decisions_ that rested on the old state.
    6. **Every phase's gate run must include ALL of `qg`.** Phase 1b omitted `portability:check`, so the phase-1 tag was
       green while that gate was latently broken (practice-context retired, bespoke validator unchanged). Fixed `11f7e48`;
       removed the invalid check rather than re-tracking archived files to force it green (owner directive).
    7. **Handoff: stale pointers are worse than missing context.** A tracker saying "Resume at Phase 2" after Phase 2
       ships actively misleads the next session. The adversarial "what would be lost?" check prioritises pointer-currency +
       non-obvious operational state (the guards are LIVE) over narrative richness.
    8. **A failing check may be a TRUE signal, not a bug — don't silence it (2026-06-07).** The "crashing" deferred
       validators are _designed_ to hard-fail on missing canonical infrastructure (Oak tests: `rejects.toThrow`,
       `toThrow(/missing adapter/)`); they were correctly reporting that castr's P6/P8 infrastructure isn't installed yet.
       I nearly "fixed" them to return empty — which broke the hard-fail test and would have **masked the true
       infrastructure-absent signal** (inverse of green-gates-mask-gaps: making a red gate green by silencing it). When a
       check fails, first ask "is the check wrong, or is it correctly telling me I haven't built that part yet?" Running
       the test caught the misdiagnosis before it reached Oak's primary repo. Reverted; no upstream change. Diagnosis:
       **missing (future-phase) infrastructure, not a code/config bug.**

## 2026-06-04

- **Initial deep review completed (branch `docs/initial-deep-review`, not merged to `main`):** a first-hand-verified review (executing the built `dist`, running all 14 gates, reading source) found **46 distinct issues, 6 Critical**, that the green gates do not catch. Report: `.agent/report/initial-review/` (14 docs).
  - Criticals reproduced against `dist`: C1 build emits zero `.d.ts` (root `tsconfig` `noEmit:true` inherited) + `./parsers/zod` export target missing → published types + the README Zod import are broken; C2 operation security `A AND B` round-trips as `A OR B`; C3 component-name `toIdentifier` mangling breaks `$ref` round-trips (dangling); C4 `buildIR({type:object,properties:{}})→serializeIR→deserializeIR` throws (root cause: `isRecord({})===false`; four divergent `isRecord`); C5 Zod parser silently drops union/tuple/nativeEnum/`.refine` content with `errors:[]`; C6 Zod 2020-12 keyword refinements (`if/then/else`, `dependentSchemas`) emit `return true` no-ops and `contains`/`patternProperties` use `typeof x==='integer'/'unknown'` (reject valid data).
  - Root-cause pattern: shallow boundary-only proofs (substring `.toContain('.refine(')`, vacuous `.not.toContain` on the result object, happy-path-only round-trips) let real losslessness/fail-fast bugs pass behind green gates. The team's own architecture-review Pack 7 already flagged this ("the canonical gate chain can stay green while a dedicated IR fidelity suite is required") = finding H7.
  - C6 is a recorded-but-mislabelled reversal: `roadmap.md` "Schema Completeness Arc Phase 1" upgraded the Zod fail-fast guards to "semantic `.refine()` closures", but they don't validate; this contradicted three completed sub-plans (which still said fail-fast) and was never ADR'd. Drafted **ADR-047** (semantic-or-fail-fast) to govern it; indexed in the ADR README.
  - Actions: authored 7 atomic remediation plans under `.agent/plans/remediation/` (promote one to `active/` at a time); corrected 9 stale/contradictory completed plans + `roadmap.md` with dated ⚠️ banners (P1-P9); disclosed the C6 defects in `docs/architecture/zod-round-trip-limitations.md`; deleted 11 redundant session-3.3 queue-mirror stubs.
  - Deferred by choice (link integrity): the bulk link-aware archive of settled `current/complete/` plans — disposition table in report §11.
  - User directives this session: critically assess ALL agent/tool output and validate primary sources first-hand (second-hand reports never acceptable); and where code/proofs/docs disagree, normalise to the strictest of the three.
  - Aligned the handoff stack: this napkin entry, `.agent/prompts/session-continuation.prompt.md`, and `roadmap.md` Current Workstream Status.

---

_Earlier entries (2026-03-25 → 2026-04-16, pre-transplant) were rotated to
[`archive/napkin-2026-03-to-04.md`](archive/napkin-2026-03-to-04.md) on
2026-06-18 to hold the active napkin under its rotation threshold._
