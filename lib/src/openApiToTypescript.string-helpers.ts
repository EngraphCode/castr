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
  return PRIMITIVE_SCHEMA_TYPES.includes(value as PrimitiveSchemaType);
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
export function handleBasicPrimitive(
  schemaType: PrimitiveSchemaType,
  isNullable: boolean,
): string {
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
 * @example
 * wrapReadonly('string[]', false) // 'string[]'
 * wrapReadonly('string[]', true) // 'Readonly<string[]>'
 * wrapReadonly('User', true) // 'Readonly<User>'
 */
export function wrapReadonly(typeString: string, isReadonly: boolean): string {
  return isReadonly ? `Readonly<${typeString}>` : typeString;
}

// ============================================================================
// PHASE 3: Collections - Enums & Arrays
// ============================================================================

/**
 * Converts string enum values to TypeScript string literal union
 *
 * @param values - Array of string values
 * @returns TypeScript string literal union
 *
 * @example
 * handleStringEnum(['active', 'inactive']) // '"active" | "inactive"'
 */
export function handleStringEnum(values: string[]): string {
  return values.map((v) => `"${v}"`).join(' | ');
}

/**
 * Converts numeric enum values to TypeScript numeric literal union
 *
 * @param values - Array of numeric values
 * @returns TypeScript numeric literal union
 *
 * @example
 * handleNumericEnum([1, 2, 3]) // '1 | 2 | 3'
 */
export function handleNumericEnum(values: number[]): string {
  return values.join(' | ');
}

/**
 * Converts mixed enum values to TypeScript literal union
 *
 * Handles strings, numbers, booleans, and null.
 *
 * @param values - Array of mixed primitive values
 * @returns TypeScript literal union
 *
 * @example
 * handleMixedEnum(['active', 1, true, null]) // '"active" | 1 | true | null'
 */
export function handleMixedEnum(values: Array<string | number | boolean | null>): string {
  return values
    .map((v) => {
      if (typeof v === 'string') return `"${v}"`;
      if (v === null) return 'null';
      return String(v);
    })
    .join(' | ');
}

/**
 * Converts array schema to TypeScript Array<> type
 *
 * @param itemType - TypeScript type of array items
 * @returns TypeScript Array<> type string
 *
 * @example
 * handleArrayType('string') // 'Array<string>'
 * handleArrayType('string | number') // 'Array<string | number>'
 */
export function handleArrayType(itemType: string): string {
  return `Array<${itemType}>`;
}

/**
 * Converts array schema to TypeScript readonly array type
 *
 * @param itemType - TypeScript type of array items
 * @returns TypeScript readonly array type string
 *
 * @example
 * handleReadonlyArray('string') // 'readonly string[]'
 * handleReadonlyArray('string | number') // 'readonly (string | number)[]'
 */
export function handleReadonlyArray(itemType: string): string {
  // Wrap complex types (containing |, &) in parentheses
  const needsParens = itemType.includes(' | ') || itemType.includes(' & ');
  const wrappedType = needsParens ? `(${itemType})` : itemType;

  return `readonly ${wrappedType}[]`;
}

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
// PHASE 5: Objects
// ============================================================================

/**
 * Creates TypeScript object type from property definitions
 *
 * Property names ending with '?' are treated as optional.
 * Property names already quoted (wrapped in "") are kept as-is.
 * Property names with special characters are automatically quoted.
 *
 * @param properties - Record of property names to their TypeScript types
 * @returns TypeScript object type string
 *
 * @example
 * handleObjectType({ id: 'number', name: 'string' }) // '{ id: number; name: string }'
 * handleObjectType({ id: 'number', 'age?': 'number' }) // '{ id: number; age?: number }'
 * handleObjectType({ '"kebab-case"': 'string' }) // '{ "kebab-case": string }'
 */
export function handleObjectType(properties: Record<string, string>): string {
  const keys = Object.keys(properties);

  if (keys.length === 0) {
    return '{}';
  }

  const formattedProps = keys.map((key) => {
    const type = properties[key];

    // Check if property is optional (ends with ?)
    const isOptional = key.endsWith('?');
    const cleanKey = isOptional ? key.slice(0, -1) : key;

    // Check if already quoted
    const isAlreadyQuoted = cleanKey.startsWith('"') && cleanKey.endsWith('"');
    
    // Use the clean key as-is if already quoted, otherwise check if it needs quoting
    const finalKey = isAlreadyQuoted
      ? cleanKey
      : /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(cleanKey)
      ? cleanKey
      : `"${cleanKey}"`;

    const optional = isOptional ? '?' : '';

    return `${finalKey}${optional}: ${type}`;
  });

  return `{ ${formattedProps.join('; ')} }`;
}

/**
 * Wraps object type with Partial<> utility type
 *
 * @param objectType - TypeScript object type string
 * @returns Type wrapped with Partial<>
 *
 * @example
 * handlePartialObject('{ name: string }') // 'Partial<{ name: string }>'
 */
export function handlePartialObject(objectType: string): string {
  return `Partial<${objectType}>`;
}

/**
 * Creates index signature for additional properties
 *
 * @param valueType - TypeScript type of the additional property values
 * @returns TypeScript object type with index signature
 *
 * @example
 * handleAdditionalProperties('any') // '{ [key: string]: any }'
 * handleAdditionalProperties('User') // '{ [key: string]: User }'
 */
export function handleAdditionalProperties(valueType: string): string {
  return `{ [key: string]: ${valueType} }`;
}

/**
 * Merges object type with additional properties using intersection
 *
 * @param objectType - Base object type string
 * @param additionalProps - Additional properties type string (with index signature)
 * @returns Intersection of object and additional properties
 *
 * @example
 * mergeObjectWithAdditionalProps('{ id: number }', '{ [key: string]: any }')
 * // '{ id: number } & { [key: string]: any }'
 */
export function mergeObjectWithAdditionalProps(
  objectType: string,
  additionalProps: string,
): string {
  return `${objectType} & ${additionalProps}`;
}

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
  return parts[parts.length - 1];
}

