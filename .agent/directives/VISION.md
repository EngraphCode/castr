# Vision: Universal Schema Conversion

**Last Updated:** 2026-04-02

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

## Workspace Model

`lib` / `@engraph/castr` is the **core compiler workspace**. Its scope is:

- parsers and document loading
- canonical IR types and runtime validation
- writers / emitters
- metadata outputs needed to consume generated schemas and documents honestly

Operational or framework-specific capabilities that consume Castr output but add transport, runtime, or authoring concerns belong in **companion workspaces**, not in core `@engraph/castr`.

Examples of companion-workspace directions:

- typed fetch harnesses and HTTP adapters
- runtime handler generation and framework bindings
- code-first / framework ingestion layers such as tRPC
- end-to-end SDK or reference-implementation workspaces

Companion workspaces may be strategically important, but they are **not** core-format promises for `lib`.

---

## The Roadmap

> **Rule:** ALL formats MUST be supported as both **input** and **output**, unless explicitly marked as an exception.

### Core Target Formats (Vision)

| #   | Format          | Input | Output | Notes                                                    |
| --- | --------------- | :---: | :----: | -------------------------------------------------------- |
| 1   | **OpenAPI**     |  ✅   |   ✅   | 2.0 input-only; 3.0 → 3.1 auto-upgrade                   |
| 2   | **Zod**         |  ✅   |   ✅   | v4 target                                                |
| 3   | **JSON Schema** |  ✅   |   ✅   | Draft 2020-12                                            |
| 4   | **TypeScript**  |   —   |   ✅   | **Exception:** output-only (too broad for input parsing) |

Companion-workspace directions such as tRPC ingestion or runtime handler generation may sit on top of these core formats, but they are not part of the core `lib` format contract.

### Current Progress

| Format      | → IR (Parser) | IR → (Writer) | Notes                                                                                                                                 |
| ----------- | :-----------: | :-----------: | ------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAPI     |      ✅       |      ✅       | Core OpenAPI -> IR -> OpenAPI proofs exist; live output still targets 3.1.x while OAS 3.2 version plumbing is the next planned slice. |
| Zod         | ✅ (v4 only)  | ✅ (v4 only)  | Parser and writer exist; strict Zod-layer transform proofs are complete.                                                              |
| JSON Schema |      ✅       |      ✅       | Full Draft 07 / 2020-12 parser and writer support now exist with explicit fail-fast boundaries.                                       |
| TypeScript  |       —       |      ✅       | Output-only (writer exists).                                                                                                          |

### Companion Workspace Roadmap

Companion workspaces are the place for higher-level integrations that should not widen core `@engraph/castr`:

- **Code-first / framework ingestion**
  - tRPC or similar authored-operation ingestion for OpenAPI generation
  - Zod metadata ingestion needed for code-first publishing flows
- **Transport / runtime helpers**
  - typed fetch harnesses
  - framework handlers and middleware adapters
  - lightweight runtime exposure packages
- **Reference implementations**
  - Oak-style replacement workspaces that prove end-to-end adoption paths

---

## Adoption Goals (Ecosystem Replacement)

To be practically useful in production pipelines, Castr targets replacement of existing schema tooling dependencies and workflows:

- Replace **openapi-zod-client-style adapters** with native Zod v4 output from core Castr.
- Replace wider **OpenAPI build boundaries** with core Castr plus companion workspaces where runtime or framework concerns arise.
- Replace **code-first OpenAPI generation stacks** through companion-workspace ingestion layers that feed the IR.
- Incorporate the **best practices of openapi-ts** (plugin surface, DX), with ethical reuse and attribution when code is reused.

### Same-Format Normalization

Once both parser and writer exist for a format, same-format conversions enable:

| Conversion                | Purpose                        |
| ------------------------- | ------------------------------ |
| OpenAPI → OpenAPI         | Canonicalize, validate, bundle |
| Zod → Zod                 | Optimize, deduplicate          |
| JSON Schema → JSON Schema | Upgrade draft versions         |

### Implementation Order

The order of **core format** support is deliberate — by implementing both input and output for each format before moving to the next, we understand what's common between input/output code for a given format:

| Order | Transform                  | Rationale                                                                        |
| ----- | -------------------------- | -------------------------------------------------------------------------------- |
| 1     | **OpenAPI → Zod**          | Established baseline (current)                                                   |
| 2     | **Zod → OpenAPI**          | Complete Zod transform validation; understand input/output commonality           |
| 3     | **JSONSchema ↔ OpenAPI**   | Cross-format bridges with well-understood formats                                |
| 4     | **JSONSchema ↔ Zod**       | Complete JSON Schema triangulation                                               |
| 5     | **Companion integrations** | Layer code-first, runtime, and framework concerns on top of settled core formats |

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
