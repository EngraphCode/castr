# CodeMetaData Usage Audit

**Date:** November 13, 2025
**Purpose:** Document all CodeMetaData usages before migration to IRSchemaNode
**Scope:** 13 files across conversion pipeline and context builders

---

## Executive Summary

CodeMetaData is used throughout the Zod conversion pipeline to track:

1. **Required status** (`isRequired?: boolean`) - Whether schema is required in parent context
2. **Inheritance chain** (`parent?: ZodCodeResult`) - Parent schema for composition (allOf, oneOf, anyOf)
3. **Reference tracking** (`referencedBy?: ZodCodeResult[]`) - Chain of references for circular detection

**Migration Strategy:** Replace with IRSchemaNode which provides richer metadata:

- `IRSchemaNode.required` (replaces `isRequired`)
- `IRSchemaNode.inheritance` (replaces `parent`)
- `IRSchemaNode.dependencyGraph` (replaces `referencedBy`)
- NEW: `nullable`, `zodChain`, `circularReferences`

---

## File-by-File Analysis

### 1. `lib/src/conversion/zod/index.ts`

**Role:** Interface definition and main conversion orchestrator

**CodeMetaData Definition:**

```typescript
export interface CodeMetaData {
  parent?: ZodCodeResult; // Inheritance info
  referencedBy?: ZodCodeResult[]; // Reference chain
  isRequired?: boolean; // Required status
}
```

**Usage Patterns:**

1. **Interface exported** - Public API surface (line 20)
2. **`ConversionArgs` interface** - Accepts `meta?: CodeMetaData` (line 55)
3. **`buildMetadata()` function** - Creates CodeMetaData from inherited meta (line 83)
   - Spreads `referencedBy` array with new code result
   - Preserves `parent` if present
   - Preserves `isRequired` if present
4. **`prepareSchemaContext()` function** - Returns `meta: CodeMetaData` (line 109)
5. **All handler functions** - Accept `meta: CodeMetaData` parameter

**Fields Accessed:**

- `meta?.referencedBy` - For circular reference detection
- `meta?.parent` - For inheritance tracking
- `meta?.isRequired` - For presence chain generation

**Replacement Pattern:**

- Add `irNode?: IRSchemaNode` parameter alongside `meta`
- Prefer `irNode` when present, fallback to `meta`
- Eventually remove `meta` completely

---

### 2. `lib/src/conversion/zod/chain.ts`

**Role:** Generate Zod presence chains (.optional(), .nullable(), .nullish())

**Usage Patterns:**

1. **`ZodChainArgs` interface** - Accepts `meta?: CodeMetaData` (line 16)
2. **`getZodChainablePresence()` function** - Uses `meta?.isRequired` (line 36)
   - Reads `meta?.isRequired ?? false`
   - Combines with `nullable` from schema type array
   - Returns appropriate chain: `nullish()`, `nullable()`, `optional()`, or empty string

**Fields Accessed:**

- `meta?.isRequired` - To determine if schema is required

**Replacement Pattern:**

```typescript
// OLD
const isRequired = meta?.isRequired ?? false;

// NEW (via adapter)
const isRequired = irNode ? getRequiredFromIR(irNode) : false;
```

---

### 3. `lib/src/conversion/zod/handlers.core.ts`

**Role:** Core handlers for references, primitives, arrays, objects

**Usage Patterns:**

1. **Type imports** - `import type { CodeMetaData } from './index.js'` (line 14)
2. **`GetZodSchemaFn` type** - Accepts `meta?: CodeMetaData` (line 22)
3. **`GetZodChainFn` type** - Accepts `meta?: CodeMetaData` (line 28)
4. **`handleReferenceWithLookup()` function** - Accepts `meta: CodeMetaData` (line 80)
5. **`handleCircularReference()` function** - Accepts `meta: CodeMetaData` (line 118)
   - Uses `meta.referencedBy` to detect circular references
6. **`handlePrimitiveSchema()` function** - Accepts `meta: CodeMetaData` (line 153)
7. **`handleArraySchema()` function** - Accepts `meta: CodeMetaData` (line 234)

**Fields Accessed:**

- `meta.referencedBy` - For circular reference detection (line 126, 150)

**Replacement Pattern:**

```typescript
// OLD
const refPath = (meta.referencedBy ?? []).map((prev) => extractRefName(prev, ctx));

// NEW (via adapter)
const refPath = irNode ? getCircularReferencesFromIR(irNode) : [];
```

---

### 4. `lib/src/conversion/zod/handlers.object.properties.ts`

**Role:** Build Zod code for object properties

**Usage Patterns:**

1. **Type imports** - `import type { CodeMetaData } from './index.js'` (line 8)
2. **`GetZodSchemaFn` type** - Accepts `meta?: CodeMetaData` (line 13)
3. **`GetZodChainFn` type** - Accepts `meta?: CodeMetaData` (line 19)
4. **`buildPropertyMetadata()` function** - Creates CodeMetaData for properties (line 46)
   - Spreads inherited meta
   - Sets `isRequired` based on property's required status
