# **ARCHITECTURE REWRITE PLAN: Eliminate Resolver, CodeMeta, and Migrate to ts-morph**

**Document Version:** 1.0  
**Date:** October 25, 2025  
**Author:** AI Assistant + Jim  
**Status:** Planning Phase

---

## **🎯 EXECUTIVE SUMMARY**

**Problem:** The current architecture has fundamental flaws:

1. `makeSchemaResolver` lies about its return types (claims `SchemaObject`, returns any component)
2. `CodeMeta` is a poorly conceived abstraction with no clear value
3. We're not leveraging `SwaggerParser.bundle()` which already resolves all `$ref`s
4. Tanu may be misused (or insufficient) for AST generation
5. `@zodios/core` is incompatible with Zod 4, must be removed

**Solution:** Multi-phase rewrite

- **Phase 1:** Eliminate `makeSchemaResolver` and `CodeMeta` (architectural cleanup)
- **Phase 2:** Migrate to `ts-morph` for proper AST generation
- **Phase 3:** Remove all Zodios dependencies

**Timeline:** 20-28 hours over 2-3 weeks  
**Risk:** MEDIUM (mitigated by comprehensive testing first)  
**Benefit:** Zero type assertions, clean architecture, Zod 4 compatible

---

## **📋 PRE-REQUISITES (MUST BE GREEN)**

### **Quality Gate Status Check**

Before ANY work begins, verify:

```bash
cd /Users/jim/code/personal/openapi-zod-client/lib
pnpm format    # Must pass ✅
pnpm build     # Must pass ✅
pnpm type-check # Must pass ✅
pnpm test -- --run # Must pass ✅ (373 tests)
# pnpm lint - May have warnings (136 issues), but no NEW errors
```

**Current Status (Expected):**

- ✅ format: Passing
- ✅ build: Passing
- ✅ type-check: Passing (0 errors)
- ⚠️ lint: 136 issues (acceptable, will fix with rewrite)
- ✅ test: 373/373 passing

**If any quality gate fails:** STOP and fix before proceeding.

### **Dependency Prerequisites**

**Must Complete Before Starting:**

- ✅ **Task 2.1:** openapi3-ts updated to v4.5.0 (COMPLETE)
- ✅ **Task 2.4:** Zod updated to v4.1.12 (COMPLETE)
- ⏳ **Task 2.2:** @apidevtools/swagger-parser update to latest (IN PROGRESS)
  - **Critical:** Phase 1 relies on `SwaggerParser.bundle()` correctly resolving all operation-level `$ref`s
  - Must verify bundling behavior before starting rewrite

---

## **Tasks Superseded by This Plan**

The following tasks from `01-CURRENT-IMPLEMENTATION.md` are superseded by this rewrite:

- **Task 3.2 (Type Assertion Elimination):** ~35 remaining assertions eliminated by Phase 1 (resolver/CodeMeta removal) and Phase 2 (ts-morph migration)
- **Task 2.3 (Defer Logic Analysis):** Replaced by Phase 1 Task 1.1 (component-access.ts)

---

## **🔬 MANDATORY DEVELOPMENT METHODOLOGY**

### **Test-Driven Development (TDD) for Pure Functions**

**RULE:** All pure function development MUST follow strict TDD:

1. **Write Tests FIRST** — before touching implementation
2. **Run Tests** — verify they fail for the right reason
3. **Write Code** — minimal implementation to pass
4. **Refactor** — improve while keeping tests green
5. **Commit** — only when all tests pass

**Why TDD is Non-Negotiable:**

- **Pure functions** (no side effects, deterministic) are PERFECT for TDD
- **Type assertions** arise when we don't understand types — tests force understanding
- **Refactoring confidence** — can safely improve code with test safety net
- **Documentation** — tests ARE the behavior specification
- **Architectural honesty** — tests expose lies in return types

**TDD Applies To:**

✅ `topologicalSort.ts` — pure graph algorithm  
✅ `component-access.ts` — pure schema lookups  
✅ `openApiToTypescript.helpers.ts` — pure type conversion helpers  
✅ `openApiToZod.ts` — pure schema conversion  
✅ All helper functions in `utils/`

**TDD Does NOT Apply To:**

