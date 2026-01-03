# Roadmap: @engraph/castr

**Date:** January 2, 2026  
**Status:** Active  
**Quality Gates:** All 10 passing (954 tests)

---

## Executive Summary

This library generates strict Zod schemas, TypeScript types, and MCP tool definitions from OpenAPI 3.x specifications using a pure **Information Retrieval (IR) architecture** with a **canonical AST representation**.

```text
OpenAPI → Scalar Pipeline → IR (canonical AST) → ts-morph Writers → Artefacts
```

**Key Principle:** All code generation uses **pure AST via ts-morph**—no string manipulation.

---

## Current State (January 2026)

### What's Working ✅

| Component           | Status        | Notes                          |
| ------------------- | ------------- | ------------------------------ |
| Quality Gates       | 10/10 passing | 954 tests total                |
| IR Builder          | Complete      | Parses OpenAPI → CastrDocument |
| Zod Writer          | Complete      | Operates on IR via ts-morph    |
| Type Writer         | Complete      | Operates on IR via ts-morph    |
| Scalar Pipeline     | Complete      | Bundles, upgrades to 3.1       |
| OpenAPI 3.1 Support | Complete      | First-class support            |

### What Needs Work ⚠️

| Component     | Issue                                | Reference |
| ------------- | ------------------------------------ | --------- |
| MCP Subsystem | Uses raw OpenAPI instead of IR       | [ADR-024] |
| Context Layer | Passes `doc` after IR construction   | [ADR-024] |
| CastrDocument | Missing schemaNames, dependencyGraph | IR-1      |
| Documentation | Strategic overview outdated          | This file |

---

## Architecture

### The Cardinal Rule

> After parsing, input documents are conceptually discarded. **Only the Caster Model matters.**

### Pure AST Requirement

All code generation must use **ts-morph AST manipulation exclusively**:

| ✅ Allowed                          | ❌ Forbidden                |
| ----------------------------------- | --------------------------- |
| `writer.write('z.object(')`         | `` `const ${name} = ...` `` |
| `sourceFile.addVariableStatement()` | `code += "z.string()"`      |
| `writer.block(() => { ... })`       | String template literals    |

### Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                     INPUT LAYER                             │
│  OpenAPI 3.x → Scalar Pipeline → prepareOpenApiDocument()  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     IR LAYER (canonical)                    │
│  buildIR() → CastrDocument { components, operations, ... }    │
└─────────────────────────────────────────────────────────────┘
                              ↓
              ────── No OpenAPI access below ──────
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     OUTPUT LAYER                            │
│  zod-writer, type-writer, mcp-writer → Generated Code      │
└─────────────────────────────────────────────────────────────┘
```

---

## Immediate Next Steps: IR Alignment

Per [ADR-024](../docs/architectural_decision_records/ADR-024-complete-ir-alignment.md), complete the Caster Model architecture alignment:

| Phase | Description                                          | Effort |
| ----- | ---------------------------------------------------- | ------ |
| IR-1  | Enhance CastrDocument (schemaNames, dependencyGraph) | 4-6h   |
| IR-2  | Refactor context layer to use IR exclusively         | 6-8h   |
| IR-3  | Refactor MCP subsystem to use IR                     | 10-12h |
| IR-4  | Documentation and cleanup                            | 4-6h   |
| IR-5  | Verification and hardening                           | 2-3h   |

**Total:** ~26-35 hours (3-4 focused sessions)

---

## Future Phases

### Phase 4: Artefact Expansion

After IR alignment, implement multi-artefact generation per the modular writer architecture:

**Writers:**

- **types** — OpenAPI Fetch compatible interfaces (`paths`, `operations`, `components`, `webhooks`)
- **constants** — Path catalogues, guards, enums (`PATHS`, `ValidPath`, `isAllowedMethod`)
- **metadata** — Operation summaries, request/response maps, parameter schemas
- **zod** — Validators with JSON Schema siblings for request/response channels
- **client** — OpenAPI Fetch wrappers (`createApiClient`, `createPathClient`)
- **mcp** — Tool descriptors, sample utilities, naming helpers

**Key Requirements (from consolidated feature requests):**

- Single-pass generation from shared IR
- Deterministic byte-for-byte output
- Modular writer selection (`writers: ['types', 'zod', 'mcp']`)
- Schema transforms via hooks (vendor-agnostic core)
- Manifest-based output (`GeneratedFile[]` with paths, contents, kind)
- TSDoc derived from OpenAPI descriptions

See: [future-artefact-expansion.md](./future-artefact-expansion.md)

### Phase 5: SDK Integration

- Full SDK workspace consuming this library
- MCP server implementation
- HTTP client integration
- Hook system for vendor customisation

### Separate Initiative: ESLint Plugin

A separate `@engraph/eslint-plugin-standards` package is planned to centralise linting standards. This is independent of the Caster Model work.

See: [eslint-plugin-standards-plan.md](./eslint-plugin-standards-plan.md)

---

## Engineering Standards

### Type Discipline (Zero Tolerance)

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`
- **REQUIRED:** Library types first, proper type guards
- **MANDATE:** Fix architecture, not types

