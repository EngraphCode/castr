#!/usr/bin/env bash
# Mechanical evidence for each open source PR head against the measured main revision.
# Usage: [BASE=<sha>] ./pr-evidence.sh > pr-evidence.txt
# BASE defaults to the revision the 12 September measurement used. Each PR is measured
# at the head SHA recorded on 12 September, so a rerun measures the same objects; the
# local branch and the live GitHub head are reported only as drift indicators.
set -euo pipefail
R=$(git rev-parse --show-toplevel)
cd "$R"
BASE=${BASE:-21e232295426ac104dc1ff47b2d7543858abf4bf}

# PR number -> "<local branch> <recorded head SHA>"
pinned_for() {
  case "$1" in
    11) echo "fix/remediation-la-harness-test-truth 64feef9e32ff8c3b8568e13645388aabd42b16d1" ;;
    12) echo "fix/remediation-lk1-capability-guards 7f4d23d6b3c2d6ed0a613841bb661c0f4c82a558" ;;
    13) echo "fix/remediation-lc-zod-parser-whitelist a18d2943eca07b075405b66295b1343f85a9d1f3" ;;
    15) echo "fix/remediation-lkbatch-micro-fixes 529a7a707daa1c61c6460a53fbbd57783e0590bc" ;;
    16) echo "fix/remediation-lf-json-schema-fidelity f94065e4b8465094eb95c60de8d9e1056433d641" ;;
    17) echo "fix/remediation-lh-endpoints-mcp-cli de4abf4d6ebc848b6b0d016db0b37edad1e3537e" ;;
    18) echo "fix/remediation-ld-security-and-names 9c93ccaaa888fb07f77a2b16a8d245f355e936fd" ;;
    20) echo "fix/remediation-le-single-source-guards 9e29c4dfb467a99dcef55cc5e2398f4bd6641944" ;;
    21) echo "fix/remediation-li-test-hygiene 4a869f988c02b1668f282362b32b67a517713e1a" ;;
    23) echo "docs/resonance-practice-imports 5fa82e88cc6e818b7b8f692627011f98b833ec96" ;;
    26) echo "fix/remediation-lk2-maybe-pretty dc9adddf9377cbc1f08348ae678b192dc0593600" ;;
    27) echo "feat/explicit-additional-properties-rebased a48eced8868bb6900a7b33cf1eb305ed3d8f4111" ;;
    81) echo "codex/plan-estate-refresh 33be633862864ce8efb22e70abbbe9bce863c510" ;;
    *) echo "unknown PR $1" >&2; return 1 ;;
  esac
}

for n in 11 12 13 15 16 17 18 20 21 23 26 27 81; do
  read -r b head <<< "$(pinned_for "$n")"
  git cat-file -e "$head^{commit}" || { echo "PR #$n: pinned head $head is not in this repository (fetch it first: git fetch origin refs/pull/$n/head)" >&2; exit 1; }
  # The pinned computation needs only the pinned objects. The live GitHub head and the
  # local branch are drift indicators and are reported as unavailable when absent.
  live=$(gh pr view "$n" --json headRefOid -q .headRefOid 2>/dev/null) || live=unavailable
  local_=$(git rev-parse -q --verify "$b" 2>/dev/null) || local_=absent
  base=$(git merge-base "$BASE" "$head")
  echo "################ PR #$n  branch=$b  head=${head:0:8} local=${local_:0:8} live=${live:0:8} base=${base:0:8} commits=$(git rev-list --count "$base".."$head")"
  if [[ "$live" == unavailable ]]; then echo "  live GitHub head unavailable (no gh access); drift against GitHub not measured"; elif [[ "$live" != "$head" ]]; then echo "  DRIFT: live GitHub head differs from the pinned head"; fi
  if [[ "$local_" == absent ]]; then echo "  local branch $b absent; drift against the local branch not measured"; elif [[ "$local_" != "$head" ]]; then echo "  DRIFT: local branch differs from the pinned head"; fi
  echo "--- commits"; git log --format='  %h %s' "$base".."$head"
  echo "--- cherry (- = patch already on main)"
  git cherry "$BASE" "$head" | awk '{print "  "$1" "substr($2,1,8)}' | sort | uniq -c | awk '{print "  "$2" x"$1}'
  echo "--- file fate (D=absent on main, U=unchanged on main since base, C=changed on main since base, =head identical to main)"
  while IFS= read -r f; do
    if ! git cat-file -e "$BASE:$f" 2>/dev/null; then
      fate=D
    else
      if git diff --quiet "$base" "$BASE" -- "$f"; then fate=U; else fate=C; fi
      if git diff --quiet "$head" "$BASE" -- "$f" 2>/dev/null; then fate="$fate="; fi
    fi
    echo "  $fate $f"
  done < <(git diff --name-only "$base" "$head")
  echo "--- merge-tree conflicts"
  rc=0
  out=$(git merge-tree --write-tree --name-only "$BASE" "$head" 2>&1) || rc=$?
  # The result-tree OID is dropped: for containers touching memory files it depends on
  # the semantic-merge driver build, so only the conflict list and messages are evidence.
  echo "$out" | grep -Ev '^[0-9a-f]{40}$' | sed '/^$/d' | sed 's/^/  /' || true
  echo "  (rc=$rc)"
done
