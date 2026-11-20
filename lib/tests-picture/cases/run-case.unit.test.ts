/**
 * How one case becomes one cell, with Castr replaced by a simple stand-in.
 */

import { describe, it, expect } from 'vitest';

import { runCase, type Convert } from './run-case.js';
import type { SchemaCase } from './schema-case.js';

const maxLength: SchemaCase = {
  rowId: 'keyword:maxLength',
  schema: { type: 'string', maxLength: 2 },
  samples: ['ab', 'abc'],
};

function converting(accepts: (value: unknown) => boolean): Convert {
  return () => Promise.resolve({ kind: 'validator', accepts });
}

describe('runCase', () => {
  it('is right where Castr decides every sample as the reference does', async () => {
    const cell = await runCase(
      maxLength,
      converting((value) => typeof value === 'string' && value.length <= 2),
    );

    expect(cell).toEqual({ verdict: 'right', detail: '' });
  });

  it('is wrong where Castr ignores the construct', async () => {
    const cell = await runCase(
      maxLength,
      converting((value) => typeof value === 'string'),
    );

    expect(cell).toEqual({
      verdict: 'wrong',
      detail: '"abc": the source says invalid, Castr says valid',
    });
  });

  it('gives Castr the whole document that holds the case', async () => {
    const seen: unknown[] = [];
    await runCase(maxLength, (document) => {
      seen.push(document['openapi'], document['components']);
      return Promise.resolve({ kind: 'no validator' });
    });

    expect(seen).toEqual(['3.1.0', { schemas: { T: { type: 'string', maxLength: 2 } } }]);
  });

  it('is refused where Castr raises an error of its own', async () => {
    const cell = await runCase(maxLength, () => Promise.reject(new Error('Cannot proceed.')));

    expect(cell).toEqual({ verdict: 'refused', detail: 'Cannot proceed.' });
  });

  it('is crashed where Castr fails with a fault of the runtime', async () => {
    const cell = await runCase(maxLength, () => Promise.reject(new TypeError('x is undefined')));

    expect(cell).toEqual({ verdict: 'crashed', detail: 'x is undefined' });
  });

  it('is crashed where the output Castr emitted does not load', async () => {
    const cell = await runCase(maxLength, () =>
      Promise.resolve({ kind: 'output does not load', reason: 'Transform failed' }),
    );

    expect(cell).toEqual({
      verdict: 'crashed',
      detail: "Castr's output does not load: Transform failed",
    });
  });

  it('is missing where Castr emitted no validator for the shape', async () => {
    const cell = await runCase(maxLength, () => Promise.resolve({ kind: 'no validator' }));

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
        return Promise.resolve({ kind: 'no validator' });
      },
    );

    expect(cell.verdict).toBe('not judged');
    expect(ran).toBe(false);
  });
});
