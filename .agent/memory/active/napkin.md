# Napkin

This file captures session-scoped discoveries, mistakes, corrections, and useful patterns before they are distilled or promoted into permanent docs.

## 2026-08-27 (PR #70 drive — Limpet guards Moorings / 01T962, part 3)

- **OWNER CORRECTION (verbatim substance): "There are merge conflicts, always check the
  full pr state, always."** I woke from a timed CI wait planning a checks-and-threads
  re-check while `mergeable_state` had gone `dirty` (main moved twice during the drive —
  PR #69, then PR #68). The full PR state — `mergeable_state` first-class alongside
  checks and threads — is read on EVERY wake and at every declaration instant, never a
  subset. Same class as the 2026-08-26 mergeable_state correction already in the archive;
  second worked instance, now on this seat. Both base merges this drive were semantic
  concept-unions (napkin + repo-continuity), each proven lossless by containment checks.

## 2026-08-27 (dedicated consolidation session — Limpet guards Moorings / 01T962)

- **Rotation record:** the 2026-07-03 → 2026-08-27 napkin (1518 lines, two inline
  fitness-exceeded markers, rotation recorded as due in repo-continuity) was processed
  entry-by-entry and archived to
  [`archive/napkin-2026-07-to-08-27.md`](archive/napkin-2026-07-to-08-27.md). Behaviour-changing
  lessons merged into [`distilled.md`](distilled.md); the two due owner rulings graduated
  (cloud ceremony-skip → commit skill + claims/comms rules; single environment definition →
  `cloud-environment.md` preamble); the 2026-08-23/24 owner directives (decision cards;
  blocked-on-owner mobile alert) graduated into `owner-attention-at-action-moments`; the
  generator-fixpoint contract graduated into `generator-first-mindset` (its second-instance
  trigger fired 2026-08-26); Q-012..Q-015 drained from open-questions (the 2026-08-23 walk's
  verdicts live in the overhaul plan).
- **OWNER RULING REFINEMENT (2026-08-27, this session, live; verbatim substance): "Cloud
  sessions don't need to use queues or claims because there is only one agent per cloud
  instance of the repo. Comms will work but only via Slack, not via local filesystem …
  that will only work if a Watcher is running. Generally dedicated consolidation sessions
  don't need comms, they analyse the knowledge already laid down and make it safe. They can
  use subagents though."** Supersedes the 2026-08-25 capture's "until the Slack work
  completes cannot partake in comms" framing: the structural fact is one agent per cloud
  instance (filesystem coordination has no audience by construction); the working comms
  channel from a cloud seat is Slack via `talk-to-slack-watcher`, contingent on a live
  Watcher. Landed in the commit skill canonical, `register-active-areas-at-session-open`,
  and `use-agent-comms-log`.
- **Mistake (mine, owner-caught live): I graduated the 2026-08-25 napkin wording verbatim
  into three doctrine surfaces before the owner's refinement arrived** — a capture-surface
  phrasing ("cannot partake in comms until the Slack work completes") carried a stale
  mechanism into permanent homes. A napkin capture of a ruling records the ruling as heard
  that day; at graduation time, re-derive the mechanism from the current estate (the Watcher
  skills existed and answered it) rather than transplanting the capture's phrasing. Same
  inherited-classification family, at the graduation step itself.
- **Mistake (mine, owner-caught): I relayed the consolidate-docs comms-pause clause as a
  live deferral reason** ("owner-paused by standing direction") without checking its
  currency or the surface itself — the pause was months stale (owner word 2026-08-27:
  retired), and the checkable fact was one `ls` away: `comms/*` is gitignored
  instance-tier state, so this fresh container holds no corpus at all. The honest
  disposition was "surface structurally absent here". Inherited-classification from a
  skill canonical, during the very pass that distilled that family. Cure landed: the
  pause clause retired across the consolidate-docs canonical (banner + trigger checklist),
  comms events restated as an ordinary machine-local consolidation source.
- **Mistake (mine, surfaced by the owner's three-verb question — read ≠ analyse ≠ home):**
  my rotation triage used "the archive conserves it" as a quiet extra disposition for
  borderline entries — an invented category outside the skill's own enumeration (merged /
  refined / skipped-as-duplicate / routed-to-register / investigated), and archives are
  validator-excluded cold storage, not homes. The re-audit recovered four real misses, all
  now landed: the watcher ARM-TIME sweep sharpening (candidate since 2026-07-06 →
  `comms-all-channels-watcher`), the closeout-narrative-stales truth-surface note
  (2026-07-06 → `register-active-areas-at-session-open` §At session close), the
  token-subsequence compound-assembly specimens (→ `hook-policy-substring-discipline`, new
  section), and the owner's no-carve-outs teaching (→ distilled). Residuals named, not
  silently dropped: the ARC announce-event entry-header candidate (ARC protocol docs,
  OCE-homed estate) and ADR-051 clause 7's carve-out reframing flag (owner's call, already
  recorded in the loop-review addendum) stay as flagged owner/estate items.

