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
# - Universal toolchain first; then every Practice repo present in the
#   session is discovered (never assumed) and set up via `pnpm install` plus
#   the repo's own committed hook at .agent/setup/cloud-session-setup.sh.
# - One Practice repo per session (owner ruling 2026-08-23); the discovery
#   loop tolerates more.
set -euo pipefail
shopt -s nullglob

# ---------- universal toolchain: every Practice repo, every session ----------

# Node 24 (Practice repos declare engines 24.x) — resolved dynamically
NODE_TGZ=$(curl -fsSL https://nodejs.org/dist/latest-v24.x/ | grep -o 'node-v24[0-9.]*-linux-x64.tar.gz' | head -1)
test -n "$NODE_TGZ"
curl -fsSL "https://nodejs.org/dist/latest-v24.x/${NODE_TGZ}" | tar xz -C /usr/local --strip-components=1

# pnpm into /usr/local/bin — a trusted location for repo spawn checks
/usr/local/bin/npm install -g --prefix /usr/local pnpm@11

# whatever /opt/nodeXX the image ships shadows /usr/local/bin in PATH
for d in /opt/node*/bin; do
  for b in node npm npx corepack pnpm; do
    ln -sf "/usr/local/bin/$b" "$d/$b"
  done
done

# git >= 2.45 from the git-core PPA (manual sources — add-apt-repository's
# python apt_pkg binding is broken on this image)
curl -fsSL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xA1715D88E1DF1F24" \
  -o /etc/apt/trusted.gpg.d/git-core-ppa.asc
echo "deb https://ppa.launchpadcontent.net/git-core/ppa/ubuntu noble main" \
  > /etc/apt/sources.list.d/git-core-ppa.list
apt-get update -qq
apt-get install -y -qq git
git --version

# gitleaks for pre-push secret scans (repo configs want >= 8.30.0)
curl -fsSL https://github.com/gitleaks/gitleaks/releases/download/v8.30.0/gitleaks_8.30.0_linux_x64.tar.gz \
  -o /tmp/gitleaks.tgz
tar xzf /tmp/gitleaks.tgz -C /usr/local/bin gitleaks
gitleaks version

# ---------- Practice repo setup: discovered, never assumed ----------
REPOS=$(find /home /workspace -maxdepth 4 -type d -name .git \
  -not -path '*/node_modules/*' 2>/dev/null | sed 's|/\.git$||')
test -n "$REPOS"

for repo in $REPOS; do
  # Practice repos are pnpm workspaces; anything else (plugin caches, stray
  # clones) is skipped deliberately
  if [ ! -f "$repo/pnpm-lock.yaml" ]; then
    continue
  fi
  cd "$repo"
  name=$(basename "$repo")
  echo "setting up Practice repo: $name"

  # full history: validators read pinned baseline commits shallow clones lack
  if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
    git fetch --unshallow origin
  fi

  pnpm install

  # common-ability extension point: a Practice repo needing more than
  # install commits its own hook; this script stays repo-agnostic
  if [ -x .agent/setup/cloud-session-setup.sh ]; then
    ./.agent/setup/cloud-session-setup.sh
  fi
done
