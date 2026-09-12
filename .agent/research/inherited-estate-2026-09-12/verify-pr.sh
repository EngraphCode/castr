#!/bin/zsh
# Apply one source PR's lib/ diff to a disposable copy of origin/main and run its own
# tests plus tsc. Proves self-consistency on main only, never a doctrine gap.
# Usage: SCRATCH=<dir> ./verify-pr.sh <label> <base-sha> <branch>
set -u
R=$(git rev-parse --show-toplevel)
S=${SCRATCH:-$(mktemp -d)}
label=$1; base=$2; br=$3; V=$S/v-$label; log=$S/verify-$label.log
git -C $R worktree add --detach -q $V origin/main >/dev/null 2>&1
( cd $V && pnpm install --frozen-lockfile --offline >/dev/null 2>&1 )
{
echo "===== $label base=$base branch=$br $(date '+%H:%M:%S')"
git -C $R diff --binary $base $br -- lib ':!lib/tests-snapshot/integration/__snapshots__' > $S/$label.patch
echo "patch: $(grep -c '^diff --git' $S/$label.patch) files"
git -C $V apply --3way --index $S/$label.patch > $S/$label.apply.log 2>&1; rc=$?
echo "apply rc=$rc; conflicted files: $(git -C $V diff --name-only --diff-filter=U | tr '\n' ' ')"
echo "apply errors: $(grep -c 'error:' $S/$label.apply.log)"
tests=$(git -C $V diff --name-only --cached | grep '\.test\.ts$' | grep -v 'tests-snapshot\|tests-transforms\|tests-e2e' | sed 's#^lib/##' | tr '\n' ' ')
tt=$(git -C $V diff --name-only --cached | grep 'tests-transforms/.*\.test\.ts$' | sed 's#^lib/##' | tr '\n' ' ')
ts=$(git -C $V diff --name-only --cached | grep 'tests-snapshot/.*\.test\.ts$' | sed 's#^lib/##' | tr '\n' ' ')
cd $V/lib
if [ -n "$tests" ]; then echo "--- unit tests: $tests"; npx vitest run --reporter=dot ${=tests} 2>&1 | grep -E 'Test Files|Tests |FAIL|Error:' | head -12; fi
if [ -n "$tt" ]; then echo "--- transforms tests: $tt"; npx vitest run --config vitest.transforms.config.ts --reporter=dot ${=tt} 2>&1 | grep -E 'Test Files|Tests |FAIL|Error:' | head -12; fi
if [ -n "$ts" ]; then echo "--- snapshot tests: $ts"; npx vitest run --config vitest.snapshot.config.ts --reporter=dot ${=ts} 2>&1 | grep -E 'Test Files|Tests |FAIL|Error:' | head -12; fi
echo "--- type-check"; npx tsc --noEmit --project tsconfig.lint.json > $S/$label.tsc.log 2>&1; echo "type-check rc=$? errors=$(sed 's/\x1b\[[0-9;]*m//g' $S/$label.tsc.log | grep -c 'error TS')"; sed 's/\x1b\[[0-9;]*m//g' $S/$label.tsc.log | head -6
echo "===== done $(date '+%H:%M:%S')"
} > $log 2>&1
cat $log
