import type {
  CallbackObject,
  EncodingObject,
  ExampleObject,
  ExternalDocumentationObject,
  HeaderObject,
  InfoObject,
  LinkObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  SchemaObject,
  SecuritySchemeObject,
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

/**
 * Reusable component definition from OpenAPI components section.
 */
export type IRComponent =
  | CastrSchemaComponent
  | IRSecuritySchemeComponent
  | CastrParameterComponent
  | CastrResponseComponent
  | IRRequestBodyComponent
  | IRHeaderComponent
  | IRLinkComponent
  | IRCallbackComponent
  | IRPathItemComponent
  | IRExampleComponent;

export interface CastrSchemaComponent {
  /**
   * Component type discriminator.
   */
  type: 'schema';

  /**
   * Component name from #/components/{type}/{name}.
   */
  name: string;

  /**
   * The actual schema definition.
   */
  schema: CastrSchema;

  /**
   * Rich metadata for code generation.
   */
  metadata: CastrSchemaNode;

  /**
   * Original OpenAPI description.
   */
  description?: string;
}

export interface IRSecuritySchemeComponent {
  type: 'securityScheme';
  name: string;
  scheme: SecuritySchemeObject | ReferenceObject;
}

export interface CastrParameterComponent {
  type: 'parameter';
  name: string;
  parameter: CastrParameter;
}

export interface CastrResponseComponent {
  type: 'response';
  name: string;
  response: CastrResponse;
}

export interface IRRequestBodyComponent {
  type: 'requestBody';
  name: string;
  requestBody: IRRequestBody;
}

/**
 * Header component definition from OpenAPI components/headers section.
 */
export interface IRHeaderComponent {
  type: 'header';
  name: string;
  header: HeaderObject | ReferenceObject;
}

/**
 * Link component definition from OpenAPI components/links section.
 * Links describe the relationship between operations.
 */
export interface IRLinkComponent {
  type: 'link';
  name: string;
  link: LinkObject | ReferenceObject;
}

/**
 * Callback component definition from OpenAPI components/callbacks section.
 * Callbacks are webhook-like patterns triggered by the server.
 */
export interface IRCallbackComponent {
  type: 'callback';
  name: string;
  callback: CallbackObject | ReferenceObject;
}

/**
 * PathItem component definition from OpenAPI components/pathItems section (3.1.x).
 * Reusable path items that can be referenced.
 */
export interface IRPathItemComponent {
  type: 'pathItem';
  name: string;
  pathItem: PathItemObject | ReferenceObject;
}

/**
 * Example component definition from OpenAPI components/examples section.
 * Reusable examples that can be referenced.
 */
export interface IRExampleComponent {
  type: 'example';
  name: string;
  example: ExampleObject | ReferenceObject;
}

/**
 * Endpoint operation metadata extracted from OpenAPI paths.
 *
 * Represents a single HTTP operation (method + path combination) with all
 * associated metadata including parameters, request body, responses, and
 * security requirements. Used for endpoint definition generation.
 *
 * @example
 * ```typescript
 * const operation: CastrOperation = {
 *   operationId: 'getPetById',
 *   method: 'get',
 *   path: '/pets/{petId}',
 *   description: 'Returns a single pet',
 *   parameters: [
 *     {
 *       name: 'petId',
 *       in: 'path',
 *       required: true,
 *       schema: { type: 'string', metadata: { ... } },
 *     },
 *   ],
 *   responses: [
 *     {
 *       statusCode: '200',
 *       description: 'Successful response',
 *       schema: { $ref: '#/components/schemas/Pet', metadata: { ... } },
 *     },
 *   ],
 *   tags: ['pets'],
 * };
 * ```
 *
 * @see {@link CastrParameter} for parameter definitions
 * @see {@link CastrResponse} for response definitions
 *
 * @public
 */

export interface CastrOperation {
  /**
   * Unique operation identifier from OpenAPI operationId.
   * Used for function naming and MCP tool identification.
   * Optional - not all OpenAPI operations have operationId defined.
   *
   * @example 'getUserById', 'createPet', 'listProducts'
   */
  operationId?: string;

  /**
   * HTTP method for this operation.
   * One of: get, post, put, patch, delete, head, options.
   */
  method: IRHttpMethod;

  /**
   * API path with parameter placeholders.
   *
   * @example '/users/{userId}', '/pets', '/api/v1/products/{id}'
   */
  path: string;

  /**
   * Human-readable description of the operation.
   * Used for code comments and documentation.
   */
  description?: string;

  /**
   * Operation summary (shorter than description).
   * Used for inline comments and function JSDoc.
   */
  summary?: string;

  /**
   * Path, query, header, and cookie parameters.
   * Ordered as they appear in the OpenAPI spec.
   */
  parameters: CastrParameter[];

  /**
   * Parameters grouped by location for easier access by writers.
   *
   * @example
   * ```typescript
   * {
   *   query: [pageParam, limitParam],
   *   path: [idParam],
   *   header: [authParam],
   *   cookie: []
   * }
   * ```
   */
  parametersByLocation: Record<'query' | 'path' | 'header' | 'cookie', CastrParameter[]>;

  /**
   * Optional request body definition.
   * Only present for POST, PUT, PATCH operations.
   */
  requestBody?: IRRequestBody;

  /**
   * Response definitions by status code.
   * Includes success responses (2xx) and error responses (4xx, 5xx).
   */
  responses: CastrResponse[];

  /**
   * Security requirements for this operation.
   * If empty, operation has no security constraints.
   */
  security?: IRSecurityRequirement[];

  /**
   * Tags for grouping operations.
   * Used for code organization and file grouping strategies.
   */
  tags?: string[];

  /**
   * Whether this operation is deprecated.
   * Used for JSDoc deprecation annotations.
   */
  deprecated?: boolean;

  /**
   * External documentation for this operation.
   * @see {@link https://spec.openapis.org/oas/v3.1.0#external-documentation-object}
   */
  externalDocs?: ExternalDocumentationObject;

  /**
   * Callbacks for this operation.
   * @see {@link https://spec.openapis.org/oas/v3.1.0#callback-object}
   */
  callbacks?: Record<string, CallbackObject | ReferenceObject>;

  /**
   * Servers for this operation (overrides document-level servers).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#server-object}
   */
  servers?: ServerObject[];

  /**
   * PathItem-level summary (applies to all operations in this path).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
   */
  pathItemSummary?: string;

  /**
   * PathItem-level description (applies to all operations in this path).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
   */
  pathItemDescription?: string;

  /**
   * PathItem-level servers (applies to all operations in this path).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
   */
  pathItemServers?: ServerObject[];
}

/**
 * Parameter definition for operations.
 *
 * Represents path, query, header, or cookie parameters with their schema
 * and validation metadata. Preserves all OpenAPI parameter properties.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#parameter-object OpenAPI Parameter Object}
 * @public
 */
export interface CastrParameter {
  /**
   * Parameter name as it appears in the operation.
   *
   * @example 'userId', 'pageSize', 'Authorization'
   */
  name: string;

  /**
   * Parameter location discriminator.
   */
  in: 'path' | 'query' | 'header' | 'cookie';

  /**
   * Whether the parameter is required.
   * Path parameters are always required.
   */
  required: boolean;

  /**
   * Parameter schema definition.
   * Can be a primitive, object, array, or reference.
   */
  schema: CastrSchema;

  /**
   * Rich metadata for code generation.
   * Includes validation constraints, nullable status, dependencies, etc.
   * Extracted from the parameter's schema.
   */
  metadata?: CastrSchemaNode;

  /**
   * Parameter description for documentation.
   */
  description?: string;

  /**
   * Whether the parameter is deprecated.
   */
  deprecated?: boolean;

  /**
   * Example value for the parameter.
   * OpenAPI spec allows any JSON value.
   */
  example?: unknown;

  /**
   * Multiple named examples.
   * OpenAPI spec allows any structure for examples.
   */
  examples?: Record<string, { value?: unknown; summary?: string; description?: string }>;

  /**
   * Style of parameter serialization.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#style-values OpenAPI Style Values}
   */
  style?: ParameterObject['style'];

  /**
   * Whether arrays/objects should be exploded.
   */
  explode?: boolean;

  /**
   * Whether parameter allows reserved characters.
   */
  allowReserved?: boolean;
}

/**
 * Request body definition for operations.
 *
 * Represents the request payload for POST, PUT, PATCH operations.
 * Includes content type and schema information.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#request-body-object OpenAPI RequestBody Object}
 * @public
 */
export interface IRRequestBody {
  /**
   * Whether the request body is required.
   */
  required: boolean;

  /**
   * Request body description for documentation.
   */
  description?: string;

  /**
   * Content type to schema mapping.
   * Key is media type (e.g., 'application/json').
   */
  content: Record<string, IRMediaType>;
}

/**
 * Media type definition with schema.
 *
 * Represents a content type and its associated schema for request/response bodies.
 *
 * @public
 */
export interface IRMediaType {
  /**
   * Schema for this media type.
   */
  schema: CastrSchema;

  /**
   * Example value for this media type.
   */
  example?: unknown;

  /**
   * Multiple named examples.
   */
  examples?: Record<string, ReferenceObject | ExampleObject>;

  /**
   * Encoding information for multipart/form-data request bodies.
   * Map of property name to encoding configuration.
   *
   * @example
   * ```typescript
   * {
   *   'profileImage': {
   *     contentType: 'image/png',
   *     headers: { ... }
   *   }
   * }
   * ```
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#encoding-object OpenAPI Encoding Object}
   */
  encoding?: Record<string, EncodingObject>;
}

/**
 * Response definition for operations.
 *
 * Represents an HTTP response with status code, description, and schema.
 * Includes both success responses (2xx) and error responses (4xx, 5xx).
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#response-object OpenAPI Response Object}
 * @public
 */
export interface CastrResponse {
  /**
   * HTTP status code or 'default'.
   *
   * @example '200', '404', '500', 'default'
   */
  statusCode: string;

  /**
   * Response description for documentation.
   */
  description?: string;

  /**
   * Response schema (optional for 204 No Content).
   */
  schema?: CastrSchema;

  /**
   * Content type to schema mapping (if multiple content types).
   */
  content?: Record<string, IRMediaType>;

  /**
   * Response headers.
   */
  headers?: Record<string, CastrSchema>;

  /**
   * Links for response.
   * @see {@link https://spec.openapis.org/oas/v3.1.0#link-object}
   */
  links?: Record<string, LinkObject | ReferenceObject>;
}

/**
 * Security requirement for operations.
 *
 * Represents OAuth2 scopes or API key requirements for an operation.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#security-requirement-object OpenAPI Security Requirement Object}
 * @public
 */
export interface IRSecurityRequirement {
  /**
   * Security scheme name from components/securitySchemes.
   */
  schemeName: string;

  /**
   * OAuth2 scopes required (empty for API keys).
   */
  scopes: string[];
}

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

  // ========== JSON Schema 2020-12 Keywords ==========

  /**
   * Prefix items for tuple validation (JSON Schema 2020-12).
   * Replaces array-style `items` from JSON Schema Draft 7.
   *
   * @example
   * ```typescript
   * // Input (OAS 3.0): items: [{ type: 'string' }, { type: 'number' }]
   * // Output (OAS 3.1): prefixItems: [{ type: 'string' }, { type: 'number' }]
   * ```
   *
   * @see {@link https://json-schema.org/draft/2020-12/json-schema-core#name-prefixitems}
   */
  prefixItems?: CastrSchema[];

  /**
   * Controls evaluation of properties not covered by other keywords.
   * - `false`: disallow unevaluated properties
   * - `true`: allow any unevaluated properties
   * - schema: unevaluated properties must match schema
   *
   * @see {@link https://json-schema.org/draft/2020-12/json-schema-core#name-unevaluatedproperties}
   */
  unevaluatedProperties?: boolean | CastrSchema;

  /**
   * Controls evaluation of array items not covered by other keywords.
   * - `false`: disallow unevaluated items
   * - `true`: allow any unevaluated items
   * - schema: unevaluated items must match schema
   *
   * @see {@link https://json-schema.org/draft/2020-12/json-schema-core#name-unevaluateditems}
   */
  unevaluatedItems?: boolean | CastrSchema;

  /**
   * Conditional schema application based on property presence.
   * Map of property name to schema that applies when property exists.
   *
   * @see {@link https://json-schema.org/draft/2020-12/json-schema-core#name-dependentschemas}
   */
  dependentSchemas?: Record<string, CastrSchema>;

  /**
   * Conditional required properties based on property presence.
   * Map of property name to list of properties required when it exists.
   *
   * @see {@link https://json-schema.org/draft/2020-12/json-schema-core#name-dependentrequired}
   */
  dependentRequired?: Record<string, string[]>;

  /**
   * Minimum number of matches for `contains` keyword.
   * Only applicable when `contains` is also specified.
   *
   * @see {@link https://json-schema.org/draft/2020-12/json-schema-validation#name-mincontains}
   */
  minContains?: number;

  /**
   * Maximum number of matches for `contains` keyword.
   * Only applicable when `contains` is also specified.
   *
   *@see {@link https://json-schema.org/draft/2020-12/json-schema-validation#name-maxcontains}
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
   * Used to generate z.lazy() wrappers.
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
 * Used for topological sorting (generation order) and z.lazy() generation.
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
