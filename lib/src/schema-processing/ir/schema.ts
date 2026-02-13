import type {
  ExternalDocumentationObject,
  InfoObject,
  PathItemObject,
  SchemaObject,
  ServerObject,
  TagObject,
  XmlObject,
} from 'openapi3-ts/oas31';

// ... existing imports ...

export type IRHttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'head'
  | 'options'
  | 'trace';

/**
 * Type-safe wrapper for CastrSchema properties.
 * Provides checked access to dynamic property names.
 *
 * @public
 */
import { CastrSchemaProperties } from './schema-properties.js';

export { CastrSchemaProperties };

// Component types extracted to schema.components.ts
import type { IRComponent } from './schema.components.js';
export type {
  IRComponent,
  CastrSchemaComponent,
  IRSecuritySchemeComponent,
  CastrParameterComponent,
  CastrResponseComponent,
  IRRequestBodyComponent,
  IRHeaderComponent,
  IRLinkComponent,
  IRCallbackComponent,
  IRPathItemComponent,
  IRExampleComponent,
} from './schema.components.js';

import type { CastrOperation, IRSecurityRequirement } from './schema.operations.js';

export type {
  CastrOperation,
  CastrParameter,
  IRRequestBody,
  IRMediaType,
  CastrResponse,
  IRResponseHeader,
  IRSecurityRequirement,
} from './schema.operations.js';

/**
 * Schema structure with rich metadata.
 *
 * Represents an OpenAPI schema (primitive, object, array, composition) with
 * recursive structure and metadata for code generation. Preserves all OpenAPI
 * schema properties while adding IR-specific metadata.
 *
 * This is the core building block of the IR, used for schemas, parameters,
 * request bodies, and responses.
 *
 * @example Primitive schema
 * ```typescript
 * const schema: CastrSchema = {
 *   type: 'string',
 *   format: 'email',
 *   metadata: {
 *     required: true,
 *     nullable: false,
 *     zodChain: { presence: '.email()', validations: [], defaults: [] },
 *     dependencyGraph: { references: [], referencedBy: [] },
 *     circularReferences: [],
 *   },
 * };
 * ```
 *
 * @example Object schema
 * ```typescript
 * const schema: CastrSchema = {
 *   type: 'object',
 *   properties: {
 *     id: { type: 'string', metadata: { ... } },
 *     name: { type: 'string', metadata: { ... } },
 *   },
 *   required: ['id'],
 *   metadata: { ... },
 * };
 * ```
 *
 * @example Composition schema
 * ```typescript
 * const schema: CastrSchema = {
 *   allOf: [
 *     { $ref: '#/components/schemas/Base', metadata: { ... } },
 *     { type: 'object', properties: { extra: { ... } }, metadata: { ... } },
 *   ],
 *   metadata: { ... },
 * };
 * ```
 *
 * @see {@link CastrSchemaNode} for metadata structure
 *
 * @public
 */
export interface CastrSchema {
  /**
   * Schema type from OpenAPI.
   * Can be a single type or array of types (OAS 3.1.0+).
   *
   * @example 'string', 'object', ['string', 'null']
   */
  type?: SchemaObject['type'];

  /**
   * Format hint for primitives.
   *
   * @example 'date-time', 'email', 'uuid', 'int32'
   */
  format?: string;

  /**
   * Schema description for documentation.
   */
  description?: string;

  /**
   * Human-readable title for this schema.
   * Used for documentation and generated type names.
   *
   * @remarks
   * Also defined in JSON Schema and OpenAPI specifications.
   */
  title?: string;

  /**
   * Default value for this schema.
   */
  default?: unknown;

  /**
   * Example value for this schema.
   */
  example?: unknown;

  /**
   * Multiple named examples.
   */
  examples?: unknown[];

  /**
   * Enum values (for string/number enums).
   */
  enum?: unknown[];

  /**
   * Constant value (OAS 3.1.0+).
   */
  const?: unknown;

