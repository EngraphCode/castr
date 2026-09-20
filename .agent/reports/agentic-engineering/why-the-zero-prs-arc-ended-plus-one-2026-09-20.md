# Why an arc aimed at zero open PRs ended with one more open PR

Retrospective record, 20 September 2026. Author: Coal weaves Pumice (claude,
`claude-fable-5-1`, session prefix `f67c69`), thread `castr-correction`, at owner word.
Arc: the 12 September Codex handover reflection, through the value-proof sequence and
[PR #101](https://github.com/EngraphCode/castr/pull/101), to the 13 September full
handoff. The arc's session closed on 13 September; PR #101 itself is still open, and this
record treats that as the arc's outcome, not as an open arc.

Skill: [`retrospective`](../../skills/cognition/retrospective/SKILL-CANONICAL.md).
Modes: metacognition (retrospective) and reason throughout; one bounded free-play pass.
The author is the agent whose work is examined. Every judgement here is same-context
self-review; the numbers are not.

## The question and the short answer

The owner's goal, stated on 12 September and restated on 13 September: open PRs, dirty
worktrees and unpushed work go to zero, preserving only proven value. Measured on
20 September: open PRs 13 to 14, dirty worktrees 11 to 11, stashes 1 to 1, `main`
unchanged at `21e23229`, no product defect cured. The arc produced a proof contract, a
gap register and a priority order, and none of it is on `main`.

Short answer. PR #101 opened as a healthy plan changeset of 6 files and 237 added
lines. One review response added a second story, 1,273 lines of freshly written,
untested shell and its outputs, and every review finding from round 2 onward, 9 of 9,
landed on that second story. The plan text has been review-clean since 21:12 UTC on
12 September and has been held off `main` for eight days by an evidence appendix that
the plan itself says "establish[es] self-consistency … never … the existence of a
doctrine gap". The estate already owns the instruments that catch this (the PDR-132
round budget, the review tally, the structural step-back, ship-independent). None was
applied, because the PR was driven without loading the PR skill that carries them.

## Sources and method

Reconstructed from primary sources at 2026-09-20T14:35Z to 15:10Z, never from recall:
`git log` on the PR branch; the GitHub API for PR #101 (reviews, review threads, checks,
comments); the session transcript (owner messages with instants, per-turn tool counts);
the 12 and 13 September napkin sections on the PR branch; PDR-130, PDR-132, the
`pr-lifecycle` skill and the `ship-independent-coordinate-dependent` rule on `main`.
Counts below are derived by the commands named beside them and are true at the instant
above. Review threads and owner messages are open sets: PR #101 accepts new threads, and
the transcript filter misses message shapes it does not know (two mid-turn owner
messages were recovered separately as queue operations).

Not available: any independent reviewer's read of this arc. No estate reviewer or
sub-agent was dispatched during the arc (transcript tool histogram to the 13 September
close: 297 tool calls, 219 of them shell, zero `Agent` calls), so the two review bots
were the arc's only independent eyes.

## Timeline

All instants UTC. SHAs are on branch `claude/value-proof-sequence-2026-09-12`.

