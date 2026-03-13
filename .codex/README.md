# Codex Adapters

This directory holds Codex-specific project configuration.

- `.agents/skills/` holds thin Codex skill adapters for repo-local skills and `jc-*` workflows.
- `.codex/config.toml` registers the repo's reviewer and domain-expert project agents.
- `.codex/agents/*.toml` are thin per-agent Codex adapters.
- Canonical reviewer and expert instructions live in `.agent/sub-agents/templates/`.
- Reviewer and domain-expert roles do not live in `.agents/skills/` and do not live in `.codex/skills/`.

## Fallback Reviewer Invocation

If the current Codex surface does not expose direct project-agent fan-out, or if direct fan-out is not producing useful review signal, the parent session should apply the installed reviewer workflow directly in-session.

Use this order:

1. Read `.codex/agents/<agent>.toml`.
2. Read `.agent/sub-agents/templates/<agent>.md`.
3. Perform the scoped review in the current session.
4. Record the outcome in the active artefacts.

For other roles, replace `<agent>` with the required reviewer or expert name.

Nested `codex exec` reviewer fallback is deliberately not the standard path in this repo because it can spend its budget on re-anchoring and diff gathering before reaching substantive findings.
