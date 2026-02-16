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
- Unsupported patterns must **fail fast** with actionable diagnostics.

### 3. Metadata Ingestion

- Primary metadata source is **Zod 4 `.meta()`** calls.
- **`.describe()` is supported for backward compatibility** but converted to `.meta({ description })`.
- If both `.describe()` and `.meta({ description })` exist, **`.meta()` takes precedence**.
- Output MUST always use `.meta()`, never `.describe()`.

### 4. Recursion: Getter‑Based Only

- **Getter‑based recursion** is the only supported recursive pattern.
- `z.lazy()` is **not supported** and must be rejected.

### 5. Union Semantics Must Be Preserved

- `anyOf` vs `oneOf` semantics are preserved exactly.
- `z.union(...)` defaults to `anyOf` unless disjointness is provable or explicit metadata requests `oneOf`.
- If `oneOf` is requested but disjointness cannot be proven, **fail fast** with a clear error.

### 6. Parser Naming and Endpoint Optionality Must Be Semantic

- Component naming from schema declarations is centralized via
  `parsers/zod/schema-name-registry.ts` (`deriveComponentName` with typed suffix constants),
  not ad-hoc naming heuristics scattered across parser modules.
- Endpoint parameter requiredness in endpoint operation building is derived from parsed schema
  metadata (`schema.metadata.required`) with explicit path-parameter override, not string
  matching (e.g., no `.includes('.optional()')` heuristics).
- Status-code semantics used by IR endpoint mapping are centralized in
  `context/template-context.status-codes.ts` and referenced via typed constants/predicates.

---

## Consequences

### Positive

- Clear, deterministic input contract for Zod → IR parsing.
- Lossless round‑trip validation becomes feasible and reliable.
- Metadata handling is consistent and unambiguous.

### Negative

- Some Zod patterns remain unsupported (dynamic schemas, Zod 3, z.lazy).
- Users must adapt input to idiomatic Zod 4 conventions.

---

## Alternatives Considered

1. **Support Zod 3 and Zod 4 simultaneously**
   - Rejected: complicates parsing and weakens type/semantic guarantees.

2. **Allow `z.lazy()`**
   - Rejected: conflicts with the getter‑based recursion strategy and complicates static analysis.

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
