import type {
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
  OperationObject,
} from 'openapi3-ts/oas30';

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
import type { CodeMetaData } from '../shared/code-meta.js';

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
}

export interface TemplateContextOptions {
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
): TemplateContext {
  const result: TemplateContext = {
    schemas: sortedSchemas,
    endpoints: sortedEndpoints,
    endpointsGroups,
    types,
    circularTypeByName,
    emittedType,
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

  return buildTemplateContextResult(
    sortedSchemas,
    sortedEndpoints,
    endpointsGroups,
    types,
    circularTypeByName,
    emittedType,
    commonSchemaNames,
  );
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