  // Object properties
  /**
   * Object properties (for type: 'object').
   * Wrapped in CastrSchemaProperties for type-safe dynamic property access.
   *
   * @see {@link CastrSchemaProperties} for type-safe access methods
   */
  properties?: CastrSchemaProperties;

  /**
   * Required property names (for type: 'object').
   */
  required?: string[];

  /**
   * Additional properties schema (for type: 'object').
   * - `true`: allows any additional properties
   * - `false`: disallows additional properties
   * - schema: additional properties must match schema
   */
  additionalProperties?: boolean | CastrSchema;

  // Array properties
  /**
   * Array items schema (for type: 'array').
   * Can be a single schema or tuple of schemas.
   */
  items?: CastrSchema | CastrSchema[];

  /**
   * Minimum array length.
   */
  minItems?: number;

  /**
   * Maximum array length.
   */
  maxItems?: number;

  /**
   * Whether array items must be unique.
   */
  uniqueItems?: boolean;

  // String properties
  /**
   * Minimum string length.
   */
  minLength?: number;

  /**
   * Maximum string length.
   */
  maxLength?: number;

  /**
   * Regex pattern for string validation.
   */
  pattern?: string;

  /**
   * Content encoding (OAS 3.1).
   * @example 'base64', 'base64url'
   */
  contentEncoding?: string;

  // Number properties
  /**
   * Minimum number value (inclusive).
   */
  minimum?: number;

  /**
   * Maximum number value (inclusive).
   */
  maximum?: number;

  /**
   * Minimum number value (exclusive).
   */
  exclusiveMinimum?: number | boolean;

  /**
   * Maximum number value (exclusive).
   */
  exclusiveMaximum?: number | boolean;

  /**
   * Number must be a multiple of this value.
   */
  multipleOf?: number;

  // Composition keywords
  /**
   * AllOf composition (intersection/merge).
   * Schema must match ALL sub-schemas.
   */
  allOf?: CastrSchema[];

  /**
   * OneOf composition (exclusive union).
   * Schema must match EXACTLY ONE sub-schema.
   */
  oneOf?: CastrSchema[];

  /**
   * AnyOf composition (inclusive union).
   * Schema must match AT LEAST ONE sub-schema.
   */
  anyOf?: CastrSchema[];

  /**
   * Not composition (negation).
   * Schema must NOT match this sub-schema.
   */
  not?: CastrSchema;

  /**
   * Discriminator for oneOf/anyOf (OAS 3.1.0+).
   * Enables efficient type discrimination.
   */
  discriminator?: SchemaObject['discriminator'];

  // Reference
  /**
   * Reference to another schema.
   * Preserved for dependency tracking even after resolution.
   *
   * @example '#/components/schemas/Pet'
   */
  $ref?: string;

  /**
   * Whether this schema is read-only (response only).
   */
  readOnly?: boolean;

  /**
   * Whether this schema is write-only (request only).
   */
  writeOnly?: boolean;

  /**
   * Whether this schema is deprecated.
   */
  deprecated?: boolean;

  // ========== OpenAPI Extensions (OAS 3.1) ==========

  /**
   * XML serialization metadata for this schema.
   * Used to customize XML representation of the schema.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#xml-object OpenAPI XML Object}
   */
  xml?: XmlObject;

  /**
   * External documentation for this schema.
   * Can be used at the schema level for documentation links.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#external-documentation-object ExternalDocumentation Object}
   */
  externalDocs?: ExternalDocumentationObject;

  // ========== Advanced Validation Keywords ==========

  /**
   * Schemas for positional array items (tuple validation).
   * Each schema applies to the array item at the corresponding index.
   *
   * @example
   * ```typescript
   * // [string, number, boolean] tuple
   * prefixItems: [
   *   { type: 'string', metadata: { ... } },
   *   { type: 'number', metadata: { ... } },
   *   { type: 'boolean', metadata: { ... } },
   * ]
   * ```
   *
   * @remarks
   * Also defined in JSON Schema 2020-12 and OpenAPI 3.1.
   */
  prefixItems?: CastrSchema[];

