# Plan (Complete): Phase 4 — JSON Schema + Post‑3.3 Parity

**Status:** ✅ Complete record — components 1–4 landed historically, and later follow-on slices closed the remaining gaps  
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

### Component 3: JSON Schema Parser — ✅ COMPLETE

Parse JSON Schema input (Draft 07 and 2020-12) into the canonical CastrSchema IR. Located in `lib/src/schema-processing/parsers/json-schema/`.

| File                                  | Purpose                                                                |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `json-schema-parser.types.ts`         | `JsonSchema2020` interface (extends `SchemaObject` + 2020-12 keywords) |
| `json-schema-parser.normalization.ts` | Draft 07 → 2020-12 normalization (6-step pure functional pipeline)     |
| `json-schema-parser.helpers.ts`       | Field extraction helpers (type, constraints, composition)              |
| `json-schema-parser.2020-keywords.ts` | 2020-12 applicator/validation keyword parsing                          |
| `json-schema-parser.core.ts`          | Core parser: `parseJsonSchemaObject()` → `CastrSchema`                 |
| `index.ts`                            | Public API: `parseJsonSchema()`, `parseJsonSchemaDocument()`           |

**Architecture:**

- `Draft07Input` uses `Omit<JsonSchema2020, widened_keys> & { wider_declarations }` — TypeScript doesn't allow widening via `interface extends`, so Draft 07's wider types are expressed by omitting base keys and re-declaring
- `stripDraft07Keys` narrows back to `JsonSchema2020` at normalization exit with compile-time guards
- `JsonSchema2020` extracted to `types.ts` to break circular dependencies between core/helpers/2020-keywords
- `rewriteRefPath` consolidated helper rewrites `$ref` paths in all recursive locations
- Zero `as` casts in source files; tests use `as Draft07Input` (allowed by ESLint test rules)

**Verification:** Build clean, ESLint clean, 0 circular dependencies, 84 tests pass (46 core + 28 normalization + 10 public API), all quality gates GREEN.

### Component 4: Multi-Cast Parity Rig — ✅ COMPLETE

Test infrastructure refactored and expanded with 3 new scenario test files:

| File                                                   | Scenario                                                    | Tests |
| ------------------------------------------------------ | ----------------------------------------------------------- | ----- |
| `scenario-5-json-schema-roundtrip.integration.test.ts` | JSON Schema → IR → JSON Schema (idempotence + losslessness) | 36    |
| `scenario-6-zod-via-json-schema.integration.test.ts`   | Zod → IR → JSON Schema → IR → Zod (cross-format round-trip) | 9     |
| `scenario-7-multi-cast.integration.test.ts`            | Single IR → Zod + JSON Schema + OpenAPI simultaneously      | 24    |

**Infrastructure changes:**

- Extracted shared helpers to `tests-transforms/utils/transform-helpers.ts`
- Split 772-line `transform-samples.integration.test.ts` into 4 scenario-specific files (scenarios 1–4)
- Created 9 comprehensive JSON Schema 2020-12 fixtures in `tests-transforms/__fixtures__/json-schema/`

**Verification:** Build clean, ESLint clean, 491 tests pass (15 skipped — see Remaining Work), all quality gates GREEN.

---

## Historical Follow-On Work

The remaining work recorded when this phase closed was later handled in subsequent slices:

- **Zod defect remediation:** resolved in [zod-defect-quarantine-remediation.md](./zod-defect-quarantine-remediation.md).
- **Documentation alignment:** completed in later proof/doctrine and consolidation passes.

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
- `.agent/directives/principles.md`
- `.agent/directives/testing-strategy.md`
