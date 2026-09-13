#!/usr/bin/env bash
# Mechanical evidence for each open source PR head against the measured main revision.
# Usage: [BASE=<sha>] ./pr-evidence.sh > pr-evidence.txt
# BASE defaults to the revision the 12 September measurement used.
set -euo pipefail
R=$(git rev-parse --show-toplevel)
cd "$R"
BASE=${BASE:-21e232295426ac104dc1ff47b2d7543858abf4bf}

branch_for() {
  case "$1" in
    11) echo fix/remediation-la-harness-test-truth ;;
    12) echo fix/remediation-lk1-capability-guards ;;
    13) echo fix/remediation-lc-zod-parser-whitelist ;;
    15) echo fix/remediation-lkbatch-micro-fixes ;;
    16) echo fix/remediation-lf-json-schema-fidelity ;;
    17) echo fix/remediation-lh-endpoints-mcp-cli ;;
    18) echo fix/remediation-ld-security-and-names ;;
    20) echo fix/remediation-le-single-source-guards ;;
    21) echo fix/remediation-li-test-hygiene ;;
    23) echo docs/resonance-practice-imports ;;
    26) echo fix/remediation-lk2-maybe-pretty ;;
    27) echo feat/explicit-additional-properties-rebased ;;
    81) echo codex/plan-estate-refresh ;;
    *) echo "unknown PR $1" >&2; return 1 ;;
  esac
}

for n in 11 12 13 15 16 17 18 20 21 23 26 27 81; do
  b=$(branch_for "$n")
  remote=$(gh pr view "$n" --json headRefOid -q .headRefOid)
  local_=$(git rev-parse "$b")
  base=$(git merge-base "$BASE" "$b")
  echo "################ PR #$n  branch=$b  local=${local_:0:8} remote=${remote:0:8} base=${base:0:8} commits=$(git rev-list --count "$base".."$b")"
  echo "--- commits"; git log --format='  %h %s' "$base".."$b"
  echo "--- cherry (- = patch already on main)"
  git cherry "$BASE" "$b" | awk '{print "  "$1" "substr($2,1,8)}' | sort | uniq -c | awk '{print "  "$2" x"$1}'
  echo "--- file fate (D=absent on main, U=unchanged on main since base, C=changed on main since base, =head identical to main)"
  while IFS= read -r f; do
    if ! git cat-file -e "$BASE:$f" 2>/dev/null; then
      fate=D
    else
      if git diff --quiet "$base" "$BASE" -- "$f"; then fate=U; else fate=C; fi
      if git diff --quiet "$b" "$BASE" -- "$f" 2>/dev/null; then fate="$fate="; fi
    fi
    echo "  $fate $f"
  done < <(git diff --name-only "$base" "$b")
  echo "--- merge-tree conflicts"
  rc=0
  out=$(git merge-tree --write-tree --name-only "$BASE" "$b" 2>&1) || rc=$?
  echo "$out" | sed '1d' | sed '/^$/d' | sed 's/^/  /'
  echo "  (rc=$rc)"
done
