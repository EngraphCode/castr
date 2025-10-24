# Strategic Plan: openapi-zod-client Modernization

**Date:** October 24, 2025  
**Status:** Active Implementation  
**Goal:** Modernize codebase for extraction to Oak National Academy monorepo

---

## Executive Summary

This fork of `openapi-zod-client` is being modernized to generate strict Zod schemas and MCP tool validation from OpenAPI 3.0/3.1 specifications. The work will be extracted and ported to the Oak Curriculum SDK monorepo to auto-generate request/response validators for MCP tools wrapping Oak API endpoints.

**Target Repository:** `oak-national-academy-monorepo`  
**Source API:** https://open-api.thenational.academy/api/v0/swagger.json  
**Extraction Blocker:** 74 type assertions must be eliminated (target repo: `assertionStyle: "never"`)

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

### Phase 2: Type Safety & Dependencies (IN PROGRESS)

**Status:** Planning Complete, Implementation Pending  
**Duration:** Estimated 2-3 weeks

**Critical Path:**
1. **Dependency Updates** (MUST DO FIRST)
   - openapi3-ts v3 → v4.5.0
   - zod v3 → v4.1.12
   - Reason: Must work with latest APIs before deferring logic

2. **Type Assertion Elimination** (EXTRACTION BLOCKER)
   - 74 instances across 11 files
   - Target repo forbids type assertions
   - Must be zero before extraction

3. **pastable Removal**
   - 7 files, 8 functions
   - Replace with lodash or native code
   - Removes obscure dependency

**Supporting Work:**
- Evaluate openapi-types (still needed?)
- Evaluate @zodios/core (active maintenance?)
- Investigate @apidevtools/swagger-parser integration
- Analyze what to defer to openapi3-ts v4

---

### Phase 3: Quality & Testing (PLANNED)

**Status:** Planned  
**Duration:** Estimated 1-2 weeks

**Goals:**
- Add Stryker mutation testing (v9.2.0)
- Achieve target ESLint compliance
- Evaluate handlebars vs template literals
- Zero lint issues
- Establish mutation score threshold
- All quality gates green

---

### Phase 4: Extraction Preparation (PLANNED)

**Status:** Planned  
**Duration:** Estimated 1 week

**Goals:**
- Final dependency audit (zero issues)
- Documentation for extraction
- Integration guide for target repo
- Performance benchmarks
- Ready for porting

---

## Strategic Principles

### From RULES.md

1. **Test behavior, not implementation**
2. **Pure functions where possible**
3. **Defer types to source libraries**
4. **Type predicates over boolean filters**
5. **No unused variables**
6. **Explicit over implicit**
7. **Fail fast with helpful errors**

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

## Dependencies: Analysis & Strategy

### Critical Dependencies (Keep & Update)

**openapi3-ts v4.5.0**
- **Why:** Core OpenAPI type definitions
- **Update:** v3 → v4.5.0
- **Breaking changes:** Type system improvements, new OAS 3.1 support
- **Priority:** HIGH - do BEFORE deferring logic

**zod v4.1.12**
- **Why:** Runtime validation library
- **Update:** v3 → v4.1.12
- **Breaking changes:** API refinements, performance improvements
- **Priority:** HIGH - core to our functionality

**commander v14.0.1**
- **Why:** CLI framework, excellent TypeScript support
- **Status:** Current, keep
- **Replacement of:** cac (removed in Phase 1)

**tanu v0.2.0**
- **Why:** TypeScript AST manipulation
- **Status:** Keep (specialized, no good alternatives)
- **Note:** Used in openApiToTypescript.ts

**ts-pattern v5.8.0**
- **Why:** Pattern matching utility
- **Status:** Keep (modern, well-maintained)

**handlebars v4.7.8**
- **Why:** Template engine
- **Status:** EVALUATE in Phase 3
- **Question:** Could template literals replace this?

### Dependencies to Remove

