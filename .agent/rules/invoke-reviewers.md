# Invoke Reviewers And Domain Experts

Use the installed reviewer and domain-expert roster deliberately and consistently.

- After any non-trivial code change, invoke `code-reviewer` first.
- Invoke `test-reviewer` when tests, fixtures, harnesses, or TDD evidence are added or changed.
- Invoke `type-reviewer` when types, generics, schema flow, parser/writer contracts, or type assertions are involved.
- Invoke `openapi-expert`, `zod-expert`, `json-schema-expert`, or `mcp-expert` when changes touch their respective semantic surfaces.
- Invoke a cross-cutting reviewer when its surface is touched: `architecture-expert` (one template, four persona adapters `-barney`/`-betty`/`-fred`/`-wilma`), `config-expert`, `security-expert`, `docs-adr-expert` + `onboarding-expert` (paired on significant docs/Practice changes), or `release-readiness-expert` at release boundaries.
- At plan time, invoke `assumptions-expert` (proportionality) and `subagent-architect` (when sub-agent definitions change). See [`invoke-assumptions-expert`](invoke-assumptions-expert.md), [`invoke-mcp-expert`](invoke-mcp-expert.md), and [`invoke-doc-and-onboarding-experts-on-significant-changes`](invoke-doc-and-onboarding-experts-on-significant-changes.md) for the standing dispatch rules.
- In Codex, these roles are project agents registered in `.codex/config.toml` and `.codex/agents/*.toml`, not skills in `.agents/skills/`.

## Gate-Shaped Code: Adversarial Fixpoint Before First Push

For gate-shaped code — validators, hooks, CI pins, anything whose job is to
catch other code's defects — a single review pass is not enough: run an
ADVERSARIAL review loop locally and iterate each cure back through it until
findings run dry, BEFORE the first push. A gate's own defects are silent by
nature (a hole in a checker looks exactly like a clean check), and each cure
creates fresh attack surface, so the fixpoint must be reached somewhere —
the only choice is locally at minutes per cycle or publicly at PR-review
tempo with the full battery/CI/review-lag cost per round.

Upstream worked instance (owner-ratified 2026-07-18): a test-purity
validator went through a 10-round external review arms race (28+ real
findings). Retrospective: ~24 of the first 25 were locally catchable — the
one 3-skeptic adversarial workflow actually run pre-push refuted the
gate's first design empirically AND pre-empted four findings external
review only surfaced rounds later; every cure shipped after it was
self-reviewed only, which is exactly where the arms race lived. The
practice: the adversarial pass is run to CONVERGENCE (fixpoint, findings
dry), re-running after each cure — not once — and its skeptics probe the
gate's CLAIMS (what does this promise? what silently disables it?), not
just its diff. The `pr-lifecycle` skill's Phase 1 names this pass as a
before-first-push step; the fleet shape for the skeptics is the
`lean-task-subagents` skill's swarm/depth tiers under `PDR-142`.

## When Direct Project-Agent Invocation Is Unavailable Or Unreliable

- If the current Codex surface does not expose direct project-agent fan-out, or if that fan-out is not producing useful review signal, perform the required review in the current parent session.
- Read the installed adapter first from `.codex/agents/<agent>.toml`, then read the canonical template from `.agent/sub-agents/templates/<agent>.md`, and follow that installed workflow exactly.
- Scope the review to the exact files or diff under review and keep it read-only unless the user has separately asked for fixes.
- Do not spawn nested reviewer sessions by default. In this repo, the preferred fallback is template-based manual review in the active session because it is more reliable and avoids burning budget on re-anchoring and diff gathering.
- Record the reviewer outcome in the active session artefacts so later sessions do not inherit hidden review debt.

Example in-session fallback flow:

1. Read `.codex/agents/code-reviewer.toml`.
2. Read `.agent/sub-agents/templates/code-reviewer.md`.
3. Review the scoped diff in the current session only.
4. Report findings and record the outcome in the active artefacts.

Swap `code-reviewer` for any installed reviewer or expert as needed (`test-reviewer`, `type-reviewer`, `architecture-expert-{barney,betty,fred,wilma}`, `config-expert`, `docs-adr-expert`, `onboarding-expert`, `release-readiness-expert`, `security-expert`, `assumptions-expert`, `subagent-architect`, `openapi-expert`, `zod-expert`, `json-schema-expert`, `mcp-expert`).

See `.agent/directives/AGENT.md` for the installed roster and `.agent/sub-agents/README.md` for the canonical agent-layer structure.
