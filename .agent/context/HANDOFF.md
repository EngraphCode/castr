# Project Handoff & Orientation

**Last Updated:** November 10, 2025  
**Purpose:** Quick orientation hub and document navigation for current work  
**Read Time:** ~5-10 minutes

---

## 📍 Where We Are

**Current Phase:** Phase 3 Session 2 ⏳ **IN PROGRESS** - Section A ✅, Section B1 ✅, Section B2 ✅  
**Active Branch:** `feat/rewrite`  
**Last Commit:** (ready to commit Section B2)  
**Status:** Section A complete; Section B1 complete; Section B2 complete (linting issues resolved through proper refactoring)  
**Next:** Section C - CodeMetaData Replacement

### Phase Progress Overview

```
Phase 1: Tooling & Architecture                ✅ Complete
Phase 2 Part 1: Scalar Pipeline                ✅ Complete (Sessions 1-4)
Phase 2 Part 2: MCP Enhancements               ✅ Complete (Sessions 5-9)
Phase 3 Session 1: CodeMeta Elimination        ✅ Complete (ALL sections)
Phase 3 Session 1.5: Multi-File $ref Fix      ✅ Complete (Nov 12, 2025)
Phase 3 Session 2: IR Schema Foundations       ⏳ IN PROGRESS (A ✅, B1 ✅, B2 ✅, ~13h/24-34h)
```

### Session 3.2 Current Status (Nov 13, 2025) - ⏳ IN PROGRESS

**IR Schema Foundations - Section A ✅ Complete, Section B1 ✅ Complete, Section B2 ✅ Complete**

**Deliverables (Completed):**

- IR type definitions module: `lib/src/context/ir-schema.ts` (1058 lines)
  - All core IR interfaces defined: IRDocument, IRComponent, IROperation, IRSchema, IRSchemaNode, IRDependencyGraph
  - Supporting interfaces: IRInfo, IRParameter, IRRequestBody, IRMediaType, IRResponse, IRSecurityRequirement
  - Metadata interfaces: IRSchemaDependencyInfo, IRInheritanceInfo, IRZodChainInfo, IRDependencyNode
  - Comprehensive TSDoc with examples for all interfaces
  - Versioning policy documented
- IR validators module: `lib/src/context/ir-validators.ts` (143 lines)
  - Type guards: isIRDocument, isIRComponent, isIROperation, isIRSchema, isIRSchemaNode
  - Runtime validation for all IR structures
- **IR builder modules (layered architecture) - 7 focused modules:**
  - `ir-builder.types.ts` (34 lines) - Shared types (IRBuildContext)
  - `ir-builder.core.ts` (242 lines) - Core schema primitives (buildIRSchema, buildIRSchemaNode)
  - `ir-builder.schemas.ts` (72 lines) - Component schema extraction (buildIRSchemas)
  - `ir-builder.parameters.ts` (202 lines) - Parameter processing (buildIRParameters)
  - `ir-builder.request-body.ts` (152 lines) - Request body processing (buildIRRequestBody)
  - `ir-builder.responses.ts` (210 lines) - Response processing (buildIRResponses)
  - `ir-builder.operations.ts` (189 lines) - Operations orchestration (buildIROperations)
  - `ir-builder.ts` (81 lines) - Main entry point (buildIR)
  - **✅ All modules under 220 lines, zero linting errors, unidirectional dependencies**
- Test files: `ir-validators.test.ts`, `ir-builder.test.ts`
  - All 770 tests passing (includes operations tests)
  - All quality gates passing ✅

**Files Created:**

- `lib/src/context/ir-schema.ts` - IR type definitions
- `lib/src/context/ir-validators.ts` - Type guards
- `lib/src/context/ir-validators.test.ts` - Validator tests
- `lib/src/context/ir-builder.ts` - Main entry point
- `lib/src/context/ir-builder.types.ts` - Shared types
- `lib/src/context/ir-builder.core.ts` - Core schema primitives
- `lib/src/context/ir-builder.schemas.ts` - Component schema extraction
- `lib/src/context/ir-builder.parameters.ts` - Parameter processing
- `lib/src/context/ir-builder.request-body.ts` - Request body processing
- `lib/src/context/ir-builder.responses.ts` - Response processing
- `lib/src/context/ir-builder.operations.ts` - Operations orchestration
- `lib/src/context/ir-builder.test.ts` - Builder tests

**Next Steps:**

