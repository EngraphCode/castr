import { describe, it, expect } from 'vitest';
import type { OTTBundleFileEntry, OTTBundleUrlEntry } from '../bundle-metadata.types.js';
import {
  createFileRecorder,
  createUrlRecorder,
  wrapLoaderPlugin,
  setupBundleInfrastructure,
} from './bundle-infrastructure.js';
import type { LoaderPlugin } from '@scalar/json-magic/bundle';

describe('bundle-infrastructure', () => {
  describe('createFileRecorder', () => {
    it('should record absolute file paths', () => {
      const files: OTTBundleFileEntry[] = [];
      const externalRefs = new Map<string, number>();
      const recorder = createFileRecorder('/project/openapi.yaml', files, externalRefs);

      recorder('/project/schemas/user.yaml');

      expect(files).toHaveLength(1);
      expect(files[0]?.absolutePath).toBe('/project/schemas/user.yaml');
      expect(files[0]?.capturedAt).toBeDefined();
    });

    it('should resolve relative paths from entrypoint directory', () => {
      const files: OTTBundleFileEntry[] = [];
      const externalRefs = new Map<string, number>();
      const recorder = createFileRecorder('/project/spec/openapi.yaml', files, externalRefs);

      recorder('../schemas/user.yaml');

      expect(files).toHaveLength(1);
      expect(files[0]?.absolutePath).toBe('/project/schemas/user.yaml');
    });

    it('should not duplicate files', () => {
      const files: OTTBundleFileEntry[] = [];
      const externalRefs = new Map<string, number>();
      const recorder = createFileRecorder('/project/openapi.yaml', files, externalRefs);

      recorder('/project/schemas/user.yaml');
      recorder('/project/schemas/user.yaml');

      expect(files).toHaveLength(1);
    });

    it('should track external references (not entrypoint)', () => {
      const files: OTTBundleFileEntry[] = [];
      const externalRefs = new Map<string, number>();
      const entrypoint = '/project/openapi.yaml';
      const recorder = createFileRecorder(entrypoint, files, externalRefs);

      recorder('/project/schemas/user.yaml');
      recorder('/project/schemas/user.yaml');
      recorder('/project/schemas/product.yaml');

      expect(externalRefs.get('/project/schemas/user.yaml')).toBe(2);
      expect(externalRefs.get('/project/schemas/product.yaml')).toBe(1);
    });

    it('should not track entrypoint as external reference', () => {
      const files: OTTBundleFileEntry[] = [];
      const externalRefs = new Map<string, number>();
      const entrypoint = '/project/openapi.yaml';
      const recorder = createFileRecorder(entrypoint, files, externalRefs);

      recorder(entrypoint);

      expect(externalRefs.has(entrypoint)).toBe(false);
    });
  });

  describe('createUrlRecorder', () => {
    it('should record URLs', () => {
      const urls: OTTBundleUrlEntry[] = [];
      const externalRefs = new Map<string, number>();
      const recorder = createUrlRecorder('https://example.com/api.yaml', urls, externalRefs);

      recorder('https://example.com/schemas/user.yaml');

      expect(urls).toHaveLength(1);
      expect(urls[0]?.url).toBe('https://example.com/schemas/user.yaml');
    });

    it('should not duplicate URLs', () => {
      const urls: OTTBundleUrlEntry[] = [];
      const externalRefs = new Map<string, number>();
      const recorder = createUrlRecorder('https://example.com/api.yaml', urls, externalRefs);

      recorder('https://example.com/schemas/user.yaml');
      recorder('https://example.com/schemas/user.yaml');

      expect(urls).toHaveLength(1);
    });

    it('should track external URL references', () => {
      const urls: OTTBundleUrlEntry[] = [];
      const externalRefs = new Map<string, number>();
      const recorder = createUrlRecorder('https://example.com/api.yaml', urls, externalRefs);

      recorder('https://example.com/schemas/user.yaml');
      recorder('https://example.com/schemas/user.yaml');
      recorder('https://other.com/types.yaml');

      expect(externalRefs.get('https://example.com/schemas/user.yaml')).toBe(2);
      expect(externalRefs.get('https://other.com/types.yaml')).toBe(1);
    });

    it('should not track entrypoint URL as external', () => {
      const urls: OTTBundleUrlEntry[] = [];
      const externalRefs = new Map<string, number>();
      const entrypoint = 'https://example.com/api.yaml';
      const recorder = createUrlRecorder(entrypoint, urls, externalRefs);

      recorder(entrypoint);

      expect(externalRefs.has(entrypoint)).toBe(false);
    });
  });

  describe('wrapLoaderPlugin', () => {
    it('should call recordHit on successful load', async () => {
      const hits: string[] = [];
      const mockPlugin: LoaderPlugin = {
        type: 'loader',
        validate: () => true,
        exec: async (value) => ({ ok: true, data: value, raw: value }),
      };

      const wrapped = wrapLoaderPlugin(mockPlugin, (value) => {
        hits.push(value);
      });

      await wrapped.exec('test-file.yaml');

      expect(hits).toEqual(['test-file.yaml']);
    });

    it('should not call recordHit on failed load', async () => {
      const hits: string[] = [];
      const mockPlugin: LoaderPlugin = {
        type: 'loader',
        validate: () => true,
        exec: async () => ({ ok: false }),
      };

      const wrapped = wrapLoaderPlugin(mockPlugin, (value) => {
        hits.push(value);
      });

      await wrapped.exec('test-file.yaml');

      expect(hits).toEqual([]);
    });

    it('should preserve plugin type and validate function', () => {
      const mockPlugin: LoaderPlugin = {
        type: 'loader',
        validate: (value: string) => value.endsWith('.yaml'),
        exec: async () => ({ ok: true, data: '', raw: '' }),
      };

      const wrapped = wrapLoaderPlugin(mockPlugin, () => {
        // No-op recorder for test
      });

      expect(wrapped.type).toBe('loader');
      expect(wrapped.validate('file.yaml')).toBe(true);
      expect(wrapped.validate('file.json')).toBe(false);
    });
  });

  describe('setupBundleInfrastructure', () => {
    it('should create complete infrastructure', () => {
      const infrastructure = setupBundleInfrastructure('/project/openapi.yaml');

      expect(infrastructure.files).toEqual([]);
      expect(infrastructure.urls).toEqual([]);
      expect(infrastructure.externalReferences).toBeInstanceOf(Map);
      expect(infrastructure.filePlugin).toBeDefined();
      expect(infrastructure.urlPlugin).toBeDefined();
      expect(infrastructure.filePlugin.type).toBe('loader');
      expect(infrastructure.urlPlugin.type).toBe('loader');
    });

    it('should create infrastructure with shared reference map', () => {
      const infrastructure = setupBundleInfrastructure('/project/openapi.yaml');

      // Both files and URLs should share the same externalReferences map
      expect(infrastructure.externalReferences).toBe(infrastructure.externalReferences);
    });
  });
});
