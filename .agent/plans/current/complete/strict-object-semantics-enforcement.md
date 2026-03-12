# Plan (Complete): Strict Object Semantics Enforcement

**Status:** Complete  
**Created:** 2026-03-11  
**Last Updated:** 2026-03-12  
**Predecessor:** [recursive-unknown-key-preserving-zod-emission-investigation.md](../paused/recursive-unknown-key-preserving-zod-emission-investigation.md)  
**Successor Active Slice:** [int64-bigint-semantics-investigation.md](../../active/int64-bigint-semantics-investigation.md)  
**Related:** `docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md`, `ADR-031`, `ADR-032`, `ADR-038`, `../../active/int64-bigint-semantics-investigation.md`

---

This slice is complete and no longer belongs in `active/`.

Implemented on 2026-03-12:

- reject-by-default ingest for non-strict object inputs across Zod / OpenAPI / JSON Schema
- one shared opt-in compatibility surface:
  - `nonStrictObjectPolicy: 'reject' | 'strip'`
- strip-only compatibility normalization for non-strict object inputs
- explicit strict default-path object output
- recursive strict Zod parser/writer lockstep around `z.strictObject({...})`
- updated transform proofs, acceptance criteria, ADRs, and durable architecture docs

The next primary active slice is the remaining `int64` / `bigint` numeric-semantics investigation.

On 2026-03-11, product direction changed:

1. all default-path Castr-generated object definitions are considered strict
2. where an output model can represent strict object semantics safely and natively, generated output must specify strictness explicitly
3. non-strict object features must reject by default with helpful errors
4. one explicit compatibility mode may normalize non-strict object inputs to strip semantics instead of rejecting them

This plan now turns that doctrine into a decision-complete implementation contract.

## Summary

The earlier version of this plan captured the direction but still left two architecture decisions too implicit for implementation:

- where the compatibility mode belongs in the public API surface
- what generation must do after compatibility normalization has converted input semantics to strip

Those gaps are now closed here.

This slice is now explicitly about:

- one shared ingest-option surface for non-strict object handling
- reject-by-default parser behaviour across Zod / OpenAPI / JSON Schema
- one deliberate strip-normalization compatibility path
- explicit default-path strict output
- explicit compatibility-path strip output
- safe recursive strict Zod output with parser/writer lockstep

## Decision Lock (2026-03-11)

The following decisions are now fixed for this slice.

### 1. Compatibility mode belongs to ingest, not generation

The canonical control surface is one shared ingest option:

- `nonStrictObjectPolicy?: 'reject' | 'strip'`

Rules:

- default is `reject`
- `strip` is the only compatibility value
- this option is part of parser / IR-build entrypoints, not writer-only configuration
- do not reuse `strictObjects` or `additionalPropertiesDefaultValue` as the public surface for this doctrine

Concrete target surfaces to align:

- `parseZodSource(source, options?)`
- `buildIR(doc, options?)`
- `parseJsonSchema(input, options?)`
- `parseJsonSchemaDocument(input, options?)`
- any top-level API that constructs IR from input must thread the same option unchanged instead of inventing a generation-local equivalent

### 2. Compatibility mode is end-to-end strip canonicalization

If a caller explicitly chooses `nonStrictObjectPolicy: 'strip'`, non-strict object input is normalized to existing IR strip semantics.

Rules:

- no new IR field is allowed for this slice
- the existing object contract remains the source of truth:
  - `unknownKeyBehavior: { mode: 'strip' }`
  - existing `additionalProperties` representation as required by current IR contracts
- compatibility mode must never preserve passthrough or catchall semantics
- compatibility mode must never silently re-tighten strip-normalized input back to strict output

This means the compatibility path is a deliberate lossy exception to the default strict-output doctrine, not a hidden route back to strictness.

### 3. Output behaviour is split explicitly by path

Default path:

- generated output remains strict where the target can express that honestly and safely

Compatibility path:

- generated output must remain strip-canonical rather than pretending the input was strict
- Zod compatibility output must use strip semantics
- recursive Zod compatibility output must continue to use the getter-safe strip-compatible object construction rather than runtime-unsafe `.strip()`
- OpenAPI / JSON Schema compatibility output must not emit `additionalProperties: false`
- if portable strip semantics need to survive a detour, use the existing strip representation honestly rather than silently collapsing to strict or passthrough

### 4. Recursive strict Zod lockstep remains mandatory

