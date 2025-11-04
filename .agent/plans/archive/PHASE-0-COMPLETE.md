# Phase 0: Complete System Definition & Preparation

**Date:** October 26, 2025  
**Status:** IN PROGRESS - Characterisation tests complete, critical gaps remain  
**Estimated Time Remaining:** 4-6 hours

---

## Philosophy: Right Tool for Each Job

| Concern           | Correct Tool          | Wrong Tool         |
| ----------------- | --------------------- | ------------------ |
| **Behavior**      | Tests                 | Manual inspection  |
| **Type Safety**   | TypeScript compiler   | Tests              |
| **Code Quality**  | Linter                | Tests              |
| **API Contracts** | Tests + Type-check    | Documentation only |
| **Regression**    | Tests (snapshots)     | Hope               |
| **Architecture**  | Documentation + Tests | Tribal knowledge   |

---

## Current Status: What's Complete ✅

### 1. Characterisation Tests (77 tests) ✅

**Files:**

- `generation.char.test.ts` (15 tests) - Full generation pipeline
- `schema-dependencies.char.test.ts` (10 tests) - Dependency resolution
- `options.char.test.ts` (20 tests) - Configuration options
- `cli.char.test.ts` (11 tests) - CLI behavior (truly exercises system!)
- `error-handling.char.test.ts` (10 tests) - Error scenarios
- `edge-cases.char.test.ts` (11 tests) - Unusual inputs

**Quality:** ✅ All tests follow principles (behavior not implementation)

### 2. Snapshot Tests (152 tests) ✅

**Location:** `tests-snapshot/`  
**Coverage:** All existing test specs  
**Status:** ✅ All passing, 0 skipped

### 3. Unit Tests (227 tests) ✅

**Coverage:** Pure functions, helpers  
**Status:** ✅ All passing

### 4. Quality Gates ✅

- ✅ Build: Passing (5 successful builds)
- ✅ Type Check: Passing (0 errors)
- ✅ Format: Passing
- ⚠️ Lint: 125 issues (stable, pre-existing)

**Total Test Suite:** 456 tests, 0 skipped, 0 failed

---

## Critical Gaps: What's Missing ❌

### 1. ❌ Bundled Spec Assumptions Tests

**Why Critical:** Phase 1 depends on our code working correctly with bundled specs and being able to access operation properties directly

**Impact:** Without these tests, Phase 1 is built on unvalidated assumptions about OUR CODE's behavior

**Status:** MISSING - must be added

### 2. ❌ Comprehensive Regression Coverage

**Why Critical:** Need systematic validation across ALL real-world specs

**Impact:** Could miss breaking changes during rewrite

**Status:** Snapshot tests exist but not systematically validated for Phase 0

### 3. ⚠️ Type Assertion Lint Rule Not Enforced

**Why Critical:** Goal is ZERO assertions - should be enforced by tooling, not tests

**Impact:** Could accidentally introduce assertions during rewrite

**Status:** Lint rule exists but not blocking (warnings only)

### 4. ❌ Architecture Documentation Incomplete

**Why Critical:** Need complete understanding before rewriting

**Impact:** Could discover assumptions mid-rewrite

**Status:** No comprehensive architecture document

### 5. ❌ Baseline Metrics Not Established

**Why Critical:** Need "before" snapshot to measure improvement

**Impact:** Can't quantify success of rewrite

**Status:** No metrics document

---

## Phase 0 COMPLETE Plan: 6 Categories

### Category 1: Behavioral Validation (Tests)

**Status:** ✅ Mostly complete, 1 critical gap

#### 1.1: ✅ Characterisation Tests (Complete)

- 77 tests validating public API behavior
- All test principles followed
- CLI tests truly exercise system

#### 1.2: ❌ Bundled Spec Assumptions (CRITICAL - ADD THIS)

**Purpose:** Validate that OUR CODE's assumptions about bundled specs are correct

**File:** `lib/src/characterisation/bundled-spec-assumptions.char.test.ts`

**What We're Testing:**

