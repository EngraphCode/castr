# ADR-033: Two-Pass Semantic Parsing (AST Symbol Resolution)

**Date:** 2026-02-20
**Status:** Accepted
**Context:** Phase 3.3a (Strictness Remediation)

---

## Context

During the initial development of the Zod parser (Phase 3.2), the pipeline relied heavily on naming heuristics and manual string matching (via `.getText()`) to extract schema meaning, references, and compositions. For example, inferring that `UserIdSchema` was a reference simply by inspecting the identifier string.

However, ADR-026 enforces that the internal representation (IR) strictly adheres to the meaning (the semantics) of the code, not its raw text. String manipulation and regex fallbacks create edge cases where aliases, complex scopes, and cross-file references break silently or produce invalid output.

To strictly enforce ADR-026 and gracefully handle things like `SchemaA.and(SchemaB)` and circular dependencies without regex hacks, a more robust parsing architecture was required.

---

## Decision

We are adopting a **Two-Pass Semantic Parsing Architecture** for all AST-based parsers, driven by compiler Symbol resolution rather than string parsing.

**Pass 1: Symbol Table Construction**
Collect all relevant schema declarations into a Symbol Table. Instead of strings, the keys are standard TypeScript `Symbol` instances (via `ts-morph`). This accurately maps identities across assignments, scopes, and files.

**Pass 2: Resolution & Generation**
Walk the AST and generate the IR. When an identifier or reference is encountered, we do not inspect its string name. Instead, we retrieve its underlying `Symbol` and look it up in the Symbol Table.

---

## Consequences

### Positive

- **Determinism:** `const A = B; const C = A;` correctly resolves `C` to the `B` schema without custom aliasing logic.
- **Robust Composition:** Complex expressions like `.and(Reference)` or `.catchall(Reference)` evaluate correctly because reference identifiers map directly to loaded symbols.
- **Reference Integrity:** Resolving `Symbol` instances prevents name collisions when separate files export schemas with identical names.
- **Strict Compliance:** Permanently aligns the parsing pipeline with ADR-026 by fully eliminating AST stringification (`.getText()`) for semantic mapping.

### Negative

- **Memory Overhead:** Holding reference to underlying `Symbol` maps requires keeping the `ts-morph` project in memory for the duration of the parsing step.
- **Complexity:** Requires explicit awareness of TypeScript `TypeChecker` aliasing behaviors (e.g., resolving `getAliasedSymbol()`).

---

## References

- [ADR-026: No String Manipulation For Parsing Data Structures](./ADR-026-no-string-manipulation-for-parsing.md)
