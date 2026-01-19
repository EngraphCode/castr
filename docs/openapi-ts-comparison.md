# Castr vs OpenAPI-TS: Comparative Analysis

## Executive Summary

- Castr is a canonical IR-first transformer focused on schema building blocks, validation, and MCP tooling; OpenAPI-TS is a plugin-first SDK/codegen system optimized for client output breadth and ecosystem integrations.
- Castr normalizes all inputs to OpenAPI 3.1 via Scalar and pushes strict spec validation and round-trip correctness; OpenAPI-TS supports 2.0/3.0/3.1 with optional, limited spec validation and richer pre-parse transforms and filters.
- Castr embeds rich schema metadata (nullable, zod chain, dependency graph) directly in IR; OpenAPI-TS keeps IR closer to JSON Schema, relying on graph metadata and plugin context for behavior.
- OpenAPI-TS offers a large plugin surface (clients, frameworks, validators, transformers) and output folder scaffolding; Castr offers fewer templates but deeper IR- and MCP-centric outputs (including OpenAPI writer).
- OpenAPI-TS test fixtures are a valuable corpus for Castr input/IR validation, but third-party spec licensing must be audited before copying; MIT license applies to OpenAPI-TS codebase itself.

## Scope and Sources

- Castr source root: `lib/`, `docs/`, and root README.
- OpenAPI-TS source root: `tmp/openapi-ts/`, especially `packages/openapi-ts` and `docs/openapi-ts`.
- Versions observed: Castr `lib/package.json` 1.18.3; OpenAPI-TS `packages/openapi-ts/package.json` 0.90.4.

## Feature Matrix

| Category                 | Castr (@engraph/castr)                                                           | OpenAPI-TS (@hey-api/openapi-ts)                                    | Notes                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Primary intent           | Canonical IR for N×M schema transformation + building blocks + MCP               | Plugin-driven OpenAPI codegen for SDKs, types, schemas, frameworks  | Distinct product goals shape architecture                                     |
| Default output           | Zod schemas + endpoint metadata                                                  | TS types + SDK + client scaffolding                                 | Castr is building-blocks; OpenAPI-TS is output-first                          |
| OpenAPI output           | Yes (IR → OpenAPI writer)                                                        | Yes (serialized spec output via output.source)                      | Castr writes OpenAPI from IR; OpenAPI-TS emits source spec                    |
| Supported OAS versions   | 3.0.x/3.1.x (auto-upgraded to 3.1)                                               | 2.0, 3.0, 3.1                                                       | Castr README says 2.0 unsupported; Scalar pipeline auto-upgrades 2.0          |
| Input sources            | File, URL, object                                                                | File, URL, registry shorthand, object; watch mode                   | OpenAPI-TS adds registry + watch                                              |
| Bundling / normalization | Scalar pipeline bundles external refs, preserves internal $refs, upgrades to 3.1 | json-schema-ref-parser bundles; patch/transform/filter before parse | Castr emphasizes $ref preservation for graphs                                 |
| Parser transforms        | Few explicit transforms (options like implicitRequired)                          | Extensive: patch, filters, transforms, hooks, pagination keywords   | OpenAPI-TS is more configurable pre-parse                                     |
| IR model                 | Canonical CastrDocument + CastrSchema with rich metadata                         | IR.Model with JSON Schema-ish objects + graph metadata              | Both have IR; depth and shape differ                                          |
| Schema metadata          | Embedded CastrSchemaNode (required, nullable, zodChain, dependency graph)        | Access scopes and graph metadata; no zod-specific chain in IR       | Castr IR is generation-aware for Zod                                          |
| Dependency graph         | Component-level dependency graph for ordering and circular refs                  | JSON-pointer graph with scope propagation                           | Different granularity and use cases                                           |
| Code generation          | ts-morph writers + templates                                                     | @hey-api/codegen-core Project/renderer + plugins                    | Both structured, different tooling                                            |
| Extensibility            | Template selection + custom template path                                        | First-class plugin system with dependency ordering, tags, hooks     | OpenAPI-TS is more extensible at output layer                                 |
| Client generation        | Optional openapi-fetch client template                                           | Client plugins (fetch, axios, angular, nuxt, etc.)                  | Castr avoids client coupling by default                                       |
| Validators               | MCP input/output guards + Zod validation; AJV for spec validation                | Validator plugins (zod/valibot; ajv planned)                        | Different scope: Castr validates specs; OpenAPI-TS validates runtime payloads |
| Spec validation          | Fail-fast + AJV compliance tests                                                 | Optional/experimental validate_EXPERIMENTAL with limited rules      | Castr is stricter; OpenAPI-TS is lighter                                      |
| Round-trip correctness   | Explicitly targeted with tests                                                   | Not a stated goal                                                   | Castr’s IR is designed for losslessness                                       |
| Output layout            | Single file or grouped files                                                     | Generated folder tree with client/core/sdk/types                    | OpenAPI-TS scaffolds runtime                                                  |
| Registry integration     | None                                                                             | Yes (Hey API, Scalar, ReadMe)                                       | OpenAPI-TS has platform integrations                                          |
| MCP tooling              | First-class output + error formatting                                            | None                                                                | Unique to Castr                                                               |
| Test strategy            | Unit + snapshot + roundtrip + characterisation + e2e                             | Snapshot-heavy + plugin outputs + CLI tests                         | Both extensive; different emphases                                            |
| License                  | MIT (package.json)                                                               | MIT (LICENSE.md)                                                    | OpenAPI-TS includes LICENSE files                                             |

