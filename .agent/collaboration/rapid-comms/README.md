# ARC Rapid-Comms Channels (tracked durable home)

This directory is the canonical ARC home: every channel file, tail command,
announce event, and the statusline feather badges resolve against
`.agent/collaboration/rapid-comms/`. The protocol, its conventions, and the
evaluation evidence live in
[`.agent/reference/arc-rapid-communication.md`](../../reference/arc-rapid-communication.md)
— read §Protocol before opening a channel.

## Convention summary

- **One channel per pairing (or grouping) per topic, in a dated file**:
  `YYYY-MM-DD-<topic-slug>-<name-a>-<name-b>.md`, participant names as FULL
  PDR-027 display names. Group channels with an unknown roster at open use
  `YYYY-MM-DD-<topic-slug>.md`. Statusline feathers light on the UNION of
  the filename match and the on-channel entry-header roster, one feather
  per live channel.
- **Assign the colour at open** (channels dated ≥ 2026-07-09): run
  `pnpm agent-tools:arc-next-colour`, record `Channel-colour: <index>` in
  the opening block. The index keys the coloured membership bar rendered
  beside every participating seat's feather — colour = conversation, across
  all panes. Last colour line wins (append-only re-assignment; also the
  opt-in path for older live channels).
- **Structure is schema-gated; bodies are free-form.** `validate-arc-channels`
  (in `repo-validators:check`) binds TRACKED channel files: files dated
  before 2026-07-09 are grandfathered as-is; later files carry the canonical
  title, a preamble, seconds-precision header timestamps, and the colour
  line. The exact grammar is authoritative in
  `agent-tools/src/arc/arc-channel-grammar.ts`.
- **Append-only.** Nobody edits a prior entry; retractions are new entries.
  Compose the full entry first and append in one short `>>` redirection —
  non-append writes replay every follower's tail.
- **Announce with exactly ONE canonical comms event** at open, before the
  first substantive entry — and search the stream for an existing announce
  naming your counterpart BEFORE opening.
- **Dialogue only — never state.** Claims, heartbeats, commit intents, and
  owner gates live on their canonical surfaces; an ARC watcher never
  substitutes for the all-channels comms watcher.
- **Conserve-at-close.** ARC is working memory: decisions, verdicts, and
  insights fold into canonical homes before the session ends.

Channel files here are tracked and committed at conservation waypoints;
live-append churn sits as uncommitted working-tree modification in between.
Dated channel files are excluded from mutating format passes (see the
`.agent/collaboration/rapid-comms/[0-9][0-9][0-9][0-9]-*.md` entries in `.prettierignore` and
in `.markdownlint-cli2.jsonc` `ignores`) so a `--fix` gate never rewrites a
live channel mid-tail;
keep entries lint-clean at compose time as defence in depth.
