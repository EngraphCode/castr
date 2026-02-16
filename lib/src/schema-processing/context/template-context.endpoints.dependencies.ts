/**
 * Dependency tracking helpers for template context endpoints
 * Extracted from template-context.endpoints.helpers.ts to reduce file size
 *
 * @internal
 */

import type { EndpointDefinition } from '../../endpoints/definition.types.js';
import type { CastrSchema } from '../ir/schema.js';
import { getSchemaNameFromRef } from './template-context.common.js';
import { asComponentSchema } from '../../shared/utils/index.js';

import type { MinimalTemplateContext } from './template-context.endpoints.helpers.js';

export type { MinimalTemplateContext };

function toRootSchemaName(schemaName: string): string {
  const DOT_CHAR_CODE = 46;
  let rootName = '';

  for (let i = 0; i < schemaName.length; i++) {
    const ch = schemaName.charCodeAt(i);
    if (ch === DOT_CHAR_CODE) {
      break;
    }

    rootName += schemaName[i] ?? '';
  }

  return rootName || schemaName;
}

/**
 * Normalize dependency name from a structural schema reference.
 *
 * @param schema - Minimal schema shape containing an optional `$ref`
 * @returns Root dependency name when reference exists, otherwise null
 *
 * @internal
 */
export const normalizeSchemaNameForDependency = (
  schema: Pick<CastrSchema, '$ref'>,
): string | null => {
  if (!schema.$ref) {
    return null;
  }

  const schemaName = getSchemaNameFromRef(schema.$ref);
  if (!schemaName) {
    return null;
  }

  return toRootSchemaName(schemaName);
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
    const normalized = normalizeSchemaNameForDependency({ $ref: transitiveRef });
    if (normalized) {
      dependencies.add(normalized);
    }

    const transitiveSchemaName = getSchemaNameFromRef(transitiveRef);

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