  /**
   * Controls validation of object properties not covered by `properties`,
   * `patternProperties`, or `additionalProperties`.
   * - `false`: disallow unevaluated properties
   * - `true`: allow any unevaluated properties
   * - schema: unevaluated properties must match schema
   *
   * Useful in composition scenarios (allOf, oneOf) where inherited
   * properties need strict validation.
   *
   * @remarks
   * Also defined in JSON Schema 2020-12 and OpenAPI 3.1.
   */
  unevaluatedProperties?: boolean | CastrSchema;

  /**
   * Controls validation of array items not covered by `prefixItems` or `items`.
   * - `false`: disallow unevaluated items
   * - `true`: allow any unevaluated items
   * - schema: unevaluated items must match schema
   *
   * Useful for tuple-with-rest patterns where prefix items are fixed
   * but trailing items need validation.
   *
   * @remarks
   * Also defined in JSON Schema 2020-12 and OpenAPI 3.1.
   */
  unevaluatedItems?: boolean | CastrSchema;

  /**
   * Conditional schema requirements based on property presence.
   * When a trigger property is present, the corresponding schema
   * must also be satisfied.
   *
   * @example
   * ```typescript
   * // If 'creditCard' is present, require 'billingAddress' as object
   * dependentSchemas: {
   *   creditCard: { type: 'object', properties: { billingAddress: { ... } } }
   * }
   * ```
   *
   * @remarks
   * Also defined in JSON Schema 2020-12 and OpenAPI 3.1.
   */
  dependentSchemas?: Record<string, CastrSchema>;

  /**
   * Conditional required properties based on property presence.
   * When a trigger property is present, the listed properties
   * become required.
   *
   * @example
   * ```typescript
   * // If 'email' is present, 'emailVerified' is required
   * dependentRequired: {
   *   email: ['emailVerified']
   * }
   * ```
   *
   * @remarks
   * Also defined in JSON Schema 2020-12 and OpenAPI 3.1.
   */
  dependentRequired?: Record<string, string[]>;

  /**
   * Minimum number of array items that must match the `contains` schema.
   * Only meaningful when `contains` is also specified.
   *
   * @example
   * ```typescript
   * // At least 2 items must be strings
   * contains: { type: 'string', metadata: { ... } },
   * minContains: 2
   * ```
   *
   * @remarks
   * Also defined in JSON Schema 2020-12 and OpenAPI 3.1.
   */
  minContains?: number;

  /**
   * Maximum number of array items that can match the `contains` schema.
   * Only meaningful when `contains` is also specified.
   *
   * @example
   * ```typescript
   * // At most 5 items can be null
   * contains: { type: 'null', metadata: { ... } },
   * maxContains: 5
   * ```
   *
   * @remarks
   * Also defined in JSON Schema 2020-12 and OpenAPI 3.1.
   */
  maxContains?: number;

  /**
   * Rich metadata for code generation.
   * This is what replaces CodeMetaData and provides enhanced information.
   */
  metadata: CastrSchemaNode;
}

/**
 * Rich metadata for schema nodes - replaces CodeMetaData.
 *
 * Provides comprehensive information for code generation including required status,
 * nullable handling, circular reference detection, dependency tracking, and
 * Zod-specific chain information. This is the enhanced replacement for the legacy
 * CodeMetaData interface.
 *
 * **Migration from CodeMetaData:**
 * - `CodeMetaData.isRequired` → `CastrSchemaNode.required`
 * - `CodeMetaData.referencedBy` → `CastrSchemaNode.dependencyGraph.referencedBy`
 * - `CodeMetaData.parent` → `CastrSchemaNode.inheritance.parent`
 * - NEW: `nullable` (computed from OAS 3.1.0 type arrays)
 * - NEW: `zodChain` (presence, validations, defaults)
 * - NEW: `circularReferences` (detected circular refs)
 *
 * @example
 * ```typescript
 * const metadata: CastrSchemaNode = {
 *   required: true,
 *   nullable: false,
 *   zodChain: {
 *     presence: '.min(1).max(100)',
 *     validations: ['.email()'],
 *     defaults: ['.default("unknown")'],
 *   },
 *   dependencyGraph: {
 *     references: ['#/components/schemas/Address'],
 *     referencedBy: ['#/components/schemas/User'],
 *     depth: 1,
 *   },
 *   circularReferences: [],
 * };
 * ```
 *
 * @see {@link IRZodChainInfo} for Zod chain structure
 * @see {@link CastrSchemaDependencyInfo} for dependency information
 *
 * @public
 */
