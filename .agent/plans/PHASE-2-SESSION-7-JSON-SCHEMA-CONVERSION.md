# Phase 2 Session 7 – JSON Schema Conversion Engine

**Status:** Complete (Phase 2 Part 2)  
**Estimated Effort:** 8-10 hours (Conversion: 5-6h, Security: 2-3h, Infrastructure: 1-2h)  
**Parent Plan:** [PHASE-2-MCP-ENHANCEMENTS.md](./PHASE-2-MCP-ENHANCEMENTS.md) § "Session 7 – JSON Schema Conversion Engine"  
**Standards:** Must comply with [.agent/RULES.md](../RULES.md) (TDD, library types only, zero escape hatches)

---

## Session Objectives

- Implement the OpenAPI → JSON Schema Draft 07 conversion layer that runs in parallel with existing Zod/TypeScript converters.
- **Surface upstream API security metadata (Layer 2)** for MCP server implementers—NOT MCP protocol auth (Layer 1, handled by MCP SDK).
- Establish validation tooling (unit tests, integration fixtures, AJV Draft 07 assertions) to prove the converter is spec-compliant and production ready.
- Maintain full alignment with existing architecture: Scalar-normalised OpenAPI 3.1 docs, preserved `$ref` semantics, ESM-only pure-function design.

## Status

- Workstream A (conversion core): ✅ Implementation + tests landed; AJV `Schema` type now used across the converter (custom `Draft07Schema` removed).
- Workstream B (security metadata): ✅ Extraction utilities and tests complete.
- Workstream C (validation tooling): ✅ AJV harness, integration + characterisation coverage in place.
- **Status:** Helper refactor completed (no type assertions, no `Reflect.*`), permissive fallback implemented, security extractor hardened, integration coverage expanded. Snapshot harness now loads both official and custom fixtures and asserts presence of the multi-auth scenario.
- Validation status: Full quality suite (`format`, `build`, `lint`, `type-check`, `test:all`, `character`) rerun on Nov 6, 2025 — all green.
- Manual verification (Nov 6, 2025 18:05): Generated Draft 07 output for `Pet` in `petstore-expanded.yaml` via `tsx --eval`; confirmed `allOf` rewrite to `#/definitions/NewPet`, `id` requirement preservation, and AJV acceptance for both `Pet` composite and inline `NewPet`.
- Documentation updates (Nov 6, 2025 18:20): Recorded outcomes across `context.md`, `HANDOFF.md`, `continuation_prompt.md`, and `PHASE-2-MCP-ENHANCEMENTS.md`.
- **Process reminder:** Every future change for this session should continue to run the full quality suite after targeted checks; lint rules remain non-negotiable.

### Parallel Converter Architecture

This converter runs **independently** alongside existing converters:

- `lib/src/conversion/typescript/` - TypeScript type generation
- `lib/src/conversion/zod/` - Zod schema generation
- `lib/src/conversion/json-schema/` - JSON Schema Draft 07 (NEW)

**Independence:** Each converter operates on the same `BundledOpenApiDocument` but produces different outputs. No shared state or cross-dependencies.

## Desired Impact

- MCP tool generation (Session 8) can consume deterministic Draft 07 schemas and rich security data without additional preprocessing.
- Downstream consumers trust generated artifacts; conversion bugs are caught by the new test suites and AJV validation.
- No regressions in existing Zod/TypeScript pipelines; converters evolve independently but share a single source OpenAPI document.

## Global Acceptance Criteria

- All new code follows TDD (tests written before implementation, failures observed, then green).
- No custom type aliases when a library type exists—reuse `openapi3-ts/oas31`, `@modelcontextprotocol/sdk/types.js`, and project utility types only.
- Pure functions wherever possible; side effects isolated and tested explicitly.
- No type assertions (`as`, `any`, `!`, `Record<string, unknown>`) unless unavoidable and justified with tests.
- Quality gates remain green: `pnpm format`, `pnpm lint`, `pnpm build`, `pnpm type-check`, `pnpm test:all`, `pnpm character`.

