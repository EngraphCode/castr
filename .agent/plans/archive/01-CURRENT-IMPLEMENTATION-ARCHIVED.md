# Current Implementation Plan: Architecture Rewrite

**Date:** October 26, 2025  
**Phase:** 2 - Architecture Rewrite  
**Status:** Ready to Execute  
**Estimated Duration:** 26-38 hours over 2-3 weeks

---

## Overview

This document contains the **complete Architecture Rewrite plan** for Phase 2.

**What happened:** During Phase 2 pre-work, we discovered fundamental architectural flaws that cannot be fixed incrementally. A comprehensive rewrite is required.

**Superseded Tasks:**

- Task 3.2 (Type Assertion Elimination) → Architecture Rewrite Phases 1 & 2
- Task 2.3 (Defer Logic Analysis) → Architecture Rewrite Phase 1

**For Completed Work:** See `COMPLETED_WORK.md` (comprehensive archive of all Phase 1 and Phase 2 pre-work)

**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run` must pass after every task.

---

## Requirements Alignment

**See:** `.agent/plans/requirements.md` (Requirements 1, 2, 3, 7, 8)

This Architecture Rewrite directly supports:

- **Req 1:** Maintains and improves Zod schema generation from OpenAPI
- **Req 2-3:** Ensures high-quality SDK generation with validation helpers
- **Req 7:** Eliminates type assertions, enforces fail-fast with honest types
- **Req 8:** TDD-driven rewrite, behavior completely defined by tests (50-60 new tests in Phase 0)

---

## 🎯 MANDATORY: Test-Driven Development (TDD)

**ALL implementation tasks MUST follow TDD workflow:**

1. **✍️ Write failing test(s) FIRST** - Before any implementation code
2. **🔴 Run tests - confirm FAILURE** - Proves tests validate behavior
3. **✅ Write minimal implementation** - Only enough to pass tests
4. **🟢 Run tests - confirm SUCCESS** - Validates implementation works
5. **♻️ Refactor if needed** - Clean up with test protection
6. **🔁 Repeat** - For each piece of functionality

**This is non-negotiable.** See `.agent/RULES.md` for detailed TDD guidelines.

---

## 🎯 Executive Summary

### Problem

The current architecture has fundamental flaws:

1. **`makeSchemaResolver` lies about types** - Claims to return `SchemaObject`, actually returns any component type
2. **`CodeMeta` is poorly conceived** - No clear value, will be obsolete with ts-morph
3. **Not leveraging `SwaggerParser.bundle()`** - Already resolves all operation-level `$ref`s
4. **tanu usage unclear** - May be misused or insufficient for our needs
5. **@zodios/core Zod 4 incompatibility** - Must be removed eventually

### Solution

Multi-phase comprehensive rewrite:

- **Phase 0:** Comprehensive Public API Test Suite (8-12 hours) ⭐ **CRITICAL**
- **Phase 1:** Eliminate `makeSchemaResolver` and `CodeMeta` (8-12 hours)
- **Phase 2:** Migrate to `ts-morph` for proper AST generation (6-8 hours)
- **Phase 3:** Remove all Zodios dependencies (4-6 hours)

### Benefits

- **Zero type assertions** (down from 74)
- **Clean architecture** (no lying types)
- **Zod 4 compatible** (ready for extraction)
- **Better maintainability** (honest types, clear responsibilities)

### Timeline

**Total:** 26-38 hours over 2-3 weeks  
**Risk:** MEDIUM (mitigated by comprehensive Phase 0 test suite)

---

## 📋 Prerequisites (MUST BE GREEN)

### Quality Gate Status Check

Before ANY work begins, verify:

```bash
cd /Users/jim/code/personal/openapi-zod-client/lib
pnpm format      # Must pass ✅
pnpm build       # Must pass ✅
pnpm type-check  # Must pass ✅
pnpm test -- --run  # Must pass ✅ (373 tests)
# pnpm lint - May have warnings (136 issues), acceptable
```

**Expected Status:**

- ✅ format: Passing
- ✅ build: Passing
- ✅ type-check: Passing (0 errors)
- ⚠️ lint: 136 issues (tracked, will improve with rewrite)
- ✅ test: 373/373 passing

**If any quality gate fails:** STOP and fix before proceeding.

### Dependency Prerequisites

**All Complete:**

- ✅ **Task 2.1:** openapi3-ts updated to v4.5.0
- ✅ **Task 2.4:** Zod updated to v4.1.12
- ✅ **Task 2.2:** swagger-parser verified at latest v12.1.0
  - **Critical insight:** `SwaggerParser.bundle()` resolves all operation-level `$ref`s
  - This enables Phase 1 to eliminate `makeSchemaResolver`

---

## 📊 Current Progress (October 27, 2025)

### ✅ Completed Tasks (4-5 hours)

**Task 1.0: E2E Test Matrix** ✅ COMPLETE (30 min)

- Created `lib/src/characterisation/programmatic-usage.char.test.ts`
- 12 comprehensive scenarios (8 P0, 4 P1)
- Final: 12/12 passing (all scenarios)
- Defines acceptance criteria for Phase 1

**Task 1.1: Component Access via TDD** ✅ COMPLETE (30 min)

- Created `lib/src/component-access.ts` (164 lines)
- **Perfect TDD execution:** 19/19 tests passing on first implementation
- **Zero type assertions** in implementation
- Functions: `getSchemaFromComponents`, `resolveSchemaRef`, `assertNotReference`
- Unit tests: 246/246 passing (up from 227/227)
- Type-check: Now PASSING (was failing before)

**Task 1.2: Dereferencing Strategy** ✅ COMPLETE (15 min)

- **Key discovery:** CLI uses `SwaggerParser.bundle()` NOT `dereference()`!
- `bundle()` resolves external refs but preserves internal refs
- Component schemas retain `$refs` for semantic naming
- Explains why first Phase 1 attempt failed

**Task 1.3: Fix Template Export Format + Type Safety** ✅ COMPLETE (2-3 hours)

- **Templates fixed:** Modified 4 Handlebars templates to generate `export const SchemaName` pattern
  - `default.hbs`, `schemas-only.hbs`, `schemas-with-metadata.hbs`, `grouped.hbs`
  - Removed grouped `export const schemas = { ... }` pattern
- **E2E tests fixed:** Added `shouldExportAllSchemas: true` for specs without endpoints
- **Unit tests updated:** `schemas-with-metadata.test.ts` expectations updated
- **Type safety added:** Created honest type helpers for E2E tests
  - `assertIsString()` - Type guard for return value union
  - `dereferenceSpec()` - Honest type boundary handler for `openapi-types` ↔ `openapi3-ts`
- **Result:** Comprehensive fixes, no deferred issues

**Current Quality Gates Status:**

```
✅ format:      PASSING
✅ build:       PASSING
✅ type-check:  PASSING (0 errors)
✅ unit tests:  246/246 PASSING
✅ char tests:  100/100 PASSING (includes 12/12 E2E)
✅ e2e tests:   12/12 PASSING (perfect baseline!)
```

### ⏳ Current Task

**Task 1.4: Update Template Context** (2-3 hours) - **IN PROGRESS (95% complete)**

**Completed:**

- ✅ Removed all resolver uses from production code (11 files refactored)
  - `template-context.ts`: Removed 10 resolver uses
  - `getOpenApiDependencyGraph.ts`: Now accepts `OpenAPIObject`
  - `getZodiosEndpointDefinitionList.ts`: No longer creates resolver
  - `CodeMeta.ts`: Updated `codeString` getter
  - `ConversionTypeContext`: Changed from `resolver` to `doc`
  - `TsConversionContext`: Changed from `resolver` to `doc`
  - `zodiosEndpoint.helpers.ts`: Updated to use `doc`
  - `openApiToTypescript.helpers.ts`: Updated to use `doc`
  - `openApiToTypescript.ts`: Updated `patchRequiredSchemaInLoop` call
  - `openApiToZod.ts`: 7 resolver uses replaced with `doc`
  - `inferRequiredOnly.ts`: Updated `patchRequiredSchemaInLoop` signature

**Expanded Scope:** Initial estimate missed interconnected dependencies

- Original: "Update template-context.ts only"
- Actual: Full context type refactoring across 11 files
- Reason: `ConversionTypeContext` and `TsConversionContext` used everywhere
- Time: ~3-4 hours (vs 2-3 estimated)

**Remaining:**

- 🔧 Fix 4 snapshot test files (20-30 min)
  - `deps-graph-with-additionalProperties.test.ts`
  - `getOpenApiDependencyGraph.test.ts`
  - `openApiToTypescript.test.ts`
  - `openApiToZod.test.ts`
  - `recursive-schema.test.ts`
- ✅ Run quality gates
- ✅ Update todos

**Next:** Tasks 1.5-1.9 (~6-8 hours remaining)

---

## 🔬 Development Methodology

### Test-Driven Development for Pure Functions

**RULE:** All pure function development MUST follow strict TDD:

1. **Write Tests FIRST** - Before touching implementation
2. **Run Tests** - Verify they fail for the right reason
3. **Write Code** - Minimal implementation to pass
4. **Refactor** - Improve while keeping tests green
5. **Commit** - Only when all tests pass

**Why TDD is Non-Negotiable:**

- **Pure functions** are deterministic - perfect for TDD
- **Type assertions** arise when we don't understand types - tests force understanding
- **Refactoring confidence** - test safety net enables safe changes
- **Documentation** - tests ARE the behavior specification
- **Architectural honesty** - tests expose lies in return types

**TDD Applies To:**

✅ `topologicalSort.ts` - pure graph algorithm  
✅ `component-access.ts` - pure schema lookups  
✅ `openApiToTypescript.helpers.ts` - pure type conversion  
✅ `openApiToZod.ts` - pure schema conversion  
✅ All helper functions in `utils/`

**TDD Does NOT Apply To:**

❌ CLI argument parsing (impure I/O)  
❌ File system operations (side effects)  
❌ Integration tests (already comprehensive)

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

##🧪 PHASE 0: COMPREHENSIVE PUBLIC API TEST SUITE ⭐ CRITICAL

Superseded by .agent/plans/PHASE-0-COMPLETE.md

**Timeline:** 8-12 hours  
**Priority:** P0 - MUST complete before any changes  
**Status:** Pending

### Objective

Create a comprehensive test suite that encodes **PUBLIC API behaviors** (not implementation details).

These tests will:

1. **Survive the architectural rewrite** - Test behavior, not implementation
2. **Prove compatibility** - Validate rewrite maintains all functionality
3. **Document expected behavior** - Tests as living documentation

### Test Categories

#### 0.1: End-to-End Generation Tests (4 hours)

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

#### 0.2: Schema Dependency Resolution Tests (2 hours)

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

#### 0.3: Type Safety Guarantees Tests (2 hours)

Test that generated code is type-safe:

```typescript
// File: lib/src/type-safety.test.ts

