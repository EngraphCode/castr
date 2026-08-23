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
on a half-built environment is worse than no session. Known-benign output:
the git-core PPA InRelease signature warning (`rsa1024` weak algorithm) is
a warning, not an error.

## Provenance (worked instances, 2026-08-23)

- `add-apt-repository` crashes on this image (`apt_pkg` missing) — PPAs are
  added by writing sources and key files directly.
- The image's `/opt/nodeXX/bin` precedes `/usr/local/bin` in `PATH`, so the
  toolchain install repoints those entries; nothing else can change a
  session's `PATH`.
- Hard-coding a repo path broke castr sessions (the environment previously
  assumed this repo); discovery-and-delegation replaced it.
