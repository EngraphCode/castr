/**
 * Name generation and schema resolution helpers for endpoints
 * Extracted from endpoint.helpers.ts to reduce file size
 *
 * Main orchestration file - delegates to focused modules
 *
 * @internal
 */

import type { ZodCodeResult } from '../conversion/zod/index.js';
import { getSchemaNameFromRef } from '../conversion/zod/handlers.core.js';
import { handleRefSchema, type EndpointContext } from './helpers.naming.resolution.js';
import {
  handleInlineEverything,
  handleSimpleSchemaWithFallback,
} from './helpers.naming.handlers.js';

// Re-export type for external use
export type { EndpointContext } from './helpers.naming.resolution.js';

// Re-export functions used externally
export { generateUniqueVarName } from './helpers.naming.core.js';
export { handleRefSchema } from './helpers.naming.resolution.js';
export { handleInlineEverything } from './helpers.naming.handlers.js';
export { registerSchemaName } from './helpers.naming.registry.js';

/**
 * Main logic for determining variable name or inline schema
 * Orchestrates the various helper functions
 */
import { sanitizeIdentifier } from '../shared/utils/string-utils.js';

// ...

export function getSchemaVarName(
  input: ZodCodeResult,
  ctx: EndpointContext,
  complexityThreshold: number,
  fallbackName: string | undefined,
): string {
  // For refs, use schema name; for inline schemas, use the generated code
  const result = input.ref ? sanitizeIdentifier(getSchemaNameFromRef(input.ref)) : input.code;

  // Handle inline-everything mode
  if (complexityThreshold === -1) {
    return handleInlineEverything(input, result, ctx);
  }

  // Handle simple schemas with fallback names
  if ((result.startsWith('z.') || input.ref === undefined) && fallbackName) {
    return handleSimpleSchemaWithFallback(input, result, ctx, complexityThreshold, fallbackName);
  }

  // Handle reference schemas
  return handleRefSchema(input, result, ctx, complexityThreshold);
}
