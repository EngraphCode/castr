# Session Continuation: @engraph/castr

**Last updated:** 2026-04-16

Context bridge between sessions. Start here after reading [AGENT.md](../directives/AGENT.md).

---

## Where We Are

**Library:** Schema compiler. `Any Input -> Parser -> IR -> Writers -> Any Output`. Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tools.

**Active workstream:** [Explicit Additional Properties Support](../plans/active/explicit-additional-properties-support.md)

**Current closure record:** [ePerusteet Real-Spec Validation](../plans/current/complete/eperusteet-real-spec-validation.md)

**Companion closure record:** [OAS 3.2 Full Feature Support](../plans/current/complete/oas-3.2-full-feature-support.md) (completed Saturday, 11 April 2026)

The OAS 3.2 parent arc is now complete. Phase A2 closed on Friday, 10 April 2026. The MCP no-params follow-up, Phases B, C, D, and E, Husky local-workflow alignment, and generated-suite stability all closed on Saturday, 11 April 2026. Repo-root `pnpm check` is green, `pnpm check:ci` remains green from Saturday, 11 April 2026, and the ePerusteet real-spec validation slice closed on Thursday, 16 April 2026 as the direct predecessor to the newly promoted explicit-additional-properties support plan.

### Verified Session Truth

- Phase A2 closed on Friday, 10 April 2026 after the AP4 dependency-exit sweep completed with a nested raw OpenAPI input seam, restored IR/media-type fidelity, strengthened dependency-exit guards, and closed the reviewer loop with no open findings
- the full repo-root gate chain was green on Friday, 10 April 2026, along with `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps
- the MCP no-params follow-up closed on Saturday, 11 April 2026: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected by `isMcpToolInput()`, and the affected snapshot proofs are green
- Phase B closed on Saturday, 11 April 2026: native OpenAPI 3.2 `query` survives parser -> IR -> writer and downstream endpoint/MCP consumers, duplicated raw PathItem visitors no longer skip it, MCP treats `query` as read-only/non-destructive, and hierarchical tags (`summary`, `parent`, `kind`) have explicit parser/writer proof
- Phase C closed on Saturday, 11 April 2026: `oauth2.flows.deviceAuthorization` and XML `nodeType` now have explicit parser/writer proof, malformed top-level `paths` templates fail fast before upgrade/canonicalisation, valid templated paths survive the shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, and the reviewer loop closed with no open findings
- Phase D closed on Saturday, 11 April 2026: Example Object `dataValue` / `serializedValue` now have explicit parser/writer/round-trip proof across component, parameter, response-header, and media-type carriers, `CastrParameter.examples` preserves full Example Object/ref shapes honestly, singular parameter example derivation falls back to `examples.default.dataValue` but never `serializedValue` alone, and repo-root `pnpm check` was green on the close-out sweep
- Husky is now active locally: `pre-commit` formats staged files with Prettier, `pre-push` runs `pnpm check:ci`, and the first post-install full repo-root `pnpm check:ci` sweep was green on Saturday, 11 April 2026
- the generated-suite temp-directory race was reproduced and closed on Saturday, 11 April 2026: the temp harness now allocates isolated per-suite directories under `lib/tests-generated/.tmp`, `test:gen` is green again, and repo-root `pnpm check` is green again
- Phase E closed on Saturday, 11 April 2026: native OpenAPI 3.2 `itemSchema` and `additionalOperations` now survive parser -> IR -> OpenAPI writer -> shared load boundary reparse; `IRMediaType.itemSchema`, `CastrDocument.additionalOperations`, `CastrAdditionalOperation`, and `allOperations(document)` are landed; endpoint/MCP/TypeScript surfaces now expose custom verbs from `additionalOperations`; endpoint/MCP/TypeScript fail fast on reachable `itemSchema`; and the late reviewer follow-up fixes also closed x-ext media-type component identity/writer emission, parameter `content` traversal, IR media-type ref narrowing, custom-method inline request-body naming collisions, and lowercase reserved-method validation for programmatic `additionalOperations`
- repo-root `pnpm check` is green on Saturday, 11 April 2026 after the final Phase E close-out rerun, and `pnpm check:ci` remains green from Saturday, 11 April 2026
- for aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating run is required; do not invoke `pnpm qg` directly
- the reviewer loop is closed with no open findings across `code-reviewer`, `test-reviewer`, `openapi-expert`, and `type-reviewer`
- the ePerusteet real-spec validation slice closed on Thursday, 16 April 2026: `lib/tests-fixtures/openapi-samples/real-world/eperusteet-ext.json` is committed, the shared load boundary accepts and canonicalises it, and the reproduction exposed that current strict-object policy rejects explicit schema-valued `additionalProperties` at IR-build / generated seams
- on Thursday, 16 April 2026, user clarification established the intended product boundary: Castr must accept and emit explicit `additionalProperties`, but must never invent them from input that did not declare them
- the current primary active plan is [explicit-additional-properties-support.md](../plans/active/explicit-additional-properties-support.md)

---

## What Next

1. Re-read [metacognition.md](../directives/metacognition.md), then [explicit-additional-properties-support.md](../plans/active/explicit-additional-properties-support.md).
2. If a user reports a fresh gate or runtime regression, reproduce it immediately and treat that report as active session truth.
3. Do not reopen AP4, Phase B, Phase C, Phase D, or Phase E unless a fresh regression is actually reproduced.
4. Execute the explicit-additional-properties support slice: admit explicit source `additionalProperties` honestly into IR and outputs, while preserving the invariant that Castr never invents them from absent input.
5. Use [eperusteet-real-spec-validation.md](../plans/current/complete/eperusteet-real-spec-validation.md), [oas-3.2-full-feature-support.md](../plans/current/complete/oas-3.2-full-feature-support.md), and [phase-a2-type-migration.md](../plans/current/complete/phase-a2-type-migration.md) only for predecessor context.

---

## Gate Status

Repo-root `pnpm check` is green on **Saturday, 11 April 2026** after the final Phase E close-out rerun, and repo-root `pnpm check:ci` remains green from **Saturday, 11 April 2026**. Use `pnpm check` locally as the canonical aggregate gate, or `pnpm check:ci` for a non-mutating rerun; do not invoke `pnpm qg` directly. Husky still formats staged files on `pre-commit` and runs `pnpm check:ci` on `pre-push`, but hook runs do not replace explicit aggregate reruns when closing work.

---

## Next Session Start Statement

Read `.agent/directives/AGENT.md`, then `.agent/directives/metacognition.md`, then this prompt, then `.agent/plans/active/explicit-additional-properties-support.md`. Treat Friday, 10 April 2026 as the Phase A2 close-out date: the full repo-root gate chain, `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps are green, and the AP4 reviewer loop is closed with no open findings. Treat Saturday, 11 April 2026 as the MCP no-params follow-up close-out date, the Phase B close-out date, the Phase C close-out date, the Phase D close-out date, the Husky-install local-workflow alignment date, the generated-suite gate-stability close-out date, and the Phase E close-out date: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, native OpenAPI 3.2 `query` survives parser -> IR -> writer and downstream endpoint/MCP consumers, Example Object `dataValue` / `serializedValue` survive parser -> IR -> writer across the currently claimed carriers, `oauth2.flows.deviceAuthorization` and XML `nodeType` now have explicit parser/writer proof, malformed top-level `paths` templates are rejected before upgrade/canonicalisation, native OpenAPI 3.2 `itemSchema` and `additionalOperations` now survive parser -> IR -> OpenAPI writer -> shared load boundary reparse, custom verbs from `additionalOperations` flow through downstream endpoint/MCP/TypeScript surfaces, endpoint/MCP/TypeScript fail fast on reachable `itemSchema`, and repo-root `pnpm check` is green while `pnpm check:ci` remains green from Saturday, 11 April 2026. Treat Thursday, 16 April 2026 as the ePerusteet reproduction and clarification date: the shared load boundary accepts `lib/tests-fixtures/openapi-samples/real-world/eperusteet-ext.json`, the reproduced rejection at IR-build / generated seams exposed a policy mismatch, and user clarification established that Castr must accept and emit explicit `additionalProperties` while never inventing them from absent input. The current primary active plan is the explicit-additional-properties support slice. Do not reopen AP4, Phase B, Phase C, Phase D, or Phase E unless a fresh regression is reproduced. If a user reports a fresh issue reproduce it first; otherwise execute that slice honestly.
