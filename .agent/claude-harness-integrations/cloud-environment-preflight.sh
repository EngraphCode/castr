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
# Contract: read-only. Probes write nothing outside a private mktemp -d
# directory (removed on exit) and install nothing — fixed predictable
# temp names would be symlink-followable and violate the
# machine-local-path invariant. Every external host the setup script contacts has a probe here;
# adding a host to the setup script without adding its probe in the same
# commit is drift (cloud-environment.md § Validating and diagnosing).
set -uo pipefail # deliberately NOT -e: every probe must run to the summary
shopt -s nullglob

PF_TMP=$(mktemp -d) || exit 1
trap 'rm -rf "${PF_TMP}"' EXIT

# value-synced with cloud-environment-setup.sh (and castr's supply-chain
# single source, .claude/hooks/_lib/gitleaks-pin.env); bump all together
GITLEAKS_VERSION=8.30.0
GITLEAKS_SHA256_LINUX_X64=79a3ab579b53f71efd634f3aaf7e04a0fa0cf206b7ed434638d1547a2470a66e

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

# HTTP reachability with the measured egress discriminator (2026-08-24):
# a proxy denial fails the CONNECT tunnel itself, so curl EXITS NON-ZERO
# ("CONNECT tunnel failed, response 403", exit 56) — while an origin-served
# 403/404 completes the HTTP exchange and curl exits 0. Reachability is
# therefore judged by curl's exit status first; a completed exchange then
# still fails on 403/407/502 because every host_reachable target is a path
# the real setup fetches (a 403 there fails setup identically whoever
# served it). -L follows redirects — the probe invariant counts chains —
# and a failed curl still emits its own 000 via -w before exiting
# non-zero, so the status is captured first and normalised on failure,
# never appended to.
try_url() {
  # sets TRY_CODE; returns curl's own success/failure
  TRY_CODE=$(curl -sSL -o /dev/null -m 30 -w '%{http_code}' "$1" 2>/dev/null)
  local rc=$?
  TRY_CODE=${TRY_CODE:-000}
  return $rc
}
host_reachable() {
  local url="$1" display
  # display copy strips URL userinfo — an apt source or proxy URL can embed
  # credentials, and probe output lands on the persisted failure card
  display=$(echo "$url" | sed -E 's|([a-zA-Z][a-zA-Z0-9+.-]*://)?[^@/]*@|\1|')
  if try_url "$url" || {
    # one retry: a single transient transport failure must not falsify a
    # host (observed in-session 2026-08-24: one-off 000 from
    # security.ubuntu.com, 200 on every retry)
    try_url "$url"
  }; then
    echo "HTTP ${TRY_CODE}: ${display}"
    # only a final 2xx passes: every target here is a path the real setup
    # fetches with curl -f (or that apt must be able to consume), so any
    # HTTP error — 403 proxy or 404/500 origin alike — fails setup too
    case "$TRY_CODE" in
    2??) return 0 ;;
    *) return 1 ;;
    esac
  fi
  echo "TRANSPORT FAILURE (proxy CONNECT denial, DNS, or timeout; last code ${TRY_CODE}): ${display}"
  return 1
}

FIRST_REPO=""
NODE_MAJOR=""

