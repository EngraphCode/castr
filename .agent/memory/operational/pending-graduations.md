---
fitness_line_target: 1100
fitness_line_limit: 1467
fitness_char_limit: 200000
fitness_line_length: 100
lifecycle_model: >-
  canonical pending-graduations register — owner-gated and pending items live
  here until graduated, duplicated, stale-withdrawn, or owner-resolved
access_pattern: >-
  consolidation-pass-only — read at consolidations and drain sessions; not
  loaded every session by every agent
drain_strategy: >-
  Graduate items to PDRs/ADRs/rules/permanent docs; keep owner-gated items here
  until owner direction resolves them; do not split, shard, or hide buffer depth
fitness_rationale: >-
  Fitness on a drainable buffer is a drain-cadence signal, not a size cap. The
  register reads `hard` while an owner-gated backlog waits to be walked down with
  the owner present; it goes green when the backlog is genuinely graduated, not by
  tombstone-removal. Fitness here is informational-only (not wired into any
  commit/push hook), so a standing `hard` never blocks a commit and must be
  reported, not chased: owner-gated items that legitimately wait are never trimmed
  to clear it. Materialised fresh in castr by the Practice transplant (Phase 6,
  2026-06-18); the register starts near-empty and is populated by napkin drains and
  consolidation passes.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Pending Graduations

This is the canonical pending-graduations register. Do not create dated,
windowed, backlog, split, or shard-like pending-graduation files. New capture,
owner-gated items, and unresolved pending-graduation decisions belong here until
they graduate, duplicate, become stale-withdrawn, or receive owner direction.

Each entry should record: the captured substance, its candidate permanent home
(PDR / ADR / rule / distilled / pattern / README), and a
`[captured: <date> | source: <surface>]` provenance stamp. When an item
graduates, route its substance to the permanent home and remove it here — the
commit and the permanent doc are the record (no tombstone; see the
[consolidation-record rule](../../rules/permanent-doc-is-the-consolidation-record.md)).

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr. Items below are populated by napkin drains and consolidation passes
> from castr's own state — not copied from any other repo.

<!-- Entries appended below by napkin drains and consolidation passes. -->

### Loop-closure completeness test + the "verify workflow output firsthand" sharpening

The loop-closure-as-completeness-test (doctrine→mechanism→wiring→signal) + the Class-B
false-claim failure mode + the sharpening that **an adversarially-verified workflow/subagent
bring-plan is still a claim to measure firsthand, especially for transitive dependencies** (the
audit-method-under-counts root recurs at the workflow-output level — worked LC1 instance: the
bring-plan missed the heartbeat-path writer dependency). Candidate permanent home: a **PDR-096
amendment** (or sibling PDR) graduated when the loop-closure remediation lane (LC0–LC5)
completes; the firsthand-verify sharpening may instead amend `verify-agent-claims-firsthand`.
Live in `distilled.md` (two entries) + `practice-loop-closure-remediation.md`.
`[captured: 2026-06-27 | source: distilled.md + practice-loop-closure-remediation.md]`
trigger-condition: loop-closure lane completes (all of LC0–LC5 + LC-reopen done; as of
2026-07-03 LC0/1/2/3a/3c are done — LC3b, LC3d, LC4, LC5 remain). status: pending.
The [source lane](../../plans/transplant/practice-loop-closure-remediation.md) is
historical under the stopped transplant. Programme Q-12 or an explicitly
authorised bilateral-equality slice must re-assess and deliver its residuals
before this completion trigger can fire. PDR-135's doctrinal graduation does not
prove LC completion or resume that lane.

### Autonomous-programme operating pattern → PDR

