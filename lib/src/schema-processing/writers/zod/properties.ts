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

export {
  detectCircularReference,
  getNullableReferenceCompositionBaseSchema,
  isRecursiveObjectSchema,
  shouldUseGetterSyntax,
} from './properties.recursion.js';
