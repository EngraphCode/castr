# MCP Enhancement Plan – Phase 2 (Restructured)

**Date:** October 25, 2025 (Plan Created), Last Updated: November 5, 2025  
**Phase:** 2 (split into Part 1 and Part 2)  
**Status:** Part 1 Complete ✅, Part 2 In Progress (Session 6 of 9 Complete)  
**Estimated Duration:** 6–8 weeks total (Part 1: 2 weeks ✅, Part 2: 3–4 weeks ⏳)  
**Prerequisites:** Architecture Rewrite Phases 0–3 complete ✅, All quality gates green ✅, Zod v4 update complete ✅

---

## Why the Split?

Phase 2 now ships in two consecutive parts:

- **Phase 2 – Part 1: Scalar Pipeline Re-architecture**  
  Replace `SwaggerParser.bundle()` with a Scalar-based pipeline (`@scalar/json-magic`, `@scalar/openapi-parser`, `@scalar/openapi-types`) to unlock richer validation, multi-file handling, and deterministic bundling. This is the foundation every MCP feature depends on.

- **Phase 2 – Part 2: MCP Enhancements**  
  Build the MCP-specific outputs (JSON Schema export, security metadata, predicates, documentation) on top of the new pipeline. Tasks map to the previous "Phase 2B" work but now assume the Scalar pipeline is in place.

The restructure keeps deliverables chronological: Part 1 provides the plumbing, Part 2 delivers the high-level MCP features.

---

## Quality Gates & Standards

- **Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run`
- **TDD (Mandatory):** Write failing tests first, confirm failure, implement minimal code, confirm success, refactor.
- **Comprehensive TSDoc (Mandatory):**
  - Public APIs: full TSDoc with 3+ examples
  - Internal APIs: succinct TSDoc with `@param`, `@returns`, `@throws`
  - Types/constants: documented purpose and usage
- **References:** `.agent/RULES.md`

---

## Prerequisite Check

```
Prerequisites (Phase 2 Core & Architecture Rewrite)
├─ 1.9 ✅ schemas-with-metadata template
├─ 2.1 ✅ openapi3-ts v4 update
├─ 2.4 ✅ zod v4 update
├─ 3.1 ✅ pastable replacement
└─ Architecture Rewrite (Phases 0–3) ⏳ – See 01-CURRENT-IMPLEMENTATION.md
```

---

## Phase 2 – Part 1: Scalar Pipeline Re-architecture

### Overview

Deliver a staged pipeline that:

1. Loads/bundles specs (filesystem & HTTP) via `@scalar/json-magic`
2. Upgrades all specs to OpenAPI 3.1 via `@scalar/openapi-parser`
3. Validates & sanitizes via `@scalar/openapi-parser`
4. Normalizes output while preserving internal `$ref`s for dependency graphs
5. Exposes metadata (bundle info, warnings, version) to downstream consumers

### Type System Architecture

**Core Decision: OpenAPI 3.1 Internal Type System with Intersection Types**

All OpenAPI documents are normalized to 3.1 after bundling, regardless of input version. This provides:

1. **Single internal type system** - No version branching in conversion/template logic
2. **Automatic upgrades** - 3.0 specs transparently upgraded to 3.1
3. **Strict typing** - All code uses `openapi3-ts/oas31` types
4. **Future-proof** - Ready for 3.1 features (webhooks, discriminator mapping, etc.)

#### Pipeline Flow

```
Input (3.0 or 3.1 spec: file, URL, or object)
    ↓
bundle() via @scalar/json-magic
    ↓ (resolves $refs, adds x-ext metadata)
upgrade() via @scalar/openapi-parser
    ↓ (normalizes to OpenAPI 3.1)
Validate & type as intersection
    ↓ (runtime boundary: loose → strict types)
BundledOpenApiDocument
    ↓ (strict openapi3-ts/oas31 + Scalar extensions)
Downstream code (conversion, templates, etc.)
```

#### Type Strategy

```typescript
import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

/**
 * Intersection type combining:
 * - Scalar's extension-friendly OpenAPIV3_1.Document (preserves x-ext, x-ext-urls)
 * - openapi3-ts strict OpenAPIObject (strict typing for standard fields)
 */
type BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject;
```

#### Key Principles

- **Boundary validation:** Type guards convert Scalar's loose types to our strict types
- **No casting:** Type narrowing via runtime validation, never `as` assertions
- **Extensions preserved:** Scalar's `x-ext`, `x-ext-urls` available for debugging
- **Strict downstream:** All conversion/template code uses `openapi3-ts/oas31` types
- **No custom types:** ALWAYS use library types (openapi3-ts, @modelcontextprotocol/sdk). Custom types are forbidden. Maintain unbroken chain of truth from library definitions.

#### Implementation Notes

- Scalar uses `Record<string, unknown>` internally (their escape hatch, not ours)
- We validate at the boundary with type guards that check both type systems
- The intersection type gives us strict typing for standard fields AND access to extensions
- All imports use `openapi3-ts/oas31` (not `oas30`)
- Legacy `openapi-types@12.1.3` and `@apidevtools/swagger-parser` removed from dependencies

### Session Plan (Part 1)

Each session is designed to be self-contained, follow TDD, and minimise context switching. Complete sessions sequentially.

#### **Session 1 – Foundation & Guards**

- **Focus:** Establish Scalar dependencies and enforce the "no SwaggerParser / legacy openapi-types" rule.
- **Acceptance Criteria**
  - Scalar packages (`@scalar/openapi-parser`, `@scalar/json-magic`, `@scalar/openapi-types`) added with pinned versions.
  - Inventory of every `prepareOpenApiDocument`/SwaggerParser usage documented (CLI, programmatic API, tests, fixtures).
  - Guard (Vitest or ESLint) fails if any production file imports `@apidevtools/swagger-parser` or legacy `openapi-types`.
  - Guard is red until both dependencies are removed from `package.json` and the source tree.
- **Validation Steps**
  1. `pnpm test:scalar-guard` → expect failure while legacy imports remain.
  2. `pnpm lint` → ensure guard integrates with lint pipeline (if implemented as ESLint rule).
  3. Document inventory results in `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` notes section or commit message.

##### Session 1 Inventory Notes (2025-11-04)

- **CLI entrypoint (`lib/src/cli/index.ts`):** `prepareOpenApiDocument` receives the CLI argument string verbatim (file path or URL). Errors bubble directly to the CLI; output feeds `generateZodClientFromOpenAPI` and must preserve internal `$ref`s for downstream dependency tracking. Default output path relies on the same string input, so Scalar loader must keep path semantics unchanged.
- **Programmatic API (`lib/src/rendering/generate-from-context.ts`):** `generateZodClientFromOpenAPI` forwards either `input` (string | `URL`) or an in-memory `OpenAPIObject`. It expects `prepareOpenApiDocument` to normalise URLs, handle local filesystem paths, accept already-parsed docs, and always return an `openapi3-ts` `OpenAPIObject`. The returned document feeds template context builders that depend on preserved `$ref`s and AJV-compatible structure.
- **Shared exports (`lib/src/shared/index.ts`):** re-exports `prepareOpenApiDocument` for consumers; documentation emphasises a single bundling point. Any guard must accommodate this public surface while preventing new SwaggerParser imports elsewhere.
- **Characterisation suite (`lib/src/characterisation/input-pipeline.char.test.ts`):** codifies required behaviours—success for local file paths and in-memory specs, rejection when both `input` and `openApiDoc` provided, explicit support for OpenAPI 3.0.x and 3.1.x, and documented failure expectations for unreachable URLs or malformed specs. These tests will remain the regression harness during Scalar migration.
- **Current implementation (`lib/src/shared/prepare-openapi-document.ts`):** Only production import of `@apidevtools/swagger-parser` and `openapi-types`. Performs the `openapi-types` → `openapi3-ts` boundary assertion (`as OpenAPI.Document`) and relies on `SwaggerParser.bundle()` for validation + external `$ref` resolution.

##### Session 1 Dependency Pins (2025-11-04)

- Added Scalar stack to `lib/package.json` with exact versions: `@scalar/json-magic@0.7.0`, `@scalar/openapi-parser@0.23.0`, `@scalar/openapi-types@0.5.1`. Pinned to satisfy deterministic bundling, AJV-backed validation, and shared type contracts.
- `pnpm install` executed to refresh `pnpm-lock.yaml`; lockfile now records the Scalar packages for the `lib` workspace. No additional build tooling changes required; existing Node ≥20 engine requirement remains valid for Scalar packages.

##### Session 1 Guard Implementation (2025-11-04)

- Added `lib/src/validation/scalar-guard.test.ts` which scans all production `.ts` sources (excluding tests/fixtures) for banned imports of `@apidevtools/swagger-parser` or `openapi-types`, reporting file + line context.
- Introduced dedicated Vitest config `vitest.scalar-guard.config.ts` and npm script `pnpm test:scalar-guard` so the guard runs outside the default unit suite; the guard currently fails as expected while legacy imports remain.
- Default Vitest config now excludes the guard file, preventing false negatives in routine test runs while still enabling targeted enforcement.

##### Session 1 Cleanup (2025-11-04)

- **Type system migration:** All imports changed from `openapi3-ts/oas30` to `openapi3-ts/oas31` throughout the codebase to align with the 3.1-first architecture.
- **Legacy dependency removal:** Removed `openapi-types@12.1.3` and `@apidevtools/swagger-parser` from `lib/package.json` and ran `pnpm install` to clean lockfile.
- **Rationale:** With the Scalar pipeline handling bundling/upgrade and the intersection type strategy, legacy SwaggerParser types are no longer needed. All internal code now uses strict `openapi3-ts/oas31` types.

##### Session 2 Loader Characterisation (2025-11-04)

- Added scalar loader characterisation coverage in `lib/src/characterisation/input-pipeline.char.test.ts`, verifying the new `loadOpenApiDocument` bundles single-file specs and preserves parity with the legacy Swagger pipeline.
- Introduced a multi-file fixture under `lib/examples/openapi/multi-file/` to exercise filesystem fan-out; tests assert external references are tracked in metadata and that generated `paths` mirror the existing pipeline (Scalar stores additional vendor data under `x-ext`, documented in the test comments).
- Characterisation suite (`pnpm character -- input-pipeline`) now covers both programmatic entrypoints and the Scalar loader, providing regression snapshots ahead of the Session 4 cutover.

#### **Session 2 – Loading & Bundling**

- **Focus:** Implement `loadOpenApiDocument` via json-magic with deterministic behaviour.
- **Acceptance Criteria**
  - `loadOpenApiDocument` wraps `@scalar/json-magic/bundle` with `readFiles()` and `fetchUrls()` plugins.
  - Calls `@scalar/openapi-parser/upgrade` to normalize all specs to OpenAPI 3.1.
  - Lifecycle hooks preserve internal `$ref`s, consolidate externals under `x-ext`, and emit warning metadata.
  - Bundle metadata (filesystem entries, entrypoint filename, warnings) stored in a typed structure.
  - Output typed as `BundledOpenApiDocument` (intersection of `OpenAPIV3_1.Document` & `OpenAPIObject` from `oas31`).
  - Unit tests cover local refs, remote refs (mocked), circular refs, and conflicting component names.
- **Validation Steps**
  1. `pnpm test -- run src/shared/load-openapi-document.test.ts`
  2. `pnpm test --filter characterisation -- load` (targeted characterisation that exercises new loader)
  3. Manual smoke: run CLI against a multi-file spec (`pnpm openapi-zod-validation tests/petstore.yaml -o /tmp/out.ts`) and inspect bundle metadata logs.

#### **Session 3 – Complete Technical Resolution (All Green)**

- **Focus:** Eliminate ALL type/lint errors, modernize ALL test fixtures to 3.1, migrate ALL SwaggerParser tests to Scalar pipeline.
- **Current State:** 77 type errors across 21 files, 18 lint errors across 10 files
- **Target State:** 0 type errors, 0 lint errors, ALL tests passing with working code

**Implementation Strategy:**

This session achieves complete technical resolution by fixing all source code, modernizing all test fixtures, and migrating all tests to the Scalar pipeline. The work is systematic with clear patterns.

**A. TypeScript Conversion Cleanup (16 errors: 8 source + 8 lint)**

**Strategy:** Create helper function for 3.1 nullable checks, replace all `schema.nullable` usage

**Steps:**

1. Add `isNullableType()` helper to `lib/src/conversion/typescript/helpers.primitives.ts`:

   ```typescript
   /**
    * Checks if a schema allows null values (OpenAPI 3.1 style).
    * In OpenAPI 3.1, nullable is expressed as `type: ['string', 'null']`.
    *
    * @param schema - The schema to check
    * @returns true if the schema type array includes 'null'
    */
   export function isNullableType(schema: SchemaObject): boolean {
     const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
     return types.includes('null');
   }
   ```

2. Replace `schema.nullable ?? false` with `isNullableType(schema)` in:
   - `lib/src/conversion/typescript/core.converters.ts`: 5 occurrences (lines 57, 84, 103, 148, 166)
   - `lib/src/conversion/typescript/helpers.composition.ts`: 1 occurrence (line 36)
   - `lib/src/conversion/typescript/helpers.primitives.ts`: 2 occurrences (lines 113, 118)

3. Add import: `import { isNullableType } from './helpers.primitives.js';` where needed

**B. Test Fixture Modernization (47 type errors)**

**Strategy:** Systematic search-replace patterns across test files

**Pattern 1 - Nullable types:**

```typescript
// Find:    { type: 'string', nullable: true }
// Replace: { type: ['string', 'null'] }
```

**Pattern 2 - Exclusive bounds (boolean → number):**

```typescript
// Find:    { minimum: N, exclusiveMinimum: true }
// Replace: { exclusiveMinimum: N }

