# Plan: Core Agent System and Codex Agent Adapters

**Status:** Complete
**Created:** 2026-03-09
**Last Updated:** 2026-03-09
**Related:** `.agent/practice-core/practice.md`, `.agent/practice-core/practice-bootstrap.md`, `.agent/practice-context/outgoing/platform-adapter-reference.md`, `.agent/practice-context/outgoing/reviewer-system-guide.md`, `.agent/practice-context/outgoing/starter-templates.md`, `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`, `.agent/plans/current/complete/strict-object-semantics-enforcement.md`

---

## Summary

Implement Castr's core three-layer agent system and first-class Codex agent adapters before resuming the Zod round-trip workstream.

This slice installs the missing canonical agent layer in `.agent/`, wires the first Codex project-agent adapters in `.codex/`, and gives the Practice a durable reviewer and domain-expert architecture that later Gemini / Antigravity support can build on.

This slice deliberately does **not** move the current Zod plans out of `active/`. They stay where they are by explicit user instruction, but they are **not** the operational entrypoint while this plan is primary.

---

## Completion Notes

Completed on 2026-03-09.

Key outcomes:

- installed the canonical agent layer under `.agent/sub-agents/`
- installed `code-reviewer`, `test-reviewer`, `type-reviewer`, `openapi-expert`, `zod-expert`, and `json-schema-expert`
- added `.agent/rules/invoke-reviewers.md` as the local invocation contract
- installed Codex project-agent registration in `.codex/config.toml` and `.codex/agents/*.toml`
- removed the legacy `.codex/skills/` reviewer path
- added `scripts/validate-portability.mjs` and `pnpm portability:check`
- corrected the outgoing Practice docs so Codex reviewers and experts are modelled as `.codex` project agents rather than skills

Verification outcome:

- `pnpm portability:check` passed on 2026-03-09
- the full canonical quality-gate chain passed on 2026-03-09
- a Codex smoke run successfully invoked `code-reviewer` and returned the expected three-line identity block from the installed project-agent configuration

---

## Locked Decisions

1. This plan becomes the **primary active plan now**.
2. The existing Zod plans remain physically in `.agent/plans/active/` by explicit user instruction.
3. While this slice is active, those Zod plans are treated as **parked-in-place non-primary context**, not as co-primary plans and not as tightly coupled companions.
4. Canonical agent content lives in `.agent/sub-agents/` using the three-layer model:
   - shared components
   - canonical templates
   - thin platform adapters
5. Codex reviewer and domain-expert roles live in `.codex/config.toml` plus `.codex/agents/*.toml`, not in `.agents/skills/`.
6. `.agents/skills/` remains the Codex-facing home for skills and command-shaped workflows only.
7. The initial installed roster is exactly:
   - `code-reviewer`
   - `test-reviewer`
   - `type-reviewer`
   - `openapi-expert`
   - `zod-expert`
   - `json-schema-expert`
8. The earlier `json-jsonld-expert` placeholder is replaced by `json-schema-expert` to match Castr's real JSON Schema surface.
9. Gemini / Antigravity support remains future work; this slice lays the canonical groundwork they will later consume.

---

## Intended Impact

We are optimizing for:

- a real installed agent system in the Practice rather than a placeholder note about later work
- stronger quality through reviewer agents that can be invoked consistently
- faster, higher-confidence design and implementation work through domain-expert agents
- a Codex adapter model that matches the canonical-first Practice instead of improvising reviewer behaviour through skills alone
- future Gemini / Antigravity expansion becoming an adapter problem, not another architectural rewrite

---

## Current-State Baseline

Current strengths:

- canonical-first commands / skills / rules model already exists under `.agent/`
- `.agents/skills/` already provides a working Codex-facing skill path for skills and command workflows
- future Gemini / Antigravity planning already exists in `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`
- outgoing Practice context now includes strong supporting material for platform adapters and reviewer architecture

Current gaps:

