/**
 * Tests for CLI option parsing (L19).
 *
 * A value the user explicitly set but mistyped must never be silently
 * dropped: "not provided" yields `undefined`, "provided-but-invalid" throws
 * an actionable error listing the allowed values.
 */

import { describe, expect, it } from 'vitest';
import { parseCliOptions } from './helpers.js';

describe('parseCliOptions', () => {
  it('returns undefined for options that were not provided', () => {
    const parsed = parseCliOptions({});

    expect(parsed).toEqual({
      groupStrategy: undefined,
      complexityThreshold: undefined,
      defaultStatusBehavior: undefined,
    });
  });

  it('passes valid values through', () => {
    const parsed = parseCliOptions({
      groupStrategy: 'tag-file',
      complexityThreshold: '5',
      defaultStatus: 'auto-correct',
    });

    expect(parsed).toEqual({
      groupStrategy: 'tag-file',
      complexityThreshold: 5,
      defaultStatusBehavior: 'auto-correct',
    });
  });

  it('throws an actionable error for an invalid --group-strategy value', () => {
    expect(() => parseCliOptions({ groupStrategy: 'bogus' })).toThrow(
      /--group-strategy.*'bogus'.*none, tag, method, tag-file, method-file/,
    );
  });

  it('throws an actionable error for an invalid --default-status value', () => {
    expect(() => parseCliOptions({ defaultStatus: 'bogus' })).toThrow(
      /--default-status.*'bogus'.*spec-compliant, auto-correct/,
    );
  });

  it('throws an actionable error for a non-numeric --complexity-threshold value', () => {
    expect(() => parseCliOptions({ complexityThreshold: 'abc' })).toThrow(
      /--complexity-threshold.*'abc'.*non-negative integer/,
    );
  });

  it('throws an actionable error for a non-integer --complexity-threshold value', () => {
    expect(() => parseCliOptions({ complexityThreshold: '5.5' })).toThrow(
      /--complexity-threshold.*'5\.5'.*non-negative integer/,
    );
  });
});
