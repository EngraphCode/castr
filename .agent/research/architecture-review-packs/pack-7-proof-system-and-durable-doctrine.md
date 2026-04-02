# Pack 7 — Proof System and Durable Doctrine

**Date:** 2026-03-22
**Verdict:** red

## Invariants Checked

- The canonical gate chain must either execute a proof suite or describe it honestly as off-chain; a green Definition of Done run cannot hide a repo-owned red proof.
- Suite names, locations, and docstrings must match the testing doctrine they claim, especially at the unit / E2E / generated / transform boundaries.
- Generated-code, transform, snapshot, and characterisation docs must describe the exact properties they assert, not a stronger end-to-end contract.
- Acceptance criteria, ADR-facing current-state notes, prompts, plans, and handoff memory must agree with the code on disk and with Packs 1-6.

## Findings

1. Severity: high
   File: [package.json](/Users/jim/code/personal/castr/package.json)
   File: [package.json](/Users/jim/code/personal/castr/lib/package.json)
   File: [DEFINITION_OF_DONE.md](/Users/jim/code/personal/castr/.agent/directives/DEFINITION_OF_DONE.md)
   File: [vitest.e2e.config.ts](/Users/jim/code/personal/castr/lib/vitest.e2e.config.ts)
   File: [ir-fidelity.test.ts](/Users/jim/code/personal/castr/lib/tests-e2e/ir-fidelity.test.ts)
   File: [openapi-fidelity.test.ts](/Users/jim/code/personal/castr/lib/src/tests-e2e/openapi-fidelity.test.ts)
   Issue: The canonical gate chain omits a dedicated proof suite that is red today, while another E2E-named proof file is silently pulled into `pnpm test`. `pnpm check:ci` stayed green on Sunday, 22 March 2026 even though `pnpm --dir /Users/jim/code/personal/castr/lib exec vitest run --config vitest.e2e.config.ts` failed in `ir-fidelity.test.ts`.
   Why it matters: the repo can currently report a clean canonical run while a repo-owned IR round-trip proof is red and the suite taxonomy no longer matches the testing doctrine.

2. Severity: high
   File: [vitest.generated.config.ts](/Users/jim/code/personal/castr/lib/vitest.generated.config.ts)
   File: [FIXTURES.md](/Users/jim/code/personal/castr/lib/tests-generated/FIXTURES.md)
   File: [validation-harness.ts](/Users/jim/code/personal/castr/lib/tests-generated/validation-harness.ts)
   File: [runtime-validation.gen.test.ts](/Users/jim/code/personal/castr/lib/tests-generated/runtime-validation.gen.test.ts)
   File: [lint-validation.gen.test.ts](/Users/jim/code/personal/castr/lib/tests-generated/lint-validation.gen.test.ts)
   File: [generation-result.ts](/Users/jim/code/personal/castr/lib/src/rendering/generation-result.ts)
   Issue: The generated-code suite still claims runtime execution, lint certainty, and "all code generation paths", but the live harness only proves representative single-file structural checks. Runtime validation does not import or execute generated modules, lint can silently downgrade to a warning-only skip when ESLint setup fails, and all four suites hard-require `SingleFileResult`.
   Why it matters: a green `pnpm test:gen` currently proves a narrower smoke-check contract than the repo's docs and config comments claim.

3. Severity: high
   File: [README.md](/Users/jim/code/personal/castr/lib/tests-transforms/README.md)
   File: [scenario-6-zod-via-json-schema.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts)
   File: [scenario-7-multi-cast.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts)
   File: [transform-helpers.ts](/Users/jim/code/personal/castr/lib/tests-transforms/utils/transform-helpers.ts)
   File: [ADR-035-transform-validation-parity.md](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-035-transform-validation-parity.md)
   Issue: Scenario 6 and Scenario 7 are still documented as broad semantic / cross-output correctness proofs, but the live assertions are materially narrower. Scenario 6's "semantic equivalence" checks reduce to supported-subset schema-name comparisons plus partial payload parity, and Scenario 7 mainly checks schema names, schema counts, Zod reparsing, and shallow JSON Schema bundle shape for a limited supported subset.
   Why it matters: the transform-proof doctrine still reads as stronger than the current scenario matrix actually proves.

