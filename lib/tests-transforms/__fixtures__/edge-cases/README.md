# Edge-Case Fidelity Fixtures

Minimal, focused fixtures that prove IR fidelity for specific edge cases through the
fidelity harness (`../../utils/fidelity-harness.ts`). Each fixture is the smallest
document that exercises one behaviour; the harness turns it into a round-trip proof
with a machine-readable outcome.

## Convention

- **Fixtures live here.** One file per edge case, named after the behaviour it
  exercises (for example `fidelity-smoke.yaml`). YAML and JSON are both supported.
- **One fidelity test file per remediation lane**, placed in `../../__tests__/` and
  named `*.integration.test.ts` so the transforms Vitest config picks it up. A lane's
  test imports `runFidelityProof`/`expectFidelity` from
  `../utils/fidelity-harness.js` and resolves its fixtures from this directory.
- **Shared helpers stay stable.** Lane tests build on `utils/fidelity-harness.ts`
  (or add new util modules); the shared `utils/transform-helpers.ts` remains
  unchanged by lane work.
- **Proof-first.** A fixture that exposes a defect lands together with its failing
  proof and the product fix as one green cycle. The harness's `FidelityOutcome`
  record is JSON-serialisable so per-fixture results can feed preservation-coverage
  reporting.

## What the harness proves per fixture

1. `parse → IR → write → reparse` preserves the IR exactly.
2. `deserializeIR(serializeIR(ir))` reproduces the IR exactly.
3. Rewriting the reparsed IR is byte-stable.

See `docs/architecture/fidelity-proof-harness.md` (repo root) for the durable
description of the harness.

## Current fixtures

| Fixture               | Exercises                                                             |
| --------------------- | --------------------------------------------------------------------- |
| `fidelity-smoke.yaml` | Tiny fully-preserved spec proving the harness end-to-end (smoke test) |

## Candidate future fixtures

- `nullable-types.yaml` — OAS 3.1 `type: [string, null]` handling
- `circular-refs.yaml` — Self-referencing schemas
- `composition.yaml` — allOf/oneOf/anyOf combinations
