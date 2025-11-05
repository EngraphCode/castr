import { describe, it, expect } from 'vitest';
import path from 'node:path';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { normalizeInput, isRemoteUrl } from './normalize-input.js';

describe('normalize-input', () => {
  describe('isRemoteUrl', () => {
    it('should return true for http URLs', () => {
      expect(isRemoteUrl('http://example.com/api.json')).toBe(true);
    });

    it('should return true for https URLs', () => {
      expect(isRemoteUrl('https://example.com/api.json')).toBe(true);
    });

    it('should return false for file paths', () => {
      expect(isRemoteUrl('/path/to/file.yaml')).toBe(false);
      expect(isRemoteUrl('./relative/path.yaml')).toBe(false);
      expect(isRemoteUrl('file.yaml')).toBe(false);
    });

    it('should return false for ftp URLs', () => {
      expect(isRemoteUrl('ftp://example.com/api.json')).toBe(false);
    });
  });

  describe('normalizeInput', () => {
    describe('URL input', () => {
      it('should normalize URL object to url entrypoint', () => {
        const input = new URL('https://example.com/api.json');
        const result = normalizeInput(input);

        expect(result.entrypoint.kind).toBe('url');
        expect(result.entrypoint.uri).toBe('https://example.com/api.json');
        expect(result.bundleInput).toBe('https://example.com/api.json');
        expect(result.origin).toBe('https://example.com/api.json');
        expect(result.originalDescriptor).toBe('https://example.com/api.json');
      });
    });

    describe('string input - remote URL', () => {
      it('should normalize https string to url entrypoint', () => {
        const input = 'https://example.com/openapi.yaml';
        const result = normalizeInput(input);

        expect(result.entrypoint.kind).toBe('url');
        expect(result.entrypoint.uri).toBe(input);
        expect(result.bundleInput).toBe(input);
        expect(result.origin).toBe(input);
        expect(result.originalDescriptor).toBe(input);
      });

      it('should normalize http string to url entrypoint', () => {
        const input = 'http://localhost:3000/api.json';
        const result = normalizeInput(input);

        expect(result.entrypoint.kind).toBe('url');
        expect(result.entrypoint.uri).toBe(input);
      });
    });

    describe('string input - file path', () => {
      it('should normalize relative path to file entrypoint with absolute path', () => {
        const input = './openapi.yaml';
        const result = normalizeInput(input);
        const expected = path.resolve(input);

        expect(result.entrypoint.kind).toBe('file');
        expect(result.entrypoint.uri).toBe(expected);
        expect(result.bundleInput).toBe(expected);
        expect(result.origin).toBe(expected);
        expect(result.originalDescriptor).toBe(input);
      });

      it('should normalize absolute path to file entrypoint', () => {
        const input = '/absolute/path/to/openapi.yaml';
        const result = normalizeInput(input);

        expect(result.entrypoint.kind).toBe('file');
        expect(result.entrypoint.uri).toBe(input);
        expect(result.bundleInput).toBe(input);
        expect(result.originalDescriptor).toBe(input);
      });

      it('should preserve original descriptor for relative paths', () => {
        const input = '../parent/openapi.yaml';
        const result = normalizeInput(input);

        expect(result.originalDescriptor).toBe(input);
        expect(result.entrypoint.uri).not.toBe(input); // Should be absolute
        expect(path.isAbsolute(result.entrypoint.uri)).toBe(true);
      });
    });

    describe('OpenAPIObject input', () => {
      it('should normalize in-memory object to object entrypoint', () => {
        const input: OpenAPIObject = {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {},
        };
        const result = normalizeInput(input);

        expect(result.entrypoint.kind).toBe('object');
        expect(result.entrypoint.uri).toBe('[in-memory document]');
        expect(result.bundleInput).toBe(input);
        expect(result.origin).toBeUndefined();
        expect(result.originalDescriptor).toBe('[in-memory document]');
      });
    });
  });
});
