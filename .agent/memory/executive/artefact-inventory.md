# Artefact Inventory

Canonical-vs-adapter taxonomy for castr's agent artefacts, and the how-to
for creating each class. Look this up when **adding a new skill, rule, or
sub-agent**. The governing pattern is **canonical-first**: the source of
truth lives once under `.agent/`; platform adapters are thin, generated or
forwarding pointers that never duplicate logic (portable doctrine:
[PDR-079](../../practice-core/decision-records/PDR-079-pdr-vs-adr-portability-distinction.md)).

## The classes

| Class              | Canonical home                                            | Adapters (thin)                                                                                | Index / registration                                                                                                            |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Skill**          | `.agent/skills/<name>/SKILL-CANONICAL.md`                 | `.claude/skills/engraph-<name>/SKILL.md`, `.agents/skills/engraph-<name>/SKILL.md` (generated) | discovered by `pnpm skills:check`                                                                                               |
| **Rule**           | `.agent/rules/<name>.md`                                  | _forwarders aspirational — see note_                                                           | a row in [`RULES_INDEX.md`](../../../RULES_INDEX.md)                                                                            |
| **Sub-agent**      | `.agent/sub-agents/templates/<name>.md` (+ `components/`) | `.codex/agents/<name>.toml` (Codex only)                                                       | roster in [`sub-agents/README.md`](../../sub-agents/README.md) + the [`invoke-reviewers`](../../rules/invoke-reviewers.md) rule |
| **Directive**      | `.agent/directives/<name>.md`                             | none (auto-loaded / read directly)                                                             | indexed in `AGENT.md`                                                                                                           |
| **PDR** (portable) | `.agent/practice-core/decision-records/PDR-NNN-*.md`      | travels with the Core                                                                          | the decision-records README                                                                                                     |
| **ADR** (host)     | `docs/architectural_decision_records/ADR-NNN-*.md`        | none                                                                                           | the ADR README                                                                                                                  |

## How to create — skills

1. Author `.agent/skills/<name>/SKILL-CANONICAL.md` (frontmatter `name`,
   `classification`, `description`; body = the workflow).
2. Generate the platform adapters: `pnpm --filter @engraph/agent-tools skills-adapter-generate`.
   This writes the thin `.claude/skills/engraph-<name>/SKILL.md` and
   `.agents/skills/engraph-<name>/SKILL.md` forwarders — do not hand-author them.
3. Verify: `pnpm skills:check` and `pnpm portability:check`.

## How to create — rules

1. Author `.agent/rules/<name>.md` (Trigger / Action / failure-mode shape;
   match the house format of an existing rule).
2. Add one alphabetical row to [`RULES_INDEX.md`](../../../RULES_INDEX.md).
3. Re-run the drift validator (`pnpm repo-validators:check`) — adding a rule
   can shift count-claims; the validator is the authority on what it tracks.

> **Forwarder note (honest current state).** `RULES_INDEX.md` describes
> "three on-disk forms" (canonical + `.claude/rules/` + `.cursor/rules/`
> forwarders). castr's transplanted rules do **not** yet have per-rule
> forwarders — only three legacy `.cursor/*.mdc` forwarders exist, and the
> Oak `portability` validator that would enforce forwarder-alignment is
> **deferred to P7**. Until then, adding a rule means canonical `.md` + an
> index row; the forwarder generation (or an index-prose correction) is a
> named P7/D4 item. Claude auto-loads rules via `CLAUDE.md` → `AGENT.md`;
> Codex / Gemini read `RULES_INDEX.md` and the canonical files directly.

## How to create — sub-agents

1. Author `.agent/sub-agents/templates/<name>.md` (explicit triggers,
   workflow, boundaries, output format; may compose `components/` building
   blocks — components are leaf nodes and must not depend on each other).
2. Register the Codex adapter: `.codex/agents/<name>.toml` pointing only at the
   canonical template, and add it to `.codex/config.toml`.
3. Update the roster in [`sub-agents/README.md`](../../sub-agents/README.md) and
   the [`invoke-reviewers`](../../rules/invoke-reviewers.md) rule.
4. Keep all reviewer/expert logic in the canonical template — none in
   `.agents/skills/`.

Platform-adapter parity across classes is tracked in
[`cross-platform-agent-surface-matrix.md`](cross-platform-agent-surface-matrix.md).