export interface CastrSchemaNode {
  /**
   * Whether this schema is required in its parent context.
   * - For object properties: present in parent's required array
   * - For parameters: ParameterObject.required === true
   * - For request bodies: RequestBodyObject.required === true
   *
   * Replaces: CodeMetaData.isRequired
   */
  required: boolean;

  /**
   * Whether this schema accepts null values.
   *
   * Computed from:
   * - OAS 3.0.x: schema.nullable === true
   * - OAS 3.1.0+: schema.type includes 'null' (e.g., ['string', 'null'])
   *
   * NEW: Not present in CodeMetaData
   */
  nullable: boolean;

  /**
   * Schema description for code comments.
   * Inherited from CastrSchema.description if not overridden.
   */
  description?: string;

  /**
   * Default value for this schema.
   * Used for .default() chain in Zod.
   */
  default?: unknown;

  /**
   * Dependency graph information for reference tracking.
   *
   * Enhanced from: CodeMetaData.referencedBy
   */
  dependencyGraph: CastrSchemaDependencyInfo;

  /**
   * Inheritance information for composition schemas.
   *
   * Enhanced from: CodeMetaData.parent
   */
  inheritance?: IRInheritanceInfo;

  /**
   * Zod chain information for code generation.
   * Includes presence chains (.optional(), .nullable()), validation chains
   * (.min(), .max(), .email()), and default chains (.default()).
   *
   * NEW: Not present in CodeMetaData
   */
  zodChain: IRZodChainInfo;

  /**
   * Detected circular references in the dependency graph.
   * Used to generate getter-based recursion in Zod output.
   *
   * @example ['#/components/schemas/Node', '#/components/schemas/Tree']
   *
   * NEW: Not present in CodeMetaData (was computed on-the-fly)
   */
  circularReferences: string[];
}

/**
 * Dependency graph information for a schema node.
 *
 * Tracks schema references and reverse references for topological sorting
 * and circular reference detection. Enhanced from CodeMetaData.referencedBy.
 *
 * @public
 */
export interface CastrSchemaDependencyInfo {
  /**
   * Schemas that this schema references (outgoing edges).
   * Extracted from $ref, properties, items, allOf, oneOf, anyOf.
   *
   * @example ['#/components/schemas/Address', '#/components/schemas/Phone']
   */
  references: string[];

  /**
   * Schemas that reference this schema (incoming edges).
   * Used for reverse dependency tracking.
   *
   * @example ['#/components/schemas/User', '#/components/schemas/Company']
   *
   * Enhanced from: CodeMetaData.referencedBy (was ZodCodeResult[])
   */
  referencedBy: string[];

  /**
   * Maximum depth in the dependency graph.
   * Used for topological sorting and generation order.
   *
   * @example 0 = leaf schema, 1 = references leaves, 2 = references depth-1, etc.
   */
  depth: number;
}

/**
 * Inheritance information for composition schemas.
 *
 * Tracks parent schemas in allOf/oneOf/anyOf compositions.
 * Enhanced from CodeMetaData.parent.
 *
 * @public
 */
export interface IRInheritanceInfo {
  /**
   * Parent schema reference for inheritance.
   * Typically the first item in allOf array.
   *
   * @example '#/components/schemas/BaseEntity'
   *
   * Enhanced from: CodeMetaData.parent (was ZodCodeResult)
   */
  parent: string;

