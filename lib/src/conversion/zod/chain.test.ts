import { describe, expect, it } from 'vitest';
import type { SchemaObject } from 'openapi3-ts/oas30';

import { getZodChainableStringValidations } from './chain.js';

describe('openApiToZod.chain', () => {
  describe('getZodChainableStringValidations - current behavior', () => {
    it('should return empty string when no validations', () => {
      const schema: SchemaObject = { type: 'string' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('');
    });

    it('should add minLength validation', () => {
      const schema: SchemaObject = { type: 'string', minLength: 5 };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('min(5)');
    });

    it('should add maxLength validation', () => {
      const schema: SchemaObject = { type: 'string', maxLength: 10 };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('max(10)');
    });

    it('should combine minLength and maxLength validations', () => {
      const schema: SchemaObject = { type: 'string', minLength: 5, maxLength: 10 };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('min(5).max(10)');
    });

    it('should add pattern validation', () => {
      const schema: SchemaObject = { type: 'string', pattern: '^[a-z]+$' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('regex(/^[a-z]+$/)');
    });

    it('should add pattern validation with unicode flag when needed', () => {
      // Pattern with \p which triggers unicode flag
      const schema: SchemaObject = { type: 'string', pattern: '^[\\p{L}]+$' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('regex(/^[\\p{L}]+$/u)');
    });

    it('should handle pattern that already has slashes', () => {
      // formatPatternIfNeeded strips outer slashes first
      const schema: SchemaObject = { type: 'string', pattern: '/^[a-z]+$/' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('regex(/^[a-z]+$/)');
    });

    it('should add format validation for email', () => {
      const schema: SchemaObject = { type: 'string', format: 'email' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('email()');
    });

    it('should add format validation for uuid', () => {
      const schema: SchemaObject = { type: 'string', format: 'uuid' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('uuid()');
    });

    it('should add format validation for uri', () => {
      const schema: SchemaObject = { type: 'string', format: 'uri' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('url()');
    });

    it('should add format validation for hostname', () => {
      const schema: SchemaObject = { type: 'string', format: 'hostname' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('url()');
    });

    it('should add format validation for date-time', () => {
      const schema: SchemaObject = { type: 'string', format: 'date-time' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('datetime({ offset: true })');
    });

    it('should skip format validation for unknown format', () => {
      const schema: SchemaObject = { type: 'string', format: 'unknown-format' };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('');
    });

    it('should combine multiple validations', () => {
      const schema: SchemaObject = {
        type: 'string',
        minLength: 5,
        maxLength: 10,
        pattern: '^[a-z]+$',
        format: 'email',
      };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('min(5).max(10).regex(/^[a-z]+$/).email()');
    });

    it('should skip minLength and maxLength when enum is present', () => {
      const schema: SchemaObject = {
        type: 'string',
        enum: ['a', 'b', 'c'],
        minLength: 1,
        maxLength: 10,
      };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('');
    });

    it('should still add pattern and format when enum is present', () => {
      const schema: SchemaObject = {
        type: 'string',
        enum: ['a', 'b', 'c'],
        pattern: '^[a-z]+$',
        format: 'email',
      };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('regex(/^[a-z]+$/).email()');
    });

    it('should handle zero minLength', () => {
      const schema: SchemaObject = { type: 'string', minLength: 0 };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('min(0)');
    });

    it('should handle zero maxLength', () => {
      const schema: SchemaObject = { type: 'string', maxLength: 0 };
      const result = getZodChainableStringValidations(schema);
      expect(result).toBe('max(0)');
    });
  });
});
