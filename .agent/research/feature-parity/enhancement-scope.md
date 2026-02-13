# Enhancement Scope (Depth-First)

This scope is organized as "must for parity", "should for replacement viability", and "nice-to-have". It synthesizes Oak contract requirements, openapi-ts best practices, and oak-openapi dependency replacement needs.

## Must for Oak Phase 1 enablement (blocking)

1. **Strict-by-default output profile**
   - Enforce `.strict()` on all object schemas for Oak outputs.
   - Remove implicit `.passthrough()` unless explicitly requested.

2. **Path format option (colon vs curly)**
   - Add a boolean switch for colon paths; default stays **curly**. Apply consistently to endpoints, helpers, and maps.

3. **OperationId visibility and maps**
   - Emit `operationId` on endpoints.
   - Provide **either** explicit maps **or** Zod-first enablement (option TBD; revisit when Oak workflow is clearer).

4. **Schema rendering without string-first APIs (preferred)**
   - Provide IR-first exports; keep code emission separate and handled via ts-morph writers/AST when generating TypeScript.
   - Avoid string-based schema APIs; if strings are unavoidable, generate via ts-morph printers only.

5. **Rule-compliant generation**
   - No `as` assertions (except `as const`), no `Object.*` / `Reflect.*`, no stringified schema outputs.

6. **Strict failure on missing schemas**
   - Replace `createEmptySchema()` fallback in strict mode with explicit errors and context.

7. **Bundle manifest output**
   - TBD — validate whether a manifest adds material value before committing to a shape.

## Should for Oak Phase 2 and broader replacement viability

1. **JSON Schema emission for MCP/response maps**
   - Provide fully inlined JSON Schema for responses and parameters.
   - Align schema dialect with MCP spec requirements (currently 2020-12 default).

2. **Deterministic ordering guarantees**
   - Stabilize sorting for endpoints, responses, and property order in writers.

3. **Schema registry + naming hooks**
   - Stable registry of component schemas and named response schemas.
   - Naming hooks for sanitization and output compatibility.

4. **Media-type selection policy**
   - Configurable choice for primary response schema when multiple content types exist.

## Must for `tmp/oak-openapi` replacement (trpc-to-openapi / zod-openapi)

1. **tRPC -> IR parser**
   - Parse tRPC routers with `meta.openapi` into IR operations.
   - Extract Zod input/output and security metadata.

2. **OpenAPI writer coverage for tRPC-derived IR**
   - Generate OpenAPI 3.1 docs from IR.

3. **HTTP handler integration (thin wrapper)**
   - Provide a minimal adapter to replace `createOpenApiFetchHandler` or document a composition path.

4. **Zod metadata ingestion**
   - Parse `.meta()` / `.openapi()` from Zod to IR metadata for docs, but expose it via IR outputs instead of prescribing a public API shape.

## Should for openapi-ts best parts (ethically inspired)

1. **Plugin-style output orchestration**
   - Allow multiple outputs from a single run (Zod + TS + OpenAPI + MCP).

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
