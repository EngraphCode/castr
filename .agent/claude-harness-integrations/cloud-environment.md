# Claude cloud environment — the "Practice Repos" environment

How claude.ai cloud sessions (web, mobile, routines, `claude --cloud`) are
provisioned for Practice repos, and how to change that safely. This
environment is one row of the session estate's account-side inventory —
the full inventory, with recreate procedures for restarting on another
account, is the
[account-portability register](./account-portability-register.md). The
environment is shared by every Practice repo; a session may carry one or
several repos (owner word 2026-08-24, superseding the 2026-08-23
one-repo ruling), and the environment never knows which in advance —
discovery provisions every Practice repo present. When a document
references a file in another repo, use a GitHub URL, never a local
path (owner word 2026-08-24).

## The two layers

1. **Environment setup script** — universal, repo-agnostic. Lives in the
   claude.ai environment configuration; its source of truth is the
   reference copy at
   [`cloud-environment-setup.sh`](cloud-environment-setup.sh). It discovers
   whichever Practice repo the session carries and installs the toolchain
   that repo declares — Node at the major named by its `engines` field,
   the exact pnpm its `packageManager` pin selects (via Corepack, shimmed
   into a trusted path), git ≥ 2.45, and a checksum-verified gitleaks
   (version and sha value-synced with castr's supply-chain single source,
   `.claude/hooks/_lib/gitleaks-pin.env`) — then runs `pnpm install` and
   delegates to the repo's own hook. The script itself pins no version a
   repo declares.
2. **Per-repo session hook** — the common-ability contract. A Practice repo
   that needs more than `pnpm install` commits an executable
   `.agent/setup/cloud-session-setup.sh`; the environment script invokes it
   from the repo root after install, under the same fail-fast rules. A repo
   with no extra needs commits no hook — castr commits none (verified
   2026-08-25: no `.agent/setup/` directory exists, and castr's e2e suites
   are vitest, needing no browser). The Playwright hosts in the allow-list
   below belong to Practice repos whose own hooks install browsers, per the
   hook-preflight contract.

## Cloud-session grounding contract

Every session in this environment — scheduled Routine firings and
interactive cloud seats alike — grounds with the `engraph-start-right-thorough`
skill and carries the `engraph-plan` / `engraph-metacognition` /
`engraph-proportionality` skill stack (the installed, invocable names)
as mandatory working discipline (owner ruling, 2026-08-26 arming walk).
A fresh container has no accumulated session context to lean on and no
owner watching by default, so the full one-gate-at-a-time grounding and
the cognitive stack are the substitute for the supervision an interactive
local session gets for free. The strategic frame is
`.agent/plans/future/cloud-autonomy-trust.md`.

## Changing the environment

1. Edit [`cloud-environment-setup.sh`](cloud-environment-setup.sh) here,
   review, and land it via a pull request.
2. Paste the whole script into claude.ai → environment selector →
   "Practice Repos" → Setup script, and save.
3. Changes apply to **new sessions only**. The environment cache (a
   filesystem snapshot, roughly 7-day expiry) rebuilds when the script or
   the allowed-domain list changes; the first session after a change runs
   the script live.

Repo-specific needs never go in the environment script — put them in the
repo's hook so other Practice repos' sessions are unaffected.

## Validating and diagnosing

The environment builder is the only true fresh-container test bench:
running the script by hand inside an existing session proves nothing about
a fresh container (different egress, different filesystem state, different
cache). The dialog is also write-only — no API reads it back, so drift
between this reference file and the pasted copy is undetectable from a
session. Four consequences, each with its instrument:

1. **The script narrates itself.** Every section opens with a
   `=== PHASE: … ===` banner and an `ERR` trap prints the failing phase,
   line, and command. A failure card therefore names its own point of
   death; a card without a phase banner means the script died before
   `set -euo pipefail` — i.e. the paste itself is damaged.
2. **The preflight returns the complete falsification list in one paste.**
   [`cloud-environment-preflight.sh`](cloud-environment-preflight.sh) is a
   read-only probe of every external assumption the setup script makes
   (repo discovery, hook contract, git origin remotes, nodejs.org, registry.npmjs.org,
   keyserver.ubuntu.com, ppa.launchpadcontent.net, the base image's own
   apt hosts, the gitleaks release-asset redirect chain). All probes run
   regardless of individual failures and the summary lists every failed
   assumption. Setup-time egress differs from in-session egress (worked
   instance 2026-08-23: Trusted preset fine in-session, 403 at setup), so
   the authoritative run mode is pasting the preflight as a **temporary**
   environment script and reading the session-start card; the in-session
   run (`bash .agent/claude-harness-integrations/cloud-environment-preflight.sh`)
   is the cheap first pass.
3. **The diagnosis loop.** When fresh sessions stop starting:
   1. Read the failure card. A phase banner localises the failure; no
      banner means paste damage — go straight to step 4.
   2. Paste the preflight as the environment script, start a session, and
      read its card: the complete list of falsified assumptions in one
      round-trip.
   3. Fix what the preflight names — usually the network allow-list (a
      redirect target like `release-assets.githubusercontent.com` never
      appears in the script text) or a vendor-side change — landing any
      script edit here first via PR.
   4. Re-paste the current reference `cloud-environment-setup.sh` in full.
      The rollback lever is the same move: any previous known-good version
      is in this file's git history, and pasting it restores that state
      exactly.
4. **The probe invariant.** Every external host the setup script contacts
   has a probe in the preflight; a change adding a host lands the probe in
   the same commit. Redirect chains count — probe the effective URL, not
   just the named host. Hook-contacted hosts count too, via the
   **hook-preflight contract**: a repo whose session hook contacts extra
   hosts commits the read-only twin
   `.agent/setup/cloud-session-preflight.sh` beside the hook, and the
   universal preflight runs it as a probe — the same
   delegation shape as setup itself. Absence is the only benign skip;
   exists-but-not-executable fails the probe.

