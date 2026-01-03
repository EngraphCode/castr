import type {
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
  OperationObject,
} from 'openapi3-ts/oas31';

// Import helpers from new modules
import {
  extractSchemaNamesFromDoc,
  buildDependencyGraphForSchemas,
  sortSchemasByDependencies,
} from './template-context.schemas.js';
import {
  processEndpointGroupingAndCommonSchemas,
  type MinimalTemplateContext,
} from './template-context.endpoints.js';
import type { EndpointDefinition } from '../endpoints/definition.types.js';
import { buildMcpTools, type TemplateContextMcpTool } from './template-context.mcp.js';
import { buildIR } from './ir-builder.js';
import type { CastrDocument } from './ir-schema.js';
import { getEndpointDefinitionsFromIR } from './template-context.endpoints.from-ir.js';
import { extractInlineSchemas } from './inline-schemas.js';

// Type definitions
export interface TemplateContext {
  sortedSchemaNames: string[];
  endpoints: EndpointDefinition[];
  endpointsGroups: Record<string, MinimalTemplateContext>;
  commonSchemaNames?: Set<string>;
  options?: TemplateContextOptions | undefined;
  mcpTools: TemplateContextMcpTool[];
  /**
   * Information Retrieval (IR) document containing lossless OpenAPI metadata.
   *
   * This field contains the IR representation of the OpenAPI document, which includes:
   * - All component schemas with rich metadata (CastrSchemaNode)
   * - All operations with parameters, request bodies, and responses
   * - Dependency graph for circular reference detection
   *
   * The IR replaces CodeMetaData and provides richer metadata for code generation.
   *
   * @see {@link CastrDocument} for complete IR structure
   * @since Phase 3 Session 2
   */
  _ir?: CastrDocument;
}

export interface TemplateContextOptions {
  groupStrategy?: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file';
  shouldExportAllTypes?: boolean;
  /**
   * Controls how endpoints with only a `default` response (no explicit status codes) are handled.
   *
   * - `'spec-compliant'` (default): Ignores endpoints with only default responses,
   *   following OpenAPI specification recommendations to use explicit status codes.
   * - `'auto-correct'`: Includes endpoints with only default responses, treating
   *   `default` as a success response with generic error handling.
   *
   * @default 'spec-compliant'
   * @see {@link https://spec.openapis.org/oas/v3.1.0#responses-object OpenAPI Responses Object}
   * @remarks
   * The OpenAPI specification recommends using explicit status codes (200, 404, etc.)
   * rather than only `default`. This option allows you to control the library's behavior
   * when encountering such endpoints.
   *
   * @example
   * ```typescript
   * // Strict spec compliance (ignore default-only endpoints)
   * { defaultStatusBehavior: 'spec-compliant' }
   *
   * // Permissive (include default-only endpoints)
   * { defaultStatusBehavior: 'auto-correct' }
   * ```
   */
  defaultStatusBehavior?: 'spec-compliant' | 'auto-correct';
  willSuppressWarnings?: boolean;
  withDescription?: boolean;
  endpointDefinitionRefiner?: (
    defaultDefinition: EndpointDefinition,
    operation: OperationObject,
  ) => EndpointDefinition | undefined;
  allReadonly?: boolean;
  strictObjects?: boolean;
  additionalPropertiesDefaultValue?: boolean | SchemaObject;
  withAllResponses?: boolean;
  exportAllNamedSchemas?: boolean;
  schemaRefiner?: <T extends SchemaObject | ReferenceObject>(
    schema: T,
    parentMeta?: unknown, // CodeMetaData removed
  ) => T | undefined;
  // Additional properties used by CLI
  baseUrl?: string;
  apiClientName?: string;
  isErrorStatus?: ((status: number) => boolean) | string;
  isMainResponseStatus?: ((status: number) => boolean) | string;
  isMediaTypeAllowed?: ((mediaType: string) => boolean) | string;
  shouldExportAllSchemas?: boolean;
  withImplicitRequiredProps?: boolean;
  withDeprecatedEndpoints?: boolean;
  complexityThreshold?: number;
  withAlias?: boolean | ((path: string, method: string, operation: OperationObject) => string);
  withDocs?: boolean;
  template?: string;
  withDefaultValues?: boolean;
  useMainResponseDescriptionAsEndpointDefinitionFallback?: boolean;
  withValidationHelpers?: boolean;
  withSchemaRegistry?: boolean;
}

/**
 * Process schemas to determine topological sort order.
 * Helper function to reduce complexity of getTemplateContext.
 *
 * @internal
 */
