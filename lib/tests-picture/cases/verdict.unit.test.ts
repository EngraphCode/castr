/**
 * How two validators' decisions become one cell of the picture.
 */

import { describe, it, expect } from 'vitest';

import { cellForThrown, firstLine, judge } from './verdict.js';

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

describe('cellForThrown', () => {
  it('reads an error Castr raised as a refusal, in its own first line', () => {
    expect(cellForThrown(new Error('Unsupported string format "regex".\n  at somewhere'))).toEqual({
      verdict: 'refused',
      detail: 'Unsupported string format "regex".',
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

describe('firstLine', () => {
  it('keeps the part of a message before its first line break', () => {
    expect(firstLine('one\ntwo')).toBe('one');
    expect(firstLine('')).toBe('');
  });
});