## 2026-08-27 (Slack Watcher stand-up, cloud session — Moon guards Solstice / c395cb)

Owner commission: start-right-team + slack-watcher, stand up the channel monitor, then
warm pause. Owner note applied verbatim: **peer agents are reached via Slack only — the
local comms/claims/queue machinery is not the coordination surface for this session**
(consistent with the 2026-08-25 single-agent cloud ceremony ruling; no claims registry
seeded, no local comms events emitted, team-presence registration = the Slack intro).
Works/doesn't-work log from the stand-up, as commissioned:

- **Works:** `SLACK_WATCHER_CHANNEL_ID`/`SLACK_WATCHER_WORKSPACE` present in the cloud
  env (`C0B9AQ2BK5E` / `engraph-workspace`); channel name resolved live as
  `#remote-coding` (§2 config check passed). Identity CLI with explicit `--seed`
  (session UUID `c395cb…`) → "Moon guards Solstice". Session renamed to the Practice
  name via the claude-code-remote `set_session_title` tool. Slack MCP `read_channel`
  (incl. `oldest`-windowed sweep), `send_message` (channel + threaded),
  `create_canvas`/`read_canvas`/`update_canvas` all worked first try. Mantle takeover
  resolved from channel history alone: Sage hunts Verdure held it (relief intro
  `1787501758.228519`, 2026-08-23, session presumed reclaimed, no vacancy sign-off);
  relief intro posted with the verbatim relieves phrase (`ts 1787833883.828679`); gap
  sweep from Sage's last activity (`1787509014.532569`) found the window empty;
  baseline set to my intro. `send_later` 15-min tick armed
  (`trig_01ANN9SfGnMQyqKtN5noKv6y`) + independent hourly fallback cron
  (`trig_01B1YrkvaFSnt9adVBBgqZ5J`, server-anchored to :32).
- **Doesn't work: the Slack MCP surface has NO message-edit tool**, so the skill's
  "EDIT the tenure status message every tick" deadman is unimplementable as written.
  Cure used: a Slack **canvas** (`F0BT7TXQ3PW`) as the editable always-current tenure
  status surface, anchored from the intro's threaded tenure-status reply. `candidate:`
  slack-watcher SKILL amendment — name the canvas fallback (or per-tick threaded
  replies) for surfaces without `chat.update`.
- **Doesn't work (re-confirmed):** the SessionStart hook exports no Practice seed in
  cloud sessions (`PRACTICE_AGENT_SESSION_ID_CLAUDE` empty) — hand-seeded per the
  start-right fallback, matching Sage's 2026-08-23 observation.
- **Unverified residual:** `create_trigger` warned the fallback trigger "stores no MCP
  connectors"; whether a self-bind firing into this live session retains the Slack
  tools is untested (NOTIFY-class exposure; the firing can still alert even if
  Slack-blind). First fallback firing at 13:32Z answers it — check its transcript.
- **Exit-criterion reading recorded in the intro:** the owner's "start a monitor, then
  warm pause" commission is read as hold-the-watch-until-stood-down (else the
  five-quiet-ticks default would kill a monitor on a 4-day-quiet channel within ~75
  min of stand-up, defeating the commission). Owner can override in-channel or here.