---

## Workstream A – JSON Schema Conversion Core

**Goal:** Produce a converter in `lib/src/conversion/json-schema/` that maps OpenAPI 3.1 Schema Objects to JSON Schema Draft 07 documents.

### Desired Impact

- Guarantees MCP manifests have spec-compliant Draft 07 schemas with preserved validation semantics (nullable arrays, exclusive bounds, refs).
- Enables future reuse (CLI flags, documentation examples) without additional conversion steps.

### Implementation Pattern (from Session 6)

Follow Session 6's proven approach:

- Pure extractor functions (e.g., `convertPrimitiveSchema()`, `convertObjectSchema()`, `convertArraySchema()`)
- Data-driven approach for reduced complexity
- Type guards for narrowing (no type assertions)
- Orchestrator function (`convertSchema()`) delegates to specific converters
- Comprehensive unit tests with TDD (RED → GREEN → REFACTOR)

### Type System: AJV Library Types (REQUIRED)

**Decision:** Use AJV's `Schema` type throughout, NOT custom `Draft07Schema` interface.

**Current State (Non-Compliant):**

```typescript
// lib/src/conversion/json-schema/draft07-schema.ts
export interface Draft07Schema {
  // ❌ Custom type
  $ref?: string;
  type?: string | string[];
  // ... 30+ specific properties
}
```

**Required State (RULES.md Compliant):**

```typescript
import { type Schema as JsonSchema } from 'ajv';

// Use AJV's library type ✅
function convertSchema(schema: SchemaObject): JsonSchema {
  // JsonSchema = SchemaObject | boolean
  // SchemaObject has [x: string]: any for extensibility
}
```

**Rationale (Aligned with RULES.md):**

1. **"Use library types and type guards everywhere. Custom types are forbidden."** (RULES.md line 460)
   - AJV provides `Schema` and `SchemaObject` types for JSON Schema
   - Our custom `Draft07Schema` violates this rule
   - Already using `JsonSchema` in test-utils.ts (inconsistency)

2. **"Defer Type Definitions to Source Libraries"** (RULES.md line 459-587)
   - AJV is the validation library we're using
   - AJV's types are maintained by JSON Schema domain experts
   - Reduces maintenance burden (no type drift)

3. **Type Safety Trade-off Justified:**
   - AJV's `SchemaObject` has `[x: string]: any` (intentionally loose)
   - JSON Schema Draft 07 allows additional/vendor-specific properties
   - The looseness reflects reality: schemas ARE extensible
   - Runtime validation (via AJV) catches invalid schemas, not compile-time types

4. **Validation Strategy:**
   - Use type guards for runtime narrowing where needed
   - AJV validation (already implemented) is the source of truth
   - Tests verify behavior, not compile-time types
   - Follows "validate external boundaries" principle (RULES.md line 819)

**Implementation:**

- Replace all 34 usages of `Draft07Schema` with `import { type Schema as JsonSchema } from 'ajv'`
- Update TSDoc: "Uses AJV's Schema type (intentionally loose with [x: string]: any) to reflect JSON Schema extensibility. Runtime validation via AJV ensures correctness."
- Delete `lib/src/conversion/json-schema/draft07-schema.ts`
- Update imports across: `keyword-appliers.ts`, `convert-schema.ts`, `index.ts`

**Why NOT keep custom type:**

- Violates explicit RULES.md mandate: "Custom types are forbidden"
- Creates maintenance burden (type drift from AJV updates)
- False sense of compile-time safety (AJV validation is source of truth anyway)
- Inconsistent with rest of codebase (Session 6 uses library types exclusively)

### Example Conversion

**Input (OpenAPI 3.1 Schema):**

