#!/usr/bin/env bash
# SessionStart provisioning: ensure the pinned gitleaks binary is available so
# the blocking pre-commit chain (pnpm secrets:scan) passes unattended in fresh
# containers (proof-programme Q-01; ADR-051 clause 1 evidence line).
#
# Contract:
# - Fast path (correct binary already resolvable): print NOTHING, exit 0.
# - Provisioning path: download the content-pinned release asset, verify its
#   sha256 BEFORE extraction, install atomically, re-verify through PATH.
# - Any failure: print a loud warning to STDOUT (SessionStart stdout is
#   injected as agent-visible context) and exit 0 — SessionStart must never
#   block a session; pnpm secrets:scan fails loudly later if gitleaks is
#   genuinely unusable. log-hook-errors.sh (the wrapper) captures crashes.
# - Never sudo. Never downgrade a newer binary (warn instead): the pin is the
#   floor for unattended containers; a deliberately newer dev install is a
#   human's choice, and CI enforces parity where it matters.
set -u

warn() { printf 'ensure-gitleaks WARNING: %s\n' "$1"; }

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pin_file="${script_dir}/_lib/gitleaks-pin.env"
if [ ! -f "$pin_file" ]; then
  warn "pin file missing at .claude/hooks/_lib/gitleaks-pin.env; cannot provision gitleaks"
  exit 0
fi
# shellcheck source=/dev/null
. "$pin_file"

# Cross-check the .gitleaks.toml minVersion against the pin (drift is silent
# by construction: gitleaks treats minVersion as a warning, not an error).
repo_root="$(cd "${script_dir}/../.." && pwd)"
if [ -f "${repo_root}/.gitleaks.toml" ]; then
  toml_min="$(sed -n 's/^minVersion = "\(.*\)"$/\1/p' "${repo_root}/.gitleaks.toml" | head -1)"
  if [ -n "$toml_min" ] && [ "$toml_min" != "$GITLEAKS_VERSION" ]; then
    warn ".gitleaks.toml minVersion (${toml_min}) != pinned GITLEAKS_VERSION (${GITLEAKS_VERSION}) — reconcile the pin sources"
  fi
fi

# Visibility check for the other measured fresh-container gap: unbuilt
# PreToolUse guards fail OPEN (tool calls run unguarded). Cheap presence
# probe only; building belongs to grounding, not SessionStart.
if [ ! -f "${repo_root}/agent-tools/dist/src/hook-policy/check-blocked-patterns.js" ]; then
  warn "agent-tools/dist hook-policy guards are NOT BUILT — PreToolUse guards fail open. Run: pnpm install && pnpm --filter @engraph/agent-tools build"
fi

# Version compare: returns 0 when $1 >= $2 (dotted numerics).
version_ge() {
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -1)" = "$2" ]
}

current_version=""
if command -v gitleaks >/dev/null 2>&1; then
  current_version="$(gitleaks version 2>/dev/null | tr -d '[:space:]')"
fi

if [ -n "$current_version" ]; then
  if [ "$current_version" = "$GITLEAKS_VERSION" ]; then
    exit 0
  fi
  if version_ge "$current_version" "$GITLEAKS_VERSION"; then
    warn "gitleaks ${current_version} on PATH is newer than the pin (${GITLEAKS_VERSION}); leaving it in place — CI runs the pinned binary, so recheck on any scan divergence"
    exit 0
  fi
  # Older than the pin: gitleaks only WARNS on minVersion and scans anyway,
  # so a stale binary passes silently with wrong config semantics. Upgrade
  # in place (the resolved dir, so no earlier-PATH shadow survives).
  install_dir="$(dirname "$(command -v gitleaks)")"
else
  install_dir="/usr/local/bin"
fi

os="$(uname -s)"
arch="$(uname -m)"
if [ "$os" != "Linux" ] || [ "$arch" != "x86_64" ]; then
  warn "no content pin for ${os}/${arch} (pin covers linux/x86_64 only); install gitleaks ${GITLEAKS_VERSION}+ manually"
  exit 0
fi

if [ ! -d "$install_dir" ] || [ ! -w "$install_dir" ]; then
  install_dir="/usr/local/bin"
fi
if [ ! -w "$install_dir" ]; then
  install_dir="${HOME}/.local/bin"
  mkdir -p "$install_dir" 2>/dev/null || {
    warn "no writable install directory (tried the resolved dir, /usr/local/bin, and \${HOME}/.local/bin)"
    exit 0
  }
fi

tmp_dir="$(mktemp -d)" || { warn "mktemp failed"; exit 0; }
trap 'rm -rf "$tmp_dir"' EXIT

asset="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${asset}"
if ! curl -sSfL --connect-timeout 10 --max-time 40 -o "${tmp_dir}/${asset}" "$url"; then
  warn "download failed for ${url}; pre-commit secrets:scan will fail until gitleaks ${GITLEAKS_VERSION} is installed"
  exit 0
fi
if ! printf '%s  %s\n' "$GITLEAKS_SHA256_LINUX_X64" "${tmp_dir}/${asset}" | sha256sum -c - >/dev/null 2>&1; then
  warn "sha256 verification FAILED for ${asset} — refusing to install; investigate before trusting the download path"
  exit 0
fi
if ! tar -xzf "${tmp_dir}/${asset}" -C "$tmp_dir" gitleaks; then
  warn "extraction failed for ${asset}"
  exit 0
fi
if ! install -m 0755 "${tmp_dir}/gitleaks" "${install_dir}/gitleaks" 2>/dev/null; then
  warn "install to ${install_dir} failed"
  exit 0
fi

resolved_version="$(gitleaks version 2>/dev/null | tr -d '[:space:]')"
if [ "$resolved_version" != "$GITLEAKS_VERSION" ]; then
  warn "installed ${GITLEAKS_VERSION} to ${install_dir} but PATH resolves gitleaks ${resolved_version:-<none>} — a shadowing binary earlier on PATH is still in effect"
  exit 0
fi

printf 'ensure-gitleaks: installed pinned gitleaks %s to %s\n' "$GITLEAKS_VERSION" "$install_dir"
exit 0
