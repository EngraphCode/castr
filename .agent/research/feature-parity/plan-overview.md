# High-Level Plan Overview

## Phase 0: Alignment and instrumentation

- Document current goals (README + VISION updates).
- Add a dedicated "Oak profile" or config preset for strictness + determinism.
- Define bundle manifest shape and CLI output path.

Exit criteria:

- Goals documented and aligned.
- Bundle manifest spec agreed.

## Phase 1: Oak Phase 1 enablement (blocking)

- Strict-by-default Zod output.
- Path format option with colon format support (default curly; no compatibility adapters).
- Emit operationId field + required metadata (maps or helper APIs), pending final option choice.
- IR-first outputs; TypeScript code rendering handled via ts-morph AST (separate from IR). Avoid string-first APIs; only print strings via ts-morph when unavoidable.
- Replace missing-schema fallbacks with errors in strict mode.
- Bundle manifest output for fixture verification (schema internal and flexible) — **TBD**, needs validation with Oak.
- All generated outputs must be **rule-compliant** (no `as` except `as const`, no `Object.*`, no stringified schema APIs).

Exit criteria:

- Oak fixtures pass `verify-castr-fixtures.ts`.
- Deterministic output across runs.

## Phase 2: Zod -> OpenAPI + JSON Schema outputs

- Extend Zod parser to ingest `.meta()` / `.openapi()` annotations.
- Build Zod source -> IR document (schemas + endpoints) pipeline.
- Emit OpenAPI 3.1 output from Zod-derived IR.
- Emit JSON Schema for response maps (inline refs) without exposing brittle public API contracts.

Exit criteria:

- OpenAPI output from Zod passes validation.
- Response map JSON Schemas validated.

## Phase 3: tRPC -> IR integration (oak-openapi parity)

- Build tRPC router parser with `meta.openapi` extraction.
- Provide minimal HTTP adapter (or documented pattern) replacing `createOpenApiFetchHandler`.
- Map security metadata and tags into OpenAPI output.

Exit criteria:

- `tmp/oak-openapi` can generate and serve OpenAPI without trpc-to-openapi.

## Phase 4: openapi-ts best parts (optional enhancements)

- Plugin-style output orchestration and watch mode.
- Registry input adapters.
- Media-type selection policies.

Exit criteria:

- Optional DX improvements land without breaking strict defaults.

## Phase 5: Hardening

- Round-trip tests for OpenAPI <-> IR <-> OpenAPI.
- Expanded determinism tests (hash-stable output).
- Performance benchmarks for large specs.
