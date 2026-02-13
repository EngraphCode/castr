# ADR-026: No String/Regex Heuristics for TS-Source Parsing

**Status:** Accepted (Extended January 2026)  
**Date:** 2026-01-10 (Updated: 2026-02-13)  
**Deciders:** Engineering Team

## Context

During Phase 2, Session 2.3 implementation of the Zod parser, an initial approach using regular expressions was attempted for parsing Zod schema expressions. This approach quickly revealed fundamental limitations:

1. **Fragility:** Regex patterns failed on nested structures (e.g., `z.object({ a: z.string() })` broke patterns using `[^)]+`)
2. **Complexity:** Patterns became unreadable and required multiple eslint-disable comments
3. **Maintainability:** Each new Zod feature required new regex patterns and edge case handling
4. **Inappropriate tool:** The project already has ts-morph for AST manipulation

### Extension (Session 3.3a)

During Session 3.3a, we discovered that the prohibition must extend beyond regex to **string-based heuristics used to infer semantics from TypeScript source text**. These patterns included:

- `getText() === 'z'` — Comparing AST node text instead of using symbol resolution
- `startsWith()`, `endsWith()`, `includes()` — Pattern matching on strings to detect meaning
- `slice()`, `split()`, `replace()` — Parsing behavior from text instead of the AST
- string literal comparisons against node text to decide semantics

These patterns are equally fragile because they:

- Break with formatting changes (whitespace, quotes)
- Cannot handle semantic equivalents (aliased imports, renamed symbols)
- Carry no semantic meaning — they match syntax, not intent

## Decision

**No string/regex heuristics shall be used to derive schema semantics from TypeScript source code when an AST exists.**

This ADR targets **TS-source parsing** (ts-morph + TypeScript compiler APIs), not “data-string parsing” inside OpenAPI/JSON Schema documents.

### Out of Scope (But Still Strict)

Parsing _data strings_ that are part of OpenAPI/JSON Schema (e.g. `$ref`, media types) is allowed when it is:

- centralized,
- validated,
- tested,
- and fail-fast on invalid inputs.

This includes but is not limited to:

| Banned Pattern (TS-source parsing)  | Reason                                 |
| ----------------------------------- | -------------------------------------- |
| Regex literals (`/pattern/`)        | Fragile, unreadable, inappropriate     |
| `RegExp` constructor                | Same as above                          |
| `getText() === 'value'`             | Text comparison, not semantic analysis |
| `startsWith()`, `endsWith()`        | String pattern matching                |
| `includes()`, `indexOf()`           | String searching                       |
| `slice()`, `substring()`, `split()` | String manipulation                    |
| `toLowerCase()`, `toUpperCase()`    | Case normalization                     |
| `replace()`, `replaceAll()`         | String transformation                  |
| `match()`, `search()`               | Regex-adjacent methods                 |
| `=== 'literal'` against node text   | Semantic checks via text               |

The Zod parser (and any future source code parsers) must use proper semantic tooling:

| Tool                        | Use Case                                             |
| --------------------------- | ---------------------------------------------------- |
| **ts-morph**                | TypeScript/JavaScript AST traversal and manipulation |
| **TypeScript Compiler API** | Type resolution, symbol tables, semantic analysis    |
| **Symbol resolution**       | Verify identifiers reference correct imports         |
| **Type checking**           | Determine types without string comparison            |

## Enforcement

ESLint rules in `lib/eslint.config.ts` enforce this ADR:

- Regex literals and `RegExp` constructor are **errors**
- String/regex heuristic bans are scoped to TS-source parsing modules (where semantics must come from the AST)
- Data-string parsing utilities are excluded (they must be centralized/validated/tested instead)
- Test files are excluded (they may assert on string content)

## Consequences

### Positive

- **Robustness:** Semantic analysis handles all valid TypeScript syntax
- **Maintainability:** Code uses proper abstractions, not string heuristics
- **Correctness:** Proper handling of imports, aliases, renamed symbols
- **Tooling alignment:** Leverages existing ts-morph and TypeScript investment
- **Agent safety:** Prevents AI agents from implementing fragile string-based parsers

### Negative

- **Refactoring required:** Existing string-based code must be rewritten
- **459 violations:** Current codebase has 459 errors to remediate
- **Learning curve:** Semantic analysis with ts-morph/TypeScript requires familiarity

## Implementation Notes

Remediation involves:

1. Replacing `getText() === 'z'` with symbol resolution (verify import source)
2. Replacing string heuristics with AST node type checks
3. Using ts-morph's semantic API instead of text matching

## References

- [ADR-014: Migrate tanu to ts-morph](./ADR-014-migrate-tanu-to-ts-morph.md)
- [Roadmap (Session 3.3a): ADR-026 Enforcement + Strictness Remediation](../../.agent/plans/roadmap.md)
- [ts-morph documentation](https://ts-morph.com/)