// Find:    { maximum: N, exclusiveMaximum: false }
// Replace: { maximum: N }
```

**Files to update (47 occurrences):**

- `tests-snapshot/utilities/openApiToTypescript.test.ts`: 18 errors (nullable)
- `tests-snapshot/utilities/openApiToZod.test.ts`: 4 errors (nullable)
- `tests-snapshot/options/validation/validations.test.ts`: 7 errors (6 exclusive bounds + 1 nullable)
- `tests-snapshot/options/validation/enum-null.test.ts`: 2 errors (nullable)
- `tests-snapshot/edge-cases/missing-zod-chains.test.ts`: 2 errors (nullable)
- `src/conversion/typescript/helpers.test.ts`: 3 errors (nullable)
- `src/characterisation/edge-cases.char.test.ts`: 1 error (nullable)
- `tests-snapshot/schemas/references/schema-refiner.test.ts`: 1 error (nullable)

**C. Vitest v4 Mock Fixes (16 type errors)**

**Strategy:** Update to Vitest v4 generic syntax, infer types from library

**File:** `lib/src/shared/load-openapi-document.test.ts`

**Changes:**

1. Change `vi.fn<[params], ReturnType>()` → `vi.fn<ReturnType>()`
2. Remove manual `BundleConfig` interface, use: `Parameters<typeof bundle>[1]`
3. Fix plugin exec calls with explicit cast: `(plugin as LoaderPlugin).exec(...)`
4. Update `expectBundleConfig` signature: `config: Parameters<typeof bundle>[1]`

**D. SwaggerParser Test Migration (18 errors: 9 type + 9 lint)**

**Strategy:** Rewrite all tests to use `prepareOpenApiDocument` (which now uses Scalar internally)

**Critical characterisation tests (3 files):**

- `lib/src/characterisation/bundled-spec-assumptions.char.test.ts`
- `lib/src/characterisation/input-format.char.test.ts`
- `lib/src/characterisation/programmatic-usage.char.test.ts`

**Integration tests (6 files):**

- `lib/tests-snapshot/integration/generateZodClientFromOpenAPI.test.ts`
- `lib/tests-snapshot/integration/getEndpointDefinitionList.test.ts`
- `lib/tests-snapshot/integration/getOpenApiDependencyGraph.test.ts`
- `lib/tests-snapshot/integration/samples.test.ts`
- `lib/tests-snapshot/options/generation/group-strategy.test.ts`
- `lib/tests-snapshot/schemas/references/ref-in-another-file.test.ts`

**Migration pattern:**

```typescript
// Before:
import SwaggerParser from '@apidevtools/swagger-parser';
const doc = await SwaggerParser.parse('./spec.yaml');

