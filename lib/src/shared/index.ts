/**
 * Shared utilities stage public exports
 *
 * Pure, dependency-free utilities used across multiple pipeline stages.
 *
 * @internal This module is internal. Use exports from lib/src/index.ts instead.
 */

export { maybePretty } from './maybe-pretty.js';
export { getOpenApiDependencyGraph } from './dependency-graph/index.js';
export { logger } from './utils/logger.js';
export { prepareOpenApiDocument } from './prepare-openapi-document.js';
export { loadOpenApiDocument } from './load-openapi-document/index.js';
export {
  type BundledOpenApiDocument,
  type OTTLoadedOpenApiDocument,
  type OTTBundleMetadata,
  type OTTBundleEntrypoint,
  type OTTBundleFileEntry,
  type OTTBundleUrlEntry,
  type OTTBundleWarning,
  type OTTExternalReferenceSummary,
} from './load-openapi-document/bundle/index.js';
export {
  type UnknownRecord,
  safeStringifyEnumValue,
  stringEnumValueToZodCode,
  nonStringEnumValueToZodLiteral,
  shouldEnumBeNever,
  generateStringEnumZodCode,
  generateNonStringEnumZodCode,
  type ZodLiteralValue,
  inferRequiredSchema,
  isString,
  isRecord,
  isCastrSchema,
  isCastrSchemaProperties,
} from './type-utils/index.js';
