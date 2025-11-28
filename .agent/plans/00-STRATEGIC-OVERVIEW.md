# Strategic Plan: openapi-zod-client Modernization

**Date:** October 24, 2025  
**Status:** Active Implementation  
**Goal:** Modernize codebase for extraction to Engraph monorepo

> **Intended Impact**  
> Every consumer—CLI, programmatic API, or downstream MCP tooling—must experience the same predictable, spec-compliant behaviour whenever they hand us an OpenAPI document. Valid specs sail straight through and produce deterministic artefacts; invalid specs fail fast with actionable guidance direct from the official schema. Comprehensive tests and documentation make that contract boringly reliable, unlocking the rest of the modernization roadmap.

---

## Executive Summary

This fork of `openapi-zod-client` is being modernized to generate strict Zod schemas and MCP tool validation from OpenAPI 3.0/3.1 specifications. The work will be extracted and ported to the Engraph SDK monorepo to auto-generate request/response validators for MCP tools wrapping Engraph API endpoints.

**Target Repository:** `engraph-monorepo`  
**Extraction Blocker:** 74 type assertions must be eliminated (target repo: `assertionStyle: "never"`)

---

## Requirements Alignment

**See:** `.agent/plans/requirements.md` for high-level project requirements

This strategic plan ensures all 8 requirements are met:

- **Req 1-3:** Core functionality (Zod generation, SDK creation, validation helpers) - Phase 1 & 2
- **Req 4-6:** MCP integration (SDK→MCP tools, validation architecture, JSON schemas) - Phase 2 Part 2
- **Req 7:** Fail-fast philosophy - ADR-001, enforced throughout
- **Req 8:** Highest standards, test-defined behavior - TDD mandate, comprehensive test coverage

---

## 🎯 Engineering Excellence & Development Methodology

> **Core Philosophy:** Excellence and long-term stability over speed, every time. Types are our friend - they reveal architectural problems that need fixing, not nuisances to bypass.

### Engineering Excellence Principles

**1. Type System Discipline (Zero Tolerance)**

- ❌ **FORBIDDEN:** `as` (except `as const`), `any`, `!`, `Record<string, unknown>`, `Object.*`, `Reflect.*`
- ✅ **REQUIRED:** Library types first, proper type guards, no type widening, preserve literal types
- ✅ **MANDATE:** Zero escape hatches - if types don't match, fix the architecture, not the types

**2. Clean Breaks, Not Hacks**

- No compatibility layers that become permanent
- No "temporary" solutions that never get fixed
- No `// TODO: refactor later` comments
- Fix root causes, not symptoms

**3. Library Types First**

- Use `openapi3-ts/oas31` types before creating custom types
- Use proper type guards from libraries where possible
- Defer to domain experts who maintain library types
- Custom types are a last resort requiring explicit justification

### Test-Driven Development (Mandatory)

**ALL implementation work MUST follow TDD:**

1. **Write failing tests FIRST** - Before any implementation code
2. **Run tests - confirm failure** - Proves tests actually validate behavior
3. **Write minimal implementation** - Only enough code to pass tests
4. **Run tests - confirm success** - Validates implementation works
5. **Refactor if needed** - Clean up with test protection
6. **Repeat for each feature** - No exceptions

**Why TDD is mandatory:**

- Prevents regressions (every change protected by tests)
- Documents behavior (tests as living documentation)
- Validates tests work (seeing failure first proves effectiveness)
- Forces good design (untestable code signals design issues)
- Enables safe refactoring (test coverage provides confidence)

**No exceptions:** "I'll add tests later" is NOT ALLOWED. See `.agent/RULES.md` for detailed TDD guidelines.

### Quality Gates (Non-Negotiable)

All 8 quality gates must pass GREEN before any code is considered complete:

```bash
pnpm format    # Code formatting
pnpm build     # Compilation
pnpm type-check # Type checking
pnpm lint      # Code quality
pnpm test      # Unit + integration tests
pnpm test:gen  # Generated code validation
pnpm test:snapshot # Snapshot tests
pnpm character # Characterization tests
```

