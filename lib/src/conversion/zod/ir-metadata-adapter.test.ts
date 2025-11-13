/**
 * Tests for IR Metadata Adapter
 *
 * Verifies adapter functions that extract CodeMetaData-equivalent information
 * from IRSchemaNode structures.
 *
 * @module ir-metadata-adapter.test
 */

import { describe, expect, test } from 'vitest';
import {
  getRequiredFromIR,
  getNullableFromIR,
  getPresenceChainFromIR,
  getCircularReferencesFromIR,
} from './ir-metadata-adapter.js';
import type { IRSchemaNode } from '../../context/ir-schema.js';

/**
 * Helper to create minimal IRSchemaNode for testing
 */
function createMinimalIRNode(overrides: Partial<IRSchemaNode> = {}): IRSchemaNode {
  return {
    required: false,
    nullable: false,
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    zodChain: {
      presence: '',
      validations: [],
      defaults: [],
    },
    circularReferences: [],
    ...overrides,
  };
}

describe('getRequiredFromIR', () => {
  test('should return true when schema is required', () => {
    const node = createMinimalIRNode({ required: true });

    const result = getRequiredFromIR(node);

    expect(result).toBe(true);
  });

  test('should return false when schema is not required', () => {
    const node = createMinimalIRNode({ required: false });

    const result = getRequiredFromIR(node);

    expect(result).toBe(false);
  });

  test('should handle required in combination with nullable', () => {
    const node = createMinimalIRNode({ required: true, nullable: true });

    const result = getRequiredFromIR(node);

    // Required status is independent of nullable
    expect(result).toBe(true);
  });
});

describe('getNullableFromIR', () => {
  test('should return true when schema is nullable', () => {
    const node = createMinimalIRNode({ nullable: true });

    const result = getNullableFromIR(node);

    expect(result).toBe(true);
  });

  test('should return false when schema is not nullable', () => {
    const node = createMinimalIRNode({ nullable: false });

    const result = getNullableFromIR(node);

    expect(result).toBe(false);
  });

  test('should handle nullable in combination with required', () => {
    const node = createMinimalIRNode({ required: true, nullable: true });

    const result = getNullableFromIR(node);

    // Nullable status is independent of required
    expect(result).toBe(true);
  });
});

describe('getPresenceChainFromIR', () => {
  test('should return nullish() for optional nullable schema', () => {
    const node = createMinimalIRNode({
      required: false,
      nullable: true,
    });

    const result = getPresenceChainFromIR(node);

    expect(result).toBe('nullish()');
  });

  test('should return nullable() for required nullable schema', () => {
    const node = createMinimalIRNode({
      required: true,
      nullable: true,
    });

    const result = getPresenceChainFromIR(node);

    expect(result).toBe('nullable()');
  });

  test('should return optional() for optional non-nullable schema', () => {
    const node = createMinimalIRNode({
      required: false,
      nullable: false,
    });

    const result = getPresenceChainFromIR(node);

    expect(result).toBe('optional()');
  });

  test('should return empty string for required non-nullable schema', () => {
    const node = createMinimalIRNode({
      required: true,
      nullable: false,
    });

    const result = getPresenceChainFromIR(node);

    expect(result).toBe('');
  });

  test('should match existing Zod chain logic', () => {
    // Test all 4 combinations to ensure parity with getZodChainablePresence
    const cases = [
      { required: true, nullable: true, expected: 'nullable()' },
      { required: true, nullable: false, expected: '' },
      { required: false, nullable: true, expected: 'nullish()' },
      { required: false, nullable: false, expected: 'optional()' },
    ];

    for (const { required, nullable, expected } of cases) {
      const node = createMinimalIRNode({ required, nullable });
      const result = getPresenceChainFromIR(node);
      expect(result).toBe(expected);
    }
  });
});

describe('getCircularReferencesFromIR', () => {
  test('should return empty array when no circular references', () => {
    const node = createMinimalIRNode({
      circularReferences: [],
    });

    const result = getCircularReferencesFromIR(node);

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  test('should return circular reference paths', () => {
    const node = createMinimalIRNode({
      circularReferences: ['#/components/schemas/Node', '#/components/schemas/Tree'],
    });

    const result = getCircularReferencesFromIR(node);

    expect(result).toEqual(['#/components/schemas/Node', '#/components/schemas/Tree']);
    expect(result.length).toBe(2);
  });

  test('should handle single circular reference', () => {
    const node = createMinimalIRNode({
      circularReferences: ['#/components/schemas/SelfReferencing'],
    });

    const result = getCircularReferencesFromIR(node);

    expect(result).toEqual(['#/components/schemas/SelfReferencing']);
    expect(result.length).toBe(1);
  });

  test('should not mutate original array', () => {
    const originalRefs = ['#/components/schemas/Node'];
    const node = createMinimalIRNode({
      circularReferences: originalRefs,
    });

    const result = getCircularReferencesFromIR(node);
    result.push('#/components/schemas/NewRef');

    // Original should be unchanged
    expect(originalRefs).toEqual(['#/components/schemas/Node']);
    expect(originalRefs.length).toBe(1);
  });
});

describe('integration tests', () => {
  test('should extract all metadata from complex node', () => {
    const node = createMinimalIRNode({
      required: true,
      nullable: true,
      circularReferences: ['#/components/schemas/User'],
      dependencyGraph: {
        references: ['#/components/schemas/Profile'],
        referencedBy: ['#/components/schemas/Company'],
        depth: 1,
      },
    });

    expect(getRequiredFromIR(node)).toBe(true);
    expect(getNullableFromIR(node)).toBe(true);
    expect(getPresenceChainFromIR(node)).toBe('nullable()');
    expect(getCircularReferencesFromIR(node)).toEqual(['#/components/schemas/User']);
  });

  test('should handle default/minimal node', () => {
    const node = createMinimalIRNode();

    expect(getRequiredFromIR(node)).toBe(false);
    expect(getNullableFromIR(node)).toBe(false);
    expect(getPresenceChainFromIR(node)).toBe('optional()');
    expect(getCircularReferencesFromIR(node)).toEqual([]);
  });

  test('should work with real IRSchemaNode structure', () => {
    // Simulate a more complete IRSchemaNode as would be produced by IR builder
    const node: IRSchemaNode = {
      required: false,
      nullable: true,
      dependencyGraph: {
        references: ['#/components/schemas/Address'],
        referencedBy: ['#/components/schemas/Company', '#/components/schemas/Team'],
        depth: 1,
      },
      zodChain: {
        presence: 'nullish()',
        validations: ['.min(1)'],
        defaults: ['.default("anonymous")'],
      },
      circularReferences: [],
    };

    expect(getRequiredFromIR(node)).toBe(false);
    expect(getNullableFromIR(node)).toBe(true);
    expect(getPresenceChainFromIR(node)).toBe('nullish()');
    expect(getCircularReferencesFromIR(node)).toEqual([]);
  });
});
