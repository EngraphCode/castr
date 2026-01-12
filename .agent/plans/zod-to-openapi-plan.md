# Phase 2 Plan: Zod → OpenAPI

**Date:** January 12, 2026  
**Status:** Session 2.6 Next  
**Prerequisites:** Sessions 2.1-2.5 complete (881 unit tests)

---

## Strategic Goal

Prove the IR architecture works bidirectionally: `OpenAPI ↔ Zod` via `CastrDocument`.

---

## Key Decisions

| Decision         | Choice                        | Rationale                 |
| ---------------- | ----------------------------- | ------------------------- |
| Zod version      | Zod 4 only                    | Strict rejection of Zod 3 |
| Input strictness | Strict validation             | Reject malformed input    |
| Metadata         | Deterministic recommendations | No AI-generated content   |
| Parsing          | ts-morph AST                  | No regex (ADR-026)        |

---

## Completed Sessions (2.1-2.5)

<details>
<summary><strong>Session 2.1: Zod 4 Parser Foundation</strong> — 46 tests</summary>

- Zod 4 detection, dynamic schema rejection
- Primitives: string, number, boolean
- Object parsing, variable name extraction
- Deterministic recommendations

</details>

<details>
<summary><strong>Session 2.2: Constraints & Modifiers</strong> — 35 tests</summary>

- Chain walking: .min(), .max(), .length(), .regex()
- Optionality: .optional(), .nullable(), .nullish()
- String formats: .email(), .url(), .uuid(), .datetime()
- Number constraints, defaults, descriptions

</details>

<details>
<summary><strong>Session 2.3: Composition & References</strong> — 35 tests</summary>

- Arrays with item types and constraints
- Enums, unions, discriminated unions
- Intersections → allOf
- Lazy schemas, variable references

</details>

<details>
<summary><strong>Session 2.4: Endpoint Parsing</strong> — 14 tests</summary>

- EndpointDefinition types
- Path/query/header/cookie parameters
- Request bodies, multiple responses

</details>

<details>
<summary><strong>Session 2.5: OpenAPI Writer</strong> — 73 tests</summary>

- writeOpenApi(), writeOpenApiSchema()
- writeOpenApiComponents(), writeOpenApiPaths()
- OAS 3.1 nullable type arrays
- Bonus: Fixed 24 pre-existing parser lint errors

</details>

**Total: 203 new tests** → See [lib/src/parsers/zod/README.md](../../../lib/src/parsers/zod/README.md)

---

## Session 2.6: Round-Trip Validation (4-6h) 🎯 NEXT

**Goal:** Prove bidirectional architecture with two-case round-trip testing.

### Two Validation Cases (ADR-027)

| Case                       | Input                 | Expected Output               |
| -------------------------- | --------------------- | ----------------------------- |
| **Deterministic**          | Castr-normalized spec | Byte-for-byte identical       |
| **Information-Preserving** | Arbitrary spec        | Semantic equivalence, no loss |

### Case 1: Deterministic (Byte-for-Byte)

```
Spec₀ → Castr → Spec₁ → Castr → Spec₂
ASSERT: Spec₁ === Spec₂
```

A Castr-normalized spec re-processed through Castr should be **byte-for-byte identical**. This proves idempotency.

### Case 2: Information-Preserving (Semantic Equivalence)

```
Spec₀ → Castr → Spec₁
ASSERT: semanticContent(Spec₀) ⊆ semanticContent(Spec₁)
```

An arbitrary spec should lose **no information**, even if format changes. Castr may add computed fields (dependency graphs, resolved refs).

### Scope

- [ ] Create round-trip test fixtures (normalized + arbitrary specs)
- [ ] Implement deterministic comparison (sorted JSON)
- [ ] Implement semantic equivalence checker
- [ ] Document expected transformations (nullable, defaults)
- [ ] Add characterisation tests for real-world specs
- [ ] Validate recommendations for missing metadata

### Tests

- Deterministic: Castr fixtures round-trip byte-for-byte
- Arbitrary: Real-world specs preserve all semantic content
- Recommendations: Actionable, deterministic output

### Acceptance

- Both round-trip cases pass for all fixtures
- Clear documentation of expected transformations
- No information loss for arbitrary specs

---

## Session 2.7: Adapter Abstraction (4-6h)

**Goal:** Extract common patterns into shared `FormatAdapter` interface.

### Scope

- [ ] Define `FormatAdapter<TInput, TOutput>` interface
- [ ] Refactor OpenAPI parser/writer to implement adapter
- [ ] Refactor Zod parser/writer to implement adapter
- [ ] Create adapter registry
- [ ] Document discovered commonalities

### Deliverables

- ADR documenting format adapter abstraction
- Shared type mapping utilities
- Updated architecture documentation

---

## Architecture Vision

```
┌────────────────────────────────────────────────────────┐
│                   FORMAT ADAPTERS                      │
│  OpenAPI Adapter    Zod Adapter    JSON Schema ...    │
│     parse()           parse()          parse()        │
│        ↓                 ↓                ↓           │
├────────────────────────────────────────────────────────┤
│              CANONICAL IR (CastrDocument)              │
├────────────────────────────────────────────────────────┤
│     write()           write()          write()        │
│        ↓                 ↓                ↓           │
│  OpenAPI Writer    Zod Writer     TypeScript ...      │
└────────────────────────────────────────────────────────┘
```

---

## References

- [ADR-026: No Regex for Parsing](../docs/architectural_decision_records/ADR-026-no-regex-for-parsing.md)
- [ADR-027: Round-Trip Validation](../docs/architectural_decision_records/ADR-027-round-trip-validation.md)
- [Parser README](../../../lib/src/parsers/zod/README.md)
