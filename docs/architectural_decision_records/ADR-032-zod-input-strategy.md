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

> [!IMPORTANT]
> [ADR-040](./ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md) supersedes the earlier multi-mode object-ingest direction in this ADR. Non-strict object inputs now reject by default, with one explicit opt-in strip-normalization compatibility mode.

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

### 5. Object Parsing Is Reject-By-Default, With One Explicit Strip-Normalization Compatibility Mode

Public option surface:

- `nonStrictObjectPolicy?: 'reject' | 'strip'`
- default: `'reject'`

Default supported direction:

- `z.strictObject({...})`
- `z.object({...}).strict()` when statically analyzable
- OpenAPI / JSON Schema object schemas that explicitly reject unknown keys

Default rejected direction:

- bare `z.object({...})`
- `z.looseObject({...})`
- `.strip()`
- `.passthrough()`
- `.catchall(...)`
- OpenAPI / JSON Schema object schemas that permit unknown keys
- non-strict preservation extensions

Compatibility-mode direction:

- when the caller explicitly opts into strip-normalization mode, the parser may accept the rejected non-strict object forms above
- those forms must normalize to strip semantics only
- normalization target is `additionalProperties: true` plus `unknownKeyBehavior: { mode: 'strip' }`
- passthrough and catchall behavior must not survive this mode as preserved semantics
- the mode must be documented as deliberate and lossy

Invalid or non-strict object combinations must fail fast with actionable diagnostics when the compatibility mode is not enabled.

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

### 9. UUID Subtype Semantics Are First-Class IR Truth With A Narrow Regex Inference Exception

- `z.uuid()` parses to `type: 'string', format: 'uuid'`
- `z.uuidv4()` parses to `type: 'string', format: 'uuid', uuidVersion: 4`
- `z.uuidv7()` parses to `type: 'string', format: 'uuid', uuidVersion: 7`

### 10. Integer Semantics Are First-Class IR Truth

- `z.int64()` parses to `type: 'integer', format: 'int64', integerSemantics: 'int64'`
- `z.bigint()` parses to `type: 'integer', integerSemantics: 'bigint'`
- portable `format` strings are not the sole keeper of integer semantic truth

Portable input formats must also remain honest:

- OpenAPI 3.1 `type: 'integer', format: 'int64'` is accepted and maps to IR `int64` semantics
- OpenAPI 3.1 custom `format: 'bigint'` is rejected
- JSON Schema 2020-12 custom `format: 'int64'` and `format: 'bigint'` are rejected

**Rationale:** `int64` is a bounded integer semantic; `bigint` is an arbitrary-precision runtime semantic. They are not the same type and must not collapse into one portable `format` string.

- governed canonical regex patterns may infer UUID subtype semantics only when the incoming structure does not already express subtype explicitly
- explicit subtype plus contradictory governed regex must fail fast
- the parser preserves existing `pattern` content even when subtype is also inferred from it

Portable detours may later widen subtype semantics when the target format cannot carry them natively; see ADR-039.

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
- Callers who choose strip-normalization compatibility mode are explicitly accepting a lossy ingest path for non-strict object behavior.

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
