# Plan (Active): Architecture Review Packs — Post-IDENTITY Audit

**Status:** Complete — seven-pack review matrix closed; successor remediation plan (RC-1/RC-2) opened and completed on Monday, 23 March 2026
**Created:** 2026-03-21
**Predecessor:** [identity-doctrine-alignment.md](../current/complete/identity-doctrine-alignment.md)
**Paused Successor:** [json-schema-parser.md](../current/paused/json-schema-parser.md)
**Related:** [IDENTITY.md](../../IDENTITY.md), [principles.md](../../directives/principles.md), [architecture-review-packs.prompt.md](../../prompts/architecture-review-packs.prompt.md), [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md), [ADR-040](../../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md), [ADR-041](../../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)

---

This plan runs the full post-implementation architecture review sweep after the IDENTITY closure. The goal is not to keep moving; it is to verify that the repo is actually pointed in the right architectural direction before the next implementation slice reactivates.

This sweep evaluates not only strictness but completeness: a surface is not healthy if code, runtime validation, proofs, and docs only agree on part of what the repo claims.

## Why This Slice Is Next

- IDENTITY doctrine alignment is complete and the full repo-root Definition of Done chain was green on Saturday, 21 March 2026.
- That slice touched the IR, validators, parsers, writers, CLI, context generation, MCP helpers, tests, snapshots, and doctrine docs.
- The queued JSON Schema parser work should not resume on assumption. It should resume only after the architecture passes a bounded review sweep.

## Review Progress To Date

- Pack 1 completed on Saturday, 21 March 2026 with a `yellow` verdict: public-boundary discipline is reasonably strong, but CLI identity and public docs still drift from the implemented surface.
- Pack 2 completed on Saturday, 21 March 2026 with a `red` verdict: runtime IR validation and object-ontology enforcement still drift from canonical doctrine.
- Pack 3 completed on Sunday, 22 March 2026 with a `red` verdict: reusable OpenAPI `components.requestBodies` are parsed into IR, dropped on egress, and not asserted by the current output-coverage proof suite.
- Pack 4 completed on Sunday, 22 March 2026 with a `red` verdict: JSON Schema parser/writer/proof code exists, but the public document-parser contract is incomplete, unsupported surfaces are not rejected explicitly enough, and the proof matrix over-claims the supported surface.
- Pack 5 completed on Sunday, 22 March 2026 with a `red` verdict: the Zod surface remains directionally strong, but contradictory strict-object chains are still accepted, unsupported nested members can be silently dropped, parser/writer helper coverage is out of lockstep, and the proof/docs story over-claims semantic parity.
- Pack 6 completed on Sunday, 22 March 2026 with a `red` verdict: template selection and custom-template public surfaces are not honest, MCP schemas bypass the governed Draft 07 contract, and the generated-code proof suite over-claims runtime coverage.
- Pack 7 completed on Sunday, 22 March 2026 with a `red` verdict: the canonical gate chain can stay green while a dedicated IR fidelity suite is red off-chain, generated-code and transform proofs still over-claim runtime and semantic breadth, and durable doctrine needed another honesty pass.
- Final consolidation rerun on Monday, 23 March 2026 kept that verdict unchanged: `pnpm check:ci` green, `vitest.e2e` red, `test:scalar-guard` green.
- The proof-system and durable-doctrine remediation plan (RC-1/RC-2) was opened and completed on Monday, 23 March 2026. See [proof-system-and-doctrine-remediation.md](../current/complete/proof-system-and-doctrine-remediation.md) and [cross-pack-triage.md](../../research/architecture-review-packs/cross-pack-triage.md).
- The next honest slice is **RC-3 (IR and runtime validator gaps)** or **RC-4 (format-specific drift)**; the paused `json-schema-parser.md` remains remediation context.

## Next Session Entry Contract

The review sweep is finished. The next session should not rediscover what the seven packs already established.

Start from the written evidence:

- use this file as the sweep-level map of the seven-pack verdict matrix
- use the seven pack notes under `.agent/research/architecture-review-packs/` as the source findings
- treat [pack-7-proof-system-and-durable-doctrine.md](../../research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md) as the current proof/gate/doctrine handoff

1. Start from the [cross-pack triage](../../research/architecture-review-packs/cross-pack-triage.md) and the completed [proof-system-and-doctrine-remediation.md](../current/complete/proof-system-and-doctrine-remediation.md).
2. Choose the next successor slice: **RC-3 (IR and runtime validator gaps)** or **RC-4 (format-specific drift)**.
3. Open one bounded successor remediation plan from that choice.
4. Execute only that chosen slice; do not reopen general feature implementation in the same pass.

Explicit non-goals for the next session:

- do not rerun the pack-by-pack review sweep from scratch
- do not reactivate `json-schema-parser.md` unchanged
- do not resume new format or feature implementation before the successor remediation plan exists

## Scope

In scope:

- in-depth review of current architecture against code, doctrine, public surface, and proof system
- pack-by-pack verdicts with findings and required remediation slices
- correction of handoff, prompt, roadmap, and review-note drift discovered during the sweep