## IR Field Comparison

| Concept          | Castr IR                                                                                                                                                      | OpenAPI-TS IR                                                                                             | Notes                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Document root    | `CastrDocument` with `info`, `servers`, `components`, `operations`, `dependencyGraph`, `schemaNames`, `enums`, `security`, `tags`, `externalDocs`, `webhooks` | `IR.Model` with `components`, `paths`, `servers`, `webhooks`                                              | Castr is richer and operation-centric              |
| Components       | `IRComponent` union (schemas, responses, parameters, headers, links, callbacks, examples, etc.)                                                               | `components` map for schemas/parameters/requestBodies                                                     | Castr explicitly models more component types       |
| Schema shape     | `CastrSchema` with OpenAPI+JSON Schema fields plus metadata                                                                                                   | `IR.SchemaObject` with JSON Schema 2020-12 fields + `symbolRef`, `accessScope`, `logicalOperator`, `omit` | OpenAPI-TS IR is closer to JSON Schema             |
| Schema metadata  | `CastrSchemaNode` (required, nullable, zodChain, dependency info, circular refs)                                                                              | Graph node scopes + dependency maps                                                                       | Castr stores generation-ready metadata in IR       |
| Composition      | `allOf` / `anyOf` / `oneOf`                                                                                                                                   | `items` array + `logicalOperator` + `type` hints                                                          | Representation differs; mapping needed for interop |
| Operations       | `CastrOperation` with parameters, requestBody, responses, tags, servers, callbacks                                                                            | `IROperationObject` with `parameters` map, `body`, `responses`, `security`                                | Castr has richer response/content structure        |
| Parameters       | `CastrParameter` with schema + examples, style, explode, allowReserved                                                                                        | `IRParameterObject` with schema, style, explode, allowReserved, pagination                                | Similar, but OpenAPI-TS stores pagination hints    |
| Request body     | `IRRequestBody` with `content` map (media types)                                                                                                              | `IRBodyObject` with `mediaType`, `schema`, `required`                                                     | OpenAPI-TS simplifies to one media type            |
| Responses        | `CastrResponse` supports schema, content map, headers, links                                                                                                  | `IRResponseObject` has schema + mediaType                                                                 | Castr retains more HTTP details                    |
| Security         | `IRSecurityRequirement` (schemeName, scopes) + components                                                                                                     | `IR.SecurityObject` aliases OAS security schemes                                                          | Castr normalizes security into requirements        |
| Enum catalog     | `IREnum` catalog with names and values                                                                                                                        | Enums represented inline in schemas                                                                       | Castr treats enums as first-class                  |
| Dependency graph | `IRDependencyGraph` with topological order and circular cycles                                                                                                | Graph with JSON pointers + scope propagation                                                              | Different representations but similar intent       |

