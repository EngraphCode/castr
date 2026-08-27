# Napkin

This file captures session-scoped discoveries, mistakes, corrections, and useful patterns before they are distilled or promoted into permanent docs.

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

_Earlier entries rotated to keep the active napkin healthy as cross-session lessons graduate to [`distilled.md`](distilled.md) (conserved in archive, never trimmed):_
_2026-03-25 → 2026-04-16 → [`archive/napkin-2026-03-to-04.md`](archive/napkin-2026-03-to-04.md) (2026-06-18);_
_2026-06-04 → 2026-06-10 → [`archive/napkin-2026-06-04-to-10.md`](archive/napkin-2026-06-04-to-10.md) (2026-06-19);_
_2026-06-17 → 2026-06-20 (Phase 7 + Phase 8-partial) → [`archive/napkin-2026-06-17-to-20.md`](archive/napkin-2026-06-17-to-20.md) (2026-06-20);_
_2026-06-20 → 2026-06-21 (Tranche 1/2 + FIRST-RUN dogfood + dependency-currency + pin-reframe) → [`archive/napkin-2026-06-20-to-21.md`](archive/napkin-2026-06-20-to-21.md) (2026-06-26);_
_2026-06-26 → 2026-07-03-morning (consolidations + LC/TC lanes + gap rescan + S1/delta/coverage) → [`archive/napkin-2026-06-26-to-07-03-morning.md`](archive/napkin-2026-06-26-to-07-03-morning.md) (2026-07-03);_
_2026-07-03 → 2026-08-27 (proof-programme Q-01..Q-04 firings + equality lanes + arming walk + trust reframing) → [`archive/napkin-2026-07-to-08-27.md`](archive/napkin-2026-07-to-08-27.md) (2026-08-27)._
