# Living Context Document

**Last Updated:** November 6, 2025 6:45 PM  
**Purpose:** Session changelog + current status  
**Audience:** Everyone (humans + AI)  
**Update After:** Every work session

> **For big picture orientation, see:** `.agent/context/HANDOFF.md`  
> **For complete AI context, see:** `.agent/context/continuation_prompt.md`  
> **For session plans, see:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`

---

## 🔥 Right Now

**Current Session:** Phase 2 Part 2 - Session 7 (JSON Schema Conversion Engine) ✅ Complete  
**Next Session:** Session 8 (MCP Tool Generation) – ready to kick off  
**Branch:** `feat/rewrite`

### Session 7 Snapshot (Complete)

**What’s Done:**

- Keyword helper refactor completed: no `Object.keys`/`Reflect.*`, no type assertions, and discriminated helper results to satisfy Sonar (`keyword-array.ts`, `keyword-object.ts`, `keyword-helpers.ts`).
- Permissive fallback path implemented in `convertOpenApiSchemaToJsonSchema` with contextual warning + object schema fallback, plus new failure characterization test.
- Added module augmentation for OpenAPI 3.1 schemas to recognise `$dynamicRef`, `unevaluated*`, and `dependentSchemas`, keeping 2020-12 keywords typed.
- Expanded integration coverage: petstore-expanded + tictactoe fixtures now exercised through `json-schema.integration.test.ts`; AJV harness tightened to throw on async results.
- Security extraction hardened (reference guard) and TSDoc now explicitly flags Layer‑1 vs Layer‑2 responsibilities.
- Sample snapshot harness updated to merge official + custom fixtures, enforce presence of `custom/openapi/v3.1/multi-auth`, and regenerate snapshots.
- Manual verification (Nov 6, 2025 18:05): Ran `tsx --eval` against `petstore-expanded.yaml` to inspect `Pet` conversion; confirmed `allOf` rewrite to `#/definitions/NewPet`, `id` requirement retention, and AJV validation success for composite + inline schemas.
- Full quality suite rerun post-refactor (format/build/lint/type-check/test:all/character) — all green.

**Next Steps:**

- Begin Session 8 (MCP Tool Generation): wire converter outputs into MCP tool context, generate manifests, and extend template coverage.
- Draft detailed Session 8 execution checklist (tests, validation, documentation) before touching code.
- Maintain full-quality gate cadence after each major change (format → build → lint → type-check → test:all → character).

**Process Reminder:** Carry the Session 7 practice forward—run the full quality suite after targeted checks:  
`pnpm format && pnpm build && pnpm lint && pnpm type-check && pnpm test:all && pnpm character`

### Session 6 Summary (Complete)

**Deliverables:**

1. ✅ Enhanced parameter metadata extraction with pure functions
2. ✅ All 11 OpenAPI schema constraints supported
3. ✅ Zero custom types - strict library type usage
4. ✅ Type-safe implementation with proper type guards
5. ✅ Pure function architecture (all extractors unit tested)
6. ✅ ESM-only build (no bundling, directory structure preserved)
7. ✅ Refactored `load-openapi-document` into 8 single-responsibility files

**Key Achievements:**

- Parameters now include `constraints` (enum, min/max, patterns, etc.)
- Default values extracted and preserved
- Example extraction follows OpenAPI 3.1 priority rules
- All complexity issues resolved through TDD refactoring
- Updated ADR-018 with "Critical Architectural Boundary"
- 7 snapshot tests updated with correct metadata

**Actual Effort:** ~8 hours (implementation + architecture improvements)

### Immediate Next Actions (Session 8)

**Focus:** MCP Tool Generation – wire JSON Schema + security outputs into MCP tool context, emit manifests, extend template coverage

