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

## Scope Definition (Session 3.3a.01 Audit)

### What This ADR Bans

String/regex heuristics that derive meaning from TypeScript source code text when an AST with semantic APIs exists:

1. **Text comparison for identity**: `node.getText() === 'z'` instead of symbol resolution
2. **Text comparison for semantics**: `expression.includes('.optional()')` instead of AST chain analysis
3. **Naming-convention heuristics**: `name.endsWith('Schema')` instead of a symbol table
4. **getText()-then-manipulate**: Getting source text then parsing with string methods, when `getName()`, `getLiteralValue()`, or symbol resolution could extract the information directly

### What This ADR Allows

**Data-string parsing** (OpenAPI `$ref`, media types, URL templates, HTTP status codes) is allowed **only** when ALL of the following hold:

1. **Centralized** — the parsing lives in a designated utility module (not inline, not ad-hoc, not scattered)
2. **Validated** — fail-fast on invalid inputs with helpful error messages
3. **Tested** — unit tests covering normal, edge, and error cases
4. **Not parsing TypeScript source code** — operating on data from the IR, OpenAPI spec, or configuration
5. **Explicitly designated** — the utility module is listed below

**Designated centralized data-string utilities:**

- `src/shared/ref-resolution.ts` — OpenAPI `$ref` parsing (canonical, all `$ref` parsing MUST delegate here)
- Future: media-type parser, URL-template parser (when created)

**Ad-hoc data-string parsing (e.g., inline `startsWith('#/components/')` in 7 files) is a violation of the centralization requirement** and must be remediated to delegate to the designated utility.

Also allowed (not string-parsing, no centralization needed):

- **Array `.includes()`** on typed arrays (not string operations)
- **Display/formatting** operations (`.toUpperCase()`, `.toLowerCase()` for rendering output, never for semantics)

**`getText()` principle:** `getText()` is banned for identity or semantic comparison (`=== 'z'`, `=== 'undefined'`, `=== 'defineEndpoint'`). Prefer ts-morph semantic APIs (`getName()`, `getLiteralValue()`, `getLiteralText()`, symbol resolution) in all cases. `getText()` may be used only for data extraction from a known node type when no semantic API exists, and never for comparison.

### Enforcement Principle

**TS-source heuristics (`getText()`, regex, text comparison) are banned in ALL `src/` files, no exceptions.** Data-string methods (`startsWith`, `includes`, `split`, `slice`) are banned in ALL `src/` files EXCEPT in designated centralized utility modules listed above. Test files are excluded (they may assert on string content).

| Scope                      | Files                                         | Policy                                                             |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| **Banned**                 | All `src/**/*.ts`                             | `getText()` identity, regex, text comparison — always banned       |
| **Banned (data-string)**   | All `src/**/*.ts` except designated utilities | Inline `startsWith`, `includes`, `split` etc. on ref/media strings |
| **Allowed (data-string)**  | Designated centralized utilities only         | String methods for data parsing, centralized + validated + tested  |
| **Excluded from all bans** | `**/*.test.ts`, `**/*.spec.ts`, `tests-*/**`  | Tests may assert on string content                                 |

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
