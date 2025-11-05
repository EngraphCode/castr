import { describe, expect, it } from 'vitest';
import type { SchemaObject, ParameterObject } from 'openapi3-ts/oas31';
import { extractSchemaConstraints, extractParameterMetadata } from './parameter-metadata.js';

describe('extractSchemaConstraints', () => {
  describe('numeric constraints', () => {
    it('should extract minimum and maximum for number types', () => {
      const schema: SchemaObject = {
        type: 'number',
        minimum: 0,
        maximum: 100,
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        minimum: 0,
        maximum: 100,
      });
    });

    it('should extract exclusive bounds for number types', () => {
      const schema: SchemaObject = {
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      });
    });

    it('should extract mixed inclusive and exclusive bounds', () => {
      const schema: SchemaObject = {
        type: 'integer',
        minimum: 1,
        exclusiveMaximum: 10,
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        minimum: 1,
        exclusiveMaximum: 10,
      });
    });
  });

  describe('string constraints', () => {
    it('should extract minLength and maxLength', () => {
      const schema: SchemaObject = {
        type: 'string',
        minLength: 3,
        maxLength: 50,
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        minLength: 3,
        maxLength: 50,
      });
    });

    it('should extract pattern', () => {
      const schema: SchemaObject = {
        type: 'string',
        pattern: '^[a-z]+$',
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        pattern: '^[a-z]+$',
      });
    });

    it('should extract format', () => {
      const schema: SchemaObject = {
        type: 'string',
        format: 'email',
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        format: 'email',
      });
    });
  });

  describe('array constraints', () => {
    it('should extract minItems and maxItems', () => {
      const schema: SchemaObject = {
        type: 'array',
        minItems: 1,
        maxItems: 10,
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        minItems: 1,
        maxItems: 10,
      });
    });

    it('should extract uniqueItems', () => {
      const schema: SchemaObject = {
        type: 'array',
        uniqueItems: true,
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        uniqueItems: true,
      });
    });
  });

  describe('enum constraints', () => {
    it('should extract string enums', () => {
      const schema: SchemaObject = {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        enum: ['draft', 'published', 'archived'],
      });
    });

    it('should extract numeric enums', () => {
      const schema: SchemaObject = {
        type: 'integer',
        enum: [1, 2, 3, 5, 8],
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        enum: [1, 2, 3, 5, 8],
      });
    });
  });

  describe('combined constraints', () => {
    it('should extract multiple constraints from same schema', () => {
      const schema: SchemaObject = {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        pattern: '^[A-Za-z0-9]+$',
        format: 'password',
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        minLength: 8,
        maxLength: 128,
        pattern: '^[A-Za-z0-9]+$',
        format: 'password',
      });
    });
  });

  describe('edge cases', () => {
    it('should return undefined for schema with no constraints', () => {
      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty schema object', () => {
      const schema: SchemaObject = {};

      const result = extractSchemaConstraints(schema);

      expect(result).toBeUndefined();
    });

    it('should handle schema with only some constraints', () => {
      const schema: SchemaObject = {
        type: 'number',
        minimum: 0,
      };

      const result = extractSchemaConstraints(schema);

      expect(result).toEqual({
        minimum: 0,
      });
    });
  });
});

describe('extractParameterMetadata', () => {
  describe('basic metadata', () => {
    it('should extract description from parameter', () => {
      const param: ParameterObject = {
        name: 'userId',
        in: 'path',
        description: 'The unique identifier for a user',
        required: true,
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.description).toBe('The unique identifier for a user');
    });

    it('should extract deprecated flag', () => {
      const param: ParameterObject = {
        name: 'oldParam',
        in: 'query',
        deprecated: true,
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.deprecated).toBe(true);
    });

    it('should not include deprecated if false', () => {
      const param: ParameterObject = {
        name: 'param',
        in: 'query',
        deprecated: false,
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.deprecated).toBeUndefined();
    });
  });

  describe('example extraction', () => {
    it('should extract example from parameter', () => {
      const param: ParameterObject = {
        name: 'status',
        in: 'query',
        example: 'active',
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.example).toBe('active');
    });

    it('should extract example from schema when not in parameter', () => {
      const param: ParameterObject = {
        name: 'count',
        in: 'query',
      };

      const schema: SchemaObject = {
        type: 'integer',
        example: 42,
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.example).toBe(42);
    });

    it('should prefer parameter example over schema example', () => {
      const param: ParameterObject = {
        name: 'value',
        in: 'query',
        example: 'param-value',
      };

      const schema: SchemaObject = {
        type: 'string',
        example: 'schema-value',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.example).toBe('param-value');
    });

    it('should extract examples object from parameter', () => {
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
            description: 'Legacy XML format for compatibility',
          },
        },
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.examples).toEqual({
        json: {
          value: 'json',
          summary: 'JSON format',
        },
        xml: {
          value: 'xml',
          summary: 'XML format',
          description: 'Legacy XML format for compatibility',
        },
      });
    });
  });

  describe('default value extraction', () => {
    it('should extract default from schema', () => {
      const param: ParameterObject = {
        name: 'page',
        in: 'query',
      };

      const schema: SchemaObject = {
        type: 'integer',
        default: 1,
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.default).toBe(1);
    });

    it('should extract default for string type', () => {
      const param: ParameterObject = {
        name: 'sort',
        in: 'query',
      };

      const schema: SchemaObject = {
        type: 'string',
        default: 'asc',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.default).toBe('asc');
    });
  });

  describe('constraints extraction', () => {
    it('should include constraints from schema', () => {
      const param: ParameterObject = {
        name: 'age',
        in: 'query',
      };

      const schema: SchemaObject = {
        type: 'integer',
        minimum: 0,
        maximum: 120,
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.constraints).toEqual({
        minimum: 0,
        maximum: 120,
      });
    });

    it('should not include constraints if none present', () => {
      const param: ParameterObject = {
        name: 'name',
        in: 'query',
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.constraints).toBeUndefined();
    });
  });

  describe('complete metadata extraction', () => {
    it('should extract all metadata fields when present', () => {
      const param: ParameterObject = {
        name: 'username',
        in: 'query',
        description: 'Username for login',
        deprecated: true,
        example: 'john_doe',
      };

      const schema: SchemaObject = {
        type: 'string',
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-z_]+$',
        default: 'guest',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result).toEqual({
        description: 'Username for login',
        deprecated: true,
        example: 'john_doe',
        default: 'guest',
        constraints: {
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-z_]+$',
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle minimal parameter and schema', () => {
      const param: ParameterObject = {
        name: 'id',
        in: 'path',
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result).toEqual({});
    });

    it('should handle empty strings in description', () => {
      const param: ParameterObject = {
        name: 'test',
        in: 'query',
        description: '',
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.description).toBeUndefined();
    });

    it('should handle whitespace-only description', () => {
      const param: ParameterObject = {
        name: 'test',
        in: 'query',
        description: '   ',
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = extractParameterMetadata(param, schema);

      expect(result.description).toBeUndefined();
    });
  });
});
