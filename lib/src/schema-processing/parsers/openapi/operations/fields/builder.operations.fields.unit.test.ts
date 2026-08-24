import { describe, expect, it } from 'vitest';

import type { SecurityRequirementObject } from '../../../../../shared/openapi-types.js';
import { buildIRSecurity } from './builder.operations.fields.js';

describe('buildIRSecurity', () => {
  it('preserves an AND-group as one requirement with all its schemes in authored order', () => {
    const ir = buildIRSecurity([{ betaAuth: [], alphaAuth: ['read'] }]);

    expect(ir).toStrictEqual([
      {
        schemes: [
          { schemeName: 'betaAuth', scopes: [] },
          { schemeName: 'alphaAuth', scopes: ['read'] },
        ],
      },
    ]);
  });

  it('preserves OR alternatives as separate requirements in authored order', () => {
    const ir = buildIRSecurity([{ betaAuth: [] }, { alphaAuth: [] }]);

    expect(ir).toStrictEqual([
      { schemes: [{ schemeName: 'betaAuth', scopes: [] }] },
      { schemes: [{ schemeName: 'alphaAuth', scopes: [] }] },
    ]);
  });

  it('preserves the empty requirement ({}) as a requirement with no schemes', () => {
    const ir = buildIRSecurity([{}, { alphaAuth: [] }]);

    expect(ir).toStrictEqual([
      { schemes: [] },
      { schemes: [{ schemeName: 'alphaAuth', scopes: [] }] },
    ]);
  });

  it('preserves duplicate alternatives without merging or deduplication', () => {
    const ir = buildIRSecurity([{ alphaAuth: [] }, { alphaAuth: [] }]);

    expect(ir).toStrictEqual([
      { schemes: [{ schemeName: 'alphaAuth', scopes: [] }] },
      { schemes: [{ schemeName: 'alphaAuth', scopes: [] }] },
    ]);
  });

  it('carries scope lists verbatim, order included', () => {
    const ir = buildIRSecurity([{ alphaAuth: ['write:items', 'read:items'] }]);

    expect(ir).toStrictEqual([
      { schemes: [{ schemeName: 'alphaAuth', scopes: ['write:items', 'read:items'] }] },
    ]);
  });

  it('throws when a scheme maps to a non-array scope value', () => {
    // The type system correctly forbids this shape, so the malformed value is
    // produced the same way a real one would arrive: parsed from a document
    // (YAML `alphaAuth:` with no value parses to null).
    const malformed: SecurityRequirementObject[] = JSON.parse('[{ "alphaAuth": null }]');

    expect(() => buildIRSecurity(malformed)).toThrow(
      /Security requirement scheme "alphaAuth" must map to an array of scope strings/,
    );
  });

  it('throws when a scope list carries a non-string member', () => {
    // Same boundary-violation modelling as above: a scope list of numbers.
    const malformed: SecurityRequirementObject[] = JSON.parse('[{ "alphaAuth": [42] }]');

    expect(() => buildIRSecurity(malformed)).toThrow(
      /Security requirement scheme "alphaAuth" must map to an array of scope strings/,
    );
  });
});
