#!/bin/zsh
# Per-file evidence for dirty worktrees against origin/main.
# Usage: ./wt-evidence.sh <worktree-path>... > wt-evidence.txt
set -u
R=$(git rev-parse --show-toplevel)
cd "$R"
for wt in "$@"; do
  head=$(git -C $wt rev-parse HEAD); br=$(git -C $wt rev-parse --abbrev-ref HEAD)
  echo "################ $(basename $wt) branch=$br head=${head:0:8} behind=$(git rev-list --count $head..origin/main)"
  echo "--- dirty files (st | equals-main | main-changed-since-base | +ins/-del vs HEAD)"
  git -C $wt status --porcelain | while IFS= read -r line; do
    st="${line:0:2}"; f="${line:3}"
    eq=n; if git cat-file -e origin/main:"$f" 2>/dev/null && git -C $wt diff --quiet origin/main -- "$f" 2>/dev/null; then eq=Y; fi
    if git cat-file -e origin/main:"$f" 2>/dev/null; then
      if git diff --quiet $head origin/main -- "$f" 2>/dev/null; then mc=same; else mc=CHANGED; fi
    else
      if git cat-file -e $head:"$f" 2>/dev/null; then mc=DELETED-on-main; else mc=new; fi
    fi
    if [ "$st" = "??" ]; then ins="+$(wc -l < "$wt/$f" | tr -d ' ')"; else ins=$(git -C $wt diff --numstat -- "$f" | awk '{print "+"$1"/-"$2}'); fi
    echo "  $st | eq=$eq | main=$mc | $ins | $f"
  done
done
