/**
 * Dependency tracking helpers for template context endpoints
 * Extracted from template-context.endpoints.helpers.ts to reduce file size
 *
 * @internal
 */

import type { EndpointDefinition } from '../endpoints/definition.types.js';
import type { CastrSchema } from './ir-schema.js';
import { getSchemaNameFromRef } from './template-context.common.js';
import { asComponentSchema } from '../shared/utils/index.js';

import type { MinimalTemplateContext } from './template-context.endpoints.helpers.js';

export type { MinimalTemplateContext };

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

  const addDependenciesFromSchema = (schema: CastrSchema): void => {
    if (!schema.metadata?.dependencyGraph?.references) {
      return;
    }

    schema.metadata.dependencyGraph.references.forEach((ref) => {
      try {
        const name = getSchemaNameFromRef(ref);
        if (name) {
          dependencies.push(name);
        }
      } catch {
        // Ignore invalid refs
      }
    });
  };

  if (endpoint.response) {
    addDependenciesFromSchema(endpoint.response);
  }

  endpoint.parameters.forEach((param) => {
    addDependenciesFromSchema(param.schema);
  });

  endpoint.errors.forEach((error) => {
    addDependenciesFromSchema(error.schema);
  });

  return dependencies;
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
