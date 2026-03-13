# Plan (Complete): `int64` / `bigint` Remediation Closure

**Status:** Complete  
**Created:** 2026-03-11  
**Last Updated:** 2026-03-13  
**Predecessor Context:** [strict-object-semantics-enforcement.md](./strict-object-semantics-enforcement.md)  
**Successor Active Slice:** [zod-limitations-next-atomic-slice-planning.md](../../active/zod-limitations-next-atomic-slice-planning.md)  
**Related:** [native-capability-matrix.md](../../../docs/architecture/native-capability-matrix.md), [ADR-031](../../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md), [ADR-032](../../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md), [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md), [ADR-041](../../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md), [zod-limitations-architecture-investigation.md](../paused/zod-limitations-architecture-investigation.md)

---

This slice is complete and no longer belongs in `active/`.

On Friday, 13 March 2026, the repo closed the remaining `int64` / `bigint` correctness debt without reopening doctrine, adding custom portable rescue types, or weakening fail-fast behaviour.

## Summary

The slice started with doctrine already implemented but three confirmed correctness gaps still open:

1. `deserializeIR()` rejected valid IR documents containing preserved raw OpenAPI components.
2. Raw OpenAPI schema-capability traversal skipped `$ref` plus sibling integer-format fields.
3. JSON Schema parsing returned early on `$ref`, allowing `$ref` plus integer-format siblings to bypass native-capability rejection.

Those gaps are now closed.

## Completed Work

Implemented on 2026-03-13:

- extended IR unknown-boundary validation so preserved raw OpenAPI components (`header`, `link`, `callback`, `pathItem`, `example`) validate and deserialize cleanly
- changed raw OpenAPI schema traversal so schema objects with `$ref` plus sibling keywords are still visited for local integer-capability checks
- added JSON Schema parser preflight so `$ref` plus `type: 'integer'` with `format: 'int64'` or `format: 'bigint'` rejects before the plain-ref early return
- added targeted unit coverage for all three seams plus nullable integer type-array variants where relevant

During final manual review, one extra validator hardening fix was also required:

- `isIRComponent()` now uses own-property discriminator checks so inherited object keys such as `toString` cannot masquerade as valid component types

## Verification Snapshot

Targeted proof and integration runs completed green on 2026-03-13:

- `pnpm --dir lib exec vitest run src/schema-processing/ir/validation/validators.unit.test.ts src/schema-processing/ir/serialization.unit.test.ts`
- `pnpm --dir lib exec vitest run src/schema-processing/compatibility/integer-target-capabilities.unit.test.ts`
- `pnpm --dir lib exec vitest run src/schema-processing/parsers/json-schema/json-schema-parser.core.unit.test.ts`
- `pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/scenario-4-zod-via-openapi.integration.test.ts tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts`
- `pnpm lint`

The full canonical repo-root Definition of Done chain also completed green on 2026-03-13:

- `pnpm clean`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm format:check`
- `pnpm type-check`
- `pnpm lint`
- `pnpm madge:circular`
- `pnpm madge:orphans`
- `pnpm depcruise`
- `pnpm knip`
- `pnpm portability:check`
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`

## Review Outcome

Closure review was completed manually in-session on 2026-03-13 using the local reviewer templates rather than nested reviewer runs:

- `code-reviewer`
- `test-reviewer`
- `type-reviewer`
- `openapi-expert`
- `json-schema-expert`

That manual template-based pass surfaced one final real issue during closure: inherited object keys could pass the `isIRComponent()` discriminator refactor. The fix and regression proof landed in the same session, targeted verification was rerun, and the final review state is clean.

## Follow-On Context

The next repo entrypoint is not a reactivated umbrella investigation. It is a small active planning stub:

- [zod-limitations-next-atomic-slice-planning.md](../../active/zod-limitations-next-atomic-slice-planning.md)

That stub points back to the paused Zod limitations umbrella and supporting paused investigations so the next session can choose the next smallest honest atomic slice.
