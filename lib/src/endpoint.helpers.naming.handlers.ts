/**
 * Schema handling functions for endpoint naming
 * Extracted from endpoint.helpers.naming.ts to reduce file size
 *
 * @internal
 */

import type { CodeMeta } from './CodeMeta.js';
import { normalizeString } from './utils.js';
import { generateUniqueVarName } from './endpoint.helpers.naming.core.js';
import { findExistingSchemaVar, registerSchemaName } from './endpoint.helpers.naming.registry.js';

import type { EndpointContext } from './endpoint.helpers.naming.resolution.js';

/**
 * Generate unique variable name with optional schema tracking
 * @internal
 */
function generateVarName(
  safeName: string,
  ctx: EndpointContext,
  result: string,
  options: { exportAllNamedSchemas?: boolean } | undefined,
): string {
  if (ctx.schemasByName) {
    return generateUniqueVarName(safeName, ctx.zodSchemaByName, {
      exportAllNamedSchemas: options?.exportAllNamedSchemas ?? false,
      schemasByName: ctx.schemasByName,
      schemaKey: result,
    });
  }
  return generateUniqueVarName(safeName, ctx.zodSchemaByName);
}

/**
 * Handles simple schemas with fallback names
 * Creates or reuses variable names for non-ref schemas
 */
function handleSimpleSchemaWithFallback(
  input: CodeMeta,
  result: string,
  ctx: EndpointContext,
  complexityThreshold: number,
  fallbackName: string,
  options: { exportAllNamedSchemas?: boolean } | undefined,
): string {
  // Inline if simple enough
  if (input.complexity < complexityThreshold) {
    return result;
  }

  const safeName = normalizeString(fallbackName);

  // Check if already exists
  const existing = findExistingSchemaVar(result, ctx, Boolean(options?.exportAllNamedSchemas));
  if (existing) {
    return existing;
  }

  // Generate unique name and register
  const varName = generateVarName(safeName, ctx, result, options);

  registerSchemaName(ctx, varName, result, options?.exportAllNamedSchemas ?? false);
  return varName;
}

/**
 * Handles inline-everything mode (complexityThreshold === -1)
 * Returns the full schema definition or resolved reference
 */
export function handleInlineEverything(
  input: CodeMeta,
  result: string,
  ctx: EndpointContext,
): string {
  if (input.ref) {
    const zodSchema = ctx.zodSchemaByName[result];
    if (!zodSchema) {
      throw new Error(`Zod schema not found for ref: ${result}`);
    }
    return zodSchema;
  }
  return result;
}

export { handleSimpleSchemaWithFallback };
