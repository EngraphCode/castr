# Generated Code Validation Fixtures

This document describes the representative fixtures used to validate generated TypeScript/Zod code.

## Purpose

These fixtures exercise all code generation paths to ensure that generated code is:

1. **Syntactically valid** - Parses without TypeScript syntax errors
2. **Type-safe** - Passes `tsc --noEmit` type checking
3. **Lint-compliant** - Passes ESLint validation
4. **Runtime-executable** - Can be imported and executed

## Representative Fixtures

### 1. tictactoe (Simple Schema)

**Path:** `examples/openapi/v3.1/tictactoe.yaml`

**Coverage:**

- Basic primitive types (string, number, boolean)
- Simple object schemas
- Array types
- Enum values
- Basic validation constraints

**Why selected:** Covers fundamental code generation for common OpenAPI patterns.

### 2. petstore-expanded (Complex Objects)

**Path:** `examples/openapi/v3.0/petstore-expanded.yaml`

**Coverage:**

- Nested object structures
- `allOf` composition (schema inheritance)
- Complex property relationships
- Multiple response types
- Required vs optional properties

**Why selected:** Exercises composition logic and deep nesting scenarios.

### 3. non-oauth-scopes (References & Security)

**Path:** `examples/openapi/v3.1/non-oauth-scopes.yaml`

**Coverage:**

- `$ref` resolution
- Security scheme metadata
- Bearer token authentication
- Operation-level security requirements

**Why selected:** Validates reference resolution and security metadata extraction.

### 4. multi-file (External References)

**Path:** `examples/openapi/multi-file/main.yaml`

**Coverage:**

- External `$ref` across multiple files
- Cross-file schema dependencies
- Scalar's `x-ext` vendor extension format
- Bundled schema resolution with file provenance

**Why selected:** Exercises Scalar bundling and external reference resolution using the `x-ext` vendor extension pattern for preserving file provenance in multi-file specifications.

### 5. api-with-examples (Constraints)

**Path:** `examples/openapi/v3.0/api-with-examples.yaml`

**Coverage:**

- Enum constraints
- Pattern validation (regex)
- Min/max length constraints
- Min/max value constraints
- Format specifications
- Example values

**Why selected:** Validates constraint handling and metadata preservation.

## Validation Strategy

Each fixture is validated through 4 independent test suites in separate files:

1. **Syntax validation** (`syntax-validation.gen.test.ts`) - TypeScript parser checks
2. **Type-check validation** (`type-check-validation.gen.test.ts`) - TypeScript compiler semantic checks
3. **Lint validation** (`lint-validation.gen.test.ts`) - ESLint rule compliance
4. **Runtime validation** (`runtime-validation.gen.test.ts`) - File executability checks

This modular structure allows:

- Independent testing of each validation type
- Reusable validation harness (`validation-harness.ts`) for other generated code
- Clearer test failure identification
- Easier maintenance and extension

## Adding New Fixtures

When adding new fixtures:

1. Identify the code generation path being exercised
2. Document the coverage and rationale in this file
3. Add the fixture to ALL 4 test suites:
   - `syntax-validation.gen.test.ts`
   - `type-check-validation.gen.test.ts`
   - `lint-validation.gen.test.ts`
   - `runtime-validation.gen.test.ts`
4. Ensure all 4 validation types pass