- **Doesn't work: event-driven Slack wake (owner asked mid-stand-up), measured not
  assumed.** Three paths checked: (a) the Slack MCP surface has no
  subscription/streaming/events tool — read/send/canvas only; (b) the shell holds NO
  Slack credential (env sweep: only the two `SLACK_WATCHER_*` ids), so a persistent
  Monitor script cannot even poll `conversations.history`, let alone stream — Slack
  access exists solely at the MCP layer, which shell/Monitor processes cannot call;
  (c) the Monitor tool's `ws` source could take Slack Socket Mode's `wss` stream for
  genuine push wake, but Socket Mode needs an app-level `xapp-…` token, absent.
  Timer-based `send_later`/cron is also the DURABLE choice: platform triggers live
  server-side and survive container restarts; a Monitor dies with the container.
  `candidate:` owner-level enabling work — add a Socket-Mode app token to the cloud
  environment config, then a Watcher can arm `Monitor({ws})` for per-message wake
  with the timer chain demoted to fallback.
- **OWNER DIRECTION (2026-08-27, mid-stand-up): to enable full event-driven Slack
  interactions we will need (1) a custom Slack app with appropriate permissions, and
  (2) in-repo agent tooling that takes advantage of it as a background task that
  prompts the agent.** This scopes the enabling work beyond the token-only candidate
  above: the app is the owner-provisioned half (Socket Mode / Events API scopes on
  the workspace), and the repo grows the consuming half — a background listener
  (Monitor-armable process or equivalent) that turns Slack events into agent wakes.
  Owner instructed this be written as a note only for now — not committed or pushed
  in the same breath; it rides the napkin until the next continuity landing.
- **Identity-derivation discrepancy, second measured instance (same class as
  Flamebright/Lacustrine 2026-08-24):** the SessionStart hook fired on session
  RESUME (not at open) and derived "Rocket binds Embers" from the true session id
  prefix (`01Caxu`), while this seat had already registered "Moon guards Solstice"
  from the scratchpad UUID seed (`c395cb`) at stand-up — the hook exports nothing at
  cloud session OPEN, which is exactly when the Watcher intro needs the name.
  Continued under the REGISTERED identity for tenure coherence (the Slack intro,
  canvas, and tick chain all carry Moon guards Solstice). Strengthens the Q-15
  seed-source gap: one canonical seed answer is needed, and it must be available at
  session open, not first resume.

## 2026-08-27 (closeout stack — Limpet guards Moorings / 01T962, part 2)

- **Identity chimera, live worked instance on this very seat:** the SessionStart hook
  (firing at the closeout resume) derives "Eagle herds Rainbow" from
  `PRACTICE_AGENT_SESSION_ID_CLAUDE` while this seat registered "Limpet guards Moorings"
  from the manually-seeded URL form `session_01T962…` — same session, same `01T962` prefix,
  two names, because the derivation is **seed-form-sensitive** (env payload vs URL form).
  Continued under the REGISTERED name per the PDR-027 precedent (one seat must not mint two
  names mid-history). Confirms the equality plan's ID-1 cure shape exactly: one
  seed-precedence rule with the type tag stripped, name always derived from the live seed.