The strict-only doctrine does not lower the correctness bar.

For recursive strict Zod output:

- runtime-safe initialisation is mandatory
- parser/writer lockstep is mandatory
- `z.strictObject({...})` remains the canonical target unless new local evidence disproves it
- `z.object({...}).strict()` remains disallowed for recursive canonical output while it is runtime-unsafe

## User Impact

After this slice:

- callers get immediate, helpful errors by default when ingesting non-strict object semantics
- callers who deliberately opt into compatibility mode get one explicit, documented lossy normalisation to strip semantics
- generated outputs stop silently mixing strict and non-strict object behaviour under one doctrine
- recursive strict Zod output has one honest canonical form instead of a runtime-unsafe one

## Scope

In scope:

- object unknown-key semantics only
- one shared ingest-option surface for non-strict object handling
- reject-by-default ingest across Zod / OpenAPI / JSON Schema
- one explicit strip-normalisation compatibility mode
- top-level API threading for the shared ingest option wherever IR is constructed from input
- explicit strict default-path output where representable and safe
- explicit strip compatibility-path output where that path is deliberately chosen
- parser/writer lockstep for the canonical recursive strict Zod form
- transform and fixture updates required by the new reject-versus-strip split
- durable plan / prompt / ADR / acceptance-criteria follow-through

Out of scope:

- non-object strictness topics
- `int64` / `bigint`
- UUID semantics
- passthrough or catchall as compatibility output targets
- new IR fields for object-mode policy
- reusing legacy writer knobs as the compatibility API surface
- speculative new extension mechanisms

## Code-Grounded Target Surfaces

The next implementation tranche must start from these real seams in the codebase.

Shared ingest-option entrypoints:

- `lib/src/schema-processing/parsers/zod/zod-parser.types.ts`
- `lib/src/schema-processing/parsers/zod/zod-parser.ts`
- `lib/src/schema-processing/parsers/openapi/index.ts`
- `lib/src/schema-processing/parsers/json-schema/index.ts`

Top-level threading surfaces that currently build IR internally:

- `lib/src/schema-processing/context/template-context.ts`
- `lib/src/rendering/generate-from-context.ts`

Object-semantics parser / writer seams:

- `lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts`
- `lib/src/schema-processing/writers/zod/additional-properties.ts`
- `lib/src/schema-processing/ir/unknown-key-behavior.ts`

## Assumptions To Validate

1. The shared `nonStrictObjectPolicy` option can be threaded through existing public entrypoints without forcing a second, conflicting option surface.
2. Existing IR strip semantics are sufficient for compatibility normalization without adding a new field.
3. Recursive strict Zod lockstep can be completed around `z.strictObject({...})` without reopening preserving-mode remediation.
4. Current portable strip representation remains sufficient for honest compatibility-path output.

## Current Evidence (2026-03-11)

Runtime and API inspection currently prove:

- bare recursive `z.object({...})` is strip-compatible, not strict
- recursive `.strip()`, `.passthrough()`, `.catchall(...)`, and `.strict()` all fail during module initialisation when appended to getter-based recursive `z.object({...})`
- recursive `z.looseObject({...})` is runtime-safe for passthrough, but parser lockstep is missing and preserving-mode output is no longer the product target
- recursive `z.strictObject({...})` is runtime-safe for strict semantics, but parser lockstep is missing
- `ZodParseOptions` already exists, but the new non-strict object policy is not part of it yet
- `parseZodSource(...)` does not yet accept an options object
- OpenAPI and JSON Schema ingest entrypoints do not yet expose an equivalent non-strict object policy option
- existing knobs such as `strictObjects` and `additionalPropertiesDefaultValue` live in generation-facing surfaces, which is the wrong architectural layer for compatibility-mode ingest policy

## Execution Targets

### 1. Shared ingest-option surface

Introduce one shared non-strict object policy contract across ingest entrypoints:

- `nonStrictObjectPolicy: 'reject' | 'strip'`

Required properties:

- default-path behaviour is reject
- field name and value set stay aligned across Zod / OpenAPI / JSON Schema
- top-level orchestration APIs thread the same option without inventing a writer-local variant

### 2. Reject-by-default ingest

Reject non-strict object input across supported ingest formats unless the caller has explicitly opted into strip normalization.

Expected examples:

- Zod:
  - bare `z.object({...})`
  - `.strip()`
  - `.passthrough()`
  - `.catchall(...)`