- **IMMEDIATE:** Section C - CodeMetaData Replacement
  - Replace all CodeMetaData references with IRDocument
  - Update all template usages to work with IR
  - Remove legacy CodeMetaData types
- Section D: Handlebars Complete Removal
- Section E: Quality Gates & Validation

**Impact:**

- ✅ Lossless IR schema established (Section A)
- ✅ Schema building complete (Section B1)
- ✅ Operations building complete with layered architecture (Section B2)
- ✅ Modular design enables maintainability and testability
- ✅ All quality gates passing (770 tests, zero linting errors)
- ✅ IRSchemaNode ready to replace CodeMetaData
- ✅ Type guards enable safe runtime validation

### Session 3.1.5 Final Status (Nov 12, 2025) - ✅ COMPLETE

**Multi-file $ref resolution working - Scalar x-ext vendor extension fully supported**

**Deliverables:**

- Centralized ref resolution module: `lib/src/shared/ref-resolution.ts`
- Enhanced component lookup with dual-path resolution (x-ext → standard fallback)
- 8+ duplicate implementations consolidated across 9 files
- Multi-file fixture re-enabled in all 4 validation test files
- 26 ref resolution unit tests + 20 validation tests passing
- All quality gates GREEN (711+ tests)

**Files Created:**

- `lib/src/shared/ref-resolution.ts` - `ParsedRef` interface, `parseComponentRef()`, `getSchemaNameFromRef()`
- `lib/src/shared/ref-resolution.test.ts` - Comprehensive unit tests

**Files Modified:**

- Enhanced `lib/src/shared/component-access.ts` with x-ext support
- Updated 9 ref resolution call sites across conversion and context modules
- Re-enabled multi-file in `lib/tests-generated/*.gen.test.ts`
- Updated `lib/tests-generated/FIXTURES.md` documentation

**Impact:**

- ✅ Multi-file OpenAPI specs fully supported (Phase 4 unblocked)
- ✅ Zero behavioral changes for single-file specs (backward compatible)
- ✅ Clear, maintainable ref resolution architecture
- ✅ Scalar file provenance tracking preserved

### Session 3.1 Summary (Nov 11, 2025) - ✅ COMPLETE

**CodeMeta abstraction eliminated - Pure function architecture established**

**Sections A, B, C:**

- Pure functions extracted to `lib/src/conversion/zod/code-generation.ts`
- CodeMeta completely deleted (0 mentions remaining)
- All handlers return plain objects `{ code: string; schema: SchemaObject; ref?: string }`

**Bug Fix #1:** Reference resolution in `handleReferenceObject()` ✅

- Root cause: Function returned empty `code` instead of schema name for object properties with $ref
- Fix: Return `{ ...code, code: schemaName }` for all reference paths in `handlers.core.ts`
- TDD approach: Created `handlers.core.test.ts` with 3 failing unit tests → RED → implemented fix → GREEN
- Impact: Eliminated syntax errors in generated code (e.g., `winner: ,` → `winner: winner`)

**Bug Fix #2:** Duplicate error responses in generated code ✅

- Root cause: Template rendered errors from BOTH `responses` array AND `errors` array when `withAllResponses` enabled
- Fix: Modified `schemas-with-metadata.hbs` template to only render `errors` when `responses` doesn't exist
- Impact: Template changes initially introduced regression, but all issues resolved in Section D

**Section D0:** Generated Code Validation Infrastructure ✅

- Created `lib/tests-generated/` directory structure with modular validation harness
- Created reusable validation harness: `validation-harness.ts`, `temp-file-utils.ts`
- Created 4 modular test files: `syntax-validation.gen.test.ts`, `type-check-validation.gen.test.ts`, `lint-validation.gen.test.ts`, `runtime-validation.gen.test.ts`
- Documented fixtures in `lib/tests-generated/FIXTURES.md`
- Created `lib/vitest.generated.config.ts`
- Wired `pnpm test:gen` scripts in both `lib/package.json` and root via Turbo
- All 16 tests passing (4 fixtures × 4 validation types)
- Fixed 9 pre-existing type errors in test files
- Updated `.gitignore`, `lib/eslint.config.ts`, `turbo.json`

**Section D:** All Critical Blockers Resolved ✅

**1. Code Generation Regression - FIXED:**

- Updated 4 snapshot tests to use `.code` property instead of `.toString()` on `ZodCodeResult` objects
- All snapshot tests now passing