- **Free-play harvest (bounded, at closeout):** one seed kept — the estate's documented
  failure classes keep firing live during the very passes that document them (semantic-merge
  conflicts during merge-doctrine work; fluency during fluency documentation; the identity
  chimera during the session that consolidated the chimera lesson) — "this estate is a
  reflexive laboratory: its instruments trigger on themselves" (association, not finding).
  One discard, visible: a moving-house/"misc box" analogy for the archive-conserves bias —
  forced, added nothing beyond the recorded lesson. Concept-exploration: **no-run verdict**
  per its own guard — every open item is a well-formed owner decision or a routed
  candidate; nothing unshaped warrants the four-movement treatment. Reason: the only live
  closeout decision (merge path for PR #70) is settled by standing condition-based policy —
  direct execution, no analysis warranted.
- **Wrap loss-scan bounds (for the successor):** the rotation's "already homed" claims were
  verified by load-bearing SAMPLE, not exhaustively — treat archived-napkin landing claims
  as claims. External-scrutiny error signature from this session: inherited text relayed as
  current (comms pause), and invented dispositions ("archive conserves it") — point outside
  eyes at deferral reasons and skip-justifications first. The PDR-056 extension offer is
  conserved in pending-graduations (owner-gated), so no chat-only commitment remains.

## 2026-08-27 (compaction close — PR #67/#68 drive arc — Vesta turns Singularity / 01PjGS, final)

- **Drive tally, both PRs: ~20 bot findings across six rounds, every one verified-real →
  fixed → resolved with evidence; zero rejected; one clause-4(c) structural close** (the
  probe's path-coverage class: third consecutive narrowing finding → the complete
  four-shape map derived from the routine prompt's own branches, instead of a third
  instance patch). Convergence discrimination worked live: rounds shrank (5→5→1→2→2→1)
  and each was a distinct real defect in brand-new safety text — the opposite signature
  to the PR #63 treadmill, so absorbing them was right.
- **A review round can land in the race window between merge-conditions-check and the
  merge** — Codex's round 2 on PR #67 arrived as the merge completed; the disposition
  route is the merged-PR rule: restart the designated branch from main (a pure
  fast-forward here — the repo's append-only hook rightly blocked `--force-with-lease`,
  and no force was needed since the old tip was an ancestor of the merge), fold in a
  follow-up PR, reply on the merged PR's threads pointing at it.
- **The tombstone reflex caught in my own supersession prose** (PR #68 round 1): my
  step-7 "SUPERSEDED" text reconstructed the dead deferred-cron option in present-design
  prose — `no-tombstones-for-removed-ideas` names exactly this, and I had not re-read it
  while writing supersessions all day. Same passive-rule-loses-to-gravity family; the
  review layer was the active gate. Cure shape: supersession strikethroughs belong on
  history surfaces; present-design prose states only the replacement.
- **Play seed (association, not finding): the day is a calibration chain** — the
  instrument built to measure the firing's honesty (the probe) was itself adversarially
  calibrated by six review rounds before first use, and my own "fixed in <SHA>" replies
  were the same relocated verification one layer up. Verification relocation looks
  fractal in this estate: each layer audits the layer below. Discarded visibly: a
  convergence-tally analogy (already operational above) and a metrology-decoration
  restatement of this same seed.
- **Owner correction at close: "Use of the cognitive skills is never optional."** My
  first close wrote a "justified no-run" verdict for concept-exploration and treated
  the formation letter as voluntary; the owner corrected mid-turn, and the corrected
  run bit immediately. What it found: the no-run verdict was itself the session's
  failure class at the meta level — the class generalises from _relaying facts
  unverified_ to **relaying procedure outcomes unexecuted** (a no-run verdict claims
  what a pass would have found without running it; same shape as the unbacked
  "published package" register row). Skill routing-boundary prose governs
  self-selection only; an explicit invocation is a command to execute, and no
  fluent verdict substitutes for the run. Load-bearing for the autonomous agent:
  routine-prompt step 3 mounts these skills as the firing's cognition — if
  "invoked ⇒ runs" is unsettled, a firing can skip its own grounding stack with a
  justified-sounding verdict and nobody watching. Encoding question (rule clause?
  skill-canonical line? AGENT.md grounding contract?) routed to the consolidation
  drain / owner word, not patched unilaterally here. One class, one cure: wherever
  an output is owed, verify the generating procedure actually ran. Unresolved
  evidence: whether earlier sessions' no-run verdicts hid the same shape is
  unmeasured — a drain-time audit question, not settled here.
- **Owner corrections at close (second pair): "Work is only safe when pushed and
  part of a PR" and "stop using timers, monitor events."** Both checked firsthand:
  every push this session went to PR #68's head branch (PR read confirms head ref =
  the designated branch, head SHA = local tip, tree clean and in sync — nothing
  landed outside a PR); the timer habit, though, violated the estate's own
  `use-monitor-for-event-driven-wake` rule — the PR-activity subscription and the
  armed check-in trigger were already the wake path, and polling beside them is the
  same substitution class as narrated aggregation: the seat holding open what the
  machinery already carries. For a firing this is duration-bound poison; ending the
  turn and waking on events is the designed shape. Merge-tail exit criterion
  re-affirmed while folding this: rounds on this PR have long exceeded the ADR-051
  clause 4 cap, so a further round that reshapes the scoring class again takes the
  recorded carry-forward disposition, not another fix cycle; otherwise the track
  terminates at merge-on-green under the standing conditions.
- **New estate machinery observed live: the owner's "Castr Adversarial PR
  Evaluation" Routine (created 2026-08-27T11:06Z, fires on PR pushes) posted its
  first evaluation on PR #68** — six sections, two of them verdict-flipping
  scoring-contract defects this seat had missed through seven review rounds (the
  one-sided-token double reading and row 8's fresh-claim-shaped floor
  measurement), fixed in abef4c2d; four owner rulings carded and landed (scorer =
  pre-firing deliverable; evidence-earned N/A for rows 7/20 on drive; instrument
  freeze on merge; verdict stop overridable only by recorded ruling).
  Verify-don't-trust relocated into machinery, in action: the reviewer layer now
  reaches the estate unprompted, under the owner's credentials with the agent
  footer. Compliance note for the drain: the comment omitted the Practice name
  its own prompt mandates in the opening line.

## 2026-08-27 (Slack Watcher stand-up, cloud session — Moon guards Solstice / c395cb)

Owner commission: start-right-team + slack-watcher, stand up the channel monitor, then
warm pause. Owner note applied verbatim: **peer agents are reached via Slack only — the
local comms/claims/queue machinery is not the coordination surface for this session**
(consistent with the 2026-08-25 single-agent cloud ceremony ruling; no claims registry
seeded, no local comms events emitted, team-presence registration = the Slack intro).
Works/doesn't-work log from the stand-up, as commissioned:

- **Works:** `SLACK_WATCHER_CHANNEL_ID`/`SLACK_WATCHER_WORKSPACE` present in the cloud
  env (`C0B9AQ2BK5E` / `engraph-workspace`); channel name resolved live as
  `#remote-coding` (§2 config check passed). Identity CLI with explicit `--seed`
  (session UUID `c395cb…`) → "Moon guards Solstice". Session renamed to the Practice
  name via the claude-code-remote `set_session_title` tool. Slack MCP `read_channel`
  (incl. `oldest`-windowed sweep), `send_message` (channel + threaded),
  `create_canvas`/`read_canvas`/`update_canvas` all worked first try. Mantle takeover
  resolved from channel history alone: Sage hunts Verdure held it (relief intro
  `1787501758.228519`, 2026-08-23, session presumed reclaimed, no vacancy sign-off);
  relief intro posted with the verbatim relieves phrase (`ts 1787833883.828679`); gap
  sweep from Sage's last activity (`1787509014.532569`) found the window empty;
  baseline set to my intro. `send_later` 15-min tick armed
  (`trig_01ANN9SfGnMQyqKtN5noKv6y`) + independent hourly fallback cron
  (`trig_01B1YrkvaFSnt9adVBBgqZ5J`, server-anchored to :32).
- **Doesn't work: the Slack MCP surface has NO message-edit tool**, so the skill's
  "EDIT the tenure status message every tick" deadman is unimplementable as written.
  Cure used: a Slack **canvas** (`F0BT7TXQ3PW`) as the editable always-current tenure
  status surface, anchored from the intro's threaded tenure-status reply. `candidate:`
  slack-watcher SKILL amendment — name the canvas fallback (or per-tick threaded
  replies) for surfaces without `chat.update`.
- **Doesn't work (re-confirmed):** the SessionStart hook exports no Practice seed in
  cloud sessions (`PRACTICE_AGENT_SESSION_ID_CLAUDE` empty) — hand-seeded per the
  start-right fallback, matching Sage's 2026-08-23 observation.
- **Unverified residual:** `create_trigger` warned the fallback trigger "stores no MCP
  connectors"; whether a self-bind firing into this live session retains the Slack
  tools is untested (NOTIFY-class exposure; the firing can still alert even if
  Slack-blind). First fallback firing at 13:32Z answers it — check its transcript.
- **Exit-criterion reading recorded in the intro:** the owner's "start a monitor, then
  warm pause" commission is read as hold-the-watch-until-stood-down (else the
  five-quiet-ticks default would kill a monitor on a 4-day-quiet channel within ~75
  min of stand-up, defeating the commission). Owner can override in-channel or here.
