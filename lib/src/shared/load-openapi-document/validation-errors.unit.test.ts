/**
 * Unit tests for validation error formatting utilities.
 *
 * TDD RED phase: These tests are written BEFORE implementation.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

import {
  formatValidationPath,
  getValidationHint,
  formatValidationError,
} from './validation-errors.js';

describe('formatValidationPath', () => {
  it('converts JSON pointer to readable path', () => {
    const result = formatValidationPath('/paths/~1test/get/responses/200');
    expect(result).toBe('paths → /test → get → responses → 200');
  });

  it('handles escaped slashes in JSON pointers', () => {
    const result = formatValidationPath('/paths/~1users~1{id}/post');
    expect(result).toBe('paths → /users/{id} → post');
  });

  it('handles root path', () => {
    const result = formatValidationPath('/');
    expect(result).toBe('(root)');
  });

  it('handles empty path', () => {
    const result = formatValidationPath('');
    expect(result).toBe('(root)');
  });

  it('handles single segment path', () => {
    const result = formatValidationPath('/info');
    expect(result).toBe('info');
  });
});

describe('getValidationHint', () => {
  it('provides hint for missing response description', () => {
    const hint = getValidationHint(
      'must have required property',
      '/paths/~1test/get/responses/200',
    );
    expect(hint).toContain('description');
  });

  it('provides hint for missing info', () => {
    const hint = getValidationHint('must have required property', '/info');
    expect(hint).toContain('info');
  });

  it('provides hint for missing paths in 3.0.x', () => {
    const hint = getValidationHint('must have required property', '/paths');
    expect(hint).toContain('paths');
  });

  it('provides hint for invalid type value', () => {
    const hint = getValidationHint(
      'must be equal to one of the allowed values',
      '/components/schemas/Test/properties/value/type',
    );
    expect(hint).toContain('type');
  });

  it('returns undefined for unknown errors', () => {
    const hint = getValidationHint('some unknown error', '/unknown/path');
    expect(hint).toBeUndefined();
  });
});

describe('formatValidationError', () => {
  it('formats a single validation error with path and message', () => {
    const error = {
      message: 'must have required property',
      path: '/paths/~1test/get/responses/200',
    };

    const result = formatValidationError(error);

    expect(result).toContain('paths → /test → get → responses → 200');
    expect(result).toContain('must have required property');
  });

  it('includes hint when available', () => {
    const error = {
      message: 'must have required property',
      path: '/paths/~1test/get/responses/200',
    };

    const result = formatValidationError(error);

    expect(result).toContain('Hint');
    expect(result).toContain('description');
  });

  it('formats nicely without hint for unknown errors', () => {
    const error = {
      message: 'some unknown error',
      path: '/unknown/path',
    };

    const result = formatValidationError(error);

    expect(result).toContain('unknown → path');
    expect(result).toContain('some unknown error');
    expect(result).not.toContain('Hint');
  });
});
