/**
 * Name generation and schema resolution helpers for endpoints
 * Extracted from endpoint.helpers.ts to reduce file size
 *
 * Main orchestration file - delegates to focused modules
 *
 * @internal
 */

import type { CodeMeta } from './CodeMeta.js';
import { handleRefSchema, type EndpointContext } from './endpoint.helpers.naming.resolution.js';
import {
  handleInlineEverything,
  handleSimpleSchemaWithFallback,
} from './endpoint.helpers.naming.handlers.js';

// Re-export type for external use
export type { EndpointContext } from './endpoint.helpers.naming.resolution.js';

// Re-export functions used externally
export { generateUniqueVarName } from './endpoint.helpers.naming.core.js';
export { handleRefSchema } from './endpoint.helpers.naming.resolution.js';
export { handleInlineEverything } from './endpoint.helpers.naming.handlers.js';
export { findExistingSchemaVar, registerSchemaName } from './endpoint.helpers.naming.registry.js';

/**
 * Main logic for determining variable name or inline schema
 * Orchestrates the various helper functions
 */
export function getSchemaVarName(
  input: CodeMeta,
  ctx: EndpointContext,
  complexityThreshold: number,
  fallbackName: string | undefined,
  options: { exportAllNamedSchemas?: boolean } | undefined,
): string {
  const result = input.toString();

  // Handle inline-everything mode
  if (complexityThreshold === -1) {
    return handleInlineEverything(input, result, ctx);
  }

  // Handle simple schemas with fallback names
  if ((result.startsWith('z.') || input.ref === undefined) && fallbackName) {
    return handleSimpleSchemaWithFallback(
      input,
      result,
      ctx,
      complexityThreshold,
      fallbackName,
      options,
    );
  }

  // Handle reference schemas
  return handleRefSchema(input, result, ctx, complexityThreshold);
}
