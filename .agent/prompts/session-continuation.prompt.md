# Session Continuation: @engraph/castr

**Last updated:** 2026-04-05

This file is the context bridge between sessions. It answers: _where are we, and what's next?_

---

## Library Identity

Transforms data definitions between supported formats via a canonical IR:

```text
Any Input Format → Parser → IR (CastrDocument) → Writers → Any Output Format
```

Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tool definitions.

---

## Active Workstream

**Primary plan**: [oas-3.2-full-feature-support.md](../plans/active/oas-3.2-full-feature-support.md)

**Next execution step**: Phase A₂ — Type migration. Drop `openapi3-ts`, create strict re-export module from `@scalar/openapi-types`, migrate ~50 import sites. See [phase-a2-type-migration.md](../plans/active/phase-a2-type-migration.md) and ADR-044/045.

**Paused workstreams**: none.

---

## Gate Status

`pnpm check` last green: **Saturday, 5 April 2026**

Known issues: none.

---

## Critical Path

1. **Phase A₂**: Type migration (unblocks all feature phases)
2. **Phases B–E**: OAS 3.2-only feature implementation (QUERY method, additionalOperations, hierarchical tags, etc.)
3. Canonical OpenAPI output target: `3.2.0` — 3.1.x is bridge input only

---

## Essential Reading

1. [principles.md](../directives/principles.md)
2. [requirements.md](../directives/requirements.md)
3. [testing-strategy.md](../directives/testing-strategy.md)
4. [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
5. [roadmap.md](../plans/roadmap.md)
6. [IDENTITY.md](../IDENTITY.md)

---

## Update Protocol

At session close, update this file if:

- the active plan or next step changed
- gate status changed
- a workstream was paused or unpaused
- the critical path order shifted

Keep this file under 80 lines. Historical detail belongs in completed plan files, not here.
