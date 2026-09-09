import { expect, it } from 'vitest';
import { compareAdapters } from './checker.js';

it('reports stale, missing and surplus generated adapters independently', () => {
  expect(
    compareAdapters(
      [
        { target: 'correct.md', content: 'correct' },
        { target: 'stale.md', content: 'new' },
        { target: 'missing.md', content: 'required' },
      ],
      new Map([
        ['correct.md', 'correct'],
        ['stale.md', 'old'],
        ['surplus.md', 'obsolete'],
      ]),
    ),
  ).toEqual({
    drifted: ['stale.md'],
    missing: ['missing.md'],
    unexpected: ['surplus.md'],
  });
});

it('accepts an exact generated estate', () => {
  expect(compareAdapters([{ target: 'a.md', content: 'a' }], new Map([['a.md', 'a']]))).toEqual({
    drifted: [],
    missing: [],
    unexpected: [],
  });
});
