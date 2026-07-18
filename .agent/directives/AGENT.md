# AGENT.md

**@engraph/castr** transforms data definitions between supported formats via a canonical Intermediate Representation (IR).

## Grounding

- Use British/UK English spelling in prose unless an external interface requires otherwise.
- Use exact file paths and concrete dates when clarifying repo state.
- Before planning substantial work, read [metacognition.md](./metacognition.md).

## The Practice

- Read [`practice-core/index.md`](../practice-core/index.md) for the portable Practice Core.
- Read [`practice-index.md`](../practice-index.md) for the bridge into this repo's local Practice.
- Use the `start-right-quick` skill at session start, or `start-right-thorough` after a context switch or long gap.

## First Question

> Could it be simpler without compromising quality?

## Project Context

- Package manager: `pnpm`
- Primary language: TypeScript
- Core architecture: `Any Input Format -> Parser -> IR -> Writers -> Any Output Format`
- IR is the source of truth after parsing
- OpenAPI output is a typed object model
- TypeScript/Zod code generation uses `ts-morph`
- Product doctrine is strict and complete everywhere, all the time: fail-fast, deterministic, lossless by default, and never only partially supported
- **Input-output pair compatibility**: feature support is defined by input-output pairs, constrained by the output format; the IR is the format-independent superset; fail-fast is reserved for genuinely impossible output mappings (see [principles.md](./principles.md) § Input-Output Pair Compatibility Model)

## Principles

- Authoritative doctrine: [principles.md](./principles.md)
- Test methodology: [testing-strategy.md](./testing-strategy.md)
- Validation frame (test / evaluate / assure): [validation-strategy.md](./validation-strategy.md)
- TDD foundational definition: [tdd-as-design.md](./tdd-as-design.md)
- Decision guidance: [requirements.md](./requirements.md)
- Quality gate protocol: [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)
- Architectural file-system structure: [architectural-file-system-structure.md](./architectural-file-system-structure.md)
- Layering contract and authority order: [orientation.md](./orientation.md)
- Principle → operationalisation flow: [operationalisation-contract.md](./operationalisation-contract.md)
- What counts as delivered: [definition-of-delivery.md](./definition-of-delivery.md)
- Continuity practice: [continuity-practice.md](./continuity-practice.md)
- Agent-to-agent collaboration: [agent-collaboration.md](./agent-collaboration.md)
- Agent-to-owner collaboration: [user-collaboration.md](./user-collaboration.md)

## Practice Infrastructure

- Skills: [`skills/`](../skills/)
- Rules: [`rules/`](../rules/)
- Sub-agents: [`sub-agents/`](../sub-agents/)
- Prompts: [`prompts/`](../prompts/)
- Plans: `plans/`
- Memory: [`memory/`](../memory/)
- Experience: [`experience/`](../experience/)

## Sub-agents

The reviewer and domain-expert layer is installed canonically under `.agent/sub-agents/`.

Invocation contract:

- read and apply `.agent/rules/invoke-reviewers.md`
- use `.codex/config.toml` and `.codex/agents/*.toml` for Codex reviewer/domain-expert roles
- keep `.agents/skills/` for generated `engraph-` skill adapters only

The cross-platform `.cursor/agents` + `.claude/agents` wrappers and the `.cursor/rules/*.mdc` triggers are **generated**
(never hand-authored) from the Codex layer + `.agent/rules/` by `pnpm agents:adapter-generate`; the `.claude/rules` +
`.agents/rules` rule wrappers come from `pnpm portability:check --fix`. After adding or renaming a template, persona,
or rule, regenerate and verify with `pnpm portability:check` (the blocking `portability` + `subagents` gates enforce
parity; `pnpm agents:check` fails on drift).

Installed roster (16 templates; the architecture reviewer ships as four persona adapters):

Generic reviewers:

