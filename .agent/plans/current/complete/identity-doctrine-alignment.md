# Plan (Complete): IDENTITY Doctrine Alignment — Strict-Only Object Semantics

**Status:** Complete — implemented, documented, and full repo-root gate chain green on 2026-03-21
**Created:** 2026-03-21
**Last Updated:** 2026-03-21
**Predecessor:** [doctor-rescue-loop-runtime-redesign.md](./doctor-rescue-loop-runtime-redesign.md)
**Related:** [IDENTITY.md](../../IDENTITY.md), [ADR-038](../../../docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md), [ADR-040](../../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)
**Successor:** [architecture-review-packs.md](../../active/architecture-review-packs.md)
**Paused Successor:** [json-schema-parser.md](../paused/json-schema-parser.md)

---

This plan enforces IDENTITY.md's canonical doctrine: Castr has **one object model** — closed-world with explicit properties. The IR carries no dual semantics. Non-strict input is rejected at the core pipeline boundary. Strip normalization is a doctor concern only.

## Completion Record

- Parser honesty is restored: non-object IR schemas no longer carry `additionalProperties: false`.
- Dead public strictness/compatibility surfaces are removed:
  - `nonStrictObjectPolicy`
  - `strictObjects`
  - `additionalPropertiesDefaultValue`
- `CastrSchemaProperties` runtime detection is now centralised and cross-realm safe.
- Public docs, ADRs, acceptance criteria, active-handoff docs, and snapshots were aligned to the strict-only doctrine.
- The full repo-root Definition of Done chain was rerun green on Saturday, 21 March 2026.

## Scope

**Remove from IR + core pipeline:**

1. `unknownKeyBehavior` field from `CastrSchema`
2. `IRUnknownKeyBehavior` type (4-mode discriminated union)
3. `x-castr-unknownKeyBehavior` portable extension
4. `nonStrictObjectPolicy` option from all parsers, CLI, and template context
5. `non-strict-object-policy.ts` module
6. All strip/passthrough/catchall code paths in parsers and writers

**Simplify parsers (reject non-strict input):**

- **Zod parser:** `z.strictObject()` and `z.object()` both map to strict closed-world. `.strip()`, `.passthrough()`, `.catchall()`, `z.looseObject()` → reject with helpful error
- **OpenAPI parser:** `additionalProperties: false` (or absent) = strict. `additionalProperties: true` or schema-valued → reject with helpful error
- **JSON Schema parser:** same as OpenAPI

**Simplify writers (emit strict-only):**

- **Zod writer:** always emit `z.strictObject({...})` for objects. Remove passthrough/catchall/strip emission
- **OpenAPI/JSON Schema writer:** always emit `additionalProperties: false`. Remove `x-castr-unknownKeyBehavior` extension

**Keep untouched:**

- Doctor (`repairOpenApiDocument`) — this is the pre-processing surface where strip normalization lives
- `additionalProperties` field in IR model — remains for the `false` case (closed-world encoding)

## Locked Constraints

1. IDENTITY.md is canonical — no compromise on closed-world semantics.
2. No new IR fields. We are removing, not adding.
3. All rejection errors must be helpful: explain why, suggest alternatives.
4. Doctor must remain fully functional.
5. All quality gates green.

## Primary Code Surfaces

### IR Model

- [MODIFY] `ir/models/schema.ts` — remove `IRUnknownKeyBehavior` type and `unknownKeyBehavior` field
- [DELETE] `ir/unknown-key-behavior.ts` — entire module replaced by simpler object-type helpers
- [MODIFY] `ir/index.ts` — remove exports
- [MODIFY] `ir/validation/validators.schema.ts` — remove unknownKeyBehavior validation

### Parsers

- [MODIFY] `parsers/zod/policy/zod-parser.object-policy.ts` — simplified to strict-only enforcement

### Writers

- [MODIFY] `writers/zod/additional-properties.ts` — simplify to strict-only emission
- [MODIFY] `writers/shared/json-schema-fields.ts` — always emit `additionalProperties: false`
- [MODIFY] `writers/shared/json-schema-object.ts` — remove extension type

### CLI + Context

- [MODIFY] `cli/helpers.options.ts` — remove `nonStrictObjectPolicy` option
- [MODIFY] `cli/helpers.ts` — remove plumbing
- [MODIFY] `context/template-context.ts` — remove plumbing

### Compatibility Traversals

- [MODIFY] `compatibility/integer-target-capabilities.traversal.ts` — remove catchall traversal

### Tests (significant)

- [MODIFY] Zod parser object unit tests — update expectations to always reject non-strict
- [MODIFY] Zod writer unknown-key tests — simplify to strict-only
- [DELETE] `writers/zod/recursive-unknown-key.runtime.integration.test.ts` — entire test characterising non-strict recursive behaviour
- [MODIFY] Transform proof fixtures — remove or update fixtures with non-strict object semantics
- [MODIFY] Snapshot baselines — regenerate after changes

## TDD Order

1. ~~**Update IR model** — remove type + field, fix compilation errors~~ ✅
2. ~~**Delete removed modules / simplify surviving strictness modules** — `unknown-key-behavior.ts`, `non-strict-object-policy.ts`, and strict-only parser/writer enforcement surfaces~~ ✅
3. ~~**Simplify writers first** (downstream) — Zod writer strict-only, shared JSON Schema fields strict-only~~ ✅
4. ~~**Simplify parsers** (upstream) — Zod parser reject non-strict, OpenAPI parser reject non-strict, JSON Schema parser reject non-strict~~ ✅
5. ~~**Remove CLI/context plumbing** — `nonStrictObjectPolicy` option~~ ✅
6. ~~**Update tests** — rewrite unit tests for new rejection behaviour, update transform proofs~~ ✅
7. ~~**Fix Vitest Cross-Realm `instanceof` Issues** — replace `value['properties'] instanceof CastrSchemaProperties` (and any other cross-realm unsafe checks in validators) with a robust structural or Symbol-based check~~ ✅
8. ~~**Regenerate snapshots / align stale inline expectations** — remaining cleanup during verification~~ ✅
9. ~~**Documentation alignment** — public docs, ADRs, READMEs, plans, prompts~~ ✅
10. ~~**Full gate chain** — all gates green~~ ✅

