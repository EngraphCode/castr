import { describe, expect, it } from 'vitest';
import type { ParameterObject, OpenAPIObject } from 'openapi3-ts/oas31';
import { processParameter } from './process-parameter.js';
import type { ConversionTypeContext } from '../../shared/code-meta.js';

/**
 * Create a minimal OpenAPI document for testing
 */
function createTestDoc(): OpenAPIObject {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    paths: {},
  };
}

/**
 * Create a minimal conversion context for testing
 */
function createTestContext(doc: OpenAPIObject): ConversionTypeContext {
  return {
    doc,
    zodSchemaByName: {},
    schemaByName: {},
    schemasByName: {},
  };
}

/**
 * Simple mock for getZodVarName - returns the code as-is for testing
 */
function mockGetZodVarName(code: { toString: () => string }): string {
  return code.toString();
}

describe('processParameter with metadata extraction', () => {
  describe('description extraction', () => {
    it('should include description in processed parameter', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'The unique identifier for a user',
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result).toBeDefined();
      expect(result?.description).toBe('The unique identifier for a user');
    });

    it('should trim whitespace from description', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'test',
        in: 'query',
        description: '  Whitespace padded  ',
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.description).toBe('Whitespace padded');
    });

    it('should omit empty description', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'test',
        in: 'query',
        description: '   ',
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.description).toBeUndefined();
    });
  });

  describe('deprecated flag extraction', () => {
    it('should include deprecated flag when true', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'oldParam',
        in: 'query',
        deprecated: true,
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.deprecated).toBe(true);
    });

    it('should omit deprecated flag when false', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'currentParam',
        in: 'query',
        deprecated: false,
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.deprecated).toBeUndefined();
    });
  });

  describe('example extraction', () => {
    it('should include example from parameter', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'status',
        in: 'query',
        example: 'active',
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.example).toBe('active');
    });

    it('should include example from schema when not in parameter', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'count',
        in: 'query',
        schema: {
          type: 'integer',
          example: 42,
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.example).toBe(42);
    });

    it('should prefer parameter example over schema example', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'value',
        in: 'query',
        example: 'param-value',
        schema: {
          type: 'string',
          example: 'schema-value',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.example).toBe('param-value');
    });

    it('should include examples object', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'format',
        in: 'query',
        examples: {
          json: {
            value: 'json',
            summary: 'JSON format',
          },
          xml: {
            value: 'xml',
            summary: 'XML format',
          },
        },
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.examples).toEqual({
        json: {
          value: 'json',
          summary: 'JSON format',
        },
        xml: {
          value: 'xml',
          summary: 'XML format',
        },
      });
    });
  });

  describe('default value extraction', () => {
    it('should include default from schema', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'page',
        in: 'query',
        schema: {
          type: 'integer',
          default: 1,
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.default).toBe(1);
    });
  });

  describe('constraints extraction', () => {
    it('should include numeric constraints', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'age',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 0,
          maximum: 120,
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.constraints).toEqual({
        minimum: 0,
        maximum: 120,
      });
    });

    it('should include string constraints', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'username',
        in: 'query',
        schema: {
          type: 'string',
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-z]+$',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.constraints).toEqual({
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-z]+$',
      });
    });

    it('should include array constraints', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'tags',
        in: 'query',
        schema: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          maxItems: 10,
          uniqueItems: true,
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.constraints).toEqual({
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
      });
    });

    it('should include enum constraint', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'status',
        in: 'query',
        schema: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.constraints).toEqual({
        enum: ['draft', 'published', 'archived'],
      });
    });
  });

  describe('complete metadata extraction', () => {
    it('should extract description and deprecated fields', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'username',
        in: 'query',
        description: 'Username for login',
        deprecated: true,
        schema: { type: 'string' },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.description).toBe('Username for login');
      expect(result?.deprecated).toBe(true);
    });

    it('should extract example and default values', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'page',
        in: 'query',
        example: 'john_doe',
        schema: { type: 'string', default: 'guest' },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.example).toBe('john_doe');
      expect(result?.default).toBe('guest');
    });

    it('should extract schema constraints', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'username',
        in: 'query',
        schema: {
          type: 'string',
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-z_]+$',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result?.constraints).toEqual({
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-z_]+$',
      });
    });
  });

  describe('backward compatibility', () => {
    it('should still work with minimal parameter (no metadata)', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result).toBeDefined();
      expect(result?.name).toBe('id');
      expect(result?.type).toBe('Path');
      expect(result?.schema).toBeDefined();
      expect(result?.description).toBeUndefined();
      expect(result?.deprecated).toBeUndefined();
      expect(result?.example).toBeUndefined();
      expect(result?.constraints).toBeUndefined();
    });

    it('should maintain existing parameter type handling', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      // Test all parameter types
      const paramTypes: ('path' | 'query' | 'header')[] = ['path', 'query', 'header'];

      paramTypes.forEach((paramIn) => {
        const param: ParameterObject = {
          name: 'test',
          in: paramIn,
          schema: { type: 'string' },
        };

        const result = processParameter(param, ctx, mockGetZodVarName);

        expect(result).toBeDefined();
        expect(result?.type).toMatch(/^(Path|Query|Header)$/);
      });
    });
  });

  describe('parameter with content property', () => {
    it('should extract metadata when schema is in content', () => {
      const doc = createTestDoc();
      const ctx = createTestContext(doc);

      const param: ParameterObject = {
        name: 'filter',
        in: 'query',
        description: 'Complex filter object',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                field: { type: 'string' },
              },
            },
            example: { field: 'value' },
          },
        },
      };

      const result = processParameter(param, ctx, mockGetZodVarName);

      expect(result).toBeDefined();
      expect(result?.description).toBe('Complex filter object');
    });
  });
});
