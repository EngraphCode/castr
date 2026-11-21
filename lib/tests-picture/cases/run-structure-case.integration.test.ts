/**
 * How one structure case becomes one cell, with Castr replaced by simple stand-ins passed
 * as arguments. No file is read or written.
 */

import { describe, it, expect } from 'vitest';

import { projectionOf } from './projection.js';
import {
  runStructureCase,
  type ConvertEndpoints,
  type ConvertedEndpoints,
} from './run-structure-case.js';
import type { StructureCase } from './structure-case.js';

const summary: StructureCase = {
  rowId: 'operation.summary',
  document: { paths: { '/things': { get: { summary: 'kestrel' } } } },
  control: { paths: { '/things': { get: {} } } },
  expects: { kind: 'value', value: 'kestrel' },
};

const deprecated: StructureCase = {
  rowId: 'operation.deprecated',
  document: { paths: { '/things': { get: { deprecated: true } } } },
  control: { paths: { '/things': { get: {} } } },
  expects: { kind: 'difference' },
};

/** A stand-in for Castr whose endpoint definitions are the document's own paths. */
const keepingEverything: ConvertEndpoints = (document) =>
  Promise.resolve({ kind: 'endpoints', projection: projectionOf(document['paths']) });

/** A stand-in for Castr whose endpoint definitions are the same for every document. */
const droppingEverything: ConvertEndpoints = () =>
  Promise.resolve({ kind: 'endpoints', projection: [{ method: 'get', path: '/things' }] });

/** A stand-in that answers the case's document with one result and its control with another. */
function answering(
  { document, control }: StructureCase,
  forDocument: ConvertedEndpoints,
  forControl: ConvertedEndpoints,
): ConvertEndpoints {
  const answers = new Map([
    [document, forDocument],
    [control, forControl],
  ]);
  return (given) => Promise.resolve(answers.get(given) ?? { kind: 'nothing emitted' });
}

const withTheValue: ConvertedEndpoints = { kind: 'endpoints', projection: ['kestrel'] };

describe('runStructureCase', () => {
  it('is right where the definitions hold the value with the construct and not without', async () => {
    expect(await runStructureCase(summary, keepingEverything)).toEqual({
      verdict: 'right',
      detail: '',
    });
  });

  it('is missing where the definitions are the same without the construct', async () => {
    expect(await runStructureCase(summary, droppingEverything)).toEqual({
      verdict: 'missing',
      detail: 'the endpoint definitions are the same without it',
    });
  });

  it('is wrong where the definitions change and do not hold the value', async () => {
    const cell = await runStructureCase(
      summary,
      answering(
        summary,
        { kind: 'endpoints', projection: ['k'] },
        { kind: 'endpoints', projection: [] },
      ),
    );

    expect(cell).toEqual({
      verdict: 'wrong',
      detail: 'the endpoint definitions change with the construct and do not hold "kestrel"',
    });
  });

  it('is not judged where the definitions hold the value without the construct', async () => {
    const cell = await runStructureCase(summary, answering(summary, withTheValue, withTheValue));

    expect(cell.verdict).toBe('not judged');
  });

  it('asks only for a difference where the construct states no value to find', async () => {
    expect((await runStructureCase(deprecated, keepingEverything)).verdict).toBe('right');
    expect((await runStructureCase(deprecated, droppingEverything)).verdict).toBe('missing');
  });

  it('is refused where Castr raises an error of its own for the document', async () => {
    const cell = await runStructureCase(summary, () =>
      Promise.resolve({ kind: 'threw', thrown: new Error('Cannot proceed.') }),
    );

    expect(cell).toEqual({ verdict: 'refused', detail: 'Cannot proceed.' });
  });

  it('is crashed where the module Castr emitted cannot be used', async () => {
    const cell = await runStructureCase(summary, () =>
      Promise.resolve({ kind: 'output unusable', reason: 'does not load: Transform failed' }),
    );

    expect(cell).toEqual({
      verdict: 'crashed',
      detail: "Castr's output does not load: Transform failed",
    });
  });

  it('is missing where Castr emitted no endpoint definitions', async () => {
    const cell = await runStructureCase(summary, () =>
      Promise.resolve({ kind: 'nothing emitted' }),
    );

    expect(cell).toEqual({ verdict: 'missing', detail: 'Castr emitted no endpoint definitions' });
  });

  it('is not judged where the control cannot be converted', async () => {
    const cell = await runStructureCase(
      summary,
      answering(summary, withTheValue, {
        kind: 'threw',
        thrown: new Error('Cannot proceed.'),
      }),
    );

    expect(cell).toEqual({
      verdict: 'not judged',
      detail: 'the control was refused: Cannot proceed.',
    });
  });
});