**2. Linting Violations (60 errors) - RESOLVED:**

- Fixed `validation-harness.ts` to use public TypeScript Compiler API
- Refactored complex functions into smaller helpers
- Removed console statements from test files
- Used `describe.each()` to reduce function nesting
- Added proper eslint-disable comments for Handlebars (temporary, Phase 3.7 removal)

**3. Workspace Hygiene - COMPLETE:**

- Deleted 6 stray `.mjs` files from `lib/` root (TypeScript-only policy enforced)

**Quality Gate Status (Session 3.2 - Nov 13):**

- ⚠️ **BLOCKED:** format ✅, build ✅, type-check ✅, lint ❌ (33 errors), test:all ✅ (770), test:gen ✅ (20), test:snapshot ✅ (158), character ✅ (148)

**Quality Gate Status (Session 3.1.5 - Nov 12):**

- ✅ **ALL GREEN:** format, build, type-check, lint, test (711+), test:gen (20), test:snapshot (158), character (148)

### Recent Milestone

```

pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js examples/openapi/v3.0/petstore-expanded.yaml --emit-mcp-manifest ../tmp/petstore.mcp.json
pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js examples/custom/openapi/v3.1/multi-auth.yaml --emit-mcp-manifest ../tmp/multi-auth.mcp.json

```

Generates MCP manifests directly from the shared context. Petstore produces 4 tools (with warnings for `default`-only responses); multi-auth exercises layered security requirements. Outputs are archived under `tmp/*.mcp.json` for Workstream D notes.

### Session 8 Highlights (Nov 6–8, 2025)

- Helper modules for tool naming, behavioural hints, aggregated schemas, and security power `mcpTools`; template context + Handlebars exports now consume them with unit coverage.
- CLI `--emit-mcp-manifest` is now a thin wrapper around the shared context, and characterisation tests prove CLI ↔ programmatic parity.
- Added `template-context.mcp.inline-json-schema.ts`, ensuring manifest input/output schemas inline `$ref` chains into standalone Draft 07 objects; helper now satisfies Sonar return-type rules.
- Snapshot hygiene push: major suites (hyphenated parameters, export-all-types, export-all-named-schemas, export-schemas-option, schema-name-already-used) now draw expectations from fixture modules instead of inline megasnapshots; remaining inline suites documented.
- Path utilities shed the slow regex; deterministic parsing preserves both templated (`/users/:id`) and original (`/users/{id}`) forms in manifest metadata.
- Full quality gate stack (`lint`, `test`, `test:snapshot`, `type-check`, `build`, `character`) is green on `feat/rewrite`.
- Manual CLI manifest runs captured for `examples/openapi/v3.0/petstore-expanded.yaml` (4 tools, `default`-only response warning) and `examples/custom/openapi/v3.1/multi-auth.yaml` (2 tools, layered security); artefacts stored in `tmp/*.mcp.json`.
- Ready to kick off Session 9: backlog includes type guards, error formatting, and README/CLI documentation for the new manifest workflow.

---

## 🗺️ Document Navigation

### For Quick Orientation (You Are Here)

- **📄 HANDOFF.md** - This document - Big picture orientation and navigation

### For Current Status & Recent Work

- **📝 context.md** - Living status log with recent session changes and immediate next actions

### For Complete AI Context

- **🤖 continuation_prompt.md** - Comprehensive AI rehydration with full history and architecture

### For Detailed Plans

- **📋 PHASE-2-MCP-ENHANCEMENTS.md** - Session-by-session implementation plan with acceptance criteria
- **🧭 PHASE-2-SESSION-9-MCP-TYPE-GUARDS-DOCS.md** - Detailed Session 9 workstreams, objectives, acceptance criteria, validation steps

### For Documentation System

- **📚 README.md** - How to use this three-document system effectively

### For Standards & Rules

- **⚖️ RULES.md** - Coding standards (TDD, TSDoc, type safety) - **MANDATORY**

### For Architecture Details

- **🏗️ SCALAR-PIPELINE.md** - Scalar pipeline architecture (~3,000 words)
- **🔄 OPENAPI-3.1-MIGRATION.md** - Type system migration guide
- **📖 DEFAULT-RESPONSE-BEHAVIOR.md** - Default response handling

---

## 🚀 Quick Start

### Starting Fresh (Cold Start)

**For AI in new chat:**