  /**
   * Type of composition used.
   */
  compositionType: 'allOf' | 'oneOf' | 'anyOf';

  /**
   * All schemas involved in the composition.
   *
   * @example ['#/components/schemas/Base', '#/components/schemas/Mixin']
   */
  siblings: string[];
}

/**
 * Zod chain information for code generation.
 *
 * Captures Zod-specific method chains for presence (.optional(), .nullable()),
 * validations (.min(), .max(), .email()), and defaults (.default()).
 *
 * @example
 * ```typescript
 * const zodChain: IRZodChainInfo = {
 *   presence: '.optional().nullable()',
 *   validations: ['.email()', '.min(5)', '.max(100)'],
 *   defaults: ['.default("user@example.com")'],
 * };
 * // Generates: z.string().email().min(5).max(100).default("user@example.com").optional().nullable()
 * ```
 *
 * @public
 */
export interface IRZodChainInfo {
  /**
   * Presence chain (optional/nullable/required).
   * Applied at the end of the Zod chain.
   *
   * @example '.optional()', '.nullable()', '.optional().nullable()', ''
   */
  presence: string;

  /**
   * Validation chains (constraints).
   * Applied after the base type but before defaults.
   *
   * @example ['.min(1)', '.max(100)', '.email()', '.uuid()']
   */
  validations: string[];

  /**
   * Default value chains.
   * Applied after validations but before presence.
   *
   * @example ['.default("unknown")', '.default(0)']
   */
  defaults: string[];
}

/**
 * Dependency graph for schema references.
 *
 * Tracks all schema references in the document and detects circular dependencies.
 * Used for topological sorting (generation order) and getter-based recursion.
 *
 * @example
 * ```typescript
 * const graph: IRDependencyGraph = {
 *   nodes: new Map([
 *     ['#/components/schemas/User', {
 *       ref: '#/components/schemas/User',
 *       dependencies: ['#/components/schemas/Address'],
 *       dependents: [],
 *       depth: 1,
 *     }],
 *     ['#/components/schemas/Address', {
 *       ref: '#/components/schemas/Address',
 *       dependencies: [],
 *       dependents: ['#/components/schemas/User'],
 *       depth: 0,
 *     }],
 *   ]),
 *   topologicalOrder: [
 *     '#/components/schemas/Address',
 *     '#/components/schemas/User',
 *   ],
 *   circularReferences: [],
 * };
 * ```
 *
 * @see {@link IRDependencyNode} for node structure
 *
 * @public
 */
export interface IRDependencyGraph {
  /**
   * Dependency graph nodes by schema reference.
   * Key is schema $ref, value is node with dependencies and dependents.
   */
  nodes: Map<string, IRDependencyNode>;

  /**
   * Schemas sorted in topological order (leaves first).
   * Schemas with no dependencies come first, followed by schemas that depend on them.
   *
   * @example ['Address', 'Phone', 'User', 'Company']
   */
  topologicalOrder: string[];

  /**
   * Detected circular reference cycles.
   * Each cycle is an array of schema references forming a loop.
   *
   * @example [['Node', 'Tree', 'Node'], ['Category', 'Subcategory', 'Category']]
   */
  circularReferences: string[][];
}

/**
 * Dependency graph node for a single schema.
 *
 * Tracks outgoing dependencies (schemas this schema references) and
 * incoming dependents (schemas that reference this schema).
 *
 * @public
 */
export interface IRDependencyNode {
  /**
   * Schema reference for this node.
   *
   * @example '#/components/schemas/User'
   */
  ref: string;

  /**
   * Schemas that this schema depends on (outgoing edges).
   *
   * @example ['#/components/schemas/Address', '#/components/schemas/Phone']
   */
  dependencies: string[];

  /**
   * Schemas that depend on this schema (incoming edges).
   *
   * @example ['#/components/schemas/Company', '#/components/schemas/Team']
   */
  dependents: string[];

