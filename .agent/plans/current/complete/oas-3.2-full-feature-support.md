# OAS 3.2 Full Feature Support

**Status:** COMPLETE — staged closure record  
**Created:** 2026-03-31  
**Promoted:** 2026-04-03  
**Predecessor:** [oas-3.2-version-plumbing.md](./oas-3.2-version-plumbing.md) (✅ complete, Thursday 2 April 2026)  
**Dependency:** Version plumbing is complete; keep feature work separate from the canonical-version baseline slice  
**Lifecycle:** Moved from `.agent/plans/active/` to `.agent/plans/current/complete/` on Saturday, 11 April 2026 after Phase E closed so `active/` no longer implies resumable work that is already complete  
**Updated:** 2026-04-11 — Phase E is closed: native `itemSchema` streaming plus `additionalOperations` now survive the OpenAPI parser/IR/writer path, downstream custom verbs are exposed end to end, non-OpenAPI downstreams fail fast on reachable `itemSchema`, the reviewer loop is closed with no open findings, and repo-root `pnpm check` is green

---

## Goal

Implement full support for all OAS 3.2.0 features across the IR, parsers, and writers. Each feature follows the Input-Output Pair Compatibility Model: the IR must carry the feature, and each output format either emits it semantically or fails fast with an actionable error.

> [!NOTE]
> This file is now a staged completion record, not the active execution plan. Do not reopen it unless a fresh regression is actually reproduced on a landed OAS 3.2 surface.

---

## OAS 3.2 Feature Inventory

| #   | Feature                | OAS Object      | New Fields                          | Complexity      |
| --- | ---------------------- | --------------- | ----------------------------------- | --------------- |
| 1   | `QUERY` HTTP method    | PathItem        | `query` operation                   | Low             |
| 2   | `additionalOperations` | PathItem        | `additionalOperations` map          | Medium          |
| 3   | Hierarchical tags      | Tag             | `parent`, `kind`, `summary`         | Low             |
| 4   | Example semantics      | Example Object  | `dataValue`, `serializedValue`      | Medium          |
| 5   | `itemSchema` streaming | Media Type      | `itemSchema`                        | Medium          |
| 6   | OAuth2 Device flow     | Security Scheme | `deviceAuthorization` under `flows` | Low             |
| 7   | XML `nodeType`         | XML Object      | `nodeType`                          | Low             |
| 8   | Path templating        | Path            | ABNF formalization                  | Low (validator) |

---

## Input-Output Pair Support Matrix

Each feature must be classified per output format using the compatibility model.

### Feature 1: `QUERY` HTTP Method

| Surface     | Support                                  | Rationale                                                |
| ----------- | ---------------------------------------- | -------------------------------------------------------- |
| IR          | ✅ Add `'query'` to `IRHttpMethod` union | Trivial enum addition                                    |
| OAS Parser  | ✅ Accept `query` in path item parsing   | Already iterates methods                                 |
| OAS Writer  | ✅ Emit `query` operations               | Same pattern as existing methods                         |
| JSON Schema | N/A                                      | JSON Schema has no operation concept                     |
| Zod         | ✅                                       | Zod schemas for query parameters work same as any method |
| TypeScript  | ✅                                       | Types are method-agnostic                                |

**IR changes:** `IRHttpMethod` union + `VALID_HTTP_METHODS` set
**Effort:** Small — ~10 lines + tests

### Feature 2: `additionalOperations`

| Surface     | Support                                                      | Rationale                            |
| ----------- | ------------------------------------------------------------ | ------------------------------------ |
| IR          | ✅ Add `additionalOperations` to `CastrDocument` or per-path | Map of custom method → operation     |
| OAS Parser  | ✅ Parse `additionalOperations` from PathItem                | New extraction function              |
| OAS Writer  | ✅ Emit `additionalOperations` in output                     | New emission function                |
| JSON Schema | N/A                                                          | No operation concept                 |
| Zod         | ✅                                                           | Schema generation is method-agnostic |
| TypeScript  | ✅                                                           | Type generation is method-agnostic   |

**IR changes:** Separate storage on `CastrDocument` per ADR-046 — preserves `IRHttpMethod` type safety, ensures lossless round-trip
**Effort:** Medium — new operation extraction path, ~50-100 lines + tests

### Feature 3: Hierarchical Tags

