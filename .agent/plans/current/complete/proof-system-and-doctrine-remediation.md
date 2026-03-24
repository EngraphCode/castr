# Plan (Active): Proof-System and Durable-Doctrine Remediation

**Status:** Complete — first successor slice from the seven-pack triage (closed Monday, 23 March 2026)  
**Created:** 2026-03-23  
**Predecessor:** [architecture-review-packs.md](../../active/architecture-review-packs.md)
**Triage Source:** [cross-pack-triage.md](../../../research/architecture-review-packs/cross-pack-triage.md)
**Related:** [IDENTITY.md](../../../IDENTITY.md), [DEFINITION_OF_DONE.md](../../../directives/DEFINITION_OF_DONE.md), [testing-strategy.md](../../../directives/testing-strategy.md), [ADR-035](../../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

---

## Why This Slice Is Next

The [cross-pack triage](../../../research/architecture-review-packs/cross-pack-triage.md) clustered all seven-pack findings into five root-cause families and identified **proof-system honesty (RC-1) and durable-doc over-claims (RC-2)** as the highest-leverage remediation target.

Rationale:

1. The canonical gate chain can currently stay green while `vitest.e2e` is red — this undermines trust in all other pack verdicts.
2. Proof suite names, config comments, and READMEs still describe broader assertions than the code actually makes.
3. Acceptance criteria, ADRs, and public docs still carry target-state language that cold-start sessions inherit as if it were current truth.
4. Until the proof system is honest, no format-specific remediation (RC-4/RC-5) can be verified to completion.

## Scope

### In Scope

- **Gate-chain remediation:** decide gate status for `vitest.e2e` and `test:scalar-guard` — either promote to the canonical chain or explicitly mark as off-chain development aids with honest docs.
- **Off-chain red fix:** fix or quarantine the red `ir-fidelity.test.ts` so the gate decision is actionable.
- **Suite taxonomy:** resolve `openapi-fidelity.test.ts` — either move it to the E2E boundary or reclassify it.
- **Proof-name and scope honesty:** narrow generated-code suite names, config, and fixture docs to match their actual assertions (structural smoke check, not runtime execution).
- **Transform-proof wording:** align Scenario 6, 7, 2, and 4 READMEs and config comments with the specific properties each scenario actually asserts.
- **Acceptance-criteria cleanup:** add explicit current-state caveats to any acceptance-criteria doc that still reads as a discharged claim (Pack 7.4 list).
- **ADR and public-doc drift:** add current-state caveats or corrections to ADR-035, ADR-031, ADR-032, the native-capability matrix, and public docs where they over-claim the live proof state (Pack 1, Pack 5, Pack 6 doctrine drift items).
- **CLI identity:** align CLI help text, characterisation proof, and docs on the published `castr` binary name (Pack 1.2 — small, pairs with doc updates).
- **Public-API preservation test:** expand or narrow the assertion scope honestly (Pack 1.3 — small, pairs with proof honesty).

### Out of Scope (Next Slices)

- IR and runtime validator gap remediation (RC-3) — separate bounded plan.
- Format-specific parser/writer/lockstep fixes (RC-4) — separate bounded plan.
- Downstream surface drift (RC-5) — separate bounded plan.
- New feature or format implementation.
- Reactivation of paused JSON Schema parser plan.

## Locked Constraints

1. Code on disk and reproduced gate reality outrank plans, prompts, or ADR summaries.
2. Do not blend proof/doctrine remediation with speculative format implementation.
3. TDD at all levels.
4. No escape hatches.
5. All quality-gate failures remain blocking at all times.
6. The paused JSON Schema parser plan stays paused.

## Execution Plan

### Phase 1: Gate-Chain Decision and Off-Chain Red Fix

1. **Reproduce the red `vitest.e2e` failure** in `ir-fidelity.test.ts` to confirm current state.
2. **Diagnose what changed** vs. when this test last passed; determine whether the fix is in the test expectation, in the IR serialization path, or in both.
3. **Fix or quarantine** — strong preference for fix. If quarantine is required, document the specific open defect and file it under `.agent/plans/future/`.
4. **Decide gate status:**
   - If `vitest.e2e` contains honest, valuable proof → add `pnpm test:e2e` (or equivalent) to the canonical chain in `DEFINITION_OF_DONE.md` and both `package.json` files.
   - If the suite duplicates coverage already in `pnpm test` → demote, rename, and document.
   - `test:scalar-guard` follows the same decision: promote or demote with honest docs.
5. **Resolve `openapi-fidelity.test.ts` taxonomy:** move to the correct directory boundary (`tests-e2e/` if E2E, back to `src/` with correct naming if integration).

### Phase 2: Suite-Name and Proof-Wording Honesty

6. **Generated-code suites:** rename or re-document `runtime-validation.gen.test.ts` and `lint-validation.gen.test.ts` to describe what they actually assert (structural existence, import presence, parser readability). Update [FIXTURES.md](file:///Users/jim/code/personal/castr/lib/tests-generated/FIXTURES.md) and [vitest.generated.config.ts](file:///Users/jim/code/personal/castr/lib/vitest.generated.config.ts) comments to match.
7. **Transform README and config:** rewrite Scenario 6 and 7 descriptions in [tests-transforms/README.md](file:///Users/jim/code/personal/castr/lib/tests-transforms/README.md) to describe the exact assertions (supported-subset schema-name comparisons, payload parity, Zod reparsing, shallow JSON Schema bundle shape). Do the same for Scenario 2 and 4 descriptions.
8. **ADR-035 current-state caveat:** ensure the ADR plainly distinguishes the historical transform-matrix vision from the current proof scope.

### Phase 3: Acceptance-Criteria and Durable-Doc Cleanup

9. **Acceptance criteria:** add current-state caveats to:
   - [json-schema-and-parity-acceptance-criteria.md](file:///Users/jim/code/personal/castr/.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md)
   - [zod-output-acceptance-criteria.md](file:///Users/jim/code/personal/castr/.agent/acceptance-criteria/zod-output-acceptance-criteria.md)
   - [zod-parser-acceptance-criteria.md](file:///Users/jim/code/personal/castr/.agent/acceptance-criteria/zod-parser-acceptance-criteria.md)
10. **ADR and architecture doc caveats:**
    - ADR-031, ADR-032: metadata language narrowed (already started in March 21 consolidation — verify current state, tighten if still over-claiming).
    - Native-capability matrix: current datetime offset narrowing note.
    - MCP integration guide: narrow or caveat the public-surface description.
    - Scalar pipeline docs: remove stale SwaggerParser language.
11. **Public docs:** verify that the March 22 public-doc rewrites are sufficient. If `README.md`, `API-REFERENCE.md`, `USAGE.md`, `EXAMPLES.md`, or `MIGRATION.md` still over-claim, correct them.
12. **CLI identity and characterisation:** change CLI help text to `castr`, update `cli.char.test.ts` proof snapshot, and align any doc references.
13. **Public-API preservation test:** either expand assertions to cover the real root and subpath export surface, or narrow the test name/description to what it actually checks.

### Phase 4: Handoff and Gate Closure

14. **Update handoff docs:** `session-entry.prompt.md`, `roadmap.md`, `architecture-review-packs.md`, `napkin.md`.
15. **Run the canonical gate chain** (full or review-only depending on whether code was changed):
    - If code changed: full `pnpm check:ci` and any newly promoted off-chain suites.
    - If review-only: `pnpm format:check` and `pnpm portability:check`.

## Verification Plan

### Automated

- If `vitest.e2e` is promoted: `pnpm test:e2e` (or equivalent) must go green.
- If `test:scalar-guard` is promoted: `pnpm test:scalar-guard` must go green.
- Full canonical chain: `pnpm check:ci`.
- Any newly promoted suite: run individually and as part of the chain.

### Manual Verification

- Cold-read each rewritten proof-suite README, config comment, and acceptance-criteria file to confirm no sentence claims a broader property than the associated test code asserts.
- Cold-read `DEFINITION_OF_DONE.md` to confirm it documents every repo-owned proof suite and its on-/off-chain status honestly.

## Success Metrics

1. `pnpm check:ci` is green.
2. Every repo-owned proof suite is either in the canonical chain and green, or explicitly documented as off-chain with a linked reason.
3. No proof-suite name, README, config comment, or acceptance-criteria line claims a broader assertion scope than its test code actually proves.
4. No durable ADR or public doc still advertises a removed, renamed, or over-stated surface without an explicit current-state caveat.
5. CLI help output, characterisation proof, and docs all say `castr`.
6. The `public-api-preservation.test.ts` scope matches its name.

## Completion Rule

This plan is complete when all success metrics are met, all gate errors are resolved, and handoff docs reflect the new repo truth.

After completion, the next successor slice should be either:

- **RC-3: IR and Runtime Validator Remediation** — if the proof-system remediation surfaced new IR validator issues, or
- **RC-4: Format-Specific Drift** — if the proof system is now honest and the highest remaining leverage is parser/writer lockstep.

Open that successor plan from the triage, do not blend it into this one.
