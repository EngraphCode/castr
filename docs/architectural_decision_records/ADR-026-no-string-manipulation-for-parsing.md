# ADR-026: No String Manipulation for Parsing

**Status:** Accepted (Extended January 2026)  
**Date:** 2026-01-10 (Updated: 2026-01-24)  
**Deciders:** Engineering Team

## Context

During Phase 2, Session 2.3 implementation of the Zod parser, an initial approach using regular expressions was attempted for parsing Zod schema expressions. This approach quickly revealed fundamental limitations:

1. **Fragility:** Regex patterns failed on nested structures (e.g., `z.object({ a: z.string() })` broke patterns using `[^)]+`)
2. **Complexity:** Patterns became unreadable and required multiple eslint-disable comments
3. **Maintainability:** Each new Zod feature required new regex patterns and edge case handling
4. **Inappropriate tool:** The project already has ts-morph for AST manipulation

### Extension (Session 3.3a)

During Session 3.3a, we discovered that the prohibition should extend beyond regex to **all forms of string manipulation**. The Zod parser contained 459 violations including:

- `getText() === 'z'` — Comparing AST node text instead of using symbol resolution
- `startsWith()`, `endsWith()`, `includes()` — Pattern matching on strings
- `slice()`, `split()`, `replace()` — String manipulation for parsing
- String literal comparisons (`=== 'schema'`) — Semantic checks via text matching

These patterns are equally fragile because they:

- Break with formatting changes (whitespace, quotes)
- Cannot handle semantic equivalents (aliased imports, renamed symbols)
- Carry no semantic meaning — they match syntax, not intent

## Decision

**No string manipulation or matching of any kind shall be used for parsing schema source code.**

This includes but is not limited to:

| Banned Pattern                      | Reason                                 |
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
| `=== 'literal'` with strings        | Semantic checks via text               |

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
- All string manipulation methods are **errors** in `src/**/*.ts`
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

Session 3.3a established the ESLint enforcement. Remediation involves:

1. Replacing `getText() === 'z'` with symbol resolution (verify import source)
2. Replacing string heuristics with AST node type checks
3. Using ts-morph's semantic API instead of text matching

## References

- [ADR-014: Migrate tanu to ts-morph](./ADR-014-migrate-tanu-to-ts-morph.md)
- [Session 3.3a Plan: String Manipulation Remediation](../../.agent/plans/string-manipulation-remediation.md)
- [ts-morph documentation](https://ts-morph.com/)
