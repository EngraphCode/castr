# Characterisation Tests

## Purpose

These tests capture the **PUBLIC API behavior** of `openapi-zod-client` to protect against regressions during architectural refactoring (Phase 1-3 of the Architecture Rewrite).

## Running Tests

```bash
# Run characterisation tests only
pnpm character

# Run characterisation tests in watch mode
pnpm character:watch

# Run regular tests (excludes characterisation tests)
pnpm test
```

## Directory Structure

```
characterisation/
├── README.md                           # This file
├── generation.char.test.ts             # E2E generation pipeline tests (12 tests)
├── schema-dependencies.char.test.ts    # Schema dependency ordering tests (7 tests)
└── test-output/                        # Generated test output (git-ignored)
```

## Test Coverage Analysis

### ✅ What IS Covered

#### 1. **Core Generation Pipeline** (`generation.char.test.ts`)

- ✅ Minimal OpenAPI 3.0 specs → generated code
- ✅ Schema references (`$ref`) resolution after bundling
- ✅ Request body with component references
- ✅ Response references
- ✅ Parameter references
- ✅ `allOf` composition
- ✅ `oneOf` unions
- ✅ Circular references (self-referencing schemas)
- ✅ Deeply nested schemas
- ✅ Template selection (`default`, `schemas-only`, `schemas-with-metadata`)

#### 2. **Schema Dependency Resolution** (`schema-dependencies.char.test.ts`)

- ✅ Simple dependency ordering (A depends on B)
- ✅ Multi-level dependencies (A → B → C chains)
- ✅ Multiple dependencies (fan-out patterns)
- ✅ Array item dependencies
- ✅ Circular references (Node → Node)
- ✅ Mutual circular references (A ↔ B)
- ✅ Circular references in composition

#### 3. **Type Safety Guarantees**

- ✅ No type assertions in generated code (`as unknown as`, `as any`)
- ✅ Valid TypeScript output structure
- ✅ Proper imports and exports

### ⚠️ What is PARTIALLY Covered

#### 1. **Options & Configuration**

- ✅ Template selection
- ⚠️ Missing: `withAlias`, `baseUrl`, `apiClientName`
- ⚠️ Missing: `exportSchemas`, `exportTypes`
- ⚠️ Missing: `strictObjects`, `additionalPropertiesDefaultValue`
- ⚠️ Missing: `withValidationHelpers`, `withSchemaRegistry`
- ⚠️ Missing: `groupStrategy` variants
- ⚠️ Missing: `complexityThreshold`
- ⚠️ Missing: `defaultStatusBehavior`

#### 2. **OpenAPI Features**

- ✅ Basic types (string, number, array, object)
- ✅ `allOf`, `oneOf` composition
- ✅ `$ref` resolution
- ⚠️ Missing: `anyOf` (not explicitly tested)
- ⚠️ Missing: `not` keyword
- ⚠️ Missing: `discriminator` mappings
- ⚠️ Missing: `additionalProperties`
- ⚠️ Missing: `patternProperties`
- ⚠️ Missing: Enums (string, number, mixed)
- ⚠️ Missing: Formats (date-time, email, uri, etc.)
- ⚠️ Missing: Constraints (min/max, minLength/maxLength, pattern, etc.)
- ⚠️ Missing: Nullable types
- ⚠️ Missing: Deprecated schemas/operations

#### 3. **HTTP Methods & Operations**

- ✅ GET operations
- ✅ POST operations
- ⚠️ Missing: PUT, PATCH, DELETE, HEAD, OPTIONS, TRACE
- ⚠️ Missing: Multiple operations on same path
- ⚠️ Missing: Path parameters in URL templates
- ⚠️ Missing: Query parameters (array, object, style variants)
- ⚠️ Missing: Header parameters
- ⚠️ Missing: Cookie parameters

#### 4. **Response Handling**

- ✅ 200 responses
- ✅ 201 responses
- ⚠️ Missing: Error responses (4xx, 5xx)
- ⚠️ Missing: Default responses
- ⚠️ Missing: Multiple response content types
- ⚠️ Missing: Response headers

### ❌ What is NOT Covered

#### 1. **CLI Behavior** (Critical Gap!)

- ❌ Command-line argument parsing
- ❌ File input/output
- ❌ URL input (remote specs)
- ❌ Output path resolution
- ❌ Prettier integration
- ❌ Error messages and exit codes
- ❌ Help text generation
- ❌ Version display
- ❌ Config file loading
- ❌ Environment variables

#### 2. **Advanced OpenAPI 3.1 Features**

- ❌ JSON Schema 2020-12 keywords
- ❌ `webhooks`
- ❌ `prefixItems` (JSON Schema arrays)
- ❌ `$dynamicRef` and `$dynamicAnchor`

#### 3. **Error Handling**

- ❌ Invalid OpenAPI specs
- ❌ Missing required fields
- ❌ Malformed $refs
- ❌ Circular dependencies (error cases)
- ❌ Unsupported features
- ❌ Type conflicts

#### 4. **Edge Cases**

- ❌ Empty specs
- ❌ Specs with no operations
- ❌ Specs with only schemas
- ❌ Special characters in names
- ❌ Reserved words as identifiers
- ❌ Very large specs (performance)
- ❌ Deeply nested references (>10 levels)

