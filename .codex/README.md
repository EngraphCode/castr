# Codex Adapters

This directory holds Codex-specific project configuration.

- `.agents/skills/` holds thin Codex skill adapters for repo-local skills and `jc-*` workflows.
- `.codex/config.toml` registers the repo's reviewer and domain-expert project agents.
- `.codex/agents/*.toml` are thin per-agent Codex adapters.
- Canonical reviewer and expert instructions live in `.agent/sub-agents/templates/`.
- Reviewer and domain-expert roles do not live in `.agents/skills/` and do not live in `.codex/skills/`.