- no canonical `.agent/sub-agents/` directory yet
- no shared agent components
- no canonical reviewer or domain-expert templates
- no local `invoke-reviewers` rule / invocation contract
- no Codex project-agent configuration layer yet
- legacy `.codex/skills/` residue still exists and needs removing
- `AGENT.md` still says the full reviewer/sub-agent system is not yet installed
- `practice-index.md` does not yet expose a sub-agent / agent architecture section

---

## Important Structural Changes

No product runtime APIs change in this slice. The changes are to the Practice and agentic infrastructure:

- **Add canonical agent layer**
  - `.agent/sub-agents/README.md`
  - `.agent/sub-agents/components/`
  - `.agent/sub-agents/templates/`

- **Add agent-governance / invocation support**
  - `.agent/rules/invoke-reviewers.md`
  - any minimal supporting agent rules needed to keep invocation disciplined

- **Add Codex adapter layer for agents**
  - `.codex/config.toml`
  - `.codex/agents/`
  - `.codex/README.md`

- **Update local Practice entrypoints**
  - `.agent/directives/AGENT.md`
  - `.agent/practice-index.md`
  - `.agent/prompts/start-right.prompt.md`
  - `.agent/prompts/session-entry.prompt.md`
  - `.agent/plans/roadmap.md`

---

## Scope

In scope:

- design and installation of Castr's canonical three-layer agent system
- minimal but real reviewer-agent architecture
- initial domain-expert-agent architecture
- Codex adapter validation and installation for those agent roles
- invocation rules and local Practice documentation updates
- portability / cohesion validation for canonical-vs-adapter thinness

Out of scope:

- Gemini adapter implementation
- Antigravity adapter implementation
- product-code remediation for Zod limitations
- an oversized speculative roster with weak invocation discipline
- platform wrappers becoming a second home for substantive agent logic

---

## Proposed Initial Agent Families

### Reviewer agents

Minimum viable installed roster:

- `code-reviewer` — gateway reviewer, always first for non-trivial changes
- `test-reviewer` — TDD, classification, and test-quality specialist
- `type-reviewer` — type-flow and widening specialist

Possible in-slice expansion if the validated invocation model stays clear:

- one architecture reviewer variant
- `docs-adr-reviewer`
- `config-reviewer`

### Domain-expert agents

Initial installed roster:

- `openapi-expert`
- `zod-expert`
- `json-schema-expert`

---

## Execution Tranches

### Tranche 0: Validate the Codex and local adapter model

Before writing a large number of adapter files, confirm the real local Codex shape this repo should use.

1. Inspect current local Codex project support and any existing config conventions.
2. Lock the Codex project-agent contract for this repo as:
   - `.codex/config.toml`
   - `.codex/agents/*.toml`
3. Reconcile any tension between:
   - the portable Practice Core wording
   - the outgoing adapter reference docs
   - the real local Codex environment
4. Lock the local adapter contract before creating reviewer / expert wrappers.

Deliverable:

- one short durable note or plan section locking the Codex adapter format for Castr

### Tranche 1: Install the canonical three-layer agent structure

1. Create `.agent/sub-agents/README.md`.
2. Create the shared component directories:
   - `.agent/sub-agents/components/behaviours/`
   - `.agent/sub-agents/components/principles/`
3. Create `.agent/sub-agents/templates/`.
4. Define dependency rules clearly:
   - components are leaf nodes
   - templates may compose components
   - platform adapters load templates and add only activation metadata

Deliverable:

- the canonical agent architecture exists in the repo with a durable README explaining its layer boundaries

### Tranche 2: Install the minimum viable reviewer system

1. Create canonical templates for:
   - `code-reviewer`
   - `test-reviewer`
   - `type-reviewer`
2. Add only the components genuinely shared across those templates.
3. Add an invocation contract:
   - `.agent/rules/invoke-reviewers.md`
   - clear trigger guidance for when reviewer delegation is required
4. Update `AGENT.md` so the local Practice no longer claims reviewer infrastructure is merely future work.

Deliverable:

- a functioning minimum reviewer layer with clear invocation guidance

### Tranche 3: Install the first domain-expert agents

