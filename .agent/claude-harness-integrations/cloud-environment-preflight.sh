#!/bin/bash
# Claude cloud environment PREFLIGHT — read-only probe harness.
#
# Falsifies every external assumption cloud-environment-setup.sh makes, in
# one pass, without installing or mutating anything. Two run modes:
#
#   1. In-session: `bash .agent/claude-harness-integrations/cloud-environment-preflight.sh`
#      — checks the assumptions from inside a running session's network.
#   2. As a TEMPORARY environment script: paste this file in place of the
#      setup script and start a session. Setup-time egress differs from
#      in-session egress (worked instance 2026-08-23: the Trusted network
#      preset worked in-session but 403'd ppa.launchpadcontent.net at
#      setup), so only this mode tests what a real setup run will see.
#
# Every probe runs regardless of earlier failures; the summary lists every
# failed assumption, so one paste returns the complete falsification list
# instead of one finding per round-trip. Exit is non-zero when any probe
# fails — the session-start failure card then carries the list. A clean
# preflight pasted as the environment script exits 0 and starts a session
# on an UNPROVISIONED container: use that only for diagnosis, then paste
# the real setup script back.
#
# Contract: read-only. Probes write nothing outside /tmp and install
# nothing. Every external host the setup script contacts has a probe here;
# adding a host to the setup script without adding its probe in the same
# commit is drift (cloud-environment.md § Validating and diagnosing).
set -uo pipefail # deliberately NOT -e: every probe must run to the summary
shopt -s nullglob

# value-synced with cloud-environment-setup.sh (and castr's supply-chain
# single source, .claude/hooks/_lib/gitleaks-pin.env); bump all together
GITLEAKS_VERSION=8.30.0

PROBES=0
FAILURES=()
probe() {
  local name="$1"
  shift
  PROBES=$((PROBES + 1))
  echo ""
  echo "--- probe: ${name} ---"
  if "$@"; then
    echo "PASS: ${name}"
  else
    echo "FAIL: ${name}"
    FAILURES+=("${name}")
  fi
}

# HTTP reachability that distinguishes egress-blocked from merely-missing:
# a proxy denial surfaces as 000/403/407/502; a 200/301/404 proves the host
# is reachable through the setup-time egress path.
http_code() {
  # a failed curl (DNS, connect, timeout) still emits its own 000 via -w
  # before exiting non-zero, so appending a fallback would yield "000000"
  # and dodge the 000 case below — capture first, normalise on failure
  local code
  code=$(curl -sS -o /dev/null -m 30 -w '%{http_code}' "$1" 2>/dev/null) || code=000
  if [ "${code:-000}" = "000" ]; then
    # one retry: a single transient transport failure must not falsify a
    # host (observed in-session 2026-08-24: one-off 000 from
    # security.ubuntu.com, 200 on every retry)
    code=$(curl -sS -o /dev/null -m 30 -w '%{http_code}' "$1" 2>/dev/null) || code=000
  fi
  echo "${code:-000}"
}
host_reachable() {
  local url="$1" code
  code=$(http_code "$url")
  echo "HTTP ${code}: ${url}"
  case "$code" in
  000 | 403 | 407 | 502) return 1 ;;
  *) return 0 ;;
  esac
}

FIRST_REPO=""
NODE_MAJOR=""

probe_vantage() {
  # informational — records the vantage point so a pasted run's card shows
  # what the builder container actually is
  echo "user: $(id 2>/dev/null || echo unknown)"
  echo "pwd: $(pwd)"
  echo "PATH: ${PATH}"
  echo "proxy: HTTPS_PROXY=${HTTPS_PROXY:-unset} HTTP_PROXY=${HTTP_PROXY:-unset} NO_PROXY=${NO_PROXY:-unset}"
  local d
  for d in /opt/node*/bin; do echo "image node dir: ${d}"; done
  command -v node >/dev/null 2>&1 && echo "node on PATH: $(node --version 2>/dev/null)" || echo "no node on PATH"
  command -v git >/dev/null 2>&1 && echo "git on PATH: $(git --version 2>/dev/null)" || echo "no git on PATH"
  command -v curl >/dev/null 2>&1 || {
    echo "curl missing — every network probe below will fail"
    return 1
  }
}

probe_discovery() {
  local repos repo found=0
  repos=$(find /home /workspace -maxdepth 4 -type d -name .git \
    -not -path '*/node_modules/*' 2>/dev/null | sed 's|/\.git$||')
  test -n "$repos" || {
    echo "no git repositories under /home or /workspace"
    return 1
  }
  for repo in $repos; do
    if [ -f "$repo/pnpm-lock.yaml" ] && [ -f "$repo/.agent/directives/AGENT.md" ]; then
      echo "Practice repo: ${repo}"
      found=1
      [ -n "$FIRST_REPO" ] || FIRST_REPO="$repo"
    else
      echo "non-Practice repo (would be skipped): ${repo}"
    fi
  done
  [ "$found" = 1 ] || {
    echo "no Practice repo (pnpm-lock.yaml + .agent/directives/AGENT.md) found"
    return 1
  }
}