4. Severity: medium
   File: [json-schema-and-parity-acceptance-criteria.md](/Users/jim/code/personal/castr/.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md)
   File: [zod-output-acceptance-criteria.md](/Users/jim/code/personal/castr/.agent/acceptance-criteria/zod-output-acceptance-criteria.md)
   File: [zod-parser-acceptance-criteria.md](/Users/jim/code/personal/castr/.agent/acceptance-criteria/zod-parser-acceptance-criteria.md)
   File: [testing-strategy.md](/Users/jim/code/personal/castr/.agent/directives/testing-strategy.md)
   Issue: Before this pass, the durable doctrine stack still mixed target-state acceptance criteria, stale phase references, conflicting recursion wording, and unstated current gate exceptions. Pack 7 had to narrow those documents explicitly so they no longer overstate the live JSON Schema / Zod / proof contract.
   Why it matters: once the repo has multiple red architectural packs, any durable doc that still reads as current support rather than target doctrine becomes a blocker in its own right.

## Doctrine Or Doc Drift

- This session corrected the handoff layer so [session-entry.prompt.md](/Users/jim/code/personal/castr/.agent/prompts/session-entry.prompt.md), [roadmap.md](/Users/jim/code/personal/castr/.agent/plans/roadmap.md), [architecture-review-packs.md](/Users/jim/code/personal/castr/.agent/plans/current/complete/architecture-review-packs.md), and [napkin.md](/Users/jim/code/personal/castr/.agent/memory/napkin.md) now say plainly that Pack 7 closed `red`, the seven-pack sweep is complete, and the next honest slice is proof/doctrine remediation rather than new feature work.
- The acceptance-criteria stack now carries current-state caveats and no longer contradicts itself on recursion or removed planning paths.
- [testing-strategy.md](/Users/jim/code/personal/castr/.agent/directives/testing-strategy.md) and [DEFINITION_OF_DONE.md](/Users/jim/code/personal/castr/.agent/directives/DEFINITION_OF_DONE.md) now record the current off-chain status of `vitest.e2e` and `test:scalar-guard` rather than implying the canonical chain already covers them.
- Final consolidation rerun on Monday, 23 March 2026 kept the Pack 7 verdict unchanged:
  - `pnpm check:ci` green
  - `pnpm --dir /Users/jim/code/personal/castr/lib exec vitest run --config vitest.e2e.config.ts` still red in `ir-fidelity.test.ts`
  - `pnpm --dir /Users/jim/code/personal/castr/lib exec vitest run --config vitest.scalar-guard.config.ts` green
- Proof-suite docs now describe the real scope they cover:
  - [FIXTURES.md](/Users/jim/code/personal/castr/lib/tests-generated/FIXTURES.md) and [vitest.generated.config.ts](/Users/jim/code/personal/castr/lib/vitest.generated.config.ts) describe representative single-file structural validation rather than runtime execution
  - [README.md](/Users/jim/code/personal/castr/lib/tests-transforms/README.md) narrows Scenario 6 and 7 wording to the assertions that actually run
  - [README.md](/Users/jim/code/personal/castr/lib/tests-snapshot/README.md) no longer claims snapshot tests prove the entire generation pipeline
  - [README.md](/Users/jim/code/personal/castr/lib/src/characterisation/README.md) now treats remaining SwaggerParser references as historical comparison context rather than live architecture ownership
- [ADR-035-transform-validation-parity.md](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-035-transform-validation-parity.md) now carries an explicit current-state caveat so its historical transform-matrix language is not misread as today's fully discharged proof.

## Required Follow-On Slices

- Gate-chain and suite-taxonomy remediation: decide whether `vitest.e2e` and `test:scalar-guard` become canonical gates or are explicitly demoted / renamed, and repair the misplaced `src/tests-e2e/openapi-fidelity.test.ts` boundary.
- Generated-code proof hardening: either upgrade runtime and lint validation to real execution / blocking lint guarantees across supported output modes, or permanently narrow the suite contract and names to structural smoke checks.
- Transform-proof hardening: make Scenario 6 and 7 prove the semantic and cross-output properties the repo wants to claim, or narrow the public doctrine to the smaller supported subset permanently.
- Only after that proof/doctrine slice closes should the repo resume Pack 4-6 implementation remediation or any new feature work.

## Unblock Decision

- Pack 7 closed `red`.
- The seven-pack architecture review sweep is complete.
- New implementation remains blocked.
- The next honest implementation slice is proof-system and durable-doctrine remediation before any new format or feature work resumes.
