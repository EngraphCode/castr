import type { OpenAPIObject } from 'openapi3-ts/oas31';

import { getOpenApiDependencyGraph } from '../shared/dependency-graph.js';
import { topologicalSort } from '../shared/topological-sort.js';
import { isRecord } from '../shared/types.js';
import { asComponentSchema } from '../shared/utils/index.js';
import { sortSchemasByDependencyOrder } from '../shared/utils/schema-sorting.js';

/**
 * Extract schema names from OpenAPI document components.
 * Pure function that gathers data from the spec.
 * Supports both standard components and Scalar's x-ext vendor extension for multi-file specs.
 *
 * @internal
 */
export const extractSchemaNamesFromDoc = (doc: OpenAPIObject): string[] => {
  const schemaNames: string[] = [];

  // Extract from standard components location
  const standardSchemas = doc.components?.schemas ?? {};
  schemaNames.push(...Object.keys(standardSchemas));

  // Extract from x-ext vendor extension (Scalar multi-file bundling)
  schemaNames.push(...extractXExtSchemaNames(doc));

  // Remove duplicates (in case same schema is in both locations)
  return [...new Set(schemaNames)];
};

/**
 * Extract schema names from x-ext vendor extension locations.
 * @internal
 */
function extractXExtSchemaNames(doc: OpenAPIObject): string[] {
  const names: string[] = [];
  const xExt: unknown = doc['x-ext'];

  if (!isRecord(xExt)) {
    return names;
  }

  for (const extContent of Object.values(xExt)) {
    const schemaKeys = getSchemaKeysFromExtContent(extContent);
    names.push(...schemaKeys);
  }

  return names;
}

/**
 * Extract schema keys from a single x-ext location content.
 * @internal
 */
function getSchemaKeysFromExtContent(extContent: unknown): string[] {
  if (!isRecord(extContent)) {
    return [];
  }

  const extComponents = extContent['components'];
  if (!isRecord(extComponents)) {
    return [];
  }

  const schemas = extComponents['schemas'];
  if (!isRecord(schemas)) {
    return [];
  }

  return Object.keys(schemas);
}

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
