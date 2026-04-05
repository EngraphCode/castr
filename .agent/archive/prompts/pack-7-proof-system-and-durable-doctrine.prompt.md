# Prompt: Pack 7 — Proof System and Durable Doctrine

> [!IMPORTANT]
> Historical review prompt.
> Pack 7 completed on Sunday, 22 March 2026 with a `red` verdict.
> Keep this file as provenance for how the final review pack was run; use [session-entry.prompt.md](./session-entry.prompt.md) and [pack-7-proof-system-and-durable-doctrine.md](../research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md) for current-state handoff.

Use this prompt only if you need to reconstruct or audit the original Pack 7 review workflow.

## Start Position

Pre-close Pack 7 start position, as of Sunday, 22 March 2026:

- Pack 1 completed on Saturday, 21 March 2026 with a `yellow` verdict.
- Pack 2 completed on Saturday, 21 March 2026 with a `red` verdict.
- Pack 3 completed on Sunday, 22 March 2026 with a `red` verdict.
- Pack 4 completed on Sunday, 22 March 2026 with a `red` verdict.
- Pack 5 completed on Sunday, 22 March 2026 with a `red` verdict.
- Pack 6 completed on Sunday, 22 March 2026 with a `red` verdict.
- Pack 7 is the next review pack in this historical snapshot.
- New implementation remains blocked pending the review matrix.
- The historical [json-schema-parser.md](../plans/current/complete/json-schema-parser.md) file remains remediation context rather than a ready-to-run implementation plan.

## First Rule

Treat [IDENTITY.md](../IDENTITY.md), the quality gates, and the code on disk as the only authoritative truth. Plans, prompts, ADR summaries, architecture docs, acceptance criteria, and README claims are working hypotheses until verified against the repo's actual tests, scripts, and implementation.

## Mission

Review Pack 7 only: proof system and durable doctrine.

Determine whether the repo's unit, characterisation, snapshot, generated-code, transform, and gate-chain proofs actually verify the architecture the repo claims today; whether durable doctrine docs and user-facing guides match current implementation and review truth; and whether any important architectural truth is still stranded only in plans, prompts, or napkin notes.

This is a review-and-consolidation session, not a product implementation session. Do not edit product behaviour unless the user explicitly redirects the session into implementation.

## Read In This Order

1. [IDENTITY.md](../IDENTITY.md)
2. [session-entry.prompt.md](./session-entry.prompt.md)
3. [architecture-review-packs.md](../plans/current/complete/architecture-review-packs.md)
4. [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md)
5. [roadmap.md](../plans/roadmap.md)
6. [pack-1-boundary-integrity-and-public-surface.md](../research/architecture-review-packs/pack-1-boundary-integrity-and-public-surface.md)
7. [pack-2-canonical-ir-truth-and-runtime-validation.md](../research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md)
8. [pack-3-openapi-architecture.md](../research/architecture-review-packs/pack-3-openapi-architecture.md)
9. [pack-4-json-schema-architecture.md](../research/architecture-review-packs/pack-4-json-schema-architecture.md)
10. [pack-5-zod-architecture.md](../research/architecture-review-packs/pack-5-zod-architecture.md)
11. [pack-6-context-mcp-rendering-and-generated-surface.md](../research/architecture-review-packs/pack-6-context-mcp-rendering-and-generated-surface.md)
12. [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
13. [testing-strategy.md](../directives/testing-strategy.md)
14. [requirements.md](../directives/requirements.md)
15. [principles.md](../directives/principles.md)
16. Acceptance-criteria and durable user-doc surfaces:
    - [openapi-acceptance-criteria.md](../acceptance-criteria/openapi-acceptance-criteria.md)
    - [json-schema-and-parity-acceptance-criteria.md](../acceptance-criteria/json-schema-and-parity-acceptance-criteria.md)
    - [zod-output-acceptance-criteria.md](../acceptance-criteria/zod-output-acceptance-criteria.md)
    - [zod-parser-acceptance-criteria.md](../acceptance-criteria/zod-parser-acceptance-criteria.md)
    - [README.md](../../README.md)
    - [USAGE.md](../../docs/USAGE.md)
    - [API-REFERENCE.md](../../docs/API-REFERENCE.md)
    - [MCP_INTEGRATION_GUIDE.md](../../docs/MCP_INTEGRATION_GUIDE.md)
17. Relevant durable architecture doctrine:
    - [native-capability-matrix.md](../../docs/architecture/native-capability-matrix.md)
    - [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)
    - [ADR-040](../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)
    - [ADR-041](../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)
18. [napkin.md](../memory/napkin.md)

## Pack 7 Scope

Focus on:

- unit, characterisation, snapshot, generated-code, and transform suites
- quality-gate chain and regression posture
- ADRs, architecture docs, prompts, plans, acceptance criteria, and user-facing docs

## Questions This Session Must Answer

- Do the tests and gates prove the architecture the repo claims today, or only narrower structural subsets?
- Which support claims are still over-stated in durable docs even after Packs 1-6?
- Are generated-code, transform, and characterisation suites named and described honestly?
- Are acceptance criteria and ADR claims still aligned with Pack 1-6 review truth?
- What architectural truths are still stranded in plans or napkin notes instead of durable docs?
- What is the next honest implementation slice once the review sweep closes?

## Code, Proof, And Doc Areas To Inspect First

- `lib/package.json`
- `package.json`
- `lib/vitest*.config.ts`
- `lib/src/characterisation/`
- `lib/tests-transforms/__tests__/`
- `lib/tests-generated/`
- `lib/src/tests-e2e/`
- `scripts/validate-portability.mjs`
- `README.md`
- `docs/`
- `.agent/acceptance-criteria/`
- `.agent/prompts/`
- `.agent/plans/`

## Reviewer Lenses

Use the right reviewers where helpful:

- `code-reviewer`
- `type-reviewer`
- `test-reviewer`

Bring in `openapi-expert`, `json-schema-expert`, or `zod-expert` only if a proof or doc claim depends on pack-specific format doctrine.

## Output Contract

Before closing the session:

1. Write one evidence-backed note at [pack-7-proof-system-and-durable-doctrine.md](../research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md).
2. Use the required note structure from [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md).
3. Update [session-entry.prompt.md](./session-entry.prompt.md), [roadmap.md](../plans/roadmap.md), [architecture-review-packs.md](../plans/current/complete/architecture-review-packs.md), and [napkin.md](../memory/napkin.md) immediately if Pack 7 changes review truth.
4. Update durable user docs, acceptance criteria, or local doctrine docs in the same pass if Pack 7 finds that they still over-claim the proof system or supported surface.
5. Name the next implementation slice from the evidence, not from historical momentum.

## Guardrails

- If the user reports a fresh gate or runtime issue, reproduce it before continuing the pack review.
- Review one pack only. Do not blend Pack 7 findings into speculative implementation.
- Findings come before summaries.
- Strict and complete everywhere, all the time is the bar.
- Partial proof, partial gate coverage, or partially updated doctrine is a finding, not success.
- Do not fix product behaviour mid-sweep unless the user explicitly redirects.
- If a green suite and a red review note disagree, say so plainly and file-reference both.
- Historical ADRs may remain historically accurate while still needing current-state caveats elsewhere; distinguish history from live contract.

## Verification

For review-only prompt, note, roadmap, handoff, or doc changes:

- `pnpm format:check`
- `pnpm portability:check`