probe_vantage() {
  # informational — records the vantage point so a pasted run's card shows
  # what the builder container actually is
  echo "user: $(id 2>/dev/null || echo unknown)"
  echo "pwd: $(pwd)"
  echo "PATH: ${PATH}"
  # URL userinfo is stripped — an authenticated proxy's credentials must
  # never reach the persisted failure card this output lands on
  redact_url() {
    test -n "${1:-}" || {
      echo "unset"
      return
    }
    # the scheme prefix is optional in proxy values (curl accepts
    # user:token@proxy:8080), so strip userinfo with or without one
    echo "$1" | sed -E 's|^([a-zA-Z][a-zA-Z0-9+.-]*://)?[^@/]*@|\1|'
  }
  # report the EFFECTIVE values under curl's precedence: lowercase wins,
  # and http_proxy exists only in lowercase — a card showing a variable
  # curl is not using would misidentify the network vantage
  echo "proxy (effective): https_proxy=$(redact_url "${https_proxy:-${HTTPS_PROXY:-}}") http_proxy=$(redact_url "${http_proxy:-}") all_proxy=$(redact_url "${all_proxy:-${ALL_PROXY:-}}") no_proxy=${no_proxy:-${NO_PROXY:-unset}}"
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
    # mirror the setup script's guard: it contacts origin only when the
    # clone is shallow, so probing a full clone's origin would falsify an
    # assumption setup never makes (and false-fail on an absent remote)
    if [ "$(git -C "$repo" rev-parse --is-shallow-repository 2>/dev/null)" != "true" ]; then
      echo "not shallow — setup contacts no origin here (skipped): ${repo}"
      continue
    fi
    # bounded and non-interactive: a hung remote or a credential helper
    # waiting for input must not stall the whole falsification pass
    if GIT_TERMINAL_PROMPT=0 timeout 30 git -C "$repo" ls-remote --heads origin >/dev/null 2>&1; then
      echo "origin reachable (shallow clone): ${repo}"
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
      # subshell rooted at the repo: the setup script cds into the repo
      # before invoking the session hook, so the hook-preflight twin gets
      # the same repo-root working-directory contract. Bounded like every
      # other probe — a hook preflight that hangs must become that repo's
      # failure, not swallow the summary (timeout exit 124 lands in the
      # FAILED branch)
      # the bound exceeds a hook's complete retry budget (two endpoints x
      # (30s attempt + 2s sleep + 30s retry) ~ 124s) plus margin, so a
      # slow-but-succeeding hook is never killed into a false failure
      elif (cd "$repo" && timeout --kill-after=10 180 ./.agent/setup/cloud-session-preflight.sh); then
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
  curl -fsSL -m 60 "https://nodejs.org/dist/latest-v${major}.x/SHASUMS256.txt" -o ${PF_TMP}/shasums.txt || {
    echo "SHASUMS256.txt fetch failed"
    return 1
  }
  grep -q " ${tgz}\$" ${PF_TMP}/shasums.txt || {
    echo "resolved tarball missing from SHASUMS256.txt"
    return 1
  }
  # download the archive and recompute its digest against the manifest —
  # the exact check setup performs (validators recompute, never just
  # record): a truncated or drifted archive must fail here, not only at
  # setup's sha256sum -c
  curl -fsSL -m 300 "https://nodejs.org/dist/latest-v${major}.x/${tgz}" -o ${PF_TMP}/node.tgz || {
    echo "tarball download failed"
    return 1
  }
  grep " ${tgz}\$" ${PF_TMP}/shasums.txt |
    sed "s|  ${tgz}\$|  ${PF_TMP}/node.tgz|" | sha256sum -c -
}

