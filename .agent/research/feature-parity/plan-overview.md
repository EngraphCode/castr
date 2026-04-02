# High-Level Plan Overview

> [!IMPORTANT]
> This is a historical research document. Its "Phase N" labels are NOT the same as the roadmap phases in `.agent/plans/roadmap.md`.
> For canonical phases and execution, see `.agent/plans/roadmap.md`, `.agent/plans/future/phase-5-ecosystem-expansion.md`, and `docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md`.

## Enablement Step 0: Alignment and boundary hygiene

- Keep the roadmap, Phase 5 companion-workspace plan, and ADR-043 explicit as the source of truth.
- Do not introduce an Oak-specific strictness profile; strictness and determinism are core doctrine, not target-specific presets.
- Keep the bundle-manifest question explicit and subordinate to proven need.

Exit criteria:

- Goals documented and aligned.
- Boundary placement is explicit.
- Bundle manifest scope is either agreed or clearly parked as TBD.

## Enablement Step 1: Core compiler enablement for Oak adapter replacement

- Preserve the already-aligned strict-by-default output posture in core.
- Path format option with colon format support (default curly; no compatibility adapters).
- Emit operationId field + required metadata (maps or helper APIs), pending final option choice.
- IR-first outputs; TypeScript code rendering handled via ts-morph AST (separate from IR). Avoid string-first APIs; only print strings via ts-morph when unavoidable.
- Replace missing-schema fallbacks with errors in strict mode.
- Bundle manifest output for fixture verification (schema internal and flexible) — **TBD**, needs validation with Oak.
- All generated outputs must be **rule-compliant** (no `as` except `as const`, no `Object.*`, no stringified schema APIs).

Exit criteria:

- Oak fixtures pass `verify-castr-fixtures.ts`.
- Deterministic output across runs.

## Enablement Step 2: Core output completion around settled formats

- Land OAS 3.2 version plumbing as the canonical OpenAPI target.
- Emit JSON Schema for response maps (inline refs) without exposing brittle public API contracts.
- Stabilize deterministic ordering and schema registry / naming hooks where Oak consumption depends on them.

Exit criteria:

- OpenAPI output from Zod passes validation.
- Response map JSON Schemas validated.
- OAS 3.2 target truth is consistent across the live plan stack.

## Enablement Step 3: Companion code-first/workspace enablement (oak-openapi parity)

- Build a companion tRPC or equivalent authored-operation ingestion layer with `meta.openapi` extraction.
- Decide whether runtime route exposure stays external or moves into a lightweight companion workspace.
- Feed the core OpenAPI writer from that companion layer rather than turning code-first authoring into a core `lib` format promise.
- Map security metadata and tags into OpenAPI output through that companion layer.

Exit criteria:

- An `oak-openapi`-style codebase can publish OpenAPI without `trpc-to-openapi`.
- Runtime exposure is either documented as composition or owned by a companion workspace.

## Enablement Step 4: openapi-ts best parts (optional enhancements)

- Plugin-style output orchestration and watch mode where they help core and companion workflows without widening core scope.
- Registry input adapters.
- Media-type selection policies.

Exit criteria:

- Optional DX improvements land without breaking strict defaults.

## Enablement Step 5: Hardening

- Round-trip tests for OpenAPI <-> IR <-> OpenAPI.
- Expanded determinism tests (hash-stable output).
- Performance benchmarks for large specs.
