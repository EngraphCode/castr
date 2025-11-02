import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { validateOpenApiSpec, ValidationError } from './validateOpenApiSpec.js';

describe('validateOpenApiSpec', () => {
  describe('Valid Specs', () => {
    it('should accept minimal valid OpenAPI 3.0 spec', () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      expect(() => validateOpenApiSpec(spec)).not.toThrow();
    });

    it('should accept spec with components', () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      };

      expect(() => validateOpenApiSpec(spec)).not.toThrow();
    });

    it('should accept spec with paths and operations', () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            },
          },
        },
      };

      expect(() => validateOpenApiSpec(spec)).not.toThrow();
    });

    it('should accept all valid OpenAPI 3.0.x versions', () => {
      const versions = ['3.0.0', '3.0.1', '3.0.2', '3.0.3'];

      for (const version of versions) {
        const spec: OpenAPIObject = {
          openapi: version,
          info: { title: 'Test API', version: '1.0.0' },
          paths: {},
        };

        expect(() => validateOpenApiSpec(spec)).not.toThrow();
      }
    });
  });

  describe('Invalid Specs - Missing Required Properties', () => {
    it('should reject null spec', () => {
      expect(() => validateOpenApiSpec(null as unknown)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(null as unknown)).toThrow(
        'Invalid OpenAPI document: expected an object, received null',
      );
    });

    it('should reject undefined spec', () => {
      expect(() => validateOpenApiSpec(undefined as unknown)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(undefined as unknown)).toThrow(
        'Invalid OpenAPI document: expected an object, received undefined',
      );
    });

    it('should reject non-object spec', () => {
      expect(() => validateOpenApiSpec('not an object' as unknown)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec('not an object' as unknown)).toThrow(
        'Invalid OpenAPI document: expected an object, received string',
      );
    });

    it('should reject spec missing openapi property', () => {
      const spec = {
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        "Invalid OpenAPI document: missing required property 'openapi'",
      );
    });

    it('should reject spec missing info property', () => {
      const spec = {
        openapi: '3.0.0',
        paths: {},
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        "Invalid OpenAPI document: missing required property 'info'",
      );
    });

    it('should reject spec missing paths property', () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        "Invalid OpenAPI document: missing required property 'paths'",
      );
    });
  });

  describe('Invalid Specs - Wrong Types', () => {
    it('should reject spec with non-string openapi property', () => {
      const spec = {
        openapi: 3.0,
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        "Invalid OpenAPI document: property 'openapi' must be a string, received number",
      );
    });

    it('should reject spec with non-object info property', () => {
      const spec = {
        openapi: '3.0.0',
        info: 'not an object',
        paths: {},
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        "Invalid OpenAPI document: property 'info' must be an object, received string",
      );
    });

    it('should reject spec with non-object paths property', () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: [],
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        "Invalid OpenAPI document: property 'paths' must be an object, received array",
      );
    });
  });

  describe('Invalid Specs - Unsupported Versions', () => {
    it('should reject OpenAPI 2.0 (Swagger) spec', () => {
      const spec = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        'Unsupported OpenAPI version: found swagger property. This library only supports OpenAPI 3.0.x',
      );
    });

    it('should reject OpenAPI 3.1.x spec with helpful message', () => {
      const spec = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        'Unsupported OpenAPI version: 3.1.0. This library only supports OpenAPI 3.0.x (3.0.0 - 3.0.3)',
      );
    });

    it('should reject invalid version format', () => {
      const spec = {
        openapi: 'v3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow(ValidationError);
      expect(() => validateOpenApiSpec(spec)).toThrow(
        "Invalid OpenAPI version format: 'v3'. Expected format: 3.0.x",
      );
    });
  });

  describe('ValidationError Class', () => {
    it('should be instanceof Error', () => {
      const error = new ValidationError('test message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof ValidationError', () => {
      const error = new ValidationError('test message');
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should have correct name property', () => {
      const error = new ValidationError('test message');
      expect(error.name).toBe('ValidationError');
    });

    it('should preserve stack trace', () => {
      const error = new ValidationError('test message');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('Helpful Error Messages', () => {
    it('should provide guidance on how to fix missing openapi property', () => {
      const spec = {
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      try {
        validateOpenApiSpec(spec);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const message = (error as ValidationError).message;
        expect(message).toContain('openapi');
        expect(message).toContain('required');
      }
    });

    it('should distinguish between null and undefined', () => {
      expect(() => validateOpenApiSpec(null as unknown)).toThrow('received null');
      expect(() => validateOpenApiSpec(undefined as unknown)).toThrow('received undefined');
    });

    it('should identify array vs object confusion', () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: [],
      } as unknown;

      expect(() => validateOpenApiSpec(spec)).toThrow('received array');
    });
  });

  describe('Pure Function Characteristics', () => {
    it('should not modify input spec', () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      const originalSpec = JSON.stringify(spec);
      validateOpenApiSpec(spec);
      expect(JSON.stringify(spec)).toBe(originalSpec);
    });

    it('should return the same spec object (identity)', () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      const result = validateOpenApiSpec(spec);
      expect(result).toBe(spec);
    });

    it('should be deterministic (same input = same result)', () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      const result1 = validateOpenApiSpec(spec);
      const result2 = validateOpenApiSpec(spec);

      expect(result1).toBe(result2);
      expect(result1).toBe(spec);
    });
  });
});
