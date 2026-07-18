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
castr's surfaces; re-synced from the upstream working tree 2026-07-18
(upstream HEAD 8195b78 plus its then-uncommitted enhancements — the
working-tree-latest source policy was owner-decided 2026-07-18).
Operationalises
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
4. **Gate-shaped diffs run the adversarial fixpoint FIRST** (see
   [`invoke-reviewers`](../../rules/invoke-reviewers.md) §Gate-Shaped Code):
   for validators, hooks, CI pins — anything whose job is catching other
   code's defects — run a local adversarial review loop to convergence
   BEFORE the first push. A gate's holes are silent by nature, and the
   fixpoint will be reached somewhere: locally at minutes per cycle, or
   publicly at one full review round per push (upstream worked instance,
   owner-ratified 2026-07-18: a 10-round external arms race whose first ~25
   findings were ~24/25 locally catchable; the one adversarial workflow
   actually run pre-push pre-empted four findings external review only
   surfaced rounds later).

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
   not the echoes. An empty checks surface is recorded as a fact ("no CI
   attached"), never read as green-by-absence.
4. **Server-side ruleset findings** — castr's branch ruleset enforces
   `code_scanning` (CodeQL default setup), `code_quality`, and
   `code_coverage` beyond the required check. When one blocks, pull the ACTUAL
   findings (`gh api` code-scanning alerts for the PR) and read each flagged
   site; the gate summary names conditions, only the finding list names the
   work.

The harvest DENOMINATOR is every open thread on the PR regardless of draft
state or timestamp — external reviews fire on DRAFT pushes too, and a
re-fetch discipline that sweeps only after one's OWN pushes leaves threads
sitting unseen from their stamp until some later read (two same-hour
upstream instances on independent seats, 2026-07-12).

## Phase 4 — Triage by blocking force; fix at source

- Order by blocking force and risk, not by tool order; root causes before
  echoes.
- Every finding ends in exactly one state: **fixed at source**,
  **owner-dispositioned with evidence**, **proven irrelevant at the specific
  site** (a measured reject with falsifying evidence, per the fix-or-reject
  directive), or **routed to a named successor** — accepted as an instance of
  a documented residual and routed to a structural mechanism that retires its
  whole class. Never dismissed by category, never gate-narrowed, never
  warning-downgraded, never suppressed.
- **A routed disposition's target must EXIST IN WRITING before the thread
  resolves.** Citing "the follow-on plan" that does not yet carry the
  substance is a broken pointer wearing a disposition's clothes (upstream
  worked instance 2026-07-18: dispositions cited a debt plan the successor
  had never been written into; the gap surfaced only at ratification —
  write the routed home first, then resolve citing its real location).
- Fix the class, not the instance: a finding on two lines gets a repo-wide
  sweep of the class; a stale literal gets checked against its source
  constant convention.
- **The laddered triage protocol** (upstream owner-set, graduated
  estate-wide 2026-07-11): every new reviewer finding is triaged
  **low / medium / high / critical** with the classification recorded before
  the response fires — low/medium → immediate solo fix + reply/resolve;
  high → immediate fix + adversarial subagent check BEFORE the thread
  closes; critical → own analysis → an independent expert second analysis →
  an adversarial analysis attacking BOTH → the synthesis through the
  Decision Lenses and the `PDR-057` § Four-Lens dissolution test — only
  uncertainty that survives all of that reaches the owner; then fix +
  expert-panel review of the fix. Complex or high-impact judgement calls
  raise to the owner rather than being fixed or routed.
- **A cancelled CI run is infrastructure, never a verdict on the PR's
  content**: read it as CANCELLED and re-run it, never as a failure signal —
  whatever cancelled it (a shared concurrency group, a runner eviction) is a
  cause to cure separately. Whether the acting credential can re-run a
  cancelled or flaked check depends on its Actions write permission — when
  it lacks one, every re-run is an OWNER CLICK; route the need to the owner,
  never assume the capability.
