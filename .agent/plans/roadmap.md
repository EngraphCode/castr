# Roadmap: @engraph/castr

**Date:** January 24, 2026 (Updated)  
**Status:** Active  
**Quality Gates:** All 10 passing (1,002+ tests)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```text
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

**Key Principle:** IR is the canonical model; ts-morph AST is used only for TypeScript parsing/printing. Avoid manual string concatenation in writers. Zod parser and writer must remain in lockstep (parser accepts all writer output patterns).

---

## Priority: Production-Ready Core Path

The OpenAPI ↔ Zod path has been validated for round-trip.

```text
OpenAPI → IR → OpenAPI (round-trip validation) ✅
OpenAPI → IR → Zod (proven) ✅
Zod → IR (Session 3.2) ✅ COMPLETE
Full Round-Trip Validation (Session 3.3 — next) 🔲
```

---

## Phase 2: Core Path to Production (COMPLETE)

| Session | Focus                         | Status      |
| ------- | ----------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer   | ✅ Complete |
| 2.6     | OpenAPI Compliance            | ✅ Complete |
| 2.7     | OpenAPI Round-Trip            | ✅ Complete |
| 2.8     | Zod 4 Output Compliance       | ✅ Complete |
| 2.9     | OpenAPI → Zod Pipeline Polish | ✅ Complete |

---

## Phase 3: Zod Round-Trip (Active)

| Session  | Focus                                                                              | Status      |
| -------- | ---------------------------------------------------------------------------------- | ----------- |
| 3.1a     | IR Semantic Audit                                                                  | ✅ Complete |
|          | └ Archive: [3.1a](./archive/ir-semantic-audit-plan-3.1a-complete.md)               | ✅          |
| 3.1b     | Zod 4 IR→Zod Improvements                                                          | ✅ Complete |
|          | └ Native recursion (getter syntax)                                                 | ✅ Complete |
|          | └ Codecs (deferred — not first-class APIs)                                         | ⚪ Deferred |
|          | └ .overwrite() (deferred — no real-world usage)                                    | ⚪ Deferred |
|          | └ Archive: [3.1b](./archive/zod4-ir-improvements-plan-3.1b-complete.md)            | ✅          |
| **3.2**  | **Zod → IR Parser**                                                                | ✅ Complete |
|          | └ Parse Zod 4 output, reconstruct IR                                               | ✅ Complete |
|          | └ Zod 4 only (reject Zod 3 syntax)                                                 | ✅ Complete |
|          | └ Documentation updated for bidirectional pipeline                                 | ✅ Complete |
|          | └ Archive: [zod4-parser-plan.md](./archive/zod4-parser-plan-3.2-complete.md)       |             |
| **3.3a** | **String Manipulation Remediation** (TEMPORARY FOCUS)                              | 🔲 Active   |
|          | └ ESLint rules to detect violations                                                | 🔲          |
|          | └ Evaluate ts-morph semantic capabilities                                          | 🔲          |
|          | └ Remediate existing string matching                                               | 🔲          |
|          | └ Plan: [string-manipulation-remediation.md](./string-manipulation-remediation.md) |             |
| **3.3b** | **True Round-Trip Validation** (After 3.3a)                                        | ⏸️ Paused   |
|          | └ Add Scenarios 2-4 to existing round-trip tests                                   | 🔲          |
|          | └ Zod ↔ Zod, OpenAPI → Zod → OpenAPI, Zod → OpenAPI → Zod                          | 🔲          |
|          | └ Plan: [round-trip-validation-plan.md](./active/round-trip-validation-plan.md)    |             |

---

## Phase 4-5: Future (Unchanged)

See previous roadmap sections for multi-artefact generation and format expansion plans.

---

## Architectural Note: Writer Separation (Identified Session 3.3)

> [!IMPORTANT]  
> The current Zod "writer" produces a combined output containing:
>
> - Zod schema declarations
> - TypeScript type definitions
> - `endpoints` array (runtime metadata)
> - `mcpTools` array (MCP tool definitions)
>
> The Zod **parser** only handles schema declarations. For true round-trip validation,
> consider separating into distinct writers:
>
> - **Zod Schema Writer** — Pure schema output (parseable by Zod parser)
> - **Endpoint/MCP Writer** — Runtime metadata (separate concern)
>
> This is future work, not blocking Session 3.3.

---

## Architectural Note: Two-Pass Parsing with Symbol Table (Identified Session 3.3)

> [!IMPORTANT]
> The current Zod parser uses single-pass parsing with naming convention heuristics
> (e.g., stripping `Schema` suffix) to resolve schema references. For a more robust
> and idiomatic solution, implement two-pass parsing:
>
> **Pass 1:** Collect all schema declarations into a symbol table  
> **Pass 2:** Resolve identifier references by looking up symbols
>
> This decouples naming conventions from semantics and enables:
>
> - Complex patterns like `SchemaA.and(SchemaB)`
> - Cross-file reference resolution
> - Circular reference detection
>
> This is future work on the roadmap for Phase 4+.

---

## Post‑3.3 Feature‑Parity Track (Alignment Only)

After Zod round‑trip (3.3), prioritize the parity workstream documented in
`.agent/research/feature-parity/*`. This is **alignment**, not a prescriptive API commitment:

- IR‑first metadata outputs (maps/helpers), optional path formatting, and bundle manifest
- JSON Schema outputs for response/parameter validation where needed
- Zod metadata ingestion for OpenAPI generation
- tRPC → IR parsing for OpenAPI emission (Oak integration target)

---

## Supported Formats (Current)

| Format          | Input | Output | Status / Notes                                     |
| --------------- | :---: | :----: | -------------------------------------------------- |
| **OpenAPI**     |  ✅   |   ✅   | 2.0 input-only; 3.x input → 3.1 output (proven)    |
| **Zod**         |  ✅   |   ✅   | Input: Session 3.2 complete; output is Zod 4       |
| **TypeScript**  |   —   |   ✅   | Writer available (types + helpers)                 |
| **JSON Schema** |  🔲   |   🔲   | Deferred (internal conversions exist for MCP only) |
| **tRPC**        |  🔲   |   🔲   | Planned                                            |

---

## Engineering Standards

- **Zod 4 Only:** No Zod 3 support — reject with clear errors
- **Strict-by-Default:** `.strict()`, throw on unknown
- **Fail-Fast:** Informative errors, never silent fallbacks
- **Type Discipline:** No `as`, `any`, `!`
- **TDD:** Failing tests first
- **Quality Gates:** All 10 must pass

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

---

## Key Documents

| Category    | Document                                                                | Purpose          |
| ----------- | ----------------------------------------------------------------------- | ---------------- |
| **Entry**   | [session-entry.prompt.md](../prompts/session-entry.prompt.md)           | Session start    |
| **Plan**    | [round-trip-validation-plan.md](./active/round-trip-validation-plan.md) | Session 3.3 plan |
| **Archive** | [archive/](./archive/)                                                  | Completed plans  |

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
