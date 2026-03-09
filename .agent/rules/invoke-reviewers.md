# Invoke Reviewers And Domain Experts

Use the installed reviewer and domain-expert roster deliberately and consistently.

- After any non-trivial code change, invoke `code-reviewer` first.
- Invoke `test-reviewer` when tests, fixtures, harnesses, or TDD evidence are added or changed.
- Invoke `type-reviewer` when types, generics, schema flow, parser/writer contracts, or type assertions are involved.
- Invoke `openapi-expert`, `zod-expert`, or `json-schema-expert` when changes touch their respective semantic surfaces.
- In Codex, these roles are project agents registered in `.codex/config.toml` and `.codex/agents/*.toml`, not skills in `.agents/skills/`.

See `.agent/directives/AGENT.md` for the installed roster and `.agent/sub-agents/README.md` for the canonical agent-layer structure.
