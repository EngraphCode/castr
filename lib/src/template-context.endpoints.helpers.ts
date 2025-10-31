import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

import type { EndpointDefinition } from './endpoint-definition.types.js';
import { logger } from './utils/logger.js';

import { getSchemaNameFromRef } from './template-context.common.js';
import { asComponentSchema, normalizeString } from './utils.js';

export type TemplateContextGroupStrategy = 'none' | 'tag' | 'method' | 'tag-file' | 'method-file';

export interface MinimalTemplateContext {
  schemas: Record<string, string>;
  endpoints: EndpointDefinition[];
  types: Record<string, string>;
  imports?: Record<string, string>;
}

export const makeEndpointTemplateContext = (): MinimalTemplateContext => ({
  schemas: {},
  endpoints: [],
  types: {},
});

/**
 * Convert path with colons to OpenAPI bracket format.
 * Example: '/pet/:petId' -> '/pet/{petId}'
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
 * @internal
 */
export const getPureSchemaNames = (fullSchemaNames: string[]): string[] => {
  return fullSchemaNames.map((name) => {
    const parts = name.split('/');
    const lastPart = parts.at(-1);
    if (!lastPart) {
      throw new Error(`Invalid schema name: ${name}`);
    }
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
  if (!schemaName) {
    return null;
  }
  if (schemaName.startsWith('z.')) {
    return null;
  }
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
    if (normalized) {
      dependencies.push(normalized);
    }
  }

  endpoint.parameters.forEach((param) => {
    const normalized = normalizeSchemaNameForDependency(param.schema);
    if (normalized) {
      dependencies.push(normalized);
    }
  });

  endpoint.errors.forEach((error) => {
    const normalized = normalizeSchemaNameForDependency(error.schema);
    if (normalized) {
      dependencies.push(normalized);
    }
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

  if (!transitiveRefs) {
    return;
  }

  transitiveRefs.forEach((transitiveRef) => {
    const transitiveSchemaName = getSchemaNameFromRef(transitiveRef);
    if (!transitiveSchemaName) {
      return;
    }

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
