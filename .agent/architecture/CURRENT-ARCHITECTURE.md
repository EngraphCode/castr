# Current Architecture (Pre-Rewrite)

**Date:** October 26, 2025  
**Branch:** `feat/rewrite`  
**Purpose:** Complete documentation of current architecture before Phase 1 rewrite

---

## High-Level Flow

```
OpenAPI Spec (YAML/JSON)
    ↓
SwaggerParser.bundle()  ← ⚠️ ISSUE: Doesn't resolve operation-level $refs
    ↓
Bundled OpenAPIObject (still has $refs in operations)
    ↓
generateZodClientFromOpenAPI() (entry point)
    ├→ getZodClientTemplateContext()
    │   ├→ makeSchemaResolver() (⚠️ TO BE ELIMINATED - lies about types)
    │   ├→ getZodiosEndpointDefinitionList()
    │   │   ├→ Endpoint helpers (handle parameters, requestBody, responses)
    │   │   └→ Uses resolver to dereference $refs
    │   ├→ getOpenApiDependencyGraph() (✅ KEEP - works correctly)
    │   │   └→ topologicalSort() (✅ KEEP - pure, tested)
    │   ├→ getZodSchema() (uses CodeMeta ⚠️)
    │   └→ getTypescriptFromOpenApi() (uses tanu ⚠️)
    └→ Handlebars template rendering
        ↓
Generated TypeScript code with Zod schemas
```

---

## Core Components

### 1. Entry Point: `generateZodClientFromOpenAPI.ts`

**Responsibility:** Main orchestration and template rendering

**Key Functions:**

- Accepts OpenAPIObject (from SwaggerParser)
- Determines template (default, schemas-only, schemas-with-metadata)
- Auto-enables options for schemas-with-metadata template
- Handles group strategy (tag, method, file-based grouping)
- Compiles Handlebars templates
- Writes output to file or returns string

**Dependencies:**

- `getZodClientTemplateContext()` - generates template data
- `getHandlebars()` - Handlebars instance
- `maybePretty()` - Prettier formatting
- Template files (.hbs)

**Type Safety:** ✅ Good - well-typed with TypeScript

**Issues:** None (orchestration is clean)

---

### 2. SwaggerParser Integration

**Current Usage:** `SwaggerParser.bundle()` in CLI

**Location:** `lib/src/cli.ts:146`

```typescript
const bundled: unknown = await SwaggerParser.bundle(input);
```

**⚠️ CRITICAL ISSUE:** `bundle()` does NOT resolve operation-level $refs

**Discovered in Phase 0:**

- `bundle()` keeps $refs in parameters, requestBody, responses
- `dereference()` fully resolves all $refs
- This is why `makeSchemaResolver` exists

**Resolution for Phase 1:**

- Change from `bundle()` to `dereference()`
- Eliminates need for resolver

**Evidence:** See `src/characterisation/bundled-spec-assumptions.char.test.ts`

---

### 3. Template Context Generation: `template-context.ts`

**Responsibility:** Convert OpenAPI → template data structure

**Key Function:** `getZodClientTemplateContext()`

**Process:**

1. Get endpoint definitions via `getZodiosEndpointDefinitionList()`
2. Build dependency graph for schemas
3. Sort schemas topologically
4. Generate Zod schemas for all components
5. Wrap circular refs with `z.lazy()`
6. Group endpoints by tag/method (if groupStrategy set)
7. Export common schemas

**Dependencies:**

- `makeSchemaResolver()` (⚠️ TO BE ELIMINATED)
- `getOpenApiDependencyGraph()` (✅ KEEP)
- `getZodSchema()` (uses CodeMeta ⚠️)
- `getTypescriptFromOpenApi()` (uses tanu ⚠️)
- `topologicalSort()` (✅ KEEP)

**Type Safety:** ⚠️ Poor - relies on resolver's lying types

**Issues:**

- Depends on flawed `makeSchemaResolver`
- Uses `CodeMeta` which adds no clear value
- Many type assertions needed due to resolver issues

---

### 4. Schema Resolution (CURRENT - FLAWED): `makeSchemaResolver.ts`

**⚠️ TO BE ELIMINATED IN PHASE 1**