function processSchemas(deepDependencyGraph: Record<string, Set<string>>): {
  sortedSchemaNames: string[];
} {
  // We just need the names for sorting, we don't need the schema map anymore
  // as we'll use the IR for generation
  const schemaNames = Object.keys(deepDependencyGraph);

  // Create a dummy map for the sort function.
  // Note: sortSchemasByDependencies expects Record<string, string> for legacy compatibility.
  // During IR-based generation, only the schema names are needed for topological sorting.
  const dummySchemas = schemaNames.reduce<Record<string, string>>((acc, name) => {
    acc[name] = '';
    return acc;
  }, {});

  const sortedSchemas = sortSchemasByDependencies(dummySchemas, deepDependencyGraph);
  const sortedSchemaNames = Object.keys(sortedSchemas);

  return { sortedSchemaNames };
}

/**
 * Main function to generate template context from OpenAPI document.
 * Orchestrates the entire process of building template context.
 *
 * @param doc - The OpenAPI document
 * @param options - Template context options
 * @returns Complete template context for code generation
 */
export const getTemplateContext = (
  doc: OpenAPIObject,
  options?: TemplateContextOptions,
): TemplateContext => {
  // Build IR document for enhanced metadata - Source of Truth
  const irDocument = buildIR(doc);

  const schemaNames = extractSchemaNamesFromDoc(doc);
  const { deepDependencyGraph } = buildDependencyGraphForSchemas(schemaNames, doc);

  // Generate endpoints from IR
  const endpoints = getEndpointDefinitionsFromIR(irDocument);

  // Extract inline schemas (e.g. request bodies) to be exported as named components
  // This restores legacy behavior where inline schemas were "hoisted"
  const inlineComponents = extractInlineSchemas(irDocument);
  irDocument.components.push(...inlineComponents);

  const { sortedSchemaNames } = processSchemas(deepDependencyGraph);

  // Add inline component names to sortedSchemaNames
  // We append them at the end. Since they are extracted from operations,
  // they likely depend on existing components (if any), so order should be fine.
  inlineComponents.forEach((c) => sortedSchemaNames.push(c.name));

  // We no longer process types here as they are generated by TypeWriter from IR

  const { endpointsGroups, commonSchemaNames } = processEndpointGroupingAndCommonSchemas(
    endpoints,
    doc,
    options?.groupStrategy ?? 'none',
    deepDependencyGraph,
    // Pass empty maps as legacy schema/type maps are not used in IR-based architecture.
    // The grouping logic uses endpoint dependencies from CastrSchema metadata instead.
    {},
    {},
  );

  const sortedEndpoints = [...endpoints].sort((a, b) => a.path.localeCompare(b.path));
  const mcpTools = buildMcpTools({
    document: doc,
    endpoints: sortedEndpoints,
  });

  const result: TemplateContext = {
    sortedSchemaNames,
    endpoints: sortedEndpoints,
    endpointsGroups,
    mcpTools,
    _ir: irDocument,
  };

  if (commonSchemaNames !== undefined) {
    result.commonSchemaNames = commonSchemaNames;
  }

  result.options = { withAlias: false, baseUrl: '', ...options };
  return result;
};

// Re-export types and functions for external use
export type { TemplateContextGroupStrategy } from './template-context.endpoints.js';
export { extractSchemaNamesFromDoc } from './template-context.schemas.js';

/**
 * Get Zod client template context for code generation.
 *
 * Transforms an OpenAPI document into a structured template context containing:
 * - Zod schemas for all components
 * - Endpoint definitions with parameters, request bodies, and responses
 * - Dependency graphs for schema ordering
 * - TypeScript types for schemas (when enabled)
 * - Metadata for template rendering
 *
 * This is the core transformation function used by {@link generateZodClientFromOpenAPI}
 * to prepare data for Handlebars template rendering.
 *
 * @param doc - The OpenAPI document (should be prepared via {@link prepareOpenApiDocument})
 * @param options - Template context options controlling code generation behavior
 * @returns Complete template context ready for Handlebars rendering
 *
 * @example Basic usage
 * ```typescript
 * import { getZodClientTemplateContext, prepareOpenApiDocument } from '@engraph/castr';
 *
 * const doc = await prepareOpenApiDocument('./api.yaml');
 * const context = getZodClientTemplateContext(doc, {
 *   withAlias: true,
 *   strictObjects: true,
 * });
 *
 * // Access generated schemas
 * console.log(context.schemas.User); // 'z.object({ ... })'
 *
 * // Access endpoint definitions
 * context.endpoints.forEach(endpoint => {
 *   console.log(`${endpoint.method} ${endpoint.path}`);
 * });
 * ```
 *
 * @example With custom options
 * ```typescript
 * const context = getZodClientTemplateContext(doc, {
 *   groupStrategy: 'tag-file',
 *   defaultStatusBehavior: 'auto-correct',
 *   shouldExportAllTypes: true,
 *   complexityThreshold: 5,
 * });
 * ```
 *
 * @public
 */
export const getZodClientTemplateContext = (
  doc: OpenAPIObject,
  options?: TemplateContextOptions,
): TemplateContext => {
  return getTemplateContext(doc, options);
};