- **Doesn't work: event-driven Slack wake (owner asked mid-stand-up), measured not
  assumed.** Three paths checked: (a) the Slack MCP surface has no
  subscription/streaming/events tool — read/send/canvas only; (b) the shell holds NO
  Slack credential (env sweep: only the two `SLACK_WATCHER_*` ids), so a persistent
  Monitor script cannot even poll `conversations.history`, let alone stream — Slack
  access exists solely at the MCP layer, which shell/Monitor processes cannot call;
  (c) the Monitor tool's `ws` source could take Slack Socket Mode's `wss` stream for
  genuine push wake, but Socket Mode needs an app-level `xapp-…` token, absent.
  Timer-based `send_later`/cron is also the DURABLE choice: platform triggers live
  server-side and survive container restarts; a Monitor dies with the container.
  `candidate:` owner-level enabling work — add a Socket-Mode app token to the cloud
  environment config, then a Watcher can arm `Monitor({ws})` for per-message wake
  with the timer chain demoted to fallback.
- **OWNER DIRECTION (2026-08-27, mid-stand-up): to enable full event-driven Slack
  interactions we will need (1) a custom Slack app with appropriate permissions, and
  (2) in-repo agent tooling that takes advantage of it as a background task that
  prompts the agent.** This scopes the enabling work beyond the token-only candidate
  above: the app is the owner-provisioned half (Socket Mode / Events API scopes on
  the workspace), and the repo grows the consuming half — a background listener
  (Monitor-armable process or equivalent) that turns Slack events into agent wakes.
  Owner instructed this be written as a note only for now — not committed or pushed
  in the same breath; it rides the napkin until the next continuity landing.
