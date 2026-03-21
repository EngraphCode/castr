# Plan (Paused): Recursive Unknown-Key-Preserving Zod Emission Investigation

**Status:** Complete (Closed Out 2026-03-21) — superseded by ADR-040; residual thread consolidated in [zod-and-transform-future-investigations.md](../../future/zod-and-transform-future-investigations.md)  
**Created:** 2026-03-11  
**Last Updated:** 2026-03-12  
**Predecessor:** [zod-limitations-architecture-investigation.md](./zod-limitations-architecture-investigation.md)  
**Related:** `docs/architecture/zod-round-trip-limitations.md`, `docs/architecture/recursive-unknown-key-semantics.md`, `ADR-031`, `ADR-032`, `ADR-035`, `ADR-038`, `./transform-proof-budgeting-and-runtime-architecture-investigation.md`, `../../active/zod-limitations-next-atomic-slice-planning.md`, `../complete/int64-bigint-semantics-investigation.md`

---

This plan is now paused as historical investigation context.

It was previously the primary active slice for recursive unknown-key-preserving Zod emission, but the product decision recorded on 2026-03-11 changed direction:

- default generated object definitions remain strict
- non-strict object inputs reject by default unless the caller explicitly opts into strip normalization

That means preserving-mode remediation is no longer the primary path.

The completed successor was:

- [strict-object-semantics-enforcement.md](../complete/strict-object-semantics-enforcement.md)

The broader workstream remains important, but it no longer belongs in `active/` as an umbrella plan. The current repo truth on 2026-03-11 is:

1. `pnpm check:ci` is green.
2. `unknownKeyBehavior` is first-class IR truth and is covered by unit and transform proofs.
3. `uuidVersion` is first-class IR truth and is covered by unit and transform proofs.
4. Recursive `.passthrough()` and `.catchall()` still fail fast in Zod generation.
5. The remaining live limitation seams are:
   - recursive unknown-key-preserving Zod emission
   - `int64` / `bigint` runtime semantics

## Summary

This slice is investigation-first and deliberately narrow.

Its purpose is to determine whether recursive unknown-key-preserving Zod output can be emitted honestly and safely, or whether the repo should retain the current fail-fast policy with a more precise upstream/runtime blocker record.

This slice must not broaden back into:

- parser or IR redesign
- UUID subtype reconsideration
- portable unknown-key policy redesign
- `int64` / `bigint` semantics work

Those areas are already either locked by durable docs or queued separately.

## Intended Impact

The next session should leave the repo with exactly one of:

1. an implementation-ready remediation plan for recursive preserving-mode Zod emission
2. a precise upstream/runtime blocker plus durable rationale for keeping fail-fast behaviour

We are optimizing for:

- solving the recursive seam at the writer/runtime boundary
- preserving parser/writer lockstep
- preserving parsed-output parity, not only validation parity
- keeping canonical output deterministic and honest

## Scope

In scope:

- the writer/runtime boundary in:
  - `lib/src/schema-processing/writers/zod/additional-properties.ts`
  - `lib/src/schema-processing/writers/zod/properties.recursion.ts`
  - Zod writer tests
  - Scenario 2 / 4 / 6 transform proofs
- candidate-construction experiments for recursive `.passthrough()` and `.catchall()`
- generated-code runtime proofs for each candidate family
- durable recommendation output for this seam

Out of scope:

- parser changes unless new evidence disproves ADR-038's current diagnosis
- new IR fields or contract changes
- new public options or user-facing config switches
- UUID subtype work
- `int64` / `bigint` work
- product-code remediation before a candidate proves viable

## Locked Constraints

1. No new IR fields are allowed in this slice. `unknownKeyBehavior` remains the contract.
2. No new public option or configuration switch is allowed in this slice.
3. Fail-fast behaviour must remain in place unless parsed-output parity is proven green.
4. If a second canonical recursive construction is selected, amend ADR-031 and ADR-038 in the same change set and make the parser accept the emitted form in the same change set.
5. Do not relax strictness to "make generation work".

## Code Surfaces

Primary code surfaces:

