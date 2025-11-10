/**
 * Schema handling functions for endpoint naming
 * Extracted from endpoint.helpers.naming.ts to reduce file size
 *
 * @internal
 */

import type { ZodCodeResult } from '../conversion/zod/index.js';
import { normalizeString } from '../shared/utils/index.js';
import { generateUniqueVarName } from './helpers.naming.core.js';
import { registerSchemaName } from './helpers.naming.registry.js';
import { getSchemaComplexity } from '../shared/schema-complexity.js';

import type { EndpointContext } from './helpers.naming.resolution.js';

/**
 * Generate unique variable name with optional schema tracking
 * @internal
 */
function generateVarName(safeName: string, ctx: EndpointContext): string {
  return generateUniqueVarName(safeName, ctx.zodSchemaByName);
}

/**
 * Handles simple schemas with fallback names
 * Creates or reuses variable names for non-ref schemas
 */
function handleSimpleSchemaWithFallback(
  input: ZodCodeResult,
  result: string,
  ctx: EndpointContext,
  complexityThreshold: number,
  fallbackName: string,
): string {
  // Calculate complexity from schema
  const complexity = getSchemaComplexity({ schema: input.schema, current: 0 });

  // Inline if simple enough
  if (complexity < complexityThreshold) {
    return result;
  }

  const safeName = normalizeString(fallbackName);

  // Generate unique name and register
  const varName = generateVarName(safeName, ctx);

  registerSchemaName(ctx, varName, result);
  return varName;
}

/**
 * Handles inline-everything mode (complexityThreshold === -1)
 * Returns the full schema definition or resolved reference
 */
export function handleInlineEverything(
  input: ZodCodeResult,
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
