/**
 * Helper functions for dependency graph traversal
 * Extracted to reduce cognitive complexity in getOpenApiDependencyGraph.ts
 */

import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';

type VisitFn = (schema: SchemaObject | ReferenceObject, fromRef: string) => void;

/**
 * Visits all schemas in a composition array (allOf, oneOf, anyOf)
 */
export function visitComposition(
  schemas: readonly (SchemaObject | ReferenceObject)[],
  fromRef: string,
  visit: VisitFn,
): void {
  for (const schema of schemas) {
    visit(schema, fromRef);
  }
}

/**
 * Visits all properties and additionalProperties in an object schema
 */
export function visitObjectProperties(schema: SchemaObject, fromRef: string, visit: VisitFn): void {
  if (schema.properties) {
    for (const property in schema.properties) {
      const propSchema = schema.properties[property];
      if (propSchema) {
        visit(propSchema, fromRef);
      }
    }
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    visit(schema.additionalProperties, fromRef);
  }
}
