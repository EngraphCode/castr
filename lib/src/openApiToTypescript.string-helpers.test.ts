/**
 * Comprehensive test suite for string-based TypeScript type generation
 *
 * TDD: These tests define the new API before implementation
 *
 * Design Goal: Convert OpenAPI schemas → TypeScript type strings
 * - Eliminate tanu dependency
 * - Zero type assertions
 * - Support OpenAPI 3.0 AND 3.1+
 * - Simple, testable, maintainable
 */

import { describe, it, expect } from 'vitest';
import {
  primitiveToTypeScript,
  handleBasicPrimitive,
  handleStringEnum,
  handleNumericEnum,
  handleMixedEnum,
  handleArrayType,
  handleReadonlyArray,
  handleUnion,
  handleIntersection,
  handleObjectType,
  handlePartialObject,
  handleAdditionalProperties,
  mergeObjectWithAdditionalProps,
  handleReference,
  handleUnknownType,
  handleNeverType,
  handleAnyType,
  wrapNullable,
  wrapReadonly,
} from './openApiToTypescript.string-helpers.js';

// =============================================================================
// 1. PRIMITIVE TYPES
// =============================================================================

describe('Primitive Type Mapping', () => {
  describe('primitiveToTypeScript', () => {
    it('should map string to string', () => {
      expect(primitiveToTypeScript('string')).toBe('string');
    });

    it('should map number to number', () => {
      expect(primitiveToTypeScript('number')).toBe('number');
    });

    it('should map integer to number', () => {
      expect(primitiveToTypeScript('integer')).toBe('number');
    });

    it('should map boolean to boolean', () => {
      expect(primitiveToTypeScript('boolean')).toBe('boolean');
    });

    it('should map null to null (3.1+ support)', () => {
      expect(primitiveToTypeScript('null')).toBe('null');
    });
  });

  describe('handleBasicPrimitive', () => {
    it('should return string for non-nullable string', () => {
      expect(handleBasicPrimitive('string', false)).toBe('string');
    });

    it('should return string | null for nullable string (3.0)', () => {
      expect(handleBasicPrimitive('string', true)).toBe('string | null');
    });

    it('should return number for non-nullable integer', () => {
      expect(handleBasicPrimitive('integer', false)).toBe('number');
    });

    it('should return number | null for nullable integer', () => {
      expect(handleBasicPrimitive('integer', true)).toBe('number | null');
    });

    it('should return boolean for non-nullable boolean', () => {
      expect(handleBasicPrimitive('boolean', false)).toBe('boolean');
    });

    it('should return boolean | null for nullable boolean', () => {
      expect(handleBasicPrimitive('boolean', true)).toBe('boolean | null');
    });

    it('should return number for non-nullable number', () => {
      expect(handleBasicPrimitive('number', false)).toBe('number');
    });

    it('should return null for null type (3.1+ support)', () => {
      expect(handleBasicPrimitive('null', false)).toBe('null');
    });
  });
});

// =============================================================================
// 2. ENUMS
// =============================================================================

describe('Enum Types', () => {
  describe('handleStringEnum', () => {
    it('should create union of string literals', () => {
      expect(handleStringEnum(['active', 'inactive', 'pending'])).toBe(
        '"active" | "inactive" | "pending"',
      );
    });

    it('should handle single value enum', () => {
      expect(handleStringEnum(['constant'])).toBe('"constant"');
    });

    it('should handle empty strings', () => {
      expect(handleStringEnum(['', 'value'])).toBe('"" | "value"');
    });

    it('should handle special characters', () => {
      expect(handleStringEnum(['hello-world', 'foo_bar'])).toBe('"hello-world" | "foo_bar"');
    });
  });

  describe('handleNumericEnum', () => {
    it('should create union of number literals', () => {
      expect(handleNumericEnum([1, 2, 3])).toBe('1 | 2 | 3');
    });

    it('should handle negative numbers', () => {
      expect(handleNumericEnum([-1, 0, 1])).toBe('-1 | 0 | 1');
    });

    it('should handle floats', () => {
      expect(handleNumericEnum([1.5, 2.5, 3.5])).toBe('1.5 | 2.5 | 3.5');
    });
  });

  describe('handleMixedEnum', () => {
    it('should create union of mixed literals', () => {
      expect(handleMixedEnum(['string', 1, true])).toBe('"string" | 1 | true');
    });

    it('should handle null in enum (3.1+ support)', () => {
      expect(handleMixedEnum(['value', null])).toBe('"value" | null');
    });
  });
});

// =============================================================================
// 3. ARRAYS
// =============================================================================