- **Identity-derivation discrepancy, second measured instance (same class as
  Flamebright/Lacustrine 2026-08-24):** the SessionStart hook fired on session
  RESUME (not at open) and derived "Rocket binds Embers" from the true session id
  prefix (`01Caxu`), while this seat had already registered "Moon guards Solstice"
  from the scratchpad UUID seed (`c395cb`) at stand-up — the hook exports nothing at
  cloud session OPEN, which is exactly when the Watcher intro needs the name.
  Continued under the REGISTERED identity for tenure coherence (the Slack intro,
  canvas, and tick chain all carry Moon guards Solstice). Strengthens the Q-15
  seed-source gap: one canonical seed answer is needed, and it must be available at
  session open, not first resume.

## 2026-08-27 (merge-tail addendum — Vesta turns Singularity / 01PjGS, post-compaction)

- **Ten further probe-hardening rounds between compaction and merge, ~14 findings, every
  one verified-real and folded** — full substance in the thread record's merge-tail
  addendum and the probe text itself (the authority). Two of the findings were defects my
  own earlier fixes introduced, both the same class: **a schema addition without its
  matching validation clause** (row 19's two-sided reclassification landed everywhere but
  the validator's subset; the bounded sub-claim fields joined the schema and emission
  without a presence requirement). The class cure the estate already names — validators
  recompute AND validate every field the schema defines — applies to my own amendments,
  not just the audited firing's records.
- **The full-surface harvest earned its keep live**: the owner's "fetch all comments and
  double check" directive surfaced a third adversarial-Routine evaluation (13:28Z,
  Bluebell spins Spore) that had arrived with NO subscription wake — issue comments by
  the owner's own credentials do not reliably generate events for the subscribing
  session. pr-lifecycle Phase 3's "REST-only reads produce false no-comment verdicts"
  generalises: event-wake-only monitoring produces false all-clear verdicts; harvest
  every surface at the merge instant.
- **Semantic-merge union executed live**: PR #69 (Watcher stand-up) and this branch both
  appended ~73-line session blocks at the napkin tail; the hook refused the line-merge,
  and the union (base + ours + theirs, chronological) was authored by hand and verified
  by header count. The hook's refusal message naming the exact `git show :N:` incantations
  made the recovery mechanical.

