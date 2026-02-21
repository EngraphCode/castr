/**
 * IR Builder - Circular Reference Detection
 *
 * Handles detection of circular references in IR components.
 *
 * @module ir-builder.circular
 * @internal
 */

import type { CastrSchema, IRComponent } from '../../../ir/index.js';
import { split } from 'lodash-es';
import { parseComponentNameForType } from './builder.component-ref-resolution.js';

const COMPONENT_TYPE_SCHEMA = 'schema' as const;
const COMPONENT_TYPE_SCHEMAS = 'schemas' as const;
const COMPONENT_NAME_SEPARATOR = '/' as const;
const COMPONENTS_PATH_PREFIX = '#/components/schemas/' as const;
const EXPECTED_SCHEMA_REF_PATTERN =
  '#/components/schemas/{name} or #/x-ext/{hash}/components/schemas/{name}' as const;

/**
 * Detect circular references in schemas using depth-first search.
 *
 * Populates the `circularReferences` array on each schema's metadata
 * when cycles are detected. Handles both self-referencing (A → A)
 * and mutually referencing (A → B → A) patterns.
 *
 * @param components - Array of IR components to analyze
 *
 * @internal
 */
export function detectCircularReferences(components: IRComponent[]): void {
  // Filter for schema components only
  const schemaComponents = components.filter(
    (c): c is IRComponent & { type: 'schema' } => c.type === COMPONENT_TYPE_SCHEMA,
  );

  // Build dependency graph: schema name → referenced schema names
  const dependencyGraph = new Map<string, Set<string>>();

  for (const component of schemaComponents) {
    const location = `${COMPONENTS_PATH_PREFIX}${component.name}`;
    const refs = extractSchemaReferences(component.schema, location);
    dependencyGraph.set(component.name, refs);
  }

  // For each schema, detect cycles using DFS
  for (const component of schemaComponents) {
    const cycles = findCyclesFrom(component.name, dependencyGraph);
    if (cycles.length > 0 && component.schema.metadata) {
      // Convert schema names to full refs
      component.schema.metadata.circularReferences = cycles.map(
        (name) => `#/components/schemas/${name}`,
      );
    }
  }
}

/**
 * Extract all schema references from an IR schema.
 *
 * @param irSchema - IR schema to analyze
 * @returns Set of referenced schema names
 *
 * @internal
 */
function extractSchemaReferences(irSchema: CastrSchema, location: string): Set<string> {
  const refs = new Set<string>();

  // Check direct $ref
  if (irSchema.$ref) {
    const refName = extractSchemaNameFromRef(irSchema.$ref, location);
    refs.add(refName);
  }

  // Check properties (for object schemas)
  const propertyRefs = extractPropertyReferences(irSchema.properties, `${location}/properties`);
  propertyRefs.forEach((ref) => refs.add(ref));

  // Check array items
  const itemRefs = extractItemsReferences(irSchema.items, `${location}/items`);
  itemRefs.forEach((ref) => refs.add(ref));

  // Check composition schemas (allOf, oneOf, anyOf)
  const compositionRefs = extractCompositionReferences(irSchema, location);
  compositionRefs.forEach((ref) => refs.add(ref));

  return refs;
}

/**
 * Extract references from object properties.
 *
 * @param properties - Schema properties to analyze
 * @returns Set of referenced schema names
 *
 * @internal
 */
function extractPropertyReferences(
  properties: CastrSchema['properties'],
  location: string,
): Set<string> {
  const refs = new Set<string>();

  if (properties) {
    for (const [propertyName, propSchema] of properties.entries()) {
      const propLocation = `${location}/${propertyName}`;
      const propRefs = extractSchemaReferences(propSchema, propLocation);
      propRefs.forEach((ref) => refs.add(ref));
    }
  }

  return refs;
}

/**
 * Extract references from array items.
 *
 * @param items - Schema items to analyze
 * @returns Set of referenced schema names
 *
 * @internal
 */