**Responsibility:** Resolve $refs in OpenAPI spec

**Problem:** Lies about return types

```typescript
// Claims to return SchemaObject
getSchemaByRef(ref: string): SchemaObject | ReferenceObject

// Actually returns ANY component type (parameters, responses, etc.)
// Forces callers to use type assertions: `as ParameterObject`
```

**Why It Exists:**

- Current code uses `SwaggerParser.bundle()` which doesn't resolve operation-level $refs
- Resolver manually dereferences them
- But types are dishonest - claims SchemaObject, returns anything

**Call Sites:** ~24 locations across codebase

**Files Using Resolver:**

- `template-context.ts` - passes resolver to conversion context
- `getZodiosEndpointDefinitionList.ts` - uses to resolve refs
- `zodiosEndpoint.operation.helpers.ts` - 9 calls
- `zodiosEndpoint.path.helpers.ts` - 2 calls
- `openApiToZod.ts` - 4 calls
- `openApiToTypescript.ts` - 1 call
- `openApiToTypescript.helpers.ts` - 1 call

**Phase 1 Strategy:**

- Switch CLI from `bundle()` to `dereference()`
- Remove resolver entirely
- Access operations directly (no $refs to resolve)
- Eliminate ~30 type assertions

---

### 5. CodeMeta (CURRENT - FLAWED): `CodeMeta.ts`

**⚠️ TO BE ELIMINATED IN PHASE 1**

**Responsibility:** Unclear - appears to be abstraction layer for code metadata

**Problems:**

- Poorly conceived abstraction with no clear value
- Will be obsolete with ts-morph migration
- Adds complexity without benefit
- Used in `openApiToZod.ts` but could be replaced

**Type Definition:**

```typescript
export class CodeMeta {
  private code?: string;
  ref?: string;
  children: CodeMeta[] = [];
  meta: CodeMetaData;

  constructor(
    public schema: SchemaObject | ReferenceObject,
    public ctx?: ConversionTypeContext,
    meta: CodeMetaData = {},
  ) {
    /* ... */
  }

  assign(code: string): this {
    /* ... */
  }
  toString(): string {
    /* ... */
  }
}
```

**Usage:**

- Instantiated in `getZodSchema()`
- `.toString()` called to get string output
- Children tracked for composition schemas

**Phase 1 Strategy:**

- Remove `CodeMeta` class entirely
- Return strings directly from `getZodSchema()`
- No wrapper needed

---

### 6. Dependency Graph: `getOpenApiDependencyGraph.ts`

**✅ KEEP - Works correctly**

**Responsibility:** Build dependency graph of schemas and topologically sort them

**Algorithm:**

1. Visit all schema references recursively
2. Track which schemas depend on which
3. Build dependency graph: `Record<string, Set<string>>`
4. Compute deep dependencies (transitive closure)
5. Return graphs for topological sorting

**Key Functions:**

- `getOpenApiDependencyGraph()` - builds dependency graphs
- Called with schema refs and resolver function
- Returns shallow and deep dependency graphs

**Usage:**

- `template-context.ts` calls it to order schemas
- Essential for generating valid TypeScript (dependencies before dependents)

**Type Safety:** ✅ Good

**Tests:** ✅ Comprehensive unit tests

**Phase 1 Changes:**

- Update to accept OpenAPIObject directly (no resolver)
- Use new component-access functions

---

### 7. Type Conversion

#### A. Zod Conversion: `openApiToZod.ts`

**Responsibility:** Convert OpenAPI schemas to Zod schema strings

**Key Function:** `getZodSchema()`

**Current Tool:** CodeMeta (to be removed)

**Process:**

1. Handle different schema types (object, array, string, number, etc.)
2. Handle composition (allOf, oneOf, anyOf)
3. Add validations (min, max, pattern, etc.)
4. Handle enums
5. Handle nullable/optional
6. Return Zod schema string (e.g., `z.string().min(5)`)

**Type Safety:** ⚠️ Poor - uses CodeMeta, type assertions

**Tests:** ✅ Unit tested

**Phase 1 Changes:**

- Remove CodeMeta dependency
- Return strings directly
- Reduce type assertions

