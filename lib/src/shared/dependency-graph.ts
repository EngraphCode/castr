import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';

import { isReferenceObject } from 'openapi3-ts/oas31';
import { visitComposition, visitObjectProperties } from './dependency-graph.helpers.js';
import { getSchemaFromComponents } from './component-access.js';

/**
 * Extract schema name from a component schema $ref
 */
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid schema $ref: ${ref}`);
  }
  return name;
};

type VisitFn = (schema: SchemaObject | ReferenceObject, fromRef: string) => void;

/**
 * Handle reference object in dependency graph
 */
const handleReferenceInGraph = (
  schema: ReferenceObject,
  fromRef: string,
  refsDependencyGraph: Record<string, Set<string>>,
  visitedsRefs: Record<string, boolean>,
  doc: OpenAPIObject,
  visit: VisitFn,
): void => {
  if (!refsDependencyGraph[fromRef]) {
    refsDependencyGraph[fromRef] = new Set();
  }

  refsDependencyGraph[fromRef].add(schema.$ref);

  if (visitedsRefs[schema.$ref]) {
    return;
  }

  visitedsRefs[fromRef] = true;
  const schemaName = getSchemaNameFromRef(schema.$ref);
  visit(getSchemaFromComponents(doc, schemaName), schema.$ref);
};

/**
 * Handle composition schemas (allOf, oneOf, anyOf) if present
 */
const handleCompositionIfPresent = (
  schema: SchemaObject,
  fromRef: string,
  visit: VisitFn,
): boolean => {
  if (schema.allOf) {
    visitComposition(schema.allOf, fromRef, visit);
    return true;
  }
  if (schema.oneOf) {
    visitComposition(schema.oneOf, fromRef, visit);
    return true;
  }
  if (schema.anyOf) {
    visitComposition(schema.anyOf, fromRef, visit);
    return true;
  }
  return false;
};

/**
 * Handle non-reference schema (composition, array, object)
 */
const handleSchemaType = (schema: SchemaObject, fromRef: string, visit: VisitFn): void => {
  // Handle composition schemas first
  if (handleCompositionIfPresent(schema, fromRef, visit)) {
    return;
  }

  // Handle array schemas
  if (schema.type === 'array' && schema.items) {
    visit(schema.items, fromRef);
    return;
  }

  // Handle object schemas
  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    visitObjectProperties(schema, fromRef, visit);
  }
};

/**
 * Build direct dependency graph by visiting all schemas and their immediate dependencies
 *
 * Handles both $ref-based dependencies (from bundle mode) and circular object references
 * (from dereference mode) by tracking visited objects to prevent infinite recursion.
 */
const buildDirectDependencyGraph = (
  schemaRefs: string[],
  doc: OpenAPIObject,
): Record<string, Set<string>> => {
  const visitedsRefs: Record<string, boolean> = {};
  const refsDependencyGraph: Record<string, Set<string>> = {};
  // Track visited objects to handle circular references after dereferencing
  const visitedObjects = new WeakSet<object>();

  const visit: VisitFn = (schema, fromRef) => {
    if (!schema) {
      return;
    }

    // Check if we've already visited this object (handles circular references)
    if (typeof schema === 'object' && visitedObjects.has(schema)) {
      return;
    }

    // Mark this object as visited
    if (typeof schema === 'object') {
      visitedObjects.add(schema);
    }

    if (isReferenceObject(schema)) {
      handleReferenceInGraph(schema, fromRef, refsDependencyGraph, visitedsRefs, doc, visit);
    } else {
      handleSchemaType(schema, fromRef, visit);
    }
  };

  schemaRefs.forEach((ref) => {
    const schemaName = getSchemaNameFromRef(ref);
    visit(getSchemaFromComponents(doc, schemaName), ref);
  });

  return refsDependencyGraph;
};

/**
 * Build deep/transitive dependency graph from direct dependencies
 */
const buildDeepDependencyGraph = (
  schemaRefs: string[],
  refsDependencyGraph: Record<string, Set<string>>,
): Record<string, Set<string>> => {
  const deepDependencyGraph: Record<string, Set<string>> = {};
  const visitedsDeepRefs: Record<string, boolean> = {};

  schemaRefs.forEach((ref) => {
    const deps = refsDependencyGraph[ref];
    if (!deps) {
      return;
    }
    if (!deepDependencyGraph[ref]) {
      deepDependencyGraph[ref] = new Set();
    }

    const visit = (dep: string): void => {
      const currentGraph = deepDependencyGraph[ref];
      if (currentGraph) {
        currentGraph.add(dep);
      }
      if (refsDependencyGraph[dep] && ref !== dep) {
        refsDependencyGraph[dep].forEach((transitive: string) => {
          if (visitedsDeepRefs[ref + '__' + transitive]) {
            return;
          }
          visitedsDeepRefs[ref + '__' + transitive] = true;
          visit(transitive);
        });
      }
    };

    deps.forEach((dep: string) => visit(dep));
  });

  return deepDependencyGraph;
};

/**
 * Build dependency graphs for OpenAPI component schemas
 * Returns both direct dependencies and transitive (deep) dependencies
 */
export const getOpenApiDependencyGraph = (
  schemaRef: string[],
  doc: OpenAPIObject,
): {
  refsDependencyGraph: Record<string, Set<string>>;
  deepDependencyGraph: Record<string, Set<string>>;
} => {
  const refsDependencyGraph = buildDirectDependencyGraph(schemaRef, doc);
  const deepDependencyGraph = buildDeepDependencyGraph(schemaRef, refsDependencyGraph);

  return { refsDependencyGraph, deepDependencyGraph };
};
