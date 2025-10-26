# Strategic Plan: openapi-zod-client Modernization

**Date:** October 24, 2025  
**Status:** Active Implementation  
**Goal:** Modernize codebase for extraction to Engraph monorepo

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
- **Req 4-6:** MCP integration (SDK→MCP tools, validation architecture, JSON schemas) - Phase 2B
- **Req 7:** Fail-fast philosophy - ADR-001, enforced throughout
- **Req 8:** Highest standards, test-defined behavior - TDD mandate, comprehensive test coverage

---

## 🎯 Development Methodology

**ALL implementation work MUST follow Test-Driven Development (TDD):**

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

---

## Current State (October 24, 2025)

### Quality Gates

```
✅ format      - Passing
✅ build       - Passing (ESM + CJS + DTS)
✅ type-check  - Passing (0 errors)
⚠️  lint       - 148 issues (74 = BLOCKER)
✅ test        - Passing (297 tests)
```

### Key Metrics

- **TypeScript Errors:** 0 (was 151) ✅
- **Tests:** 297 passing (+47 from start) ✅
- **Cognitive Complexity:** 0 violations (was 4) ✅
- **Type Assertions:** 74 ⚠️ **EXTRACTION BLOCKER**

### Dependencies (Current → Target)

- `openapi3-ts`: v3 → v4.5.0 (June 2025)
- `zod`: v3 → v4.1.12 (October 2025)
- `pastable`: v2.2.1 → **REMOVE** (replace with lodash/native)
- `@zodios/core`: v10.9.6 → evaluate maintenance
- `openapi-types`: v12.1.3 → evaluate necessity
- `@stryker-mutator/core`: none → v9.2.0 (October 2025)

---

## Strategic Phases

### Phase 1: Foundation (✅ COMPLETE)

**Status:** Complete  
**Duration:** October 22-24, 2025

**Achievements:**

- Modernized all developer tooling
- Migrated to pure ESM with NodeNext resolution
- Eliminated all cognitive complexity violations
- Fixed all critical type safety errors
- Established comprehensive testing (297 tests)
- Created 12 Architecture Decision Records
- Documented all coding standards (RULES.md)

**Key Decisions:**

- Fail fast on spec violations (ADR-001)
- Defer types to openapi3-ts (ADR-002)
- Type predicates over boolean filters (ADR-003)
- Pure functions & single responsibility (ADR-004)
- ESM with NodeNext resolution (ADR-007)
- Replace cac with commander (ADR-008)
- Replace Preconstruct with tsup (ADR-009)
- Use Turborepo for orchestration (ADR-010)

---

### Phase 2: Type Safety & Dependencies (🔄 IN PROGRESS - ARCHITECTURE REWRITE)

**Status:** Ready to Execute - All Prerequisites Complete ✅  
**Duration:** 26-38 hours over 2-3 weeks

**Pre-Work Complete (✅ ALL TASKS):**

**Analysis (7/7 complete):**

- ✅ Lint Triage → identified 74 type assertions as BLOCKER
- ✅ pastable Analysis → COMPLETE (removed, replaced with lodash-es)
- ✅ openapi-types Evaluation → Decision: REMOVE (redundant)
- ✅ @zodios/core Evaluation → KEEP for now (Phase 3 removal)
- ✅ swagger-parser Investigation → KEEP (latest v12.1.0)
- ✅ openapi3-ts v4 Investigation → Migration complete
- ✅ Handlebars Evaluation → KEEP for Phase 2, ts-morph for tanu only

**Implementation (4/4 complete):**

1. ✅ Task 2.1: openapi3-ts v3 → v4.5.0 (5 hours)
2. ✅ Task 2.2: swagger-parser verified at latest v12.1.0 (10 min)
3. ✅ Task 2.4: Zod v3 → v4.1.12 (30 min)
4. ✅ Task 3.1: pastable removed, replaced with lodash-es + domain utils (3 hours)

**Additional Complete:**

- ✅ Task 1.9: schemas-with-metadata template (Engraph-optimized, 6 hours)
- ✅ Task 1.10: Critical lint issues fixed (35 min)
- ✅ Task 2.3: Defer logic analysis (2 hours, no opportunities found)
- ✅ topologicalSort modernization (45 min)

**Architecture Rewrite (Active):**

- **Phase 0:** Comprehensive Public API Test Suite (8-12 hours) ⭐ **NEXT**
- **Phase 1:** Eliminate resolver + CodeMeta (8-12 hours)
- **Phase 2:** Migrate tanu → ts-morph (6-8 hours)
- **Phase 3:** Remove Zodios dependencies (4-6 hours)

**See:** `01-CURRENT-IMPLEMENTATION.md` (complete Architecture Rewrite plan)  
**History:** `COMPLETED_WORK.md` (all pre-work details)

---

### Phase 3: Quality & Testing (PLANNED)

**Status:** Planned  
**Duration:** Estimated 3-4 weeks (combining core quality work + DX enhancements)

**⚠️ MANDATORY: ALL tasks MUST follow TDD**

**See:** `.agent/plans/03-FURTHER-ENHANCEMENTS.md` for detailed DX & testing improvements

**Core Quality Goals:**

