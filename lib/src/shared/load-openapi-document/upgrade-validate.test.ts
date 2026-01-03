import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { isBundledOpenApiDocument, upgradeAndValidate } from './upgrade-validate.js';

describe('upgrade-validate', () => {
  describe('isBundledOpenApiDocument', () => {
    it('should return true for valid OpenAPI 3.1 document', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      expect(isBundledOpenApiDocument(doc)).toBe(true);
    });

    it('should return true for OpenAPI 3.1.x versions', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.1',
        info: { title: 'Test', version: '1.0' },
        paths: {},
      };

      expect(isBundledOpenApiDocument(doc)).toBe(true);
    });

    it('should return false for OpenAPI 3.0.x', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {},
      };

      expect(isBundledOpenApiDocument(doc)).toBe(false);
    });

    it('should return false for OpenAPI 2.0', () => {
      const doc = {
        swagger: '2.0',
        info: { title: 'Test', version: '1.0' },
        paths: {},
      };

      expect(isBundledOpenApiDocument(doc)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isBundledOpenApiDocument(null)).toBe(false);
      expect(isBundledOpenApiDocument(undefined)).toBe(false);
      expect(isBundledOpenApiDocument('string')).toBe(false);
      expect(isBundledOpenApiDocument(123)).toBe(false);
    });

    it('should return false for objects without required fields', () => {
      expect(isBundledOpenApiDocument({})).toBe(false);
      expect(isBundledOpenApiDocument({ openapi: '3.1.0' })).toBe(false);
      expect(isBundledOpenApiDocument({ info: {}, paths: {} })).toBe(false);
    });

    it('should return false if openapi is not a string', () => {
      const doc = {
        openapi: 3.1,
        info: { title: 'Test', version: '1.0' },
        paths: {},
      };

      expect(isBundledOpenApiDocument(doc)).toBe(false);
    });
  });

  describe('upgradeAndValidate', () => {
    it('should upgrade and validate OpenAPI 3.0 document', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      const result = upgradeAndValidate(doc);

      expect(result.openapi).toMatch(/^3\.1\./);
      expect(result.info.title).toBe('Test API');
    });

    it('should pass through OpenAPI 3.1 documents', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      const result = upgradeAndValidate(doc);

      expect(result.openapi).toMatch(/^3\.1\./);
      expect(result).toBeDefined();
    });

    it('should throw if upgrade produces invalid document', () => {
      // This would only happen if Scalar's upgrade() has a bug
      // Hard to test, but the error path exists for safety
      const invalidInput = { invalid: 'doc' };

      expect(() => upgradeAndValidate(invalidInput)).toThrow(
        'Failed to produce valid OpenAPI 3.1 document',
      );
    });
  });
});
