# Roadmap: @engraph/castr

**Date:** January 21, 2026 (Updated)  
**Status:** Active  
**Quality Gates:** All 11 passing (1,715+ tests)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```text
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

**Key Principle:** Pure AST via ts-morph — no string manipulation.

---

## Priority: Production-Ready Core Path

The OpenAPI ↔ Zod path is now fully validated.

```text
OpenAPI → IR → OpenAPI (round-trip proven) ✅
OpenAPI → IR → Zod (proven) ✅
```

**The library can now be used in real projects.**

---

## Phase 2: Core Path to Production (COMPLETE)

| Session | Focus                                 | Status      |
| ------- | ------------------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer           | ✅ Complete |
| 2.6     | OpenAPI Compliance                    | ✅ Complete |
| 2.7     | OpenAPI Round-Trip                    | ✅ Complete |
|         | └ Idempotency proven                  | ✅          |
|         | └ Losslessness proven                 | ✅          |
|         | └ Real-world fixtures (Oak API 217KB) | ✅          |
| 2.8     | Zod 4 Output Compliance               | ✅ Complete |
|         | └ All IR types → Zod                  | ✅          |
|         | └ Metadata via .meta()                | ✅          |
|         | └ Validation parity tests             | ✅          |
|         | └ ADR-031 (Zod Output Strategy)       | ✅          |
| 2.9     | OpenAPI → Zod Pipeline Polish         | ✅ Complete |
|         | └ Pipeline proven                     | ✅          |
|         | └ Format function tests               | ✅          |
|         | └ Fail-fast coverage tests            | ✅          |
|         | └ Expand parity fixtures              | ✅          |

> [!NOTE]
> **Session 2.9 Complete = Production Milestone**  
> The OpenAPI → Zod pipeline is production-ready.

---

## Phase 3: Immediate Priorities (Active)

> [!IMPORTANT]
> **Research complete.** Now implementing Zod 4 IR→Zod improvements.

| Session | Focus                                                                                  | Status          |
| ------- | -------------------------------------------------------------------------------------- | --------------- |
| 3.1a    | **IR Semantic Audit**                                                                  | ✅ Complete     |
|         | └ IR is now format-agnostic                                                            | ✅              |
|         | └ Archive: [ir-semantic-audit-plan](./archive/ir-semantic-audit-plan-3.1a-complete.md) | ✅              |
| 3.1b    | **Zod 4 IR→Zod Improvements**                                                          | 🟡 In Progress  |
|         | └ Native recursion (getter syntax)                                                     | ✅ Complete     |
|         | └ Codecs (bidirectional transforms)                                                    | 🟡 Implementing |
|         | └ Plan: [zod4-ir-improvements-plan.md](./zod4-ir-improvements-plan.md)                 |                 |
| 3.2     | **Zod → IR Parser**                                                                    | 🔲 Not Started  |
|         | └ Parse finalized Zod output shape                                                     | 🔲              |
| 3.3     | **True Round-Trip Validation**                                                         | 🔲 Not Started  |
|         | └ OpenAPI → Zod → OpenAPI byte-identical                                               | 🔲              |

---

## Phase 4: Multi-Artefact Generation (Future)

> **Prerequisites:** Phase 3 complete, writer framework abstraction

### 4.1 Adapter Abstraction

- `Writer` interface — Standard contract for all output generators
- `GenerationResult` manifest — File metadata, warnings, hashes
- Writer registry — Discover/enable writers by name

### 4.2 Artefact Types

| Session | Artefact           | Purpose                                               |
| ------- | ------------------ | ----------------------------------------------------- |
| 4.3     | TypeScript Types   | `paths`, `operations`, `components` for openapi-fetch |
| 4.4     | Constants & Guards | `PATHS`, `ValidPath`, enums, type guards              |
| 4.5     | Metadata Maps      | Operation metadata, parameter schema maps             |
| 4.6     | JSON Schema Output | Request/response schemas for downstream tooling       |
| 4.7     | Client Wrappers    | `createApiClient` with typed helpers                  |
| 4.8     | MCP Tooling        | Tool summaries, sample generators, naming utilities   |

---

## Phase 5: Format Expansion (Future)

| Format      | Parser | Writer | Status |
| ----------- | :----: | :----: | ------ |
| JSON Schema |   🔲   |   🔲   | Future |
| tRPC        |   🔲   |   🔲   | Future |

---

## Supported Formats (Current)

| Format          | Input | Output | Status                |
| --------------- | :---: | :----: | --------------------- |
| **OpenAPI**     |  ✅   |   ✅   | ✅ Proven (2.6-2.7)   |
| **Zod**         |  🔲   |   ✅   | ✅ Proven (2.8-2.9)   |
| **JSON Schema** |  🔲   |   🔲   | Future (Phase 5)      |
| **TypeScript**  |  🔲   |   ✅   | Output-only (bundled) |

---

## Architecture

### The Cardinal Rule

> After parsing, input documents are conceptually discarded. **Only the IR matters.**

### Data Flow

```text
INPUT LAYER → IR LAYER (canonical) → OUTPUT LAYER
              No format access below
```

---

## Engineering Standards

- **Type Discipline:** No `as`, `any`, `!`
- **TDD:** Failing tests first
- **Quality Gates:** All 11 must pass

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character && pnpm test:transforms
```

---

## Key Documents

| Category    | Document                                                                          | Purpose             |
| ----------- | --------------------------------------------------------------------------------- | ------------------- |
| **Entry**   | [session-entry.prompt.md](../prompts/session-entry.prompt.md)                     | Session start       |
| **Spec**    | [zod-output-acceptance-criteria.md](../../docs/zod-output-acceptance-criteria.md) | Zod output criteria |
| **Archive** | [archive/](./archive/)                                                            | Completed plans     |

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