// After:
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
const doc = await prepareOpenApiDocument({ input: './spec.yaml' });
```

**Also:**

- Remove 2 unused `@ts-expect-error` directives (obsolete with SwaggerParser gone)
- Update JSDoc example in `lib/src/endpoints/definition-list.ts` (line 42)

**E. Undefined Guards (5 type errors)**

**Strategy:** Add optional chaining for OpenAPI 3.1 optional properties

**Changes:**

- `bundled-spec-assumptions.char.test.ts`: Add `?.` for `operation.responses` (2 occurrences)
- `input-format.char.test.ts`: Add `?? {}` for `spec.paths` (2 occurrences)
- `load-openapi-document.test.ts`: Change index signature to `Record<string, unknown>` (1 lint error)

**Pattern:**

```typescript
// Before: operation.responses['200']
// After:  operation.responses?.['200']

// Before: Object.keys(spec.paths)
// After:  Object.keys(spec.paths ?? {})
```

**Acceptance Criteria:**

- ✅ `pnpm type-check` → 0 errors
- ✅ `pnpm lint` → 0 errors
- ✅ `pnpm test -- --run` → ALL tests passing
- ✅ NO `@ts-expect-error` pragmas in source code
- ✅ All test fixtures use 3.1 syntax
- ✅ All tests use Scalar pipeline (no SwaggerParser)

**Validation Steps:**

1. `pnpm type-check` → must show "Found 0 errors"
2. `pnpm lint` → must show "✖ 0 problems"
3. `pnpm test -- --run` → must show all green
4. `pnpm format && pnpm build` → must pass
5. Commit with message: "feat(types): complete OpenAPI 3.1 migration - resolve all type/lint errors"

**Estimated Effort:** 5-7 hours (systematic work with clear patterns)

#### **Session 4 – Documentation & Final Cleanup** ✅

- **Focus:** Comprehensive documentation and final polish
- **Prerequisites:** Session 3 complete (all tests green, 0 errors) ✅
- **Status:** COMPLETE (November 5, 2025)

**Completed Deliverables:**

✅ **Step 1: TSDoc Public API Documentation**

- Enhanced `generateZodClientFromOpenAPI()` with comprehensive TSDoc
- Enhanced `getZodClientTemplateContext()` with detailed examples
- Enhanced `getOpenApiDependencyGraph()` with full documentation
- Added detailed documentation for `defaultStatusBehavior` option

✅ **Step 2: Scalar Pipeline Architecture Documentation**

- Created `.agent/architecture/SCALAR-PIPELINE.md` (~3,000 words)
  - Bundling vs dereferencing explained
  - 3-stage pipeline documented
  - Auto-upgrade behavior detailed
  - Design decisions and trade-offs covered
- Updated `lib/README.md` to remove SwaggerParser references

✅ **Step 3: OpenAPI 3.1 Type System Documentation**

- Created `.agent/architecture/OPENAPI-3.1-MIGRATION.md`
  - Documented nullable types (3.0 vs 3.1)
  - Documented exclusive bounds changes
  - Explained type arrays
  - Documented `isNullableType()` helper with inline comments

✅ **Step 4: Default Response Behavior Documentation**

- Created `docs/DEFAULT-RESPONSE-BEHAVIOR.md`
  - Explained the warning message
  - Documented both `defaultStatusBehavior` options
  - Listed test fixtures with default-only responses
  - Provided comprehensive usage examples

✅ **Step 5: Code Comments & Inline Documentation**

- Added 15+ substantial architectural comments across the codebase:
  - Vitest v4 hoisting patterns
  - Scalar boundary validation
  - Scalar bundling behavior
  - Hash-based external file refs
  - Auto-upgrade behavior
  - OpenAPI 3.1 optional chaining
  - Scalar pipeline architecture
  - Component access & $ref preservation
  - Dependency graph $ref tracking
  - CLI Scalar integration
  - Complete generation pipeline

✅ **Step 6: Final Cleanup & Polish**

- No commented-out code blocks
- No TODO/FIXME/HACK comments in source
- All code follows RULES.md standards

✅ **Step 7: Comprehensive Quality Verification**

- 0 linter errors across all source files ✅
- 0 linter errors across all test files ✅
- 0 type errors ✅
- All tests passing (0 skipped) ✅
- Documentation completeness verified ✅

**Validation Results:**

1. ✅ `pnpm type-check` → 0 errors
2. ✅ `pnpm lint` → 0 errors
3. ✅ `pnpm test:all` → All passing, 0 skipped
4. ✅ Production-ready codebase with comprehensive documentation

**Estimated Effort:** 2-3 hours (Actual: ~3 hours)

### Deliverables

- New loader/validator modules with test coverage
- Updated `prepareOpenApiDocument`
- Documentation (README, `.agent` context) reflecting Scalar pipeline and 3.1-first architecture
- Lint/test guard ensuring no `@apidevtools/swagger-parser` or legacy `openapi-types` remain (guard passing is a Phase 1 exit criterion)

---

## Phase 2 – Part 2: MCP Enhancements (Built on Scalar Pipeline)

### Overview

Implements MCP-specific features assuming Part 1 is complete:

1. Define MCP requirements & readiness checks
2. Export JSON Schema from Zod outputs
3. Surface security metadata
4. Provide type guards, error formatting, and documentation for MCP consumers

### Part 2 Restructure: 9 Sessions Total

Phase 2 Part 2 has been expanded from 4 sessions to 9 sessions to properly scope the MCP work:

- **Sessions 5-6:** Foundation (MCP research + SDK enhancements) ✅
- **Session 7:** JSON Schema conversion engine (core infrastructure)
- **Session 8:** MCP tool generation & template integration (Handlebars-compatible outputs)
- **Session 9:** Type guards, error formatting & documentation (polish + validation)

This structure ensures each session has focused, testable deliverables while maintaining compatibility with the existing Handlebars template system before the Phase 3 ts-morph migration.

### Session Plan (Part 2)

> **Note:** Task 5.2.1 ("OpenAPI Spec Validation, Fail-Fast") is delivered by Part 1. Sessions below build on the Scalar pipeline output.

#### **Session 5 – MCP Investigation** ✅

**Status:** COMPLETE (November 5, 2025)

- **Focus:** Research MCP protocol and produce analysis artifacts that drive implementation.
- **Deliverables:**
  - ✅ `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` - MCP tool structure, JSON Schema Draft 07 requirements, annotations, error formats
  - ✅ `.agent/analysis/JSON_SCHEMA_CONVERSION.md` - OpenAPI → JSON Schema Draft 07 conversion rules (direct, not via Zod)
  - ✅ `.agent/analysis/SECURITY_EXTRACTION.md` - Upstream API authentication extraction (two-layer auth model)

**Key Research Findings:**

1. **MCP Version:** Targeting specification version 2025-06-18
   - Reference repo checked out at `.agent/reference/reference-repos/modelcontextprotocol`
   - Schema location: `schema/2025-06-18/schema.json`

2. **JSON Schema Version:** Draft 07 (NOT Draft 2020-12)
   - MCP schema declares: `"$schema": "http://json-schema.org/draft-07/schema#"`
   - All generated schemas must conform to Draft 07
   - No Draft 2020-12 features available

3. **Conversion Strategy:** OpenAPI → (Zod + JSON Schema) in parallel
   - **Rejected:** OpenAPI → Zod → JSON Schema (via `zod-to-json-schema`)
   - **Chosen:** Direct OpenAPI → JSON Schema conversion
   - **Rationale:**
     - No information loss (Zod transforms don't translate)
     - Each converter optimized for its target format
     - Full control over Draft 07 output
     - No external conversion dependency

4. **Security Architecture:** Two-layer authentication model
   - **Layer 1 (MCP Protocol):** OAuth 2.1 between MCP client and server
     - NOT in OpenAPI specs
     - Defined by MCP specification
     - Not our concern for code generation
   - **Layer 2 (Upstream API):** Authentication defined in OpenAPI specs
     - OAuth, Bearer, API keys for upstream API
     - THIS is what we extract and document
     - For MCP server implementers to configure backend auth

5. **MCP SDK:** Not needed for this project
   - SDK is for runtime (server/client implementation)
   - We generate static artifacts (schemas, types, tools)
   - No overlap with code generation functionality
   - We only need schema definitions from spec repo

6. **Tool Structure Constraints:**
   - `inputSchema` and `outputSchema` MUST have `"type": "object"` at root
   - Tool names conventionally use `snake_case`
   - Annotations are untrusted hints (not security guarantees)
   - JSON-RPC 2.0 error codes for protocol errors
   - `isError: true` in results for execution errors

**Architecture Decisions Captured:**

- Create `lib/src/conversion/json-schema/` directory (parallel to `typescript/` and `zod/`)
- Tool naming: `operationId` → `snake_case` (e.g., `getUser` → `get_user`)
- Annotations mapping from HTTP methods:
  - GET/HEAD/OPTIONS → `readOnlyHint: true`
  - DELETE → `destructiveHint: true`
  - PUT → `idempotentHint: true`
- Security extraction focuses on upstream API auth documentation
- Generated tools include comprehensive authentication guidance comments

**Validation:**

- ✅ All three analysis documents created with comprehensive details
- ✅ MCP spec version confirmed (2025-06-18)
- ✅ JSON Schema version confirmed (Draft 07)
- ✅ Security architecture clarified (two-layer model)
- ✅ Conversion strategy decided (parallel, not Zod → JSON Schema)
- ✅ Ready for Session 6 implementation

#### **Session 6 – SDK Enhancements** ✅

**Status:** COMPLETE (November 5, 2025)

- **Focus:** Enrich SDK-facing artefacts with metadata unlocked by the Scalar pipeline.
- **Design Constraint:** Use library types exclusively - `ParameterObject['examples']`, `SchemaObject['constraints']` etc. NO custom types.

**Completed Deliverables:**

✅ **Enhanced Parameter Metadata Extraction**

- Implemented `extractParameterMetadata()` using pure functions and library types
- Parameter metadata uses `Pick<ParameterObject, 'description' | 'deprecated' | 'example' | 'examples'>` + `Pick<SchemaObject, 'default'>`
- Created `SchemaConstraints` type using `Pick<SchemaObject, 11 constraint fields>`
- All 11 OpenAPI constraints supported: `enum`, `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, `format`, `minItems`, `maxItems`, `uniqueItems`
- Zero custom types - strict adherence to library type principle