| Surface     | Support                                                 | Rationale                                 |
| ----------- | ------------------------------------------------------- | ----------------------------------------- |
| IR          | ✅ Fields come from `@scalar/openapi-types` `TagObject` | `parent`, `kind`, `summary` already typed |
| OAS Parser  | ✅ Pass through (already preserves tag objects)         | Verify new fields survive                 |
| OAS Writer  | ✅ Emit as-is                                           | Already emits tag objects                 |
| JSON Schema | N/A                                                     | Tags are an OAS concept                   |
| Zod         | N/A                                                     | Tags don't affect schema generation       |
| TypeScript  | N/A                                                     | Tags don't affect type generation         |

**IR changes:** Type naturally includes `parent`, `kind`, `summary` via Scalar's `OpenAPIV3_2.TagObject`
**Effort:** Small — verify pass-through + round-trip proof, ~20 lines

### Feature 4: Example Semantics (`dataValue` / `serializedValue`)

| Surface     | Support                                                     | Rationale                                                                    |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| IR          | ✅ Native Scalar types + honest parameter examples contract | `ExampleObject` fields are native; `CastrParameter.examples` now matches OAS |
| OAS Parser  | ✅ Pass-through preserves both fields                       | Shared load/parser path already keeps full Example Objects intact            |
| OAS Writer  | ✅ Emit both fields                                         | Existing writer pass-through already preserves Example Objects               |
| JSON Schema | ✅ (partial)                                                | Schema-level `examples` unchanged; component examples carry new fields       |
| Zod         | N/A                                                         | Examples are documentation-only                                              |
| TypeScript  | N/A                                                         | Examples are documentation-only                                              |

**IR changes:** Scalar's `OpenAPIV3_2.ExampleObject` includes both fields natively. Phase D closes the remaining seam by making `CastrParameter.examples` honest, preserving full Example Object/ref shapes publicly, and aligning singular parameter example derivation with the locked precedence rule.
**Effort:** Closed on Saturday, 11 April 2026 — core seam + helper alignment plus proof coverage

### Feature 5: `itemSchema` Streaming

| Surface     | Support                               | Rationale                               |
| ----------- | ------------------------------------- | --------------------------------------- |
| IR          | ✅ Add `itemSchema` to `IRMediaType`  | Schema for stream items                 |
| OAS Parser  | ✅ Parse `itemSchema` from Media Type | New field extraction                    |
| OAS Writer  | ✅ Emit `itemSchema`                  | New field emission                      |
| JSON Schema | N/A                                   | Not a JSON Schema concept               |
| Zod         | ❌ fail-fast                          | No streaming schema concept in Zod      |
| TypeScript  | ❌ fail-fast                          | No streaming schema concept in TS types |

**IR changes:** `IRMediaType.itemSchema?: CastrSchema`
**Effort:** Medium — new IR field + parser + writer + fail-fast, ~40-60 lines

### Feature 6: OAuth2 Device Authorization Flow

| Surface     | Support                                    | Rationale                                       |
| ----------- | ------------------------------------------ | ----------------------------------------------- |
| IR          | ✅ Pass through via `SecuritySchemeObject` | Already stores raw security scheme objects      |
| OAS Parser  | ✅ Already pass-through                    | Security schemes stored as raw objects          |
| OAS Writer  | ✅ Already pass-through                    | Emitted as-is                                   |
| JSON Schema | N/A                                        | Not a JSON Schema concept                       |
| Zod         | N/A                                        | Security schemes don't affect schema generation |
| TypeScript  | N/A                                        | Security schemes don't affect type generation   |

**IR changes:** None — Scalar types include `deviceAuthorization` on `OAuthFlows` natively
**Effort:** Low — verify pass-through works, add test, ~10 lines

### Feature 7: XML `nodeType`

| Surface     | Support                         | Rationale                                  |
| ----------- | ------------------------------- | ------------------------------------------ |
| IR          | ✅ Pass through via `XmlObject` | Already stores raw XML objects             |
| OAS Parser  | ✅ Already pass-through         | XML metadata stored as raw objects         |
| OAS Writer  | ✅ Already pass-through         | Emitted as-is                              |
| JSON Schema | ✅                              | XML object preserved in JSON Schema output |
| Zod         | N/A                             | XML doesn't affect Zod schema generation   |
| TypeScript  | N/A                             | XML doesn't affect type generation         |

**IR changes:** None — Scalar types include `nodeType` on `XMLObject` natively
**Effort:** Low — verify pass-through works, add test, ~10 lines