### TDD (Mandatory)

1. Write failing tests FIRST
2. Minimal implementation to pass
3. Refactor with test protection

### Quality Gates

All 10 gates must pass before any work is complete:

```bash
pnpm clean && pnpm install
pnpm build
pnpm type-check
pnpm lint
pnpm format:check
pnpm test          # 598 unit tests
pnpm test:snapshot # 173 snapshot tests
pnpm test:gen      # 20 generated code tests
pnpm character     # 163 characterisation tests
```

---

## Key Documents

| Category         | Document                                                                           | Purpose                |
| ---------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| **Foundation**   | [RULES.md](../RULES.md)                                                            | Engineering standards  |
|                  | [VISION.md](../VISION.md)                                                          | Strategic direction    |
|                  | [requirements.md](../requirements.md)                                              | Project requirements   |
|                  | [testing-strategy.md](../testing-strategy.md)                                      | Testing philosophy     |
|                  | [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md)                                  | Quality criteria       |
| **Prompts**      | [start-right.prompt.md](../prompts/start-right.prompt.md)                          | Session initialisation |
| **Architecture** | [ADR-023](../docs/architectural_decision_records/ADR-023-ir-based-architecture.md) | IR architecture        |
|                  | [ADR-024](../docs/architectural_decision_records/ADR-024-complete-ir-alignment.md) | IR alignment           |
|                  | [SCALAR-PIPELINE.md](../architecture/SCALAR-PIPELINE.md)                           | Input processing       |
|                  | [OPENAPI-3.1-MIGRATION.md](../architecture/OPENAPI-3.1-MIGRATION.md)               | Type system guide      |

---

## Dependencies

### Core (Active)

| Package                | Version | Purpose                  |
| ---------------------- | ------- | ------------------------ |
| openapi3-ts            | ^4.5.0  | OpenAPI type definitions |
| zod                    | ^4.x    | Runtime validation       |
| ts-morph               | ^23.x   | AST code generation      |
| @scalar/openapi-parser | latest  | Bundling and validation  |
| commander              | ^14.x   | CLI framework            |

### Removed (Historical)

- `@apidevtools/swagger-parser` → Replaced by Scalar
- `handlebars` → Replaced by ts-morph
- `tanu` → Replaced by ts-morph
- `pastable` → Replaced by lodash-es + native

---

## Getting Started

1. Read [start-right.prompt.md](../prompts/start-right.prompt.md)
2. Run quality gates: `pnpm clean && pnpm install && pnpm build && pnpm type-check && pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && pnpm test:gen && pnpm character`
3. Review this roadmap and [ADR-024](../docs/architectural_decision_records/ADR-024-complete-ir-alignment.md)
4. Begin Phase IR-1

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
