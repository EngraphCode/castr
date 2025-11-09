# Phase 2 Session 8 – MCP Tool Generation & Template Integration

**Status:** ✅ Complete (Phase 2 Part 2)  
**Estimated Effort:** 8–10 hours (Context helpers: 3h, Template integration: 3h, Manifest/CLI: 2h, Validation & docs: 1–2h)  
**Parent Plan:** [PHASE-2-MCP-ENHANCEMENTS.md](./PHASE-2-MCP-ENHANCEMENTS.md) § “Session 8 – MCP Tool Generation & Template Integration”  
**Standards:** Must comply with [.agent/RULES.md](../RULES.md) — TDD, library types only, zero escape hatches, exhaustive documentation.

---

## Session Objectives

- Transform Session 7 JSON Schema + security outputs into MCP-compliant tool definitions (Layer 2 metadata only).
- Extend the template context and Handlebars templates to emit tool definitions, input/output schemas, and behavioral hints.
- Introduce a CLI flag to emit an MCP manifest JSON file derived from generation context.
- Provide comprehensive validation (unit, integration, characterization, snapshot) and update documentation/hand-off artifacts.

## Status

- Preconditions satisfied: Session 7 completed, JSON Schema converter + security extractor available (`convertOpenApiSchemaToJsonSchema`, `resolveOperationSecurity`).
- Workstreams A–C delivered:
  - Helper modules ship deterministic naming/hints plus aggregated schemas and security metadata.
  - Template context and Handlebars templates expose `mcpTools`, with templated + original paths preserved inside each `httpOperation`.
  - CLI flag `--emit-mcp-manifest` delegates directly to the shared context; characterisation coverage asserts CLI ↔ programmatic parity while the new inline JSON Schema helper emits `$ref`-free Draft 07 documents.
- Snapshot hygiene: high-churn suites (hyphenated parameters, export-all-types, export-all-named-schemas, export-schemas-option, schema-name-already-used) now load expectations from fixture modules; remaining large snapshots are earmarked for audit but no longer block the gate.
- Full quality gate stack (`pnpm lint`, `pnpm test`, `pnpm test:snapshot`, `pnpm type-check`, `pnpm build`, `pnpm character`) is green on `feat/rewrite` after the fixture migration.
- Workstream D delivered (Nov 8 2025 22:45): recorded CLI manifest runs for `petstore-expanded` and `multi-auth`, stored artefacts under `tmp/*.mcp.json`, and captured command output (including `default`-only warning for petstore).
- Snapshot review complete: `group-strategy`, `recursive-schema`, and composition suites remain inline by design—each mixes multiple assertions over programmatic context, dependency graphs, and generated code, so extracting fixtures would duplicate logic without shrinking churn. Documented rationale below.
- Documentation system refreshed (Nov 8 2025 22:50): `.agent/context/context.md`, `.agent/context/HANDOFF.md`, `.agent/context/continuation_prompt.md`, parent plan, and this session plan now reflect the manual runs, snapshot audit, and green gate status.
- Final smoke sweep (Nov 8 2025 22:45): `pnpm test`, `pnpm test:snapshot`, and `pnpm character` rerun post-doc updates — all green with zero skipped tests.

## Workstream A – MCP Tool Definition Modeling

**Goal:** Build pure helpers that shape MCP tool metadata from existing OpenAPI-derived context.

### Desired Impact

- Each operation yields a deterministic `McpToolDefinition` object with name, description, hints, input schema, output schema, and security requirements.
- Strict partition between Layer 1 (MCP protocol) and Layer 2 (upstream API) preserved; documentation warns consumers accordingly.

### Tasks

1. **Introduce data structures** in `lib/src/context/template-context.mcp.ts` (new file) or extend existing context module:
   - Derive tool names: `getMcpToolName(operationId, method, path)` → snake*case fallback to `<method>*<path_segments>`.
   - Compute hints: `getMcpToolHints(method)` returning `readOnlyHint`, `destructiveHint`, `idempotentHint` booleans.
   - Assemble security requirements: reuse `resolveOperationSecurity`.
2. **Map schemas**:
   - Input schema: consolidate path/query/header/body parameter schemas via Session 6 metadata + Session 7 JSON Schema converter.
   - Output schema: select primary success response (200/201) or fallback to `{ type: 'object' }` with warning if absent.
   - Enforce MCP requirement that top-level `inputSchema`/`outputSchema` have `"type": "object"` or wrap accordingly.
