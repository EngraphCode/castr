# Requirements

1. We must be able to generate Zod schemas from OpenAPI specifications.
2. We assume the OpenAPI specification will be used to create an SDK.
3. We must be able to generate validation helpers for the SDK request parameters (input) and response bodies (output).
4. We assume the SDK will be used to create a suite of MCP tools.
5. Input and output validation must not be needlessly repeated. Not all MCP tools will be defined from the SDK, but all of our validation helpers will be derived from the SDK, therefore detailed validation must happen at the SDK level.
6. The generated validation helpers must be able to be used to validate the input and output of the MCP tools derived from the SDK. MCP tool definitions _require_ a JSON schema for the input and output. Therefore, although the detailed validation happens at the SDK level, we still need to provide MCP tool definition specific JSON schemas for the input and output.
7. This library must be usable as a programmatic API.
8. This library must be usable as a CLI.
9. When consumed as either a programmatic API or a CLI, the user MUST be able to pass an OpenAPI specification to the library.
10. Invalid OpenAPI specification documents must be rejected with helpful error messages.
11. Valid OpenAPI specification documents may contain references.
12. If required, the library must be able to dereference the OpenAPI specification document.
13. No defensive programming, we fail fast, we fail loud, and we do it with helpful error messages.
14. The library must be built to the highest standards of quality, security, and reliability, and the behaviour of the library must be completely defined by the unit test suite.
15. We must preserve the original public API of openapi-zod-client. We can add additional API surface.

---

## Phase Alignment Snapshot

- **Phase 2 – Part 1 (Scalar Pipeline)** directly advances requirements **7–13** by delivering deterministic loading, validation, and `$ref` handling for both CLI and programmatic entry points.
- **Phase 2 – Part 2 (MCP Enhancements)** targets requirements **4–6** by generating MCP-ready JSON Schema artefacts, security metadata, and tool predicates derived from the SDK outputs.
- Ongoing TDD/TSDoc mandates in every phase continue to uphold requirements **14–15**.

Refer to `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` for the detailed task breakdown tied to these requirements.
