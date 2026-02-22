# JSON Schema & Parity Acceptance Criteria (Phase 4)

> Detailed acceptance criteria for the Phase 4 JSON Schema support and Parity workstream. Refers to `.agent/plans/future/phase-4-json-schema-and-parity.md` and ecosystem analysis research.

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
- **Recursion:** Complex circular `$ref` cycles MUST be handled gracefully (e.g., generating `z.lazy(() => ...)` and valid `$dynamicRef` / `$ref` graphs) or throw explicitly with cycle paths.

### Transform Validation

- **Idempotence:** Every JSON Schema input fixture parsed into IR and written back out to JSON Schema MUST be byte-for-byte identical to a normalized baseline.
- **Zod Round-trip:** Zod -> IR -> JSON Schema -> IR -> Zod MUST NOT drop `strict()` constraints or literal metadata.

---

## 3. "Done" State: Downstream SDK & MCP Integration

### Oak Curriculum API Enablement (Universal Validation Bundler)

- **Universal Endpoint:** The system MUST be capable of generating the required artifacts for a `/schemas` endpoint:
  - Stringified Zod source code (e.g. `export const schema = z.object(...)`)
  - Generative JSON Schema definitions (`{ "type": "object", ... }`)
  - TypeScript interfaces
- **Strict-by-default:** Output from Castr for Oak MUST default to `.strict()` object generation. Unknown keys are a hard failure.

### MCP (Model Context Protocol) Support

- **Tool Definitions:** The system MUST be able to expose JSON Schema structures suitable for MCP tool input validators (which strictly require valid JSON Schema objects).
- **Stability:** Deterministic object key ordering MUST applied to ensure that generated JSON Schema representations hash consistently across builds.

---

## 4. Quality Gates

- **Tests First:** All new parsing logic for Draft 07/2020-12 MUST have TDD proofs.
- **No Hacks:** No `as`, `any`, or `eslint-disable` in the implementation of the new parsers.
- **Zero Parse Errors:** Transform validation suites MUST assert zero parse errors before checking downstream structural integrity.
