import type {
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
  OperationObject,
} from 'openapi3-ts/oas31';

import { getEndpointDefinitionList } from '../endpoints/index.js';

// Import helpers from new modules
import {
  extractSchemaNamesFromDoc,
  buildDependencyGraphForSchemas,
  buildSchemasMap,
  sortSchemasByDependencies,
  exportUnusedSchemas,
} from './template-context.schemas.js';
import { processTypesForSchemas } from './template-context.types.js';
import {
  processEndpointGroupingAndCommonSchemas,
  type MinimalTemplateContext,
} from './template-context.endpoints.js';
import type { EndpointDefinition } from '../endpoints/definition.types.js';
import type { CodeMetaData } from '../conversion/zod/index.js';
import { buildMcpTools, type TemplateContextMcpTool } from './template-context.mcp.js';
import { buildIR } from './ir-builder.js';
import type { IRDocument } from './ir-schema.js';

// Type definitions
export interface TemplateContext {
  schemas: Record<string, string>;
  endpoints: EndpointDefinition[];
  endpointsGroups: Record<string, MinimalTemplateContext>;
  types: Record<string, string>;
  circularTypeByName: Record<string, true>;
  emittedType: Record<string, true>;
  commonSchemaNames?: Set<string>;
  options?: TemplateContextOptions | undefined;
  mcpTools: TemplateContextMcpTool[];
  /**
   * Information Retrieval (IR) document containing lossless OpenAPI metadata.
   *
   * This field contains the IR representation of the OpenAPI document, which includes:
   * - All component schemas with rich metadata (IRSchemaNode)
   * - All operations with parameters, request bodies, and responses
   * - Dependency graph for circular reference detection
   *
   * The IR replaces CodeMetaData and provides richer metadata for code generation.
   *
   * @see {@link IRDocument} for complete IR structure
   * @since Phase 3 Session 2
   */
  _ir?: IRDocument;
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
    parentMeta?: CodeMetaData,
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
 * Process schemas with optional unused schema export.
 * Helper function to reduce complexity of getTemplateContext.
 *
 * @internal
 */
function processSchemas(
  endpoints: ReturnType<typeof getEndpointDefinitionList>,
  deepDependencyGraph: Record<string, Set<string>>,
  doc: OpenAPIObject,
  options: TemplateContextOptions | undefined,
): {
  sortedSchemas: Record<string, string>;
  circularTypeByName: Record<string, true>;
} {
  const circularTypeByName: Record<string, true> = {};
  const schemas = buildSchemasMap(
    endpoints.zodSchemaByName,
    deepDependencyGraph,
    circularTypeByName,
  );
  let sortedSchemas = sortSchemasByDependencies(schemas, deepDependencyGraph);

  if (options?.shouldExportAllSchemas) {
    const docSchemas = doc.components?.schemas ?? {};
    exportUnusedSchemas(docSchemas, endpoints, doc, options);
    const allSchemas = buildSchemasMap(
      endpoints.zodSchemaByName,
      deepDependencyGraph,
      circularTypeByName,
    );
    // Sort all schemas (including newly exported ones) by dependencies
    sortedSchemas = sortSchemasByDependencies(allSchemas, deepDependencyGraph);
  }

  return { sortedSchemas, circularTypeByName };
}

/**
 * Build final template context result.
 * Helper function to reduce complexity of getTemplateContext.
 *
 * @internal
 */
function buildTemplateContextResult(
  sortedSchemas: Record<string, string>,
  sortedEndpoints: EndpointDefinition[],
  endpointsGroups: Record<string, MinimalTemplateContext>,
  types: Record<string, string>,
  circularTypeByName: Record<string, true>,
  emittedType: Record<string, true>,
  commonSchemaNames: Set<string> | undefined,
  mcpTools: TemplateContextMcpTool[],
  irDocument: IRDocument,
): TemplateContext {
  const result: TemplateContext = {
    schemas: sortedSchemas,
    endpoints: sortedEndpoints,
    endpointsGroups,
    types,
    circularTypeByName,
    emittedType,
    mcpTools,
    _ir: irDocument,
  };

  if (commonSchemaNames !== undefined) {
    result.commonSchemaNames = commonSchemaNames;
  }

  result.options = { withAlias: false, baseUrl: '' };
  return result;
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
  const schemaNames = extractSchemaNamesFromDoc(doc);
  const { deepDependencyGraph } = buildDependencyGraphForSchemas(schemaNames, doc);
  const endpoints = getEndpointDefinitionList(doc, options);

  const { sortedSchemas, circularTypeByName } = processSchemas(
    endpoints,
    deepDependencyGraph,
    doc,
    options,
  );

  const { types, emittedType } = processTypesForSchemas(deepDependencyGraph, doc, options);

  const { endpointsGroups, commonSchemaNames } = processEndpointGroupingAndCommonSchemas(
    endpoints.endpoints,
    doc,
    options?.groupStrategy ?? 'none',
    deepDependencyGraph,
    sortedSchemas,
    types,
  );

  const sortedEndpoints = [...endpoints.endpoints].sort((a, b) => a.path.localeCompare(b.path));
  const mcpTools = buildMcpTools({
    document: doc,
    endpoints: sortedEndpoints,
  });

  // Build IR document for enhanced metadata
  const irDocument = buildIR(doc);

  return buildTemplateContextResult(
    sortedSchemas,
    sortedEndpoints,
    endpointsGroups,
    types,
    circularTypeByName,
    emittedType,
    commonSchemaNames,
    mcpTools,
    irDocument,
  );
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
 * import { getZodClientTemplateContext, prepareOpenApiDocument } from 'openapi-zod-client';
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
