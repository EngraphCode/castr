# Routine Arming Review — 2026-08-25

**Commissioned:** owner, 2026-08-25 (in-session word, recorded in the proof-programme
thread record's Arming hold note): the re-created proof-programme Routine's set-up is
reviewed in a fresh session before any dry-run or enable act; nothing fires or enables
until this review passes and the owner says so. A passing review is a necessary
condition, never the authorisation — the fire and the enable each need the owner's
explicit go.
**Reviewer:** Nettle wakes Topsoil (claude-code cloud, claude-fable-5), fresh session,
grounded via `start-right-quick` then `start-right-thorough`.
**Posture:** challenge, not rubber-stamp — every inherited claim re-verified firsthand
against the live platform API and the repo; the draft verdicts then took an
`assumptions-expert` adversarial dispatch whose findings were themselves re-verified
firsthand before folding (dispositions inline, marked "audit"); refinements land as
normal PRs to `main`; the dry run and enable happen only in the owner walk after this
review.
**Authority:** [ADR-051](../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md)
(the loop's contract); the [arming runbook](../plans/proof-programme/arming-runbook.md)
(the procedure under review); the [parent plan](../plans/proof-programme/parent-plan.md)
(queue and operating protocol).

---

## 1. Live state, verified firsthand (verify-don't-trust)

Every row below was measured this session, never trusted from the hold note.

| Claim inherited                                               | Measurement                                                                                                                                                                               | Verdict                |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Trigger exists: `trig_01CbRJjyivM34E7fq2jfLqLJ`               | `list_triggers` returns it: name "Castr proof-programme (ADR-051)", created 2026-08-25T16:02:59Z                                                                                          | ✓                      |
| Poke-only: no cron, cannot self-fire                          | The response carries **no cron-expression field at all** and `next_run_at` is the zero value (`0001-01-01T00:00:00Z`); `enabled: true` with no schedule is the platform's poke-only shape | ✓ (see precision note) |
| Stored prompt verbatim per the runbook                        | Byte-exact `diff` of the trigger's stored prompt against the runbook's canonical block: identical                                                                                         | ✓                      |
| Notifications push-only, no email                             | `"notifications":{"channel":{"push":true,"email":false}}` — matches B-15 as amended 2026-08-24 (push-only re-ballot)                                                                      | ✓                      |
| Bound to "Practice Repos" environment                         | `environment_id: env_01T3vjKqpMKCbv5EzaLGczLL`                                                                                                                                            | ✓                      |
| Fresh-session mode                                            | `job_config` carries the synthetic user-message event (fresh session per fire); `created_via: meta_mcp`                                                                                   | ✓                      |
| No STOP file                                                  | `test -f .agent/plans/proof-programme/STOP` → absent at `origin/main` tip `3299de8`                                                                                                       | ✓                      |
| `zero_progress_streak: 0`, explicitly initialised             | Parent-plan frontmatter line 2                                                                                                                                                            | ✓                      |
| No `in_progress` queue rows                                   | Frontmatter grep: none                                                                                                                                                                    | ✓                      |
| No open programme PR                                          | Live open-PR set = 15, all pre-programme remediation/preservation PRs (#10–#28); none is a programme queue PR                                                                             | ✓                      |
| Repo source / Slack connector / model: owner UI acts, pending | Not visible in the API response — the dialogs are write-only; consistent with "not yet done", verifiable only through the owner's UI and the dry-run capability report                    | pending (walk)         |
| `main`'s head green                                           | This session's branch-sync pre-push ran the full `check:ci` chain on the tree at `3299de8` (= `origin/main` tip content) — exit 0                                                         | ✓ (measured)           |

**Precision note on "poke-only".** The platform has no disabled flag on this API
surface; the trigger reads `enabled: true`. The cannot-self-fire property rests
entirely on the **absent cron expression** (structural), and the freeze against
agent-initiated `fire_trigger` pokes rests on the thread record's Arming hold note
(prose, but in every session's grounding path). Adequate at current stakes; stated
so nobody later reads `enabled: true` as drift. Audit note folded: the no-cron read
cites the absent schedule field itself, not only the `next_run_at` proxy.

**Repository settings (audit F-8).** Recent programme merges (#55: 14/14 checks;
#58) prove the **reporting** half only — PR creation, CI-on-PR, checks reporting. A
green merge proves nothing about whether a red one is blocked, the coverage floors
(recorded 70 / drop 1), or CodeQL default setup — the **enforcement** half.
`account-access.md` makes the draft-PR observation a standing pre-enable obligation;
the walk carries it as a real step plus an owner glance at the live ruleset.

## 2. Queue-premise probes

- **Q-05 premise holds**: both placebo-refinement `return true` sites live at
  `lib/src/schema-processing/writers/zod/refinements/object.ts:130` and `:186`.
- **Q-16 premise moved, and its brief mis-prescribes the residual** (audit F-12,
  verified firsthand): `.agent/plans/templates/` now exists (PR #54 — README +
  templates + components including `quality-gates.md` and `lifecycle-triggers.md`),
  so the templates half is cured. The residual is the plan skill's ADR-117
  citation — but castr has **no ADR-117** (ADRs run 001–051) and the templates
  README declares the origin estate's ADR-117 doctrine "cited lineage, not adopted
  here". The brief's instruction to "retarget the ADR-117 path" points a firing at
  a target that cannot exist; the correct repair is replacing the citation with
  castr's real authority (PDR-018 + the templates README). Brief corrected in this
  review's refinements landing.
- **QD-11 id collision** (walk-ordering per audit F-16): QD-11's recommendation
  proposes adding the fixture repair as "Q-18", but Q-18 is now the landed
  predecessor-attestation row. Corrected in the register **before** the owner's
  step-5 re-read, so an approval cannot land on the wrong row.
- Seven QD rows OPEN at measurement: QD-1, QD-2, QD-4, QD-9, QD-10, QD-11,
  QD-12. This review's refinements landing adds QD-13, so the walk's step-5
  re-read (§6 step 7) covers eight rows.

## 3. Reflex challenges (the review scope's named mechanisms)

- **STOP file**: prose-only but path-consistent across the trigger prompt and
  routine-prompt step 1; checked before anything opens a claim; the runbook's
  step-4 fix (STOP check pulled ahead of the dry run, PR #58 round 3) is present.
  Mid-firing STOP race bounded by clause 2's duration bound. Sound.
- **Owner pause/delete**: platform instrument, proven in the Q-01 arc. Sound.
- **Three-idle self-disable**: see W-1 — the act is unproven **and undefined**.
- **Failure-counter landing rules**: coherent but entirely unexercised
  (bookkeeping-PR / deferral-draft routes have never run — loop-review F-R2-5);
  accepted as design-not-measured, with the first idle firing as the live test.
  The counter stays blind to firings that never spawn; Q-18 is the queued
  intermittent-case cure and the sustained-absence risk is owner-accepted
  (OP-1(b) declined, 2026-08-24).
- **WIP=1 + overlap guard**: complied 4/4 historically; lease posting proven,
  lease reading unexercised; pre-push head re-check specified. Sound on evidence —
  but see W-6: the term the invariant turns on ("programme PR") is defined
  nowhere a zero-context firing reads.
- **Clause-4 convergence**: carries the three OP-3 tightenings (per-finding
  demonstration, bounds-not-cures, two-round structural step-back). The tally
  instrument (Q-19) is correctly sequenced behind its vehicle (Q-13). Sound.
- **Accepted residuals** (runbook §Accepted residuals): both verified bounded as
  recorded — the unprobed write binding fails loudly (completion notification +
  counters + WIP=1 cap) and the first live firing is the probe; the Slack binding
  is owner-manual, advisory-tier only, gated on the Q-15 probe. Stand — with the
  walk's attended-first-firing step (W-4) converting the write-binding residual
  into an owner-observed measurement.
- **Dry-run design**: sound in structure; two audit corrections folded. (1) The
  hold note's "`fire_trigger` carries a per-fire text payload" is the platform's
  documented contract (the payload is appended as an extra user turn), but no
  fire has ever proven delivery — and the failure mode of an undelivered DRY-RUN
  instruction is an **unintended first live firing** (step 2's detection never
  trips; the seat takes the live path on an unprobed write binding). The walk
  therefore uses belt and braces: prepend the DRY-RUN text to the stored prompt
  **before** the owner attaches sources (a zero-loss window — nothing attached
  yet to lose), fire with the payload as well, restore the canonical prompt via
  the owner's settings UI (the known-safe route) and byte-verify. (2) The
  canonical DRY-RUN instruction text existed nowhere in the repo (audit F-11),
  defeating the runbook's own portability purpose — it is now landed in the
  runbook beside the stored prompt, and it doubles as the fired-seat
  **capability report** (see W-1 cure (b)).

## 4. Findings

- **W-1 — the kill switch's final act is unproven AND undefined; the draft cure
  was wrong and is withdrawn.** Clause 6 says a third zero-progress firing
  "disables the Routine and notifies the owner", but no fired seat has proven it
  can call trigger tools, **no surface names the method**, and the obvious
  improvisations are destructive: deleting or recreating the trigger loses the
  owner-attached sources (measured, Q-01), producing a Routine that re-enables
  cleanly and lands nothing forever. This review's draft proposed deciding a
  STOP-file fallback now; the adversarial audit demolished that (F-5, verified):
  a firing-side STOP file only stops anything once it reaches `main`, whose only
  route is a bookkeeping PR merged under clause 3's every-check-green condition —
  unreachable in exactly the regimes that produce three idle firings (a
  persistent red head; a broken toolchain), and the QD-8 alert half is itself
  unproven from fired seats. An assumption swap, not risk reduction. The
  proportionate cures, landed/walked instead: **(a)** document the safe disable
  METHOD — remove the cron (the poke-only state this very arming uses as the
  honest disabled-equivalent), never delete/recreate — in the runbook and the
  routine prompt (mechanics, no ballot); **(b)** put a read-only **capability
  report** into the canonical DRY-RUN instruction (report, never call: trigger
  tools, artifact publish, push-notify, Slack tools, plus checked-out repo, HEAD
  SHA, model id) — settling OP-6's premise and the QD-7/QD-8 capability caveats
  in one shot; **(c)** OP-6's substitution ballot stays contingent on the probe,
  exactly as routed. The interim risk is bounded **provided the notification
  channel is proven** (the walk's explicit gate): streak 0 means ≥3 firings
  (~16–24 h) before the switch could fire, every firing's completion
  notification names its counter values, and the owner holds two proven switches
  throughout.
- **W-2 — the safety-instrument rows sit behind NINE eligible rows, and the
  draft cure contradicted a recorded owner routing; reframed as a reorder ask.**
  In frontmatter claim order, Q-05..Q-09, Q-13, Q-14, Q-16, Q-17 all precede
  Q-18/Q-20/Q-21 — at three firings a day, roughly one to two weeks before the
  predecessor-attestation check, the probe re-scope (which unblocks Q-15), and
  the merge-authority doctrine fix land unaided. The draft proposed executing
  the three rows interactively pre-enable; the audit (F-3, verified against the
  second decision card) showed the owner explicitly routed them to "the loop's
  normal WIP=1 cadence" in the same sitting where "I do it now, this session"
  was chosen for OP-7/OP-8 — a deliberate contrast, so interactive execution
  would override a recorded routing (`no-manufactured-permission`). The
  within-routing instrument: **reorder the frontmatter** — claim order IS
  frontmatter order per routine-prompt step 5, so moving Q-18/Q-20/Q-21 ahead of
  Q-05 is one owner-approved edit that lands the instruments in the loop's first
  firings, authored by the loop under its own reviewer dispatches. Sequencing is
  owner-reserved → decision card in the walk; either answer is safe to arm
  under.
- **W-3 — Q-16 re-adjudicated** (detail in §2): premise moved, brief
  mis-prescription corrected in this landing; the residual is a one-line
  citation replacement a firing can land safely.
- **W-4 — outcome-branch behaviour is NOT a dry-run observable** (audit F-13
  correcting the draft): a read-only dry run makes no branch, commit, or PR, so
  the first observation of the re-created trigger's outcome-branch behaviour is
  the first **live** firing — one more reason to attend it (walk step 8). Q-20
  owns documenting the convention.
- **W-5 — the draft walk omitted two mandatory gates** (audit F-1/F-2): the
  DRY-RUN delivery problem (folded into §3's dry-run design) and the runbook's
  own "confirm the completion notification reaches the owner" — which, post-B-15
  push-only, is a **single-channel system**: if push does not land, the loop's
  entire observability contract is void and nothing else detects it. Now an
  explicit pass/fail gate between dry run and enable.
- **W-6 — "programme PR" is undefined anywhere a zero-context firing reads**
  (audit F-9; the second review pass re-measured the term at 32 occurrences
  across the programme estate with no definition; the estate has
  hand-disambiguated once, for PR #58).
  WIP=1's entire operation turns on the classification, and this review's own
  landing PR is a second ambiguous instance. Cures — narrowed by the second
  review pass, which caught the draft definition deciding owner-reserved
  questions (the QD-3 precedent: the analogous bookkeeping question landed as an
  owner-ruled ADR amendment): the parent plan now records the **nature-based
  classification + the PR #58 owner precedent + a declaration duty** on firings,
  while the self-declaration-as-operative-test and the ambiguity default are
  routed to the owner as **QD-13**; and the walk merges the review PR **before**
  enable so no ambiguous PR is open when the first firing scans.
- **W-7 — the "§Operating protocol" anchor dangles** (audit F-15b, verified):
  `routine-prompt.md` (twice) and the parent plan's own §Mechanism cite a
  heading that has never existed — the numbered protocol sits unheaded inside
  §Slice briefs. Heading added in this landing (mechanical).
- **W-8 — auto-fix OFF is per-trigger, not inherited** (audit F-15a): the
  2026-08-23 owner action applied to the retired trigger; on
  `trig_01CbRJjyivM34E7fq2jfLqLJ` it is a fresh SET, not a carry-over — and it
  is the confounder incident I-1's postscript names behind PR #35's 17-round
  arc. Walk step 2 words it accordingly.

## 5. Verdict

**The set-up is sound to arm** once the owner walk below completes. Every
inherited live-state claim measured true; the stored prompt is byte-canonical;
the residual risks are recorded with named bounds and reopen conditions rather
than hidden. The reflexes that remain unproven (write binding, bookkeeping
routes, lease reading, self-disable, notification delivery) are each either
converted to a measurement by the walk (capability report; attended first
firing; notification gate) or covered by a proven owner-side switch while the
queued probes land. The two decisions the walk carries (queue reorder; attended
first firing) are both safe in either direction.

## 6. The arming walk (runbook steps 3–7, instantiated and hardened)

0. **Land and merge this review's refinements PR** (owner-invoked merge — not a
   programme PR) so no ambiguous PR is open at enable (W-6) and the canonical
   DRY-RUN text + disable method are on `main` before the seat that needs them
   can exist.
1. **Prompt prepend (belt and braces, before any attach)**: update the stored
   prompt to prepend the canonical DRY-RUN instruction while the trigger still
   has no owner-attached sources (zero-loss window); byte-verify via
   `list_triggers`.
2. **Owner UI acts** on `trig_01CbRJjyivM34E7fq2jfLqLJ`: attach the castr repo
   source ("Runs with"), attach the Slack connector, set model Fable, **set**
   platform auto-fix OFF (per-trigger — a fresh set, not a carry-over).
3. **Settings validation** (enforcement half): open a draft PR from a scratch
   branch, observe the full required check set report (quality-gates fan-in,
   CodeQL, code-quality/coverage rules), close it; owner glances the live `main`
   ruleset against the recorded floors (min 70, drop 1).
4. **Re-verify repo state on `origin/main` immediately before the fire**: STOP
   absent, streak 0, no `in_progress` rows, no open programme PR — never carried
   from earlier in the session.
5. **Dry run**: `fire_trigger` with the canonical DRY-RUN text as the per-fire
   payload too. Observe: fresh session; read-only path; the capability report
   (tools visible, repo checked out, HEAD SHA, model); queued-decisions read;
   stand-down echo (criterion "dry-run complete"); **no repo-state change**; and
   the **completion notification received on the owner's device — an explicit
   pass/fail gate** (single-channel system post-B-15).
6. **Restore the canonical prompt** via the owner's settings UI paste (the
   known-safe route; an API prompt-update on a source-attached trigger is
   unmeasured); byte-verify via `list_triggers`.
7. **Step-5 re-read**: owner re-reads all eight OPEN QDs —
   QD-1/2/4/9/10/11/12/13 — with QD-11 now carrying the corrected row-id note
   and QD-13 (programme-PR operative test + ambiguity default) added by this
   review's own refinements landing.
8. **Attended first live firing (recommended)**: before any cron goes on, poke
   one live firing manually while the owner is present (no DRY-RUN payload);
   watch the first ~20 minutes — checkout, provisioning, claim, PR-open, first
   push (the credentialed-write probe, observed rather than discovered) — and
   the outcome-branch behaviour (W-4). The owner holds the pause switch
   throughout; attendance covers the loud-failure window, not the 6-hour drive.
9. **Enable**: add cron `3 */8 * * *` at owner word, after re-running step 4's
   re-verification.

## 7. Review pass

Two independent dispatches, both folded through firsthand re-verification.
**First (assumptions-expert, on the draft verdicts):** 4 P1 / 7 P2 / 5 P3 —
re-verified before folding (the templates README's declined-ADR-117 line, the
absent §Operating-protocol heading, the second decision card's loop-cadence
routing, the account-access pre-enable obligation, the frontmatter claim-order
count). Two draft cures were withdrawn as disproportionate or
authority-violating (W-1's STOP-fallback decision card; W-2's interactive
pre-enable execution) and replaced with the audit's proportionate forms.
**Second (docs-adr-expert, on the landing diff):** caught, and this landing
cures, a same-file contradiction (the parent plan's foundation-alignment note
still asserting the templates gap the Q-16 brief declared cured), an
unexecutable runbook ordering (the DRY-RUN prepend written after the attach it
must precede — the arming sequence's step 3 now runs create → prepend →
attach), a stale "create disabled … with the cron" step (now create poke-only;
cron only at step 7), the restore-before-attended-firing precondition, the
notification pass/fail gate landing in the runbook itself rather than only
here, the three-site (not one-site) ADR-117 residual with the validator's real
non-blocking contract in Q-16's acceptance, the census citation, and — the
sharpest — my own programme-PR definition deciding two owner-reserved
questions, now narrowed to recorded precedent + declaration duty with the
test/default routed as QD-13. The same overreach class the first audit caught
(W-1/W-2) recurred in my cure for W-6 and was caught by the second reviewer:
the fan-out earned its cost twice in one session. The refinements landed with
this report: the runbook's disable method + canonical DRY-RUN instruction +
create-prepend-attach ordering + notification gate + attended first-firing
step, the routine prompt's disable-method and disable-record lines, the parent
plan's Operating-protocol heading + programme-PR classification + Q-16 brief
correction + foundation-note repair, and the QD-11 id correction + QD-13 row.