```

I'm continuing development on openapi-zod-client. Please read:

@continuation_prompt.md
@context.md
@PHASE-2-MCP-ENHANCEMENTS.md
@RULES.md

Then:

1. Summarize current state
2. Identify next session
3. Create detailed implementation plan with acceptance criteria
4. Begin work following TDD

Follow ALL standards in @RULES.md.

```

**For humans:**

1. Read this HANDOFF.md (5 min orientation)
2. Check context.md for current status (Session 8 complete; Session 9 pending kickoff)
3. Review PHASE-2-MCP-ENHANCEMENTS.md § Session 8 acceptance criteria before implementation
4. Draft detailed Session 8 execution plan (tool context + manifest generation) and proceed with TDD

### Continuing Work (Warm Start)

**For AI in same chat:**

```

Continue with [next task/session] as planned. Follow TDD and RULES.md standards.

```

**For humans:**

1. Check context.md for current status
2. Review immediate next actions
3. Pick up where you left off

---

## 🏗️ Architecture Overview

### Core Design: Scalar Pipeline + OpenAPI 3.1

```

Input (3.0 or 3.1 spec: file, URL, or object)
↓
bundle() via @scalar/json-magic
↓ (resolves external $refs, preserves internal $refs)
upgrade() via @scalar/openapi-parser
↓ (normalizes ALL specs to OpenAPI 3.1)
Validate & type with intersection
↓ (type guard converts loose → strict types)
BundledOpenApiDocument
↓ (OpenAPIV3_1.Document & OpenAPIObject)
All downstream code uses oas31 types
↓
Code generation, validation, MCP tools

```

### Key Architectural Decisions

**1. OpenAPI 3.1 Internal Type System**

- All specs auto-upgraded to 3.1 after bundling
- Single type system eliminates version branching
- Simpler codebase, future-proof architecture

**2. Intersection Type Strategy**

- `OpenAPIV3_1.Document & OpenAPIObject`
- Scalar's extensions + strict typing
- Type guards at boundaries (no casting)

**3. Scalar Pipeline Benefits**

- Deterministic bundling
- Better validation (AJV-backed)
- Multi-file support
- Richer metadata
- Active maintenance

**4. No Custom Types**

- ALWAYS use library types (openapi3-ts/oas31, @modelcontextprotocol/sdk/types.js)
- NEVER create custom types where library types exist
- Use Pick/Extract patterns to subset library types
- Maintain unbroken chain of truth from library definitions

**See:** `.agent/architecture/SCALAR-PIPELINE.md` for complete details

---

## 📦 Key Deliverables

### Production Code

✅ **Scalar Pipeline Implementation**

- `lib/src/shared/load-openapi-document.ts` - Core Scalar loader
- `lib/src/shared/prepare-openapi-document.ts` - Public API wrapper
- 3-stage pipeline: bundle → upgrade → validate

✅ **Type System Migration**

- All code uses `openapi3-ts/oas31` types
- `isNullableType()` helper for OpenAPI 3.1 nullable detection
- Type guards for boundary validation

✅ **Test Suite**

- 0 skipped tests (strict policy)
- All tests migrated to Scalar pipeline
- Comprehensive characterisation coverage

### Documentation

✅ **Architecture Documentation** (~5,000 words total)

- Scalar pipeline details and design decisions
- OpenAPI 3.1 migration guide
- Default response behavior guide

✅ **Enhanced TSDoc**

- All public APIs documented with examples
- 15+ inline architectural comments
- Comprehensive parameter documentation

✅ **Context Documentation**

- Three-document system (this HANDOFF, context, continuation_prompt)
- README with usage patterns
- Session-by-session plans

### Quality Verification

✅ **All Quality Gates Green**

- `pnpm type-check` → 0 errors
- `pnpm lint` → 0 errors
- `pnpm test:all` → All passing, 0 skipped
- `pnpm build` → Clean builds
- `pnpm format` → Consistent style

---

## 🎯 Common Patterns

### Type Guard Pattern (Boundary Validation)

```typescript
export function isBundledOpenApiDocument(doc: unknown): doc is BundledOpenApiDocument {
  if (!doc || typeof doc !== 'object') return false;

  const candidate = doc as Record<string, unknown>;

  if (!candidate.openapi || typeof candidate.openapi !== 'string') return false;
  if (!candidate.openapi.startsWith('3.1')) return false;

  return true;
}
```

### OpenAPI 3.1 Nullable Check