1. Define the distinction between reviewer agents and domain-expert agents.
2. Create the first canonical expert templates that clear the bar:
   - `openapi-expert`
   - `zod-expert`
   - `json-schema-expert`
3. Give each expert:
   - a narrow remit
   - explicit trigger conditions
   - boundaries that prevent overlap with reviewer agents
4. Update local Practice docs to explain when domain experts are appropriate.

Deliverable:

- the first domain-expert layer exists and is documented as part of the Practice

### Tranche 4: Add Codex agent adapters

1. Create the validated Codex adapter/config files for the installed reviewer and expert agents.
2. Keep Codex adapter files thin:
   - activation metadata
   - canonical template pointer
   - any platform-required identity fields
3. Do not duplicate canonical agent logic into `.codex/`.
4. Preserve `.agents/skills/` for skills and command-shaped workflows only.

Deliverable:

- Codex can invoke the installed canonical reviewer / expert roles through a proper adapter layer

### Tranche 5: Practice integration, docs, and validation

1. Update:
   - `.agent/directives/AGENT.md`
   - `.agent/practice-index.md`
   - `.agent/prompts/start-right.prompt.md`
   - `.agent/prompts/session-entry.prompt.md`
   - `.agent/plans/roadmap.md`
   - `.agent/practice-context/outgoing/platform-adapter-reference.md`
   - `.agent/practice-context/outgoing/reviewer-system-guide.md`
   - `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`
2. Expose the new agent architecture in the local Practice.
3. Add any validation scripts or checklists needed for:
   - canonical-vs-adapter thinness
   - missing canonical template targets
   - agent roster documentation drift
4. Reconcile the future Gemini / Antigravity plan so it now depends on an already-installed canonical agent layer rather than an imagined one.

Deliverable:

- the Practice documents one real installed agent system instead of a future placeholder

---

## TDD / Validation Order

For this primarily infrastructural slice, “tests first” means reference, shape, and portability validation before broad file creation.

1. Create a failing inventory for:
   - missing `.agent/sub-agents/` canonical content
   - missing Codex agent adapter layer
   - stale docs claiming Codex reviewers are skills or the reviewer system is not yet installed
2. Add or update validation for:
   - canonical template targets exist
   - adapters stay thin
   - practice-index / AGENT / prompt links resolve
   - `.codex/skills/` does not exist
3. Install the canonical agent layer and Codex adapters.
4. Re-run the structural validation checks.
5. Run the full canonical quality-gate chain from repo root.

---

## Documentation Outputs Required

- `.agent/sub-agents/README.md`
- `.agent/directives/AGENT.md`
- `.agent/practice-index.md`
- `.agent/prompts/start-right.prompt.md`
- `.agent/prompts/session-entry.prompt.md`
- `.agent/plans/roadmap.md`
- `.agent/rules/invoke-reviewers.md`
- `.codex/README.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `scripts/validate-portability.mjs`
- `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`
- any new Codex adapter/config documentation needed to explain the local shape

---

## Acceptance Criteria

- one new primary active plan exists for the core agent system / Codex adapter slice
- the current Zod plans remain physically in `active/` but are explicitly documented as non-primary parked-in-place context
- canonical `.agent/sub-agents/` structure exists with clear layer boundaries
- a minimum viable reviewer-agent roster exists canonically in `.agent/`
- the first domain-expert agents exist canonically in `.agent/`
- a Codex agent adapter/config layer exists and points back to canonical agent content
- the third expert is `json-schema-expert`
- `.agents/skills/` remains the home for skills / command workflows rather than reviewer-role duplication
- `AGENT.md`, `practice-index.md`, session entry, and roadmap all agree on the new primary workstream
- the future Gemini / Antigravity plan now clearly depends on this installed canonical agent layer
- `.codex/skills/` has been removed
- quality gates pass

---

## References

- `.agent/practice-core/practice.md`
- `.agent/practice-core/practice-bootstrap.md`
- `.agent/practice-context/outgoing/platform-adapter-reference.md`
- `.agent/practice-context/outgoing/reviewer-system-guide.md`
- `.agent/practice-context/outgoing/starter-templates.md`
- `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`
