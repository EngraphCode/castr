# Account Access — GitHub and Owner Notification Delivery

Account-side prerequisites shared by every session type this repo runs — interactive
cloud sessions, scheduled Routine firings, and The Watcher alike. Indexed by the
[account-portability register](./account-portability-register.md); the proof-programme
[arming runbook](../plans/proof-programme/arming-runbook.md) cites this document from its
Routine-specific arming sequence. First recorded in the parent plan's Q-01 evidence
record (2026-08-22/23); consolidated here 2026-08-25 when the register became its second
consumer.

## GitHub access

- Host the repository where GitHub Actions runs `.github/workflows/ci.yml` — the
  programme's merge bar (ADR-051 clause 3, "every check green") reads these checks. The
  workflow consumes no repository secrets, so CI needs no secret provisioning on a new
  host.
- Grant the account's Claude GitHub access and scope it to the repository: the
  organization-side admin grant plus the user's GitHub connector authorization.
- Attribution uses the account's default credentials (owner direction 2026-08-23,
  recorded in the parent plan's Q-01 evidence record); agents self-identify inside
  comment bodies and commit trailers per the standing PR rules.
- No programme surface records branch-protection or auto-merge configuration; for
  programme PRs, merge safety is the firing's own ADR-051 clause 3 condition check,
  never a platform gate.
- Validation: a fresh session reads the repo and pushes a branch — the Q-01 Kingfisher
  proof shape (parent plan, Q-01 evidence record).

## Owner notification delivery

- The owner runs the Claude mobile app with push notifications enabled on their device:
  push is the channel that owner-blocking alerts assume (ADR-051 clause 7 as amended per
  QD-8 — "assume I am not around, and that an alert must be sent via the mobile claude
  app").
- The proof-programme Routine's completion-notification channel set is programme-owned
  configuration (ballot B-15, as amended 2026-08-24) and lives with the
  [arming runbook](../plans/proof-programme/arming-runbook.md)'s trigger-configuration
  section.
- Validation: a dry-run firing's completion notification received on the owner's device
  (arming runbook, arming sequence).
