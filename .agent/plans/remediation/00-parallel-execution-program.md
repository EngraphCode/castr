# Plan: Parallel Remediation Execution Program

**Status:** ACTIVE (program record; owner-approved 2026-07-17)
**Findings:** all 46 review IDs (C1–C6, H1–H7, M1–M13, L1–L19, N1) — full disposition table below
**Owner decisions:** recorded 2026-07-17 (scope; unowned findings; doctrine gating; timing)
**Related:** [README.md](./README.md), [02-ir-fidelity-proof-harness.md](../active/02-ir-fidelity-proof-harness.md),
[roadmap.md](../roadmap.md), [initial review](../../report/initial-review/)

---

## What this is

The owner-approved execution program that parallelises the remediation backlog (02–07 plus the
findings no plan owned) into **file-disjoint lanes**, each run by an isolated worktree agent on a
feature branch off `main`, one PR per lane, merges owner-invoked. It supersedes the sequential
numbering of plans 02–07 as an execution order (the plans remain the per-finding authority); it does
not supersede their acceptance criteria, which each lane carries verbatim.

Method note: the lane decomposition came from applying the concept-exploration workflow (four
movements) to the remediation roadmap and the plan of record, a firsthand file-collision
verification pass, and an `assumptions-expert` readiness review (verdict READY-WITH-CHANGES; all
changes applied — see §Readiness).

## Owner decisions (2026-07-17)

1. **Scope: product remediation + reconciliation only.** Practice-estate landings (D2/D4 branches,
   Oak parity program, Phase 9 closure) stay deferred at their existing named position — not parked.
2. **Unowned findings fixed in this program** (H5, H6, M6, M8, M9, M11, M13, most L-series, N1) —
   folded into lanes or micro-lanes; every ID disposed.
3. **Doctrine edits pre-authorized** in the strictest-of-three direction; exact wording reviewed by
   the owner at that lane's PR.
4. **Proceed now**; the pending estate-overhaul (W2) does not block product fixes.

## Execution rules (every lane)

- Branch `fix/remediation-<lane>-<slug>` off `main`, in an isolated worktree.
- Proof-first TDD: failing test authored first, red run captured, fix lands with proof as **one
  green cycle** — never a red-only landing.
- New transform tests/fixtures are additive: `lib/tests-transforms/__tests__/` +
  `lib/tests-transforms/__fixtures__/edge-cases/`; never edit
  `lib/tests-transforms/utils/transform-helpers.ts` fixture arrays.
- Gates: targeted vitest during the cycle; full `pnpm check:ci` before hand-off. Never `pnpm qg`
  directly. All warnings blocking.
- Stage by explicit pathspec; conventional commits ≤100-char lines via `git commit -F <file>`.
- Diff must stay inside the lane's owned files ∪ its new test/fixture files. Sanctioned overlap:
  additive one-line exports in barrel `index.ts` files.
- Before PR: adversarial verification (DoD re-run + diff-scope check) then the lane's reviewer
  panel; findings fixed and re-verified. PRs owner-merged only.

## Lane table

The authoritative per-lane specification (owned files, forbidden zones, proof-first specs,
deterministic DoD commands, reviewer sets, sizes) is carried in the session plan of record for this
program and reproduced in each lane's PR description. Summary:

| Lane       | Findings                                        | Scope centre                                                      | Size | Depends on                             |
| ---------- | ----------------------------------------------- | ----------------------------------------------------------------- | ---- | -------------------------------------- |
| L-A        | H7 (vacuous negatives), L13, harness convention | `tests-transforms` substrate + rendering test truth               | S/M  | none — merges first                    |
| L-B        | C6 (in full), H7 substring tests, M7, L16       | `writers/zod/refinements/**`, `generators/collections.ts`         | L    | L-A merged; rebase after feature merge |
| L-C        | C5                                              | `parsers/zod/composition/**`, `parsers/zod/types/**`              | M    | rebase after L-I + feature             |
| L-D        | C2, C3, M10, M12                                | OpenAPI operations/security IR + component names                  | L    | rebase on L-A                          |
| L-E        | M3, C4, L3, L5                                  | single-source guards + `ir/serialization.ts`                      | M    | none — merges second                   |
| L-F        | H1, H2, H4, L9–L12, L14 (+H6/L8 verify)         | `parsers/json-schema/**` + IR fields + `writers/shared/**`        | L    | rebase after L-E, L-A, feature         |
| L-H        | H3, M6, H5, L6, L19                             | `context/endpoints/**`, MCP responses, CLI options                | M    | none; H5 owner gate at PR              |
| L-I        | M4, M5                                          | test hygiene: runner relocation, logger sink, no-IO guard         | S    | merges before L-C rebase               |
| L-J        | M1, M2, L1, L2, L4                              | eslint rules + doctrine wording + horizontal sweep                | L    | ALL other lanes merged (wave 3)        |
| L-K1       | M8, M9                                          | `compatibility/*target-capabilities*`                             | S    | none                                   |
| L-K2       | M11, L17                                        | `shared/maybe-pretty.ts`                                          | S    | none                                   |
| L-K3+K5+K7 | L7, L15, N1                                     | batched micro-PR (MCP error fields; bundle clock; TS type-writer) | S    | none                                   |
| L-K6       | L18                                             | `lib/package.json` devDep (lockfile — merges alone)               | S    | none                                   |
| L-K8       | M13                                             | `parsers/openapi/components/**` document threading                | S    | after L-D merges                       |

