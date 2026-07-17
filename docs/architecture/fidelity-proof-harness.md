# Fidelity Proof Harness

**Status:** Permanent reference  
**Last Updated:** 2026-07-17  
**Related:** [ADR-027](../architectural_decision_records/ADR-027-round-trip-validation.md), [ADR-035](../architectural_decision_records/ADR-035-transform-validation-parity.md), [`.agent/directives/DEFINITION_OF_DONE.md`](../../.agent/directives/DEFINITION_OF_DONE.md), [`.agent/directives/testing-strategy.md`](../../.agent/directives/testing-strategy.md)

---

## Purpose

The fidelity proof harness is the durable home for round-trip truth about
edge-case inputs. It proves, per fixture, that castr's doctrine — lossless,
deterministic, fail-fast compilation — actually holds through the full
pipeline, and it records the result in a machine-readable form.

The transform scenario suites (`lib/tests-transforms/__tests__/scenario-*`)
prove the pipelines against representative real-world documents. The fidelity
harness complements them with minimal, single-behaviour fixtures: each fixture
is the smallest document that exercises one edge case, so a red proof points
at exactly one seam.

## What the harness proves

For one fixture, `runFidelityProof` (in
`lib/tests-transforms/utils/fidelity-harness.ts`) runs:

```text
load fixture → buildIR → writeOpenApi → buildIR → writeOpenApi
                  │
                  └→ serializeIR → deserializeIR
```

and recomputes three properties:

1. **IR round-trip equality** — `parse → IR → write → reparse` preserves the
   IR exactly (strict deep equality).
2. **Serialization round-trip equality** — `deserializeIR(serializeIR(ir))`
   reproduces the IR exactly.
3. **Output idempotence** — writing the reparsed IR produces byte-identical
   output to the first write.

Parse or write failures propagate as errors: the harness is fail-fast, so a
fixture the pipeline rejects is a red proof, never a skipped one.

## Machine-readable outcomes

Each run returns a `FidelityProof`:

- `outcome` — a JSON-serialisable `FidelityOutcome` record
  (`fixture`, `irRoundTripEqual`, `serializationRoundTripEqual`,
  `outputIdempotent`), recomputed from the artifacts on every run. Outcome
  records are the aggregation surface for preservation-coverage reporting.
- `artifacts` — the intermediate IRs and written documents, retained so a
  failing proof diffs the exact structures that diverged.

`expectFidelity(proof)` asserts full preservation, artifacts first (for
structural diffs), then the outcome record itself.

## Convention

- Fixtures live in `lib/tests-transforms/__fixtures__/edge-cases/` — one file
  per edge case, named after the behaviour it exercises.
- Each remediation lane adds one fidelity test file under
  `lib/tests-transforms/__tests__/`, named `*.integration.test.ts` so the
  transforms Vitest config includes it.
- A fixture that exposes a defect lands together with its failing proof and
  the product fix as one green cycle (proof-first TDD).
- Shared helpers stay stable: lane tests build on `fidelity-harness.ts` or add
  new util modules, and `transform-helpers.ts` remains unchanged by lane work.

The end-to-end smoke proof is
`lib/tests-transforms/__tests__/fidelity-harness.smoke.integration.test.ts`
with fixture `fidelity-smoke.yaml`.

## Gate placement

The harness runs inside `pnpm test:transforms`, which is part of the canonical
quality-gate chain (`pnpm check` / `pnpm check:ci`). See
[`DEFINITION_OF_DONE.md`](../../.agent/directives/DEFINITION_OF_DONE.md).
