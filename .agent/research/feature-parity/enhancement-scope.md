# Enhancement Scope (Layered)

This scope is organized by architectural layer so it stays aligned with `.agent/plans/roadmap.md`, `.agent/plans/future/phase-5-ecosystem-expansion.md`, and `docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md`.

## Already aligned in core

1. **Strict-by-default output**
   - Strict object emission is already core doctrine.
   - No Oak-specific strictness preset should be introduced.

2. **Rule-compliant generation**
   - Core outputs should stay IR-first.
   - No `as` assertions (except `as const`), no `Object.*` / `Reflect.*`, and no stringified schema APIs.

3. **No compatibility layers**
   - Core should enable Oak workflows without mirroring legacy adapter shapes.

## Must for the core compiler boundary

1. **OAS 3.2 canonical target**
   - Complete version plumbing so OpenAPI output, docs, and validation criteria target 3.2.0.

2. **Path format option (colon vs curly)**
   - Add a boolean switch for colon paths; default stays **curly**. Apply consistently to endpoints, helpers, and maps.

3. **OperationId visibility and maps**
   - Emit `operationId` on endpoints.
   - Provide **either** explicit maps **or** Zod-first enablement (option TBD; revisit when Oak workflow is clearer).

4. **Strict failure on missing schemas**
   - Replace `createEmptySchema()` fallback in strict mode with explicit errors and context.

5. **JSON Schema emission for MCP / response maps**
   - Provide fully inlined JSON Schema for responses and parameters.
   - Align schema dialect with MCP requirements while keeping the IR canonical.

6. **Deterministic ordering guarantees**
   - Stabilize sorting for endpoints, responses, and property order in writers.

7. **Schema registry + naming hooks**
   - Provide stable registry surfaces for component and response schemas.
   - Support sanitization / naming hooks where downstream tooling depends on stable names.

8. **Bundle manifest output**
   - TBD — validate whether a manifest adds material value before promoting it into a core promise.

## Must for companion workspaces / code-first publishing

1. **Authored-operation ingestion**
   - Parse tRPC or equivalent authored-operation sources with `meta.openapi`-style metadata into IR operations.
   - Extract Zod input/output and security metadata there rather than redefining tRPC as a core format.

2. **OpenAPI publishing from companion inputs**
   - Feed the core OpenAPI writer from that companion layer.
   - Keep the published document target aligned with the core OAS 3.2 output surface.

3. **Runtime exposure decision**
   - Either provide a lightweight companion adapter to replace `createOpenApiFetchHandler`-style value, or document a clean composition path with external runtime tooling.

4. **Zod metadata ingestion for code-first flows**
   - Parse `.meta()` / `.openapi()` when they are part of a code-first publishing flow.
   - Keep the public contract centred on IR and emitted artefacts, not ad-hoc framework APIs.

## Should for openapi-ts best parts (ethically inspired)

1. **Plugin-style output orchestration**
   - Allow multiple outputs from a single run (Zod + TS + OpenAPI + MCP) without widening the core package into a runtime framework.

2. **Watch mode**
   - CLI watch regeneration for fast iteration in large repos.

3. **Registry input adapters**
   - Optional support for registry inputs (e.g., Hey API / Scalar / ReadMe).

4. **Transform/patch hooks (opt-in)**
   - Controlled pre-parse transforms with provenance reporting.

## Nice-to-have / long tail

- Richer CLI UX (scaffold layouts, lintable output, templating presets)
- Automated fixture synthesis and fuzzing for edge cases
- Cross-format diff tooling (IR-level semantic diffs)
