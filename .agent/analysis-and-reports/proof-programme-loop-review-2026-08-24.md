# Proof-Programme Loop Review — 2026-08-24

**Commissioned:** owner, 2026-08-24 (widened scope: general analysis of what has
happened, general evaluation of the routine prompt and every routed skill, and
general opportunities for improvement, alongside the plan's structured legs).
**Reviewer:** Flamebright Burning Caldera (claude-code cloud, claude-fable-5,
session prefix `01FV6r`), thread `proof-programme-review`.
**Controlling plan:**
[`proof-programme-loop-review.md`](../plans/active/proof-programme-loop-review.md)
(promoted current/ → active/ as this session's first act; legs R1–R6).
**Seat discipline:** review-only — this seat executes no queue items, amends no
doctrine, and neither fires nor disarms the Routine; every opportunity below is
ROUTED (queue slice or ballot item), never enacted. One boundary note: experience
surfaces are written in-lane (this session's napkin entries, including a
correction to the 2026-08-23 state-file seed recipe); doctrine and skill
surfaces are only ever routed.
**Framing question:** will the loop, running unattended, converge toward the
programme's outcome — and what are its runaway and stall modes?

---

## R1 — Grounding: primary sources read in full

Every listed surface was read end to end this session. Deterministic check:
`test -f` passed for all eight repo paths (run 2026-08-24, this session), and
the live trigger state was read via `list_triggers` (output quoted verbatim in
§R2).

| Source                          | Path / locator                                                                                                       | Read      |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------- |
| ADR-051                         | `docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md`                           | full      |
| Parent plan + queue             | `.agent/plans/proof-programme/parent-plan.md` (910 lines; live queue derived from frontmatter)                       | full      |
| Routine prompt                  | `.agent/plans/proof-programme/routine-prompt.md`                                                                     | full      |
| Queued decisions                | `.agent/plans/proof-programme/queued-decisions.md`                                                                   | full      |
| Incident register               | `.agent/plans/proof-programme/incidents.md`                                                                          | full      |
| Ballot                          | `.agent/plans/proof-programme/ballot-2026-08-owner-walk.md`                                                          | full      |
| Loop-test report                | `.agent/plans/proof-programme/loop-test-kingfisher-report.md`                                                        | full      |
| Live trigger config + run state | `list_triggers` → `trig_01X4wYy2gHSb8yFhdhwbADGF`                                                                    | live read |
| Programme thread record         | `.agent/memory/operational/threads/proof-programme.next-session.md`                                                  | full      |
| Evidence lens                   | OCE retrospective `why-the-outage-outlived-its-six-character-fix-2026-08-24.md` (read from the OCE `engraph` branch) | full      |

**Live queue set derived from the parent-plan frontmatter** (never from the
review plan): rows Q-00..Q-17 exist, with Q-10..Q-12 having no Q-10a-style
inserts; statuses: Q-00, Q-01, Q-02 `completed`; every other row `pending`;
no row `in_progress`; no row `blocked`; no row carries a `failures:` field
(declared default 0); `zero_progress_streak: 0`.

### R1 drift findings (surface vs surface)

- **D-1 (platform vs review plan/review thread-record): `list_triggers`
  exposes even less run history than the review was told.** The review plan
  says "list_triggers carries only the most recent run, as last_run" and the
  review thread record (`proof-programme-review.next-session.md`) says the
  platform "exposes only the most recent run (last_run)". The live response
  for `trig_01X4wYy2gHSb8yFhdhwbADGF` carries **no `last_run` object at
  all** — only `last_fired_at: 2026-08-24T16:03:45Z`. There is no
  platform-side status, session id, or finish time for ANY firing.
  Consequence: platform attestation is limited to "the scheduler fired at
  time T"; everything else must come from durable repo/GitHub records (§R2).
- **D-2 (live trigger vs ballot B-15): notification configuration drifted
  from the ratified channel set.** B-15 (RATIFY): "push and email both on, no
  digest", re-checked at enable per the Q-01 brief. Live config:
  `"notifications": {"channel": {"push": true, "email": false, "slack":
false}}` — **email is off**. Either the enable-time re-check missed it, or
  a later settings pass (the 2026-08-23 model/auto-fix change) reset it.
  Clause-6 escalation delivery now rides on push alone.
- **D-3 (thread record vs live state): the programme thread record's landing
  target is stale and no firing has updated the identity table since
  2026-08-23.** It still names "PR #35 — Q-02 — is the open PR to drive"
  (merged 2026-08-23), and its PDR-027 identity table has no row for any
  scheduled firing after Fruited Swaying Leaf (2026-08-23), although the
  routine prompt's step 9 (QD-6 firing-scoped handoff) obliges every firing
  to add/update its row. Corroborates §R2's finding that no post-#35 firing
  has landed anything.
- **D-4 (Q-15 premises vs live container): the fresh-container gap list is
  measurably stale after the 2026-08-24 environment fix.** This review
  session runs in a fresh container of the shared "Practice Repos"
  environment: `node_modules` installed, `agent-tools/dist` built (the
  Practice CLIs ran without a build step), and `gitleaks 8.30.0` on PATH —
  all three of Kingfisher's measured absences (no dist, no gitleaks, and by
  implication unwired hooks) are now provisioned at session start. Q-15's
  brief should be re-scoped to re-verify rather than assume its 2026-08-22
  measurements (the thread record's fresh-facts note said exactly this; the
  queue row text still carries the stale framing).
- **D-5 (trigger prompt vs routine-prompt.md): no contradiction found** —
  the stored trigger prompt is a thin pointer (read `routine-prompt.md` on
  main; follow it exactly) plus the mis-armed fallback (stand-down naming
  the missing prompt; notify; stop without touching the queue). The file
  side carries the full protocol and binds authority to the parent plan and
  ADR-051. The two compose as designed; the fallback correctly lives only in
  the trigger. Cadence (cron `3 */8 * * *` = three/day) matches amended
  clause 2; model `claude-fable-5` matches the QD-5 owner action; the Slack
  MCP connector is attached, matching QD-7. An explicit none-found statement
  for this pair.
- **D-6 (trigger config, new fact for the estate): all scheduled firings
  share ONE configured outcome branch, `claude/dazzling-cannon`.** The
  Routine's `outcomes` names a single fixed branch. No surface in the
  programme estate mentions it; the routine prompt's landing routes
  (bookkeeping PR, open-PR head, deferral draft) assume firing-chosen
  branches. Whether fired sessions actually push there — and whether a
  shared fixed branch is itself a cross-firing collision surface — needs
  attestation in §R2 (the branch does not exist on the remote as of this
  read, which itself says no firing has pushed its outcome branch).
- **D-7 (Kingfisher test Routine): absent from the live trigger list** —
  `trig_014yUGodczfAVVxfq4oftiQ9` (the owner-configured test Routine) no
  longer appears in `list_triggers`. Presumed deleted after the Q-01 proof;
  recorded so nobody later infers a hidden second firing source. (One-shot
  completed triggers are hidden by default; a cron test Routine's absence
  most plausibly means deletion.)
- **D-8 (incidents.md vs branch reality): RESOLVED, no drift** — the PR
  record shows two distinct branches: `claude/optimistic-archimedes-vorrwr`
  is PR #35's head (the contested branch I-1 names, deleted after the
  2026-08-23 merge), and `claude/optimistic-archimedes-7es9jz` carried the
  interactive QD-landing PRs #38/#39/#40. I-1's text is accurate.
- **D-9 (parent plan, in-source contradiction): the Q-17 brief mis-numbers
  its own founding round.** `parent-plan.md`'s Q-17 brief opens "The ADR-051
  clause 4 carry-forward for the **tenth-round** Codex P2 findings on PR
  #35", while the same file's Q-02 evidence record ("A seventeenth round…"),
  the napkin ("clause 4 applied at review round seventeen"), and the
  delivery ledger ("round-17 residuals") all say seventeen. Three surfaces
  against one; the brief's number is wrong. (Surfaced by the docs-adr-expert
  review pass; verified against all four surfaces.)
