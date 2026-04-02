# OAS 3.2 Version Plumbing

**Status:** READY — Immediate execution slice
**Created:** 2026-03-31
**Predecessor:** Schema Completeness Arc Phase 2 (✅ complete, 2026-03-30)

---

## Goal

Make **OAS 3.2.0 the canonical target version**. All output, error messages, documentation, and validation criteria reference 3.2 — not 3.1. OAS 3.1 is no longer the target; it is tolerated only as a transitional input artefact from Scalar's `upgrade()` function.

OAS 3.2 is **fully backwards-compatible** with 3.1 — every valid 3.1 document is a valid 3.2 document. This makes the version migration safe: no semantic changes, no input rejection.

---

## Canonical Version Doctrine

> **After this slice, OAS 3.2 is the canonical version everywhere.**

- **IR:** `openApiVersion` is always `'3.2.0'` — no IR document should contain `'3.1.0'`
- **Output:** all writers emit `"openapi": "3.2.0"`
- **Input validation:** `isBundledOpenApiDocument()` accepts `3.1.x` AND `3.2.x` (because Scalar's `upgrade()` converts 2.0/3.0 → 3.1, and we cannot control that)
- **Error messages:** all rejection and validation messages reference `3.2`, not `3.1`
- **Documentation:** all references to the OAS version in session-entry, roadmap, TSDoc, README, and test fixtures say `3.2.0`
- **Test fixtures:** all hardcoded `'3.1.0'` become `'3.2.0'`

  3.1.x input acceptance is a **compatibility bridge**, not a peer target. Once Scalar's `upgrade()` can target 3.2 directly, the 3.1 bridge can be removed.

---

## Impact

- Users with OAS 3.2 documents can use Castr immediately (currently rejected by the `isBundledOpenApiDocument` type guard)
- Output documents claim `3.2.0`, which is current and correct since we don't emit any 3.1-only deprecated patterns

---

## Scope

### In Scope

1. **Input validation** — accept `3.2.x` as primary; tolerate `3.1.x` as Scalar upgrade bridge
2. **Parser normalisation** — all parsers set `openApiVersion: '3.2.0'` (never '3.1.0')
3. **Output version** — writers emit `"openapi": "3.2.0"` unconditionally
4. **Error messages** — all version-related errors reference 3.2 as the target
5. **Type dependency** — verify `openapi3-ts` types are compatible; if not, add thin type extensions
6. **Scalar upgrade** — verify `@scalar/openapi-parser` `upgrade()` handles 3.2 input (research: it does)
7. **Tests** — update all hardcoded `'3.1.0'` version strings in test fixtures to `'3.2.0'`
8. **Documentation** — update roadmap, session-entry, supported formats table, and all TSDoc

### Out of Scope

All new OAS 3.2 features — see companion plan `oas-3.2-full-feature-support.md`.

---

## Changes

### 1. Input Validation (`upgrade-validate.ts`)

The input guard must accept both `3.1.x` (from Scalar `upgrade()`) and `3.2.x` (native 3.2 input). 3.1.x acceptance is a **bridge**, not a target.

```
upgrade-validate.ts:
  - OPENAPI_VERSION_MINOR_1 → ACCEPTED_OPENAPI_MINOR_VERSIONS = new Set(['1', '2'])
  - Error message: 'Failed to produce valid OpenAPI 3.2 document' (not '3.1')
  - TSDoc: document that 3.1 acceptance is transitional
```

### 2. Parser Normalisation (Canonical Version)

All parsers normalise to `'3.2.0'` at the parser boundary. After parsing, no IR document should contain `'3.1.0'`. The writer then emits whatever `ir.openApiVersion` says (which is always `'3.2.0'`).

Files:

- `parsers/openapi/index.ts` line 94: `openApiVersion: document.openapi` → `openApiVersion: '3.2.0'`
- `parsers/zod/zod-parser.ts` line 85: `openApiVersion: '3.1.0'` → `openApiVersion: '3.2.0'`
- `parsers/json-schema/index.ts`: check if JSON Schema parser sets a version

### 3. Type Compatibility

`openapi3-ts` does not yet have OAS 3.2 types. However:

- OAS 3.2 is backwards-compatible with 3.1
- The `openapi3-ts/oas31` types are a superset of what we use
- New 3.2 fields (`itemSchema`, `additionalOperations`, tag `parent`/`kind`) are not handled yet and will be passed through as unknown extensions
- **No type changes needed for this slice** — existing `oas31` types work

### 4. Test Fixture Updates

All test fixtures that hardcode `'3.1.0'` need updating to `'3.2.0'`:

- `lib/src/schema-processing/ir/test-helpers.ts`
- `lib/src/schema-processing/ir/serialization.unit.test.ts`
- `lib/src/schema-processing/writers/openapi/openapi-writer.unit.test.ts`
- `lib/src/schema-processing/writers/typescript/typescript.unit.test.ts`
- `lib/src/architecture/ir-completeness.arch.test.ts`
- Various other test files with `openApiVersion: '3.1.0'`

Use `grep -r "openApiVersion: '3.1.0'" --include='*.ts'` to find all.

### 5. Documentation

- `session-entry.prompt.md`: update supported formats, current state
- `roadmap.md`: update supported formats table, mark version plumbing as complete
- `schema-document.ts`: update TSDoc example from `'3.1.0'` to `'3.2.0'`

---

## TDD Order

1. **RED**: Update `upgrade-validate.test.ts` to expect 3.2.0 acceptance alongside 3.1.x
2. **RED**: Add test: output from OpenAPI writer emits `"openapi": "3.2.0"`
3. **GREEN**: Update `upgrade-validate.ts` to accept `3.2.x`
4. **GREEN**: Update parser version normalisation
5. **UPDATE**: Fix all hardcoded `'3.1.0'` in test fixtures
6. **VERIFY**: `pnpm check` green

---

## Quality Gates

- `pnpm check` exit 0
- All existing round-trip and transform proofs continue passing with 3.2.0 version
- OAS 3.2.0 input document accepted end-to-end

---

## Design Decision

**Why normalise to 3.2.0?** OAS 3.2 is backwards-compatible. Once we accept 3.2, there is no reason to downgrade output to 3.1. Emitting 3.2 signals to consumers that the output conforms to the latest stable version.

**Why not just pass through the input version?** The IR is format-version-agnostic. The parser should normalise to the target version, not pass through an arbitrary version string that may have been 2.0.0 (Swagger) before Scalar's upgrade().
