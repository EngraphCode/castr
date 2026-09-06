---
name: pr-lifecycle
classification: active
description: >-
  Open a pull request and shepherd it to merge-ready — reviewer-facing
  description, full-surface harvesting (GraphQL review threads, all comments,
  all checks, server-side scanning findings), root-cause-first triage, budgeted
  watching via the pr-watch CLI, re-fetch after every push, and a
  condition-based merge (green and clean → merge). Use whenever a branch
  reaches PR closeout or an open PR needs driving to live. Do NOT use to
  review someone else's PR without owning its closeout, to answer a single
  review comment, or to fix a CI failure unrelated to a PR you drive — those
  take ordinary review, comment, or fix work. Right: harvest every surface,
  fix root causes, re-fetch after each push, merge the moment the conditions
  hold. Wrong: declare merge-ready without re-fetching, resolve threads
  without evidence, or hold a green-and-clean PR for an owner invocation.
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

## The review-round tally

Before the first triage of an opened or adopted bot-reviewed PR, create one
**REVIEW-TALLY** issue comment. The named shepherd maintains it across pushes and
handoffs; a successor reads and updates that same comment. A tally-less PR is out
of contract: establish the record before continuing triage. When adopting an older
untallied PR, reconstruct the earlier rounds from full review history and label
that part reconstructed; never claim the tally existed at first triage.

Start with the PR outcome, shepherd, PDR-132 expected review-round budget and an
empty table. Record each round's ordinal, reviewed head, concern/class narrowed,
blocking determination, disposition/evidence and any remaining owning slice or
reopen condition. Link the tally from the PR description so a successor can find
it. Multiple findings in one round need separate dispositions; the ordinal is
shared. A minimal comment is:

```markdown
REVIEW-TALLY

Outcome: <one reviewable result>. Shepherd: <identity>.
Expected review budget: <PDR-132 budget, normally at most two rounds>.

| Round | Head | Concern/class narrowed | Blocking evidence | Disposition/proof/owner |
| ----- | ---- | ---------------------- | ----------------- | ----------------------- |

Current state: awaiting first triage.
```

A round is one triaged feedback batch and the response to its concerns. Parallel
specialist findings on the same review pass share a round. Pushes, comments,
reviewers and unchanged harvests are not rounds. Record later narrowing of a
concern in the next round; do not merge rounds retrospectively to evade a trigger.
A new head or shepherd never resets the ordinal or hides earlier concerns.

Before choosing a cure, compare the last two rounds. **Two successive rounds each
narrowing the same concern require a structural step-back** under
[ADR-051 clause 4(c)](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md).
Re-derive the cause and close its class, rather than applying another instance
cure. Use `engraph-parallax` and `engraph-proportionality` to reconsider the frame
and slice; record the re-derivation, class-level proof and resulting disposition
in the tally. A new label or another push does not discharge the trigger.

PDR-132's authoring budget is separate from this recurrence predicate. If the
budget is exceeded, reconsider the generator and scope before continuing; neither
budget nor recurrence permits a blocking defect through merge. ADR-051 clause 4
owns the per-finding demonstration and carry-forward conditions for non-blocking
bot refinements. Human comments remain uncapped. Any adjacent work taking that
route needs a named owning slice and evidence explaining why it does not block
this outcome; a generic backlog pointer is insufficient.

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

### Verify a bot-cited commit warrant

When a bot cites a commit as evidence, establish that the cited object is a commit
in the named repository before relying on the argument. First use
`git cat-file -t <sha>` locally. A missing local object proves only local absence:
a shallow or partially fetched clone can lack a valid remote commit. If missing,
check the named repository through a GitHub commit lookup or fetch the referenced
object and verify its type. Also establish repository provenance when it is
unclear; a commit in another repository is not evidence about this one.

Reject a citation **as nonexistent** only after verified local **and repository**
absence.
Authentication, transport, rate-limit or ambiguous lookup failures leave it
unverified, not absent. A non-commit object does not satisfy a commit citation.
Record the checks, repository, result and reopen condition with the disposition.
An invalid warrant never dismisses an independently reproducible correctness,
security or data-loss defect; investigate that mechanism at the actual head under
Phase 4. Apply the existing non-blocking convergence conditions only after that
per-finding assessment.

Graduated on 6 September 2026 when Q-19 edited convergence doctrine. Evidence:
PR #69 round 6 cited `5b63e55f`; local absence and an independent repository lookup
were recorded in PR #71 round 1. Provenance: PR #69 review thread
[r3872515171](https://github.com/EngraphCode/castr/pull/69#discussion_r3872515171)
and the 27 August pending-graduation record. These are dated observations, not a
claim that every present lookup failure establishes absence.

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

## Phase 7 — Merge-ready is a declaration with a gate, then the merge

Merge-ready means, re-verified at the declaration instant: all checks green
AND zero unresolved review threads AND no blocking ruleset finding. Then:

- **Merge authority follows the governing authority for the PR** (loop-review
  D-10, owner-approved 2026-08-24; the unconditional owner-invoked line this
  bullet replaces was never policy — owner, 2026-08-26). Where a programme
  document defines merge conditions for the PR (e.g. ADR-051 clause 3 sets
  condition-based unattended merge for programme PRs), those conditions are
  the authority — follow them.
  castr standing policy (owner ruling 2026-08-22, reaffirmed 2026-08-26):
  **green and clean → the driving agent merges** — all CI passing on the
  current head AND every review thread properly resolved (fixed, or rejected
  with evidence). Never wait for a per-PR owner invocation.
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