The `autonomous-background-programme` pattern (with `owner-decision-ballot` as its
decision-transport companion) is Practice-governance-grade: the operating shape for
unattended scheduled-session programmes — ballot front-loading, condition-based merge
authority, queue-as-frontmatter with durable counters, reports-follow-the-audience,
collision machinery for a shared remote, and the tap-to-answer owner ballot. Candidate
permanent home: a **PDR** once a second autonomous programme (or a second host repo)
consumes the pattern, or on owner direction. Live in `.agent/memory/active/patterns/`.
`[captured: 2026-08-23 | source: QD-6 landing (proof-programme)]`
trigger-condition: a second autonomous programme consumes the pattern, or the
owner directs graduation. The consumer trigger is satisfied: the
[dedicated-consolidation prompt](../../prompts/agentic-engineering/dedicated-consolidation-session.md)
explicitly consumes the pattern's collision/duration lesson; its
[thread](threads/consolidation-routine-and-watcher.next-session.md) records the
second programme's August 27 configuration and PR #69.
status: pending graduation, with reuse evidenced. This is selective consumption,
not proof that every mechanism generalises. The present documentation commission
authorises the verified-claims PDR; a separate bounded Practice graduation under
programme Q-12 or explicit owner direction must adjudicate this broader Core
change against the second consumer. The pattern remains its live substantive
home; neither programme is enabled by recording this trigger.

### PDR-056 cloud-seat channel-availability extension

The 2026-08-27 ruling refinement (one agent per cloud instance; filesystem comms substrate
absent by construction; Slack via a live Watcher is the working cloud channel) is landed as
phenotype (commit skill + claims/comms rules) but not in the portable Core. Candidate
permanent home: a small extension to **PDR-056** (inter-agent collaboration protocol) so the
channel-availability fact travels with the Core. Core edits are owner-approved; the drafting
offer was made in-session 2026-08-27 and not yet answered.
`[captured: 2026-08-27 | source: consolidation session (Limpet guards Moorings), Core review step]`
trigger-condition: owner approves (or declines) the extension. status: owner-gated.

### IR persistence schema-versioning policy → ADR

Q-03 (2026-08-24 firing) landed hard version pinning at `serializeIR`/`deserializeIR`
(foreign versions rejected both directions, no migration machinery,
regenerate-from-source contract) via review convergence on PR #50 rather than an
upfront decision record. Candidate permanent home: an **ADR** stating the IR
persistence versioning policy, authored from the PR #50 thread record rather than
re-derived.
`[captured: 2026-08-24 | source: napkin (Luminous Waning Orbit)]` — registered here at the
2026-08-27 napkin rotation.
trigger-condition: the first time IR migration machinery or a multi-version read
window is proposed. status: pending.

### Slack-watcher skill: editable-deadman fallback for surfaces without message edit

The 2026-08-27 Watcher stand-up measured that the Slack MCP surface available to cloud
sessions has NO message-edit tool, making the skill's "EDIT the tenure status message every
tick" deadman unimplementable as written. The worked cure: a Slack **canvas** as the
always-current tenure status surface (created at stand-up, anchored from the intro's threaded
reply, edited every tick, final-edited at teardown — full tenure `F0BT7TXQ3PW` ran on it
end-to-end). Candidate permanent home: an amendment to
`.agent/skills/slack-watcher/SKILL-CANONICAL.md` §2/§3 naming the canvas fallback (or
per-tick threaded replies where canvases are unavailable) for surfaces lacking `chat.update`.
`[captured: 2026-08-27 | source: napkin (Slack Watcher stand-up entry) + tenure F0BT7TXQ3PW]`
trigger-condition: next slack-watcher skill edit, or the next Watcher stand-up on an
edit-capable surface (either confirms or retires the fallback shape). status: pending.

### Verify a bot-cited SHA exists before reading its argument

PR #69 round 6: a review bot re-raised an already-rejected finding citing "fresh evidence in
`5b63e55f`" — a commit absent from the local clone (`git cat-file -t` fails) AND from the
repository remote (independent GitHub lookup, PR #71 round 1). Sharpens
verify-the-reviewer's-warrant: for any bot finding whose evidence is a commit SHA, check
`git cat-file -t <sha>` first, then confirm at the repository level (`git fetch origin
<sha>` or a GitHub commit lookup) before voiding — cat-file alone proves only local absence,
and a shallow or partially-fetched clone can lack valid remote commits. Only the combined
absence voids the finding and invokes the review cap. Candidate permanent home: a sharpening of
the review-bot convergence-cap doctrine (ADR-051 clause 4 family / the
autonomous-background-programme pattern item 8) or `verify-dont-trust`.
`[captured: 2026-08-27 | source: napkin (PR #69 review-drive entry) + PR #69 thread r3872515171]`
trigger-condition: second fabricated-citation instance, or the next convergence-cap doctrine
edit. status: pending.
