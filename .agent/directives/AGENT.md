# AGENT.md

**@engraph/castr** transforms data definitions between supported formats via a canonical Intermediate Representation (IR).

## Grounding

- Use British/UK English spelling in prose unless an external interface requires otherwise.
- Use exact file paths and concrete dates when clarifying repo state.
- Before planning substantial work, read [metacognition.md](./metacognition.md).

## The Practice

- Read [`practice-core/index.md`](../practice-core/index.md) for the portable Practice Core.
- Read [`practice-index.md`](../practice-index.md) for the bridge into this repo's local Practice.
- Use `castr-start-right` or `jc-start-right` at session start or after a context switch.

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
- Decision guidance: [requirements.md](./requirements.md)
- Quality gate protocol: [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)
- Architectural file-system structure: [architectural-file-system-structure.md](./architectural-file-system-structure.md)

## Practice Infrastructure

- Commands: [`commands/`](../commands/)
- Skills: [`skills/`](../skills/)
- Rules: [`rules/`](../rules/)
- Sub-agents: [`sub-agents/`](../sub-agents/)
- Prompts: [`prompts/`](../prompts/)
- Plans: [`plans/`](../plans/)
- Memory: [`memory/`](../memory/)
- Experience: [`experience/`](../experience/)

## Sub-agents

The reviewer and domain-expert layer is installed canonically under `.agent/sub-agents/`.

Invocation contract:

- read and apply `.agent/rules/invoke-reviewers.md`
- use `.codex/config.toml` and `.codex/agents/*.toml` for Codex reviewer/domain-expert roles
- keep `.agents/skills/` for skills and `jc-*` command workflows only

Installed roster:

- `code-reviewer` — gateway reviewer for non-trivial changes
- `test-reviewer` — TDD and test-quality specialist
- `type-reviewer` — type-flow and strictness specialist
- `openapi-expert` — OpenAPI 3.0/3.1 semantics and IR fidelity specialist
- `zod-expert` — Zod parser/writer lockstep and ts-morph specialist
- `json-schema-expert` — Draft 07 / 2020-12 fidelity and IR mapping specialist

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

## Structure

- `lib/` — product code and tests
- `docs/` — durable architecture docs and ADRs
- `.agent/directives/` — authoritative doctrine and operational entrypoints
- `.agent/prompts/` — session continuation context bridge
- `.agent/commands/` — canonical command workflows
- `.agent/skills/` — canonical skills
- `.agent/rules/` — operationalized doctrine
- `.agent/sub-agents/` — canonical reviewer and domain-expert templates
- `.agent/practice-core/` — portable Core package
- `.agent/practice-context/` — optional exchange support context
- `.agent/plans/active/` — primary active plan plus any explicit parked-in-place exception
- `.agent/plans/current/paused/` — incomplete but non-primary resumable workstreams
- `.agent/plans/current/complete/` — completed atomic plans staged before archive
- `.agents/skills/` — Codex skill and workflow wrappers
- `.codex/` — Codex project-agent registration and thin adapters
- `scripts/` — repo-local validation and tooling support