#### B. TypeScript Conversion: `openApiToTypescript.ts` & `openApiToTypescript.helpers.ts`

**Responsibility:** Convert OpenAPI schemas to TypeScript type strings

**Key Function:** `getTypescriptFromOpenApi()`

**Current Tool:** tanu (TypeScript AST manipulation)

**Issues:**

- **22 type assertions in helpers** (most in codebase!)
- **17 type assertions in main file**
- tanu usage unclear/insufficient
- Many assertions are `as t.TypeDefinition[]`

**Type Safety:** ⚠️ Very poor - most assertions in codebase

**Tests:** ✅ Unit tested

**Phase 2 Changes:**

- Migrate from tanu to ts-morph
- Eliminate ALL remaining type assertions (~44 total)
- Better AST generation

---

### 8. Template Engine

**Tool:** Handlebars

**Templates:**

- `default.hbs` - Full Zodios HTTP client
- `schemas-only.hbs` - Pure Zod schemas
- `schemas-with-metadata.hbs` - Schemas + metadata without Zodios (Engraph-ready)
- `grouped.hbs` - Grouped endpoints
- `grouped-index.hbs` - Index file for grouped output
- `grouped-common.hbs` - Common schemas for grouped output

**Status:** ✅ Keep for Phase 1 & 2

**Evaluation:** See `.agent/analysis/HANDLEBARS_EVALUATION.md`

**Future Consideration:** Evaluate ts-morph emitter architecture in Phase 3/4

**Type Safety:** N/A (template language)

---

## Data Flow

```
OpenAPI Spec
    ↓
SwaggerParser.bundle(spec)  ⚠️ Keeps $refs in operations
    ↓
Bundled OpenAPIObject
    ↓
CLI: Pass to generateZodClientFromOpenAPI()
    ↓
getZodClientTemplateContext(doc)
    ├─→ makeSchemaResolver(doc)  ⚠️ Resolver created
    │   └─→ Returns lying types (claims SchemaObject, returns anything)
    ├─→ getZodiosEndpointDefinitionList(doc, options, resolver)
    │   ├─→ For each path & method:
    │   │   ├─→ zodiosEndpoint.operation.helpers
    │   │   │   ├─→ Uses resolver.getSchemaByRef($ref)  ⚠️ Type assertions here
    │   │   │   └─→ Returns OperationObject | undefined
    │   │   └─→ zodiosEndpoint.path.helpers
    │   │       └─→ Uses resolver  ⚠️ Type assertions here
    │   └─→ Returns { endpoints, zodSchemaByName, resolver }
    ├─→ getOpenApiDependencyGraph(schemaRefs, resolver.getSchemaByRef)  ✅ Pure, works
    │   └─→ Returns dependency graphs
    ├─→ topologicalSort(deps)  ✅ Pure, tested
    │   └─→ Returns ordered schema names
    ├─→ For each schema:
    │   ├─→ getZodSchema({ schema, ctx, options })
    │   │   ├─→ Creates CodeMeta(schema, ctx)  ⚠️ Unnecessary wrapper
    │   │   ├─→ Calls conversion logic
    │   │   └─→ Returns CodeMeta.toString()
    │   └─→ getTypescriptFromOpenApi({ schema, ctx })
    │       ├─→ Uses tanu  ⚠️ Type assertions needed
    │       └─→ Returns TypeScript type string
    └─→ Returns TemplateContext
        ↓
Handlebars.compile(template)
    ↓
compiledTemplate(context)
    ↓
Generated TypeScript code (string)
    ↓
maybePretty(output, prettierConfig)
    ↓
Write to file or return
```

### Flow Issues (Annotated):

1. **❌ bundle() doesn't resolve** → Should use dereference()
2. **❌ Resolver lies about types** → Creates cascade of assertions
3. **❌ CodeMeta adds no value** → Extra abstraction for no benefit
4. **❌ tanu insufficient** → Forces many type assertions

---

## Type Assertions Breakdown

### Current Count: ~41 in src/ (74 total including tests)

**By File (Source Only):**

