# OpenAPI Version Differences (3.0.x vs 3.1.x)

> **22 November 2026:** [the specification](./SPECIFICATION.md) at 0.8.0 governs where this document
> differs. OpenAPI 2.0 and 3.0.x are not read (SPEC-FV-1), reading 3.0.x is a later
> capability (SPEC-C-3), and no document is rewritten from one version into another
> before Castr's parser reads it. What this document says about upgrading 3.0 or 2.0
> input no longer stands.

This document summarizes key differences between OpenAPI 3.0.x and 3.1.x that affect Castr's processing.

## Key Differences

| Feature              | 3.0.x             | 3.1.x                                 |
| -------------------- | ----------------- | ------------------------------------- |
| Nullable             | `nullable: true`  | `type: ['string', 'null']`            |
| Paths field          | **Required**      | Optional (if webhooks present)        |
| `examples` in Schema | Single value only | Array supported (JSON Schema 2020-12) |
| `jsonSchemaDialect`  | Not allowed       | Optional                              |
| `webhooks`           | Not allowed       | Optional                              |

## Upgrade Pipeline

Castr uses Scalar's `upgrade()` function to convert all input to **OpenAPI 3.1 syntax BEFORE parsing**. This means parsers only handle 3.1 syntax.

```text
Input → bundle() → validate() → upgrade() → [PARSER] → IR
                                      ^
                                      |
                          3.1 syntax guaranteed here
```

**Implications:**

- No handling of `nullable: true` (upgraded to `type: [..., 'null']`)
- No handling of tuple-style `items` (upgraded to `prefixItems`)
- Parser is **pure extraction** — map 3.1 fields directly to IR

## Scalar Validator Behavior

Verified via integration tests in `scalar-behavior.integration.test.ts`.

**Confirmed Limitations** (Scalar does NOT reject these):

| Issue                                       | Expected per Spec | Scalar Behavior    |
| ------------------------------------------- | ----------------- | ------------------ |
| `nullable: true` in 3.1.x                   | Reject            | ❌ Passes silently |
| `exclusiveMinimum: true` (boolean) in 3.1.x | Reject            | ❌ Passes silently |

**Confirmed Working:**

| Feature                                                         | Behavior                     |
| --------------------------------------------------------------- | ---------------------------- |
| Component types (`examples`, `links`, `callbacks`, `pathItems`) | ✅ Validated                 |
| Extension fields (`x-*`)                                        | ✅ Accepted                  |
| Unresolvable `$ref`                                             | ✅ Rejected                  |
| Circular `$ref`                                                 | ✅ Accepted (valid per spec) |
| Missing response `description`                                  | ✅ Rejected                  |
| `webhooks` in 3.0.x                                             | ✅ Rejected                  |
| `jsonSchemaDialect` in 3.0.x                                    | ✅ Rejected                  |