check_repo_pnpm_pin() {
  # one repo's packageManager pin, downloaded and digest-recomputed the
  # way `corepack install` would fetch it in that repo
  local repo="$1" pm version expected computed algo
  pm=$(grep -o '"packageManager"[: ]*"[^"]*"' "$repo/package.json" | sed -E 's/.*"packageManager"[: ]*"([^"]*)".*/\1/')
  test -n "$pm" || {
    echo "no packageManager pin in ${repo}/package.json"
    return 1
  }
  case "$pm" in
  pnpm@*) ;;
  *)
    echo "unexpected packageManager (not pnpm) in ${repo}: ${pm}"
    return 1
    ;;
  esac
  # identical pins across repos need verifying once, not re-downloading
  case " ${PNPM_PINS_SEEN} " in
  *" ${pm} "*)
    echo "pin already verified (${repo}): ${pm%%+*}"
    return 0
    ;;
  esac
  PNPM_PINS_SEEN="${PNPM_PINS_SEEN} ${pm}"
  version=${pm#pnpm@}
  version=${version%%+*}
  # mirror corepack's own request flow (corepack 0.34 source): auth is
  # COREPACK_NPM_TOKEN as Bearer, else COREPACK_NPM_USERNAME/PASSWORD as
  # Basic; a custom registry gets a metadata lookup whose dist.tarball is
  # followed, while the default path downloads the pinned spec URL directly
  local registry auth=() auth_kind=none meta tarball tarball_auth
  registry=${COREPACK_NPM_REGISTRY:-https://registry.npmjs.org}
  # corepack tests each variable's PRESENCE (`in process.env`), never
  # truthiness — an empty token still selects Bearer, and an empty
  # password is a valid Basic credential
  if [ "${COREPACK_NPM_TOKEN+set}" = set ]; then
    auth=(-H "Authorization: Bearer ${COREPACK_NPM_TOKEN}")
    auth_kind=bearer
  elif [ "${COREPACK_NPM_USERNAME+set}" = set ] && [ "${COREPACK_NPM_PASSWORD+set}" = set ]; then
    auth=(-u "${COREPACK_NPM_USERNAME}:${COREPACK_NPM_PASSWORD}")
    auth_kind=basic
  fi
  echo "pinned pnpm (${repo##*/}): ${version} (registry: $(echo "$registry" | sed -E 's|^([a-zA-Z][a-zA-Z0-9+.-]*://)?[^@/]*@|\1|'))"
  if [ -z "${COREPACK_NPM_REGISTRY:-}" ]; then
    tarball="https://registry.npmjs.org/pnpm/-/pnpm-${version}.tgz"
    echo "default registry: static tarball URL (corepack makes no metadata request here)"
  else
    meta=$(curl -fsSL -m 60 "${auth[@]}" "${registry%/}/pnpm/${version}") || {
      echo "registry metadata fetch failed (the request corepack install makes first)"
      return 1
    }
    # parse the response as JSON and take exactly dist.tarball — a regex
    # returns still-escaped text (\/) curl rejects, or an unrelated
    # tarball key. python3 and the image node both predate our toolchain
    # install; the textual fallback is last-resort and unescapes slashes
    if command -v python3 >/dev/null 2>&1; then
      tarball=$(echo "$meta" | python3 -c 'import json,sys; print(json.load(sys.stdin)["dist"]["tarball"])' 2>/dev/null)
    elif command -v node >/dev/null 2>&1; then
      tarball=$(echo "$meta" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).dist.tarball))' 2>/dev/null)
    else
      tarball=$(echo "$meta" | grep -oE '"tarball":[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"tarball":[[:space:]]*"([^"]+)".*/\1/' | sed 's|\\/|/|g')
    fi
    test -n "$tarball" || {
      echo "no dist.tarball URL in registry metadata"
      return 1
    }
  fi
  # display strips userinfo AND the query/fragment — a pre-signed tarball
  # URL can carry its credential in the query string
  echo "tarball: $(echo "${tarball%%[?#]*}" | sed -E 's|^([a-zA-Z][a-zA-Z0-9+.-]*://)?[^@/]*@|\1|')"
  # mirror corepack's download-auth rules exactly: Basic credentials go
  # on EVERY request (httpUtils.fetch applies username/password to all
  # input URLs), while the Bearer token is origin-scoped — added only
  # when the tarball origin equals the registry origin
  tarball_auth=()
  case "$auth_kind" in
  basic) tarball_auth=("${auth[@]}") ;;
  bearer)
    if [ "$(echo "$tarball" | sed -E 's|^(https?://[^/]+).*|\1|')" = "$(echo "$registry" | sed -E 's|^(https?://[^/]+).*|\1|')" ]; then
      tarball_auth=("${auth[@]}")
    fi
    ;;
  esac
  curl -fsSL -m 120 "${tarball_auth[@]}" "$tarball" -o "${PF_TMP}/pnpm.tgz" || {
    echo "pinned pnpm tarball download failed"
    return 1
  }
  case "$pm" in
  *+*.*)
    # corepack pins declare their algorithm (+<algo>.<hex>, the npm
    # dist.integrity digest re-encoded as hex) and its README's canonical
    # example is sha224 — dispatch on the declared algorithm, never
    # assume sha512
    algo=${pm#*+}
    algo=${algo%%.*}
    expected=${pm#*+"${algo}".}
    if command -v "${algo}sum" >/dev/null 2>&1; then
      computed=$("${algo}sum" "${PF_TMP}/pnpm.tgz" | cut -d' ' -f1)
    elif command -v openssl >/dev/null 2>&1; then
      computed=$(openssl dgst "-${algo}" -r "${PF_TMP}/pnpm.tgz" 2>/dev/null | cut -d' ' -f1)
    else
      echo "no tool available to compute a ${algo} digest — pin cannot be verified"
      return 1
    fi
    test -n "$computed" || {
      echo "computing the ${algo} digest failed (unsupported algorithm?)"
      return 1
    }
    if [ "$computed" = "$expected" ]; then
      echo "pnpm tarball ${algo} digest matches the packageManager pin"
    else
      echo "pnpm tarball ${algo} digest MISMATCH against the packageManager pin"
      return 1
    fi
    ;;
  *)
    echo "packageManager pin carries no digest — download verified reachable, digest not pinned"
    ;;
  esac
}