- **D-10 (skill vs ADR — the sharpest doctrine drift found): castr's
  `pr-lifecycle` still tells every seat the merge is owner-invoked.**
  `.agent/skills/pr-lifecycle/SKILL-CANONICAL.md` (§merge step): "The merge
  itself is owner-invoked (standing castr posture, 2026-07-03…); notify the
  owner at this action moment." For a scheduled firing driving a programme
  PR this contradicts ADR-051 clause 3 as amended per QD-3
  (condition-based unattended merge for every non-draft programme PR). The
  attested firings followed the ADR, not the skill — but this is prose the
  unattended seat actually reads, in exactly the review's
  passive-doctrine-loses-to-fluent-artefacts class. (Surfaced by the
  docs-adr-expert review pass; verified against the skill file.) Routed
  with OP-2.
- **D-6 refinement (from §R2 evidence):** the configured outcome branch
  `claude/dazzling-cannon` is a PREFIX the platform suffixes per session —
  the live firing's PR #50 head is `claude/dazzling-cannon-hix55y`. The
  shared-fixed-branch collision concern is therefore withdrawn; what remains
  is only that no programme surface documents the outcome-branch convention.

---

## R2 — What has happened: the expected-firing account

**Method.** No platform source exports run history: the live `list_triggers`
response carries only `last_fired_at` (verbatim, read 2026-08-24 ~18:00Z, the
only platform-side run datum):

```json
"last_fired_at": "2026-08-24T16:03:45.318958Z"
```

(there is no `last_run` object — no per-run status, session id, or finish
time; see D-1). Expected firings are therefore derived from the live cron
(`3 */8 * * *` UTC → 00:03, 08:03, 16:03 daily) over the armed window, and
each is attested only against durable records: merged/open PRs and their
timestamps, the incident register, the napkin, the thread record's identity
table, and the delivery ledger. An expected firing with no durable evidence
is UNATTESTED — never inferred in either direction. The negative space was
searched, not assumed: `git ls-remote` over all refs (only
`claude/dazzling-cannon-hix55y` and `routine/loop-test-kingfisher` match any
firing-related pattern); `git log --all --remotes` over the
2026-08-24T00:00–16:00Z window (every commit belongs to the interactive
environment-outage session on `claude/document-review-reflection-k5eigv`);
the full open-PR set (16) and the recently-updated closed-PR set; and — from
the assumptions-expert verification pass — the GitHub events API (public
repo, deletion-surviving, ~90-day retention): **zero repo-side events of any
kind between 2026-08-23T22:42:07Z and 2026-08-24T08:22:10Z**, and no
closed-unmerged PR anywhere in #31–#50. The one near-miss needing
disambiguation: a branch-create at 08:22:10Z, 19 minutes after the 08:03
slot (the same fire-to-create latency as attested firing 6) — it is NOT a
firing: the branch is `claude/document-review-reflection-k5eigv`, whose
suffix spans 2026-08-23T20:17→2026-08-24T16:44 as one long-lived interactive
session, where fresh firings mint a new suffix each.

Timezone note: the owner's "the 01:03 session" (I-1) reconciles to the
00:03 UTC slot as BST (UTC+1); PR #35's first commit at 00:53:29Z supports
it. A per-firing durable discriminator exists and decided the attribution
questions below: the `Claude-Session` commit trailer.

**Armed window.** The Routine was created 2026-08-22T16:03:52Z (disabled per
the Q-01 arming order) and enabled as the last act of the Q-01 firing,
strictly after PR #33 merged (2026-08-22T18:23:32Z). The first eligible
scheduled slot was therefore 2026-08-23T00:03Z. Review window closes at this
reading (2026-08-24 ~18:00Z). Six expected firings:

