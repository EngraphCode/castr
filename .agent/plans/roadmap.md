# Roadmap: @engraph/castr

**Date:** January 10, 2026
**Status:** Active
**Quality Gates:** All 10 passing (1080+ tests)

---

## Executive Summary

This library transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)** architecture.

```text
Any Input Format → Scalar Pipeline → IR (canonical AST) → ts-morph Writers → Any Output Format
```

**Key Principle:** All code generation uses **pure AST via ts-morph**—no string manipulation.

---

## Supported Formats

> **Rule:** ALL formats MUST be supported as both **input** (→ IR) and **output** (IR →), unless explicitly marked as an exception below.

| Format          | Input | Output | Notes                                                       |
| --------------- | :---: | :----: | ----------------------------------------------------------- |
| **OpenAPI**     |  ✅   |   ✅   | 3.0 → 3.1 auto-upgrade via Scalar                           |
| **Zod**         |  ✅   |   ✅   | v4 target; extract via ts-morph for input                   |
| **JSON Schema** |  ✅   |   ✅   | Draft 2020-12                                               |
| **TypeScript**  |  ⚠️   |   ✅   | **Output-only exception** — constants, types, type-guards   |
| **tRPC**        |  ✅   |   ✅   | Extract Zod from routers (input); generate routers (output) |

### Format Details

1. **OpenAPI** — The primary use case. Parse → IR, generate → OpenAPI for normalization/canonicalization.

2. **Zod** — Runtime validators. Use ts-morph to parse Zod source → IR. Generate Zod from IR (existing).

3. **JSON Schema** — Standard schema format. Parse → IR. Generate → JSON Schema (draft 2020-12).

4. **TypeScript** (output-only) — Constants, types, and type-guards for SDK integration:
   - Type interfaces from schemas
   - Path/method constants
   - Type-guard functions (`isUser()`, `isValidPath()`)
   - _Input not supported—too broad to reliably parse into canonical IR_

5. **tRPC** — Type-safe API framework:
   - **Input:** Parse tRPC router source files via ts-morph → extract Zod schemas → IR
   - **Output:** Generate tRPC router definitions with embedded Zod validators

---

## Current State (January 10, 2026)

### What's Working ✅

| Component                | Status        | Notes                                    |
| ------------------------ | ------------- | ---------------------------------------- |
| Quality Gates            | 10/10 passing | 1080+ tests total                        |
| IR Builder               | Complete      | OpenAPI → CastrDocument                  |
| IR-1 (schemaNames, deps) | Complete      | Full dependencyGraph with depth/circular |
| IR-2 (context cleanup)   | Complete      | Schema names, deps, tags from IR         |
| IR-3 (MCP cleanup)       | Complete      | MCP fully IR-based                       |
| **IR-4 (validation)**    | **Complete**  | **17 architectural tests**               |
| Zod Writer               | Complete      | IR → Zod via ts-morph                    |
| **Zod Parser (2.1)**     | **Complete**  | **46 tests, foundation in place**        |
| Type Writer              | Complete      | IR → TypeScript via ts-morph             |
| Scalar Pipeline          | Complete      | Bundles, upgrades to 3.1                 |
| OpenAPI 3.1 Support      | Complete      | First-class support                      |

### What Needs Work ⚠️

| Component     | Issue                        | Reference                |
| ------------- | ---------------------------- | ------------------------ |
| Zod → OpenAPI | Not implemented — next phase | [zod-to-openapi-plan.md] |

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

## Current Phase: Phase 2 (Zod → OpenAPI)

Phase 1 (OpenAPI → Zod) is **complete**. Now implementing the reverse direction.

**See:** [zod-to-openapi-plan.md](./zod-to-openapi-plan.md) for detailed plan.

### Phase 1 Summary (Archived)

| Work Item                   | Status  | Effort |
| --------------------------- | ------- | ------ |
| IR-2: Context layer cleanup | ✅ Done | 6-8h   |
| IR-3: MCP subsystem cleanup | ✅ Done | 12h    |
| IR-4: Validation framework  | ✅ Done | 2h     |
| IR-5: Documentation         | ✅ Done | 1h     |

**Archived:** [archive/phase-1-completion-plan.md](./archive/phase-1-completion-plan.md)

### Phase 2 Overview

| Session | Focus                    | Status      | Effort |
| ------- | ------------------------ | ----------- | ------ |
| 2.1     | Zod 4 parser foundation  | ✅ Complete | 4-6h   |
| 2.2     | Constraints & modifiers  | 🎯 Next     | 4-6h   |
| 2.3     | Composition & references | Pending     | 6-8h   |
| 2.4     | Endpoint parsing         | Pending     | 6-8h   |
| 2.5     | OpenAPI writer           | Pending     | 6-8h   |
| 2.6     | Round-trip validation    | Pending     | 4-6h   |
| 2.7     | Adapter abstraction      | Pending     | 4-6h   |

**Total: ~3-4 weeks**

**Key Decisions:**

- Zod 4 only (strict rejection of Zod 3)
- Schemas + endpoints both supported
- Deterministic recommendations for missing metadata (no AI)

---

## Format Implementation Order

The order of format support is **deliberate** — by implementing both input and output for a format before moving to the next, we discover commonalities between parsers and writers.

| Phase | Transform             | Status      | Plan Document                                      |
| ----- | --------------------- | ----------- | -------------------------------------------------- |
| 1     | OpenAPI → Zod         | ✅ Complete | [archive/phase-1-completion-plan.md]               |
| 2     | Zod → OpenAPI         | 🎯 Active   | [zod-to-openapi-plan.md](./zod-to-openapi-plan.md) |
| 3     | JSONSchema ↔ OpenAPI | 🔲 Planned  |                                                    |
| 4     | JSONSchema ↔ Zod     | 🔲 Planned  |                                                    |
| 5     | tRPC ↔ IR            | 🔲 Planned  |                                                    |

**Rationale:** Complete both directions for a format before adding new formats. This reveals shared abstractions and prevents premature generalisation.

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

### Phase 5: SDK Integration & HTTP Client DI

- Full SDK workspace consuming this library
- MCP server implementation
- **HTTP Client Integration via DI** (see [ADR-025](../docs/architectural_decision_records/ADR-025-http-client-di-integration.md)):
  - `CastrHttpAdapter` interface for HTTP client contracts
  - `createTypedClient()` factory for type-safe API calls with injected adapter
  - Pre-built adapter packages: `@engraph/castr-adapter-fetch`, `-axios`, `-ky`
  - Integration guide and examples
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
pnpm test          # 724 unit tests
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
| **Prompts**      | [session-entry.prompt.md](../prompts/session-entry.prompt.md)                      | Session initialisation |
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

1. Read [session-entry.prompt.md](../prompts/session-entry.prompt.md)
2. Run quality gates: `pnpm clean && pnpm install && pnpm build && pnpm type-check && pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && pnpm test:gen && pnpm character`
3. Review this roadmap and [zod-to-openapi-plan.md](./zod-to-openapi-plan.md)
4. Begin Phase 2 Session 2.2 (Constraints & modifiers)

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
