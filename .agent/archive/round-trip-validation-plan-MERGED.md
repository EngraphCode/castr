# Round-Trip Validation Plan

**Date:** January 13, 2026  
**Status:** ⛔ BLOCKED — Waiting for Session 2.6 (OpenAPI Compliance)  
**Prerequisites:** ❌ [openapi-compliance-plan.md](./openapi-compliance-plan.md) must complete first

> [!CAUTION]
> **This plan CANNOT proceed until OpenAPI Compliance is complete.**  
> See [openapi-acceptance-criteria.md](../acceptance-criteria/openapi-acceptance-criteria.md) for the formal specification.  
> Active work: [openapi-compliance-plan.md](./openapi-compliance-plan.md)

---

## Core Principle: NO CONTENT LOSS

> **This principle is inviolable. There is no "pragmatic" compromise.**

A schema transformation library that loses content is fundamentally broken. Round-trip validation proves that Castr preserves ALL semantic content.

---

## User Value

This session proves two claims that enable production adoption of Castr:

| Claim            | User Confidence                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **Idempotency**  | "If I run Castr twice on the same spec, I get identical output. The tool is predictable and stable." |
| **Losslessness** | "If I transform my spec, I won't lose any information. The tool is safe for production use."         |

These claims must be **backed by evidence**: high-level tests against known fixtures, with clear assertions.

---

## Two Round-Trip Test Cases

### Case 1: Arbitrary OpenAPI → IR → OpenAPI (Losslessness)

**Input:** Any valid OpenAPI specification (not previously processed by Castr)  
**Expected:** NO content loss. Format may change (normalization is expected).

```
Given: An arbitrary valid OpenAPI spec (e.g., examples/openapi/v3.1/tictactoe.yaml)
When:  Processed through buildIR() → writeOpenApi()
Then:  All content is preserved:
       - All paths, operations, parameters
       - All schemas and constraints
       - All components (schemas, parameters, responses, securitySchemes)
       - All document-level metadata (info, tags, externalDocs)
       - All security requirements
```

**Normalization is NOT loss.** Format transformations like `nullable: true` → `type: [string, null]` are expected and acceptable.

### Case 2: Normalized OpenAPI → IR → OpenAPI (Idempotency)

**Input:** A Castr-normalized specification  
**Expected:** Byte-for-byte identical output.

```
Given: A normalized spec (already processed by Castr and saved to disk)
When:  Processed again through buildIR() → writeOpenApi()
Then:  Output === Input (byte-for-byte identical JSON)
```

All pipelines **MUST** be idempotent.

---

## Fixture Strategy

### Arbitrary Fixtures

The official OpenAPI demo schemas serve as arbitrary fixtures:

| Fixture          | Location                                          |
| ---------------- | ------------------------------------------------- |
| tictactoe        | `lib/examples/openapi/v3.1/tictactoe.yaml`        |
| webhook-example  | `lib/examples/openapi/v3.1/webhook-example.yaml`  |
| non-oauth-scopes | `lib/examples/openapi/v3.1/non-oauth-scopes.yaml` |

These are real-world specs that exercise various OpenAPI features.

### Normalized Fixtures

Generate normalized fixtures by processing arbitrary fixtures through Castr:

1. Process each arbitrary fixture: `buildIR(spec) → writeOpenApi(ir)`
2. Save the output to `lib/tests-roundtrip/__fixtures__/normalized/`
3. These saved outputs become the normalized fixtures for idempotency tests

| Normalized Fixture                 | Source                          |
| ---------------------------------- | ------------------------------- |
| `normalized/tictactoe.json`        | Process `tictactoe.yaml`        |
| `normalized/webhook-example.json`  | Process `webhook-example.yaml`  |
| `normalized/non-oauth-scopes.json` | Process `non-oauth-scopes.yaml` |

---

## Implementation: TDD at All Levels

Per [testing-strategy.md](../testing-strategy.md), tests at each level are **specifications**, written FIRST.

### Step 1: Write High-Level Tests (RED)

Write integration tests that specify the behavior we want to prove. These tests should fail initially.

**File:** `lib/tests-roundtrip/round-trip.integration.test.ts`

