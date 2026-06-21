---
title: Dependency Currency — type-safe, careful, one-major-at-a-time bumps
status: current
lane: current
created: 2026-06-21
last_updated: 2026-06-21
owner_directive: >-
  "Let's make the next session about dependency currency. That might affect types
  use in the code, and because this repo is entirely about managing types that
  needs to be handled thoughtfully, slowly, carefully." (owner, 2026-06-21)
controlling_lane: >-
  .agent/memory/operational/threads/practice-transplant.next-session.md
  § Lane: dependency currency
review_note: >-
  Type-risk classification corrected 2026-06-21 after type-reviewer + assumptions-expert
  (both verified firsthand): prettier and @scalar/json-magic are type-AFFECTING (runtime
  emission formatter + IR-input bundler), not type-neutral; ts-morph is lib-only; ink is an
  agent-tools runtime dep; degit is knip-config-only. Baseline-capture + lockfile discipline added.
todos:
  - id: DC0
    content: Type-neutral DEV-tooling patch/minor sweep (one chore(deps) commit) — eslint, @typescript-eslint/*, typescript-eslint, turbo, vitest, knip. (prettier, @scalar/json-magic, ink REMOVED — they are type/runtime-affecting, see DC2/DC3/DC4.)
    status: done # f761e12 (2026-06-21). In-range lockfile+manifest-floor refresh of the six; sonarjs/prettier/ink held back; check:ci green; lint+knip confirmed clean under new versions.
    depends_on: []
  - id: DC0b
    content: 'eslint-plugin-sonarjs 4.0.3->4.1.0 — SURFACED from `pnpm -r outdated` (NOT in original DC0; the typed-lint plugin from the D1 TypeFlags arc, so own micro-cycle). 4.1.0 still declares typescript>=5 as a regular dep -> single-TS override stays (Q-002). Its `recommended` preset newly enables 5 rules (25 sites); owner directed ADOPT NOW (parity-or-better). 18 prefer-specific (mechanical) + 7 nuanced fixes (2 exact-preservation float disables, drift `.every`, narrowing opaque-value strengthen, snapshot-assertion-visibility restructure, 1 no-redundant-optional reverted-to-disable after it BROKE type-check under exactOptionalPropertyTypes).'
    status: done # dcad36b (2026-06-21). check:ci green; test-reviewer COMPLIANT; claims re-verified firsthand.
    depends_on: [DC0]
  - id: DC1
    content: ts-morph 27->28 (CROWN-JEWEL — emission source-of-truth, lib-ONLY). Read breaking changes; map to lib/src/schema-processing/{parsers,writers,ast,conversion} + rendering; capture emitted baseline BEFORE install; firsthand diff must be byte-identical or every diff understood + IR-honest. Its own session.
    status: done # c8c0a9a (2026-06-21, Soaring Lifting Current / f7e30d). The 27->28 breaking change = bundled TS major (@ts-morph/common 0.28.1/TS5.9.2 -> 0.29.0/TS6.0.2, vendored in dist so the `typescript: 6.0.3` override never reached it). Bump ALIGNS emission compiler with workspace TS (6.0.2 vs 6.0.3), closing a latent dual-TS skew (parity-or-better). Emitted output BYTE-IDENTICAL (full surface counts == pre-bump baseline; snapshot oracle fails-loud, did not). A combined-run stderr TypeError was MEASURED pre-existing at 27 (firsthand revert+rerun), ts-morph-independent. .d.ts diff purely additive (printStructure only); 0 TypeFlags/SyntaxKind cross-instance reads in lib/src; type-reviewer COMPLIANT, claims re-verified firsthand; lockfile scoped to ts-morph+common, `pnpm why` single version. check:ci green.
    depends_on: [DC0]
  - id: DC2
    content: '@scalar IR-input vendor TRIO (coupled) — openapi-parser 0.25.7->0.28.7 + openapi-types 0.6.1->0.9.1 + json-magic 0.12.4->0.12.16. Reconcile lib/src/shared/openapi-types.ts (+ its drift test); IR-fidelity + openapi snapshot + input-pipeline char + e2e prove IR honesty preserved.'
    status: pending
    depends_on: [DC0]
  - id: DC3
    content: prettier 3.8.3->3.8.4 (RUNTIME emission formatter — lib dep, used by maybe-pretty.ts -> rendering/templating.ts; same package as the dev formatter). Patch, but touches emitted formatting → capture baseline + firsthand emitted-output diff.
    status: pending
    depends_on: [DC0]
  - id: DC4
    content: ink 7.0.5->7.1.0 (agent-tools RUNTIME TUI dep, not tooling). Proof = agent-tools test surface green (collaboration-tui e2e), NOT the lib snapshot oracle.
    status: pending
    depends_on: [DC0]
  - id: DC5
    content: commander 14->15 (lib runtime CLI option-parsing). Read breaking changes; check the main CLI + the collaboration-state CLI; capture --help baseline; help + parsing behaviour unchanged.
    status: pending
    depends_on: [DC0]
  - id: DC6
    content: '@types/node 25->26 (types-only, no emission — confirmed firsthand 0/8 emitted .snap files reference any Node type name). type-check green across lib + agent-tools. Note: dev-only dep now 2 majors ahead of engines.node 24.x (pre-existing posture; cannot make castr USE a Node-26 API).'
    status: done # a731765 (2026-06-21). type-check 4/4 + check:ci green; undici-types 8.3.0 transitive; TS6-compatible.
    depends_on: [DC0]
  - id: DC7
    content: '@commitlint/cli + config-conventional 19->21 (two majors, dev-only, advisory). TWO manifests (root: cli+config-conventional; agent-tools: cli). check-commit-message rejects a known-bad + passes a known-good message under the castr type-enum.'
    status: done # 0fd4a4c (2026-06-21). v20 URL-line relaxation + v21 min-Node-22/display-only — no rule change castr relies on. Proof: validator accepts good, rejects bad type/case/no-type; check:ci green.
    depends_on: [DC0]
  - id: DC8
    content: 'degit 2->3 (dev). Consumer = lib/scripts/examples-fetcher.mts (manual fixture-refresh, NOT knip-config-only — the .mts hid it from the first sweep). degit 3 ships own types -> @types/degit removed + dropped from knip ignore. FINDING: the script tsconfig include is stale (examples-fetcher.mts vs scripts/examples-fetcher.mts) so type-check does NOT cover it — separate follow-up slice.'
    status: done # bb653c9 (2026-06-21). API verified vs degit-3 d.ts + real-clone smoke test (exact fetcher source) passed; check:ci + knip green.
    depends_on: [DC0]
---

# Dependency Currency — type-safe, careful, one-major-at-a-time

Controlling plan for the **dependency-currency lane** in the
[practice-transplant thread record](../../memory/operational/threads/practice-transplant.next-session.md).
Authored 2026-06-21 from the `pnpm -r outdated` assessment; **type-risk classification corrected the
same day after a firsthand-verified type-reviewer + assumptions-expert pass** (see `review_note`). The
owner's constraint governs every cycle: castr exists to **losslessly manage and transform types**, so a
dependency bump that touches the type machinery or the emission/IR path is handled **thoughtfully,
slowly, carefully** — one major at a time, each proven not just gate-green but **type-fidelity-green**
by a firsthand diff of the emitted output against a baseline captured before the bump.

## Progress (live)

- **2026-06-21 (Woodland Bending Glade / dc3825) — type-neutral dev-tooling tier COMPLETE (2 commits):**
  - **DC0 done — `f761e12`.** `pnpm update -r` of the six (in-range; pnpm v11 bumped the caret floors too,
    benign). sonarjs/prettier/ink held back (all in-range but out of scope — named the six explicitly).
    Single-TS override untouched. `pnpm check:ci` green; lint + knip (the two behaviour-risk gates) confirmed
    clean firsthand under the new versions.
  - **DC0b done — `dcad36b`.** sonarjs 4.1.0 surfaced from `outdated` (not in the plan), handled as its own
    micro-cycle. Owner directed ADOPT-NOW. The empirical `pnpm lint` diff was the proof a lint-plugin bump
    needs: 4.1.0 enables 5 new `recommended` rules (25 sites). Notable: removing `| undefined` for
    `no-redundant-optional` BROKE type-check (TS2345 under exactOptionalPropertyTypes) — a D1-family worked
    instance (the type-checker is the authority over a type-aware lint rule's heuristic); reverted to a
    type-checker-justified per-line disable. test-reviewer COMPLIANT; claims re-verified firsthand.
  - **DC6/DC7/DC8 done (low-risk non-emission batch, owner-directed continue) — `a731765`, `0fd4a4c`,
    `bb653c9`.** @types/node 25→26 (0/8 emitted .snap reference Node types — verified firsthand; types now
    2 majors ahead of the Node-24 runtime, a pre-existing dev-only posture). commitlint 19→21 (no rule castr
    relies on changed; validator accept-good/reject-bad proof). degit 2→3 (consumer is the manual
    examples-fetcher.mts, NOT knip-only — `.mts` hid it; degit-3 ships own types so @types/degit dropped;
    API + real-clone smoke test both pass). Each its own commit; check:ci green per cycle.
- **2026-06-21 (Soaring Lifting Current / f7e30d) — DC1 ts-morph 27->28 DONE (`c8c0a9a`), the crown jewel:**
  The 27->28 breaking change is the **bundled TypeScript major** — `@ts-morph/common` 0.28.1 (vendors TS 5.9.2)
  -> 0.29.0 (vendors TS 6.0.2); TS is bundled into common's `dist/typescript.js` (a devDep only), so castr's
  `pnpm-workspace.yaml` `typescript: 6.0.3` override never reached it. The bump therefore **aligns** ts-morph's
  internal emission compiler with the workspace TS (6.0.2 vs 6.0.3, same major/minor), **closing a latent
  5.9-vs-6.0 dual-TS skew on the emission path** (parity-or-better — the D1 skew family, but proven harmless
  here: 0 `TypeFlags`/non-test `SyntaxKind` cross-instance reads in `lib/src`). **Proof:** full test surface
  green with counts IDENTICAL to a pre-bump baseline captured first (snapshot 154, transforms 575
  round-trip/idempotence, gen 27, character 152, e2e 8+1, unit 1669+995) -> emitted output **byte-identical**;
  type-check + check:ci green; ts-morph 28 `.d.ts` diff purely additive (`printStructure`+`PrintStructureOptions`
  only — castr imports neither); lockfile scoped to ts-morph+@ts-morph/common, `pnpm why` single version, no
  transitive drift; type-reviewer COMPLIANT, every load-bearing claim re-verified firsthand. **A combined-run
  stderr `TypeError: Cannot read properties of null` scare was MEASURED to be pre-existing negative-path logging
  present identically at ts-morph 27 (firsthand revert + re-run) — ts-morph-independent, zero test delta.**
- **Remaining:** the emission/IR/type-machinery tier — DC2 (@scalar trio), DC3 (prettier), DC4 (ink),
  DC5 (commander). None started. These need baseline-capture + emitted/CLI diff + the relevant reviewers per
  the plan. (`pnpm -r outdated` re-confirmed at DC1 start: ts-morph 28, prettier 3.8.4, ink 7.1.0, commander 15,
  @scalar trio 0.28.7/0.9.1/0.12.16 all still current targets.)
- **Findings routed (not in scope to fix here):** (1) `lib/tsconfig.json` include lists `examples-fetcher.mts`
  but the file is at `scripts/examples-fetcher.mts` → the degit-using script is NOT type-checked (stale
  include; its own follow-up slice). (2) @types/node dev-only posture sits 2 majors ahead of `engines.node`
  — note, not a defect.

## End goal / mechanism / means / non-goals

- **End goal:** castr's dependency estate is current, with the thing castr exists to do — lossless type
  management (IR fidelity, parser/writer lockstep, ts-morph emission) — **provably unchanged** across
  every bump. Currency is the outcome; zero type-fidelity regression is the constraint.
- **Mechanism:** split the bumps by **type/emission/runtime-risk**, not by semver size. A genuinely
  type-NEUTRAL DEV-tooling tier (linters, test runner, build orchestrator, dead-code) bumps in one
  sweep with the gate chain as the net. Every dep that touches **emission, the IR pipeline, or a
  product runtime** bumps **one at a time**, each gated by its test surface **plus a firsthand
  emitted-output diff against a pre-bump baseline** — because castr's own distilled doctrine warns
  green gates mask type-fidelity gaps (the `openapi-types` vendor-mismatch lesson; "preserve IR honesty
  even when the interchange is lossy"). "Tests pass" is necessary, not sufficient, for that tier.
- **Means:** the `todos` above — DC0 (dev-tooling sweep) then DC1–DC8 (one dep/coupled-group each).
- **Non-goals (YAGNI / explicitly NOT doing):** bumping `typescript` (already current at 6.0.3 — no
  outdated entry); changing the single-TS pnpm override (Q-002 RESOLVED — correct permanent fix,
  sonarjs@4.1.0 still vendors its own TS); chasing pre-release or sub-24h-cooldown versions
  (`minimumReleaseAge: 1440` is deliberate — respect it); **batching two type-affecting majors into one
  commit** (the owner's "slowly, carefully" forbids it — dev-only DC7/DC8 MAY share a commit since they
  touch no type machinery); any feature/refactor work riding along with a bump; auto-bumping a major
  without reading its breaking changes firsthand.

## Type/runtime-risk classification (the spine — corrected after firsthand review)

| Cycle | Bump                                                                                                                | Risk                           | Why                                                                                                                                                                                                         | Proof beyond gates                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DC0   | eslint 10.4.1→10.5.0, @typescript-eslint/\_ + typescript-eslint →8.61.1, turbo →2.9.18, vitest →4.1.9, knip →6.17.1 | **type-neutral (dev tooling)** | linters / test runner / build orchestrator / dead-code — none touch emission, the IR, or a product runtime                                                                                                  | `pnpm check:ci` green                                                                                                                                               |
| DC1   | **ts-morph 27→28** (lib-only)                                                                                       | **CROWN-JEWEL**                | the generated-code emitter (`lib/src/schema-processing/{writers,ast}`) AND the zod-parser TS reader (`parsers/zod/ast`); CLAUDE.md: "the generator (ts-morph emission) is the source of truth"              | baseline-captured firsthand diff of emitted artefacts byte-identical, or every diff understood + intentional + IR-honest                                            |
| DC2   | **@scalar/openapi-parser 0.25.7→0.28.7 + openapi-types 0.6.1→0.9.1 + json-magic 0.12.4→0.12.16** (TRIO, coupled)    | **high**                       | the OpenAPI IR **input** pipeline: json-magic `bundle()` (`load-openapi-document/bundle`) → parser → IR; 0.x minors breaking-allowed; castr corrects vendor mismatches in `lib/src/shared/openapi-types.ts` | IR-fidelity + openapi snapshot + `input-pipeline`/`bundled-spec-assumptions` char + e2e green; `openapi-types.ts` + its drift test reconciled; IR honesty preserved |
| DC3   | **prettier 3.8.3→3.8.4** (lib RUNTIME dep)                                                                          | **emission formatting**        | `maybe-pretty.ts` runs prettier `format` on generated code, wired into `rendering/templating.ts:99`; the dev + runtime prettier are the SAME package version                                                | baseline-captured emitted-output diff (snapshot/gen) unchanged                                                                                                      |
| DC4   | ink 7.0.5→7.1.0 (agent-tools RUNTIME)                                                                               | runtime (non-type)             | TUI rendering in agent-tools, a prod `dependencies` entry — not lib emission, not tooling                                                                                                                   | agent-tools `test:all`/e2e green (collaboration-tui), NOT the lib snapshot oracle                                                                                   |
| DC5   | commander 14→15 (lib RUNTIME CLI)                                                                                   | medium                         | CLI option-parsing (main CLI + collaboration-state CLI)                                                                                                                                                     | CLI e2e green; `--help` + parsing vs captured baseline unchanged                                                                                                    |
| DC6   | @types/node 25→26                                                                                                   | low (types-only)               | Node type defs; **confirmed no Node type names in any emitted snapshot** (no emission impact)                                                                                                               | `pnpm type-check` green across lib + agent-tools (the two type-check workspaces); engines/Node-24 ok                                                                |
| DC7   | @commitlint/cli + config-conventional 19→21                                                                         | low (dev, advisory)            | commit-message validator config; cli in root+agent-tools, config-conventional in root only                                                                                                                  | `check-commit-message` rejects a known-bad AND passes a known-good message under the live type-enum                                                                 |
| DC8   | degit 2→3                                                                                                           | low (dev)                      | only a `lib/knip.ts` config reference found — usage unclear                                                                                                                                                 | confirm what degit feeds FIRST; then install+gates+knip green, or test the real path, or consider removal                                                           |

## Baseline-capture protocol (makes the firsthand diff actually possible — DC1/DC2/DC3/DC5)

The headline mitigation is impossible if `pnpm install` + regen overwrites the artefacts before they
are diffed. So for every emission/IR/CLI-output-affecting cycle, the ORDER is fixed:

1. **Capture** the baseline FIRST — the emitted artefacts / snapshot fixtures (or `git show HEAD:<path>`
   for committed fixtures), and for DC5 the `--help`/parse output — before touching `package.json`.
2. **Bump** the dependency (`package.json` + `pnpm install`, respecting the 24h cooldown).
3. **Regenerate + diff** — run the generation/test surface, then diff the new emitted output against the
   captured baseline. A non-empty diff is a STOP-and-understand signal, never an auto-accept; a
   regenerated snapshot accepted without reading the diff is the exact failure mode this plan exists to
   prevent.
4. **Lockfile/transitive check** — `pnpm why <dep>` + a `pnpm-lock.yaml` diff to see transitive shifts
   (per `principles.md` §8 no-transitive-reliance); `pnpm dedupe` if a duplicate major appears.

## Sequencing

1. **DC0 first** — green baseline at refreshed dev tooling; cheap; one `chore(deps)` commit. (DC0-first
   is a convenience for a clean baseline, not a hard technical dependency — a cooldown-blocked DC0
   package must not block an unrelated low-risk cycle.)
2. **DC1 (ts-morph) — its own session.** Highest risk; nothing else alongside. Map the 27→28 breaking
   changes to `lib/src/schema-processing/{parsers,writers,ast,conversion}` + `rendering` (NOT
   agent-tools — zero ts-morph there), then baseline → bump → diff.
3. **DC2 (@scalar trio) — its own landing**, possibly its own session. parser + types + json-magic move
   together (all the IR input vendor).
4. **DC3 (prettier) / DC5 (commander)** — emission/CLI-output cycles; baseline-capture applies; one
   commit each.
5. **DC4 (ink) / DC6 (@types/node) / DC7 (commitlint) / DC8 (degit)** — lower risk. DC7+DC8 (dev-only,
   no type machinery) MAY share one commit; the rest one commit each.

All cycles `depends_on: [DC0]` as a baseline convenience, are otherwise independent (separate dep), roll
forward on the single branch `feat/transplant-engraph-practice`, one commit each (except the DC7+DC8
dev-only pair).

## TDD cycles + proof contract

Most bumps are config edits (`package.json` version + `pnpm install`), so the "test" is the **existing**
test surface run as a regression oracle, preceded by baseline capture. Where a breaking change **forces
a code adaptation** (a ts-morph/scalar/commander API moved), that adaptation is a real TDD cycle:
RED-first against the new API's behaviour, then the adaptation, per `testing-strategy.md` and the
type-discipline rules (no `any`, no `as`, preserve maximum type information).

Proof contract per cycle (addressable acceptance, proof level, command):

- **DC0** — `deps-current:dev-tooling`, `integration`/`e2e`: `pnpm check:ci` green.
- **DC1** — `deps-current:ts-morph` + `ir-fidelity:emission-unchanged`, `e2e`/`value-proxy`: baseline
  captured; `pnpm test:all` green AND every generated artefact (snapshot/character/gen/transforms)
  byte-identical-or-understood; `pnpm why ts-morph` clean. **The non-negotiable extra over gate-green.**
- **DC2** — `deps-current:scalar-trio` + `ir-fidelity:openapi-preserved`, `e2e`: IR-fidelity + openapi
  snapshot + `input-pipeline`/`bundled-spec-assumptions` char + e2e green AND `lib/src/shared/openapi-types.ts`
  (+ `openapi-types.drift.test.ts`) reconciled with no lossy canonicalisation (fail fast if a vendor type
  change would drop user-visible semantics).
- **DC3** — `deps-current:prettier` + `emission:formatting-unchanged`, `e2e`: baseline captured; emitted
  snapshot/gen output unchanged.
- **DC4** — `deps-current:ink`, `e2e`: agent-tools `test:all` (incl. collaboration-tui e2e) green.
- **DC5** — `deps-current:commander`, `e2e`: CLI e2e green; `--help` + parsing vs captured baseline unchanged.
- **DC6** — `deps-current:types-node`, `unit` (type-check): `pnpm type-check` green (lib + agent-tools).
- **DC7** — `deps-current:commitlint`, `integration`: `check-commit-message` rejects a known-bad AND
  passes a known-good message; both root + agent-tools manifests bumped (no version skew).
- **DC8** — `deps-current:degit`, `non-code`/`e2e`: degit's real consumer identified; bump proven against
  it, or recorded install+gates+knip-green, or removal proposed.

Every commit ends with all tests passing (`local-broken-code-never-leaves`).

## Quality gates

Per cycle: the focused test surface for that bump (e.g. `pnpm test:snapshot` + `pnpm test:character` for
DC1/DC3; openapi/IR-fidelity + e2e for DC2; agent-tools `test:all` for DC4) plus `pnpm type-check` +
`pnpm lint` + `pnpm knip`. Phase/final: the canonical aggregate `pnpm check` (local) / `pnpm check:ci`
(pre-push). Do not invoke `pnpm qg` directly.

## Risk assessment

- **Type-fidelity regression (headline).** A ts-morph / @scalar / prettier bump silently changes emitted
  output or canonicalises away IR semantics, and the gate chain stays green because the snapshots were
  regenerated rather than diffed. Mitigation: the **baseline-capture protocol** above — capture before
  install, diff after, never auto-accept a regenerated snapshot. One major per commit so any regression
  is bisectable.
- **Vendor type mismatch (DC2).** `@scalar/openapi-types` may disagree with the published spec or the
  runtime shape; castr patches this in `lib/src/shared/openapi-types.ts` (with a drift test). Mitigation:
  re-run the reconciliation; correct at `openapi-types.ts`, never propagate the mismatch into the IR.
- **Transitive shifts.** A major can change the transitive graph (`principles.md` §8). Mitigation:
  `pnpm why` + lockfile diff per type-affecting cycle.
- **Rollback.** "Roll-forward only" governs the branch, but if a type-affecting bump regresses fidelity
  and cannot be cleanly fixed forward in the same cycle, the correct recovery is `git revert <commit>`
  (a new forward commit that undoes the bump) — NOT patching over a fidelity regression to keep the
  bump. Reverting a bad bump is roll-forward-compatible.
- **Supply-chain cooldown.** A target may be <24h old and refused by `minimumReleaseAge`. Mitigation:
  respect it; record any held version and pick it up next pass — not a failure.
- **Version drift.** `pnpm -r outdated` (2026-06-21) may be stale at execution; the first-principles
  check re-runs it (below). (Re-confirmed current at review time 2026-06-21.)

## Plan-body first-principles check

Per `.agent/rules/plan-body-first-principles-check.md`, before executing each cycle re-confirm:
(a) **shape** — `pnpm -r outdated` still names this version (re-run; versions drift); (b) **landing
path** — the cycle's proof is "baseline-diff + tests green" (emission/IR/CLI tier) or "gates green"
(dev tier), not merely "version bumped"; (c) **vendor-literal** — read the bump's actual
breaking-changes/changelog firsthand before bumping. The cooldown gate fires on every `pnpm install`.

## Foundation alignment

- `principles.md` — IR honesty + fail-fast (DC2 must not canonicalise away semantics); Type System
  Discipline (preserve maximum type info; no `any`/`as` in any adaptation); §8 no-transitive-reliance.
- `testing-strategy.md` + `tdd-as-design.md` — the snapshot/character/gen/transforms/e2e surfaces are
  the type-fidelity proof; RED-first for any code adaptation a bump forces.
- `requirements.md` — the IR is the source of truth after parsing; a vendor bump must preserve it.
- `DEFINITION_OF_DONE.md` — one-gate-at-a-time green per cycle; no warnings tolerated.

## Readiness reviewers

Run before marking any type-affecting cycle complete, by substance: `type-reviewer` (type-flow impact of
ts-morph/scalar/prettier/@types-node); `openapi-expert` + `zod-expert` for DC2 (IR fidelity + parser/
writer lockstep); `config-expert` for DC0/DC7 (tooling + commitlint); `assumptions-expert` for
proportionality. The plan itself was reviewed by `type-reviewer` + `assumptions-expert` 2026-06-21
(both verified firsthand; the type-risk table was corrected as a result). Re-verify every load-bearing
reviewer claim firsthand (`verify-agent-claims-firsthand`).

## Learning loop + lifecycle triggers

Each cycle close routes any surprise through `session-handoff`; lane/plan completion runs
`consolidate-docs`. Lifecycle triggers per `../templates/components/lifecycle-triggers.md` — **note:**
castr's `.agent/plans/templates/` is empty (a recorded meta-gap in `pending-graduations.md`), so that
component reference is aspirational; the applicable touch points (per-cycle gate-green + baseline diff,
per-major reviewer pass, lane-close consolidation) are inlined above.
