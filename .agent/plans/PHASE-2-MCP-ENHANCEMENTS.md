# MCP Enhancement Plan – Phase 2 (Restructured)

**Date:** October 25, 2025  
**Phase:** 2 (split into Part 1 and Part 2)  
**Status:** Planning  
**Estimated Duration:** 4–6 weeks (Part 1 ~2 weeks, Part 2 ~2–3 weeks)  
**Prerequisites:** Architecture Rewrite Phases 0–3 complete, All quality gates green, Zod v4 update complete ✅

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

### Session Plan (Part 2)

> **Note:** Task 5.2.1 ("OpenAPI Spec Validation, Fail-Fast") is delivered by Part 1. Sessions below build on the Scalar pipeline output.

#### **Session 5 – MCP Investigation**

- **Focus:** Produce the analysis artefacts that drive implementation.
- **Acceptance Criteria**
  - `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` documents MCP tool structure, JSON Schema constraints, security expectations, and error format guidance.
  - `.agent/analysis/JSON_SCHEMA_CONVERSION.md` records the `zod-to-json-schema` configuration, edge cases, and testing strategy.
  - `.agent/analysis/SECURITY_EXTRACTION.md` outlines the security metadata extraction algorithm (operation-level + component-level resolution).
- **Validation Steps**
  1. Peer-check documents for completeness against MCP spec (link references).
  2. `pnpm lint` (markdown/docs) if applicable.
  3. Summarise key decisions in commit message or plan notes.

#### **Session 6 – SDK Enhancements**

- **Focus:** Enrich SDK-facing artefacts with metadata unlocked by the Scalar pipeline.
- **Acceptance Criteria**
  - Enhanced parameter metadata (descriptions, examples, constraints) emitted by generation templates; accompanying tests cover representative specs.
  - Rate-limiting/constraint metadata extracted when present and surfaced in template context.
  - No regression in existing SDK outputs (schemas-with-metadata template stays stable aside from intentional additions).
- **Validation Steps**
  1. `pnpm test -- run src/context/template-context.test.ts`
  2. Regenerate characterisation fixtures: `pnpm test --filter characterisation -- sdk`
  3. Manual diff of generated Engraph fixture to ensure metadata additions are correct.

#### **Session 7 – MCP Tool Enhancements**

- **Focus:** Deliver MCP-ready outputs (JSON Schema, security metadata, predicates, error formatting).
- **Acceptance Criteria**
  - Zod → JSON Schema conversion integrated via `zod-to-json-schema` (refs inlined, conforms to MCP requirements).
  - Security metadata (auth schemes, scopes) attached to MCP tool definitions.
  - Type predicates / assertion helpers (`isMcpToolInput`, `assertMcpToolInput`, `assertMcpToolOutput`) implemented with tests.
  - Enhanced error formatting converts Zod/JSON Schema failures into MCP-friendly messages with context.
- **Validation Steps**
  1. `pnpm test -- run src/mcp/*.test.ts`
  2. `pnpm test --filter characterisation -- mcp`
  3. Validate JSON Schema output using a Draft 2020-12 validator (document command/output in commit notes).

#### **Session 8 – Documentation & Final Validation**

- **Focus:** Update outward-facing docs and ensure everything ships cleanly.
- **Acceptance Criteria**
  - README/CLI documentation expanded with MCP sections, CLI flags, SDK & MCP examples.
  - TypeDoc (or documented API surface) reflects new exports and helpers.
  - Release notes / changelog entry summarises Phase 2 deliverables.
  - Full quality gate passes from a clean tree.
- **Validation Steps**
  1. `pnpm format && pnpm lint && pnpm build && pnpm type-check && pnpm test -- --run`
  2. Manual CLI smoke tests covering new flags (`--with-type-predicates`, `--validate-mcp-readiness`, etc.) with results recorded.
  3. Optional: run `pnpm docs`/TypeDoc build to ensure documentation compiles.

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

| Part   | Focus                           | Key Deliverables                                                                        |
| ------ | ------------------------------- | --------------------------------------------------------------------------------------- |
| Part 1 | Scalar Pipeline Re-architecture | New loader/validator, `PreparedOpenApiDocument`, removal of SwaggerParser, updated docs |
| Part 2 | MCP Enhancements                | JSON Schema export, security metadata, MCP readiness checks, TypeDoc/README updates     |

---

## Next Steps

1. Confirm prerequisites are complete (Architecture Rewrite ✓, Zod v4 ✓).
2. Start Phase 2 Part 1 milestones in order (foundation → integration).
3. Once Part 1 is merged, kick off Part 2 tasks using the investigation documents as guides.
4. Update roadmap/changelog to reflect two-part delivery.

All contributors should reference this document, `.agent/RULES.md`, and `.agent/plans/01-CURRENT-IMPLEMENTATION.md` to ensure consistency, especially around TDD and TSDoc expectations.
