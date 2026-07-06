<!-- Tracked plan-estate copy of the instance-tier handoff record
     .agent/state/collaboration/handoffs/remediation-02-preflight-mistbound.md (git-ignored
     by two-tier design, so it cannot ride the merge). Copied verbatim 2026-07-06 by
     Fragrant Twining Glade (closeout owner) so the merge carries the next-session seed.
     The handoff-record original remains authoritative for the PDR-063 pickup ceremony
     while it exists; this copy is the durable home. -->

# Handoff Record — Remediation-02 Pre-flight Brief (Mistbound Fading Night)

- **Author:** Mistbound Fading Night / claude-code / claude-fable-5 / fe1498 (scout, boundary
  (b) of the 2026-07-06 n=2 window with Fragrant Twining Glade)
- **Purpose:** conserve the remediation-02 scouting output for the NEXT session (owner
  end-game directive 2026-07-06: merge-first, no implementation branch this session).
- **Consumes:** [`02-ir-fidelity-proof-harness.md`](../active/02-ir-fidelity-proof-harness.md)
  (controlling plan), [wide+deep review 2026-07-04](../../report/wide-deep-review-2026-07-04.md)
  §2/§5, [initial-review appendix A](../../report/initial-review/appendix-A-reproductions.md).
- **Verification posture:** every load-bearing claim below was verified firsthand this
  session (probe execution or direct source read); subagent findings were not relayed
  unverified. C4 was re-proven by live probe execution against the built dist at
  `b313479`.

## Current state (decisions made)

1. **C4 re-proven live 2026-07-06**: `buildIR({type:'object', properties:{}})` →
   `serializeIR` → `deserializeIR` throws `Invalid CastrDocument structure`. An Explore
   subagent's code-read had concluded the deserialize path benign; the probe falsified it
   in one run (probe-outranks-read, worked instance). Root-cause suspect: the serialized
   shape of an empty `CastrSchemaProperties` (its `toJSON` at
   `lib/src/schema-processing/ir/serialization.ts` + `schema.ts:1017-1022` wrapper), not
   the revive loop. Root-causing belongs to the fix slice.
2. **The harness exists in embryo — plan-02 is a fixture problem, not infrastructure.**
   `lib/tests-transforms/` scenarios 1–6 already run full parse→IR→write→parse with IR
   equality (`lib/tests-transforms/utils/transform-helpers.ts:97-111`). They are green
   while C2–C4 reproduce ⇒ extend `tests-transforms` with the failing-edge fixture corpus +
   machine-readable outcomes. Do NOT build a parallel suite.
3. **Interim fail-fast is a two-site diff** (narrower than review prose):
   `lib/src/schema-processing/writers/zod/refinements/object.ts` —
   `writeDependentSchemasRefinement` (:122-135, `return true` emitted at :130) and
   `writeConditionalApplicatorRefinement` (if/then/else, :177-191, `return true` at
   :183-187). NOT placebos (leave alone): `writeUnevaluatedPropertiesRefinement`
   (:153-175) and `writers/zod/additional-properties.ts:21` — both real. The
   always-false `contains` refinement (`typeof item === 'integer'`, appendix A.5) is
   C6/plan-03 scope.
4. **H3 layer reconciled**: parser/writer pass wildcard status strings through opaquely;
   the defect is `parseInt('4XX')` → `4` at
   `lib/src/schema-processing/context/endpoints/template-context.endpoints.from-ir.ts:135`.
   The fixture must assert at the endpoints-context layer.
5. **C2 confirmed an IR-model slice** (review R3): flat `IRSecurityRequirement`
   (`lib/src/schema-processing/ir/models/schema.operations.ts:499-509`); AND-groups
   destroyed by `flatMap` at
   `lib/src/schema-processing/parsers/openapi/operations/fields/builder.operations.fields.ts:112-119`;
   OR-only assumptions baked into the OpenAPI writer
   (`writers/openapi/operations/openapi-writer.operations.fields.ts:11-24`, single-key
   emit) and the MCP consumer
   (`context/mcp/template-context.mcp.security.from-ir.ts:127-187`, TSDoc at :28 asserts
   OR-only).

## Fixture inventory (8; each red-first per the plan's TDD order)

