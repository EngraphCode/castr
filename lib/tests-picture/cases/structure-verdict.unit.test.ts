/**
 * How what Castr made of a document and of its control becomes one cell.
 */

import { describe, it, expect } from 'vitest';

import type { Expectation } from './structure-case.js';
import { judgeStructure, type ConvertedEndpoints } from './structure-verdict.js';

const KESTREL: Expectation = { kind: 'value', value: 'kestrel' };
const DIFFERENCE: Expectation = { kind: 'difference' };

const plain: ConvertedEndpoints = { kind: 'endpoints', projection: [{ method: 'get' }] };
const withTheValue: ConvertedEndpoints = {
  kind: 'endpoints',
  projection: [{ method: 'get', summary: 'kestrel' }],
};
const changed: ConvertedEndpoints = {
  kind: 'endpoints',
  projection: [{ method: 'get', summary: 'k' }],
};
const refused: ConvertedEndpoints = { kind: 'threw', thrown: new Error('Cannot proceed.') };

describe('judgeStructure', () => {
  it('is right where the definitions hold the value with the construct and not without', () => {
    expect(judgeStructure(KESTREL, withTheValue, plain)).toEqual({ verdict: 'right', detail: '' });
  });

  it('is missing where the definitions are the same without the construct', () => {
    expect(judgeStructure(KESTREL, plain, plain)).toEqual({
      verdict: 'missing',
      detail: 'the endpoint definitions are the same without it',
    });
  });

  it('is wrong where the definitions change and do not hold the value', () => {
    expect(judgeStructure(KESTREL, changed, plain)).toEqual({
      verdict: 'wrong',
      detail: 'the endpoint definitions change with the construct and do not hold "kestrel"',
    });
  });

  it('is not judged where the definitions hold the value without the construct', () => {
    expect(judgeStructure(KESTREL, withTheValue, withTheValue)).toEqual({
      verdict: 'not judged',
      detail:
        'the endpoint definitions hold "kestrel" without the construct, so the case decides nothing',
    });
  });

  it('asks only for a difference where the construct states no value to find', () => {
    expect(judgeStructure(DIFFERENCE, changed, plain).verdict).toBe('right');
    expect(judgeStructure(DIFFERENCE, plain, plain).verdict).toBe('missing');
  });

  it('is refused where Castr raises an error of its own for the document', () => {
    expect(judgeStructure(KESTREL, refused, plain)).toEqual({
      verdict: 'refused',
      detail: 'Cannot proceed.',
    });
  });

  it('is crashed where the module Castr emitted cannot be used', () => {
    expect(
      judgeStructure(
        KESTREL,
        { kind: 'output unusable', reason: 'does not load: Transform failed' },
        plain,
      ),
    ).toEqual({ verdict: 'crashed', detail: "Castr's output does not load: Transform failed" });
  });

  it('is missing where Castr emitted no endpoint definitions', () => {
    expect(judgeStructure(KESTREL, { kind: 'nothing emitted' }, plain)).toEqual({
      verdict: 'missing',
      detail: 'Castr emitted no endpoint definitions',
    });
  });

  it('is not judged where the control cannot be converted', () => {
    expect(judgeStructure(KESTREL, withTheValue, refused)).toEqual({
      verdict: 'not judged',
      detail: 'the control was refused: Cannot proceed.',
    });
  });
});
