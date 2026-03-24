# Plan (Active): IR and Runtime Validator Remediation (RC-3)

**Status:** Proposed — awaiting review
**Created:** 2026-03-23
**Predecessor:** [proof-system-and-doctrine-remediation.md](../current/complete/proof-system-and-doctrine-remediation.md)
**Triage Source:** [cross-pack-triage.md](../../research/architecture-review-packs/cross-pack-triage.md)
**Related:** [IDENTITY.md](../../IDENTITY.md), [ADR-040](../../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md), [Pack 2 Note](../../research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md)

---

## Why RC-3 Is Next (Not RC-4)

The cross-pack triage dependency graph shows RC-3 and RC-4 are both unblocked after RC-1/RC-2 closure. RC-3 is recommended first because:

1. **IR trust is foundational.** `isCastrSchema()` is called by `deserializeIR()` and every downstream validator path. Until the runtime boundary rejects malformed schema shapes, no writer/proof fix (RC-4) can be verified against an honest IR.
2. **Object-ontology drift undermines IDENTITY.** IDENTITY declares a single closed-world object model, but runtime code still admits schema-valued `additionalProperties` and `unevaluatedProperties`. Closing this gap now prevents RC-4 format fixes from inheriting a contradictory object model.
3. **Disjoint file set.** RC-3 changes are concentrated in IR validation/model files and do not overlap with RC-4's format-specific parser/writer code, minimising regression risk.

---

## User Impact

After this slice, the runtime IR boundary will honestly reject any schema shape that does not belong to the canonical Castr ontology. This means:

- Malformed serialised IR (e.g. invalid `type`, contradictory object fields) cannot silently cross the deserialisation boundary.
- The `trace` HTTP method works end-to-end.
- Downstream writer/proof paths (RC-4 scope) can trust that any IR document they receive is structurally valid.

---

## Scope

### In Scope

1. **Schema type validation** — `isCastrSchema()` must validate that `type` (when present) is a valid schema type string or array of valid type strings. Schemas with invalid `type` values (e.g. `'wat'`) must be rejected.

2. **Object-ontology closure** — Reconcile the IR model and validators with IDENTITY's closed-world doctrine:
   - `additionalProperties` must only accept `boolean` values (`true` | `false`), not schema-valued catchalls. Schema-valued `additionalProperties` represents open structural typing, which IDENTITY explicitly rejects.
   - `unevaluatedProperties` must only accept `boolean` values, not schema-valued forms, for the same reason.
   - Update `isCastrSchema()` and its tests to reject schema-valued forms.
   - Narrow the `CastrSchema` TypeScript interface to `boolean` (no `| CastrSchema`).

3. **`trace` HTTP method** — Add `'trace'` to `VALID_HTTP_METHODS` in `validators.document.ts` and extend the validator test to cover all eight methods including `trace`.

### Out of Scope

- Format-specific parser/writer lockstep fixes (RC-4) — separate bounded plan.
- Downstream surface drift (RC-5) — separate bounded plan.
- New feature or format implementation.
- Reactivation of the paused JSON Schema parser plan.

---

## Locked Constraints

1. Code on disk and reproduced gate reality outrank plans, prompts, or ADR summaries.
2. TDD at all levels — write failing tests first.
3. No escape hatches.
4. All quality-gate failures remain blocking.
5. The paused JSON Schema parser plan stays paused.

---

## Execution Plan

### Phase 1: Schema Type Validation (Finding 1)

> `isCastrSchema()` does not validate `type`. A serialised IR document deserialises successfully even when a component schema's `type` is mutated to an invalid string like `'wat'`.

**TDD order:**

1. Write failing test in `validators.unit.test.ts`: `isCastrSchema()` returns `false` for a schema where `type` is `'wat'`.
2. Write failing test: `isCastrSchema()` returns `false` for a schema where `type` is an array containing `'wat'`.
3. Write failing test: `isCastrSchema()` returns `true` for all valid single-type and array-type values (including `undefined` for composition/ref-only schemas).
4. Implement: add a `hasValidSchemaType(value)` check to `isCastrSchema()` in `validators.schema.ts` that delegates to the existing `isSchemaTypeValue()` function.
5. Run `pnpm test` — new tests pass, existing tests stay green.

**Files changed:**

- [MODIFY] [validators.schema.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.schema.ts)
- [MODIFY] [validators.unit.test.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.unit.test.ts)

---

### Phase 2: Object-Ontology Closure (Finding 2)

> IDENTITY says catchall/`additionalProperties` openness is rejected, but IR model and validators still accept schema-valued `additionalProperties` and `unevaluatedProperties`.

> [!IMPORTANT]
> This phase narrows the `CastrSchema` TypeScript interface. Any existing code that creates schema-valued `additionalProperties` or `unevaluatedProperties` will become a type error. A codebase-wide audit is needed before changing the type.