✅ **Type-Safe Implementation**

- All types use `openapi3-ts/oas31` exclusively (no custom ParameterMetadata or ParameterConstraints interfaces)
- Proper type guards (`hasExampleValue`, `isReferenceObject`) for type narrowing
- No type assertions (except where required by library types)
- Full `exactOptionalPropertyTypes: true` compliance

✅ **Pure Function Architecture**

- Refactored `extractExample()` into composable helper: `extractDefaultExample()`
- Refactored `extractSchemaConstraints()` to data-driven approach (reduced complexity from 16→5)
- All extraction functions are pure and unit-tested
- Complexity lint errors resolved through TDD refactoring

✅ **Comprehensive Test Coverage**

- Unit tests: `src/endpoints/parameter-metadata.test.ts` (29 tests passing)
- Integration tests: `src/endpoints/operation/process-parameter.test.ts` (20 tests passing)
- Characterization tests: `src/characterisation/parameter-metadata.char.test.ts` (9 tests passing)
- Snapshot tests: 7 snapshots updated with correct Session 6 metadata

✅ **Architecture Improvements**

- Updated ADR-018 with "Critical Architectural Boundary" clarifying OpenAPI 3.1-only downstream
- Removed all OpenAPI 3.0 checks (documents always 3.1 after upgrade)
- Refactored `load-openapi-document.ts` into clean directory structure (8 single-responsibility files)
- ESM-only architecture complete (no bundling, CLI working with preserved directory structure)

