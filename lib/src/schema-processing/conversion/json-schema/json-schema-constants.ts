/**
 * JSON Schema/OpenAPI conversion constants.
 *
 * Centralized to avoid magic-string comparisons in conversion modules.
 */
export const SCHEMA_TYPE_STRING = 'string' as const;
export const SCHEMA_TYPE_NUMBER = 'number' as const;
export const SCHEMA_TYPE_INTEGER = 'integer' as const;
export const SCHEMA_TYPE_OBJECT = 'object' as const;
export const SCHEMA_TYPE_ARRAY = 'array' as const;
export const SCHEMA_TYPE_NULL = 'null' as const;

export const RESULT_KIND_BOOLEAN = 'boolean' as const;
export const RESULT_KIND_ARRAY = 'array' as const;
export const RESULT_KIND_SCHEMA = 'schema' as const;

export const SECURITY_SELECTION_KIND_PUBLIC = 'public' as const;
export const SECURITY_SELECTION_KIND_REQUIREMENTS = 'requirements' as const;
