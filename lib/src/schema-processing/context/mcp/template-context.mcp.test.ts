import { describe, expect, test } from 'vitest';
import { getMcpToolHints, getMcpToolName } from './template-context.mcp.js';

describe('template-context MCP helpers', () => {
  describe('getMcpToolName', () => {
    test('uses snake_case operationId when available', () => {
      expect(getMcpToolName('getUserById', 'get', '/users/{id}')).toBe('get_user_by_id');
    });

    test('falls back to method and path segments when operationId missing', () => {
      expect(getMcpToolName(undefined, 'delete', '/users/{user-id}/sessions')).toBe(
        'delete_users_user_id_sessions',
      );
    });

    test('preserves custom HTTP methods in fallback names', () => {
      expect(getMcpToolName(undefined, 'PURGE', '/users/{user-id}/sessions')).toBe(
        'method_purge_5055524745_users_user_id_sessions',
      );
    });

    test('normalizes reserved standard spellings in fallback names', () => {
      expect(getMcpToolName(undefined, 'GET', '/users/{user-id}/sessions')).toBe(
        'get_users_user_id_sessions',
      );
    });

    test('disambiguates case-distinct custom methods in fallback names', () => {
      expect(getMcpToolName(undefined, 'PURGE', '/users')).not.toBe(
        getMcpToolName(undefined, 'PuRgE', '/users'),
      );
    });

    test('produces root suffix when path has no segments', () => {
      expect(getMcpToolName(undefined, 'get', '/')).toBe('get_root');
    });

    test('normalizes existing snake case operationId to lowercase', () => {
      expect(getMcpToolName('Already_snake_case', 'get', '/users')).toBe('already_snake_case');
    });
  });

  describe('getMcpToolHints', () => {
    test('marks readOnly for GET requests', () => {
      expect(getMcpToolHints('get')).toEqual({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      });
    });

    test('marks readOnly for reserved standard spellings case-insensitively', () => {
      expect(getMcpToolHints('GET')).toEqual({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      });
    });

    test('marks readOnly for QUERY requests', () => {
      expect(getMcpToolHints('query')).toEqual({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      });
    });

    test('marks destructive for DELETE requests', () => {
      expect(getMcpToolHints('delete')).toEqual({
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      });
    });

    test('marks idempotent for PUT requests', () => {
      expect(getMcpToolHints('put')).toEqual({
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      });
    });

    test('keeps all hints false for methods without a mapping', () => {
      expect(getMcpToolHints('post')).toEqual({
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      });
    });

    test('keeps all hints false for custom methods', () => {
      expect(getMcpToolHints('PURGE')).toEqual({
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      });
    });
  });
});
