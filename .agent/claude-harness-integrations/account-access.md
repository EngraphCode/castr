# Account Access — GitHub and Owner Notification Delivery

Account-side prerequisites for this repository's Claude implementation —
interactive cloud sessions, scheduled Routine invocations and The Watcher.
These recipes do not define the platform-neutral experiment or assert an
equivalent setup on another platform. Indexed by the
[account-portability register](./account-portability-register.md); the proof-programme
[Claude adapter](./cloud-environment.md#proof-programme-claude-routine-adapter)
cites this document for GitHub and notification details. Current experiment
execution state lives in the parent plan; the owner confirmed on 2026-09-06
that the experiment is paused and its Claude Routine disabled. First recorded in the parent plan's Q-01 evidence
record (2026-08-22/23); consolidated here 2026-08-25 when the register became its second
consumer.

## GitHub access

- Host the repository where GitHub Actions runs `.github/workflows/ci.yml` — the
  programme's merge bar (ADR-051 clause 3, "every check green") reads these checks. The
  workflow consumes no repository secrets, so CI needs no secret provisioning on a new
  host. CI triggers only on pushes to `main` and on pull requests: a plain
  feature-branch push runs nothing, which is why the settings validation below uses a
  draft PR.
- Grant the account's Claude GitHub access and scope it to the repository: the
  organization-side admin grant plus the user's GitHub connector authorization.
- Attribution uses the account's default credentials (owner direction 2026-08-23,
  recorded in the parent plan's Q-01 evidence record); agents self-identify inside
  comment bodies and commit trailers per the standing PR rules.
- Merge control has two halves, and a new host must recreate both: ADR-051 clause 3
  governs merge **authority** for programme PRs (condition-based, no per-PR owner
  approval), while the platform-side **enforcement** is the repository settings below —
  the ruleset blocks a red merge for everyone; the firing's clause 3 check decides an
  unattended green one.
- Validation (access): a fresh session reads the repo and pushes a branch — the Q-01
  Kingfisher proof shape (parent plan, Q-01 evidence record). A branch push verifies
  contents access only: it triggers no CI and exercises no pull-request permission, so
  the work-PR settings validation below is also the proof of PR-creation and CI
  access. Observe those permissions and checks on authorised work; these
  validation recipes are not a separate arming prerequisite or permission to
  create a scratch PR while the experiment is paused.

## Repository settings

GitHub-side, dialog-configured, and therefore re-created by hand on a new host; this
section is the repo-side record (sources: the `ci.yml` header comments, the
`pr-lifecycle` skill's checks-harvesting contract, and the 2026-07-03 delivery record
in `repo-continuity.md`).

- **Branch ruleset on `main`**: requires the `quality-gates` status check (the
  workflow's fail-closed fan-in job deliberately reuses that context name), and
  enforces `code_scanning`, `code_quality`, and `code_coverage` rules server-side.
  Coverage thresholds live only in the ruleset — recorded floors at last capture
  (2026-07-03): minimum 70, maximum drop 1. Verify against the live ruleset when
  recreating; drift between this record and the dialog is resolved by reading the
  dialog and updating this file.
- **CodeQL**: enabled via GitHub's **default setup** in the repository's Security
  settings, not as a workflow job — the `ci.yml` header records why (default setup
  rejects SARIF uploads from advanced-setup workflows for the same languages).
- **Validation (settings)**: observe the full check set on the authorised work's
  PR — the `quality-gates` fan-in, CodeQL and the ruleset's code-quality/coverage
  rules. A separate scratch-PR exercise belongs only to an explicitly
  commissioned settings diagnosis, not to a standing pre-enable ceremony.

## Owner notification delivery

- The recorded Claude delivery arrangement uses the owner's mobile app with push
  notifications enabled (account-side capture, 2026-08-25):
  push is the channel that owner-blocking alerts assume (ADR-051 clause 7 as amended per
  QD-8 — "assume I am not around, and that an alert must be sent via the mobile claude
  app").
- The proof-programme Routine's recorded completion-notification channel choice
  (ballot B-15, latest amendment 2026-08-27) is push + Slack, no email. This is
  historical configuration; the experiment's Routine is currently disabled
  per the 2026-09-06 owner statement. No other Routine's state is inferred.
- Validation accompanies authorised execution: observe the actual completion
  notification received on the owner's device; a successful run alone does
  not prove receipt. A future non-Claude implementation needs its own
  owner-agreed delivery arrangement, without weakening the owner-alert duty.