describe('Array Types', () => {
  describe('handleArrayType', () => {
    it('should wrap string type in Array', () => {
      expect(handleArrayType('string')).toBe('Array<string>');
    });

    it('should wrap complex union in Array', () => {
      expect(handleArrayType('string | number')).toBe('Array<string | number>');
    });

    it('should wrap object type in Array', () => {
      expect(handleArrayType('{ id: number; name: string }')).toBe(
        'Array<{ id: number; name: string }>',
      );
    });

    it('should handle nested arrays', () => {
      expect(handleArrayType('Array<string>')).toBe('Array<Array<string>>');
    });
  });

  describe('handleReadonlyArray', () => {
    it('should wrap in readonly array', () => {
      expect(handleReadonlyArray('string')).toBe('readonly string[]');
    });

    it('should handle complex types', () => {
      expect(handleReadonlyArray('User | Admin')).toBe('readonly (User | Admin)[]');
    });
  });
});

// =============================================================================
// 4. UNION TYPES (oneOf)
// =============================================================================

describe('Union Types', () => {
  describe('handleUnion', () => {
    it('should create union of two types', () => {
      expect(handleUnion(['string', 'number'])).toBe('string | number');
    });

    it('should create union of multiple types', () => {
      expect(handleUnion(['string', 'number', 'boolean'])).toBe('string | number | boolean');
    });

    it('should handle single type (degenerate union)', () => {
      expect(handleUnion(['string'])).toBe('string');
    });

    it('should handle complex type unions', () => {
      expect(handleUnion(['{ type: "user" }', '{ type: "admin" }', '{ type: "guest" }'])).toBe(
        '{ type: "user" } | { type: "admin" } | { type: "guest" }',
      );
    });

    it('should add null to union when nullable (3.0)', () => {
      expect(handleUnion(['string', 'number'], true)).toBe('string | number | null');
    });
  });
});

// =============================================================================
// 5. INTERSECTION TYPES (allOf)
// =============================================================================

describe('Intersection Types', () => {
  describe('handleIntersection', () => {
    it('should create intersection of two types', () => {
      expect(handleIntersection(['Base', 'Extended'])).toBe('Base & Extended');
    });

    it('should create intersection of multiple types', () => {
      expect(handleIntersection(['A', 'B', 'C'])).toBe('A & B & C');
    });

    it('should handle object types', () => {
      expect(handleIntersection(['{ id: number }', '{ name: string }'])).toBe(
        '{ id: number } & { name: string }',
      );
    });

    it('should add null union when nullable (3.0)', () => {
      expect(handleIntersection(['Base', 'Extended'], true)).toBe('(Base & Extended) | null');
    });
  });
});

// =============================================================================
// 6. OBJECT TYPES
// =============================================================================

describe('Object Types', () => {
  describe('handleObjectType', () => {
    it('should create empty object', () => {
      expect(handleObjectType({})).toBe('{}');
    });

    it('should create object with required properties', () => {
      expect(
        handleObjectType({
          id: 'number',
          name: 'string',
        }),
      ).toBe('{ id: number; name: string }');
    });

    it('should create object with optional properties', () => {
      expect(
        handleObjectType({
          id: 'number',
          'name?': 'string',
        }),
      ).toBe('{ id: number; name?: string }');
    });

    it('should handle nested objects', () => {
      expect(
        handleObjectType({
          user: '{ id: number; name: string }',
        }),
      ).toBe('{ user: { id: number; name: string } }');
    });

    it('should handle array properties', () => {
      expect(
        handleObjectType({
          tags: 'Array<string>',
        }),
      ).toBe('{ tags: Array<string> }');
    });

    it('should handle union type properties', () => {
      expect(
        handleObjectType({
          status: '"active" | "inactive"',
        }),
      ).toBe('{ status: "active" | "inactive" }');
    });

    it('should wrap quoted property names correctly', () => {
      expect(
        handleObjectType({
          '"kebab-case"': 'string',
          '"with space"': 'number',
        }),
      ).toBe('{ "kebab-case": string; "with space": number }');
    });
  });

  describe('handlePartialObject', () => {
    it('should wrap object in Partial', () => {
      expect(handlePartialObject('{ id: number; name: string }')).toBe(
        'Partial<{ id: number; name: string }>',
      );
    });

    it('should handle reference types', () => {
      expect(handlePartialObject('User')).toBe('Partial<User>');
    });
  });

  describe('handleAdditionalProperties', () => {
    it('should create index signature for string keys', () => {
      expect(handleAdditionalProperties('any')).toBe('{ [key: string]: any }');
    });

    it('should handle specific value types', () => {
      expect(handleAdditionalProperties('string')).toBe('{ [key: string]: string }');
    });

    it('should handle complex value types', () => {
      expect(handleAdditionalProperties('User | Admin')).toBe('{ [key: string]: User | Admin }');
    });
  });

  describe('mergeObjectWithAdditionalProps', () => {
    it('should combine object props with additional properties', () => {
      expect(mergeObjectWithAdditionalProps('{ id: number }', '{ [key: string]: any }')).toBe(
        '{ id: number } & { [key: string]: any }',
      );
    });
  });
});

