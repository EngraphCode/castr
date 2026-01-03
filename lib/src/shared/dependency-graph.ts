/**
 * OpenAPI Schema Dependency Graph
 *
 * Architecture Note:
 * This module builds a dependency graph by traversing schema $refs. It relies
 * on Scalar's bundling behavior which PRESERVES internal $refs (rather than
 * dereferencing them all).
 *
 * Why $refs are essential:
 * 1. Circular reference detection (LinkedList → Node → LinkedList)
 * 2. Topological sorting (generate schemas in correct order)
 * 3. z.lazy() generation (break circular references in Zod)
 *
 * If we used full dereferencing, all $refs would be replaced with inline schemas,
 * making dependency tracking impossible.
 *
 * See: .agent/architecture/SCALAR-PIPELINE.md (Bundling vs Dereferencing)
 */

import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';

import { isReferenceObject } from 'openapi3-ts/oas31';
import { visitComposition, visitObjectProperties } from './dependency-graph.helpers.js';
import { getSchemaFromComponents } from './component-access.js';
import { parseComponentRef } from './ref-resolution.js';

type VisitFn = (schema: SchemaObject | ReferenceObject, fromRef: string) => void;

/**
 * Handle reference object in dependency graph
 *
 * Normalizes x-ext refs to standard format to ensure consistent dependency tracking
 * between standard and external schemas.
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

  // Normalize x-ext refs to standard format for consistent dependency tracking
  // e.g., #/x-ext/abc123/components/schemas/Pet → #/components/schemas/Pet
  const parsedRef = parseComponentRef(schema.$ref);
  const normalizedRef = `#/components/${parsedRef.componentType}/${parsedRef.componentName}`;

  refsDependencyGraph[fromRef].add(normalizedRef);

  if (visitedsRefs[normalizedRef]) {
    return;
  }

  visitedsRefs[normalizedRef] = true;
  visit(getSchemaFromComponents(doc, parsedRef.componentName, parsedRef.xExtKey), normalizedRef);
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
    if (!refsDependencyGraph[ref]) {
      refsDependencyGraph[ref] = new Set();
    }
    const parsedRef = parseComponentRef(ref);
    visit(getSchemaFromComponents(doc, parsedRef.componentName, parsedRef.xExtKey), ref);
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
 * Build dependency graphs for OpenAPI component schemas.
 *
 * Analyzes schema references to build both direct and transitive dependency relationships.
 * This is essential for:
 * - Topological sorting of schemas (resolving dependencies before dependents)
 * - Detecting circular references (for z.lazy() usage)
 * - Understanding schema relationships for code generation
 *
 * @param schemaRef - Array of schema reference paths (e.g., ['#/components/schemas/User'])
 * @param doc - The OpenAPI document containing schema definitions
 * @returns Object containing both dependency graphs:
 *   - `refsDependencyGraph`: Direct dependencies only (schema → immediate dependencies)
 *   - `deepDependencyGraph`: Transitive dependencies (schema → all dependencies recursively)
 *
 * @example
 * ```typescript
 * import { getOpenApiDependencyGraph } from '@engraph/castr';
 *
 * const graphs = getOpenApiDependencyGraph(
 *   ['#/components/schemas/User', '#/components/schemas/Post'],
 *   openApiDoc
 * );
 *
 * // Check direct dependencies
 * console.log(graphs.refsDependencyGraph['#/components/schemas/User']);
 * // Set { '#/components/schemas/Address' }
 *
 * // Check all transitive dependencies
 * console.log(graphs.deepDependencyGraph['#/components/schemas/User']);
 * // Set { '#/components/schemas/Address', '#/components/schemas/Country' }
 * ```
 *
 * @public
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
