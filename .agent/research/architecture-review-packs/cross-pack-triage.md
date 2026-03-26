# Cross-Pack Triage: Seven-Pack Architecture Review Findings

**Date:** 2026-03-23  
**Purpose:** Cluster all findings from Packs 1–7 by root cause, dependency, and leverage to identify the highest-priority successor remediation slice.

---

## Verdict Matrix

| Pack | Focus                                          | Verdict |
| ---- | ---------------------------------------------- | ------- |
| 1    | Boundary Integrity and Public Surface          | yellow  |
| 2    | Canonical IR Truth and Runtime Validation      | red     |
| 3    | OpenAPI Architecture                           | red     |
| 4    | JSON Schema Architecture                       | red     |
| 5    | Zod Architecture                               | red     |
| 6    | Context, MCP, Rendering, and Generated Surface | red     |
| 7    | Proof System and Durable Doctrine              | red     |

---

## Root Cause Clusters

### RC-1: Proof-System Honesty (gate chain, suite taxonomy, scope claims)

The canonical gate chain (`pnpm check:ci`) can stay green while repo-owned proof suites are either red, off-chain, or prove a narrower contract than their names and docs claim. This is the single highest-leverage root cause because it makes every other pack's "green locally" statement weaker.

| #   | Finding                                                                                                 | Source Pack        | Status                       | Evidence                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `vitest.e2e` is off-chain and red in `ir-fidelity.test.ts`                                              | Pack 7.1           | ✅ (fixed in RC-1)           | [vitest.e2e.config.ts](file:///Users/jim/code/personal/castr/lib/vitest.e2e.config.ts), [ir-fidelity.test.ts](file:///Users/jim/code/personal/castr/lib/tests-e2e/ir-fidelity.test.ts)                                                                                                                                                                 |
| 2   | `openapi-fidelity.test.ts` sits inside `src/tests-e2e/` but runs inside `pnpm test` — taxonomy mismatch | Pack 7.1           | ✅ (dir removed in RC-1)     | [openapi-fidelity.test.ts](file:///Users/jim/code/personal/castr/lib/src/tests-e2e/openapi-fidelity.test.ts)                                                                                                                                                                                                                                           |
| 3   | `test:scalar-guard` is off-chain and green but undeclared in `DEFINITION_OF_DONE.md`                    | Pack 7.1           | ✅ (documented in RC-1)      | [vitest.scalar-guard.config.ts](file:///Users/jim/code/personal/castr/lib/vitest.scalar-guard.config.ts)                                                                                                                                                                                                                                               |
| 4   | Generated-code "runtime" and "lint" harnesses prove structural smoke checks, not execution              | Pack 7.2, Pack 6.4 | ✅ (JSDocs honest in RC-5)   | [runtime-validation.gen.test.ts](file:///Users/jim/code/personal/castr/lib/tests-generated/runtime-validation.gen.test.ts), [lint-validation.gen.test.ts](file:///Users/jim/code/personal/castr/lib/tests-generated/lint-validation.gen.test.ts)                                                                                                       |
| 5   | Scenario 6 and 7 document broader semantic proofs than their assertions achieve                         | Pack 7.3           | ✅ (README + JSDocs in RC-5) | [README.md](file:///Users/jim/code/personal/castr/lib/tests-transforms/README.md), [scenario-6](file:///Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts), [scenario-7](file:///Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts) |
| 6   | Scenario 2/4 over-claim semantic parity via schema-count and narrow payload checks                      | Pack 5.5           | ✅ (verified honest in RC-7) | [scenario-2](file:///Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-2-zod-roundtrip.integration.test.ts), [scenario-4](file:///Users/jim/code/personal/castr/lib/tests-transforms/__tests__/scenario-4-zod-via-openapi.integration.test.ts)                                                                                     |

**Leverage:** Fixing proof-system honesty first means every subsequent remediation can start from a gate chain that actually asserts its own claims.

---

### RC-2: Durable-Doc Over-Claims (docs, ADRs, acceptance criteria)

Multiple durable documents still describe broader support, richer metadata, or stronger parity than the code actually proves. This is self-reinforcing: cold-start sessions inherit the over-claim and try to build on it.

| #   | Finding                                                                            | Source Pack             | Status                | Evidence                                                                                                                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------- | ----------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Acceptance criteria mix target-state and current-state language                    | Pack 7.4                | ✅ (caveated in RC-2) | [json-schema-and-parity-acceptance-criteria.md](file:///Users/jim/code/personal/castr/.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md), [zod-output-acceptance-criteria.md](file:///Users/jim/code/personal/castr/.agent/acceptance-criteria/zod-output-acceptance-criteria.md) |
| 2   | `README.md` and `docs/` advertise removed surfaces                                 | Pack 1.1                | ✅ (fixed in RC-2)    | [README.md](file:///Users/jim/code/personal/castr/README.md), [API-REFERENCE.md](file:///Users/jim/code/personal/castr/docs/API-REFERENCE.md)                                                                                                                                                            |
| 3   | CLI help text still says `data-descriptions-tooling`                               | Pack 1.2                | ✅ (fixed in RC-1)    | [cli/index.ts](file:///Users/jim/code/personal/castr/lib/src/cli/index.ts), [cli.char.test.ts](file:///Users/jim/code/personal/castr/lib/src/characterisation/cli.char.test.ts)                                                                                                                          |
| 4   | ADR-035 transform-matrix language reads as discharged                              | Pack 7.3                | ✅ (caveated in RC-2) | [ADR-035](file:///Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-035-transform-validation-parity.md)                                                                                                                                                                              |
| 5   | `public-api-preservation.test.ts` covers a legacy subset                           | Pack 1.3                | ✅ (fixed in RC-6)    | [public-api-preservation.test.ts](file:///Users/jim/code/personal/castr/lib/src/public-api-preservation.test.ts)                                                                                                                                                                                         |
| 6   | ADR-031/032 and native-capability-matrix still over-claim metadata/datetime parity | Pack 5 (doctrine drift) | ✅ (caveated in RC-2) | [ADR-031](file:///Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-031-zod-output-strategy.md), [native-capability-matrix.md](file:///Users/jim/code/personal/castr/docs/architecture/native-capability-matrix.md)                                                                  |
| 7   | MCP integration guide materially overstates the public surface                     | Pack 6 (doctrine drift) | ✅ (caveated in RC-5) | [MCP_INTEGRATION_GUIDE.md](file:///Users/jim/code/personal/castr/docs/MCP_INTEGRATION_GUIDE.md)                                                                                                                                                                                                          |
| 8   | Loader/pipeline docs carry stale SwaggerParser-era language                        | Pack 3 (doctrine drift) | ✅ (reframed in RC-6) | [scalar-pipeline.md](file:///Users/jim/code/personal/castr/docs/architecture/scalar-pipeline.md)                                                                                                                                                                                                         |

**Leverage:** Correcting doc over-claims alongside proof honesty prevents cold-start sessions from immediately re-drifting.

---

### RC-3: IR and Runtime Validator Gaps (✅ Resolved — Monday, 24 March 2026)

The runtime IR boundary still admits shapes that are outside the canonical ontology (e.g., invalid `type`, schema-valued `additionalProperties`), and omits supported shapes (`trace` operations).

> [!NOTE]
> All three findings resolved in [ir-and-runtime-validator-remediation.md](../../plans/current/complete/ir-and-runtime-validator-remediation.md). `unevaluatedProperties` was kept as `boolean | CastrSchema` (deviation — see plan completion note).

| #   | Finding                                                                                                      | Source Pack | Status | Evidence                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `isCastrSchema()` does not validate core schema shape (`type`, `items`, composition)                         | Pack 2.1    | ✅     | [validators.schema.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.schema.ts)     |
| 2   | Object-ontology drift: IR model still carries schema-valued `additionalProperties` / `unevaluatedProperties` | Pack 2.2    | ✅     | [schema.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts)                               |
| 3   | `trace` missing from runtime `VALID_HTTP_METHODS`                                                            | Pack 2.3    | ✅     | [validators.document.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.document.ts) |

**Dependency:** RC-3 items are foundational — they affect trust in all downstream writer/proof paths. However, they can be addressed in parallel with RC-1 since they are disjoint file sets.

---

### RC-4: Format-Specific Ingest/Egress Drift (✅ Resolved — Monday, 24 March 2026)

Parser and writer seams in each format still disagree about what is admitted vs emitted vs proven.

> [!NOTE]
> 5 of 8 findings resolved in [format-specific-drift-remediation.md](../../plans/current/complete/format-specific-drift-remediation.md). Remaining 3 findings (RC-4.2/4.3/4.4) initially addressed with RC-7 fail-fast seam and caveats; now fully resolved by JSON Schema parser expansion on Tuesday, 25 March 2026. `parseJsonSchemaDocument()` is a full document parser with standalone round-trip proofs.

| #   | Finding                                                                                   | Source Pack | Status                | Evidence                                                                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------- | ----------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | OpenAPI: `components.requestBodies` parsed into IR but dropped on egress                  | Pack 3.1    | ✅                    | [openapi-writer.components.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/writers/openapi/components/openapi-writer.components.ts)                                                                                                           |
| 2   | JSON Schema: `parseJsonSchemaDocument()` is only a `$defs` extractor                      | Pack 4.1    | ✅ (parser expansion) | [parsers/json-schema/index.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/index.ts)                                                                                                                                      |
| 3   | JSON Schema: no explicit unsupported-surface rejection seam                               | Pack 4.2    | ✅ (parser expansion) | [json-schema-parser.core.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/json-schema-parser.core.ts)                                                                                                                      |
| 4   | JSON Schema: writer/proof layers disagree on canonical nullability and `contains` support | Pack 4.3    | ✅ (RC-7 caveat)      | [json-schema-object.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/writers/shared/json-schema-object.ts)                                                                                                                                     |
| 5   | Zod: contradictory strict-object chains (`.strict().passthrough()`) not rejected          | Pack 5.1    | ✅                    | [zod-parser.object.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts)                                                                                                                                    |
| 6   | Zod: unsupported nested members silently dropped                                          | Pack 5.2    | ✅                    | [zod-parser.object.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts), composition modules                                                                                                               |
| 7   | Zod: identifier-rooted expressions promoted to `$ref` with insufficient proof             | Pack 5.3    | ✅                    | [zod-parser.references.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/registry/zod-parser.references.ts)                                                                                                                         |
| 8   | Zod: helper format surface wider than writer/proof lockstep                               | Pack 5.4    | ✅                    | [zod-parser.zod4-formats.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/parsers/zod/types/zod-parser.zod4-formats.ts), [primitives.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/writers/zod/generators/primitives.ts) |

**Dependency:** RC-4 items depend on honest proofs (RC-1) to verify their fixes. All 8 findings fully resolved.

---

### RC-5: Downstream Surface Drift (✅ Resolved — Monday, 24 March 2026)

Template selection, MCP schema generation, and generated-code proof surfaces either over-promise or bypass governed contracts.

> [!NOTE]
> All four findings resolved in RC-5 session on Monday, 24 March 2026: `schemas-only` made genuinely schemas-only, dead `templatePath` removed, MCP Draft 07 allowlist implemented, generated-surface proof naming made honest, template-context post-IR mutation fixed.

| #   | Finding                                                        | Source Pack | Status | Evidence                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `schemas-only` template still emits endpoints and MCP metadata | Pack 6.1    | ✅     | [generate-from-context.ts](file:///Users/jim/code/personal/castr/lib/src/rendering/generate-from-context.ts)                                                                                                                               |
| 2   | `templatePath` is documented but silently ignored              | Pack 6.2    | ✅     | [helpers.ts](file:///Users/jim/code/personal/castr/lib/src/cli/helpers.ts)                                                                                                                                                                 |
| 3   | MCP tool schemas bypass governed Draft 07 contract             | Pack 6.3    | ✅     | [template-context.mcp.schemas.from-ir.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/mcp/schemas/template-context.mcp.schemas.from-ir.ts)                                                                     |
| 4   | Template-context layer reintroduces post-IR repair logic       | Pack 6.5    | ✅     | [template-context.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.ts), [inline-schemas.ts](file:///Users/jim/code/personal/castr/lib/src/schema-processing/context/schemas/inline-schemas.ts) |

**Dependency:** All remediation slices through RC-5 are now complete. Remaining unremediated findings are in RC-1/RC-2 (durable-doc over-claims) and residual Pack 1/3/4/5/7 findings.

---

## Dependency Graph

```text
RC-1 (proof-system honesty)
  │
  ╠══ RC-2 (durable-doc over-claims)   [parallel with RC-1]
  │
  ╠══ RC-3 (IR/validator gaps)          [parallel with RC-1]
  │
  ╚══ RC-4 (format-specific drift)     [after RC-1]
       │
       ╚══ RC-5 (downstream surface)   [after RC-4]
```

---

## Recommended First Slice

**Proof-System and Durable-Doctrine Remediation** (RC-1 + RC-2, with minimal RC-3 where dependencies overlap)

This slice is the highest leverage because:

1. It makes every subsequent remediation verifiable.
2. It is disjoint from format-specific product code, so it does not risk format regression.
3. It closes the most visible red signal: a repo-owned E2E proof is red while the canonical chain is green.

RC-3 (IR/validator gaps) and RC-4 (format drift) should be the second and third successor slices respectively, each with their own bounded plan.

---

## Provenance Index

Every finding above traces back to exactly one pack note:

- Pack 1: [pack-1-boundary-integrity-and-public-surface.md](file:///Users/jim/code/personal/castr/.agent/research/architecture-review-packs/pack-1-boundary-integrity-and-public-surface.md)
- Pack 2: [pack-2-canonical-ir-truth-and-runtime-validation.md](file:///Users/jim/code/personal/castr/.agent/research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md)
- Pack 3: [pack-3-openapi-architecture.md](file:///Users/jim/code/personal/castr/.agent/research/architecture-review-packs/pack-3-openapi-architecture.md)
- Pack 4: [pack-4-json-schema-architecture.md](file:///Users/jim/code/personal/castr/.agent/research/architecture-review-packs/pack-4-json-schema-architecture.md)
- Pack 5: [pack-5-zod-architecture.md](file:///Users/jim/code/personal/castr/.agent/research/architecture-review-packs/pack-5-zod-architecture.md)
- Pack 6: [pack-6-context-mcp-rendering-and-generated-surface.md](file:///Users/jim/code/personal/castr/.agent/research/architecture-review-packs/pack-6-context-mcp-rendering-and-generated-surface.md)
- Pack 7: [pack-7-proof-system-and-durable-doctrine.md](file:///Users/jim/code/personal/castr/.agent/research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md)
