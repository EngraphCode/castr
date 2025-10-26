import { describe, expect, it } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { isSchemaObject } from 'openapi3-ts/oas30';

import { makeSchemaResolver } from './makeSchemaResolver.js';

describe('makeSchemaResolver', () => {
  const mockDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
    components: {
      schemas: {
        Pet: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        'Name-With-Dash': {
          type: 'string',
        },
        Name_With_Underscore: {
          type: 'string',
        },
      },
    },
  };

  describe('getSchemaByRef', () => {
    it('should retrieve schema by ref', () => {
      const resolver = makeSchemaResolver(mockDoc);
      const schema = resolver.getSchemaByRef('#/components/schemas/Pet');
      expect(schema).toEqual({
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      });
    });

    it('should auto-correct refs missing leading slash', () => {
      const resolver = makeSchemaResolver(mockDoc);
      const schema = resolver.getSchemaByRef('#components/schemas/Pet');
      expect(isSchemaObject(schema)).toBe(true);
      if (isSchemaObject(schema)) {
        expect(schema.type).toBe('object');
      }
    });

    it('should handle schema names with dashes', () => {
      const resolver = makeSchemaResolver(mockDoc);
      const schema = resolver.getSchemaByRef('#/components/schemas/Name-With-Dash');
      expect(isSchemaObject(schema)).toBe(true);
      if (isSchemaObject(schema)) {
        expect(schema.type).toBe('string');
      }
    });

    it('should handle schema names with underscores', () => {
      const resolver = makeSchemaResolver(mockDoc);
      const schema = resolver.getSchemaByRef('#/components/schemas/Name_With_Underscore');
      expect(isSchemaObject(schema)).toBe(true);
      if (isSchemaObject(schema)) {
        expect(schema.type).toBe('string');
      }
    });

    it('should throw when schema not found', () => {
      const resolver = makeSchemaResolver(mockDoc);
      expect(() => resolver.getSchemaByRef('#/components/schemas/NonExistent')).toThrow(
        'Schema not found for $ref',
      );
    });

    it('should throw when ref has no name component', () => {
      const resolver = makeSchemaResolver(mockDoc);
      expect(() => resolver.getSchemaByRef('#/components/schemas/')).toThrow('Invalid $ref');
    });

    it('should populate byNormalized map after access', () => {
      const resolver = makeSchemaResolver(mockDoc);

      // First, getSchemaByRef should populate the map
      resolver.getSchemaByRef('#/components/schemas/Pet');

      // Then resolveSchemaName should work
      const resolved = resolver.resolveSchemaName('Pet');
      expect(resolved.ref).toBe('#/components/schemas/Pet');
      expect(resolved.name).toBe('Pet');
      expect(resolved.normalized).toBe('Pet');
    });
  });

  describe('resolveRef', () => {
    it('should resolve ref to RefInfo after getSchemaByRef call', () => {
      const resolver = makeSchemaResolver(mockDoc);
      resolver.getSchemaByRef('#/components/schemas/Pet');

      const resolved = resolver.resolveRef('#/components/schemas/Pet');
      expect(resolved).toEqual({
        ref: '#/components/schemas/Pet',
        name: 'Pet',
        normalized: 'Pet',
      });
    });

    it('should throw when ref not yet accessed', () => {
      const resolver = makeSchemaResolver(mockDoc);
      expect(() => resolver.resolveRef('#/components/schemas/Pet')).toThrow(
        'Unable to resolve $ref',
      );
    });

    it('should auto-correct ref format', () => {
      const resolver = makeSchemaResolver(mockDoc);
      resolver.getSchemaByRef('#/components/schemas/Pet');

      // Should work with or without leading slash
      const resolved = resolver.resolveRef('#components/schemas/Pet');
      expect(resolved.ref).toBe('#/components/schemas/Pet');
    });
  });

  describe('resolveSchemaName', () => {
    it('should throw when schema name not yet accessed', () => {
      const resolver = makeSchemaResolver(mockDoc);
      expect(() => resolver.resolveSchemaName('Pet')).toThrow('Unable to resolve schema name: Pet');
    });

    it('should resolve schema name after getSchemaByRef call', () => {
      const resolver = makeSchemaResolver(mockDoc);
      resolver.getSchemaByRef('#/components/schemas/Pet');

      const resolved = resolver.resolveSchemaName('Pet');
      expect(resolved).toEqual({
        ref: '#/components/schemas/Pet',
        name: 'Pet',
        normalized: 'Pet',
      });
    });

    it('should handle normalized names with special characters', () => {
      const resolver = makeSchemaResolver(mockDoc);
      resolver.getSchemaByRef('#/components/schemas/Name-With-Dash');

      // The normalized name should have dashes converted to underscores
      const resolved = resolver.resolveSchemaName('Name_With_Dash');
      expect(resolved.name).toBe('Name-With-Dash');
      expect(resolved.normalized).toBe('Name_With_Dash');
    });
  });

  describe('lazy population behavior', () => {
    it('should not pre-populate maps on creation', () => {
      const resolver = makeSchemaResolver(mockDoc);

      // All schemas should be inaccessible until getSchemaByRef is called
      expect(() => resolver.resolveSchemaName('Pet')).toThrow();
      expect(() => resolver.resolveSchemaName('Name-With-Dash')).toThrow();
      expect(() => resolver.resolveSchemaName('Name_With_Underscore')).toThrow();
    });

    it('should populate only accessed schemas', () => {
      const resolver = makeSchemaResolver(mockDoc);

      // Access only Pet
      resolver.getSchemaByRef('#/components/schemas/Pet');

      // Pet should be accessible
      expect(() => resolver.resolveSchemaName('Pet')).not.toThrow();

      // Others should still throw
      expect(() => resolver.resolveSchemaName('Name_With_Dash')).toThrow();
    });

    it('should allow multiple schemas to be accessed independently', () => {
      const resolver = makeSchemaResolver(mockDoc);

      // Access both schemas
      resolver.getSchemaByRef('#/components/schemas/Pet');
      resolver.getSchemaByRef('#/components/schemas/Name-With-Dash');

      // Both should be accessible
      expect(() => resolver.resolveSchemaName('Pet')).not.toThrow();
      expect(() => resolver.resolveSchemaName('Name_With_Dash')).not.toThrow();
    });
  });

  describe('name normalization', () => {
    it('should normalize schema names consistently', () => {
      const resolver = makeSchemaResolver(mockDoc);
      resolver.getSchemaByRef('#/components/schemas/Name-With-Dash');

      const resolved = resolver.resolveRef('#/components/schemas/Name-With-Dash');

      // Dashes should be converted to underscores in normalized name
      expect(resolved.name).toBe('Name-With-Dash');
      expect(resolved.normalized).toBe('Name_With_Dash');
    });

    it('should preserve underscores in original names', () => {
      const resolver = makeSchemaResolver(mockDoc);
      resolver.getSchemaByRef('#/components/schemas/Name_With_Underscore');

      const resolved = resolver.resolveRef('#/components/schemas/Name_With_Underscore');

      expect(resolved.name).toBe('Name_With_Underscore');
      expect(resolved.normalized).toBe('Name_With_Underscore');
    });
  });
});
