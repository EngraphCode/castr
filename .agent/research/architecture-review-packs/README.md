# Architecture Review Pack Notes

This directory holds the per-pack review notes for the post-IDENTITY architecture sweep.

Use one file per completed pack.

Current status: the seven-pack sweep closed on 2026-03-22.
Use these notes as the historical review record, then carry any still-live truth into prompts, roadmap, doctrine docs, and the successor remediation plan.

## Naming Convention

- `pack-1-boundary-integrity-and-public-surface.md`
- `pack-2-canonical-ir-truth-and-runtime-validation.md`
- `pack-3-openapi-architecture.md`
- `pack-4-json-schema-architecture.md`
- `pack-5-zod-architecture.md`
- `pack-6-context-mcp-rendering-and-generated-surface.md`
- `pack-7-proof-system-and-durable-doctrine.md`

## Required Contents

Every note should include:

1. verdict
2. invariants checked
3. severity-ordered findings with file references
4. doctrine or doc drift
5. required follow-on slices
6. unblock decision

These notes are review artefacts, not permanent architecture docs. Durable truths that still matter after closure should also exist in ADRs, architecture docs, prompts, the roadmap, or the successor remediation plan.

## Later surface-architecture currency (2026-06-19)

A firsthand code-level comparison with `gajus/zod-compiler` re-verified several public-surface and architecture claims and corrected a stale prior session report. Its verified corrections (what is actually built — the multi-verb model, the already-implemented Zod-first endpoint DSL, the 3.2.0-output / 3.1-input-only reality) supersede the relevant surface-architecture findings in `pack-1-boundary-integrity-and-public-surface.md` and `pack-5-zod-architecture.md`. See [`../zod-compiler/corrections.md`](../zod-compiler/corrections.md) (provenance + verification status in [`../zod-compiler/README.md`](../zod-compiler/README.md)); the forward plan is [`../../plans/future/castr-surface-architecture-and-verb-model.md`](../../plans/future/castr-surface-architecture-and-verb-model.md) and the atomisation decision is ADR-048 (Proposed).
