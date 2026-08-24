import assert from 'node:assert';

import { describe, expect, it } from 'vitest';

import { writeSecurityRequirements } from './openapi-writer.security.js';

describe('writeSecurityRequirements', () => {
  it('writes an AND-group as one requirement object with members in IR order', () => {
    const written = writeSecurityRequirements([
      {
        schemes: [
          { schemeName: 'betaAuth', scopes: [] },
          { schemeName: 'alphaAuth', scopes: ['read'] },
        ],
      },
    ]);

    expect(written).toStrictEqual([{ betaAuth: [], alphaAuth: ['read'] }]);
    const [andGroup] = written;
    assert(andGroup !== undefined, 'expected exactly one written requirement object');
    expect(Object.keys(andGroup)).toStrictEqual(['betaAuth', 'alphaAuth']);
  });

  it('writes OR alternatives in IR order without merging or deduplication', () => {
    const written = writeSecurityRequirements([
      { schemes: [{ schemeName: 'betaAuth', scopes: [] }] },
      { schemes: [{ schemeName: 'alphaAuth', scopes: [] }] },
      { schemes: [{ schemeName: 'alphaAuth', scopes: [] }] },
    ]);

    expect(written).toStrictEqual([{ betaAuth: [] }, { alphaAuth: [] }, { alphaAuth: [] }]);
  });

  it('writes the empty requirement as {} instead of dropping it', () => {
    const written = writeSecurityRequirements([
      { schemes: [] },
      { schemes: [{ schemeName: 'alphaAuth', scopes: [] }] },
    ]);

    expect(written).toStrictEqual([{}, { alphaAuth: [] }]);
  });

  it('writes a scheme legally named __proto__ as an own key, never as a prototype', () => {
    const written = writeSecurityRequirements([
      { schemes: [{ schemeName: '__proto__', scopes: ['read'] }] },
    ]);

    const [requirement] = written;
    assert(requirement !== undefined, 'expected exactly one written requirement object');
    expect(Object.hasOwn(requirement, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(requirement)).toBe(Object.prototype);
    expect(Object.keys(requirement)).toStrictEqual(['__proto__']);
  });

  it('throws when one group names the same scheme twice', () => {
    expect(() =>
      writeSecurityRequirements([
        {
          schemes: [
            { schemeName: 'alphaAuth', scopes: ['read'] },
            { schemeName: 'alphaAuth', scopes: ['write'] },
          ],
        },
      ]),
    ).toThrow(/names scheme "alphaAuth" more than once/);
  });
});