- `code-reviewer` — gateway reviewer for non-trivial changes
- `test-reviewer` — TDD and test-quality specialist
- `type-reviewer` — type-flow and strictness specialist
- `config-expert` — tooling-configuration and quality-gate integrity reviewer
- `docs-adr-expert` — documentation drift, TSDoc, and decision-record completeness reviewer
- `onboarding-expert` — onboarding-path accuracy and first-success reviewer
- `release-readiness-expert` — release-boundary go/no-go reviewer
- `security-expert` — untrusted-input and denial-of-service reviewer

Architecture reviewers (one template, four persona lenses):

- `architecture-expert-barney` — simplification and dependency/boundary cartography
- `architecture-expert-betty` — cohesion, coupling, and change-cost trade-offs
- `architecture-expert-fred` — decision-record compliance and boundary discipline
- `architecture-expert-wilma` — adversarial resilience and failure-mode pressure testing

Meta and plan reviewers:

- `assumptions-expert` — meta-level plan and proportionality reviewer
- `subagent-architect` — meta-agent for sub-agent definition design and review

Domain experts (castr schema surface):

- `openapi-expert` — OpenAPI 3.x (3.0-3.2) semantics and IR fidelity specialist
- `zod-expert` — Zod parser/writer lockstep and ts-morph specialist
- `json-schema-expert` — Draft 07 / 2020-12 fidelity and IR mapping specialist
- `mcp-expert` — castr MCP tool-emission fidelity specialist (the IR→MCP-Tools writer)

Workers (lean task class — see the `lean-task-subagents` skill for dispatch doctrine):

- `task-worker` — lean single-purpose task worker; `model: sonnet`, minimum tools, decision-complete briefs only

## Development Commands

- `pnpm check` — canonical local aggregate verification; use this instead of invoking `pnpm qg` directly
- `pnpm check:ci` — aggregate non-mutating verification
- `pnpm clean`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm format:check`
- `pnpm type-check`
- `pnpm lint`
- `pnpm madge:circular`
- `pnpm madge:orphans`
- `pnpm depcruise`
- `pnpm knip`
- `pnpm portability:check`
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`
- `pnpm test:e2e`

## Local Git Hooks

- Husky is the live repo-local hook runner.
- `pnpm install` triggers the repo `prepare` step, which activates Husky locally.
- `pre-commit` (hardened 2026-07-03, owner-directed) auto-formats staged files with Prettier and
  refreshes the Git index, then runs the blocking gate chain: markdownlint on staged Markdown,
  `secrets:scan`, `repo-validators:check`, `knip`, `depcruise`, the `madge` circular/orphan pair,
  and a fail-closed `turbo run build type-check lint test` (log at `.turbo/last-gate.log`).
- `commit-msg` runs the accidental-major-version guard, then commitlint.
- `pre-push` runs `pnpm check:ci` (clean + frozen install + the full qg chain incl. e2e) — the
  strongest gate; its clean phase transiently removes built workspace dist (announce before
  pushing in a team window, per `check-singleton-per-window`).
- Hooks reinforce the local workflow, but they do not replace an explicit repo-root aggregate rerun when closing a slice.

## Structure

- `lib/` — product code and tests
- `docs/` — durable architecture docs and ADRs
- `.agent/directives/` — authoritative doctrine and operational entrypoints
- `.agent/prompts/` — session continuation context bridge
- `.agent/skills/` — canonical skills
- `.agent/rules/` — operationalized doctrine
- `.agent/sub-agents/` — canonical reviewer and domain-expert templates
- `.agent/practice-core/` — portable Core package
- `.agent/plans/active/` — primary active plan plus any explicit parked-in-place exception
- `.agent/plans/current/paused/` — incomplete but non-primary resumable workstreams
- `.agent/plans/current/complete/` — completed atomic plans staged before archive
- `.agents/skills/` — Codex skill and workflow wrappers
- `.codex/` — Codex project-agent registration and thin adapters
- `scripts/` — repo-local validation and tooling support
