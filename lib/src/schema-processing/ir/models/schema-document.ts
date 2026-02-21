import type {
  InfoObject,
  ServerObject,
  TagObject,
  ExternalDocumentationObject,
  PathItemObject,
} from 'openapi3-ts/oas31';
import type { CastrSchema, IRDependencyGraph } from './schema.js';
import type { IRComponent } from './schema.components.js';
import type { CastrOperation, IRSecurityRequirement } from './schema.operations.js';

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
