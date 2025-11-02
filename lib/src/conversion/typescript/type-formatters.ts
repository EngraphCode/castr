/**
 * TypeScript type formatters for complex types (enums, arrays, objects)
 * Extracted from openApiToTypescript.string-helpers.ts to reduce file size
 *
 * These functions format enum values, array types, and object types into TypeScript strings.
 */

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
export function handleMixedEnum(values: (string | number | boolean | null)[]): string {
  return values
    .map((v) => {
      if (typeof v === 'string') {
        return `"${v}"`;
      }
      if (v === null) {
        return 'null';
      }
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

    // Check if it's a valid JavaScript identifier (doesn't need quoting)
    const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(cleanKey);
    const needsQuoting = !isAlreadyQuoted && !isValidIdentifier;
    const finalKey = needsQuoting ? `"${cleanKey}"` : cleanKey;

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
