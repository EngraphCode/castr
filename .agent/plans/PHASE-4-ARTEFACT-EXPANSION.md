# Phase 4 Plan – Artefact Expansion & SDK Integration

**Status:** Draft  
**Prerequisites:** Phase 3 (Typed IR & ts-morph migration) complete; Scalar pipeline + MCP enhancements (Phase 2) stable  
**Reference:** `.agent/plans/additional_project_requirements.md`

---

## 1. Vision & Goals

Deliver the multi-artefact toolchain described in the additional project requirements so a single run of the generator produces every SDK deliverable:

- TypeScript interfaces for `openapi-fetch` (`paths`, `operations`, `components`, `webhooks`)
- Deterministic enumerated constants and type guards
- Request/response metadata maps (including per-channel parameter schemas)
- Decorated schema JSON/TS modules with provenance
- Zod validators, helper maps, and runtime schema collections
- OpenAPI Fetch client wrappers and manifest outputs
- MCP-specific summaries, sample utilities, and tool scaffolding inputs

All artefacts consume the **Phase 3 IR** and continue to validate against official OpenAPI schemas and MCP Draft 2025-06-18 requirements. Output must be deterministic and configurable through modular writers.

---

## 2. Guiding Principles

1. **Single Pass:** Reuse the prepared IR from Phase 3; no additional schema parsing.  
2. **Writer Modularity:** Introduce pluggable writers (types, zod, metadata, clients, MCP) that share the same IR.  
3. **Deterministic & Stable:** Byte-for-byte identical output for identical input + config.  
4. **Schema Compliance:** All regenerated OpenAPI documents and derived JSON Schemas validate against `.agent/reference/openapi_schema/*.json` and MCP schemas.  
5. **Vendor Agnostic:** Oak-specific behaviour remains opt-in via hooks; defaults stay platform neutral.  
6. **Documentation First:** Every emitted module includes TSDoc sourced from the OpenAPI descriptions.

---

## 3. Milestones

### M1. Writer Orchestration & Manifest (est. 1 week)
- Define writer API (`types`, `zod`, `metadata`, `client`, `mcp`, `schema-json`).  
- Implement generation manifest (`GeneratedFile`, `GenerationResult`) consumed by both CLI and programmatic API.  
- Add CLI options mirroring programmatic `writers[]`, `outputDir`, and transform hooks.

### M2. OpenAPI Fetch Type Suite (est. 1–2 weeks)
- Emit `paths`, `operations`, `components`, `webhooks` interfaces compatible with `openapi-fetch@^0.15`.  
- Produce deterministic parameter decomposition (`path/query/header/cookie`) and numeric status literal responses.  
- Generate TSDoc per operation/parameter from OpenAPI descriptions.  
- Validate by compiling a fixture project that imports the generated interfaces.

### M3. Derived Constants & Guards (est. 1 week)
- Emit path catalogues (`PATHS`, `ValidPath`, `allowedMethods`, `isAllowedMethod`).  
- Produce enum constants/guards for all schema-defined `enum`/`const` values with renaming hooks.  
- Generate operation metadata (`PATH_OPERATIONS`, `OPERATIONS_BY_ID`) and request parameter schema maps.

### M4. Runtime Schema & Zod Catalogue (est. 1–2 weeks)
- Emit decorated schema as `schema.ts` + JSON snapshots with provenance header.  
- Produce single-pass Zod outputs: endpoints array, helper maps (operation IDs, primary status), `buildSchemaCollection`.  
- Attach JSON Schema counterparts for request/response validators to satisfy downstream tooling requirements.

### M5. Client & MCP Tooling (est. 1–2 weeks)
- Generate `createApiClient` / `createPathClient` wrappers around `openapi-fetch`.  
- Provide MCP operation summaries, sample generators, tool naming helpers, and JSON Schema payloads derived from the same IR.  
- Ensure MCP tool bundle can be rebuilt using only generated artefacts (integration test).

### M6. Validation & Documentation (est. 1 week)
- Expand characterisation tests to cover full artefact set (types, zod, clients, MCP).  
- Add integration tests: diff output determinism, compile-time checks, MCP tool regeneration, schema validation.  
- Update README, CLI help, migration guides, and changelog.

---

## 4. Deliverables

- Modular writer API and CLI with manifest output.  
- Full type suite (`paths`, `operations`, `components`, `webhooks`) with TSDoc.  
- Deterministic constants/guards and parameter schema maps.  
- Decorated schema JSON/TS modules with provenance.  
- Zod endpoints + helper maps + JSON Schema validators.  
- OpenAPI Fetch client helpers.  
- MCP tool metadata, sample utility, and naming helpers.  
- Comprehensive tests ensuring compliance and determinism.

---

## 5. Success Criteria

- Running `generate({ schema, writers: 'all' })` produces types, Zod, metadata, clients, MCP artefacts, and schema snapshots in one execution.  
- Emitted `paths` interface compiles with `openapi-fetch@^0.15` and matches existing SDK behaviour.  
- Zod validators cover every request channel and response status; JSON Schema siblings align.  
- Enumerated constants, request parameter maps, and operation metadata require no downstream patching.  
- MCP tool generation consumes only generated artefacts to match current behaviour.  
- Two identical runs produce identical manifests (verified via CI).  
- All outputs documented with TSDoc derived from OpenAPI descriptions.

---

**Next Steps:**  
1. Finalise Phase 3 implementation and capture IR schema/versioning.  
2. Spike on writer orchestration to confirm API ergonomics.  
3. Begin Milestone 1 with TDD + characterisation groundwork.
