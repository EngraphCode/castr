# Prompt: Architecture Review Packs — Post-IDENTITY Sweep

> [!IMPORTANT]
> Historical review prompt.
> The seven-pack post-IDENTITY sweep closed on Sunday, 22 March 2026.
> Keep this file as provenance for how the sweep was run; use [session-entry.prompt.md](./session-entry.prompt.md) and [architecture-review-packs.md](../plans/active/architecture-review-packs.md) for current-state handoff.

Use this prompt only if you need to reconstruct or audit the original review-sweep workflow.

## Mission

Run the architecture review packs in a disciplined, findings-first way before any new implementation slice resumes.

The purpose is to validate the repo's actual architectural direction against the code as it exists on disk now. Do not assume the active plan, the roadmap, or older docs are correct.

## Non-Negotiables

1. Code is source of truth.
2. Review first, implement later.
3. One pack at a time.
4. Findings come before summaries.
5. Architectural excellence over expediency.
6. Strictness and completeness doctrine remain the governing identity unless code evidence disproves it.
7. A surface is not green if it is only partially implemented, partially validated, partially proven, or partially documented.

## Read First

1. [IDENTITY.md](../IDENTITY.md)
2. [architecture-review-packs.md](../plans/active/architecture-review-packs.md)
3. [session-entry.prompt.md](./session-entry.prompt.md)
4. [roadmap.md](../plans/roadmap.md)
5. [json-schema-parser.md](../plans/current/paused/json-schema-parser.md)
6. [napkin.md](../memory/napkin.md)
7. Relevant ADRs for the current pack

## Pack Workflow

For each pack:

1. Re-state the pack scope and invariants in your own words.
2. Gather the actual file set from code, tests, docs, and public surfaces.
3. Review with the right lenses:
   - `code-reviewer` for correctness and architecture
   - `type-reviewer` for type-flow and runtime-boundary honesty
   - `test-reviewer` for proof quality and missing coverage
   - `openapi-expert`, `json-schema-expert`, or `zod-expert` when format doctrine matters
4. Record findings in a dedicated note under `.agent/research/architecture-review-packs/`.
5. Decide the pack verdict: `green`, `yellow`, or `red`.
6. State whether the next implementation slice is unblocked, conditionally unblocked, or still blocked.

## Required Pack Note Template

Use this exact structure:

```md
# Pack N — <Title>

**Date:** YYYY-MM-DD
**Verdict:** green | yellow | red

## Invariants Checked

- ...

## Findings

1. Severity: high | medium | low
   File: [path](/absolute/path)
   Issue: ...
   Why it matters: ...

## Doctrine Or Doc Drift

- ...

## Required Follow-On Slices

- ...

## Unblock Decision

- ...
```

## Review Discipline

- Do not collapse into one giant "architecture review". The pack boundaries matter.
- Do not hide uncertainty. If a doctrine source and the code disagree, say so explicitly.
- Do not fix product code mid-review unless the user redirects the session into an implementation slice.
- Do not treat partial support as acceptable steady state. If the repo claims a surface, the review must check the whole surface end to end.
- If a pack makes the active roadmap or prompt dishonest, update those handoff artefacts before closing the pack.

## Completion Condition

The sweep is complete only when all packs have written verdicts and the repo has an honest next active slice based on those verdicts.