probe_hook_contract() {
  # exists-but-not-executable is the one hook state the setup script hard-fails on
  test -n "$FIRST_REPO" || {
    echo "skipped: no Practice repo"
    return 1
  }
  local repo hook ok=0
  for repo in $(find /home /workspace -maxdepth 4 -type d -name .git \
    -not -path '*/node_modules/*' 2>/dev/null | sed 's|/\.git$||'); do
    [ -f "$repo/pnpm-lock.yaml" ] && [ -f "$repo/.agent/directives/AGENT.md" ] || continue
    hook="$repo/.agent/setup/cloud-session-setup.sh"
    if [ -e "$hook" ]; then
      if [ -x "$hook" ]; then
        echo "hook present and executable: ${hook}"
      else
        echo "hook exists but is NOT executable (setup would exit 1): ${hook}"
        ok=1
      fi
    else
      echo "no hook (benign): ${repo}"
    fi
  done
  return $ok
}

probe_git_origins() {
  # the setup script runs `git fetch --unshallow origin` in shallow Practice
  # repos — a blocked origin or unusable credentials must not hide behind a
  # clean summary; ls-remote is the read-only equivalent contact
  test -n "$FIRST_REPO" || {
    echo "skipped: no Practice repo"
    return 1
  }
  local repo failed=0
  for repo in $(find /home /workspace -maxdepth 4 -type d -name .git \
    -not -path '*/node_modules/*' 2>/dev/null | sed 's|/\.git$||'); do
    [ -f "$repo/pnpm-lock.yaml" ] && [ -f "$repo/.agent/directives/AGENT.md" ] || continue
    # bounded and non-interactive: a hung remote or a credential helper
    # waiting for input must not stall the whole falsification pass
    if GIT_TERMINAL_PROMPT=0 timeout 30 git -C "$repo" ls-remote --heads origin >/dev/null 2>&1; then
      echo "origin reachable: ${repo} (shallow: $(git -C "$repo" rev-parse --is-shallow-repository 2>/dev/null))"
    else
      echo "origin UNREACHABLE (fetch --unshallow would fail): ${repo}"
      failed=1
    fi
  done
  return $failed
}

probe_session_hook_preflights() {
  # the universal preflight cannot know which hosts a repo's session hook
  # contacts (e.g. Playwright's download CDNs), so it delegates that
  # falsification the same way setup delegates the work: a repo whose hook
  # needs extra hosts commits the read-only twin
  # .agent/setup/cloud-session-preflight.sh beside it (the hook-preflight
  # contract); absence is the only benign skip
  test -n "$FIRST_REPO" || {
    echo "skipped: no Practice repo"
    return 1
  }
  local repo pf failed=0
  for repo in $(find /home /workspace -maxdepth 4 -type d -name .git \
    -not -path '*/node_modules/*' 2>/dev/null | sed 's|/\.git$||'); do
    [ -f "$repo/pnpm-lock.yaml" ] && [ -f "$repo/.agent/directives/AGENT.md" ] || continue
    pf="$repo/.agent/setup/cloud-session-preflight.sh"
    if [ -e "$pf" ]; then
      if [ ! -x "$pf" ]; then
        echo "hook preflight exists but is NOT executable: ${pf}"
        failed=1
      elif "$pf"; then
        echo "hook preflight passed: ${repo}"
      else
        echo "hook preflight FAILED: ${repo}"
        failed=1
      fi
    else
      echo "no hook preflight (benign): ${repo}"
    fi
  done
  return $failed
}

probe_node_major() {
  test -n "$FIRST_REPO" || {
    echo "skipped: no Practice repo"
    return 1
  }
  NODE_MAJOR=$(grep -o '"node"[: ]*"[^"]*"' "$FIRST_REPO/package.json" | grep -o '[0-9][0-9]*' | head -1 || true)
  NODE_MAJOR=${NODE_MAJOR:-24}
  echo "node major: ${NODE_MAJOR} (from ${FIRST_REPO}/package.json engines; default 24)"
}