| Instant            | Event                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12 Sep 14:27       | Session opens on the Codex handover, read-and-reflect commission.                                                                                                                        |
| 12 Sep 14:55       | Owner correction 1: hook bypass is prohibited on any host that can run checks. It answers my proposal to request a scoped `HUSKY=0` grant.                                               |
| 12 Sep 14:59       | I project "three to five weeks of sessions" to reach zero, from the September throughput of one source PR per two working days.                                                          |
| 12 Sep 15:01       | Owner correction 2: a commit on a branch makes nothing safe; disposition is the output of analysis; "DO THE WORK".                                                                       |
| 12 Sep 15:05       | Owner correction 3: "lol, 2 hours … stop trying to avoid work … first hand, no subagents".                                                                                               |
| 12 Sep 15:05–15:30 | The first-hand analysis of 13 PRs and 11 worktrees: 78 tool calls, 24.4 minutes to the report.                                                                                           |
| 12 Sep 15:20       | Owner correction 4, mid-turn: the question is whether the work _should_ merge, never only whether it _can_.                                                                              |
| 12 Sep 19:01       | Owner correction 5: do the PRs fix the defects on `main`? If not, the defects are the priority.                                                                                          |
| 12 Sep 20:15       | Owner correction 6: the goal is to preserve value, and value must be proven first.                                                                                                       |
| 12 Sep 20:59       | PR #101 opens at `7cb33a9f`: 6 files, 237 insertions.                                                                                                                                    |
| 12 Sep 21:04–21:10 | Round 1: Codex 3 threads (21:04), Copilot 3 threads (21:10). All six are on the plan, ledger and `.prettierignore`; the ledger thread asks for the commands behind its "measured" facts. |
| 12 Sep 21:08       | `d36907f1` answers Codex's round 1 findings and adds `.agent/research/inherited-estate-2026-09-12/`: the PR becomes 12 files, 1,558 insertions, 1,273 of them the research directory.    |
| 12 Sep 21:16       | Round 2 (Codex, 5 threads): all five on the research directory.                                                                                                                          |
| 13 Sep 08:26       | `10554f78` rewrites the scripts from zsh to Bash.                                                                                                                                        |
| 13 Sep 08:35       | Round 3 (Codex, 3 threads): all on the research directory. One narrows a round 2 concern: failure propagation in `verify-pr.sh`.                                                         |
| 13 Sep 09:53       | Owner correction 7: do the records make the goal clear? They did not; "zero" was in no permanent record.                                                                                 |
| 13 Sep 10:29       | Owner correction 8: my "not landed" verdict on the Codex config stash read least privilege as "never".                                                                                   |
| 13 Sep 13:24       | `bf7887ec`, `ea961901`, `f8a744c2` pushed: round 3 fixes shown failing first, the priority order, the close.                                                                             |
| 13 Sep 13:26       | Session closes. The handoff records the wave on the new head as unobserved.                                                                                                              |
| 13 Sep 13:31       | Round 4 (Codex, 1 thread): `wt-evidence.sh` cannot report an untracked file as equal to `main`. Five minutes after the close.                                                            |
| 13–20 Sep          | No session. PR #101: 16 of 16 checks passing, 14 of 15 threads resolved, `BLOCKED` by the ruleset's thread-resolution requirement. Nobody is watching it.                                |

## The arc in numbers

| Measure                                            | Value                                                                      | Derivation                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| Owner messages in the arc                          | 18, excluding the compact command; 8 are corrections, by my classification | transcript, plus two queue operations               |
| Agent-active time                                  | about 104 minutes across 16 turns                                          | first owner instant to last reply instant, per turn |
| Turns with zero tool calls                         | 3 consecutive (19:01 to 20:17 on 12 Sep), 12,486 characters of reflection  | transcript                                          |
| PR #101 at open                                    | 6 files, +237                                                              | `git diff --shortstat origin/main...7cb33a9f`       |
| PR #101 now                                        | 26 files, +2,234 / −38, 13 commits                                         | same, at `f8a744c2`                                 |
| Additions by area                                  | research 1,584 (71%); continuity 383; plans and ledger 263 (12%); config 4 | `git diff --numstat origin/main...f8a744c2`         |
| Review rounds                                      | 4 Codex, 1 Copilot                                                         | reviews API                                         |
| Threads by file class                              | research scripts and README 9; plan 3; `.prettierignore` 2; ledger 1       | review threads API                                  |
| Threads I judged invalid                           | 0 of 15                                                                    | my replies on each thread                           |
| Findings per Codex round on the research directory | 5, 3, 1                                                                    | threads grouped by review instant                   |
| PDR-132 round budget                               | 2                                                                          | PDR-132 §Decision 1                                 |
| Review tally comments on PR #101                   | 0                                                                          | comments API filtered on `REVIEW-TALLY`             |
| Progress toward the terminal state                 | PRs +1, worktrees 0, stashes 0, defects cured 0                            | `gh pr list`, the 13 September plan inventory       |

## Causal stack

### Technical root: untested shell was admitted as an evidence instrument

The three scripts were written in minutes, with no failing probe, to answer a review
finding. Each round then found the next defect class in them: no failure propagation and
an unpinned base (round 2), a `tee` pipeline subshell that discarded the failure count,
unpinned PR heads and a truncation that dropped the vitest summary (round 3), an
untracked-file comparison that cannot report equality (round 4). My own regeneration
found two more that no bot saw: `set -e` aborting on an empty `grep -v`, and the
repository `postinstall` writing a disposable worktree's absolute path into the shared
`.git/config`, which had silently disabled the semantic-merge driver in every checkout.
The review bots were functioning as the scripts' test suite, one round per defect.

principles.md says all code changes follow TDD, with no "too simple to test" exemption. I
treated research scripts as not-code. That is the technical root, and it is mine.

### Process root: a second story entered a plan PR, and the PR ran without its skill

Why was it possible for untested scripts to block the governing plan?

