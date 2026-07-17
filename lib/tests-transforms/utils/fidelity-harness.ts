/**
 * Edge-case fidelity harness.
 *
 * Runs the full OpenAPI round-trip (parse → IR → write → reparse) plus the
 * IR serialization round-trip (`serializeIR`/`deserializeIR`) for a single
 * edge-case fixture, and records a machine-readable per-fixture outcome.
 *
 * Convention: remediation lanes add one fidelity test file per lane under
 * `__tests__/`, with fixtures under `__fixtures__/edge-cases/`; the shared
 * `transform-helpers.ts` is never edited for lane work. See
 * `../__fixtures__/edge-cases/README.md` for the full convention.
 */

import { basename } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { expect } from 'vitest';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import {
  deserializeIR,
  serializeIR,
  type CastrDocument,
} from '../../src/schema-processing/ir/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { writeOpenApi } from '../../src/schema-processing/writers/openapi/index.js';

/**
 * Machine-readable, JSON-serialisable per-fixture fidelity outcome.
 *
 * Each flag is recomputed from the round-trip artifacts with strict deep
 * equality (`node:util` `isDeepStrictEqual`) or byte comparison — never
 * recorded from a claim. Outcome records feed the preservation-coverage
 * metric, so every field must survive `JSON.stringify` unchanged.
 */
export interface FidelityOutcome {
  /** Fixture file basename, e.g. `fidelity-smoke.yaml`. */
  fixture: string;
  /** Whether parse → IR → write → reparse preserved the IR exactly. */
  irRoundTripEqual: boolean;
  /** Whether `deserializeIR(serializeIR(ir))` reproduced the IR exactly. */
  serializationRoundTripEqual: boolean;
  /** Whether rewriting the reparsed IR produced byte-identical output. */
  outputIdempotent: boolean;
}

/**
 * The intermediate artifacts produced by a fidelity round-trip, retained so
 * failing proofs can diff the exact structures that diverged.
 */
export interface FidelityArtifacts {
  /** IR parsed from the fixture. */
  originalIR: CastrDocument;
  /** IR parsed from the written output of `originalIR`. */
  reparsedIR: CastrDocument;
  /** IR rehydrated via `deserializeIR(serializeIR(originalIR))`. */
  rehydratedIR: CastrDocument;
  /** OpenAPI document written from `originalIR`. */
  firstOutput: ReturnType<typeof writeOpenApi>;
  /** OpenAPI document written from `reparsedIR`. */
  secondOutput: ReturnType<typeof writeOpenApi>;
}

/**
 * A complete fidelity proof for one fixture: the machine-readable outcome
 * plus the artifacts it was recomputed from.
 */
export interface FidelityProof {
  outcome: FidelityOutcome;
  artifacts: FidelityArtifacts;
}

/**
 * Run the fidelity round-trip for one edge-case fixture.
 *
 * Pipeline: load fixture → `buildIR` → `writeOpenApi` → `buildIR` →
 * `writeOpenApi`, plus `deserializeIR(serializeIR(ir))` on the original IR.
 * Parse or write failures propagate as errors (fail-fast); a completed run
 * returns the recomputed outcome and all intermediate artifacts.
 *
 * @param fixturePath - Absolute path to the fixture (resolve it from the
 * test file's own location so it is portable across machines)
 * @returns The machine-readable outcome plus the round-trip artifacts
 */
export async function runFidelityProof(fixturePath: string): Promise<FidelityProof> {
  const loaded = await loadOpenApiDocument(fixturePath);
  const originalIR = buildIR(loaded.document);
  const firstOutput = writeOpenApi(originalIR);
  const reparsedIR = buildIR(firstOutput);
  const secondOutput = writeOpenApi(reparsedIR);
  const rehydratedIR = deserializeIR(serializeIR(originalIR));

  const outcome: FidelityOutcome = {
    fixture: basename(fixturePath),
    irRoundTripEqual: isDeepStrictEqual(reparsedIR, originalIR),
    serializationRoundTripEqual: isDeepStrictEqual(rehydratedIR, originalIR),
    outputIdempotent: JSON.stringify(secondOutput) === JSON.stringify(firstOutput),
  };

  return {
    outcome,
    artifacts: { originalIR, reparsedIR, rehydratedIR, firstOutput, secondOutput },
  };
}

/**
 * Assert that a fidelity proof shows full preservation.
 *
 * Asserts on the artifacts first (so a divergence fails with a structural
 * diff of the exact IRs/outputs involved), then on the recomputed outcome
 * record itself.
 *
 * @param proof - The proof returned by {@link runFidelityProof}
 */
export function expectFidelity(proof: FidelityProof): void {
  const { artifacts, outcome } = proof;

  expect(
    artifacts.reparsedIR,
    `${outcome.fixture}: parse → IR → write → reparse must preserve the IR`,
  ).toEqual(artifacts.originalIR);
  expect(
    artifacts.rehydratedIR,
    `${outcome.fixture}: deserializeIR(serializeIR(ir)) must reproduce the IR`,
  ).toEqual(artifacts.originalIR);
  expect(
    JSON.stringify(artifacts.secondOutput),
    `${outcome.fixture}: rewriting the reparsed IR must be byte-stable`,
  ).toBe(JSON.stringify(artifacts.firstOutput));

  expect(
    outcome,
    `${outcome.fixture}: the machine-readable outcome must record full preservation`,
  ).toEqual({
    fixture: outcome.fixture,
    irRoundTripEqual: true,
    serializationRoundTripEqual: true,
    outputIdempotent: true,
  } satisfies FidelityOutcome);
}
