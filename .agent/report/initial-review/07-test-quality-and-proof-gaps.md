# Test Quality and Proof Gaps — the root cause

**Date:** 2026-06-04

## The thesis

castr has 246 passing test files and 14 green gates, yet ships the Critical/High bugs in `02`/`03`. That is only
possible because the proofs are **shallow in a specific, recurring way**: they assert at the _boundary_ (a field is
populated, a substring is present, a key list is stable) rather than the _behaviour_ (the generated validator rejects
bad data; the round-trip reproduces the input; the file bodies are byte-identical). `testing-strategy.md` names this and
forbids it — "No partial proof posture", "tests must prove behaviour, not implementation" — so this is drift from the
repo's own testing doctrine, not merely a gap.

## The five shapes of shallow proof (each let a real bug through)

### 1. Substring presence instead of behaviour → hid C6

`writers/zod/fail-fast.unit.test.ts` asserts `expect(output).toContain('.refine(')` and a keyword substring, under a
header that claims it "PROVES … semantic .refine() output." It never builds or executes the generated Zod. That is how
the `dependentSchemas`/`if-then-else` `return true` no-ops and the `typeof === 'integer'` rejects-everything bugs (C6)
passed as "supported." **Fix:** evaluate the generated schema and assert accept/reject on representative valid/invalid
data. (H7)

### 2. Asserting on the wrong object → vacuous negatives (H7)

`rendering/templates/schemas-with-metadata.test.ts:544-545,621` call `expect(result).not.toContain(...)` on the
`GenerationResult` _object_, not `result.content`. Proven by execution to pass unconditionally. The "should NOT
generate validation helpers / schema registry" guarantees are therefore untested. **Fix:** `assertSingleFileResult` then
assert on `.content`.

### 3. Boundary-only proof for a claimed end-to-end surface → hid C5/C6

`parsers/json-schema/index.unit.test.ts:411` asserts `if/then/else` is "now supported" by checking the IR fields are
populated — never carrying it through to the Zod writer (where C6 breaks it). The parser proves ingestion; nothing proves
the _pair_ (input → IR → output). **Fix:** pair-level tests that go all the way to executed output.

### 4. Comparing keys instead of content → weak determinism proof (L13)

`rendering/templating.unit.test.ts:185-187` asserts the sorted _path key lists_ match across two runs but never compares
`files` _content_. Non-deterministic bodies would pass. `DEFINITION_OF_DONE.md` requires "byte-for-byte equality."
**Fix:** `expect(firstRun.files).toEqual(secondRun.files)`.

### 5. Happy-path-only fixtures → hid C4

`ir/serialization.unit.test.ts:23` round-trips only a _non-empty_ `CastrSchemaProperties`. The empty-`properties` case —
which throws on deserialize (C4) — is never exercised. **Fix:** add the empty-map fixture (it will go red until C4 is
fixed).

## Test-hygiene defects (independent of the above)

- **M4** — `zod-parser.runner.integration.test.ts` does filesystem IO (`fs.readdir`/`readFile`/`writeFile`) inside the
  `pnpm test` chain; violates "integration tests do not trigger IO". Also soft-skips missing fixtures via `console.warn`.
- **M5** — `logger.test.ts` mutates global `console` via `vi.spyOn` (banned global-state mutation) and includes a
  types-only `expectTypeOf` test (the strategy says delete types-only tests).

## The structural fix (see `09` for sequencing)

1. **A package-integrity gate** (`publint` + `@arethetypeswrong/cli`) — catches C1, which no test currently can.
2. **Round-trip / property gates** — `parse → IR → write → parse` equality across a fixture matrix that _includes_ the
   edge cases (empty `properties`, dotted component names, AND-security, `4XX`, boolean `exclusiveMinimum`,
   `contentEncoding`). Catches C2–C4, H1–H4, M10.
3. **Generated-validator execution** — compile/evaluate emitted Zod and assert accept/reject. Catches C6.
4. **Lint the proofs themselves** — ban `toContain`/`toMatch` on non-string receivers; require executed-behaviour
   assertions for any test file whose name/headers claim "semantic" or "supported."

Each of these turns a class of today's silent failures into a red test — which is the only durable way to keep the
doctrine's hard claims honest.
