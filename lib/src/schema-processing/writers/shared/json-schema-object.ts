/**
 * Shared JSON Schema output type.
 *
 * Defines the canonical mutable output container for JSON Schema field
 * writers, parameterised over the child-schema type so each writer lane
 * instantiates the recursive positions it can actually emit:
 *
 * - {@link JsonSchemaObject} — object-only children. The OpenAPI lane's
 *   instantiation, structurally assignable to the project's `SchemaObject`
 *   interface (defined in `shared/openapi-types.ts`) because both use
 *   explicit named properties without index signatures and neither admits
 *   boolean children.
 * - {@link JsonSchemaNode} — children may be boolean schemas (`true`/`false`),
 *   as JSON Schema 2020-12 admits at every schema position. The pure JSON
 *   Schema lane's instantiation.
 *
 * Sharing one parameterised base makes root/recursion divergence structurally
 * impossible: the recursion callback ({@link WriteSchemaFn}) and the container
 * share the same child type variable.
 *
 * **Egress normal form:** The JSON Schema writer normalises `example` to
 * `examples` (ADR-042). Nullability is represented via `type: [T, 'null']`
 * arrays. `$ref` schemas are emitted as bare `{ "$ref": ... }` without
 * siblings.
 *
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
 * Recursive write callback supplied by each concrete writer. The child type
 * is the same variable the container uses, so a writer whose recursion
 * returns a narrower type than its container declares cannot compile.
 * @internal
 */
export type WriteSchemaFn<TChild> = (schema: CastrSchema) => TChild;

/**
 * Mutable JSON Schema output object, parameterised over the child-schema
 * type used at every recursive position.
 *
 * A minimal, self-contained interface covering every field the shared
 * writers may set. Format-specific extras (e.g. `xml`, `externalDocs`,
 * `discriminator`) are listed as explicit named properties rather than
 * relying on an index signature, so that the object-only instantiation
 * remains assignable to `SchemaObject` which has no index signature.
 *
 * @internal
 */
export interface JsonSchemaObjectBase<TChild> {
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
  properties?: Record<string, TChild>;
  required?: string[];
  additionalProperties?: boolean | TChild;

  // Array
  items?: TChild;
  prefixItems?: TChild[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Composition
  allOf?: TChild[];
  oneOf?: TChild[];
  anyOf?: TChild[];
  not?: TChild;

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
  unevaluatedProperties?: boolean | TChild;
  unevaluatedItems?: boolean | TChild;
  dependentSchemas?: Record<string, TChild>;
  dependentRequired?: Record<string, string[]>;
  minContains?: number;
  maxContains?: number;
  contains?: TChild;
  patternProperties?: Record<string, TChild>;
  propertyNames?: TChild;
  $anchor?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  contentEncoding?: string;
  contentMediaType?: string;

  // Conditional applicators (JSON Schema 2020-12)
  if?: TChild;
  then?: TChild;
  else?: TChild;

  // JSON Schema document-level
  $defs?: Record<string, TChild>;
  $schema?: string;

  // OAS-only extensions (set by OpenAPI writer via bracket notation)
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
  discriminator?: DiscriminatorObject;
}

/**
 * Object-only JSON Schema output — the OpenAPI lane's instantiation.
 * Structurally assignable to the project's `SchemaObject` seam.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- JC: the interface-extends form is the only way to instantiate the recursive child parameter (`type X = Base<X>` circularly references itself).
export interface JsonSchemaObject extends JsonSchemaObjectBase<JsonSchemaObject> {}

/**
 * JSON Schema output whose recursive positions admit boolean schemas —
 * the pure JSON Schema 2020-12 lane's instantiation.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- JC: the interface-extends form is the only way to instantiate the recursive child parameter (`type X = Base<X | boolean>` circularly references itself).
export interface JsonSchemaNode extends JsonSchemaObjectBase<JsonSchemaNode | boolean> {}

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