❌ CLI argument parsing (impure I/O)  
❌ File system operations (side effects)  
❌ Integration tests (already have comprehensive coverage)

**Example TDD Workflow:**

```bash
# 1. Write test FIRST
vim lib/src/myPureFunction.test.ts

# 2. Verify it fails
pnpm test -- --run myPureFunction  # Should FAIL (red)

# 3. Implement minimal code
vim lib/src/myPureFunction.ts

# 4. Verify it passes
pnpm test -- --run myPureFunction  # Should PASS (green)

# 5. Refactor if needed
# ... improve code structure ...

# 6. Verify still passes
pnpm test -- --run myPureFunction  # Should STILL PASS (green)
```

---

## **🧪 PHASE 0: COMPREHENSIVE PUBLIC API TEST SUITE** ⭐ CRITICAL

**Timeline:** 8-12 hours  
**Priority:** P0 - MUST complete before any changes  
**Status:** Pending

### **Objective**

Create a comprehensive test suite that encodes **PUBLIC API behaviors** (not implementation details). These tests will:

1. Survive the architectural rewrite
2. Prove the rewrite maintains compatibility
3. Document the expected behaviors for fresh context

### **Test Categories**

#### **0.1: End-to-End Generation Tests** (4 hours)

Test the FULL pipeline: OpenAPI → Generated Code

```typescript
// File: lib/src/e2e-generation.test.ts

describe('E2E: Full Generation Pipeline', () => {
  describe('Basic OpenAPI 3.0 Specs', () => {
    it('should generate valid TypeScript from minimal spec', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                200: {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const bundled = await SwaggerParser.bundle(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      // Test generated code characteristics (not exact output)
      expect(result).toContain('import { z }');
      expect(result).toContain('export const'); // Has exports
      expect(result).not.toContain('as unknown as'); // NO type assertions
      expect(result).not.toContain(' as '); // NO casts (except 'as const')

      // Verify it's valid TypeScript (could be compiled)
      expect(() => new Function(result)).not.toThrow();
    });

    it('should handle schemas with $ref after bundling', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id'],
            },
          },
        },
        paths: {
          '/users': {
            get: {
              responses: {
                200: {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const bundled = await SwaggerParser.bundle(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      expect(result).toContain('User'); // Schema name preserved
      expect(result).not.toContain('as unknown as');
    });

    it('should handle requestBody with $ref', async () => {
      // Test request bodies are properly resolved
    });

    it('should handle responses with $ref', async () => {
      // Test responses are properly resolved
    });

    it('should handle parameters with $ref', async () => {
      // Test parameters are properly resolved
    });
  });

  describe('Complex OpenAPI Features', () => {
    it('should handle allOf composition', async () => {
      // Test schema composition
    });

    it('should handle oneOf unions', async () => {
      // Test union types
    });

    it('should handle circular references', async () => {
      // Test circular schema dependencies
    });

    it('should handle deeply nested schemas', async () => {
      // Test complex nesting
    });
  });

  describe('Template Options', () => {
    it('should generate default template correctly', async () => {
      // Test default template output
    });

    it('should generate schemas-only template', async () => {
      // Test schemas-only output
    });

    it('should generate schemas-with-metadata template', async () => {
      // Test metadata template
    });
  });
});
```

#### **0.2: Schema Dependency Resolution Tests** (2 hours)

Test schema ordering and dependency tracking:

```typescript
// File: lib/src/schema-dependencies.test.ts

describe('Schema Dependency Resolution', () => {
  it('should order schemas by dependencies', () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          Address: { type: 'object', properties: { street: { type: 'string' } } },
          User: {
            type: 'object',
            properties: {
              address: { $ref: '#/components/schemas/Address' },
            },
          },
          Company: {
            type: 'object',
            properties: {
              owner: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
      paths: {},
    };

    const context = getZodClientTemplateContext(spec);
    const schemaOrder = Object.keys(context.schemas);

    // Address must come before User, User before Company
    expect(schemaOrder.indexOf('Address')).toBeLessThan(schemaOrder.indexOf('User'));
    expect(schemaOrder.indexOf('User')).toBeLessThan(schemaOrder.indexOf('Company'));
  });

  it('should handle circular dependencies', () => {
    // Test circular schema references
  });

  it('should handle self-referencing schemas', () => {
    // Test recursive schemas
  });
});
```