## Architectural Differences and Implications

### Normalization and Reference Handling

- Castr normalizes all inputs to OpenAPI 3.1 via Scalar and preserves internal $refs for dependency graphs and circular detection (`docs/architecture/scalar-pipeline.md`, `lib/src/shared/prepare-openapi-document.ts`).
- OpenAPI-TS bundles via `@hey-api/json-schema-ref-parser`, then applies patch/filter/transform logic before parsing (`tmp/openapi-ts/packages/openapi-ts/src/createClient.ts`, `tmp/openapi-ts/docs/openapi-ts/configuration/parser.md`).
- Implication: Castr favors lossless reference tracking and round-trip fidelity; OpenAPI-TS favors mutable pre-processing to fit plugin outputs.

### Output Strategy

- Castr outputs are template-driven and can be single file or grouped; it can emit OpenAPI from IR (`lib/src/rendering/templating.ts`, `lib/src/writers/openapi/index.ts`).
- OpenAPI-TS outputs are plugin-scaffolded directory trees with runtime clients and core helpers (`tmp/openapi-ts/docs/openapi-ts/output.md`).
- Implication: Castr is ideal for building-block outputs; OpenAPI-TS is ideal for turnkey SDK generation.

### Extensibility Model

- Castr: template selection + custom template paths; writers are ts-morph based.
- OpenAPI-TS: plugin graph with dependencies, tags, hooks, and custom plugins (`tmp/openapi-ts/packages/openapi-ts/src/config/plugins.ts`, `tmp/openapi-ts/docs/openapi-ts/core.md`).
- Implication: OpenAPI-TS is more extensible at the output layer; Castr is more rigid but provides a stable IR core.

### Transformation Philosophy

- Castr: fail-fast and minimize heuristics; encourage spec compliance (`docs/architectural_decision_records/ADR-001-fail-fast-spec-violations.md`).
- OpenAPI-TS: supports patching and transforms to handle real-world input variance (`tmp/openapi-ts/docs/openapi-ts/configuration/parser.md`).
- Implication: Castr provides stricter correctness guarantees; OpenAPI-TS provides more tolerance and customization.

## Validation and Quality

### Spec Validation

- Castr uses AJV to validate OpenAPI compliance and enforce fail-fast behavior (`docs/architectural_decision_records/ADR-011-ajv-runtime-validation.md`).
- OpenAPI-TS validation is optional and limited (unique operationId, server checks) with `validate_EXPERIMENTAL` (`tmp/openapi-ts/packages/openapi-ts/src/openApi/3.1.x/parser/validate.ts`).

### Runtime Validation

- Castr: Zod schemas with MCP-specific guards and error formatting (`lib/src/validation/mcp-type-guards.ts`, `lib/src/validation/mcp-error-formatting.ts`).
- OpenAPI-TS: validator plugins (Zod, Valibot; Ajv planned) (`tmp/openapi-ts/docs/openapi-ts/validators.md`).

### Testing Strategy

- Castr: unit + snapshot + roundtrip + generated + characterisation + e2e (multiple Vitest configs).
- OpenAPI-TS: extensive snapshot fixtures and plugin outputs, plus CLI/unit tests (`tmp/openapi-ts/packages/openapi-ts-tests`, `tmp/openapi-ts/packages/openapi-ts/src/__tests__`).

## How Each Library Could Benefit the Other

### Castr -> OpenAPI-TS

- **MCP tooling**: OpenAPI-TS could add MCP tool manifest output and validation utilities inspired by Castr.
- **Round-trip validation**: Adopt Castr’s round-trip invariants to validate IR correctness for plugins.
- **Strict spec validation**: Incorporate AJV-backed compliance (or similar) as a non-experimental mode.
- **OpenAPI writer from IR**: Use Castr-style IR-to-OpenAPI writer to support normalization workflows.

### OpenAPI-TS -> Castr

- **Plugin ecosystem**: Castr could adopt a light plugin interface for optional outputs (SDKs, framework hooks).
- **Parser transforms/filters**: Offer opt-in patching/filters to handle messy specs without weakening default strictness.
- **Registry + watch mode**: Provide registry shorthand input and watch-based regeneration for dev flows.
- **Transformers**: Add a “transformers” output (dates/bigint) or hook into output metadata to enable this.