### Feature 8: Path Templating (ABNF)

| Surface      | Support      | Rationale                                                     |
| ------------ | ------------ | ------------------------------------------------------------- |
| IR           | ✅ No change | Paths stored as strings                                       |
| OAS Parser   | ✅           | Path parsing already handles templates                        |
| OAS Writer   | ✅           | Paths emitted as-is                                           |
| IR Validator | ✅           | Strict top-level `paths` template grammar now fails fast      |
| All Writers  | ✅           | Valid path strings pass through unchanged to downstream users |

**IR changes:** None
**Effort:** Low — strict load-boundary validator + proof

---

## Implementation Order

Ordered by dependency and increasing complexity:

| Phase | Features                                              | Effort | Dependencies | Status                         |
| ----- | ----------------------------------------------------- | ------ | ------------ | ------------------------------ |
| A     | Version plumbing (separate plan)                      | Small  | None         | ✅ complete                    |
| A₂    | **Type migration: drop `openapi3-ts`, adopt Scalar**  | Medium | Phase A      | ✅ complete                    |
| B     | #1 QUERY method, #3 Hierarchical tags                 | Small  | Phase A₂     | ✅ complete (Saturday, 11 Apr) |
| C     | #6 OAuth2 Device, #7 XML nodeType, #8 Path templating | Small  | Phase A₂     | ✅ complete (Saturday, 11 Apr) |
| D     | #4 Example semantics                                  | Medium | Phase A₂     | ✅ complete (Saturday, 11 Apr) |
| E     | #5 itemSchema streaming, #2 additionalOperations      | Medium | Phase A₂     | ✅ complete (Saturday, 11 Apr) |

Phases A, A₂, B, C, D, and E are complete. The MCP no-params tool-input-schema follow-up, Husky local-workflow alignment, and the generated-suite temp-directory stability fix also closed on Saturday, 11 April 2026. Repo-root `pnpm check` is green on the final Phase E close-out rerun, repo-root `pnpm check:ci` remains green from Saturday, 11 April 2026, and no successor primary active plan has been promoted yet.

### Metacognitive Record: Why Phase E Was Next

A deeper code audit already established why the earlier slices had to land first. Phase E was the right next slice because:

- Feature #1 `QUERY` is now wired honestly across the core operation pipeline: the IR/public method unions include `'query'`, parser extraction and duplicated raw PathItem visitors no longer skip it, writer ordering emits `pathItem.query` explicitly, and downstream MCP hints treat it as read-only/non-destructive without broadening idempotent semantics.
- Feature #3 hierarchical tags now have explicit proof that `parent`, `kind`, and `summary` survive parser -> IR -> writer round-trips through a native OpenAPI 3.2 fixture.
- Phase C is now landed honestly: `deviceAuthorization` and XML `nodeType` are proved end to end at the parser/writer seams, the strict top-level `paths` grammar check now rejects malformed templates before upgrade, and valid templated paths are explicitly proved through downstream endpoint/MCP consumers.
- Phase D is now landed honestly: Example Object `dataValue` / `serializedValue` survive the shared load boundary -> IR -> writer across all currently claimed carriers, the public parameter examples contract is honest, and the singular parameter helper only backfills from `default.dataValue` rather than from `serializedValue`.
- Phase E was the next smallest honest slice. `itemSchema` streaming stayed bounded to media-type seams, while `additionalOperations` followed the ADR-046 separate-storage design instead of being smuggled into any earlier closed phase.
- Repo-root `pnpm check` remained the required aggregate gate before the workstream could close. Use `pnpm check:ci` only when a non-mutating rerun is needed, and do not invoke `pnpm qg` directly.

---

## Phase E: `itemSchema` Streaming + `additionalOperations`

**Status:** COMPLETE on Saturday, 11 April 2026.

**What landed:**