### Final Slice Truth

1. The original `validation.integration.unit.test.ts` failure was not only a Vitest cross-realm issue. The parser was also producing dishonest IR by stamping `additionalProperties: false` onto non-object schemas.
2. That parser-layer defect is now fixed for both OpenAPI and JSON Schema ingest. Primitive and array IR nodes no longer carry `additionalProperties`.
3. `CastrSchemaProperties` now uses a shared `Symbol.for(...)` brand plus method checks, so validators and MCP helpers no longer depend on raw `instanceof`.
4. Public strictness/compatibility knobs have been removed from the core surface: `nonStrictObjectPolicy`, `strictObjects`, and `additionalPropertiesDefaultValue`.
5. The full repo-root Definition of Done chain is green, and the realistic integration fixture validates as a `CastrDocument`.

## Success Metrics

1. `unknownKeyBehavior` does not appear anywhere in the IR, parsers, or writers.
2. `nonStrictObjectPolicy` does not appear anywhere in the current product surface; remaining mentions are historical context only.
3. Non-strict Zod input (`.strip()`, `.passthrough()`, `.catchall()`, `z.looseObject()`) is rejected with helpful error.
4. Non-strict OpenAPI/JSON Schema input (`additionalProperties: true` or schema-valued) is rejected with helpful error.
5. All generated Zod output uses `z.strictObject({...})`.
6. All generated OpenAPI/JSON Schema output uses `additionalProperties: false`.
7. Doctor continues to function (no changes to doctor).
8. All quality gates pass.

## Documentation Alignment (During This Slice)

### Directives (require user approval for edits)

- [MODIFY] `.agent/directives/principles.md` line 101 — remove `unless additionalProperties: true is explicitly set`; objects are always strict
- [MODIFY] `.agent/directives/AGENT.md` — add reference to `IDENTITY.md` as canonical identity document

### ADRs

- [SUPERSEDE] `ADR-038` — `unknownKeyBehavior` is no longer first-class IR truth; add supersession note referencing IDENTITY.md
- [SUPERSEDE] `ADR-040` — strip-normalization compatibility mode is removed from core pipeline; add supersession note referencing IDENTITY.md
- [MODIFY] `ADR-031` line 16 — remove reference to ADR-040 opt-in strip-normalization compatibility mode
- [MODIFY] `ADR-032` lines 20, 56–87, 158 — remove all strip-normalization compatibility mode references
- [MODIFY] `ADR-041` line 188 — update title reference to ADR-040
- [MODIFY] `docs/architectural_decision_records/README.md` — update ADR-040 row to reflect supersession
- [MODIFY] `docs/architectural_decision_records/SUMMARY.md` — update ADR-040 row

### Architecture docs

- [MODIFY] `docs/architecture/zod-round-trip-limitations.md` — reframe "Historical Seam" as correct behaviour under IDENTITY; remove all compatibility mode references (lines 10, 35, 107, 170)
- [MODIFY] `docs/architecture/recursive-unknown-key-semantics.md` — reframe as explaining why rejection is correct, not what candidates might fix it; remove compatibility mode references (lines 10, 88–90, 99, 103, 109–110, 121)

### Acceptance criteria

- [MODIFY] `.agent/acceptance-criteria/zod-parser-acceptance-criteria.md` — update object mapping table to reject non-strict (lines 96, 110–116)
- [MODIFY] `.agent/acceptance-criteria/zod-output-acceptance-criteria.md` — update passthrough/catchall references (line 145)

### Plans and investigations

- [MODIFY] `.agent/plans/future/zod-and-transform-future-investigations.md` — reframe Thread 1 (recursive passthrough) as intentional, not a limitation; remove "Reopen Trigger" framing
- [MODIFY] `.agent/memory/napkin.md` line 43 — update preserving-mode investigation note

### Research

- [MODIFY] `.agent/research/feature-parity/enhancement-scope.md` line 9 — remove `.passthrough()` reference
- [MODIFY] `.agent/research/feature-parity/gap-matrix.md` line 13 — update passthrough default reference
- [MODIFY] `.agent/research/feature-parity/plans-review.md` line 113 — update passthrough default reference

### Already updated during closure handoff

- ✅ `session-entry.prompt.md` — points at the architecture-review successor sweep
- ✅ `roadmap.md` — records IDENTITY alignment as complete and JSON Schema parser work as paused
- ✅ `.agent/README.md` — records the new active review-pack entrypoint

## Quality Gates

From repo root, one command at a time:

- `pnpm clean`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm format:check`
- `pnpm type-check`
- `pnpm lint`
- `pnpm madge:circular`
- `pnpm madge:orphans`
- `pnpm depcruise`
- `pnpm knip`
- `pnpm portability:check`
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`

## Final Verification

Verified green on Saturday, 21 March 2026:

- `pnpm clean`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm format:check`
- `pnpm type-check`
- `pnpm lint`
- `pnpm madge:circular`
- `pnpm madge:orphans`
- `pnpm depcruise`
- `pnpm knip`
- `pnpm portability:check`
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`
