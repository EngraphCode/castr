# Codex Adapters

This directory holds Codex-specific project configuration.

- `.agents/skills/` holds thin Codex skill adapters for repo-local skills and `jc-*` workflows.
- `.codex/config.toml` registers the repo's reviewer and domain-expert project agents.
- `.codex/agents/*.toml` are thin per-agent Codex adapters.
- Canonical reviewer and expert instructions live in `.agent/sub-agents/templates/`.
- Reviewer and domain-expert roles do not live in `.agents/skills/` and do not live in `.codex/skills/`.

## Fallback Reviewer Invocation

If the current Codex surface does not expose direct project-agent fan-out, the parent session can invoke reviewers and domain experts through one nested `codex exec` run that loads the installed adapter and then the canonical template.

Example:

```bash
codex exec --sandbox read-only -C /absolute/path/to/repo \
  "Review the current uncommitted changes. First read .codex/agents/code-reviewer.toml and then .agent/sub-agents/templates/code-reviewer.md. Follow the installed code-reviewer workflow exactly. Scope the review to the changed files under .agent/. Review only; do not modify code."
```

For other roles, replace `code-reviewer` with the required agent name and adjust the scope sentence to match the change surface under review.

Use one nesting level only. Once inside the fallback reviewer or expert session, do not launch another reviewer of the same role; read the adapter and template directly and complete the scoped review.
