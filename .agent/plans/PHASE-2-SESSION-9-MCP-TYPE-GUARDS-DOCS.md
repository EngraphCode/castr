# Phase 2 Session 9 – MCP Type Guards, Error Formatting & Documentation

**Status:** ⏳ Ready to start (Phase 2 Part 2)  
**Estimated Effort:** 8–10 hours (Type guards: 3h, Error formatting: 2h, Documentation: 3h, Validation & polish: 1–2h)  
**Parent Plan:** [PHASE-2-MCP-ENHANCEMENTS.md](./PHASE-2-MCP-ENHANCEMENTS.md) § “Session 9 – Type Guards, Error Formatting & Documentation”  
**Standards:** Must comply with [.agent/RULES.md](../RULES.md) — strict TDD, library types only, zero escape hatches, exhaustive documentation, full quality gate runs.

---

## Session Objectives

- Provide runtime validation helpers for MCP tool metadata, inputs, and outputs that rely exclusively on library-provided types.
- Convert Zod validation errors into MCP-friendly responses with contextual JSON pointers while preserving diagnostic detail.
- Document the MCP manifest workflow across README, CLI help, release notes, and a dedicated integration guide.
- Maintain complete alignment between programmatic APIs, CLI behaviour, and published documentation while keeping all quality gates green.

---

## Status Snapshot

- Sessions 1–8 delivered MCP helper plumbing, CLI manifest emission, and documentation refresh.
- Manual manifest artefacts (`tmp/petstore.mcp.json`, `tmp/multi-auth.mcp.json`) are available for validation examples.
- Workstream A kicked off (Nov 8, 2025 11:30 PM): `isMcpTool`, `isMcpToolInput`, and `isMcpToolOutput` implemented with unit coverage (`lib/src/validation/mcp-type-guards.ts`, `lib/src/validation/mcp-type-guards.test.ts`). Guards remain internal to unit tests; characterisation suites were not modified.
- Branch `feat/rewrite` remains green across all quality gates (`pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm test:snapshot`, `pnpm character`) as of Nov 8, 2025 11:40 PM.

---

## Workstream A – MCP Type Guards & Runtime Validation

**Goal:** Deliver runtime guarantees for MCP tool metadata and payloads using pure, library-typed helpers.

**Intended Impact**

- Consumers can verify generated tool definitions, input payloads, and outputs before invoking MCP tooling.
- Validation logic leverages library types (`@modelcontextprotocol/sdk/types.js`, `openapi3-ts/oas31`) and prevents drift between templates and runtime checks.

**Acceptance Criteria**

1. Implement `isMcpTool(value): value is McpTool` that validates the manifest object structure.
2. Implement `isMcpToolInput(value, toolDefinition): boolean` and `isMcpToolOutput(value, toolDefinition): boolean` that run Draft 07 validation via cached schemas.
3. All helpers live in `lib/src/validation/mcp-type-guards.ts` and are exported through the public API.
4. Comprehensive unit tests cover positive and negative cases, including edge scenarios (missing fields, wrong types, additional properties).
5. No type escape hatches (`as`, `any`, `!`, `satisfies` misuse); rely on discriminated unions and library types.
6. TSDoc documents usage, parameters, return types, and error semantics.

**Validation Steps**

- `pnpm test -- run src/validation/mcp-type-guards.test.ts`
- `pnpm lint` (ensures no Sonar or ESLint violations)
- `pnpm type-check` (verifies helper typing without assertions)
- Integrate guards into characterization tests where appropriate and rerun `pnpm character`
- Full quality gate sweep before exiting Workstream A.

---

## Workstream B – MCP Error Formatting Enhancements

**Goal:** Translate Zod validation errors into structured MCP error responses suitable for JSON-RPC clients.

**Intended Impact**

- MCP consumers receive actionable error payloads with JSON pointer paths and severity data.
- Error formatting aligns with MCP recommendations and retains original error details for diagnostics.

**Acceptance Criteria**

1. Implement `formatMcpValidationError(error, context)` returning `{ code, message, data }` matching MCP expectations.
2. Include JSON path context (`pointer` or `dataPath`) for each issue and map to JSON-RPC 2.0 error codes.
3. Preserve original Zod error stack in a non-enumerable property for logging/debugging.
4. Unit tests cover simple, nested, and array validation failures.
5. Update CLI/programmatic flows to use the formatter when reporting validation failures (without adding new side effects).
6. TSDoc clarifies usage, parameters, and expected output.

**Validation Steps**

