import path from 'node:path';

import type { LoaderPlugin } from '@scalar/json-magic/bundle';
import { bundle } from '@scalar/json-magic/bundle';
import { fetchUrls, readFiles } from '@scalar/json-magic/bundle/plugins/node';
import { upgrade } from '@scalar/openapi-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

import type {
  BundleFileEntry,
  BundleMetadata,
  BundleUrlEntry,
  BundleWarning,
  LoadedOpenApiDocument,
  BundledOpenApiDocument,
} from './bundle-metadata.types.js';
import { isOpenAPIObject } from '../validation/cli-type-guards.js';

interface NormalizedInput {
  readonly entrypoint: BundleMetadata['entrypoint'];
  readonly bundleInput: string | OpenAPIObject;
  readonly origin?: string;
  readonly originalDescriptor: string;
}

const IN_MEMORY_DESCRIPTOR = '[in-memory document]';
interface ResolveNode {
  readonly pointer?: unknown;
  readonly $ref?: unknown;
  readonly message?: unknown;
}
const isRemoteUrl = (value: string): boolean => /^https?:\/\//iu.test(value);

// Type guard validating a value is a valid OpenAPI 3.1 document
function isBundledOpenApiDocument(value: unknown): value is BundledOpenApiDocument {
  if (!isOpenAPIObject(value)) {
    return false;
  }
  // Ensure it's 3.1.x (upgrade() should guarantee this)
  if (typeof value.openapi !== 'string' || !value.openapi.startsWith('3.1.')) {
    return false;
  }
  return true;
}

function normalizeInput(input: string | URL | OpenAPIObject): NormalizedInput {
  if (input instanceof URL) {
    const href = input.toString();
    return {
      entrypoint: { kind: 'url', uri: href },
      bundleInput: href,
      origin: href,
      originalDescriptor: href,
    };
  }
  if (typeof input === 'string') {
    const descriptor = input;
    if (isRemoteUrl(input)) {
      return {
        entrypoint: { kind: 'url', uri: input },
        bundleInput: input,
        origin: input,
        originalDescriptor: descriptor,
      };
    }
    const absolutePath = path.resolve(input);
    return {
      entrypoint: { kind: 'file', uri: absolutePath },
      bundleInput: absolutePath,
      origin: absolutePath,
      originalDescriptor: descriptor,
    };
  }
  // In-memory object - pass directly to Scalar
  return {
    entrypoint: { kind: 'object', uri: IN_MEMORY_DESCRIPTOR },
    bundleInput: input,
    originalDescriptor: IN_MEMORY_DESCRIPTOR,
  };
}

const createFileRecorder = (
  entrypointUri: string,
  files: BundleFileEntry[],
  externalReferences: Map<string, number>,
): ((rawPath: string) => void) => {
  const seenAbsolutePaths = new Set<string>(files.map((file) => file.absolutePath));
  const entrypointDirectory =
    entrypointUri && path.isAbsolute(entrypointUri) ? path.dirname(entrypointUri) : process.cwd();

  return (rawPath: string) => {
    const absolutePath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(entrypointDirectory, rawPath);

    if (!seenAbsolutePaths.has(absolutePath)) {
      files.push({
        absolutePath,
        capturedAt: new Date().toISOString(),
      });
      seenAbsolutePaths.add(absolutePath);
    }

    if (absolutePath !== entrypointUri) {
      externalReferences.set(absolutePath, (externalReferences.get(absolutePath) ?? 0) + 1);
    }
  };
};

const createUrlRecorder = (
  entrypointUri: string,
  urls: BundleUrlEntry[],
  externalReferences: Map<string, number>,
): ((url: string) => void) => {
  const seenUrls = new Set<string>(urls.map((entry) => entry.url));

  return (url: string) => {
    if (!seenUrls.has(url)) {
      urls.push({ url });
      seenUrls.add(url);
    }

    if (url !== entrypointUri) {
      externalReferences.set(url, (externalReferences.get(url) ?? 0) + 1);
    }
  };
};

