/**
 * JSON Schema/OpenAPI conversion constants.
 *
 * Centralized to avoid magic-string comparisons in conversion modules.
 */
export const SCHEMA_TYPE_STRING = 'string';
export const SCHEMA_TYPE_NUMBER = 'number';
export const SCHEMA_TYPE_INTEGER = 'integer';
export const SCHEMA_TYPE_OBJECT = 'object';
export const SCHEMA_TYPE_ARRAY = 'array';
export const SCHEMA_TYPE_NULL = 'null';

export const RESULT_KIND_BOOLEAN = 'boolean';
export const RESULT_KIND_ARRAY = 'array';
export const RESULT_KIND_SCHEMA = 'schema';

export const SECURITY_SELECTION_KIND_PUBLIC = 'public';
export const SECURITY_SELECTION_KIND_REQUIREMENTS = 'requirements';
