import { describe, it, expect } from 'vitest';
import { topologicalSort } from './topological-sort.js';

describe('topologicalSort', () => {
  it('should sort nodes in dependency order (dependencies first)', () => {
    // User depends on Profile
    // Graph structure: { 'User': Set(['Profile']), 'Profile': Set([]) }
    // Expected order: Profile, User (dependency first)
    const graph: Record<string, Set<string>> = {
      User: new Set(['Profile']),
      Profile: new Set([]),
    };

    const result = topologicalSort(graph);

    const profileIndex = result.indexOf('Profile');
    const userIndex = result.indexOf('User');

    // Profile should come BEFORE User (dependencies first)
    expect(profileIndex).toBeLessThan(userIndex);
  });

  it('should handle multi-level dependencies', () => {
    // Root -> User -> Profile -> Address
    const graph: Record<string, Set<string>> = {
      Root: new Set(['User']),
      User: new Set(['Profile', 'Settings']),
      Profile: new Set([]),
      Settings: new Set([]),
    };

    const result = topologicalSort(graph);

    const profileIndex = result.indexOf('Profile');
    const settingsIndex = result.indexOf('Settings');
    const userIndex = result.indexOf('User');
    const rootIndex = result.indexOf('Root');

    // Dependencies should come before their dependents
    expect(profileIndex).toBeLessThan(userIndex);
    expect(settingsIndex).toBeLessThan(userIndex);
    expect(userIndex).toBeLessThan(rootIndex);
  });

  it('should handle circular dependencies without infinite loop', () => {
    // A -> B -> C -> A (circular)
    const graph: Record<string, Set<string>> = {
      A: new Set(['B']),
      B: new Set(['C']),
      C: new Set(['A']),
    };

    const result = topologicalSort(graph);

    // Should complete without hanging and include all nodes
    expect(result).toHaveLength(3);
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).toContain('C');
  });

  it('should handle nodes with no dependencies', () => {
    const graph: Record<string, Set<string>> = {
      Standalone: new Set([]),
      Independent: new Set([]),
    };

    const result = topologicalSort(graph);

    expect(result).toHaveLength(2);
    expect(result).toContain('Standalone');
    expect(result).toContain('Independent');
  });

  describe('edge cases', () => {
    it('should handle empty graph', () => {
      const result = topologicalSort({});
      expect(result).toEqual([]);
    });

    it('should handle single node with no dependencies', () => {
      const graph = { A: new Set<string>() };
      const result = topologicalSort(graph);
      expect(result).toEqual(['A']);
    });

    it('should handle single node with self-dependency (circular)', () => {
      const graph = { A: new Set(['A']) };
      const result = topologicalSort(graph);
      // Should complete without hanging and include the node once
      expect(result).toEqual(['A']);
    });

    it('should handle disconnected graph components', () => {
      const graph = {
        A: new Set(['B']),
        B: new Set<string>(),
        C: new Set(['D']),
        D: new Set<string>(),
      };
      const result = topologicalSort(graph);

      // All nodes should be present
      expect(result).toHaveLength(4);
      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
      expect(result).toContain('D');

      // Dependencies must come before dependents
      expect(result.indexOf('B')).toBeLessThan(result.indexOf('A'));
      expect(result.indexOf('D')).toBeLessThan(result.indexOf('C'));
    });

    it('should handle diamond dependencies', () => {
      // A depends on B and C
      // B and C both depend on D
      const graph = {
        A: new Set(['B', 'C']),
        B: new Set(['D']),
        C: new Set(['D']),
        D: new Set<string>(),
      };
      const result = topologicalSort(graph);

      // D must come before B and C
      expect(result.indexOf('D')).toBeLessThan(result.indexOf('B'));
      expect(result.indexOf('D')).toBeLessThan(result.indexOf('C'));
      // B and C must come before A
      expect(result.indexOf('B')).toBeLessThan(result.indexOf('A'));
      expect(result.indexOf('C')).toBeLessThan(result.indexOf('A'));
    });

    it('should not duplicate nodes in output', () => {
      // Multiple paths to same dependency
      const graph = {
        A: new Set(['B', 'C']),
        B: new Set(['D']),
        C: new Set(['D']),
        D: new Set<string>(),
      };
      const result = topologicalSort(graph);

      // Each node should appear exactly once
      expect(result).toHaveLength(4);
      expect(result.filter((n) => n === 'D')).toHaveLength(1);
      expect(result.filter((n) => n === 'A')).toHaveLength(1);
    });

    it('should handle long dependency chains', () => {
      // Create chain: A -> B -> C -> D -> E
      const graph = {
        A: new Set(['B']),
        B: new Set(['C']),
        C: new Set(['D']),
        D: new Set(['E']),
        E: new Set<string>(),
      };
      const result = topologicalSort(graph);

      // Should be in reverse order
      expect(result).toEqual(['E', 'D', 'C', 'B', 'A']);
    });
  });
});
