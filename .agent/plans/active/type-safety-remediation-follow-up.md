# Type-Safety Remediation Follow-Up

## Current Gate State

- `pnpm type-check` is green.
- `pnpm format:check` is green.
- `pnpm lint` is green, with residual type-assertion warnings only.
- `pnpm test` is green.
- `pnpm check:ci` is green.

## Residual Inventory

- Residual non-const assertion sites after this slice: `49` (temporarily surfaced as warnings while remediation continues)
- Repo-wide lint failures are now limited to:
  - none
- Repo-wide lint warnings currently include:
  - `49` residual non-const assertion sites in tests, fixtures, and harness code
- Residual non-assertion blockers currently mixed into repo-wide lint: `0`

## Resolved Since Previous Handoff

- Characterisation boundary cluster is complete:
  - `lib/src/characterisation/__fixtures__/bundled-spec-helpers.ts`
  - `lib/src/characterisation/bundled-spec-assumptions.char.test.ts`
  - `lib/src/characterisation/json-schema.char.test.ts`
  - `lib/src/characterisation/programmatic-usage.char.test.ts`
- Focused proof for that cluster is green:
  - focused lint on the edited characterisation files
  - `vitest.characterisation.config.ts` run covering the three characterisation test files in the cluster
- MCP from-IR test cluster is complete:
  - `lib/src/schema-processing/context/mcp/schemas/template-context.mcp.schemas.from-ir.test.ts`
  - `lib/src/schema-processing/context/mcp/template-context.mcp.from-ir.test.ts`
  - `lib/src/schema-processing/context/mcp/template-context.mcp.responses.from-ir.test.ts`
  - `lib/src/schema-processing/context/mcp/template-context.mcp.security.from-ir.test.ts`
- Focused proof for that cluster is green:
  - focused lint on the edited MCP from-IR files
  - targeted default `vitest run` covering the four MCP from-IR test files
- `lib/src/schema-processing/ir/validation/validators.ts` no longer blocks `pnpm type-check`
- `lib/src/schema-processing/parsers/openapi/builder.unit.test.ts` no longer blocks `pnpm format:check`
- `lib/src/schema-processing/ir/unknown-key-behavior.ts` no longer blocks `pnpm lint`; the legitimate `CastrSchema['type'] | undefined` helper returns now carry narrow inline Sonar disables.
- `lib/src/schema-processing/parsers/json-schema/index.ts` no longer blocks `pnpm lint`; the Draft 07 normalization files now live under the `json-schema/normalization/` bounded context.
- Full quality-gate recovery after that refactor is complete:
  - the new normalization helper/refs cycle is broken via a dedicated Draft 07 normalization types module
  - Knip truth is restored for `lib/eslint.config.ts` and the assertion-policy proof
  - the default Vitest suite is green again without timeout increases
  - `pnpm check:ci` is green again

## Residual Cluster Order

1. Shared loader and utility cluster
   - `lib/src/shared/load-openapi-document.test.ts`
   - `lib/src/shared/load-openapi-document/bundle/bundle-config.test.ts`
   - `lib/src/shared/load-openapi-document/validation-errors.integration.test.ts`
   - `lib/src/shared/maybe-pretty.test.ts`
   - `lib/src/shared/doctor/prefix-nonstandard.unit.test.ts`
   - `lib/src/shared/schema-complexity/schema-complexity.enum.test.ts`
2. Snapshot regression cluster
   - `lib/tests-snapshot/edge-cases/is-main-response.test.ts`
   - `lib/tests-snapshot/edge-cases/main-description-as-fallback.test.ts`
   - `lib/tests-snapshot/endpoints/errors-responses.test.ts`
   - `lib/tests-snapshot/endpoints/param-invalid-spec.test.ts`
   - `lib/tests-snapshot/integration/generateZodClientFromOpenAPI.test.ts`
   - `lib/tests-snapshot/integration/getOpenApiDependencyGraph.test.ts`
   - `lib/tests-snapshot/integration/samples.test.ts`
   - `lib/tests-snapshot/options/generation/export-all-types.test.ts`
   - `lib/tests-snapshot/options/generation/group-strategy.test.ts`
   - `lib/tests-snapshot/schemas/references/deps-graph-with-additionalProperties.test.ts`
   - `lib/tests-snapshot/schemas/types/schema-type-wrong-case.test.ts`
   - `lib/tests-snapshot/spec-compliance/openapi-spec-compliance.test.ts`
   - `lib/tests-snapshot/spec-compliance/spec-compliance.test.ts`
   - `lib/tests-snapshot/utilities/openApiToTypescript.test.ts`
3. Remaining parser/writer low-count files
   - `lib/src/schema-processing/ir/serialization.unit.test.ts`
   - `lib/src/schema-processing/parsers/zod/zod-parser.runner.integration.test.ts`
   - `lib/src/schema-processing/writers/zod/generators/composition.unit.test.ts`
   - `lib/src/schema-processing/writers/zod/generators/primitives.unit.test.ts`
   - `lib/tests-transforms/__tests__/scenario-1-openapi-roundtrip.integration.test.ts`

## Notes

- Keep allowing `as const`; continue banning all other type assertions.
- `@typescript-eslint/consistent-type-assertions` is temporarily configured as a warning while the residual backlog is being removed; restore it to `error` once the backlog reaches zero.
- Tranches 0-2 are effectively complete for this workstream; the next session should start with the Shared loader and utility cluster unless a fresh regression appears.
- Preserve the current worktree boundary around unknown-key semantics and adjacent parser refactors.
- Re-run the dedicated test config that matches each cluster (`vitest.characterisation.config.ts`, `vitest.snapshot.config.ts`, `vitest.transforms.config.ts`) instead of relying on the default config.
