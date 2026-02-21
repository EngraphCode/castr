import type { CastrDocument } from '../ir/index.js';

/**
 * Gets schema names sorted by dependency order from the IR.
 *
 * Uses the pre-computed topological order from the IR's dependency graph.
 * This replaces the need to call extractSchemaNamesFromDoc + sortSchemasByDependencies
 * with raw OpenAPI access.
 *
 * @param ir - The Intermediate Representation document
 * @returns Schema names sorted in topological order (leaves first)
 *
 * @example
 * ```typescript
 * const ir = buildIR(openApiDoc);
 * const sortedNames = getSchemaNamesSortedByDependencies(ir);
 * // Returns: ['Address', 'User', 'Company'] (in dependency order)
 * ```
 *
 * @internal
 */
export function getSchemaNamesSortedByDependencies(ir: CastrDocument): string[] {
  // The IR already has topological order computed during buildIR
  return [...ir.dependencyGraph.topologicalOrder];
}

/**
 * Converts IR dependency graph to the legacy Record<string, Set<string>> format.
 *
 * This bridges the gap between the new IR structure and legacy code that expects
 * the old deepDependencyGraph format. Over time, consumers should migrate to
 * using ir.dependencyGraph directly.
 *
 * @param ir - The Intermediate Representation document
 * @returns Dependency graph in Record<schemaName, Set<dependencyNames>> format
 *
 * @example
 * ```typescript
 * const ir = buildIR(openApiDoc);
 * const graph = getDeepDependencyGraphFromIR(ir);
 * // Returns: { User: Set(['Address']), Address: Set([]) }
 * ```
 *
 * @internal
 */
export function getDeepDependencyGraphFromIR(ir: CastrDocument): Record<string, Set<string>> {
  const result: Record<string, Set<string>> = {};

  for (const [name, node] of ir.dependencyGraph.nodes) {
    result[name] = new Set(node.dependencies);
  }

  return result;
}