- NOT testing SwaggerParser.bundle() itself (that's their job)
- Testing that OUR ASSUMPTIONS about what bundle() provides are correct
- Testing that OUR CODE works correctly with bundled output

**Tests Required:**

```typescript
import { describe, it, expect } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';

/**
 * CRITICAL: These tests validate OUR CODE's assumptions about bundled specs.
 *
 * Phase 1 eliminates makeSchemaResolver based on the assumption that after
 * bundling, operation-level $refs are resolved, so we can access them directly.
 *
 * These tests prove:
 * 1. Our assumption about bundled structure is correct
 * 2. Our code works correctly with bundled specs
 * 3. We can safely eliminate the resolver in Phase 1
 *
 * If these tests fail, Phase 1 plan must be revised.
 */
describe('Bundled Spec Assumptions - Our Code Integration', () => {
  describe('Assumption: Operation-Level $refs Are Resolved After Bundling', () => {
    it('should resolve $ref in parameters', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
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
            get: {
              operationId: 'getUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const bundled = await SwaggerParser.bundle(spec as any);
      const operation = bundled.paths?.['/users/{userId}']?.get as OperationObject;

      // CRITICAL: After bundle(), parameters should NOT be $refs
      expect(operation.parameters).toBeDefined();
      expect(operation.parameters?.[0]).toBeDefined();
      expect(isReferenceObject(operation.parameters![0])).toBe(false);
      expect(operation.parameters![0]).toHaveProperty('name', 'userId');
    });

    it('should resolve $ref in requestBody', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          requestBodies: {
            UserBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              requestBody: { $ref: '#/components/requestBodies/UserBody' },
              responses: {
                '201': { description: 'Created' },
              },
            },
          },
        },
      };

      const bundled = await SwaggerParser.bundle(spec as any);
      const operation = bundled.paths?.['/users']?.post as OperationObject;

      // CRITICAL: After bundle(), requestBody should NOT be a $ref
      expect(operation.requestBody).toBeDefined();
      expect(isReferenceObject(operation.requestBody!)).toBe(false);
      expect(operation.requestBody).toHaveProperty('content');
    });

    it('should resolve $ref in responses', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          responses: {
            UserResponse: {
              description: 'User response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { id: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': { $ref: '#/components/responses/UserResponse' },
              },
            },
          },
        },
      };

      const bundled = await SwaggerParser.bundle(spec as any);
      const operation = bundled.paths?.['/users']?.get as OperationObject;

      // CRITICAL: After bundle(), responses should NOT be $refs
      expect(operation.responses?.['200']).toBeDefined();
      expect(isReferenceObject(operation.responses!['200'])).toBe(false);
      expect(operation.responses!['200']).toHaveProperty('description');
    });

    it('should resolve multiple levels of operation $refs', async () => {
      // Test nested refs in parameters, requestBody, responses
    });

    it('should resolve $refs across multiple operations', async () => {
      // Test bundle() works consistently across all paths
    });
  });

  describe('Component Schemas Preserve $refs', () => {
    it('should keep $refs in component schemas for dependency tracking', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Address: {
              type: 'object',
              properties: { street: { type: 'string' } },
            },
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

      const bundled = await SwaggerParser.bundle(spec as any);

      // Component schemas SHOULD preserve $refs (for topological sorting)
      const userSchema = bundled.components?.schemas?.['User'];
      expect(userSchema).toBeDefined();

      // The $ref might still exist in properties.address
      // (This is GOOD - we need it for dependency resolution)
    });

    it('should handle allOf/oneOf/anyOf with $refs in schemas', async () => {
      // Test composition patterns preserve refs
    });
  });

  describe('Our Code Works with Bundled Specs', () => {
    it('should generate code from bundled petstore without resolver', async () => {
      // Bundle the spec (using SwaggerParser as intended)
      const bundled = await SwaggerParser.bundle('./tests-snapshot/petstore.yaml');

      // Prove our code works with bundled output
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      // Validate our code produced expected output
      expect(result).toBeDefined();
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as'); // No type assertions needed!

      // Prove bundled structure allows direct access
      const operations = Object.values(bundled.paths || {}).flatMap((pathItem) =>
        Object.values(pathItem || {}).filter(
          (v): v is OperationObject => typeof v === 'object' && v !== null && 'responses' in v,
        ),
      );

      expect(operations.length).toBeGreaterThan(0);

      // Our assumption: after bundling, we can access these directly (no $refs)
      for (const operation of operations) {
        if (operation.parameters) {
          for (const param of operation.parameters) {
            expect(isReferenceObject(param)).toBe(false);
          }
        }
        if (operation.requestBody) {
          expect(isReferenceObject(operation.requestBody)).toBe(false);
        }
      }
    });

    it('should generate code from all sample specs using bundled input', async () => {
      const specs = [
        './samples/v3.0/petstore.yaml',
        './samples/v3.0/petstore-expanded.yaml',
        './samples/v3.0/uspto.yaml',
      ];

      for (const specPath of specs) {
        const bundled = await SwaggerParser.bundle(specPath);

        // Prove OUR CODE works with bundled specs
        const result = await generateZodClientFromOpenAPI({
          openApiDoc: bundled as OpenAPIObject,
          disableWriteToFile: true,
        });

        expect(result).toBeDefined();
        expect(result).toContain('import { z }');
      }
    });

    it('should prove resolver is unnecessary with bundled specs', async () => {
      // This test proves Phase 1's assumption: after bundling,
      // we can access operation properties directly without a resolver

      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
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
            get: {
              operationId: 'getUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const bundled = await SwaggerParser.bundle(spec as any);

      // Prove we can access operation properties directly
      const operation = bundled.paths?.['/users/{userId}']?.get as OperationObject;
      const param = operation.parameters?.[0];

      // After bundling, this is NOT a reference - we can use it directly!
      expect(isReferenceObject(param)).toBe(false);
      expect(param).toHaveProperty('name', 'userId');

      // Prove our code generates successfully from this
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      expect(result).toBeDefined();
      expect(result).toContain('userId');
    });
  });
});
```

**Estimated Time:** 2 hours  
**Validation:** All tests must pass before Phase 1

#### 1.3: ⚠️ Systematic Regression Coverage (ENHANCE)

**Purpose:** Ensure ALL existing specs work correctly

**File:** `lib/src/characterisation/regression-all-specs.char.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { existsSync } from 'node:fs';
import { glob } from 'fast-glob';

/**
 * Systematic regression coverage: Validate generation succeeds for ALL specs
 * that snapshot tests cover.
 *
 * These tests ensure the rewrite doesn't break any existing functionality.
 */
describe('Regression: All Existing Specs', () => {
  // Find all YAML specs in tests-snapshot
  const specFiles = glob.sync('tests-snapshot/**/*.yaml');

  for (const specPath of specFiles) {
    it(`should generate valid output for ${specPath}`, async () => {
      // Verify file exists
      expect(existsSync(specPath)).toBe(true);

      // Bundle the spec
      const bundled = await SwaggerParser.bundle(specPath);
      expect(bundled).toBeDefined();

      // Generate code
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      // Validate basic structure
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      // Validate contains expected imports
      expect(result).toContain('import { z }');

      // Validate is valid JS syntax (basic check)
      expect(() => new Function(result)).not.toThrow();
    });
  }

  // Also test sample specs
  const sampleSpecs = glob.sync('samples/**/*.yaml');

  for (const specPath of sampleSpecs) {
    it(`should generate valid output for ${specPath}`, async () => {
      const bundled = await SwaggerParser.bundle(specPath);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled as OpenAPIObject,
        disableWriteToFile: true,
      });

      expect(result).toBeDefined();
      expect(result).toContain('import { z }');
    });
  }
});
```

**Estimated Time:** 1 hour  
**Validation:** All existing specs must generate successfully

---

### Category 2: Type Safety (Type-Check Configuration)

**Status:** ✅ Mostly complete, should enhance strictness

#### 2.1: ✅ TypeScript Configuration (Complete)

Current `tsconfig.json` already enforces strict type-checking:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

**Action:** ✅ No changes needed - already rigorous

#### 2.2: ✅ Type-Check in Quality Gate (Complete)

`pnpm type-check` runs on every commit  
**Status:** ✅ 0 errors currently

**Action:** ✅ No changes needed - working correctly

---

### Category 3: Code Quality (Linter Configuration)

**Status:** ⚠️ Needs enhancement - assertions should ERROR not WARN

#### 3.1: ⚠️ Enforce Zero Type Assertions (ENHANCE)

**Current State:**

```javascript
// eslint.config.ts
'@typescript-eslint/consistent-type-assertions': 'warn' // ⚠️ Only warns!
```

**Should Be:**

```javascript
'@typescript-eslint/consistent-type-assertions': [
  'error',  // ✅ Block commits with assertions
  {
    assertionStyle: 'never',  // No 'as' casts allowed
  },
]
```

**Action Required:**

1. Update `lib/eslint.config.ts`:

```typescript
export default [
  // ... existing config
  {
    rules: {
      // CRITICAL: Zero tolerance for type assertions
      '@typescript-eslint/consistent-type-assertions': [
        'error', // Changed from 'warn' to 'error'
        {
          assertionStyle: 'never',
        },
      ],

      // Allow 'as const' (it's safe)
      // This will need custom config or exception handling
    },
  },
];
```

2. Document exceptions for 'as const':

```typescript
// In files that legitimately need 'as const':
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const config = { ... } as const;
```

3. Establish baseline:

```bash
# Count current violations
pnpm lint 2>&1 | grep "consistent-type-assertions" | wc -l
# Document in PHASE-0-BASELINE.md
```

**Estimated Time:** 30 minutes  
**Validation:** After Phase 2, `pnpm lint` should have ZERO assertion errors

#### 3.2: ✅ Other Lint Rules (Already Configured)

Current lint rules are appropriate:

- `sonarjs` rules for complexity
- `@typescript-eslint` for type safety
- No changes needed

---

### Category 4: Architecture Documentation

**Status:** ❌ MISSING - Need comprehensive system documentation

#### 4.1: ❌ System Architecture Document (CREATE THIS)

**Purpose:** Complete understanding of current architecture before rewriting

**File:** `.agent/architecture/CURRENT-ARCHITECTURE.md`

**Required Sections:**

```markdown
# Current Architecture (Pre-Rewrite)

## High-Level Flow

[Diagram: OpenAPI Spec → Parser → Template Context → Template → Generated Code]

## Core Components

### 1. Entry Point: generateZodClientFromOpenAPI

- **Responsibility:** Main orchestration
- **Dependencies:** SwaggerParser, template-context
- **Type Safety:** Uses OpenAPIObject from openapi3-ts

### 2. SwaggerParser Integration

- **Responsibility:** Parse and bundle OpenAPI specs
- **Key Method:** SwaggerParser.bundle()
- **Guarantee:** Resolves operation-level $refs (validated by tests!)
- **Output:** Bundled OpenAPIObject

### 3. Template Context Generation

- **File:** template-context.ts
- **Responsibility:** Convert OpenAPI → template data
- **Dependencies:**
  - makeSchemaResolver (⚠️ TO BE ELIMINATED)
  - CodeMeta (⚠️ TO BE ELIMINATED)
  - getOpenApiDependencyGraph
  - openApiToZod
  - openApiToTypescript

### 4. Schema Resolution (CURRENT - FLAWED)

- **File:** makeSchemaResolver.ts
- **Problem:** Lies about return types
- **Claims:** Returns SchemaObject
- **Actually Returns:** Any component type + type assertions
- **Status:** ⚠️ TO BE ELIMINATED IN PHASE 1

### 5. CodeMeta (CURRENT - FLAWED)

- **File:** CodeMeta.ts
- **Problem:** Poorly conceived abstraction
- **Value:** Unclear - seems redundant
- **Status:** ⚠️ TO BE ELIMINATED IN PHASE 1

### 6. Dependency Graph

- **File:** getOpenApiDependencyGraph.ts
- **Responsibility:** Topological sorting of schemas
- **Algorithm:** Detects circular references, orders by dependencies
- **Status:** ✅ Keep - works correctly

### 7. Type Conversion

- **Files:**
  - openApiToZod.ts (OpenAPI → Zod schema strings)
  - openApiToTypescript.ts (OpenAPI → TypeScript type strings)
- **Current Tool:** tanu (TypeScript AST manipulation)
- **Status:** ⚠️ Migrate to ts-morph in Phase 2

### 8. Template Engine

- **Tool:** Handlebars
- **Templates:**
  - default.hbs (Zodios client)
  - schemas-only.hbs
  - schemas-with-metadata.hbs (Engraph-ready)
  - grouped.hbs variants
- **Status:** ✅ Keep for now, evaluate post-Phase 3

## Data Flow
```

OpenAPI Spec
↓
SwaggerParser.bundle()
↓
Bundled OpenAPIObject
↓
getZodClientTemplateContext()
├→ makeSchemaResolver.resolve() (⚠️ type assertions here)
├→ getOpenApiDependencyGraph() (✅ pure, works)
├→ openApiToZod() (⚠️ uses CodeMeta, assertions)
├→ openApiToTypescript() (⚠️ uses tanu, assertions)
└→ TemplateContext object
↓
Handlebars.compile(template)
↓
Generated TypeScript Code

```

## Type Assertions Breakdown

### Current Count: ~74 assertions

**By File:**
1. openApiToTypescript.helpers.ts: 22
2. openApiToTypescript.ts: 17
3. getZodiosEndpointDefinitionList.ts: 8
4. inferRequiredOnly.ts: 7
5. Others: 20

**Root Causes:**
1. makeSchemaResolver lies about types
2. tanu types not precise enough
3. Missing type guards
4. Workarounds for bundling issues

**Phase 1 Goal:** Eliminate ~30 assertions (resolver/CodeMeta)
**Phase 2 Goal:** Eliminate remaining ~44 (ts-morph migration)

## Dependencies

### Critical Dependencies
- `openapi3-ts@4.5.0` - OpenAPI type definitions
- `@apidevtools/swagger-parser@12.1.0` - Parsing & bundling
- `zod@4.1.12` - Schema validation runtime
- `handlebars@4.7.8` - Template engine

### To Be Replaced
- `tanu@0.2.0` → ts-morph (Phase 2)
- `@zodios/core@10.9.6` → Remove (Phase 3)

### Keep
- `lodash-es@4.17.21` - Utilities
- `commander@14.0.1` - CLI
- `ts-pattern@5.8.0` - Pattern matching
- `prettier@3.6.2` - Formatting

## Testing Architecture

### Test Types
1. **Unit Tests** (227 tests) - Pure functions
2. **Characterisation Tests** (77 tests) - Public API behavior
3. **Snapshot Tests** (152 tests) - Generated output validation

### Coverage by Component
- ✅ getOpenApiDependencyGraph: Full coverage
- ✅ topologicalSort: Full coverage
- ✅ Pure utilities: Full coverage
- ⚠️ makeSchemaResolver: Partial (will be deleted)
- ⚠️ CodeMeta: Partial (will be deleted)
- ⚠️ Template rendering: Snapshot-based

## Known Issues

### 1. Type Safety Issues
- 74 type assertions (target: 0)
- makeSchemaResolver lies about return types
- CodeMeta adds no value

### 2. Architecture Issues
- Not leveraging SwaggerParser.bundle() correctly
- Resolver is redundant post-bundling
- tanu usage unclear/insufficient

### 3. Dependency Issues
- @zodios/core incompatible with Zod 4
- tanu may not be needed with ts-morph

## Assumptions to Validate

### ✅ SwaggerParser.bundle() Behavior
**Assumption:** bundle() resolves all operation-level $refs
**Validation:** Tests in swagger-parser-guarantees.char.test.ts
**Status:** TO BE VALIDATED

### ✅ Schema Dependency Tracking
**Assumption:** component.schemas preserve $refs for ordering
**Validation:** Tests in schema-dependencies.char.test.ts
**Status:** ✅ VALIDATED (10 tests pass)

### ✅ Template Compatibility
**Assumption:** Templates work with new architecture
**Validation:** All existing tests pass
**Status:** ✅ VALIDATED (152 snapshot tests pass)
```

**Estimated Time:** 2 hours  
**Deliverable:** Complete architecture document

#### 4.2: ❌ Phase 1 Design Document (CREATE THIS)

**Purpose:** Detailed design for makeSchemaResolver/CodeMeta elimination

**File:** `.agent/architecture/PHASE-1-DESIGN.md`

**Required Content:**

- New component-access.ts API design
- Migration strategy for all call sites
- Type safety approach
- Rollback plan

**Estimated Time:** 1 hour  
**Deliverable:** Complete Phase 1 design

---

### Category 5: Baseline Metrics

**Status:** ❌ MISSING - Need quantifiable "before" snapshot

#### 5.1: ❌ Establish Baseline Metrics (CREATE THIS)

**Purpose:** Quantify current state, measure improvement post-rewrite

**File:** `.agent/metrics/PHASE-0-BASELINE.md`

````markdown
# Phase 0 Baseline Metrics

**Date:** October 26, 2025  
**Branch:** feat/rewrite  
**Commit:** [current commit hash]

## Code Metrics

### Lines of Code

```bash
# Source files (excluding tests, generated)
$ find lib/src -name "*.ts" ! -name "*.test.ts" ! -path "*/templates/*" | xargs wc -l
# Record total
```
````

### File Count

```bash
$ find lib/src -name "*.ts" ! -name "*.test.ts" | wc -l
# Source files: X
```

### Complexity Metrics

```bash
# Average function length
# Longest functions
# Most complex functions (cognitive complexity)
```

## Type Safety Metrics

### Type Assertions

```bash
$ grep -r " as " lib/src --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Current: ~41 in src/ (74 total including tests)
# Target: 0
```

### Type Errors

```bash
$ pnpm type-check
# Current: 0 errors ✅
# Target: 0 errors (maintain)
```

## Quality Metrics

### Lint Issues

```bash
$ pnpm lint 2>&1 | grep "problems"
# Current: 125 problems (124 errors, 1 warning)
# Target: <20 after rewrite
```

### Test Metrics

```bash
$ pnpm test -- --run --reporter=verbose
# Unit: 227 tests
# Characterisation: 77 tests
# Snapshot: 152 tests
# Total: 456 tests
# Pass rate: 100%
# Target: Maintain 100%, add more tests
```

## Build Metrics

### Build Time

```bash
$ time pnpm build
# Record: ESM build time, CJS build time, DTS build time
```

### Bundle Size

```bash
$ ls -lh lib/dist/*.{js,cjs}
# Record sizes
```

## Dependency Metrics

### Direct Dependencies

```bash
$ cat lib/package.json | jq '.dependencies | length'
# Current count
```

### To Be Removed

- tanu (Phase 2)
- @zodios/core (Phase 3)

## Component Metrics

### Files to Delete

- makeSchemaResolver.ts (~200 lines)
- CodeMeta.ts (~100 lines)
- Associated test files

### Files to Rewrite

- openApiToTypescript.ts (heavy tanu usage)
- openApiToTypescript.helpers.ts (many assertions)
- template-context.ts (uses resolver & CodeMeta)

## Success Criteria

### Phase 1 Success

- Type assertions: ~41 → ~15 (60% reduction)
- Files deleted: 4 (resolver, CodeMeta + tests)
- Tests passing: Maintain 456/456
- Type errors: Maintain 0

### Phase 2 Success

- Type assertions: ~15 → 0 (100% elimination)
- tanu dependency removed
- ts-morph added and working
- Tests passing: Maintain 456/456

### Phase 3 Success

- @zodios/core dependency removed
- Lint issues: 125 → <20
- Tests passing: Maintain 456/456
- All quality gates green

````

**Estimated Time:** 1 hour
**Deliverable:** Quantified baseline metrics

---

### Category 6: Tooling & Automation

**Status:** ✅ Mostly complete, minor enhancements

#### 6.1: ✅ Quality Gate Script (Complete)

Already have:
```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
````

**Action:** ✅ No changes needed

#### 6.2: ⚠️ Add Metrics Collection Script (OPTIONAL)

**Purpose:** Automate metrics collection for before/after comparison

**File:** `lib/scripts/collect-metrics.sh`

```bash
#!/bin/bash
# Collect code metrics for baseline/comparison

echo "=== Code Metrics ==="
echo "Source files:"
find lib/src -name "*.ts" ! -name "*.test.ts" ! -path "*/templates/*" | wc -l

echo "Type assertions:"
grep -r " as " lib/src --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l

echo "=== Quality Metrics ==="
pnpm lint 2>&1 | grep "problems"

echo "=== Test Metrics ==="
pnpm test -- --run 2>&1 | grep "Tests"
pnpm character 2>&1 | grep "Tests"
pnpm test:snapshot 2>&1 | grep "Tests"
```

**Estimated Time:** 15 minutes  
**Benefit:** Quick before/after comparison

---

## Phase 0 Complete: Checklist

### Tests (Behavioral Validation)

- [x] ✅ Core characterisation tests (77 tests)
- [ ] ❌ Bundled spec assumptions tests (CRITICAL)
- [ ] ⚠️ Systematic regression coverage (enhance)
- [x] ✅ Unit tests (227 tests)
- [x] ✅ Snapshot tests (152 tests)

### Type Safety (Type-Check)

- [x] ✅ Strict TypeScript configuration
- [x] ✅ Type-check in quality gate (0 errors)

### Code Quality (Linter)

- [ ] ⚠️ Type assertion rule: warn → error
- [x] ✅ Other lint rules configured

### Architecture (Documentation)

- [ ] ❌ System architecture document
- [ ] ❌ Phase 1 design document

### Metrics (Baseline)

- [ ] ❌ Baseline metrics established

### Tooling (Automation)

- [x] ✅ Quality gate script
- [ ] ⚠️ Metrics collection script (optional)

---

## Estimated Time to Complete

| Category                       | Time     | Status                       |
| ------------------------------ | -------- | ---------------------------- |
| Bundled spec assumptions tests | 2h       | ❌ Critical                  |
| Regression coverage            | 1h       | ⚠️ Enhancement               |
| Lint rule enforcement          | 0.5h     | ⚠️ Quick win                 |
| Architecture documentation     | 2h       | ❌ Important                 |
| Phase 1 design                 | 1h       | ❌ Important                 |
| Baseline metrics               | 1h       | ❌ Tracking                  |
| **TOTAL**                      | **7.5h** | **4-6h if we skip optional** |

---

## Recommendation: Priority Order

### Must Have (Complete Phase 0)

1. **Bundled spec assumptions tests** (2h) - CRITICAL
2. **Architecture documentation** (2h) - Essential understanding
3. **Lint rule enforcement** (0.5h) - Prevent backsliding
4. **Baseline metrics** (1h) - Measure success

**Total: 5.5 hours** → Phase 0 COMPLETE

### Nice to Have

5. Systematic regression coverage (1h)
6. Phase 1 design document (1h)
7. Metrics script (0.25h)

---

## Definition of Done: Phase 0

Phase 0 is COMPLETE when:

- [ ] ✅ All behavioral tests pass (including bundled spec assumptions)
- [ ] ✅ Type-check passes (0 errors)
- [ ] ✅ Lint configured to ERROR on type assertions
- [ ] ✅ Architecture fully documented
- [ ] ✅ Baseline metrics established
- [ ] ✅ All quality gates green
- [ ] ✅ Documentation reviewed and approved

**Then and only then** can Phase 1 begin with confidence.

---

## Success Criteria

**Phase 0 provides:**

1. ✅ Complete behavioral specification (tests)
2. ✅ Validated critical assumptions (our code works with bundled specs)
3. ✅ Complete architecture understanding (docs)
4. ✅ Quantified baseline (metrics)
5. ✅ Quality enforcement (lint rules)
6. ✅ Regression protection (all specs tested)

**Result:** Total definition of system, enabling confident rewrite.