5. **`buildPropertyZodCode()` function** - Accepts `propMetadata: CodeMetaData` (line 78)
6. **`buildObjectPropertiesArray()` function** - Accepts `meta: CodeMetaData` (line 110)
7. **`buildObjectPropertiesString()` function** - Accepts `meta: CodeMetaData` (line 150)

**Fields Accessed:**

- All fields via spread operator in `buildPropertyMetadata`
- `propMetadata.isRequired` - Set based on schema's required array

**Replacement Pattern:**

```typescript
// OLD
function buildPropertyMetadata(meta: CodeMetaData, propIsRequired: boolean): CodeMetaData {
  return { ...meta, isRequired: propIsRequired };
}

// NEW (via IR)
// Properties would have their own IRSchemaNode instances in IRSchema.properties
// Each property's IRSchemaNode.required would be pre-computed from schema's required array
```

---

### 5. `lib/src/conversion/zod/handlers.object.schema.ts`

**Role:** Handle object schema validation and structure

**Usage Patterns:**

1. **Type imports** - `import type { CodeMetaData } from './index.js'` (line 8)
2. **`GetZodSchemaFn` type** - Accepts `meta?: CodeMetaData` (line 13)
3. **`GetZodChainFn` type** - Accepts `meta?: CodeMetaData` (line 19)
4. **`handleObjectSchema()` function** - Accepts `meta: CodeMetaData` (line 34)
5. **`handleExplicitObjectSchema()` function** - Accepts `meta: CodeMetaData` (line 119)
6. **`handleCatchAllObject()` function** - Accepts `meta: CodeMetaData` (line 153)

**Fields Accessed:**

- None directly - passes meta through to property handlers

**Replacement Pattern:**

- Pass `irNode` through to property handlers

---

### 6. `lib/src/conversion/zod/composition.ts`

**Role:** Handle allOf, oneOf, anyOf composition schemas

**Usage Patterns:**

1. **Type imports** - `import type { CodeMetaData } from './index.js'` (line 6)
2. **`GetZodSchemaFn` type** - Accepts `meta?: CodeMetaData` (line 11)
3. **`handleOneOfSchema()` function** - Accepts `meta: CodeMetaData` (line 25)
4. **`handleAllOfSchema()` function** - Uses `meta?.parent` for inheritance (line 101)
   - Sets `meta.parent` to track inheritance chain
5. **`handleAnyOfSchema()` function** - Accepts `meta: CodeMetaData` (line 174)

**Fields Accessed:**

- `meta.parent` - For inheritance tracking in allOf compositions

**Replacement Pattern:**

```typescript
// OLD
const childMeta: CodeMetaData = { ...meta, parent: code };

// NEW (via adapter)
// IRSchemaNode.inheritance.parent would be pre-computed in IR builder
const parent = irNode ? getParentFromIR(irNode) : undefined;
```

---

### 7. `lib/src/context/template-context.ts`

**Role:** Build template context for code generation

**Usage Patterns:**

- **No direct CodeMetaData construction** - Only type references in comments
- Passes through to conversion functions

**Replacement Pattern:**

- Wire in `buildIR()` to populate `_ir: IRDocument` field
- Pass IRSchemaNode to conversion functions instead of CodeMetaData

---

### 8. `lib/src/index.ts`

**Role:** Public API exports

**Usage Patterns:**

1. **Export CodeMetaData type** - `type CodeMetaData` (line 3)
   - Part of public API surface

**Replacement Pattern:**

- Remove from exports
- Breaking change (acceptable - internal type, no external consumers)

---

### 9. `lib/src/public-api-preservation.test.ts`

**Role:** Test public API surface

**Usage Patterns:**

- Tests that CodeMetaData is exported

**Replacement Pattern:**

- Update test to verify CodeMetaData is NOT exported
- Verify IRSchemaNode is available (if exposed)

---

### 10. `lib/src/conversion/zod/handlers.core.test.ts`

**Role:** Unit tests for core handlers

**Usage Patterns:**

1. **Type import** - `import type { CodeMetaData } from './index.js'` (line 4)
2. **Mock CodeMetaData objects** - Creates test metadata (lines 34, 79, 148)
   ```typescript
   const meta: CodeMetaData = { isRequired: true };
   ```

**Replacement Pattern:**

```typescript
// OLD
const meta: CodeMetaData = { isRequired: true };

// NEW
const irNode: IRSchemaNode = {
  required: true,
  nullable: false,
  dependencyGraph: { referencedBy: [], circularReferences: [] },
  zodChain: { presence: '', validations: '', defaults: '' },
  circularReferences: [],
};
```

---

### 11. `lib/src/conversion/zod/handlers.object.properties.test.ts`

**Role:** Unit tests for property handlers

**Usage Patterns:**

1. **Type import** - `import type { CodeMetaData } from './index.js'` (line 4)
2. **Mock CodeMetaData objects** - Creates property metadata (line 16)
   ```typescript
   const propMetadata: CodeMetaData = { isRequired: true };
   ```

