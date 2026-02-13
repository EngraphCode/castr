/**
 * IR Schema Context Type Guard Tests
 *
 * Tests that CastrSchemaContext discriminated unions properly narrow types.
 * Uses mock factories from ir-test-helpers to create type-safe test data.
 *
 * @module
 */
import { describe, test, expect } from 'vitest';
import type { CastrSchemaContext } from './context.js';
import { createMockCastrSchema, createMockCastrSchemaNode } from './test-helpers.js';

describe('CastrSchemaContext type guards', () => {
  test('isComponentContext narrows to component', () => {
    const context: CastrSchemaContext = {
      contextType: 'component',
      name: 'User',
      schema: createMockCastrSchema(),
      metadata: createMockCastrSchemaNode(),
    };

    if (context.contextType === 'component') {
      // TypeScript should know: context.name exists
      expect(context.name).toBe('User');
      // TypeScript should know: context.optional does NOT exist
      // @ts-expect-error - optional doesn't exist on component context
      expect(context.optional).toBeUndefined();
    }
  });

  test('isPropertyContext narrows to property', () => {
    const context: CastrSchemaContext = {
      contextType: 'property',
      name: 'email',
      schema: createMockCastrSchema(),
      optional: true,
    };

    if (context.contextType === 'property') {
      // TypeScript should know: context.optional exists
      expect(context.optional).toBe(true);
    }
  });

  test('isCompositionMemberContext narrows to compositionMember', () => {
    const context: CastrSchemaContext = {
      contextType: 'compositionMember',
      compositionType: 'oneOf',
      schema: createMockCastrSchema(),
    };

    if (context.contextType === 'compositionMember') {
      expect(context.compositionType).toBe('oneOf');
      // @ts-expect-error - optional doesn't exist on composition member context
      expect(context.optional).toBeUndefined();
    }
  });

  test('isArrayItemsContext narrows to arrayItems', () => {
    const context: CastrSchemaContext = {
      contextType: 'arrayItems',
      schema: createMockCastrSchema(),
    };

    if (context.contextType === 'arrayItems') {
      // @ts-expect-error - optional doesn't exist on array items context
      expect(context.optional).toBeUndefined();
    }
  });

  test('isParameterContext narrows to parameter', () => {
    const context: CastrSchemaContext = {
      contextType: 'parameter',
      name: 'userId',
      location: 'path',
      schema: createMockCastrSchema(),
      required: true,
    };

    if (context.contextType === 'parameter') {
      expect(context.required).toBe(true);
      expect(context.location).toBe('path');
    }
  });
});
