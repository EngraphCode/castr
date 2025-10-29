import { describe, it, expect } from 'vitest';
import {
  sortSchemasByDependencyOrder,
  sortSchemaNamesByDependencyOrder,
} from './schema-sorting.js';

describe('schema-sorting', () => {
  describe('sortSchemasByDependencyOrder', () => {
    it('should sort schema code dictionary by dependency order', () => {
      const schemas = {
        User: 'z.object({ name: z.string() })',
        Pet: 'z.object({ owner: UserSchema })',
        Store: 'z.object({ pets: z.array(PetSchema) })',
      };
      const order = ['Pet', 'User', 'Store'];

      const result = sortSchemasByDependencyOrder(schemas, order);

      expect(Object.keys(result)).toEqual(['Pet', 'User', 'Store']);
    });

    it('should place schemas not in order at the end', () => {
      const schemas = { Z: 'code', A: 'code', M: 'code' };
      const order = ['A', 'M'];

      const result = sortSchemasByDependencyOrder(schemas, order);

      expect(Object.keys(result)).toEqual(['A', 'M', 'Z']);
    });

    it('should handle empty inputs', () => {
      expect(sortSchemasByDependencyOrder({}, [])).toEqual({});
    });

    it('should handle empty dependency order', () => {
      const schemas = { A: 'code', B: 'code', C: 'code' };

      const result = sortSchemasByDependencyOrder(schemas, []);

      // All schemas should be preserved, order is undefined but all should be present
      expect(Object.keys(result).toSorted((a, b) => a.localeCompare(b))).toEqual(['A', 'B', 'C']);
    });

    it('should preserve all schema values after sorting', () => {
      const schemas = {
        Alpha: 'z.string()',
        Beta: 'z.number()',
        Gamma: 'z.boolean()',
      };
      const order = ['Gamma', 'Alpha', 'Beta'];

      const result = sortSchemasByDependencyOrder(schemas, order);

      expect(result).toEqual({
        Gamma: 'z.boolean()',
        Alpha: 'z.string()',
        Beta: 'z.number()',
      });
    });
  });

  describe('sortSchemaNamesByDependencyOrder', () => {
    it('should sort schema names by dependency order', () => {
      const names = ['User', 'Pet', 'Store'];
      const order = ['Pet', 'User', 'Store'];

      const result = sortSchemaNamesByDependencyOrder(names, order);

      expect(result).toEqual(['Pet', 'User', 'Store']);
    });

    it('should place names not in order at the end', () => {
      const names = ['Z', 'A', 'M'];
      const order = ['A', 'M'];

      const result = sortSchemaNamesByDependencyOrder(names, order);

      expect(result).toEqual(['A', 'M', 'Z']);
    });

    it('should handle empty inputs', () => {
      expect(sortSchemaNamesByDependencyOrder([], [])).toEqual([]);
    });

    it('should handle empty dependency order', () => {
      const names = ['A', 'B', 'C'];

      const result = sortSchemaNamesByDependencyOrder(names, []);

      // All names should be preserved, order is undefined but all should be present
      expect(result.toSorted((a, b) => a.localeCompare(b))).toEqual(['A', 'B', 'C']);
    });

    it('should preserve all names after sorting', () => {
      const names = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      const order = ['Delta', 'Alpha', 'Gamma', 'Beta'];

      const result = sortSchemaNamesByDependencyOrder(names, order);

      expect(result).toEqual(['Delta', 'Alpha', 'Gamma', 'Beta']);
    });

    it('should handle names that appear in both lists', () => {
      const names = ['Pet', 'User'];
      const order = ['User', 'Pet'];

      const result = sortSchemaNamesByDependencyOrder(names, order);

      expect(result).toEqual(['User', 'Pet']);
    });

    it('should maintain stable sort for items at same priority', () => {
      // When items have the same priority (both not in order), original order should be preserved
      const names = ['Z', 'Y', 'X', 'A', 'B'];
      const order = ['A', 'B'];

      const result = sortSchemaNamesByDependencyOrder(names, order);

      // A and B should come first (in that order), then Z, Y, X should maintain their original order
      expect(result).toEqual(['A', 'B', 'Z', 'Y', 'X']);
    });

    it('should handle complex dependency chains', () => {
      // Simulating schema dependencies: D depends on C, C depends on B, B depends on A
      const names = ['User', 'Pet', 'Store', 'Order'];
      const dependencyOrder = ['Order', 'Store', 'Pet', 'User'];

      const result = sortSchemaNamesByDependencyOrder(names, dependencyOrder);

      expect(result).toEqual(['Order', 'Store', 'Pet', 'User']);
    });
  });

  describe('sortSchemasByDependencyOrder - stable sorting', () => {
    it('should maintain stable sort for schemas with same dependency level', () => {
      const schemas = {
        SchemaA: 'z.string()',
        SchemaB: 'z.number()',
        SchemaC: 'z.boolean()',
      };
      // Only SchemaA is in the dependency order
      const order = ['SchemaA'];

      const result = sortSchemasByDependencyOrder(schemas, order);

      // SchemaA should be first, then B and C in their original insertion order
      expect(Object.keys(result)).toEqual(['SchemaA', 'SchemaB', 'SchemaC']);
    });

    it('should handle real-world schema dependency scenario', () => {
      // Simulating generated Zod schemas
      const schemas = {
        User: 'z.object({ name: z.string() })',
        Pet: 'z.object({ owner: UserSchema })',
        Store: 'z.object({ pets: z.array(PetSchema), owner: UserSchema })',
        ApiResponse: 'z.object({ code: z.number() })',
      };
      // Dependency order: Pet depends on User, Store depends on both
      const order = ['User', 'Pet', 'Store'];

      const result = sortSchemasByDependencyOrder(schemas, order);

      const keys = Object.keys(result);
      // User, Pet, Store should be in dependency order
      expect(keys.indexOf('User')).toBeLessThan(keys.indexOf('Pet'));
      expect(keys.indexOf('Pet')).toBeLessThan(keys.indexOf('Store'));
      // ApiResponse (not in order) should come after ordered schemas
      expect(keys.indexOf('Store')).toBeLessThan(keys.indexOf('ApiResponse'));
    });
  });
});