- OpenAPI / JSON Schema:
  - omitted object strictness when omission means extra keys are allowed
  - `additionalProperties: true`
  - schema-valued `additionalProperties`
  - `x-castr-unknownKeyBehavior` values that describe non-strict behaviour

### 3. Strip-normalisation compatibility mode

Define and implement the deliberate compatibility path.

Compatibility rules:

- it must be opt-in through `nonStrictObjectPolicy: 'strip'`
- it must normalize to strip semantics only
- it must not preserve passthrough or catchall
- it must be documented as lossy normalisation
- it must not weaken the default reject path

### 4. Writer/output semantics split

Implement the post-normalisation output contract explicitly.

Default path:

- strict output where representable and safe

Compatibility path:

- strip-canonical output only
- no silent strictification
- no passthrough or catchall re-emission

Immediate target shapes:

- Zod default path:
  - non-recursive objects use explicit strict output
  - recursive objects use the canonical safe strict form
- Zod compatibility path:
  - non-recursive objects use canonical strip output
  - recursive objects use the getter-safe strip-compatible form rather than `.strip()`
- OpenAPI / JSON Schema default path:
  - `additionalProperties: false`
- OpenAPI / JSON Schema compatibility path:
  - honest strip representation only; never `additionalProperties: false`

### 5. Zod recursive strict lockstep

Make the parser accept the canonical recursive strict form chosen by the writer.

Current locked candidate:

- `z.strictObject({...})`

Do not keep `z.object({...}).strict()` as the canonical recursive strict form while it remains runtime-unsafe.

## Reviewer Outcomes (2026-03-11)

Required reviewers for this tranche were invoked through the fallback nested `codex exec` path documented in `.agent/rules/invoke-reviewers.md`.

Consolidated outcome for the original decision-setting tranche:

- `code-reviewer`: no blocking issue with repointing the workstream toward strict-by-default object semantics, provided durable docs clearly distinguish the new doctrine from current implementation state
- `test-reviewer`: no blocking issue with `recursive-unknown-key.runtime.integration.test.ts`; the file is correctly classified as an integration test and its assertions prove behaviour rather than implementation details
- `zod-expert`: no blocking issue with the new doctrine itself; the captured runtime evidence supports moving away from preserving-mode remediation and toward a strict recursive Zod lockstep plan centred on a safe explicit strict form

Main remaining risk called out by the review:

- ADR-040 changes product direction before parser/writer enforcement has landed, so docs and plans must remain explicit about the gap between accepted doctrine and current code

Operational note:

- as in earlier fallback reviewer runs, the nested wrappers spent disproportionate time on repo-context reading before naturally concluding, so the parent session recorded the concrete verdict here to avoid hidden review debt

Addendum for the doctrine-cohesion doc pass on 2026-03-11:

- `code-reviewer` was reinvoked through the documented fallback path for the doc / plan / acceptance-criteria alignment tranche
- the nested wrapper again over-read repo context and did not emit a concrete finding or clean verdict before it stopped producing useful output
- no blocking review feedback surfaced during that run
- the parent session therefore preserved manual diff audit plus a full green canonical gate-chain rerun as the current evidence base, while leaving the already-recorded implementation risks unchanged

Addendum for the architecture-fit pass on 2026-03-11:

- `code-reviewer` was reinvoked specifically against this active plan plus ADR-040, ADR-031, and ADR-032
- the nested reviewer reached the scoped plan-reading stage but again stalled before producing a substantive verdict
- no plan-specific architectural finding was emitted before the stall
- one operational note surfaced during setup only: the reviewer wrapper first tried `roadmap.md` at repo root before recovering to `.agent/plans/roadmap.md`

Addendum for the manual architecture-fit remediation pass on 2026-03-11:

- the parent session performed the architecture-fit review directly in the `code-reviewer` persona after the fallback reviewer stalled repeatedly
- that review concluded the compatibility mode must be anchored on a shared ingest-option surface rather than legacy generation knobs such as `strictObjects`
- it also concluded the compatibility path must remain strip-canonical on output rather than silently re-tightening normalized input back to strict semantics
- the TDD order in this plan was then rewritten so option-surface and output-rule proofs land before Scenario 2 / 4 / 6 widening

## TDD Order

### Stage 1: Lock the API boundary and current runtime seam

Keep current runtime proofs green and add failing API-surface tests for the shared ingest option.

Required proofs:

- recursive `.strict()` failure remains characterised
- recursive `z.strictObject({...})` runtime viability remains characterised
- current parser rejection of `z.strictObject({...})` remains characterised until fixed
- ingest entrypoints expose `nonStrictObjectPolicy` with default reject behaviour
- top-level APIs do not introduce a second conflicting compatibility knob

### Stage 2: Reject-by-default ingest

Add failing parser tests across Zod / OpenAPI / JSON Schema that prove non-strict object inputs now error with helpful messages by default.

### Stage 3: Compatibility normalisation at ingest

Add failing parser tests that prove `nonStrictObjectPolicy: 'strip'` admits non-strict object inputs only by normalising them to strip semantics in IR.

Required proofs:

- bare / strip / passthrough / catchall Zod object inputs all normalize to strip semantics
- permissive OpenAPI / JSON Schema object inputs also normalize to strip semantics
- no compatibility-path ingest test preserves passthrough or catchall behaviour

### Stage 4: Writer/output split

Add failing writer and parser tests that prove:

- default-path output stays strict
- compatibility-path output stays strip
- compatibility-path output never silently becomes strict
- recursive strict Zod output uses the safe canonical strict form
- recursive strip Zod compatibility output uses the getter-safe strip-compatible form

### Stage 5: Top-level threading and transform parity

Only after local parser and writer proofs are green:

- thread the shared ingest option through top-level APIs that construct IR from input
- update Scenario 2 / 4 / 6 fixtures and expectations so:
  - strict fixtures remain green on the default path
  - default-path non-strict fixtures fail fast during ingest
  - compatibility-mode fixtures prove deliberate strip normalization without preservation drift or silent strictification

### Stage 6: Durable close-out

Update ADRs, architecture docs, acceptance criteria, roadmap, session entry, and completion markers so the new control surface and output split are the obvious future truth.

## Constraints

1. `nonStrictObjectPolicy` is the only compatibility-mode control surface for this slice.
2. Default ingest behaviour must remain reject.
3. No new IR field is allowed for compatibility normalization.
4. Do not preserve passthrough or catchall semantics under the compatibility label.
5. Do not silently turn compatibility-normalized strip input into strict output.
6. Do not reuse `strictObjects` or `additionalPropertiesDefaultValue` as the public compatibility API.
7. Do not accept a recursive strict Zod form unless runtime initialisation safety and parser/writer lockstep are both proven.
8. Keep fail-fast behaviour and error quality high across all ingest paths.

## Success Criteria

This slice is successful only if all of the following are true:

1. all ingest entrypoints share one explicit `nonStrictObjectPolicy: 'reject' | 'strip'` contract
2. non-strict object inputs fail fast by default across all supported ingest formats
3. compatibility mode normalizes non-strict object inputs to strip semantics only
4. compatibility-normalized flows do not silently emit strict output
5. strict default-path outputs remain explicit wherever the target supports that honestly and safely
6. recursive strict Zod output has one canonical safe form and the parser accepts it
7. Scenario 2 / 4 / 6 reflect the new reject-versus-strip split without passthrough / catchall drift
8. durable docs and prompts make the compatibility control surface and output split obvious

## Documentation Outputs

This slice must keep durable truth outside the active plan.

Required documentation follow-through:

- ADR-040 remains the doctrine source of truth for strict-by-default plus compatibility-strip semantics
- ADR-031 and ADR-032 must reflect the final API and output split once implementation lands
- acceptance criteria must describe the reject default and strip-only compatibility path explicitly
- the session-entry prompt must keep the boundary-first TDD order visible
- reviewer outcomes must be recorded so later sessions do not inherit hidden review debt

## Reviewer Cadence

Read and apply `.agent/rules/invoke-reviewers.md`.

Required cadence for this slice:

1. after doctrine or plan updates: `code-reviewer`
2. after parser / writer / fixture changes:
   - `code-reviewer`
   - `test-reviewer`
   - `type-reviewer`
   - `zod-expert`
3. invoke `openapi-expert` and `json-schema-expert` when reject/strip implementation reaches their parser or writer paths

## Exit Criteria

Close this slice only when:

1. reject-by-default plus strip-normalisation is implemented consistently across ingest, IR, and generation, or
2. a narrower follow-on implementation plan exists with any remaining blocker isolated precisely at one of these seams:
   - shared ingest-option threading
   - compatibility-path portable strip output
   - recursive strict Zod lockstep

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
