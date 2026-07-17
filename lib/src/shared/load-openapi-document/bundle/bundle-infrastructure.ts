/**
 * Bundle infrastructure setup for OpenAPI document loading
 * Handles file/URL recording and plugin wrapping
 * @internal
 */

import path from 'node:path';
import type { LoaderPlugin } from '@scalar/json-magic/bundle';
import { fetchUrls, readFiles } from '@scalar/json-magic/bundle/plugins/node';
import type {
  OTTBundleFileEntry,
  OTTBundleUrlEntry,
  OTTBundleWarning,
} from './bundle-metadata.types.js';

/**
 * Bundle infrastructure components.
 *
 * **OTT Domain Type** - Internal coordination for bundle setup.
 */
export interface OTTBundleInfrastructure {
  readonly files: OTTBundleFileEntry[];
  readonly urls: OTTBundleUrlEntry[];
  readonly warnings: OTTBundleWarning[];
  readonly externalReferences: Map<string, number>;
  readonly filePlugin: LoaderPlugin;
  readonly urlPlugin: LoaderPlugin;
}

/**
 * Injectable sources for the environment-dependent values captured into
 * bundle metadata.
 *
 * **OTT Domain Type** - Internal coordination for bundle setup.
 *
 * @remarks
 * Bundle metadata is output-bound: `capturedAt` timestamps and resolved
 * absolute paths end up in {@link OTTBundleFileEntry} values. Injecting the
 * clock and the fallback base directory keeps those values deterministic and
 * free of machine-local leakage when the caller needs reproducible runs.
 * The defaults preserve the previous behaviour (wall clock + `process.cwd()`).
 */
export interface OTTBundleCaptureContext {
  /** Returns the ISO-8601 timestamp recorded as {@link OTTBundleFileEntry.capturedAt}. */
  readonly now: () => string;
  /** Base directory for resolving relative paths when the entrypoint is not absolute. */
  readonly fallbackBaseDirectory: string;
}

/**
 * Create the default capture context: wall clock and current working directory.
 *
 * @returns Capture context matching the historical implicit behaviour
 * @internal
 */
function createDefaultCaptureContext(): OTTBundleCaptureContext {
  return {
    now: () => new Date().toISOString(),
    fallbackBaseDirectory: process.cwd(),
  };
}

/**
 * Create file recorder that tracks loaded files and external references.
 *
 * @param entrypointUri - Absolute path to entrypoint file
 * @param files - Array to populate with file entries
 * @param externalReferences - Map to track reference counts
 * @param captureContext - Sources for timestamp and relative-path resolution
 * @returns Recorder function to call when a file is loaded
 * @internal
 */
export function createFileRecorder(
  entrypointUri: string,
  files: OTTBundleFileEntry[],
  externalReferences: Map<string, number>,
  captureContext: OTTBundleCaptureContext = createDefaultCaptureContext(),
): (rawPath: string) => void {
  const seenAbsolutePaths = new Set<string>(files.map((file) => file.absolutePath));
  const entrypointDirectory =
    entrypointUri && path.isAbsolute(entrypointUri)
      ? path.dirname(entrypointUri)
      : captureContext.fallbackBaseDirectory;

  return (rawPath: string) => {
    const absolutePath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(entrypointDirectory, rawPath);

    if (!seenAbsolutePaths.has(absolutePath)) {
      files.push({
        absolutePath,
        capturedAt: captureContext.now(),
      });
      seenAbsolutePaths.add(absolutePath);
    }

    if (absolutePath !== entrypointUri) {
      externalReferences.set(absolutePath, (externalReferences.get(absolutePath) ?? 0) + 1);
    }
  };
}

/**
 * Create URL recorder that tracks loaded URLs and external references.
 *
 * @param entrypointUri - URL of entrypoint
 * @param urls - Array to populate with URL entries
 * @param externalReferences - Map to track reference counts
 * @returns Recorder function to call when a URL is loaded
 * @internal
 */
export function createUrlRecorder(
  entrypointUri: string,
  urls: OTTBundleUrlEntry[],
  externalReferences: Map<string, number>,
): (url: string) => void {
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
}

/**
 * Wrap loader plugin to record successful loads.
 *
 * @param plugin - Original loader plugin
 * @param recordHit - Function to call on successful load
 * @returns Wrapped plugin that records hits
 * @internal
 */
export function wrapLoaderPlugin(
  plugin: LoaderPlugin,
  recordHit: (value: string) => void,
): LoaderPlugin {
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

/**
 * Setup complete bundle infrastructure with recorders and plugins.
 *
 * @param entrypointUri - URI of the entrypoint (file path or URL)
 * @param captureContext - Sources for timestamp and relative-path resolution
 * @returns Infrastructure components ready for bundling
 * @public
 */
export function setupBundleInfrastructure(
  entrypointUri: string,
  captureContext: OTTBundleCaptureContext = createDefaultCaptureContext(),
): OTTBundleInfrastructure {
  const files: OTTBundleFileEntry[] = [];
  const urls: OTTBundleUrlEntry[] = [];
  const warnings: OTTBundleWarning[] = [];
  const externalReferences = new Map<string, number>();

  const fileRecorder = createFileRecorder(entrypointUri, files, externalReferences, captureContext);
  const urlRecorder = createUrlRecorder(entrypointUri, urls, externalReferences);
  const filePlugin = wrapLoaderPlugin(readFiles(), fileRecorder);
  const urlPlugin = wrapLoaderPlugin(fetchUrls(), urlRecorder);

  return { files, urls, warnings, externalReferences, filePlugin, urlPlugin };
}
