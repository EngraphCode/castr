# Plan (Active): Phase 4 — JSON Schema + Post‑3.3 Parity

**Status:** 🔄 Active — Components 1–2 complete, Components 3–4 planned  
**Created:** 2026-02-13  
**Last Updated:** 2026-03-08

---

## Exploration Goal: Determine the Desired Impact (Completed)

The exploration phase is complete. Rigorous, measurable, and impact-focused acceptance criteria have been established in `.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md`.

---

## Phase 4 Components

### Component 1: Extract Shared JSON Schema Field Logic — ✅ COMPLETE

Shared format-agnostic field writers extracted from the OpenAPI writer into `lib/src/schema-processing/writers/shared/`:

| File                            | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `json-schema-object.ts`         | `JsonSchemaObject` output type + `isSchemaObjectType` guard |
| `json-schema-fields.ts`         | Core field writers + `writeAllJsonSchemaFields` aggregate   |
| `json-schema-2020-12-fields.ts` | 2020-12 extension keyword writers                           |

OpenAPI writer refactored to compose these shared functions; only OAS-specific fields (xml, externalDocs, discriminator) remain in the OpenAPI module.

**Verification:** Build clean, ESLint clean, 422 tests pass, byte-for-byte identical output confirmed.

### Component 2: JSON Schema Writer — ✅ COMPLETE

Pure JSON Schema 2020-12 writer in `lib/src/schema-processing/writers/json-schema/`, composing shared field writers:

| Function                            | Purpose                                               |
| ----------------------------------- | ----------------------------------------------------- |
| `writeJsonSchema(schema)`           | Single schema → JSON Schema object (no `$schema`)     |
| `writeJsonSchemaDocument(schema)`   | Single schema → JSON Schema document (with `$schema`) |
| `writeJsonSchemaBundle(components)` | Schema components → `$defs`-based bundle              |

**Verification:** Build clean, ESLint clean, 48 new tests pass, all quality gates GREEN.

### Component 3: JSON Schema Parser — 🔲 NEXT

Parse JSON Schema input (Draft 07 and 2020-12) into the canonical CastrSchema IR.

**Key requirements (from acceptance criteria):**

- Accept Draft 07 and Draft 2020-12 input
- Normalize Draft 07 → 2020-12 during parse:
  - `definitions` → local references / `$defs`
  - `dependencies` → `dependentRequired` / `dependentSchemas`
  - Tuple `items` array → `prefixItems`
  - Boolean `exclusiveMinimum`/`exclusiveMaximum` → numeric values
- Unsupported keywords or extensions MUST throw explicit, actionable errors (no silent bypassing)
- TDD test suite covering all keyword categories

**Architecture guidance:**

- Follow the pattern established by the OpenAPI parser (`parsers/openapi/`) and Zod parser (`parsers/zod/`)
- Parser lives in `lib/src/schema-processing/parsers/json-schema/`
- ADR-036 directory limits apply (max 8 source files per directory)
- Pure functions, no side effects, no I/O

### Component 4: Multi-Cast Parity Rig — 🔲 PLANNED

- E2E multi-casting tests: Zod + JSON Schema + TypeScript interfaces from single IR
- Transform validation proofs across all output formats
- Idempotence proofs: JSON Schema → IR → JSON Schema = byte-for-byte identical to normalized baseline
- Round-trip proofs: Zod → IR → JSON Schema → IR → Zod preserves `.strict()` constraints and literal metadata

---

## Non-Goals

- Best-effort parsing or "partial success" modes.
- "Preserve in metadata" as a substitute for a lossless IR model + writer support.

---

## References

- `.agent/plans/roadmap.md` (canonical roadmap)
- `.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md`
- `.agent/directives/VISION.md`
- `.agent/directives/requirements.md`
- `.agent/directives/RULES.md`
- `.agent/directives/testing-strategy.md`
