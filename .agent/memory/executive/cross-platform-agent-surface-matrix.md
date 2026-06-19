# Cross-Platform Agent Surface Matrix

Honest, current-state map of which artefact classes have platform adapters,
across the four platforms castr targets. Look this up when **verifying
adapter parity or adding a new platform**. The canonical content for every
class lives once under `.agent/`; the cells below record only the **thin
adapter** coverage. ⚠️ marks a known gap with a named position.

| Artefact class | Claude Code                                                 | Cursor                                                                           | Codex                                             | Gemini                                            |
| -------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| **Skills**     | ✅ `.claude/skills/engraph-<name>/SKILL.md` (generated, 18) | ✅ via `.agents/skills/` (cross-tool, generated)                                 | ✅ via `.agents/skills/`                          | ✅ via `.agents/skills/`                          |
| **Rules**      | auto-loaded via `CLAUDE.md` → `AGENT.md` → `RULES_INDEX.md` | ⚠️ `.cursor/rules/` carries only 3 legacy `.mdc` forwarders, not the full roster | reads `RULES_INDEX.md` + canonical files directly | reads `RULES_INDEX.md` + canonical files directly |
| **Sub-agents** | ⚠️ none — in-session template fallback                      | ⚠️ none — in-session template fallback                                           | ✅ `.codex/agents/<name>.toml` (18→15 tmpl)       | ⚠️ none — in-session template fallback            |
| **Hooks**      | ✅ `.claude/hooks/run-pretooluse-guard.mjs` (PreToolUse)    | ⚠️ none                                                                          | ⚠️ none                                           | ⚠️ none                                           |

## Reading the matrix

- **Skills** have the broadest parity: the canonical `SKILL-CANONICAL.md` is
  forwarded to Claude (`.claude/skills/`) and to all `.agents/`-loading
  platforms (Codex, Cursor, Gemini) via the generated `engraph-<name>`
  adapters. Regenerate with `pnpm --filter @engraph/agent-tools skills-adapter-generate`;
  verify with `pnpm skills:check` / `pnpm portability:check`.
- **Rules** have **no per-rule forwarders** for the transplanted estate —
  Claude auto-loads them through the entry-point chain, and Codex / Gemini
  read `RULES_INDEX.md` directly, so the rules still apply everywhere; but the
  "three on-disk forms" forwarder model in `RULES_INDEX.md` is **aspirational**.
  Closing it (generate forwarders, or correct the index prose) is a named
  **P7** item — the Oak `portability` validator that enforces it is deferred
  to P7.
- **Sub-agents** are **Codex-only** today. On Claude / Cursor / Gemini the path
  is the in-session template fallback documented in
  [`invoke-code-experts.md`](invoke-code-experts.md) and
  [`invoke-reviewers`](../../rules/invoke-reviewers.md). Adding non-Codex
  sub-agent adapters is future work, not yet scheduled.
- **Hooks** are **Claude-only** (the live PreToolUse guard). Other platforms
  have no hook adapter; cross-platform hook parity is not yet a goal.

## Adding a new platform

1. Identify which classes that platform auto-loads vs reads directly.
2. For skills, extend the adapter generator to emit the platform's forwarder
   form; never hand-author adapters.
3. For rules, prefer auto-load / direct-read over per-rule forwarders unless
   the platform requires them.
4. Record the new column here and re-run `pnpm portability:check`.
