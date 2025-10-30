import type {
  OpenAPIObject,
  OperationObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';
import { sortBy } from 'lodash-es';
import * as ts from 'typescript';

import { getOpenApiDependencyGraph } from './getOpenApiDependencyGraph.js';
import {
  sortSchemasByDependencyOrder,
  sortSchemaNamesByDependencyOrder,
} from './utils/schema-sorting.js';
import { logger } from './utils/logger.js';
import type { EndpointDefinition } from './endpoint-definition.types.js';
import { getEndpointDefinitionList } from './getEndpointDefinitionList.js';
import type { TsConversionContext } from './openApiToTypescript.js';
import { getTypescriptFromOpenApi } from './openApiToTypescript.js';
import { getZodSchema } from './openApiToZod.js';
import { topologicalSort } from './topologicalSort.js';
import { asComponentSchema, normalizeString } from './utils.js';
import type { CodeMetaData } from './CodeMeta.js';
import { getSchemaFromComponents } from './component-access.js';

const file = ts.createSourceFile('', '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

/**
 * Type guard to check if result is a ts.Node
 */
const isTsNode = (result: unknown): result is ts.Node => {
  return (
    typeof result === 'object' &&
    result !== null &&
    'kind' in result &&
    typeof result.kind === 'number'
  );
};

/**
 * Convert result from getTypescriptFromOpenApi to string
 * Handles union type: ts.Node | t.TypeDefinitionObject | string
 */
const tsResultToString = (result: ReturnType<typeof getTypescriptFromOpenApi>): string => {
  if (typeof result === 'string') {
    return result;
  }
  // ts.Node can be printed
  if (isTsNode(result)) {
    return printTs(result);
  }
  // t.TypeDefinitionObject - stringify it
  return JSON.stringify(result);
};

/**
 * Extract schema name from a component schema $ref
 * @param ref - Full ref like '#/components/schemas/User'
 * @returns Schema name like 'User'
 */
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid schema $ref: ${ref}`);
  }
  return name;
};

/**
 * Extract schema names from OpenAPI document components.
 * Pure function that gathers data from the spec.
 *
 * @param doc - The OpenAPI document
 * @returns Array of schema names found in components.schemas
 *
 * @internal
 */
export const extractSchemaNamesFromDoc = (doc: OpenAPIObject): string[] => {
  const schemas = doc.components?.schemas ?? {};
  return Object.keys(schemas);
};

/**
 * Build dependency graph for component schemas.
 * Wraps getOpenApiDependencyGraph with schema name conversion.
 *
 * @param schemaNames - Array of schema names from components
 * @param doc - The OpenAPI document
 * @returns Dependency graph with refsDependencyGraph and deepDependencyGraph
 *
 * @internal
 */
export const buildDependencyGraphForSchemas = (
  schemaNames: string[],
  doc: OpenAPIObject,
): {
  refsDependencyGraph: Record<string, Set<string>>;
  deepDependencyGraph: Record<string, Set<string>>;
} => {
  const schemaRefs = schemaNames.map((name) => asComponentSchema(name));
  return getOpenApiDependencyGraph(schemaRefs, doc);
};

/**
 * Check if a schema has a circular reference.
 * Pure validation function.
 *
 * @param ref - Schema reference like '#/components/schemas/User'
 * @param dependencyGraph - The deep dependency graph
 * @returns true if schema references itself
 *
 * @internal
 */
export const checkIfSchemaIsCircular = (
  ref: string,
  dependencyGraph: Record<string, Set<string>>,
): boolean => {
  return Boolean(ref && dependencyGraph[ref]?.has(ref));
};

/**
 * Wrap schema code with z.lazy() if it has circular references.
 * Transformation function for template generation.
 *
 * @param schemaName - Name of the schema
 * @param schemaCode - Generated Zod schema code string
 * @param dependencyGraph - The deep dependency graph
 * @param circularTypes - Record to update with circular type markers
 * @returns Wrapped or unwrapped schema code
 *
 * @internal
 */
export const wrapSchemaWithLazyIfNeeded = (
  schemaName: string,
  schemaCode: string,
  dependencyGraph: Record<string, Set<string>>,
  circularTypes: Record<string, true>,
): string => {
  const ref = asComponentSchema(schemaName);
  const isCircular = checkIfSchemaIsCircular(ref, dependencyGraph);

  if (isCircular) {
    circularTypes[schemaName] = true;
    return `z.lazy(() => ${schemaCode})`;
  }

  return schemaCode;
};

/**
 * Build schemas map from Zod schema names, wrapping with lazy if needed.
 * Transformation function that builds the final schemas object for templates.
 *
 * @param zodSchemasByName - Map of schema names to Zod schema code strings
 * @param dependencyGraph - The deep dependency graph
 * @param circularTypes - Record to update with circular type markers
 * @returns Map of normalized schema names to wrapped/unwrapped schema code
 *
 * @internal
 */
export const buildSchemasMap = (
  zodSchemasByName: Record<string, string>,
  dependencyGraph: Record<string, Set<string>>,
  circularTypes: Record<string, true>,
): Record<string, string> => {
  const schemas: Record<string, string> = {};

  for (const name in zodSchemasByName) {
    const code = zodSchemasByName[name];
    if (!code) {
      throw new Error(`Zod schema not found for name: ${name}`);
    }

    const normalizedName = normalizeString(name);
    schemas[normalizedName] = wrapSchemaWithLazyIfNeeded(
      name,
      code,
      dependencyGraph,
      circularTypes,
    );
  }

  return schemas;
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
 * Determine if a type should be generated for a schema.
 * Pure validation function.
 *
 * @param ref - Schema reference
 * @param dependencyGraph - The deep dependency graph
 * @param options - Template context options
 * @returns true if type should be generated
 *
 * @internal
 */
export const shouldGenerateTypeForSchema = (
  ref: string,
  dependencyGraph: Record<string, Set<string>>,
  options?: TemplateContext['options'],
): boolean => {
  const isCircular = checkIfSchemaIsCircular(ref, dependencyGraph);
  return Boolean(options?.shouldExportAllTypes || isCircular);
};

/**
 * Generate TypeScript type string for a schema.
 * Transformation function for template generation.
 *
 * @param schemaName - Name of the schema
 * @param schema - The OpenAPI schema object
 * @param ctx - TypeScript conversion context
 * @param options - Template context options
 * @returns TypeScript type string without 'export' keyword
 *
 * @internal
 */
export const generateTypeForSchema = (
  schemaName: string,
  schema: SchemaObject | ReferenceObject,
  ctx: TsConversionContext,
  options?: TemplateContext['options'],
): string => {
  const tsResult = getTypescriptFromOpenApi({
    schema,
    ctx,
    meta: { name: schemaName },
    options,
  });
  return tsResultToString(tsResult).replace('export ', '');
};

/**
 * Determine if a type should be emitted (marked in emittedType).
 * Pure validation function.
 *
 * @param schema - The OpenAPI schema object
 * @param options - Template context options
 * @returns true if type should be emitted
 *
 * @internal
 */
export const shouldEmitTypeForSchema = (
  schema: SchemaObject | ReferenceObject,
  options?: TemplateContext['options'],
): boolean => {
  return (
    Boolean(options?.shouldExportAllTypes) && !isReferenceObject(schema) && schema.type === 'object'
  );
};

/**
 * Sort schemas by their dependency order.
 * Transformation function that orders schemas for template generation.
 *
 * @param schemas - Map of schema names to schema code strings
 * @param dependencyGraph - The deep dependency graph
 * @returns Sorted schemas map
 *
 * @internal
 */
export const sortSchemasByDependencies = (
  schemas: Record<string, string>,
  dependencyGraph: Record<string, Set<string>>,
): Record<string, string> => {
  const schemaOrderedByDependencies = topologicalSort(dependencyGraph);
  return sortSchemasByDependencyOrder(schemas, schemaOrderedByDependencies);
};

/**
 * Convert path with colons to OpenAPI bracket format.
 * Example: '/pet/:petId' -> '/pet/{petId}'
 *
 * @param path - Path with colon parameters
 * @returns Path with bracket parameters
 *
 * @internal
 */
export const getOriginalPathWithBrackets = (path: string): string => {
  const originalPathParam = /:(\w+)/g;
  return path.replaceAll(originalPathParam, '{$1}');
};

/**
 * Extract pure schema names from full ref paths.
 * Example: '#/components/schemas/Category' -> 'Category'
 *
 * @param fullSchemaNames - Array of full schema ref paths
 * @returns Array of schema names only
 *
 * @internal
 */
export const getPureSchemaNames = (fullSchemaNames: string[]): string[] => {
  return fullSchemaNames.map((name) => {
    const parts = name.split('/');
    const lastPart = parts.at(-1);
    if (!lastPart) throw new Error(`Invalid schema name: ${name}`);
    return lastPart;
  });
};

/**
 * Determine group name based on grouping strategy.
 * Data gathering function that extracts group name from operation/endpoint.
 *
 * @param groupStrategy - The grouping strategy to use
 * @param operation - The OpenAPI operation object
 * @param endpoint - The endpoint definition
 * @returns Group name (normalized)
 *
 * @internal
 */
export const determineGroupName = (
  groupStrategy: TemplateContextGroupStrategy,
  operation: OperationObject,
  endpoint: EndpointDefinition,
): string => {
  if (groupStrategy === 'tag' || groupStrategy === 'tag-file') {
    return normalizeString(operation.tags?.[0] ?? 'Default');
  }
  if (groupStrategy === 'method' || groupStrategy === 'method-file') {
    return normalizeString(endpoint.method);
  }
  return normalizeString('Default');
};

/**
 * Normalize schema name for dependency tracking.
 * Extracts base schema name from potentially chained schema names.
 *
 * @param schemaName - Schema name (may include chains like "User.address")
 * @returns Normalized schema name or null if invalid
 *
 * @internal
 */
export const normalizeSchemaNameForDependency = (schemaName: string): string | null => {
  if (!schemaName) return null;
  if (schemaName.startsWith('z.')) return null;
  // Sometimes the schema includes a chain that should be removed from the dependency
  const [normalizedSchemaName] = schemaName.split('.');
  return normalizedSchemaName || null;
};

/**
 * Collect schema dependencies from an endpoint.
 * Data gathering function that extracts dependency names.
 *
 * @param endpoint - The endpoint definition
 * @returns Array of schema names used by the endpoint
 *
 * @internal
 */
export const collectEndpointDependencies = (endpoint: EndpointDefinition): string[] => {
  const dependencies: string[] = [];

  if (endpoint.response) {
    const normalized = normalizeSchemaNameForDependency(endpoint.response);
    if (normalized) dependencies.push(normalized);
  }

  endpoint.parameters.forEach((param) => {
    const normalized = normalizeSchemaNameForDependency(param.schema);
    if (normalized) dependencies.push(normalized);
  });

  endpoint.errors.forEach((error) => {
    const normalized = normalizeSchemaNameForDependency(error.schema);
    if (normalized) dependencies.push(normalized);
  });

  return dependencies;
};

/**
 * Get operation object from OpenAPI document for an endpoint.
 * Data gathering function that extracts operation from paths.
 *
 * @param openApiDoc - The OpenAPI document
 * @param endpoint - The endpoint definition
 * @returns Operation object or null if not found
 *
 * @internal
 */
export const getOperationForEndpoint = (
  openApiDoc: OpenAPIObject,
  endpoint: EndpointDefinition,
): OperationObject | null => {
  const operationPath = getOriginalPathWithBrackets(endpoint.path);
  const pathItem = openApiDoc.paths[endpoint.path] ?? openApiDoc.paths[operationPath];

  if (!pathItem || isReferenceObject(pathItem)) {
    logger.warn('Missing path', endpoint.path);
    return null;
  }

  const operation = pathItem[endpoint.method];
  if (!operation) {
    logger.warn(`Missing operation ${endpoint.method} for path ${endpoint.path}`);
    return null;
  }

  return operation;
};

/**
 * Ensure a group exists in endpointsGroups, creating it if needed.
 * Assembly function that manages group structure.
 *
 * @param groupName - Name of the group
 * @param endpointsGroups - Map of group names to template contexts
 * @returns The group template context
 *
 * @internal
 */
export const ensureGroupExists = (
  groupName: string,
  endpointsGroups: Record<string, MinimalTemplateContext>,
): MinimalTemplateContext => {
  if (!endpointsGroups[groupName]) {
    endpointsGroups[groupName] = makeEndpointTemplateContext();
  }
  const group = endpointsGroups[groupName];
  if (!group) {
    throw new Error(`Failed to create group: ${groupName}`);
  }
  return group;
};

/**
 * Ensure a dependencies set exists for a group, creating it if needed.
 * Assembly function that manages dependencies tracking.
 *
 * @param groupName - Name of the group
 * @param dependenciesByGroupName - Map of group names to dependency sets
 * @returns The dependencies set for the group
 *
 * @internal
 */
export const ensureDependenciesSetExists = (
  groupName: string,
  dependenciesByGroupName: Map<string, Set<string>>,
): Set<string> => {
  if (!dependenciesByGroupName.has(groupName)) {
    dependenciesByGroupName.set(groupName, new Set());
  }
  const dependencies = dependenciesByGroupName.get(groupName);
  if (!dependencies) {
    throw new Error(`Dependencies not found for group: ${groupName}`);
  }
  return dependencies;
};

/**
 * Add dependencies to a group's schemas.
 * Transformation function that adds schemas to group context.
 *
 * @param dependencies - Set of schema names
 * @param schemas - Map of all schemas
 * @param group - The group template context to update
 *
 * @internal
 */
export const addDependenciesToGroup = (
  dependencies: Set<string>,
  schemas: Record<string, string>,
  group: MinimalTemplateContext,
): void => {
  dependencies.forEach((schemaName) => {
    const schema = schemas[schemaName];
    if (schema) {
      group.schemas[schemaName] = schema;
    }
  });
};

/**
 * Process transitive dependencies for a schema and add them to group.
 * Transformation function that processes deep dependencies.
 *
 * @param schemaName - Name of the schema
 * @param dependencyGraph - The deep dependency graph
 * @param types - Map of all types
 * @param schemas - Map of all schemas
 * @param dependencies - Set to add transitive dependencies to
 * @param group - The group template context to update
 *
 * @internal
 */
export const processTransitiveDependenciesForGroup = (
  schemaName: string,
  dependencyGraph: Record<string, Set<string>>,
  types: Record<string, string>,
  schemas: Record<string, string>,
  dependencies: Set<string>,
  group: MinimalTemplateContext,
): void => {
  const resolvedRef = asComponentSchema(schemaName);
  const transitiveRefs = dependencyGraph[resolvedRef];

  if (!transitiveRefs) return;

  transitiveRefs.forEach((transitiveRef) => {
    const transitiveSchemaName = getSchemaNameFromRef(transitiveRef);
    if (!transitiveSchemaName) return;

    const normalized = normalizeSchemaNameForDependency(transitiveSchemaName);
    if (normalized) {
      dependencies.add(normalized);
    }

    const transitiveType = types[transitiveSchemaName];
    if (transitiveType) {
      group.types[transitiveSchemaName] = transitiveType;
    }

    const transitiveSchema = schemas[transitiveSchemaName];
    if (transitiveSchema) {
      group.schemas[transitiveSchemaName] = transitiveSchema;
    }
  });
};

/**
 * Calculate dependency counts across all groups.
 * Data gathering function that counts how many groups use each schema.
 *
 * @param dependenciesByGroupName - Map of group names to dependency sets
 * @returns Map of schema names to count of groups using them
 *
 * @internal
 */
export const calculateDependencyCounts = (
  dependenciesByGroupName: Map<string, Set<string>>,
): Map<string, number> => {
  const dependenciesCount = new Map<string, number>();
  dependenciesByGroupName.forEach((deps) => {
    deps.forEach((dep) => {
      dependenciesCount.set(dep, (dependenciesCount.get(dep) ?? -1) + 1);
    });
  });
  return dependenciesCount;
};

/**
 * Separate common schemas from group-specific schemas.
 * Transformation function that categorizes schemas for file grouping.
 *
 * @param groupSchemas - Map of schema names to schema code strings
 * @param dependencyCounts - Map of schema names to usage counts
 * @param groupTypes - Map of schema names to type strings
 * @returns Separated schemas and types with common schemas identified
 *
 * @internal
 */
export const separateCommonAndGroupSchemas = (
  groupSchemas: Record<string, string>,
  dependencyCounts: Map<string, number>,
  groupTypes: Record<string, string>,
): {
  groupSchemas: Record<string, string>;
  groupTypes: Record<string, string>;
  commonSchemaNames: Set<string>;
} => {
  const separatedSchemas: Record<string, string> = {};
  const separatedTypes: Record<string, string> = {};
  const commonSchemaNames = new Set<string>();

  Object.entries(groupSchemas).forEach(([name, schema]) => {
    const count = dependencyCounts.get(name) ?? 0;
    if (count >= 1) {
      commonSchemaNames.add(name);
    } else {
      separatedSchemas[name] = schema;
      const groupType = groupTypes[name];
      if (groupType) {
        separatedTypes[name] = groupType;
      }
    }
  });

  return {
    groupSchemas: separatedSchemas,
    groupTypes: separatedTypes,
    commonSchemaNames,
  };
};

/**
 * Process types for all schemas in dependency graph.
 * Transformation function that generates TypeScript types.
 *
 * @param dependencyGraph - The deep dependency graph
 * @param doc - The OpenAPI document
 * @param options - Template context options
 * @returns Map of schema names to type strings and emitted types
 *
 * @internal
 */
export const processTypesForSchemas = (
  dependencyGraph: Record<string, Set<string>>,
  doc: OpenAPIObject,
  options?: TemplateContext['options'],
): {
  types: Record<string, string>;
  emittedType: Record<string, true>;
} => {
  const types: Record<string, string> = {};
  const emittedType: Record<string, true> = {};
  const ctx: TsConversionContext = { nodeByRef: {}, doc, visitedRefs: {} };

  for (const ref in dependencyGraph) {
    const shouldGenerateType = shouldGenerateTypeForSchema(ref, dependencyGraph, options);
    const schemaName = shouldGenerateType ? getSchemaNameFromRef(ref) : undefined;

    if (shouldGenerateType && schemaName && !types[schemaName]) {
      const schema = getSchemaFromComponents(doc, schemaName);
      types[schemaName] = generateTypeForSchema(schemaName, schema, ctx, options);
      emittedType[schemaName] = true;

      processDependentTypes(ref, dependencyGraph, doc, ctx, types, emittedType, options);
    }
  }

  return { types, emittedType };
};

/**
 * Process dependent types for a schema.
 * Transformation function that generates types for dependencies.
 *
 * @param ref - Schema reference
 * @param dependencyGraph - The deep dependency graph
 * @param doc - The OpenAPI document
 * @param ctx - TypeScript conversion context
 * @param types - Map of types (mutated)
 * @param emittedType - Map of emitted types (mutated)
 * @param options - Template context options
 *
 * @internal
 */
export const processDependentTypes = (
  ref: string,
  dependencyGraph: Record<string, Set<string>>,
  doc: OpenAPIObject,
  ctx: TsConversionContext,
  types: Record<string, string>,
  emittedType: Record<string, true>,
  options?: TemplateContext['options'],
): void => {
  const depRefs = dependencyGraph[ref];
  if (!depRefs) return;

  for (const depRef of depRefs) {
    const depSchemaName = getSchemaNameFromRef(depRef);
    if (!depSchemaName) continue;

    const isDepCircular = checkIfSchemaIsCircular(depRef, dependencyGraph);
    if (isDepCircular || types[depSchemaName]) continue;

    const depSchema = getSchemaFromComponents(doc, depSchemaName);
    types[depSchemaName] = generateTypeForSchema(depSchemaName, depSchema, ctx, options);

    if (shouldEmitTypeForSchema(depSchema, options)) {
      emittedType[depSchemaName] = true;
    }
  }
};

/**
 * Process endpoint grouping and dependencies.
 * Transformation function that builds endpoint groups.
 *
 * @param endpoints - Array of endpoint definitions
 * @param openApiDoc - The OpenAPI document
 * @param groupStrategy - The grouping strategy
 * @param dependencyGraph - The deep dependency graph
 * @param schemas - Map of all schemas
 * @param types - Map of all types
 * @param endpointsGroups - Map of group names to template contexts (mutated)
 * @returns Map of group names to dependency sets
 *
 * @internal
 */
export const processEndpointGrouping = (
  endpoints: EndpointDefinition[],
  openApiDoc: OpenAPIObject,
  groupStrategy: TemplateContextGroupStrategy,
  dependencyGraph: Record<string, Set<string>>,
  schemas: Record<string, string>,
  types: Record<string, string>,
  endpointsGroups: Record<string, MinimalTemplateContext>,
): Map<string, Set<string>> => {
  const dependenciesByGroupName = new Map<string, Set<string>>();

  endpoints.forEach((endpoint) => {
    if (!endpoint.response) return;

    if (groupStrategy !== 'none') {
      const operation = getOperationForEndpoint(openApiDoc, endpoint);
      if (!operation) return;

      const groupName = determineGroupName(groupStrategy, operation, endpoint);
      const group = ensureGroupExists(groupName, endpointsGroups);
      group.endpoints.push(endpoint);

      const dependencies = ensureDependenciesSetExists(groupName, dependenciesByGroupName);
      const endpointDeps = collectEndpointDependencies(endpoint);
      endpointDeps.forEach((dep) => dependencies.add(dep));

      addDependenciesToGroup(dependencies, schemas, group);

      // Process transitive dependencies for file grouping
      if (groupStrategy.includes('file')) {
        [...dependencies].forEach((schemaName) => {
          const schemaType = types[schemaName];
          if (schemaType) {
            group.types[schemaName] = schemaType;
          }

          const schema = schemas[schemaName];
          if (schema) {
            group.schemas[schemaName] = schema;
          }

          processTransitiveDependenciesForGroup(
            schemaName,
            dependencyGraph,
            types,
            schemas,
            dependencies,
            group,
          );
        });
      }
    }
  });

  return dependenciesByGroupName;
};

/**
 * Process common schemas for file grouping strategy.
 * Transformation function that identifies and separates common schemas.
 *
 * @param endpointsGroups - Map of group names to template contexts
 * @param dependenciesByGroupName - Map of group names to dependency sets
 * @param dependencyGraph - The deep dependency graph
 * @returns Set of common schema names
 *
 * @internal
 */
export const processCommonSchemasForGroups = (
  endpointsGroups: Record<string, MinimalTemplateContext>,
  dependenciesByGroupName: Map<string, Set<string>>,
  dependencyGraph: Record<string, Set<string>>,
): Set<string> => {
  const schemaOrderedByDependencies = topologicalSort(dependencyGraph);
  const dependenciesCount = calculateDependencyCounts(dependenciesByGroupName);
  const allCommonSchemaNames = new Set<string>();

  Object.keys(endpointsGroups).forEach((groupName) => {
    const group = endpointsGroups[groupName];
    if (!group) return;
    group.imports = {};

    const separated = separateCommonAndGroupSchemas(group.schemas, dependenciesCount, group.types);

    separated.commonSchemaNames.forEach((name) => {
      if (group.imports) {
        group.imports[name] = 'common';
      }
      allCommonSchemaNames.add(name);
    });

    group.schemas = sortSchemasByDependencyOrder(
      separated.groupSchemas,
      getPureSchemaNames(schemaOrderedByDependencies),
    );
    group.types = separated.groupTypes;
  });

  return new Set(
    sortSchemaNamesByDependencyOrder(
      [...allCommonSchemaNames],
      getPureSchemaNames(schemaOrderedByDependencies),
    ),
  );
};

export const getZodClientTemplateContext = (
  openApiDoc: OpenAPIObject,
  options?: TemplateContext['options'],
): TemplateContext => {
  const result = getEndpointDefinitionList(openApiDoc, options);
  const data = makeTemplateContext();

  const docSchemas = openApiDoc.components?.schemas ?? {};
  const schemaNames = extractSchemaNamesFromDoc(openApiDoc);
  const depsGraphs = buildDependencyGraphForSchemas(schemaNames, openApiDoc);

  if (options?.shouldExportAllSchemas) {
    exportUnusedSchemas(docSchemas, result, openApiDoc, options);
  }

  data.schemas = buildSchemasMap(
    result.zodSchemaByName,
    depsGraphs.deepDependencyGraph,
    data.circularTypeByName,
  );

  // Process types for schemas in dependency graph
  const typesResult = processTypesForSchemas(depsGraphs.deepDependencyGraph, openApiDoc, options);
  data.types = typesResult.types;
  data.emittedType = typesResult.emittedType;

  // NOTE: Topological sort ensures schemas are ordered by their dependencies
  data.schemas = sortSchemasByDependencies(data.schemas, depsGraphs.deepDependencyGraph);

  const groupStrategy = options?.groupStrategy ?? 'none';

  // Process endpoint grouping
  const dependenciesByGroupName = processEndpointGrouping(
    result.endpoints,
    openApiDoc,
    groupStrategy,
    depsGraphs.deepDependencyGraph,
    data.schemas,
    data.types,
    data.endpointsGroups,
  );

  // Add all endpoints to main list
  result.endpoints.forEach((endpoint) => {
    if (endpoint.response) {
      data.endpoints.push(endpoint);
    }
  });

  data.endpoints = sortBy(data.endpoints, 'path');

  // Process common schemas for file grouping
  if (groupStrategy.includes('file')) {
    data.commonSchemaNames = processCommonSchemasForGroups(
      data.endpointsGroups,
      dependenciesByGroupName,
      depsGraphs.deepDependencyGraph,
    );
  }

  return data;
};

const makeEndpointTemplateContext = (): MinimalTemplateContext => ({
  schemas: {},
  endpoints: [],
  types: {},
});

type MinimalTemplateContext = Pick<TemplateContext, 'endpoints' | 'schemas' | 'types'> & {
  imports?: Record<string, string>;
};

const makeTemplateContext = (): TemplateContext => {
  return {
    ...makeEndpointTemplateContext(),
    circularTypeByName: {},
    endpointsGroups: {},
    emittedType: {},
    options: { withAlias: false, baseUrl: '' },
  };
};

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

export type TemplateContextGroupStrategy = 'none' | 'tag' | 'method' | 'tag-file' | 'method-file';

export type TemplateContextOptions = {
  /**
   * Template to use for code generation
   * - "schemas-with-metadata": Schemas + endpoint metadata (default)
   * - "schemas-only": Pure Zod schemas
   * @default "schemas-with-metadata"
   */
  template?: 'schemas-only' | 'schemas-with-metadata';
  /** Base URL for API requests (if generating client) */
  baseUrl?: string;
  /**
   * When true, will either use the `operationId` as `alias`, or auto-generate it from the method and path.
   *
   * You can alternatively provide a custom function to generate the alias with the following signature:
   * `(path: string, method: string, operation: OperationObject) => string`
   * `OperationObject` is the OpenAPI operation object as defined in `openapi3-ts` npm package.
   * @see https://github.com/metadevpro/openapi3-ts/blob/master/src/model/OpenApi.ts#L110
   *
   * Generate operation IDs as endpoint aliases for easier reference
   * @default true
   */
  withAlias?: boolean | ((path: string, method: string, operation: OperationObject) => string);
  /**
   * when using the default `template.hbs`, allow customizing the `export const {apiClientName}`
   *
   * @default "api"
   */
  apiClientName?: string;
  /**
   * When defined, will be used to pick which endpoint to use as the main one and set to `EndpointDefinition["response"]`
   * Will use `default` status code as fallback
   *
   * works like `validateStatus` from axios
   * @see https://github.com/axios/axios#handling-errors
   *
   * @default `(status >= 200 && status < 300)`
   */
  isMainResponseStatus?: string | ((status: number) => boolean);
  /**
   * When defined, will be used to pick which endpoints should be included in the `EndpointDefinition["errors"]` array
   * Ignores `default` status
   *
   * works like `validateStatus` from axios
   * @see https://github.com/axios/axios#handling-errors
   *
   * @default `!(status >= 200 && status < 300)`
   */
  isErrorStatus?: string | ((status: number) => boolean);
  /**
   * when defined, will be used to pick the first MediaType found in ResponseObject["content"] map matching the given expression
   *
   * context: some APIs returns multiple media types for the same response, this option allows you to pick which one to use
   * or allows you to define a custom media type to use like `application/json-ld` or `application/vnd.api+json`) etc...
   * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#response-object
   * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#media-types
   *
   * @default `mediaType === "application/json"`
   */
  isMediaTypeAllowed?: string | ((mediaType: string) => boolean);
  /** If OperationObject["description"] is not defined but the main ResponseObject["description"] is defined, use the latter as EndpointDefinition["description"] */
  useMainResponseDescriptionAsEndpointDefinitionFallback?: boolean;
  /**
   * when true, will export all `#/components/schemas` even when not used in any PathItemObject
   * @see https://github.com/astahmer/openapi-zod-client/issues/19
   */
  shouldExportAllSchemas?: boolean;
  /**
   * When true, will generate and output types for all schemas, not just circular ones.
   * This helps with "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed.ts(7056)" errors.
   */
  shouldExportAllTypes?: boolean;
  /**
   * when true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set
   * @see https://github.com/astahmer/openapi-zod-client/issues/23
   */
  withImplicitRequiredProps?: boolean;
  /**
   * when true, will add the default values from the openapi schemas to the generated zod schemas
   *
   * @default true
   */
  withDefaultValues?: boolean;
  /**
   * when true, will keep deprecated endpoints in the api output
   * @default false
   */
  withDeprecatedEndpoints?: boolean;
  /**
   * when true, will add jsdoc comments to generated types
   * @default false
   */
  withDocs?: boolean;
  /**
   * groups endpoints by a given strategy
   *
   * when strategy is "tag" and multiple tags are defined for an endpoint, the first one will be used
   *
   * @default "none"
   */
  groupStrategy?: TemplateContextGroupStrategy | undefined;
  /**
   * schema complexity threshold to determine which one (using less than `<` operator) should be assigned to a variable
   * tl;dr higher means more schemas will be inlined (rather than assigned to a variable)
   * ^ if you want to always inline schemas, set it to `-1` (special value) or a high value such as `1000`
   * v if you want to assign all schemas to a variable, set it to `0`
   *
   * @default 4
   */
  complexityThreshold?: number | undefined;
  /**
   * when defined as "auto-correct", will automatically use `default` as fallback for `response` when no status code was declared
   *
   * - if no main response has been found, this should be considered it as a fallback
   * - else this will be added as an error response
   *
   * @see https://github.com/astahmer/openapi-zod-client/pull/30#issuecomment-1280434068
   *
   * @default "spec-compliant"
   */
  defaultStatusBehavior?: 'spec-compliant' | 'auto-correct' | undefined;
  willSuppressWarnings?: boolean | undefined;
  /**
   * when true, will add z.describe(xxx)
   * @see https://github.com/astahmer/openapi-zod-client/pull/143
   */
  withDescription?: boolean | undefined;
  /**
   * A function to refine the default endpoint definition. Mostly useful for adding fields from OperationObject
   * that aren't defined yet in the default definition.
   */
  endpointDefinitionRefiner?: (
    defaultDefinition: EndpointDefinition,
    operation: OperationObject,
  ) => EndpointDefinition | undefined;

  /**
   * When true, all generated objects and arrays will be readonly.
   */
  allReadonly?: boolean | undefined;

  /**
   * When true, all generated zod objects will be strict - meaning no unknown keys will be allowed
   */
  strictObjects?: boolean | undefined;

  /**
   * Set default value when additionalProperties is not provided. Default to true.
   */
  additionalPropertiesDefaultValue?: boolean | SchemaObject | undefined;

  /**
   * When true, returns a "responses" array with all responses (both success and errors)
   */
  withAllResponses?: boolean | undefined;

  /**
   * When true, prevents using the exact same name for the same type
   * For example, if 2 schemas have the same type, but different names, export each as separate schemas
   * If 2 schemas have the same name but different types, export subsequent names with numbers appended
   */
  exportAllNamedSchemas?: boolean | undefined;

  /**
   * A function that runs in the schema conversion process to refine the schema before it's converted to a Zod schema.
   */
  schemaRefiner?: <T extends SchemaObject | ReferenceObject>(
    schema: T,
    parentMeta?: CodeMetaData,
  ) => T | undefined;
};