```typescript
export function isNullableType(schema: SchemaObject): boolean {
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  return types.includes('null');
}
```

### TDD Cycle (Mandatory)

1. Write failing test FIRST
2. Run test - confirm RED
3. Write minimal implementation
4. Run test - confirm GREEN
5. Refactor while protected by tests

**See:** `.agent/RULES.md` for complete patterns and standards

---

## ✅ Success Criteria

### Session Complete When:

- [ ] All acceptance criteria met
- [ ] All tests passing (`pnpm test:all`)
- [ ] 0 type errors (`pnpm type-check`)
- [ ] 0 lint errors (`pnpm lint`)
- [ ] 0 skipped tests
- [ ] TSDoc added/updated for changed APIs
- [ ] Documentation updated (context.md, continuation_prompt.md, plan)
- [ ] Changes committed with comprehensive message

### Phase Complete When:

- [ ] All sessions delivered
- [ ] All quality gates green
- [ ] Comprehensive documentation delivered
- [ ] Manual smoke tests passing
- [ ] Characterisation tests updated
- [ ] README/API docs updated
- [ ] Milestone commit with summary

---

## 🎓 Key Principles

### TDD (Test-Driven Development)

- Write failing test FIRST, always
- No implementation without failing tests
- Tests prove behavior, not implementation

### Type Safety

- NEVER use type escape hatches (`as`, `any`, `!`)
- Type guards with `is` keyword
- Validate at boundaries, trust internally
- ALWAYS use library types - custom types are forbidden

### Documentation

- Public APIs require comprehensive TSDoc with examples
- Internal APIs need `@param`, `@returns`, `@throws`
- Inline comments for architectural decisions

### Quality

- All quality gates must pass before commit
- No skipped tests (forbidden)
- Fail fast with actionable error messages

**See:** `.agent/RULES.md` for complete standards (MANDATORY reading)

---

## 🔄 What's Next

### Immediate Next Task

**Session 3.2 - Section B2: Resolve Linting Issues** (~2-3 hours to refactor properly)

**Goal:** Properly resolve 33 linting errors in `ir-builder.ts` without bypassing checks

**Root Causes Identified:**

1. **File too long:** 458 lines vs 220 max (violated when adding operations building)
2. **Function complexity:** buildIRParameters, buildIRRequestBody, buildIRResponses are too complex
3. **Type safety issues:** Type assertions, non-null assertions, widening/narrowing antipatterns
4. **Architecture issues:** Attempted circular dependencies when extracting to separate files

**Proper Solution Strategy:**

1. Create proper module architecture with clear dependency hierarchy
2. Extract schema-building primitives to shared module (used by both schemas and operations)
3. Split operations building into focused, single-responsibility modules
4. Use library types exclusively - trace type issues to source
5. Avoid widening then narrowing (preserve type information from OpenAPI library)
6. Remove all type assertions and non-null assertions

**Acceptance Criteria:**

1. All 33 linting errors resolved
2. No circular dependencies
3. Each file ≤ 220 lines
4. Each function ≤ complexity limits
5. No type escape hatches (as, !, any)
6. All 770 tests still passing
7. Zero behavioral changes

### Remaining Session 3.2 Work

**Section C: CodeMetaData Replacement** (~6-8 hours)

- Create `lib/src/conversion/zod/ir-metadata-adapter.ts`
- Update all Zod conversion functions to use IR metadata
- Delete CodeMetaData interface completely

**Section D: Handlebars Complete Removal** (~2-3 hours)

- Delete all 5 .hbs files, handlebars.ts, handlebars.test.ts
- Remove handlebars dependency from package.json
- Verify eradication

**Section E: Quality Gates & Validation** (~2-3 hours)

- Run full quality gate suite
- IR inspection & validation
- Documentation updates

**See:** `.agent/plans/PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md` for detailed plan

### Upcoming Sessions

- **Session 3.3:** IR Persistence & Validation Harness (~12-16 hours)
- **Session 3.4:** IR Enhancements & Additional Writers (~16-20 hours)
- **Session 3.5:** Bidirectional Tooling & Compliance (~20-24 hours)
- **Session 3.6:** Documentation & Release Prep (~8-12 hours)

**Note:** Original Sessions 3.4-3.7 (ts-morph migration and Handlebars removal) are eliminated since Handlebars is removed in Session 3.2.

---

## 📞 Key Contacts & Resources

