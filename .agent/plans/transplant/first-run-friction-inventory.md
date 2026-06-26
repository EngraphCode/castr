# First-Run Friction Inventory — collaboration setup (Phase 8 dogfood)

> **Controlling plan for the `first-run friction-fix tranche` lane**
> ([thread record](../../memory/operational/threads/practice-transplant.next-session.md)
> § Lane: first-run friction-fix tranche). Measured firsthand by the first
> director-led concurrent stream (2026-06-20, owner-directed "record all
> frustrations and issues"). Relocated here verbatim from the active napkin at
> the 2026-06-26 consolidation so the napkin could rotate without orphaning the
> lane's source detail (the prior consolidation's stated cure: "graduate the
> FIRST-RUN F/N detail into that lane's plan/records, THEN rotate"). The lane's
> concrete cure bullets live in the thread record; this file is the measured
> evidence each cure addresses.

**Status:** open worklist — the friction-fix tranche is active-next (owner-recommended, before the next team session). Each F/N item below is a measured defect with a candidate cure; the lane bullets in the thread record group them into pickup-able slices. The hook-matcher precision items (N7/N11) are owned by the separate hook-matcher-precision lane.

**Acceptance:** each item lands as code/rule-text with TDD where code is touched (per the lane acceptance bar).

---

## 2026-06-20 (FIRST RUN of the collaboration setup — Director seat, owner-directed continuous friction log)

> Owner: _"record all frustrations and issues, this is a first run of the collaboration setup in this repo."_
> Director = Briny Cresting Sextant (claude-opus-4-8-1m, fdb75b). This section is the running capture surface for the
> first genuinely-concurrent director-led stream. Newest friction appended to the bottom of this list.

### Practice/tooling feedback — onboarding & grounding friction

- **Surface**: `start-right-quick/shared/start-right.md` §4 reading order. **Signal**: friction. **Observation**: the
  reading order names `.agent/state/collaboration/active-claims.json` and `…/shared-comms-log.md` as files to read, but
  on a **fresh coordination home both are absent** (gitignored, instance-tier, created only on first write). A literal
  `cat` of either fails (`No such file or directory`), reading like a broken repo to a first-timer. **Candidate
  follow-up**: §4 should say "on a fresh home these may not exist yet — list state via `claims list --active <path>` /
  `comms list --comms-dir <dir>` rather than `cat`," or point at the CLI as the canonical read.
- **Surface**: `agent-tools:collaboration-state comms list` / `claims list`. **Signal**: friction. **Observation**:
  flag-naming inconsistency cost two failed invocations. `comms list` takes `--tail <n>`, NOT `--limit` (and rejects
  `--limit` outright); `claims list` has no default for `--active` and errors `missing required option --active`. A
  newcomer reaching for the obvious `--limit` / a bare `list` hits a wall. **Candidate follow-up**: accept `--limit` as
  an alias for `--tail`; consider defaulting `--active`/`--comms-dir` to the conventional repo paths when run from repo
  root.
- **Surface**: `pnpm agent-tools:collaboration-state --` wrapper. **Signal**: friction. **Observation**: the wrapper
  runs `cd .. && node agent-tools/dist/...`, so **relative** `--active`/`--comms-dir`/`--seen-file` paths resolve
  against an unexpected cwd. Absolute paths are effectively mandatory even for the Director operating inside the
  coordination home itself — not just for implementers in other worktrees (the brief only flags this for implementers).
  **Candidate follow-up**: document "always pass absolute paths" as a general CLI rule, or make the wrapper cwd-stable.
- **Surface**: `pnpm agent-tools:collaboration-state` (every invocation). **Signal**: friction (minor). **Observation**:
  each call double-echoes its command line (`$ pnpm --filter…` then `$ cd .. && node…`), adding noise to every
  coordination action's output. Not blocking; adds up across a high-frequency coordination session.

### Owner-surfaced gaps (Q1/Q2, 2026-06-20) — real, confirmed firsthand

- **GAP — comms-monitor-per-agent not running (Q1).** Owner: _"why is no one running their comms monitor? Without that
  there will be absolutely no inter-agent comms unless they coincidentally check the comms events."_ Correct on two
  counts: (1) I (Director) had **not** started my own watcher — I sequenced it after state-seeding, but
  `start-right-team` First Moves makes the all-channels watcher **move 1** (before identity/claims). Ordering deviation,
  now corrected (watcher `bsj6zj281` live). (2) Structural: the comms system is **inert** unless every seat runs
  `comms watch`. **Behaviour change**: each seat's non-negotiable move-1 is its own `comms watch` Monitor; bake into
  every implementer brief. Also: a sub-agent (Agent-tool) realization likely **cannot** hold a persistent comms
  Monitor while doing linear work → it would degrade to "coincidentally check," exactly the failure the owner names.
  This is strong evidence implementer seats should be **separate sessions**, not env-sharing sub-agents.
- **GAP — agent identity not surfaced in statusline (Q2). Confirmed: castr transplanted the renderer but NOT the
  `.claude/` wiring.** Identities ARE derivable (I am `Briny Cresting Sextant`; the SessionStart hook
  `.claude/hooks/practice-session-identity.mjs` sets `PRACTICE_AGENT_SESSION_ID_CLAUDE`). castr HAS the adapter
  `agent-tools/dist/src/claude/statusline-identity.js` (built, chmod +x in agent-tools `build`). But castr is **missing
  both wiring pieces** Oak has at the pin (`practice/castr-pin`):
  1. `.claude/scripts/statusline-identity.mjs` — the shim that spawns the built adapter (castr has **no `.claude/scripts/`
     dir at all**). Oak's shim: soft-fail (exit 0, no stdout on any error), prefers `CLAUDE_PROJECT_DIR`.
  2. The `statusLine` block in `.claude/settings.json` (`{"type":"command","command":"node
.claude/scripts/statusline-identity.mjs"}`). castr's settings.json has **no `statusLine` key**.
     So in castr the identity exists under the hood but is **invisible in every session's UI** → "no one has an agent
     identity" visually. **Behaviour change / candidate follow-up**: bring the two `.claude/` wiring pieces from the Oak
     pin (small, self-contained transplant-completion gap; in scope for "fix castr's known issues"). Owner-decision: fix
     now (and by whom — Director-as-infra vs routed seat) or defer.
- **RISK — sub-agent identity collision (Q2, part b).** If implementers are spawned as Agent-tool sub-agents they
  inherit this session's `$CLAUDE_ENV_FILE` → same `PRACTICE_AGENT_SESSION_ID_CLAUDE` seed → they would derive MY
  identity (`Briny Cresting Sextant`), a PDR-027 single-identity P1. Separate sessions each get their own session_id →
  distinct identity. Reinforces the separate-session model.

### Seat 2 friction (Secret Watching Candle / 328f4f), captured live via comms broadcast 1ac3880d

The Director owns continuity writes; landing Seat 2's friction here per the owner's record-all directive (Seat 2 is a
separate session / worktree and does not write `.agent/` files — pure-diff discipline). Corroborates F1 above; adds:

- **F2 (real CLI defect, not just doctrine)**: `claims active-agents --active <path>` exits non-zero with `ENOENT`
  when active-claims.json does not exist yet, instead of reporting "0 active agents". A read-only presence query must
  treat a missing registry as empty. Likely also affects `claims list|mine|status`. **This is a code fix** in
  `agent-tools/src/collaboration-state/` read-only claims actions — candidate for a lane/owner-routed fix.
- **F3**: worktree-before-lane sequencing tension — the opener sequences `git worktree add -b feat/<deliverable>`
  before the Director assigns the lane, but `<deliverable>` is only known post-assignment. Seat 2 correctly deferred
  the worktree. **Cure**: opener/brief should state implementers create the deliverable-named worktree _after_ lane
  assignment. (Director action: lane assignment must include the deliverable branch name.)
- **F4**: `comms-seen/` absent on fresh home; CLI does not auto-create the seen-file parent dir → silently re-emits
  every event each poll if missing. Also a doctrine/impl mismatch: `comms-all-channels-watcher.md` §Seen-file calls
  comms-seen a "committed directory" but `.gitignore` ignores `comms-seen/*` (it is instance-tier, NOT committed).
  **Cure**: CLI auto-creates seen-file parent dir; reconcile the rule wording. (I pre-created the dir this session.)
- **F5 (real ordering contradiction)**: HEARTBEAT MODE (`comms ... --tag heartbeat`) requires `--claim-id` +
  `--intent-id`, but First Moves orders heartbeat (move 2) _before_ claims (move 7). A seat awaiting lane assignment
  has no claim-id → typed heartbeat impossible during the pre-assignment wait. Seat 2 used its presence broadcast for
  liveness and deferred the heartbeat cron to claim-open (correct). **Cure**: allow a pre-claim presence-heartbeat, OR
  doctrine states pre-assignment liveness = presence broadcast and the heartbeat cron starts at claim-open. Director
  applies the latter this session.

### Seat 1 friction (Stratospheric Wheeling Horizon / 4aeee2), captured live via comms eb1f54f1

**Independent reproduction** of Seat 2's F1, F3, F4, F5 (two separate sessions hit them independently — strong
graduate-this signal). New items:

- **N1 — identity-row registration: WHO writes it / WHERE (doctrine tension).** Entry-ritual step 3 + threads/README
  ("Before any edits: update the identity row ... Do not proceed until the row is written") tell each seat to register
  its OWN row in the thread record. But the transplant-team prompt says the Director owns ALL .agent continuity and
  "implementer PRs are pure diffs ... the Director lands all .agent/ writes." Nothing reconciles the two. **Cure**:
  state explicitly that identity-row registration is the ONE bootstrap continuity write each seat makes directly to the
  coordination home, distinct from feature-branch pure-diff discipline. (Director ruling this session: rows are in;
  no further seat hand-edits to the thread record — Director serialises continuity writes henceforth.)
- **N2 — shared identity-table write race, OBSERVED LIVE (not theoretical).** The thread-record identity table is plain
  markdown with no transaction protection. Seat 1's first append failed "File has been modified since read" during the
  multi-seat registration window; re-read + retry succeeded. Edit's optimistic-concurrency check failed SAFE (fail-loud,
  no corruption), but N lock-free hand-edits can interleave. **Cure**: a `claims/identity register` CLI action doing an
  atomic additive upsert (match-by-prefix then append) under the same write-safety as the claims engine.
- **N3 — `$CLAUDE_ENV_FILE` resolves to empty string in the tool shell.** SessionStart context says PRACTICE*\* "is set
  in $CLAUDE_ENV_FILE so shell tools resolve identity." The PRACTICE var IS exported (preflight resolves via it), but
  `$CLAUDE_ENV_FILE`itself is empty in the Bash tool shell →`use-built-agent-tools-cli`'s "cache identity in the env
  file and read it back" is not literally followable. Low impact (exported var is the working carrier). **Cure**:
  populate $CLAUDE_ENV_FILE in the tool shell, or amend the rule to note PRACTICE*\* is the carrier.