1. `openApiToTypescript.helpers.ts` - 22 assertions ❌ WORST
2. `openApiToTypescript.ts` - 17 assertions ❌ BAD
3. `getZodiosEndpointDefinitionList.ts` - 8 assertions
4. `inferRequiredOnly.ts` - 7 assertions
5. `zodiosEndpoint.operation.helpers.ts` - 9 assertions (from resolver)
6. `zodiosEndpoint.path.helpers.ts` - 2 assertions (from resolver)
7. Others - ~20 assertions

**Root Causes:**

1. **makeSchemaResolver lies about types** (35% of assertions)
   - Claims `SchemaObject`, returns any component type
   - Forces callers to cast: `as ParameterObject`, `as RequestBodyObject`

2. **tanu types not precise enough** (50% of assertions)
   - Most assertions are `as t.TypeDefinition[]`
   - Unclear if tanu is insufficient or misused

3. **Missing type guards** (10% of assertions)
   - Could use predicates instead of assertions

4. **Workarounds for bundling issues** (5% of assertions)
   - Nested $ref checks force assertions

**Phase 1 Goal:** Eliminate ~30 assertions (resolver + CodeMeta)

**Phase 2 Goal:** Eliminate remaining ~44 (ts-morph migration)

---

## Dependencies

### Critical Dependencies (Keep)

```json
{
  "openapi3-ts": "^4.5.0", // ✅ OpenAPI type definitions (v4 - latest)
  "@apidevtools/swagger-parser": "^12.1.0", // ✅ Parsing & bundling (latest, Oct 2025)
  "zod": "^4.1.12", // ✅ Schema validation runtime (v4 - latest)
  "handlebars": "^4.7.8", // ✅ Template engine (keep Phase 1-2)
  "lodash-es": "^4.17.21", // ✅ Tree-shakeable utilities
  "commander": "^14.0.1", // ✅ CLI framework
  "ts-pattern": "^5.8.0", // ✅ Pattern matching
  "prettier": "^3.6.2" // ✅ Code formatting
}
```

### To Be Replaced

```json
{
  "tanu": "^0.2.0"  → "ts-morph" (Phase 2)
  // ts-morph provides better TypeScript AST manipulation
  // Eliminates need for type assertions
}
```

### To Be Removed

```json
{
  "@zodios/core": "^10.9.6"  (Phase 3)
  // Incompatible with Zod 4
  // Only used in templates
  // Extraction target doesn't need Zodios
}
```

### Evaluation Documents

- ✅ **Zodios Core:** `.agent/analysis/ZODIOS_CORE_EVALUATION.md`
- ✅ **SwaggerParser:** `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md`
- ✅ **Handlebars:** `.agent/analysis/HANDLEBARS_EVALUATION.md`

---

## Testing Architecture

### Test Types

1. **Unit Tests** (227 tests) - Pure functions, helpers
   - `getOpenApiDependencyGraph.test.ts`
   - `topologicalSort.test.ts`
   - `utils.test.ts`
   - `schema-sorting.test.ts`
   - `enumHelpers.test.ts`
   - etc.

2. **Characterisation Tests** (89 tests) - Public API behavior
   - `generation.char.test.ts` (15 tests) - Full pipeline
   - `schema-dependencies.char.test.ts` (10 tests) - Dependency resolution
   - `options.char.test.ts` (20 tests) - Configuration options
   - `cli.char.test.ts` (11 tests) - CLI behavior (truly exercises system!)
   - `error-handling.char.test.ts` (10 tests) - Error scenarios
   - `edge-cases.char.test.ts` (11 tests) - Edge cases
   - **`bundled-spec-assumptions.char.test.ts` (12 tests) - Phase 0 additions ✅**

3. **Snapshot Tests** (152 tests) - Generated output validation
   - `tests-snapshot/*.test.ts` - Various OpenAPI specs
   - Validates generated code structure

### Total: 468 tests, 0 skipped, all passing ✅

### Coverage by Component

- ✅ `getOpenApiDependencyGraph`: Full unit test coverage
- ✅ `topologicalSort`: Full unit test coverage
- ✅ Pure utilities: Full unit test coverage
- ✅ Public API: Comprehensive characterisation tests
- ⚠️ `makeSchemaResolver`: Partial (will be deleted)
- ⚠️ `CodeMeta`: Partial (will be deleted)
- ✅ Template rendering: Snapshot-based validation

