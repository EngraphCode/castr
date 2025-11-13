/**
 * Information Retrieval (IR) Builder
 *
 * Builds lossless Information Retrieval structures from OpenAPI documents.
 * Extracts all metadata required for code generation in a structured format.
 *
 * **Pure Functions:**
 * All functions in this module are pure - no side effects, deterministic output.
 *
 * **Library Types:**
 * Uses OpenAPIObject from openapi3-ts/oas31 exclusively.
 *
 * @module ir-builder
 * @since 1.0.0
 * @public
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { IRDependencyGraph, IRDocument } from './ir-schema.js';
import { buildIRSchemas } from './ir-builder.schemas.js';
import { buildIROperations } from './ir-builder.operations.js';

// Re-export core functions for backwards compatibility
export { buildIRSchema, buildIRSchemaNode } from './ir-builder.core.js';
export { buildIRSchemas } from './ir-builder.schemas.js';

/**
 * Build complete Information Retrieval document from OpenAPI specification.
 *
 * Extracts all schemas, operations, and metadata into a lossless IR structure
 * optimized for code generation. Preserves all OpenAPI information without loss.
 *
 * @param doc - OpenAPI document (OAS 3.1.0)
 * @returns Complete IR document with schemas, operations, and dependency graph
 *
 * @example
 * ```typescript
 * const openApiDoc: OpenAPIObject = loadOpenApiSpec('petstore.yaml');
 * const ir = buildIR(openApiDoc);
 *
 * console.log(`Components: ${ir.components.length}`);
 * console.log(`Operations: ${ir.operations.length}`);
 * ```
 *
 * @public
 */
export function buildIR(doc: OpenAPIObject): IRDocument {
  const components = buildIRSchemas(doc.components);
  const operations = buildIROperations(doc.paths);
  const dependencyGraph = buildDependencyGraph();

  return {
    version: '1.0.0', // IR schema version
    openApiVersion: doc.openapi,
    info: doc.info,
    components,
    operations,
    dependencyGraph,
  };
}

/**
 * Build dependency graph for schemas.
 *
 * Stub implementation that returns an empty dependency graph structure.
 * Full dependency graph analysis with circular reference detection and
 * topological sorting will be implemented in a future iteration.
 *
 * @returns IR dependency graph with empty nodes, order, and circular references
 *
 * @internal
 */
function buildDependencyGraph(): IRDependencyGraph {
  // Dependency graph stub - will be enhanced in later implementation
  // Returns empty graph structure for now
  return {
    nodes: new Map(),
    topologicalOrder: [],
    circularReferences: [],
  };
}
