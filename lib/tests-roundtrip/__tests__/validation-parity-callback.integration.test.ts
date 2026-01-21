/**
 * Validation Parity Integration Tests - Callback (URL Format)
 *
 * PROVES that generated Zod schemas with format-specific functions validate correctly.
 * Tests z.url() format validation for callback URLs.
 *
 * Key tests:
 * - URL format validation (callbackUrl must be valid URL)
 * - Response schema with inline object validation
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

// Import generated Zod schemas from callback fixture
import { endpoints } from '../__fixtures__/normalized/callback-3.0/zod.js';

// Extract schemas from the endpoint for testing
const postStreamsEndpoint = endpoints[0];
const callbackUrlParameterSchema = postStreamsEndpoint.parameters[0].schema;
const responseSchema = postStreamsEndpoint.response;
const queryParamsSchema = postStreamsEndpoint.request.queryParams;

// ============================================================================
// CallbackUrl Parameter Tests (z.string().url())
// ============================================================================

describe('CallbackUrl Schema Validation (URL format)', () => {
  describe('valid URLs pass', () => {
    it('accepts HTTPS URL', () => {
      expect(() => callbackUrlParameterSchema.parse('https://example.com')).not.toThrow();
    });

    it('accepts HTTP URL', () => {
      expect(() => callbackUrlParameterSchema.parse('http://example.com')).not.toThrow();
    });

    it('accepts URL with path', () => {
      expect(() => callbackUrlParameterSchema.parse('https://example.com/callback')).not.toThrow();
    });

    it('accepts URL with port', () => {
      expect(() => callbackUrlParameterSchema.parse('https://example.com:8080')).not.toThrow();
    });

    it('accepts URL with query parameters', () => {
      expect(() =>
        callbackUrlParameterSchema.parse('https://example.com/callback?key=value'),
      ).not.toThrow();
    });
  });

  describe('invalid URLs throw', () => {
    it('throws for plain string without protocol', () => {
      expect(() => callbackUrlParameterSchema.parse('example.com')).toThrow();
    });

    it('throws for empty string', () => {
      expect(() => callbackUrlParameterSchema.parse('')).toThrow();
    });

    it('throws for non-string value', () => {
      expect(() => callbackUrlParameterSchema.parse(123)).toThrow();
    });

    it('throws for malformed URL', () => {
      expect(() => callbackUrlParameterSchema.parse('not-a-url')).toThrow();
    });
  });
});

// ============================================================================
// Response Schema Tests (inline object with subscriptionId)
// ============================================================================

describe('Response Schema Validation (inline object)', () => {
  describe('valid data passes', () => {
    it('accepts object with subscriptionId string', () => {
      const validResponse = { subscriptionId: '2531329f-fb09-4ef7-887e-84e648214436' };

      expect(() => responseSchema.parse(validResponse)).not.toThrow();
    });

    it('accepts any string as subscriptionId', () => {
      const validResponse = { subscriptionId: 'my-subscription-id' };

      expect(() => responseSchema.parse(validResponse)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for missing subscriptionId', () => {
      expect(() => responseSchema.parse({})).toThrow();
    });

    it('throws for wrong type for subscriptionId', () => {
      expect(() => responseSchema.parse({ subscriptionId: 123 })).toThrow();
    });

    it('throws for extra properties (strict mode)', () => {
      const data = { subscriptionId: 'test', extra: 'field' };
      expect(() => responseSchema.parse(data)).toThrow();
    });
  });
});

// ============================================================================
// QueryParams Schema Tests (object with callbackUrl)
// ============================================================================

describe('QueryParams Schema Validation', () => {
  describe('valid data passes', () => {
    it('accepts object with valid callbackUrl', () => {
      const validParams = { callbackUrl: 'https://example.com/webhook' };

      expect(() => queryParamsSchema.parse(validParams)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for invalid callbackUrl format', () => {
      const invalidParams = { callbackUrl: 'not-a-url' };

      expect(() => queryParamsSchema.parse(invalidParams)).toThrow();
    });

    it('throws for extra properties (strict mode)', () => {
      const invalidParams = { callbackUrl: 'https://example.com', extra: 'field' };

      expect(() => queryParamsSchema.parse(invalidParams)).toThrow();
    });
  });
});
