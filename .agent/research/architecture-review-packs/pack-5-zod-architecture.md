# Pack 5 — Zod Architecture

**Date:** 2026-03-22
**Verdict:** red

## Invariants Checked

- Zod must remain the canonical strict-only programming surface; contradictory object-mode chains must not slip through as accepted strict input.
- The Zod parser and writer must stay in lockstep around one explicit supported subset: if a construct is accepted on ingress, it must either round-trip through canonical egress or fail fast before semantics are lost.
- Recursive references, helper formats, metadata, and declaration references must preserve the intended IR meaning rather than relying on under-constrained heuristics or silent widening.
- Scenario 2, Scenario 4, Scenario 6, and the validation-parity suite must prove the supported Zod subset the repo claims, not just schema counts, schema names, or a narrow payload sample.
- Durable ADRs, architecture docs, and capability notes must describe the implemented Zod surface honestly.

## Findings

1. Severity: high
   File: [zod-parser.object.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts#L39)
   File: [zod-parser.object-policy.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/policy/zod-parser.object-policy.ts#L14)
   Issue: the strict-only ingest contract is bypassable. The object parser treats the first strict signal as sufficient, so contradictory chains such as `z.object(...).strict().passthrough()` and `z.strictObject(...).catchall(...)` are still accepted as strict schemas instead of being rejected as non-canonical widening.
   Why it matters: Pack 5 cannot clear while the flagship strict-only programming surface still admits object-mode contradictions that directly undercut IDENTITY-era doctrine.

2. Severity: high
   File: [zod-parser.object.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts#L66)
   File: [zod-parser.composition.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/composition/zod-parser.composition.ts#L52)
   File: [zod-parser.union.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/composition/zod-parser.union.ts#L50)
   File: [zod-parser.intersection.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/composition/zod-parser.intersection.ts#L39)
   Issue: unsupported nested Zod members can still disappear instead of failing fast. Several parser paths return `undefined` for unsupported nested nodes, and object/composition assembly drops those results rather than surfacing an immediate parser error.
   Why it matters: a green parse is not honest if unsupported child schemas can be silently omitted from the reconstructed IR.

3. Severity: high
   File: [zod-parser.references.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/registry/zod-parser.references.ts#L40)
   File: [zod-parser.references.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/registry/zod-parser.references.ts#L54)
   File: [zod-ast.declarations.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/ast/zod-ast.declarations.ts#L33)
   File: [ADR-032-zod-input-strategy.md](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-032-zod-input-strategy.md#L96)
   Issue: identifier-rooted expressions are promoted to `$ref` with too little proof that they are schema declarations. The current reference path resolves bindings and declaration names, but it does not fully prove that the target is a canonical schema declaration rather than an arbitrary identifier that happened to be in scope.
   Why it matters: declaration resolution is part of the parser's trust boundary; over-admitting identifiers risks constructing IR references to values that were never honest schema components.

4. Severity: high
   File: [zod-parser.zod4-formats.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/types/zod-parser.zod4-formats.ts#L21)
   File: [zod-parser.defaults.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/modifiers/zod-parser.defaults.ts#L57)
   File: [string-formats.zod4.ts](/Users/jim/code/personal/castr/lib/tests-fixtures/zod-parser/happy-path/string-formats.zod4.ts#L30)
   File: [primitives.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/zod/generators/primitives.ts#L127)
   File: [primitives.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/zod/generators/primitives.ts#L159)
   File: [scenario-2-zod-roundtrip.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-2-zod-roundtrip.integration.test.ts#L47)
   File: [payloads.ts](/Users/jim/code/personal/castr/lib/tests-fixtures/zod-parser/happy-path/payloads.ts#L97)
   Issue: the admitted helper surface is wider than the writer's canonical egress surface and wider than the proof matrix. Parser-side happy-path coverage currently includes helpers such as `base64`, `base64url`, `cidrv4`, `cidrv6`, `jwt`, and `e164`, but the writer does not emit corresponding helpers or reject all of those seams explicitly, so some cases can fall back to plain `z.string()` while Scenario 2 still goes green on schema-count checks and a small payload subset.
   Why it matters: parser/writer lockstep is a core Pack 5 invariant; semantic drift on accepted helper formats makes the current green transform suite narrower than the supported surface the repo implies.

5. Severity: medium
   File: [scenario-2-zod-roundtrip.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-2-zod-roundtrip.integration.test.ts#L47)
   File: [scenario-4-zod-via-openapi.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-4-zod-via-openapi.integration.test.ts#L33)
   File: [scenario-6-zod-via-json-schema.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts#L113)
   File: [transform-helpers.ts](/Users/jim/code/personal/castr/lib/tests-transforms/utils/transform-helpers.ts#L68)
   File: [transform-helpers.ts](/Users/jim/code/personal/castr/lib/tests-transforms/utils/transform-helpers.ts#L238)
   File: [zod-round-trip-limitations.md](/Users/jim/code/personal/castr/docs/architecture/zod-round-trip-limitations.md#L116)
   File: [metadata.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/zod/metadata.ts#L19)
   Issue: the proof and documentation story still over-claims semantic parity and metadata fidelity. Scenario 2 and Scenario 4 primarily assert schema counts, Scenario 6's "semantic equivalence" block checks component names, the parsed-output parity harness is only wired for a narrow non-primary fixture path, and metadata round-trip is documented more strongly than it is asserted.
   Why it matters: Pack 5 is a review of the whole Zod architecture, not just whether the current sample proofs happen to stay green on a narrow matrix.

## Doctrine Or Doc Drift

- [ADR-035-transform-validation-parity.md](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-035-transform-validation-parity.md#L62) still says non-canonical but lossless input should remain parseable, but the current Zod detection layer rejects chains such as `.email()`, `.uuid()`, and `.int()` rather than accepting them as non-canonical input; see [zod-parser.detection.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.detection.ts#L146) and [zod-parser.detection.unit.test.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/zod-parser.detection.unit.test.ts#L139).
- [README.md](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/zod/README.md#L71) and [ADR-031-zod-output-strategy.md](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-031-zod-output-strategy.md#L20) still read more like full metadata-preservation claims than the implemented `.meta()` subset supports; the live writer emits only a narrow key set and normalises `example` into `examples`; see [metadata.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/zod/metadata.ts#L19).
- [native-capability-matrix.md](/Users/jim/code/personal/castr/docs/architecture/native-capability-matrix.md#L22) still labels Zod `date-time` as a native match without noting the repo's current canonical `z.iso.datetime()` offset narrowing; the limitation is admitted in [README.md](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/zod/README.md#L39) and exercised in [zod-format-functions.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/zod-format-functions.integration.test.ts#L162).
- The scoped Pack 5 executable proofs all reproduced green locally on 2026-03-22:
  - `pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/scenario-2-zod-roundtrip.integration.test.ts tests-transforms/__tests__/scenario-4-zod-via-openapi.integration.test.ts tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts tests-transforms/__tests__/validation-parity.integration.test.ts tests-transforms/__tests__/validation-parity-tictactoe.integration.test.ts`
  - `pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/validation-parity-callback.integration.test.ts tests-transforms/__tests__/validation-parity-petstore-expanded.integration.test.ts`
    That makes the red verdict more serious rather than less: the current proofs are green because they validate a narrower subset than the live Zod support story still implies.
- Manual in-session reviewer lenses were applied using the `code-reviewer`, `type-reviewer`, `test-reviewer`, and `zod-expert` templates, supported by scoped parser, writer, and proof reads. All four lenses converged on the same outcome: Pack 5 is blocked by contract honesty and proof depth rather than by missing baseline Zod infrastructure.

## Required Follow-On Slices

- Zod ingest hardening: reject contradictory object-mode chains, fail fast on unsupported nested members, and tighten declaration-backed reference admission so identifiers cannot become schema refs accidentally.
- Zod parser/writer lockstep closure: either narrow the admitted helper surface to the writer's real canonical subset or add explicit emission and rejection seams for the currently drifting helper/date-time cases.
- Zod proof and doctrine honesty: align ADR-031, ADR-032, ADR-035, the native capability matrix, and the round-trip limitations doc with the actual metadata and parity coverage, then extend proofs to cover the supported helper and parsed-output surface explicitly.

## Unblock Decision

- Pack 6 is unblocked and should be the next review pack.
- The next implementation slice remains blocked because Pack 5 found live drift across Zod ingest, egress, proofs, and durable docs on a claimed supported surface.
- [json-schema-parser.md](/Users/jim/code/personal/castr/.agent/plans/current/paused/json-schema-parser.md) remains paused remediation context; the review sweep still decides the next implementation slice, not the old queued parser-build story.
