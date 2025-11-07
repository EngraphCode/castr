# Phase 2 Session 8 – MCP Tool Generation & Template Integration

**Status:** Not started (Phase 2 Part 2)  
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
- Fixture update complete: multi-auth sample available under `examples/custom/openapi/v3.1/multi-auth.yaml`.
- No code implemented for Session 8 yet — this plan defines upcoming work.

---

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
2. Update `schemas-with-metadata.hbs` (or add `mcp-tool-schemas.hbs` partial):
   - Emit `export const mcpTools = [...]`.
   - Document usage, including examples demonstrating `inputSchema.parse` and `outputSchema.parse`.
3. Update associated TypeScript types (`template-context.types.ts`) without introducing custom shapes — reuse library interfaces with `Pick`/`Omit`.

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
   - Derive manifest content from context produced during code generation (no extra OpenAPI pass).
   - Ensure file system write uses existing utilities or Node `fs/promises`.
3. Add robust error handling:
   - Fail fast on write errors with actionable message.
   - Warn (not fail) when manifest path directory missing? -> create directories or document requirement (decide, document).
4. Document flag in CLI help and README stub for future Session 9 docs.

### Validation

- Unit/integration test for CLI (`vitest` with `execa` or similar stub) verifying manifest file creation and contents.
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
   - Generate CLI output for `petstore-expanded.yaml` with `--emit-mcp-manifest`; inspect tool list for correctness.
   - Validate manifest against MCP schema via `ajv` or script (record command).
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

Document timestamps and outcomes in context docs.

---

## Definition of Done

- All Workstreams A–D acceptance criteria satisfied.
- Tool definitions exported (`mcpTools`) with correct schemas, hints, and security metadata.
- Handlebars templates render MCP data without breaking existing behavior.
- `--emit-mcp-manifest` flag writes deterministic JSON manifest mirroring template output.
- Tests updated/added across unit, integration, snapshot, characterization suites.
- Manual CLI run + manifest validation recorded in context documents.
- Parent plan and continuation prompt updated with Session 8 progress/completion details.
- Quality gates passing (zero lint/type/test failures, zero skipped tests).

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
   - Add dedicated test fixtures for manifest output (if needed) under `lib/tests-snapshot/mcp/`.
2. **Workstream A**
   - Implement helper tests → helper implementation → refactor.
3. **Workstream B**
   - Extend context + template tests → adjust Handlebars partials → update snapshots.
4. **Workstream C**
   - Add CLI flag tests → implement emission logic → verify with manual run.
5. **Workstream D**
   - Run full validation suite → update documentation → prepare handoff summary.

Work through TDD loops incrementally; avoid broad refactors without targeted failing tests.
