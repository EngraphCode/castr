# Roadmap: @engraph/castr

**Date:** January 15, 2026 (Updated)  
**Status:** Active  
**Quality Gates:** All 10 passing (1439+ tests)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

**Key Principle:** Pure AST via ts-morph — no string manipulation.

---

## Priority: Production-Ready Core Path

The OpenAPI ↔ Zod path must be fully validated before adding other formats or artefacts.

```
OpenAPI → IR → OpenAPI (round-trip proven)
OpenAPI → IR → Zod (output proven)
```

**At this point (Session 2.9), the library can be used in real projects.**

---

## Phase 2: Core Path to Production

| Session  | Focus                               | Status         |
| -------- | ----------------------------------- | -------------- |
| 2.1-2.5  | Zod parser + OpenAPI writer         | ✅ Complete    |
| **2.6**  | **OpenAPI Compliance**              | 🎯 Active      |
|          | └ Full input/output support         | Partial        |
|          | └ All OpenAPI fields in IR          | Partial        |
|          | └ Strict validation                 | ✅ Complete    |
| **2.7**  | **OpenAPI Round-Trip**              | Blocked on 2.6 |
|          | └ Normalized specs (idempotent)     | Pending        |
|          | └ Arbitrary specs (lossless)        | Pending        |
| **2.8**  | **Zod Output Compliance**           | Pending        |
|          | └ Full Zod schema coverage          | Pending        |
|          | └ All IR fields → Zod               | Pending        |
| **2.9**  | **OpenAPI → Zod Validation**        | Pending        |
|          | └ Prove OpenAPI → IR → Zod          | Pending        |
| **2.10** | **Cross-Format Round-Trip**         | Pending        |
|          | └ OpenAPI → IR → Zod → IR → OpenAPI | Pending        |
|          | └ Normalized + arbitrary input      | Pending        |

> [!IMPORTANT]
> **Session 2.9 = Production Milestone**
> After 2.9, the library can be used in real projects.

**Active Plan:** [openapi-compliance-plan.md](./openapi-compliance-plan.md)

---

## Post-Alpha: Full Round-Trip & Expansion

Requires Zod input parsing (exists from 2.1-2.5 but not production-priority).

| Focus                   | Sessions | Notes                              |
| ----------------------- | -------- | ---------------------------------- |
| Cross-format round-trip | 2.10     | OpenAPI → IR → Zod → IR → OpenAPI  |
| Multi-artefact writers  | 3.x      | types, constants, guards, metadata |
| Other format support    | 3.x      | JSONSchema, tRPC                   |

---

## Supported Formats (Target State)

| Format          | Input | Output | Status                       |
| --------------- | :---: | :----: | ---------------------------- |
| **OpenAPI**     |  ✅   |   ✅   | 🎯 Proving (2.6-2.7)         |
| **Zod**         |  🔲   |   ✅   | Output-only until post-alpha |
| **JSON Schema** |  🔲   |   🔲   | Future                       |
| **TypeScript**  |  🔲   |   ✅   | Output-only                  |
| **tRPC**        |  🔲   |   🔲   | Future                       |

> **Note:** Zod _input_ parsing (Sessions 2.1-2.5) exists but is not part of the core production path. The priority is OpenAPI → IR → Zod (output).

---

## Architecture

### The Cardinal Rule

> After parsing, input documents are conceptually discarded. **Only the Caster Model matters.**

### Data Flow

```
INPUT LAYER → IR LAYER (canonical) → OUTPUT LAYER
              No format access below
```

### Key ADRs

| ADR                                                                                      | Topic                 |
| ---------------------------------------------------------------------------------------- | --------------------- |
| [ADR-023](../docs/architectural_decision_records/ADR-023-ir-based-architecture.md)       | IR architecture       |
| [ADR-024](../docs/architectural_decision_records/ADR-024-complete-ir-alignment.md)       | IR alignment          |
| [ADR-026](../docs/architectural_decision_records/ADR-026-no-regex-for-parsing.md)        | No regex for parsing  |
| [ADR-027](../docs/architectural_decision_records/ADR-027-round-trip-validation.md)       | Round-trip validation |
| [ADR-029](../docs/architectural_decision_records/ADR-029-canonical-source-structure.md)  | Canonical structure   |
| [ADR-030](../docs/architectural_decision_records/ADR-030-full-openapi-syntax-support.md) | Full OpenAPI syntax   |

---

## Engineering Standards

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

| Category   | Document                                                      | Purpose               |
| ---------- | ------------------------------------------------------------- | --------------------- |
| **Entry**  | [session-entry.prompt.md](../prompts/session-entry.prompt.md) | Session start         |
| **Plans**  | [openapi-compliance-plan.md](./openapi-compliance-plan.md)    | Active (2.6)          |
| **Rules**  | [RULES.md](../RULES.md)                                       | Engineering standards |
| **Vision** | [VISION.md](../VISION.md)                                     | Strategic direction   |

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
