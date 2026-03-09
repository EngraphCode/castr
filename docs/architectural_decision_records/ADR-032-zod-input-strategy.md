# ADR-032: Zod 4 Input Strategy

**Date:** 2026-01-23  
**Status:** Accepted

---

## Context

The Zod → IR parser is a critical step for round‑trip validation and for ingesting Zod input directly into the IR. We need a clear, strict, and lossless definition of what Zod input is supported, how metadata is handled, and which patterns must be rejected.

This decision must align with:

- **Losslessness**: IR is the source of truth; content loss is not acceptable.
- **Fail‑fast**: unsupported or ambiguous input must error immediately.
- **Static parsing**: ADR‑026 requires ts‑morph; no regex or runtime execution.
- **Consistency with output**: Zod output strategy (ADR‑031) and input strategy must be compatible to enable round‑trip validation.

---

## Decisions

### 1. Scope: Idiomatic Zod 4 (Standard API Only)

- Support **idiomatic Zod 4** syntax that is statically analyzable.
- **Zod 4 mini** is out of scope.
- **Zod 3 syntax** is rejected with actionable errors.

### 2. Static, Deterministic Parsing Only

- Parsing uses **ts‑morph AST analysis only** (ADR‑026).
- Dynamic patterns (computed keys, spreads, runtime indirection) are **rejected**.
- Standalone `z.undefined()` is **rejected** (not representable losslessly in OpenAPI/JSON Schema); optionality must be modeled at the parent/field level via `.optional()`.
- Unsupported patterns must **fail fast** with actionable diagnostics.

### 3. Metadata Ingestion

- Primary metadata source is **Zod 4 `.meta()`** calls.
- **`.describe()` is supported for backward compatibility** but converted to `.meta({ description })`.
- If both `.describe()` and `.meta({ description })` exist, **`.meta()` takes precedence**.
- Output MUST always use `.meta()`, never `.describe()`.

### 4. Recursion: Getter‑Based Output, Statically Analyzable Input

- **Getter‑based recursion** is the canonical recursive form and the only recursive form emitted by the writer.
- The parser supports statically analyzable recursive getter returns of:
  - a direct identifier
  - identifier-rooted wrapper chains such as `.optional()`, `.nullable()`, `.nullish()`, and chained optional + nullable forms
- Optional recursive refs map losslessly to a direct `$ref` with parent-level optionality.
- Nullable and nullish recursive refs map losslessly to existing composition IR: `anyOf: [{$ref}, {type: 'null'}]`, with parent requiredness carrying optionality.
- `z.lazy(() => ...)` is accepted for compatibility when the callback is statically analyzable. It is never emitted by the writer, and dynamic / non-analyzable lazy patterns must still fail fast.

### 5. Object Unknown-Key Parsing Was Initially Modeled by Validation Acceptance (Superseded in Part by ADR-038)

- `.strict()` maps to `additionalProperties: false`.
- `.passthrough()` maps to `additionalProperties: true`.
- Default `z.object()` and explicit `.strip()` also map to `additionalProperties: true`.

This is the current implementation behavior, but it is no longer the accepted architectural target.

[ADR-038](./ADR-038-object-unknown-key-semantics.md) records the follow-on direction:

- object unknown-key runtime behavior must become first-class IR semantics
- `additionalProperties` remains the portable acceptance/interchange view
- `.catchall(schema)` must not silently degrade to plain `additionalProperties: true`

Until that remediation lands, this section should be read as "current product behavior" rather than "desired end-state".

### 6. Union Semantics Must Be Preserved

- `anyOf` vs `oneOf` semantics are preserved exactly.
- `z.union(...)` defaults to `anyOf` unless disjointness is provable or explicit metadata requests `oneOf`.
- If `oneOf` is requested but disjointness cannot be proven, **fail fast** with a clear error.

### 7. Parser Naming and Endpoint Optionality Must Be Semantic

- Component naming from schema declarations is centralized via
  `parsers/zod/schema-name-registry.ts` (`deriveComponentName` with typed suffix constants),
  not ad-hoc naming heuristics scattered across parser modules.
- Endpoint parameter requiredness in endpoint operation building is derived from parsed schema
  metadata (`schema.metadata.required`) with explicit path-parameter override, not string
  matching (e.g., no `.includes('.optional()')` heuristics).
- Status-code semantics used by IR endpoint mapping are centralized in
  `context/template-context.status-codes.ts` and referenced via typed constants/predicates.

### 8. Declaration Discovery Must Stay Compatible with Writer Emission

- The parser must accept writer-emitted identifier-rooted composition declarations
  when the root identifier resolves to a known schema declaration in scope
  (for example `const Pet = NewPet.and(z.object(...))`).
- Declaration eligibility decisions must remain semantic/AST-driven and must not
  regress to text/regex heuristics.
- Support for non-emitted composition APIs remains opt-in and requires explicit
  failing-first evidence and plan scope.

---

## Consequences

### Positive

- Clear, deterministic input contract for Zod → IR parsing.
- Lossless round‑trip validation becomes feasible and reliable.
- Metadata handling is consistent and unambiguous.
- Writer/parser lockstep includes identifier-rooted `allOf` composition output.
- Writer/parser lockstep also includes recursive wrapper chains for optional, nullable, and nullish getter-based recursion.

### Negative

- Some Zod patterns remain unsupported (dynamic schemas, Zod 3, non-statically-analyzable lazy patterns, standalone `z.undefined()`).
- Users must adapt input to idiomatic Zod 4 conventions for lossless ingestion.

---

## Alternatives Considered

1. **Support Zod 3 and Zod 4 simultaneously**
   - Rejected: complicates parsing and weakens type/semantic guarantees.

2. **Reject all `z.lazy()` input**
   - Rejected: statically analyzable `z.lazy(() => ...)` remains useful compatibility input, even though getter syntax is the canonical emitted output.
   - Non-analyzable lazy patterns are still rejected.

3. **Reject `.describe()` entirely**
   - Rejected: would break backward compatibility with many existing Zod schemas.
   - Instead, `.describe()` is parsed but `.meta()` takes precedence.

4. **Allow dynamic patterns with best‑effort parsing**
   - Rejected: violates fail‑fast and static‑analysis requirements.

---

## References

- `.agent/directives/requirements.md` (Zod input requirements; union semantics)
- `.agent/acceptance-criteria/zod-parser-acceptance-criteria.md`
- [ADR-026: No String Manipulation for Parsing](./ADR-026-no-string-manipulation-for-parsing.md)
- [ADR-031: Zod 4 Output Strategy](./ADR-031-zod-output-strategy.md)