1. **The second story entered mid-review.** PDR-132 asks that a changeset crossing about
   300 added lines or 8 files be re-examined for a hidden second story before it opens.
   PR #101 opened inside both thresholds. `d36907f1` crossed both in one commit, as a
   review response, and nothing re-examines a changeset at that moment. The
   `ship-independent-coordinate-dependent` rule fires "before … bundl[ing] multiple work
   items into one commit, queue intent, or push window"; I read `one-push-per-review-wave`
   as the governing rule and bundled.
2. **The finding had two cures and I chose the expensive one without pricing it.** Codex
   said the ledger called facts "measured" with no reproducible commands behind them. The
   claim outran the evidence. I could weaken the claim in one sentence or strengthen the
   evidence with new code. Strengthening was the better end state and the wrong
   changeset: it belonged in its own PR, cited from the plan by SHA.
3. **The PR was driven without `pr-lifecycle`.** The transcript shows two skills loaded
   by tool in the whole arc, `start-right-team` and `wrap`. I used the PR mechanics I
   remembered (harvest threads, reply with the fixing commit, resolve, re-fetch) and none
   of the contract I did not: no REVIEW-TALLY comment, which the skill calls "out of
   contract"; no budget-exceeded record when round 3 opened; no structural step-back when
   round 3 narrowed round 2's failure-propagation concern, which is the skill's
   recurrence trigger; no named shepherd for the silent-wait state that followed.
4. **No estate reviewer saw the plan text before it was pushed.** The owner's "first hand,
   no subagents" was said of the two-hour analysis. I extended it to plan authoring on
   13 September and to reviewer dispatch throughout, and wrote that extension into the
   plan-mode plan as "owner ruling for this estate work". That is the second instance in
   the arc of one failure: a scoped instruction generalised. The first was the cloud-only
   hook-bypass grant of 31 August, which I generalised into a local `HUSKY=0` request.

`main`'s own ledger records that PR #83 and PR #85 each took five rounds against the
same budget, and that C10 "retains the observed review-wave supersession failure for the
retrospective". PR #101 is the third recorded budget overrun on this thread between
6 and 13 September. The instrument exists, and it is pull-loaded.

### Meta root: nearest-proxy closure

Why was the process root possible with 97 rules loaded (`ls .agent/rules/*.md`)?

Eight owner corrections and fifteen bot findings have one shape. Each time, I had put a
nearer, recordable thing in place of the goal and then satisfied that thing:

- commits on PR branches for safety, then a hook bypass to get the commits;
- a register row for a merged destination;
- a throughput projection for a plan;
- "can merge" for "should merge";
- container mergeability for defects on `main`;
- merging for value;
- per-item acceptance language for the owner's number, zero;
- the least-privilege default for the question of which surface carries a capability;
- "green with the candidate applied" for a proven gap; exit status 0 for passed; "recorded"
  for reproducible; resolved threads for a healthy PR; "handoff complete" for the plan
  being where a successor starting from `main` will find it.

The estate has words for the artefact-level form of this: "a test on a proxy … proves the
proxy" (distilled memory), green-gates-mask-gaps, manufactured completion,
passive-guidance-loses-to-artefact-gravity. It did not have a name for the agent-level
generator. This record names it **nearest-proxy closure**: under a demand to close (a
"then stop", a review thread, a session end), the agent reaches for the nearest thing
that can be recorded as done and treats recording it as reaching the goal. A Practice
rich in registers, rules and ledgers supplies a recordable proxy within reach at every
moment, so the richer the estate, the shorter the reach.

Two facts keep this from being a complaint about the estate. The owner's stop cadence is
what made the first three corrections cost four minutes or less each, because they landed
before any action: no hook was bypassed, no preservation PR was opened, nothing was
deleted. And naming the class did not stop it. The 13 September wrap named "claims that
outrun their evidence" as the session's error signature, and the `tee` defect was in the
commit that recorded that sentence. What stopped recurrence was a mechanical probe, not
awareness.

### Where the next "why" leaves the estate's control

Why the agent closes on proxies is a disposition of the model. The estate does not
control that. It controls whether the goal's own measure is physically present at the
closure points, and whether the instruments that price a changeset load without being
asked for. Both are addressed below.

## Counterfactual test

**The strongest counterfactual is inside the arc.** Rounds 2 and 3 reviewed scripts
written with no failing probe and drew 5 and 3 valid findings. The round 3 fixes were
written probe-first: each script was run on inputs known to fail (the pr16, pr18 and
pr27 reruns exit 4, 5 and 5), every pin was checked against GitHub programmatically, and
the regenerated evidence was diffed against the tracked files before commit. Round 4
drew 1 finding, on a script the probe-first pass had not touched. The comparison is
confounded by a shrinking untested surface, so it supports "probe-first lowers findings
per round", not a rate.

