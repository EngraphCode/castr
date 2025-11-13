/**
 * IR Metadata Adapter
 *
 * Adapter functions to extract CodeMetaData-equivalent information from IRSchemaNode.
 * These adapters provide a clean migration path from CodeMetaData to IR-based metadata.
 *
 * **Migration Strategy:**
 * Each function replaces a specific CodeMetaData field access with IR metadata extraction:
 * - `getRequiredFromIR(node)` replaces `meta?.isRequired`
 * - `getNullableFromIR(node)` replaces schema-level nullable checks
 * - `getPresenceChainFromIR(node)` replaces presence chain logic
 * - `getCircularReferencesFromIR(node)` replaces `meta?.referencedBy` circular detection
 *
 * @module ir-metadata-adapter
 * @since Phase 3 Session 2
 * @public
 */

import type { IRSchemaNode } from '../../context/ir-schema.js';

/**
 * Extract required status from IR schema node.
 *
 * Replaces: `meta?.isRequired ?? false`
 *
 * @param node - IR schema node with metadata
 * @returns true if schema is required in parent context, false otherwise
 *
 * @example
 * ```typescript
 * // OLD: Using CodeMetaData
 * const isRequired = meta?.isRequired ?? false;
 *
 * // NEW: Using IRSchemaNode
 * const isRequired = getRequiredFromIR(irNode);
 * ```
 *
 * @public
 */
export function getRequiredFromIR(node: IRSchemaNode): boolean {
  return node.required;
}

/**
 * Extract nullable status from IR schema node.
 *
 * New functionality not present in CodeMetaData.
 * Computed from OAS 3.1.0 type arrays (e.g., `type: ['string', 'null']`).
 *
 * @param node - IR schema node with metadata
 * @returns true if schema allows null values, false otherwise
 *
 * @example
 * ```typescript
 * const isNullable = getNullableFromIR(irNode);
 * if (isNullable) {
 *   // Schema can be null
 * }
 * ```
 *
 * @public
 */
export function getNullableFromIR(node: IRSchemaNode): boolean {
  return node.nullable;
}

/**
 * Extract presence chain for Zod code generation.
 *
 * Determines the appropriate Zod presence modifier based on required and nullable status:
 * - Required + Nullable → `.nullable()`
 * - Required + Not Nullable → `` (no modifier)
 * - Optional + Nullable → `.nullish()`
 * - Optional + Not Nullable → `.optional()`
 *
 * Replaces: Logic in `getZodChainablePresence(schema, meta)`
 *
 * @param node - IR schema node with metadata
 * @returns Zod presence chain string (e.g., 'optional()', 'nullable()', 'nullish()', or '')
 *
 * @example
 * ```typescript
 * // OLD: Using CodeMetaData
 * const presence = getZodChainablePresence(schema, meta);
 *
 * // NEW: Using IRSchemaNode
 * const presence = getPresenceChainFromIR(irNode);
 *
 * // Generates: 'z.string().optional()' or 'z.string().nullable()' etc.
 * const zodCode = `z.string()${presence ? '.' + presence : ''}`;
 * ```
 *
 * @public
 */
export function getPresenceChainFromIR(node: IRSchemaNode): string {
  const isNullable = node.nullable;
  const isRequired = node.required;

  // Match logic from getZodChainablePresence() in chain.ts
  if (isNullable && !isRequired) {
    return 'nullish()';
  }
  if (isNullable) {
    return 'nullable()';
  }
  if (!isRequired) {
    return 'optional()';
  }
  return '';
}

/**
 * Extract circular reference paths from dependency graph.
 *
 * Returns array of JSON Pointer paths to schemas involved in circular references.
 * Used for detecting when to wrap schemas with `z.lazy()`.
 *
 * Replaces: `meta?.referencedBy` circular detection logic
 *
 * @param node - IR schema node with dependency graph
 * @returns Array of circular reference paths (e.g., ['#/components/schemas/Node'])
 *
 * @example
 * ```typescript
 * // OLD: Using CodeMetaData referencedBy
 * const refPath = (meta.referencedBy ?? []).map((prev) => extractRefName(prev, ctx));
 * const isCircular = refPath.includes(schemaName);
 *
 * // NEW: Using IRSchemaNode
 * const circularRefs = getCircularReferencesFromIR(irNode);
 * const isCircular = circularRefs.length > 0;
 * ```
 *
 * @public
 */
export function getCircularReferencesFromIR(node: IRSchemaNode): string[] {
  // Return copy to avoid mutation
  return [...node.circularReferences];
}
