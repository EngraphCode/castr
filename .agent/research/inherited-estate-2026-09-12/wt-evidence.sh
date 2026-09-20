#!/usr/bin/env bash
# Per-file evidence for dirty worktrees against the measured main revision.
# Usage: [BASE=<sha>] ./wt-evidence.sh <worktree-path>... > wt-evidence.txt
# Untracked directories are expanded to every file inside them. Renames and copies
# consume both porcelain records. Equality with main compares the working file's blob
# with the pinned base blob, so untracked files are compared by content. The line
# count is measured against HEAD, so staged-only changes are counted. The porcelain
# listing is written to a file and checked before it is parsed, so a status failure
# aborts the run instead of presenting an empty inventory.
set -euo pipefail
R=$(git rev-parse --show-toplevel)
cd "$R"
BASE=${BASE:-21e232295426ac104dc1ff47b2d7543858abf4bf}

listing=$(mktemp)
trap 'rm -f "$listing"' EXIT

for wt in "$@"; do
  head=$(git -C "$wt" rev-parse HEAD)
  br=$(git -C "$wt" rev-parse --abbrev-ref HEAD)
  echo "################ $(basename "$wt") branch=$br head=${head:0:8} behind=$(git rev-list --count "$head".."$BASE")"
  echo "--- dirty files (st | equals-main | main-changed-since-base | +ins/-del vs HEAD | path [<- origin])"
  git -C "$wt" status --porcelain -z --untracked-files=all > "$listing" || {
    echo "wt-evidence: git status failed in $wt (exit $?); inventory aborted" >&2
    exit 1
  }
  while IFS= read -r -d '' line; do
    st="${line:0:2}"; f="${line:3}"; origin=""
    case "${st:0:1}${st:1:1}" in
      R?|?R|C?|?C) IFS= read -r -d '' origin ;;
    esac
    base_blob=$(git rev-parse -q --verify "$BASE:$f" 2>/dev/null || true)
    if [[ -n "$base_blob" && -f "$wt/$f" && "$(git hash-object "$wt/$f")" == "$base_blob" ]]; then eq=Y; else eq=n; fi
    if [[ -n "$base_blob" ]]; then
      if git diff --quiet "$head" "$BASE" -- "$f" 2>/dev/null; then mc=same; else mc=CHANGED; fi
    else
      if git cat-file -e "$head:$f" 2>/dev/null; then mc=DELETED-on-main; else mc=new; fi
    fi
    if [[ "$st" == "??" ]]; then
      ins="+$(wc -l < "$wt/$f" | tr -d ' ')"
    else
      ins=$(git -C "$wt" diff --numstat HEAD -- "$f" ${origin:+"$origin"} | awk '{i+=$1; d+=$2} END{printf "+%d/-%d", i, d}')
    fi
    echo "  $st | eq=$eq | main=$mc | $ins | $f${origin:+ <- $origin}"
  done < "$listing"
done
