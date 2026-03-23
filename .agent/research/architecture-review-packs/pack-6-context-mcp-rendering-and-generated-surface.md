# Pack 6 — Context, MCP, Rendering, and Generated Surface

**Date:** 2026-03-22
**Verdict:** red

## Invariants Checked

- Downstream context, rendering, MCP, and generated-code surfaces must derive cleanly from canonical IR rather than reintroducing post-IR repair logic or hidden template semantics.
- Every advertised generation path - `schemas-only`, `schemas-with-metadata`, grouped output, CLI manifest emission, and custom-template entrypoints - must have one honest public contract.
- MCP tool schemas must pass through one governed JSON Schema / Draft 07 contract instead of ad hoc IR field dumping.
- Generated-code proof suites must prove the supported output modes and runtime obligations the repo claims, not just structural presence checks on a narrower default path.
- Durable docs, API reference pages, and integration guides must match the actual CLI, programmatic, and generated output surfaces.

## Findings

1. Severity: high
   File: [generate-from-context.ts](/Users/jim/code/personal/castr/lib/src/rendering/generate-from-context.ts#L40)
   File: [generate-from-context.ts](/Users/jim/code/personal/castr/lib/src/rendering/generate-from-context.ts#L180)
   File: [index.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/typescript/index.ts#L44)
   File: [index.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/typescript/index.ts#L138)
   File: [options.char.test.ts](/Users/jim/code/personal/castr/lib/src/characterisation/options.char.test.ts#L100)
   Issue: `schemas-only` is not an honest template boundary. Template selection only changes option defaults; the TypeScript writer still emits `endpoints` and `mcpTools` for any context that contains them. The current characterisation test for `schemas-only` only checks that schema output contains `User`, not that metadata exports are absent.
   Why it matters: Pack 6 cannot clear while one of the main public generation modes still over-promises a narrower output contract than the renderer actually produces.

2. Severity: high
   File: [generate-from-context.ts](/Users/jim/code/personal/castr/lib/src/rendering/generate-from-context.ts#L44)
   File: [generate-from-context.ts](/Users/jim/code/personal/castr/lib/src/rendering/generate-from-context.ts#L158)
   File: [helpers.ts](/Users/jim/code/personal/castr/lib/src/cli/helpers.ts#L100)
   File: [API-REFERENCE.md](/Users/jim/code/personal/castr/docs/API-REFERENCE.md#L88)
   Issue: custom template paths are part of the documented CLI and programmatic surface, but the rendering pipeline never reads `templatePath`. The CLI still maps non-built-in template values onto that field, yet generation always routes through the built-in ts-morph writer path.
   Why it matters: this is public-surface drift, not an internal TODO. Users are being offered an extension seam that the current implementation silently ignores.

3. Severity: high
   File: [template-context.mcp.schemas.from-ir.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/mcp/schemas/template-context.mcp.schemas.from-ir.ts#L183)
   File: [template-context.mcp.schemas.from-ir.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/mcp/schemas/template-context.mcp.schemas.from-ir.ts#L233)
   File: [schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts#L108)
   File: [schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts#L230)
   File: [schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts#L301)
   File: [schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts#L356)
   File: [schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts#L418)
   Issue: MCP schema generation bypasses the repo's governed JSON Schema contract and copies every non-metadata IR key straight into JSON-Schema-shaped output. That means Draft 07 output can inherit IR-only or newer-keyword fields such as `integerSemantics`, `contentEncoding`, `readOnly`, `writeOnly`, `unevaluated*`, and `minContains` / `maxContains` without a single authoritative Draft 07 normalisation pass.
   Why it matters: the Pack 6 MCP surface cannot honestly claim Draft 07 compatibility while its builder can emit keys that belong to IR doctrine or later JSON Schema vocabularies rather than the governed MCP contract.

4. Severity: high
   File: [FIXTURES.md](/Users/jim/code/personal/castr/lib/tests-generated/FIXTURES.md#L7)
   File: [validation-harness.ts](/Users/jim/code/personal/castr/lib/tests-generated/validation-harness.ts#L153)
   File: [validation-harness.ts](/Users/jim/code/personal/castr/lib/tests-generated/validation-harness.ts#L181)
   File: [validation-harness.ts](/Users/jim/code/personal/castr/lib/tests-generated/validation-harness.ts#L262)
   File: [type-check-validation.gen.test.ts](/Users/jim/code/personal/castr/lib/tests-generated/type-check-validation.gen.test.ts#L68)
   File: [runtime-validation.gen.test.ts](/Users/jim/code/personal/castr/lib/tests-generated/runtime-validation.gen.test.ts#L69)
   File: [templating.unit.test.ts](/Users/jim/code/personal/castr/lib/src/rendering/templating.unit.test.ts#L160)
   Issue: the generated-surface proof suite over-claims runtime and type guarantees. The fixture doc says generated code is "runtime-executable", but the runtime harness only checks that the file exists, is non-empty, and imports Zod. The type-check harness filters known module-resolution failures, the generated-code tests only cover single-file output, and grouped output proof currently stops at sorted path names rather than syntax, type, lint, or runtime validation.
   Why it matters: green Pack 6 proofs do not yet prove the full generated output contract that users are being asked to trust.

5. Severity: medium
   File: [template-context.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.ts#L120)
   File: [template-context.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.ts#L129)
   File: [inline-schemas.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/schemas/inline-schemas.ts#L16)
   File: [inline-schemas.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/schemas/inline-schemas.ts#L36)
   File: [template-context.test.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.test.ts#L101)
   Issue: the template-context layer still reintroduces legacy repair logic after IR construction. It mutates the built IR by hoisting inline request bodies into components, appends their names to schema order with "order should be fine" reasoning, and still carries public options such as `shouldExportAllSchemas: false` whose own test notes are not currently implemented in the IR-based architecture.
   Why it matters: downstream generation is not yet a pure projection from canonical IR; it still mixes IR truth with generation-time convenience heuristics and partially honest option surfaces.

## Doctrine Or Doc Drift

- [MCP_INTEGRATION_GUIDE.md](/Users/jim/code/personal/castr/docs/MCP_INTEGRATION_GUIDE.md#L41) materially overstates the current MCP public surface. It documents `@engraph/castr` as the CLI binary, a manifest-only mode, `openApiDoc: './petstore.yaml'` as a programmatic argument, `result.mcpTools` on the generation result, and a `{ "tools": [...] }` manifest shape. The live CLI instead writes an array of `{ tool, httpOperation, security }` entries and still generates an output file alongside the manifest; see [index.ts](/Users/jim/code/personal/castr/lib/src/cli/index.ts#L140) and [cli.char.test.ts](/Users/jim/code/personal/castr/lib/src/characterisation/cli.char.test.ts#L306).
- [API-REFERENCE.md](/Users/jim/code/personal/castr/docs/API-REFERENCE.md#L95) still advertises `templatePath` as part of the programmatic surface even though Pack 6 found no live implementation path for it.
- The scoped Pack 6 executable proofs all reproduced green locally on 2026-03-22:
  - `pnpm --dir lib exec vitest run src/schema-processing/context/template-context.test.ts src/schema-processing/context/template-context.from-ir.test.ts src/schema-processing/context/template-context-ir.test.ts src/schema-processing/context/endpoints/template-context.endpoints.dependencies.unit.test.ts src/schema-processing/context/endpoints/template-context.endpoints.from-ir.unit.test.ts src/schema-processing/context/mcp/template-context.mcp.test.ts src/schema-processing/context/mcp/template-context.mcp.from-ir.test.ts src/schema-processing/context/mcp/template-context.mcp-tools.test.ts src/schema-processing/context/mcp/template-context.mcp.parameters.from-ir.test.ts src/schema-processing/context/mcp/template-context.mcp.responses.from-ir.test.ts src/schema-processing/context/mcp/template-context.mcp.security.from-ir.test.ts src/schema-processing/context/mcp/schemas/template-context.mcp.schema.test.ts src/schema-processing/context/mcp/schemas/template-context.mcp.schemas.from-ir.test.ts src/schema-processing/context/mcp/schemas/template-context.mcp.inline-json-schema.from-ir.test.ts src/rendering/templating.unit.test.ts src/rendering/templates/schemas-with-metadata.test.ts src/schema-processing/writers/typescript/typescript.unit.test.ts src/schema-processing/writers/typescript/type-writer.unit.test.ts src/schema-processing/writers/typescript/type-writer.determinism.unit.test.ts src/schema-processing/writers/typescript/type-writer.integer-semantics.unit.test.ts src/schema-processing/writers/typescript/mcp.unit.test.ts src/validation/mcp-type-guards.test.ts src/validation/mcp-error-formatting.test.ts`
  - `pnpm --dir lib exec vitest run --config vitest.generated.config.ts tests-generated/syntax-validation.gen.test.ts tests-generated/type-check-validation.gen.test.ts tests-generated/lint-validation.gen.test.ts tests-generated/runtime-validation.gen.test.ts`
  - Two local spot-check reproductions also succeeded on 2026-03-22 and strengthened the red verdict:
    - `generateZodClientFromOpenAPI({ template: 'schemas-only' })` still emitted both `export const endpoints` and `export const mcpTools`
    - `buildMcpToolSchemasFromIR()` on an `int64` IR schema emitted `integerSemantics` into the MCP output schema
      Those greens make the red verdict more serious rather than less: the Pack 6 proofs currently validate a narrower, more structural subset than the live generated-surface contract still implies.
- Direct agent fan-out was unreliable during Pack 6 on 2026-03-22, so the review used the repo's fallback contract: manual in-session `code-reviewer`, `type-reviewer`, and `test-reviewer` lenses applied against the focused Pack 6 file set.

## Required Follow-On Slices

- Rendering and public-surface honesty: make `schemas-only` genuinely schemas-only or narrow the supported template surface to what the writer actually emits; remove or implement `templatePath` rather than leaving it as a ghost public option.
- MCP schema hardening: route MCP tool input/output schemas through one governed Draft 07 normal form with explicit capability rejection instead of raw IR field copying.
- Generated-surface proof hardening: upgrade generated-code validation from structural smoke checks to honest execution / compilation obligations, and extend proof coverage to grouped output, manifest emission, and any genuinely supported template variants.
- Template-context cleanup: decide whether inline-schema hoisting belongs in IR, in writer-local logic, or nowhere, then align `shouldExportAllSchemas` and related options with the actual IR-based behaviour.

## Unblock Decision

- Pack 7 is unblocked and should be the next review pack.
- The next implementation slice remains blocked because Pack 6 found contract drift across template selection, MCP schema generation, generated-output proofs, and durable public docs.
- [json-schema-parser.md](/Users/jim/code/personal/castr/.agent/plans/current/paused/json-schema-parser.md) remains paused remediation context; the review sweep still decides the next implementation slice rather than reactivating any queued implementation story on assumption.
