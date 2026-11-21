/**
 * Whether the keyword a case names is what decides its samples.
 */

import { describe, it, expect } from 'vitest';

import { casesTheirKeywordDoesNotDecide, namedKeywordOf, withoutKeyword } from './control.js';

describe('namedKeywordOf', () => {
  it('reads the keyword a row names', () => {
    expect(namedKeywordOf('keyword:minLength')).toBe('minLength');
    expect(namedKeywordOf('text:format: date')).toBe('format');
    expect(namedKeywordOf('type:integer')).toBe('type');
  });

  it('reads none from a row for a construct that is not a keyword', () => {
    expect(namedKeywordOf('text:`true` as a schema')).toBeUndefined();
  });
});

describe('withoutKeyword', () => {
  it('takes the keyword out wherever the schema uses it', () => {
    expect(
      withoutKeyword(
        {
          type: 'object',
          properties: { a: { type: 'string', minLength: 2 } },
          allOf: [{ minLength: 1 }],
        },
        'minLength',
      ),
    ).toEqual({ type: 'object', properties: { a: { type: 'string' } }, allOf: [{}] });
  });

  it('leaves a boolean schema as it is', () => {
    expect(withoutKeyword(true, 'minLength')).toBe(true);
  });
});

describe('casesTheirKeywordDoesNotDecide', () => {
  it('passes a case whose keyword decides a sample', () => {
    expect(
      casesTheirKeywordDoesNotDecide([
        {
          rowId: 'keyword:minLength',
          schema: { type: 'string', minLength: 2 },
          samples: ['ab', 'a'],
        },
      ]),
    ).toEqual([]);
  });

  it('names a case whose schema does not use the keyword it names', () => {
    expect(
      casesTheirKeywordDoesNotDecide([
        {
          rowId: 'keyword:minLength',
          schema: { type: 'string', maxLength: 2 },
          samples: ['ab', 'abc'],
        },
      ]),
    ).toEqual(['keyword:minLength']);
  });

  it('names a case whose samples another keyword decides', () => {
    expect(
      casesTheirKeywordDoesNotDecide([
        {
          rowId: 'keyword:minLength',
          schema: { type: 'string', minLength: 1, maxLength: 2 },
          samples: ['ab', 'abc'],
        },
      ]),
    ).toEqual(['keyword:minLength']);
  });

  it('does not count a case that names no keyword', () => {
    expect(
      casesTheirKeywordDoesNotDecide([
        { rowId: 'text:`true` as a schema', schema: true, samples: [1] },
      ]),
    ).toEqual([]);
  });
});