_Earlier entries rotated to keep the active napkin healthy as cross-session lessons graduate to [`distilled.md`](distilled.md) (conserved in archive, never trimmed):_
_2026-03-25 → 2026-04-16 → [`archive/napkin-2026-03-to-04.md`](archive/napkin-2026-03-to-04.md) (2026-06-18);_
_2026-06-04 → 2026-06-10 → [`archive/napkin-2026-06-04-to-10.md`](archive/napkin-2026-06-04-to-10.md) (2026-06-19);_
_2026-06-17 → 2026-06-20 (Phase 7 + Phase 8-partial) → [`archive/napkin-2026-06-17-to-20.md`](archive/napkin-2026-06-17-to-20.md) (2026-06-20);_
_2026-06-20 → 2026-06-21 (Tranche 1/2 + FIRST-RUN dogfood + dependency-currency + pin-reframe) → [`archive/napkin-2026-06-20-to-21.md`](archive/napkin-2026-06-20-to-21.md) (2026-06-26);_
_2026-06-26 → 2026-07-03-morning (consolidations + LC/TC lanes + gap rescan + S1/delta/coverage) → [`archive/napkin-2026-06-26-to-07-03-morning.md`](archive/napkin-2026-06-26-to-07-03-morning.md) (2026-07-03);_
_2026-07-03 → 2026-08-27 (proof-programme Q-01..Q-04 firings + equality lanes + arming walk + trust reframing) → [`archive/napkin-2026-07-to-08-27.md`](archive/napkin-2026-07-to-08-27.md) (2026-08-27)._

## 2026-08-27 (PR #69 review drive + merge — Moon guards Solstice / c395cb, continued)