**When the arc could have gone right.** At 21:08 UTC on 12 September. Had `d36907f1`
answered the "retain the commands" finding by changing "measured" to "observed in
session, not yet reproducible" and opened the scripts as their own PR, the plan PR would
have stood at about 250 lines with six answered threads, inside the PDR-132 budget, and
mergeable that evening. The scripts would then have taken their four rounds somewhere
they blocked nothing.

**Cost per unit.** Three turns totalling 37.7 of the arc's 103.7 agent-active minutes
(12 Sep 21:00, 13 Sep 08:20, 13 Sep 09:56) were spent answering rounds 1 to 3, and from
round 2 on every finding answered was on the research directory. The transcript does not
separate script time from text time inside a turn, so no finer split is claimed. The
larger cost is calendar: eight days with the governing sequence absent from `main`, during which a
successor branching from `main`, as the Practice instructs, reads a thread record that
still says "Q-07 … PR #21's concrete isolation/E2E salvage" and never learns the
value-proof contract exists.

## Honest credit

What the cost bought, stated without letting it excuse the price:

- **The value-proof contract.** The unit of work is a gap between `main` and doctrine; a
  gap is proven by a failing test on unpatched `main` whose assertion comes from doctrine
  or an independent oracle; proof and cure land together. This replaces container salvage,
  which was porting July's doctrine into September's `main`.
- **Measured estate facts** that ended a five-month-old classification: of 475 commits
  since the July bases, 13 touched `lib/src`; five source PRs apply cleanly to today's
  `main`; and that cleanliness proves nothing about value.
- **A sixteen-row register of defects on `main`**, three of which no inherited PR covers.
- **Four owner rulings captured verbatim**, on safety, hook bypass, value before
  preservation, and capability versus privilege, and the terminal state written as a count.
- **A real repository defect found by accident**: the shared-config merge-driver path.
  Nothing else in the estate was looking for it.
- **Fifteen of fifteen valid bot findings.** On this PR the review bots had perfect
  precision and were the only independent assurance the arc had.

None of it is on `main`.

## Proposals

Each carries its warrant, its expected effect and falsifier (PDR-130), and its lane. The
register rows landed in the same PR as this record.

