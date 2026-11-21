/**
 * How one case becomes one cell: the real reference validator, with Castr replaced by a
 * simple stand-in passed as an argument. No file is read or written.
 */

import { describe, it, expect } from 'vitest';

import { runCase, type Convert } from './run-case.js';
import type { SchemaCase } from './schema-case.js';

const maxLength: SchemaCase = {
  rowId: 'keyword:maxLength',
  schema: { type: 'string', maxLength: 2 },
  samples: ['ab', 'abc'],
};

const accepted: SchemaCase = { ...maxLength, samples: ['a', 'ab'] };

/** A stand-in for Castr that emits a validator accepting every value. */
const acceptingEverything: Convert = () =>
  Promise.resolve({ kind: 'decides', accepts: () => true });

describe('runCase', () => {
  it('is right where Castr decides every sample as the reference does', async () => {
    const cell = await runCase(accepted, acceptingEverything);

    expect(cell).toEqual({ verdict: 'right', detail: '' });
  });

  it('is wrong where Castr ignores the construct', async () => {
    const cell = await runCase(maxLength, acceptingEverything);

    expect(cell).toEqual({
      verdict: 'wrong',
      detail: '"abc": the source says invalid, Castr says valid',
    });
  });

  it('gives Castr the whole document that holds the case', async () => {
    const seen: unknown[] = [];
    await runCase(maxLength, (document) => {
      seen.push(document['openapi'], document['components']);
      return Promise.resolve({ kind: 'nothing emitted' });
    });

    expect(seen).toEqual(['3.1.0', { schemas: { T: { type: 'string', maxLength: 2 } } }]);
  });

  it('is refused where Castr raises an error of its own', async () => {
    const cell = await runCase(maxLength, () =>
      Promise.resolve({ kind: 'threw', thrown: new Error('Cannot proceed.') }),
    );

    expect(cell).toEqual({ verdict: 'refused', detail: 'Cannot proceed.' });
  });

  it('is crashed where Castr fails with a fault of the runtime', async () => {
    const cell = await runCase(maxLength, () =>
      Promise.resolve({ kind: 'threw', thrown: new TypeError('x is undefined') }),
    );

    expect(cell).toEqual({ verdict: 'crashed', detail: 'x is undefined' });
  });

  it('is crashed where the output Castr emitted does not load', async () => {
    const cell = await runCase(maxLength, () =>
      Promise.resolve({ kind: 'output unusable', reason: 'does not load: Transform failed' }),
    );

    expect(cell).toEqual({
      verdict: 'crashed',
      detail: "Castr's output does not load: Transform failed",
    });
  });

  it('is crashed where the validator Castr emitted throws on a sample', async () => {
    const cell = await runCase(maxLength, () =>
      Promise.resolve({
        kind: 'decides',
        accepts: () => {
          throw new TypeError('x is not a function');
        },
      }),
    );

    expect(cell).toEqual({
      verdict: 'crashed',
      detail: `Castr's validator threw on "ab": x is not a function`,
    });
  });

  it('rejects, and gives no cell, where the harness itself fails', async () => {
    await expect(
      runCase(maxLength, () => Promise.reject(new Error('ENOSPC: no space left on device'))),
    ).rejects.toThrow('ENOSPC');
  });

  it('is missing where Castr emitted no validator for the shape', async () => {
    const cell = await runCase(maxLength, () => Promise.resolve({ kind: 'nothing emitted' }));

    expect(cell).toEqual({
      verdict: 'missing',
      detail: 'Castr emitted no validator for the shape',
    });
  });

  it('is not judged, and Castr is not run, where the reference cannot check the case', async () => {
    let ran = false;
    const cell = await runCase(
      { rowId: 'text:format: iri', schema: { type: 'string', format: 'iri' }, samples: ['a'] },
      () => {
        ran = true;
        return Promise.resolve({ kind: 'nothing emitted' });
      },
    );

    expect(cell.verdict).toBe('not judged');
    expect(ran).toBe(false);
  });

  it('gives the convert the samples, and judges by the reading it is given', async () => {
    const seen: unknown[] = [];
    const cell = await runCase(
      maxLength,
      (_document, samples) => {
        seen.push(...samples);
        return Promise.resolve({ kind: 'nothing emitted' });
      },
      { emits: 'type', judge: () => ({ verdict: 'right', detail: '' }) },
    );

    expect(seen).toEqual(['ab', 'abc']);
    expect(cell).toEqual({ verdict: 'missing', detail: 'Castr emitted no type for the shape' });
  });

  it('gives the decisions to the judge of the reading', async () => {
    const cell = await runCase(maxLength, acceptingEverything, {
      emits: 'type',
      judge: (decisions) => ({ verdict: 'wrong', detail: JSON.stringify(decisions) }),
    });

    expect(cell.detail).toBe(
      '[{"sample":"ab","reference":true,"castr":true},{"sample":"abc","reference":false,"castr":true}]',
    );
  });
});
