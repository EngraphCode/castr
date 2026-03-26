# JSON Schema & Parity Acceptance Criteria

> Durable target-state acceptance criteria for the JSON Schema and parity workstream.
> Historical planning context lives in `.agent/plans/current/complete/phase-4-json-schema-and-parity.md`.

> [!IMPORTANT]
> Current implementation note (2026-03-26): Pack 4 and Pack 7 both closed `red`, but subsequent work has
> significantly addressed the gaps:
>
> - `parseJsonSchemaDocument()` is now a full Draft 07 / 2020-12 document parser with standalone round-trip proofs
> - Unsupported keywords are explicitly rejected via `UnsupportedJsonSchemaKeywordError`
> - `patternProperties`, `propertyNames`, `prefixItems`, and `contains` are fully supported in the IR and all relevant writers
> - `contains` is removed from the rejection list; only `if`/`then`/`else` and `$dynamicRef` remain unsupported
>
> Treat this file as target doctrine, with significant progress toward full coverage.

---

## 1. Lossless Translation (JSON Schema ↔ IR ↔ Zod)

### JSON Schema Input Parsing

- **Format Support:** The parser MUST accept JSON Schema Draft 07 and 2020-12.
- **Strict Normalization:**
  - Draft 07 constructs MUST be losslessly normalized to the 2020-12 compatible IR (e.g., `dependencies` → `dependentRequired`/`dependentSchemas`, tuple `items` array → `prefixItems`, `definitions` → local references).
- **No Tolerances:** Unsupported keywords or extensions MUST throw explicit, actionable errors. No silent bypassing.

### JSON Schema Output Generation

- **Format Emitted:** The writer MUST emit valid JSON Schema 2020-12 from the IR.
- **Completeness:** ALL fields represented in the IR (including `unevaluatedProperties`, `prefixItems`, `const`, `dependentSchemas`) MUST be written to the output correctly.
- **Structure Options:** The writer MUST support emitting both standalone self-contained schemas and bundled schemas (relying on `$defs` or `components.schemas`).

### Zod Mapping Constraints

- **Strict Bounds:** Zod does not natively support all JSON Schema constraints (e.g., `unevaluatedProperties`, `patternProperties` with arbitrary regex boundaries, complex `dependentRequired`).
  - Where lossy mapping from IR to Zod is unavoidable, the system MUST throw an error UNLESS explicit metadata directs a fallback behavior.
  - Zod `.refine()` or custom checks that originate in Zod MUST NOT be lossily translated to JSON Schema. They must either be safely translated using `.openapi()`/`.meta()` annotations or throw an error.

---

## 2. Feature Parity & Idempotence Proofs

### Fixture Matrix

The test suite MUST include explicit test fixtures that prove idempotence and correct translation for the following high-value edge cases:

- **Composition & Discriminators:** Complex `oneOf`/`anyOf` structures, specifically proving that Zod's `z.discriminatedUnion` and `z.union` are correctly inferred back into standard JSON schema constraints.
- **Nullability & Optionality:** Exact mapping of Zod `.nullable().optional()` vs JSON Schema `type: ["...", "null"]` without losing intent.
- **Recursion:** Complex circular `$ref` cycles MUST be handled gracefully (e.g., generating canonical getter-based recursion for Zod output and valid `$dynamicRef` / `$ref` graphs) or throw explicitly with cycle paths.

### Transform Validation

- **Idempotence:** Every JSON Schema input fixture parsed into IR and written back out to JSON Schema MUST be byte-for-byte identical to a normalized baseline.
- **Zod Round-trip:** Zod -> IR -> JSON Schema -> IR -> Zod MUST NOT drop `strict()` constraints or literal metadata.

---

## 3. "Done" State: Downstream SDK & MCP Integration

### The "Multi-Cast" Requirement (Universal Validation Bundler & MCP)

- **Simultaneous Output:** The system MUST be capable of generating multiple output formats from a _single, canonical IR instance_. This "multi-cast" approach is critical.
- **Universal Endpoint (Oak):** The system MUST be capable of generating the required artifacts for a `/schemas` endpoint simultaneously:
  - Stringified Zod source code (e.g. `export const schema = z.object(...)`)
  - Generative JSON Schema definitions (`{ "type": "object", ... }`)
  - TypeScript interfaces
- **Strict-by-default:** Output from Castr for Oak MUST default to `.strict()` object generation. Unknown keys are a hard failure.

### MCP (Model Context Protocol) Support

- **Synchronized Tool Definitions:** For MCP tool generation, the system MUST be able to output correctly mapped, tandem representations of a tool's parameters:
  - JSON Schema (for `inputSchema` sent to the LLM).
  - Zod (for validating the LLM's raw response at runtime).
  - TypeScript types (for the developer writing the tool handler).
- **Stability:** Deterministic object key ordering MUST applied to ensure that generated JSON Schema representations hash consistently across builds.

---

## 4. Quality Gates

- **Tests First:** All new parsing logic for Draft 07/2020-12 MUST have TDD proofs.
- **No Hacks:** No non-const type assertions, `any`, or `eslint-disable` in the implementation of the new parsers.
- **Zero Parse Errors:** Transform validation suites MUST assert zero parse errors before checking downstream structural integrity.