probe_npm_registry() {
  # setup runs `corepack install` in EVERY discovered Practice repo, so
  # every repo's pin is probed (validate the full target estate), and a
  # registry ping proves nothing about the path corepack install takes
  test -n "$FIRST_REPO" || {
    echo "skipped: no Practice repo"
    return 1
  }
  # corepack refuses all network access under COREPACK_ENABLE_NETWORK=0 —
  # on a fresh builder with an empty corepack cache, setup's
  # `corepack install` then aborts however reachable the tarball is
  if [ "${COREPACK_ENABLE_NETWORK:-1}" = "0" ]; then
    echo "COREPACK_ENABLE_NETWORK=0 is set: corepack install cannot download the pinned pnpm on a fresh builder"
    return 1
  fi
  PNPM_PINS_SEEN=""
  local repo failed=0
  for repo in $(find /home /workspace -maxdepth 4 -type d -name .git \
    -not -path '*/node_modules/*' 2>/dev/null | sed 's|/\.git$||'); do
    [ -f "$repo/pnpm-lock.yaml" ] && [ -f "$repo/.agent/directives/AGENT.md" ] || continue
    check_repo_pnpm_pin "$repo" || failed=1
  done
  return $failed
}

probe_keyserver() {
  curl -fsSL -m 60 "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xA1715D88E1DF1F24" \
    -o ${PF_TMP}/gitcore-key.asc || {
    echo "key fetch failed from keyserver.ubuntu.com"
    return 1
  }
  grep -q "BEGIN PGP PUBLIC KEY BLOCK" ${PF_TMP}/gitcore-key.asc || {
    echo "response is not a PGP public key block"
    return 1
  }
  echo "git-core PPA signing key fetched"
}

probe_git_core_ppa() {
  # fetch InRelease and verify its signature against the key the keyserver
  # probe fetched — setup relies on exactly that relationship (the key it
  # writes must verify the metadata apt then fetches), so two independent
  # payload checks would miss a rotated or revoked key
  curl -fsSL -m 60 "https://ppa.launchpadcontent.net/git-core/ppa/ubuntu/dists/noble/InRelease" \
    -o ${PF_TMP}/gitcore-inrelease || {
    echo "git-core PPA InRelease fetch failed"
    return 1
  }
  test -s ${PF_TMP}/gitcore-key.asc || {
    echo "signing key missing (keyserver probe runs first and must pass)"
    return 1
  }
  if command -v gpg >/dev/null 2>&1 && command -v gpgv >/dev/null 2>&1; then
    gpg --dearmor <${PF_TMP}/gitcore-key.asc >${PF_TMP}/gitcore-keyring.gpg 2>/dev/null || {
      echo "key dearmor failed"
      return 1
    }
    # gpgv exits non-zero when ANY of the file's signatures cannot be
    # checked, and Launchpad InRelease files carry a second signature from
    # a key apt does not need — apt accepts one good known signature, so
    # classify by that outcome, not by gpgv's exit status (measured
    # in-session 2026-08-24: "Good signature" printed with non-zero exit)
    local verify_out
    verify_out=$(gpgv --keyring ${PF_TMP}/gitcore-keyring.gpg ${PF_TMP}/gitcore-inrelease 2>&1) || true
    if echo "$verify_out" | grep -q "Good signature"; then
      echo "InRelease carries a good signature from the fetched key"
    else
      echo "InRelease has NO good signature from the fetched key (rotated or revoked?):"
      echo "$verify_out" | tail -3
      return 1
    fi
  else
    # an unavailable verifier is a failed probe, not a silent downgrade —
    # a clean summary must never claim a relationship it could not check
    echo "gpg/gpgv unavailable — the key-to-metadata relationship setup relies on cannot be verified"
    return 1
  fi
}

