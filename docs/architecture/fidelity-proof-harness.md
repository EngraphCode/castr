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
load fixture → buildIR → writeOpenApi → loadOpenApiDocument → buildIR → writeOpenApi
                  │            │          (revalidation)
                  │            └→ sourceAssertions(sourceDoc, writtenDoc)
                  └→ serializeIR → deserializeIR
```

and recomputes three properties:

1. **IR round-trip equality** — `parse → IR → write → revalidate → reparse`
   preserves the IR exactly (strict deep equality).
2. **Serialization round-trip equality** — `deserializeIR(serializeIR(ir))`
   reproduces the IR exactly.
3. **Output idempotence** — writing the reparsed IR produces byte-identical
   output to the first write.

The return leg routes the written document through the canonical load boundary
(`loadOpenApiDocument`) before rebuilding the IR — `reparseWrittenDocument` in
the harness. `buildIR` alone does not validate, so feeding writer output
straight into it would let a writer emitting parseable-but-spec-invalid output
(for example a dangling `$ref` to a component it failed to emit) still prove
green. Revalidation makes spec-invalid writer output a red proof at the same
boundary every real consumer of the written document goes through.

Parse, validation, or write failures propagate as errors: the harness is
fail-fast, so a fixture the pipeline rejects is a red proof, never a skipped
one.

## What IR-equality does and does not certify

IR round-trip equality certifies **writer/reparse fidelity, not parser
fidelity**. The comparison baseline is the post-parse IR, so a semantic the
parser flattens on the way in (for example operation-security AND-groups) is
invisible to it: `reparsedIR` equals `originalIR` and the proof passes even
though the source semantic is gone.

Parser fidelity is certified by the harness's source-level assertion hook:
`runFidelityProof(fixturePath, { sourceAssertions })`. The hook fires after
the first write and before the reparse leg, and receives:

- the **raw loaded source document** — the canonical output of
  `loadOpenApiDocument`, before any parsing into IR — and
- the **written output** — the document the writer produced from the parsed
  IR, where the source trait must reappear.

A fixture exercising a parser-lossy trait pins that trait in
`sourceAssertions`; a failing expectation propagates and turns the proof red.
Lanes adding parser-loss fixtures (L-D et al.) must use this hook — see the
convention in `lib/tests-transforms/__fixtures__/edge-cases/README.md`.

## Machine-readable outcomes

Each run returns a `FidelityProof`:

- `outcome` — a JSON-serialisable `FidelityOutcome` record
  (`fixture`, `irRoundTripEqual`, `serializationRoundTripEqual`,
  `outputIdempotent`), recomputed from the artifacts on every run. Outcome
  records are the aggregation surface for preservation-coverage reporting.
- `artifacts` — the raw source document, the intermediate IRs, and the written
  documents, retained so a failing proof diffs the exact structures that
  diverged.

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
- Fixtures whose semantics the parser might lose pin those semantics with
  `sourceAssertions` — IR equality alone cannot see a parser-side loss.
- Shared helpers stay stable: lane tests build on `fidelity-harness.ts` or add
  new util modules, and `transform-helpers.ts` remains unchanged by lane work.

The end-to-end smoke proof is
`lib/tests-transforms/__tests__/fidelity-harness.smoke.integration.test.ts`
with fixture `fidelity-smoke.yaml`. Alongside the preservation proof it pins
the two truth guarantees directly: a parseable-but-spec-invalid writer-output
stand-in is rejected at the load boundary, and `sourceAssertions` demonstrably
fires against the raw loaded document (and its failures propagate red).

## Gate placement

The harness runs inside `pnpm test:transforms`, which is part of the canonical
quality-gate chain (`pnpm check` / `pnpm check:ci`). See
[`DEFINITION_OF_DONE.md`](../../.agent/directives/DEFINITION_OF_DONE.md).
