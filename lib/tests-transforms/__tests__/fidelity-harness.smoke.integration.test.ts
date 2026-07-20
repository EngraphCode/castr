/**
 * Fidelity Harness Smoke Proof
 *
 * Proves the edge-case fidelity harness works end-to-end on one tiny fixture:
 * parse → IR → write → boundary-revalidated reparse equality,
 * `serializeIR`/`deserializeIR` rehydration equality, byte-stable rewrite, and
 * a machine-readable per-fixture outcome record. Also proves the two harness
 * truth guarantees directly:
 *
 * - the return leg routes written output through the canonical load boundary,
 *   so parseable-but-spec-invalid writer output is a red proof, and
 * - `sourceAssertions` fires against the raw loaded source document and the
 *   written output, and a failing source expectation turns the proof red.
 *
 * Convention: one fidelity test file per remediation lane, fixtures under
 * `__fixtures__/edge-cases/` — see `../__fixtures__/edge-cases/README.md`.
 */

import { describe, expect, it } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import {
  expectFidelity,
  reparseWrittenDocument,
  runFidelityProof,
} from '../utils/fidelity-harness.js';

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

  it('rejects parseable-but-spec-invalid writer output at the canonical load boundary', async () => {
    // Stand-in for a defective writer: parseable, but its only $ref points at
    // a component it never emitted, so the document is spec-invalid.
    const invalidWriterOutput = {
      openapi: '3.2.0',
      info: { title: 'Invalid Writer Output', version: '1.0.0' },
      paths: {
        '/things': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Missing' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // `buildIR` alone accepts this document — which is exactly why the return
    // leg must not certify writer output by feeding it straight into `buildIR`.
    expect(() => buildIR(invalidWriterOutput)).not.toThrow();

    // The harness return leg routes through `loadOpenApiDocument`, so the
    // same document fails the proof at the validation boundary.
    await expect(reparseWrittenDocument(invalidWriterOutput)).rejects.toThrow(
      "Can't resolve reference: #/components/schemas/Missing",
    );
  });

  it('fires sourceAssertions against the raw loaded source document and the written output', async () => {
    const observedTitles: string[] = [];

    const proof = await runFidelityProof(SMOKE_FIXTURE, {
      sourceAssertions: (sourceDocument, writtenDocument) => {
        observedTitles.push(sourceDocument.info.title);

        // The hook receives the raw loaded document — the nested `paths`
        // shape the IR does not carry (the IR flattens it into an operations
        // list) — so source-level traits are assertable before any parser
        // flattening can hide them.
        expect(sourceDocument.paths?.['/widgets']?.get?.operationId).toBe('listWidgets');

        // The written output is the writer's document, a distinct artefact.
        expect(writtenDocument).not.toBe(sourceDocument);
        expect(writtenDocument.info.title).toBe('Fidelity Smoke API');
      },
    });

    expect(observedTitles).toEqual(['Fidelity Smoke API']);
    expect(proof.artifacts.sourceDocument.info.title).toBe('Fidelity Smoke API');
    expectFidelity(proof);
  });

  it('propagates a failing source assertion as a red proof', async () => {
    await expect(
      runFidelityProof(SMOKE_FIXTURE, {
        sourceAssertions: () => {
          throw new Error('source-level semantic expectation violated');
        },
      }),
    ).rejects.toThrow('source-level semantic expectation violated');
  });
});
