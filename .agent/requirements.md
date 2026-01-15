# Requirements: Agent Decision-Making Guide

> **Purpose**: This document helps AI agents make implementation decisions.  
> **For strategic vision**, see `VISION.md`.  
> **For engineering standards**, see `RULES.md`.

---

## Core Constraints

These constraints are **non-negotiable** and guide all implementation decisions:

1. **Internal Versions** (use only these internally)
   - OpenAPI: 3.1.x
   - Zod: 4
   - JSON Schema: draft 2020-12

2. **Input Compatibility** (accept these, upgrade internally)
   - OpenAPI: 3.0.x and 3.1.x (YAML and JSON)

3. **Full Syntax Support** — **BLOCKING PREREQUISITE**

   > [!CAUTION]
   > The system is NOT ready for production use until ALL valid OpenAPI syntax is supported.
   > This is about **basic input and output support** — NOT round-trip validation.
   > Round-trip validation is a SEPARATE phase that comes AFTER basic support is complete.

   **What this means:**
   - **Input:** ALL valid OpenAPI 3.0.x and 3.1.x fields MUST be parsed to IR
   - **Output:** ALL IR fields MUST be written to valid OpenAPI 3.1.x output
   - **No deferrals:** Every field in the specification MUST be implemented

   **Document-level fields (ALL required):**
   - openapi, info, jsonSchemaDialect, servers, paths, webhooks, components, security, tags, externalDocs

   **Component types (ALL required):**
   - schemas, responses, parameters, requestBodies, headers, securitySchemes, links, callbacks, pathItems, examples

   **Operation-level fields (ALL required):**
   - operationId, method, path, summary, description, tags, parameters, requestBody, responses, security, deprecated, externalDocs, callbacks, servers

   **Response-level fields (ALL required):**
   - statusCode, description, content, headers, links

   **PathItem-level fields (ALL required):**
   - summary, description, servers, parameters, all HTTP methods including trace

   **IR must support ALL fields.** Parsers must extract ALL fields. Writers must output ALL fields.

4. **Fail Fast**
   - Invalid input → immediate rejection with helpful error message
   - No defensive programming, no silent fallbacks

5. **Quality Bar**
   - Behavior completely defined by test suite
   - Highest standards of quality, security, reliability

---

## Current Focus: OpenAPI → Zod Pipeline

This is the active implementation focus. When making decisions, prioritize this pipeline:

| Input         | Output               | Priority     |
| ------------- | -------------------- | ------------ |
| OpenAPI 3.1.x | Zod 4 schemas        | ✅ Primary   |
| OpenAPI 3.1.x | TypeScript types     | ✅ Primary   |
| OpenAPI 3.1.x | MCP tool definitions | ✅ Primary   |
| OpenAPI 3.1.x | JSON Schema 2020-12  | 🔲 Secondary |

---

## Functional Requirements

### Input Handling

- Accept OpenAPI via file path, URL, or in-memory object
- Accept Zod schemas programmatically
- Dereference and bundle at load time
- Validate before processing

### Output Generation

- Generate Zod schemas with full validation chains
- Generate TypeScript type definitions
- Generate MCP tool definitions (JSON Schema input/output)
- Generate endpoint metadata (method, path, parameters, responses)

### Delivery

- Programmatic API (primary)
- CLI (secondary)

---

## What This Library IS

**Building blocks** for SDK construction:

- Zod schemas
- Validation helpers
- Endpoint metadata
- MCP tool definitions

Consumers use these building blocks with their HTTP client of choice.

---

## What This Library IS NOT

- ❌ A complete HTTP client
- ❌ An opinionated SDK
- ❌ A runtime API client

---

## Decision Heuristics

When uncertain about implementation choices, use these priorities:

1. **Type safety** over convenience
2. **Explicit** over implicit
3. **Fail fast** over graceful degradation
4. **IR correctness** over output appearance
5. **Test coverage** over feature velocity

---

## Related Documents

| Document                | Purpose                         |
| ----------------------- | ------------------------------- |
| `VISION.md`             | Strategic direction and roadmap |
| `RULES.md`              | Engineering standards           |
| `testing-strategy.md`   | Test methodology                |
| `DEFINITION_OF_DONE.md` | Quality gates                   |