#### **0.3: Type Safety Guarantees Tests** (2 hours)

Test that generated code is type-safe:

```typescript
// File: lib/src/type-safety.test.ts

describe('Type Safety Guarantees', () => {
  it('should generate code with zero type assertions', async () => {
    const specs = [
      // Collection of real-world OpenAPI specs
      './tests/petstore.yaml',
      './samples/v3.0/petstore-expanded.yaml',
      // Add more
    ];

    for (const specPath of specs) {
      const bundled = await SwaggerParser.bundle(specPath);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      // Must not contain type assertions (except 'as const')
      const assertionPattern = / as (?!const\b)/g;
      const matches = result.match(assertionPattern);

      expect(matches).toBeNull(`Found type assertions in ${specPath}: ${matches}`);
    }
  });

  it('should generate compilable TypeScript', async () => {
    // Use ts-node or similar to verify compilation
  });
});
```

#### **0.4: SwaggerParser.bundle() Guarantee Tests** (2 hours)

Test our assumption that bundle() resolves all refs:

```typescript
// File: lib/src/swagger-parser-guarantees.test.ts

describe('SwaggerParser.bundle() Guarantees', () => {
  it('should resolve all operation-level $refs', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        requestBodies: {
          UserBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { name: { type: 'string' } } },
              },
            },
          },
        },
        responses: {
          UserResponse: {
            description: 'User response',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { id: { type: 'string' } } },
              },
            },
          },
        },
        parameters: {
          UserId: {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        },
      },
      paths: {
        '/users/{userId}': {
          post: {
            parameters: [{ $ref: '#/components/parameters/UserId' }],
            requestBody: { $ref: '#/components/requestBodies/UserBody' },
            responses: {
              200: { $ref: '#/components/responses/UserResponse' },
            },
          },
        },
      },
    };

    const bundled = await SwaggerParser.bundle(spec);

    // After bundling, operation-level $refs should be resolved
    const operation = bundled.paths['/users/{userId}']?.post;
    expect(operation).toBeDefined();

    // Parameters should be resolved (not $ref)
    expect(operation.parameters?.[0]).not.toHaveProperty('$ref');
    expect(operation.parameters?.[0]).toHaveProperty('name', 'userId');

    // RequestBody should be resolved
    expect(operation.requestBody).not.toHaveProperty('$ref');
    expect(operation.requestBody).toHaveProperty('content');

    // Response should be resolved
    expect(operation.responses?.['200']).not.toHaveProperty('$ref');
    expect(operation.responses?.['200']).toHaveProperty('description');
  });

  it('components.schemas CAN still have $refs (for dependency tracking)', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          Address: { type: 'object' },
          User: {
            type: 'object',
            properties: {
              address: { $ref: '#/components/schemas/Address' },
            },
          },
        },
      },
      paths: {},
    };

    const bundled = await SwaggerParser.bundle(spec);

    // Component schemas preserve $refs for dependency tracking
    const userSchema = bundled.components?.schemas?.['User'];
    expect(userSchema).toBeDefined();
    // This $ref might be preserved (for topological sorting)
  });
});
```

#### **0.5: Regression Prevention Tests** (2 hours)

Use existing snapshot tests + add regression guards:

```typescript
// File: lib/src/regression-prevention.test.ts

describe('Regression Prevention', () => {
  const specs = [
    './tests/petstore.yaml',
    './samples/v3.0/petstore-expanded.yaml',
    './samples/v3.0/uspto.yaml',
    // All existing test specs
  ];

  for (const specPath of specs) {
    it(`should generate consistent output for ${specPath}`, async () => {
      const bundled = await SwaggerParser.bundle(specPath);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      // Snapshot the generated code
      expect(result).toMatchSnapshot();

      // Also check invariants
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as');
    });
  }
});
```

### **0.6: Test Metrics & Validation**

**Target Coverage:**

- E2E tests: 20+ scenarios
- Dependency resolution: 10+ scenarios
- Type safety: 5+ real-world specs
- SwaggerParser guarantees: 8+ scenarios
- Regression: All existing specs (6+ files)