3. **Construct typed interface** using library types:
   - Prefer `import type { ToolDefinition } from '@modelcontextprotocol/sdk/types.js'`.
   - Extend with project-specific additions via intersection types (no custom shape duplication).

### Validation

- Unit tests (`vitest`) for helper functions (naming, hints, security mapping, schema wrapping).
- TDD: write failing tests first.
- Ensure no type assertions (`as`, `!`).

---

## Workstream B – Template Context & Handlebars Integration

**Goal:** Expose MCP tool definitions to templates and render them alongside existing artifacts.

### Desired Impact

- Template context exposes `mcpTools` array with all tool definitions (names, schema references, hints, security).
- Handlebars templates render tool definitions and maintain backwards compatibility for existing outputs.

### Tasks

1. Extend `getZodClientTemplateContext` to calculate `mcpTools` using Workstream A helpers.
2. Persist both the OpenAPI path template (`/users/{id}`) and the generated router template (`/users/:id`) inside each tool so lookups never rely on string transforms.
3. Update `schemas-with-metadata.hbs` (or add `mcp-tool-schemas.hbs` partial):
   - Emit `export const mcpTools = [...]`.
   - Document usage, including examples demonstrating `tool.inputSchema`/`tool.outputSchema` parsing alongside `httpOperation` + `security`.
4. Update associated TypeScript types (`template-context.types.ts`) without introducing custom shapes — reuse library interfaces with `Pick`/`Omit`.

### Validation

- Snapshot updates: `tests-snapshot/integration/samples.test.ts` must include `mcpTools` output.
- Characterization tests verifying `mcpTools` emitted for multi-auth, petstore, tictactoe fixtures.
- Lint/type-check for template context modules (ensure no `any`).

---

## Workstream C – CLI Manifest Generation

**Goal:** Provide `--emit-mcp-manifest <path>` flag to produce a JSON manifest file containing tool definitions.

### Desired Impact

- Users can opt-in to MCP manifest emission without modifying templates.
- Manifest aligns with MCP 2025-06-18 schema (type `array` of tool definitions).

### Tasks

1. Update CLI option parser (`lib/src/cli/helpers.options.ts` & CLI entry) to accept the new flag.
2. When flag present:
   - Derive manifest content from the already-generated template context (no extra OpenAPI pass, no bespoke CLI-only logic).
   - Ensure file system write uses existing utilities or Node `fs/promises`.
3. Add robust error handling:
   - Fail fast on write errors with actionable message.
   - Warn (not fail) when manifest path directory missing? -> create directories or document requirement (decide, document).
4. Keep CLI/programmatic parity: add assertions that compare emitted manifest with the programmatic `mcpTools`.
5. Document flag in CLI help and README stub for future Session 9 docs.

### Validation

- Unit/integration test for CLI (`vitest` with `execa` or similar stub) verifying manifest file creation and contents.
- Shared assertion that programmatic + CLI outputs are byte-for-byte identical.
- Snapshot or fixture verifying manifest JSON structure (prefer deterministic sorting).

---

## Workstream D – Validation, Documentation & QA

**Goal:** Ensure outputs meet quality gates, documentation system updated, and manual checks recorded.

### Tasks

1. **Automated Validation**
   - `pnpm test -- run src/context/template-context.test.ts`
   - `pnpm test -- run src/rendering/templates/*.test.ts`
   - `pnpm test:snapshot` (refresh as needed)
   - `pnpm character -- filter mcp` (or full `pnpm character`)
2. **Manual Verification**
   - `pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js examples/openapi/v3.0/petstore-expanded.yaml --emit-mcp-manifest ../tmp/petstore.mcp.json`
   - `pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js examples/custom/openapi/v3.1/multi-auth.yaml --emit-mcp-manifest ../tmp/multi-auth.mcp.json`
   - Inspect the generated manifests (`tool`, `httpOperation`, `security`) and archive the JSON + summary in the Session 8 notes; validate shape against the MCP schema via AJV or existing script.
3. **Documentation Updates**
   - Update `.agent/context/context.md`, `.agent/context/HANDOFF.md`, `.agent/context/continuation_prompt.md`.
   - Add Session 8 summary to parent plan and continuation prompt.
   - Prepare README/CLI flag notes (placeholder if full docs deferred to Session 9).

### Quality Gates

