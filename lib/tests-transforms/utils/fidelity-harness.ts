/**
 * Edge-case fidelity harness.
 *
 * Runs the full OpenAPI round-trip (parse → IR → write → revalidate → reparse)
 * plus the IR serialization round-trip (`serializeIR`/`deserializeIR`) for a
 * single edge-case fixture, and records a machine-readable per-fixture outcome.
 *
 * What the proof certifies — and what it does not:
 *
 * - **IR round-trip equality certifies writer/reparse fidelity, NOT parser
 *   fidelity.** The baseline is the post-parse IR, so a semantic the PARSER
 *   flattens on the way in (for example operation-security AND-groups) is
 *   invisible to IR equality: `reparsedIR` equals `originalIR` even though the
 *   source semantic is gone. Fixtures that exercise parser-lossy traits must
 *   pin them with {@link FidelityProofOptions.sourceAssertions}, which sees
 *   the raw loaded source document before the parser runs.
 * - The return leg routes written output through the canonical load boundary
 *   ({@link reparseWrittenDocument}), so parseable-but-spec-invalid writer
 *   output is a red proof, never a green one.
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
 * Canonical OpenAPI document as returned by the load/validation boundary
 * (`loadOpenApiDocument`), before any parsing into IR.
 */
export type LoadedSourceDocument = Awaited<ReturnType<typeof loadOpenApiDocument>>['document'];

/** OpenAPI document as produced by the writer. */
export type WrittenOpenApiDocument = ReturnType<typeof writeOpenApi>;

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
  /**
   * Whether parse → IR → write → revalidate → reparse preserved the IR
   * exactly. Certifies writer/reparse fidelity relative to the post-parse IR;
   * parser fidelity relative to the source document is certified only by
   * {@link FidelityProofOptions.sourceAssertions}.
   */
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
  /** Raw loaded source document (canonical load boundary output, pre-IR). */
  sourceDocument: LoadedSourceDocument;
  /** IR parsed from the fixture. */
  originalIR: CastrDocument;
  /** IR parsed from the revalidated written output of `originalIR`. */
  reparsedIR: CastrDocument;
  /** IR rehydrated via `deserializeIR(serializeIR(originalIR))`. */
  rehydratedIR: CastrDocument;
  /** OpenAPI document written from `originalIR`. */
  firstOutput: WrittenOpenApiDocument;
  /** OpenAPI document written from `reparsedIR`. */
  secondOutput: WrittenOpenApiDocument;
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
 * Per-fixture options for {@link runFidelityProof}.
 */
export interface FidelityProofOptions {
  /**
   * Source-level semantic expectations for the fixture, evaluated against the
   * raw loaded source document AND the written output, before the reparse leg
   * runs.
   *
   * This hook exists because IR-equality alone cannot see parser-side losses:
   * the round-trip baseline is the post-parse IR, so a source semantic the
   * parser flattens leaves `reparsedIR` equal to `originalIR` and the proof
   * green. A fixture exercising a parser-lossy trait pins that trait here —
   * on the pre-parse document, and on the written output where it must
   * reappear. A failing expectation propagates as an error and turns the
   * proof red (fail-fast).
   *
   * @param sourceDocument - Raw loaded source document (pre-IR)
   * @param writtenDocument - Document written from the parsed IR
   */
  sourceAssertions?: (
    sourceDocument: LoadedSourceDocument,
    writtenDocument: WrittenOpenApiDocument,
  ) => void;
}

/**
 * Reparse written output through the canonical load/validation boundary.
 *
 * The return leg must not feed writer output straight into `buildIR`:
 * `buildIR` does not validate, so a writer emitting parseable-but-spec-invalid
 * output (for example a dangling `$ref` to a component it failed to emit)
 * would still round-trip green. Routing through `loadOpenApiDocument` makes
 * spec-invalid writer output fail the proof at the same boundary every real
 * consumer of the written document goes through.
 *
 * The document is cloned before loading so the boundary's bundling/upgrade
 * steps cannot mutate the writer's artefact (which the proof still needs
 * pristine for the byte-stability comparison).
 *
 * @param writtenDocument - Writer output to revalidate and reparse; typed as
 * the boundary's own input contract (an unvalidated in-memory document)
 * @returns The IR rebuilt from the revalidated document
 * @throws If the written document fails the canonical validation boundary
 */
export async function reparseWrittenDocument(writtenDocument: object): Promise<CastrDocument> {
  const revalidated = await loadOpenApiDocument(structuredClone(writtenDocument));
  return buildIR(revalidated.document);
}

/**
 * Run the fidelity round-trip for one edge-case fixture.
 *
 * Pipeline: load fixture → `buildIR` → `writeOpenApi` →
 * `loadOpenApiDocument` (revalidation) → `buildIR` → `writeOpenApi`, plus
 * `deserializeIR(serializeIR(ir))` on the original IR. Parse, validation, or
 * write failures propagate as errors (fail-fast); a completed run returns the
 * recomputed outcome and all intermediate artifacts.
 *
 * When {@link FidelityProofOptions.sourceAssertions} is provided it fires
 * after the first write and before the reparse leg, so a parser-side loss
 * fails the proof at the seam that caused it.
 *
 * @param fixturePath - Absolute path to the fixture (resolve it from the
 * test file's own location so it is portable across machines)
 * @param options - Optional per-fixture source-level expectations
 * @returns The machine-readable outcome plus the round-trip artifacts
 */
export async function runFidelityProof(
  fixturePath: string,
  options: FidelityProofOptions = {},
): Promise<FidelityProof> {
  const loaded = await loadOpenApiDocument(fixturePath);
  const sourceDocument = loaded.document;
  const originalIR = buildIR(sourceDocument);
  const firstOutput = writeOpenApi(originalIR);
  options.sourceAssertions?.(sourceDocument, firstOutput);
  const reparsedIR = await reparseWrittenDocument(firstOutput);
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
    artifacts: { sourceDocument, originalIR, reparsedIR, rehydratedIR, firstOutput, secondOutput },
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
    `${outcome.fixture}: parse → IR → write → revalidate → reparse must preserve the IR`,
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