- **A finding's factual premise is input-to-verify first-hand BEFORE the
  fix.** Reviewers assert premises ("this field is wrong", "this file is
  missing") that can be false at the current head; fixing a false-premise
  finding as-asked breaks working behaviour. Verify the premise against the
  live surface (the file on disk, the actual schema, the emitted output),
  then fix — or reject-with-evidence citing the verification.
- Scanning surfaces reflect fixes only after the next pushed run — verify
  fixes with local gates at source; never poll the server surface immediately
  after an edit.

## Phase 5 — Wait without burning budget

Run the repo's budgeted watcher in the background:
`pnpm agent-tools:pr-watch <n> --watch --interval 60` — one line per state
change, including new comments by author and the unresolved review-thread
count moving in EITHER direction (a thread arriving or being resolved). The
watch ends on merged/closed and on ALL GREEN — every attached check settled
passing AND every review thread resolved AND the merge state clean (protection,
staleness, and draft all satisfied); passing checks alone are not green,
because an unresolved thread blocks merge-readiness just as hard. (A PR with
no checks yet attached does not read as green — that is the rollup race just
after a push; a genuinely CI-less PR runs to its poll budget.) That exit is the wake
signal; the Phase 3 GraphQL harvest remains the authoritative read for which
threads and what they say. Never hand-roll tight `gh` polling loops (the
shared API budget); on Claude Code run the watcher under a persistent
Monitor. Between events, continue other work or hold; the watcher wakes you.

## Phase 6 — After EVERY push, re-fetch; resolve only what is settled

- Bots re-review each push asynchronously: **"0 unresolved" is a moment, not
  a state** (castr worked instance: PR #3 took five Codex waves, each spawned
  by the push that closed the prior one). Re-fetch `reviewThreads` and checks
  after every push and again at the instant of any ready/merge-ready
  declaration — a finding can land seconds after your last look.
- Reply to each thread with the fix evidence (commit SHA + what changed) or
  the explicit, reasoned rejection, then resolve it. "Resolved" is a
  settled-concern state, never a button clicked to clear
  `mergeStateStatus`. Identify as the agent in reply bodies (shared gh
  credentials attribute replies to the owner).
- **Verify BOTH halves of any paired remote mutation independently** — a
  GraphQL document fails WHOLE on an invalid response-field selection while
  its sibling mutation succeeds (upstream live instance: thread-reply
  mutations died on validation while the separate resolves succeeded —
  threads went RESOLVED with no evidence reply; caught by reading the error
  output, not the exit).
- `mergeStateStatus: UNKNOWN` after multiple same-base merges is recompute
  BACKLOG, not error or blocker: bounded rechecks (a few at 20–45s), then
  hand first-hand evidence (checks + thread state) onward — never an
  unbounded poll on the flag.
- **Review materialisation lag is platform-side**: a review whose
  `submittedAt` equals its `createdAt` can be INVISIBLE to the same
  `reviewThreads` query for ~35–50 minutes (upstream-verified via the
  reviews connection, 2026-07-13). No single post-settle zero is trusted —
  the merge-instant read queries BOTH `reviewThreads` AND the `reviews`
  connection; a review present in `reviews` but absent from `reviewThreads`
  is the lag's tell, and it blocks as unresolved until its threads
  materialise or its body is read and dispositioned directly.
- **The checks rollup races in-progress runs**: `statusCheckRollup`
  conclusions are EMPTY STRINGS mid-run — a `!= "SUCCESS"` filter reads
  them as failures — and `mergeStateStatus` flaps UNKNOWN/BLOCKED just
  after a push and just after the last check lands. Re-read after a
  beat; `gh pr checks` pending-count is the honest in-flight signal.
- **Convergence discipline under a per-push re-reviewer** (upstream arc,
  five rounds 14 → 2 → 1 → 1 → 0; castr's own PR #10 ran seven rounds to
  the same shape):
  - Finding-counts are derivation-anchored — a count is stale the moment
    written; re-harvest the thread set at execution time, never trust a
    ledger's tally.
  - Batch fixes into the fewest commits: dribbled per-fix pushes never
    converge, because every push draws a fresh review pass that can add
    threads.
  - The convergence signal is a push whose re-review yields ZERO new
    findings — the loop exits on a quiet round past its window, never on
    optimism.
  - **Reflexive loops may never go quiet — then the exit is a JUDGEMENT,
    capped on ROI and risk, never on round counts** (upstream owner ruling
    2026-07-18: ten rounds, 28+ findings, every one VALID while the risk
    mass per finding fell ~an order of magnitude — validity is not the exit
    variable). When each cure creates the surface the next round probes
    (gate-shaped code especially), triage each new finding on two
    independent axes — marginal expected value vs full cost including
    permanent maintenance friction, AND a tail-risk veto that fixes any
    genuinely new severe class regardless of the curve — and exit by
    reasoned per-site disposition once findings restate a documented
    residual. Track findings-per-round and risk-mass trend as the
    crossing-point telemetry; record the round count as the observed
    crossing point, never as the rule.
  - **Strictly-narrowing instances of one family are the mechanism-change
    tell**: when successive rounds return ever-narrower holes in the same
    class (an option enumeration, a literal-pin regress), instance-fixing
    cannot converge by construction — name a class-ending successor
    mechanism in a written home and route further instances to it (castr
    worked instance: PR #10's authority-ring rounds closed only when
    single-sourcing replaced per-comment patches).
  - Volatile tracking surfaces (a disposition ledger, a status file) riding
    the converging PR are a legitimate deliberate choice whose NAMED COST is
    one extra review round per tracking update; accept the cost knowingly or
    keep the tracker off the PR.

## Phase 7 — Merge-ready is a declaration with a gate, then the owner

Merge-ready means, re-verified at the declaration instant: all checks green
AND zero unresolved review threads AND no blocking ruleset finding, every
thread addressed by fix or explicit rejection. **The declaration NAMES ITS
DENOMINATOR** — whether the verdict quantifies over named cures only, changed
files, the whole file, or the whole contract (upstream instance: two reviews
five seconds apart returned ACCEPT and CHANGES-REQUIRED on the same head
because their denominators differed; a gate that does not name its set
cannot be adjudicated).

**Proportionality damper + useful-vs-theatre test** (upstream ruling,
graduated 2026-07-11): review rounds are severity-gated — wording-tier
findings take one cure commit, no ceremony, no further rounds on the class;
meta-evidence chains stop at ONE level; "residue-dry" means NO FINDING THAT
CHANGES A FUTURE AGENT'S ACTION, never textual perfection; new artefacts
land only if they cure a misrouting defect or conserve bytes whose
re-derivation needs a dying context. Then:

- **`mergeable` means POSSIBLE, never READY** (upstream owner insight,
  2026-07-08). GitHub's `mergeable: MERGEABLE` asserts conflict-freeness
  only and reads TRUE on a PR with failing checks and open review threads.
  Merge READINESS is `mergeStateStatus: CLEAN` — every requirement
  satisfied — and `BLOCKED`/`UNSTABLE`/`BEHIND` name what is not. Every
  readiness read (merge-ready declarations, "why isn't it merging"
  diagnoses) queries `mergeStateStatus`, never `mergeable`.
- **A checks-settled probe never proves a bot review round is complete**:
  bot reviews post on their own cadence, so gate on review-round completion
  per reviewer, never on the checks rollup alone. The concrete dual-signal
  recipe (upstream-proven across ten rounds): one watch that terminates only
  when BOTH (a) the checks rollup reaches a terminal state AND (b) a fresh
  review from each per-push re-reviewer exists ON THE CURRENT HEAD —
  matched by the head SHA the review itself cites, never by timestamp —
  with the unresolved-thread count read at that instant. A review on a
  prior head satisfies nothing.
- **The merge itself is owner-invoked** (standing castr posture, 2026-07-03:
  agents keep the branch continuously merge-correct; the owner performs the
  merge). Notify the owner at this action moment
  (`owner-attention-at-action-moments`); use the question tool, not
  prose-only.
- **An owner merge-go authorises the MERGE only — it never waives the
  reviewer gateway** (upstream, graduated 2026-07-12): work merged without
  its review round still owes that round post-hoc, and the post-hoc review
  gates ADOPTION and dependent use of the merged work, not just tidiness.
- **Under a shared credential, formal PR approval can fail estate-wide** —
  the platform treats every seat as the PR author ("Can not approve your
  own pull request"; upstream-proven live 2026-07-12). Review verdicts then
  carry as a PR comment plus the recorded review outcome; castr's shared gh
  credential has the same mechanism whenever the PR was opened under it.
  The structural cure — split machine identities so agent actions carry
  their own attribution and capability envelope — is
  [`PDR-126`](../../practice-core/decision-records/PDR-126-machine-identities-for-agent-fleets.md);
  adopting it here is an owner settings decision that triggers if a formal
  approval ever becomes required or fleet attribution becomes load-bearing.
- Owner preference observed (PR #3, 2026-07-03): merge commit, not squash.

## Phase 8 — After merge

Update continuity surfaces (delivery state, thread record, next-step spine),
close claims, and delete the merged branch only with owner authorisation
(`never-use-git-to-remove-work` governs destructive branch operations).

## Stacked-PR note

Stacked-PR bases vanish under delete-on-merge: the base branch's ref is
deleted the moment its PR merges ("Base sha can't be blank" on create is
the tell). After the base merges, create the stacked PR against the default
branch — the diff self-collapses to the increment.

## Failure modes this skill exists to prevent (observed here or upstream)

- REST-only comment reads declaring "no comments" over unresolved inline
  threads.
- Truncated comment skims triaged as "noise".
- Ready/merge-ready declared without re-fetching after the latest push.
- A failed check's downstream echoes debugged before its root cause.
- A blocking scanning gate treated as an opaque red badge instead of a
  finding list to fix at source.
- Tight `gh` polling loops in place of the budgeted watcher.
