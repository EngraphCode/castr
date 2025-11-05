import { describe, it, expect } from 'vitest';
import type {
  OTTBundleFileEntry,
  OTTBundleUrlEntry,
  OTTBundleWarning,
} from '../bundle-metadata.types.js';
import { formatDescriptor, createMetadata } from './metadata.js';

describe('metadata', () => {
  describe('formatDescriptor', () => {
    it('should return URI if same as original', () => {
      const result = formatDescriptor('/project/openapi.yaml', '/project/openapi.yaml');
      expect(result).toBe('/project/openapi.yaml');
    });

    it('should show transformation if different', () => {
      const result = formatDescriptor('./api.yaml', '/absolute/path/api.yaml');
      expect(result).toBe('./api.yaml -> /absolute/path/api.yaml');
    });

    it('should handle URL transformations', () => {
      const result = formatDescriptor(
        'https://example.com/api.yaml',
        'https://example.com/api.yaml',
      );
      expect(result).toBe('https://example.com/api.yaml');
    });
  });

  describe('createMetadata', () => {
    it('should create metadata with all fields', () => {
      const entrypoint = { kind: 'file' as const, uri: '/project/api.yaml' };
      const files: OTTBundleFileEntry[] = [
        { absolutePath: '/project/api.yaml', capturedAt: '2024-01-01T00:00:00Z' },
        { absolutePath: '/project/schemas/user.yaml', capturedAt: '2024-01-01T00:00:01Z' },
      ];
      const urls: OTTBundleUrlEntry[] = [{ url: 'https://example.com/common.yaml' }];
      const warnings: OTTBundleWarning[] = [{ code: 'resolve:error', message: 'Test warning' }];
      const externalRefs = new Map([
        ['/project/schemas/user.yaml', 2],
        ['https://example.com/common.yaml', 1],
      ]);

      const metadata = createMetadata(entrypoint, files, urls, warnings, externalRefs);

      expect(metadata.entrypoint).toEqual(entrypoint);
      expect(metadata.files).toEqual(files);
      expect(metadata.urls).toEqual(urls);
      expect(metadata.warnings).toEqual(warnings);
      expect(metadata.externalReferences).toEqual([
        { uri: '/project/schemas/user.yaml', usageCount: 2 },
        { uri: 'https://example.com/common.yaml', usageCount: 1 },
      ]);
    });

    it('should handle empty external references', () => {
      const entrypoint = { kind: 'object' as const, uri: '[in-memory document]' };
      const externalRefs = new Map<string, number>();

      const metadata = createMetadata(entrypoint, [], [], [], externalRefs);

      expect(metadata.externalReferences).toEqual([]);
    });

    it('should convert Map to array format', () => {
      const entrypoint = { kind: 'file' as const, uri: '/test.yaml' };
      const externalRefs = new Map([
        ['/file1.yaml', 3],
        ['/file2.yaml', 1],
        ['/file3.yaml', 5],
      ]);

      const metadata = createMetadata(entrypoint, [], [], [], externalRefs);

      expect(metadata.externalReferences).toHaveLength(3);
      expect(metadata.externalReferences).toContainEqual({ uri: '/file1.yaml', usageCount: 3 });
      expect(metadata.externalReferences).toContainEqual({ uri: '/file2.yaml', usageCount: 1 });
      expect(metadata.externalReferences).toContainEqual({ uri: '/file3.yaml', usageCount: 5 });
    });
  });
});
