# ADR-024: Complete IR Architecture Alignment

**Status:** Proposed  
**Date:** 2026-01-02  
**Authors:** Antigravity (AI Assistant)  
**Relates to:** ADR-023 (IR-Based Architecture)

---

## Context

### What "Pure AST" Means

> **Critical Clarification:** When this document and related plans refer to "AST operations" or "pure AST," we mean **ts-morph AST manipulation exclusively**.
>
> - ✅ `writer.write('z.object(')` — ts-morph CodeBlockWriter
> - ✅ `sourceFile.addVariableStatement()` — ts-morph AST
> - ❌ `\`const ${name} = ${value};\`` — String template literals
> - ❌ `code += "z.string()"` — String concatenation
>
> **No string manipulation for code generation.** All code output flows through ts-morph's typed AST API.

ADR-023 established the Intermediate Representation (IR) architecture as the canonical approach:

```
Input Document → IR (AST) → Output Artefacts
```

The **Cardinal Rule**: After parsing, input documents are conceptually discarded. Only the Caster Model matters.

### Current State (Audit Results)

A code-vision alignment audit on 2026-01-02 revealed:

| Component                     | IR Alignment  | Issue                                      |
| ----------------------------- | ------------- | ------------------------------------------ |
| `ir-builder*.ts`              | ✅ Aligned    | Correctly parses OpenAPI → CastrDocument   |
| `zod-writer.ts`               | ✅ Aligned    | Operates exclusively on CastrSchemaContext |
| `type-writer.ts`              | ✅ Aligned    | Operates exclusively on CastrSchema        |
| `template-context.ts`         | ⚠️ Partial    | Builds IR, then passes `doc` downstream    |
| `template-context.mcp*.ts`    | ❌ Misaligned | Operates entirely on OpenAPIObject         |
| `template-context.schemas.ts` | ⚠️ Partial    | Uses `doc` for dependency graph            |

### The Problem

**Input Document Leakage**: `getTemplateContext()` builds the Caster Model correctly (line 151), but then passes the original `doc` to downstream functions:

```typescript
// Current (WRONG)
const irDocument = buildIR(doc); // ✅ IR built
const schemaNames = extractSchemaNamesFromDoc(doc); // ❌ Uses doc
const { deepDependencyGraph } = buildDependencyGraphForSchemas(schemaNames, doc); // ❌
const mcpTools = buildMcpTools({ document: doc, endpoints }); // ❌
```

This violates:

1. The Cardinal Rule (IR as single source of truth)
2. ADR-023's explicit invariant that transformers only access IR

---

## Decision

**Complete the Caster Model architecture alignment** by eliminating all input document access after IR construction.

### Phase 1: Enhance CastrDocument

Add missing data to CastrDocument so downstream consumers don't need `doc`:

```typescript
interface CastrDocument {
  // Existing
  info: IRInfo;
  components: IRComponent[];
  operations: IROperation[];

  // NEW - Move from doc-based extraction
  schemaNames: string[]; // All component schema names
  dependencyGraph: IRDependencyGraph; // Already stubbed, complete it
  xExtSchemas: IRComponent[]; // Already extracted, formalize
}
```

### Phase 2: Refactor Context Layer

Update `getTemplateContext()` to use IR exclusively:

```typescript
// AFTER (CORRECT)
const irDocument = buildIR(doc); // ✅ IR built
const schemaNames = irDocument.schemaNames; // ✅ From IR
const { deepDependencyGraph } = irDocument.dependencyGraph; // ✅ From IR
const mcpTools = buildMcpToolsFromIR(irDocument); // ✅ From IR
```

### Phase 3: Refactor MCP Subsystem

Replace `OpenAPIObject` dependencies with IR types:

| Current                                           | Target                                              |
| ------------------------------------------------- | --------------------------------------------------- |
| `buildMcpTools({ document: OpenAPIObject })`      | `buildMcpToolsFromIR(ir: CastrDocument)`            |
| `resolveOperationForEndpoint(document, endpoint)` | Use `ir.operations` directly                        |
| `buildMcpToolSchemas({ document })`               | `buildMcpToolSchemasFromIR(operation: IROperation)` |
| `collectParameterGroups(document, ...)`           | Use `IRParameter[]` directly                        |

---

## Consequences

### Positive

1. **Single Source of Truth**: All transformers derive data from IR, not input
2. **Future-Proof**: Adding new input formats (JSON Schema, Zod schemas) only requires new parsers
3. **Testability**: IR can be constructed in tests without valid OpenAPI documents
4. **Correctness**: Eliminates class of bugs where doc and IR diverge

### Negative

1. **CastrDocument Size**: More data in IR increases memory footprint
2. **Migration Effort**: ~3 focused sessions to complete
3. **MCP Rewrite**: The MCP subsystem requires significant refactoring

### Neutral

1. **No Behavioral Change**: External API surface unchanged
2. **No Performance Impact**: Data already computed, just moved earlier

---

## Implementation Priority

| Priority | Task                                      | Effort |
| -------- | ----------------------------------------- | ------ |
| 1        | Add `schemaNames` to CastrDocument        | Low    |
| 2        | Complete `dependencyGraph` in IR builder  | Medium |
| 3        | Refactor `getTemplateContext()` to use IR | Medium |
| 4        | Refactor MCP subsystem to use IR          | High   |
| 5        | Remove `doc` parameter leakage            | Low    |

---

## Verification

1. All 10 quality gates pass
2. No `OpenAPIObject` imports in `template-context.mcp*.ts` (except type guards)
3. No `doc` parameter passed to any function after IR construction
4. `grep -r "OpenAPIObject" lib/src/writers/` returns no results
5. Characterisation tests prove behavioral parity

---

## Related Documents

- [ADR-023: IR-Based Architecture](./ADR-023-ir-based-architecture.md)
- [VISION.md](/.agent/VISION.md)
- [Audit Report](walkthrough.md - 2026-01-02)