- `IRMediaType.itemSchema` is now part of the IR/public contract, distinct from full-payload `schema`, and it is parsed across the current media-type seams: request bodies, responses, headers, parameter `content`, and `components.mediaTypes`
- `CastrDocument.additionalOperations` is now a required field, `CastrAdditionalOperation` is exported as the custom-method companion to `CastrOperation`, and `allOperations(document)` is available as the deterministic combined iterator
- OpenAPI parsing now extracts `PathItem.additionalOperations`, preserves custom method tokens verbatim, applies the same path-level merge rules used for fixed methods, and rejects fixed-field methods inside `additionalOperations`
- OpenAPI writing now round-trips both `itemSchema` and `additionalOperations`, keeps custom-method ordering deterministic, preserves x-ext media-type component identity through writer emission, and rejects invalid programmatic `additionalOperations` entries before they can overwrite fixed Path Item fields
- Endpoint, MCP, and TypeScript downstreams now iterate via `allOperations(document)` and expose custom verbs end to end without widening the closed standard-method union
- Endpoint, MCP, and TypeScript generation now fail fast with actionable unsupported-streaming errors when a reachable `itemSchema` would require semantics those downstreams do not yet implement
- Late reviewer follow-up fixes also closed the parameter `content` traversal blind spot, tightened the public IR media-type ref contract, and made inline request-body fallback naming custom-method-safe so distinct verbs cannot collapse into duplicate generated schema declarations

**Proof base:**

- Native fixture: `lib/tests-transforms/__fixtures__/phase-e-native-3.2.yaml`
- Targeted unit proof: parser, writer, IR model, validation, endpoint, MCP, and TypeScript suites covering `itemSchema`, `additionalOperations`, widened downstream method carriers, invalid-method rejection, and fail-fast item-schema boundaries
- Native transform proof: parser-field, writer-field, round-trip/reparse, version-validation, downstream-context, and additional-operations-validation suites
- Aggregate verification: repo-root `pnpm check` green on Saturday, 11 April 2026 after the final close-out rerun; repo-root `pnpm check:ci` remains green from Saturday, 11 April 2026

**Reviewer loop:**

- `code-reviewer` — **NO FINDINGS** after the late follow-up fix for custom-method inline request-body naming collisions and lowercase reserved-method validation during OpenAPI writing
- `test-reviewer` — **NO FINDINGS** on the landed Phase E proof surface
- `openapi-expert` — **NO FINDINGS** on the landed native 3.2 semantics and close-out claims
- `type-reviewer` — **NO FINDINGS** after the public IR media-type helper narrowing follow-up

**Next entrypoint:**

- No successor primary active plan has been promoted yet. Reproduce any fresh regression first; otherwise promote the next honest active atomic plan before implementation begins.

---

## Phase D: Example Object Semantics

**Status:** COMPLETE on Saturday, 11 April 2026.

**What landed:**

- `CastrParameter.examples` now uses `ParameterObject['examples']`, so the public IR contract preserves full Example Object/ref shapes rather than a narrowed pseudo-shape.
- Singular parameter example derivation now follows the locked precedence rule: `parameter.example` -> `parameter.examples.default.value` -> `parameter.examples.default.dataValue` -> `schema.example`. It does not derive from `serializedValue` or `externalValue` alone.
- A dedicated native OpenAPI 3.2 fixture now proves Example Object fidelity across the four currently claimed carriers: `components.examples`, parameter `examples`, response-header `examples`, and media-type `examples`.
- Native version-validation coverage now accepts both `dataValue`-only and `serializedValue`-only Example Objects at the 3.2 boundary without inventing a singular parameter example from `serializedValue` alone.

**Proof base:**

- Native fixture: `lib/tests-transforms/__fixtures__/phase-d-native-3.2-examples.yaml`
- Targeted unit proof: builder-parameter, parameter-metadata, definition-types, and IR-completeness suites
- Targeted transform proof: parser, writer, round-trip/idempotence, and version-validation suites
- Broader transform sweep: `pnpm --dir lib test:transforms` green on Saturday, 11 April 2026
- Aggregate verification: repo-root `pnpm check` green on Saturday, 11 April 2026

**Reviewer loop:**

- `code-reviewer` — **APPROVED** after the follow-up fix for invalid parameter `example` + `examples` emission and the added emitted-document revalidation proof
- `test-reviewer` — **COMPLIANT** after the added parser `value` precedence proof, parameter-carrier `serializedValue` boundary coverage, and stricter writer-field selection
- `openapi-expert` — **APPROVED** after the explicit 3.0/3.1 rejection coverage and final close-out doc-state alignment
- `type-reviewer` — **APPROVED** after the `ParameterMetadata.examples` contract and precedence docs were brought back into line with the helper output

**Historical next entrypoint at Phase D close-out:**

- At Phase D close-out on Saturday, 11 April 2026, the then-next slice was Phase E for `itemSchema` streaming and `additionalOperations`. With Phase E now also closed, no successor primary active plan has been promoted yet.

---

## Phase C: Native Pass-Through + Strict Path Templating

