# Metaplan: Discovery and Prioritisation Session

**Status:** ✅ Executed — first slice (`patternProperties`/`propertyNames`) selected, planned, implemented, and verified (2026-03-26)
**Created:** 2026-03-26
**Predecessor:** JSON Schema parser expansion (completed 2026-03-25)
**Successor:** [pattern-properties-and-property-names.md](./pattern-properties-and-property-names.md) (✅ complete), [prefixitems-tuple-and-contains.md](./prefixitems-tuple-and-contains.md) (✅ complete), boolean schema support (✅ complete, 2026-03-27)

---

## Context

The architecture review remediation arc (RC-1 through RC-7) is complete. The JSON Schema parser expansion is done with proofs. All quality gates are green. There is no active remediation or feature plan.

This is the first session in the project's history where there is **zero outstanding debt** and the next work is genuinely new capability.

## Session Goal

Produce a **prioritised short-list** of the next 1–3 implementation slices, with a decision-complete plan for the first one.

## Discovery Steps

### 1. Survey the Open Capability Landscape

Audit the following for candidate work:

| Source                                                                                                     | What to look for                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Remaining Planned Capabilities (session-entry)                                                             | `if`/`then`/`else`, `$dynamicRef`, `patternProperties`, `propertyNames`, `contains`, egress normal form, external `$ref`, boolean schemas |
| Paused plan (json-schema-parser.md)                                                                        | Open findings not yet addressed                                                                                                           |
| Pack 4 research (pack-4-json-schema-architecture.md)                                                       | "Silently Ignored Or Unclear" section                                                                                                     |
| Acceptance criteria (`json-schema-and-parity-acceptance-criteria.md`, `zod-output-acceptance-criteria.md`) | Unchecked boxes                                                                                                                           |
| User requests / external feedback                                                                          | Anything the user brings to the session                                                                                                   |
| Roadmap Phase 4+ / future plans                                                                            | Any deferred capability from the original Phase 4 plan                                                                                    |

### 2. Evaluate Each Candidate

For each candidate, answer:

1. **User impact** — does this unlock new real-world use cases?
2. **Proof gap** — does not having this create an honesty gap in the supported surface?
3. **Dependency** — does this unblock other candidates?
4. **Complexity** — is this a session-sized slice or a multi-session arc?

### 3. Prioritise and Select

Rank candidates by `(user impact × proof gap) / complexity`. Select the top 1–3 candidates.

### 4. Plan the First Slice

Use `jc-plan` to create a decision-complete plan for the highest-priority candidate. The plan must include:

- Explicit scope and out-of-scope
- TDD order
- Verification plan
- Success criteria

## Constraints

- Do not start implementation in this session unless the plan is trivially small
- The plan must be strict and complete — no stretch goals, no deferred proofs
- All quality gates must remain green

## Entry Point

Start by reading:

- [session-entry.prompt.md](../prompts/session-entry.prompt.md)
- [roadmap.md](./roadmap.md)
- [cross-pack-triage.md](../research/architecture-review-packs/cross-pack-triage.md)
- [json-schema-parser.md (paused plan)](./current/paused/json-schema-parser.md)
- [json-schema-and-parity-acceptance-criteria.md](../acceptance-criteria/json-schema-and-parity-acceptance-criteria.md)