probe_nodejs_org() {
  local major="${NODE_MAJOR:-24}" index tgz
  index=$(curl -fsSL -m 60 "https://nodejs.org/dist/latest-v${major}.x/") || {
    echo "index fetch failed: https://nodejs.org/dist/latest-v${major}.x/"
    return 1
  }
  tgz=$(echo "$index" | grep -o "node-v${major}[0-9.]*-linux-x64.tar.gz" | head -1)
  test -n "$tgz" || {
    echo "index fetched but no linux-x64 tarball name parsed from it"
    return 1
  }
  echo "tarball resolved: ${tgz}"
  curl -fsSL -m 60 "https://nodejs.org/dist/latest-v${major}.x/SHASUMS256.txt" -o /tmp/preflight-shasums.txt || {
    echo "SHASUMS256.txt fetch failed"
    return 1
  }
  grep -q " ${tgz}\$" /tmp/preflight-shasums.txt || {
    echo "resolved tarball missing from SHASUMS256.txt"
    return 1
  }
  host_reachable "https://nodejs.org/dist/latest-v${major}.x/${tgz}"
}

probe_npm_registry() {
  # corepack (pnpm resolution) and pnpm install both need the registry
  host_reachable "https://registry.npmjs.org/-/ping"
}

probe_keyserver() {
  local key
  key=$(curl -fsSL -m 60 "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xA1715D88E1DF1F24") || {
    echo "key fetch failed from keyserver.ubuntu.com"
    return 1
  }
  echo "$key" | grep -q "BEGIN PGP PUBLIC KEY BLOCK" || {
    echo "response is not a PGP public key block"
    return 1
  }
  echo "git-core PPA signing key fetched"
}

probe_git_core_ppa() {
  host_reachable "https://ppa.launchpadcontent.net/git-core/ppa/ubuntu/dists/noble/InRelease"
}

probe_base_image_apt_sources() {
  # the base image ships its own apt sources; one blocked host there breaks
  # every `apt-get update`, whatever this estate's script adds (worked
  # instance 2026-08-23: Trusted preset 403'd ppa.launchpadcontent.net)
  # parse only ACTIVE entries — `deb`/`deb-src` lines in one-line format and
  # `URIs:` fields in deb822 files. A bare URL grep would also probe hosts in
  # comments (e.g. the stock sources file's help.ubuntu.com pointer), which
  # apt never contacts, and misattribute an unrelated block to apt sources.
  local uris u failed=0
  uris=$({
    grep -rhE '^[[:space:]]*deb(-src)?[[:space:]]' /etc/apt/sources.list /etc/apt/sources.list.d/*.list 2>/dev/null
    grep -rhE '^[[:space:]]*URIs:' /etc/apt/sources.list.d/*.sources 2>/dev/null
  } | grep -oE 'https?://[^ ]+' | sort -u)
  test -n "$uris" || {
    echo "no apt source URIs found on image (unexpected but not a network failure)"
    return 0
  }
  for u in $uris; do
    host_reachable "$u" || failed=1
  done
  return $failed
}

probe_gitleaks_release() {
  # release assets redirect to a separate assets host (measured 2026-08-24:
  # release-assets.githubusercontent.com) — the redirect target needs its own
  # egress allowance and never appears in the script text, so always probe
  # the effective URL, never just the named host
  local url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
  local code final
  code=$(curl -sSIL -o /dev/null -m 60 -w '%{http_code}' "$url" 2>/dev/null) || code=000
  code=${code:-000}
  final=$(curl -sSIL -o /dev/null -m 60 -w '%{url_effective}' "$url" 2>/dev/null || echo unknown)
  echo "HTTP ${code} via redirect chain ending at: ${final}"
  [ "$code" = "200" ]
}

echo "=== CLOUD ENVIRONMENT PREFLIGHT (read-only) ==="
probe "vantage point" probe_vantage
probe "repo discovery" probe_discovery
probe "session hook contract" probe_hook_contract
probe "git origin remotes (unshallow contact)" probe_git_origins
probe "session hook preflights (repo-declared hosts)" probe_session_hook_preflights
probe "node major resolution" probe_node_major
probe "nodejs.org index + SHASUMS + tarball" probe_nodejs_org
probe "registry.npmjs.org (corepack/pnpm)" probe_npm_registry
probe "keyserver.ubuntu.com (PPA key)" probe_keyserver
probe "ppa.launchpadcontent.net (git-core PPA)" probe_git_core_ppa
probe "base-image apt source hosts" probe_base_image_apt_sources
probe "gitleaks release asset (redirect chain)" probe_gitleaks_release

echo ""
echo "=== PREFLIGHT SUMMARY: $((PROBES - ${#FAILURES[@]}))/${PROBES} probes passed ==="
if [ ${#FAILURES[@]} -gt 0 ]; then
  for f in "${FAILURES[@]}"; do echo "FAILED ASSUMPTION: ${f}"; done
  exit 1
fi
echo "every external assumption the setup script makes holds from this vantage point"
