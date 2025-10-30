import type { OpenAPIObject } from 'openapi3-ts/oas30';

import { getOpenApiDependencyGraph } from './getOpenApiDependencyGraph.js';
import { topologicalSort } from './topologicalSort.js';
import { asComponentSchema, normalizeString } from './utils.js';
import { sortSchemasByDependencyOrder } from './utils/schema-sorting.js';

/**
 * Extract schema names from OpenAPI document components.
 * Pure function that gathers data from the spec.
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
 * Sort schemas by their dependency order.
 * Transformation function that orders schemas for template generation.
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
