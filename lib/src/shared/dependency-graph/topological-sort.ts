/**
 * Topological sort using Depth-First Search (DFS).
 *
 * Orders nodes so that dependencies appear before dependents.
 * Handles circular dependencies gracefully by skipping them.
 *
 * **Algorithm Complexity:**
 * - Time: O(V + E) where V = vertices, E = edges
 * - Space: O(V + depth) where depth = max dependency chain length
 *
 * **Optimization Notes:**
 * - Uses Set for O(1) visited/sorted lookups (vs O(V) with array.includes())
 * - Uses backtracking to avoid array copying on each recursive call
 * - Maintains DFS approach for intuitive dependency resolution
 *
 * @param graph - Dependency graph where keys are nodes and values are their dependencies
 * @returns Array of nodes in topological order (dependencies first)
 *
 * @example
 * ```typescript
 * const graph = {
 *   User: new Set(['Profile']),
 *   Profile: new Set([])
 * };
 * topologicalSort(graph); // Returns: ['Profile', 'User']
 * ```
 */
export function topologicalSort(graph: Record<string, Set<string>>): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const sortedSet = new Set<string>();

  function visit(name: string, ancestors: Set<string>): void {
    if (visited.has(name)) {
      return;
    }

    visited.add(name);
    ancestors.add(name);

    const dependencies = graph[name];
    if (dependencies) {
      for (const dep of dependencies) {
        // Skip circular dependencies
        if (ancestors.has(dep)) {
          continue;
        }
        visit(dep, ancestors);
      }
    }

    // Backtrack: remove from ancestors before returning
    ancestors.delete(name);

    // Add to sorted list if not already present
    if (!sortedSet.has(name)) {
      sorted.push(name);
      sortedSet.add(name);
    }
  }

  // Visit all nodes in the graph
  for (const name of Object.keys(graph)) {
    visit(name, new Set());
  }

  return sorted;
}
