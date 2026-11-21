/**
 * Which cases hold samples that do not decide their construct.
 */

import { describe, it, expect } from 'vitest';

import { inertCases } from './inert.js';

const schema = { type: 'string', maxLength: 2 };

describe('inertCases', () => {
  it('passes a case with a sample its schema accepts and one it refuses', () => {
    expect(inertCases([{ rowId: 'decides', schema, samples: ['ab', 'abc'] }])).toEqual([]);
  });

  it('names a case whose every sample is accepted', () => {
    expect(inertCases([{ rowId: 'all accepted', schema, samples: ['a', 'ab'] }])).toEqual([
      'all accepted',
    ]);
  });

  it('names a case whose every sample is refused', () => {
    expect(inertCases([{ rowId: 'all refused', schema, samples: ['abc', 1] }])).toEqual([
      'all refused',
    ]);
  });

  it('names a case with no samples', () => {
    expect(inertCases([{ rowId: 'empty', schema, samples: [] }])).toEqual(['empty']);
  });

  it('does not count a case the reference validator cannot check', () => {
    expect(
      inertCases([
        { rowId: 'unchecked', schema: { type: 'string', format: 'iri' }, samples: ['a'] },
      ]),
    ).toEqual([]);
  });
});
