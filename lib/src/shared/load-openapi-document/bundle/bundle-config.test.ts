import { describe, it, expect } from 'vitest';
import type { OTTBundleWarning } from './bundle-metadata.types.js';
import { buildWarning, createBundleConfig, type OTTResolveNode } from './bundle-config.js';
import type { LoaderPlugin } from '@scalar/json-magic/bundle';

describe('bundle-config', () => {
  describe('buildWarning', () => {
    it('should build warning from node with pointer', () => {
      const node: OTTResolveNode = {
        pointer: '/components/schemas/User',
        message: 'Schema not found',
      };

      const warning = buildWarning(node);

      expect(warning).toEqual({
        code: 'resolve:error',
        message: 'Schema not found',
        pointer: '/components/schemas/User',
      });
    });

    it('should build warning from node with $ref', () => {
      const node: OTTResolveNode = {
        $ref: '#/components/schemas/User',
        message: 'Reference broken',
      };

      const warning = buildWarning(node);

      expect(warning).toEqual({
        code: 'resolve:error',
        message: 'Reference broken',
        pointer: '#/components/schemas/User',
      });
    });

    it('should prefer pointer over $ref', () => {
      const node: OTTResolveNode = {
        pointer: '/paths/users',
        $ref: '#/components/schemas/User',
        message: 'Error',
      };

      const warning = buildWarning(node);

      expect(warning.pointer).toBe('/paths/users');
    });

    it('should use default message if message is not string', () => {
      const node: OTTResolveNode = {
        pointer: '/test',
        message: { error: 'object message' },
      };

      const warning = buildWarning(node);

      expect(warning.message).toBe('Failed to resolve reference');
    });

    it('should omit pointer if not available', () => {
      const node: OTTResolveNode = {
        message: 'Some error',
      };

      const warning = buildWarning(node);

      expect(warning).toEqual({
        code: 'resolve:error',
        message: 'Some error',
      });
      expect('pointer' in warning).toBe(false);
    });

    it('should handle non-string pointer values', () => {
      const node: OTTResolveNode = {
        pointer: 123,
        $ref: { ref: 'object' },
        message: 'Error',
      };

      const warning = buildWarning(node);

      expect('pointer' in warning).toBe(false);
    });
  });

  describe('createBundleConfig', () => {
    const mockFilePlugin: LoaderPlugin = {
      type: 'loader',
      validate: () => true,
      exec: async () => ({ ok: true, data: '', raw: '' }),
    };

    const mockUrlPlugin: LoaderPlugin = {
      type: 'loader',
      validate: () => true,
      exec: async () => ({ ok: true, data: '', raw: '' }),
    };

    it('should create config with plugins', () => {
      const warnings: OTTBundleWarning[] = [];
      const config = createBundleConfig(mockFilePlugin, mockUrlPlugin, undefined, warnings);

      expect(config.plugins).toEqual([mockFilePlugin, mockUrlPlugin]);
      expect(config.treeShake).toBe(false);
      expect(config.urlMap).toBe(true);
    });

    it('should include origin if provided', () => {
      const warnings: OTTBundleWarning[] = [];
      const origin = 'https://example.com/api';
      const config = createBundleConfig(mockFilePlugin, mockUrlPlugin, origin, warnings);

      expect(config.origin).toBe(origin);
    });

    it('should not include origin if undefined', () => {
      const warnings: OTTBundleWarning[] = [];
      const config = createBundleConfig(mockFilePlugin, mockUrlPlugin, undefined, warnings);

      expect('origin' in config).toBe(false);
    });

    it('should configure onResolveError hook to push warnings', () => {
      const warnings: OTTBundleWarning[] = [];
      const config = createBundleConfig(mockFilePlugin, mockUrlPlugin, undefined, warnings);

      const mockNode: OTTResolveNode = {
        pointer: '/test',
        message: 'Test error',
      };

      // Cast needed as Scalar's hook expects unknown object structure
      config.hooks?.onResolveError?.(mockNode as never);

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toEqual({
        code: 'resolve:error',
        message: 'Test error',
        pointer: '/test',
      });
    });

    it('should push multiple warnings', () => {
      const warnings: OTTBundleWarning[] = [];
      const config = createBundleConfig(mockFilePlugin, mockUrlPlugin, undefined, warnings);

      // Cast needed as Scalar's hook expects unknown object structure
      config.hooks?.onResolveError?.({ pointer: '/error1', message: 'Error 1' } as never);
      config.hooks?.onResolveError?.({ pointer: '/error2', message: 'Error 2' } as never);

      expect(warnings).toHaveLength(2);
      expect(warnings[0]?.message).toBe('Error 1');
      expect(warnings[1]?.message).toBe('Error 2');
    });
  });
});
