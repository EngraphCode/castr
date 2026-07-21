import { describe, expect, it } from 'vitest';
import { detectOpenApiPreflightSchemaVersion } from './version.js';

describe('detectOpenApiPreflightSchemaVersion', () => {
  it('detects 3.1 documents', () => {
    expect(detectOpenApiPreflightSchemaVersion({ openapi: '3.1.0' })).toBe('3.1');
  });

  it('detects 3.2 documents', () => {
    expect(detectOpenApiPreflightSchemaVersion({ openapi: '3.2.0' })).toBe('3.2');
  });

  it('returns undefined for unsupported minor versions', () => {
    expect(detectOpenApiPreflightSchemaVersion({ openapi: '3.0.3' })).toBeUndefined();
  });

  it('returns undefined for non-3.x documents', () => {
    expect(detectOpenApiPreflightSchemaVersion({ openapi: '2.0' })).toBeUndefined();
  });

  it('returns undefined for documents without an openapi string', () => {
    expect(detectOpenApiPreflightSchemaVersion({})).toBeUndefined();
    expect(detectOpenApiPreflightSchemaVersion({ openapi: 3.1 })).toBeUndefined();
  });

  it('returns undefined for non-object input', () => {
    expect(detectOpenApiPreflightSchemaVersion(null)).toBeUndefined();
    expect(detectOpenApiPreflightSchemaVersion(undefined)).toBeUndefined();
    expect(detectOpenApiPreflightSchemaVersion('3.1.0')).toBeUndefined();
  });

  it('rejects arrays, even ones carrying an openapi property', () => {
    expect(detectOpenApiPreflightSchemaVersion([])).toBeUndefined();
    expect(
      detectOpenApiPreflightSchemaVersion(Object.assign([], { openapi: '3.1.0' })),
    ).toBeUndefined();
  });
});