**Critical Learning from Phase 3:** When quality gates fail, we stop and fix the root cause. We don't add workarounds or disable checks. The type system is showing us problems we need to solve.

---

## Current State (October 24, 2025)

### Quality Gates

```
✅ format      - Passing
✅ build       - Passing (ESM + CJS + DTS)
✅ type-check  - Passing (0 errors)
✅ lint        - Passing (0 errors)
✅ test        - Passing (828 tests)
```

### Key Metrics

- **TypeScript Errors:** 0 ✅
- **Tests:** 828 passing (Unit) + 178 (Snapshot) + 159 (Char) ✅
- **Cognitive Complexity:** 0 violations ✅
- **Type Assertions:** 0 (in production code) ✅

### Dependencies (Current → Target)

- `openapi3-ts`: v3 → v4.5.0 (June 2025)
- `zod`: v3 → v4.1.12 (October 2025)
- `pastable`: v2.2.1 → **REMOVE** (replace with lodash/native)
- `@zodios/core`: v10.9.6 → evaluate maintenance
- `openapi-types`: v12.1.3 → evaluate necessity
- `@stryker-mutator/core`: none → v9.2.0 (October 2025)

---

## Strategic Phases

### Phase 1: Foundation (🔄 IN PROGRESS - Part 4)

**Status:** Parts 1-3 Complete, Part 4 Planned  
**Duration:** October 22-28, 2025

**Parts 1-3 Complete:**

- Modernized all developer tooling
- Migrated to pure ESM with NodeNext resolution
- Eliminated all cognitive complexity violations
- Fixed all critical type safety errors
- Established comprehensive testing (297 tests)
- Created 12 Architecture Decision Records
- Documented all coding standards (RULES.md)

**Part 4 (In Progress - 6-8 hours):**

- ⏳ **Unified Input Handling** - Extract SwaggerParser logic from CLI
- ⏳ Support both file paths and pre-parsed specs in programmatic API
- ⏳ 4 use case matrix: [CLI, Import] × [With Refs, Without Refs]
- ⏳ Characterisation tests for all use cases
- ⏳ Deep TDD with unit tests for parseOpenApiInput helper
- ⏳ Maintain backward compatibility (openApiDoc still works)

**Key Decisions:**

- Fail fast on spec violations (ADR-001)
- Defer types to openapi3-ts (ADR-002)
- Type predicates over boolean filters (ADR-003)
- Pure functions & single responsibility (ADR-004)
- ESM with NodeNext resolution (ADR-007)
- Replace cac with commander (ADR-008)
- Replace Preconstruct with tsup (ADR-009)
- Use Turborepo for orchestration (ADR-010)
- Unified input handling across entry points (Part 4)

---

### Phase 2: Unified Validation & MCP Enablement (🔄 IN PROGRESS)

