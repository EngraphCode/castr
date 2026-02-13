# Code-Vision Alignment Audit

**Purpose:** Deep, detailed audit of the codebase to verify alignment with the architectural vision.

---

## The Vision (Summary)

The repository implements an **Information Retrieval (IR) architecture** where:

```text
Any Supported Format IN → Canonical AST Representation → Any Supported Format OUT
```

**The canonical AST is the central organizing principle of the entire repository.**

### Key Characteristics

1. **Single Source of Truth** - After parsing, input documents are discarded. Only the AST matters.
2. **Format Agnostic** - The AST knows nothing about OpenAPI, Zod, or JSON Schema.
3. **O(N) Complexity** - Each format needs only: Parser (to AST) + Transformer (from AST).
4. **All Operations on AST** - Validation, transformation, dependency analysis work on the AST.

---

## The Canonical AST Types

The AST is defined in `lib/src/context/ir-schema.ts`. Key types:

| Type                 | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `CastrDocument`      | Complete document representation             |
| `CastrSchema`        | Type definition with constraints & metadata  |
| `CastrSchemaNode`    | Individual schema node with context          |
| `IROperation`        | API endpoint definition (from OpenAPI)       |
| `IRParameter`        | Parameter with schema and location           |
| `IRResponse`         | Response with status code and schema         |
| `IRDependencyGraph`  | Reference tracking, circular detection       |
| `CastrSchemaContext` | Discriminated union for schema usage context |

---

## Audit Checklist

### 1. Parsers (Input → AST)

**Location:** `lib/src/context/` (especially `ir-builder*.ts`)

**Verify:**

- [ ] Each input format has a dedicated parser
- [ ] Parsers produce `CastrDocument` or `CastrSchema` types
- [ ] Input documents are NOT passed through to transformers
- [ ] All `$ref` resolution happens during parsing
- [ ] Circular references are detected and tracked in AST
- [ ] No format-specific logic leaks into the AST types

**Current Parsers:**

- OpenAPI 3.1.x → AST (via Scalar pipeline + IR builder)

### 2. Transformers (AST → Output)

**Location:** `lib/src/writers/`, `lib/src/generators/`, `lib/src/conversion/`

**Verify:**

- [ ] Each output format has a dedicated transformer
- [ ] Transformers accept ONLY AST types (CastrSchema, CastrDocument, etc.)
- [ ] Transformers do NOT access original input documents
- [ ] Output code generation uses ts-morph, not string concatenation
- [ ] Format-specific knowledge is contained within the transformer

**Current Transformers:**

- AST → Zod 4 (`lib/src/writers/zod-writer.ts`)
- AST → TypeScript types (`lib/src/writers/type-writer.ts`)
- AST → JSON Schema (`lib/src/conversion/json-schema/`)
- AST → OpenAPI (`lib/src/generators/openapi/`)
- AST → MCP Tools (via endpoint metadata)

### 3. Context Layer

**Location:** `lib/src/context/template-context*.ts`

**Verify:**

- [ ] `TemplateContext` is built FROM AST, not from input documents
- [ ] Context contains `_ir` field with the canonical AST
- [ ] Schema ordering uses AST's dependency graph
- [ ] No direct access to original OpenAPI document after context creation

### 4. Core Pipeline

**Location:** `lib/src/rendering/generate-from-context.ts`

**Verify:**

- [ ] `prepareOpenApiDocument()` → bundling/upgrade happens BEFORE AST construction
- [ ] `getZodClientTemplateContext()` → produces TemplateContext WITH embedded AST
- [ ] Writers receive TemplateContext, not raw OpenAPI
- [ ] `debugIR` option correctly serializes the canonical AST

### 5. Type Safety

**Verify across codebase:**

- [ ] No `any` types in AST-related code
- [ ] No unchecked type assertions (`as` without guards)
- [ ] Type predicates (`is` functions) used for narrowing
- [ ] CastrSchema properties accessed via `CastrSchemaProperties` wrapper (not raw string indexing)

---

## Key Files to Examine

### AST Definition

- `lib/src/context/ir-schema.ts` - Core AST types
- `lib/src/context/ir-schema-properties.ts` - Type-safe property access
- `lib/src/context/ir-context.ts` - Schema context discriminated union

### AST Construction

- `lib/src/context/ir-builder.core.ts` - Schema → CastrSchema builder
- `lib/src/context/ir-builder.types.ts` - Builder context types
- `lib/src/context/converter/*.ts` - OpenAPI → IR converters

### AST Usage

- `lib/src/writers/zod-writer.ts` - CastrSchema → Zod code
- `lib/src/writers/type-writer.ts` - CastrSchema → TypeScript types
- `lib/src/generators/openapi/index.ts` - CastrDocument → OpenAPI (round-trip)

### Pipeline

- `lib/src/rendering/generate-from-context.ts` - Main entry point
- `lib/src/context/template-context.ts` - Context with embedded AST
- `lib/src/shared/prepare-openapi-document.ts` - Input preparation

---

## Anti-Patterns to Flag

1. **Input Document Leakage** - Code that accesses original OpenAPI after parsing
2. **Format-Specific AST Types** - AST types that mention OpenAPI, Zod, or JSON Schema
3. **Bypassing AST** - Direct conversion from input to output without AST
4. **String Indexing** - Accessing CastrSchema properties via `schema.properties[key]` instead of using `CastrSchemaProperties`
5. **Unchecked Assertions** - `as CastrSchema` without type guards
6. **Circular Imports** - Between AST types and format-specific code

---

## Expected Findings Format

For each issue found, document:

```markdown
### [FILE_PATH]

**Issue:** Brief description
**Line(s):** X-Y
**Severity:** Critical | Major | Minor
**Recommendation:** How to fix
```

---

## Reference Documents

| Document            | Location                                           |
| ------------------- | -------------------------------------------------- |
| Vision              | `.agent/directives/VISION.md`                      |
| Rules               | `.agent/directives/RULES.md`                       |
| IR Architecture ADR | `docs/architectural_decision_records/ADR-023-*.md` |
| Testing Strategy    | `.agent/directives/testing-strategy.md`            |
| Requirements        | `.agent/directives/requirements.md`                |
| ADR Summary         | `docs/architectural_decision_records/SUMMARY.md`   |

---

## Verification Commands

```bash
# Build check
pnpm build

# Type check
pnpm type-check

# Run all tests
pnpm test

# Check for 'any' types in AST code
grep -r "any" lib/src/context/ir-*.ts

# Check for type assertions in writers
grep -r " as IR" lib/src/writers/
```
