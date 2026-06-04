# Plan: `if`/`then`/`else` Conditional Applicator Support

> ⚠️ **Stale (2026-06-04, see ADR-047):** the Zod-writer **fail-fast** decision recorded here was later reversed to a
> default `.refine()` approach ("Schema Completeness Arc Phase 1") that this plan never recorded. The shipped `.refine()`
> for `if/then/else` is a no-op (review finding C6). See `docs/architectural_decision_records/ADR-047-…` and
> `.agent/plans/remediation/03-zod-2020-12-keyword-semantics.md`. Retained as history only.

**Status:** Complete
**Created:** 2026-03-27
**Predecessor:** Boolean schema support (completed 2026-03-27)

---

## Scope

**In scope:**

- Add `if`, `then`, `else` fields to `CastrSchema` interface (IR model)
- Update `isCastrSchema` runtime validator to validate these fields
- Parse `if`/`then`/`else` in the JSON Schema parser
- Remove `if`/`then`/`else` from `UNSUPPORTED_DOCUMENT_KEYWORDS`
- Write `if`/`then`/`else` in the JSON Schema writer
- Write `if`/`then`/`else` in the OpenAPI writer (OAS 3.1 via JSON Schema 2020-12)
- Fail-fast in Zod writer (no Zod equivalent)
- Fail-fast in TypeScript writer (no TS type equivalent)
- Round-trip proof fixture + Scenario 5
- Update format-tensions table
- Update session-entry remaining capabilities

**Out of scope:**

- `$dynamicRef`/`$dynamicAnchor` (remains rejected)
- Any Zod emission strategy for conditionals

## TDD Order

1. IR model: add `if`/`then`/`else` to `CastrSchema`
2. Runtime validator: failing tests → implement validation
3. JSON Schema parser: failing tests → implement parsing
4. JSON Schema document parser: remove from unsupported keywords
5. JSON Schema writer: failing tests → implement writing
6. OpenAPI writer: verify or add support
7. Zod writer: failing tests → implement fail-fast guard
8. TypeScript writer: failing tests → implement fail-fast guard
9. Round-trip proof: `ConditionalSchema` fixture + Scenario 5
10. Documentation: format-tensions table, session-entry

## Success Criteria

1. Parser accepts `if`/`then`/`else` without error
2. Round-trip JSON Schema → IR → JSON Schema is lossless
3. Zod and TypeScript writers fail fast with actionable errors
4. `isCastrSchema` validates conditional shapes
5. All quality gates green (`pnpm qg` exit 0)
