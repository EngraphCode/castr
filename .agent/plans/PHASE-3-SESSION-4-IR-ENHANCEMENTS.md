# Phase 3 - Session 3.4: IR Enhancements & Additional Writers

**Status:** Planned
**Prerequisites:** Session 3.3 (IR Persistence) ✅
**Reference:** `.agent/plans/PHASE-3-TS-MORPH-IR.md`
**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`

---

## 🎯 Goal

Enrich the Intermediate Representation (IR) with metadata required for Phase 4 (e.g., parameter maps, enum catalogs) and implement a simple Markdown writer to prove the "Modular Writer" architecture.

## ⚠️ Critical Rules

1. **TDD is MANDATORY:** Write failing tests first.
2. **Type Discipline:** No `any`, `as`, `!`, or `Record<string, unknown>`.
3. **Preserve Information:** Do not widen types.
4. **Pure Functions:** Prefer pure functions for IR transformation logic.

---

## 📋 Implementation Plan

### 1. Operation ID Normalization

**Objective:** Ensure every operation in the IR has a deterministic `operationId`.

- **[ ] TDD: Operation ID Generation**
  - Create `lib/src/context/ir-enhancers/operation-id.test.ts`.
  - Test cases:
    - Existing `operationId` is preserved.
    - Missing `operationId` is generated from method + path (e.g., `getUsers`, `postUsersById`).
    - Sanitization of invalid characters.
  - Implement `ensureOperationIds(ir: IRDocument): IRDocument` in `lib/src/context/ir-enhancers/operation-id.ts`.
  - Integrate into `buildIRSchema` or a post-processing step.

### 2. Parameter Grouping

**Objective:** Group parameters by location (query, path, header, cookie) for easier access by writers.

- **[ ] TDD: Parameter Grouping**
  - Create `lib/src/context/ir-enhancers/parameter-grouping.test.ts`.
  - Test cases:
    - Parameters correctly sorted into `parametersByLocation` object.
    - Empty groups are handled (empty arrays).
    - Merged parameters (path-level + operation-level) are handled correctly.
  - Update `IROperation` interface in `lib/src/context/ir-schema.ts` to include `parametersByLocation`.
  - Implement logic in `IRBuilder` or enhancer.

### 3. Enum Catalog

**Objective:** Extract all enums (inline and component) into a centralized catalog.

- **[ ] TDD: Enum Extraction**
  - Create `lib/src/context/ir-enhancers/enum-catalog.test.ts`.
  - Test cases:
    - Component enums are captured.
    - Inline enums are captured and given deterministic names.
    - Deduplication of identical enums.
  - Update `IRDocument` interface to include `enums: Map<string, IREnum>`.
  - Implement extraction logic.

### 4. Markdown Writer (Proof of Concept)

**Objective:** Implement a simple writer that consumes the IR and produces Markdown documentation. This proves the "Modular Writer" concept.

- **[ ] TDD: Markdown Writer**
  - Create `lib/src/writers/markdown.test.ts`.
  - Test cases:
    - Generates title and version from `info`.
    - Lists all paths and methods.
    - Displays parameters and response codes.
  - Implement `writeMarkdown(ir: IRDocument): string` in `lib/src/writers/markdown.ts`.
  - Add CLI flag `--writer markdown` (or similar) to test integration (optional for this session, but good for verification).

---

## ✅ Verification

1. **Unit Tests:** All new tests pass.
2. **Integration:** `pnpm test:all` passes.
3. **Fidelity:** Run `pnpm test:character` to ensure no regressions in existing code generation (IR enhancements shouldn't break Zod generation).
4. **Manual:** Generate Markdown for a sample spec and inspect output.