### Shared/Interop Opportunities

- Define a shared IR interchange or adapter between `CastrDocument` and OpenAPI-TS `IR.Model` to reuse outputs.
- Use OpenAPI-TS client plugins to consume Castr endpoint metadata and Zod schemas.
- Create a compatibility test suite that feeds the same spec corpus through both IRs and compares semantic output.

## OpenAPI-TS Test Cases: Value and Reuse for Castr

### What’s Valuable

- **Spec corpus** across 2.0, 3.0, 3.1, with many edge cases: discriminators, refs, nullable, enums, defaults, etc. (`tmp/openapi-ts/specs`).
- **Plugin snapshots** show real-world output expectations and naming edge cases (`tmp/openapi-ts/packages/openapi-ts-tests/main/test/__snapshots__`).
- **Parser transforms cases** (read/write, required-by-default, enum lifting) provide behavioral tests.

### How They Could Improve Castr

- Use OpenAPI-TS spec fixtures as **input validation** tests for parsing/IR stability.
- Convert select fixtures into **round-trip validation** for Castr’s OpenAPI writer.
- Extract edge-case specs to extend Castr’s **characterisation tests** and regression suite.
- Use fixture groups to validate **dependency graph correctness** and **circular handling**.

### Licensing and Adaptation Considerations

- OpenAPI-TS code and fixtures are under MIT (`tmp/openapi-ts/LICENSE.md`, `tmp/openapi-ts/packages/openapi-ts/LICENSE.md`), so reuse is allowed with attribution and inclusion of the MIT license text.
- Some spec fixtures are likely sourced from third parties (e.g., `tmp/openapi-ts/specs/3.1.x/openai.yaml`, `tmp/openapi-ts/specs/3.1.x/zoom-video-sdk.json`). These may carry their own licenses or terms. Audit each file’s provenance and license before copying or redistributing.
- Safer approach: **reference** the fixtures in-place for internal testing, or recreate minimal synthetic equivalents inspired by the edge cases to avoid third-party licensing ambiguity.
- If copying: include license notices in the destination test folder and preserve any file-level license metadata. (Not legal advice.)

## Recommendations

- Build a shared spec corpus index mapping OpenAPI-TS fixtures to Castr test categories (parsing, IR, roundtrip, schema validation).
- Prototype a minimal plugin interface in Castr for optional outputs (without abandoning the building-blocks stance).
- Add a “strict vs tolerant” mode in Castr to optionally allow OpenAPI-TS-style patch/filter transformations.
- Consider an interop adapter: `CastrDocument -> OpenAPI-TS IR.Model` for selected plugins.

## References

- Castr architecture: `docs/architecture/scalar-pipeline.md`, `docs/architectural_decision_records/ADR-023-ir-based-architecture.md`
- Castr validation: `docs/architectural_decision_records/ADR-001-fail-fast-spec-violations.md`, `docs/architectural_decision_records/ADR-011-ajv-runtime-validation.md`
- Castr IR: `lib/src/ir/schema.ts`, `lib/src/ir/context.ts`
- OpenAPI-TS core: `tmp/openapi-ts/packages/openapi-ts/src/index.ts`, `tmp/openapi-ts/packages/openapi-ts/src/createClient.ts`
- OpenAPI-TS parser/IR: `tmp/openapi-ts/packages/openapi-ts/src/openApi/3.1.x/parser/index.ts`, `tmp/openapi-ts/packages/openapi-ts/src/ir/types.d.ts`
- OpenAPI-TS plugins/config: `tmp/openapi-ts/packages/openapi-ts/src/config/plugins.ts`, `tmp/openapi-ts/docs/openapi-ts/core.md`
- OpenAPI-TS validation/transform: `tmp/openapi-ts/packages/openapi-ts/src/openApi/3.1.x/parser/validate.ts`, `tmp/openapi-ts/docs/openapi-ts/configuration/parser.md`
- OpenAPI-TS fixtures: `tmp/openapi-ts/specs`