✅ **Quality Gates**

- 607/607 unit tests passing
- 157/157 snapshot tests passing
- 145/145 characterization tests passing
- 0 type errors
- 0 lint errors
- 0 complexity issues (all resolved through refactoring)

**Implementation Notes:**

- Example extraction follows OpenAPI 3.1 priority: `param.example` → `param.examples.default` → `schema.example` → `schema.examples.default`
- Scalar's upgrade converts 3.0 `example` to 3.1 `examples.default.value` format
- Constraints flow through to endpoint definitions and generated code
- Default values preserved in parameter metadata
- All metadata fields optional per OpenAPI spec (`exactOptionalPropertyTypes: true`)

**Files Modified:**

- `lib/src/endpoints/parameter-metadata.ts` - Pure metadata extraction functions
- `lib/src/endpoints/definition.types.ts` - Library-only type definitions
- `lib/src/endpoints/operation/process-parameter.ts` - Integration point
- `lib/src/shared/load-openapi-document/` - Refactored into 8 files
- `lib/tsup.config.ts` - ESM-only, no bundling
- `docs/architectural_decision_records/ADR-018-openapi-3.1-first-architecture.md` - Architectural boundary documentation

**Validation Results:**

1. ✅ `pnpm test -- run src/context/template-context.test.ts` → passing
2. ✅ `pnpm test -- run src/endpoints/parameter-metadata.test.ts` → 29/29 passing
3. ✅ `pnpm character` → 145/145 passing (including parameter metadata tests)
4. ✅ Snapshot diffs reviewed - all show correct Session 6 metadata (enum, default)
5. ✅ Zero custom types created (strict library type usage verified)

**Estimated Effort:** 6-8 hours (Actual: ~8 hours including architecture improvements)

#### **Session 7 – JSON Schema Conversion Engine**

> **Detailed Plan:** See [`PHASE-2-SESSION-7-JSON-SCHEMA-CONVERSION.md`](./PHASE-2-SESSION-7-JSON-SCHEMA-CONVERSION.md) for goals, acceptance criteria, definition of done, and validation steps.

