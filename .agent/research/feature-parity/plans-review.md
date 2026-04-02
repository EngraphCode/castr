# Existing Plans Review (Deep)

This review audits the live and non-archive planning surface against the current repo vision: core `@engraph/castr` stays the schema/compiler/IR product, while transport, runtime, framework, and code-first publishing concerns move into companion workspaces. Use `.agent/plans/roadmap.md`, `.agent/plans/future/phase-5-ecosystem-expansion.md`, and `docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md` as the canonical references.

> [!IMPORTANT]
> Canonical execution is tracked in `.agent/plans/roadmap.md` plus atomic steps under `.agent/plans/active/` and `.agent/plans/current/`.
> Archive plans are still useful as historical inputs, but they are not the live roadmap and must not override ADR-043 or the current active plan stack.

## 1) Live Plan Stack Summary

### `roadmap.md`

- **Primary focus:** OAS 3.2 version plumbing in core, with companion OAS 3.2 feature expansion queued behind it.
- **Architectural posture:** `lib` stays the compiler boundary; code-first, transport, runtime, and framework work is explicitly parked in companion workspaces.
- **Relevance:** this is now the canonical place to read current truth about what is core versus companion.

### `oas-3.2-version-plumbing.md`

- **Primary focus:** make OAS 3.2.0 the canonical target version in output, error messages, docs, and validation criteria.
- **Relevance:** Oak now has a near-term 3.2 need, so this is not housekeeping; it is the next core compiler slice.

### `oas-3.2-full-feature-support.md`

- **Primary focus:** follow-on core support for OAS 3.2 features once version plumbing lands.
- **Relevance:** still a core OpenAPI surface expansion, not a runtime/framework plan. It is now correctly parked in `future/` as a planned successor rather than in `active/`.

### `phase-5-ecosystem-expansion.md`

- **Primary focus:** future companion-workspace expansion once the core compiler stack is settled.
- **Relevance:** this is where tRPC ingestion, typed fetch/runtime helpers, and reference implementations now belong.

### Oak future use-case plans

- **`oak-adapter-boundary-replacement.md`:** explicit high-level home for Use Case 1, the first Oak adoption wedge.
- **`oak-wider-openapi-stack-replacement.md`:** explicit high-level home for Use Case 2, including the `openapi-fetch` decision gate.
- **`oak-code-first-openapi-generation-replacement.md`:** explicit high-level home for Use Case 3, kept separate from the adapter replacement arc.

### `json-schema-parser.md` (historical complete record)

- **Primary focus:** historical parser-remediation context only.
- **Relevance:** useful background, but explicitly not the next execution entrypoint and no longer misclassified as a resumable paused workstream.

## 2) Strong Alignment Already In Place

- **Strict-by-default, fail-fast, deterministic output** are already core doctrine, not Oak-specific add-ons.
- **IR-first architecture** is already locked in across the live plan stack and ADR layer.
- **Companion-workspace boundary** is already established in the roadmap, Phase 5 plan, VISION, session-entry prompt, and ADR-043.
- **Oak proving ladder** now has explicit future plan homes rather than living only as research intent.
- **Archive plans about artefact expansion** remain useful references, but their ideas now need to be routed through the core-vs-companion boundary rather than copied back into the live roadmap verbatim.

## 3) Remaining Gaps By Architectural Layer

### Core compiler / `lib`

- **OAS 3.2 version plumbing** remains the immediate active slice.
- **Path format configuration** is still needed for Oak-facing endpoint surfaces.
- **`operationId` visibility and helper maps** still need a canonical core answer.
- **Missing-schema fallbacks** should be eliminated wherever Oak-facing outputs still tolerate them.
- **JSON Schema emission for response / parameter maps** still needs a durable output shape.
- **Deterministic ordering and schema naming hooks** need to be explicit anywhere downstream tooling depends on stable registries.
- **Bundle manifest scope** remains explicitly TBD and should not be promoted into a core promise without proven need.

### Companion workspaces / ecosystem layer

- **Authored-operation ingestion** such as tRPC belongs here, not as a new core format promise.
- **Runtime route exposure / thin HTTP adapters** belong here or stay external; they should not be smuggled back into core.
- **Zod metadata ingestion for code-first publishing flows** belongs here when it exists to publish operations or docs, not just parse schemas.
- **`openapi-fetch` replacement or interop** is a companion/external decision, not a core compiler requirement.

## 4) Risks To Keep Out Of The Roadmap

1. **Do not add a direct tRPC -> IR execution slice to the core roadmap.**
   That belongs under the companion-workspace / Phase 5 lane unless the repo deliberately creates a companion active plan for it.

2. **Do not invent an Oak-specific strictness profile.**
   Oak benefits from repo-wide doctrine that is already universal in core: strictness, determinism, fail-fast, and IR honesty.

3. **Do not let archive plans masquerade as the live plan stack.**
   Historical plans such as `future-artefact-expansion.md` are useful source material, but the live product boundary is now set by the roadmap, Phase 5, and ADR-043.

## 5) Concrete Recommendations To Keep The Stack Honest

- Keep the live roadmap centred on **OAS 3.2 version plumbing first**, then core compiler follow-on gaps such as metadata surfaces, JSON Schema outputs, and deterministic registry behaviour.
- Route **code-first ingestion, runtime adapters, and transport helpers** through `phase-5-ecosystem-expansion.md` or a later companion active plan, not the core roadmap.
- Use the explicit Oak future-plan trio as the planning home for Use Cases 1, 2, and 3 instead of reopening the same boundary discussion in ad hoc notes.
- Keep Oak requirement discussions explicit about **core versus companion** placement whenever they mention `openapi-fetch`, runtime exposure, or tRPC.
- Treat archive plans as **reference inputs only**; extract reusable ideas, but do not copy their old phase structure back into current execution docs.

## 6) Key Takeaway

The live plan stack is already aligned on the new vision. The remaining work is not "add tRPC to the roadmap"; it is to finish the current core compiler slices honestly and then pursue code-first, runtime, and transport capabilities through explicitly labelled companion-workspace tracks, with the three Oak use cases now given explicit future plan homes.