- **N4 — comms-seen seen-file codename contains spaces (shell-quoting hazard).** Convention names the seen-file
  "<agent-codename>.json" = "Stratospheric Wheeling Horizon.json"; every watcher invocation must quote a space-bearing
  path or it splits into three. **Cure**: slugify the codename for filesystem paths (stratospheric-wheeling-horizon.json)
  while keeping the display name for rendering. (Director sidestepped this by using session-prefix seen-files,
  e.g. director-fdb75b.seen.)

- **N5 — heartbeat `--intent-id` has no canonical source.** `claims open` emits a `claim_id` + free-text `intent`, but
  NOT an `intent_id`; yet HEARTBEAT MODE requires `--intent-id`. Seat 1 reused the `claim_id` as `--intent-id` and it
  validated. Minor, but the contract is underspecified. **Cure**: either drop the `--intent-id` requirement for
  claim-bound heartbeats, or have `claims open` emit a canonical `intent_id` to thread through.

- **N6 — `platform` field value inconsistent across seats (operationally relevant).** Seat 2's comms author identity
  reports `platform: "claude"`, while Seat 1 and Director report `"claude-code"` — same harness, different field value.
  Worse, Seat 2's thread-record identity row says `claude-code` while its comms-event author says `claude`, so the same
  agent renders two platform strings on two surfaces. This breaks directed-comms targeting: `comms direct --to-platform`
  must match the recipient's ACTUAL identity (`claude` for Seat 2) or the event misroutes. The PDR-027 id is a uuid-v5
  over the tuple, so a differing platform string also yields a different uuid. **Cure**: canonicalise the platform
  value (one of `claude-code` | `claude`) at identity-derivation time; the preflight should reject/normalise variants.

