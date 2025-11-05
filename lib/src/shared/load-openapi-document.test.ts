import path from 'node:path';

import type { LoaderPlugin, ResolveResult, bundle } from '@scalar/json-magic/bundle';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadOpenApiDocument } from './load-openapi-document.js';

// Interface for bundle result (Scalar returns loose object types)
// Architecture: Scalar's bundle() returns Record<string, unknown> which we then
// validate and narrow to BundledOpenApiDocument using a type guard (see ADR-020).
// This follows our "validate at boundaries" principle.
// We disable restricted-types here because BundleResult models Scalar's actual
// loose return type - we validate it properly when converting to OpenAPIObject
// eslint-disable-next-line @typescript-eslint/no-restricted-types
type BundleResult = Record<string, unknown>;

let currentReadFilesPlugin: LoaderPlugin;
let currentFetchUrlsPlugin: LoaderPlugin;

// Vitest v4 Mock Pattern: Use vi.hoisted() to ensure the mock is created
// before the module is imported. This is required because vi.mock() is hoisted
// above imports, so the mock function must also be hoisted.
// See: https://vitest.dev/api/vi.html#vi-hoisted
const bundleMock = vi.hoisted(() => vi.fn());

vi.mock('@scalar/json-magic/bundle', () => ({
  bundle: bundleMock,
}));

vi.mock('@scalar/json-magic/bundle/plugins/node', () => ({
  readFiles: () => currentReadFilesPlugin,
  fetchUrls: () => currentFetchUrlsPlugin,
  parseJson: vi.fn(),
  parseYaml: vi.fn(),
}));

vi.mock('@scalar/openapi-parser', () => ({
  upgrade: vi.fn((doc: unknown) => ({
    specification: doc,
    version: '3.1' as const,
  })),
}));

const successfulResolve = (raw: string, data: BundleResult): ResolveResult => ({
  ok: true,
  raw,
  data,
});

const createTrackingPlugin = (onExec: (value: string) => Promise<ResolveResult>): LoaderPlugin => {
  const validate = vi.fn((value: string) => Boolean(value));
  return {
    type: 'loader',
    validate,
    exec: async (value: string) => onExec(value),
  };
};

const expectBundleConfig = (config: Parameters<typeof bundle>[1]): void => {
  expect(Array.isArray(config.plugins)).toBe(true);
};

beforeEach(() => {
  bundleMock.mockReset();
  vi.clearAllMocks();

  currentReadFilesPlugin = createTrackingPlugin(async () => successfulResolve('{"ok":true}', {}));
  currentFetchUrlsPlugin = createTrackingPlugin(async () => successfulResolve('{"ok":true}', {}));
});

