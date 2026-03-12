# Invoke Reviewers And Domain Experts

Use the installed reviewer and domain-expert roster deliberately and consistently.

- After any non-trivial code change, invoke `code-reviewer` first.
- Invoke `test-reviewer` when tests, fixtures, harnesses, or TDD evidence are added or changed.
- Invoke `type-reviewer` when types, generics, schema flow, parser/writer contracts, or type assertions are involved.
- Invoke `openapi-expert`, `zod-expert`, or `json-schema-expert` when changes touch their respective semantic surfaces.
- In Codex, these roles are project agents registered in `.codex/config.toml` and `.codex/agents/*.toml`, not skills in `.agents/skills/`.

## Fallback When Direct Project-Agent Invocation Is Unavailable

- If the current Codex surface does not expose direct project-agent fan-out, the parent or orchestrating session should invoke the required reviewer or expert through one nested `codex exec` run.
- Invoke these fallback nested reviewer or expert runs sequentially, never in parallel, and wait for each run to finish before starting the next one.
- Run the nested command from the repo root with `-C /absolute/path/to/repo`.
- Use `--sandbox read-only` for review-only passes.
- Instruct the nested run to read the adapter first from `.codex/agents/<agent>.toml`, then the canonical template from `.agent/sub-agents/templates/<agent>.md`, and to follow that installed workflow exactly.
- Scope the prompt to the exact files or diff under review and state explicitly that the nested run must not modify code.
- Do not recursively invoke the same reviewer again from inside that nested run. Once inside the fallback reviewer or expert session, read the adapter and template directly and perform the scoped review.
- Record the reviewer outcome in the active session artefacts so later sessions do not inherit hidden review debt.

Example fallback invocation:

```bash
codex exec --sandbox read-only -C /absolute/path/to/repo \
  "Review the current uncommitted changes. First read .codex/agents/code-reviewer.toml and then .agent/sub-agents/templates/code-reviewer.md. Follow the installed code-reviewer workflow exactly. Scope the review to the changed files under .agent/. Review only; do not modify code."
```

Swap `code-reviewer` for `test-reviewer`, `type-reviewer`, `openapi-expert`, `zod-expert`, or `json-schema-expert` as needed.

This fallback is single-level only.

See `.agent/directives/AGENT.md` for the installed roster and `.agent/sub-agents/README.md` for the canonical agent-layer structure.