**See:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` Session 8 for detailed acceptance criteria

---

## ⚠️ Current Blockers

- None — cleared to start Session 8.

---

## 🤔 Active Decisions

**Type System Architecture - No Custom Types (November 5, 2025)**

Critical architectural principle enforced across all sessions:

- **ALWAYS use library types** from `openapi3-ts/oas31` and `@modelcontextprotocol/sdk/types.js`
- **NEVER create custom types** where library types exist (e.g., ParameterMetadata, ParameterConstraints interfaces are FORBIDDEN)
- **Use Pick/Extract patterns** to subset library types: `Pick<ParameterObject, 'description' | 'examples'>`
- **Maintain unbroken chain of truth** from authoritative library sources

See `.agent/context/continuation_prompt.md` § "Why No Custom Types?" for complete rationale.

---

## 🎯 Quality Gate Status

| Gate              | Status | Last Check          | Notes                                                                |
| ----------------- | ------ | ------------------- | -------------------------------------------------------------------- |
| `pnpm format`     | ✅     | Nov 6, 2025 6:32 pm | Ran Prettier root-wide (no functional diffs)                         |
| `pnpm build`      | ✅     | Nov 6, 2025 6:34 pm | `tsup` build clean                                                   |
| `pnpm type-check` | ✅     | Nov 6, 2025 6:36 pm | NodeNext project type-check passes                                   |
| `pnpm lint`       | ✅     | Nov 6, 2025 6:38 pm | Sonar + ESLint satisfied with new helper structure                   |
| `pnpm test:all`   | ✅     | Nov 6, 2025 6:41 pm | `vitest run` + `character` + snapshots all green                     |
| `pnpm character`  | ✅     | Nov 6, 2025 6:41 pm | Triggered via `pnpm test:all`; all characterization suites succeeded |

**Result:** All quality gates green. Re-run the full suite after any further edits.

---

## 📊 Session Log (Recent → Oldest)

### Session 7 - JSON Schema Conversion Engine (COMPLETE)

**Dates:** November 5–6, 2025  
**Duration:** ~8 hours  
**Status:** ✅ Complete

**What Changed:**

- Keyword helpers now expose `readSchemaKeyword` and discriminated result structs, eliminating type assertions and satisfying Sonar return-type rules.
- Array/object keyword appliers rewired to operate on the new discriminated results; additional-items logic handles tuple/boolean cases explicitly.
- New JSON Schema fallback guard logs context and returns `{}` (Draft 07 permissive object) when helper recursion throws.
- `openapi-schema-extensions.d.ts` augments `SchemaObject` with Draft 2020-12 keywords so refactored helpers can compile without assertions.
- Integration coverage now includes `petstore-expanded` & `tictactoe` fixtures; AJV harness tightened to throw if validation unexpectedly returns a Promise.
- Samples snapshot harness now merges official + custom fixtures and asserts inclusion of the multi-auth scenario; snapshot regenerated.
- Security extraction now fails fast on unresolved `$ref` schemes and TSDoc calls out Layer 1 vs Layer 2 responsibilities.
- Manual verification recorded: `tsx --eval` inspection of `petstore-expanded.yaml` confirmed `Pet` conversion (allOf rewrite, `id` requirement) with AJV validation for composite + inline schemas.
  - Command: `pnpm --filter @oaknational/openapi-to-tooling exec tsx --eval "<petstore Draft 07 inspection script>"` (see shell history 18:05) — captures `allOf` rewrite and AJV validation results.
- Documentation system updated (`context.md`, `HANDOFF.md`, `continuation_prompt.md`, `PHASE-2-MCP-ENHANCEMENTS.md`) to capture Session 7 completion and lessons learned.

**Quality Gates:** Full suite rerun after refactor — all green (see table above). Manual inspection noted above supplements automated validation.

### Session 6 - SDK Enhancements (COMPLETE)

**Date:** November 5, 2025  
**Duration:** ~8 hours  
**Status:** ✅ Complete

**What Changed:**

- Implemented parameter metadata extraction using pure functions and library types only:
  - `extractDescription()`, `extractDeprecated()`, `extractExample()`, `extractExamples()`, `extractDefault()`
  - `extractSchemaConstraints()` for 11 constraint types (enum, min/max, patterns, etc.)
  - `extractParameterMetadata()` orchestrator function
- Created type definitions using `Pick` patterns (zero custom types):
  - `SchemaConstraints` = `Pick<SchemaObject, 11 constraint fields>`
  - Parameter metadata uses `Pick<ParameterObject, ...> & Pick<SchemaObject, ...>`
- Implemented proper type guards (`hasExampleValue`) for type narrowing
- Refactored for complexity reduction:
  - `extractSchemaConstraints()` to data-driven approach
  - `extractExample()` into pure helper functions
  - Split `load-openapi-document.ts` into 8 single-responsibility files
- Architecture improvements:
  - ESM-only build (removed bundling, preserved directory structure)
  - Fixed `__dirname` usage for ESM (`import.meta.url`)
  - Templates correctly placed in `dist/rendering/templates/`
  - Updated ADR-018 with "Critical Architectural Boundary"
- Updated 7 snapshot tests with correct Session 6 metadata

**Key Deliverables:**

- Enhanced parameter metadata in endpoint definitions
- All 11 OpenAPI schema constraints extracted
- Example extraction with proper OpenAPI 3.1 priority
- Default values preserved in metadata
- Pure function architecture with full test coverage

**Quality Gates:** ✅ All passing (607 unit, 157 snapshot, 145 characterization tests)

**Files Modified:**

- `lib/src/endpoints/parameter-metadata.ts` - Pure extraction functions
- `lib/src/endpoints/definition.types.ts` - Library-only types
- `lib/src/endpoints/operation/process-parameter.ts` - Integration
- `lib/src/shared/load-openapi-document/` - Refactored into 8 files
- `lib/tsup.config.ts` - ESM-only, no bundling
- `docs/architectural_decision_records/ADR-018-openapi-3.1-first-architecture.md`

---

### Session 5 - MCP Protocol Research & Analysis (COMPLETE)

**Date:** November 5, 2025  
**Duration:** ~4 hours  
**Status:** ✅ Complete

**What Changed:**

- Created 3 comprehensive analysis documents (~15,000 words total):
  - `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` - MCP 2025-06-18 specification analysis
  - `.agent/analysis/JSON_SCHEMA_CONVERSION.md` - OpenAPI → JSON Schema Draft 07 conversion rules
  - `.agent/analysis/SECURITY_EXTRACTION.md` - Upstream API authentication extraction strategy
- Researched MCP specification version 2025-06-18 from official repo
- Confirmed JSON Schema Draft 07 requirement (not Draft 2020-12)
- Established parallel conversion strategy (OpenAPI → Zod + JSON Schema)
- Clarified two-layer authentication architecture (MCP protocol vs upstream API)
- Determined MCP SDK not needed for static artifact generation
- Documented tool structure constraints and naming conventions
- Updated PHASE-2-MCP-ENHANCEMENTS.md Session 5 with findings

**Key Decisions:**

- **JSON Schema Version:** Draft 07 (per MCP schema declaration)
- **Conversion Strategy:** Direct OpenAPI → JSON Schema (not via Zod)
- **Security Scope:** Extract upstream API auth metadata for documentation
- **Tool Naming:** operationId → snake_case convention
- **Annotations:** Map HTTP methods to behavior hints

**Quality Gates:** N/A (research/documentation session)

**Deliverables:** 3 analysis documents ready for Session 6-7 implementation

---

### Session 4 - Documentation & Final Cleanup (COMPLETE)

**Date:** November 5, 2025  
**Duration:** ~3 hours  
**Status:** ✅ Complete

**What Changed:**

- Created 3 comprehensive architecture documents (~5,000 words total):
  - `.agent/architecture/SCALAR-PIPELINE.md` (Scalar pipeline architecture)
  - `.agent/architecture/OPENAPI-3.1-MIGRATION.md` (Type system migration)
  - `docs/DEFAULT-RESPONSE-BEHAVIOR.md` (Default response handling)
- Enhanced TSDoc for all public APIs:
  - `generateZodClientFromOpenAPI()` - comprehensive parameter docs
  - `getZodClientTemplateContext()` - detailed examples
  - `getOpenApiDependencyGraph()` - full documentation
  - `defaultStatusBehavior` option - complete TSDoc
- Added 15+ inline architectural comments across critical files
- Updated `lib/README.md` to remove SwaggerParser references
- Established three-document system (HANDOFF, continuation_prompt, context)

**Quality Gates:** ✅ All passing (0 type errors, 0 lint errors, all tests green)

**Deliverables:** Production-ready codebase with comprehensive documentation

---

### Session 3 - Complete Technical Resolution (COMPLETE)

**Date:** November 4, 2025  
**Duration:** ~7 hours  
**Status:** ✅ Complete

**What Changed:**

- Created `isNullableType()` helper function (resolved 16 type errors)
- Modernized ALL test fixtures from OpenAPI 3.0 to 3.1 syntax (resolved 47 errors)
- Fixed Vitest v4 mock typing issues (resolved 16 errors)
- Migrated ALL tests to Scalar pipeline (resolved 18 errors)
- Unskipped ALL tests (4 tests fixed, 0 skipped remaining)
- Updated JSDoc examples to use `prepareOpenApiDocument`

**Quality Gates:** ✅ All passing - went from 77 type errors + 18 lint errors → 0 errors

**Deliverables:** Fully green codebase with working tests

---

### Session 2 - Loading & Bundling (COMPLETE)

**Date:** November 3-4, 2025  
**Duration:** ~6 hours  
**Status:** ✅ Complete

**What Changed:**

- Implemented `loadOpenApiDocument` using `@scalar/json-magic/bundle`
- Integrated `@scalar/openapi-parser/upgrade` for automatic 3.1 normalization
- Established intersection type strategy (`OpenAPIV3_1.Document & OpenAPIObject`)
- Implemented type guard `isBundledOpenApiDocument` for boundary validation
- Exported new API surface with comprehensive TSDoc
- Updated `prepareOpenApiDocument` to use Scalar pipeline internally
- Added characterisation tests for single-file and multi-file specs

**Quality Gates:** ✅ All passing

**Deliverables:** Scalar pipeline fully implemented and tested

---

### Session 1 - Foundation & Guardrails (COMPLETE)

**Date:** November 2-3, 2025  
**Duration:** ~4 hours  
**Status:** ✅ Complete

**What Changed:**

- Migrated type system from `openapi3-ts/oas30` to `openapi3-ts/oas31`
- Removed legacy dependencies:
  - `@apidevtools/swagger-parser` removed from package.json
  - `openapi-types@12.1.3` removed from package.json
- Added Scalar packages with pinned versions:
  - `@scalar/json-magic@0.7.0`
  - `@scalar/openapi-parser@0.23.0`
  - `@scalar/openapi-types@0.5.1`
- Created guard test (`lib/src/validation/scalar-guard.test.ts`) to prevent legacy imports
- Audited all `prepareOpenApiDocument` callers and documented expectations

**Quality Gates:** ✅ All passing

**Deliverables:** Type system migrated, legacy removed, guardrails in place

---

**For complete history, see:** `.agent/context/continuation_prompt.md`  
**For big picture orientation, see:** `.agent/context/HANDOFF.md`
