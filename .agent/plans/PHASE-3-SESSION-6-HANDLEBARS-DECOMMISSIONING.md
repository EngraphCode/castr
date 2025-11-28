# Phase 3 - Session 3.6: Handlebars Decommissioning

**Status:** Planned
**Prerequisites:** Session 3.4 (IR Enhancements) ✅
**Reference:** `.agent/plans/PHASE-3-TS-MORPH-IR.md`
**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`

---

## 🎯 Goal

Completely remove the Handlebars templating engine and all associated artifacts from the codebase. This finalizes the transition to a pure `ts-morph` based code generation architecture, reducing technical debt and maintenance burden.

## ⚠️ Critical Rules

1. **TDD is MANDATORY:** Even for removal, ensure tests pass before and after.
2. **No Regressions:** The `pnpm character` suite must pass without changes (proving ts-morph output is stable).
3. **Clean Break:** No lingering "deprecated" code. Delete it all.

---

## 📋 Implementation Plan

### 1. Audit & Baseline

**Objective:** Confirm the scope of removal and establish a baseline for verification.

- **[ ] Audit Artifacts**
  - Identify all `.hbs` files.
  - Identify all Handlebars-related source files (`handlebars.ts`, `handlebars.test.ts`).
  - Identify all `handlebars` imports.
  - **Command:** `find lib -name "*.hbs"`

### 2. Code Removal

**Objective:** Delete the code and templates.

- **[ ] Delete Templates**
  - Remove all `.hbs` files from `lib/src/templates/` (or wherever they reside).
- **[ ] Delete Source Code**
  - Delete `lib/src/rendering/handlebars.ts`.
  - Delete `lib/src/rendering/handlebars.test.ts`.
  - Remove any helper functions specific to Handlebars.
- **[ ] Update Consumers**
  - Remove `handlebars` imports from `lib/src/index.ts` or `lib/src/rendering/index.ts`.
  - Ensure `generateZodClientFromOpenAPI` no longer has a path to use Handlebars (remove feature flags if any).

### 3. Dependency Removal

**Objective:** Remove the library from the project.

- **[ ] Remove Dependency**
  - Run `pnpm remove handlebars` in `lib/`.
  - Run `pnpm remove @types/handlebars` (if present).
- **[ ] Clean Build Scripts**
  - Check `package.json` scripts for any template copying/compilation steps.

### 4. Verification & Release Prep

**Objective:** Verify the system works without Handlebars and prepare for release.

- **[ ] Verify Removal**
  - `grep -r "handlebars" lib/src` should return empty.
- **[ ] Full Quality Gate**
  - Run `pnpm test:all` (Unit/Integration).
  - Run `pnpm character` (Characterization/Regression).
  - Run `pnpm build` (Ensure no build errors).

---

## ✅ Verification

1. **Zero Handlebars:** No `.hbs` files, no `handlebars` dependency.
2. **Green Quality Gate:** All tests pass.
3. **Stable Output:** Characterization tests show no diffs (or expected diffs if we were relying on Handlebars for some edge cases, though we shouldn't be).
