/**
 * Fidelity Harness Smoke Proof
 *
 * Proves the edge-case fidelity harness works end-to-end on one tiny fixture:
 * parse → IR → write → reparse equality, `serializeIR`/`deserializeIR`
 * rehydration equality, byte-stable rewrite, and a machine-readable
 * per-fixture outcome record.
 *
 * Convention: one fidelity test file per remediation lane, fixtures under
 * `__fixtures__/edge-cases/` — see `../__fixtures__/edge-cases/README.md`.
 */

import { describe, expect, it } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expectFidelity, runFidelityProof } from '../utils/fidelity-harness.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SMOKE_FIXTURE = resolve(__dirname, '../__fixtures__/edge-cases/fidelity-smoke.yaml');

describe('fidelity harness smoke proof', () => {
  it('proves full preservation and a machine-readable outcome on the smoke fixture', async () => {
    const proof = await runFidelityProof(SMOKE_FIXTURE);

    expectFidelity(proof);

    expect(proof.outcome).toEqual({
      fixture: 'fidelity-smoke.yaml',
      irRoundTripEqual: true,
      serializationRoundTripEqual: true,
      outputIdempotent: true,
    });

    // Machine-readable means the record survives JSON round-trip unchanged.
    expect(JSON.parse(JSON.stringify(proof.outcome))).toEqual(proof.outcome);
  });
});
