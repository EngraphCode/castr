# Zod 4 Output Compliance Plan

**Date:** January 20, 2026  
**Status:** ✅ COMPLETE (with 2.8.x remediation in progress)  
**Session:** 2.8  
**Specification:** [zod-output-acceptance-criteria.md](../zod-output-acceptance-criteria.md)  
**Test Docs:** [lib/tests-roundtrip/README.md](../../lib/tests-roundtrip/README.md)

---

## Objective

Implement FULL Zod 4 output support with **zero information loss** from the IR.

> [!IMPORTANT]
> Session 2.8 proves that OpenAPI → IR → Zod produces correct, complete Zod schemas.
> This is one half of the production-ready path (the other being OpenAPI round-trip, now complete).

---

## Progress Summary

| Phase | Focus                     | Status         |
| ----- | ------------------------- | -------------- |
| 2.8.1 | Audit & Planning          | ✅ Complete    |
| 2.8.2 | Metadata via .meta()      | ✅ Complete    |
| 2.8.3 | Type Coverage & Fail-Fast | ✅ Complete    |
| 2.8.4 | Validation Parity Tests   | ✅ Complete    |
| 2.8.x | Strictness Remediation    | 🔄 In Progress |

---

## Completed Work

### 2.8.4: Validation Parity Tests ✅

**Completed:** January 20, 2026

**Location:** `lib/tests-roundtrip/__tests__/validation-parity.integration.test.ts`

**Approach:**

Tests import pre-generated Zod schemas from fixture directories and validate behavior directly using `.parse()` (throws on failure) to align with our strict, fail-fast principle.

- No external validators (AJV, JSON Schema) — pure Zod testing
- No compilation stubs — tests run against real Zod 4
- Uses `.parse()` not `.safeParse()` — fail-fast means throw on error

### 2.8.x: Strictness Remediation 🔄

**In Progress:** January 20, 2026

**Issues Found:**

1. **TypeScript type `Pet = unknown` for `allOf` schemas**
   - Location: `lib/src/writers/typescript/type-writer.ts`
   - Fix: Added `allOf` → intersection (`&`), `oneOf`/`anyOf` → union (`|`) handling
   - Status: ✅ Code fixed, awaiting snapshot regeneration

2. **Missing `.strict()` on inline endpoint objects**
   - Location: `lib/src/writers/typescript/endpoints.ts`
   - Fix: Added `.strict()` to `createZodObjectWriter`
   - Status: ✅ Code fixed, awaiting snapshot regeneration

3. **IR version field shows `3.1.1`** (not an official OpenAPI version)
   - Location: `lib/src/ir/schema.ts`
   - Status: ⏳ Deferred to future session

---

## Assumptions (Question These!)

The next session MUST critically examine these assumptions:

### Test Infrastructure

1. **`zod.ts` files are generated snapshot outputs** — kept for inspection, not test fixtures
2. **TypeScript proves types, tests prove behavior** — from testing-strategy.md
3. **Import of generated code proves compilation** — if Vitest runs it, types work
4. **`type-check-validation.gen.test.ts` tests fresh generation** — includes petstore-expanded with allOf
5. **Roundtrip fixtures should be regenerated when writer changes** — currently stale

### Validation Strategy

6. **`.parse()` and `.safeParse()` have identical validation rules** — differ only in error handling
7. **Inline endpoint objects should be strict** — unconditional `.strict()`, not configurable
8. **No need for AJV/JSON Schema validators** — Zod tests prove Zod behavior

### Type Generation

9. **`allOf` → TypeScript intersection (`&`)** — implementation choice
10. **`oneOf`/`anyOf` → TypeScript union (`|`)** — implementation choice
11. **`unknown` is valid but represents information loss** — should be specific types

### Versioning

12. **IR `openApiVersion: "3.1.1"`** — observed but may be incorrect (only 3.1.0 is official)
13. **Single version field covers all formats** — may need distinct fields per format

---

## Definition of Done ✅

Session 2.8 core work complete:

- [x] All IR metadata fields flow to `.meta()` calls
- [x] `z.null()` for null type
- [x] `z.literal()` for const values
- [x] OAS 3.1 type arrays handled correctly
- [x] Fail-fast on unsupported patterns (no `z.unknown()`)
- [x] Strict-by-default documented in RULES.md
- [x] Validation parity tests using `.parse()` (throws on failure)
- [x] All 10 quality gates pass

Session 2.8.x remediation:

- [x] TypeScript composition types (allOf, oneOf, anyOf)
- [x] Inline endpoint object strictness
- [ ] Regenerate `zod.ts` snapshot outputs
- [ ] Verify all quality gates still pass

---

## Key Files

| File                                                                  | Purpose                    |
| --------------------------------------------------------------------- | -------------------------- |
| `lib/src/writers/zod/index.ts`                                        | Main Zod writer            |
| `lib/src/writers/zod/metadata.ts`                                     | Metadata via .meta()       |
| `lib/src/writers/typescript/type-writer.ts`                           | TypeScript type generation |
| `lib/src/writers/typescript/endpoints.ts`                             | Endpoint generation        |
| `lib/tests-roundtrip/__tests__/validation-parity.integration.test.ts` | Parity tests               |

---

## Quality Gates

All 10 must pass:

```bash
cd lib && pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

---

## References

- [zod-output-acceptance-criteria.md](../zod-output-acceptance-criteria.md) — Success criteria
- [lib/tests-roundtrip/README.md](../../lib/tests-roundtrip/README.md) — Test infrastructure
- [Zod 4 Metadata Docs](https://zod.dev/metadata) — `.meta()` API
- [RULES.md](../RULES.md) — Strict-By-Default section
- [testing-strategy.md](../testing-strategy.md) — TDD methodology
