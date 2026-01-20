# Zod 4 Output Compliance Plan

**Date:** January 20, 2026  
**Status:** 🚧 IN PROGRESS  
**Session:** 2.8  
**Specification:** [zod-output-acceptance-criteria.md](../../docs/zod-output-acceptance-criteria.md)

---

## Objective

Implement FULL Zod 4 output support with **zero information loss** from the IR.

> [!IMPORTANT]
> Session 2.8 proves that OpenAPI → IR → Zod produces correct, complete Zod schemas.
> This is one half of the production-ready path (the other being OpenAPI round-trip, now complete).

---

## Progress Summary

| Phase | Focus | Status |
|-------|-------|--------|
| 2.8.1 | Audit & Planning | ✅ Complete |
| 2.8.2 | Metadata via .meta() | ✅ Complete |
| 2.8.3 | Type Coverage & Fail-Fast | ✅ Complete |
| 2.8.4 | Integration Tests | 🔲 **NEXT** |
| 2.8.5 | Validation Parity Tests | 🔲 Pending |

---

## Completed Work (2.8.1 - 2.8.3)

### Metadata via .meta() ✅

All IR metadata fields now output via `.meta()`:

- `description` → `.meta({ description })`
- `title` → `.meta({ title })`
- `deprecated` → `.meta({ deprecated: true })`
- `example` → `.meta({ examples: [value] })`
- `examples` → `.meta({ examples: [...] })`
- `externalDocs` → `.meta({ externalDocs })`
- `xml` → `.meta({ xml })`

### Type Coverage ✅

| Pattern | Zod Output | Status |
|---------|------------|--------|
| `type: 'null'` | `z.null()` | ✅ Implemented |
| `const` value | `z.literal(value)` | ✅ Implemented |
| `type: ['string', 'null']` | `z.string().nullable()` | ✅ Implemented |
| `type: ['number', 'boolean']` | `z.union([...])` | ✅ Implemented |
| Unknown types | **THROWS** (fail-fast) | ✅ Implemented |

### Strict-By-Default ✅

- Objects use `.strict()` unless `additionalProperties: true`
- Unknown types throw instead of silently using `z.unknown()`
- No silent coercion

### Documentation Updated ✅

- Added Strict-By-Default section to `RULES.md`
- Updated 7 snapshot tests for correct behavior

---

## Remaining Work

### Phase 2.8.4: Integration Tests

**Goal:** Test the full OpenAPI → IR → Zod pipeline

**Location:** `lib/tests-roundtrip/zod-output.integration.test.ts`

**Fixtures to use:**
- `petstore-expanded-3.0.yaml`
- `tictactoe-3.1.yaml`
- `oak-api.json`

**Test approach:**
```typescript
// Load OpenAPI fixture
const doc = await loadOpenApiDocument(fixturePath);
const ir = buildIR(doc.document);

// Generate Zod
const zodResult = await generateZodClientFromOpenAPI({
  input: fixturePath,
  disableWriteToFile: true,
});

// Verify compilation
const project = new Project();
const file = project.createSourceFile('test.ts', zodResult.content);
const diagnostics = file.getPreEmitDiagnostics();
expect(diagnostics.length).toBe(0);
```

### Phase 2.8.5: Validation Parity Tests

**Goal:** Same data passes/fails both OpenAPI and Zod validators

```typescript
// For each fixture's sample data:
const openapiValid = openapiValidator.validate(data);
const zodValid = zodSchema.safeParse(data).success;
expect(openapiValid).toBe(zodValid);
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/src/writers/zod/index.ts` | Main Zod writer (modified) |
| `lib/src/writers/zod/metadata.ts` | Metadata via .meta() (new) |
| `lib/scripts/generate-normalized-fixtures.ts` | Generates zod.ts outputs |
| `lib/tests-roundtrip/__fixtures__/normalized/` | Fixtures with Zod output |

---

## Quality Gates

All 10 must pass after each change:

```bash
cd lib && pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

**Current Status:** ALL PASS ✅
- test: 939/939
- snapshot: 173/173
- gen: 20/20
- character: 161/161

---

## Definition of Done

Session 2.8 is complete when:

- [x] All IR metadata fields flow to `.meta()` calls
- [x] `z.null()` for null type
- [x] `z.literal()` for const values
- [x] OAS 3.1 type arrays handled correctly
- [x] Fail-fast on unsupported patterns (no `z.unknown()`)
- [x] Strict-by-default documented in RULES.md
- [ ] Integration tests for full pipeline
- [ ] Validation parity tests
- [x] All 10 quality gates pass

---

## References

- [zod-output-acceptance-criteria.md](../../docs/zod-output-acceptance-criteria.md)
- [Zod 4 Metadata Docs](https://zod.dev/metadata)
- [RULES.md](../RULES.md) - Strict-By-Default section
