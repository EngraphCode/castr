/**
 * IR Builder - Component Schema Extraction
 *
 * Handles extraction of schemas from OpenAPI components section.
 * Focused on component-level schema extraction and organization.
 *
 * @module ir-builder.schemas
 * @internal
 */

import type { ComponentsObject } from 'openapi3-ts/oas31';
import type { IRComponent, IRSchema } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { buildIRSchema } from './ir-builder.core.js';

/**
 * Build IR components from OpenAPI components object.
 *
 * Extracts schemas from the components section, converting each to an
 * IRComponent structure with full schema information and metadata.
 * Detects circular references after building all schemas.
 *
 * @param components - OpenAPI components object (may be undefined)
 * @returns Array of IR components with circular references detected
 *
 * @example
 * ```typescript
 * const components: ComponentsObject = {
 *   schemas: {
 *     Pet: { type: 'object', properties: { name: { type: 'string' } } },
 *     Error: { type: 'object', properties: { message: { type: 'string' } } },
 *   },
 * };
 *
 * const irComponents = buildIRSchemas(components);
 * // Returns array with 2 IRComponent objects
 * ```
 *
 * @public
 */
export function buildIRSchemas(components: ComponentsObject | undefined): IRComponent[] {
  if (!components?.schemas) {
    return [];
  }

  const schemas = components.schemas;
  const schemaNames = Object.keys(schemas);

  // Build all schemas first
  const irComponents = schemaNames.map((name) => {
    const schema = schemas[name];
    if (!schema) {
      throw new Error(`Schema '${name}' is undefined`);
    }

    // Build context for this schema
    const context: IRBuildContext = {
      doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
      path: ['#', 'components', 'schemas', name],
      required: false,
    };

    // Build IR schema from OpenAPI schema
    const irSchema = buildIRSchema(schema, context);

    return {
      type: 'schema' as const,
      name,
      schema: irSchema,
      metadata: irSchema.metadata,
    };
  });

  // Detect and populate circular references
  detectCircularReferences(irComponents);

  return irComponents;
}

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
function detectCircularReferences(components: IRComponent[]): void {
  // Build dependency graph: schema name → referenced schema names
  const dependencyGraph = new Map<string, Set<string>>();

  for (const component of components) {
    const refs = extractSchemaReferences(component.schema);
    dependencyGraph.set(component.name, refs);
  }

  // For each schema, detect cycles using DFS
  for (const component of components) {
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
function extractSchemaReferences(irSchema: IRSchema): Set<string> {
  const refs = new Set<string>();

  // Check direct $ref
  if (irSchema.$ref) {
    const refName = extractSchemaNameFromRef(irSchema.$ref);
    if (refName) {
      refs.add(refName);
    }
  }

  // Check properties (for object schemas)
  const propertyRefs = extractPropertyReferences(irSchema.properties);
  propertyRefs.forEach((ref) => refs.add(ref));

  // Check array items
  const itemRefs = extractItemsReferences(irSchema.items);
  itemRefs.forEach((ref) => refs.add(ref));

  // Check composition schemas (allOf, oneOf, anyOf)
  const compositionRefs = extractCompositionReferences(irSchema);
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
function extractPropertyReferences(properties: IRSchema['properties']): Set<string> {
  const refs = new Set<string>();

  if (properties) {
    const values = properties.values();
    for (const propSchema of values) {
      const propRefs = extractSchemaReferences(propSchema);
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
function extractItemsReferences(items: IRSchema['items']): Set<string> {
  // Fail-fast: empty set for null/undefined items
  if (!items) {
    return new Set<string>();
  }

  const refs = new Set<string>();

  if (Array.isArray(items)) {
    for (const item of items) {
      if (isIRSchemaLike(item)) {
        const itemRefs = extractSchemaReferences(item);
        itemRefs.forEach((ref) => refs.add(ref));
      }
    }
  } else if (isIRSchemaLike(items)) {
    const itemRefs = extractSchemaReferences(items);
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
function extractCompositionReferences(irSchema: IRSchema): Set<string> {
  const refs = new Set<string>();
  const compositionKeys: ('allOf' | 'oneOf' | 'anyOf')[] = ['allOf', 'oneOf', 'anyOf'];

  for (const key of compositionKeys) {
    const schemas = irSchema[key];
    if (schemas && Array.isArray(schemas)) {
      const compositionRefs = extractReferencesFromSchemas(schemas);
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
function extractReferencesFromSchemas(schemas: unknown[]): Set<string> {
  const refs = new Set<string>();

  for (const schema of schemas) {
    if (isIRSchemaLike(schema)) {
      const schemaRefs = extractSchemaReferences(schema);
      schemaRefs.forEach((ref) => refs.add(ref));
    }
  }

  return refs;
}

/**
 * Type guard to check if value looks like an IRSchema.
 *
 * @param value - Value to check
 * @returns True if value has IRSchema structure
 *
 * @internal
 */
function isIRSchemaLike(value: unknown): value is IRSchema {
  return value !== null && typeof value === 'object' && 'metadata' in value;
}

/**
 * Extract schema name from a $ref string.
 *
 * @param ref - OpenAPI $ref string
 * @returns Schema name or undefined
 *
 * @internal
 */
function extractSchemaNameFromRef(ref: string): string | undefined {
  // Handle standard refs: #/components/schemas/SchemaName
  const standardRegex = /#\/components\/schemas\/([^/]+)$/;
  const standardMatch = standardRegex.exec(ref);
  if (standardMatch) {
    return standardMatch[1];
  }
  // Handle x-ext refs: #/x-ext/{hash}/components/schemas/SchemaName
  const xExtRegex = /#\/x-ext\/[^/]+\/components\/schemas\/([^/]+)$/;
  const xExtMatch = xExtRegex.exec(ref);
  if (xExtMatch) {
    return xExtMatch[1];
  }
  return undefined;
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