**Investigation (before TDD):**

1. Grep for all uses of `additionalProperties` and `unevaluatedProperties` across `lib/src/` to identify any code paths that create or consume schema-valued forms.
2. Document which parser/writer paths set these to schema values today and determine whether they represent (a) dead code from before IDENTITY, (b) active code that needs replacement logic, or (c) genuine semantic needs that would require revising IDENTITY.
3. If (c) is found, pause this phase and surface the question to the user before proceeding.

**TDD order:**

4. Write failing test: `isCastrSchema()` returns `false` when `additionalProperties` is a schema object (currently passes — this test codifies the new rejection).
5. Write failing test: `isCastrSchema()` returns `false` when `unevaluatedProperties` is a schema object.
6. Update the existing "catchall unknown-key behavior" test to assert `false` instead of `true`.
7. Implement: change the `isValidAdditionalProperties()` function to accept only `boolean`, not `isCastrSchema(value)`. Add a parallel `hasValidSchemaUnevaluatedProperties()` check.
8. Narrow the TypeScript interface: change `additionalProperties?: boolean | CastrSchema` to `additionalProperties?: boolean` and `unevaluatedProperties?: boolean | CastrSchema` to `unevaluatedProperties?: boolean`.
9. Fix any resulting type errors across `lib/src/` (identified in the investigation step).
10. Run `pnpm test` — all tests green.

**Files changed:**

- [MODIFY] [schema.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts)
- [MODIFY] [validators.schema.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.schema.ts)
- [MODIFY] [validators.unit.test.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.unit.test.ts)
- Likely additional files identified by the Phase 2 investigation grep

---

### Phase 3: `trace` HTTP Method (Finding 3)

> The IR `IRHttpMethod` type includes `'trace'`, OpenAPI parser and writer handle `trace`, but the runtime validator omits it from `VALID_HTTP_METHODS`.

**TDD order:**

1. Write failing test: `isCastrOperation()` returns `true` for a valid `trace` operation (currently fails — `trace` is not in `VALID_HTTP_METHODS`).
2. Update the "all HTTP methods" test to include `trace` in its list.
3. Implement: add `'trace'` to `VALID_HTTP_METHODS` in `validators.document.ts`.
4. Run `pnpm test` — all tests green.

**Files changed:**

- [MODIFY] [validators.document.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.document.ts)
- [MODIFY] [validators.unit.test.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.unit.test.ts)

---

### Phase 4: Gate Closure and Handoff

1. Run the full canonical quality-gate chain: `pnpm check`.
2. Update handoff docs: `session-entry.prompt.md`, `roadmap.md`.
3. Mark this plan as complete and move to `./current/complete/`.

**Files changed:**

- [MODIFY] [session-entry.prompt.md](file:///Users/jim/code/personal/castr/.agent/prompts/session-entry.prompt.md)
- [MODIFY] [roadmap.md](file:///Users/jim/code/personal/castr/.agent/plans/roadmap.md)

---

## Verification Plan

### Automated Tests

All verification is automated and runs via the canonical gate chain.

| Step | Command           | What it proves                                         |
| ---- | ----------------- | ------------------------------------------------------ |
| 1    | `pnpm test`       | New RC-3 unit tests pass; no regressions in core suite |
| 2    | `pnpm type-check` | Narrowed `CastrSchema` interface compiles cleanly      |
| 3    | `pnpm check`      | Full canonical quality-gate chain green                |

**Exact commands to run from repo root:**

```bash
# Quick iteration during development:
pnpm test

# After all phases complete — full gate chain:
pnpm check
```

### Manual Verification

- Cold-read the `isCastrSchema()` function to confirm it now validates `type`, rejects schema-valued `additionalProperties`, and rejects schema-valued `unevaluatedProperties`.
- Cold-read `VALID_HTTP_METHODS` to confirm it contains all eight methods including `trace`.

---

## Success Metrics

1. `pnpm check` is green.
2. `isCastrSchema()` rejects schemas with invalid `type` values.
3. `isCastrSchema()` rejects schemas with schema-valued `additionalProperties` or `unevaluatedProperties`.
4. `isCastrOperation()` accepts `trace` operations.
5. The `CastrSchema` TypeScript interface no longer has `| CastrSchema` on `additionalProperties` or `unevaluatedProperties`.
6. No escape hatches were introduced.
7. Handoff docs reflect the new repo truth.

---

## Completion Rule

This plan is complete when all success metrics are met, all gate errors are resolved, and handoff docs reflect the new repo truth.

After completion, the next successor slice should be:

- **RC-4: Format-Specific Drift** — parser/writer lockstep fixes for OpenAPI, JSON Schema, and Zod.

Open that successor plan from the triage; do not blend it into this one.