```typescript
{
  type: ['string', 'null'],
  minLength: 1,
  maxLength: 255,
  pattern: '^[a-z]+$',
  description: 'Username',
  examples: [{ value: 'alice' }]
}
```

**Output (JSON Schema Draft 07):**

```json
{
  "anyOf": [
    {
      "type": "string",
      "minLength": 1,
      "maxLength": 255,
      "pattern": "^[a-z]+$"
    },
    { "type": "null" }
  ],
  "description": "Username",
  "examples": ["alice"]
}
```

### Acceptance Criteria

- Supports primitives, objects, arrays/tuples, compositions (`allOf`, `anyOf`, `oneOf`, `not`), and boolean schemas.
- Converts OpenAPI-specific keywords to Draft 07 equivalents:
  - Type arrays for nullable: `type: ['string', 'null']` → `anyOf: [{type: 'string'}, {type: 'null'}]`
  - Numeric exclusive bounds: `exclusiveMinimum: true` → `exclusiveMinimum: <value>`
  - Examples format: `examples: [{value: 'x'}]` → `examples: ['x']`
- Rewrites internal `$ref` targets:
  - `#/components/schemas/Pet` → `#/definitions/Pet`
  - Preserves `#/components/parameters/*`, `#/components/responses/*` (if encountered)
  - External refs already resolved by Scalar (no rewriting needed)
  - Circular refs: preserve structure (MCP handles cycles at runtime)
- Strips / adapts unsupported 2020-12 keywords (`$vocabulary`, `$dynamicRef`, `unevaluated*`, `prefixItems`) per JSON Schema conversion analysis.
- Preserves informative metadata (`description`, `examples`, `default`, `readOnly`, `writeOnly`, `format`).
- Module exports are ESM, composed of pure functions with exhaustive unit coverage.

### Error Handling Strategy

- **Invalid schemas:** Log warning, emit permissive schema (`{}` or `true` boolean schema)
- **Unsupported features:** Log warning, strip unsupported keywords
- **Missing references:** Throw error (should never happen after Scalar bundling validates)
- **Test coverage:** Unit tests verify all error paths with appropriate assertions

### Test Fixtures

Use existing fixtures upgraded to 3.1 by Scalar pipeline:

- `lib/examples/openapi/v3.1/tictactoe.yaml` - Simple 3.1 spec
- `lib/examples/openapi/v3.0/petstore-expanded.yaml` - Multi-schema (auto-upgraded to 3.1)
- `lib/examples/openapi/multi-file/main.yaml` - External refs (already resolved)
- Create new: `lib/examples/custom/openapi/v3.1/multi-auth.yaml` - All security scheme types

### Definition of Done

- Converter implementation lives under `lib/src/conversion/json-schema/` with index barrel exporting public API.
- Unit tests cover each conversion branch (primitives, arrays, objects, compositions, references, edge cases like boolean schemas).
- Integration tests convert representative fixtures (petstore-expanded, tictactoe) and snapshot results.
- AJV Draft 07 validation harness confirms generated schemas are valid (no ignored errors).
- Documentation comments (TSDoc) describe public functions and reference conversion strategy decisions.

### Validation Steps

1. `pnpm test -- run src/conversion/json-schema/*.test.ts` (unit tests – expect RED → GREEN sequence).
2. `pnpm test -- run src/conversion/json-schema/integration/*.test.ts` (fixture conversions + snapshots).
3. `pnpm test -- run src/conversion/json-schema/ajv-validation.test.ts` (AJV meta-schema validation).
4. `pnpm lint` (includes complexity thresholds).
5. `pnpm type-check`.

### References

- `.agent/analysis/JSON_SCHEMA_CONVERSION.md`
- `.agent/architecture/OPENAPI-3.1-MIGRATION.md`
- `.agent/architecture/SCALAR-PIPELINE.md`

---

## Workstream B – Security Metadata Extraction

