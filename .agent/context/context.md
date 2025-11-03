# Living Context Document

**Last Updated:** November 2, 2025  
**Purpose:** Single source of truth for project state, decisions, and next steps

---

> **Intended Impact**  
> Every consumer—CLI, programmatic API, or downstream MCP tooling—must experience the same predictable, spec-compliant behaviour whenever they hand us an OpenAPI document. Valid specs sail straight through and produce deterministic artefacts; invalid specs fail fast with actionable guidance direct from the official schema. Comprehensive tests and documentation make that contract boringly reliable, unlocking the rest of the modernization roadmap.

---

## 🚨 Current Focus

**Phase 1 Part 5: Unified OpenAPI Input Pipeline – SESSION 1 COMPLETE! ✅**

**Status:** All quality gates passing, ready for Session 2

**Major Achievements (November 3, 2025):**

1. **Fixed Critical Circular Reference Bug:**
   - **Root Cause:** `SwaggerParser.validate()` mutates in-memory objects by resolving `$ref` strings into circular JavaScript references
   - **Solution:** Removed separate `validate()` call since `bundle()` validates internally
   - **Result:** All circular reference tests now pass!

2. **Removed Brittle Tests (RULES.md Compliance):**
   - Eliminated 12+ tests that checked specific error message text
   - Now testing **behavior** (rejection) not **implementation** (exact error wording)
   - Tests are resilient to upstream SwaggerParser changes

3. **Discovered OpenAPI 3.1.x Support:**
   - No rejection logic ever existed in product code!
   - Updated all tests to verify 3.1.x works correctly
   - Supports type arrays, standalone null, numeric exclusive bounds, etc.

4. **Confirmed Single SwaggerParser Usage:**
   - `prepareOpenApiDocument()` is the ONLY place in product code using SwaggerParser
   - Perfect encapsulation achieved!

**Final Test Status:**

- ✅ All 496 unit tests passing (100%)
- ✅ All 134 characterisation tests passing (100%)
- ✅ All 152 snapshot tests passing (100%)
- ✅ Full quality gate passing (`pnpm check`)

**Next Steps:**

Move to Session 3: Update documentation to reflect unified pipeline and OpenAPI 3.1.x support

---

## ✅ Session 1 Remediation Items — ALL RESOLVED!

- ✅ **Circular reference handling:** FIXED! Removed `validate()` call that was mutating objects
- ✅ **Schema ordering drift:** FIXED! Works correctly with bundle mode
- ✅ **Brittle tests removed:** Eliminated tests checking specific error message text
- ✅ **OpenAPI 3.1.x support:** Discovered and documented—already working!
- ✅ **Single SwaggerParser usage:** Confirmed perfect encapsulation in `prepareOpenApiDocument()`
- ✅ **All quality gates:** Passing at 100%

See `.agent/plans/PHASE-1-PART-5-UNIFIED-OPENAPI-PIPELINE.md` for detailed findings.

---

## ✅ Completed Milestones

- **Folder Reorganisation (Phase 1 Part 4 precursor)** – `lib/src` now follows layered architecture (`validation/`, `shared/`, `conversion/`, `endpoints/`, `context/`, `rendering/`, `cli/`, `ast/`).
- **Quality Gates** – Were green immediately after the reorganisation; now failing due to the new characterisation coverage (see remediation items above).
- **Public API** – Still preserved and guarded by `public-api-preservation.test.ts`.

(See archived plan `.agent/plans/archive/LIB-SRC-FOLDER-REORGANISATION.md` for historical detail.)

---

## 🔭 Immediate Objectives

**Session 1: ✅ COMPLETE**
**Session 2: ✅ COMPLETE**

**Session 3: Documentation & Finalization (Next)**

1. Update README to document unified pipeline and OpenAPI 3.1.x support
2. Review and update TSDoc examples
3. Document key discoveries (SwaggerParser bug, 3.1.x support)
4. Final validation sweep and manual smoke tests

---

## 🔧 Working Agreements (from `.agent/RULES.md`)

- **TDD is mandatory** – write failing tests first, confirm failure, implement, confirm success, then refactor. No exceptions.
- **Comprehensive TSDoc** – public APIs require full examples/docs; internal helpers at least need @param/@returns/@throws.
- **No defensive programming** – rely on SwaggerParser for structural validation, and fail fast with actionable errors.
- **No type assertions** unless explicitly justified (and documented); prefer type guards.
- **All quality gates must remain green** (`pnpm format`, `build`, `type-check`, `lint`, `test:all`).

---

## 🔌 Current Repository State

- **Branch:** `feat/rewrite`
- **Directory:** `/Users/jim/code/personal/openapi-zod-client`
- **Tests:** 782 total (496 unit + 134 characterisation + 152 snapshot) – **ALL PASSING ✅**
- **Build:** ESM+CJS bundles + DTS artefacts clean
- **Bundle size:** ~9.7 MB (library and CLI) – within baseline
- **Quality Gates:** All green (`pnpm check` passes)

---

## 🗺️ Key References

- **Plan:** `.agent/plans/PHASE-1-PART-5-UNIFIED-OPENAPI-PIPELINE.md` (authoritative task list)
- **Requirements:** `.agent/plans/requirements.md` (Req 7–12 especially)
- **Standards:** `.agent/RULES.md`
- **ADR Log:** `.agent/adr/` (validation, type system, tooling decisions)

---

## 📝 Definition of Done for Part 5

- Spec truthfulness and deterministic codegen are proven through updated characterisation using official examples and Engraph fixtures.
- `prepareOpenApiDocument()` implemented with exhaustive tests and documentation.
- CLI + programmatic APIs rely exclusively on the helper; legacy validation removed.
- Optional dereference mode available via helper options and CLI flag.
- Documentation/examples updated to reflect unified pipeline.
- All quality gates pass from clean state; manual CLI smoke tests recorded.
- Public API surface remains backward compatible.

---

Use this document together with the plan to resume work quickly in any new session.
