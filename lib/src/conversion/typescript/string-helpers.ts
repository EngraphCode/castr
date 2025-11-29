/**
 * String-based TypeScript type generation helpers
 *
 * These functions convert OpenAPI schema constructs into TypeScript type strings.
 * They replace the old tanu-based AST approach with simple string manipulation.
 *
 * Design Principles:
 * - Pure functions (no side effects)
 * - Return strings (not AST nodes)
 * - Forward-compatible (supports OpenAPI 3.0 + 3.1+)
 * - Type-safe (no any, no type assertions)
 */

// ============================================================================
// PHASE 1: Foundation - Primitives & Basic Types
// ============================================================================

/**
 * OpenAPI primitive schema types (supports 3.0 and 3.1+)
 */
export const PRIMITIVE_SCHEMA_TYPES = ['string', 'number', 'integer', 'boolean', 'null'] as const;
export type PrimitiveSchemaType = (typeof PRIMITIVE_SCHEMA_TYPES)[number];

/**
 * Type guard for primitive schema types
 */
export function isPrimitiveSchemaType(value: string): value is PrimitiveSchemaType {
  const stringPrimitives: readonly string[] = PRIMITIVE_SCHEMA_TYPES;
  return stringPrimitives.includes(value);
}

/**
 * Converts OpenAPI primitive types to TypeScript types
 *
 * @param type - OpenAPI primitive type (string, number, integer, boolean, null)
 * @returns TypeScript type string
 *
 * @example
 * primitiveToTypeScript('string') // 'string'
 * primitiveToTypeScript('integer') // 'number'
 * primitiveToTypeScript('null') // 'null' (for 3.1+ support)
 */
export function primitiveToTypeScript(type: PrimitiveSchemaType): string {
  return type === 'integer' ? 'number' : type;
}

/**
 * Handles basic primitive types with nullable support
 *
 * @param schemaType - OpenAPI primitive type
 * @param isNullable - Whether the type should be nullable (3.0 nullable property)
 * @returns TypeScript type string with nullable union if needed
 *
 * @example
 * handleBasicPrimitive('string', false) // 'string'
 * handleBasicPrimitive('string', true) // 'string | null'
 * handleBasicPrimitive('null', false) // 'null' (3.1+ type: "null")
 */
export function handleBasicPrimitive(schemaType: PrimitiveSchemaType, isNullable: boolean): string {
  const baseType = primitiveToTypeScript(schemaType);

  // For type: "null", nullable doesn't add anything (already null)
  if (schemaType === 'null') {
    return 'null';
  }

  // For other primitives, add | null if nullable
  return isNullable ? `${baseType} | null` : baseType;
}

/**
 * Returns the TypeScript 'unknown' type
 */
export function handleUnknownType(): string {
  return 'unknown';
}

/**
 * Returns the TypeScript 'never' type
 */
export function handleNeverType(): string {
  return 'never';
}

/**
 * Returns the TypeScript 'any' type
 */
export function handleAnyType(): string {
  return 'any';
}

// ============================================================================
// PHASE 2: Modifiers & Wrappers
// ============================================================================

/**
 * Wraps a type with nullable union (| null) when needed
 *
 * Handles parenthesization for complex types automatically.
 *
 * @param typeString - The base TypeScript type string
 * @param isNullable - Whether to add | null
 * @returns Type string with nullable union if needed
 *
 * @example
 * wrapNullable('string', false) // 'string'
 * wrapNullable('string', true) // 'string | null'
 * wrapNullable('string | number', true) // '(string | number) | null'
 * wrapNullable('Base & Extended', true) // '(Base & Extended) | null'
 */
export function wrapNullable(typeString: string, isNullable: boolean): string {
  if (!isNullable) {
    return typeString;
  }

  // If the type contains union or intersection operators, wrap it
  if ((typeString.includes(' | ') || typeString.includes(' & ')) && !typeString.startsWith('(')) {
    return `(${typeString}) | null`;
  }

  return `${typeString} | null`;
}

/**
 * Wraps a type with TypeScript Readonly<> utility type when needed
 *
 * @param typeString - The TypeScript type string to make readonly
 * @param isReadonly - Whether to wrap with Readonly<>
 * @returns Type string, optionally wrapped with Readonly<>
 *
 * @remarks
 * The boolean parameter is intentional for conditional readonly wrapping.
 * Splitting into two methods would reduce clarity at call sites.
 *
 * @example
 * wrapReadonly('string[]', false) // 'string[]'
 * wrapReadonly('string[]', true) // 'Readonly<string[]>'
 * wrapReadonly('User', true) // 'Readonly<User>'
 */
/* eslint-disable sonarjs/no-selector-parameter -- JC: Intentional: conditional wrapping is the function's purpose */
export function wrapReadonly(typeString: string, isReadonly: boolean): string {
  return isReadonly ? `Readonly<${typeString}>` : typeString;
}
/* eslint-enable sonarjs/no-selector-parameter */

// ============================================================================
// PHASE 3: Collections - Enums & Arrays (moved to type-formatters.ts)
// ============================================================================

// Re-export formatters for backward compatibility
export {
  handleArrayType,
  handleMixedEnum,
  handleNumericEnum,
  handleReadonlyArray,
  handleStringEnum,
} from './type-formatters.js';

// ============================================================================
// PHASE 4: Composites - Unions & Intersections
// ============================================================================

/**
 * Creates TypeScript union type from multiple type strings
 *
 * @param types - Array of TypeScript type strings
 * @param isNullable - Optional: whether to add | null to the union
 * @returns TypeScript union type
 *
 * @example
 * handleUnion(['string', 'number']) // 'string | number'
 * handleUnion(['User', 'Admin', 'Guest']) // 'User | Admin | Guest'
 * handleUnion(['string', 'number'], true) // 'string | number | null'
 */
export function handleUnion(types: string[], isNullable?: boolean): string {
  const union = types.join(' | ');
  return isNullable ? `${union} | null` : union;
}

/**
 * Creates TypeScript intersection type from multiple type strings
 *
 * @param types - Array of TypeScript type strings
 * @param isNullable - Optional: whether to add | null to the entire intersection
 * @returns TypeScript intersection type
 *
 * @example
 * handleIntersection(['Base', 'Extended']) // 'Base & Extended'
 * handleIntersection(['Base', 'Extended'], true) // '(Base & Extended) | null'
 */
export function handleIntersection(types: string[], isNullable?: boolean): string {
  const intersection = types.join(' & ');
  return isNullable ? `(${intersection}) | null` : intersection;
}

// ============================================================================
// PHASE 5: Objects (moved to type-formatters.ts)
// ============================================================================

// Re-export object formatters for backward compatibility
export {
  handleAdditionalProperties,
  handleObjectType,
  handlePartialObject,
  mergeObjectWithAdditionalProps,
} from './type-formatters.js';

// ============================================================================
// PHASE 6: References
// ============================================================================

/**
 * Extracts component name from OpenAPI $ref
 *
 * @param ref - OpenAPI $ref string (format: #/components/{type}/{name})
 * @returns Component name
 *
 * @example
 * handleReference('#/components/schemas/User') // 'User'
 * handleReference('#/components/parameters/PageParam') // 'PageParam'
 */
export function handleReference(ref: string): string {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid $ref format: ${ref}`);
  }
  return name;
}
