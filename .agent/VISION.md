# Vision: Universal Schema Conversion

**Last Updated:** January 2026

---

## The Goal

Transform data definitions **between any supported format**, strictly and type-safely, via an internal information retrieval architecture using an AST representation of the data as the canonical source (IR).

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   OpenAPI   │────▶│              │────▶│   OpenAPI   │
│     Zod     │────▶│ Canonical    │────▶│     Zod     │
│ JSON Schema │────▶│    AST       │────▶│ JSON Schema │
│   (more)    │────▶│              │────▶│   (more)    │
└─────────────┘     └──────────────┘     └─────────────┘
     Input        Single Source of       Output (any)
                       Truth
```

**Including same-format conversions** (OpenAPI→OpenAPI, Zod→Zod) for normalization, validation, and canonicalization.

---

## The Core Principle: Canonical AST is Everything

> **The entire system architecture is built around the canonical AST.**  
> Input formats are merely ingestion pathways. Output formats are merely rendering views.

The canonical AST (the data representation at the heart of the Caster Model architecture) is:

1. **The single source of truth** - After parsing, the input document is discarded. Only the AST matters.
2. **The canonical data model** - All schema concepts (types, constraints, references, composition) are expressed in AST terms.
3. **The architectural center** - All tools, transforms, and validations operate on the AST, never on raw input formats.
4. **Format-agnostic** - The AST knows nothing about OpenAPI, Zod, or JSON Schema. It represents pure schema semantics.

### The Complexity Argument

Without this principle:

- Each format pair (OpenAPI→Zod, Zod→JSON Schema, etc.) needs separate conversion logic: **O(N²) complexity**
- Edge cases multiply across converters
- Format-specific quirks leak into the core

With this principle:

- Each format needs only two modules: parser (to AST) and transformer (from AST): **O(N) complexity**
- Edge cases are handled once, in the AST model
- The core remains clean and format-agnostic

---

## The Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           INPUT LAYER                                │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │
│  │ OpenAPI Parser│ │  Zod Parser   │ │ JSON Schema   │ ... more     │
│  │  (3.0, 3.1)   │ │    (v4)       │ │   Parser      │    parsers   │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘              │
│          │                 │                 │                       │
│          └─────────────────┼─────────────────┘                       │
│                            ▼                                         │
├────────────────────────────────────────────────────────────────────-─┤
│                    information retrieval architecture using an AST representation of the data as the canonical source (IR)                  │
│                                                                      │
│   • CastrSchema - Type definitions, constraints, metadata               │
│   • CastrSchemaNode - Individual schema nodes with context              │
│   • IROperation - API endpoints (for OpenAPI input)                  │
│   • IRDependencyGraph - Reference tracking, circular detection       │
│                                                                      │
│   *** THIS IS THE ENTIRE SYSTEM'S CENTER OF GRAVITY ***              │
│   *** All code that touches schema data works with this AST ***       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                           OUTPUT LAYER                               │
│          ┌─────────────────┼─────────────────┐                       │
│          │                 │                 │                       │
│  ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐              │
│  │ Zod Transformer│ │  TS Types    │ │  JSON Schema  │ ... more     │
│  │   (Zod 4)     │ │ Transformer   │ │  Transformer  │   outputs    │
│  └───────────────┘ └───────────────┘ └───────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

**Information Retrieval (IR) Architecture Pattern:**

1. **Parse** - Convert any input format to canonical AST (input is discarded after this)
2. **AST** - The single, canonical, type-safe representation (this IS the data now)
3. **Transform** - Generate any output format from the AST

---

## The Roadmap

### Phase 1: OpenAPI → \* (Current)

| Source        | Target              | Status      |
| ------------- | ------------------- | ----------- |
| OpenAPI 3.1.x | Zod 4               | ✅ Complete |
| OpenAPI 3.1.x | TypeScript          | ✅ Complete |
| OpenAPI 3.1.x | JSON Schema 2020-12 | 🔲 Planned  |
| OpenAPI 3.1.x | MCP Tools           | ✅ Complete |

### Phase 2: Zod → \*

| Source | Target              | Status     |
| ------ | ------------------- | ---------- |
| Zod 4  | OpenAPI 3.1.x       | 🔲 Planned |
| Zod 4  | JSON Schema 2020-12 | 🔲 Planned |
| Zod 4  | TypeScript          | 🔲 Planned |

### Phase 3: JSON Schema → \*

| Source              | Target        | Status     |
| ------------------- | ------------- | ---------- |
| JSON Schema 2020-12 | OpenAPI 3.1.x | 🔲 Planned |
| JSON Schema 2020-12 | Zod 4         | 🔲 Planned |

### Phase 4: Normalization

| Conversion                | Purpose                        | Status     |
| ------------------------- | ------------------------------ | ---------- |
| OpenAPI → OpenAPI         | Canonicalize, validate, bundle | 🔲 Planned |
| Zod → Zod                 | Optimize, deduplicate          | 🔲 Planned |
| JSON Schema → JSON Schema | Upgrade draft versions         | 🔲 Planned |

---

## Why This Matters

### For SDK Authors

Generate type-safe validation from any API specification format.

### For API Authors

Validate and normalize specifications. Convert between formats without loss.

### For AI Integration (MCP)

Bridge any schema format to MCP tool definitions.

### For Interoperability

One tool that speaks all schema languages fluently.

---

## Principles

1. **Canonical AST is Truth** - The internal AST representation is authoritative; inputs are ingestion, outputs are views
2. **Strict Conversion** - No silent coercion, no data loss without explicit handling
3. **Type Safety** - TypeScript types flow through the entire pipeline
4. **Fail Fast** - Invalid input rejected immediately with helpful errors
5. **Format Agnostic Core** - The AST doesn't know about OpenAPI, Zod, or JSON Schema

---

## Related Documents

| Document                 | Purpose                                |
| ------------------------ | -------------------------------------- |
| `requirements.md`        | Decision-making guidance for agents    |
| `RULES.md`               | Engineering standards and code quality |
| `testing-strategy.md`    | How we verify correctness              |
| `DEFINITION_OF_DONE.md`  | Quality gates and completion criteria  |
| `ADR-023` (in docs/adr/) | IR Architecture decision record        |
