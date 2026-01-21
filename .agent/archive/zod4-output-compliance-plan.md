# Zod 4 Output Compliance Plan

**Date:** January 20, 2026  
**Status:** ✅ COMPLETE  
**Session:** 2.8 + 2.9  
**Specification:** [zod-output-acceptance-criteria.md](../zod-output-acceptance-criteria.md)  
**Test Docs:** [lib/tests-roundtrip/README.md](../../lib/tests-roundtrip/README.md)  
**ADR:** [ADR-031-zod-output-strategy.md](../adr/ADR-031-zod-output-strategy.md)

---

## Objective

Implement FULL Zod 4 output support with **zero information loss** from the IR.

> [!IMPORTANT]
> Session 2.8 proves that OpenAPI → IR → Zod produces correct, complete Zod schemas.
> This is one half of the production-ready path (the other being OpenAPI round-trip, now complete).

---

## Progress Summary

| Phase | Focus                     | Status      |
| ----- | ------------------------- | ----------- |
| 2.8.1 | Audit & Planning          | ✅ Complete |
| 2.8.2 | Metadata via .meta()      | ✅ Complete |
| 2.8.3 | Type Coverage & Fail-Fast | ✅ Complete |
| 2.8.4 | Validation Parity Tests   | ✅ Complete |
| 2.8.x | Strictness Remediation    | ✅ Complete |
| 2.9   | Zod 4 Advanced Features   | ✅ Complete |

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

### 2.8.x: Strictness Remediation ✅

**Completed:** January 20, 2026

1. **TypeScript type composition** — `allOf`→`&`, `oneOf`/`anyOf`→`|` in `type-writer.ts`
2. **Inline endpoint strictness** — `.strict()` added in `endpoints.ts`
3. **Snapshots regenerated** — All `normalized/*/zod.ts` files updated

### 2.9: Zod 4 Advanced Features ✅

**Completed:** January 20, 2026

1. **`z.xor()` for `oneOf`** — Exclusive union semantics (XOR, not OR)
2. **`z.discriminatedUnion()`** — Optimized parsing when discriminator present
3. **Format-specific functions** — `z.int32()`, `z.email()`, `z.iso.datetime()`, etc.
4. **Redundant validation filtering** — No duplicate `.int()` on `z.int()`
5. **ADR-031 accepted** — Formalizes Zod 4 output strategy

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

Session 2.8 core work:

- [x] All IR metadata fields flow to `.meta()` calls
- [x] `z.null()` for null type
- [x] `z.literal()` for const values
- [x] OAS 3.1 type arrays handled correctly
- [x] Fail-fast on unsupported patterns (no `z.unknown()`)
- [x] Strict-by-default documented in RULES.md
- [x] Validation parity tests using `.parse()` (throws on failure)

Session 2.8.x remediation:

- [x] TypeScript composition types (allOf, oneOf, anyOf)
- [x] Inline endpoint object strictness
- [x] Regenerate `zod.ts` snapshot outputs
- [x] All quality gates pass (972 tests)

Session 2.9 advanced features:

- [x] `z.xor()` for `oneOf` exclusivity
- [x] `z.discriminatedUnion()` for discriminator optimization
- [x] Format-specific integer/string functions
- [x] Redundant validation filtering
- [x] ADR-031 accepted and documented

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
