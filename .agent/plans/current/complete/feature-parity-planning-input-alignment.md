# Plan (Complete): Feature-Parity Planning Input Alignment

**Status:** Complete — executed on 2026-04-02 after explicit user-directed strategic cleanup resumption
**Created:** 2026-04-02
**Last Updated:** 2026-04-02
**Predecessor:** [core-vs-companion-workspaces-plan-alignment.md](./core-vs-companion-workspaces-plan-alignment.md)
**Related:** [roadmap.md](../../roadmap.md), [phase-5-ecosystem-expansion.md](../../future/phase-5-ecosystem-expansion.md), [ADR-043](../../../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md), [plan-overview.md](../../../research/feature-parity/plan-overview.md), [plans-review.md](../../../research/feature-parity/plans-review.md), [enhancement-scope.md](../../../research/feature-parity/enhancement-scope.md)

---

## User Impact To Optimise For

Future planning sessions should be able to read the feature-parity research inputs without inferring that:

- tRPC is a core `@engraph/castr` format promise
- runtime handlers or typed fetch harnesses belong in core
- the roadmap still intends to promote those concerns directly into the core plan stack

## Goal

Align the remaining feature-parity planning inputs with the chosen core-vs-companion boundary so they remain useful research/planning aids without contradicting the roadmap, ADR-043, or the public product story.

## Scope

### In Scope

- `.agent/research/feature-parity/plan-overview.md`
- `.agent/research/feature-parity/plans-review.md`
- `.agent/research/feature-parity/enhancement-scope.md`
- targeted cross-links from those files to:
  - [ADR-043](../../../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)
  - [roadmap.md](../../roadmap.md)
  - [phase-5-ecosystem-expansion.md](../../future/phase-5-ecosystem-expansion.md)

### Out Of Scope

- product-code changes
- reworking the canonical roadmap itself unless a factual link target needs updating
- expanding or shrinking Oak feature requirements
- resolving whether any specific companion workspace should be built next

## Assumptions To Validate

1. The three files above remain worth preserving as planning inputs rather than collapsing into one summary.
2. Their core value is still good; the main problem is architectural placement language, not their underlying research.
3. The active OAS 3.2 plan stack remains the higher priority workstream.

## Measurable Success Criteria

1. No file in scope describes tRPC, runtime handlers, or typed fetch harnesses as core `@engraph/castr` work.
2. Each file in scope makes the companion-workspace placement explicit where those capabilities are discussed.
3. Each file in scope points readers back to the canonical roadmap / ADR truth where appropriate.
4. The files remain clearly labelled as research/planning inputs rather than being mistaken for the live roadmap.
5. `pnpm format:check` and `pnpm portability:check` pass.

## TDD / Verification Order

1. Search each file for direct tRPC -> IR roadmap language and any wording that implies runtime helpers belong in core.
2. Update `plan-overview.md` first:
   - reframe Step 3 as companion code-first/workspace enablement
   - reframe the HTTP adapter line as companion-workspace or composition guidance
3. Update `plans-review.md` second:
   - replace direct code-first promotion into the core roadmap with companion-workspace planning language
   - keep the advisory/historical framing intact
4. Update `enhancement-scope.md` third:
   - reframe tRPC and HTTP handler rows as companion-workspace scope
   - keep core/compiler requirements separate from companion-layer requirements
5. Add the missing cross-links to ADR-043, the roadmap, and Phase 5 where they help anchor the new wording.
6. Run `pnpm format:check` and `pnpm portability:check`.

## Documentation Outputs

When executed, this slice should update:

- `.agent/research/feature-parity/plan-overview.md`
- `.agent/research/feature-parity/plans-review.md`
- `.agent/research/feature-parity/enhancement-scope.md`
- `.agent/prompts/session-entry.prompt.md` where handoff wording still implied the cleanup was pending
- `.agent/research/oak-open-curriculum-sdk/oak-support-plan.md` and `.agent/research/oak-open-curriculum-sdk/castr-requests/README.md` where the same boundary / version wording leaked into adjacent planning inputs
- `.agent/memory/napkin.md` with a short note that the residual planning-input wording gap is closed

## Original Execution Trigger

This plan was intended to activate when either:

- the user explicitly asks to close the remaining strategic/planning wording gap, or
- the repo chooses to resume the paused core-vs-companion cleanup workstream after the current OAS 3.2 focus

This slice was triggered by explicit user request on Thursday, 2 April 2026.

## Completion Note

Executed updates:

- the three feature-parity planning inputs now all use companion-workspace framing consistently
- the active handoff prompt now treats OAS 3.2 version plumbing as the current active slice rather than a future successor only
- adjacent Oak negotiation / fixture docs now distinguish the 3.1 bridge artefacts from the canonical 3.2 target while keeping ADR-043 explicit

## Completion Criteria

This plan is complete when:

- the three files in scope all use companion-workspace framing consistently
- their cross-links to ADR-043 and the roadmap are in place
- no remaining mismatch survives except intentionally preserved historical recommendations outside those three files