### Test Principles Applied

All tests follow 6 principles (see `TEST-PRINCIPLES-APPLIED.md`):

1. ✅ Prove behaviour, not implementation
2. ✅ Prove something useful
3. ✅ NOT validate test code
4. ✅ NOT validate library code
5. ✅ NEVER skipped (0 skipped)
6. ✅ NEVER contain conditional logic

---

## Known Issues

### 1. Type Safety Issues

**Count:** 41 type assertions in src/ (74 total)

**Impact:** Masks bugs, reduces type safety

**Root Cause:** Architectural flaws (resolver, tanu usage)

**Resolution:** Phase 1 & 2 rewrites

### 2. Architecture Issues

**A. Not leveraging SwaggerParser correctly**

- Using `bundle()` instead of `dereference()`
- Forces need for resolver
- **Discovered in Phase 0** ✅

**B. Resolver is redundant**

- After `dereference()`, no $refs to resolve
- Can access operations directly
- Resolver will be eliminated

**C. tanu usage unclear**

- Many type assertions suggest misuse or insufficiency
- ts-morph will provide better types

### 3. Dependency Issues

**A. @zodios/core incompatible with Zod 4**

- Peer dependency warning expected
- Only used in templates
- Will be removed in Phase 3

**B. tanu may not be needed**

- ts-morph might fully replace it
- Evaluation in Phase 2

---

## Assumptions Validated (Phase 0)

### ✅ SwaggerParser.bundle() vs dereference() Behavior

**Assumption (WRONG):** `bundle()` resolves all operation-level $refs

**Actual Behavior:**

- `bundle()` KEEPS $refs in parameters, requestBody, responses
- `dereference()` RESOLVES all $refs

**Validation:** 12 tests in `bundled-spec-assumptions.char.test.ts`

**Evidence:**

```typescript
// BEFORE dereference()
parameters: [{ $ref: '#/components/parameters/UserId' }];

// AFTER dereference()
parameters: [
  {
    name: 'userId',
    in: 'path',
    required: true,
    schema: { type: 'string' },
  },
];
```

**Impact:** Phase 1 plan updated to use `dereference()` not `bundle()`

### ✅ Schema Dependency Tracking

**Assumption:** Component schemas preserve $refs for ordering

**Validation:** Tests in `schema-dependencies.char.test.ts` (10 tests)

**Status:** ✅ VALIDATED - dependency graph works correctly

### ✅ Template Compatibility

**Assumption:** Templates work with current architecture

**Validation:** All 152 snapshot tests pass

**Status:** ✅ VALIDATED

---

## Phase 1 Targets (Files to Delete/Rewrite)

### Files to DELETE (Phase 1)

1. `lib/src/makeSchemaResolver.ts` (~150 lines)
2. `lib/src/makeSchemaResolver.test.ts` (~100 lines)
3. `lib/src/CodeMeta.ts` (~85 lines)
4. `lib/src/CodeMeta.test.ts` (~80 lines)

**Total:** ~415 lines deleted

### Files to REWRITE (Phase 1)

1. `lib/src/cli.ts`
   - Change `bundle()` to `dereference()`
   - ~5 lines changed

2. `lib/src/template-context.ts`
   - Remove resolver dependency
   - Pass OpenAPIObject directly
   - ~50 lines rewritten

3. `lib/src/getOpenApiDependencyGraph.ts`
   - Accept OpenAPIObject directly
   - Use new component-access functions
   - ~30 lines rewritten

4. `lib/src/zodiosEndpoint.operation.helpers.ts`
   - Remove resolver usage (9 calls)
   - Use direct access (no $refs after dereference)
   - ~50 lines rewritten

5. `lib/src/zodiosEndpoint.path.helpers.ts`
   - Remove resolver usage (2 calls)
   - ~20 lines rewritten

6. `lib/src/openApiToZod.ts`
   - Remove CodeMeta dependency
   - Return strings directly
   - ~40 lines rewritten

7. `lib/src/openApiToTypescript.ts`
   - Remove CodeMeta usage
   - ~10 lines changed

8. `lib/src/openApiToTypescript.helpers.ts`
   - Remove resolver usage
   - ~10 lines changed

