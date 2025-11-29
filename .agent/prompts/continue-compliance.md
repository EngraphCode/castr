# Continue Compliance Refinement & Lint Fixing

You are picking up a task to enforce strict compliance with `.agent/RULES.md` in the `openapi-zod-client` project.
The previous session focused on removing forbidden `eslint-disable` comments, specifically those bypassing the type system (e.g., `consistent-type-assertions`, `no-explicit-any`, `no-non-null-assertion`).
The user has manually removed most of these suppressions, leaving the codebase in a state where these violations are now reported as errors.

## Your Mission

1. **Assess the State**: Run `pnpm lint` and `pnpm check` immediately to identify all currently failing rules.
2. **Fix Errors Properly**: Resolve these errors **without** re-introducing type system suppressions.
   - **Type Assertions (`as`)**: Replace with type guards (e.g., `isIRDocument`), proper type definitions, or runtime validation.
   - **`any` Usage**: Replace with `unknown` and narrow, or define the correct interface.
   - **Non-null Assertions (`!`)**: Use optional chaining (`?.`) or proper control flow narrowing.
   - **Complexity**: Refactor complex functions into smaller, single-responsibility functions. Only suppress complexity if refactoring is dangerously invasive and the logic is stable/tested, but **prefer refactoring**.
3. **Strict Constraints**:
   - **NEVER** use `as` (except `as const`).
   - **NEVER** use `any`.
   - **NEVER** use `!`.
   - **NEVER** add `eslint-disable` for type safety rules.
   - Refer to `.agent/RULES.md` for the absolute source of truth.

## Context

- **Project Phase**: Phase 3 (Bidirectional Tooling).
- **Recent Activity**: The user manually stripped `eslint-disable` comments from files like `lib/src/context/converter/*.ts`, `lib/src/shared/component-access.ts`, and `lib/src/generators/openapi/index.ts`.
- **Goal**: Get all quality gates (`pnpm build`, `pnpm lint`, `pnpm test:all`) passing GREEN while adhering to the strict type discipline defined in `RULES.md`.

## Immediate Next Steps

1. Run `pnpm lint` to see the full list of errors.
2. Prioritize fixing type safety violations first.
3. Fix complexity violations second.
4. Verify fixes with `pnpm check`.
