# Phase 3: Multi-Artefact Generation

**Status:** Planned (blocked on Phase 3 priorities: Zod→IR, Round-Trip)  
**Prerequisites:** Core path proven — ✅ Complete (OpenAPI ↔ IR ↔ Zod validated)  
**Last Updated:** January 21, 2026

---

## Overview

After the core OpenAPI ↔ Zod path is production-ready, extend Castr to produce multiple artefact types from a single IR.

```
OpenAPI → IR → [types, zod, constants, guards, metadata, client, mcp]
```

---

## Session 2.8: Adapter Abstraction (Prerequisite)

Before multi-artefact generation, the writer framework needs abstraction.

**Intent:** Create a pluggable writer architecture with manifest-driven output.

**Deliverables:**

- `Writer` interface — Standard contract for all output generators
- `GenerationResult` manifest — File metadata, warnings, hashes
- CLI parity — `--writers types,zod,constants` mirrors programmatic API
- Writer registry — Discover/enable writers by name

**Acceptance Criteria:**

- Writers share IR without re-parsing
- Manifest enables deterministic output verification
- CLI and programmatic API have identical capabilities

---

## Sessions 2.9+: Artefact Expansion

After 2.8 establishes the framework, add new artefact types:

| Session | Artefact           | Purpose                                               |
| ------- | ------------------ | ----------------------------------------------------- |
| 2.9     | TypeScript Types   | `paths`, `operations`, `components` for openapi-fetch |
| 2.10    | Constants & Guards | `PATHS`, `ValidPath`, enums, type guards              |
| 2.11    | Metadata Maps      | Operation metadata, parameter schema maps             |
| 2.12    | JSON Schema Output | Request/response schemas for downstream tooling       |
| 2.13    | Client Wrappers    | `createApiClient` with typed helpers                  |
| 2.14    | MCP Tooling        | Tool summaries, sample generators, naming utilities   |

---

## Artefact Details

### 2.9 TypeScript Types (openapi-fetch compatible)

Generate interfaces for use with `openapi-fetch`:

```typescript
export interface paths {
  '/users/{id}': {
    get: operations['getUser'];
  };
}

export interface operations {
  getUser: {
    parameters: { path: { id: string } };
    responses: { 200: { content: { 'application/json': User } } };
  };
}
```

**Requirements:**

- Numeric status keys as literals (`200`, not `string`)
- Parameter decomposition by channel (path/query/header/cookie)
- TSDoc from OpenAPI descriptions

### 2.10 Constants & Guards

```typescript
export const PATHS = ['/users', '/users/{id}'] as const;
export type ValidPath = (typeof PATHS)[number];

export const HttpMethods = ['get', 'post', 'put', 'delete'] as const;
export function isValidMethod(m: unknown): m is HttpMethod { ... }
```

**Requirements:**

- Deterministic ordering (sorted)
- Enum detection from `enum`/`const` in schemas
- Optional renaming hooks for convention alignment

### 2.11 Metadata Maps

```typescript
export const OPERATIONS_BY_ID = {
  getUser: { path: '/users/{id}', method: 'get', tags: ['users'] },
} as const;

export const PARAMETER_SCHEMAS = {
  getUser: { path: { id: z.string().uuid() } },
} as const;
```

### 2.12 JSON Schema Output

Emit request/response schemas as JSON Schema (Draft 2020-12):

- For validation tooling that doesn't use Zod
- For MCP tool input schemas
- With `$id` and provenance metadata

### 2.13 Client Wrappers

```typescript
import createClient from 'openapi-fetch';
import type { paths } from './types';

export function createApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}
```

### 2.14 MCP Tooling

Generate Model Context Protocol tool definitions:

- Tool names from operationId with configurable casing
- Input schemas from request parameters
- Sample payload generators

---

## Guiding Principles

1. **Single IR, Multiple Outputs** — Parse once, write many
2. **Deterministic** — Identical input + config → identical output (bit-for-bit)
3. **Opt-in Writers** — Each artefact type is independently selectable
4. **No Regressions** — Existing Zod output unchanged unless explicitly updated

---

## Quality Standards

All artefact work follows established standards:

- **10 Quality Gates** — All must pass
- **TDD Mandatory** — Tests specify behavior before implementation
- **Type Discipline** — No `as`, `any`, `!`
- **ts-morph for AST** — No string concatenation for code generation

---

## What Already Exists

These capabilities exist and should be **preserved, not duplicated**:

| Existing          | Location                           | Notes                                  |
| ----------------- | ---------------------------------- | -------------------------------------- |
| Zod writer        | `writers/zod/`                     | Keep as canonical, extend if needed    |
| TypeScript writer | `writers/typescript/`              | Write types/constants from IR          |
| OpenAPI writer    | `writers/openapi/`                 | IR → OpenAPI output                    |
| MCP context       | `context/template-context.mcp*.ts` | May need refactoring to writer pattern |

---

## Dependencies on Other Roadmap Items

| Dependency                          | Status    | Impact                                  |
| ----------------------------------- | --------- | --------------------------------------- |
| Session 2.6 (OpenAPI Compliance)    | 🎯 Active | IR must capture all fields first        |
| Session 2.7 (Round-Trip Validation) | Blocked   | Proves NO CONTENT LOSS before expansion |
| Session 2.8 (Adapter Abstraction)   | Pending   | Creates writer framework                |

---

## Out of Scope

- **New parsers** — Covered in Phases 3-5 (JSONSchema, tRPC)
- **HTTP client bundling** — Per ADR-022, consumers choose their client
- **Performance optimization** — Future concern after correctness proven

---

## References

- [ADR-022: Building Blocks Architecture](../../docs/architectural_decision_records/ADR-022-building-blocks-no-http-client.md)
- [ADR-025: HTTP Client DI Integration](../../docs/architectural_decision_records/ADR-025-http-client-di-integration.md)
- [roadmap.md](./roadmap.md) — Session sequencing