describe('loadOpenApiDocument', () => {
  it('bundles a local file and records filesystem metadata', async () => {
    const entrypoint = './examples/petstore.yaml';
    const absoluteEntrypoint = path.resolve(entrypoint);
    const scalarDocument: BundleResult = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    bundleMock.mockImplementation(async (input: unknown, config: Parameters<typeof bundle>[1]) => {
      expect(String(input)).toBe(absoluteEntrypoint);
      expectBundleConfig(config);

      const [filePlugin] = config.plugins;
      if (!filePlugin) {
        throw new Error('File plugin is required');
      }
      await (filePlugin as LoaderPlugin).exec(absoluteEntrypoint);

      return scalarDocument;
    });

    const result = await loadOpenApiDocument(entrypoint);

    expect(result.document).toStrictEqual(scalarDocument);
    expect(result.metadata.entrypoint).toStrictEqual({ kind: 'file', uri: absoluteEntrypoint });
    expect(result.metadata.files).toHaveLength(1);
    expect(result.metadata.files[0]?.absolutePath).toBe(absoluteEntrypoint);
    expect(typeof result.metadata.files[0]?.capturedAt).toBe('string');
    expect(result.metadata.urls).toHaveLength(0);
    expect(result.metadata.externalReferences).toHaveLength(0);
  });

  it('tracks multiple local references and aggregates external reference counts', async () => {
    const scalarDocument: BundleResult = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {},
    };
    const referencedFile = path.resolve('./schemas/pet.yaml');
    const anotherFile = path.resolve('./schemas/user.yaml');
    const execSequence: string[] = [];

    currentReadFilesPlugin = createTrackingPlugin(async (value) => {
      execSequence.push(value);
      return successfulResolve('{"ok":true}', {});
    });

    bundleMock.mockImplementation(async (_input: unknown, config: Parameters<typeof bundle>[1]) => {
      const [filePlugin] = config.plugins;
      if (!filePlugin) {
        throw new Error('File plugin is required');
      }
      await (filePlugin as LoaderPlugin).exec(referencedFile);
      await (filePlugin as LoaderPlugin).exec(referencedFile);
      await (filePlugin as LoaderPlugin).exec(anotherFile);
      return scalarDocument;
    });

    const result = await loadOpenApiDocument('./examples/petstore.yaml');

    expect(execSequence).toEqual([referencedFile, referencedFile, anotherFile]);
    expect(result.metadata.externalReferences).toEqual([
      { uri: referencedFile, usageCount: 2 },
      { uri: anotherFile, usageCount: 1 },
    ]);
  });

  it('captures remote URL fetches when bundling HTTP entrypoints', async () => {
    const entrypoint = new URL('https://api.example.com/openapi.yaml');
    const scalarDocument: BundleResult = {
      openapi: '3.1.0',
      info: { title: 'Remote', version: '1.0.0' },
      paths: {},
    };

    currentFetchUrlsPlugin = createTrackingPlugin(async (value) => {
      expect(value).toBe(entrypoint.toString());
      return successfulResolve('{"ok":true}', {});
    });

    bundleMock.mockImplementation(async (input: unknown, config: Parameters<typeof bundle>[1]) => {
      expect(String(input)).toBe(entrypoint.toString());
      expectBundleConfig(config);
      const [, urlPlugin] = config.plugins;
      if (!urlPlugin) {
        throw new Error('URL plugin is required');
      }
      await (urlPlugin as LoaderPlugin).exec(entrypoint.toString());
      return scalarDocument;
    });

    const result = await loadOpenApiDocument(entrypoint);

    expect(result.metadata.entrypoint).toStrictEqual({ kind: 'url', uri: entrypoint.toString() });
    expect(result.metadata.urls).toEqual([{ url: entrypoint.toString(), statusCode: undefined }]);
  });

  it('preserves internal $ref structure for circular schemas', async () => {
    const scalarDocument: BundleResult = {
      openapi: '3.1.0',
      info: { title: 'Circular', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              next: { $ref: '#/components/schemas/Node' },
            },
          },
        },
      },
    };

    bundleMock.mockResolvedValue(scalarDocument);

    const result = await loadOpenApiDocument({
      openapi: '3.1.0',
      info: { title: 'Circular', version: '1.0.0' },
      paths: {},
    });

    expect(result.document).toStrictEqual(scalarDocument);
  });

  it('collects bundler warnings for conflicting component names', async () => {
    const scalarDocument: BundleResult = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    bundleMock.mockImplementation(async (_input: unknown, config: Parameters<typeof bundle>[1]) => {
      config.hooks?.onResolveError?.({
        $ref: './schemas/conflict.yaml',
        message: 'Duplicate component name',
      });
      return scalarDocument;
    });

    const result = await loadOpenApiDocument('./examples/petstore.yaml');

    expect(result.metadata.warnings).toEqual([
      {
        code: 'resolve:error',
        message: 'Duplicate component name',
        pointer: './schemas/conflict.yaml',
      },
    ]);
  });

  it('throws a descriptive error when the entrypoint file cannot be found', async () => {
    bundleMock.mockImplementation(async () => {
      throw new Error('ENOENT: no such file or directory, open "./missing.yaml"');
    });

    await expect(loadOpenApiDocument('./missing.yaml')).rejects.toThrow('./missing.yaml');
  });

  it('throws a descriptive error when a remote fetch fails', async () => {
    bundleMock.mockImplementation(async () => {
      throw new Error(
        'Request failed with status code 504 for https://api.example.com/openapi.yaml',
      );
    });

    await expect(
      loadOpenApiDocument(new URL('https://api.example.com/openapi.yaml')),
    ).rejects.toThrow('https://api.example.com/openapi.yaml');
  });

  it('throws a descriptive error when the source YAML is invalid', async () => {
    bundleMock.mockImplementation(async () => {
      throw new Error('YAMLException: unexpected end of the stream');
    });

    await expect(loadOpenApiDocument('./examples/invalid.yaml')).rejects.toThrow('YAMLException');
  });
});
