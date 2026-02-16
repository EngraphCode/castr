/**
 * Dependency Graph Builder for IR
 *
 * Builds IRDependencyGraph from OpenAPI document by analyzing schema references.
 *
 * @module ir-builder.dependency-graph
 * @internal
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { IRDependencyGraph, IRDependencyNode } from '../../ir/schema.js';
import { getOpenApiDependencyGraph } from '../../../shared/dependency-graph.js';
import { topologicalSort } from '../../../shared/topological-sort.js';
import { isRecord } from '../../../shared/types.js';

/**
 * Extract original schema keys from OpenAPI document.
 *
 * Returns the raw schema keys from the OpenAPI document (including x-ext).
 * These are the original keys (e.g., 'Basic.Thing') before any sanitization,
 * needed for dependency graph building since lookups use original keys.
 *
 * @param doc - OpenAPI document
 * @returns Array of original schema keys (not sanitized)
 *
 * @internal
 */
export function extractOriginalSchemaKeys(doc: OpenAPIObject): string[] {
  const schemaKeys: string[] = [];

  // Extract from standard location
  if (doc.components?.schemas) {
    schemaKeys.push(...Object.keys(doc.components.schemas));
  }

  // Extract from x-ext locations
  schemaKeys.push(...extractXExtSchemaKeys(doc));

  return schemaKeys;
}

/**
 * Extract schema keys from x-ext vendor extension locations.
 */
function extractXExtSchemaKeys(doc: OpenAPIObject): string[] {
  const keys: string[] = [];
  const xExt: unknown = doc['x-ext'];
  if (!isRecord(xExt)) {
    return keys;
  }

  for (const extContent of Object.values(xExt)) {
    if (!isRecord(extContent)) {
      continue;
    }
    const components = extContent['components'];
    if (!isRecord(components)) {
      continue;
    }
    const schemas = components['schemas'];
    if (isRecord(schemas)) {
      keys.push(...Object.keys(schemas));
    }
  }

  return keys;
}

/**
 * Build dependency graph for schemas.
 *
 * Analyzes schema references to build dependency relationships, compute topological
 * order, and detect circular references.
 *
 * @param schemaNames - Array of schema names to analyze
 * @param doc - OpenAPI document for resolving references
 * @returns Complete IR dependency graph
 *
 * @internal
 */
export function buildDependencyGraph(schemaNames: string[], doc: OpenAPIObject): IRDependencyGraph {
  if (schemaNames.length === 0) {
    return {
      nodes: new Map(),
      topologicalOrder: [],
      circularReferences: [],
    };
  }

  // Convert names to $ref format
  const schemaRefs = schemaNames.map((name) => `#/components/schemas/${name}`);

  // Get dependency graphs from existing utility
  const { refsDependencyGraph, deepDependencyGraph } = getOpenApiDependencyGraph(schemaRefs, doc);

  // Compute topological order first - this tells us the depth
  const topologicalOrder = topologicalSort(deepDependencyGraph);

  // Detect circular references
  const circularRefs = detectCircularReferences(refsDependencyGraph);
  const circularSet = new Set(circularRefs.flat());

  // Build nodes map with dependencies, dependents, depth, and isCircular
  const depthMap = computeDepthMap(topologicalOrder, refsDependencyGraph);
  const nodes = buildNodes(schemaRefs, refsDependencyGraph, depthMap, circularSet);

  return {
    nodes,
    topologicalOrder,
    circularReferences: circularRefs,
  };
}

/**
 * Build dependency nodes with dependencies, dependents, depth, and isCircular.
 */
function buildNodes(
  schemaRefs: string[],
  refsDependencyGraph: Record<string, Set<string>>,
  depthMap: Map<string, number>,
  circularSet: Set<string>,
): Map<string, IRDependencyNode> {
  const nodes = initializeNodes(schemaRefs, refsDependencyGraph, depthMap, circularSet);
  populateDependents(schemaRefs, refsDependencyGraph, nodes);
  return nodes;
}

/**
 * Initialize nodes for all schema refs.
 */
