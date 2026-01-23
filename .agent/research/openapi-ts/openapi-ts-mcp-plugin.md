# OpenAPI-TS MCP Plugin (Design Overview)

## Overview

Repo path: [`tmp/openapi-ts`](../../../tmp/openapi-ts)

This document outlines a high-level design for an OpenAPI‑TS plugin that emits MCP tool definitions (JSON Schema Draft‑07) from an OpenAPI spec. The goal is to provide a simple, opt‑in output that makes OpenAPI‑TS compatible with the Model Context Protocol (MCP) ecosystem without changing OpenAPI‑TS core architecture.

## Goals

- Produce MCP tool manifests from OpenAPI‑TS parsing output.
- Keep the plugin self‑contained and optional.
- Preserve OpenAPI‑TS defaults and plugin ordering.
- Keep output compatible with MCP (JSON Schema Draft‑07).

## Non‑Goals

- Implementing an MCP server runtime.
- Changing OpenAPI‑TS core parser/IR contracts.
- Enforcing spec validation beyond existing OpenAPI‑TS behavior.

## High‑Level Architecture

### Placement in OpenAPI‑TS Pipeline

```
OpenAPI Input
  → OpenAPI‑TS parser + transforms + filters
  → IR / Context
  → MCP Plugin (new)
  → mcp-tools.json (or similar)
```

### Core Responsibilities

- Map OpenAPI operations to MCP tools:
  - Tool name: `operationId` if present, else normalized `METHOD_path`.
  - Description: `summary`/`description` if available.
- Build MCP input/output schemas:
  - Input: `{ path?, query?, header?, body? }` object.
  - Output: success response schema(s).
- Emit MCP annotations:
  - `readOnlyHint` (GET/HEAD)
  - `destructiveHint` (DELETE)
  - `idempotentHint` (PUT)
  - `security` metadata when available
- Remain compatible with full OpenAPI 3.x syntax in the parsed IR; ignore non-operation component types (links/callbacks/pathItems/examples) unless explicitly mapped.

### Draft‑07 Conversion

OpenAPI‑TS IR uses JSON Schema 2020‑12 semantics in places. MCP requires Draft‑07.
High‑level approach:

- Introduce a schema conversion step inside the plugin that maps 2020‑12 keywords to Draft‑07 equivalents.
- Keep conversion minimal and explicit (e.g., `unevaluatedProperties`, `prefixItems` handling).

## Integration Strategy

### Plugin API Usage

- Implement as a standard OpenAPI‑TS plugin with a `run()` entry.
- Consume `context.ir` / `context.spec` for operations, parameters, and schemas.
- Write a single JSON manifest file to the output directory.

### Configuration (High‑Level)

Suggested options:

- `outputPath`: where to write `mcp-tools.json`
- `nameStrategy`: `operationId | methodPath`
- `statusCodes`: `2xx | default | explicit list`
- `draft`: `draft-07` (default, required by MCP)

## Output Shape (Conceptual)

```
{
  "tools": [
    {
      "name": "getPet",
      "description": "Get a pet by ID",
      "inputSchema": { ... Draft‑07 schema ... },
      "outputSchema": { ... Draft‑07 schema ... },
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "idempotentHint": false,
        "security": [ ... ]
      }
    }
  ]
}
```

## Risks and Open Questions

- Draft‑07 conversion coverage for advanced OpenAPI/JSON Schema features.
- Handling multiple response content types and status codes.
- Naming collisions when `operationId` is missing.

## Next Steps (If Approved)

- Define the plugin package name and repo placement.
- Add a minimal conversion utility for Draft‑07 mapping.
- Prototype against a small spec fixture set.
