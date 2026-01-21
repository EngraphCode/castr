# Roadmap: @engraph/castr

**Date:** January 21, 2026 (Updated)  
**Status:** Active  
**Quality Gates:** All 10 passing (1,337+ tests)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```text
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

**Key Principle:** Pure AST via ts-morph — no string manipulation.

---

## Priority: Production-Ready Core Path

The OpenAPI ↔ Zod path is being validated for true round-trip.

```text
OpenAPI → IR → OpenAPI (round-trip proven) ✅
OpenAPI → IR → Zod (proven) ✅
Zod → IR (Session 3.2 — next) 🔲
OpenAPI → Zod → OpenAPI (Session 3.3 — pending) 🔲
```

---

## Phase 2: Core Path to Production (COMPLETE)

| Session | Focus                                 | Status      |
| ------- | ------------------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer           | ✅ Complete |
| 2.6     | OpenAPI Compliance                    | ✅ Complete |
| 2.7     | OpenAPI Round-Trip                    | ✅ Complete |
| 2.8     | Zod 4 Output Compliance               | ✅ Complete |
| 2.9     | OpenAPI → Zod Pipeline Polish         | ✅ Complete |

---

## Phase 3: Zod Round-Trip (Active)

| Session | Focus                                                      | Status      |
| ------- | ---------------------------------------------------------- | ----------- |
| 3.1a    | IR Semantic Audit                                          | ✅ Complete |
|         | └ Archive: [3.1a](./archive/ir-semantic-audit-plan-3.1a-complete.md) | ✅ |
| 3.1b    | Zod 4 IR→Zod Improvements                                  | ✅ Complete |
|         | └ Native recursion (getter syntax)                         | ✅ Complete |
|         | └ Codecs (deferred — not first-class APIs)                 | ⚪ Deferred |
|         | └ .overwrite() (deferred — no real-world usage)            | ⚪ Deferred |
|         | └ Archive: [3.1b](./archive/zod4-ir-improvements-plan-3.1b-complete.md) | ✅ |
| **3.2** | **Zod → IR Parser**                                        | 🔲 **Next** |
|         | └ Parse Zod 4 output, reconstruct IR                       | 🔲          |
|         | └ Zod 4 only (reject Zod 3 syntax)                         | 🔲          |
|         | └ Plan: [zod4-parser-plan.md](./zod4-parser-plan.md)       |             |
| 3.3     | True Round-Trip Validation                                 | 🔲 Pending  |
|         | └ OpenAPI → Zod → OpenAPI byte-identical                   | 🔲          |

---

## Phase 4-5: Future (Unchanged)

See previous roadmap sections for multi-artefact generation and format expansion plans.

---

## Supported Formats (Current)

| Format      | Input | Output | Status              |
| ----------- | :---: | :----: | ------------------- |
| **OpenAPI** |  ✅   |   ✅   | ✅ Proven           |
| **Zod**     |  🔲   |   ✅   | Input: Session 3.2  |

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

| Category    | Document                                              | Purpose           |
| ----------- | ----------------------------------------------------- | ----------------- |
| **Entry**   | [session-entry.prompt.md](../prompts/session-entry.prompt.md) | Session start |
| **Plan**    | [zod4-parser-plan.md](./zod4-parser-plan.md)          | Session 3.2 plan  |
| **Archive** | [archive/](./archive/)                                | Completed plans   |

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
