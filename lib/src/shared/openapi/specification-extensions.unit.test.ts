import { describe, expect, test } from 'vitest';

import { isSpecificationExtensionKey } from './specification-extensions.js';

describe('isSpecificationExtensionKey', () => {
  test('recognises x- prefixed keys as specification extensions', () => {
    expect(isSpecificationExtensionKey('x-codegen')).toBe(true);
    expect(isSpecificationExtensionKey('x-internal')).toBe(true);
    expect(isSpecificationExtensionKey('x-')).toBe(true);
  });

  test('rejects uppercase X- keys (extension field names are case-sensitive)', () => {
    expect(isSpecificationExtensionKey('X-Rate-Limit')).toBe(false);
    expect(isSpecificationExtensionKey('X-codegen')).toBe(false);
  });

  test('rejects ordinary Responses Object and Paths Object keys', () => {
    expect(isSpecificationExtensionKey('200')).toBe(false);
    expect(isSpecificationExtensionKey('2XX')).toBe(false);
    expect(isSpecificationExtensionKey('default')).toBe(false);
    expect(isSpecificationExtensionKey('/users')).toBe(false);
    expect(isSpecificationExtensionKey('')).toBe(false);
  });

  test('rejects keys that contain but do not begin with x-', () => {
    expect(isSpecificationExtensionKey('application/x-www-form-urlencoded')).toBe(false);
  });
});
