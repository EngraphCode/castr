# Account-Portability Register

**Purpose (owner direction, 2026-08-25):** all machinery important to the proper
functioning of this repo's Claude sessions must be portable, discoverable, and repeatable
on another account, via the repo alone. This register is the discoverability surface for
that guarantee: it enumerates every account-side dependency and points each at its
repo-carried recreate procedure and validation instrument. The substance lives in the
owning documents; this register indexes them and never duplicates them.

## Landing duty

An arc that creates or changes account-side machinery lands its row here — and its
recreate procedure in an owning home — in the same arc. This register's falsifier: a
restart on a new account hitting an account-side dependency this table does not name.
When that happens, the missing row lands together with the fix. Owning homes must
outlive their rows: general (all-session) procedures live beside this register under
`.agent/claude-harness-integrations/`, and only machinery owned by a programme (the
Routine) may point into that programme's plan collection — when the proof-programme
collection archives, its Routine retires with it and that row is removed here in the
same arc.

## Account-side machinery

| Machinery (account-side)                                                                            | What sessions depend on it for                                                                                         | Recreate procedure (repo-carried)                                                                                                                                                                                                  | Validation instrument                                                                                    |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Claude account tier (cloud sessions, scheduled Routines, and connectors available on the plan)      | Any of these sessions existing at all                                                                                  | None — account prerequisite, nothing repo-side can recreate it                                                                                                                                                                     | A manual fire of a disabled Routine spawns a fresh cloud session                                         |
| Cloud environment ("Practice Repos": setup-script paste, network allow-list, environment variables) | Every cloud session's toolchain, hooks, and gate chain                                                                 | [`cloud-environment.md`](./cloud-environment.md) with the reference [`cloud-environment-setup.sh`](./cloud-environment-setup.sh)                                                                                                   | [`cloud-environment-preflight.sh`](./cloud-environment-preflight.sh) pasted as a temporary setup script  |
| Proof-programme Routine (scheduled trigger: stored prompt, cadence, model, notifications, sources)  | The autonomous background loop (ADR-051) firing at all                                                                 | [`arming-runbook.md`](../plans/proof-programme/arming-runbook.md)                                                                                                                                                                  | The runbook's dry-run firing (step 4) and pre-enable reconciliation (step 5)                             |
| GitHub access (organization grant + user connector, scoped to this repo; default credentials)       | Clone, push, PR, and CI surfaces of every cloud session                                                                | [`account-access.md` §GitHub access](./account-access.md)                                                                                                                                                                          | A fresh session reads and pushes a branch (the Q-01 Kingfisher proof shape, parent-plan evidence record) |
| Slack (workspace, channel, connector) and The Watcher (owner-run interactive session)               | Advisory second opinions and owner-alert relay via the owner-interaction Slack channel ADR-051 clause 7 permits (QD-7) | Skills [`slack-watcher`](../skills/slack-watcher/SKILL-CANONICAL.md) and [`talk-to-slack-watcher`](../skills/talk-to-slack-watcher/SKILL-CANONICAL.md); environment variables per [`cloud-environment.md`](./cloud-environment.md) | A `talk-to-slack-watcher` probe answered by the live Watcher                                             |
| Owner notification delivery (Claude mobile app on the owner's device, push channel enabled)         | Completion summaries and owner-blocking alerts (ADR-051 clause 7 as amended per QD-8)                                  | [`account-access.md` §Owner notification delivery](./account-access.md), with the Routine's channel set in the [arming runbook](../plans/proof-programme/arming-runbook.md)                                                        | The dry-run firing's completion notification received on the owner's device                              |

## Verified non-dependencies (nothing to recreate)

- **Platform-provided session machinery under `~/.claude`** — the cloud launcher's
  SessionStart git-identity hook, the Stop-time git-check hook, and the Anthropic-bundled
  synced skills. Measured on one account, 2026-08-25, from inside an owner-redirected
  scheduled firing (napkin entry of the same date carries the observation): the owner's
  remote settings were empty, the hooks were wired by the launcher's own settings file,
  and the synced skill set was the standard Anthropic bundle — vendor infrastructure, not
  owner configuration. An account whose launcher does not wire these is exactly the
  falsifier §Landing duty names. Do not conserve copies in the repo — they would drift
  against a vendor surface the repo does not control.
- **Per-user platform memory** — doctrinally a buffer
  ([`per-user-memory-is-a-buffer`](../rules/per-user-memory-is-a-buffer.md)); everything
  durable consolidates into the repo, so no restart depends on it.
- **Everything repo-carried** — rules, canonical skills and their generated adapters,
  sub-agent templates, git hooks, the `agent-tools` CLIs, plans, memory, and CI are
  portable by construction, with parity enforced by the blocking gates
  (`pnpm portability:check`, `pnpm skills:check`, `pnpm agents:check`,
  `pnpm repo-validators:check`).

## Honest residue

The account-side dialogs are write-only: no session can read back the pasted environment
script, the Routine's live settings, or the organization-side GitHub grant. Drift
detection is therefore instrument-based (the validation column above), and the recreate
route is always re-paste or re-configure per the owning document — never editing around a
suspected difference. This table lists the machinery observed through 2026-08-25; the
landing duty above owns everything created after that date.