**Status:** Planning complete, implementation split into two parts  
**Reference Plan:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`

| Part                                         | Focus                                                                                                                                   | Status     | Key Outcomes                                                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| **Part 1 – Scalar Pipeline Re-architecture** | Replace `SwaggerParser.bundle()` path with staged Scalar pipeline (json-magic bundling, openapi-parser validation, normalized metadata) | 🟡 Planned | Deterministic multi-file handling, richer validation errors, preserved `$ref`s, unified `PreparedOpenApiDocument` |
| **Part 2 – MCP Enhancements**                | Build MCP-specific outputs atop the new pipeline (JSON Schema export, security metadata, MCP readiness checks)                          | 🟡 Planned | MCP tool generation parity, SDK→MCP validation flow, documentation updates                                        |

**Part 1 Milestones**

1. **Foundation & Guardrails:** Inventory `prepareOpenApiDocument` usages, add Scalar dependencies, enforce lint guard against SwaggerParser.
2. **Loading & Bundling:** Implement `loadOpenApiDocument` via `@scalar/json-magic/bundle` with filesystem/HTTP plugins and lifecycle hooks to preserve internal `$ref`s.
3. **Validation & Transformation:** Wrap `@scalar/openapi-parser.validate/sanitize/upgrade` into `validateOpenApiWithScalar`, translating AJV errors into existing CLI/programmatic surfaces.
4. **Normalization & Types:** Define `PreparedOpenApiDocument` (Scalar + `openapi3-ts` types + bundle metadata) and adapt downstream modules (dependency graph, conversion) to consume it.
5. **Integration & Migration:** Replace `prepareOpenApiDocument` implementation, toggle legacy path behind feature flag during rollout, update CLI messaging (`--sanitize`, `--upgrade`).
6. **Documentation, Cleanup & Follow-up:** Refresh README/API docs, provide code examples, remove SwaggerParser dependency, log follow-up opportunities (e.g., partial bundling, `@scalar/openapi-types/schemas` usage).

**Part 2 Highlights**

- JSON Schema export from Zod via `zod-to-json-schema`
- Security metadata extraction aligned with MCP expectations
- MCP tool predicates/assertions with richer error formatting
- Documentation upgrades (README, CLI help, examples)

**Requirements Advancement**

- **Req 4–6:** SDK→MCP validation flow and JSON Schema deliverables addressed in Part 2.
- **Req 7, 10, 13:** Scalar validation pipeline (Part 1) enforces fail-fast, helpful errors across CLI/programmatic entry points.
- **Req 11–12:** json-magic bundling + optional dereference snapshots cover `$ref` handling.
- **Req 14:** TDD + documentation mandates preserved across both parts.

See `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` for detailed task breakdowns and sequencing.

---

### Phase 3: Typed IR & ts-morph Migration (PLANNED)

**Status:** IN PROGRESS (Session 3.3 Ready)  
**Duration:** ~5–6 weeks (IR foundation, emitter migration, compliance tooling)

**⚠️ MANDATORY:** All tasks follow TDD + schema validation gates.

**See:** `.agent/plans/PHASE-3-TS-MORPH-IR.md` for milestones and sequencing.

**Objectives:**

1. **Define & Persist IR:** Finalise a lossless information retrieval architecture capturing schemas, endpoints, and metadata required for round-tripping.
2. **ts-morph Emitter:** Replace Handlebars templates with the typed emitter from `.agent/reference/openapi-zod-client-emitter-migration.md`, supporting both disk output and in-memory strings.
3. **Full Migration:** Switch CLI/programmatic flows to the emitter, remove Handlebars assets, maintain feature parity.
4. **Bidirectional Tooling:** Enable IR → OpenAPI regeneration, validate output against official schemas in `.agent/reference/openapi_schema/`, and document reverse workflows.

**Success Criteria:**

- Handlebars removed from generation pipeline.
- IR serialisation/API available for forward/backward transformations.
- OpenAPI documents produced post-migration pass schema validation (3.1+ official specs).
- Characterisation tests cover OpenAPI → IR → Zod → IR → OpenAPI round-trip.
- Public API/CLI remain backwards compatible (cosmetic diffs allowed).

**Follow-up Enhancements:** prior DX/testing backlog moved to `archive/PHASE-3-FURTHER-ENHANCEMENTS-LEGACY.md` for future consideration after the IR migration.

---

### Phase 4: Extraction Preparation (PLANNED)

**Status:** Planned  
**Duration:** Estimated 1 week

**⚠️ MANDATORY: ALL tasks MUST follow TDD**

**Goals:**

- Final dependency audit (zero issues)
- Documentation for extraction
- Integration guide for target repo
- Performance benchmarks
- Ready for porting
- **TDD:** Integration tests in target repo validate extraction success

---

## Strategic Principles

### From RULES.md

1. **🎯 Test-Driven Development (TDD) - MANDATORY FOR ALL WORK**
2. **Test behavior, not implementation**
3. **Pure functions where possible**
4. **Defer types to source libraries**
5. **Type predicates over boolean filters**
6. **No unused variables**
7. **Explicit over implicit**
8. **Fail fast with helpful errors**

### Quality Standards

- **Functions:** <50 lines ideal, <100 max
- **Cognitive complexity:** <30 (target: <10 for extracted code)
- **Type safety:** No `any`, no type assertions
- **Test coverage:** Unit tests for all pure functions
- **Mutation score:** TBD (after Stryker setup)

### Extraction Requirements

**Must Have:**

- ✅ Zero TypeScript errors
- ⚠️ Zero type assertions (74 to fix)
- ⚠️ Zero lint errors (148 to fix)
- ⚠️ Zero security vulnerabilities (audit clean)
- ✅ All tests passing
- ⏳ Mutation testing in place
- ✅ Comprehensive documentation

---

## Dependencies: Analysis & Strategy (✅ COMPLETE)

### Critical Dependencies (Keep & Update)

**openapi3-ts v4.5.0** ✅

- **Why:** Core OpenAPI type definitions
- **Update:** v3 → v4.5.0
- **Breaking changes:** Documented in OPENAPI3_TS_V4_INVESTIGATION.md
- **Migration checklist:** Ready
- **Priority:** HIGH - do BEFORE deferring logic

**zod v4.1.12** ✅

- **Why:** Runtime validation library
- **Update:** v3 → v4.1.12
- **Breaking changes:** Import paths, API refinements
- **Update plan:** Documented
- **Priority:** HIGH - core to our functionality

**@zodios/core v10.9.6** ✅ KEEP

- **Why:** Type definitions used in generated code templates
- **Status:** Maintenance mode but stable
- **Decision:** KEEP (11.5M downloads/month, no good alternative)
- **Analysis:** `.agent/analysis/ZODIOS_CORE_EVALUATION.md`

**@apidevtools/swagger-parser v12.1.0** ✅ KEEP

- **Why:** OpenAPI parsing, validation, bundling
- **Status:** Actively maintained (2M downloads/week)
- **Decision:** KEEP (used appropriately in tests and CLI)
- **Analysis:** `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md`

**commander v14.0.1** ✅ KEEP

- **Why:** CLI framework, excellent TypeScript support
- **Status:** Current, actively maintained
- **Replacement of:** cac (removed in Phase 1)

**tanu v0.2.0** ✅ KEEP

- **Why:** TypeScript AST manipulation
- **Status:** Keep (specialized, no good alternatives)
- **Note:** Used in openApiToTypescript.ts

**ts-pattern v5.8.0** ✅ KEEP

- **Why:** Pattern matching utility
- **Status:** Keep (modern, well-maintained)

**handlebars v4.7.8** ✅ KEEP (Phase 2)

- **Why:** Template engine for code generation
- **Status:** Stale (last update Aug 2023) but no security issues
- **Decision Phase 2:** KEEP temporarily (legacy path)
- **Phase 3 Plan:** Migrate to ts-morph emitter + persistent IR (see `.agent/plans/PHASE-3-TS-MORPH-IR.md`)
- **Recommendation:** AST-based generation with plugin API and bidirectional support
- **Analysis:** `.agent/analysis/HANDLEBARS_EVALUATION.md`
- **Reference:** `.agent/reference/openapi-zod-client-emitter-migration.md`

### Dependencies to Remove ⚠️

**pastable v2.2.1** ⚠️ REMOVE

- **Why removing:** Obscure, unmaintained "collection of pastable code"
- **Usage:** 7 files, 8 functions
- **Replace with:** lodash-es + custom utilities
- **Priority:** HIGH
- **Plan:** `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md`
- **Functions:**
  - `get` → lodash-es (4 usages)
  - `capitalize` → lodash-es or native (2 usages)
  - `pick` → lodash-es (1 usage)
  - `sortBy` → lodash-es (1 usage)
  - `sortListFromRefArray` → custom utility (2 usages)
  - `sortObjKeysFromArray` → custom utility (1 usage)
  - `kebabToCamel`, `snakeToCamel` → custom (simple regex, 1 usage each)
  - `getSum` → native .reduce() (1 usage)
  - `ObjectLiteral` type → Record<string, unknown> (1 usage)

**openapi-types v12.1.3** ⚠️ REMOVE

- **Why removing:** Redundant with openapi3-ts v4
- **Current usage:** Only 1 test file imports it
- **Replace with:** openapi3-ts v4 types
- **Priority:** MEDIUM
- **Analysis:** `.agent/analysis/OPENAPI_TYPES_EVALUATION.md`

---

## Risk Management

### High Risk: Type Assertions (BLOCKER)

**Risk:** Cannot extract with type assertions  
**Impact:** Project cannot proceed to target repo  
**Mitigation:**

- Prioritize elimination above all else
- Create systematic approach (file by file)
- Add proper type guards where needed
- May require helper type functions

### Medium Risk: Breaking Changes in v4 Updates

**Risk:** openapi3-ts and zod v4 may have breaking changes  
**Impact:** Code may not compile, tests may fail  
**Mitigation:**

- Review changelogs thoroughly
- Update in controlled manner
- Test after each dependency update
- Keep old versions in git history

### Low Risk: Dependency Replacement

**Risk:** Replacing pastable may introduce bugs  
**Impact:** Functionality could break  
**Mitigation:**

- Tests cover all functionality
- Replace one function at a time
- Validate with existing test suite
- Add specific tests if gaps found

---

## Success Criteria

### Phase 2 Complete When

**Pre-Work (✅ COMPLETE):**

- [x] ✅ All 7 analysis tasks complete
- [x] ✅ All 4 dependency updates complete
- [x] ✅ schemas-with-metadata template complete
- [x] ✅ All quality gates green (format, build, type-check, test)
- [x] ✅ Documentation complete (15 analysis docs, COMPLETED_WORK.md)

**Architecture Rewrite (⏳ IN PROGRESS):**

- [ ] ⏳ Phase 0: Comprehensive test suite (50-60 tests)
- [ ] ⏳ Phase 1: Resolver & CodeMeta eliminated
- [ ] ⏳ Phase 2: Scalar pipeline + MCP enhancements delivered
- [ ] ⏳ Phase 3: Typed IR & ts-morph migration complete
- [ ] ⏳ Zero type assertions (except `as const`)
- [ ] ⏳ All quality gates green
- [ ] ⏳ Full validation complete

**See:** `01-CURRENT-IMPLEMENTATION.md` for detailed Architecture Rewrite plan

### Phase 3 Complete When

**Typed IR & Emitter:**

- [ ] Lossless IR schema finalised and versioned
- [ ] IR persistence/inspection API available (e.g. JSON artefact or exported module)
- [ ] ts-morph emitter generates grouped + single-file outputs
- [ ] Handlebars templates removed from production pipeline
- [ ] Round-trip tests (OpenAPI → IR → Zod → IR → OpenAPI) green
- [ ] Regenerated OpenAPI passes validation via `.agent/reference/openapi_schema/*.json`
- [ ] CLI/programmatic APIs maintain feature parity (cosmetic diffs documented)
- [ ] Migration notes + documentation published

### Ready for Extraction When

- [ ] All phases complete
- [ ] Zero TypeScript errors
- [ ] Zero type assertions
- [ ] Zero lint errors
- [ ] Zero security vulnerabilities
- [ ] All tests passing (297+)
- [ ] Mutation testing passing
- [ ] Documentation complete
- [ ] Integration guide written

---

## Timeline

- **Phase 1 (Foundations)** – ✅ Complete (tooling, ESM migration, dependency upgrades, schemas-with-metadata template).
- **Phase 2 Part 1 (Scalar pipeline)** – 🔄 In progress (2–3 weeks): integrate json-magic/openapi-parser, replace `prepareOpenApiDocument`, update docs, remove SwaggerParser.
- **Phase 2 Part 2 (MCP enhancements)** – ⏳ Planned (2–3 weeks): JSON Schema export, security metadata, MCP tool predicates, documentation.
- **Phase 3 (DX & Quality)** – ⏳ Planned (3–4 weeks): config discovery, watch mode, discriminated union UX, mutation testing, type-level tests, MSW integration tests.
- **Phase 4 (Extraction Prep)** – ⏳ Planned (≈1 week): final dependency audit, performance benchmarks, extraction runbook for Engraph.

Target: 7–9 weeks to extraction-ready state once Phase 2 Part 1 starts (Part 1 + Part 2 + Phase 3 + Phase 4).

---

## Key Documents

### Plans (This Directory)

- **This file:** Strategic overview
- **PHASE-1-PART-1-CONTEXT-TYPES.md:** Part 1 - Context & type safety (✅ complete)
- **PHASE-1-PART-2-TS-MORPH.md:** Part 2 - TypeScript AST migration (✅ complete)
- **PHASE-1-PART-3-ZODIOS-REMOVAL.md:** Part 3 - Remove Zodios dependencies (✅ complete)
- **PHASE-1-PART-4-UNIFIED-INPUT.md:** Part 4 - Unified input handling (✅ complete; historical reference)
- **01-CURRENT-IMPLEMENTATION.md:** Architecture Rewrite plan (complete details)
- **COMPLETED_WORK.md:** Historical archive (all Phase 1 & 2 pre-work)
- **PHASE-2-MCP-ENHANCEMENTS.md:** Phase 2 plan (Part 1 Scalar pipeline, Part 2 MCP enhancements) – 🔄 active
- **PHASE-3-FURTHER-ENHANCEMENTS.md:** Phase 3 DX and testing improvements
- **archive/:** Previous phase plans (reference only)

### Living Context

- **.agent/context/context.md:** Quick start guide for fresh context

### Analysis (✅ Phase 2 Complete - 15 Documents)

All in `.agent/analysis/`:

- **LINT_TRIAGE_COMPLETE.md** - 146 issues categorized
- **PASTABLE_REPLACEMENT_PLAN.md** - Replacement strategy
- **OPENAPI_TYPES_EVALUATION.md** - Decision: REMOVE
- **ZODIOS_CORE_EVALUATION.md** - Decision: KEEP
- **SWAGGER_PARSER_INTEGRATION.md** - Decision: KEEP
- **OPENAPI3_TS_V4_INVESTIGATION.md** - Migration complete
- **HANDLEBARS_EVALUATION.md** - ts-morph recommendation
- **TASK_1.9_ENGRAPH_ENHANCEMENTS.md** - Template implementation
- **CODEMETA_ANALYSIS.md** - Will be obsolete
- **OAS_VERSION_STRATEGY.md** - Multi-version options
- **OAS_RUNTIME_SUPPORT_VERIFICATION.md** - 3.0/3.1 proof
- **TASK_2.3_DEFER_LOGIC_ANALYSIS.md** - No opportunities
- **NESTED_REFS_ANALYSIS.md** - Validation philosophy
- **VALIDATION_AUDIT.md** - Fail-fast approach
- **TEMPLATE_STRATEGY.md** - Template usage guide

### Reference

- **.agent/RULES.md:** Coding standards (MUST follow)
- **.agent/adr/:** Architecture Decision Records (12 ADRs)
- **.agent/reference/reference.eslint.config.ts:** Target repo standards
- **.agent/reference/openapi-zod-client-emitter-migration.md:** ts-morph emitter architecture
- **.agent/DEFINITION_OF_DONE.md:** Quality gate validation script

---

## Notes

**Work Philosophy:**

- Document everything
- Test everything
- No shortcuts on quality
- Fail fast with helpful errors
- Type safety is paramount

**For Fresh Context:**

1. Read `.agent/context/context.md` (quick orientation - 5 min)
2. Read this file (strategic direction - 10 min)
3. Read `01-CURRENT-IMPLEMENTATION.md` (Architecture Rewrite plan - 15 min)
4. Verify quality gates pass (see Prerequisites)
5. Begin with Phase 2 Part 1 foundation tasks (Scalar pipeline guardrails)
6. Follow RULES.md standards (especially TDD)

**For Historical Context:**

- `COMPLETED_WORK.md` - All Phase 1 & 2 pre-work details
- `.agent/analysis/` - 15 analysis documents
- `.agent/adr/` - 12 Architecture Decision Records

---

**This plan will evolve as work progresses. Update when strategic decisions are made.**