#### 5. **Integration Points**

- ❌ SwaggerParser error handling
- ❌ Prettier error handling
- ❌ Filesystem errors (permissions, disk full)
- ❌ Network errors (for URL inputs)

#### 6. **Generated Code Behavior**

- ❌ Runtime validation behavior
- ❌ Zod schema correctness (does it actually validate?)
- ❌ TypeScript compilation of generated code
- ❌ Zodios client runtime behavior

## Type Safety Approach

### The `@apidevtools/swagger-parser` vs `openapi3-ts` Type Mismatch

**Problem:** `SwaggerParser.bundle()` returns its own OpenAPI type definition that is structurally compatible with `openapi3-ts/oas30`'s `OpenAPIObject`, but TypeScript treats them as incompatible.

**Solution:** We follow the pattern established in `cli.ts`:

```typescript
// Helper function using type guard (NOT type assertion)
async function bundleSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
    const bundled: unknown = await SwaggerParser.bundle(spec);
    if (!isOpenAPIObject(bundled)) {
        throw new Error("SwaggerParser.bundle() returned invalid OpenAPI document");
    }
    return bundled;
}
```

**Why this is better than type assertions:**

1. ✅ Runtime validation ensures structural compatibility
2. ✅ Fails fast with helpful error if types diverge
3. ✅ Follows existing codebase patterns (see `cli.ts`)
4. ✅ No `as` type assertions (forbidden in RULES.md)
5. ✅ Type guard (`isOpenAPIObject`) provides type narrowing

**Alternative considered:** Cast directly with `as OpenAPIObject`

- ❌ Bypasses type safety
- ❌ Violates RULES.md (no type assertions)
- ❌ Could hide bugs if types diverge

## Recommendations for Phase 0 Completion

To reach the target of 50-60 comprehensive tests, we should add:

### High Priority (Complete Phase 0)

1. **CLI Characterisation Tests** (15-20 tests) - **CRITICAL GAP**
    - Test file I/O operations
    - Test all command-line options
    - Test error messages
    - Test exit codes
    - Test help/version commands

2. **Options Coverage** (10-12 tests)
    - Test each option's effect on generated code
    - Test option combinations
    - Test invalid option values

3. **Error Handling** (8-10 tests)
    - Invalid specs
    - Missing required fields
    - Unsupported features
    - SwaggerParser errors

### Medium Priority (Future Enhancements)

4. **Advanced OpenAPI Features** (10-15 tests)
    - All HTTP methods
    - All parameter types and styles
    - Error responses
    - Multiple content types

5. **Edge Cases** (5-10 tests)
    - Empty/minimal specs
    - Special characters
    - Reserved words
    - Very large specs

### Low Priority (Nice to Have)

6. **Runtime Validation** (10-15 tests)
    - Compile generated code
    - Test Zod schema validation
    - Test Zodios client usage

## CLI Coverage Gap Analysis

**Current Coverage:** 0/100 CLI behaviors tested

**Critical CLI Behaviors Not Tested:**

1. **Input Handling**
    - File path input
    - URL input
    - YAML parsing
    - JSON parsing
    - Invalid file paths
    - Network errors

2. **Output Handling**
    - Custom output path
    - Default output path generation
    - File overwriting
    - Filesystem errors

3. **Option Processing**
    - All 20+ CLI options
    - Option validation
    - Option defaults
    - Invalid option values
    - Option combinations

4. **Error Reporting**
    - Error message formatting
    - Exit codes (0 vs 1)
    - Stack traces
    - Validation errors

5. **User Experience**
    - Help text display
    - Version display
    - Progress indicators
    - Prettier integration

**Recommendation:** Create `cli.char.test.ts` with 15-20 tests covering CLI behavior.

## Public API Coverage Summary

| API Category          | Covered | Total  | %       |
| --------------------- | ------- | ------ | ------- |
| **Core Generation**   | 12      | 15     | 80%     |
| **Schema Resolution** | 7       | 10     | 70%     |
| **Options**           | 1       | 20     | 5%      |
| **CLI**               | 0       | 15     | 0%      |
| **Error Handling**    | 0       | 10     | 0%      |
| **Edge Cases**        | 0       | 10     | 0%      |
| **Total**             | **20**  | **80** | **25%** |

## Conclusion

### Strengths

- ✅ Core generation pipeline well covered
- ✅ Schema dependency resolution comprehensive
- ✅ Type safety guarantees validated
- ✅ Tests follow PUBLIC API behavior principle
- ✅ Type-safe approach without assertions

### Critical Gaps

- ❌ **CLI behavior completely untested** (0%)
- ❌ **Options coverage minimal** (5%)
- ❌ **Error handling missing** (0%)
- ❌ **Edge cases not covered** (0%)

### Recommendations

1. **Immediately:** Add CLI characterisation tests (15-20 tests)
2. **Before Phase 1:** Add options coverage tests (10-12 tests)
3. **Before Phase 1:** Add error handling tests (8-10 tests)
4. **Target:** 50-60 total tests for Phase 0 completion
5. **Current:** 19 tests (38% of minimum target)

The current tests provide a **solid foundation** for core generation behavior but **miss critical CLI and configuration aspects** that are part of the public API.
