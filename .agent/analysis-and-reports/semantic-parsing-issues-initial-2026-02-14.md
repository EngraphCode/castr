# Semantic Parsing Issues — ADR-026 Violation Inventory

**Status:** 🔒 Frozen snapshot (initial catalogue)  
**Created:** 2026-02-14  
**Source:** `pnpm lint` (ESLint `no-restricted-syntax`) + source-code analysis

> [!NOTE]
> This file is the **initial violation inventory** captured when lint enforcement was enabled. It is not updated as violations are remediated. For current remediation progress, see [3.3a-03-zod-parser-semantic-parsing.md](../plans/current/complete/3.3a-03-zod-parser-semantic-parsing.md) — which owns Priorities 1, 2, and 4.

---

## Totals

- **167** lint-enforced violations (string methods, getText, regex) — caught by `pnpm lint`
- **158** magic-string comparisons (e.g. `=== 'object'`) — **now lint-enforced** via custom `castr/no-magic-string-comparison` rule
- **80** files affected

---

## Priority 1: getText() — TS-Source Identity Checks (15 violations)

ts-morph `getText()` used to derive semantic meaning from source text instead of using symbol resolution, `getName()`, or `getLiteralValue()`.

**All in `src/schema-processing/parsers/zod/`.**

| File                                                                                                                                               | Line | Code                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------- |
| [zod-ast.helpers.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.helpers.ts)                               | 20   | `expr.getText() === 'z'`                      |
| [zod-ast.helpers.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.helpers.ts)                               | 27   | `lhs.getText() === 'z'`                       |
| [zod-ast.helpers.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.helpers.ts)                               | 91   | `obj.getText() === 'z'`                       |
| [zod-ast.helpers.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.helpers.ts)                               | 98   | `root.getText() === 'z'`                      |
| [zod-ast.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.ts)                                               | 257  | `return node.getText()` — raw text extraction |
| [zod-ast.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.ts)                                               | 282  | `node.getText() === 'undefined'`              |
| [zod-ast.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.ts)                                               | 294  | `const text = node.getText()`                 |
| [zod-parser.detection.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.detection.ts)                     | 170  | `obj.getText() === 'z'`                       |
| [zod-parser.endpoint.extractors.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.endpoint.extractors.ts) | 109  | `stripQuotes(paramInit.getText())`            |
| [zod-parser.endpoint.extractors.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.endpoint.extractors.ts) | 179  | `stripQuotes(responseInit.getText())`         |
| [zod-parser.endpoint.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.endpoint.ts)                       | 140  | `stripQuotes(propInit.getText())`             |
| [zod-parser.endpoint.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.endpoint.ts)                       | 290  | `callExpr.getText() !== 'defineEndpoint'`     |
| [zod-parser.meta.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.meta.ts)                               | 281  | `return node.getText()`                       |
| [zod-parser.references.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.references.ts)                   | 25   | `const name = node.getText()`                 |
| [zod-parser.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.ts)                                         | 183  | `decl.initializer.getText()`                  |

**Remediation:** Use `getName()`, `getLiteralValue()`, symbol/import resolution, or `getExpression()`/`getNameNode()` AST traversal.

---

## Priority 2: IR Text Heuristics (3 violations)

Code using string heuristics on IR/intermediate data where structured properties should exist.

| File                                                                                                                                                             | Line                           | Code                                                                   | Problem                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [template-context.endpoints.dependencies.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.endpoints.dependencies.ts) | 30                             | `schemaName.startsWith('z.')`                                          | Checks if inline Zod — should be an explicit IR property                |
| [template-context.endpoints.from-ir.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.endpoints.from-ir.ts)           | 191                            | `!r.statusCode.startsWith('2')`                                        | Success-status heuristic — should use a structured property or constant |
| [builder.zod-chain.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/builder.zod-chain.ts)                                     | split on constraint expression | Parsing constraint expressions from strings instead of structured data |                                                                         |

**Remediation:** Add explicit IR properties (e.g. `isInlineSchema`, `isSuccessStatus`) or use imported constant ranges.

---

## Priority 3: $ref String Parsing (43 violations)

Ad-hoc `$ref` / JSON Pointer manipulation using `startsWith`, `split`, `slice`, `indexOf` — scattered across files instead of centralised.

