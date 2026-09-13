#!/usr/bin/env bash
# Apply one source PR's lib/ diff to a disposable copy of the measured main revision
# and run its own tests plus tsc. Proves self-consistency on that main only, never a
# doctrine gap. Exits non-zero if the apply, any test run, or the type-check fails.
# Usage: [BASE=<sha>] [SCRATCH=<dir>] ./verify-pr.sh <label> <merge-base-sha> <branch>
set -uo pipefail
R=$(git rev-parse --show-toplevel)
BASE=${BASE:-21e232295426ac104dc1ff47b2d7543858abf4bf}
S=${SCRATCH:-$(mktemp -d)}
label=$1; base=$2; br=$3
V=$S/v-$label; log=$S/verify-$label.txt
failures=0

git -C "$R" worktree add --detach -q "$V" "$BASE"
if ! (cd "$V" && pnpm install --frozen-lockfile --offline >/dev/null 2>&1); then
  echo "install failed in $V" >&2
  exit 1
fi

run_vitest() {
  # $1 label, $2 config flag or empty, remaining: test files
  local name=$1 cfg=$2; shift 2
  echo "--- $name tests: $*"
  local rc=0
  # shellcheck disable=SC2086 # cfg is intentionally word-split (empty or "--config file")
  pnpm exec vitest run $cfg --reporter=dot "$@" > "$S/$label.$name.out" 2>&1 || rc=$?
  grep -E 'Test Files|Tests |FAIL|Error:' "$S/$label.$name.out" | head -12
  if [[ $rc -ne 0 ]]; then echo "$name tests FAILED rc=$rc"; failures=$((failures + 1)); fi
}

{
  echo "===== $label base=$base branch=$br main=$BASE $(date '+%H:%M:%S')"
  git -C "$R" diff --binary "$base" "$br" -- lib ':!lib/tests-snapshot/integration/__snapshots__' > "$S/$label.patch"
  echo "patch: $(grep -c '^diff --git' "$S/$label.patch") files"
  rc=0
  git -C "$V" apply --3way --index "$S/$label.patch" > "$S/$label.apply.log" 2>&1 || rc=$?
  echo "apply rc=$rc; conflicted files: $(git -C "$V" diff --name-only --diff-filter=U | tr '\n' ' ')"
  if [[ $rc -ne 0 ]]; then failures=$((failures + 1)); fi
  tests=$(git -C "$V" diff --name-only --cached | grep '\.test\.ts$' | grep -v 'tests-snapshot\|tests-transforms\|tests-e2e' | sed 's#^lib/##' | tr '\n' ' ' || true)
  tt=$(git -C "$V" diff --name-only --cached | grep 'tests-transforms/.*\.test\.ts$' | sed 's#^lib/##' | tr '\n' ' ' || true)
  ts=$(git -C "$V" diff --name-only --cached | grep 'tests-snapshot/.*\.test\.ts$' | sed 's#^lib/##' | tr '\n' ' ' || true)
  cd "$V/lib"
  # shellcheck disable=SC2086 # the lists are intentionally word-split into file arguments
  if [[ -n "$tests" ]]; then run_vitest unit "" $tests; fi
  # shellcheck disable=SC2086
  if [[ -n "$tt" ]]; then run_vitest transforms "--config vitest.transforms.config.ts" $tt; fi
  # shellcheck disable=SC2086
  if [[ -n "$ts" ]]; then run_vitest snapshot "--config vitest.snapshot.config.ts" $ts; fi
  echo "--- type-check"
  rc=0
  pnpm exec tsc --noEmit --project tsconfig.lint.json > "$S/$label.tsc.log" 2>&1 || rc=$?
  errors=$(sed 's/\x1b\[[0-9;]*m//g' "$S/$label.tsc.log" | grep -c 'error TS' || true)
  echo "type-check rc=$rc errors=$errors"
  sed 's/\x1b\[[0-9;]*m//g' "$S/$label.tsc.log" | head -6
  if [[ $rc -ne 0 ]]; then failures=$((failures + 1)); fi
  echo "===== done $(date '+%H:%M:%S') failures=$failures"
} 2>&1 | tee "$log"

exit "$failures"
