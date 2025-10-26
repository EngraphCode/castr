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

## 🏗️ PHASE 1: ELIMINATE RESOLVER & CODEMETA

**Timeline:** 8-12 hours  
**Priority:** P0  
**Dependencies:** Phase 0 complete, all tests passing

### Overview

Replace `makeSchemaResolver` (which lies about types) and `CodeMeta` (poorly conceived abstraction) with honest, type-safe component access functions that leverage `SwaggerParser.bundle()`.

### Task Breakdown

#### 1.1: Design Type-Safe Component Access (2 hours)

**Problem:** `ComponentsObject` has everything as `T | ReferenceObject`, but after `SwaggerParser.bundle()`, operation-level properties should have NO `ReferenceObject`s.

**Solution:** Type-safe helpers with clear guarantees

**Create:** `lib/src/component-access.ts`

```typescript
import type {
  OpenAPIObject,
  ComponentsObject,
  SchemaObject,
  ReferenceObject,
} from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

/**
 * DESIGN PRINCIPLE:
 * After SwaggerParser.bundle(), operation-level properties (requestBody, parameters, responses)
 * should NEVER be ReferenceObjects. Only component definitions can have refs (for dependency tracking).
 */

/**
 * Type-safe access to component schemas.
 * Used ONLY for dependency resolution and schema ordering.
 *
 * @param doc - OpenAPI document
 * @param name - Schema name
 * @returns Schema or ReferenceObject (for dependency tracking)
 * @throws {Error} If schema not found
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
 * Resolve a schema reference to its definition.
 * Handles $refs within component schemas (for dependency tracking).
 *
 * @param doc - OpenAPI document
 * @param schema - Schema or reference
 * @returns Resolved schema
 * @throws {Error} If ref is invalid or nested
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
  if (isReferenceObject(resolved)) {
    throw new Error(
      `Nested $ref in schema: ${schema.$ref} -> ${resolved.$ref}. ` +
        `Use SwaggerParser.bundle() to fully dereference the spec.`,
    );
  }

  return resolved;
}

/**
 * Type guard: After bundle(), operation-level properties should never be ReferenceObjects.
 * If they are, it indicates SwaggerParser didn't fully bundle.
 *
 * @param value - Value to check
 * @param context - Context for error message
 * @throws {Error} If value is a ReferenceObject
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

1. **Explicit about guarantees** - Comments document when refs should/shouldn't exist
2. **Fail-fast** - Throw clear errors if assumptions violated
3. **Type assertions eliminated** - Use `asserts` type guard
4. **Single responsibility** - Each function has ONE job

**Tests:** Write comprehensive tests FIRST (TDD)

---

#### 1.2: Update Dependency Graph (1 hour)

**Update:** `lib/src/getOpenApiDependencyGraph.ts`

```typescript
import { getSchemaFromComponents, resolveSchemaRef } from './component-access.js';

export const getOpenApiDependencyGraph = (
  schemaNames: string[], // Changed from refs to names
  doc: OpenAPIObject, // Pass doc instead of getter function
) => {
  // Implementation using getSchemaFromComponents and resolveSchemaRef
  // ...
};
```

**Changes:**

- Remove dependency on `makeSchemaResolver`
- Pass OpenAPIObject directly
- Use new component-access functions

**Tests:** Verify all existing dependency graph tests pass

---

#### 1.3: Eliminate CodeMeta Usage (2 hours)

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

**Tests:** All existing tests should pass without changes

---

#### 1.4: Simplify ConversionTypeContext (1 hour)

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

**Tests:** Type-check should pass, all tests should pass

---

#### 1.5: Update All Call Sites (3-4 hours)

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

**Tests:** All 373+ tests should still pass after each file update

---

#### 1.6: Delete Old Files (15 min)

```bash
rm lib/src/makeSchemaResolver.ts
rm lib/src/makeSchemaResolver.test.ts
rm lib/src/CodeMeta.ts
rm lib/src/CodeMeta.test.ts
```

**Tests:** All tests should still pass

---

#### 1.7: Validation (1 hour)

```bash
# All quality gates must pass
pnpm format
pnpm build
pnpm type-check  # Should show FEWER errors (assertions gone!)
pnpm test -- --run  # All 373+ tests + 50 Phase 0 tests pass

# Count remaining type assertions (should be dramatically reduced)
cd lib/src
grep -r " as " --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Target: <10 (down from ~41)
```

**Success Criteria:**

- ✅ All quality gates green
- ✅ All Phase 0 tests passing
- ✅ All existing tests passing
- ✅ `makeSchemaResolver.ts` deleted
- ✅ `CodeMeta.ts` deleted
- ✅ ~20-30 type assertions eliminated
- ✅ No new type errors
- ✅ Generated code unchanged (snapshot tests prove it)

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
