import { describe, expect, it } from 'vitest';

import { errnoCodeOf } from './errno.js';

describe('errnoCodeOf', () => {
  it('returns the code of an errno-carrying error', () => {
    expect(errnoCodeOf(Object.assign(new Error('denied'), { code: 'EACCES' }))).toBe('EACCES');
  });

  it('returns nothing for an error without a code', () => {
    expect(errnoCodeOf(new Error('plain'))).toBeUndefined();
  });

  it('returns nothing for a code that is not a string', () => {
    expect(errnoCodeOf({ code: 13 })).toBeUndefined();
  });

  it('returns nothing for a value that is not an object', () => {
    expect(errnoCodeOf('EACCES')).toBeUndefined();
    expect(errnoCodeOf(null)).toBeUndefined();
  });
});