Out of scope:

- feature implementation
- opportunistic refactors
- reopening settled doctrine without code or proof evidence

## Locked Constraints

1. Code is source of truth. Plans and docs may be wrong.
2. Review first, implement later. Do not fix product code during the pack sweep unless the user explicitly redirects.
3. One pack at a time. Do not blur findings across packs.
4. Findings must be evidence-backed and file-referenced.
5. Architectural excellence over expediency at every turn.
6. The paused JSON Schema parser plan stays paused until the review sweep says it is fit to reactivate.
7. Strict and complete everywhere, all the time: no pack should clear a surface that is only partially implemented, partially validated, partially proven, or partially documented.

## Review Note Location

Write one note per completed pack under:

- [`.agent/research/architecture-review-packs/README.md`](../../research/architecture-review-packs/README.md)

Use the naming convention:

- `pack-1-boundary-integrity-and-public-surface.md`
- `pack-2-canonical-ir-truth-and-runtime-validation.md`
- etc.

## Pack Sequence

### Pack 1 — Boundary Integrity and Public Surface

Focus:

- barrels and export seams
- CLI/public options and public types
- dependency-cruiser boundaries and public docs

Questions:

- Are public seams minimal, honest, and physically enforced?
- Are internal modules leaking across boundaries?
- Do docs advertise surfaces or behaviours that no longer exist?

### Pack 2 — Canonical IR Truth and Runtime Validation

Focus:

- IR models
- validators and serialization
- runtime identity and component discrimination

Questions:

- Does IR encode exactly one ontology?
- Are validators strict enough at runtime boundaries?
- Are runtime-identity seams coherent and cross-realm safe?

### Pack 3 — OpenAPI Architecture

Focus:

- doctor vs parser boundary
- OpenAPI ingest and egest
- reference resolution and preserved raw structures

Questions:

- Is OpenAPI-specific tolerance isolated to the correct seam?
- Is strictness honest on ingress and egress?
- Are preserved raw structures justified and physically contained?

### Pack 4 — JSON Schema Architecture

Focus:

- normalization
- parser shape and writer lockstep
- standards coverage and rejection boundaries
- paused successor plan fitness

Questions:

- Is the paused JSON Schema parser plan still architecturally sound?
- What must change before reactivation?
- Which standards boundaries are locked, and which remain assumptions?

### Pack 5 — Zod Architecture

Focus:

- parser/writer lockstep
- strict object semantics
- recursion and metadata handling
- supported-subset contract

Questions:

- Does Zod remain the canonical strict-only programming surface the repo now claims?
- Are parser and writer obligations symmetrical and provable?

### Pack 6 — Context, MCP, Rendering, and Generated Surface

Focus:

- template context
- MCP schema generation
- rendering pipelines and generated-code obligations

Questions:

- Do downstream surfaces derive cleanly from IR?
- Do they reintroduce hidden semantics, repair logic, or public-surface drift?

### Pack 7 — Proof System and Durable Doctrine

Focus:

- unit, characterisation, snapshot, and transform suites
- gate chain and regression posture
- ADRs, architecture docs, prompts, plans, and acceptance criteria

Questions:

- Do the tests prove the architecture we claim?
- Do durable docs match code and gate reality?
- What truths are still stranded in plans or memory?

## Per-Pack Output Contract

Every pack note must contain:

1. `Verdict` — `green`, `yellow`, or `red`
2. `Invariants checked`
3. `Severity-ordered findings` with standalone file references
4. `Doctrine or doc drift`
5. `Required follow-on slices`
6. `Unblock decision`

Interpret verdicts as:

- `green`: no blocking architectural findings
- `yellow`: non-blocking findings exist but the next implementation slice may proceed if they are explicitly tracked
- `red`: next implementation stays blocked

## Execution Method

- Use [architecture-review-packs.prompt.md](../../prompts/architecture-review-packs.prompt.md) for historical review-sweep reconstruction or audit sessions.
- Apply the in-session reviewer-template method where useful:
  - `code-reviewer.md`
  - `type-reviewer.md`
  - `test-reviewer.md`
  - `openapi-expert.md`
  - `json-schema-expert.md`
  - `zod-expert.md`
- Keep the pack notes focused on findings and decisions, not rewrite history.

## Success Metrics

1. Every pack has a written verdict and evidence-backed findings list.
2. The active roadmap and session prompt reflect the verdict matrix truthfully.
3. The paused JSON Schema parser plan is either revalidated or explicitly rewritten before reactivation.
4. The next implementation slice is chosen from findings rather than assumption.
5. No architectural truth remains stranded only in the napkin.
6. No pack goes green while a claimed supported surface remains only partially aligned across code, proofs, and docs.

## Completion Rule

This plan completed on 2026-03-22 when Pack 7 closed and the full pack matrix was written down.

Current close-out state:

- the repo is not cleared to reactivate general implementation
- the highest-priority next slice is proof-system and durable-doctrine remediation
- triage should now happen across all seven packs together, but execution should stay bounded to one successor remediation slice at a time
- keep this file in place as the sweep record until the successor remediation plan is opened
