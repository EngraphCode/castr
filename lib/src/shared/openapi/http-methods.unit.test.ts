import { describe, expect, it } from 'vitest';
import {
  getAdditionalOperationMethodValidationError,
  getHttpMethodIdentifier,
  isReservedAdditionalOperationMethodName,
  isStandardHttpMethod,
  STANDARD_HTTP_METHODS,
} from './http-methods.js';

describe('shared/openapi/http-methods', () => {
  it('keeps the closed standard HTTP method list stable', () => {
    expect(STANDARD_HTTP_METHODS).toEqual([
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'head',
      'options',
      'trace',
      'query',
    ]);
  });

  it('recognizes only standard fixed-field methods', () => {
    expect(isStandardHttpMethod('get')).toBe(true);
    expect(isStandardHttpMethod('query')).toBe(true);
    expect(isStandardHttpMethod('PURGE')).toBe(false);
  });

  it('treats standard methods as reserved additionalOperations keys case-insensitively', () => {
    expect(isReservedAdditionalOperationMethodName('post')).toBe(true);
    expect(isReservedAdditionalOperationMethodName('POST')).toBe(true);
    expect(isReservedAdditionalOperationMethodName('PURGE')).toBe(false);
  });

  it('rejects empty and standard additionalOperations method names', () => {
    expect(getAdditionalOperationMethodValidationError('')).toMatch(/must not be empty/i);
    expect(getAdditionalOperationMethodValidationError('PUR GE')).toMatch(
      /valid HTTP method tokens without spaces/i,
    );
    expect(getAdditionalOperationMethodValidationError('POST')).toMatch(
      /must not appear in additionalOperations/i,
    );
    expect(getAdditionalOperationMethodValidationError('PURGE')).toBeUndefined();
  });

  it('creates stable identifier-safe names for custom methods', () => {
    expect(getHttpMethodIdentifier('get')).toBe('get');
    expect(getHttpMethodIdentifier('GET')).toBe('get');
    expect(getHttpMethodIdentifier('purge')).toBe('method_purge');
    expect(getHttpMethodIdentifier('PURGE')).toBe('method_purge__5055524745');
    expect(getHttpMethodIdentifier('PuRgE')).toBe('method_purge__5075526745');
    expect(getHttpMethodIdentifier('M-SEARCH')).toBe('method_m_search__4d2d534541524348');
  });
});