| Fixture                                       | Finding | Seam (file:line, under `lib/src/schema-processing/` unless noted)                                                                                                                                                                                                                                                               | Red assertion                                                                  |
| --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| empty `properties: {}` round-trip             | C4      | `ir/serialization.ts:99-122` (throw :108); guards `lib/src/shared/type-utils/types.ts`                                                                                                                                                                                                                                          | deserialize(serialize(ir)) = ir, no throw. Land AFTER plan-05 `isRecord` fix   |
| dotted component name + `$ref`                | C3      | `writers/zod/index.ts:126-131`; `lib/src/shared/utils/identifier-utils.ts:142-147` (`safeSchemaName` leaves dots); divergent sanitiser `writers/typescript/helpers.ts:106`                                                                                                                                                      | emitted refs resolve; original name carried as IR identity                     |
| security `{A, B}` AND-group                   | C2      | model + flatten + consumers per §Current-state item 5                                                                                                                                                                                                                                                                           | round-trip preserves AND-grouping. Own slice, security-prioritised             |
| wildcard `4XX`/`5XX`                          | H3      | `context/endpoints/template-context.endpoints.from-ir.ts:135`                                                                                                                                                                                                                                                                   | endpoint context preserves `'4XX'` (or fail-fast), never `4`                   |
| boolean `exclusiveMinimum` + content keywords | H2/H4   | bounds normaliser `parsers/json-schema/normalization/json-schema-parser.normalization.ts:67-93`; WRITER GAP: `contentEncoding`/`contentMediaType` parsed into IR (`parsers/json-schema/json-schema-parser.helpers.ts:84-85`) but no writer emits them (declared `writers/shared/json-schema-object.ts:112-113`, never assigned) | write emits both content keywords; boolean exclusivity normalised or fail-fast |
| `$ref` + sibling keywords                     | H4      | `parsers/openapi/builder.core.ts:50-60` (siblings discarded)                                                                                                                                                                                                                                                                    | siblings carried per 3.1 semantics                                             |
| Draft-07 `if/then/else` nested + deep `$ref`  | H1      | `normalizeSubSchemas` (`...normalization.ts:99-111`) skips `if`/`then`/`else` (+ `patternProperties`, `propertyNames`, `contains`, `unevaluatedProperties`); ref rewriter `...normalization.refs.ts:25-36` rewrites ONLY 3-segment refs                                                                                         | nested constructs normalised at depth; deep refs rewritten or fail-fast        |
| empty-string `description`/`summary`          | M10     | truthy guards: `parsers/openapi/operations/fields/builder.operations.fields.ts:40,43,81,84`, `builder.request-body.ts:139`, `builder.responses.ts:179`, `builder.parameters.ts:284`, `parsers/openapi/schemas/builder.enums.ts:169`; correct `!== undefined` pattern exists at `parsers/openapi/builder.core.ts:103`            | `''` round-trips distinct from absent                                          |

## Harness mechanics

- Home: `lib/tests-transforms/` (`vitest.transforms.config.ts`, `pnpm test:transforms`).
- Machine-readable per-fixture outcome artefact — designed with the suite (feeds the
  overhaul plan §W5 preservation-coverage metric).
- Determinism (L13): compare emitted `files` CONTENT across two runs, not path keys.
- Fixture imports: `parseJsonSchema` + JSON Schema/TS writers are reachable only via the
  internal barrel `lib/src/schema-processing/index.ts` (review R1); tests import internal
  paths as the existing scenarios do. R1's export-or-declare-unsupported decision is the
  honesty phase, separate from this plan.

## Sequencing (decisions deferred to the implementing session)

1. First PR: red fixtures + interim fail-fast on the two placebos + outcome artefact.
2. C4 fix after plan-05 `isRecord`; C3, H1–H4, M10 as forced-red fixes; C2 as its own
   IR-model slice.
3. Docs: architecture note for the harness + `DEFINITION_OF_DONE.md` fidelity-suite line.
4. Open: exact shape of the outcome artefact (JSON per fixture vs single manifest) — chose
   not to pre-decide without the W5 metric consumer's shape.

## In-flight reasoning residue (context scan)

- The 2026-06-04 probe scripts lived in machine-temp and are gone; appendix A.3–A.8 name
  the exact dist imports + inputs, so the fixtures reconstruct them — making durable
  committed fixtures out of previously-volatile probes is precisely plan-02's value.
- My pre-window probe + Explore dispatch CPU-contended Glade's singleton gate run
  (claims-concurrency integration test flaked at 9.6s vs 4.6s isolated) — worked instance
  of holding heavy runs during a peer's gate/commit window
  (`check-singleton-per-window` / `no-unbounded-host-load` family).