## Merge waves

- **Wave 1** (dispatch simultaneously): L-A, L-C, L-D, L-E, L-F, L-H, L-I, L-K1, L-K2, L-K6,
  batched L-K3+K5+K7. Merge order: L-A, L-E, L-I, micros (L-K6 alone in its lockfile slot), L-H,
  L-C, L-D, **feature slice**, L-F.
- **Explicit merge-order edges:** L-D → feature (`writers/zod/index.ts` C3 `$ref`-name path);
  feature → L-F (`builder.core.ts`, `validators.schema.ts`, `json-schema-parser.object-fields.ts`,
  `json-schema-fields.ts`); feature → L-B (`generators/collections.ts`); L-I → L-C; L-E → all
  (import/typing repoints); L-A → all (harness convention).
- **Wave 2:** L-B (on L-A's merge), L-K8 (on L-D's merge).
- **Wave 3:** L-J alone.

Critical path ≈ L-A → L-B → L-J.

## Feature-slice integration (position 3)

Trigger: L-D (C3) merges. Then rebase `feat/explicit-additional-properties-rebased` onto `main`,
full `pnpm check:ci` (the branch's Oak round-trip proof — its only red — is expected green once C3
is fixed; still-red = fresh reproduced regression, pre-empts the sequence), reviewer loop
(code-reviewer, type-reviewer, test-reviewer, openapi-expert, zod-expert, json-schema-expert,
mcp-expert), PR including the paused-plan status update, owner merge. The feature branch is itself
the resolution of H6/L8 — hence it merges before L-F's final rebase.

## Disposition table (all 46 IDs)

| Disposition                                     | IDs                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Already fixed (plan 01, merged)                 | C1                                                                                                                                                                                                                                                                                                                                                                       |
| Fixed by lane                                   | C2, C3 (L-D); C4 (L-E); C5 (L-C); C6 (L-B); H1, H2, H4 (L-F); H3, H5 (L-H); H7 (L-A + L-B); M1, M2 (L-J); M3 (L-E); M4, M5 (L-I); M6 (L-H); M7 (L-B); M8, M9 (L-K1); M10, M12 (L-D); M11 (L-K2); M13 (L-K8); L1, L2, L4 (L-J); L3, L5 (L-E); L6, L19 (L-H); L7 (L-K3); L9, L10, L11, L12, L14 (L-F); L13 (L-A); L15 (L-K5); L16 (L-B); L17 (L-K2); L18 (L-K6); N1 (L-K7) |
| Resolved by the feature slice, verified by lane | H6, L8 (feature merge + L-F residue check)                                                                                                                                                                                                                                                                                                                               |
| Owner-disposition at PR (named, not parked)     | M9 wording, N1 direction, H5 dead-option cluster remainder, `complexityThreshold`                                                                                                                                                                                                                                                                                        |

## Readiness

`assumptions-expert` audit (2026-07-17): READY-WITH-CHANGES, applied — (1) C6 interim-throw removed
from L-A (blast radius + principles.md forbids placeholder fail-fast for expressible features; C6
lands once in L-B, silent-wrong → real-or-fail-fast in one cycle); (2) feature-branch collisions
named as explicit merge-order edges; (3) L-E granted call-site type adjustments (guard return types
diverge). Validated firsthand: the two `return true` sites (`writers/zod/refinements/object.ts:130`,
`:183–190`), four `isRecord` definitions, M1 breadth 148 uses / 74 files, 46-ID coverage, per-lane
`pnpm check:ci` as the complete gate.

## Verification (program end)

Per lane: its DoD commands, re-runnable. Per Critical: named proof red→green (C2 AND-security
round-trip; C3 dotted-name `$ref` round-trip — the feature branch's Oak test is the gate-level
proof; C4 empty-properties serialize→deserialize; C5 non-empty `errors`; C6 executed-validator
accept/reject pairs). Program end: `pnpm check:ci` green on `main`; packaging e2e green; this
disposition table complete; feature branch merged; delivery ledger updated.

## Non-goals

Practice-estate landings (deferred, named position); the estate-overhaul (independent); D3/CI
modernisation (deprioritised); no new abstractions beyond what findings require;
strictest-of-three governs every disagreement.
