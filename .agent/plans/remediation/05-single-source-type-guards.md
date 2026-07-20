# Plan: Single-Source Type Guards (`isRecord` / `isCastrSchema`)

**Status:** Backlog (remediation) · **Findings:** M3, C4 · **Risk:** Low-Medium
**References:** report `04-findings-medium.md` (M3), `02` (C4); `principles.md` §3 (single source of truth for types); `shared/type-utils/{types,type-guards}.ts`, `shared/openapi/version.ts`, `shared/load-openapi-document/additional-operations-validation/index.ts`, `ir/serialization.ts`

---

## User impact

A single conceptual predicate has forked into **four divergent `isRecord`** (and two `isCastrSchema`) with conflicting
behaviour. The `types.ts` variant rejects `{}` (`isRecord({}) === false`), which **breaks `serializeIR → deserializeIR`
for an object schema with empty `properties`** (C4 — verified throw). Another (`version.ts`) treats arrays as records.

## Scope

In scope: consolidate to **one** canonical `isRecord` (plain non-null, non-array object: `typeof v === 'object' &&
v !== null && !Array.isArray(v)`) and one `isCastrSchema`; repoint all importers; delete the per-file copies. Out of
scope: broader IR validation redesign.

## Assumptions to validate

1. The lenient `type-guards.ts` semantics (accept `{}`) is the correct contract for all ~19 importers (the IR
   validators/serializers and the public re-export). Verify no caller depends on the `{}`-rejecting behaviour.
2. The `version.ts` array-accepting variant has no caller relying on arrays-as-records.

## Success criteria

- Exactly one `isRecord` and one `isCastrSchema` definition; all imports resolve to it.
- `isRecord({}) === true`, `isRecord([]) === false`, `isRecord(null) === false`; unit tests for each.
- `buildIR({type:'object', properties:{}}) → serializeIR → deserializeIR` round-trips (C4 green) — add the fixture
  (shared with plan 02).
- ~~`pnpm qg` green; `knip`/`depcruise` clean after the deletions.~~ **(Superseded 2026-07-17: use `pnpm check` locally / `pnpm check:ci` non-mutating — never `pnpm qg` directly — per the [parallel execution program](../remediation/00-parallel-execution-program.md) execution rules.)**

## TDD order

1. Add unit tests for the canonical guard (`{}`, `[]`, `null`, `{a:1}`) + the C4 round-trip — red. 2. Implement the
   canonical guard; repoint imports; delete duplicates. 3. Gate green.
