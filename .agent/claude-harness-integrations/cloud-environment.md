# Claude cloud environment — the "Practice Repos" environment

How claude.ai cloud sessions (web, mobile, routines, `claude --cloud`) are
provisioned for Practice repos, and how to change that safely. The
environment is shared by every Practice repo; each session carries exactly
one repo (owner ruling 2026-08-23), and the environment never knows which
one in advance.

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
   from the repo root after install, under the same fail-fast rules. This
   repo currently needs nothing beyond the shared install step and commits
   no hook; create the file at that path when it does.

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
   just the named host.

## Suspected-fragile hosts register

Hosts the setup script needs whose setup-time reachability has never been
positively confirmed (the in-session preflight passes them; a setup-time
preflight paste has not yet been run): `nodejs.org`,
`registry.npmjs.org`, `keyserver.ubuntu.com`, and the gitleaks
release-asset redirect target. The 2026-08-24 in-session preflight
resolved that redirect to `release-assets.githubusercontent.com` (not
`objects.githubusercontent.com` as previously assumed) — if the
setup-time allow-list lacks that host, the gitleaks download is the first
candidate point of death. Remove entries from this register as setup-time
preflight cards positively confirm them.

## Environment settings that pair with the script

- **Network access**: Custom, with "Also include default list of common
  package managers" ticked, plus:

  ```text
  ppa.launchpadcontent.net
  cdn.playwright.dev
  playwright.download.prss.microsoft.com
  ```

  The Trusted preset is not sufficient: it 403s `ppa.launchpadcontent.net`,
  which breaks any `apt-get update` because the base image itself ships PPA
  sources on that host (worked instance 2026-08-23: castr routine sessions
  failed to start).

- **Environment variables**: the Slack Watcher configuration lives here —
  in the environment, never in a repo — so every Practice repo's sessions
  share it and changing channel or workspace is an environment edit, not a
  commit:

  ```text
  SLACK_WATCHER_CHANNEL_ID=<channel id, e.g. C0XXXXXXXXX>
  SLACK_WATCHER_WORKSPACE=<workspace name>
  ```

  Consumed by the `slack-watcher` and `talk-to-slack-watcher` skills
  (canonical under `.agent/skills/`). These values are visible to anyone
  using the environment; channel ids are not secrets, and no secret may be
  added here.

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

## Provenance (worked instances, 2026-08-23)

- `add-apt-repository` crashes on this image (`apt_pkg` missing) — PPAs are
  added by writing sources and key files directly.
- The image's `/opt/nodeXX/bin` precedes `/usr/local/bin` in `PATH`, so the
  toolchain install repoints those entries; nothing else can change a
  session's `PATH`.
- Hard-coding a repo path broke castr sessions (the environment previously
  assumed this repo); discovery-and-delegation replaced it.