**Status:** COMPLETE on Saturday, 11 April 2026.

**What landed:**

- `oauth2.flows.deviceAuthorization` now has explicit parser and writer proof, including `deviceAuthorizationUrl`, `tokenUrl`, `refreshUrl`, and `scopes`.
- XML `nodeType` now has explicit parser and writer proof on both schema-level and property-level XML metadata.
- Valid templated paths such as `/devices/{device-id}/tokens/{token.id}` now survive the shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, while MCP path input keys still normalise from declared parameter names to camelCase.
- Malformed top-level `paths` templates now fail fast before upgrade/canonicalisation completes. The grammar check rejects unmatched braces, stray `}`, empty `{}`, and equivalent malformed brace structures while ignoring `paths` specification extensions.
- The shared validator now lives in a dedicated `path-template-validation/` bounded context under the OpenAPI load boundary rather than being bolted onto an already-full directory seam.

**Proof base:**

- Positive proof fixture: `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml`
- Negative rejection fixtures: `lib/tests-transforms/__fixtures__/invalid/3.2.x-malformed-path-templates/`
- Targeted transform proof: parser, writer, version-validation, and downstream endpoint/MCP suites
- Aggregate verification: repo-root `pnpm check` green on Saturday, 11 April 2026

**Reviewer loop (installed in-session fallback):**

- `code-reviewer` — **APPROVED** after the pre-close-out fixes for over-broad `paths` validation scope and partial `deviceAuthorization` nested-field proof
- `test-reviewer` — **COMPLIANT**; the added proofs stay behaviour-focused and the rejection coverage remains seam-owned
- `openapi-expert` — **APPROVED**; the touched native OpenAPI 3.2 surfaces are now claimed honestly and validated at the correct boundary

**Historical next entrypoint at Phase C close-out:**

- At Phase C close-out on Saturday, 11 April 2026, the then-next slice was Phase D for Example Object semantics (`dataValue`, `serializedValue`). With Phases D and E now also closed, no successor primary active plan has been promoted yet.

---

## Phase B: `QUERY` + Hierarchical Tags

**Status:** COMPLETE on Saturday, 11 April 2026.

**What landed:**

- `query` is now part of the public `HttpMethod` union, the IR `IRHttpMethod` union, and runtime method validation.
- OpenAPI parser extraction, duplicated raw PathItem visitors, integer-capability traversal, writer emission/order, endpoint mapping, and MCP hints all treat `query` as a first-class standard method.
- MCP currently treats `query` as read-only/non-destructive without broadening idempotent semantics beyond the existing policy.
- Hierarchical tag fields `summary`, `parent`, and `kind` now have explicit parser/writer proof rather than relying on unproven pass-through.

**Proof base:**

- Native fixture: `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml`
- Targeted parser/writer proof suites now cover both `query` and hierarchical tags.
- Repo-root `pnpm check` is green after the slice.

**Historical next entrypoint at Phase B close-out:**