// =============================================================================
// 7. REFERENCE TYPES
// =============================================================================

describe('Reference Types', () => {
  describe('handleReference', () => {
    it('should extract schema name from ref', () => {
      expect(handleReference('#/components/schemas/User')).toBe('User');
    });

    it('should handle nested path components', () => {
      expect(handleReference('#/components/schemas/api.v1.User')).toBe('api.v1.User');
    });

    it('should handle ref with special characters', () => {
      expect(handleReference('#/components/schemas/User_Profile')).toBe('User_Profile');
    });

    it('should handle parameters ref', () => {
      expect(handleReference('#/components/parameters/PaginationParams')).toBe('PaginationParams');
    });
  });
});

// =============================================================================
// 8. SPECIAL TYPES
// =============================================================================

describe('Special Types', () => {
  describe('handleUnknownType', () => {
    it('should return unknown for untyped schemas', () => {
      expect(handleUnknownType()).toBe('unknown');
    });
  });

  describe('handleNeverType', () => {
    it('should return never for impossible types', () => {
      expect(handleNeverType()).toBe('never');
    });
  });

  describe('handleAnyType', () => {
    it('should return any when explicitly specified', () => {
      expect(handleAnyType()).toBe('any');
    });
  });
});

// =============================================================================
// 9. TYPE MODIFIERS
// =============================================================================

describe('Type Modifiers', () => {
  describe('wrapNullable', () => {
    it('should add null union when nullable is true', () => {
      expect(wrapNullable('string', true)).toBe('string | null');
    });

    it('should not add null when nullable is false', () => {
      expect(wrapNullable('string', false)).toBe('string');
    });

    it('should handle complex types', () => {
      expect(wrapNullable('User | Admin', true)).toBe('(User | Admin) | null');
    });
  });

  describe('wrapReadonly', () => {
    it('should not wrap when readonly is false', () => {
      expect(wrapReadonly('string', false)).toBe('string');
    });

    it('should wrap simple types in Readonly', () => {
      expect(wrapReadonly('{ id: number }', true)).toBe('Readonly<{ id: number }>');
    });

    it('should handle arrays', () => {
      expect(wrapReadonly('Array<string>', true)).toBe('Readonly<Array<string>>');
    });
  });
});

// =============================================================================
// 10. COMPLEX INTEGRATION TESTS
// =============================================================================

describe('Complex Type Combinations', () => {
  describe('Nested union with nullable', () => {
    it('should handle union of objects with nullable', () => {
      const union = handleUnion(['{ type: "user"; id: number }', '{ type: "guest" }']);
      expect(wrapNullable(union, true)).toBe(
        '({ type: "user"; id: number } | { type: "guest" }) | null',
      );
    });
  });

  describe('Array of unions', () => {
    it('should create array of union types', () => {
      const union = handleUnion(['string', 'number']);
      expect(handleArrayType(union)).toBe('Array<string | number>');
    });
  });

  describe('Partial object with additional properties', () => {
    it('should combine Partial with index signature', () => {
      const obj = '{ id: number; name: string }';
      const partial = handlePartialObject(obj);
      const additionalProps = '{ [key: string]: any }';
      expect(mergeObjectWithAdditionalProps(partial, additionalProps)).toBe(
        'Partial<{ id: number; name: string }> & { [key: string]: any }',
      );
    });
  });

  describe('Readonly array of union types', () => {
    it('should create readonly array of unions', () => {
      const union = handleUnion(['"active"', '"inactive"']);
      expect(handleReadonlyArray(union)).toBe('readonly ("active" | "inactive")[]');
    });
  });

  describe('Intersection with nullable', () => {
    it('should wrap intersection in parens when adding null', () => {
      const intersection = handleIntersection(['Base', 'Extended']);
      expect(wrapNullable(intersection, true)).toBe('(Base & Extended) | null');
    });
  });
});

// All functions are now imported from the implementation file above ⬆️
