import type { OpenAPIObject } from 'openapi3-ts/oas30';

import type { EndpointDefinition } from './endpoint-definition.types.js';

// Import helpers from the helpers module
import {
  type TemplateContextGroupStrategy,
  type MinimalTemplateContext,
  getOperationForEndpoint,
  determineGroupName,
  ensureGroupExists,
  ensureDependenciesSetExists,
  collectEndpointDependencies,
  addDependenciesToGroup,
  processTransitiveDependenciesForGroup,
} from './template-context.endpoints.helpers.js';

// Import the correct processCommonSchemasForGroups with topological sorting
import { processCommonSchemasForGroups } from './template-context.common.js';

// Re-export types and functions for external use
export type { TemplateContextGroupStrategy, MinimalTemplateContext };
export { processCommonSchemasForGroups };

/**
 * Process file grouping dependencies for a group.
 * Helper function to reduce complexity of processEndpointGrouping.
 *
 * @param dependencies - Set of schema dependencies
 * @param types - Map of all types
 * @param schemas - Map of all schemas
 * @param dependencyGraph - The deep dependency graph
 * @param group - The group template context to update
 *
 * @internal
 */
const processFileGroupingDependencies = (
  dependencies: Set<string>,
  types: Record<string, string>,
  schemas: Record<string, string>,
  dependencyGraph: Record<string, Set<string>>,
  group: MinimalTemplateContext,
): void => {
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
};

/**
 * Process endpoint grouping based on strategy.
 * Main orchestration function that groups endpoints and processes dependencies.
 *
 * @param endpoints - Array of endpoint definitions
 * @param openApiDoc - The OpenAPI document
 * @param groupStrategy - The grouping strategy to use
 * @param dependencyGraph - The deep dependency graph
 * @param schemas - Map of all schemas
 * @param types - Map of all types
 * @param endpointsGroups - Map of group names to template contexts
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
    if (!endpoint.response) {
      return;
    }

    if (groupStrategy !== 'none') {
      const operation = getOperationForEndpoint(openApiDoc, endpoint);
      if (!operation) {
        return;
      }

      const groupName = determineGroupName(groupStrategy, operation, endpoint);
      const group = ensureGroupExists(groupName, endpointsGroups);
      group.endpoints.push(endpoint);

      const dependencies = ensureDependenciesSetExists(groupName, dependenciesByGroupName);
      const endpointDeps = collectEndpointDependencies(endpoint);
      endpointDeps.forEach((dep) => dependencies.add(dep));

      addDependenciesToGroup(dependencies, schemas, group);

      if (groupStrategy.includes('file')) {
        processFileGroupingDependencies(dependencies, types, schemas, dependencyGraph, group);
      }
    }
  });

  return dependenciesByGroupName;
};

/**
 * Validate and narrow groupStrategy type
 * @internal
 */
function isValidGroupStrategy(strategy: string): strategy is TemplateContextGroupStrategy {
  const validStrategies: TemplateContextGroupStrategy[] = [
    'none',
    'tag',
    'method',
    'tag-file',
    'method-file',
  ];
  const strategies: readonly string[] = validStrategies;
  return strategies.includes(strategy);
}

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
 * @returns Object with endpointsGroups and commonSchemaNames
 *
 * @internal
 */
export function processEndpointGroupingAndCommonSchemas(
  endpoints: EndpointDefinition[],
  doc: OpenAPIObject,
  groupStrategy: string,
  deepDependencyGraph: Record<string, Set<string>>,
  sortedSchemas: Record<string, string>,
  types: Record<string, string>,
): {
  endpointsGroups: Record<string, MinimalTemplateContext>;
  commonSchemaNames?: Set<string> | undefined;
} {
  // Create endpointsGroups before calling processEndpointGrouping (it mutates this object)
  const endpointsGroups: Record<string, MinimalTemplateContext> = {};

  if (!isValidGroupStrategy(groupStrategy)) {
    throw new Error(`Invalid group strategy: ${groupStrategy}`);
  }

  // Process endpoint grouping (mutates endpointsGroups)
  const dependenciesByGroupName = processEndpointGrouping(
    endpoints,
    doc,
    groupStrategy,
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
}

// Note: processCommonSchemasForGroups is imported from template-context.common.ts
// and re-exported below for backward compatibility
