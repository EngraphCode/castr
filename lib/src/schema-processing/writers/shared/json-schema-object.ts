/**
 * Shared JSON Schema output type.
 *
 * Defines the canonical mutable output container for JSON Schema field
 * writers.  This type is structurally assignable to OAS `SchemaObject`
 * (which has `[key: string]: any` via `ISpecificationExtension`) so
 * OpenAPI writer consumers can use it directly.
 *
 * @module writers/shared/json-schema-object
 * @internal
 */

import type { SchemaObjectType } from 'openapi3-ts/oas31';

import type { CastrSchema, PortableUnknownKeyBehaviorMode } from '../../ir/index.js';

/**
 * Recursive write callback supplied by each concrete writer.
 * @internal
 */
export type WriteSchemaFn = (schema: CastrSchema) => JsonSchemaObject;

/**
 * Mutable JSON Schema output object.
 *
 * A minimal, self-contained interface covering every field the shared
 * writers may set.  Structurally compatible with OAS `SchemaObject`
 * (via its index signature), so no type assertions are required when
 * passing it to OAS-typed consumers.
 *
 * The index-signature fallback lets callers set format-specific extras
 * (e.g. `xml`, `externalDocs`, `discriminator`) without extending.
 *
 * @internal
 */
export interface JsonSchemaObject {
  [key: string]: unknown;

  // Core type
  type?: SchemaObjectType | SchemaObjectType[];
  format?: string;

  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // Numeric constraints
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;

  // Enum / const
  enum?: unknown[];
  const?: unknown;

  // Object
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
  additionalProperties?: boolean | JsonSchemaObject;
  'x-castr-unknownKeyBehavior'?: PortableUnknownKeyBehaviorMode;

  // Array
  items?: JsonSchemaObject;
  prefixItems?: JsonSchemaObject[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Composition
  allOf?: JsonSchemaObject[];
  oneOf?: JsonSchemaObject[];
  anyOf?: JsonSchemaObject[];
  not?: JsonSchemaObject;

  // Metadata
  title?: string;
  description?: string;
  default?: unknown;
  example?: unknown;
  examples?: unknown[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;

  // References
  $ref?: string;

  // JSON Schema 2020-12
  unevaluatedProperties?: boolean | JsonSchemaObject;
  unevaluatedItems?: boolean | JsonSchemaObject;
  dependentSchemas?: Record<string, JsonSchemaObject>;
  dependentRequired?: Record<string, string[]>;
  minContains?: number;
  maxContains?: number;

  // JSON Schema document-level
  $defs?: Record<string, JsonSchemaObject>;
  $schema?: string;
}

/**
 * Valid JSON Schema / OAS 3.1 primitive types.
 * @internal
 */
const VALID_SCHEMA_TYPES: readonly SchemaObjectType[] = [
  'string',
  'number',
  'integer',
  'boolean',
  'array',
  'object',
  'null',
];

/**
 * Type guard: is the value a recognised schema type string?
 * @internal
 */
export function isSchemaObjectType(value: unknown): value is SchemaObjectType {
  if (typeof value !== 'string') {
    return false;
  }
  return VALID_SCHEMA_TYPES.some((t) => t === value);
}
