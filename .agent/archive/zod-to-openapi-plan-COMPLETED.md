# Phase 2 Plan: Zod → OpenAPI (Implementation Complete)

**Date:** January 12, 2026  
**Status:** Implementation Complete ✅  
**Sessions 2.1-2.5:** 203 new tests

---

## Strategic Goal

Prove the IR architecture works bidirectionally: `OpenAPI ↔ Zod` via `CastrDocument`.

---

## Key Decisions

| Decision         | Choice                        | Rationale                 |
| ---------------- | ----------------------------- | ------------------------- |
| Zod version      | Zod 4 only                    | Strict rejection of Zod 3 |
| Input strictness | Strict validation             | Reject malformed input    |
| Metadata         | Deterministic recommendations | No AI-generated content   |
| Parsing          | ts-morph AST                  | No regex (ADR-026)        |

---

## Completed Sessions

<details>
<summary><strong>Session 2.1: Zod 4 Parser Foundation</strong> — 46 tests</summary>

- Zod 4 detection, dynamic schema rejection
- Primitives: string, number, boolean
- Object parsing, variable name extraction
- Deterministic recommendations

</details>

<details>
<summary><strong>Session 2.2: Constraints & Modifiers</strong> — 35 tests</summary>

- Chain walking: .min(), .max(), .length(), .regex()
- Optionality: .optional(), .nullable(), .nullish()
- String formats: .email(), .url(), .uuid(), .datetime()
- Number constraints, defaults, descriptions

</details>

<details>
<summary><strong>Session 2.3: Composition & References</strong> — 35 tests</summary>

- Arrays with item types and constraints
- Enums, unions, discriminated unions
- Intersections → allOf
- Lazy schemas, variable references

</details>

<details>
<summary><strong>Session 2.4: Endpoint Parsing</strong> — 14 tests</summary>

- EndpointDefinition types
- Path/query/header/cookie parameters
- Request bodies, multiple responses

</details>

<details>
<summary><strong>Session 2.5: OpenAPI Writer</strong> — 73 tests</summary>

- writeOpenApi(), writeOpenApiSchema()
- writeOpenApiComponents(), writeOpenApiPaths()
- OAS 3.1 nullable type arrays
- Bonus: Fixed 24 pre-existing parser lint errors

</details>

**Total: 203 new tests** → See [lib/src/parsers/zod/README.md](../../lib/src/parsers/zod/README.md)

---

## Next Phase: Validation

Current plan of record: `.agent/plans/roadmap.md` (Session 3.3).

---

## References

- [ADR-026: No String/Regex Heuristics for TS-Source Parsing](../../docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md)
- [Parser README](../../lib/src/parsers/zod/README.md)