function extractItemsReferences(items: CastrSchema['items'], location: string): Set<string> {
  // Fail-fast: empty set for null/undefined items
  if (!items) {
    return new Set<string>();
  }

  const refs = new Set<string>();

  if (Array.isArray(items)) {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (isCastrSchemaLike(item)) {
        const itemRefs = extractSchemaReferences(item, `${location}/${String(index)}`);
        itemRefs.forEach((ref) => refs.add(ref));
      }
    }
  } else if (isCastrSchemaLike(items)) {
    const itemRefs = extractSchemaReferences(items, location);
    itemRefs.forEach((ref) => refs.add(ref));
  }

  return refs;
}

/**
 * Extract references from composition schemas (allOf, oneOf, anyOf).
 *
 * @param irSchema - IR schema to analyze
 * @returns Set of referenced schema names
 *
 * @internal
 */
function extractCompositionReferences(irSchema: CastrSchema, location: string): Set<string> {
  const refs = new Set<string>();
  const compositionKeys: ('allOf' | 'oneOf' | 'anyOf')[] = ['allOf', 'oneOf', 'anyOf'];

  for (const key of compositionKeys) {
    const schemas = irSchema[key];
    if (schemas && Array.isArray(schemas)) {
      const compositionRefs = extractReferencesFromSchemas(schemas, `${location}/${key}`);
      compositionRefs.forEach((ref) => refs.add(ref));
    }
  }

  return refs;
}

/**
 * Extract references from an array of schemas.
 *
 * @param schemas - Array of schemas to analyze
 * @returns Set of referenced schema names
 *
 * @internal
 */
function extractReferencesFromSchemas(schemas: unknown[], location: string): Set<string> {
  const refs = new Set<string>();

  for (let index = 0; index < schemas.length; index++) {
    const schema = schemas[index];
    if (isCastrSchemaLike(schema)) {
      const schemaRefs = extractSchemaReferences(schema, `${location}/${String(index)}`);
      schemaRefs.forEach((ref) => refs.add(ref));
    }
  }

  return refs;
}

/**
 * Type guard to check if value looks like an CastrSchema.
 *
 * @param value - Value to check
 * @returns True if value has CastrSchema structure
 *
 * @internal
 */
function isCastrSchemaLike(value: unknown): value is CastrSchema {
  return value !== null && typeof value === 'object' && 'metadata' in value;
}

/**
 * Extract schema name from a $ref string.
 *
 * @param ref - OpenAPI $ref string
 * @returns Schema name
 *
 * @internal
 */
function extractSchemaNameFromRef(ref: string, location: string): string {
  const componentName = parseComponentNameForType(
    ref,
    COMPONENT_TYPE_SCHEMAS,
    location,
    'schema',
    EXPECTED_SCHEMA_REF_PATTERN,
  );
  const nameSegments = split(componentName, COMPONENT_NAME_SEPARATOR);
  const rootName = nameSegments[0];
  if (!rootName) {
    throw new Error(`Invalid schema reference "${ref}" at ${location}.`);
  }
  return rootName;
}

/**
 * Find all cycles starting from a given schema using DFS.
 *
 * @param startName - Schema name to start from
 * @param graph - Dependency graph (name → referenced names)
 * @returns Array of schema names that form cycles with the start schema
 *
 * @internal
 */
function findCyclesFrom(startName: string, graph: Map<string, Set<string>>): string[] {
  const cycles = new Set<string>();
  const visited = new Set<string>();
  const pathStack = new Set<string>();

  function dfs(currentName: string): void {
    if (pathStack.has(currentName)) {
      // Found a cycle - mark this node as circular
      cycles.add(currentName);
      return;
    }

    if (visited.has(currentName)) {
      return;
    }

    visited.add(currentName);
    pathStack.add(currentName);

    const dependencies = graph.get(currentName) || new Set();
    for (const depName of dependencies) {
      dfs(depName);
    }

    pathStack.delete(currentName);
  }

  dfs(startName);

  return Array.from(cycles);
}
