/**
 * How two validators' decisions become one cell of the picture.
 */

import { describe, it, expect } from 'vitest';

import { cellForThrown, judge, judgeAdmits, onOneLine } from './verdict.js';

describe('judge', () => {
  it('is right where the two validators decide every sample alike', () => {
    expect(
      judge([
        { sample: 'a', reference: true, castr: true },
        { sample: 1, reference: false, castr: false },
      ]),
    ).toEqual({ verdict: 'right', detail: '' });
  });

  it('is wrong where they decide one sample differently, and names every such sample', () => {
    expect(
      judge([
        { sample: 'a', reference: true, castr: true },
        { sample: [1, 1], reference: false, castr: true },
        { sample: { a: 1 }, reference: true, castr: false },
      ]),
    ).toEqual({
      verdict: 'wrong',
      detail:
        '[1,1]: the source says invalid, Castr says valid; ' +
        '{"a":1}: the source says valid, Castr says invalid',
    });
  });
});

describe('judgeAdmits', () => {
  it('is right where the type admits every sample the source accepts, and more besides', () => {
    expect(
      judgeAdmits([
        { sample: 'ab', reference: true, castr: true },
        { sample: 'abc', reference: false, castr: true },
        { sample: 1, reference: false, castr: false },
      ]),
    ).toEqual({ verdict: 'right', detail: '' });
  });

  it('is wrong where the type refuses a sample the source accepts, and names it', () => {
    expect(judgeAdmits([{ sample: 1, reference: true, castr: false }])).toEqual({
      verdict: 'wrong',
      detail: "1: the source says valid, Castr's type refuses it",
    });
  });
});

describe('cellForThrown', () => {
  it('reads an error Castr raised as a refusal, with its whole message on one line', () => {
    expect(cellForThrown(new Error('Invalid document:\n\n  Issue: no target'))).toEqual({
      verdict: 'refused',
      detail: 'Invalid document: Issue: no target',
    });
  });

  it.each([
    new TypeError('x is not a function'),
    new RangeError('too deep'),
    new ReferenceError('y'),
  ])('reads a fault of the runtime as a crash: %s', (fault) => {
    expect(cellForThrown(fault).verdict).toBe('crashed');
  });

  it('reads a thrown value that is not an error as a crash', () => {
    expect(cellForThrown('boom')).toEqual({
      verdict: 'crashed',
      detail: 'threw a value that is not an error: boom',
    });
  });
});

describe('onOneLine', () => {
  it('joins the lines of a message, without the blank ones or their indentation', () => {
    expect(onOneLine('one\n\n  two\n')).toBe('one two');
    expect(onOneLine('')).toBe('');
  });
});
