# Phase 1 Completion Plan: OpenAPI → Zod

**Date:** January 9, 2026  
**Status:** In Progress — IR-4 Ready to Start (IR-3 Complete)

---

## Problem Statement

Phase 1 (OpenAPI → Zod) is functionally working but architecturally incomplete. Automated validation is needed to prove and enforce clean architecture.

### Resolved Issues ✅

| Issue                              | Resolution                              |
| ---------------------------------- | --------------------------------------- |
| Context layer passes raw `doc`     | Fixed in IR-2                           |
| MCP generation uses raw OpenAPI    | Fixed in IR-3 (now IR-only)             |
| Scalar x-ext refs not inlined      | Fixed in IR-3.6                         |

### Remaining Work

| Issue                              | Location                  | Impact                            |
| ---------------------------------- | ------------------------- | --------------------------------- |
| No architectural validation        | (missing)                 | Can't prove architecture is clean |

---

## Definition of "Phase 1 Complete"

### Structural Acceptance Criteria

1. **IR is Single Source of Truth**
   - After `buildIR()`, NO code path accesses raw OpenAPI ✅
   - All writers receive only `CastrDocument` ✅
   - Zero imports of `OpenAPIObject` in writer/MCP layers ✅

2. **Clean Layer Separation**
   - Parser layer: `*.parser.ts` — Input → IR
   - Writer layer: `*.writer.ts` — IR → Output
   - No cross-layer dependencies

3. **IR Sufficiency**
   - `CastrDocument` contains ALL information needed for Zod/Type/MCP generation ✅
   - No "reach back" to source document for missing data ✅

### Functional Acceptance Criteria

1. **All existing tests pass** (10 quality gates) ✅
2. **Generated output unchanged** (snapshot stability) ✅
3. **No feature regression** (characterisation tests) ✅

---

## Work Phases

### Phase IR-2: Context Layer Cleanup ✅ COMPLETE

**Acceptance:**

- [x] `doc: OpenAPIObject` parameter removed from post-IR context functions
- [x] Schema names from `ir.dependencyGraph.topologicalOrder`
- [x] Dependency graph from `ir.dependencyGraph.nodes`
- [x] Endpoint grouping uses `endpoint.tags` (from IR)
- [x] Tests pass (661 unit, 173 snapshot, 20 gen, 163 character)

---

### Phase IR-3: MCP Subsystem Cleanup ✅ COMPLETE

**Goal:** MCP generation operates exclusively on IR.

#### IR-3.1–3.4: MCP IR Functions ✅ COMPLETE

- [x] `collectParameterGroupsFromIR(operation)` — 7 tests
- [x] `resolveRequestBodySchemaFromIR(operation)` — 11 tests
- [x] `resolvePrimarySuccessResponseSchemaFromIR(operation)` — 11 tests
- [x] `inlineJsonSchemaRefsFromIR(schema, ir)` — 7 tests (supports Scalar x-ext refs)
- [x] `buildMcpToolSchemasFromIR({ operation, ir })` — 7 tests

#### IR-3.5: Wire Up buildMcpTools ✅ COMPLETE

- [x] `buildMcpToolsFromIR(ir)` replaces `buildMcpTools({ document, endpoints })`
- [x] All MCP tests pass unchanged
- [x] Character tests pass
- [x] Zero `OpenAPIObject` imports in `template-context.mcp.ts`

#### IR-3.6: Cleanup ✅ COMPLETE

- [x] Removed legacy `buildMcpTools`, `normalizeDescription`, helper functions
- [x] Removed `OpenAPIObject` imports from MCP layer
- [x] Updated `index.ts` exports (`buildMcpToolsFromIR`)
- [x] Fixed Scalar x-ext ref inlining (`extractSchemaNameFromRef`)
- [x] Fixed composition schema wrapping (`wrapSchemaFromIR`)
- [x] All 20 `test:gen` tests pass

---

### Phase IR-4: Validation Framework (4h) — 🎯 CURRENT

**Goal:** Automated enforcement of architectural boundaries.

#### IR-4.1: Layer Boundary Tests

**Files:** [NEW] `lib/src/architecture/layer-boundaries.arch.test.ts`

**Acceptance:**

- [ ] Test fails if `OpenAPIObject` imported in MCP/writer layers
- [ ] Test runs in `pnpm test`

#### IR-4.2: IR Completeness Tests

**Files:** [NEW] `lib/src/architecture/ir-completeness.arch.test.ts`

**Acceptance:**

- [ ] Tests verify IR types contain all MCP/Writer required fields

---

### Phase IR-5: Documentation (4h)

**Deliverables:**

- [ ] ADR-024 updated with "Implemented" status
- [ ] Session entry prompt updated
- [ ] Roadmap updated
- [ ] TSDoc for all new MCP functions

---

## Verification (After Each Work Unit)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && pnpm test:gen && pnpm character
```

---

## Estimated Effort

| Phase      | Status   | Effort |
| ---------- | -------- | ------ |
| IR-3.1-3.6 | ✅ Done  | 12h    |
| IR-4       | 🎯 Next  | 4h     |
| IR-5       | Pending  | 4h     |

**Remaining:** ~8 hours (1-2 focused sessions)

---

## Success Criteria Summary

**Phase 1 is complete when:**

1. ✅ IR-2 done: Context layer uses only CastrDocument
2. ✅ IR-3 done: MCP subsystem uses only IR
3. ⬜ IR-4 done: Architectural tests pass
4. ✅ All 10 quality gates pass
5. ⬜ Documentation updated

**Only then proceed to Phase 2 (Zod → OpenAPI).**