- **N7 (Seat 1) — comms-body via shell heredoc trips the dangerous-pattern hook scanner.** Composing a comms-event
  body inline with `cat > file <<EOF … EOF` was BLOCKED with "matched dangerous pattern 'git checkout --'" — though the
  command contained NO git invocation; the body was review-synthesis prose mentioning "checkout" (the actions/checkout
  action) and "--" tokens, and the substring scanner matched across prose. Exactly the over-trigger
  `hook-policy-substring-discipline.md` warns about. Impact low (cure: write the body with the Write tool, pass
  `--body-file` — never inline heredoc). **Cure**: (a) extend the CLI's "--body-file is the cure for shell-quoting"
  guidance to also name the dangerous-pattern scanner; (b) anchor the hook matcher on actual command position (word
  boundary / start-of-command), not free-substring. (Director independently hit the same class — I have used
  `--body-file` for every rich body this session for this reason.)

- **N8 (Seat 1 + DIRECTOR ERROR) — castr's commitlint type-enum is CUSTOM; `ci` is NOT valid.** I (Director) suggested a
  commit subject `ci(transplant): …`; `check-commit-message` REJECTED it on type-enum. castr's allowed types are
  `[feat, fix, refactor, test, docs, chore, perf]` (principles.md §Git Commit Standards) — `ci`/`build`/`style`/`revert`
  (conventional-commits defaults) are NOT in the enum. Seat 1 correctly used `chore(transplant): …`. **My mistake, logged
  honestly**: I assumed conventional defaults instead of enumerating castr's live constraint at draft time (the
  engraph-commit skill exists precisely to enumerate the live enum inline). **Cure**: when suggesting a commit subject,
  state the type from castr's actual enum, never the conventional default.
- **N9 (Seat 1) — `git rm` + `git add -- a b` atomic-abort can produce a partial commit.** After `git rm publish.yml`
  (deletion already staged + file gone from disk), `git add -- ci.yml publish.yml` aborted atomically with "pathspec
  'publish.yml' did not match any files" → ci.yml never staged → the first commit captured ONLY the deletion. Caught via
  `git show --stat`, amended (local, un-pushed). **Cure**: when a bundle mixes a `git rm`-deleted path and a modified
  path, don't re-`git add` the deleted path (its deletion is already staged) — stage only the existing modified paths, or
  use `git add -A -- <dir>`. Interacts with `stage-by-explicit-pathspec`: explicit pathspecs are right, but a removed
  path is not an addable pathspec.

