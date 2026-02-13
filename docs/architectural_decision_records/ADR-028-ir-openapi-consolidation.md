# ADR-028: IR→OpenAPI Converter Consolidation

**Date:** 2026-01-12  
**Status:** Accepted  
**Context:** Session 2.6 pre-work discovered 3 duplicate IR→OpenAPI implementations

---

## Decision

Consolidate to **single canonical implementation** in `lib/src/writers/openapi/`.

| Before                                   | After        |
| ---------------------------------------- | ------------ |
| `generators/openapi/generateOpenAPI()`   | ❌ Deleted   |
| `context/converter/convertIRToOpenAPI()` | ❌ Deleted   |
| `writers/openapi/writeOpenApi()`         | ✅ Canonical |

## Rationale

1. **Cannot validate with multiple implementations** — Round-trip validation requires single source of truth
2. **`writers/openapi/` most comprehensive** — 73 unit tests, handles security, all component types
3. **Cleaner architecture** — Matches `parsers/` (input) + `writers/` (output) convention

## Consequences

- Public API now exports `writeOpenApi` (with `generateOpenAPI` alias for backward compatibility)
- All E2E tests updated to use canonical implementation
- `validateOpenAPI` preserved in `writers/openapi/openapi-validator.ts`

## References

- [VISION.md](../../.agent/directives/VISION.md) — Architecture diagram showing single Output Layer