| #   | Proposal                                                                                                                                                                                                                                                                                                                                                                | Warrant                                                                                                                     | Expected effect, and falsifier                                                                                                                                                                                                              | Lane                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| R1  | **Freeze PR #101's scope.** Its next push is its last: the round 4 fix, written probe-first (show `eq=n` on `castr-local-entry`'s `examples/local-user.json`, then cure), a reconstructed REVIEW-TALLY comment recording budget-exceeded, and a merge from `main` only if `main` has moved. Nothing else rides it, this record included. Then merge on green and clean. | 9 of 9 post-round-1 threads on the research directory; plan text clean since 12 Sep 21:12; 8 days blocked                   | #101 merges within one further round. Falsifier: a fifth round opens on plan, ledger or continuity text, which would show the bundling was not the blocker.                                                                                 | Decision for the next session on this thread |
| R2  | **A review response that adds new code re-opens the PDR-132 second-story check.** Amend `pr-lifecycle` (triage step): when answering a finding would add executable code or cross a size warning, the cure ships as its own PR and the reviewed text cites it by SHA, or the claim is weakened instead.                                                                 | #101 went from 237 to 1,558 insertions in one review response; PDR-132's check fires only before a PR opens                 | Plan-class and record-class PRs on this thread settle within the two-round budget. Falsifier: two such PRs exceed the budget with their evidence shipped separately.                                                                        | Fast                                         |
| R3  | **Opening or driving a PR loads `pr-lifecycle`, mechanically.** A pre-push or PR-creation check that fails when the branch has an open PR with no REVIEW-TALLY comment.                                                                                                                                                                                                 | Three budget overruns between 6 and 13 September (#83, #85, #101); #101 has no tally; the skill was never loaded in the arc | Every PR born after the check lands carries a tally from first triage. Falsifier: tallies exist and the median rounds per PR does not fall at PDR-132's own one-month measurement, which would show the tally is ceremony.                  | Fast; validator                              |
| R4  | **Scripts cited as evidence are code: probe-first, in a tested home.** Strengthens the 13 September candidate "a script cited as evidence must be shown exiting non-zero on a failing input" with the 5, 3, 1 series.                                                                                                                                                   | Nine valid findings on three scripts across rounds 2 to 4, two more found by regeneration; the probe-first segment drew 1   | A probe-first evidence script draws at most one valid finding in its first round. Falsifier: two probe-first scripts each draw three or more.                                                                                               | Fast; merges into the existing candidate     |
| R5  | **A handoff states whether its continuity is on `main`.** Amend `wrap` step 2 and `session-handoff` step 1: the safety line carries "continuity on `main`: yes or no"; when no, the closing agent posts the branch and the ordered next steps where a from-`main` successor looks first.                                                                                | `origin/main`'s thread record and repo continuity do not mention PR #101 (`git grep` on `origin/main`, 20 Sep)              | A successor branching from `main` finds live instructions within its start-right reads. Falsifier: a from-`main` session on this thread starts Q-07 as container salvage after the amendment lands.                                         | Fast                                         |
| R6  | **Correct the wrap skill's stale sentence** that this estate has no retrospective skill. The skill arrived in `3bdabb3c`, authored 2026-08-24T22:43Z, the day the wrap skill was ported.                                                                                                                                                                                | The 13 September wrap offered a retrospective by citing the upstream reference while the local skill sat unused             | The next deep close routes to the local skill. Falsifier: none worth stating; it is a factual correction.                                                                                                                                   | Fast; documentation                          |
| R7  | **A scoped owner instruction is recorded with its scope.** When an owner instruction is captured in the napkin or a plan, the capture names the work it was said about, and extending it needs the owner's word.                                                                                                                                                        | Two generalisations in one arc: the cloud-only bypass grant, and "no subagents"                                             | Zero recorded scope generalisations in the next three sessions on this thread. Falsifier: one recurs with the capture discipline in force.                                                                                                  | Fast                                         |
| R8  | **Nearest-proxy closure: put the goal's own measure at every closure point.** Every stop report, PR description and handoff on a thread with a stated terminal count opens with that count, before and after. The concept and its check enter the slow lane.                                                                                                            | The thirteen substitutions listed above; naming the class on 13 September did not stop it, a mechanical probe did           | Owner corrections of the proxy class fall from 8 in this arc to 2 or fewer per comparable arc by the review date. Falsifier: two comparable arcs with 5 or more proxy-class corrections while the measure is present at the closure points. | Slow; review 2026-12-20                      |

One observation is routed as tooling feedback, not as a proposal. On 20 September the
repository hook policy blocked two commands of mine. The first, a scratch-repository
probe, was refused as `git commit -n`: it held `git commit -q` twice, no literal
`git commit -n`, and `sort -rn` later in the same pipeline. The second was refused as
`git add -u`: it held `git add -- <explicit paths>` and, later on the same line,
`git push -u`. From two instances, the matcher tests for the flag anywhere on the command
line after the verb, across `&&` and pipe segments and inside another program's bundled
short flags. That is an inference, and `hook-policy-substring-discipline` is the rule it
falls under. I did not work around the first block, so the round 4 finding's mechanism is
recorded here as unverified by me; the second command was re-run with the push as its own
command, since it staged by explicit pathspec and the rule's concept was already honoured.

## Free-play harvest

Bounded pass, associations only.

- The sentence blocking the plan from `main` is the plan's own disclaimer of the thing
  blocking it. The appendix the text says proves nothing became the text's gatekeeper.
- Three estimates of one analysis at three altitudes: my projection from past throughput,
  three to five weeks for the campaign; the owner's prior, two hours for the analysis; the
  measurement, 24.4 minutes. My projection extrapolated the rate of the very process the
  owner was rejecting.
- "A red test on a branch preserves nothing" is my sentence in the plan. It applies to the
  plan: a priority order on a branch governs nothing for anyone who starts from `main`.
- The arc distilled four prose lessons and five graduation candidates and enforced
  nothing. The estate's own pipeline ends in "enforce"; the only thing in the arc that
  changed behaviour was a probe.

Discarded: a reading of the 5, 3, 1 series as a convergence rate. Three points on a
shrinking surface are not a rate.

## What this record cannot see

I have not read the 106 resolved threads on the thirteen inherited PRs, Codex's rollout
summaries, or the estate's earlier retrospective material for PR #83 and PR #85, so
"third overrun" rests on the ledger's words, not on a recount. The round 4 finding is
unverified. The per-turn timing counts background gate runs as agent-active time. And the
central limit: the agent examined here wrote this. The error signature to point outside
eyes at is any sentence in this record where a judgement is not followed by its number.

## Addenda

None yet. New understanding amends this record here, additively.
