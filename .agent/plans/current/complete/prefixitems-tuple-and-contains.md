# Plan: `prefixItems` Tuple Writer Fix + `contains` Keyword Support

**Status:** ✅ Complete — implemented and verified, all quality gates green (2026-03-26)
**Created:** 2026-03-26
**Predecessor:** [pattern-properties-and-property-names.md](./pattern-properties-and-property-names.md), [discovery-and-prioritisation.md](./discovery-and-prioritisation.md)
**Related:** [json-schema-parser.md (historical remediation context)](./json-schema-parser.md), [session-entry.prompt.md](../../prompts/session-entry.prompt.md)

---

## User Impact

1. **`prefixItems` (bug fix):** Zod `z.tuple()` already parses into IR `prefixItems`, but the Zod writer fails instead of emitting `z.tuple()` back. This breaks the Zod round-trip for any schema using tuples. TypeScript also cannot emit tuple types (`[string, number]`) despite the language fully supporting them. This is a **writer implementation bug**, not a format limitation.

2. **`contains` (new keyword):** `minContains` and `maxContains` are already in the IR but their parent keyword `contains` is not. Without `contains`, the existing `minContains`/`maxContains` fields are semantically incomplete. Adding `contains` completes the array validation story for JSON Schema 2020-12.

---

## Governing Principle

All supported keywords must be fully supported. Support is defined by the parser-writer pair — if a format can express a concept, our writer for that format must handle it. Silent omission and unnecessary fail-fast on expressible concepts are both doctrine violations.

---

## Scope

### Part A: `prefixItems` Tuple Writer Fix (Bug — Priority 1)

**In scope:**

1. Zod writer: replace `prefixItems` fail-fast with `z.tuple([...])` emission
2. TypeScript writer: replace `prefixItems` fail-fast with `[A, B, C]` tuple type emission
3. Update fail-fast tests → success tests proving correct output
4. Round-trip proof: Zod `z.tuple()` → IR → Zod `z.tuple()` (Scenario 2)

**Out of scope:**

- Zod `z.tuple().rest()` (rest element support) — future slice
- `unevaluatedItems` interaction with `prefixItems` — inherent Zod/TS limitation, fail-fast remains correct

### Part B: `contains` Keyword (New — Priority 2)

**In scope:**

1. Add `contains` field to `CastrSchema` IR model
2. IR validator: validate `contains` field
3. JSON Schema parser: parse `contains` from JSON Schema input
4. OpenAPI parser: parse `contains` from OAS 3.1 input (via 2020-12 builder)
5. JSON Schema writer: emit `contains` to output
6. Zod writer: fail-fast (no Zod equivalent for array-contains validation)
7. TypeScript writer: fail-fast (no TS equivalent)
8. Remove `contains` from `UNSUPPORTED_DOCUMENT_KEYWORDS` rejection seam
9. Round-trip proof: add `contains` to `2020-12-keywords.json` fixture
10. Update format tensions table

**Out of scope:**

- Zod `.refine()` approximation for `contains` — future opt-in lossy mode
- `$dynamicRef`, `if`/`then`/`else`, boolean schemas — separate future slices

---

## Assumptions to Validate

1. ✅ `z.tuple()` in Zod 4 accepts an array of schemas and produces correct output via ts-morph
2. ✅ TypeScript tuple type syntax `[A, B, C]` can be emitted via `CodeBlockWriter`
3. ✅ The existing Zod parser `z.tuple()` → `prefixItems` mapping produces correct IR (confirmed: test exists in `zod-parser.composition.unit.test.ts`)
4. ✅ `contains` has no interaction with existing `minContains`/`maxContains` parsing (they are already parsed independently)

---

## Measurable Success Criteria

- [x] Zod writer emits `z.tuple([z.string(), z.number()])` for `prefixItems: [{type: 'string'}, {type: 'number'}]`
- [x] TypeScript writer emits `[string, number]` for the same IR
- [x] Zod round-trip: `z.tuple([z.string(), z.number()])` → IR → `z.tuple([z.string(), z.number()])` is proven
- [x] `contains` field in IR, parsed from JSON Schema and OAS 3.1, written to JSON Schema output
- [x] JSON Schema round-trip: `contains` survives parse → IR → write → parse idempotently
- [x] `contains` removed from `UNSUPPORTED_DOCUMENT_KEYWORDS`
- [x] Zod/TS writers fail-fast on `contains` with actionable error
- [x] Format tensions table updated
- [x] `pnpm qg` exit 0

---

## TDD Order

### Part A: `prefixItems` Tuple Writer Fix

1. **Zod writer tuple emission** — update `writeArraySchema` in `collections.ts`:
   - Write failing test: schema with `prefixItems` emits `z.tuple([...])`
   - Implement: detect `prefixItems`, emit `z.tuple()` with recursive element writing
   - Update existing fail-fast test → expect success
2. **TypeScript writer tuple emission** — update `writeArrayType`:
   - Write failing test: schema with `prefixItems` emits `[string, number]`
   - Implement: detect `prefixItems`, emit bracket-delimited tuple type
   - Update existing fail-fast test → expect success
3. **Round-trip proof** — extend Scenario 2 or Scenario 5 fixture with tuple schema

### Part B: `contains` Keyword

4. **IR model + validator** — add `contains?: CastrSchema` to `CastrSchema`, validate in `hasValidSchemaStructure`
5. **JSON Schema parser** — remove from `UNSUPPORTED_DOCUMENT_KEYWORDS`, parse `contains` alongside `minContains`/`maxContains`
6. **JSON Schema writer** — emit `contains` in 2020-12 fields writer
7. **OpenAPI parser** — add `addContains()` to 2020-12 builder
8. **Zod/TS fail-fast** — add `contains` to `rejectUnsupportedArrayKeywords`
9. **Round-trip proof** — add `ContainsSchema` to `2020-12-keywords.json`
10. **Documentation** — update format tensions table, session-entry, roadmap

---

## Documentation Outputs

- TSDoc on new/modified functions
- Format tensions table updated in `session-entry.prompt.md`
- `roadmap.md` updated with completion
- Paused parser plan updated (mark `contains` as resolved)

---

## Execution Trigger

Plan approved by user → begin Part A (bug fix first), then Part B (new keyword).

---

## Quality Gate Protocol

Per `DEFINITION_OF_DONE.md`: `pnpm qg` must exit 0 after each part and at final completion.