**Total New Tests:** ~50-60 comprehensive tests  
**Validation:** All tests must pass before Phase 1 begins

---

## **🏗️ PHASE 1: ELIMINATE RESOLVER & CODEMETA**

**Timeline:** 8-12 hours  
**Priority:** P0  
**Dependencies:** Phase 0 complete, all tests passing

### **1.1: Design Type-Safe Component Access** (2 hours)

**Problem:** `ComponentsObject` has everything as `T | ReferenceObject`, but after `SwaggerParser.bundle()`, operation-level properties should have NO `ReferenceObject`s.

**Solution:** Type-safe helpers with clear guarantees

```typescript
// File: lib/src/component-access.ts

import type {
  OpenAPIObject,
  ComponentsObject,
  SchemaObject,
  ReferenceObject,
} from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

/**
 * DESIGN PRINCIPLE:
 * After SwaggerParser.bundle(), operation-level properties (requestBody, parameters, responses)
 * should NEVER be ReferenceObjects. Only component definitions can have refs (for dependency tracking).
 */

/**
 * Type-safe access to component schemas
 * Used ONLY for dependency resolution and schema ordering
 */
export function getSchemaFromComponents(
  doc: OpenAPIObject,
  name: string,
): SchemaObject | ReferenceObject {
  const schema = doc.components?.schemas?.[name];
  if (!schema) {
    throw new Error(`Schema '${name}' not found in components.schemas`);
  }
  return schema;
}

/**
 * Resolve a schema reference to its definition
 * Handles $refs within component schemas (for dependency tracking)
 */
export function resolveSchemaRef(
  doc: OpenAPIObject,
  schema: SchemaObject | ReferenceObject,
): SchemaObject {
  if (!isReferenceObject(schema)) {
    return schema;
  }

  // Parse #/components/schemas/Name
  const match = schema.$ref.match(/^#\/components\/schemas\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid schema $ref: ${schema.$ref}`);
  }

  const resolved = getSchemaFromComponents(doc, match[1]);

  // After SwaggerParser.bundle(), nested refs shouldn't exist in components
  // But if they do, it's an error
  if (isReferenceObject(resolved)) {
    throw new Error(
      `Nested $ref in schema: ${schema.$ref} -> ${resolved.$ref}. ` +
        `Use SwaggerParser.bundle() to fully dereference the spec.`,
    );
  }

  return resolved;
}

/**
 * Type guard: After bundle(), these should never be ReferenceObjects
 * If they are, it indicates SwaggerParser didn't fully bundle
 */
export function assertNotReference<T>(
  value: T | ReferenceObject,
  context: string,
): asserts value is T {
  if (isReferenceObject(value)) {
    throw new Error(
      `Unexpected $ref in ${context}: ${value.$ref}. ` +
        `Ensure you called SwaggerParser.bundle() before code generation.`,
    );
  }
}
```

**Key Design Decisions:**

1. **Explicit about guarantees:** Comments document when refs should/shouldn't exist
2. **Fail-fast:** Throw clear errors if assumptions violated
3. **Type assertions eliminated:** Use `asserts` type guard instead
4. **Single responsibility:** Each function has ONE job

### **1.2: Modernize topologicalSort.ts** (45 minutes)

**Status:** ✅ COMPLETE  
**Priority:** P1 (Code quality, prep for dependency graph update)  
**Completed:** October 26, 2025

**Objective:** Rewrite `topologicalSort.ts` in modern TypeScript with comprehensive documentation using TDD.

**Current Issues:**

- No type annotations on parameters
- Missing comprehensive TSDoc
- Performance issue: `.includes()` is O(n) - should use Set
- Unclear algorithm purpose/behavior
- Tests exist but embedded in `getOpenApiDependencyGraph.test.ts` (integration tests)
- No dedicated unit test file for the pure function

**⚠️ MANDATORY TDD APPROACH:**

This is a **pure function** — perfect for Test-Driven Development!

**STEP 1: Extract & Verify Existing Tests** (10 min)

Current test coverage (in `getOpenApiDependencyGraph.test.ts`):

- ✅ Linear dependencies (petstore.yaml)
- ✅ Complex nested dependencies
- ✅ Circular/recursive dependencies
- ✅ Mixed recursive + basic schemas

Action required:

```bash
# Create dedicated unit test file
touch lib/src/topologicalSort.test.ts