function wrapLoaderPlugin(plugin: LoaderPlugin, recordHit: (value: string) => void): LoaderPlugin {
  return {
    type: 'loader',
    validate: plugin.validate,
    exec: async (value: string) => {
      const result = await plugin.exec(value);
      if (result.ok) {
        recordHit(value);
      }
      return result;
    },
  };
}

function buildWarning(node: ResolveNode): BundleWarning {
  const pointerValue = node.pointer;
  const refValue = node.$ref;
  let pointer: string | undefined;
  if (typeof pointerValue === 'string') {
    pointer = pointerValue;
  } else if (typeof refValue === 'string') {
    pointer = refValue;
  }
  const messageValue = node.message;
  const message = typeof messageValue === 'string' ? messageValue : 'Failed to resolve reference';
  if (pointer === undefined) {
    return { code: 'resolve:error', message };
  }
  return { code: 'resolve:error', message, pointer };
}

export async function loadOpenApiDocument(
  input: string | URL | OpenAPIObject,
): Promise<LoadedOpenApiDocument> {
  const normalizedInput: NormalizedInput = normalizeInput(input);
  const { entrypoint, bundleInput, origin, originalDescriptor } = normalizedInput;

  const files: BundleFileEntry[] = [];
  const urls: BundleUrlEntry[] = [];
  const warnings: BundleWarning[] = [];
  const externalReferences = new Map<string, number>();

  const fileRecorder = createFileRecorder(entrypoint.uri, files, externalReferences);
  const urlRecorder = createUrlRecorder(entrypoint.uri, urls, externalReferences);

  const filePlugin = wrapLoaderPlugin(readFiles(), fileRecorder);
  const urlPlugin = wrapLoaderPlugin(fetchUrls(), urlRecorder);

  try {
    const bundleConfig = createBundleConfig(filePlugin, urlPlugin, origin, warnings);
    // bundleInput is either a string (file path/URL) or OpenAPIObject
    // Pass directly - Scalar's bundle accepts both
    const bundledDocument = await bundle(bundleInput as Parameters<typeof bundle>[0], bundleConfig);

    // Upgrade to OpenAPI 3.1
    const { specification: upgraded } = upgrade(bundledDocument);

    // Validate at boundary
    if (!isBundledOpenApiDocument(upgraded)) {
      throw new Error('Failed to produce valid OpenAPI 3.1 document');
    }

    return {
      document: upgraded,
      metadata: createMetadata(entrypoint, files, urls, warnings, externalReferences),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const descriptor = formatDescriptor(originalDescriptor, entrypoint.uri);
    throw new Error(`Failed to load OpenAPI document (${descriptor}): ${message}`);
  }
}

function createBundleConfig(
  filePlugin: LoaderPlugin,
  urlPlugin: LoaderPlugin,
  origin: string | undefined,
  warnings: BundleWarning[],
): Parameters<typeof bundle>[1] {
  const config: Parameters<typeof bundle>[1] = {
    plugins: [filePlugin, urlPlugin],
    treeShake: false,
    urlMap: true,
    hooks: {
      onResolveError: (node: ResolveNode) => {
        warnings.push(buildWarning(node));
      },
    },
  };

  if (origin !== undefined) {
    config.origin = origin;
  }

  return config;
}

function createMetadata(
  entrypoint: BundleMetadata['entrypoint'],
  files: BundleFileEntry[],
  urls: BundleUrlEntry[],
  warnings: BundleWarning[],
  externalReferences: Map<string, number>,
): BundleMetadata {
  return {
    entrypoint,
    files,
    urls,
    warnings,
    externalReferences: Array.from(externalReferences.entries()).map(([uri, usageCount]) => ({
      uri,
      usageCount,
    })),
  };
}

function formatDescriptor(originalDescriptor: string, entrypointUri: string): string {
  if (originalDescriptor === entrypointUri) {
    return entrypointUri;
  }
  return `${originalDescriptor} -> ${entrypointUri}`;
}