  /**
   * Depth in the dependency graph.
   * - 0: leaf schema (no dependencies)
   * - 1: depends on leaf schemas
   * - 2: depends on depth-1 schemas
   * - etc.
   */
  depth: number;

  /**
   * Whether this schema is part of a circular reference.
   */
  isCircular: boolean;
}

/**
 * Enum definition for centralized catalog.
 *
 * Represents a reusable enum definition extracted from schemas.
 * Used to generate standalone enum types or objects.
 *
 * @public
 */
export interface IREnum {
  /**
   * Enum name (usually from schema title or component name).
   */
  name: string;

  /**
   * Enum values.
   */
  values: unknown[];

  /**
   * Enum description.
   */
  description?: string;

  /**
   * Schema that defined this enum.
   */
  schema: CastrSchema;
}

/**
 * Complete Intermediate Representation (IR) Document.
 *
 * Represents the lossless Intermediate Representation of an OpenAPI document as the canonical source.
 * Contains all schemas, operations, and metadata required for code generation.
 *
 * @public
 */
export interface CastrDocument {
  /**
   * IR schema version.
   *
   * @example '1.0.0'
   */
  version: string;

  /**
   * OpenAPI specification version from source document.
   *
   * @example '3.1.0'
   */
  openApiVersion: string;

  /**
   * API metadata from OpenAPI Info object.
   */
  info: InfoObject;

  /**
   * Servers from OpenAPI Servers object.
   */
  servers: ServerObject[];

  /**
   * All reusable components (schemas, responses, parameters, etc.).
   */
  components: IRComponent[];

  /**
   * All API operations (endpoints).
   */
  operations: CastrOperation[];

  /**
   * Dependency graph for all schemas in the document.
   */
  dependencyGraph: IRDependencyGraph;

  /**
   * All component schema names in the document.
   * Includes both standard schemas and x-ext vendor extension schemas.
   * Names are simple identifiers, not full $ref paths.
   *
   * @example ['User', 'Address', 'Pet']
   */
  schemaNames: string[];

  /**
   * Catalog of all enums in the document.
   * Key is the enum name (or unique identifier).
   */
  enums: Map<string, IREnum>;

  /**
   * Document-level security requirements.
   *
   * These are the default security requirements that apply to all operations
   * unless overridden at the operation level. An empty array (`security: []`)
   * at the document level means all operations are public by default.
   *
   * @see {@link CastrOperation.security} for operation-level overrides
   * @see {@link https://spec.openapis.org/oas/v3.1.0#security-requirement-object OpenAPI Security Requirement Object}
   */
  security?: IRSecurityRequirement[];

  /**
   * Document-level tags for API categorization.
   * Tags group operations into logical sections.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#tag-object OpenAPI Tag Object}
   */
  tags?: TagObject[];

  /**
   * Document-level external documentation.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#external-documentation-object OpenAPI External Documentation Object}
   */
  externalDocs?: ExternalDocumentationObject;

  /**
   * Webhooks defined in the document (OpenAPI 3.1.x only).
   * Key is the webhook name, value is the path item defining the webhook operations.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields OpenAPI Webhooks}
   */
  webhooks?: Map<string, PathItemObject>;

  /**
   * JSON Schema dialect URI (OpenAPI 3.1.x only).
   * Specifies the default JSON Schema dialect for all schemas in the document.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#schema-dialects OpenAPI Schema Dialects}
   */
  jsonSchemaDialect?: string;
}

/**
 * Type guard for CastrDocument.
 *
 * @param value - The value to check
 * @returns True if the value is an CastrDocument
 */
function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

const CASTR_DOCUMENT_REQUIRED_KEYS = [
  'version',
  'info',
  'servers',
  'components',
  'operations',
  'dependencyGraph',
  'schemaNames',
  'enums',
] as const;

export function isCastrDocument(value: unknown): value is CastrDocument {
  if (!isObject(value)) {
    return false;
  }
  return CASTR_DOCUMENT_REQUIRED_KEYS.every((key) => key in value);
}
