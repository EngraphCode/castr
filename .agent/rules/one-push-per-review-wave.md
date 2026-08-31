# One Push Per Review Wave

Graduated from the owner correction of 2026-08-31 ("every 'superseded head'
means you have wasted my money by cancelling a GitHub runner job"), promoted
at owner word the same day. Composes with
[`continuity-surface-commits-as-orphans.md`](continuity-surface-commits-as-orphans.md)
(the terminal continuity commit-or-handoff stands) and the `pr-lifecycle`
skill's re-fetch-after-every-push discipline.

## The principle

A push to a branch with CI or reviews in flight supersedes the head: the
running CI suite is cancelled mid-flight and every reviewer working that
head is reviewing a ghost. Commits are free; pushes spend runners. So fixes
are batched per **wave** — the set of reviewers and CI runs working one
head — and land as one push when the wave completes, not one push per
reviewer round.

## Trigger

About to `git push` to any branch whose head has CI running or a reviewer
mid-review (a bot's summary comment showing a review "Running" counts).

## Action

1. Check the wave: is CI still running on the current remote head? Is any
   reviewer mid-review on it? If yes, hold — commit locally, keep fixing,
   and batch everything the wave surfaces into one push after it completes.
2. Never supersede your own green-path run. The one exception: a push that
   fixes a failure already reported on that head — superseding a red run
   saves the wave; superseding a green-path run burns it.
3. Bookkeeping and continuity edits ride the next necessary push while any
   wave is active. At session end with no wave in flight, the terminal
   continuity push is normal operation and cancels nothing.

## Failure mode prevented

Push-per-round reflex: each review round answered with an immediate push,
minutes apart, each cancelling a paid multi-minute runner and restarting
every reviewer — measured four times in one day (2026-08-31) before the
correction.
