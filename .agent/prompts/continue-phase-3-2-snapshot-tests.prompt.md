# Continue Phase 3.2: Snapshot Test Updates for Type Discipline Restoration

## Context

We are systematically updating test files to properly use the `GenerationResult` discriminated union type guards. This is part of a larger effort to achieve 8/8 GREEN quality gates.

## Essential Documents to Read First

1. **`.agent/RULES.md`** - The authoritative guide for coding standards and type discipline requirements
2. **`.agent/plans/PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md`** - The detailed plan we're executing (see Phase 3.2)
3. **`.agent/context/context.md`** - Current project state and progress
4. **`.agent/context/HANDOFF.md`** - Quick orientation and next steps
5. **`lib/tests-helpers/generation-result-assertions.ts`** - The helper module we're using to fix tests
6. **`lib/tests-helpers/README.md`** - Documentation on how to use the helpers

## Current Status

- **Phase 3.2 (Snapshot Tests):** IN PROGRESS
- **Started:** 61 test failures
- **Current:** ~30 test failures remaining
- **Location:** `lib/tests-snapshot/` directory (78 test files total)

## The Fix Pattern

For tests calling `generateZodClientFromOpenAPI()`:

```typescript
// BEFORE (broken)
const result = await generateZodClientFromOpenAPI({...});
expect(result).toMatchInlineSnapshot(`...`);

// AFTER (fixed)
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
const result = await generateZodClientFromOpenAPI({...});
assertSingleFileResult(result);
expect(result.content).toMatchInlineSnapshot(`...`);
```

**Important:** Import path depth varies by file location:

- `lib/tests-snapshot/*.test.ts` → `../tests-helpers/...`
- `lib/tests-snapshot/edge-cases/*.test.ts` → `../../tests-helpers/...`
- `lib/tests-snapshot/options/validation/*.test.ts` → `../../../tests-helpers/...`

## Remaining Work

1. **Find failing files:** `pnpm test:snapshot 2>&1 | grep "FAIL "`
2. **For each failing file:**
   - Add the import for `assertSingleFileResult`
   - Add `assertSingleFileResult(result);` after generate call
   - Update `expect(result)` → `expect(result.content)` for string comparisons
3. **Patterns to fix:**
   - `.toMatchInlineSnapshot()` - use `.content`
   - `.toMatchSnapshot()` - use `.content`
   - `.toBe(snapshot)` - use `.content`
   - `.toContain('...')` - use `.content`
   - `typeof result` checks - use `typeof result.content`
4. **Skip these:** Tests using `isGroupedFileResult()` are already correct

## Files Known to Need Updates

These files were identified as still failing or not yet updated:

- `lib/tests-snapshot/options/generation/export-all-named-schemas.test.ts`
- `lib/tests-snapshot/options/generation/export-all-types.test.ts`
- `lib/tests-snapshot/options/generation/export-schemas-option.test.ts`
- `lib/tests-snapshot/options/generation/inline-simple-schemas.test.ts`
- `lib/tests-snapshot/options/generation/group-strategy.test.ts`
- `lib/tests-snapshot/naming/name-starting-with-number.test.ts`
- `lib/tests-snapshot/naming/name-with-special-characters.test.ts`
- `lib/tests-snapshot/schemas/complexity/same-schema-different-name.test.ts`

## Commands

```bash
pnpm test:snapshot  # Run snapshot tests (target: 177/177 passing)
pnpm test:all       # Run all unit tests
pnpm lint           # Check for lint errors
```

## Goal

1. Reduce snapshot test failures from ~30 to 0
2. Then proceed to Phase 3.3 (Character Tests - 84 failures in `lib/tests-character/`)
3. Ultimate goal: All 8 quality gates GREEN

## Notes

- The `GenerationResult` type is defined in `lib/src/rendering/generation-result.ts`
- Some tests use `getZodClientTemplateContext()` which returns context data, NOT GenerationResult - skip those
- Tests checking grouped file results use `isGroupedFileResult()` and access `.files['name']` - these are correct