```typescript
describe('Round-Trip Validation', () => {
  describe('Case 1: Losslessness (arbitrary specs)', () => {
    it('preserves all paths from tictactoe.yaml', async () => {
      // Given: tictactoe.yaml with paths /board, /board/{row}/{column}
      // When: processed through buildIR() → writeOpenApi()
      // Then: output contains all paths
    });

    it('preserves all operations from tictactoe.yaml', async () => {
      // Given: tictactoe.yaml with get-board, get-square, put-square
      // When: processed through buildIR() → writeOpenApi()
      // Then: output contains all operations with correct methods
    });

    it('preserves all schema constraints from tictactoe.yaml', async () => {
      // Given: tictactoe.yaml with min/max constraints on coordinate
      // When: processed through buildIR() → writeOpenApi()
      // Then: output contains all constraints
    });

    it('preserves document-level tags', async () => {
      // Given: tictactoe.yaml with tags array
      // When: processed through buildIR() → writeOpenApi()
      // Then: output contains tags with descriptions
    });

    it('preserves all security schemes', async () => {
      // Given: tictactoe.yaml with multiple security schemes
      // When: processed through buildIR() → writeOpenApi()
      // Then: output contains all security schemes
    });
  });

  describe('Case 2: Idempotency (normalized specs)', () => {
    it('produces byte-for-byte identical output for normalized tictactoe', async () => {
      // Given: normalized/tictactoe.json
      // When: processed through buildIR() → writeOpenApi()
      // Then: output === input (byte-for-byte)
    });
  });
});
```

### Step 2: Create Fixtures

Generate normalized fixtures as needed by the failing tests.

### Step 3: Make Tests Pass (GREEN)

Run tests, observe failures, and implement necessary IR expansions.

**If IR is missing content:** Expand IR and parsers/writers to capture it (NO CONTENT LOSS).

### Step 4: Refactor

Clean up tests and any utilities while keeping tests green.

---

## Expected Transformations (Not Failures)

These format changes are **expected normalization**, not content loss:

| Input               | Output                 | Reason                      |
| ------------------- | ---------------------- | --------------------------- |
| `nullable: true`    | `type: [string, null]` | OAS 3.1 canonical form      |
| Arbitrary key order | Sorted keys            | Deterministic serialization |
| OpenAPI 3.0         | OpenAPI 3.1            | Auto-upgrade (intentional)  |
| YAML format         | JSON format            | Canonical output format     |

---

## Test File Naming

Per [testing-strategy.md](../testing-strategy.md):

| Test Type   | Naming                  | Location               |
| ----------- | ----------------------- | ---------------------- |
| Integration | `*.integration.test.ts` | `lib/tests-roundtrip/` |

These are integration tests because they test how multiple units work together (parser + IR + writer).

---

## What Must Be Preserved (Content Checklist)

When testing losslessness, verify ALL of these are preserved:

- [ ] `openapi` version
- [ ] `info` object (title, description, version, contact, license, termsOfService)
- [ ] `servers` array
- [ ] `tags` array with descriptions
- [ ] `externalDocs` at all levels
- [ ] `paths` with all operations
- [ ] Operation metadata (operationId, summary, description, tags, deprecated)
- [ ] Parameters (path, query, header, cookie) with all properties
- [ ] Request bodies with all content types
- [ ] Responses with all status codes and content types
- [ ] Schema constraints (min, max, pattern, format, enum, etc.)
- [ ] Composition (allOf, oneOf, anyOf, not)
- [ ] `$ref` references
- [ ] Security schemes and requirements
- [ ] `components` (schemas, parameters, responses, requestBodies, headers, securitySchemes)

---

## Decisions

| Question             | Decision                              | Rationale                            |
| -------------------- | ------------------------------------- | ------------------------------------ |
| Implementation order | Tests first, utilities only as needed | Per TDD at all levels                |
| Content loss         | NEVER acceptable                      | Inviolable principle                 |
| Missing IR fields    | Expand IR to capture                  | Architectural correctness > shortcut |
| Fixture source       | Official OpenAPI examples             | Real-world coverage                  |

---

## Out of Scope

- Performance benchmarking
- Cross-format round-trips (e.g., OpenAPI → Zod → OpenAPI)
- Mutation testing (future work)

---

## References

- [ADR-027: Round-Trip Validation](../../docs/architectural_decision_records/ADR-027-round-trip-validation.md)
- [ADR-028: IR→OpenAPI Consolidation](../../docs/architectural_decision_records/ADR-028-ir-openapi-consolidation.md)
- [ADR-029: Canonical Source Structure](../../docs/architectural_decision_records/ADR-029-canonical-source-structure.md)
- [testing-strategy.md](../testing-strategy.md) — TDD at all levels
