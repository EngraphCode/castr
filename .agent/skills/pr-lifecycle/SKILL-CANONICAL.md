---
name: pr-lifecycle
classification: active
description: >-
  Open a pull request and shepherd it to merge-ready — reviewer-facing
  description, full-surface harvesting (GraphQL review threads, all comments,
  all checks, server-side scanning findings), root-cause-first triage, budgeted
  watching via the pr-watch CLI, re-fetch after every push, and an honest
  merge-ready declaration at the owner gate. Use whenever a branch reaches PR
  closeout or an open PR needs driving to live.
---

# Pull Request Lifecycle

**Governance**: brought from the upstream Practice 2026-07-03 and localised to
castr's surfaces. Operationalises
[`pr-comments-resolve-and-recheck`](../../rules/pr-comments-resolve-and-recheck.md)
(itself the genotype of the owner's standing fix-or-reject directive) and
composes with the [`commit` skill](../commit/SKILL-CANONICAL.md) (which owns
landing commits) and the [`semantic-merge` skill](../semantic-merge/SKILL-CANONICAL.md)
(agent memory/state files in a divergence update). Every gate constraint here
inherits `never-disable-checks` and "all quality gates blocking, always".

The one-sentence contract: **a PR is done when it is live** — opened is not
done, green checks are not done, "ready for review" is not done; done is
merged with every finding genuinely settled.

## Phase 1 — Before opening

1. **Divergence**: `git fetch origin main`; if behind, merge `origin/main`
   into the branch (never rebase-and-force-push an already-pushed branch —
   `never-use-git-to-remove-work`). When the update touches agent memory/state
   files, author the union by hand per the `semantic-merge` skill — a git
   line-merge silently corrupts them.
2. **Tree and gates**: working tree clean; a successful push already ran the
   full pre-push gate suite (`check:ci`), so a clean push IS the local-green
   proof — do not re-run gates just to re-confirm it.
3. Under castr's feature-branch model (owner, 2026-07-03) every slice branch
   ends in a PR; opening early as a draft and taking it to ready here is the
   normal shape.

## Phase 2 — Open with a reviewer-facing description

Read `.github/pull_request_template.md` and fill it as a **communication
artefact for reviewers**, never a file list: what changed, why it matters,
what reviewers should focus on, what was deliberately left out, and what
evidence supports merge readiness. Update the description whenever the review
story materially changes (a reshaped scope, a new commit class).

## Phase 3 — Harvest EVERY feedback surface (the step most often botched)

Immediately after opening — and again after every push — pull all four
surfaces. Partial reads produce false "no problems" verdicts:

1. **Review threads (the authoritative comment surface)** — GraphQL
   `pullRequest.reviewThreads { isResolved, path, comments }`. REST issue
   comments MISS inline bot threads (Copilot/Codex); a REST-only read is the
   canonical way to falsely conclude "no comments".
2. **Issue comments and reviews** — full bodies, never truncated skims; a
   scanning summary or a bot capability notice lives here.
3. **All checks** — `gh pr checks`, including the required `quality-gates`
   fan-in and CodeQL. A failed check's _first_ failure is the root to chase: a
   20-second `install` failure cascades into skipped builds — fix the root,
   not the echoes.
4. **Server-side ruleset findings** — castr's branch ruleset enforces
   `code_scanning` (CodeQL default setup), `code_quality`, and
   `code_coverage` beyond the required check. When one blocks, pull the ACTUAL
   findings (`gh api` code-scanning alerts for the PR) and read each flagged
   site; the gate summary names conditions, only the finding list names the
   work.

## Phase 4 — Triage by blocking force; fix at source

- Order by blocking force and risk, not by tool order; root causes before
  echoes.
- Every finding ends in exactly one state: **fixed at source**,
  **owner-dispositioned with evidence**, or **proven irrelevant at the
  specific site** (a measured reject with falsifying evidence, per the
  fix-or-reject directive). Never dismissed by category, never gate-narrowed,
  never warning-downgraded, never suppressed.
- Fix the class, not the instance: a finding on two lines gets a repo-wide
  sweep of the class; a stale literal gets checked against its source
  constant convention.
- Scanning surfaces reflect fixes only after the next pushed run — verify
  fixes with local gates at source; never poll the server surface immediately
  after an edit.

## Phase 5 — Wait without burning budget

Run the repo's budgeted watcher in the background:
`pnpm agent-tools:pr-watch <n> --watch --interval 60` — one line per state
change, including new comments by author and the unresolved review-thread
count moving in EITHER direction (a thread arriving or being resolved). The
watcher's thread count is the wake signal; the Phase 3 GraphQL harvest remains
the authoritative read for which threads and what they say. Never hand-roll
tight `gh` polling loops (the shared API budget); on Claude Code run the
watcher under a persistent Monitor. Between events, continue other work or
hold; the watcher wakes you.

## Phase 6 — After EVERY push, re-fetch; resolve only what is settled

- Bots re-review each push asynchronously: **"0 unresolved" is a moment, not
  a state** (castr worked instance: PR #3 took five Codex waves, each spawned
  by the push that closed the prior one). Re-fetch `reviewThreads` and checks
  after every push and again at the instant of any ready/merge-ready
  declaration — a finding can land seconds after your last look.
- Reply to each thread with the fix evidence (commit SHA + what changed),
  then resolve it. "Resolved" is a settled-concern state, never a button
  clicked to clear `mergeStateStatus`. Identify as the agent in reply bodies
  (shared gh credentials attribute replies to the owner).

## Phase 7 — Merge-ready is a declaration with a gate, then the owner

Merge-ready means, re-verified at the declaration instant: all checks green
AND zero unresolved review threads AND no blocking ruleset finding. Then:

- **The merge itself is owner-invoked** (standing castr posture, 2026-07-03:
  agents keep the branch continuously merge-correct; the owner performs the
  merge). Notify the owner at this action moment
  (`owner-attention-at-action-moments`); use the question tool, not
  prose-only.
- Owner preference observed (PR #3, 2026-07-03): merge commit, not squash.

## Phase 8 — After merge

Update continuity surfaces (delivery state, thread record, next-step spine),
close claims, and delete the merged branch only with owner authorisation
(`never-use-git-to-remove-work` governs destructive branch operations).

## Failure modes this skill exists to prevent (observed here or upstream)

- REST-only comment reads declaring "no comments" over unresolved inline
  threads.
- Truncated comment skims triaged as "noise".
- Ready/merge-ready declared without re-fetching after the latest push.
- A failed check's downstream echoes debugged before its root cause.
- A blocking scanning gate treated as an opaque red badge instead of a
  finding list to fix at source.
- Tight `gh` polling loops in place of the budgeted watcher.
