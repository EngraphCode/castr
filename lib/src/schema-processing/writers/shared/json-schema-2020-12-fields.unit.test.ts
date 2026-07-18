/**
 * Unit tests for the JSON Schema 2020-12 extension field writers.
 *
 * Covers the conditional-branch reachability predicates shared between the
 * capability preflight rule and the writers (guard/writer coherence).
 */

import { describe, expect, it } from 'vitest';

import type { CastrSchema } from '../../ir/index.js';
import { createMockCastrSchema } from '../../ir/index.js';
import {
  isElseBranchStaticallyUnreachable,
  isThenBranchStaticallyUnreachable,
} from './json-schema-2020-12-fields.js';

function createBooleanIfParent(booleanSchema: boolean): CastrSchema {
  return createMockCastrSchema({
    if: createMockCastrSchema({ booleanSchema }),
  });
}

describe('conditional branch reachability predicates', () => {
  it('treats then and else as unreachable when if is absent (2020-12 ignores them)', () => {
    const schema = createMockCastrSchema();

    expect(isThenBranchStaticallyUnreachable(schema)).toBe(true);
    expect(isElseBranchStaticallyUnreachable(schema)).toBe(true);
  });

  it('treats then as unreachable and else as reachable for if: false', () => {
    const schema = createBooleanIfParent(false);

    expect(isThenBranchStaticallyUnreachable(schema)).toBe(true);
    expect(isElseBranchStaticallyUnreachable(schema)).toBe(false);
  });

  it('treats else as unreachable and then as reachable for if: true', () => {
    const schema = createBooleanIfParent(true);

    expect(isThenBranchStaticallyUnreachable(schema)).toBe(false);
    expect(isElseBranchStaticallyUnreachable(schema)).toBe(true);
  });

  it('keeps both branches reachable for an object-form if', () => {
    const schema = createMockCastrSchema({
      if: createMockCastrSchema({ type: 'string' }),
    });

    expect(isThenBranchStaticallyUnreachable(schema)).toBe(false);
    expect(isElseBranchStaticallyUnreachable(schema)).toBe(false);
  });

  it('keeps both branches reachable for a $ref if (outcome not statically known)', () => {
    const schema = createMockCastrSchema({
      if: createMockCastrSchema({ $ref: '#/$defs/Gate' }),
    });

    expect(isThenBranchStaticallyUnreachable(schema)).toBe(false);
    expect(isElseBranchStaticallyUnreachable(schema)).toBe(false);
  });
});
