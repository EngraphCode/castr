# Vision: Universal Schema Conversion

**Last Updated:** 2026-03-22

Castr is **strict and complete everywhere, all the time**. It **fails fast and hard**.

- No silent information loss, no partial success, no swallowed errors, no permissive fallback output.
- No partial support claims: a feature is only honestly supported when parser, IR, runtime validation, writers, proofs, and docs agree.
- No type-system escape hatches in product code (non-const type assertions, `any`, `!`, `eslint-disable`); fix architecture or fix the rule.
- Normalization/canonicalization is allowed only when it is **lossless** and **deterministic**, and the rule is explicit (example: documented OpenAPI 3.0 → 3.1 upgrade semantics in requirements).

If something is wrong, the pipeline stops and reports exactly what happened and where.

---

## The Goal

Transform data definitions **between any supported format**, losslessly, deterministically, **strictly**, and **completely**, via an internal **Intermediate Representation (IR)** as the canonical source.

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   OpenAPI   │────▶│              │────▶│   OpenAPI   │
│     Zod     │────▶│     IR       │────▶│     Zod     │
│ JSON Schema │────▶│ (CastrDoc)   │────▶│ JSON Schema │
│   (more)    │────▶│              │────▶│   (more)    │
└─────────────┘     └──────────────┘     └─────────────┘
     Input        Single Source of       Output (any)
                       Truth
