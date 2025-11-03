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
