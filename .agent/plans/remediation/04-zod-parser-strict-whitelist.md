# Plan: Zod Parser Strict Whitelist (fail-fast on unrecognised constructs)

**Status:** Backlog (remediation) · **Findings:** C5 · **Risk:** Medium
**References:** report `02-findings-critical.md` (C5); ADR-032 (Zod input strategy — "content loss is not acceptable"); `principles.md` Fail-Fast; `parsers/zod/composition/{zod-parser.union,zod-parser.composition}.ts`, `parsers/zod/types/{zod-parser.primitives.chain,zod-parser.object}.ts`

---

## User impact

`parseZodSource` **silently drops content** with `errors: []`: union/tuple members that don't parse vanish (arity
corrupts), `z.nativeEnum` loses its value set, `.refine()` predicates are erased, object-level `.refine()`/`.readonly()`
disappear. A consumer regenerating from the IR gets a schema that accepts inputs the original rejected. ADR-032 declares
Zod ingestion lossless; this is the gap.

## Root cause

Parsing dispatch is an ad-hoc **blacklist** (only explicitly-handled constructs are rejected); anything unrecognised is
skipped, widened, or text-captured with arguments destroyed.

## Scope

In scope: replace the per-kind blacklists with explicit **whitelists** in the union/tuple/enum and primitive/object
chain dispatchers; any unrecognised member or chained method must `throw` a `PARSE_ERROR` naming the construct + source
location. Out of scope: adding _new_ supported constructs (separate slices) — this plan makes unsupported input
fail-fast, not silently lossy.

## Assumptions to validate

1. The parser already has a structured `PARSE_ERROR` channel (it does — `3.3a-06` added it for declarations); extend it
   to members/chain methods.
2. Existing fixtures use only supported constructs (so adding fail-fast won't break green tests) — verify; quarantine any
   that rely on the silent-drop behaviour.

## Success criteria

- `parseZodSource` on `z.union([z.string(), z.coerce.number()])`, `z.tuple([…, z.coerce.number(), …])`,
  `z.nativeEnum(...)`, `z.string().refine(...)`, `z.strictObject({...}).refine(...)` each returns a **non-empty
  `errors`** (fail-fast), not silent loss.
- No `return undefined`/`continue` path drops a construct without recording a `PARSE_ERROR`.
- Behavioural tests assert the fail-fast for each (red first).
- `pnpm qg` green.

## TDD order

1. Add failing tests asserting fail-fast for each silent-drop case. 2. Convert union/tuple/enum/chain dispatch to
   whitelist + throw. 3. Quarantine/adjust any fixture relying on silent drop. 4. Gate green.
