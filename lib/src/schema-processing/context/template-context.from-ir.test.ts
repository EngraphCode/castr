/**
 * IR-Based Context Helpers Tests
 *
 * Tests for context functions that operate ONLY on CastrDocument (IR),
 * without any OpenAPIObject access. These tests verify the architectural
 * separation where post-IR code never accesses raw OpenAPI data.
 */
import { describe, it, expect } from 'vitest';
import type { IRDependencyGraph, CastrDocument, CastrSchemaComponent } from '../ir/index.js';
import {
  getSchemaNamesSortedByDependencies,
  getDeepDependencyGraphFromIR,
} from './template-context.from-ir.js';

/**
 * Creates a minimal CastrDocument for testing.
 * Uses only the fields needed for the specific test.
 */
function createMinimalIR(overrides: Partial<CastrDocument> = {}): CastrDocument {
  const defaultDependencyGraph: IRDependencyGraph = {
    nodes: new Map(),
    topologicalOrder: [],
    circularReferences: [],
  };

  return {
    version: '1.0.0',
    openApiVersion: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    servers: [],
    components: [],
    operations: [],
    dependencyGraph: defaultDependencyGraph,
    schemaNames: [],
    enums: new Map(),
    ...overrides,
  };
}

describe('getSchemaNamesSortedByDependencies', () => {
  it('returns schema names in topological order from IR', () => {
    const ir = createMinimalIR({
      schemaNames: ['User', 'Address', 'Company'],
      dependencyGraph: {
        nodes: new Map(),
        // Topological order: Address first (no deps), User depends on Address, Company depends on User
        topologicalOrder: ['Address', 'User', 'Company'],
        circularReferences: [],
      },
    });

    const result = getSchemaNamesSortedByDependencies(ir);

    expect(result).toEqual(['Address', 'User', 'Company']);
  });

  it('includes inline schema components appended to sorted names', () => {
    const ir = createMinimalIR({
      schemaNames: ['Pet'],
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: ['Pet'],
        circularReferences: [],
      },
      // Inline components are already pushed to ir.components during processing
      components: [
        {
          type: 'schema',
          name: 'Pet',
          schema: {
            type: 'object',
            metadata: {
              required: false,
              nullable: false,
              zodChain: { presence: '', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        } satisfies CastrSchemaComponent,
      ],
    });

    const result = getSchemaNamesSortedByDependencies(ir);

    expect(result).toEqual(['Pet']);
  });

  it('returns empty array for IR with no schemas', () => {
    const ir = createMinimalIR({
      schemaNames: [],
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [],
      },
    });

    const result = getSchemaNamesSortedByDependencies(ir);

    expect(result).toEqual([]);
  });
});

describe('getDeepDependencyGraphFromIR', () => {
  it('converts IR dependency graph to Record format', () => {
    const ir = createMinimalIR({
      dependencyGraph: {
        nodes: new Map([
          [
            'User',
            { ref: 'User', dependencies: ['Address'], dependents: [], depth: 1, isCircular: false },
          ],
          [
            'Address',
            { ref: 'Address', dependencies: [], dependents: ['User'], depth: 0, isCircular: false },
          ],
        ]),
        topologicalOrder: ['Address', 'User'],
        circularReferences: [],
      },
    });

    const result = getDeepDependencyGraphFromIR(ir);

    expect(result).toEqual({
      User: new Set(['Address']),
      Address: new Set(),
    });
  });

  it('returns empty object for IR with no dependencies', () => {
    const ir = createMinimalIR({
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [],
      },
    });

    const result = getDeepDependencyGraphFromIR(ir);

    expect(result).toEqual({});
  });
});