**Replacement Pattern:**

- Same as handlers.core.test.ts above

---

### 12. `lib/src/context/ir-schema.ts`

**Role:** IR type definitions (documentation only)

**Usage Patterns:**

1. **Documentation comments** - References CodeMetaData in TSDoc
   - Lines 732, 738, 744-748: "replaces CodeMetaData"
   - Lines 784, 795, 814, 821, 830, 840, 850, 868, 886, 896: Migration notes

**Replacement Pattern:**

- Keep documentation as is (helps with migration understanding)
- These are helpful comments, not code references

---

### 13. `lib/src/context/ir-validators.ts`

**Role:** IR type guards (documentation only)

**Usage Patterns:**

1. **Documentation comments** - References CodeMetaData in TSDoc (line 195)
   - "This is the metadata structure that replaces CodeMetaData"

**Replacement Pattern:**

- Keep documentation as is

---

## Integration Points

### Template Context Pipeline

**Current Flow:**

```
OpenAPI Document
  ↓
getZodClientTemplateContext()
  ↓
getZodSchema({ schema, ctx, meta?, options })
  ↓
Handler functions (use meta.isRequired, meta.parent, meta.referencedBy)
  ↓
Generated Zod code
```

**Target Flow:**

```
OpenAPI Document
  ↓
buildIR(doc) → IRDocument
  ↓
getZodClientTemplateContext({ ..., _ir: IRDocument })
  ↓
getZodSchema({ schema, ctx, irNode?, options })
  ↓
Adapter functions extract from IRSchemaNode
  ↓
Handler functions (use getRequiredFromIR, getParentFromIR, getCircularReferencesFromIR)
  ↓
Generated Zod code
```

---

## Migration Phases

### Phase 1: Integration (C2)

- Wire `buildIR()` into template context
- Add `_ir?: IRDocument` field to `TemplateContext`
- Populate IR without using it yet

### Phase 2: Adapter Creation (C3)

- Create `ir-metadata-adapter.ts` with helper functions
- Implement all adapter functions with tests
- No changes to existing code yet

### Phase 3: Dual Support (C4)

- Add `irNode?: IRSchemaNode` parameter alongside `meta?`
- Prefer `irNode` when present, fallback to `meta`
- Update all conversion functions
- Tests pass with existing CodeMetaData mocks

### Phase 4: Test Migration (C5)

- Update tests to use IRSchemaNode instead of CodeMetaData
- Verify all tests pass with same assertions

### Phase 5: Complete Migration (C6)

- Remove `meta?: CodeMetaData` parameters
- Remove CodeMetaData interface definition
- Remove from public API exports
- Run eradication verification

---

## Field Mapping

| CodeMetaData Field               | IRSchemaNode Field                       | Adapter Function                    |
| -------------------------------- | ---------------------------------------- | ----------------------------------- |
| `isRequired?: boolean`           | `required: boolean`                      | `getRequiredFromIR(node)`           |
| `parent?: ZodCodeResult`         | `inheritance?.parent: string`            | `getParentFromIR(node)`             |
| `referencedBy?: ZodCodeResult[]` | `dependencyGraph.referencedBy: string[]` | `getCircularReferencesFromIR(node)` |
| N/A (NEW)                        | `nullable: boolean`                      | `getNullableFromIR(node)`           |
| N/A (NEW)                        | `zodChain: IRZodChainInfo`               | `getPresenceChainFromIR(node)`      |
| N/A (NEW)                        | `circularReferences: string[]`           | Direct access                       |

---

## Risk Assessment

### Low Risk

- IR type definitions (documentation only)
- Public API export (no known external consumers)

### Medium Risk

- Test files (need careful migration of mock data)
- Property metadata building (complex logic)

### High Risk

- Circular reference detection (relies on referencedBy array)
- Composition handlers (use parent tracking)
- Presence chain generation (core functionality)

**Mitigation:**

- TDD approach (tests first)
- Dual support period (both meta and irNode work)
- Frequent test runs
- Characterization tests prove zero behavioral changes

---

## Validation Checklist

After migration:

- [ ] Zero mentions of "CodeMetaData" in lib/src/ (case-sensitive)
- [ ] Zero mentions of "codemetadata" in lib/src/ (case-insensitive)
- [ ] All 770+ tests passing
- [ ] All quality gates GREEN
- [ ] Characterization tests pass (148 tests proving identical behavior)

---

## Notes

1. **IR Builder Responsibility:** IRSchemaNode instances should be pre-computed in IR builder
   - `required` computed from schema's required array
   - `nullable` computed from type array
   - `circularReferences` computed from dependency graph
   - `inheritance.parent` computed for composition schemas

2. **Adapter Functions:** Should be thin wrappers
   - Extract pre-computed values from IRSchemaNode
   - No complex logic (moved to IR builder)
   - Easy to test and maintain

3. **Backward Compatibility:** Not required
   - CodeMetaData is internal type
   - No external consumers
   - Can make breaking changes safely