- **Focus:** Implement core OpenAPI → JSON Schema Draft 07 conversion and **upstream API security metadata extraction (Layer 2)**.
- **Design Constraint:** Direct conversion (NOT via Zod). Parallel converter alongside `typescript/` and `zod/` directories.
- **⚠️ Security Scope:** Extract **upstream API authentication** (Layer 2 - from OpenAPI specs), NOT MCP protocol auth (Layer 1 - handled by MCP SDK).
- **Acceptance Criteria**
  - OpenAPI → JSON Schema Draft 07 conversion implemented in `lib/src/conversion/json-schema/`
  - Core converters for primitives, objects, arrays, composition (allOf/anyOf/oneOf)
  - Reference resolution ($ref handling) with proper Draft 07 structure:
    - Rewrite `#/components/schemas/*` → `#/definitions/*`
    - Preserve circular refs (MCP handles at runtime)
  - **Upstream API security metadata extraction** (Layer 2):
    - Extract auth types (OAuth, Bearer, API Key, etc.) from OpenAPI `securitySchemes`
    - Extract scopes and requirements per operation
    - Use library types only (`SecuritySchemeObject`, `SecurityRequirementObject`)
    - TSDoc MUST warn: "Layer 2 upstream API, NOT Layer 1 MCP protocol"
  - Constraint mapping (min/max, patterns, formats) from OpenAPI to Draft 07
  - Type arrays for nullable: `type: ['string', 'null']` → `anyOf: [{type: 'string'}, {type: 'null'}]`
  - Unit tests for all converters (TDD approach)
  - Integration tests for complex schemas (nested objects, compositions, references)
  - AJV Draft 07 validation harness
- **Out of Scope:** Tool generation, templates, CLI flags (Session 8)
- **Validation Steps**
  1. `pnpm test -- run src/conversion/json-schema/*.test.ts` → All unit tests passing
  2. Validate output against JSON Schema Draft 07 meta-schema using AJV
  3. Manual verification: Convert petstore.yaml schemas and validate structure
  4. No regression in existing Zod/TypeScript conversion (parallel, not replacement)

> **Current status (Nov 6, 2025):** Session 7 deliverables are complete. Manual petstore verification captured in the session plan (`pnpm --filter @oaknational/openapi-to-tooling exec tsx --eval "<petstore Draft 07 inspection script>"`), contextual docs refreshed, and the samples snapshot harness now enforces inclusion of the custom multi-auth fixture. Ready to begin Session 8.

#### **Session 8 – MCP Tool Generation & Template Integration**

> **Detailed Plan:** See [`PHASE-2-SESSION-8-MCP-TOOL-GENERATION.md`](./PHASE-2-SESSION-8-MCP-TOOL-GENERATION.md) for objectives, workstreams, validation steps, and rule checklist.

- **Focus:** Generate MCP-compliant tool definitions and integrate with Handlebars templates.
- **Design Constraint:** Work within existing template system (Handlebars) - Phase 3 will migrate to ts-morph.
- **Acceptance Criteria**
  - **MCP Tool Definitions:**
    - Generate tool definitions with `inputSchema`/`outputSchema` using Session 7's JSON Schema converter
    - Enforce `"type": "object"` constraint at root level (per MCP spec)
    - Tool naming: convert `operationId` to `snake_case` (e.g., `getUser` → `get_user`)
    - Fallback naming: `{method}_{path_segments}` when operationId missing
    - Annotations from HTTP methods:
      - GET/HEAD/OPTIONS → `readOnlyHint: true`
      - DELETE → `destructiveHint: true`
      - PUT → `idempotentHint: true`
      - POST → no hints (varies by operation)
  - **MCP Tool Manifest (JSON):**
    - New CLI flag: `--emit-mcp-manifest <path>`
    - Generate JSON manifest with tool metadata (name, description, inputSchema, outputSchema)
    - Include security requirements per tool (from Session 7 security extraction)
    - Derive from template context (no additional schema pass)
    - Snapshot coverage in characterization tests
  - **Handlebars Template Extensions:**
    - New partial: `mcp-tool-schemas.hbs` for tool schema emission
    - Extend `schemas-with-metadata` template with MCP tool array
    - Export helper functions from generated code:
      - `getMcpToolName(operationId, method, path): string` - canonical MCP name
      - `getMcpToolHints(method): McpToolHints` - behavior hints object
    - Helpers use only template context data (no runtime OpenAPI access)
  - **Template Context Enhancements:**
    - Add `mcpTools` array to template context with tool definitions
    - Include JSON Schema representations for parameters and responses
    - Preserve existing context structure (backward compatible)
- **Out of Scope:** Type predicates, error formatting, documentation (Session 9)
- **Validation Steps**
  1. `pnpm test -- run src/context/template-context.test.ts` → MCP tools in context
  2. `pnpm test -- run src/rendering/templates/*.test.ts` → Template rendering with MCP data
  3. `pnpm character -- mcp` → MCP manifest generation tests
  4. Validate generated manifest against MCP 2025-06-18 schema structure
  5. Manual CLI test: `pnpm cli -- petstore.yaml --emit-mcp-manifest tools.json`
  6. Verify helper functions work in generated code (getMcpToolName, getMcpToolHints)

#### **Session 9 – Type Guards, Error Formatting & Documentation**

