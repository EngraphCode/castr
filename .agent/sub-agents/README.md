# Sub-agent Prompt Architecture

This directory is Castr's canonical agent layer.

## Layers

1. `components/` — shared prompt building blocks.
2. `templates/` — canonical reviewer and domain-expert workflows.
3. Consumer wrappers — thin platform adapters that load templates without duplicating logic.

Current installed consumer layer:

- Codex project agents via `.codex/config.toml` and `.codex/agents/*.toml`

Future consumer layers may be added for Cursor, Claude, Gemini, and other platforms, but the canonical instructions remain here.

## Dependency Rules

- Components are leaf nodes. They MUST NOT depend on other components.
- Templates may compose components and local doctrine documents.
- Platform adapters must load a canonical template as their first substantive action.
- Platform adapters may add only activation metadata and platform-required runtime settings.

## Installed Roster

- `code-reviewer`
- `test-reviewer`
- `type-reviewer`
- `openapi-expert`
- `zod-expert`
- `json-schema-expert`

## Consistency Checklist

Before finalising changes to this layer:

- [ ] shared components remain generic and reusable
- [ ] each template has explicit triggers, workflow, boundaries, and output format
- [ ] `.agent/rules/invoke-reviewers.md` reflects the installed roster
- [ ] `.codex/config.toml` and `.codex/agents/*.toml` point only at canonical templates
- [ ] no reviewer or domain-expert logic has drifted into `.agents/skills/`
