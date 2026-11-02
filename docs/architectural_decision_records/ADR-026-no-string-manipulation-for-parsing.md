# ADR-026: No String/Regex Heuristics for TS-Source Parsing

**Status:** Accepted (Extended January 2026; amended 2 November 2026)  
**Date:** 2026-01-10 (Updated: 2026-02-13; 2026-11-02)  
**Deciders:** Engineering Team

## Context

During Phase 2, Session 2.3 implementation of the Zod parser, an initial approach using regular expressions was attempted for parsing Zod schema expressions. This approach quickly revealed fundamental limitations:

1. **Fragility:** Regex patterns failed on nested structures (e.g., `z.object({ a: z.string() })` broke patterns using `[^)]+`)
2. **Complexity:** Patterns became unreadable and required multiple lint-suppression comments
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

**No string/regex heuristics shall be used to derive schema semantics from TypeScript source code when an AST exists** (January 2026).

**Castr's compiler and decompiler work via AST, not via string manipulation** (the amendment of 2 November 2026, below; logging is outside it). A string whose grammar a specification defines (a `$ref`, a JSON Pointer, a URI reference, a media type, a status range, a path template, a `format` value) is read only by a parser for that grammar, tested against that grammar's specification, and the work is done on the parsed data, as [SPEC-AR-3](../SPECIFICATION.md) states.

Banned patterns include, but are not limited to:

| Banned pattern                      | Reason                                 |
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

## Amendment of 2 November 2026: AST, not string manipulation

The owner, 2 November 2026, verbatim: "All Castr work happens via AST not via string
manipulation. Where string manipulation is unavoidable, ask _why_".

The same day the owner chose, by decision card, how "ask why" binds. The chosen option
read: "No string manipulation in Castr's code, tooling or tests. A grammar-defined string
is read only by a parser for its grammar, tested against that grammar's specification.
Where string manipulation seems unavoidable, the work stops and asks the owner why it is
needed; an exception exists only as an owner-approved entry in the specification, and a
lint check bans string methods everywhere else."

**String manipulation** is reading characters to find meaning (prefix checks, splitting,
searching, regular expressions) or building output by joining text. A grammar parser's own
tokenising, and comparing a whole value with a typed constant, are not string manipulation.
The rule binds the compiler and decompiler (every parser and reader, the model, every
writer and generator) and their associated state and systems; the owner, 2 November 2026:
"No strings refers to the compiler/decompiler/ and associated state and systems, not to the
logger, loggers use strings". No exception is approved: the specification lists none.

## Enforcement

Today's `lib/eslint.config.ts` enforces the January 2026 form of this ADR: regex literals
and the `RegExp` constructor are errors; `startsWith`, `endsWith`, `indexOf`,
`lastIndexOf` and non-literal `includes` are banned in `src/` outside three modules;
`castr/no-magic-string-comparison` bans string-literal comparison in binary expressions
while allowing `typeof` narrowing; and test files are excluded. It does not yet enforce the
amendment, and this present code does not meet it:

- the three modules the January form designated for data-string parsing,
  `src/shared/ref-resolution.ts`,
  `src/schema-processing/parsers/openapi/builder.component-ref-resolution.ts` and
  `src/schema-processing/context/template-context.status-codes.ts`, which parse with
  string methods;
- the lodash function-call form that the configuration calls this repository's sanctioned
  idiom, which never had this ADR's sanction;
- the configuration's switched-off `sonarjs/prefer-native-lodash-alternative`, which
  SPEC-G-3 counts as red.

SPEC-AR-3 binds the present code today.

## Scope Definition (Session 3.3a.01 Audit, amended 2 November 2026)

### What This ADR Bans

String/regex heuristics that derive meaning from TypeScript source code text when an AST with semantic APIs exists:

1. **Text comparison for identity**: `node.getText() === 'z'` instead of symbol resolution
2. **Text comparison for semantics**: `expression.includes('.optional()')` instead of AST chain analysis
3. **Naming-convention heuristics**: `name.endsWith('Schema')` instead of a symbol table
4. **getText()-then-manipulate**: Getting source text then parsing with string methods, when `getName()`, `getLiteralValue()`, or symbol resolution could extract the information directly
5. **String manipulation of any kind** (since 2 November 2026), as defined in the amendment above

### What This ADR Allows

- A parser for a named grammar tokenising that grammar, tested against the grammar's specification
- Comparing a whole value with a typed constant
- Array `.includes()` on typed arrays (not a string operation)
- Exceptions: none; each would be an owner-approved entry in the specification

**`getText()` principle:** `getText()` is banned for identity or semantic comparison (`=== 'z'`, `=== 'undefined'`). Prefer ts-morph semantic APIs (`getName()`, `getLiteralValue()`, `getLiteralText()`, symbol resolution) in all cases. `getText()` may be used only for data extraction from a known node type when no semantic API exists, and never for comparison.

**Amendment — `Identifier.getText()` (2026-02-16):** ts-morph's `Identifier` class inherits from `CommonIdentifierBase`, which exposes exactly one method for reading the identifier's name: `getText()`. There is no `getName()`, `getIdentifierText()`, or equivalent semantic API on `Identifier`. The `getText()` return value for an `Identifier` node IS the identifier name by definition — it is not arbitrary source text, but the single token that constitutes the node. Therefore, `Identifier.getText()` is allowed when:

1. The node has been type-narrowed via `Node.isIdentifier(node)` (proving it is an `Identifier`)
2. The comparison is against a typed constant (not an inline magic string)
3. No symbol resolution alternative exists (e.g., the identifier is not an import binding)

This is enforced by an ESLint selector exemption for `getText()` calls on nodes that have been narrowed to `Identifier` via `Node.isIdentifier()`. See `lib/eslint.config.ts`.

### Enforcement Principle

**String manipulation is banned in the compiler, the decompiler and their associated state and systems, and TS-source heuristics in all `src/` files. Logging is outside the rule. The only exceptions are owner-approved entries in the specification, and there are none.**

| Scope    | Files                                                               | Policy                                                               |
| -------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Banned   | The compiler, the decompiler and their associated state and systems | String manipulation; `getText()` identity, regex and text comparison |
| Allowed  | Parsers for a named grammar                                         | Tokenising that grammar, tested against its specification            |
| Allowed  | Everywhere                                                          | Comparing a whole value with a typed constant                        |
| Excepted | Owner-approved entries in the specification                         | None                                                                 |
| Outside  | Logging                                                             | Loggers use strings (owner, 2 November 2026)                         |

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
- `Roadmap (Session 3.3a): ADR-026 Enforcement + Strictness Remediation` (.agent/plans/roadmap.md)
- [ts-morph documentation](https://ts-morph.com/)
