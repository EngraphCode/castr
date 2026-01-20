# Roadmap: @engraph/castr

**Date:** January 19, 2026 (Updated)
**Status:** Active
**Quality Gates:** All 10 passing (1,500+ tests)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

**Key Principle:** Pure AST via ts-morph — no string manipulation.

---

## Priority: Production-Ready Core Path

The OpenAPI ↔ Zod path must be fully validated before adding other formats.

```
OpenAPI → IR → OpenAPI (round-trip proven) ✅
OpenAPI → IR → Zod (Session 2.8)
```

**At Session 2.9, the library can be used in real projects.**

---

## Phase 2: Core Path to Production

| Session | Focus                                 | Status      |
| ------- | ------------------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer           | ✅ Complete |
| **2.6** | **OpenAPI Compliance**                | ✅ Complete |
| **2.7** | **OpenAPI Round-Trip**                | ✅ Complete |
|         | └ Idempotency proven                  | ✅          |
|         | └ Losslessness proven                 | ✅          |
|         | └ Real-world fixtures (Oak API 217KB) | ✅          |
| **2.8** | **Zod 4 Output Compliance**           | 🎯 Active   |
|         | └ All IR types → Zod                  | 🔲          |
|         | └ Metadata via .meta()                | 🔲          |
|         | └ Validation parity tests             | 🔲          |
| **2.9** | **OpenAPI → Zod Validation**          | Pending     |
|         | └ Prove OpenAPI → IR → Zod pipeline   |             |

> [!IMPORTANT]
> **Session 2.9 = Production Milestone**
> After 2.9, the library can be used in real projects.

**Active Plan:** [zod4-output-compliance-plan.md](./zod4-output-compliance-plan.md)

---

## Supported Formats

| Format          | Input | Output | Status              |
| --------------- | :---: | :----: | ------------------- |
| **OpenAPI**     |  ✅   |   ✅   | ✅ Proven (2.6-2.7) |
| **Zod**         |  🔲   |   ✅   | 🎯 Proving (2.8)    |
| **JSON Schema** |  🔲   |   🔲   | Future              |
| **TypeScript**  |  🔲   |   ✅   | Output-only         |

---

## Architecture

### The Cardinal Rule

> After parsing, input documents are conceptually discarded. **Only the Caster Model matters.**

### Data Flow

```
INPUT LAYER → IR LAYER (canonical) → OUTPUT LAYER
              No format access below
```

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

| Category    | Document                                                                          | Purpose         |
| ----------- | --------------------------------------------------------------------------------- | --------------- |
| **Entry**   | [session-entry.prompt.md](../prompts/session-entry.prompt.md)                     | Session start   |
| **Plans**   | [zod4-output-compliance-plan.md](./zod4-output-compliance-plan.md)                | Active (2.8)    |
| **Spec**    | [zod-output-acceptance-criteria.md](../../docs/zod-output-acceptance-criteria.md) | 2.8 criteria    |
| **Archive** | [archive/](./archive/)                                                            | Completed plans |

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
