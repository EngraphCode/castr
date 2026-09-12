#!/bin/zsh
# Mechanical evidence for each open source PR head against origin/main.
# Usage: SCRATCH=<dir> ./pr-evidence.sh > pr-evidence.txt
set -u
R=$(git rev-parse --show-toplevel)
cd "$R"
typeset -A H
H=(81 codex/plan-estate-refresh 27 feat/explicit-additional-properties-rebased 26 fix/remediation-lk2-maybe-pretty 23 docs/resonance-practice-imports 21 fix/remediation-li-test-hygiene 20 fix/remediation-le-single-source-guards 18 fix/remediation-ld-security-and-names 17 fix/remediation-lh-endpoints-mcp-cli 16 fix/remediation-lf-json-schema-fidelity 15 fix/remediation-lkbatch-micro-fixes 13 fix/remediation-lc-zod-parser-whitelist 12 fix/remediation-lk1-capability-guards 11 fix/remediation-la-harness-test-truth)
for n in 11 12 13 15 16 17 18 20 21 23 26 27 81; do
  b=$H[$n]
  remote=$(gh pr view $n --json headRefOid -q .headRefOid)
  local_=$(git rev-parse $b)
  base=$(git merge-base origin/main $b)
  echo "################ PR #$n  branch=$b  local=${local_:0:8} remote=${remote:0:8} base=${base:0:8} commits=$(git rev-list --count $base..$b)"
  echo "--- commits"; git log --format='  %h %s' $base..$b
  echo "--- cherry (- = patch already on main)"; git cherry origin/main $b | awk '{print "  "$1" "substr($2,1,8)}' | sort | uniq -c | awk '{print "  "$2" x"$1}'
  echo "--- file fate (D=deleted on main, U=unchanged on main since base, C=changed on main since base, =head identical to main)"
  git diff --name-only $base $b | while read f; do
    if ! git cat-file -e origin/main:$f 2>/dev/null; then fate=D; else
      if git diff --quiet $base origin/main -- $f; then fate=U; else fate=C; fi
      if git diff --quiet $b origin/main -- $f 2>/dev/null; then fate="$fate="; fi
    fi
    echo "  $fate $f"
  done
  echo "--- merge-tree conflicts"
  out=$(git merge-tree --write-tree --name-only origin/main $b 2>&1); rc=$?
  echo "$out" | sed '1d' | sed '/^$/d' | sed 's/^/  /'; echo "  (rc=$rc)"
done