- `pnpm test -- run src/validation/mcp-error-formatting.test.ts`
- `pnpm character -- filter mcp` to ensure CLI messaging remains deterministic.
- `pnpm lint`, `pnpm type-check`, and `pnpm build` to catch typing/build regressions.
- Manual inspection using existing `tmp/*.mcp.json` manifests to confirm error rendering in realistic scenarios.

---

## Workstream C – Documentation & Communication

**Goal:** Publish comprehensive documentation for the MCP manifest workflow and expose runtime helpers to users.

**Intended Impact**

- README and CLI help clearly describe MCP features, usage, and validation helpers.
- A dedicated integration guide enables consumers to adopt MCP manifests end-to-end.
- Release notes provide stakeholders with a concise summary of Phase 2 Part 2 achievements.

**Acceptance Criteria**

1. README gains an MCP overview section with quick start, CLI examples (`--emit-mcp-manifest`), and type guard usage.
2. CLI help output documents the manifest flag and references the integration guide.
3. Author `docs/MCP_INTEGRATION_GUIDE.md` covering server integration, manifest structure, security metadata, and example workflows (petstore, multi-auth).
4. Update `.agent/context/*` and session plans after documentation changes to keep context current.
5. Draft release notes (or addendum to existing notes) summarising Sessions 7–9 outcomes.
6. Ensure all documentation adheres to RULES.md (no divergence from actual API, examples validated via tests where feasible).

**Validation Steps**

- `pnpm format` to apply Prettier on changed docs.
- `pnpm lint` focusing on Markdown/MDX rules (if configured).
- `pnpm test` / `pnpm test:snapshot` when examples rely on executable snippets.
- Manual QA: follow README + integration guide steps to ensure instructions work.
- Update context documents and verify cross-links.

---

## Workstream D – Comprehensive Validation & QA

**Goal:** Guarantee that every change introduced in Session 9 maintains production readiness.

**Acceptance Criteria**

1. All quality gates pass (`pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm test:snapshot`, `pnpm character`).
2. No skipped tests, no eslint warnings, no type errors.
3. Characterization suite covers MCP manifest emission, runtime guards, and error formatting integration.
4. Manual CLI manifests regenerated and inspected to confirm new helpers/doc changes remain accurate.
5. Session wrap-up updates `.agent/context/context.md`, `.agent/context/HANDOFF.md`, `.agent/context/continuation_prompt.md`, parent plan, and this session plan.

**Validation Steps**

- Execute the full quality gate command sequence after each significant milestone.
- Record outcomes (timestamp + status) in context documents per RULES.md.
- Capture `git status` snapshot before final handoff to ensure clean tree.

---

## Definition of Done

- Workstreams A–D acceptance criteria satisfied.
- Runtime type guards and error formatter implemented, tested, documented, and exported.
- README, CLI help, integration guide, and release notes updated.
- Manual MCP manifest examples regenerated and validated.
- Full quality gate suite green with zero skips.
- Context and planning documents reflect Session 9 completion.
- Changes committed with RULES-compliant messages.

---

## Rule Alignment Checklist

- [ ] TDD observed for every code change (tests fail before implementation, pass after).
- [ ] Library types only — rely on `@modelcontextprotocol/sdk/types.js`, `openapi3-ts/oas31`, and Zod types; no custom type aliases unless mandated by libraries.
- [ ] No type escape hatches (`as`, `any`, `!`, `satisfies` misuse).
- [ ] Pure utility functions with predictable output for given inputs; avoid side effects.
- [ ] All new exports documented with complete TSDoc (arguments, returns, examples).
- [ ] Quality gates executed and logged in context documents.
- [ ] Documentation examples validated via tests or manual verification where automated checks are not feasible.
- [ ] Context/handoff/plans updated immediately after work concludes.

---

## Reference Materials

- `.agent/RULES.md` – Coding, testing, and documentation standards.
- `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` – MCP specification notes (2025-06-18).
- `.agent/analysis/JSON_SCHEMA_CONVERSION.md` – JSON Schema conversion rules from Session 7.
- `.agent/analysis/SECURITY_EXTRACTION.md` – Upstream security metadata guidance.
- `tmp/petstore.mcp.json`, `tmp/multi-auth.mcp.json` – Sample manifests for validation and documentation.
- `lib/src/context/template-context.mcp.*` – Existing helpers feeding manifest generation.
- `lib/src/characterisation/cli.char.test.ts` – CLI parity tests to extend for runtime validation coverage.

---

**Ready to begin Session 9 once approval is given.** All work must keep the branch green and adhere strictly to RULES.md.
