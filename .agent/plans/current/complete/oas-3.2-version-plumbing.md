# OAS 3.2 Version Plumbing

**Status:** ✅ COMPLETE — Thursday 2 April 2026 (staged completion record)
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
- **Documentation:** all references to the OAS version in the session handoff prompt, roadmap, TSDoc, README, and test fixtures say `3.2.0`
- **Test fixtures:** all hardcoded `'3.1.0'` become `'3.2.0'`

  3.1.x input acceptance is a **compatibility bridge**, not a peer target. Once Scalar's `upgrade()` can target 3.2 directly, the 3.1 bridge can be removed.

---

## Impact

- Users with OAS 3.2 documents can use Castr immediately (currently rejected by the `isBundledOpenApiDocument` type guard)
- Output documents claim `3.2.0`, which is current and correct since we don't emit any 3.1-only deprecated patterns

## Completion Note (Thursday, 2 April 2026)

- Native `{ openapi: '3.2.0' }` input now succeeds through the shared preparation boundary
- `upgradeAndValidate()` accepts both `3.1.x` bridge input and `3.2.x` native input, then returns canonical `openapi: '3.2.0'`
- `pnpm test:gen` now includes representative native OAS 3.2 fixture coverage
- Repo-local doctor preflight now dispatches to Scalar's bundled `v3.1` or `v3.2` schema for supported versions and skips local preflight for 2.0/3.0
- the full repo-root Definition of Done chain now passes via `pnpm check:ci`
- The remaining successor arc is 3.2-only feature expansion, not version-string plumbing

---

## Assumptions To Validate

- Scalar's `upgrade()` tolerates native 3.2 input and the only blocking seam here is our version guard plus downstream normalisation
- `openapi3-ts/oas31` remains sufficient for the plumbing slice because new OAS 3.2 features are still out of scope
- The generated-code validation surface can gain a native 3.2 proof seam without redesigning the harness or expanding grouped-output scope

---

## Scope

### In Scope

1. **Input validation** — accept `3.2.x` as primary; tolerate `3.1.x` as Scalar upgrade bridge
2. **Parser normalisation** — all parsers set `openApiVersion: '3.2.0'` (never '3.1.0')
3. **Output version** — writers emit `"openapi": "3.2.0"` unconditionally
4. **Error messages** — all version-related errors reference 3.2 as the target
5. **Type dependency** — verify `openapi3-ts` types are compatible; if not, add thin type extensions
6. **Scalar upgrade** — verify `@scalar/openapi-parser` `upgrade()` handles 3.2 input (research: it does)
7. **Tests** — update hardcoded `'3.1.0'` version strings where 3.2 is now canonical, and add explicit native 3.2 acceptance proofs at the shared prep boundary and generation seam
8. **Documentation** — update roadmap, the session handoff prompt, supported formats table, and all TSDoc

### Out of Scope

All new OAS 3.2 features were intentionally deferred from this plumbing slice; the completed companion closure record now lives at [oas-3.2-full-feature-support.md](./oas-3.2-full-feature-support.md).

---

## Changes

### 1. Input Validation (`upgrade-validate.ts`)

The input guard must accept both `3.1.x` (from Scalar `upgrade()`) and `3.2.x` (native 3.2 input). 3.1.x acceptance is a **bridge**, not a target.

Landed result:

- Native `{ openapi: '3.2.0' }` input is accepted at this guard
- `3.1.x` remains accepted as the documented bridge version

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
- At the time of this plumbing slice, new 3.2 fields (`itemSchema`, `additionalOperations`, tag `parent`/`kind`) were intentionally deferred to the companion feature-support workstream. That follow-on work is now complete in [oas-3.2-full-feature-support.md](./oas-3.2-full-feature-support.md).
- **No type changes needed for this slice** — existing `oas31` types work

### 4. Test And Proof Expansion

