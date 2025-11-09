import { describe, expect, it } from 'vitest';
import { z, ZodError } from 'zod';

import { formatMcpValidationError } from './mcp-error-formatting.js';

/**
 * Helper to capture Zod validation errors from a failing parse.
 */
function expectZodError<T>(schema: z.ZodType<T>, data: unknown): ZodError {
  try {
    schema.parse(data);
    throw new Error('Expected validation to fail');
  } catch (e) {
    if (e instanceof ZodError) {
      return e;
    }
    throw e;
  }
}

describe('formatMcpValidationError', () => {
  describe('simple validation failures', () => {
    it('formats a type mismatch error', () => {
      const schema = z.object({ id: z.string() });
      const error = expectZodError(schema, { id: 123 });
      const formatted = formatMcpValidationError(error);

      expect(formatted.code).toBe(-32602);
      expect(formatted.message).toBe('MCP validation failed');
      expect(formatted.data.issues).toHaveLength(1);
      expect(formatted.data.issues[0]).toEqual({
        path: ['id'],
        message: expect.stringContaining('string'),
      });
      expect(formatted.data.pointer).toBe('/id');
    });

    it('formats a missing required field error', () => {
      const schema = z.object({ name: z.string(), email: z.string() });
      const error = expectZodError(schema, { name: 'John' });
      const formatted = formatMcpValidationError(error);

      expect(formatted.code).toBe(-32602);
      expect(formatted.data.issues).toHaveLength(1);
      expect(formatted.data.issues[0]?.path).toEqual(['email']);
      expect(formatted.data.pointer).toBe('/email');
    });
  });

  describe('nested object validation failures', () => {
    it('tracks paths through nested objects', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            age: z.number(),
          }),
        }),
      });

      const error = expectZodError(schema, {
        user: {
          profile: {
            age: 'not a number',
          },
        },
      });
      const formatted = formatMcpValidationError(error);

      expect(formatted.data.issues[0]?.path).toEqual(['user', 'profile', 'age']);
      expect(formatted.data.pointer).toBe('/user/profile/age');
    });

    it('handles multiple nested errors', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      const error = expectZodError(schema, {
        user: {
          name: 123,
          age: 'twenty',
        },
      });
      const formatted = formatMcpValidationError(error);

      expect(formatted.data.issues).toHaveLength(2);
      expect(formatted.data.issues[0]?.path).toEqual(['user', 'name']);
      expect(formatted.data.issues[1]?.path).toEqual(['user', 'age']);
    });
  });

  describe('array validation failures', () => {
    it('tracks array indices in paths', () => {
      const schema = z.object({
        items: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          }),
        ),
      });

      const error = expectZodError(schema, {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 'not a number', name: 'Item 2' },
        ],
      });
      const formatted = formatMcpValidationError(error);

      expect(formatted.data.issues[0]?.path).toEqual(['items', 1, 'id']);
      expect(formatted.data.pointer).toBe('/items/1/id');
    });

    it('handles multiple array element errors', () => {
      const schema = z.array(z.number());
      const error = expectZodError(schema, [1, 'two', 3, 'four']);
      const formatted = formatMcpValidationError(error);

      expect(formatted.data.issues).toHaveLength(2);
      expect(formatted.data.issues[0]?.path).toEqual([1]);
      expect(formatted.data.issues[1]?.path).toEqual([3]);
    });
  });

  describe('context integration', () => {
    it('includes tool name in message when provided', () => {
      const schema = z.object({ id: z.string() });
      const error = expectZodError(schema, { id: 123 });
      const formatted = formatMcpValidationError(error, {
        toolName: 'get_user',
        direction: 'input',
      });

      expect(formatted.message).toContain('get_user');
      expect(formatted.message).toContain('input');
    });

    it('handles output direction context', () => {
      const schema = z.object({ result: z.string() });
      const error = expectZodError(schema, { result: 123 });
      const formatted = formatMcpValidationError(error, {
        toolName: 'process_data',
        direction: 'output',
      });

      expect(formatted.message).toContain('process_data');
      expect(formatted.message).toContain('output');
    });

    it('provides generic message without context', () => {
      const schema = z.object({ id: z.string() });
      const error = expectZodError(schema, { id: 123 });
      const formatted = formatMcpValidationError(error);

      expect(formatted.message).toBe('MCP validation failed');
    });
  });

  describe('edge cases', () => {
    it('handles root-level validation errors', () => {
      const schema = z.string();
      const error = expectZodError(schema, 123);
      const formatted = formatMcpValidationError(error);

      expect(formatted.data.issues[0]?.path).toEqual([]);
      expect(formatted.data.pointer).toBe('/');
    });

    it('handles union type errors with multiple issues', () => {
      const schema = z.union([z.string(), z.number()]);
      const error = expectZodError(schema, null);
      const formatted = formatMcpValidationError(error);

      // Union errors can have multiple issues
      expect(formatted.data.issues.length).toBeGreaterThan(0);
    });

    it('preserves original error information', () => {
      const schema = z.object({ id: z.string() });
      const error = expectZodError(schema, { id: 123 });
      const formatted = formatMcpValidationError(error);

      // Verify we have enough information to recreate the error if needed
      expect(formatted.data.issues[0]?.message).toBeTruthy();
      expect(formatted.data.issues[0]?.path).toBeTruthy();
    });
  });
});
