# Cross-Platform Agent Surface Matrix

Honest, current-state map of which artefact classes have platform adapters,
across the four platforms castr targets. Look this up when **verifying
adapter parity or adding a new platform**. The canonical content for every
class lives once under `.agent/`; the cells below record only the **thin
adapter** coverage. ⚠️ marks a known gap with a named position.

| Artefact class | Claude Code                                                                                                                     | Cursor                                           | Codex                                          | Gemini                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- |
| **Skills**     | ✅ `.claude/skills/engraph-<name>/SKILL.md` (generated, 18)                                                                     | ✅ via `.agents/skills/` (cross-tool, generated) | ✅ via `.agents/skills/`                       | ✅ via `.agents/skills/`                       |
| **Rules**      | ✅ `.claude/rules/<name>.md` (generated, 87) + auto-load via `CLAUDE.md` → `AGENT.md`                                           | ✅ `.cursor/rules/<name>.mdc` (generated, 87)    | reads `RULES_INDEX.md` + `.agents/rules/` (87) | reads `RULES_INDEX.md` + `.agents/rules/` (87) |
| **Sub-agents** | ✅ `.claude/agents/<name>.md` (generated, 18)                                                                                   | ✅ `.cursor/agents/<name>.md` (generated, 18)    | ✅ `.codex/agents/<name>.toml` (18→15 tmpl)    | ⚠️ none — in-session template fallback         |
| **Hooks**      | policy `unsupported` as portable canonical; activated natively via `.claude/settings.json` (tracked project `PreToolUse` guard) | ⚠️ none                                          | ⚠️ none                                        | ⚠️ none                                        |

## Reading the matrix

- **Skills** have the broadest parity: the canonical `SKILL-CANONICAL.md` is
  forwarded to Claude (`.claude/skills/`) and to all `.agents/`-loading
  platforms (Codex, Cursor, Gemini) via the generated `engraph-<name>`
  adapters. Regenerate with `pnpm --filter @engraph/agent-tools skills-adapter-generate`;
  verify with `pnpm skills:check` / `pnpm portability:check`.
- **Rules** now have **per-rule forwarders on every platform** (generated, not
  hand-authored): `.claude/rules/<name>.md` + `.agents/rules/<name>.md`
  (written by `pnpm portability:check --fix`) and `.cursor/rules/<name>.mdc`
  triggers (written by `pnpm agents:adapter-generate`); Codex / Gemini also
  read `RULES_INDEX.md` directly. Every canonical `.agent/rules/<name>.md` is
  mirrored across all three forwarder estates, gate-enforced by the blocking
  `portability` validator.
- **Sub-agents** now have **full reviewer-adapter parity** across Claude,
  Cursor, and Codex (18 adapters each, projected from the 15 canonical
  templates with the four `architecture-expert` persona expansions). The
  Claude/Cursor wrappers are generated from the Codex layer by
  `pnpm agents:adapter-generate`; parity is gate-enforced by the blocking
  `portability` + `subagents` validators. Gemini sub-agent adapters remain a
  named future item (the in-session template fallback documented in
  [`invoke-code-experts.md`](invoke-code-experts.md) and
  [`invoke-reviewers`](../../rules/invoke-reviewers.md) applies there).
- **Hooks** are **Claude-only** today. Hook policy is `unsupported` as a
  portable canonical artefact (no cross-platform hook format exists); it is
  activated natively for Claude Code through the tracked project
  `.claude/settings.json`, which wires the Bash `PreToolUse` guard. The guard
  reads the canonical policy in `.agent/hooks/policy.json` and runs the
  prebuilt runtime artefact
  `agent-tools/dist/src/hook-policy/check-blocked-patterns.js` through the
  verdict shim `.claude/hooks/run-pretooluse-guard.mjs`, so a built-but-broken
  artefact blocks the tool call (exit 2) while a not-yet-built artefact fails
  open (loud, logged). Other platforms have no hook adapter; cross-platform
  hook parity is not yet a goal.

## Policy Spine

This repo's hook and adapter surfaces follow a small Policy Spine — the
authority order that decides which surface wins when canonical intent, a
generated mirror, and a native activation hint disagree:

| Layer                                                                                                                         | Role                                                                                                                         | Hand-authored? |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Canonical (`.agent/` rules, templates, `.agent/hooks/policy.json`)                                                            | Single source of truth for intent; every platform mirror is projected from here                                              | Yes            |
| Generated mirrors (`.claude/`, `.cursor/`, `.agents/` rule + agent adapters)                                                  | Thin per-platform forwarders; regenerable, never hand-edited; drift is gate-blocked                                          | No             |
| Workspace runtime (`agent-tools/dist/src/hook-policy/check-blocked-patterns.js` via `.claude/hooks/run-pretooluse-guard.mjs`) | Enforces the active native hook path; fails closed if a built artefact is broken, fails open (loud, logged) if not yet built | No             |

The spine resolves conflicts with three operations:

- `override` — a higher-authority canonical layer wins over a lower mirror or activation hint
- `prune` — a missing native surface removes a local activation path without changing canonical intent
- `block` — validators or runtime enforcement reject an unsafe or incoherent state

## Adding a new platform

1. Identify which classes that platform auto-loads vs reads directly.
2. For skills, extend the adapter generator to emit the platform's forwarder
   form; never hand-author adapters.
3. For rules and sub-agents, extend `agent-adapter-generate` (and the
   `portability --fix` rule-wrapper writer) to emit the new platform's
   forwarders; never hand-author adapters.
4. Record the new column here and re-run `pnpm portability:check`.
