/**
 * Shared utilities stage public exports
 *
 * Pure, dependency-free utilities used across multiple pipeline stages.
 *
 * @internal This module is internal. Use exports from lib/src/index.ts instead.
 */

export { maybePretty } from './maybe-pretty.js';
export { getOpenApiDependencyGraph } from './dependency-graph.js';
export { logger } from './utils/logger.js';
export { prepareOpenApiDocument } from './prepare-openapi-document.js';
export { loadOpenApiDocument } from './load-openapi-document.js';
export type {
  BundledOpenApiDocument,
  LoadedOpenApiDocument,
  BundleMetadata,
  BundleEntrypoint,
  BundleFileEntry,
  BundleUrlEntry,
  BundleWarning,
  ExternalReferenceSummary,
} from './bundle-metadata.types.js';