- `lib/src/schema-processing/writers/zod/additional-properties.ts`
- `lib/src/schema-processing/writers/zod/properties.recursion.ts`
- `lib/src/schema-processing/writers/zod/writer.object-unknown-key.unit.test.ts`
- `lib/tests-transforms/__tests__/scenario-2-zod-roundtrip.integration.test.ts`
- `lib/tests-transforms/__tests__/scenario-4-zod-via-openapi.integration.test.ts`
- `lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts`
- `lib/tests-transforms/utils/transform-helpers.ts`
- `lib/tests-fixtures/zod-parser/happy-path/unknown-key-semantics.zod4.ts`
- `lib/tests-fixtures/zod-parser/happy-path/payloads.ts`

Durable context:

- [zod-round-trip-limitations.md](../../../docs/architecture/zod-round-trip-limitations.md)
- [recursive-unknown-key-semantics.md](../../../docs/architecture/recursive-unknown-key-semantics.md)
- [ADR-031](../../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-032](../../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md)
- [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)
- [ADR-038](../../../docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md)

## Candidate Families To Compare

Compare exactly these three families:

1. **Getter-only construction**
   - prove canonical getter recursion alone can support recursive preserving modes
2. **One narrowly-scoped second canonical preserving-mode construction**
   - keep getter syntax canonical for strip-compatible recursion
   - allow one additional canonical construction only for preserving modes if it remains honest and deterministic
3. **Explicit upstream/runtime blocker**
   - prove that no local construction meets the repo's correctness bar
   - retain fail-fast behaviour with stronger durable rationale

Do not introduce further fix families unless one of the three above splits naturally during evidence gathering.

## Evaluation Criteria

Every candidate family must be evaluated against all four criteria:

1. recursive initialization safety
2. parser/writer lockstep
3. parsed-output parity for recursive `.passthrough()` / `.catchall()`
4. deterministic canonical output

Any candidate that fails one of the four criteria is not remediation-ready.

## TDD Order

### Stage 1: Characterise the current failure

Add failing or missing writer/runtime characterization tests that reproduce:

- recursive `.passthrough()` failure mode
- recursive `.catchall()` failure mode
- any construction timing differences between bare getter recursion and preserving-mode recursion

### Stage 2: Prove or reject candidate constructions locally

Add failing generated-code execution tests for each candidate family without widening the transform matrix yet.

These tests must prove:

- whether the generated code initializes
- whether parsing succeeds at runtime
- whether unknown keys are preserved or typed correctly

### Stage 3: Expand scenario-level proof only if a candidate passes locally

Only if a candidate passes Stage 2, add failing Scenario 2 / 4 / 6 parity tests for recursive preserving fixtures and then implement the writer change.

### Stage 4: Close honestly if no candidate passes

If no candidate passes:

- keep the current fail-fast behaviour
- add any missing blocker proofs
- update docs/ADRs instead of product code

## Current Investigation Status (2026-03-11)

Stage 1 writer/runtime characterization now exists in:

- `lib/src/schema-processing/writers/zod/recursive-unknown-key.runtime.integration.test.ts`

Current local evidence from that proof set:

- bare recursive getter output using plain `z.object({ get ... })` initializes and parses correctly for strip-compatible recursion
- explicit recursive `.strip()` fails during module initialization with `Cannot access 'Category' before initialization`
- canonical recursive `.passthrough()` parses to the expected IR truth but fails during module initialization with the same temporal-dead-zone error
- canonical recursive `.catchall(...)` parses to the expected IR truth but fails during module initialization with the same temporal-dead-zone error
- `z.looseObject({ get ... })` is runtime-viable for recursive passthrough and preserves nested unknown keys recursively, but `parseZodSource()` currently rejects it as unsupported, so parser/writer lockstep is not satisfied
- the two-step catchall alias candidate initializes at runtime, but the parser only accepts the base object declaration and the parsed output does not preserve nested unknown keys, so it is not remediation-ready

Stage 2 is partially complete for the currently known candidate families.

The current recommendation is still investigation-first:

- keep Stage 3 locked for now
- do not widen Scenario 2 / 4 / 6 yet
- only unlock scenario-level parity expansion if a candidate satisfies runtime initialization safety and parser/writer lockstep locally

Targeted verification for this tranche:

- `pnpm lint`
- `pnpm vitest run src/schema-processing/writers/zod/recursive-unknown-key.runtime.integration.test.ts src/schema-processing/writers/zod/writer.object-unknown-key.unit.test.ts`