**Repository:** `/Users/jim/code/personal/openapi-zod-client`  
**Branch:** `feat/rewrite`  
**Quality Gate:** `pnpm check` (format + build + type-check + lint + test:all)

**Documentation Locations:**

- `.agent/context/` - Status and context documents
- `.agent/plans/` - Phase and session plans
- `.agent/architecture/` - Architecture documentation
- `docs/` - User-facing documentation

**Quality Commands:**

```bash
pnpm format      # Format code
pnpm build       # Verify builds
pnpm type-check  # Check types (must be 0 errors)
pnpm lint        # Check lint (must be 0 errors)
pnpm test:all    # Run all tests (must all pass, 0 skipped)
pnpm check       # Run all quality gates
```

---

## 🚀 Phase 3 Progress (November 12, 2025)

**Current State:** Phase 3 Session 2 IN PROGRESS ⏳ - Section A ✅ Complete, Section B1 ✅ Complete, Section B2 ⏳ Next

**Phase 2 Completion Summary:**

- ✅ All 9 sessions delivered (Scalar pipeline + MCP enhancements)
- ✅ Quality gates GREEN: 982 tests (0 failures, 0 skipped)
- ✅ OpenAPI 3.1-first architecture established
- ✅ MCP tool generation with type guards, error formatting, comprehensive docs

**Phase 3 Sessions 1, 1.5, & 2 Progress:**

**Session 3.2 (Nov 13):** ⏳ IN PROGRESS - IR Schema Foundations

- [x] Section A Complete: IR type definitions (1058 lines) ✅
- [x] Section A Complete: IR validators (143 lines) ✅
- [x] Section B1 Complete: IR builder schemas ✅
- [ ] Section B2 Blocked: IR builder operations (implementation done, 33 lint errors need fixing) ⚠️
- [ ] Section C Pending: CodeMetaData replacement ⏳
- [ ] Section D Pending: Handlebars removal ⏳
- [ ] Section E Pending: Final validation ⏳
- [ ] Quality gates BLOCKED: Tests passing (770) but lint failing (33 errors) ❌

**Session 3.1 (Nov 11):** ✅ COMPLETED - CodeMeta abstraction DELETED, pure functions extracted

- [x] Zero files: `code-meta.ts`, `code-meta.test.ts` ✅
- [x] Zero mentions of "CodeMeta" in source (verified via grep) ✅
- [x] Pure functions module: `lib/src/conversion/zod/code-generation.ts` ✅
- [x] 30+ unit tests for pure functions ✅
- [x] Generated code validation infrastructure complete ✅
- [x] All quality gates GREEN ✅

**Session 3.1.5 (Nov 12):** ✅ COMPLETED - Multi-file $ref resolution working

- [x] Centralized ref resolution: `lib/src/shared/ref-resolution.ts` ✅
- [x] Dual-path component lookup (x-ext → standard fallback) ✅
- [x] 8+ duplicate implementations consolidated ✅
- [x] Multi-file fixture re-enabled in all 4 validation test files ✅
- [x] 26 ref resolution unit tests + 20 validation tests passing ✅
- [x] All quality gates GREEN (711+ tests) ✅

**Impact Achieved:**

- ✅ CodeMeta completely eliminated (405 lines deleted)
- ✅ Multi-file OpenAPI specs fully supported (Phase 4 unblocked)
- ✅ ts-morph migration unblocked (no legacy abstractions)
- ✅ Generated code validation infrastructure complete
- ✅ Clear, maintainable ref resolution architecture

**Current: Phase 3 Session 2 - IR Schema Foundations (IN PROGRESS)**

**Objective:** Define lossless Information Retrieval (IR) structure, replace CodeMetaData, remove Handlebars

**Status:** Section A ✅ Complete (8 hours), Section B1 ✅ Complete, Section B2 ⏳ Next

**Detailed Plan:** `.agent/plans/PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md`

**Estimated Effort:** 24-34 hours (8 hours complete)

**Phase 3 Remaining Impact:**

- Establish IR foundation + Remove Handlebars completely (Session 3.2)
- IR persistence and validation (Session 3.3)
- IR enhancements and additional writers (Session 3.4)
- Enable modular writer architecture (types, metadata, zod, client, mcp)

---

**Welcome to the project!** 🎉  
This HANDOFF document gives you the big picture. For recent changes, see **context.md**. For complete AI context, see **continuation_prompt.md**. Phase 2 is complete - Phase 3 awaits!
