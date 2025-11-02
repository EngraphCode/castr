/**
 * Schema resolution helpers for endpoint naming
 * Extracted from endpoint.helpers.naming.ts to reduce file size
 *
 * @internal
 */

import type { CodeMeta, ConversionTypeContext } from '../shared/code-meta.js';
import { getSchemaComplexity } from '../shared/schema-complexity.js';
import { getSchemaFromComponents } from '../shared/component-access.js';

export type EndpointContext = ConversionTypeContext;

/**
 * Extract schema name from a component schema $ref
 */
function getSchemaNameFromRef(ref: string): string {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    return ref; // Fallback to ref if can't extract name
  }
  return name;
}

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
  input: CodeMeta,
  result: string,
  ctx: EndpointContext,
  complexityThreshold: number,
): string {
  const schema = resolveSchemaFromContext(result, input.ref, ctx);

  if (!input.ref || !schema) {
    throw new Error('Invalid ref: ' + input.ref);
  }

  const schemaName = getSchemaNameFromRef(input.ref);
  if (!ctx.doc) {
    throw new Error('Context must have doc property');
  }
  const complexity = getSchemaComplexity({
    current: 0,
    schema: getSchemaFromComponents(ctx.doc, schemaName),
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
