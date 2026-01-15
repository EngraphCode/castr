# ADR-030: Full OpenAPI Syntax Support

**Date:** January 13, 2026  
**Status:** Accepted

---

## Context

Castr transforms data definitions between formats via a canonical Intermediate Representation (IR). For the NO CONTENT LOSS principle to hold, the IR must capture ALL valid OpenAPI syntax — not just the subset used in common cases.

Prior to this decision, `CastrDocument` was missing several document-level and component fields that exist in valid OpenAPI 3.0.x and 3.1.x specifications:

| Missing Field  | OpenAPI Location             | Impact                           |
| -------------- | ---------------------------- | -------------------------------- |
| `tags`         | Document-level               | Operation categorization lost    |
| `externalDocs` | Document/operation/tag-level | Documentation links lost         |
| `webhooks`     | Document-level (3.1.x only)  | Webhook definitions lost         |
| `links`        | components/links             | Response linking lost            |
| `callbacks`    | components/callbacks         | Async operation definitions lost |

This gap was discovered when writing comprehensive input/output coverage tests against the official OpenAPI example fixtures.

---

## Decision

**Castr will support ALL valid OpenAPI 3.0.x and 3.1.x syntax.**

This means:

1. **All document-level fields:** info, servers, tags, externalDocs, paths, webhooks, components, security, jsonSchemaDialect
2. **All component types:** schemas, responses, parameters, requestBodies, headers, securitySchemes, links, callbacks, pathItems
3. **Both formats:** YAML and JSON input, JSON output only
4. **Auto-upgrade:** OpenAPI 3.0.x is automatically upgraded to 3.1.0 internally

The IR (`CastrDocument`, `IRComponent`, related types) must be expanded to capture any fields that are currently missing.

---

## Consequences

### Positive

1. **NO CONTENT LOSS is verifiable** — We can prove losslessness against any valid OpenAPI spec
2. **Production confidence** — Users know any valid spec will work without surprises
3. **Test coverage** — 87 tests now verify input/output syntax coverage
4. **Clear scope** — "ALL valid syntax" is a clear, measurable goal

### Negative

1. **More IR fields** — `CastrDocument` becomes larger
2. **More parser/writer code** — Must handle additional fields
3. **More tests** — Must test all fields (but this is also positive)

### Neutral

1. **Implementation effort** — Required anyway for production readiness
2. **Complexity** — Matches OpenAPI spec complexity (unavoidable)

---

## Implementation

### Phase 1: Tests (Complete)

- `lib/tests-roundtrip/input-coverage.integration.test.ts` — 54 tests
- `lib/tests-roundtrip/output-coverage.integration.test.ts` — 33 tests
- Total: 87 tests (72 passing, 15 expected failing for missing fields)

### Phase 2: IR Expansion (Pending)

Add to `CastrDocument`:

- `tags?: TagObject[]`
- `externalDocs?: ExternalDocumentationObject`
- `webhooks?: Map<string, CastrOperation>`

Add to `IRComponent` types:

- `type: 'link'` with `IRLinkComponent`
- `type: 'callback'` with `IRCallbackComponent`

### Phase 3: Parser/Writer Updates (Pending)

- Update `buildIR()` to extract all fields
- Update `writeOpenApi()` to write all fields

---

## References

- [OpenAPI 3.0.x Schema](../../.agent/reference/openapi_schema/openapi_3_0_x_schema.json)
- [OpenAPI 3.1.x Schema](../../.agent/reference/openapi_schema/openapi_3_1_x_schema_without_validation.json)
- [ADR-027: Round-Trip Validation](./ADR-027-round-trip-validation.md)
- [requirements.md](../../.agent/requirements.md) — Updated with full syntax support constraint
