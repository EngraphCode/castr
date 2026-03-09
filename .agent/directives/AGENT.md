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
- Product doctrine is strict, fail-fast, deterministic, and lossless by default

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
- Prompts: [`prompts/`](../prompts/)
- Plans: [`plans/`](../plans/)
- Memory: [`memory/`](../memory/)
- Experience: [`experience/`](../experience/)

## Sub-agents

The full reviewer/sub-agent system is not yet fully installed in this repo's canonical-first model.

Current expectation:

- use the repo doctrine directly
- use the command/skill/rule chain consistently
- expand reviewer infrastructure in a later dedicated slice rather than improvising local one-offs

## Development Commands

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
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`

## Structure

- `lib/` — product code and tests
- `docs/` — durable architecture docs and ADRs
- `.agent/directives/` — authoritative doctrine and operational entrypoints
- `.agent/prompts/` — reusable playbooks
- `.agent/commands/` — canonical command workflows
- `.agent/skills/` — canonical skills
- `.agent/rules/` — operationalized doctrine
- `.agent/practice-core/` — portable Core package
- `.agent/practice-context/` — optional exchange support context
- `.agent/plans/active/` — single next atomic plan
- `.agent/plans/current/paused/` — incomplete but non-primary resumable workstreams
- `.agent/plans/current/complete/` — completed atomic plans staged before archive
