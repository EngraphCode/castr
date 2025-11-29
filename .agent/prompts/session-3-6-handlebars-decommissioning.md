# Session 3.6: Handlebars Decommissioning

You are a Senior TypeScript Software Engineer working on the `openapi-zod-client` modernization project.

## Context

We have successfully completed the "Strict Compliance" phase, achieving:

- 0 Lint Errors
- 0 Type Assertions (in production code)
- Passing `pnpm check` (Build, Lint, Test, Type-Check)

The codebase is now in a pristine state, ready for the final architectural shift of Phase 3: removing the legacy Handlebars templating engine in favor of the new `ts-morph` based IR emitter.

## Objective

Execute **Phase 3 - Session 3.6: Handlebars Decommissioning**.

Your goal is to completely remove Handlebars and all associated artifacts while ensuring zero regressions in the generated output or test suite.

## References

Please read and internalize the following documents before starting:

1. **Primary Plan:** `.agent/plans/PHASE-3-SESSION-6-HANDLEBARS-DECOMMISSIONING.md`
   - This contains the detailed step-by-step implementation plan and acceptance criteria.
2. **Phase Context:** `.agent/plans/PHASE-3-TS-MORPH-IR.md`
   - Context on the IR-First architecture and why we are doing this.
3. **Strategic Overview:** `.agent/plans/00-STRATEGIC-OVERVIEW.md`
   - High-level project goals and strict quality standards.
4. **Rules:** `.agent/RULES.md`
   - **CRITICAL:** You must follow TDD (Test-Driven Development).
   - **CRITICAL:** No new type assertions or `eslint-disable` comments allowed.

## Instructions

1. **Acknowledge & Plan:**
   - Read the primary plan.
   - Confirm you understand the scope (Delete code, delete templates, remove dependency).
   - Create a `task.md` to track your progress.

2. **Execute:**
   - Follow the "Implementation Plan" in `PHASE-3-SESSION-6-HANDLEBARS-DECOMMISSIONING.md`.
   - **Step 1:** Audit & Baseline.
   - **Step 2:** Code Removal (Templates, Source, Imports).
   - **Step 3:** Dependency Removal.
   - **Step 4:** Verification.

3. **Verify:**
   - Run the full quality gate: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`.
   - Ensure `grep -r "handlebars" lib/src` returns nothing.

4. **Deliver:**
   - Update `walkthrough.md` with your changes.
   - Commit your work.

## Critical Constraints

- **NO BROKEN BUILDS:** The codebase must build and pass tests at every commit.
- **NO REGRESSIONS:** Characterization tests must pass.
- **STRICT TYPES:** Do not introduce `any` or `as` to solve problems. Fix the architecture instead.

Good luck.
