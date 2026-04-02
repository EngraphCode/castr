# RC-4: Format-Specific Drift Remediation

**Status:** ✅ Complete — Monday, 24 March 2026
**Root cause cluster:** RC-4 from [cross-pack-triage.md](../../../research/architecture-review-packs/cross-pack-triage.md)
**Predecessor:** RC-3 (IR and runtime validator gaps — completed 2026-03-24)
**Sources:** Pack 3 (OpenAPI), Pack 4 (JSON Schema), Pack 5 (Zod)

---

## Problem

Parser and writer seams in each format still disagree about what is admitted vs emitted vs proven. The cross-pack triage identifies 8 findings. This plan scopes a bounded first sub-slice targeting the 5 findings that were actionable without reopening the historical JSON Schema parser remediation record.

---

## Scope Decisions

### In Scope (this slice)

| #   | Finding                                                               | Source Pack |
| --- | --------------------------------------------------------------------- | ----------- |
| 1   | OpenAPI: `components.requestBodies` parsed into IR, dropped on egress | Pack 3.1    |
| 5   | Zod: contradictory strict-object chains not rejected                  | Pack 5.1    |
| 6   | Zod: unsupported nested members silently dropped                      | Pack 5.2    |
| 7   | Zod: identifier-rooted expressions promoted to `$ref` without proof   | Pack 5.3    |
| 8   | Zod: helper format surface wider than writer/proof lockstep           | Pack 5.4    |

### Deferred (JSON Schema parser contract — needs a fresh slice grounded in the historical remediation record)

| #   | Finding                                                              | Source Pack |
| --- | -------------------------------------------------------------------- | ----------- |
| 2   | JSON Schema: `parseJsonSchemaDocument()` is only a `$defs` extractor | Pack 4.1    |
| 3   | JSON Schema: no explicit unsupported-surface rejection seam          | Pack 4.2    |
| 4   | JSON Schema: writer/proof layers disagree on canonical nullability   | Pack 4.3    |

### Format Lockstep Decision

The parser's `FORMAT_MAP`/`ENCODING_MAP` is narrowed to the writer's canonical subset. Unadmitted helpers (`cidrv4`, `cidrv6`, `jwt`, `e164`) will fail fast at the parser boundary. The writer can be extended in a future slice if these helpers become needed.

---

## Proposed Changes

### RC-4.1: OpenAPI requestBody egress parity

**Files:**

- [openapi-writer.components.ts](../../../lib/src/schema-processing/writers/openapi/components/openapi-writer.components.ts) — replace no-op `requestBody` handler with a real implementation
- [openapi-writer.components.unit.test.ts](../../../lib/src/schema-processing/writers/openapi/components/openapi-writer.components.unit.test.ts) — TDD: requestBody component produces `requestBodies`
- [writer-field-coverage.integration.test.ts](../../../lib/tests-transforms/__tests__/writer-field-coverage.integration.test.ts) — integration assertion

### RC-4.5: Zod contradictory strict-object chain rejection

**Files:**

- [zod-parser.object.ts](../../../lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts) — after `isStrict`, scan for contradictory widening modifiers (`.passthrough()`, `.catchall()`, `.strip()`) and throw
- [zod-parser.object.unit.test.ts](../../../lib/src/schema-processing/parsers/zod/types/zod-parser.object.unit.test.ts) — TDD: contradictory chains throw, non-contradictory accepted

### RC-4.6: Zod unsupported nested member fail-fast

**Files:**

- [zod-parser.object.ts](../../../lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts) — change silent `continue` on `!propSchema` to error
- [zod-parser.composition.ts](../../../lib/src/schema-processing/parsers/zod/composition/zod-parser.composition.ts) — change silent `return undefined` on `!itemSchema` to error
- Unit tests for both — TDD: unsupported nested expressions throw

### RC-4.7: Zod reference declaration proof

**Files:**

- [zod-parser.references.ts](../../../lib/src/schema-processing/parsers/zod/registry/zod-parser.references.ts) — verify identifier declaration site is a Zod schema call before promoting to `$ref`
- Reference parser unit tests — TDD: non-Zod identifiers rejected, valid Zod identifiers accepted

### RC-4.8: Zod format lockstep closure

**Files:**

- [zod-parser.zod4-formats.ts](../../../lib/src/schema-processing/parsers/zod/types/zod-parser.zod4-formats.ts) — narrow `FORMAT_MAP` to writer's surface, add fail-fast for unadmitted methods
- Format tests — TDD: admitted formats produce correct IR, unadmitted formats throw

---

## Verification Plan

All items use TDD (RED → GREEN). Final verification: `pnpm qg`.

Targeted test commands during development:

```bash
# OpenAPI components
pnpm --dir lib exec vitest run src/schema-processing/writers/openapi/components/openapi-writer.components.unit.test.ts

# Zod parser
pnpm --dir lib exec vitest run src/schema-processing/parsers/zod/

# Transform regression
pnpm --dir lib exec vitest run --config vitest.transforms.config.ts

# Full gate chain
pnpm qg
```

Snapshot impact: OpenAPI requestBody egress may cause snapshot updates in characterisation tests if fixtures include `components.requestBodies`.