function initializeNodes(
  schemaRefs: string[],
  refsDependencyGraph: Record<string, Set<string>>,
  depthMap: Map<string, number>,
  circularSet: Set<string>,
): Map<string, IRDependencyNode> {
  const nodes = new Map<string, IRDependencyNode>();

  for (const ref of schemaRefs) {
    const deps = refsDependencyGraph[ref];
    nodes.set(ref, {
      ref,
      dependencies: deps ? Array.from(deps) : [],
      dependents: [],
      depth: depthMap.get(ref) ?? 0,
      isCircular: circularSet.has(ref),
    });
  }

  return nodes;
}

/**
 * Populate dependents (reverse edges) for each node.
 */
function populateDependents(
  schemaRefs: string[],
  refsDependencyGraph: Record<string, Set<string>>,
  nodes: Map<string, IRDependencyNode>,
): void {
  for (const ref of schemaRefs) {
    const deps = refsDependencyGraph[ref];
    if (!deps) {
      continue;
    }
    for (const dep of deps) {
      const depNode = nodes.get(dep);
      if (depNode) {
        depNode.dependents.push(ref);
      }
    }
  }
}

/**
 * Compute depth for each node based on topological order.
 * Leaves (no dependencies) have depth 0.
 */
function computeDepthMap(
  topologicalOrder: string[],
  refsDependencyGraph: Record<string, Set<string>>,
): Map<string, number> {
  const depthMap = new Map<string, number>();

  for (const ref of topologicalOrder) {
    const deps = refsDependencyGraph[ref];
    if (!deps || deps.size === 0) {
      depthMap.set(ref, 0);
    } else {
      const maxDepDepth = Math.max(...Array.from(deps).map((d) => depthMap.get(d) ?? 0));
      depthMap.set(ref, maxDepDepth + 1);
    }
  }

  return depthMap;
}

/**
 * Detect circular references in the dependency graph using DFS.
 */
function detectCircularReferences(refsDependencyGraph: Record<string, Set<string>>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  for (const startNode of Object.keys(refsDependencyGraph)) {
    if (!visited.has(startNode)) {
      dfsForCycles(startNode, refsDependencyGraph, visited, recursionStack, path, cycles);
    }
  }

  return cycles;
}

/**
 * DFS helper to detect cycles.
 */
function findCycleStart(path: string[], node: string): number {
  for (let i = 0; i < path.length; i++) {
    if (path[i] === node) {
      return i;
    }
  }
  return -1;
}

function buildCycle(path: string[], cycleStart: number, node: string): string[] {
  const cycle: string[] = [];
  for (let i = cycleStart; i < path.length; i++) {
    const pathNode = path[i];
    if (pathNode !== undefined) {
      cycle.push(pathNode);
    }
  }
  cycle.push(node);
  return cycle;
}

function addDetectedCycle(path: string[], node: string, cycles: string[][]): boolean {
  const cycleStart = findCycleStart(path, node);
  if (cycleStart === -1) {
    return false;
  }
  cycles.push(buildCycle(path, cycleStart, node));
  return true;
}

function visitNodeDependencies(
  node: string,
  graph: Record<string, Set<string>>,
  visited: Set<string>,
  recursionStack: Set<string>,
  path: string[],
  cycles: string[][],
): void {
  const deps = graph[node];
  if (!deps) {
    return;
  }

  for (const dep of deps) {
    dfsForCycles(dep, graph, visited, recursionStack, path, cycles);
  }
}

function dfsForCycles(
  node: string,
  graph: Record<string, Set<string>>,
  visited: Set<string>,
  recursionStack: Set<string>,
  path: string[],
  cycles: string[][],
): void {
  if (recursionStack.has(node)) {
    addDetectedCycle(path, node, cycles);
    return;
  }

  if (visited.has(node)) {
    return;
  }

  visited.add(node);
  recursionStack.add(node);
  path.push(node);

  visitNodeDependencies(node, graph, visited, recursionStack, path, cycles);

  path.pop();
  recursionStack.delete(node);
}