```

**Including same-format conversions** (OpenAPI→OpenAPI, Zod→Zod) for normalization, validation, and canonicalization.

---

## The Core Principle: The IR is the Single Source of Truth

> **The entire system architecture is built around the canonical IR.**  
> Input formats are merely ingestion pathways. Output formats are merely rendering views.

The IR (the data representation at the heart of the Caster Model architecture) is:

1. **The single source of truth** - After parsing, the input document is discarded. Only the IR matters.
2. **The canonical data model** - All schema concepts (types, constraints, references, composition) are expressed in IR types (`CastrSchema`, `CastrDocument`, etc.).
3. **The architectural center** - All tools, transforms, and validations operate on the IR, never on raw input formats.
4. **Format-agnostic** - The IR knows nothing about OpenAPI, Zod, or JSON Schema. It represents pure schema semantics.

> **Note:** The IR is plain TypeScript interfaces. Writers use ts-morph for **code generation** only — the IR itself is not a ts-morph AST.

### The Complexity Argument

Without this principle:

- Each format pair (OpenAPI→Zod, Zod→JSON Schema, etc.) needs separate conversion logic: **O(N²) complexity**
- Edge cases multiply across converters
- Format-specific quirks leak into the core

With this principle:

- Each format needs only two modules: parser (to IR) and writer (from IR): **O(N) complexity**
- Edge cases are handled once, in the IR model
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
├──────────────────────────────────────────────────────────────────────┤
│                    Intermediate Representation (IR)                  │
│                                                                      │
│   • CastrDocument - Complete document with schemas, operations       │
│   • CastrSchema - Type definitions, constraints, metadata            │
│   • IROperation - API endpoints (for OpenAPI input)                  │
│   • IRDependencyGraph - Reference tracking, circular detection       │
│                                                                      │
│   *** THIS IS THE ENTIRE SYSTEM'S CENTER OF GRAVITY ***              │
│   *** All code that touches schema data works with this IR ***       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                           OUTPUT LAYER                               │
│          ┌─────────────────┼─────────────────┐                       │
│          │                 │                 │                       │
│  ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐              │
│  │  Zod Writer   │ │   TS Types    │ │  JSON Schema  │ ... more     │
│  │   (Zod 4)     │ │    Writer     │ │    Writer     │   writers    │
│  └───────────────┘ └───────────────┘ └───────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

**Canonical Structure (see ADR-029):**

1. **Parse** (`parsers/`) - Convert any input format to IR
2. **IR** (`ir/`) - The single, canonical, type-safe representation
3. **Write** (`writers/`) - Generate any output format from the IR

---

## The Roadmap

> **Rule:** ALL formats MUST be supported as both **input** and **output**, unless explicitly marked as an exception.

### Target Formats (Vision)

| #   | Format          | Input | Output | Notes                                                    |
| --- | --------------- | :---: | :----: | -------------------------------------------------------- |
| 1   | **OpenAPI**     |  ✅   |   ✅   | 2.0 input-only; 3.0 → 3.1 auto-upgrade                   |
| 2   | **Zod**         |  ✅   |   ✅   | v4 target                                                |
| 3   | **JSON Schema** |  ✅   |   ✅   | Draft 2020-12                                            |
| 4   | **TypeScript**  |   —   |   ✅   | **Exception:** output-only (too broad for input parsing) |
| 5   | **tRPC**        |  ✅   |   ✅   | Extract Zod from routers; generate routers               |

### Current Progress

| Format      | → IR (Parser) | IR → (Writer) | Notes                                                                                                                                                                     |
| ----------- | :-----------: | :-----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAPI     |      ✅       |      ✅       | Core OpenAPI -> IR -> OpenAPI proofs exist, but Pack 3 found reusable `components.requestBodies` output incompleteness; full support remains blocked pending remediation. |
| Zod         | ✅ (v4 only)  | ✅ (v4 only)  | Parser and writer exist; strict Zod-layer transform proofs are complete.                                                                                                  |
| JSON Schema |      🔲       |      ✅       | Writer exists; parser code is on disk, but honest JSON Schema input support remains under Pack 4 review.                                                                  |
| TypeScript  |       —       |      ✅       | Output-only (writer exists).                                                                                                                                              |
| tRPC        |      🔲       |      🔲       | Planned.                                                                                                                                                                  |

---

## Adoption Goals (Ecosystem Replacement)

To be practically useful in production pipelines, Castr targets replacement of existing schema tooling dependencies and workflows:

- Replace **openapi-zod-client-style adapters** with native Zod v4 output.
- Replace **trpc-to-openapi** and **zod-openapi** in `tmp/oak-openapi` with IR-driven generation.
- Incorporate the **best practices of openapi-ts** (plugin surface, DX), with ethical reuse and attribution when code is reused.

### Same-Format Normalization

Once both parser and writer exist for a format, same-format conversions enable:

| Conversion                | Purpose                        |
| ------------------------- | ------------------------------ |
| OpenAPI → OpenAPI         | Canonicalize, validate, bundle |
| Zod → Zod                 | Optimize, deduplicate          |
| JSON Schema → JSON Schema | Upgrade draft versions         |
| tRPC → tRPC               | Normalize router structure     |

### Implementation Order

The order of format support is **deliberate** — by implementing both input and output for each format before moving to the next, we understand what's common between input/output code for a given format:

| Order | Transform                | Rationale                                                              |
| ----- | ------------------------ | ---------------------------------------------------------------------- |
| 1     | **OpenAPI → Zod**        | Established baseline (current)                                         |
| 2     | **Zod → OpenAPI**        | Complete Zod transform validation; understand input/output commonality |
| 3     | **JSONSchema ↔ OpenAPI** | Cross-format bridges with well-understood formats                      |
| 4     | **JSONSchema ↔ Zod**     | Complete JSON Schema triangulation                                     |
| 5     | **tRPC ↔ IR**            | Additional formats as needed                                           |

> **Note:** Roadmap _phases_ (delivery milestones) are tracked in `.agent/plans/roadmap.md`. The ordering above is a conceptual sequencing for format support, not a roadmap phase number.

> **Pattern:** For each format, implement both directions before adding new formats. This reveals shared abstractions and prevents premature generalisation.

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

1. **IR is Truth** - The internal IR is authoritative; inputs are ingestion, outputs are views
2. **Strict And Complete Conversion** - No silent coercion, no partial support claims, and no data loss without explicit handling
3. **Type Safety** - TypeScript types flow through the entire pipeline
4. **Fail Fast** - Invalid input rejected immediately with helpful errors
5. **Format Agnostic Core** - The IR knows nothing about OpenAPI, Zod, or JSON Schema

---

## Related Documents

| Document                                                               | Purpose                                |
| ---------------------------------------------------------------------- | -------------------------------------- |
| `requirements.md`                                                      | Decision-making guidance for agents    |
| `principles.md`                                                        | Engineering standards and code quality |
| `testing-strategy.md`                                                  | How we verify correctness              |
| `DEFINITION_OF_DONE.md`                                                | Quality gates and completion criteria  |
| `docs/architectural_decision_records/ADR-023-ir-based-architecture.md` | IR architecture decision record        |
