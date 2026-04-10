/**
 * Shared JSON Schema output type.
 *
 * Defines the canonical mutable output container for JSON Schema field
 * writers.  This type is structurally assignable to the project's `SchemaObject`
 * interface (defined in `shared/openapi-types.ts`) because both use
 * explicit named properties without index signatures.
 *
 * > **Egress normal form:** The JSON Schema writer normalises `example`
 * > to `examples` (ADR-042). Nullability is represented via `type: [T,
 * > 'null']` arrays. `$ref` schemas are emitted as bare `{ "$ref": ...
 * > }` without siblings.
 *
 * @module writers/shared/json-schema-object
 * @internal
 */

import type {
  DiscriminatorObject,
  ExternalDocumentationObject,
  SchemaObjectType,
  XMLObject,
} from '../../../shared/openapi-types.js';

import type { CastrSchema } from '../../ir/index.js';

/**
 * Recursive write callback supplied by each concrete writer.
 * @internal
 */
export type WriteSchemaFn = (schema: CastrSchema) => JsonSchemaObject;

/**
 * Mutable JSON Schema output object.
 *
 * A minimal, self-contained interface covering every field the shared
 * writers may set.  Structurally assignable to the project's `SchemaObject`
 * interface (defined in `shared/openapi-types.ts`) because both use
 * explicit named properties without index signatures.
 *
 * Format-specific extras (e.g. `xml`, `externalDocs`, `discriminator`)
 * are listed as explicit named properties rather than relying on an
 * index signature, so that the type remains assignable to `SchemaObject`
 * which has no index signature.
 *
 * @internal
 */
export interface JsonSchemaObject {
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
  contains?: JsonSchemaObject;
  patternProperties?: Record<string, JsonSchemaObject>;
  propertyNames?: JsonSchemaObject;
  $anchor?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  contentEncoding?: string;
  contentMediaType?: string;

  // Conditional applicators (JSON Schema 2020-12)
  if?: JsonSchemaObject;
  then?: JsonSchemaObject;
  else?: JsonSchemaObject;

  // JSON Schema document-level
  $defs?: Record<string, JsonSchemaObject>;
  $schema?: string;

  // OAS-only extensions (set by OpenAPI writer via bracket notation)
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
  discriminator?: DiscriminatorObject;
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