**Goal:** Implement security resolution utilities that map OpenAPI security schemes/requirements to MCP-ready metadata.

### ⚠️ CRITICAL DISTINCTION: Two-Layer Authentication Model

**What we ARE extracting (Layer 2 - Upstream API):**

- Authentication defined IN the OpenAPI spec (`components.securitySchemes`, operation `security`)
- OAuth 2.0/1.0, Bearer tokens, API keys, HTTP auth (Basic/Digest), OpenID Connect
- **Purpose:** Document for MCP server implementers how to authenticate to the upstream API
- **Example:** "This tool requires OAuth 2.0 with `read:users` scope to call GitHub's /users endpoint"

**What we are NOT extracting (Layer 1 - MCP Protocol):**

- OAuth 2.1 between MCP client and MCP server
- **Reason:** Defined by MCP specification, not in OpenAPI specs
- **Handled by:** MCP SDK and server runtime automatically

**Visual:**

```
MCP Client  →  [OAuth 2.1]  →  MCP Server  →  [OpenAPI Auth]  →  Upstream API
               (Layer 1)                        (Layer 2 ✅)
               NOT in OpenAPI                   WE EXTRACT THIS
               (MCP spec handles)               (from OpenAPI spec)
```

**Reference:** See `.agent/analysis/SECURITY_EXTRACTION.md` § "Two-Layer Authentication Model" for complete details.

### Desired Impact

- MCP tool docs communicate upstream API authentication (Layer 2) clearly, reducing integration friction for server implementers.
- Session 8 can inject security summaries into manifests without re-parsing OpenAPI specs.
- MCP server implementers understand they need to configure credentials for the UPSTREAM API, not the MCP protocol.

### Acceptance Criteria

- Security resolver reads **upstream API** `components.securitySchemes` (Layer 2), root `security`, and operation-level overrides.
- Handles OAuth 2 flows (all variants), API keys, HTTP auth (basic, digest, bearer), OpenID Connect, and explicit `security: []` public endpoints.
- Outputs structured metadata using library types from `openapi3-ts/oas31`:
  - Use `SecuritySchemeObject` directly (no custom SecurityMetadata type)
  - Use `SecurityRequirementObject` for operation requirements
  - Add helper to determine if operation is public (`security: []`)
- Warns (or flags) when specs omit referenced schemes or lack authentication info.
- Generates documentation snippets / data structures aligned with Session 5 security templates.

### Security Metadata Output Format

Per-operation security summary structure (using library types only):

```typescript
{
  // Direct from OpenAPI spec (library types)
  schemes: SecuritySchemeObject[],           // from components.securitySchemes
  requirements: SecurityRequirementObject[], // from operation.security or root security

  // Computed helpers (no custom types)
  isPublic: boolean,                         // true if security: []
  requirementLogic: 'all' | 'any'            // AND vs OR based on SecurityRequirementObject structure
}
```

### Definition of Done

- Security utilities live under `lib/src/conversion/json-schema/security/` and export public resolvers via the json-schema barrel.
- Unit tests cover each scheme type and override scenario (global default, per-operation override, public endpoints).
- Integration tests run against multi-scheme fixture (`custom/openapi/v3.1/multi-auth.yaml` created in this session).
- Outputs integrate with existing parameter metadata (no duplication of type definitions).
- TSDoc for security utilities MUST include:
  - ⚠️ Warning: "Extracts upstream API auth (Layer 2), NOT MCP protocol auth (Layer 1)"
  - Reference to `.agent/analysis/SECURITY_EXTRACTION.md` two-layer model
  - Example showing what gets extracted vs what doesn't
- Module exports use library types only (`SecuritySchemeObject`, `SecurityRequirementObject`).

### Validation Steps

1. `pnpm test -- run src/conversion/json-schema/security/*.test.ts` (unit cases via TDD).
2. `pnpm character -- filter security` (or equivalent characterization suite updated with new expectations).
3. Manual review of generated metadata for representative specs (record in session notes).
4. `pnpm lint`, `pnpm type-check`.

