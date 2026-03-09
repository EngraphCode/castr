# Plan (Active): Recursive Wrapper Remediation

**Status:** ✅ Complete
**Created:** 2026-03-08
**Last Updated:** 2026-03-08
**Predecessor:** Zod Transform Defect Quarantine Remediation (complete)

---

## Problem Statement

Recursive getter wrappers in Zod 4 are not round-tripping losslessly:

- Optional recursive references like `TreeNodeSchema.optional()` are dropped during the first Zod parse.
- Nullable and nullish recursive references like `LinkedListNodeSchema.nullable()` / `.nullish()` must survive through OpenAPI and JSON Schema detours and be reconstructed canonically in generated Zod.

This work is constrained to the smallest lossless remediation path:

1. Optional recursive refs must remain plain `$ref` plus parent optionality.
2. Nullable/nullish recursive refs must first be represented with existing composition IR (`anyOf: [{$ref}, {type: 'null'}]`).
3. Pure helper extraction and unit-test TDD are preferred everywhere feasible.

### Final State

- Optional recursive refs now survive the first Zod parse as direct `$ref` properties with parent-level optionality.
- Nullable and nullish recursive refs now survive as `anyOf: [{$ref}, {type: 'null'}]`.
- Zod generation reconstructs recursive getters canonically as `.optional()`, `.nullable()`, and `.nullish()` where appropriate.
- Recursion payload parity was restored in scenarios 2, 4, and 6.

---

## Grounded Baseline

Observed against `lib/tests-fixtures/zod-parser/happy-path/recursion.zod4.ts` before remediation:

- `Category.subcategories` survives the first Zod parse as `array(items.$ref=Category)`.
- `TreeNode.left/right` are missing from the first IR entirely.
- `LinkedListNode.next` is missing from the first IR entirely.
- Generated Zod after `Zod -> IR -> OpenAPI -> IR -> Zod` therefore loses recursive getter semantics for `TreeNode` and `LinkedListNode`.

This means the previous limitations diagnosis was too late in the pipeline for optional recursion. The first proven loss point is the Zod parser.

---

## Target Shapes

### Optional Recursive Ref

- IR shape: direct `$ref`
- Property optionality: represented only by parent `required` omission
- Generated Zod target: `get left() { return TreeNode.optional(); }`

### Nullable Recursive Ref

- IR shape: `anyOf: [{$ref}, {type: 'null'}]`
- Property optionality: property remains required
- Generated Zod target: `get next() { return LinkedListNode.nullable(); }`

### Nullish Recursive Ref

- IR shape: same nullable composition plus parent `required` omission
- Generated Zod target: canonical nullable+optional reconstruction from the existing IR representation

---

## Required Test Coverage

- Pure helper unit tests for wrapper classification and IR mapping
- Zod parser tests for identifier-rooted recursive wrappers
- Zod writer tests for wrapped recursive getter emission
- OpenAPI writer/parser tests for nullable reference composition
- JSON Schema writer/parser tests for nullable reference composition
- Transform and payload coverage proving recursion fixtures regain meaningful parity assertions

---

## Implementation Notes

- Do not add new public APIs.
- Do not invent new IR fields unless the existing composition-based nullable representation fails acceptance criteria.
- Update `zod-round-trip-limitations.md` so it matches the proven behavior after remediation.

## Completed Work

- Added pure helper coverage for recursive reference wrapper classification and IR mapping.
- Extended the Zod reference parser to handle identifier-rooted wrapper chains.
- Extended recursive getter detection to recognize wrapped reference compositions.
- Added canonical writer emission for nullable recursive reference compositions.
- Restored nested recursion validation payloads for transform parity.
