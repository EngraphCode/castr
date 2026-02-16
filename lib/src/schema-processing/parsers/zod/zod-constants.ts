/**
 * Zod Method Constants
 *
 * Canonical lists of recognized Zod methods. These arrays serve as the
 * single source of truth for:
 * 1. The parser's method recognition logic
 * 2. The synthetic zod declaration generated for symbol resolution
 *
 * @module parsers/zod/constants
 * @internal
 */

/**
 * Recognized flat (non-namespaced) Zod primitive types.
 * These map directly to `z.<method>()` calls.
 * @internal
 */
export const ZOD_FLAT_PRIMITIVES = [
  'string',
  'number',
  'boolean',
  'null',
  'undefined',
  'bigint',
  'date',
  'symbol',
  'void',
  'any',
  'unknown',
  'never',
  // Zod 4 Primitives (flat)
  'int',
  'int32',
  'int64',
  'float32',
  'float64',
  'uuidv4',
  'base64',
  'base64url',
  'email',
  'url',
  'uuid',
  'ipv4',
  'ipv6',
  'cidrv4',
  'cidrv6',
  'jwt',
  'e164',
  'hostname',
  'literal',
] as const;

/**
 * Recognized namespaced Zod primitive types.
 *
 * Each entry maps a namespace (e.g., `'iso'`) to the method names
 * within that namespace (e.g., `['date', 'datetime', ...]`).
 * These map to `z.<namespace>.<method>()` calls.
 *
 * @internal
 */
export const ZOD_NAMESPACE_PRIMITIVES = [
  ['iso', ['date', 'datetime', 'time', 'duration']],
] as const satisfies readonly (readonly [string, readonly string[]])[];

/**
 * All recognized Zod primitive types as dot-separated strings.
 *
 * This is the combined view used by the parser for method name matching.
 * Flat methods appear as-is; namespaced methods appear as `'namespace.method'`.
 *
 * @internal
 */
export const ZOD_PRIMITIVES = [
  ...ZOD_FLAT_PRIMITIVES,
  // Namespaced primitives as dot-separated strings for parser compatibility
  ...ZOD_NAMESPACE_PRIMITIVES.flatMap(([ns, methods]) => methods.map((m) => `${ns}.${m}` as const)),
] as const;

/** A recognized Zod primitive type name. */
export type ZodPrimitiveType = (typeof ZOD_PRIMITIVES)[number];

/**
 * Recognized Zod composition types.
 * @internal
 */
export const ZOD_COMPOSITIONS = [
  'object',
  'array',
  'union',
  'intersection',
  'discriminatedUnion',
  'lazy',
  'xor',
] as const;

/** A recognized Zod composition type name. */
export type ZodCompositionType = (typeof ZOD_COMPOSITIONS)[number];

/**
 * Named constant for the `z.object()` method name.
 * Used to avoid magic-string comparisons per ADR-026.
 * @internal
 */
export const ZOD_OBJECT_METHOD: ZodCompositionType = 'object';

/**
 * Named constant for the `defineEndpoint` function identifier.
 * Used to avoid magic-string comparisons per ADR-026.
 * @internal
 */
export const DEFINE_ENDPOINT_IDENTIFIER = 'defineEndpoint' as const;

export const ZOD_METHOD_MIN = 'min' as const;
export const ZOD_METHOD_MAX = 'max' as const;
export const ZOD_METHOD_LENGTH = 'length' as const;
export const ZOD_METHOD_BASE64 = 'base64' as const;
export const ZOD_METHOD_INT = 'int' as const;
export const ZOD_METHOD_OPTIONAL = 'optional' as const;
export const ZOD_METHOD_NULLABLE = 'nullable' as const;
export const ZOD_METHOD_NULLISH = 'nullish' as const;
export const ZOD_METHOD_DEFAULT = 'default' as const;
export const ZOD_METHOD_DESCRIBE = 'describe' as const;
export const ZOD_METHOD_META = 'meta' as const;
export const ZOD_METHOD_ARRAY = 'array' as const;
export const ZOD_METHOD_TUPLE = 'tuple' as const;
export const ZOD_METHOD_ENUM = 'enum' as const;
export const ZOD_METHOD_NATIVE_ENUM = 'nativeEnum' as const;
export const ZOD_METHOD_REST = 'rest' as const;
export const ZOD_METHOD_STRICT = 'strict' as const;
export const ZOD_METHOD_PASSTHROUGH = 'passthrough' as const;
export const ZOD_METHOD_STRIP = 'strip' as const;
export const ZOD_METHOD_UNION = 'union' as const;
export const ZOD_METHOD_DISCRIMINATED_UNION = 'discriminatedUnion' as const;
export const ZOD_METHOD_XOR = 'xor' as const;
export const ZOD_METHOD_INTERSECTION = 'intersection' as const;
export const ZOD_METHOD_AND = 'and' as const;
export const ZOD_METHOD_LAZY = 'lazy' as const;

export const ZOD_BASE_METHOD_STRING = 'string' as const;
export const ZOD_BASE_METHOD_NUMBER = 'number' as const;
export const ZOD_BASE_METHOD_NULL = 'null' as const;
export const ZOD_BASE_METHOD_UNDEFINED = 'undefined' as const;
export const ZOD_BASE_METHOD_LITERAL = 'literal' as const;

export const ZOD_SCHEMA_TYPE_ARRAY = 'array' as const;
export const ZOD_SCHEMA_TYPE_STRING = 'string' as const;
export const ZOD_SCHEMA_TYPE_OBJECT = 'object' as const;