### References

- `.agent/analysis/SECURITY_EXTRACTION.md`
- `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md`
- `.agent/context/continuation_prompt.md` (Session 6 achievements + constraints)

---

## Workstream C – Cross-Cutting Validation & Infrastructure

**Goal:** Provide shared helpers, fixtures, and tooling so Workstreams A and B can validate outputs consistently.

### Desired Impact

- Shared AJV Draft 07 instance prevents duplicated setup and ensures consistent validation.
- Fixture loaders align with Scalar bundle output and `makeSchemaResolver()` expectations.

### Acceptance Criteria

- Add AJV Draft 07 helper (`createDraft07Validator()`) in `lib/src/conversion/json-schema/test-utils.ts`.
- Extend existing fixture utilities to serve scalar-bundled documents to the new tests.
- Characterisation tests capture end-to-end conversion (OpenAPI doc → JSON Schema + security metadata snapshot).
- Document how to add new fixtures / tests in inline TSDoc comments.

### Definition of Done

- Shared helpers in `lib/src/conversion/json-schema/test-utils.ts` with comprehensive TSDoc:
  - `createDraft07Validator()` - returns configured AJV instance
  - `validateJsonSchema()` - validates a schema against Draft 07 meta-schema
  - Rationale: Keep test utilities close to the code they test (Session 6 pattern)
- Snapshot fixtures stored under `lib/tests-snapshot/json-schema/`.
- Characterization tests extend `lib/src/characterisation/input-pipeline.char.test.ts` with JSON Schema assertions.
- CI scripts require no updates; `pnpm test:all` automatically runs new suites.

### Validation Steps

1. `pnpm test:all` (full suite).
2. `pnpm character` (ensures new snapshots included).
3. Spot-check generated JSON against MCP schema (manual note).

### References

- Existing `lib/src/characterisation/*.char.test.ts`
- `.agent/context/context.md` (Session 6 test coverage expectations)

---

## Reporting & Documentation

- Update `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` upon session completion to mark acceptance criteria delivered and reference this document.
- Log progress, blockers, and validation outcomes in `.agent/context/context.md` and `.agent/context/continuation_prompt.md` per documentation system rules.
- Capture lessons learned or deviations (if any) in the “Session 7” section of `continuation_prompt.md`.

---

## Rule Alignment Checklist

- [x] TDD observed for every change (test RED → implementation → GREEN).
- [x] Library types only; no custom replacements for OpenAPI or MCP SDK types.
- [x] **AJV's `Schema` type used throughout (NOT custom `Draft07Schema`)** - 34 usages migrated.
- [x] No type escape hatches or widened types.
- [x] Pure functions / deterministic behavior validated.
- [x] Comprehensive TSDoc for all exported APIs.
- [x] Quality gates (`pnpm format`, `pnpm lint`, `pnpm build`, `pnpm type-check`, `pnpm test:all`, `pnpm character`) passing prior to completion.

---

## Session Closure Criteria

- All acceptance criteria in Workstreams A–C satisfied.
- Validation steps executed with documented results.
- Documentation and plan updates completed.
- Session 7 marked complete in parent plan and next actions queued for Session 8.

**Session Outcome Summary (Nov 6, 2025 18:20):**

- Conversion engine + security extraction shipped with full test coverage (unit, integration, characterization, snapshots).
- Samples snapshot harness enforces inclusion of custom multi-auth fixture; snapshots regenerated.
- Manual Draft 07 inspection (`pnpm --filter @oaknational/openapi-to-tooling exec tsx --eval "<petstore inspection script>"`) confirmed `Pet` schema conversion and AJV validation.
- All contextual documents updated (`context.md`, `HANDOFF.md`, `continuation_prompt.md`, parent plan) — handoff ready for Session 8 kickoff.