## Reviewer Outcomes (2026-03-11)

Reviewer cadence was invoked through the fallback nested `codex exec` path documented in `.agent/rules/invoke-reviewers.md`.

Observed outcomes for this tranche:

- `code-reviewer` and `test-reviewer` independently surfaced the same concrete issue: the new runtime proof performs real filesystem IO and dynamic module execution, so it should not be classified as a unit test. Addressed on 2026-03-11 by renaming the file to `recursive-unknown-key.runtime.integration.test.ts`.
- `type-reviewer` did not surface a blocking type-flow issue after the helper was tightened to validate the imported module namespace at the `unknown` boundary with `isRecord()` and then narrow exported schemas with `isZodSchema()`.
- `zod-expert` did not surface a new contradiction with ADR-031 / ADR-032 / ADR-035 / ADR-038 in the test itself; the current evidence still points to `z.looseObject(...)` as the only runtime-viable recursive passthrough candidate observed so far, while parser lockstep remains unmet and the catchall alias candidate remains non-viable.
- no reviewer outcome currently justifies widening Scenario 2 / 4 / 6 or relaxing the existing fail-fast transform expectations

Operational note:

- the fallback reviewer wrappers over-read surrounding repo context before naturally concluding, so the parent session recorded the concrete outcomes here to avoid hidden review debt

## Success Criteria

This slice is successful only if all of the following are true:

1. The active recommendation is narrowed to one of:
   - implementation-ready remediation
   - precise upstream/runtime blocker
2. Writer/runtime characterization tests are present and green.
3. Generated-code execution proofs exist for the chosen or rejected candidate family.
4. If local remediation proves viable, Scenario 2 / 4 / 6 parsed-output parity is green for the newly supported recursive preserving case.
5. No regression is introduced for:
   - recursive strip
   - non-recursive `strict`
   - non-recursive `strip`
   - non-recursive `passthrough`
   - non-recursive `catchall`

## Documentation Outputs

This slice must produce durable outputs before close:

- update [zod-round-trip-limitations.md](../../../docs/architecture/zod-round-trip-limitations.md) if the accepted limitation statement changes
- update [recursive-unknown-key-semantics.md](../../../docs/architecture/recursive-unknown-key-semantics.md) if the stage map or blocker diagnosis changes
- update ADR-031 and ADR-038 if the canonical recursive output policy changes
- otherwise record the blocker rationale in durable docs rather than leaving it only in commentary

## Reviewer Cadence

Read and apply `.agent/rules/invoke-reviewers.md`.

Required cadence for this slice:

1. After any non-trivial plan/doc update for this slice, invoke `code-reviewer`.
2. After any recursive writer or proof change, invoke:
   - `code-reviewer`
   - `zod-expert`
   - `type-reviewer`
   - `test-reviewer`
3. Invoke `openapi-expert` or `json-schema-expert` only if new evidence reopens portable artifact semantics.

Operational note:

- The installed `.codex` reviewer roster is the canonical path.
- In environments where first-class project-agent fan-out is not exposed directly, run reviewer passes explicitly through the local Codex adapters and record the outcomes in the session artefacts.

## Exit Criteria

Do not close this plan with a vague recommendation.

Close it only when one of these is true:

1. a follow-on implementation plan exists and is decision-complete
2. a durable blocker note exists with precise runtime evidence and updated docs

At close-out:

- move this plan to `current/complete/` if the slice is done
- promote the next active slice
- leave one obvious next entrypoint in `session-entry.prompt.md` and `roadmap.md`

## Quality Gates

If this slice mutates repo-tracked files, rerun the canonical gate chain one command at a time from repo root:

`pnpm clean`  
`pnpm install --frozen-lockfile`  
`pnpm build`  
`pnpm format:check`  
`pnpm type-check`  
`pnpm lint`  
`pnpm madge:circular`  
`pnpm madge:orphans`  
`pnpm depcruise`  
`pnpm knip`  
`pnpm portability:check`  
`pnpm test`  
`pnpm character`  
`pnpm test:snapshot`  
`pnpm test:gen`  
`pnpm test:transforms`

Analyse failures only after the full sequence completes.
