# Phase 1 Completion Plan: OpenAPI → Zod

**Date:** January 8, 2026
**Status:** Approved — Ready to Execute

---

## Problem Statement

Phase 1 (OpenAPI → Zod) is functionally working but architecturally incomplete. The IR is being bypassed in several places, making the architecture fragile before adding bidirectional transforms.

### Current Issues

| Issue                           | Location                  | Impact                            |
| ------------------------------- | ------------------------- | --------------------------------- |
| Context layer passes raw `doc`  | `template-context.ts`     | IR not single source of truth     |
| MCP generation uses raw OpenAPI | `template-context.mcp.ts` | Bypasses IR entirely              |
| No architectural validation     | (missing)                 | Can't prove architecture is clean |

---

## Definition of "Phase 1 Complete"

### Structural Acceptance Criteria

1. **IR is Single Source of Truth**
   - After `buildIR()`, NO code path accesses raw OpenAPI
   - All writers receive only `CastrDocument`
   - Zero imports of `OpenAPIObject` in writer layer

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

### Validation Framework Criteria

1. **Architectural lint rules** prevent IR bypass
2. **Layer boundary tests** verify no cross-layer imports
3. **IR completeness tests** verify all needed data is present

---

## Work Phases

### Phase IR-2: Context Layer Cleanup (6-8h)

**Goal:** Remove all raw `doc` passing from context layer.

**Files:**

- `lib/src/context/template-context.ts`
- `lib/src/context/template-context.endpoints.ts`
- Related context files

**Acceptance:**

- [ ] `doc: OpenAPIObject` parameter removed from all post-IR functions
- [ ] All context functions accept only `CastrDocument`
- [ ] Tests pass without raw doc access

### Phase IR-3: MCP Subsystem Cleanup (10-12h)

**Goal:** MCP generation operates exclusively on IR.

**Files:**

- `lib/src/context/template-context.mcp.ts`
- Related MCP generation code

**Acceptance:**

- [ ] MCP generation reads from `CastrDocument.operations`
- [ ] No direct OpenAPI access in MCP layer
- [ ] MCP tests pass using IR-only path

### Phase IR-4: Validation Framework (8-10h)

**Goal:** Automated enforcement of architectural boundaries.

**Approach:** Vitest-based architectural tests + ESLint rules

#### Vitest Architectural Tests

```typescript
// lib/src/architecture/layer-boundaries.arch.test.ts

describe('Layer Boundaries', () => {
  it('writers do not import OpenAPIObject', async () => {
    const writerFiles = await glob('lib/src/writers/**/*.ts');
    for (const file of writerFiles) {
      const content = await fs.readFile(file, 'utf-8');
      expect(content).not.toContain("from 'openapi3-ts");
    }
  });
});
```

#### ESLint Architectural Rules

```javascript
// .eslintrc.js addition
rules: {
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['openapi3-ts/*'],
      importNames: ['OpenAPIObject'],
      message: 'Writers must not import OpenAPIObject. Use CastrDocument.'
    }]
  }]
}
```

### Phase IR-5: Documentation & Hardening (4-6h)

**Goal:** Update all documentation to reflect clean architecture.

**Deliverables:**

- [ ] Updated ADR-024 with completed status
- [ ] Architecture diagram showing clean layers
- [ ] Session entry prompt updated
- [ ] Roadmap updated

---

## Success Criteria Summary

**Phase 1 is complete when:**

1. ✅ IR-2 done: Context layer uses only CastrDocument
2. ✅ IR-3 done: MCP uses only CastrDocument
3. ✅ Validation framework: Architectural tests pass
4. ✅ All 10 quality gates pass
5. ✅ Documentation updated

**Only then proceed to Phase 2 (Zod → OpenAPI).**

---

## Estimated Effort

| Phase                      | Effort | Cumulative |
| -------------------------- | ------ | ---------- |
| IR-2: Context Cleanup      | 6-8h   | 6-8h       |
| IR-3: MCP Cleanup          | 10-12h | 16-20h     |
| IR-4: Validation Framework | 8-10h  | 24-30h     |
| IR-5: Documentation        | 4-6h   | 28-36h     |

**Total:** ~28-36 hours (4-5 focused sessions)