## Suspected-fragile hosts register

- **`keyserver.ubuntu.com`** — registered 2026-08-25 on a setup-time card:
  the git-core PPA key fetch
  (`/pks/lookup?op=get&search=0xA1715D88E1DF1F24`) returned HTTP 503 and
  fail-fasted session creation in the git phase. Three in-session probes of
  the exact URL minutes later returned 200/200/200, and a plain retry of
  session creation succeeded — a transient origin-side episode, the known
  flakiness class of the Ubuntu HKP pool, not an allow-list or proxy
  failure (those read as 403/CONNECT). Standing disposition: retry first.
  Routed cure candidate for the setup script (lands via PR per §Changing
  the environment): a bounded retry-with-backoff on this fetch.

Before this entry the register was empty: a setup-time preflight paste on
2026-08-24 ran 12/12 from a true
fresh builder, positively confirming every previously registered host —
`nodejs.org`, `registry.npmjs.org`, `keyserver.ubuntu.com`, and the
gitleaks release-asset redirect target (measured as
`release-assets.githubusercontent.com`, not `objects.githubusercontent.com`
as once assumed; the preflight's failure branch now prints the last
attempted URL so a future redirect-host change names itself on the card).
Re-add an entry only when a setup-time card implicates a host.

## The full environment definition

The complete "Practice Repos" environment as configured in the claude.ai
dialog, recorded verbatim from the live configuration (owner-provided
screenshots, 2026-08-25) so the environment is fully re-creatable from
this repo alone. The dialog is write-only, so this section is the
definition of record: change it here first, then apply it in the dialog
(changes apply to new sessions only).

- **Name**: `Practice Repos`.

- **Network access**: Custom, with "Also include default list of common
  package managers" ticked, and this exact allowed-domains list:

  ```text
  ppa.launchpadcontent.net
  cdn.playwright.dev
  playwright.download.prss.microsoft.com
  *.frame.claudeusercontent.com
  *.frame.staging.claudeusercontent.com
  ```

  The Trusted preset is not sufficient: it 403s `ppa.launchpadcontent.net`,
  which breaks any `apt-get update` because the base image itself ships PPA
  sources on that host (worked instance 2026-08-23: castr routine sessions
  failed to start). The two `*.frame…claudeusercontent.com` wildcards are
  the platform's Artifact content domains (the dialog's "Add Artifact
  content domains" control adds them): they let sessions in this
  environment read claude.ai Artifacts, per-Artifact token-authorized.

- **Environment variables**: the Slack Watcher configuration is consumed
  by sessions from the environment at runtime — no session reads these
  values from a repo file, and every Practice repo's sessions share them —
  but like everything in this section their definition of record is here:
  change a value in this file first, then apply it in the dialog. The live
  values (2026-08-25; the dialog marks these visible to anyone using the
  environment — channel ids and workspace names are not secrets, and no
  secret may be added here):

  ```text
  SLACK_WATCHER_WORKSPACE=engraph-workspace
  SLACK_WATCHER_CHANNEL_ID=C0B9AQ2BK5E
  ```

  Consumed by the `slack-watcher` and `talk-to-slack-watcher` skills
  (canonical under `.agent/skills/`). On a new account with a different
  Slack workspace, substitute that workspace's values.

- **Setup script**: the whole of
  [`cloud-environment-setup.sh`](cloud-environment-setup.sh), pasted
  verbatim (the file is the source of truth; the dialog holds the live
  copy). It runs when a new session starts, before Claude Code launches.

- **Lifecycle controls**: the dialog's Save applies to new sessions only;
  Archive retires the environment. Recreating on a new account is exactly
  this section top to bottom: create an environment with this name, set
  network access and the domains list, paste the variables, paste the
  script.

## Fail-fast contract

The script exits non-zero on any failure and session creation then fails
with the script output in the session-start card — deliberately. A session
on a half-built environment is worse than no session.

One tracked vendor warning (per no-warning-toleration's third-party
clause): `apt-get update` reports the git-core PPA's InRelease signature
uses a weak algorithm (`rsa1024`). The key is Launchpad's, not this
repo's, so the warning cannot be fixed at source; the signature still
verifies and provisioning proceeds. Triage disposition: if apt escalates
this to a rejected signature, provisioning hard-fails loudly at `apt-get
update` — that failure is the designed signal, and the remedy is moving
git to a source with a modern key.

## Provenance (worked instances, 2026-08-23/24)

- `add-apt-repository` crashes on this image (`apt_pkg` missing) — PPAs are
  added by writing sources and key files directly.
- The image's `/opt/nodeXX/bin` precedes `/usr/local/bin` in `PATH`, so the
  toolchain install repoints those entries; nothing else can change a
  session's `PATH`.
- Hard-coding a repo path broke castr sessions (the environment previously
  assumed this repo); discovery-and-delegation replaced it.
- The 2026-08-23/24 outage (every fresh session failing for ~24h): the
  discovery pipeline's `find /home /workspace` exits non-zero because the
  builder ships no `/workspace` — while still printing every match — and
  `set -euo pipefail` turned that into instant death at the discovery
  line, from the discovery script's very first paste. Two traps hid it:
  hand-validation ran script chunks in an interactive shell (no strict
  mode, so the pipeline "worked" on the bench), and the preflight runs
  without `-e`/`pipefail` by design, so it cannot catch strict-mode
  shell-semantics deaths — that class belongs to the setup script's own
  phase banners and ERR trap, which named the dying line on the first
  instrumented run. When validating a strict-mode script, run the WHOLE
  file under its own strict mode, never chunks in an interactive shell.
