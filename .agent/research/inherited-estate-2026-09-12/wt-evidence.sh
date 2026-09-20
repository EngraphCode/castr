#!/usr/bin/env bash
# Per-file evidence for dirty worktrees against the measured main revision.
# Usage: [BASE=<sha>] ./wt-evidence.sh <worktree-path>... > wt-evidence.txt
# Untracked directories are expanded to every file inside them. Renames and copies
# consume both porcelain records. Equality with main compares the working file's blob
# with the pinned base blob, so untracked files are compared by content. The line
# count is measured against HEAD, so staged-only changes are counted; a path dirty in both
# the index and the working tree reports the index blob separately. The porcelain
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
    base_mode=$(git ls-tree "$BASE" -- "$f" 2>/dev/null | cut -d' ' -f1)
    # A symlink is compared as git stores it (its target string, mode 120000), never by
    # the bytes it points at, so a link can equal main only where main has that link.
    if [[ -L "$wt/$f" ]]; then
      wt_blob=$(printf '%s' "$(readlink "$wt/$f")" | git hash-object --stdin); wt_link=1
    elif [[ -f "$wt/$f" ]]; then
      wt_blob=$(git hash-object "$wt/$f"); wt_link=0
    else
      wt_blob=""; wt_link=0
    fi
    if [[ -n "$base_blob" && "$wt_blob" == "$base_blob" && ( ( "$base_mode" == 120000 && $wt_link -eq 1 ) || ( "$base_mode" != 120000 && $wt_link -eq 0 ) ) ]]; then eq=Y; else eq=n; fi
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
    # When both columns are dirty the index holds a blob of its own; report it separately
    # so a working tree that has drifted back to main cannot hide staged work.
    staged=""
    if [[ "${st:0:1}" != " " && "${st:0:1}" != "?" && "${st:1:1}" != " " ]]; then
      index_blob=$(git -C "$wt" rev-parse -q --verify ":$f" 2>/dev/null || true)
      if [[ -n "$base_blob" && -n "$index_blob" && "$index_blob" == "$base_blob" ]]; then ieq=Y; else ieq=n; fi
      sins=$(git -C "$wt" diff --cached --numstat HEAD -- "$f" | awk '{i+=$1; d+=$2} END{printf "+%d/-%d", i, d}')
      staged=" | index: eq=$ieq $sins"
    fi
    echo "  $st | eq=$eq | main=$mc | $ins | $f${origin:+ <- $origin}$staged"
  done < "$listing"
done