**pastable v2.2.1** ⚠️
- **Why removing:** Obscure, unmaintained "collection of pastable code"
- **Usage:** 7 files, 8 functions
- **Replace with:** lodash or native code
- **Priority:** HIGH
- **Functions:**
  - `get` → lodash.get or native optional chaining
  - `capitalize` → lodash.capitalize or native
  - `pick` → lodash.pick or native
  - `sortBy` → lodash.sortBy or native .sort()
  - `sortListFromRefArray` → custom or lodash
  - `sortObjKeysFromArray` → custom or lodash
  - `kebabToCamel` → custom (simple)
  - `snakeToCamel` → custom (simple)
  - `getSum` → native .reduce()

### Dependencies to Evaluate

**openapi-types v12.1.3** ⏳
- **Current usage:** Unknown
- **Question:** Still needed with openapi3-ts v4?
- **Action:** Investigate usage, likely can remove
- **Priority:** MEDIUM

**@zodios/core v10.9.6** ⏳
- **Current usage:** Type definitions for endpoint schemas
- **Question:** Active maintenance? Can we inline types?
- **Action:** Check GitHub activity, npm downloads, issues
- **Priority:** MEDIUM

**@apidevtools/swagger-parser v12.1.0** ⏳
- **Current usage:** Limited (parsing, validation)
- **Capabilities:** Validation, $ref resolution, dereferencing
- **Question:** Can we defer more to it?
- **Action:** Deep dive into API, integration opportunities
- **Priority:** MEDIUM

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
- [ ] openapi3-ts updated to v4.5.0
- [ ] zod updated to v4.1.12
- [ ] All tests passing after updates
- [ ] Zero type assertions (74 → 0)
- [ ] pastable removed (replaced)
- [ ] openapi-types evaluated (keep or remove decision)
- [ ] @zodios/core evaluated (keep or remove decision)
- [ ] @apidevtools/swagger-parser investigation complete
- [ ] Documentation updated
- [ ] All quality gates green

### Phase 3 Complete When:
- [ ] Stryker installed and configured
- [ ] Mutation score threshold established
- [ ] Mutation score meets threshold
- [ ] All lint issues resolved (148 → 0)
- [ ] Target ESLint config compliance achieved
- [ ] handlebars evaluation complete
- [ ] All quality gates green

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

**Phase 2 (Current):** 2-3 weeks
- Week 1: Dependency updates, type assertion analysis
- Week 2: Type assertion elimination, pastable replacement
- Week 3: Testing, validation, dependency evaluation

**Phase 3:** 1-2 weeks
- Week 1: Stryker setup, lint fixes
- Week 2: Final quality improvements

**Phase 4:** 1 week
- Final preparation and documentation

**Total Estimated:** 4-6 weeks to extraction-ready state

---

## Key Documents

### Plans (This Directory)
- **This file:** Strategic overview
- **01-CURRENT-IMPLEMENTATION.md:** Detailed task breakdown with acceptance criteria
- **archive/:** Previous phase plans (reference only)

### Living Context
- **.agent/context/context.md:** Single source of truth for current state

### Reference
- **.agent/RULES.md:** Coding standards (MUST follow)
- **.agent/adr/:** Architecture Decision Records (12 ADRs)
- **.agent/reference/reference.eslint.config.ts:** Target repo standards
- **.agent/DEFINITION_OF_DONE.md:** Quality gate validation script

### Analysis
- **.agent/analysis/:** Investigation results (created as work progresses)

---

## Notes

**Work Philosophy:**
- Document everything
- Test everything
- No shortcuts on quality
- Fail fast with helpful errors
- Type safety is paramount

**For Fresh Context:**
1. Read `.agent/context/context.md` (current state)
2. Read this file (strategic direction)
3. Read `01-CURRENT-IMPLEMENTATION.md` (what to do next)
4. Follow RULES.md standards
5. Run Definition of Done before committing

---

**This plan will evolve as work progresses. Update when strategic decisions are made.**


