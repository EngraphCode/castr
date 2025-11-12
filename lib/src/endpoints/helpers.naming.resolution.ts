/**
 * Schema resolution helpers for endpoint naming
 * Extracted from endpoint.helpers.naming.ts to reduce file size
 *
 * @internal
 */

import type { ZodCodeResult, ConversionTypeContext } from '../conversion/zod/index.js';
import { getSchemaComplexity } from '../shared/schema-complexity.js';
import { getSchemaFromComponents } from '../shared/component-access.js';
import { getSchemaNameFromRef, parseComponentRef } from '../shared/ref-resolution.js';

export type EndpointContext = ConversionTypeContext;

/**
 * Resolves schema from context, trying both direct lookup and ref resolution
 */
function resolveSchemaFromContext(
  result: string,
  inputRef: string | undefined,
  ctx: EndpointContext,
): string | undefined {
  let schema = ctx.zodSchemaByName[result];

  // Try to resolve ref if schema not found directly
  if (!schema && inputRef) {
    const schemaName = getSchemaNameFromRef(inputRef);
    schema = ctx.zodSchemaByName[schemaName];
  }

  return schema;
}

/**
 * Handles reference schema variable naming
 * Resolves refs and checks complexity
 */
export function handleRefSchema(
  input: ZodCodeResult,
  result: string,
  ctx: EndpointContext,
  complexityThreshold: number,
): string {
  const schema = resolveSchemaFromContext(result, input.ref, ctx);

  if (!input.ref || !schema) {
    throw new Error('Invalid ref: ' + input.ref);
  }

  const parsedRef = parseComponentRef(input.ref);
  if (!ctx.doc) {
    throw new Error('Context must have doc property');
  }
  const complexity = getSchemaComplexity({
    current: 0,
    schema: getSchemaFromComponents(ctx.doc, parsedRef.componentName, parsedRef.xExtKey),
  });

  // Simple refs can be inlined
  if (complexity < complexityThreshold) {
    const zodSchema = ctx.zodSchemaByName[result];
    if (!zodSchema) {
      throw new Error(`Zod schema not found for ref: ${result}`);
    }
    return zodSchema;
  }

  return result;
}
