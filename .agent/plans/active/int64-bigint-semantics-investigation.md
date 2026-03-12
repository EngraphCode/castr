# Plan (Active): `int64` / `bigint` Semantics Investigation

**Status:** Active  
**Created:** 2026-03-11  
**Last Updated:** 2026-03-12  
**Predecessor Context:** [strict-object-semantics-enforcement.md](../current/complete/strict-object-semantics-enforcement.md)  
**Related:** `docs/architecture/zod-round-trip-limitations.md`, `ADR-031`, `ADR-032`, `ADR-035`, `lib/src/schema-processing/parsers/zod/types/zod-parser.zod4-formats.ts`, `lib/src/schema-processing/writers/zod/generators/primitives.ts`

---

This is now the **single primary active atomic slice** for the remaining numeric-semantics seam in the Zod limitations workstream.

The strict-object semantics enforcement slice is complete, and the next session should now investigate `int64` / `bigint` doctrine before introducing any new public API or strategy surface.

The default stance remains:

- keep `format: int64` -> `z.int64()` -> `bigint`
- do not introduce a user-facing strategy flag unless the investigation proves a single canonical policy cannot satisfy doctrine

## Summary

This slice exists to decide what semantic target Castr should preserve for:

1. OpenAPI / JSON Schema `type: integer`, `format: int64`
2. direct `z.bigint()`
3. detours through portable formats that cannot literally encode JavaScript `bigint`

The current repo truth is internally consistent but ergonomically awkward:

- `z.int64()` validates `bigint`
- `z.bigint()` parses as `type: integer`, `format: "bigint"`
- portable detours can preserve internal consistency while still being surprising at JSON transport boundaries

## Intended Impact

This active slice should end with:

1. one explicit semantic target for `int64`
2. one explicit decision for direct `z.bigint()`
3. durable documentation updates before any discussion of configuration or public API options

## Scope

In scope:

- direct `z.int64()` semantics
- direct `z.bigint()` semantics
- OpenAPI / JSON Schema detours for both
- fixture/runtime ergonomics at the transport boundary
- whether a transport/runtime semantic split is architecturally required

Out of scope by default:

- introducing a user-facing `int64` strategy flag
- broad numeric-policy redesign beyond `int64` and `bigint`
- unrelated parser/writer cleanup

## Questions To Answer

1. Is the current `z.int64()` -> `bigint` behaviour the correct permanent doctrine, or only a provisional mapping?
2. Is `z.bigint()` best treated as a native-only semantic that portable formats cannot honestly preserve?
3. Does the IR need a transport/runtime distinction here, or would that be an avoidable complication?
4. Would a configurable strategy be architectural excellence or an escape hatch?
5. Is there a more honest answer than the current mapping that still satisfies strictness, determinism, and losslessness?

## Code Surfaces

- `lib/src/schema-processing/parsers/zod/types/zod-parser.zod4-formats.ts`
- `lib/src/schema-processing/parsers/zod/types/zod-parser.primitives.ts`
- `lib/src/schema-processing/writers/zod/generators/primitives.ts`
- `lib/tests-fixtures/zod-parser/happy-path/primitives.zod4.ts`
- `lib/tests-fixtures/zod-parser/happy-path/primitives.expected.json`
- `lib/tests-transforms/__tests__/zod-format-functions.integration.test.ts`
- Scenario 2 / 4 / 6 transform proofs where numeric fixtures are relevant

## Fix Families To Compare When Activated

1. **Keep current behaviour**
   - canonical `z.int64()` / `bigint`
2. **JSON-friendly weakening**
   - model `int64` as `number().int()` and accept domain loss
3. **Transport/runtime split**
   - preserve `int64` semantics separately from the runtime carrier
4. **Configurable strategy**
   - only consider if the first three families all fail the repo's doctrine or user impact

## Session Expectations

While this plan is active, keep all of the following true:

1. `session-entry.prompt.md` and `roadmap.md` stay pointed here as the primary entrypoint
2. the next session can focus on numeric semantics without reopening the recursive seam accidentally
3. no implementation path introduces a user-facing strategy flag unless the investigation proves it is required

## Reviewer Cadence

For this active slice:

1. invoke `code-reviewer` after non-trivial changes
2. invoke `zod-expert`, `type-reviewer`, and `test-reviewer` for parser/writer/proof work
3. invoke `openapi-expert` and `json-schema-expert` if portable-format semantics are changed or newly extended

## Documentation Outputs

When this slice closes, update durable truth in:

- `docs/architecture/zod-round-trip-limitations.md`
- ADR-031 if the output policy changes
- ADR-032 if the input contract changes
- ADR-035 if proof obligations change
