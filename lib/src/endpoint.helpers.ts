/**
 * Pure helper functions for endpoint generation
 * Extracted to reduce cognitive complexity in getEndpointDefinitionList.ts
 *
 * Each function has a single responsibility and is < 50 lines
 */

import type { OpenAPIObject } from 'openapi3-ts/oas30';

import type { CodeMeta } from './CodeMeta.js';
import { getSchemaComplexity } from './schema-complexity.js';
import { normalizeString } from './utils.js';
import { getSchemaFromComponents } from './component-access.js';

/**
 * Extract schema name from a component schema $ref
 */
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    return ref; // Fallback to ref if can't extract name
  }
  return name;
};

interface EndpointContext {
  zodSchemaByName: Record<string, string>;
  schemaByName: Record<string, string>;
  schemasByName?: Record<string, string[]>;
  doc: OpenAPIObject;
}

/**
 * Checks if schema should be inlined (no variable extraction)
 * Returns true if complexity is below threshold or threshold is -1
 */
export function shouldInlineSchema(complexity: number, complexityThreshold: number): boolean {
  // Special case: -1 means always inline everything
  if (complexityThreshold === -1) {
    return true;
  }

  // Simple schemas below threshold should be inlined
  return complexity < complexityThreshold;
}

/**
 * Checks if a name can be reused based on export strategy
 */
function canReuseExistingName(
  formattedName: string,
  baseName: string,
  existingNames: Record<string, string>,
  options?: {
    exportAllNamedSchemas?: boolean;
    schemasByName?: Record<string, string[]>;
    schemaKey?: string;
  },
): boolean {
  // Check for reuse with exportAllNamedSchemas
  if (options?.exportAllNamedSchemas && options.schemasByName && options.schemaKey) {
    return options.schemasByName[options.schemaKey]?.includes(formattedName) ?? false;
  }

  // Check for standard reuse (same base name)
  return existingNames[formattedName] === baseName;
}

/**
 * Generates a unique variable name with collision detection
 * Iteratively adds suffix numbers until a unique name is found
 */
export function generateUniqueVarName(
  baseName: string,
  existingNames: Record<string, string>,
  options?: {
    exportAllNamedSchemas?: boolean;
    schemasByName?: Record<string, string[]>;
    schemaKey?: string;
  },
): string {
  let formattedName = baseName;
  let reuseCount = 1;

  while (existingNames[formattedName]) {
    // Check if we can reuse this name
    if (canReuseExistingName(formattedName, baseName, existingNames, options)) {
      return formattedName;
    }

    // Name is taken, try with suffix
    reuseCount += 1;
    formattedName = `${baseName}__${reuseCount}`;
  }

  return formattedName;
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
  const varName = ctx.schemasByName
    ? generateUniqueVarName(safeName, ctx.zodSchemaByName, {
        exportAllNamedSchemas: options?.exportAllNamedSchemas ?? false,
        schemasByName: ctx.schemasByName,
        schemaKey: result,
      })
    : generateUniqueVarName(safeName, ctx.zodSchemaByName);

  registerSchemaName(ctx, varName, result, options?.exportAllNamedSchemas ?? false);
  return varName;
}

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
