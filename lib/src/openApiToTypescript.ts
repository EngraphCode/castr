import type { SchemaHandler, TsConversionArgs } from './openApiToTypescript.core.js';
import {
  convertSchemaToType,
  formatTypeScriptResult,
  setupConversionContext,
} from './openApiToTypescript.core.js';

// Re-export public types
export type { TsConversionContext } from './openApiToTypescript.core.js';

/**
 * Converts an OpenAPI schema to a TypeScript type string.
 *
 * Supports all OpenAPI 3.0.x and 3.1.x schema types including primitives,
 * objects, arrays, composition schemas (oneOf, anyOf, allOf), and references.
 * Handles nullable types, readonly modifiers, and partial objects.
 *
 * @param args - Conversion arguments
 * @param args.schema - The OpenAPI schema or reference to convert
 * @param args.meta - Optional metadata (name, $ref, isInline)
 * @param args.ctx - Optional conversion context for tracking visited references
 * @param args.options - Optional template context options
 * @returns TypeScript type string (either inline type or type declaration)
 *
 * @throws {Error} When schema is missing or contains unsupported features
 *
 * @example Basic primitive type
 * ```typescript
 * const result = getTypescriptFromOpenApi({
 *   schema: { type: 'string' }
 * });
 * // Returns: "string"
 * ```
 *
 * @example Object with name (generates type declaration)
 * ```typescript
 * const result = getTypescriptFromOpenApi({
 *   schema: {
 *     type: 'object',
 *     properties: {
 *       id: { type: 'string' },
 *       name: { type: 'string' }
 *     },
 *     required: ['id']
 *   },
 *   meta: { name: 'User' }
 * });
 * // Returns: "export type User = { id: string; name?: string };"
 * ```
 *
 * @public
 */
export const getTypescriptFromOpenApi = ({
  schema,
  meta: inheritedMeta,
  ctx,
  options,
}: TsConversionArgs): string => {
  const meta: TsConversionArgs['meta'] = {};

  setupConversionContext(ctx, inheritedMeta);

  if (!schema) {
    throw new Error('Schema is required');
  }

  const convertSchema: SchemaHandler = (s, m, c, o) =>
    getTypescriptFromOpenApi({ schema: s, meta: m, ctx: c, options: o });

  const tsResult = convertSchemaToType(schema, meta, ctx, options, convertSchema);
  return formatTypeScriptResult(tsResult, inheritedMeta);
};
