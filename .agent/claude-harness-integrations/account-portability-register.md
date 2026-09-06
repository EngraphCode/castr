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
proof-programme Claude adapter) may point into that programme's plan collection — when the proof-programme
collection archives, its Routine retires with it and that row is removed here in the
same arc.

## Account-side machinery

| Machinery (account-side)                                                                                                                 | What sessions depend on it for                                                                                         | Recreate procedure (repo-carried)                                                                                                                                                                                                                                                                                                                           | Validation instrument                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Claude account tier (cloud sessions, scheduled Routines, and connectors available on the plan)                                           | Any of these sessions existing at all                                                                                  | None — account prerequisite, nothing repo-side can recreate it                                                                                                                                                                                                                                                                                              | An authorised invocation is observed to start; no probe is required during a pause                           |
| Cloud environment ("Practice Repos": setup-script paste, network allow-list, environment variables)                                      | Every cloud session's toolchain, hooks, and gate chain                                                                 | [`cloud-environment.md`](./cloud-environment.md) with the reference [`cloud-environment-setup.sh`](./cloud-environment-setup.sh)                                                                                                                                                                                                                            | [`cloud-environment-preflight.sh`](./cloud-environment-preflight.sh) pasted as a temporary setup script      |
| Proof-programme Claude Routine (historical implementation of the platform-neutral experiment)                                            | Claude scheduled execution; disabled per owner statement 2026-09-06, experiment paused                                 | [Claude adapter](./cloud-environment.md#proof-programme-claude-routine-adapter); [parent current state](../plans/proof-programme/parent-plan.md#current-execution-state) owns execution permission                                                                                                                                                          | Credentialed landing and notification receipt observed during owner-authorised execution; no arming ceremony |
| GitHub access (organization grant + user connector, scoped to this repo; default credentials)                                            | Clone, push, PR, and CI surfaces of every cloud session                                                                | [`account-access.md` §GitHub access](./account-access.md)                                                                                                                                                                                                                                                                                                   | A fresh session reads and pushes a branch (the Q-01 Kingfisher proof shape, parent-plan evidence record)     |
| GitHub repository settings (branch ruleset: required `quality-gates` check + code-scanning/quality/coverage rules; CodeQL default setup) | The merge and security controls every PR passes through                                                                | [`account-access.md` §Repository settings](./account-access.md)                                                                                                                                                                                                                                                                                             | The authorised work's PR shows the full check set and ruleset rules                                          |
| Slack (workspace, channel, connector) and The Watcher (owner-run interactive session)                                                    | Advisory second opinions and owner-alert relay via the owner-interaction Slack channel ADR-051 clause 7 permits (QD-7) | Skills [`slack-watcher`](../skills/slack-watcher/SKILL-CANONICAL.md) and [`talk-to-slack-watcher`](../skills/talk-to-slack-watcher/SKILL-CANONICAL.md); environment variables per [`cloud-environment.md`](./cloud-environment.md); the workspace OAuth + connector attach are owner-manual acts in the claude.ai UI — an account act, not repo-recreatable | An authorised advisory or alert exchange receives a reply from a live Watcher                                |
| Owner notification delivery (Claude mobile app on the owner's device, push channel enabled)                                              | Completion summaries and owner-blocking alerts (ADR-051 clause 7 as amended per QD-8)                                  | [`account-access.md` §Owner notification delivery](./account-access.md), with the Routine's channel set applied by the owner in the Routine's settings                                                                                                                                                                                                      | Any scheduled firing's completion notification received on the owner's device                                |

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

At the 2026-08-25 capture, the inspected seat could not read back the pasted
environment script or all account-side settings. That observation is not a
permanent claim about every platform API. When account work is authorised,
read the fields the actual tools expose and validate remaining assumptions
through the owning recipe; do not claim a live read that did not occur.

The inventory records machinery observed through 2026-08-25 with dated
subsequent amendments. The 2026-09-06 proof-programme pause/disabled-state
update comes from the owner, not account inspection, and does not change
other Routines. The landing duty owns later account-side changes.