probe_base_image_apt_sources() {
  # the base image ships its own apt sources; one blocked host there breaks
  # every `apt-get update`, whatever this estate's script adds (worked
  # instance 2026-08-23: Trusted preset 403'd ppa.launchpadcontent.net)
  # parse only ACTIVE entries — `deb`/`deb-src` lines in one-line format and
  # URIs×Suites pairs in deb822 stanzas. A bare URL grep would also probe
  # hosts in comments (e.g. the stock sources file's help.ubuntu.com
  # pointer), which apt never contacts, and misattribute an unrelated block
  # to apt sources. Each pair probes the exact InRelease path `apt-get
  # update` fetches — roots and index pages are not what apt requests.
  local pairs pair url suite target failed=0
  pairs=$({
    awk '/^[[:space:]]*deb(-src)?[[:space:]]/ {
      for (i = 2; i <= NF; i++)
        if ($i ~ /^https?:\/\//) { print $i, $(i + 1); break }
    }' /etc/apt/sources.list /etc/apt/sources.list.d/*.list 2>/dev/null
    awk -v RS= '{
      uris = ""; suites = ""; enabled = ""; cur = ""
      n = split($0, lines, "\n")
      # deb822 field names are case-insensitive (apt accepts Uris:/URIS:),
      # so match on a lowercased copy and slice the value from the
      # original; an indented line is a folded continuation of the field
      # above it and its values count too
      for (i = 1; i <= n; i++) {
        if (lines[i] ~ /^[ \t]/ && cur != "") {
          val = lines[i]; sub(/^[ \t]+/, "", val)
          if (cur == "uris") uris = uris " " val
          else if (cur == "suites") suites = suites " " val
          continue
        }
        if (match(tolower(lines[i]), /^uris:[[:space:]]*/)) { uris = substr(lines[i], RLENGTH + 1); cur = "uris" }
        else if (match(tolower(lines[i]), /^suites:[[:space:]]*/)) { suites = substr(lines[i], RLENGTH + 1); cur = "suites" }
        else if (match(tolower(lines[i]), /^enabled:[[:space:]]*/)) { enabled = tolower(substr(lines[i], RLENGTH + 1)); cur = "" }
        else cur = ""
      }
      # a stanza with Enabled: no is ignored by apt — probing it would
      # falsify an assumption apt-get update never makes
      if (uris != "" && suites != "" && enabled !~ /^(no|false)/) {
        nu = split(uris, ua, " "); ns = split(suites, sa, " ")
        for (u = 1; u <= nu; u++)
          for (s = 1; s <= ns; s++) print ua[u], sa[s]
      }
    }' /etc/apt/sources.list.d/*.sources 2>/dev/null
  } | sort -u)
  test -n "$pairs" || {
    echo "no active apt source entries found on image (unexpected but not a network failure)"
    return 0
  }
  while read -r url suite; do
    [ -n "$url" ] && [ -n "$suite" ] || continue
    # an exact-path suite (trailing slash) gets no dists/ segment — apt
    # fetches <url>/<suite>InRelease for those, <url>/InRelease for "./"
    case "$suite" in
    ./) target="${url%/}" ;;
    */) target="${url%/}/${suite%/}" ;;
    *) target="${url%/}/dists/${suite}" ;;
    esac
    # apt falls back to Release + Release.gpg when a repository publishes
    # no InRelease — and rejects an unsigned Release, so the fallback is
    # usable only when BOTH fallback files answer
    # an unreachable source is reported but NEVER fatal here: apt-get
    # update exits 0 with a warning for an unreachable source, so failing
    # this probe would block session creation where the real setup
    # continues (the git-core PPA that setup itself adds keeps its own
    # fatal probe above)
    if ! host_reachable "${target}/InRelease"; then
      if host_reachable "${target}/Release" && host_reachable "${target}/Release.gpg"; then
        echo "no InRelease but signed Release (+ Release.gpg) present — apt's fallback succeeds here"
      else
        echo "WARNING: source unreachable — apt-get update warns and continues; not fatal to setup"
      fi
    fi
  done <<< "$pairs"
  return 0
}

probe_gitleaks_release() {
  # release assets redirect to a separate assets host (measured 2026-08-24:
  # release-assets.githubusercontent.com) — the redirect target needs its own
  # egress allowance and never appears in the script text, so always probe
  # the effective URL, never just the named host. The asset is downloaded in
  # full and its digest recomputed against the pin (validators must
  # recompute, not just record): a reachable URL carrying a drifted payload
  # or a stale pin would otherwise pass here and fail setup at sha256sum -c
  local url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
  local final
  final=$(curl -fsSL -m 120 -w '%{url_effective}' "$url" -o ${PF_TMP}/gitleaks.tgz 2>/dev/null) || {
    echo "download failed (redirect chain or egress): ${url}"
    return 1
  }
  echo "redirect chain ends at host: $(echo "$final" | sed -E 's|https?://([^/]+).*|\1|')"
  echo "${GITLEAKS_SHA256_LINUX_X64}  ${PF_TMP}/gitleaks.tgz" | sha256sum -c -
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