- **Focus:** Add runtime validation helpers, improve error messages, and complete documentation.
- **Acceptance Criteria**
  - **Type Predicates & Assertions:**
    - Implement `isMcpTool(value): value is McpTool` type guard
    - Implement `isMcpToolInput(value, toolName): boolean` validator
    - Implement `isMcpToolOutput(value, toolName): boolean` validator
    - Export from `lib/src/validation/mcp-type-guards.ts`
    - Unit tests for all type guards with positive/negative cases
  - **Enhanced Error Formatting:**
    - Convert Zod validation errors to MCP-friendly error messages
    - Include JSON path context (e.g., `inputSchema.properties.name`)
    - Map to JSON-RPC 2.0 error codes where appropriate
    - Preserve original error for debugging
    - Export `formatMcpValidationError(error): McpErrorResponse` helper
  - **Documentation Updates:**
    - README: Add MCP section with overview, quick start, examples
    - CLI docs: Document `--emit-mcp-manifest` flag with examples
    - TypeDoc: Document all MCP-related exports (converters, helpers, types)
    - Create `docs/MCP_INTEGRATION_GUIDE.md` with:
      - MCP server implementation guide
      - Tool manifest format explanation
      - Security configuration guidance (upstream API auth)
      - Example: Petstore API → MCP tools
    - Release notes: Summarize Phase 2 Part 2 deliverables
  - **Quality Gates:**
    - All tests passing (unit + snapshot + characterization)
    - 0 type errors, 0 lint errors
    - Generated MCP tools conform to spec
    - CLI smoke tests with representative fixtures
- **Validation Steps**
  1. `pnpm format && pnpm lint && pnpm build && pnpm type-check && pnpm test -- --run`
  2. `pnpm character` → All characterization tests passing
  3. Manual CLI tests:
     - Generate MCP manifest from petstore.yaml
     - Generate MCP manifest from multi-file spec
     - Verify helper functions in generated code
  4. Validate all generated manifests against MCP 2025-06-18 schema
  5. Documentation review: Verify all examples work, links valid, coverage complete
  6. Optional: `pnpm docs` (TypeDoc build) succeeds

---

## Alignment with Phase 2 Goals

- **5.2.1 OpenAPI Spec Validation (Fail-Fast)** – Achieved via Scalar's AJV-backed `validate()` pipeline and the structured error wrappers introduced in Part 1.
- **5.1 Investigation Tasks** – Analysis documents (JSON Schema conversion, MCP spec, security metadata) directly inform configuration and metadata emitted by the Scalar loader.
- **5.2.2 Enhanced Parameter Metadata / 5.3.x MCP Enhancements** – Bundle metadata (normalized specs, `x-ext`, version info) enables richer MCP outputs while ensuring templates operate on validated documents.
- **5.3.1 JSON Schema Export** – Part 2's `zod-to-json-schema` integration sits atop the validated Zod graphs created with the new pipeline.
- **5.3.2 Security Metadata Extraction** – Filesystem context and version information from Part 1 simplify resolving security schemes, including external references.
- **5.3.3 / 5.3.4 Type Guards & Error Formatting** – Improved validation detail feeds MCP readiness checks and user-facing error messaging.
- **5.4 Documentation & Quality Gates** – Documentation updates and quality gates continue to apply across Parts 1 and 2, with the characterisation suite ensuring regressions are caught.

---

## Deliverable Summary

| Part   | Sessions | Focus                               | Key Deliverables                                                                                                           |
| ------ | -------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Part 1 | 1-4 ✅   | Scalar Pipeline Re-architecture     | New loader/validator, `BundledOpenApiDocument`, removal of SwaggerParser, OpenAPI 3.1-first architecture, updated docs     |
| Part 2 | 5-6 ✅   | Foundation (Research + SDK)         | MCP analysis documents, parameter metadata extraction, schema constraints, pure function architecture                      |
| Part 2 | 7 ⏳     | JSON Schema Conversion              | OpenAPI → JSON Schema Draft 07 converter, security metadata extraction, parallel to Zod/TypeScript converters              |
| Part 2 | 8 ⏳     | MCP Tool Generation & Templates     | MCP tool definitions, `--emit-mcp-manifest` CLI flag, Handlebars template extensions, helper functions (naming/hints)      |
| Part 2 | 9 ⏳     | Type Guards, Errors & Documentation | Type predicates, MCP error formatting, comprehensive documentation (README, guides, TypeDoc), quality gates, release notes |

---

## Current Status & Next Steps

**Completed:**

- ✅ Phase 2 Part 1 (Sessions 1-4): Scalar pipeline re-architecture complete
- ✅ Session 5: MCP protocol research and analysis documents
- ✅ Session 6: SDK enhancements with parameter metadata extraction

**In Progress:**

- ⏳ Session 7: JSON Schema conversion engine (next immediate task)

**Upcoming:**

- Session 8: MCP tool generation & template integration
- Session 9: Type guards, error formatting & documentation

**Next Actions:**

1. Begin Session 7: Implement JSON Schema Draft 07 conversion engine
2. Follow TDD approach with comprehensive unit tests
3. Validate output against Draft 07 meta-schema
4. Extract security metadata for upstream API authentication

**References:**

- `.agent/RULES.md` - Coding standards and quality gates
- `.agent/analysis/JSON_SCHEMA_CONVERSION.md` - Conversion rules for Session 7
- `.agent/analysis/SECURITY_EXTRACTION.md` - Security metadata guidance
- `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` - MCP spec requirements
