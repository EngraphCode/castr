# Corrections — verified current reality vs a stale prior report

A prior "Castr / Zod Compiler Session Report" (produced on the source branch
`claude/castr-zod-compiler-review-qpre7n`, **not present in this repo**) was
well-structured and appropriately hedged, but it sampled ~10 files and missed code
that changes its conclusions. The table below is the **verified current reality**;
future agents should not repeat the prior report's framing. See
[`README.md`](./README.md) for verification status and method.

> **Why this lives here, not "corrected in place."** The prior report was never
> brought into castr, so there is no in-repo document to annotate. This file is the
> durable record of _what is actually built_ against _what the stale report
> claimed_. The architecture-review-packs provenance
> ([`../architecture-review-packs/README.md`](../architecture-review-packs/README.md))
> points here for surface-architecture currency.

## Verified corrections

| Prior report claim                                                                | Reality (verified)                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod-first `defineEndpoint({...})` DSL is "a conceptual sketch, not a decided API" | **Already implemented.** `lib/src/schema-processing/parsers/zod/endpoints/` has `parseEndpointDefinition`, `buildCastrOperationFromEndpoint`, extractors, types, unit tests; exported from `parsers/zod/index.ts`. A top-level `lib/src/endpoints/` module exists (`definition.types.ts`, `parameter-metadata.ts`). Parsed **statically** via ts-morph, no execution. |
| "Draft an ADR for the product/repo + companion boundary"                          | **Already exists:** ADR-043 (Accepted, 2026-04-02), reflected in README + roadmap Phase 5.                                                                                                                                                                                                                                                                            |
| Strictness should _become_ a constitution (Insight 4)                             | **Already is:** "Input-Output Pair Compatibility Model" in `principles.md`, `requirements.md`, `AGENT.md`, `.agent/rules/input-output-pair-compatibility.md`; plus ADR-040/041.                                                                                                                                                                                       |
| Verify whether 3.2.0 is the latest target                                         | Repo **already** canonicalises 3.0/3.1/3.2 → 3.2.0 output. Report **missed** that 3.1 is _input-only_, not a peer output.                                                                                                                                                                                                                                             |
| Split compiler into core/spec/format packages (as if blocked)                     | Initially stated this "conflicts with ADR-043/036." **Corrected:** ADR-043 governs compiler-core vs _runtime/framework companions_, **not** a compiler-internal split. The conflict was overstated. See [ADR-048](../../../docs/architectural_decision_records/ADR-048-compiler-internal-split-scope-and-value-gate.md) — it is an open value question.               |
| `castr check` is the key novel idea                                               | **True and valuable**, but the report overlooked that the _inputs already exist_: round-trip/idempotence proof rigs (ADR-027, ADR-035) and the `doctor` surface. `check` is mostly aggregation + presentation, not greenfield.                                                                                                                                        |
| Heavy `CastrCheckReport` schema proposed                                          | zod-compiler's leaner shape is a better starting point ([`comparison.md`](./comparison.md) Appendix A).                                                                                                                                                                                                                                                               |

## Accurate in the prior report (keep)

Single `lib` workspace; broad semantic IR; no built-in HTTP client; "API contract
compiler" is a sharper identity than "OpenAPI-to-Zod generator"; companion packages
should consume the same strict diagnostics; premature atomisation is a real risk.

## Minor real defect the report missed

Stale `repository`/`homepage` URLs in `lib/package.json` (point to the old
`openapi-zod-validation` repo). Tracked as an opportunistic fix in the future
surface-architecture plan's checklist; not yet applied.