- Add Stryker mutation testing (v9.2.0)
- Achieve target ESLint compliance (146 → 0 issues)
- Zero lint issues
- Establish mutation score threshold
- All quality gates green
- **TDD:** Write tests that expose gaps mutation testing finds, fix code

**Additional Enhancements (from typed-openapi analysis):**

- **Tooling:** Config file support (cosmiconfig), bundle size analysis
- **Developer Experience:** Watch mode, discriminated union errors, configurable status codes
- **Testing Maturity:** Type-level testing (tstyche), MSW integration tests
- **Documentation:** Migration guides, comprehensive examples

**Estimated Additional Time:** 25-32 hours for DX enhancements

**Optional (Phase 3 or 4):**

- Evaluate ts-morph emitter architecture (22-32 hours)
- Replace Handlebars with AST-based generation
- Plugin API for custom templates
- **TDD:** Build new emitter test-first, maintain backward compatibility

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
- **Decision Phase 2:** KEEP (not blocking, works fine)
- **Decision Phase 3/4:** Evaluate ts-morph emitter architecture (22-32 hours)
- **Recommendation:** AST-based generation with plugin API
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

### Phase 2 Complete When:

**Pre-Work (✅ COMPLETE):**

- [x] ✅ All 7 analysis tasks complete
- [x] ✅ All 4 dependency updates complete
- [x] ✅ schemas-with-metadata template complete
- [x] ✅ All quality gates green (format, build, type-check, test)
- [x] ✅ Documentation complete (15 analysis docs, COMPLETED_WORK.md)

**Architecture Rewrite (⏳ IN PROGRESS):**

- [ ] ⏳ Phase 0: Comprehensive test suite (50-60 tests)
- [ ] ⏳ Phase 1: Resolver & CodeMeta eliminated
- [ ] ⏳ Phase 2: ts-morph migration complete
- [ ] ⏳ Phase 3: Zodios dependencies removed
- [ ] ⏳ Zero type assertions (except `as const`)
- [ ] ⏳ All quality gates green
- [ ] ⏳ Full validation complete

**See:** `01-CURRENT-IMPLEMENTATION.md` for detailed Architecture Rewrite plan

### Phase 3 Complete When:

**Core Quality:**

- [ ] Stryker installed and configured
- [ ] Mutation score threshold established
- [ ] Mutation score meets threshold
- [ ] All lint issues resolved (148 → 0)
- [ ] Target ESLint config compliance achieved
- [ ] handlebars evaluation complete
- [ ] All quality gates green

**DX Enhancements (from 03-FURTHER-ENHANCEMENTS.md):**

- [ ] Config file support (cosmiconfig) implemented
- [ ] Bundle size analysis working
- [ ] Watch mode implemented (optional)
- [ ] Discriminated union error handling (optional)
- [ ] Type-level testing (tstyche) implemented
- [ ] MSW integration tests implemented
- [ ] Migration guides complete

### Ready for Extraction When:

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

**Phase 2 (Current):** 2-3 weeks remaining

- ✅ Week 1: Pre-work complete (analysis, dependency updates, templates)
- ⏳ Week 2-3: Architecture Rewrite (26-38 hours)
  - Phase 0: Comprehensive test suite (8-12 hours)
  - Phase 1: Eliminate resolver & CodeMeta (8-12 hours)
  - Phase 2: Migrate tanu → ts-morph (6-8 hours)
  - Phase 3: Remove Zodios (4-6 hours)
- Week 4: Final validation & documentation

**Phase 2B (Optional):** 3-4 weeks

- MCP Enhancements (after Architecture Rewrite)
- See: `02-MCP-ENHANCEMENTS.md`

**Phase 3:** 3-4 weeks

- Week 1: Stryker setup, lint fixes, config file support
- Week 2: Bundle analysis, watch mode, discriminated unions
- Week 3: Type-level testing (tstyche), MSW integration tests
- Week 4: Migration guides, final quality improvements

**Phase 4:** 1 week

- Final preparation and documentation
- Extraction readiness validation

**Total Estimated:** 7-9 weeks to extraction-ready state

- Phase 2: 2-3 weeks (including Architecture Rewrite)
- Phase 2B: 3-4 weeks (optional MCP enhancements)
- Phase 3: 3-4 weeks (quality & DX improvements)
- Phase 4: 1 week (final prep)

---

## Key Documents

### Plans (This Directory)

- **This file:** Strategic overview
- **01-CURRENT-IMPLEMENTATION.md:** Architecture Rewrite plan (complete details)
- **COMPLETED_WORK.md:** Historical archive (all Phase 1 & 2 pre-work)
- **02-MCP-ENHANCEMENTS.md:** Phase 2B MCP-specific enhancements (optional, after rewrite)
- **03-FURTHER-ENHANCEMENTS.md:** Phase 3 DX and testing improvements
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
5. Start with Phase 0 test suite creation
6. Follow RULES.md standards (especially TDD)

**For Historical Context:**

- `COMPLETED_WORK.md` - All Phase 1 & 2 pre-work details
- `.agent/analysis/` - 15 analysis documents
- `.agent/adr/` - 12 Architecture Decision Records

---

**This plan will evolve as work progresses. Update when strategic decisions are made.**
