#!/usr/bin/env bash
# Apply one source PR's lib/ diff to a disposable copy of the measured main revision
# and run its own tests plus tsc. Proves self-consistency on that main only, never a
# doctrine gap. Exits non-zero if the apply, any test run, or the type-check fails.
# Usage: [BASE=<sha>] [SCRATCH=<dir>] ./verify-pr.sh <label> <merge-base-sha> <head-sha>
# Pass the PR's recorded head SHA, not a branch name, so a rerun measures the same object.
set -uo pipefail
R=$(git rev-parse --show-toplevel)
BASE=${BASE:-21e232295426ac104dc1ff47b2d7543858abf4bf}
S=${SCRATCH:-$(mktemp -d)}
label=$1; base=$2; head=$3
V=$S/v-$label; log=$S/verify-$label.txt
failures=0

# Both revisions must be present as objects before anything is created or diffed: the
# PR heads are unmerged pull-request commits that a fresh clone does not carry.
for rev in "$base" "$head"; do
  if ! git -C "$R" cat-file -e "$rev^{commit}" 2>/dev/null; then
    echo "revision $rev is not in this repository (fetch the PR head first: git fetch origin refs/pull/<n>/head)" >&2
    exit 1
  fi
done

# Every exit path re-arms the semantic-merge driver from the primary checkout, because
# the disposable worktree's install writes its own path into the shared .git/config
# (bootstrap defect, recorded in the plan). A failed re-arm is itself a failure.
# shellcheck disable=SC2329 # invoked from the EXIT trap below
rearm() {
  if ! (cd "$R" && pnpm run postinstall >/dev/null 2>&1); then
    echo "re-arm of the merge driver failed in $R" >&2
    return 1
  fi
}
trap 'rc=$?; rearm || exit 1; exit $rc' EXIT

if [[ -e "$V" ]]; then
  echo "refusing to reuse existing destination $V" >&2
  exit 1
fi
if ! git -C "$R" worktree add --detach -q "$V" "$BASE"; then
  echo "worktree add failed for $V" >&2
  exit 1
fi
if [[ "$(git -C "$V" rev-parse HEAD)" != "$BASE" || -n "$(git -C "$V" status --porcelain)" ]]; then
  echo "worktree $V is not a clean checkout of $BASE" >&2
  exit 1
fi
if ! (cd "$V" && pnpm install --frozen-lockfile --offline >/dev/null 2>&1); then
  echo "install failed in $V" >&2
  exit 1
fi

run_vitest() {
  # $1 label, $2 config flag or empty, remaining: test files
  local name=$1 cfg=$2; shift 2
  local out=$S/$label.$name.out
  echo "--- $name tests: $*"
  local rc=0
  # shellcheck disable=SC2086 # cfg is intentionally word-split (empty or "--config file")
  pnpm exec vitest run $cfg --reporter=dot "$@" > "$out" 2>&1 || rc=$?
  # The summary is kept whole; the diagnostics are truncated separately.
  grep -E 'Test Files|Tests ' "$out" || echo "no vitest summary in $out"
  grep -E 'FAIL|Error:' "$out" | head -10
  if [[ $rc -ne 0 ]]; then echo "$name tests FAILED rc=$rc"; failures=$((failures + 1)); fi
}

# Plain redirection keeps this group in the current shell, so the failure count reaches
# the exit status; a pipeline into tee would run it in a subshell and always exit 0.
{
  echo "===== $label base=$base head=${head:0:8} main=${BASE:0:8} $(date '+%H:%M:%S')"
  rc=0
  git -C "$R" diff --binary "$base" "$head" -- lib ':!lib/tests-snapshot/integration/__snapshots__' > "$S/$label.patch" || rc=$?
  if [[ $rc -ne 0 ]]; then echo "patch generation FAILED rc=$rc"; failures=$((failures + 1)); fi
  echo "patch: $(grep -c '^diff --git' "$S/$label.patch") files"
  rc=0
  git -C "$V" apply --3way --index "$S/$label.patch" > "$S/$label.apply.log" 2>&1 || rc=$?
  echo "apply rc=$rc; conflicted files: $(git -C "$V" diff --name-only --diff-filter=U | tr '\n' ' ')"
  if [[ $rc -ne 0 ]]; then failures=$((failures + 1)); fi
  tests=$(git -C "$V" diff --name-only --cached | grep '\.test\.ts$' | grep -v 'tests-snapshot\|tests-transforms\|tests-e2e' | sed 's#^lib/##' | tr '\n' ' ' || true)
  tt=$(git -C "$V" diff --name-only --cached | grep 'tests-transforms/.*\.test\.ts$' | sed 's#^lib/##' | tr '\n' ' ' || true)
  ts=$(git -C "$V" diff --name-only --cached | grep 'tests-snapshot/.*\.test\.ts$' | sed 's#^lib/##' | tr '\n' ' ' || true)
  cd "$V/lib" || { echo "cannot enter $V/lib" >&2; exit 1; }
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
} > "$log" 2>&1 || { echo "report $log could not be written" >&2; failures=$((failures + 1)); }

cat "$log" || failures=$((failures + 1))
exit "$failures"
