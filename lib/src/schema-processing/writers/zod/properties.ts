/**
 * Property Writing Helpers
 *
 * Pure functions for processing object properties during Zod schema writing.
 * Extracted from index.ts to reduce complexity and improve testability.
 *
 * @module writers/zod/properties
 */

import type { CastrSchema, IRPropertySchemaContext } from '../../ir/index.js';
import { isValidJsIdentifier } from '../../../shared/utils/identifier-utils.js';

/**
 * Format a property key for JavaScript output.
 * Quotes keys that aren't valid JS identifiers.
 *
 * @param key - The property key name
 * @returns The formatted key (quoted if necessary)
 *
 * @example
 * formatPropertyKey('name') // 'name'
 * formatPropertyKey('content-type') // "'content-type'"
 *
 * @public
 */
export function formatPropertyKey(key: string): string {
  return isValidJsIdentifier(key) ? key : `'${key}'`;
}

/**
 * Build the property context for a schema property.
 *
 * @param name - Property name
 * @param schema - Property schema
 * @param isRequired - Whether the property is required
 * @returns Property schema context
 *
 * @public
 */
export function buildPropertyContext(
  name: string,
  schema: CastrSchema,
  isRequired: boolean,
): IRPropertySchemaContext {
  return {
    contextType: 'property',
    name,
    schema,
    optional: !isRequired,
  };
}

/**
 * Get object-schema properties in canonical lexicographic key order.
 *
 * @param schema - Object schema that may include properties
 * @returns Sorted [propertyName, propertySchema] tuples
 *
 * @public
 */
export function getSortedPropertyEntries(schema: CastrSchema): [string, CastrSchema][] {
  if (!schema.properties) {
    return [];
  }

  return [...schema.properties.entries()].sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey),
  );
}

/**
 * Check if a schema contains a $ref (directly or in array items).
 *
 * @param schema - Schema to check
 * @returns true if schema has a reference
 *
 * @internal
 */
function hasSchemaReference(schema: CastrSchema): boolean {
  if (schema.$ref) {
    return true;
  }

  if (schema.items && !Array.isArray(schema.items) && schema.items.$ref) {
    return true;
  }

  return false;
}

/**
 * Detect if a property triggers circular reference handling.
 *
 * Circular references require special Zod 4 getter syntax to avoid
 * runtime initialization errors.
 *
 * Two cases trigger circular reference handling:
 * 1. Property schema directly has circularReferences metadata
 * 2. Parent schema has circularReferences AND property has a $ref
 *
 * @param propSchema - The property's schema
 * @param parentSchema - The containing object's schema
 * @returns true if circular reference handling is needed
 *
 * @public
 */
export function detectCircularReference(
  propSchema: CastrSchema,
  parentSchema: CastrSchema,
): boolean {
  // Case 1: Property directly marks circular references
  const propHasCircularRef =
    propSchema.metadata?.circularReferences && propSchema.metadata.circularReferences.length > 0;

  if (propHasCircularRef) {
    return true;
  }

  // Case 2: Parent has circular refs AND property has a reference
  const parentHasCircularRef =
    parentSchema.metadata?.circularReferences &&
    parentSchema.metadata.circularReferences.length > 0;

  if (parentHasCircularRef && hasSchemaReference(propSchema)) {
    return true;
  }

  return false;
}

/**
 * Determine if getter syntax should be used for a property.
 *
 * Getter syntax is required for circular references in Zod 4:
 * ```typescript
 * const Category = z.object({
 *   get children() { return z.array(Category); }
 * });
 * ```
 *
 * @param propSchema - The property's schema
 * @param parentSchema - The containing object's schema
 * @returns true if getter syntax should be used
 *
 * @public
 */
export function shouldUseGetterSyntax(propSchema: CastrSchema, parentSchema: CastrSchema): boolean {
  return detectCircularReference(propSchema, parentSchema);
}