| File                                                                                                                                                             | Violations | Methods                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------- |
| [ref-resolution.ts](file:///Users/jim/code/personal/castr/lib/src/shared/ref-resolution.ts)                                                                      | 16         | startsWith, slice, indexOf, split |
| [builder.circular.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/builder.circular.ts)                                       | 7          | startsWith, split, slice, indexOf |
| [template-context.mcp.inline-json-schema.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.mcp.inline-json-schema.ts) | 7          | startsWith, slice, indexOf        |
| [template-context.endpoints.helpers.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.endpoints.helpers.ts)           | 5          | indexOf, slice, split             |
| [convert-schema.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/conversion/json-schema/convert-schema.ts)                                    | 3          | startsWith, slice, includes       |
| [builder.dependency-graph.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/builder.dependency-graph.ts)                       | 2          | indexOf, slice                    |
| [builder.parameters.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/builder.parameters.ts)                                   | 2          | startsWith, split                 |
| [builder.request-body.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/builder.request-body.ts)                               | 2          | startsWith, split                 |
| [builder.responses.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/builder.responses.ts)                                     | 2          | startsWith, split                 |
| [template-context.common.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.common.ts)                                 | 1          | split                             |
| [schema-sorting.ts](file:///Users/jim/code/personal/castr/lib/src/shared/utils/schema-sorting.ts)                                                                | 1          | startsWith                        |

**Remediation:** Centralise all `$ref` operations into `ref-resolution.ts` API; all other files must call its functions, not re-implement parsing.

---

## Priority 4: Naming / Identifier Heuristics (15 violations)

String pattern matching on identifier names for classification or transformation.

| File                                                                                                                                         | Violations | Pattern                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| [zod-parser.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.ts)                                   | 4          | `endsWith('Schema')`, `endsWith('schema')`, slice                   |
| [zod-parser.endpoint.builder.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.endpoint.builder.ts) | 3          | `endsWith('Schema')`, slice, includes                               |
| [zod-ast.object-props.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-ast.object-props.ts)               | 5          | Quote detection (`startsWith("'")`, `endsWith("'")`), slice         |
| [identifier-utils.ts](file:///Users/jim/code/personal/castr/lib/src/shared/utils/identifier-utils.ts)                                        | 1          | trim                                                                |
| [template-context.mcp.naming.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.mcp.naming.ts)     | 5          | Path segment parsing (`{param}`), trim, startsWith, endsWith, slice |

**Remediation:** For ts-morph identifiers, use `getName()` / `getLiteralValue()` / `getKind()`. For IR data, use structured properties instead of naming conventions.

---

## Priority 5: URL / Path-Template / Data-Format Parsing (25 violations)

String methods operating on URLs, OpenAPI path templates, JSON Pointer paths, file extensions.

> [!NOTE]
> URL parsing should use the built-in `URL` class where possible, not string manipulation.

| File                                                                                                                  | Violations | What it parses                                             |
| --------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------- |
| [path-utils.ts](file:///Users/jim/code/personal/castr/lib/src/shared/utils/path-utils.ts)                             | 20         | OpenAPI path templates (`/users/{id}`), naming conventions |
| [normalize-input.ts](file:///Users/jim/code/personal/castr/lib/src/shared/load-openapi-document/normalize-input.ts)   | 3          | URL vs file-path detection — use `URL` class               |
| [templating.ts](file:///Users/jim/code/personal/castr/lib/src/rendering/templating.ts)                                | 3          | File extension checking, group strategy                    |
| [upgrade-validate.ts](file:///Users/jim/code/personal/castr/lib/src/shared/load-openapi-document/upgrade-validate.ts) | 1          | OpenAPI version string check                               |

---

## Priority 6: Validation-Error Formatting (29 violations)

All in [validation-errors.ts](file:///Users/jim/code/personal/castr/lib/src/shared/load-openapi-document/validation-errors.ts).

| Type            | Count | Purpose                                |
| --------------- | ----- | -------------------------------------- |
| `includes()`    | 11    | Pattern matching on AJV error messages |
| `toLowerCase()` | 6     | Case-insensitive message comparison    |
| `split()`       | 4     | JSON Pointer path segment parsing      |
| `endsWith()`    | 2     | Path suffix matching                   |
| `startsWith()`  | 1     | Leading-slash removal                  |
| `slice()`       | 1     | Substring extraction                   |

**Remediation:** This file parses AJV validation output, which is external string data. Consider a structured error-classification approach. JSON Pointer parsing should use a dedicated utility.

---

## Priority 7: Array / Collection Membership Checks (34 violations)

`.includes()` calls — mix of array operations on variables (false positives from the selector) and genuine string operations.

| File                                                                                                                                           | Violations | Nature                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| [template-context.mcp.responses.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.mcp.responses.ts) | 7          | Likely array `.includes()`              |
| [template-context.endpoints.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.endpoints.ts)         | 3          | Likely array `.includes()`              |
| [builder.core.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/builder.core.ts)                             | 2          | Likely array `.includes()`              |
| [cli-type-guards.ts](file:///Users/jim/code/personal/castr/lib/src/validation/cli-type-guards.ts)                                              | 2          | Array `.includes()` for enum validation |
| [type-guards.ts](file:///Users/jim/code/personal/castr/lib/src/validation/type-guards.ts)                                                      | 1          | Array `.includes()`                     |
| [schema-types.ts](file:///Users/jim/code/personal/castr/lib/src/shared/utils/schema-types.ts)                                                  | 1          | Array `.includes()`                     |
| Others                                                                                                                                         | 18         | Mixed — needs per-instance review       |

> [!NOTE]
> The `.includes()` selector exempts `[a,b].includes(x)` (inline array literals) but catches `list.includes(x)` (variable arrays) since ESLint cannot distinguish array variables from string variables without type info. Many of these may be false positives.

---

## Priority 8: Cosmetic / Display Transforms (12 violations)

String methods used for display formatting or cosmetic normalisation. Most likely to be pure display logic.

| File                                                                                                                               | Violations | Methods           | Context                         |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- | ------------------------------- |
| [template-context.mcp.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.mcp.ts)         | 2          | trim, toUpperCase | Formatting titles               |
| [maybe-pretty.ts](file:///Users/jim/code/personal/castr/lib/src/shared/maybe-pretty.ts)                                            | 1          | trim              | Trimming input before formatter |
| [parameter-metadata.ts](file:///Users/jim/code/personal/castr/lib/src/endpoints/parameter-metadata.ts)                             | 1          | trim              | Trimming parameter descriptions |
| [writers/typescript/endpoints.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/writers/typescript/endpoints.ts) | 1          | toLowerCase       | Case normalisation in output    |
| [writers/markdown/index.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/writers/markdown/index.ts)             | 1          | toUpperCase       | HTTP method display             |
| [boolean-utils.ts](file:///Users/jim/code/personal/castr/lib/src/shared/utils/boolean-utils.ts)                                    | 1          | toLowerCase       | Boolean string normalisation    |

**Review needed:** Determine which are genuinely display-only (and should be exempted) vs. which are deriving semantic meaning from case (and should be replaced with a structured approach).

---

## Lint-Enforced: Magic-String Comparisons (158 violations)

String literal comparisons (`=== 'object'`, `!== 'null'`, etc.) that should use imported constants. Enforced via the custom `castr/no-magic-string-comparison` ESLint rule (inline plugin in `lib/eslint.config.ts`).

**Remediation path:** (a) Create a constants file defining all IR discriminant values, (b) replace magic strings with imported constants, (c) enforce via a custom `@typescript-eslint` rule with typed services.

**Most frequent magic strings:**

| Value                   | Count | Typical pattern                                       |
| ----------------------- | ----- | ----------------------------------------------------- |
| `'object'`              | 9     | `type === 'object'`, `kind === 'object'`              |
| `'schema'`              | 8     | `kind === 'schema'`                                   |
| `'path'`                | 8     | `location === 'path'`                                 |
| `'string'`              | 7     | `type === 'string'` (not typeof — those are exempted) |
| `'null'`                | 6     | `type === 'null'`                                     |
| `'array'`               | 6     | `type === 'array'`                                    |
| `'number'`              | 6     | `type === 'number'`                                   |
| `'z'`                   | 6     | `getText() === 'z'`                                   |
| `'integer'`             | 4     | `type === 'integer'`                                  |
| `'200'`/`'201'`/`'204'` | 6     | Status-code discrimination                            |
| Other                   | ~91   | Various IR/OpenAPI discriminants                      |
