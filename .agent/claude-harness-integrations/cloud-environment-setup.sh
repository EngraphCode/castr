#!/bin/bash
# Claude cloud environment setup script — REFERENCE COPY.
#
# The live copy runs from the claude.ai cloud-environment configuration
# ("Practice Repos" environment -> Setup script). This file is the source of
# truth: edit here first, then paste the whole script into the environment
# dialog. Environment changes apply to NEW sessions only, and the environment
# cache re-runs the script when the script or allowed-domain list changes.
#
# Contract (see cloud-environment.md alongside this file):
# - Fail-fast: any failure exits non-zero and session creation fails loudly.
# - Runtime versions are single-sourced from the carried repo: the Node major
#   comes from its engines declaration and pnpm comes from its packageManager
#   pin via Corepack — this script names no version either repo declares.
# - Every Practice repo present in the session is discovered (never assumed)
#   and set up via `pnpm install`, `pnpm build`, and the repo's committed hook at
#   .agent/setup/cloud-session-setup.sh.
# - One Practice repo per session (owner ruling 2026-08-23); the discovery
#   loop tolerates more.
set -euo pipefail
set -E
shopt -s nullglob
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Instrumentation: the environment builder is the only true fresh-container
# test bench, and its failure card is the only observable output — so the
# script must narrate its own progress and name its own point of death.
# Diagnosis protocol and the read-only preflight probe live alongside this
# file (cloud-environment-preflight.sh, cloud-environment.md § Validating
# and diagnosing).
PHASE="init"
phase() {
  PHASE="$1"
  echo ""
  echo "=== PHASE: ${PHASE} ==="
}
trap 'echo "SETUP FAILED in phase \"${PHASE}\" at line ${LINENO}: ${BASH_COMMAND}" >&2' ERR
# explicit failures route through fail(), never a bare `exit 1` — the ERR
# trap does not fire on `exit`, and every non-zero exit must be instrumented
fail() {
  echo "ERROR: $*" >&2
  return 1
}

# gitleaks pin — value-synced with castr's supply-chain single source
# (.claude/hooks/_lib/gitleaks-pin.env there); bump both together.
GITLEAKS_VERSION=8.30.0
GITLEAKS_SHA256_LINUX_X64=79a3ab579b53f71efd634f3aaf7e04a0fa0cf206b7ed434638d1547a2470a66e

# ---------- discovery first: the carried repo declares the toolchain ----------
phase "repo discovery"
REPOS=$(find /home /workspace -maxdepth 4 -type d -name .git \
  -not -path '*/node_modules/*' 2>/dev/null | sed 's|/\.git$||')
FIRST_REPO=""
for repo in $REPOS; do
  # A Practice repo is identified by its committed Practice substrate plus a
  # pnpm workspace — a lockfile alone is not identity (a plugin cache or
  # stray clone with a pnpm-lock.yaml must not be provisioned or mutated)
  if [ -f "$repo/pnpm-lock.yaml" ] && [ -f "$repo/.agent/directives/AGENT.md" ]; then
    FIRST_REPO="$repo"
    break
  fi
done
test -n "$FIRST_REPO"

# Node major from the carried repo's engines declaration (single-source per
# the repos' runtime-version doctrine); the explicit default only covers a
# repo that declares no engines field
NODE_MAJOR=$(grep -o '"node"[: ]*"[^"]*"' "$FIRST_REPO/package.json" | grep -o '[0-9][0-9]*' | head -1 || true)
NODE_MAJOR=${NODE_MAJOR:-24}
echo "node major from ${FIRST_REPO}/package.json engines: ${NODE_MAJOR}"

# ---------- universal toolchain ----------

