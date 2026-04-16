# ePerusteet Real-Spec Validation

**Status:** COMPLETE — staged closure record  
**Created:** 2026-04-16  
**Promoted:** 2026-04-16  
**Completed:** 2026-04-16  
**Predecessor:** [oas-3.2-full-feature-support.md](./oas-3.2-full-feature-support.md)

---

## Goal

Add the upstream `eperusteet-ext.spec.json` document as a committed real-world OpenAPI fixture and wire it into the repo's validation surfaces honestly.

## Outcome

This slice closed on Thursday, 16 April 2026.

The upstream ePerusteet document is now committed at `lib/tests-fixtures/openapi-samples/real-world/eperusteet-ext.json`, but it was **not** added to the green transform or generated-code fixture matrices. A fresh reproduction showed that the shared load boundary accepts and canonicalises the document, while the OpenAPI -> IR build seam rejects it because the spec uses schema-valued `additionalProperties`. That rejection was the then-current implementation state under ADR-040 / IDENTITY wording and became the reproduction that directly triggered the later doctrine clarification and successor plan.

The landed change therefore wires the fixture into explicit fail-fast validation rather than pretending it is a supported semantic-equivalence fixture:

- transform proof: `tests-transforms/__tests__/real-world-rejection.integration.test.ts` proves `buildIR()` rejects the fixture with the strict-object error
- generated proof: `tests-generated/rejection-validation.gen.test.ts` proves `generateZodClientFromOpenAPI()` rejects the same fixture with the same doctrine-aligned error
- fixture/docs hygiene: the committed real-world fixture is stored at a stable path, and the transform-fixture/generated-fixture docs were updated only where repo truth changed
- fixture docs: normalized-fixture docs now honestly describe `input.<ext>` rather than `input.yaml` only

## Why The Matrix Stayed Split

Adding the fixture to the green arbitrary-transform or generated-validation matrices would have been dishonest at the time of reproduction. The reproduced behaviour was not a new regression in a closed OAS 3.2 slice; it was the then-current implementation posture around explicit `additionalProperties`. The correct validation wiring for this predecessor slice was therefore an explicit fail-fast proof, not a green-path fixture addition.

## Verification

Targeted verification ran green on Thursday, 16 April 2026:

- `pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/scenario-1-openapi-roundtrip.integration.test.ts tests-transforms/__tests__/scenario-3-openapi-via-zod.integration.test.ts tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts tests-transforms/__tests__/real-world-rejection.integration.test.ts`
- `pnpm --dir lib exec vitest run --config vitest.generated.config.ts tests-generated/syntax-validation.gen.test.ts tests-generated/type-check-validation.gen.test.ts tests-generated/runtime-validation.gen.test.ts tests-generated/lint-validation.gen.test.ts tests-generated/rejection-validation.gen.test.ts`

## Reviewer Loop

- `code-reviewer` fallback — **APPROVED**; no critical issues found in the landed diff
- `test-reviewer` fallback — **COMPLIANT**; the slice now has explicit behavioural proof for both the transform seam and the generated entrypoint, and the green matrices returned to baseline
- `openapi-expert` fallback — **APPROVED**; the landed tests keep OpenAPI truth honest by distinguishing shared-load acceptance from strict IR-build rejection

## Next Entrypoint

The direct successor primary active plan is [explicit-additional-properties-support.md](../../active/explicit-additional-properties-support.md). If a user reports a fresh gate or runtime issue, reproduce it first; otherwise execute that slice honestly.
