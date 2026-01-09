# Phase 1 Completion Plan: OpenAPI → Zod

**Date:** January 9, 2026  
**Status:** In Progress — IR-3.5 Ready to Start (IR-3.1-3.4 Complete)

---

## Problem Statement

Phase 1 (OpenAPI → Zod) is functionally working but architecturally incomplete. The IR is being bypassed in several places, making the architecture fragile before adding bidirectional transforms.

### Current Issues

| Issue                              | Location                  | Impact                            |
| ---------------------------------- | ------------------------- | --------------------------------- |
| ~~Context layer passes raw `doc`~~ | ~~`template-context.ts`~~ | ✅ Fixed in IR-2                  |
| MCP generation uses raw OpenAPI    | `template-context.mcp.ts` | Bypasses IR entirely              |
| No architectural validation        | (missing)                 | Can't prove architecture is clean |

---

## Definition of "Phase 1 Complete"

### Structural Acceptance Criteria

1. **IR is Single Source of Truth**
   - After `buildIR()`, NO code path accesses raw OpenAPI
   - All writers receive only `CastrDocument`
   - Zero imports of `OpenAPIObject` in writer/MCP layers

2. **Clean Layer Separation**
   - Parser layer: `*.parser.ts` — Input → IR
   - Writer layer: `*.writer.ts` — IR → Output
   - No cross-layer dependencies

3. **IR Sufficiency**
   - `CastrDocument` contains ALL information needed for Zod/Type/MCP generation
   - No "reach back" to source document for missing data

### Functional Acceptance Criteria

1. **All existing tests pass** (10 quality gates)
2. **Generated output unchanged** (snapshot stability)
3. **No feature regression** (characterisation tests)

---

## Work Phases

### Phase IR-2: Context Layer Cleanup ✅ COMPLETE

**Goal:** Remove all raw `doc` passing from context layer.

**Acceptance:**

- [x] `doc: OpenAPIObject` parameter removed from post-IR context functions
- [x] Schema names from `ir.dependencyGraph.topologicalOrder`
- [x] Dependency graph from `ir.dependencyGraph.nodes`
- [x] Endpoint grouping uses `endpoint.tags` (from IR)
- [x] Tests pass (610 unit, 173 snapshot, 20 gen, 163 character)

---

### Phase IR-3: MCP Subsystem Cleanup — 🎯 CURRENT

**Goal:** MCP generation operates exclusively on IR.

**Analysis:** `CastrOperation` already contains all MCP-required data:

- `operationId`, `description`, `summary`
- `parameters[]` with `CastrSchema`
- `parametersByLocation` (pre-grouped by path/query/header/cookie)
- `requestBody` with content schemas
- `responses[]` with status codes and schemas
- `security[]` for auth metadata

#### IR-3.1: Create IR-based Parameter Extraction (2h) ✅ COMPLETE

**Files:** `template-context.mcp.parameters.ts`

**Acceptance:**

- [x] New function `collectParameterGroupsFromIR(operation: CastrOperation)` exists
- [x] Unit test proves output matches expected behavior (7 tests pass)
- [x] Zero `OpenAPIObject` imports in new function path

---

#### IR-3.2: Create IR-based Request Body/Response Resolution (2h) ✅ COMPLETE

**Files:** `template-context.mcp.responses.ts`

**Acceptance:**

- [x] `resolveRequestBodySchemaFromIR(operation)` exists
- [x] `resolvePrimarySuccessResponseSchemaFromIR(operation)` exists
- [x] Unit tests prove equivalence (11 tests pass)

---

#### IR-3.3: Create IR-based Schema Inlining (2h) ✅ COMPLETE

**Files:** `template-context.mcp.inline-json-schema.ts`

**Acceptance:**

- [x] `inlineJsonSchemaRefsFromIR(schema, ir)` reads from `ir.components.schemas`
- [x] Circular reference handling preserved
- [x] Unit tests verify ref resolution (7 tests pass)

---

#### IR-3.4: Create IR-based Tool Schema Builder (2h) ✅ COMPLETE

**Files:** `template-context.mcp.schemas.from-ir.ts` [NEW]

**Acceptance:**

- [x] `buildMcpToolSchemasFromIR({ operation, ir })` uses IR-3.1, IR-3.2, IR-3.3
- [x] Unit tests pass (7 tests)
- [x] Zero `OpenAPIObject` imports in implementation
- [x] File split to respect 220-line max (original 356→185, new file 178 lines)

---

#### IR-3.5: Wire Up buildMcpTools to Use IR-Only Path (2h) — 🎯 CURRENT

**Files:** `template-context.mcp.ts`, `template-context.ts`

**Acceptance:**

- [ ] `buildMcpTools({ ir })` replaces `buildMcpTools({ document, endpoints })`
- [ ] All MCP tests pass unchanged
- [ ] Character tests pass
- [ ] Zero `OpenAPIObject` imports in `template-context.mcp.ts`

---

#### IR-3.6: Cleanup — Remove Deprecated OpenAPI Functions (2h)

**Note:** 13 lint warnings exist for deprecated `ParameterAccumulator` usage. These will be resolved when removing the old functions.

**Acceptance:**

- [ ] `grep -r "OpenAPIObject" lib/src/context/template-context.mcp*.ts` returns 0 results
- [ ] All deprecated lint warnings resolved (currently 13)
- [ ] All 10 quality gates pass

---

### Phase IR-4: Validation Framework (4h)

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

| Phase        | Effort | Cumulative |
| ------------ | ------ | ---------- |
| IR-3.1-3.6   | 12h    | 12h        |
| IR-4         | 4h     | 16h        |
| IR-5         | 4h     | 20h        |

**Total:** ~20 hours (3-4 focused sessions)

---

## Success Criteria Summary

**Phase 1 is complete when:**

1. ✅ IR-2 done: Context layer uses only CastrDocument
2. 🟡 IR-3 in progress: MCP IR functions complete (IR-3.1-3.4), wiring pending (IR-3.5-3.6)
3. ⬜ IR-4 done: Architectural tests pass
4. ⬜ All 10 quality gates pass
5. ⬜ Documentation updated

**Only then proceed to Phase 2 (Zod → OpenAPI).**