describe('Type Safety Guarantees', () => {
  it('should generate code with zero type assertions', async () => {
    const specs = [
      './tests/petstore.yaml',
      './samples/v3.0/petstore-expanded.yaml',
      // Add more real-world specs
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
    // Verify generated code compiles
  });
});
```

#### 0.4: SwaggerParser.bundle() Guarantee Tests (2 hours)

Test our assumption that bundle() resolves all operation-level refs:

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

#### 0.5: Regression Prevention Tests (2 hours)

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

### Test Metrics & Validation

**Target Coverage:**

- E2E tests: 20+ scenarios
- Dependency resolution: 10+ scenarios
- Type safety: 5+ real-world specs
- SwaggerParser guarantees: 8+ scenarios
- Regression: All existing specs (6+ files)

**Total New Tests:** ~50-60 comprehensive tests  
**Validation:** All tests must pass before Phase 1 begins

### Success Criteria

- ✅ All 50-60 new tests passing
- ✅ All 373 existing tests still passing
- ✅ Tests encode PUBLIC API behavior
- ✅ Tests do NOT test implementation details
- ✅ Regression tests snapshot all existing specs
- ✅ Zero test brittleness (can refactor without breaking tests)

---

## 🏗️ PHASE 1: ELIMINATE RESOLVER & CODEMETA (REVISED)

**Timeline:** 14-19 hours (12.5-17.5 hours remaining)  
**Priority:** P0  
**Dependencies:** Phase 0 complete, all tests passing  
**Status:** In Progress - Tasks 1.0-1.2 complete, Task 1.3 (template fix) starting  
**Progress:** 1.5 hours completed, ~75 minutes per task average  
**Comprehensive Approach:** Fix ALL issues (templates + resolver), no deferred work  
**Last Revision:** October 26, 2025 - Task order revised for comprehensive fixes

### What Changed from Original Plan

**Original approach (FAILED):**

- Added internal `SwaggerParser.dereference()` call in `generateZodClientFromOpenAPI`
- Used `assertNotReference` everywhere to eliminate refs
- Result: 40 failing characterisation tests, loss of semantic information for named schemas

**Root cause analysis:**

- Internal dereferencing removed `$ref`s needed for component schema naming
- `assertNotReference` was too aggressive - some refs are GOOD (component schemas)
- Didn't distinguish between operation-level refs (should be dereferenced) vs component refs (should be preserved)
- Missing e2e tests for actual usage scenarios (CLI vs programmatic)

**Revised approach (THIS PLAN):**

1. **E2E tests FIRST** - Define acceptance criteria for all usage scenarios
2. **No internal dereferencing** - Let callers control it (CLI does, programmers choose)
3. **Preserve component schema $refs** - Critical for named type extraction
4. **Use ComponentsObject properly** - Import from `openapi3-ts/oas30`, don't create ad-hoc
5. **Handle both dereferenced AND non-dereferenced specs** - Be flexible
6. **Unit tests via TDD** - Build incrementally with test coverage

### Overview

Replace `makeSchemaResolver` (which lies about types) and `CodeMeta` (poorly conceived abstraction) with honest, type-safe component access functions.

**CRITICAL LEARNINGS from first attempt:**

1. CLI already calls `SwaggerParser.dereference()` internally (see `lib/src/cli.ts`)
2. Programmatic usage may or may not dereference - we must handle both
3. Component schema `$ref`s must be preserved for named type extraction
4. Operation-level `$ref`s are resolved by dereference() but may exist in raw specs
5. E2E tests define WHAT (acceptance criteria), unit tests define HOW (TDD)
6. `assertNotReference` should be used sparingly - only where refs are truly impossible

### Detailed Implementation Plan

**See:** `.agent/plans/PHASE-1-DETAILED-PLAN.md` for complete step-by-step instructions with:

- Acceptance criteria for each task
- Detailed implementation steps
- Validation strategy at each step
- Strategic reconsideration points
- Exit criteria and decision points

### Task Breakdown

#### 1.0: Create E2E Test Matrix (2-3 hours) ⭐ COMPLETE

**Purpose:** Define acceptance criteria BEFORE implementation

**Create:** `lib/src/characterisation/programmatic-usage.char.test.ts`

Write 12 scenarios covering:

- Programmatic usage with internal refs only (no dereference)
- Programmatic usage after caller dereferences
- CLI usage (auto-dereferenced)
- Operation-level refs (parameters, requestBody, responses)
- Edge cases (special characters, circular refs)
- Template variations

**See:** `.agent/analysis/E2E-TEST-MATRIX.md` for complete test specifications

**Run against Phase 0 baseline:**

```bash
pnpm character
```

**Acceptance:** Document which scenarios pass/fail (establish baseline)

**Tests:** These ARE the tests - they define what success looks like

---

#### 1.1: Create Component Access with Unit Tests (3-4 hours) ⭐ COMPLETE

**Follow STRICT TDD:** Red -> Green -> Refactor ✅ **PERFECTLY EXECUTED**

**Given:** `lib/src/component-access.test.ts` (already exists, 19 tests, 402 lines)

**Task:** Create minimal `lib/src/component-access.ts` to pass tests

**TDD Workflow:**

1. Run tests (RED): `pnpm test -- --run component-access.test.ts`
2. Implement ONE function at a time
3. Run tests after each function (GREEN)
4. Refactor if needed
5. Repeat

**Key Functions to Implement:**

```typescript
import type {
  OpenAPIObject,
  ComponentsObject,
  SchemaObject,
  ReferenceObject,
} from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

/**
 * Get a schema from components.schemas by name.
 * Preserves $ref if present (for dependency tracking).
 */
export function getSchemaFromComponents(
  doc: OpenAPIObject,
  name: string,
): SchemaObject | ReferenceObject;

/**
 * Resolve a schema $ref to its definition.
 * Used for dependency graph building.
 */
export function resolveSchemaRef(
  doc: OpenAPIObject,
  schema: SchemaObject | ReferenceObject,
): SchemaObject;

/**
 * Extract schema name from a $ref string.
 * Example: '#/components/schemas/User' -> 'User'
 */
export function getSchemaNameFromRef(ref: string): string;

/**
 * Type guard: Assert value is not a ReferenceObject.
 * Use ONLY where refs should be impossible (after proper dereferencing).
 */
export function assertNotReference<T>(
  value: T | ReferenceObject,
  context: string,
): asserts value is T;
```

**Key Design Principles:**

1. **Use ComponentsObject types** - Import from `openapi3-ts/oas30`, don't create ad-hoc
2. **Preserve refs in components.schemas** - Critical for named type extraction
3. **Handle both dereferenced and non-dereferenced specs** - Be flexible
4. **Fail-fast with helpful errors** - Clear messages about what went wrong
5. **Zero type assertions** - Use proper type guards

**Tests:** Already written (19 tests) - just make them pass!

---

#### 1.2: Understand Current Dereferencing Strategy (1 hour) ⭐ COMPLETE

**Task:** Investigate HOW and WHERE dereferencing happens in current code ✅ **KEY INSIGHTS DISCOVERED**

**Files to examine:**

- `lib/src/cli.ts` - Does CLI dereference? (YES, it does)
- `lib/src/generateZodClientFromOpenAPI.ts` - Does this dereference?
- Where does `makeSchemaResolver` get used?
- What does `makeSchemaResolver` actually do?

**Document findings:**

- When are specs dereferenced?
- What refs remain after dereferencing?
- How does current code handle component schema refs?

**Output:** Update `.agent/analysis/E2E-TEST-MATRIX.md` with findings

---

#### 1.4: Update Template Context to Use ComponentsObject (2-3 hours)

**Update:** `lib/src/template-context.ts`

**Changes:**

1. Accept `doc: OpenAPIObject` instead of resolver
2. Use `doc.components?.schemas` directly (it's already typed as `ComponentsObject`)
3. Use `component-access` functions where needed
4. Remove `makeSchemaResolver` dependency

**Pattern:**

```typescript
// BEFORE:
const schema = ctx.resolver.getSchemaByRef('#/components/schemas/User');

// AFTER:
const schema = getSchemaFromComponents(doc, 'User');
```

**Run tests after each change:**

```bash
pnpm test -- --run template-context
pnpm test -- --run schemas-with-metadata
```

---

#### 1.5: Update Dependency Graph (1-2 hours)

**Update:** `lib/src/getOpenApiDependencyGraph.ts`

**Changes:**

1. Remove `makeSchemaResolver` dependency
2. Accept `doc: OpenAPIObject` directly
3. Use `component-access` functions

**Tests:** Existing dependency graph tests should pass

---

#### 1.6: Update OpenAPIToZod (2 hours)

**Update:** `lib/src/openApiToZod.ts`

**Changes:**

1. Replace `ctx.resolver` with `ctx.doc`
2. Use `component-access` functions
3. Handle both dereferenced and non-dereferenced schemas
4. Remove CodeMeta usage if present

**Tests:** Run after each change

```bash
pnpm test -- --run openApiToZod
```

---

#### 1.7: Update Zodios Helpers (2-3 hours)

**Update these files ONE AT A TIME:**

- `lib/src/zodiosEndpoint.helpers.ts`
- `lib/src/zodiosEndpoint.operation.helpers.ts`
- `lib/src/zodiosEndpoint.path.helpers.ts`

**Strategy:**

- DON'T use `assertNotReference` everywhere
- Instead, handle both cases: `if (isReferenceObject(x)) { resolve it } else { use it }`
- This supports both dereferenced and non-dereferenced specs

**Tests:** Run full test suite after EACH file:

```bash
pnpm test -- --run
pnpm character
```

---

#### 1.8: Delete makeSchemaResolver (15 min)

```bash
rm lib/src/makeSchemaResolver.ts
rm lib/src/makeSchemaResolver.test.ts
```

**Only do this AFTER all files stop using it!**

**Tests:** Unit tests will drop to 227/227 (removing 19 resolver tests)

---

#### 1.9: Run Full Validation (1 hour)

**Run ALL quality gates:**

```bash
# 1. Format
pnpm format

# 2. Build
pnpm build

# 3. Type check
pnpm type-check  # Should pass (no errors)

# 4. Unit tests
cd lib && pnpm test -- --run
# Should show 227/227 tests passing (after deleting resolver tests)

# 5. Characterisation tests
cd .. && pnpm character
# Should show 100/100 passing (88 original + 12 E2E)
```

**Verify type assertion reduction:**

```bash
cd lib/src
grep -r " as " --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Target: <20 (down from 41 in production code)
```

**Success Criteria:**

- ✅ All quality gates green
- ✅ 227 unit tests passing (246 - 19 resolver tests after deletion)
- ✅ 100/100 characterisation tests passing (88 original + 12 E2E)
- ✅ **12/12 E2E scenarios passing** ✅ ACHIEVED
- ✅ Templates generate `export const SchemaName` pattern ✅ ACHIEVED
- ✅ `makeSchemaResolver.ts` deleted
- ✅ `makeSchemaResolver.test.ts` deleted
- ✅ Zero type assertions in `component-access.ts` ✅ ACHIEVED
- ✅ ~20-30 type assertions eliminated overall
- ✅ Using `ComponentsObject` types properly ✅ ACHIEVED
- ✅ NO internal dereferencing added ✅ MAINTAINED
- ✅ Supports both dereferenced and non-dereferenced specs ✅ ACHIEVED

---

## 🔄 PHASE 2: MIGRATE TO TS-MORPH

**Timeline:** 6-8 hours  
**Scope:** Replaces tanu only, NOT Handlebars  
**Priority:** P1  
**Dependencies:** Phase 1 complete and validated

**Note:** Handlebars replacement deferred to future phase  
**Rationale:** Clean separation - ts-morph generates TypeScript type strings, Handlebars assembles templates

### Task Breakdown

#### 2.1: Research & Design (2 hours)

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
// etc.
```

**Document:** `.agent/analysis/TS_MORPH_MIGRATION_DESIGN.md`

**Output:**

- API capabilities documented
- Migration strategy defined
- Code examples for common patterns

---

#### 2.2: Implement ts-morph Adapter (4 hours)

**Create:** `lib/src/ast-builder.ts`

```typescript
import { Project, SourceFile, VariableDeclarationKind } from 'ts-morph';
import type { SchemaObject } from 'openapi3-ts/oas30';

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

**Tests:** Write tests FIRST for each builder method

---

#### 2.3: Rewrite openApiToTypescript.ts (4 hours)

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

**Tests:** All existing tests should pass, no type assertions

---

#### 2.4: Update Tests (2 hours)

Update tests that depend on internal AST structure.

**Tests:** All tests should pass

---

#### 2.5: Validation (1 hour)

```bash
# All quality gates must pass
pnpm format
pnpm build
pnpm type-check  # Should show ZERO errors
pnpm test -- --run  # All tests pass

# Count remaining type assertions (should be ZERO except 'as const')
cd lib/src
grep -r " as " --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Target: 0
```

**Success Criteria:**

- ✅ tanu dependency removed
- ✅ ts-morph working correctly
- ✅ ALL remaining type assertions eliminated
- ✅ All tests passing
- ✅ Generated code quality same or better

---

## 🗑️ PHASE 3: REMOVE ZODIOS DEPENDENCIES

**Timeline:** 4-6 hours  
**Priority:** P2  
**Dependencies:** Phase 2 complete

### Task Breakdown

#### 3.1: Remove @zodios/core (2 hours)

- Delete zodios imports
- Update template-context types
- Remove zodios-specific template code

**Tests:** All tests should pass

---

#### 3.2: Update Templates (2 hours)

- Focus on `schemas-with-metadata` template (already Zodios-free)
- Remove zodios from default template (or deprecate it)

**Tests:** Template tests should pass

---

#### 3.3: Validation (1 hour)

Final validation suite:

```bash
pnpm format
pnpm build
pnpm type-check
pnpm test -- --run
pnpm lint  # Should show improvement
```

**Success Criteria:**

- ✅ @zodios/core removed from package.json
- ✅ No zodios imports remain
- ✅ All tests passing
- ✅ All quality gates green

---

## 📊 Rollback Plan

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

## ✅ Definition of Done

**For entire rewrite to be considered complete:**

1. ✅ All 373+ existing tests passing
2. ✅ All 50+ new Phase 0 tests passing
3. ✅ Zero type assertions (except `as const`)
4. ✅ Zero lint errors (down from 136)
5. ✅ `makeSchemaResolver.ts` deleted
6. ✅ `CodeMeta.ts` deleted
7. ✅ tanu dependency removed
8. ✅ @zodios/core dependency removed
9. ✅ Generated code quality validated (snapshot tests)
10. ✅ Documentation updated (README, ADRs, RULES.md)

---

## 🎯 Next Actions

**You should now:**

1. Review and approve this plan
2. Start with **Phase 0: Comprehensive Test Suite**
3. Work in phases, validating after each

**Estimated timeline:**

- Phase 0: 8-12 hours (critical foundation)
- Phase 1: 8-12 hours (major cleanup)
- Phase 2: 6-8 hours (ts-morph migration)
- Phase 3: 4-6 hours (zodios removal)
- **Total: 26-38 hours over 2-3 weeks**

---

## Post-Rewrite Tasks

After Architecture Rewrite complete:

1. **Task 5.1:** Full quality gate validation
2. **Phase 3:** Quality & Testing improvements (see `03-FURTHER-ENHANCEMENTS.md`)
3. **Optional Phase 2B:** MCP Enhancements (see `02-MCP-ENHANCEMENTS.md`)

---

**This plan provides a safe, validated path to eliminate all architectural flaws while maintaining full compatibility.**

**For Historical Reference:** See `COMPLETED_WORK.md` for all Phase 1 and Phase 2 pre-work details