# Run existing integration tests to establish baseline
pnpm test -- --run getOpenApiDependencyGraph
```

**STEP 2: Write Unit Tests BEFORE Refactoring** (15 min)

Create `lib/src/topologicalSort.test.ts` with:

```typescript
import { describe, it, expect } from 'vitest';
import { topologicalSort } from './topologicalSort.js';

describe('topologicalSort', () => {
  describe('basic cases', () => {
    it('should handle empty graph', () => {
      const result = topologicalSort({});
      expect(result).toEqual([]);
    });

    it('should handle single node with no dependencies', () => {
      const result = topologicalSort({ A: new Set() });
      expect(result).toEqual(['A']);
    });

    it('should handle linear dependency chain', () => {
      const graph = {
        A: new Set(),
        B: new Set(['A']),
        C: new Set(['B']),
      };
      const result = topologicalSort(graph);
      expect(result).toEqual(['A', 'B', 'C']);
    });
  });

  describe('circular dependencies', () => {
    it('should handle self-referential node', () => {
      const graph = { A: new Set(['A']) };
      const result = topologicalSort(graph);
      expect(result).toEqual(['A']);
    });

    it('should handle circular dependency between two nodes', () => {
      const graph = {
        A: new Set(['B']),
        B: new Set(['A']),
      };
      const result = topologicalSort(graph);
      // Should not throw, order may vary
      expect(result).toHaveLength(2);
      expect(result).toContain('A');
      expect(result).toContain('B');
    });
  });

  describe('multiple branches', () => {
    it('should handle disconnected components', () => {
      const graph = {
        A: new Set(),
        B: new Set(),
        C: new Set(),
      };
      const result = topologicalSort(graph);
      expect(result.sort()).toEqual(['A', 'B', 'C']);
    });
  });

  describe('performance characteristics', () => {
    it('should handle large graphs efficiently', () => {
      const graph: Record<string, Set<string>> = {};
      for (let i = 0; i < 1000; i++) {
        graph[`Node${i}`] = i > 0 ? new Set([`Node${i - 1}`]) : new Set();
      }

      const start = performance.now();
      const result = topologicalSort(graph);
      const duration = performance.now() - start;

      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(100); // Should be fast with O(1) lookups
    });
  });
});
```

**STEP 3: Verify ALL Tests Pass** (5 min)

```bash
# Run new unit tests
pnpm test -- --run topologicalSort

# Run integration tests (should still pass)
pnpm test -- --run getOpenApiDependencyGraph