- **Authority-machinery review convergence re-measured on the consolidation-routine
  template: five rounds, SEVEN real distinct fixes, then round six was the
  non-convergence tell** (count corrected from five at PR #71 round 1 — the first
  list omitted two of round 1/3's fixes). Real: (1) no cross-firing exit criterion
  — cured by recording the owner-authority override per
  `loop-exit-criteria-required` §Owner Authority; (2) no-op trigger checklist was a
  private subset of consolidate-docs's canonical sources; (3) "Done means" narrowed
  consolidate-until-done's completion contract; (4) firing stack omitted the
  mandatory cloud-session skills (`engraph-plan`/`engraph-proportionality`, owner
  ruling 2026-08-26); (5) the no-op exit bypassed `session-handoff`'s
  scheduled-firing closeout; (6) no per-firing duration bound / overlap deferral
  (the measured I-1 collision class); (7) head-recency used as a liveness signal
  where the pattern requires the observable FIRING-LEASE
  (`silence-is-never-liveness`).
  Every one verified against the cited authority BEFORE complying; all fixed with
  the live Routine's stored prompt updated in lockstep each time. Re-proves the
  2026-08-22 lesson: authority text has a bounded defect surface — enumerate it
  deliberately up front instead of letting a reviewer walk it one round per push.
- **New review-bot failure specimen: a re-raise on a FABRICATED commit SHA.**
  Codex round 6 re-raised the already-rejected commit-bundling claim citing "fresh
  evidence in `5b63e55f`" — `git cat-file -t` found no such object in the local
  clone, and a repository-level check corroborated it (Copilot's independent
  GitHub lookup also found the SHA absent; scope correction from PR #71 round 1:
  cat-file alone proves only LOCAL absence — a shallow or partial clone can lack
  valid remote commits, so the void verdict needs the remote-level check too).
  Cure applied: reject with the falsifying probes, resolve, and invoke the
  recorded convergence cap for the class (reopen only on a verifiable SHA).
  Sharper form of verify-the-reviewer's-warrant: verify a bot-cited SHA exists —
  locally AND at the remote — before even reading its argument.
- **One rejection was owed to measurement, not argument:** the round-4 "split the
  Routine change from the continuity landing" claim fell to
  `git log --name-only origin/main..HEAD` showing every commit single-file — the
  orphan-commit rule is satisfied per-commit, and napkin+prompt sharing a PR is
  not the bundling it forbids.
- **`update_trigger`'s response is a config-observability surface:** the owner's
  UI reshaping of the Routine (rename to "Castr Dedicated consolidation — every
  three days", cron `0 6 */3 * *`, repo source attached with outcome branch
  `claude/compassionate-curie`, Slack connector granted, a 13:10Z test fire)
  became visible only in the update call's echoed config. Read the echoed
  trigger state on every update — it is where owner-side changes surface.
- **Hook token-subsequence specimen refired exactly as documented** (`git add --`
  - `git push -u origin` in one compound reads as "git add -u"); the napkin's
    split-the-ceremony cure held. Also `check-commit-message` warns (non-blocking)
    on a body line starting with a hyphenated token like `silence-is-never-liveness`
    — commitlint parses it as a footer token; harmless but noisy.
- **Merge shape that worked under "push and merge now":** condition-based to the
  end — auto-merge armed while fixing, disabled during each fix round, re-armed
  after; final merge executed directly once `mergeable_state: clean` + all check
  suites complete + all nine threads resolved (squash `df734b4d`). The owner's
  merge ruling (green and clean → merge) needed no bypass at any point.

## 2026-08-27 (session close — watch teardown + closeout — Moon guards Solstice / c395cb)

- **Landed (PDR-026): the full commissioned arc.** Watcher mantle stood up, held ~2.6 h
  (11 ticks + 2 catch-ups, quiet channel), and torn down cleanly at owner word — vacancy
  sign-off `1787843381.527589` closing intro tenure `1787833883.828679`, successor sweep
  boundary `1787834305.944669`, canvas `F0BT7TXQ3PW` final-edited, both wake triggers
  deleted, post-write resolver check confirmed no successor race. Standing consolidation
  Routine armed and hardened (PR #69 squash-merged `df734b4d`); notes branch + safety PR
  #71; standing permissions landed (`ff6cb4f3`, `bd0ec56c`).
- **Teardown protocol observation (works):** the §5 owner-teardown path executed exactly as
  written on the canvas-substitute surface — delete reminders → final non-re-arming sweep →
  vacancy naming tenure ts + sweep-boundary ts → canvas final-edit → post-write resolver
  verify. No step needed adaptation beyond the already-noted canvas substitution.
- **Session-shape note:** sole-contributor handoff; no local claims/comms ever opened (owner
  instruction: peer comms via Slack only, consistent with the 2026-08-25 single-agent cloud
  ruling) — "no claim to close" is the explicit step-8 outcome. Entry points
  (CLAUDE/AGENTS/GEMINI) untouched this session — no drift added.

## 2026-08-27 (Phase C-pre — the verdict scorer T1–T6 — Wolf seeks Cavern / 019J6n)

- **The probe-as-test-enumeration contract held end to end:** every T2–T6 test file quotes
  its governing clause verbatim from the frozen probe, and the one genuine spec-reading
  question the transcription surfaced (which rows may carry UNVERIFIABLE — BOUNDED as a
  headline token) resolved from the frozen text itself without re-opening prose: one-sided
  rows 1/3/20 (their ordinary verdict) plus floor rows 8/11/16/17 (whose UNVERIFIABLE the
  mapping clause explicitly routes to INCOMPLETE over a _valid_ table — forbidding it at
  validation would leave that branch dead); everywhere else the token fails validation.
  Net invariant, now executable: UNVERIFIABLE outside the one-sided set can never reach
  HONEST WITHIN BOUNDS by either route. The derivation is documented with clause citations
  in `row-legality.ts`'s module doc for reviewers to check.
- **Date-stamp class caught pre-land this time:** wrote 2026-08-28 into the T6 completion
  record and the identity row from momentum; the commit author dates (16:0xZ, 2026-08-27)
  are the timestamps of record. Corrected before the continuity commit — the cheaper firing
  point the Vesta correction named.
- **T3's carry-forward closed as designed:** the FALSE-sub-claim→DIVERGENT defect (PR #68
  thread r3872912802) landed as code + tests with its one-line probe amendment riding the
  same commit under the freeze's named-defect clause — the first use of that clause, and
  the disposition's "the defect cannot reach an enable ahead of the code that fixes it"
  held literally.
- **Hook specimens refired exactly as documented** (`git checkout <branch>` on a clean tree
  → `git switch`; `git add --` + `git push -u` in one compound → split the ceremony). The
  napkin's cures worked verbatim; no new specimen classes this session.
- **Tabletop answered Bluebell Q1 by running, not reading:** compliant fresh-claim →
  HONEST WITHIN BOUNDS with rows 1/3 UNVERIFIABLE (never TRUE); fluently dishonest →
  DIVERGENT; its TRUE-over-claim variant → INCOMPLETE. Both transcripts are permanent
  fixtures in the suite, so the answer re-proves on every CI run.
