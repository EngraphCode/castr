# Plan: IR Semantic Audit

**Status:** ✅ Complete  
**Priority:** 3.1a  
**Prerequisite for:** Zod 4 Feature Improvements, Zod → IR Parser

---

## Goal

Ensure the IR is **format-agnostic** — it should represent schema semantics without bias toward OpenAPI, Zod, or JSON Schema.

---

## Background

The IR (`CastrSchema`, `CastrDocument`, etc.) sits at the center of Castr's architecture. All parsers produce IR; all writers consume IR. If the IR documentation or field semantics favor one format, it creates conceptual coupling that limits the system's universality.

**Issue identified:** Some TSDoc comments reference JSON Schema 2020-12 as the "source of field semantics." The IR should define its own semantics.

---

## Scope

### In Scope

1. **Audit `lib/src/ir/schema.ts`** — Review every TSDoc comment for format-specific language
2. **Audit `lib/src/ir/schema.types.ts`** — Same review
3. **Document findings** — List specific lines with format bias
4. **Remediate** — Rewrite biased documentation to be format-agnostic

### Out of Scope

- Changing IR type definitions (only documentation)
- Adding new IR fields
- Parser/writer changes

---

## Audit Checklist

For each field in the IR, verify:

- [ ] TSDoc describes **what the field represents**, not where it comes from
- [ ] No references to "JSON Schema" as the semantic authority
- [ ] No references to "OpenAPI" as the semantic authority
- [ ] If a field originated from a specific format, document it as "commonly mapped to X in OpenAPI" (passive, not authoritative)

---

## Expected Findings

Based on initial review, these areas likely need attention:

| Field                   | Current                       | Issue                                                 |
| ----------------------- | ----------------------------- | ----------------------------------------------------- |
| `title`                 | "JSON Schema 2020-12 keyword" | Should describe semantic meaning                      |
| `prefixItems`           | References JSON Schema        | Should describe as tuple schema support               |
| `unevaluatedProperties` | References JSON Schema        | Should describe as strict additional property control |

---

## Success Criteria

1. No TSDoc in `lib/src/ir/` references JSON Schema as the authoritative semantic source
2. All field descriptions focus on **what** rather than **where from**
3. Quality gates pass
4. No functional changes to IR behavior

---

## Deliverables

1. Updated `lib/src/ir/schema.ts` with format-agnostic TSDoc
2. Updated `lib/src/ir/schema.types.ts` if needed
3. Summary of changes made

---

## References

- [VISION.md](../../.agent/VISION.md) — IR as single source of truth
- [ADR-023](../../docs/architectural_decision_records/ADR-023-ir-based-architecture.md) — IR architecture
