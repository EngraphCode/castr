/**
 * Schema registration helpers for endpoint naming
 * Extracted from endpoint.helpers.naming.ts to reduce file size
 *
 * @internal
 */

import type { EndpointContext } from './endpoint.helpers.naming.resolution.js';

/**
 * Checks if a schema variable already exists and can be reused
 * Returns the existing variable name if found, undefined otherwise
 */
export function findExistingSchemaVar(
  result: string,
  ctx: EndpointContext,
  exportAllNamedSchemas: boolean,
): string | undefined {
  if (!exportAllNamedSchemas && ctx.schemaByName[result]) {
    return ctx.schemaByName[result];
  }
  return undefined;
}

/**
 * Registers a schema name in the context for reuse
 */
export function registerSchemaName(
  ctx: EndpointContext,
  varName: string,
  schemaResult: string,
  exportAllNamedSchemas: boolean,
): void {
  ctx.zodSchemaByName[varName] = schemaResult;
  ctx.schemaByName[schemaResult] = varName;

  if (exportAllNamedSchemas && ctx.schemasByName) {
    ctx.schemasByName[schemaResult] = (ctx.schemasByName[schemaResult] ?? []).concat(varName);
  }
}