# Full suite
pnpm test -- --run
```

**STEP 4: Refactor Implementation** (10 min)

Only NOW refactor the code while keeping tests green.

**STEP 5: Verify Performance Improvement** (5 min)

Run performance test to confirm O(n) → O(1) improvement.

**Implementation:**

````typescript
// File: lib/src/topologicalSort.ts

/**
 * Performs topological sorting on a directed acyclic graph (DAG).
 *
 * @description
 * Topological sorting is a linear ordering of vertices in a directed graph such that
 * for every directed edge (u → v), vertex u comes before v in the ordering.
 *
 * This implementation uses Depth-First Search (DFS) to traverse the dependency graph
 * and produces an order where dependencies appear before dependents.
 *
 * **Circular Dependency Handling:**
 * Unlike strict topological sort implementations, this function handles circular
 * dependencies gracefully by detecting cycles during traversal and skipping them
 * rather than throwing errors. This allows schemas with circular references to be
 * processed without failures.
 *
 * @param graph - Adjacency map where keys are node names and values are Sets of
 *                their direct dependencies. Each key depends on the nodes in its Set.
 *
 * @returns Array of node names in topological order (dependencies before dependents).
 *          Nodes with no dependencies appear first, nodes that depend on them follow.
 *
 * @example
 * Basic usage with linear dependencies
 * ```typescript
 * const graph = {
 *   User: new Set(['Address']),
 *   Company: new Set(['User']),
 *   Address: new Set()
 * };
 * const sorted = topologicalSort(graph);
 * console.log(sorted); // ['Address', 'User', 'Company']
 * ```
 *
 * @example
 * Handling circular dependencies
 * ```typescript
 * const graph = {
 *   User: new Set(['Post']),
 *   Post: new Set(['Comment']),
 *   Comment: new Set(['User']) // Circular reference
 * };
 * const sorted = topologicalSort(graph);
 * // Returns valid ordering, circular reference detected and handled
 * console.log(sorted); // e.g., ['User', 'Post', 'Comment'] or similar valid order
 * ```
 *
 * @example
 * Multiple independent branches
 * ```typescript
 * const graph = {
 *   A: new Set(['B']),
 *   B: new Set(),
 *   X: new Set(['Y']),
 *   Y: new Set()
 * };
 * const sorted = topologicalSort(graph);
 * // B before A, Y before X, but A/B and X/Y can be interleaved
 * console.log(sorted); // e.g., ['B', 'Y', 'A', 'X']
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Topological_sorting | Topological Sorting}
 * @see {@link https://gist.github.com/RubyTuesdayDONO/5006455 | Original algorithm inspiration}
 */
export function topologicalSort(graph: Record<string, Set<string>>): string[] {
  const sorted: string[] = [];
  const sortedSet = new Set<string>(); // O(1) lookup for deduplication
  const visited: Record<string, boolean> = {}; // Track visited nodes

  /**
   * Recursive DFS visitor function.
   *
   * @param name - Current node being visited
   * @param ancestors - Array of ancestor nodes in current path (for cycle detection)
   */
  function visit(name: string, ancestors: string[]): void {
    // Ensure ancestors is an array (defensive programming from original)
    if (!Array.isArray(ancestors)) {
      ancestors = [];
    }

    ancestors.push(name);
    visited[name] = true;

    // Visit all dependencies of current node
    const dependencies = graph[name];
    if (dependencies) {
      dependencies.forEach((dep) => {
        // Cycle detection: if dependency is in ancestor path, skip it
        if (ancestors.includes(dep)) {
          return;
        }

        // Skip already visited nodes
        if (visited[dep]) {
          return;
        }

        // Recursively visit dependency with updated ancestor path
        visit(dep, [...ancestors]); // Spread creates new array to avoid mutation
      });
    }

    // Add node to sorted list after all its dependencies are processed
    // Use Set for O(1) lookup instead of O(n) .includes()
    if (!sortedSet.has(name)) {
      sorted.push(name);
      sortedSet.add(name);
    }
  }

  // Visit all nodes in the graph
  Object.keys(graph).forEach((name) => visit(name, []));

  return sorted;
}
````

**Key Improvements:**

1. **Full TypeScript types:**
   - Function signature: `(graph: Record<string, Set<string>>): string[]`
   - Internal function: proper parameter types with `: void` return

2. **Comprehensive TSDoc:**
   - Description of algorithm and purpose
   - Explains circular dependency handling strategy
   - Three realistic `@example` blocks with different scenarios
   - Links to Wikipedia and original source
   - Detailed parameter and return descriptions

3. **Performance optimization:**
   - Changed from `.includes()` (O(n)) to `sortedSet.has()` (O(1))
   - Estimated 10-100x faster for large graphs

4. **Code clarity:**
   - Added inline comments explaining key steps
   - Descriptive variable names
   - Clear DFS structure

5. **Modern style:**
   - Proper arrow functions
   - Spread operator for array copying
   - Consistent formatting

**Validation:**

```bash
# Run existing tests (should all pass)
pnpm test -- --run topologicalSort

# Type check
pnpm type-check

# Verify documentation renders correctly
# (TSDoc viewer or IDE tooltip inspection)
```

**Time Estimate:** 20 minutes (most of it is documentation)

---

### **1.3: Update Dependency Graph** (1 hour)

```typescript
// Update: lib/src/getOpenApiDependencyGraph.ts

import { getSchemaFromComponents, resolveSchemaRef } from './component-access.js';

export const getOpenApiDependencyGraph = (
  schemaNames: string[], // Changed from refs to names
  doc: OpenAPIObject, // Pass doc instead of getter function
) => {
  // ... implementation using getSchemaFromComponents and resolveSchemaRef
};
```

### **1.4: Eliminate CodeMeta Usage** (2 hours)

**Replace CodeMeta with direct type usage:**

```typescript
// BEFORE (with CodeMeta):
const codeMeta = new CodeMeta(schema, ctx);
const code = codeMeta.assign(generatedCode);
return code.toString();

// AFTER (direct):
const code = generateCodeForSchema(schema, doc);
return code;
```

**Update all files:**

- `openApiToZod.ts` - Remove CodeMeta instantiation
- `openApiToTypescript.ts` - Remove CodeMeta usage
- `template-context.ts` - Remove CodeMeta dependency

### **1.5: Simplify ConversionTypeContext** (1 hour)

```typescript
// BEFORE:
export type ConversionTypeContext = {
  resolver: DocumentResolver; // DELETE
  zodSchemaByName: Record<string, string>;
  schemaByName: Record<string, string>;
  schemasByName?: Record<string, string[]>;
};

// AFTER:
export type ConversionContext = {
  doc: OpenAPIObject; // Pass the doc directly
  zodSchemaByName: Record<string, string>;
  schemaByName: Record<string, string>;
  schemasByName?: Record<string, string[]>;
};
```

### **1.6: Update All Call Sites** (3-4 hours)

**Files to update (~24 locations):**

- `zodiosEndpoint.operation.helpers.ts` (9 calls)
- `zodiosEndpoint.path.helpers.ts` (2 calls)
- `openApiToZod.ts` (4 calls)
- `openApiToTypescript.ts` (1 call)
- `openApiToTypescript.helpers.ts` (1 call)
- `zodiosEndpoint.helpers.ts` (1 call)
- Test files (6 calls)

**Pattern for each update:**

```typescript
// BEFORE:
const resolved = ctx.resolver.getSchemaByRef(operation.requestBody.$ref);
requestBody = resolved as unknown as RequestBodyObject;

// AFTER:
// After SwaggerParser.bundle(), requestBody should never be a $ref
assertNotReference(operation.requestBody, 'operation.requestBody');
const requestBody = operation.requestBody;
```

### **1.7: Delete Old Files** (15 min)

```bash
rm lib/src/makeSchemaResolver.ts
rm lib/src/makeSchemaResolver.test.ts
rm lib/src/CodeMeta.ts
rm lib/src/CodeMeta.test.ts
```

### **1.8: Validation** (1 hour)

```bash
# All quality gates must pass
pnpm format
pnpm build
pnpm type-check  # Should show FEWER errors (assertions gone!)
pnpm test -- --run  # All 373+ tests must pass

# NEW: Run comprehensive test suite from Phase 0
pnpm test -- --run e2e-generation.test.ts
pnpm test -- --run schema-dependencies.test.ts
pnpm test -- --run type-safety.test.ts
pnpm test -- --run swagger-parser-guarantees.test.ts
pnpm test -- --run regression-prevention.test.ts

# Count remaining type assertions (should be dramatically reduced)
cd lib/src
grep -r " as " --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Target: <10 (down from ~41)
```

### **Phase 1 Success Criteria:**

- ✅ All quality gates green
- ✅ All Phase 0 tests passing
- ✅ makeSchemaResolver.ts deleted
- ✅ CodeMeta.ts deleted
- ✅ ~20 type assertions eliminated
- ✅ No new type errors introduced
- ✅ Generated code unchanged (snapshot tests prove it)

---

## **🔄 PHASE 2: MIGRATE TO TS-MORPH**

**Timeline:** 6-8 hours  
**Scope:** Replaces tanu only, NOT Handlebars  
**Note:** Handlebars replacement deferred to future phase (see Task 1.7 evaluation in 01-CURRENT-IMPLEMENTATION.md)
**Rationale:** Clean separation - ts-morph generates TypeScript type strings, Handlebars assembles templates
**Priority:** P1  
**Dependencies:** Phase 1 complete and validated

### **2.1: Research & Design** (2 hours)

**Investigate ts-morph API:**

```typescript
import { Project, VariableDeclarationKind } from 'ts-morph';

// Create example to understand API
const project = new Project();
const sourceFile = project.createSourceFile('test.ts');

// How to create:
// - Type aliases
// - Interfaces
// - Union types
// - Intersection types
// - Object literals
// - etc.
```

**Design document:** `.agent/analysis/TS_MORPH_MIGRATION_DESIGN.md`

### **2.2: Implement ts-morph Adapter** (4 hours)

**Create:** `lib/src/ast-builder.ts`

```typescript
import { Project, SourceFile, VariableDeclarationKind } from 'ts-morph';
import type { SchemaObject } from 'openapi3-ts/oas31';

export class AstBuilder {
  private project: Project;
  private sourceFile: SourceFile;

  constructor() {
    this.project = new Project();
    this.sourceFile = this.project.createSourceFile('generated.ts', '', { overwrite: true });
  }

  addImport(moduleSpecifier: string, namedImports: string[]): void {
    this.sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports,
    });
  }

  addTypeAlias(name: string, type: string): void {
    this.sourceFile.addTypeAlias({
      name,
      type,
      isExported: true,
    });
  }

  // ... more builder methods

  toString(): string {
    return this.sourceFile.getFullText();
  }
}
```

### **2.3: Rewrite openApiToTypescript.ts** (4 hours)

Replace tanu usage with ts-morph:

```typescript
// BEFORE (with tanu):
import { t, ts } from 'tanu';

function handleOneOf(schemas) {
  const types = schemas.map(convertSchema);
  return t.union(types as t.TypeDefinition[]); // Type assertion!
}

// AFTER (with ts-morph):
import { AstBuilder } from './ast-builder.js';

function handleOneOf(schemas: SchemaObject[], builder: AstBuilder) {
  const types = schemas.map((s) => schemaToTypeString(s));
  return types.join(' | '); // Just string manipulation, ts-morph handles AST
}
```

### **2.4: Update Tests** (2 hours)

Update tests that depend on internal AST structure.

### **2.5: Validation** (1 hour)

Same validation as Phase 1.

### **Phase 2 Success Criteria:**

- ✅ tanu dependency removed
- ✅ ts-morph working correctly
- ✅ ALL remaining type assertions eliminated
- ✅ All tests passing
- ✅ Generated code quality same or better

---

## **🗑️ PHASE 3: REMOVE ZODIOS DEPENDENCIES**

**Timeline:** 4-6 hours  
**Priority:** P2  
**Dependencies:** Phase 2 complete  
**Note:** Zod v4 (Task 2.4) already complete - `@zodios/core` incompatibility was a blocker that's now resolved

### **3.1: Remove @zodios/core** (2 hours)

- Delete zodios imports
- Update template-context types
- Remove zodios-specific template code

### **3.2: Update Templates** (2 hours)

- Focus on `schemas-with-metadata` template
- Remove zodios from default template (or deprecate)

### **3.3: Validation** (1 hour)

Final validation suite.

---

## **📊 ROLLBACK PLAN**

**Each phase is independently committable:**

```bash
# If Phase 1 fails:
git reset --hard HEAD~1
git clean -fd

# If Phase 2 fails:
git reset --hard <phase-1-commit>

# etc.
```

**Protection:**

- Each phase is a separate branch
- All tests must pass before merging
- Keep main branch stable

---

## **✅ DEFINITION OF DONE**

**For entire rewrite to be considered complete:**

1. ✅ All 373+ existing tests passing
2. ✅ All 50+ new Phase 0 tests passing
3. ✅ Zero type assertions (except `as const`)
4. ✅ Zero lint errors (down from 136)
5. ✅ makeSchemaResolver.ts deleted
6. ✅ CodeMeta.ts deleted
7. ✅ tanu dependency removed
8. ✅ @zodios/core dependency removed
9. ✅ Generated code quality validated (snapshot tests)
10. ✅ Documentation updated (README, ADRs, RULES.md)

---

## **🎯 NEXT ACTIONS**

**You should now:**

1. ✅ Review and approve this plan
2. Start with **Phase 0: Comprehensive Test Suite**
3. Work in phases, validating after each

**Estimated timeline:**

- Phase 0: 8-12 hours (critical foundation)
- Phase 1: 8-12 hours (major cleanup)
- Phase 2: 12-16 hours (ts-morph migration)
- Phase 3: 4-6 hours (zodios removal)
- **Total: 32-46 hours over 2-3 weeks**

---

**This plan provides a safe, validated path to eliminate all architectural flaws while maintaining full compatibility.**