phase "node install (nodejs.org)"
# Node — latest release of the repo-declared major, checksum-verified
# against the release's published SHASUMS256 manifest before extraction.
# Same-channel manifest, so this proves transfer integrity (no truncated or
# corrupted archive extracts into /usr/local as root), not payload
# authenticity — a pinned digest would reintroduce the hard-coded version
# this script deliberately avoids.
NODE_TGZ=$(curl -fsSL "https://nodejs.org/dist/latest-v${NODE_MAJOR}.x/" | grep -o "node-v${NODE_MAJOR}[0-9.]*-linux-x64.tar.gz" | head -1)
test -n "$NODE_TGZ"
curl -fsSL "https://nodejs.org/dist/latest-v${NODE_MAJOR}.x/${NODE_TGZ}" -o /tmp/node.tgz
curl -fsSL "https://nodejs.org/dist/latest-v${NODE_MAJOR}.x/SHASUMS256.txt" \
  | grep " ${NODE_TGZ}\$" | sed "s|  ${NODE_TGZ}\$|  /tmp/node.tgz|" | sha256sum -c -
tar xzf /tmp/node.tgz -C /usr/local --strip-components=1

phase "corepack pnpm shims"
# pnpm via Corepack shims in /usr/local/bin (a trusted location for repo
# spawn checks): each repo's packageManager pin selects and verifies its own
# pnpm version — this script pins nothing
/usr/local/bin/corepack enable --install-directory /usr/local/bin pnpm

# whatever /opt/nodeXX the image ships shadows /usr/local/bin in PATH
for d in /opt/node*/bin; do
  for b in node npm npx corepack pnpm; do
    ln -sf "/usr/local/bin/$b" "$d/$b"
  done
done

phase "git from git-core PPA (keyserver.ubuntu.com, ppa.launchpadcontent.net)"
# git >= 2.45 from the git-core PPA (manual sources — add-apt-repository's
# python apt_pkg binding is broken on this image)
curl -fsSL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xA1715D88E1DF1F24" \
  -o /etc/apt/trusted.gpg.d/git-core-ppa.asc
echo "deb https://ppa.launchpadcontent.net/git-core/ppa/ubuntu noble main" \
  > /etc/apt/sources.list.d/git-core-ppa.list
apt-get update -qq
apt-get install -y -qq git
git --version

phase "gitleaks (github.com release asset)"
# gitleaks for pre-push secret scans — checksum-verified before install
curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" \
  -o /tmp/gitleaks.tgz
echo "${GITLEAKS_SHA256_LINUX_X64}  /tmp/gitleaks.tgz" | sha256sum -c -
tar xzf /tmp/gitleaks.tgz -C /usr/local/bin gitleaks
gitleaks version

# ---------- per-repo setup ----------
for repo in $REPOS; do
  if [ ! -f "$repo/pnpm-lock.yaml" ] || [ ! -f "$repo/.agent/directives/AGENT.md" ]; then
    continue
  fi
  name=$(basename "$repo")
  phase "repo setup: ${name}"
  cd "$repo"

  # full history: validators read pinned baseline commits shallow clones lack
  if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
    git fetch --unshallow origin
  fi

  # pre-cache the repo's pinned pnpm so no later shell hits a download
  corepack install
  pnpm install

  # the fresh-checkout contract is install AND build: repo tooling (eslint
  # workspace plugin, validators, hook guards) resolves from untracked
  # dist/ outputs, so an unbuilt checkout is a half-usable session. The
  # environment cache means this cost is paid on cache rebuilds, not on
  # every session start.
  pnpm build

  # common-ability extension point: a Practice repo needing more than
  # install commits its own hook. Absence is the only benign skip — a hook
  # that exists but is not executable is a broken contract, not a no-op.
  if [ -e .agent/setup/cloud-session-setup.sh ]; then
    if [ ! -x .agent/setup/cloud-session-setup.sh ]; then
      fail "${name}/.agent/setup/cloud-session-setup.sh exists but is not executable"
    fi
    ./.agent/setup/cloud-session-setup.sh
  fi
done

phase "complete"
echo "environment setup finished cleanly"