- At Phase B close-out on Saturday, 11 April 2026, the then-next slice was Phase C proof work (`deviceAuthorization`, XML `nodeType`, path templating`). With Phases C, D, and E now also closed, no successor primary active plan has been promoted yet.

---

## Phase A₂: Type Migration — Drop `openapi3-ts`, Adopt `@scalar/openapi-types`

**Status:** COMPLETE on Friday, 10 April 2026. AP4 closed with a nested raw OpenAPI input seam, restored `components.pathItems` and schema-less `components.mediaTypes` fidelity through IR, a green full repo-root gate chain plus `pnpm madge:circular` / `pnpm knip` / targeted `openapi3-ts` greps, and a closed reviewer loop with no open findings. The parent workstream's MCP no-params tool-input-schema strictness follow-up also closed on Saturday, 11 April 2026. For aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating rerun is required; do not invoke `pnpm qg` directly. At the time of this close-out, the next execution entrypoint was the then-pending Phase B slice; with Phases B, C, D, and E now closed, no successor primary active plan has been promoted yet.
**ADRs:** [ADR-044](../../docs/architectural_decision_records/ADR-044-drop-openapi3-ts-adopt-scalar-types.md), [ADR-045](../../docs/architectural_decision_records/ADR-045-strict-reexport-module-openapi-types.md)  
**Detailed completion record:** [phase-a2-type-migration.md](./phase-a2-type-migration.md)

### Resolved Decisions

- **D1 (REVISED):** Explicit interfaces strip Scalar's `[key: string]: any` pollution. `RemoveIndexSignature<T>` was abandoned — it fails on `Modify<Omit<...>>` composition chains.
- **D2:** `SchemaObject` is a fully explicit ~50-property interface — object-form only, boolean handled at boundaries
- **D3:** Test fixture versions assessed per-fixture during AP3/AP4
- **A1:** `SchemaObject.examples` stays raw `unknown[]`; public metadata surfaces expose `schemaExamples` instead of inventing a fallback example
- **A2-A4:** `querystring` stays distinct, content/media-type refs plus `components.mediaTypes` are preserved losslessly, and the tolerant input boundary is split from the canonical validated document type
- **A5-A6:** writer assignability is closed, and a narrow drift harness guards the critical upstream `@scalar/openapi-types` shape signals

### Execution (Iterative Assessment Points)

1. **AP1 ✅ COMPLETE:** Re-export module with explicit interfaces compiles
2. **AP2 ✅ COMPLETE:** Production code — 0 errors (5 families resolved)
3. **Assumption-driven replacement pass ✅ COMPLETE:** distinct `querystring`, ref-capable content/mediaTypes, canonical/boundary split, and lossless schema examples are all landed in production/public surfaces
4. **AP3 ✅ COMPLETE:** test/support code migrated, checked `@ts-expect-error` directives removed, targeted regressions added, and `openapi-schema-extensions.d.ts` deleted
5. **AP4 ✅ COMPLETE:** the boundary-accurate fixture typing, IR/media-type fidelity fixes, dependency-exit cleanup, gate reruns, and reviewer loop are all closed on Friday, 10 April 2026
6. **Post-close-out follow-up ✅ COMPLETE:** MCP no-params tool-input-schema strictness closed on Saturday, 11 April 2026; parameterless tools now emit a closed empty-object schema and, at that point, Phase B became the next atomic slice. With Phases B, C, D, and E now closed, no successor primary active plan has been promoted yet.

> [!NOTE]
> Phase A₂ is closed. Its detailed completion record now lives in `current/complete` so `active/` keeps one honest execution entrypoint. Reopen this slice only if a fresh regression is reproduced.

---

## `additionalOperations` IR Model — RESOLVED (ADR-046)

**Decision: Separate storage on `CastrDocument`.**

Custom-method operations from OAS 3.2 `additionalOperations` are stored in a dedicated `additionalOperations` field on `CastrDocument`, not folded into the existing `operations` array. Rationale:

1. **Type safety** — `IRHttpMethod` stays a closed union; exhaustiveness checks, `VALID_HTTP_METHODS`, `PATH_ITEM_METHOD_SETTERS`, and sorting logic are preserved
2. **Lossless round-trip** — the writer knows exactly which operations go into `pathItem.additionalOperations` vs `pathItem[method]`
3. **Validation** — custom method names are validated separately (non-empty, no overlap with standard methods)

An `allOperations(doc)` helper will be provided for consumers that need to iterate both lists.

---

## Aggregate Support Matrix (Target State)

| Feature                           | IR  | OAS Writer | JSON Schema |     Zod      |  TypeScript  |
| --------------------------------- | :-: | :--------: | :---------: | :----------: | :----------: |
| QUERY method                      | ✅  |     ✅     |     N/A     |      ✅      |      ✅      |
| additionalOperations              | ✅  |     ✅     |     N/A     |      ✅      |      ✅      |
| Hierarchical tags                 | ✅  |     ✅     |     N/A     |     N/A      |     N/A      |
| Example dataValue/serializedValue | ✅  |     ✅     |     ✅      |     N/A      |     N/A      |
| itemSchema streaming              | ✅  |     ✅     |     N/A     | ❌ fail-fast | ❌ fail-fast |
| OAuth2 Device flow                | ✅  |     ✅     |     N/A     |     N/A      |     N/A      |
| XML nodeType                      | ✅  |     ✅     |     ✅      |     N/A      |     N/A      |
| Path templating                   | ✅  |     ✅     |     N/A     |      ✅      |      ✅      |

**Legend:** ✅ supported | ❌ genuinely impossible | N/A not applicable to format

---

## Quality Gates

Each phase must pass `pnpm check` before the next begins.
Husky is now active locally: `pre-commit` formats staged files with Prettier and `pre-push` runs `pnpm check:ci`, but hook runs do not replace an explicit slice-close aggregate rerun.
