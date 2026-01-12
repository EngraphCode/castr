# Roadmap: @engraph/castr

**Date:** January 12, 2026  
**Status:** Active  
**Quality Gates:** All 10 passing (1237+ tests)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

**Key Principle:** Pure AST via ts-morph — no string manipulation.

---

## Supported Formats

> **Rule:** ALL formats MUST support both **input** (→ IR) and **output** (IR →), unless explicitly marked as an exception.

| Format          | Input | Output | Notes                                      |
| --------------- | :---: | :----: | ------------------------------------------ |
| **OpenAPI**     |  ✅   |   ✅   | 3.0 → 3.1 auto-upgrade via Scalar          |
| **Zod**         |  ✅   |   ✅   | v4 only; ts-morph for input                |
| **JSON Schema** |  ✅   |   ✅   | Draft 2020-12                              |
| **TypeScript**  |  ⚠️   |   ✅   | **Output-only** — types, constants, guards |
| **tRPC**        |  ✅   |   ✅   | Extract Zod from routers                   |

---

## Current Phase: Phase 2 (Zod → OpenAPI)

Phase 1 (OpenAPI → Zod) complete. Phase 2 implementation complete, now validating.

| Session | Focus                    | Status      |
| ------- | ------------------------ | ----------- |
| 2.1     | Zod 4 parser foundation  | ✅ Complete |
| 2.2     | Constraints & modifiers  | ✅ Complete |
| 2.3     | Composition & references | ✅ Complete |
| 2.4     | Endpoint parsing         | ✅ Complete |
| 2.5     | OpenAPI writer           | ✅ Complete |
| 2.6     | Round-trip validation    | 🎯 Active   |
| 2.7     | Adapter abstraction      | Pending     |

**Implementation:** [zod-to-openapi-plan.md](./zod-to-openapi-plan.md) (complete)  
**Validation:** [round-trip-validation-plan.md](./round-trip-validation-plan.md) (active)

---

## Format Implementation Order

| Phase | Transform             | Status      |
| ----- | --------------------- | ----------- |
| 1     | OpenAPI → Zod         | ✅ Complete |
| 2     | Zod → OpenAPI         | 🎯 Active   |
| 3     | JSONSchema ↔ OpenAPI | 🔲 Planned  |
| 4     | JSONSchema ↔ Zod     | 🔲 Planned  |
| 5     | tRPC ↔ IR            | 🔲 Planned  |

**Rationale:** Complete both directions for a format before adding new formats.

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

| ADR                                                                                | Topic                 |
| ---------------------------------------------------------------------------------- | --------------------- |
| [ADR-023](../docs/architectural_decision_records/ADR-023-ir-based-architecture.md) | IR architecture       |
| [ADR-024](../docs/architectural_decision_records/ADR-024-complete-ir-alignment.md) | IR alignment          |
| [ADR-026](../docs/architectural_decision_records/ADR-026-no-regex-for-parsing.md)  | No regex for parsing  |
| [ADR-027](../docs/architectural_decision_records/ADR-027-round-trip-validation.md) | Round-trip validation |

---

## Future Phases

### Phase 3+: Additional Formats

After Phase 2, the adapter abstraction enables plug-and-play format support.

### Artefact Expansion

Multi-artefact generation: types, constants, metadata, zod, client, mcp.

See: [future-artefact-expansion.md](./future-artefact-expansion.md)

### ESLint Plugin

Separate `@engraph/eslint-plugin-standards` package.

See: [eslint-plugin-standards-plan.md](./eslint-plugin-standards-plan.md)

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
| **Plans**  | [zod-to-openapi-plan.md](./zod-to-openapi-plan.md)            | Active phase          |
| **Rules**  | [RULES.md](../RULES.md)                                       | Engineering standards |
| **Vision** | [VISION.md](../VISION.md)                                     | Strategic direction   |

---

## Getting Started

1. Read [session-entry.prompt.md](../prompts/session-entry.prompt.md)
2. Run quality gates
3. Review this roadmap and active plan
4. Continue current session

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
