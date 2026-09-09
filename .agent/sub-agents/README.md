# Sub-agent Prompt Architecture

This directory is Castr's canonical agent layer.

## Layers

1. `components/` — shared prompt building blocks.
2. `templates/` — canonical reviewer and domain-expert workflows.
3. Consumer wrappers — thin platform adapters that load templates without duplicating logic.

Current installed consumer layer:

- Codex project agents via `.codex/config.toml` and `.codex/agents/*.toml`
- Generated Claude Code wrappers in `.claude/agents/*.md`
- Generated Cursor wrappers in `.cursor/agents/*.md`

Gemini uses the in-session template review described in
[`invoke-code-experts.md`](../memory/executive/invoke-code-experts.md).

## Dependency Rules

- Components are leaf nodes. They MUST NOT depend on other components.
- Templates may compose components and local doctrine documents.
- Platform adapters must load a canonical template as their first substantive action.
- Platform adapters may add only activation metadata and platform-required runtime settings.

## Installed Roster

17 canonical templates. The architecture reviewer is one template (`architecture-expert`)
invoked through four persona adapters (`-barney`, `-betty`, `-fred`, `-wilma`), so the
ordinary reviewer layer has 18 agents against 15 templates. Cricket adds two templates,
three Codex roles and four roles on each of Claude/Cursor: 21 Codex registrations and
22 wrappers on each Markdown platform.

Generic reviewers: `code-reviewer`, `test-reviewer`, `type-reviewer`, `config-expert`,
`docs-adr-expert`, `onboarding-expert`, `release-readiness-expert`, `security-expert`.

Architecture reviewers: `architecture-expert` → `architecture-expert-{barney,betty,fred,wilma}`.

Meta and plan reviewers: `assumptions-expert`, `subagent-architect`.

Domain experts: `openapi-expert`, `zod-expert`, `json-schema-expert`, `mcp-expert`.

Cricket direction panel: `cricket-judgement-low`, `cricket-judgement-medium`,
`cricket-procedure-xhigh`; Claude/Cursor also have `cricket-judgement-high`.
Run the full platform panel with `$engraph-cricket`; its
[canonical skill](../skills/cognition/cricket/SKILL-CANONICAL.md) owns the six-field
frame, normal/adversarial dispatch and exact platform bindings. Cricket is a direction
check; use the artefact reviewers above for code, configuration and evidence scrutiny.

After modifying Codex registrations or adapters, run `pnpm agents:adapter-generate`,
`pnpm agents:check` and `pnpm portability:check`. Generated wrappers are never edited
directly. Start a fresh trusted Castr Codex session after role changes. File parity
does not establish runtime admission: collect all native panel returns and report
missing roles or rejected admission explicitly, without a substitute agent.

## Consistency Checklist

Before finalising changes to this layer:

- [ ] shared components remain generic and reusable
- [ ] each template has explicit triggers, workflow, boundaries, and output format
- [ ] `.agent/rules/invoke-reviewers.md` reflects the installed roster
- [ ] `.codex/config.toml` and `.codex/agents/*.toml` point only at canonical templates
- [ ] no reviewer or domain-expert logic has drifted into `.agents/skills/`
