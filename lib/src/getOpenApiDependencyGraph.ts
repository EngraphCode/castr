import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

import { isReferenceObject } from 'openapi3-ts/oas30';
import { visitComposition, visitObjectProperties } from './getOpenApiDependencyGraph.helpers.js';
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

export const getOpenApiDependencyGraph = (
  schemaRef: string[],
  doc: OpenAPIObject,
): {
  refsDependencyGraph: Record<string, Set<string>>;
  deepDependencyGraph: Record<string, Set<string>>;
} => {
  const visitedsRefs: Record<string, boolean> = {};
  const refsDependencyGraph: Record<string, Set<string>> = {};

  const visit = (schema: SchemaObject | ReferenceObject, fromRef: string): void => {
    if (!schema) return;

    if (isReferenceObject(schema)) {
      if (!refsDependencyGraph[fromRef]) {
        refsDependencyGraph[fromRef] = new Set();
      }

      refsDependencyGraph[fromRef].add(schema.$ref);

      if (visitedsRefs[schema.$ref]) return;

      visitedsRefs[fromRef] = true;
      const schemaName = getSchemaNameFromRef(schema.$ref);
      visit(getSchemaFromComponents(doc, schemaName), schema.$ref);
      return;
    }

    if (schema.allOf) {
      visitComposition(schema.allOf, fromRef, visit);
      return;
    }

    if (schema.oneOf) {
      visitComposition(schema.oneOf, fromRef, visit);
      return;
    }

    if (schema.anyOf) {
      visitComposition(schema.anyOf, fromRef, visit);
      return;
    }

    if (schema.type === 'array') {
      if (!schema.items) return;
      visit(schema.items, fromRef);
      return;
    }

    if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
      visitObjectProperties(schema, fromRef, visit);
    }
  };

  schemaRef.forEach((ref) => {
    const schemaName = getSchemaNameFromRef(ref);
    visit(getSchemaFromComponents(doc, schemaName), ref);
  });

  const deepDependencyGraph: Record<string, Set<string>> = {};
  const visitedsDeepRefs: Record<string, boolean> = {};
  schemaRef.forEach((ref) => {
    const deps = refsDependencyGraph[ref];
    if (!deps) return;
    if (!deepDependencyGraph[ref]) {
      deepDependencyGraph[ref] = new Set();
    }

    const visit = (dep: string) => {
      const currentGraph = deepDependencyGraph[ref];
      if (currentGraph) {
        currentGraph.add(dep);
      }
      if (refsDependencyGraph[dep] && ref !== dep) {
        refsDependencyGraph[dep].forEach((transitive: string) => {
          if (visitedsDeepRefs[ref + '__' + transitive]) return;
          visitedsDeepRefs[ref + '__' + transitive] = true;
          visit(transitive);
        });
      }
    };

    deps.forEach((dep: string) => visit(dep));
  });

  return { refsDependencyGraph, deepDependencyGraph };
};