| #   | Expected (UTC)   | Verdict                    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ---------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 2026-08-23 00:03 | **attested-with-evidence** | PR #35 (Q-02 slice) opened 2026-08-23T01:01:44Z by the fired session (first commit 00:53:29Z); I-1's owner-supplied identification of "the 01:03 session" as PR #35's author. Duration, from the durable trailer: 17 of PR #35's 23 commits carry `Claude-Session: …session_0126jWEvYAEJoR3pg68enEwf`, the last (round-16's `3938127`) at **2026-08-23T11:02:36Z** — the seat ran ≥11 hours, spanning its successor's entire window, its round-10 commit message explicitly acknowledging "a sibling firing's base-sync and QD-4 landing" while continuing the drive (trailers verified per-commit this session; I-1's "seven-plus hours" was the mid-incident read and understates).                                                                                                  |
| 2   | 2026-08-23 08:03 | **attested-with-evidence** | Napkin entry (Tidal Drifting Lighthouse, 2026-08-23); incident I-1 (two push rejections on PR #35's branch, reconcile-once-then-defer); its QD-4 carry-forward commit `b66df7d` (no session trailer) survives as an ancestor of PR #35's merged history. The commits that out-raced it (rounds 10–12, 08:48:46–09:34Z-era, then 13–16 to 11:02:36Z) all carry firing 1's session trailer — the "other writer" of I-1 is trailer-attributed, consistent with the owner's identification.                                                                                                                                                                                                                                                                                                |
| 3   | 2026-08-23 16:03 | **attested-with-evidence** | Napkin entry (Fruited Swaying Leaf); thread-record identity row (prefix `0690b2`); PR #35 driven to merged 2026-08-23T17:28:15Z under ADR-051 clause 3 (30 review threads disposed; round-17 residuals → Q-17).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 4   | 2026-08-24 00:03 | **UNATTESTED**             | No durable record of any kind: no PR, no branch, no commit, no event (events-API sweep above), no incident entry, no identity row, no counter increment. Context (not attestation): the shared cloud environment's setup script was fatal-from-birth from 2026-08-23T17:12Z (the script's birth commit `a3634ea54` per the OCE retrospective, this review's cited evidence lens) until the fix built ~2026-08-24 midday — a FRESH-container failure specifically; the interactive session pushing throughout the window was a resumed container the outage did not touch. A failed-to-start fresh session is consistent — but the records equally admit "fired into a broken container and died silently". Nothing durable distinguishes these; two owner-side checks could (§F-R2-1). |
| 5   | 2026-08-24 08:03 | **UNATTESTED**             | Same as #4 — zero durable evidence either way; same outage context.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 6   | 2026-08-24 16:03 | **attested-with-evidence** | Platform `last_fired_at` 16:03:45Z; PR #50 (Q-03 / F-01 security AND-groups) opened 17:24:58Z from `claude/dazzling-cannon-hix55y`; `FIRING-LEASE` comment posted 17:25:13Z by "Luminous Waning Orbit … driving from 2026-08-24T17:25:07Z until 2026-08-24T22:06:00Z"; PR carries the Q-03 row flip to `completed`, the Q-03 evidence record, the thread-record identity row, delivery-ledger and continuity state. **Live at review time** (PR last updated 18:06Z; lease unexpired).                                                                                                                                                                                                                                                                                                 |

**What each attested firing did, and what it cost** (durable evidence only;
no token/cost telemetry is exported by the platform):

- **Firing 1** authored the whole Q-02 slice and PR #35, then kept driving
  its review rounds for 7+ hours — one cadence interval has no duration
  bound at that point; this firing IS incident I-1's "other writer". Cost:
  the collision, and the QD-5 machinery built to cure it.
- **Firing 2** deferred correctly on collision (reconcile once, stop
  pushing, no new claim) and recorded QD-4 — substantive progress under the
  streak rules, so `zero_progress_streak` legitimately stayed 0. Its
  incident write-up (I-1) landed via the interactive QD-5 session's PR #38,
  not by the firing itself — the register did not exist during its window.
- **Firing 3** completed the drive: all remaining PR #35 threads disposed
  per clause 4 (17 rounds total — the napkin records clause 4 applied at
  round 17 with residuals to Q-17), merged at CI green, ~1.4 h from spawn to
  merge. The queue's `Q-02: completed` claim on main matches the merge —
  verified against the PR record, not trusted.
- **Firing 6** claimed Q-03 (next eligible row after Q-02), executed the
  F-01 IR-model slice with pre-execution reviews (`code-reviewer`,
  `openapi-expert`), four post-execution dispatches, red-first proof through
  the Q-02 runner, and opened PR #50 (+1418/−218 across 44 files) ~1.3 h
  after spawn, with the lease posted and the state landing riding the PR's
  final commit exactly per protocol. At reading time its base has diverged
  (PR #49 merged 17:40 → `mergeable_state: dirty`) — the drive loop's next
  moves (merge base forward, re-green, merge) are still inside its lease
  window.

**Discrepancies and observations (R2 findings):**

- **F-R2-1 — the kill-switch counter is blind to firings that never run.**
  Firings 4 and 5 left no counter increment because the increment is landed
  BY the firing: a session that fails to spawn (or dies before grounding)
  cannot increment `zero_progress_streak`, and `list_triggers` records no
  per-run status (D-1). Two consecutive scheduled slots produced nothing
  and **no repo-durable instrument, and no instrument the loop itself
  reads, observed the absence**. Two owner-side instruments were NOT
  checked by this review and remain open verification items: (a) whether
  the push-notification channel delivered anything (or a failure notice)
  for the two slots — the owner's notification history can answer this;
  (b) the trigger's enabled-state history across the window (a settings
  pass had occurred 2026-08-23T17:05Z; the review read only the current
  `enabled: true`). Within the loop's own observational reach, absence of
  self is invisible. (The owner happened to be mid-outage-repair anyway;
  an unattended week with the same failure would have been silent to the
  loop.)
- **F-R2-2 — `zero_progress_streak: 0` on main is TRUE but only by luck of
  composition.** Every attested firing either made substantive progress or
  legitimately reset/held the streak; the two unattested slots put nothing
  in. Had firings 4/5 run and idled, their increments were duty-bound to
  land; had they failed mid-landing, the streak would silently understate.
  The counter's integrity currently depends on every firing both running
  and completing its landing.
- **F-R2-3 — identity-seed defect measured live again**: PR #50's thread
  record row carries `session_id_prefix: "sessio"` — the degenerate prefix
  from hashing the raw `session_…` id, on Q-15's gap list since 2026-08-22,
  now polluting the PDR-027 identity table on main (two distinct firings
  would be indistinguishable at prefix level).
- **F-R2-4 — attestation asymmetry**: interactive sessions (QD landings,
  PRs #36–#40) and firings that reach PR-open leave rich durable trails;
  a firing that dies pre-push leaves literally nothing. The incident
  register only records incidents a LIVE firing writes. Sub-finding: the
  best per-firing discriminator — the `Claude-Session` commit trailer —
  is inconsistently applied: firing 1's commits all carry it (it decided
  the I-1 attribution above), while firing 2's landing (`b66df7d`) and
  firing 3's landings (`546b026`, `fee61bd`) carry none. A one-line
  trailer duty would make every future firing commit self-attributing
  (routed with OP-8).
- **F-R2-5 — no bookkeeping PR has ever been opened.** Every landing so far
  rode a slice PR (#35, #50). The entire bookkeeping-PR / shared
  deferral-draft machinery (QD-5's contested route, draft pickup, stacked
  deferral counting) is as yet unexercised — design, not measured
  behaviour. First real exercise will be the first idle or deferring firing
  with no open PR.

---

## R3 — Loop dynamics: mechanism verdicts

Vocabulary (per the plan's validation contract): **instrument-backed** — a
durable artefact or platform mechanism fires independently of a seat choosing
to comply; **prose-only** — a written instruction whose execution depends on
the firing session reading and obeying it; **broken** — evidenced not to work
as specified. Compliance evidence is noted per row; prose-only is not an
insult (an LLM seat reading a prompt is the loop's execution substrate), but
the OCE lens applies: _a twice-recurred prose-only failure class earns a
structural firing point_.

| Mechanism                                                                                     | Verdict                                                               | Evidence that decided it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| STOP file (single literal path, checked first)                                                | prose-only                                                            | The two surfaces that name a literal path (trigger prompt, routine prompt step 1) agree exactly; ADR clause 6 and the parent plan deliberately delegate the path ("a STOP file in the programme collection"). One live compliance instance (Kingfisher §1 checked it). Race window: checked once at firing start — a STOP landed mid-firing is unseen until the next firing; bounded by clause 2's duration bound (≤1 cadence interval). Contest-aware landing route specified.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Owner kill (pause/delete Routine)                                                             | instrument-backed                                                     | Platform mechanism; disable/enable transitions proven live in the Q-01 arc (created-disabled → manual fire → enable-at-merge).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `zero_progress_streak` kill switch (3 idle → disable + notify)                                | prose-only, with an unproven reach                                    | Counter is durable, explicitly initialised (absence = drift, good). But: (a) only a LIVE firing increments it — fail-to-spawn is invisible (F-R2-1, measured twice); (b) the disable act requires trigger-management capability from a fired seat — **no fired session has ever proven it can call the platform's trigger tools** (Kingfisher probed GitHub MCP only); (c) the idle-increment landing machinery is unexercised (F-R2-5). The counter has never left 0 — the switch has never been nearer than three increments away.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| WIP=1 drive-or-claim                                                                          | prose-only, complied 4/4                                              | All attested firings honoured it, including correct discrimination of programme PRs from the 15 open non-programme PRs (the open set is 16 including programme PR #50; firing 6 ignored #10–#28 and claimed Q-03). No enforcement instrument; a non-compliant firing would be caught only by the next firing's scan.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Overlap guard: FIRING-LEASE + head-recency                                                    | **instrument-backed** (posting proven; reading unexercised)           | The lease is a durable PR-comment artefact on the shared remote — posted live on PR #50 at 17:25:13Z with expiry equal to the clause 2 landing cutoff (22:06 ≈ spawn+6h, correctly computed). No successor has yet read a lease (the guard's consumer side is untested). Head-recency fallback specified for lease-less branches.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Firing duration bound + ¾-interval landing cutoff                                             | prose-only                                                            | Encoded in the live lease's own expiry (evidence the firing internalised it). The one measured violation (firing 1's 7+ hours) PREDATES the rule — the rule is its cure; no post-rule firing has run long enough to test it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Pre-push head re-check + contested-branch rule                                                | prose-only, unexercised since landing                                 | Written into routine prompt step 5 after I-1; no contested push has occurred since.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Review-bot convergence cap (ADR-051 clause 4)                                                 | prose-only, **measured insufficient at the threshold, not the count** | PR #35 absorbed SEVENTEEN review rounds. Precision matters here (review-pass correction): rounds 12–16 cured **artefact-mutation defects** — a live caller artefact corrupted during diagnostic formatting, "defeating the documented 'artifacts stay pristine' contract", each confirmed empirically — which clause 4's data-loss exemption legitimately makes blocking in every round; only round 17's two residuals are recorded as provably diagnostics-only. So the cap did not leak by misclassification round-by-round; rather the ARC shape — six consecutive rounds narrowing one concern, named "whack-a-mole rather than converging" in the evidence record itself, with the structural step-back arriving only at round 15 — is the OCE unbounded-reference generator, and nothing counted rounds against any threshold as they accrued: the ordinal count existed as narrative prose (reconstructed per seat, readable across the session boundary — the cap DID fire at round 17), but no machine-checkable tally exists at merge time, and castr's `pr-lifecycle` contains **zero** mentions of one (`grep -i tally` = 0 hits). Confounder on the measurement: the platform's "Auto-fix pull requests" behaviour was ON for most of PR #35's life (turned OFF in the 2026-08-23 settings pass; incidents.md names it "a plausible mechanism behind the rapid review-round pushes"), so some of the 17-round cadence may be a removed platform feature. The unconfounded current observation: PR #50, post-auto-fix, drew seven bot review submissions in its first hour (17:28:59→18:27:50, from its reviews list) — review-EVENTS, not fix-rounds (each push legitimately draws a re-review), but the pressure the cap must bound is live and current. |
| Red-head repair branch (B-16)                                                                 | prose-only, unexercised                                               | No red-head arrival evidenced in any firing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Bookkeeping-PR / shared-deferral-draft landing routes                                         | prose-only, unexercised, complexity-flagged                           | Never once exercised (every landing so far rode a slice PR). The choreography a zero-context seat must execute — freshest-counter read across three surfaces, stacked-deferral exactly-once counting, draft pickup on contest-clear — is an untested distributed algorithm. First live test will be under exactly the confusing conditions (contest) it exists for.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Mis-armed fallback (trigger prompt)                                                           | prose-only, unexercised, sound                                        | Fires only if `routine-prompt.md` vanishes from main; correct stand-down semantics.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Terminal exit (queue empty + Tranche-14 certificate)                                          | prose-only, unreachable today **by design**                           | The acceptance command (`proof:certify`) does not exist yet ("once built", parent plan). Reachability depends on the Q-12 split producing it; the interim exits (owner close, kill switches) cover the gap. Not broken — declared future; but `loop-exit-criteria-required`'s "reachable and tested" bar is currently met only by the owner-side exits.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Completion notifications (B-15)                                                               | instrument-backed, **config drifted**                                 | Platform feature, delivery receipts proven in the Q-01 arc. Live config has email OFF against B-15's "push and email both on" (D-2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Cadence self-lowering (clause 2: agents may lower, never raise, when firings repeatedly idle) | prose-only, unexercised                                               | No firing has idled repeatedly; also inherits the same unproven fired-seat trigger-capability question as the kill switch. (Row added at review-pass prompting — R3's DONE WHEN requires every named mechanism carry a verdict.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| QD-8 mobile alert + ballot from a fired seat                                                  | prose-only, capability unmeasured                                     | The prompt itself carries the honest caveat (measured only from interactive sessions); Q-15 owns the probe. Same for Slack/The Watcher tools (QD-7): attached to the config, never observed by a fired session.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

**Runaway modes (bounded? by what?):**

1. **In-PR review-cure treadmill** — measured (17 rounds, PR #35, with the
   auto-fix confounder noted in the table; and PR #50's live seven
   review-events-per-hour pressure, unconfounded). Bounds today: the firing
   duration bound (time, not rounds) and clause 4 applied per-seat from a
   prose count. The machine-checkable tally does not exist; the arc shape
   (consecutive rounds narrowing one concern) has no observable surface
   until a seat reconstructs the narrative. This is the loop's sharpest
   measured runaway, and it matches the OCE retrospective's mechanism
   precisely (each cure creates the re-reviewable surface the next finding
   feeds on).
2. **Gate-restart loop** (`gates` skill restarts from `pnpm build` after
   every fix) — a cost amplifier, not a divergence: bounded by the firing
   window.
3. **No per-firing cost budget exists** beyond wall-clock — token/compute
   spend per firing is unmeasured and unbounded within the window (the
   platform exports no cost telemetry for firings).

**Stall modes (what un-sticks them?):**

1. **Silent scheduler/environment failure** — measured (firings 4–5). The
   loop stopped for ~16 hours and NOTHING observed it: streak frozen at 0,
   no incident, no notification evidence, kill switches unreachable. The
   un-sticking event was exogenous (the owner fixing the environment for
   other reasons). This is the loop's sharpest measured stall: absence of
   self-report is indistinguishable from "loop retired".
2. **Contested-branch stacking** — the untested deferral-draft choreography;
   a botched execution strands counter state (un-sticking: the draft-pickup
   rule, itself untested).
3. **Queue exhaustion by blocked rows** — currently impossible (Q-04..Q-09,
   Q-13..Q-17 all eligible now); the graph has no cycles and Q-10's gate is
   live-able via Q-14.
4. **WIP=1 drive-starvation (livelock)** — surfaced by the review pass, not
   yet measured to completion but its ingredients are all live: every
   firing must drive the open programme PR and "do nothing else"; a drive
   commit counts as substantive progress, so the streak resets on every
   firing; clause 3 requires the base not diverged. A PR that keeps being
   re-diverged by an active interactive lane (five merges to main in the
   24 h around PR #50's opening; #50 went `dirty` ~15 minutes after it
   opened) or keeps drawing bot rounds faster than a firing disposes them
   could consume every firing indefinitely while the queue advances by
   nothing — and the three-idle kill switch never moves, because driving
   IS progress. Silent AND expensive; no bound in time, cost, or counter
   exists today. Smallest instrument: a per-row drive-attempt counter
   (firings spent on one PR without reaching merge), which composes with
   OP-2's tally; routed into OP-2.

---

## R4 — Queue health: verified-status per row

Completed claims verified against git/PR state, never trusted. Verification
commands run this session: `git log --oneline origin/main` (tip `89914b4`);
`list_pull_requests` / `search_pull_requests` over EngraphCode/castr (open
set = 16, quoted in §R2/§R5 evidence); `test -f` / `ls` for on-disk premises.

| Row        | Status (main)                                      | Verified?                | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-00       | completed                                          | ✓                        | Ballot file CLOSED with all ten verdicts; ADR-051 Status line Accepted-as-amended; PRs #31 (merged 2026-08-22T13:54Z) + #32 (14:27Z).                                                                                                                                                                                                                                                                                                                                       |
| Q-01       | completed                                          | ✓                        | Live trigger enabled, cron `3 */8 * * *`, fresh-session mode, repo attached (PR #50 proves credentialed landing); PRs #33 (18:23Z) + #34 (19:04Z) merged; Kingfisher report on `routine/loop-test-kingfisher`.                                                                                                                                                                                                                                                              |
| Q-02       | completed                                          | ✓                        | PR #35 merged 2026-08-23T17:28:15Z; runner + 19-test suite on main; delivery-ledger row concurs.                                                                                                                                                                                                                                                                                                                                                                            |
| Q-03       | pending on main; **completed in-flight on PR #50** | ✓ (protocol-consistent)  | The row flip, evidence record, ledger row, and thread identity row all ride PR #50's final commit per protocol step 4 — main shows it the moment the PR merges. PR #50 head `f168dac`, base diverged (PR #49) → `mergeable_state: dirty`; drive live under an unexpired lease at reading time.                                                                                                                                                                              |
| Q-04, Q-05 | pending                                            | premises hold            | Defect surfaces named (json-schema parser boolean branch; the two `return true` refinement sites) are product-code claims the executing firing re-verifies per the brief; no counter-evidence found.                                                                                                                                                                                                                                                                        |
| Q-06       | pending                                            | ✓ premise                | PR #14 open (created 2026-07-17).                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Q-07       | pending                                            | ✓ premise                | PR #21 open.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Q-08       | pending                                            | ✓ premise                | `.agent/directives/ADR-044/045/046*.md` duplicates confirmed on disk this session.                                                                                                                                                                                                                                                                                                                                                                                          |
| Q-09       | pending                                            | ✓ premise                | PR #10 open; PR #28 open (draft, preservation copy).                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Q-13       | pending (outcome gate)                             | ✓ premise                | PR #23 open — and NOTE: #23 is the natural VEHICLE for the `pr-lifecycle` tally instrument this review wants (OP-2), not the instrument itself: its patch adds a bot-review convergence discipline but no tally artefact and no step-back trigger (its one `tally` mention says the opposite — "never trust a ledger's tally"; verified by the docs-adr-expert pass against the PR patch). Executing Q-13 delivers the re-sync; OP-2's amendment must ride it or follow it. |
| Q-10       | pending, blocked on Q-14                           | ✓ edges                  | `depends_on: [Q-00 ✓, Q-14 pending]` — correctly held; the charter-before-consumer ordering rationale is recorded.                                                                                                                                                                                                                                                                                                                                                          |
| Q-11       | pending                                            | ✓ edges                  | `[Q-10, Q-02 ✓]`.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Q-12       | pending                                            | ✓ edges                  | `[Q-11]`; split-at-execution design sound (single moving-target source).                                                                                                                                                                                                                                                                                                                                                                                                    |
| Q-14       | pending, eligible                                  | ✓                        | B-09 APPROVE recorded; decided inputs from the 2026-08-23 owner walk named in the brief.                                                                                                                                                                                                                                                                                                                                                                                    |
| Q-15       | pending, eligible                                  | **premises STALE** (D-4) | Fresh-container measurements (no dist, no gitleaks, no hooks) predate the 2026-08-24 environment fix — this session's fresh container had all three provisioned. The still-live parts: identity-seed defect (F-R2-3, re-measured TODAY on PR #50), fired-seat capability probes (artifact/push, Slack tools, and — add from R3 — the trigger-disable capability the kill switch assumes), hermetic gitleaks-classifier tests, cross-container claim visibility.             |
| Q-16       | pending, eligible                                  | ✓ premise                | `.agent/plans/templates/` confirmed absent this session.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Q-17       | pending, eligible                                  | ✓ premise                | Carry-forward threads recorded on merged PR #35.                                                                                                                                                                                                                                                                                                                                                                                                                            |

**Counters:** `zero_progress_streak: 0` on main — consistent with the
attested record (§R2 F-R2-2) but structurally fragile. No row carries a
`failures:` field — correct under the declared absent=0 default (no firing
has failed a slice twice).

**Decision surfaces:** `queued-decisions.md` — QD-1, QD-2, QD-4 OPEN;
QD-3/5/6/7/8 carry recorded outcomes with landings executed (verified against
ADR-051's amendment trail, the routine prompt, incidents.md, and the pattern
files named in QD-6). No orphaned decision (every OPEN row has an owner
venue: QD-1 deferred-with-trigger, QD-2 re-entry record, QD-4
awaiting-owner-reading), and no double-owned decision found. The ballot is
CLOSED and every gate the queue cites resolves to a recorded verdict. The
routine prompt's step-3 duty (carry OPEN QDs into every completion
notification) is unverifiable from durable state — notifications are not
repo state — noted, not a defect.

**Incident register as a signal surface:** functioning on its single
instance — I-1 fed Q-15's gap list, the QD-5 ruling, ADR amendments, and the
routine prompt's guard machinery. Incidents do feed back; the register's
weakness is coverage, not routing (a dead firing writes no incident —
F-R2-1/F-R2-4).

**Queue-rot watch (new):** PR #50's F-01 fix partially supersedes open
remediation PR #18 (lane L-D, "security AND-groups C2/C3", 2026-07-18). The
extraction rows (Q-12-era, §11.3) must re-verify #18's remaining unique value
at claim time — the premise-re-verification duty already covers this; named
here so it is not rediscovered.

---

## R5 — Routine definition and routed skills, general evaluation

### Prompt vs live trigger config

The stored trigger prompt, verbatim (from `list_triggers`, 2026-08-24):

> You are a scheduled firing of the castr proof-programme autonomous loop
> (ADR-051, Accepted 2026-08-22; owner: jimCresswell). Read
> `.agent/plans/proof-programme/routine-prompt.md` on the repository's main
> branch and follow it exactly — it is your complete standing brief (exit
> criteria, STOP check at the literal path
> .agent/plans/proof-programme/STOP, claims scan, WIP=1 drive-or-claim, the
> red-head/queued-decision/blocked-slice branches, counter landing rules,
> stand-down broadcast, session handoff). If that file does not exist on
> main, treat this firing as mis-armed: post the stand-down broadcast naming
> the missing prompt, notify the owner in your completion summary, and stop
> without touching the queue.

Diffed both directions against `routine-prompt.md` (the authority): the
stored prompt's protocol inventory names only elements the file carries, and
names them accurately; the file's additions (dry-run detection, overlap
guard/lease detail, Slack/Watcher, reporting surfaces) are all
pointer-reachable and belong file-side by the design (a thin stored pointer
means prompt evolution needs no trigger update). The mis-armed fallback
correctly lives ONLY in the trigger. **No contradiction found** (D-5).
Config: cadence, model, Slack connector all match rulings; the one drift is
notifications (D-2, email off vs B-15). The outcome-branch convention
(`claude/dazzling-cannon` + per-session suffix, D-6) is undocumented in the
programme estate but working — PR #50's head is exactly such a branch.

### Fresh-session model's assumptions (what a fired seat can actually do)

Verified capabilities (from firing evidence): repo clone at main with push
credentials (Kingfisher, PR #50); GitHub MCP tools (Kingfisher probe; PR #50
opened/commented); PR comment + label surfaces (lease posted). Provisioned
since the 2026-08-24 environment fix: node_modules, `agent-tools/dist`,
gitleaks (this session's fresh container). Unverified capabilities the
doctrine leans on: trigger self-disable (the clause 6 kill switch's final
act), artifact publishing + push notification (the ballot path), Slack tool
surface (QD-7), and the platform's behaviour when a firing fails to spawn
(no `last_run` object exists — D-1 — so even the owner's console may show
nothing). The prompt handles the unverified set honestly (probe-first
caveats), except trigger self-disable, which no surface flags as unproven.

### Per-skill fit verdicts (unattended seat)

| Skill                       | Routed by                                                   | Verdict                                                                               | Evidence / gap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engraph-start-right-quick` | routine prompt step 3                                       | **FIT**                                                                               | Grounding reads + live-state checks compose unattended; the claims CLI's fail-on-absent state files is now cured at the environment layer (files still need seeding — the seed recipe lives in the napkin, which the skill routes the seat to read; nonetheless an `init` subcommand remains the structural cure, and the napkin's 2026-08-23 recipe is WRONG for the archive file — corrected in this session's napkin entry).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `engraph-gates`             | via `pnpm check` duties                                     | **FIT (cost caveat)**                                                                 | Restart-from-`build` after every fix is correct for convergence but expensive unattended; bounded by the firing window. Turbo caching absorbs most of it. No change proposed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `engraph-go`                | NOT routed by the loop                                      | **correctly unrouted**                                                                | Its deliberate self-re-reading recursion is an interactive re-grounding device; keep it out of the firing path. No action.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `engraph-pr-lifecycle`      | firing drive duties (Q-01 evidence names it)                | **PARTIAL FIT — the load-bearing gap of this review**                                 | Harvest-every-surface, budgeted watcher, and "0 unresolved is a moment" all compose unattended. But the round-tally + step-back instrument is entirely absent from castr's copy (zero `tally` hits) while ADR-051 clause 4 — the loop's only review bound — presupposes round counting. OCE's twin carries the tally contract and its 2026-08-24 retrospective graduates it to a PR-open structural requirement after a third unbuilt instance; castr's PR #35 is functionally a fourth. A second drift compounds it (D-10): the skill's merge step still says "the merge itself is owner-invoked" — for a programme PR that contradicts ADR-051 clause 3 as amended per QD-3, and it is prose the unattended seat actually reads (the attested firings followed the ADR, not the skill). The re-sync vehicle sits unmerged in PR #23 (Q-13's subject) and itself carries no tally. Interactive precedent exists in-estate: PR #49's drive declared a 2-round budget and routed post-budget findings — the discipline works when practised; it has no surface a firing reads. |
| `engraph-commit`            | always-on                                                   | **FIT (two mechanical gaps)**                                                         | The ceremony ran unattended across firings (PR #35/#50 commits landed through the full hook chain). Known cannot-conclude cases: merge commits (napkin 2026-08-23) and staged renames (measured this session) — both need the documented plain-landing deviation; a firing meeting either cold burns window time rediscovering it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `engraph-session-handoff`   | routine prompt step 9                                       | **FIT**                                                                               | The QD-6 firing-scoped profile's every citation resolves against the current skill text (steps 6d, 9–10, 11a, and the step 12 scheduled-firing clause with its cross-container singleton note — all verified present). Absence rules (fresh-container memory surfaces) are explicit. Minor cosmetic drift: step 2's field list names headings (`Branch-primary lane state`, `Current session focus`) that `repo-continuity.md` does not use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `engraph-wrap`              | NOT routed by firings (correct); this review's own closeout | **FIT for its lane + two seeded sequencing refinements (PR #49 review, routed here)** | (1) _Stale-broadcast ordering_: team-wrap closeout broadcasts are emitted by session-handoff BEFORE the loss/metaloss scans; a scan that changes the outcome or remaining-work disposition leaves peers holding a stale synthesis — wrap step 7 should require a corrective broadcast whenever a scan pass changes the closeout truth. (2) _Formation-letter ordering_: a voluntarily written letter lands AFTER step 7's re-gate and final safety statement, leaving an uncommitted continuity file behind the "final" evidence — the coda should either precede step 7 or carry its own close: land the letter via the orphan continuity-commit route and restate the safety line. Both are proposals in §R6, not enacted here.                                                                                                                                                                                                                                                                                                                                             |
| `engraph-semantic-merge`    | rules layer (continuity merges)                             | **FIT, soon load-bearing**                                                            | PR #50 and this review's branch both edit the napkin, repo-continuity, and thread records; whichever merges second must concept-merge, not line-merge.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `engraph-consolidate-docs`  | programme completion only                                   | **correctly bounded out**                                                             | Firings record `due — <reason>` at most (clause 2 duration bound); verified consistent between prompt and skill.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

---

## R6 — Synthesis, verdicts, and opportunities

### The framing question, answered

**Will the loop, running unattended, converge?** On the evidence: **yes,
with two measured structural caveats and one surfaced-but-unmeasured third.**
The cures below are cheap to build but honestly partial — OP-1 in
particular covers the intermittent case, not sustained absence; the
external-observer half is named inside it.

Every attested firing behaved correctly for its situation: authored a slice,
deferred on collision (reconciling once, exactly per later-ratified policy),
completed a drive to merge under clause 3, or claimed the next eligible row
and executed it to a high evidential standard (PR #50's red-first proof and
review fan-out match the estate's interactive quality bar). The authority
machinery works as designed: eight genuine forks became QD rows; five are
resolved by owner ruling with the landings executed and verifiable; none
stalled the loop. The queue is finite until the Q-12 split, its dependency
graph is acyclic with eligible rows available, and completed claims verify
against the PR record 4/4.

The caveats:

1. **The loop cannot see its own absence** (stall class, measured). Two
   consecutive scheduled slots produced nothing durable and no instrument
   noticed — the platform exports no per-run status (D-1), the kill-switch
   counter increments only from inside a live firing, and the stand-down
   machinery presumes a firing exists to run it. Recovery was exogenous.
2. **Its only review bound is elastic** (runaway class, measured — with
   the precision the review pass forced). Clause 4's data-loss exemption
   legitimately carried rounds 12–16 of PR #35 (artefact-mutation defects,
   each verified real); the defect is that the ARC had no observable
   surface — no machine-checkable round tally exists at merge time in
   castr's `pr-lifecycle` (the instrument OCE has now watched go unbuilt
   three times), the six-rounds-one-concern shape was visible only in
   retrospect, and the measurement carries an auto-fix-era confounder now
   removed. Time (the firing duration bound) is currently the only hard
   stop, and it is a per-firing stop: the treadmill can resume next firing
   on the same PR — PR #50's first hour (seven bot review events) shows
   the pressure is current.
3. **WIP=1 drive-starvation** (stall class, surfaced by review, not yet
   measured): a repeatedly re-diverged or bot-pressured PR consumes every
   firing as "progress" while the queue and kill switch stand still —
   §R3 stall mode 4; instrument routed into OP-2.

Reflexes vs paperwork: the paperwork is genuinely good — surfaces are
largely consistent (see §R1's D-findings; two are explicit none-found
statements, and only D-2 drifts against a ratified verdict), the
QD/ballot/ADR trail is auditable end to end, and the one live firing
observed mid-review was following the newest machinery (lease, state-landing
composition) to the letter. The under-built half is reflexes that fire
WITHOUT a well-behaved seat: liveness observation, round counting,
capability proof for the kill switch's final act.

### Verdicts per surface

| Surface                                                                                     | Verdict                                                                                                                             | Basis                                                                                                            |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ADR-051                                                                                     | **KEEP** (one decision-class amendment routed: OP-3)                                                                                | Clauses map to working machinery; amendment trail accurate (R1).                                                 |
| `parent-plan.md` + queue                                                                    | **KEEP** (FIX via OP-5: Q-15 re-scope; plus the D-9 one-word correction — the Q-17 brief's "tenth-round" should read "seventeenth") | Queue verified healthy (R4); briefs-are-plans working as ratified.                                               |
| `routine-prompt.md`                                                                         | **KEEP** (FIX via OP-1, OP-5)                                                                                                       | Complete, honest about unmeasured capabilities, proven followable by a zero-context seat (R2 firing 6).          |
| Live trigger config                                                                         | **FIX** (OP-4: email channel)                                                                                                       | D-2 vs B-15.                                                                                                     |
| `queued-decisions.md`                                                                       | **KEEP**                                                                                                                            | No orphaned or double-owned rows (R4).                                                                           |
| `incidents.md`                                                                              | **KEEP**                                                                                                                            | Routing proven on I-1; coverage gap is OP-1's subject, not the register's defect.                                |
| Ballot                                                                                      | **KEEP** (closed record)                                                                                                            | Verdicts all recorded and executed (R4).                                                                         |
| Kingfisher loop-test report                                                                 | **KEEP** (historical evidence)                                                                                                      | Measurements superseded by D-4 are dated, not wrong.                                                             |
| Programme thread record                                                                     | **KEEP**                                                                                                                            | Self-healing by design (re-derive from queue); D-3's staleness is the identity-table gap OP-1 addresses at root. |
| `pr-lifecycle` skill                                                                        | **FIX** (OP-2: tally instrument)                                                                                                    | The review's load-bearing gap (R5).                                                                              |
| `wrap` skill                                                                                | **FIX** (OP-7: two sequencing refinements)                                                                                          | Seeded from PR #49's routed review findings (R5).                                                                |
| `commit` skill                                                                              | **FIX** (OP-8: cannot-conclude cases)                                                                                               | Two measured instances (R5).                                                                                     |
| `session-handoff`, `gates`, `start-right-quick`, `go`, `semantic-merge`, `consolidate-docs` | **KEEP**                                                                                                                            | Fit verdicts in R5; cosmetic drifts noted there.                                                                 |

**Nothing earns RETIRE.** Explicitly considered and rejected: the
bookkeeping/deferral-draft machinery (unexercised ≠ unneeded — it is the
counter's only landing path for the idle case) and the Slack/Watcher tier
(unmeasured from fired seats, but owner-directed and correctly caveated).

### Opportunities (each: warrant + falsifier; routed, never enacted here)

- **OP-1 — Predecessor attestation + an external liveness observer.**
  Honestly two halves, because the in-loop half CANNOT cover the regime
  that motivates it (review-pass P1: under sustained absence there is no
  firing to run the check). (a) In-loop, for the intermittent case: add
  one step to `routine-prompt.md` grounding — derive the predecessor's
  expected slot from the cadence; if the durable record shows no trace (no
  lease, no PR/branch activity, no counter or identity delta) and no STOP
  file explains it, append an `other`-class incident "expected firing <T>
  unattested" via the normal landing path (a legitimately idle predecessor
  always lands a counter increment, so a trace-less slot implies
  failure-to-run). (b) External, for sustained absence — the primary cure:
  an observer OUTSIDE the loop reads staleness without needing a firing —
  e.g. a second minimal Routine at offset cadence whose only job is to
  read `last_fired_at`/repo freshness and notify on staleness, and/or The
  Watcher (QD-7's existing owner-side session) given that standing check.
  Half (b) adds an observer mechanism ADR-051 does not currently name, so
  it is an owner decision, not a prompt edit. _Warrant:_ firings 4–5
  (F-R2-1) — ~16 h of stall invisible to every instrument the loop can
  read; the stall was TWO slots, already past what half (a) alone would
  have caught at most one slot sooner. _Falsifier:_ (a) a false positive —
  a predecessor that DID run recorded as missed (e.g. its landing
  un-merged on a contested draft the checker failed to find); (b) the
  observer itself going silent unnoticed — accepted residual, since it is
  owner-visible where the loop is not. _Route:_ (a) queue slice
  (mechanical prompt amendment; incident recording is owned by ADR-051
  clauses 6 and 7 as amended — no doctrine change); (b) **owner ballot
  item** alongside OP-3.
- **OP-2 — Build the round tally at PR-open, structurally — and count
  drive-attempts per row.** Bring the tally-store + step-back contract
  into castr's `pr-lifecycle`, amended per OCE's retrospective proposal 2:
  opening or adopting a bot-reviewed PR CREATES the tally artefact before
  first triage; a tally-less PR is out of contract. Stated precisely
  (review-pass correction): the round COUNT already exists as narrative
  prose and even crossed a session boundary (the cap fired at round 17);
  what does not exist is a machine-checkable tally at merge time, an
  observable arc shape as rounds accrue, and any surface a zero-context
  firing reads without reconstructing an evidence record — so OP-2 is the
  durability/automation half, and **OP-3 is the half that changes where an
  arc stops**; OP-2 without OP-3 changes nothing about arc endings. Ride
  or follow Q-13's PR #23 re-sync (the VEHICLE — its patch carries a
  convergence discipline but no tally artefact), and in the same landing
  cure D-10 (the skill's "merge is owner-invoked" line contradicts ADR-051
  clause 3 for programme PRs) and add the per-row drive-attempt counter
  from §R3 stall mode 4 (firings spent on one PR without merging — the
  starvation instrument). _Warrant:_ PR #35's 17 rounds with no
  merge-time-checkable count + OCE's three prior unbuilt instances + the
  live PR #50 review pressure. _Falsifier:_ tallies built and the
  step-back still not firing (locates the gap in the trigger); or a
  tally-less bot-reviewed PR after landing. _Route:_ queue slice
  (composes with Q-13).
- **OP-3 — Tighten clause 4's boundary; adopt bounds-not-cures for
  unbounded-reference findings.** Amend ADR-051 clause 4, carrying the
  counter-evidence honestly (review-pass correction): PR #35's rounds
  12–16 were artefact-mutation defects the data-loss exemption RIGHTLY
  made blocking — so a blanket "diagnostics-only is non-blocking by
  definition" would relabel genuinely verified defects (the
  relabel-past-an-absolute shape `no-warning-toleration` exists to stop),
  and the amendment must not do that. The tightening that fits the
  evidence: (a) "cannot change a proof outcome" is a PER-FINDING
  demonstration recorded with the disposition, never a category grant,
  and it does not cover mutation-during-formatting; (b) findings measured
  against an unbounded external reference (vendor internals,
  all-possible-pathological-inputs) default to a recorded bound + a
  decline reply carrying a reopen condition + a durable pointer (OCE
  proposal 1 as amended by its addendum) — an in-loop cure requires the
  configuration to exist in the estate; (c) N consecutive rounds
  narrowing one concern (the measured whack-a-mole shape, read from
  OP-2's tally) triggers the structural step-back the PR #35 seat reached
  only at round 15. _Warrant:_ the round 9–16 arc shape + round 17's
  residuals + OCE's twin-arc mechanism, with the auto-fix confounder
  named. _Falsifier:_ a declined bounded finding later causing a real
  failure in the estate's live configuration; or (c) firing on arcs that
  were genuinely converging. _Route:_ **owner ballot item** (ADR
  amendment — decision-class, never loop-enacted).
- **OP-4 — Repair the B-15 notification channel set.** Turn email back on
  for the Routine (one owner settings tap), or re-ballot B-15 if push-only
  is now preferred. _Warrant:_ D-2 — clause 6 escalation delivery
  currently rides a single channel against a ratified two-channel verdict.
  While there, the owner can answer F-R2-1's two open checks (notification
  history for the two silent slots; the trigger's enabled-state history).
  _Falsifier:_ n/a (config verification: `list_triggers` shows
  `email: true`, or a recorded B-15 amendment). _Route:_ owner action —
  precisely stated: interactive agents CAN create/update Routines via API,
  but recreating loses the owner-attached repo source (measured, Q-01),
  and whether settings-only API updates are safe was never measured, so
  the settings UI is the known-safe route.
- **OP-5 — Re-scope Q-15 to post-outage reality.** Rewrite the brief:
  demote the cured environment gaps to VALIDITY probes, not presence
  assertions — "dist exists" is not "dist works": a transiently half-built
  dist was measured live this session when a review subagent probed during
  a concurrent pre-push clean/rebuild window (`check-singleton-per-window`
  measured again; module-resolution smoke-check is the honest probe).
  Promote the still-live items: the identity-seed fix (now polluting
  main's identity table — F-R2-3), the fired-seat capability probes
  (artifact + push notification, Slack tools, and — from R3 — the
  trigger-self-disable capability the clause 6 kill switch's final act
  assumes), and document the outcome-branch convention (D-6) in the same
  landing. _Warrant:_ D-4 (stale premises measured), F-R2-3 (re-measured
  today), R3 kill-switch row (unproven reach). _Falsifier:_ a fresh fired
  container re-measuring any "cured" gap as absent again. _Route:_ queue
  slice — a SLICE PR only, never the bookkeeping path (review-pass
  correction: bookkeeping scope is counter/incident/continuity state
  only, per QD-5; a brief rewrite is none of those).
- **OP-6 — The kill-switch substitution decision (probe consequence
  only).** The probe itself lives in OP-5's list (single home,
  review-pass dedup). What OP-6 keeps is the decision that exists only if
  the probe FAILS: if fired seats lack trigger tools, clause 6's
  three-idle response must become something a firing CAN do — e.g. commit
  the STOP file itself plus the QD-8 mobile alert — and that substitution
  is decision-class. _Route:_ owner ballot item, contingent on the OP-5
  probe result.
- **OP-7 — Wrap sequencing refinements (seeded, PR #49 review).** (a) When
  a loss/metaloss scan pass changes the closeout outcome or remaining-work
  disposition after broadcasts went out, emit a corrective broadcast —
  peers must never hold a stale synthesis silently. (b) A voluntarily
  written formation letter lands via the orphan continuity-commit route
  with the final safety line restated after it — no uncommitted continuity
  file may sit behind the "final" safety statement (alternatively: move
  the coda before step 7). _Warrant:_ both findings verified against the
  wrap skill's current step ordering (R5); founding instance for (b)'s
  class is wrap's own "all pushed over a stranded local commit".
  _Falsifier:_ (a) a corrective broadcast that only ever duplicates an
  unchanged synthesis (would argue for emit-once-after-scans instead);
  (b) none — mechanical ordering fix. _Route:_ Practice-skill work, NOT
  the programme queue (review-pass correction — the programme queue is
  not auto-widened from this seat): an owner-directed practice landing in
  the PR #49 shape, or a new queue row only if the owner appends one.
- **OP-8 — Commit-ceremony and attribution mechanics.** (a) Document the
  merge-commit and staged-rename cannot-conclude cases in the commit
  skill (or build the `merge-conclude`/rename-aware modes), naming the
  sanctioned deviation: message pre-validation + plain landing of the
  exact staged set + intent abandoned with notes. (b) Add the one-line
  firing-commit trailer duty: every firing commit carries its
  `Claude-Session` trailer (merge commits excepted per the deviation) —
  the trailer decided this review's I-1 attribution and is the cheapest
  attestability improvement available (F-R2-4). (c) Add the claims-CLI
  `init` subcommand (correct per-file seed shapes — the napkin's recipe
  was wrong for the archive file, measured this session). _Warrant:_ two
  measured cannot-conclude instances; the trailer's demonstrated
  attribution value; three seed-shape validation errors plus one
  wrong-recipe propagation. _Falsifier:_ (a) the scoped workflow landing
  a rename cleanly (root cure landed instead — better); (b/c) none —
  mechanical. _Route:_ Practice-skill/tooling work, same routing note as
  OP-7 — owner-directed practice landing or an owner-appended row; not
  self-appended to the programme queue from this seat.

### Report contract notes

**Review pass.** After authoring, this report took two parallel reviewer
dispatches (`docs-adr-expert`: citation fidelity, 14 findings;
`assumptions-expert`: evidence-vs-conclusion and proportionality, 17
findings — zero P1 inaccuracies in citations, three P1 reasoning
corrections). Every load-bearing finding was verified firsthand before
folding (the PR #35 commit trailers, the PR #50 review timeline, the
PR #23 patch content, the dist state — where one reviewer's broken-dist
measurement was falsified as this session's own concurrent pre-push
clean window); the folds are marked "review-pass correction" inline.
Naming note: §R5 uses the skills' invocation names (`engraph-*`), §R6
the canonical directory names; §R5's FIT-with-gaps verdicts and §R6's
FIX verdicts are one disposition — keep the skill, land the routed fix.
Evidence limits the reviewers flagged, carried honestly: platform-side
claims rest on this session's `list_triggers` read (the subagents cannot
call it); the OCE twin's tally contract and retrospective were verified
by THIS seat from the OCE `engraph` branch (the subagents lack OCE
access); the outage-start stamp 2026-08-23T17:12Z is the OCE
retrospective's birth-commit datum.

R2's general-analysis narrative doubles as the "what has happened" account
the owner commissioned; R1's D-findings, R3's verdicts, R4's rows, and R5's
skill table each cite their sources inline. The `list_triggers` last-run
datum appears verbatim in §R2 (the platform exposes no fuller history —
D-1). This review executed no queue item, amended no doctrine, and left the
Routine untouched throughout.

---

## Addendum 2026-08-24 — owner rulings on the routed decisions (decision cards)

The owner ruled on the three decision-class items the same day, via decision
cards (and set the standing directive that decisions are always presented as
decision cards):

- **OP-3 — APPROVED as recommended.** ADR-051 clause 4 amended with all
  three tightenings (per-finding demonstration for non-blocking
  classification, never covering data-mutation mechanisms; bounds-not-cures
  default for unbounded-reference findings with a durable pointer;
  consecutive-rounds structural step-back). Landed in the ADR's Status line
  and clause 4 in this addendum's own landing.
- **OP-4 — RE-BALLOTED to push-only.** Rather than restoring email, the
  owner amended B-15: the live configuration (`push: true, email: false`)
  is now the ratified channel set. **D-2 closes as a ratified change, not a
  defect.** Recorded as a dated amendment under the ballot's B-15 entry.
  The two open owner-side verification checks (notification history for the
  silent slots; enabled-state history) remain open, no longer coupled to a
  config repair.
- **OP-1(b) — DECLINED for now, with owner teaching recorded verbatim:**
  "we don't need that level of assurance yet. Also, we don't do carve
  outs, we do policy, check the principles. When the time comes, we will
  compare the Watcher with the comms mechanisms and heartbeats etc, the
  difference is the medium, not the needs." Two consequences carried: the
  silent-stall blind spot is an ACCEPTED risk at current stakes, not an
  open defect; and any future Watcher/observer design starts from POLICY
  (comparing it with the existing comms/heartbeat mechanisms — same needs,
  different medium), never from a carve-out framing. This review's own
  "uses the carve-out that already exists" phrasing in the OP-1(b) card is
  retracted under that teaching; QD-7's carve-out framing in ADR-051
  clause 7 is flagged as a candidate for the same policy reframing at its
  next revisit — a future owner decision, not enacted here.
- **OP-1(a) and the remaining queue/practice routings** (OP-2, OP-5,
  OP-7, OP-8) go to a follow-up decision card — the owner's "we don't
  need that level of assurance yet" may extend to OP-1(a)'s in-loop check,
  so it is asked, not assumed.

### Second decision card — the remaining routings (2026-08-24, same sitting)

The follow-up card the bullet above promised was asked and answered the same
day (AskUserQuestion decision card; owner answers verbatim where quoted):

- **OP-1(a) — "Land it"** (recommended option taken): the in-loop
  predecessor-attestation check lands as a queue row. Landing: **Q-18**
  appended to the parent plan.
- **OP-2 + OP-5 — "Append both"** (recommended option taken: "I add two
  rows with briefs to the parent-plan frontmatter (assumptions-expert
  review on the plan-authoring act); the loop picks them up on its normal
  WIP=1 cadence"). Landing: **Q-19** (tally instrument; ordered after Q-13)
  and **Q-20** (Q-15 brief re-scope + D-9 correction; Q-15 now waits on it).
- **OP-7 + OP-8 — "I do it now, this session"** (recommended option taken:
  "Owner-directed practice landing in the PR #49 shape: I make the
  skill/tooling edits on this branch with reviewer dispatches, keeping the
  programme queue untouched"). Landings: the wrap skill's two sequencing
  refinements (step 7 corrective broadcast; the coda's
  letter-carries-its-own-close), the commit skill's cannot-conclude cases
  and unattended-session trailer duty, and the `collaboration-state claims
init` subcommand (TDD, red-first, proven live).
- The assumptions-expert pass on the row-appending act additionally split
  **Q-21** out of OP-2's bundle (the D-10 merge-authority policy line —
  independently landable, so not gated behind Q-13) — a decomposition of
  what the card approved, not a new grant; its policy-not-exception wording
  follows the owner's teaching above.

Q-18..Q-21's `Source:` lines resolve here: this section is the durable
record of the second card.

Also absorbed since the report landed: PR #50 MERGED 2026-08-24T19:04:03Z
under clause 3 (Q-03 complete on main — the firing observed live in §R2
finished its drive within its lease), and its firing's napkin entry landed,
including the undo-change owner-halt handled in an unattended seat and a
fixture-estate regeneration finding routed to the Q-03 evidence record.

## Addendum 2026-08-24 — companion comparison

The owner commissioned a comparison of this loop with OCE's
outcome-informed-practice-learning weekly Codex scans; it is conserved at
[`castr-oce-loop-comparison-2026-08-24.md`](./castr-oce-loop-comparison-2026-08-24.md),
carries two owner corrections to the in-chat draft (both loops unattended;
the load-bearing difference is output tier — research vs implementation),
and records the standing bidirectional-equality directive whose first
instalment went out as cross-pollination PRs in both repos.
