# Pack 4 — JSON Schema Architecture

**Date:** 2026-03-22
**Verdict:** red

## Invariants Checked

- JSON Schema ingress must have one honest public contract for Draft 07 normalization, 2020-12 parsing, and document-level parsing rather than mixing bundle extraction and standalone-schema claims.
- Unsupported JSON Schema semantics must fail fast at the earliest honest parser boundary; silent omission or ambiguous handling is not an acceptable steady state.
- JSON Schema egress must have one explicit canonical normal form for nullability, references, and 2020-12 keyword support.
- Scenario 5, Scenario 6, Scenario 7, and the JSON Schema characterisation suite must prove the JSON Schema architecture the repo claims, not a narrower or adjacent subset.
- The paused JSON Schema successor plan must match the code on disk before it can ever be reactivated honestly.

## Findings

1. Severity: high
   File: [index.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/index.ts#L43)
   File: [json-schema-writer.document.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/json-schema/json-schema-writer.document.ts#L48)
   File: [scenario-5-json-schema-roundtrip.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-5-json-schema-roundtrip.integration.test.ts#L7)
   File: [scenario-6-zod-via-json-schema.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts#L5)
   Issue: `parseJsonSchemaDocument()` is presented as a JSON Schema document parser, but it only normalizes input and extracts non-reference `$defs` members. It ignores any root schema entirely, skips `$defs` entries that are themselves references, and the current Scenario 5 and Scenario 6 proofs only exercise the `$defs` bundle loop rather than a real standalone-document contract.
   Why it matters: the repo cannot honestly claim standalone JSON Schema document parsing while the public document API drops root-schema semantics and the proof suite never challenges that omission.

2. Severity: high
   File: [json-schema-parser.core.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/json-schema-parser.core.ts#L47)
   File: [json-schema-parser.types.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/json-schema-parser.types.ts#L24)
   File: [json-schema-parser.normalization.refs.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/normalization/json-schema-parser.normalization.refs.ts#L25)
   File: [json-schema-parser.object-fields.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/json-schema-parser.object-fields.ts#L70)
   File: [json-schema-and-parity-acceptance-criteria.md](/Users/jim/code/personal/castr/.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md#L11)
   Issue: the current parser has no explicit unsupported-surface rejection seam beyond object-closure rejection and integer-capability rejection. Public entrypoints normalize Draft 07 instead of rejecting it, external `$ref` values are preserved unchanged unless they happen to match `#/definitions/<name>`, and the parser only maps the subset surfaced by `JsonSchema2020` plus the helper layers. That conflicts directly with the still-live acceptance criteria, which continue to claim fail-fast rejection for unsupported keywords and no-tolerance parsing.
   Why it matters: Pack 4 cannot clear while the JSON Schema ingest contract is ambiguous about whether unsupported semantics are rejected, ignored, or simply absent from the typed surface.

3. Severity: high
   File: [json-schema-object.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/shared/json-schema-object.ts#L90)
   File: [schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts#L420)
   File: [json-schema-fields.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/shared/json-schema-fields.ts#L48)
   File: [json-schema-fields.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/shared/json-schema-fields.ts#L197)
   File: [json-schema-2020-12-fields.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/shared/json-schema-2020-12-fields.ts#L32)
   File: [scenario-6-zod-via-json-schema.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts#L113)
   File: [scenario-7-multi-cast.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts#L155)
   File: [json-schema.char.test.ts.snap](/Users/jim/code/personal/castr/lib/src/characterisation/__snapshots__/json-schema.char.test.ts.snap#L3)
   Issue: the writer and proof layers over-claim canonical 2020-12 lockstep. The shared output type and 2020-12 field writers emit `minContains` and `maxContains` without a corresponding `contains` field in the JSON Schema output type, the pure JSON Schema writer emits `example` / `examples` without a dedicated standards-validation proof, Scenario 6's "semantic equivalence" block checks only component names, Scenario 7 never reparses emitted JSON Schema, and the characterisation snapshot freezes an `anyOf` + `null` nullability form while the JSON Schema writer itself emits `type: ['...', 'null']`.
   Why it matters: the proof matrix can go green while parser, writer, and neighbouring JSON-Schema-shaped surfaces still disagree about what the canonical JSON Schema contract actually is.

## Doctrine Or Doc Drift

- The main drift is temporal and contractual rather than purely implementational. [phase-4-json-schema-and-parity.md](/Users/jim/code/personal/castr/.agent/plans/current/complete/phase-4-json-schema-and-parity.md#L43) still says the parser and parity rig are complete and green, and [json-schema-and-parity-acceptance-criteria.md](/Users/jim/code/personal/castr/.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md#L3) still points at a nonexistent future-plan path.
- The acceptance criteria also overstate or contradict live doctrine in several places: they still allow metadata-directed lossy fallback and `components.schemas` bundle language in [json-schema-and-parity-acceptance-criteria.md](/Users/jim/code/personal/castr/.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md#L20), which conflicts with ADR-041's custom-rescue rule and the live `$defs` writer surface.
- Pack 4 closeout rewrote [json-schema-parser.md](/Users/jim/code/personal/castr/.agent/plans/current/paused/json-schema-parser.md#L1) from a stale parser-build plan into paused remediation context so the next implementation slice cannot accidentally resume the wrong story.
- The targeted Pack 4 executable proofs reproduced green locally on 2026-03-22:
  - `pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/scenario-5-json-schema-roundtrip.integration.test.ts tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts`
  - `pnpm --dir lib exec vitest run --config vitest.characterisation.config.ts src/characterisation/json-schema.char.test.ts`
    That makes the red verdict more serious rather than less: the current proofs are green because they validate a narrower subset than several plans and docs still claim.
- Manual in-session reviewer lenses were applied using the `code-reviewer`, `type-reviewer`, `test-reviewer`, and `json-schema-expert` templates. All four lenses converged on the same architectural conclusion: Pack 4 is blocked by contract honesty and proof coverage, not by the absence of a JSON Schema parser directory.

## Required Follow-On Slices

- JSON Schema ingest hardening: define one honest public document-parser contract, decide the explicit policy for standalone root schemas, boolean schemas, external refs, and unsupported keywords, and make unsupported semantics fail fast instead of remaining implicit.
- JSON Schema egress and proof alignment: decide the canonical JSON-Schema-shaped nullability and reference form, reconcile `contains` with the existing `minContains` / `maxContains` support claim, and add proof coverage that validates the actual egress contract rather than only shared bundle loops.
- JSON Schema handoff and doctrine cleanup: rewrite the paused JSON Schema plan and adjacent handoff docs so future sessions do not resume a stale parser-build plan that no longer matches code truth.

## Unblock Decision

- Pack 5 is unblocked and should be the next review pack.
- The next implementation slice remains blocked because Pack 4 found that the JSON Schema public contract, proof matrix, and successor plan still over-claim the supported surface.
- [json-schema-parser.md](/Users/jim/code/personal/castr/.agent/plans/current/paused/json-schema-parser.md) must not reactivate unchanged; it has been rewritten as paused remediation context rather than treated as a ready-to-run parser implementation plan.
