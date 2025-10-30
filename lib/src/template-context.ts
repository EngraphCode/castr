import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

import { getEndpointDefinitionList } from './getEndpointDefinitionList.js';
import { getZodSchema } from './openApiToZod.js';

// Import helpers from new modules
import {
  extractSchemaNamesFromDoc,
  buildDependencyGraphForSchemas,
  buildSchemasMap,
  sortSchemasByDependencies,
} from './template-context.schemas.js';
import { processTypesForSchemas } from './template-context.types.js';
import {
  processEndpointGrouping,
  processCommonSchemasForGroups,
  type MinimalTemplateContext,
  type TemplateContextGroupStrategy,
} from './template-context.endpoints.js';
import type { EndpointDefinition } from './endpoint-definition.types.js';
import type { CodeMetaData } from './CodeMeta.js';
import type { OperationObject } from 'openapi3-ts/oas30';

// Type definitions
export type TemplateContext = {
  schemas: Record<string, string>;
  endpoints: EndpointDefinition[];
  endpointsGroups: Record<string, MinimalTemplateContext>;
  types: Record<string, string>;
  circularTypeByName: Record<string, true>;
  emittedType: Record<string, true>;
  commonSchemaNames?: Set<string>;
  options?: TemplateContextOptions | undefined;
};

export type TemplateContextOptions = {
  groupStrategy?: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file';
  shouldExportAllTypes?: boolean;
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
};

/**
 * Export unused schemas by generating Zod schemas for them.
 * Mutates result.zodSchemaByName to add schemas not already present.
 *
 * @param docSchemas - Map of schema names to OpenAPI schema objects
 * @param result - Endpoint definition list result (mutated)
 * @param doc - The OpenAPI document
 * @param options - Template context options
 *
 * @internal
 */
export const exportUnusedSchemas = (
  docSchemas: Record<string, SchemaObject | ReferenceObject>,
  result: {
    zodSchemaByName: Record<string, string>;
  },
  doc: OpenAPIObject,
  options?: TemplateContext['options'],
): void => {
  Object.entries(docSchemas).forEach(([name, schema]) => {
    if (!result.zodSchemaByName[name]) {
      const schemaArgs = {
        schema,
        ctx: {
          doc,
          zodSchemaByName: result.zodSchemaByName,
          schemaByName: result.zodSchemaByName,
        },
        options,
      };
      const zodSchema = getZodSchema(schemaArgs);
      const zodSchemaString = zodSchema.toString();
      if (!zodSchemaString) {
        throw new Error(
          `Could not get Zod schema string for schema: ${name}, with value: ${JSON.stringify(schema)}`,
        );
      }
      result.zodSchemaByName[name] = zodSchemaString;
    }
  });
};

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
  // Extract schema names from document
  const schemaNames = extractSchemaNamesFromDoc(doc);

  // Build dependency graph for schemas
  const { deepDependencyGraph } = buildDependencyGraphForSchemas(schemaNames, doc);

  // Get endpoint definitions
  const endpoints = getEndpointDefinitionList(doc, options);

  // Build schemas map and track circular types
  const circularTypeByName: Record<string, true> = {};
  const schemas = buildSchemasMap(
    endpoints.zodSchemaByName,
    deepDependencyGraph,
    circularTypeByName,
  );

  // Sort schemas by dependencies
  const sortedSchemas = sortSchemasByDependencies(schemas, deepDependencyGraph);

  // Export unused schemas if option is enabled
  if (options?.shouldExportAllSchemas) {
    const docSchemas = doc.components?.schemas ?? {};
    exportUnusedSchemas(docSchemas, endpoints, doc, options);
    // Rebuild schemas map with all schemas included
    const allSchemas = buildSchemasMap(
      endpoints.zodSchemaByName,
      deepDependencyGraph,
      circularTypeByName,
    );
    Object.assign(sortedSchemas, allSchemas);
  }

  // Process types for schemas
  const { types, emittedType } = processTypesForSchemas(deepDependencyGraph, doc, options);

  // Process dependent types (placeholder for now)
  // processDependentTypes(deepDependencyGraph, doc, types, emittedType, options);

  // Process endpoint grouping and common schemas
  const { endpointsGroups, commonSchemaNames } = processEndpointGroupingAndCommonSchemas(
    endpoints.endpoints,
    doc,
    options?.groupStrategy ?? 'none',
    deepDependencyGraph,
    sortedSchemas,
    types,
  );

  // Sort endpoints by path for consistent ordering
  // This affects the order in which schemas are processed, so it's important for consistency
  const sortedEndpoints = [...endpoints.endpoints].sort((a, b) => a.path.localeCompare(b.path));

  // Return in the EXACT original property order to match snapshots
  const result: TemplateContext = {
    schemas: sortedSchemas,
    endpoints: sortedEndpoints,
    endpointsGroups,
    types,
    circularTypeByName,
    emittedType,
  };

  // Only include optional properties if they're defined
  if (commonSchemaNames !== undefined) {
    result.commonSchemaNames = commonSchemaNames;
  }

  // Always include options with ONLY the base defaults (match original makeTemplateContext behavior)
  // Do NOT include user-provided options in the returned context
  result.options = { withAlias: false, baseUrl: '' };

  return result;
};

/**
 * Process endpoint grouping and common schemas.
 * Helper function to reduce complexity of getTemplateContext.
 *
 * @param endpoints - Array of endpoint definitions
 * @param doc - The OpenAPI document
 * @param groupStrategy - The grouping strategy to use
 * @param deepDependencyGraph - The deep dependency graph
 * @param sortedSchemas - Map of sorted schemas
 * @param types - Map of all types
 * @returns Object with endpointsGroups and dependenciesByGroupName
 *
 * @internal
 */
const processEndpointGroupingAndCommonSchemas = (
  endpoints: EndpointDefinition[],
  doc: OpenAPIObject,
  groupStrategy: string,
  deepDependencyGraph: Record<string, Set<string>>,
  sortedSchemas: Record<string, string>,
  types: Record<string, string>,
): {
  endpointsGroups: Record<string, MinimalTemplateContext>;
  commonSchemaNames?: Set<string> | undefined;
} => {
  // Create endpointsGroups before calling processEndpointGrouping (it mutates this object)
  const endpointsGroups: Record<string, MinimalTemplateContext> = {};

  // Process endpoint grouping (mutates endpointsGroups)
  const dependenciesByGroupName = processEndpointGrouping(
    endpoints,
    doc,
    groupStrategy as TemplateContextGroupStrategy,
    deepDependencyGraph,
    sortedSchemas,
    types,
    endpointsGroups,
  );

  // Process common schemas for file grouping (sorts schemas by dependencies)
  if (groupStrategy.includes('file')) {
    const commonSchemaNames = processCommonSchemasForGroups(
      endpointsGroups,
      dependenciesByGroupName,
      deepDependencyGraph,
    );
    return { endpointsGroups, commonSchemaNames };
  }

  return { endpointsGroups };
};

// Re-export types and functions for external use
export type { TemplateContextGroupStrategy } from './template-context.endpoints.js';
export { extractSchemaNamesFromDoc } from './template-context.schemas.js';

/**
 * Get Zod client template context.
 * Wrapper function that returns the full template context for code generation.
 *
 * @param doc - The OpenAPI document
 * @param options - Template context options
 * @returns Complete template context for code generation
 */
export const getZodClientTemplateContext = (
  doc: OpenAPIObject,
  options?: TemplateContextOptions,
): TemplateContext => {
  return getTemplateContext(doc, options);
};
