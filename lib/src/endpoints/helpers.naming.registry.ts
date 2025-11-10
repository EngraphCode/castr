/**
 * Schema registration helpers for endpoint naming
 * Extracted from endpoint.helpers.naming.ts to reduce file size
 *
 * @internal
 */

import type { EndpointContext } from './helpers.naming.resolution.js';

/**
 * Registers a schema name in the context for reuse
 *
 * @param ctx - The endpoint context
 * @param varName - The variable name to register
 * @param schemaResult - The Zod schema string to cache
 * @internal
 */
export function registerSchemaName(
  ctx: EndpointContext,
  varName: string,
  schemaResult: string,
): void {
  ctx.zodSchemaByName[varName] = schemaResult;
}