- `pnpm format`
- `pnpm build`
- `pnpm lint`
- `pnpm type-check`
- `pnpm test:all`
- `pnpm character`

> Executed Nov 8 2025 @ 22:35–22:45: `pnpm build`, `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm test:snapshot`, `pnpm character` — all passed with zero skipped tests.

Document timestamps and outcomes in context docs.

---

### Snapshot Audit (Nov 8 2025)

- `group-strategy`: keep Vitest snapshot files in place. They cover both `getZodClientTemplateContext` and `generateZodClientFromOpenAPI` across tag/method/tag-file strategies, so extracting fixtures would duplicate helper wiring while still emitting ~10 k lines of TypeScript.
- `recursive-schema`: retain inline expectations. The suite exercises dependency graphs, topological sorting, and context mutation; splitting into fixtures would obscure the multi-step assertions we rely on when debugging recursion issues.
- Composition suites (`anyOf`/`allOf` variants): maintain inline snapshots. Each test encodes nuanced OpenAPI composition behaviour with explanatory comments; moving to fixtures would add indirection without shrinking change surface.

## Definition of Done

- All Workstreams A–D acceptance criteria satisfied.
- Tool definitions exported (`mcpTools`) with correct schemas, hints, and security metadata.
- Handlebars templates render MCP data without breaking existing behavior.
- `--emit-mcp-manifest` flag writes deterministic JSON manifest mirroring template output.
- Tests updated/added across unit, integration, snapshot, characterization suites.
- Manual CLI run + manifest validation recorded in context documents.
- Parent plan and continuation prompt updated with Session 8 progress/completion details.
- Quality gates passing (zero lint/type/test failures, zero skipped tests).

## Session Wrap-up (Nov 8 2025 22:50)

- ✅ Helper/context/template layers emit MCP tool definitions with deterministic naming, Draft 07 schemas, hints, and security metadata.
- ✅ CLI `--emit-mcp-manifest` flag documented via captured commands; artefacts archived in `tmp/`.
- ✅ Fixture migration + snapshot audit complete; rationale for remaining inline suites recorded.
- ✅ All quality gates green after documentation updates.
- 📌 Follow-on items handed to Session 9: document the new CLI flag in README/CLI help, expand MCP overview/examples, and introduce runtime MCP type guards + docs.

---

## Rule Alignment Checklist

- [ ] TDD observed for every change (tests fail before implementation, pass after).
- [ ] Library types only; leverage `@modelcontextprotocol/sdk/types.js` and `openapi3-ts/oas31` (no custom “tool” interfaces).
- [ ] No type escape hatches (`as`, `any`, `!`, `satisfies` misuse).
- [ ] Pure functions for helpers; template integration remains deterministic.
- [ ] Comprehensive TSDoc for new exports (helpers, manifest writers, CLI options).
- [ ] Quality gates executed and logged.
- [ ] Documentation system updated (context, handoff, continuation prompt, parent plan).

Status checkboxes remain unchecked until work completes; update as tasks progress.

---

## Reference Materials

- `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` – official MCP schema requirements.
- `.agent/analysis/JSON_SCHEMA_CONVERSION.md` – conversion rules from Session 7 research.
- `lib/src/conversion/json-schema/convert-schema.ts` – JSON Schema converter (inputSchema/outputSchema source).
- `lib/src/conversion/json-schema/security/extract-operation-security.ts` – security metadata extractor.
- `@modelcontextprotocol/sdk/types.js` – canonical MCP type definitions.

---

## Suggested Workflow (High Level)

1. **Setup & Fixtures**
   - Move existing inline snapshot payloads into scenario-based fixture modules (e.g. `lib/tests-snapshot/__fixtures__/…`) so tests stay concise and eslint `max-lines-per-function` is satisfied.
   - Add dedicated manifest fixtures under `lib/tests-snapshot/mcp/` for reuse across programmatic + CLI assertions.
2. **Workstream A**
   - Implement helper tests → helper implementation → refactor.
3. **Workstream B**
   - Extend context + template tests → adjust Handlebars partials → update fixtures/snapshots once outputs stabilise.
4. **Workstream C**
   - Add CLI flag tests → implement thin-wrapper emission logic → verify with manual run.
5. **Workstream D**
   - Run full validation suite → update documentation → prepare handoff summary.

Work through TDD loops incrementally; avoid broad refactors without targeted failing tests.