- **N10 (Seat 2) — CRITICAL: an ARMED all-channels watcher silently delivered only ONE notification despite ~6
  accumulated events.** Seat 2's persistent Monitor watcher never woke on the 12:54 lane assignment (0a65f0d8), the
  13:07 directed ping (845964f8), or the 13:13 liveness broadcast (b704bc56) — it fired only on the most-recent event
  ~40 min later. This is the single most important first-run finding: it is EXACTLY the failure the owner's Q1
  predicted ("no inter-agent comms unless they coincidentally check"), and it happened **even with a watcher armed**.
  Consequences: Seat 2's ~40-min silence, my (correct-procedure) near-retirement escalation, and a Lane B stall.
  - **N10 (Director label) == F6 (Seat 2's failure-mode label)** — same finding, reconciled.
  - **MEASURED ROOT CAUSE (Seat 2, corrects my earlier hypothesis): harness notification COALESCING during idle
    windows — NOT a seen-file/path bug.** Seat 2's seen-file recorded all 27 event ids, proving the `comms watch` CLI
    consumed every event correctly. The gap is in the Claude Code Monitor's notification delivery: when many Monitor
    stdout lines fire while a session is IDLE (no active turn in flight), only the latest surfaces as an actionable wake;
    earlier notifications are coalesced/superseded rather than each producing a turn. An armed persistent watcher
    therefore does NOT guarantee per-event wake across a long idle gap.
  - **MY N4-LINK HYPOTHESIS WAS WRONG — corrected here.** I guessed the cause was a spaced seen-file path (N4); Seat 2
    MEASURED it (seen-file consumed all 27 ids → not a path/seen bug). Measurement beats my guess
    ([[dont-dismiss-tools-as-false-positive]] in the inverse: I should have measured before hypothesising a cause). Why
    Director + Seat 1 were unaffected: both were continuously ACTIVE (frequent events/turns), so never sat in a long
    idle-coalescing window; Seat 2 was idle ~40 min awaiting lane assignment. (Director re-ran the catch-up-sweep cure
    on self this turn and confirmed full context — 36 events, nothing missed.)
  - **CURE (adopted, now team doctrine): on ANY watcher wake, run a full `comms list --tail N` catch-up sweep and
    reconcile against the seen-file** — treat the watcher as "something changed, go look at the whole stream," NOT "here
    is every event." Candidate heavier follow-ups: (a) name this idle-coalescing caveat explicitly in
    `use-monitor-for-event-driven-wake.md` + `comms-all-channels-watcher.md` (both currently ASSUME per-event wake);
    (b) have the watcher emit a periodic "N unseen since last wake" summary line so a coalesced wake still carries the
    backlog count; (c) make any heartbeat tick / owner turn trigger a full sweep.
  - **Doctrine reinforcement**: the ≤120s manual message sweep exists precisely as the BACKSTOP for monitor failure.
    `use-monitor-for-event-driven-wake` says the monitor "satisfies the cadence for that surface" — but N10 proves an
    agent must still verify the monitor is ACTUALLY delivering (periodic sweep / self-test), or a silent watcher failure
    reads identically to "nothing happening." Sole reliance on an unverified monitor is the trap.
  - **Cure candidates**: slugify seen-file paths (the N4 cure, likely fixes this); guarantee `comms watch` stdout is
    line-buffered; harden seen-file write/track atomicity; add a watcher self-test the agent can assert at startup;
    keep the ≤120s fallback sweep mandatory, not optional, until watcher reliability is proven.

- **F7 (Seat 2) — the commit skill documents a non-existent root pnpm alias.** `skills/.../engraph-commit
SKILL-CANONICAL.md` references `pnpm agent-tools:check-commit-message` ~10 times (Tooling, protocol, why-active), but
  that ROOT alias does not exist → `Command "agent-tools:check-commit-message" not found. Did you mean
agent-tools:commit-queue`. The working invocation is `pnpm --filter @engraph/agent-tools check-commit-message` (which
  the team-session prompt correctly used). An agent following the canonical commit skill verbatim hits command-not-found
  at the validation step. **Cure**: add the root alias to package.json (mirror the other `agent-tools:*` aliases), OR fix
  the skill to use the `--filter` form. (Same alias-vs-filter class as the general CLI-invocation friction logged above.)

- **N11 (Seat 1) — dangerous-pattern hook over-matches bare "checkout" (N7 escalated, now blocks legitimate git).**
  Sharper than N7 (which was comms-body prose): the substring matcher blocked a Bash call merely because an echo COMMENT
  contained "checkout pattern", AND it blocks `git checkout -b <branch>` (safe branch creation) as if it were
  `git checkout -- <path>` (the discard form the rule actually targets). So the guard now blocks legitimate git
  operations, not just innocent prose. Cure adopted by Seat 1: create branches with `git switch -c`; keep the word
  "checkout" out of command strings/comments. **This is the strongest case yet for `hook-policy-substring-discipline`'s
  fix**: anchor the matcher on actual command position (`git checkout --` as a command-leading token sequence), not a
  free substring — the current matcher has a real false-positive rate on safe `git checkout -b` / `git switch`-era
  workflows and on any prose mentioning checkout. Family: N7 (comms heredoc) + N11 (git commands) + the zsh/quoting
  friction — the shared root is naive string-matching where structured/positional matching is needed.

- **N12 (caught at Director closeout) — watcher seen-file `.json` extension on non-JSON content breaks `pnpm
format:check`.** The implementers' `comms watch` seen-files were named `<codename>.json` (e.g.
  `secret-watching-candle.json`, `Stratospheric Wheeling Horizon.json`) but contain newline-separated event UUIDs, NOT
  JSON. Prettier's `**/*.{…,json,…}` glob scanned them and threw `SyntaxError: Identifier directly after number` → RED
  `format:check` at closeout (a blocking gate). `comms-seen/*` is gitignored, but `.prettierignore` has **no comms-seen
  entry** and the glob overrode the nested `.agent/state/collaboration/.gitignore`. The Director's own seen-file used
  `director-fdb75b.seen` (`.seen` extension, not in the glob) → unaffected — which is the cure. **Cure:** the watcher CLI
  should write seen-files with a non-prettier extension (`.seen`, slugified — also fixes N4's spaces), OR add
  `.agent/state/collaboration/comms-seen/` to `.prettierignore`. Closeout fix: deleted the 2 orphaned `.json` seen-files
  (watchers stopped; instance-tier, gitignored, regenerable) → gate green. Compounds N4 (spaced codename) + the
  instance-tier/format-gate interaction.

### Director's own friction (Briny Cresting Sextant / fdb75b)

- **DIRECTOR MISTAKE — assigned a coordinate-dependent lane as if surface-disjoint (branch-base error).** I assigned arc
  D2 to Seat 1 "off the transplant tip 8d62197." Seat 1 caught it firsthand: D2 and D3 **share `.github/workflows/ci.yml`**
  (and D3 deleted publish.yml), so D2-off-8d62197 would full-file-conflict with D3's rewrite and resurrect publish.yml.
  The correct base is D3's tip `c7f819e` (D2 = D3 + clean increment). **Lesson**: two "arcs" that look like different
  lanes can still be COORDINATE-DEPENDENT if they touch the same file — `ship-independent-coordinate-dependent` applies
  to lane _base selection_, not just merge order. Before naming a branch base, check whether the new lane touches a file
  an in-flight lane already changed; if so, base it on that lane's tip, not the shared ancestor. (Caught by the
  implementer, not me — reinforces verify-dont-trust applies to the Director's own coordination assumptions.)

- **zsh word-split re-bite — recurred even though it is already a distilled lesson in THIS file.** Assigned
  `BIN="node …agent-tools.js collaboration-state"` and ran `$BIN claims open …` → zsh treated the whole multi-word var
  as one command name ("no such file or directory"). The napkin's own prior entry warns exactly this. **Meta-signal**:
  a passive distilled warning does not fire under work pressure (matches `passive-guidance-loses-to-artefact-gravity`).
  Cure used: inline the full `node …` command (no var). The CLI shape itself invites the trap — a thin wrapper script
  on PATH (e.g. `cs` for collaboration-state) would remove both this and the `pnpm … --` cd-cwd hazard.

### Known landmines inherited from the napkin (will hit this session)

- **`claims open` does NOT auto-create `active-claims.json`** (prior entry, this file): must seed
  `{schema_version, commit_queue:[], claims:[]}` + closed-claims `{schema_version, claims:[]}` before first open. The
  README's "created on first CLI use" is wrong. **First-run severity is high**: this is the literal first thing the
  first concurrent stream does, and it fails closed with a confusing ENOENT unless the operator already knows to seed.
- **`claim_id` is schema `format: "uuid"`** — cannot pass a human-readable `--claim-id`; omit it and capture the
  generated v4 from stdout JSON.

### New friction (2026-06-26, Eclipsed Lurking Moth consolidation — same agent-tools-CLI class as F7/N5)

- **`check-commit-message`'s `-F <file>` / `--file <file>` flag fails through the `pnpm --filter` wrapper (exit 2,
  "invalid usage"), but `< file` stdin works.** `pnpm --filter @engraph/agent-tools check-commit-message -- -F <path>`
  returned exit 2; `pnpm exec tsx agent-tools/src/commit-advisories/check-commit-message.ts < <path>` (stdin, no flags)
  returned exit 0. The `--`-forwarded `-F` arg does not reach the script intact through the workspace wrapper. **Cure:**
  pipe the message via stdin for validation, or fix the wrapper's arg-forwarding so `-F` survives `--`. Compounds the
  general `pnpm … --` cwd/arg-forwarding hazard already logged above. Same first-class-tooling-feedback class as F7.
- **`claims open` requires `--now <iso>` and `claims close` requires `--now` + `--closed <path>` + `--platform` +
  `--model`** — none defaulted; each missing one is a separate exit-2 round-trip (the help lists them but the failure
  surfaces them one at a time). Minor; cure: default `--now` to current time and `--closed` to the conventional sibling
  path, or list all required flags in one error.