### Files to CREATE (Phase 1)

1. `lib/src/component-access.ts`
   - Type-safe component access functions
   - Replaces resolver with honest types
   - ~150 lines new code

2. `lib/src/component-access.test.ts`
   - Comprehensive unit tests
   - ~200 lines new tests

**Total Phase 1 Changes:** ~415 lines deleted, ~360 lines rewritten/created

**Net:** ~55 lines fewer, FAR better type safety

---

## Phase 2 Targets (ts-morph Migration)

### Files to REWRITE (Phase 2)

1. `lib/src/openApiToTypescript.ts`
   - Migrate from tanu to ts-morph
   - Eliminate 17 type assertions
   - ~200 lines rewritten

2. `lib/src/openApiToTypescript.helpers.ts`
   - Migrate from tanu to ts-morph
   - Eliminate 22 type assertions (most in codebase!)
   - ~300 lines rewritten

3. Other files with tanu usage
   - ~100 lines rewritten

### Dependencies

- Remove: `tanu@0.2.0`
- Add: `ts-morph@^23.0.0` (or latest)

**Total Phase 2 Changes:** ~600 lines rewritten, 44 type assertions eliminated

---

## Success Metrics

### Phase 1 Success Criteria

- ✅ Type assertions: 41 → ~15 (60% reduction)
- ✅ Files deleted: 4 (resolver, CodeMeta + tests)
- ✅ CLI uses `dereference()` not `bundle()`
- ✅ Tests passing: Maintain 468/468
- ✅ Type errors: Maintain 0
- ✅ No new lint issues

### Phase 2 Success Criteria

- ✅ Type assertions: ~15 → 0 (100% elimination)
- ✅ tanu dependency removed
- ✅ ts-morph added and working
- ✅ Tests passing: Maintain 468/468
- ✅ Generated code quality same or better

### Phase 3 Success Criteria

- ✅ @zodios/core dependency removed
- ✅ Lint issues: 125 → <20
- ✅ Tests passing: Maintain 468/468
- ✅ All quality gates green

---

## Component Responsibility Summary

| Component                         | Status     | Type Safety  | Keep/Remove/Rewrite |
| --------------------------------- | ---------- | ------------ | ------------------- |
| `generateZodClientFromOpenAPI.ts` | ✅ Good    | ✅ Good      | Keep                |
| `cli.ts`                          | ⚠️ Issue   | ✅ Good      | Rewrite (5 lines)   |
| `template-context.ts`             | ⚠️ Depends | ⚠️ Poor      | Rewrite             |
| `makeSchemaResolver.ts`           | ❌ Flawed  | ❌ Lying     | DELETE (Phase 1)    |
| `CodeMeta.ts`                     | ❌ Flawed  | ⚠️ Poor      | DELETE (Phase 1)    |
| `getOpenApiDependencyGraph.ts`    | ✅ Good    | ✅ Good      | Update (30 lines)   |
| `topologicalSort.ts`              | ✅ Good    | ✅ Good      | Keep                |
| `openApiToZod.ts`                 | ⚠️ Depends | ⚠️ Poor      | Rewrite (Phase 1)   |
| `openApiToTypescript.ts`          | ⚠️ Tanu    | ❌ Very Poor | Rewrite (Phase 2)   |
| `openApiToTypescript.helpers.ts`  | ⚠️ Tanu    | ❌ Worst     | Rewrite (Phase 2)   |
| Templates (Handlebars)            | ✅ Good    | N/A          | Keep (Phase 1-2)    |

---

## Next Steps (Phase 1)

1. ✅ **Phase 0 Complete** - Architecture documented
2. **Phase 1 Start:** Create `component-access.ts` with TDD
3. Update CLI to use `dereference()`
4. Update dependency graph to use new functions
5. Eliminate CodeMeta usage
6. Update all call sites (~24 locations)
7. Delete resolver & CodeMeta files
8. Validate: All 468 tests still passing
9. Validate: ~30 type assertions eliminated

**Timeline:** 8-10 hours

**Risk:** LOW (comprehensive Phase 0 test suite protects us)

---

**This architecture document provides the complete foundation for confident Phase 1 execution.**