Version-string replacement is necessary but not sufficient. The active slice also needs native 3.2 proof seams that would have caught the current shared-boundary rejection.

- `upgrade-validate.test.ts`: add native 3.2 acceptance proof and keep explicit 3.1 bridge proof
- add end-to-end generation proof for `generateZodClientFromOpenAPI({ openApiDoc: { openapi: '3.2.0', ... } })`
- expand `test:gen` representative coverage with at least one native 3.2 case that flows through the same preparation boundary
- if the generated-suite fixture roster changes, update `tests-generated/FIXTURES.md` so the documented proof scope stays honest

All test fixtures that hardcode `'3.1.0'` and should now be canonical 3.2 need updating:

- `lib/src/schema-processing/ir/test-helpers.ts`
- `lib/src/schema-processing/ir/serialization.unit.test.ts`
- `lib/src/schema-processing/writers/openapi/openapi-writer.unit.test.ts`
- `lib/src/schema-processing/writers/typescript/typescript.unit.test.ts`
- `lib/src/architecture/ir-completeness.arch.test.ts`
- Various other test files with `openApiVersion: '3.1.0'`

Use `grep -r "openApiVersion: '3.1.0'" --include='*.ts'` to find all.

### 5. Documentation

- `session-continuation.prompt.md`: update supported formats and current state
- `roadmap.md`: update supported formats table, mark version plumbing as complete
- `schema-document.ts`: update TSDoc example from `'3.1.0'` to `'3.2.0'`
- `tests-generated/FIXTURES.md`: update fixture-scope documentation if native 3.2 proof coverage is added there

---

## TDD Order

1. **RED**: Update `upgrade-validate.test.ts` to expect native 3.2.0 acceptance alongside explicit 3.1.x bridge acceptance
2. **RED**: Add direct generation proof for native 3.2 input through `generateZodClientFromOpenAPI`
3. **RED**: Expand `test:gen` representative coverage with a native 3.2 case so the shared prep boundary is exercised there
4. **RED**: Add test: output from OpenAPI writer emits `"openapi": "3.2.0"`
5. **GREEN**: Update `upgrade-validate.ts` to accept `3.2.x` and report 3.2-targeted errors
6. **GREEN**: Update parser version normalisation
7. **UPDATE**: Fix all hardcoded `'3.1.0'` in fixtures, docs, and TSDoc where 3.2 is now canonical
8. **VERIFY**: `pnpm check` green

---

## Success Criteria

- Native OAS 3.2 input is accepted end to end through the shared preparation boundary
- 3.1.x remains accepted only as the documented Scalar compatibility bridge
- After parsing, IR documents carry `openApiVersion: '3.2.0'` only
- OpenAPI writer emits `"openapi": "3.2.0"` deterministically
- `test:gen` includes an explicit native 3.2 proof seam instead of relying only on 3.0/3.1 representative fixtures
- Handoff docs and proof-scope docs are updated so the current validation story is honest

---

## Documentation Outputs

Historical outputs completed by this slice:

- this completion record was revised with the native-3.2 proof obligations and completion criteria
- `session-continuation.prompt.md` and `roadmap.md` were updated when the verified repo truth changed
- TSDoc and durable comments that still presented 3.1 as the canonical target were updated
- generated-suite proof-scope docs were updated where the fixture roster or guarantees changed

---

## Quality Gates

- `pnpm check:ci` exit 0
- All existing round-trip and transform proofs continue passing with 3.2.0 version
- OAS 3.2.0 input document accepted end-to-end

---

## Design Decision

**Why normalise to 3.2.0?** OAS 3.2 is backwards-compatible. Once we accept 3.2, there is no reason to downgrade output to 3.1. Emitting 3.2 signals to consumers that the output conforms to the latest stable version.

**Why not just pass through the input version?** The IR is format-version-agnostic. The parser should normalise to the target version, not pass through an arbitrary version string that may have been 2.0.0 (Swagger) before Scalar's upgrade().
