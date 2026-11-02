import { describe, expect, it } from 'vitest';

import { isSha256Hex, sha256HexSchema } from './sha256-hex.js';

/** The SHA-256 of the empty string, from FIPS 180-4's published test vectors. */
const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

describe('isSha256Hex', () => {
  it('accepts 64 lower-case hexadecimal characters', () => {
    expect(isSha256Hex(EMPTY_SHA256)).toBe(true);
  });

  it.each([
    ['63 characters', EMPTY_SHA256.slice(1)],
    ['62 characters, an even length that still decodes', EMPTY_SHA256.slice(2)],
    ['66 characters', `${EMPTY_SHA256}00`],
    ['upper case', EMPTY_SHA256.toUpperCase()],
    ['a non-hexadecimal character', `${EMPTY_SHA256.slice(1)}g`],
    ['surrounding space', ` ${EMPTY_SHA256.slice(1)}`],
    ['the empty string', ''],
  ])('rejects %s', (_case, value) => {
    expect(isSha256Hex(value)).toBe(false);
  });
});

describe('sha256HexSchema', () => {
  it('parses a digest and refuses anything else', () => {
    expect(sha256HexSchema.safeParse(EMPTY_SHA256).success).toBe(true);
    expect(sha256HexSchema.safeParse(EMPTY_SHA256.toUpperCase()).success).toBe(false);
  });
});
