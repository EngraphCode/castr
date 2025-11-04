import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';

import { getOpenApiDependencyGraph } from '../shared/dependency-graph.js';
import { getZodSchema } from '../conversion/zod/index.js';
import { topologicalSort } from '../shared/topological-sort.js';
import { asComponentSchema, normalizeString } from '../shared/utils/index.js';
import { sortSchemasByDependencyOrder } from '../shared/utils/schema-sorting.js';
import type { TemplateContext } from './template-context.js';

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
export function exportUnusedSchemas(
  docSchemas: Record<string, SchemaObject | ReferenceObject>,
  result: {
    zodSchemaByName: Record<string, string>;
  },
  doc: OpenAPIObject,
  options?: TemplateContext['options'],
): void {
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
}
