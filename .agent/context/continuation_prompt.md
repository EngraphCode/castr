# Phase 2 Part 1 Continuation Prompt

**Purpose:** Use this prompt verbatim to resume Phase 2 Part 1 (Scalar pipeline re‑architecture) for the `openapi-zod-validation` modernization.

---

> **Intended Impact**  
> Every consumer—CLI, programmatic API, or downstream MCP tooling—must experience the same predictable, spec-compliant behaviour whenever they hand us an OpenAPI document. Valid specs sail straight through and produce deterministic artefacts; invalid specs fail fast with actionable guidance direct from the official schemas. Comprehensive tests and documentation make that contract boringly reliable, unlocking MCP automation and future extraction to Engraph.

---

## Prompt for AI Assistant

I'm working on the `openapi-zod-validation` modernization project. This TypeScript library generates Zod validation schemas and type-safe API clients from OpenAPI specifications. We are executing **Phase 2 Part 1** of the roadmap to replace the `SwaggerParser.bundle()` path with a Scalar-driven pipeline.

**Repository & Branch**

- Path: `/Users/jim/code/personal/openapi-zod-client`
- Branch: `feat/rewrite`

**Strategic References**

1. `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` – authoritative plan (focus on Part 1 milestones)
2. `.agent/plans/00-STRATEGIC-OVERVIEW.md` – high-level roadmap
3. `.agent/plans/requirements.md` – constraints (see Phase Alignment snapshot)
4. `.agent/RULES.md` – TDD, TSDoc, fail-fast standards
5. `.agent/context/context.md` – current status summary (keep in sync)

**Current Status**

- Phase 1 tooling modernization is complete.
- Phase 2 plan (Parts 1 & 2) reviewed; Session 1 groundwork delivered (callers inventoried, Scalar dependencies pinned, guard scaffolded).
- Guard command `pnpm --filter openapi-zod-validation test:scalar-guard` intentionally fails while legacy imports remain; keep it red until Session 4 cleanup.
- Existing pipeline still relies on `SwaggerParser.bundle()` pending Scalar loader/validator work.
- All quality gates are currently green (`pnpm check` passes); maintain this invariant.
- Lint/type assertion cleanup is ongoing but outside the immediate scope—do not regress.

**Immediate Objectives (Phase 2 Part 1)**

1. **Foundation & Guardrails (Session 1 – complete, guard red until cleanup)**
   - Inventory captured in `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` Session 1 notes (CLI, programmatic API, dependency graph expectations).
   - Scalar stack (`@scalar/json-magic@0.7.0`, `@scalar/openapi-parser@0.23.0`, `@scalar/openapi-types@0.5.1`) pinned in `lib/package.json` with updated lockfile.
   - Guard lives in `lib/src/validation/scalar-guard.test.ts` with dedicated config; run via `pnpm --filter openapi-zod-validation test:scalar-guard` (currently failing by design until legacy imports removed).

2. **Loading & Bundling**
   - Implement `loadOpenApiDocument` via `@scalar/json-magic/bundle`, enabling `readFiles()`/`fetchUrls()` plugins.
   - Configure lifecycle hooks to preserve internal `$ref`s and consolidate externals under `x-ext`.
   - Persist bundle metadata (filesystem entries, entrypoint filename, warnings) for downstream consumers.

3. **Validation & Transformation**
   - Implement `validateOpenApiWithScalar`, wrapping `openapi-parser.validate/sanitize/upgrade`.
   - Translate AJV errors into our existing CLI/programmatic error format and add characterisation coverage.

4. **Normalization & Types**
   - Define `PreparedOpenApiDocument` (Scalar `OpenAPI.Document` + `openapi3-ts` `OpenAPIObject` + bundle metadata).
   - Update dependency graph, conversion, and templating layers to accept the wrapper without consuming `x-ext` by default.

5. **Integration & Cleanup**
   - Replace `prepareOpenApiDocument` with the orchestrated pipeline (keep a feature flag during rollout).
   - Refresh README/API docs to describe new options (`--sanitize`, `--upgrade`) and error semantics.
   - Remove SwaggerParser dependency once parity is proven; log follow-up enhancements (partial bundling, json-magic cache tuning, etc.).

**Execution Checklist**

```bash
cd /Users/jim/code/personal/openapi-zod-client
pnpm check      # ensure green before starting
```

For every task:

1. Read the corresponding subsection in `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`.
2. Follow TDD strictly: write failing tests → confirm failure → implement minimal code → confirm success → refactor.
3. Maintain comprehensive TSDoc for new/changed APIs.
4. Run `pnpm check` (or the specific commands listed in the plan) after each milestone.
5. Capture notes for any deviations or manual validation runs.

**Non-Negotiables (from `.agent/RULES.md`)**

- TDD is mandatory—no implementation without failing tests first.
- Public APIs require full TSDoc with examples; internal helpers must include `@param/@returns/@throws`.
- No defensive programming; rely on Scalar pipeline for validation and fail fast with helpful errors.
- Prefer type predicates over assertions; document any unavoidable `as`.
- Keep quality gates green at all times.

**Definition of Done for Part 1**

- `loadOpenApiDocument`, `validateOpenApiWithScalar`, and `PreparedOpenApiDocument` implemented with exhaustive tests.
- CLI and programmatic APIs exclusively use the new pipeline (legacy path removed after feature-flagged rollout).
- README/API docs updated; examples highlight Scalar validation, sanitisation, and upgrade options.
- SwaggerParser dependency removed from production code.
- Quality gates and characterisation suites pass; manual smoke tests documented.

Use this prompt to rehydrate context whenever you resume Phase 2 Part 1 work.
