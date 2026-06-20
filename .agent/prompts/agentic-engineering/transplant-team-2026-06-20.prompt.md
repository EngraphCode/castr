# Transplant Team Session — Director + 2 Implementers (instance of `team-session-opener.prompt.md`)

> When working with other agents, all responses, work, claims and sources
> must be critically assessed before being accepted.

**Type**: instance (filled from [`team-session-opener.prompt.md`](team-session-opener.prompt.md), 2026-06-20). This is the
first castr **director-led concurrent stream** — it is itself the "genuinely concurrent stream" that
[`08-collaboration-active.md` §4](../../plans/transplant/08-collaboration-active.md) names as the last acceptance bar for
the `transplant/phase-8` tag, AND it lands real arc-D transplant-completion work. One stream proves the framework while
delivering.

**Plan authority**: thread record [`threads/practice-transplant.next-session.md`](../../memory/operational/threads/practice-transplant.next-session.md)
§Lanes (authoritative for the takeable arcs) + the [transplant tracker](../../plans/transplant/README.md) + the named
lane plans. Phase-8 task-work (1–6, 3a/3b, 4a/4b) is DONE; only the tag act remains, gated on this concurrent stream.

## Entry ritual (every seat, before any other move)

1. Run [`start-right-team`](../../skills/start-right-team/SKILL-CANONICAL.md) (Director seat) or
   [`start-right-quick`](../../skills/start-right-quick/shared/start-right.md) (implementer seats), end to end —
   First Moves order is non-negotiable (watcher, heartbeat, team-start broadcast, coordination, claims).
2. **Single-identity check.** Run the PDR-027 identity preflight and confirm your identity renders exactly ONE name on
   every surface. Carry the full tuple (name, platform, model, session-id prefix, AND UUID) on every event. A second
   name for your seed is a P1 defect: report it in your team-start broadcast and open no claim until the Director rules.
3. Register your identity row on [`threads/practice-transplant.next-session.md`](../../memory/operational/threads/practice-transplant.next-session.md)
   §Participating agent identities (additive per PDR-027 — never overwrite; a matching tuple updates `last_session`).
   Read that thread record end to end — it carries the lanes, the standing decisions, and the new pin model.
4. **Handoff pickup contract.** No mid-cycle handoff record is open (first stream). Re-verify the pinned facts firsthand
   at start: branch `feat/transplant-engraph-practice`, HEAD, push state, `pnpm check` green — the records are pointers,
   not the source of volatile truth.

## Team shape

One **Director** (`<model>`) + **2 implementers** (`<models>`). The Director is an opt-in coordinator per
[`agent-collaboration.md` §Coordinator Role](../../directives/agent-collaboration.md) doing **pure direction only**
(PDR-083): no implementer work, no fact-finding; context reserved for holistic team awareness. Sub-agent launches are
implementer-class work, routed to a seat. The Director owns ALL `.agent/state`, `.agent/memory`, continuity, and the
`transplant/phase-8` tag act.

## Candidate lanes (Director assigns 2 at session-open per `start-right-team` §3, from the thread-record lanes)

The two implementer lanes must be **surface-disjoint** (the collision-safety the phase-8 work proved is at the
coordination-state layer; product-file disjointness keeps feature branches clean). Recommended split — Director
confirms:

- **Lane A — arc D3 (CI to Oak standard):** make CI run the full `check:ci` chain, SHA-pin every action with a
  `# vX.Y.Z` comment, fix the `lib/pnpm-lock.yaml` path filter (lockfile is at root), repair `publish.yml`. Surface:
  `.github/workflows/`. Plan: transplant tracker §Deep-enhancement arc. This unblocks safe split-PR delivery (owner,
  Q-001: D3 before merge).
- **Lane B — arc D4 generic-surface back-brings:** bring the two genuinely-new Oak-pin collaboration subsystems task 6
  found (`agent-tools/src/collaboration-state/archive/` rotation + `provenance/`), TDD, wired. Surface:
  `agent-tools/src/collaboration-state/`. Plan: reference-closure §Task-6 D4 lane. (Alternative if a lighter Lane B is
  wanted: **D2** Node-version single-source — `.nvmrc`/`engines`/CI.)

Surfaces `.github/` and `agent-tools/src/` are disjoint → genuinely parallel. Name any hard sequencing gate explicitly
(none expected between A and B).

## Worktrees and the coordination home (critical convention)

Each session in its **own git worktree**. Coordination state is repo-file-based, so exactly ONE checkout — the
Director's — is the coordination home; the collaboration CLIs are path-parameterised (`--comms-dir`, `--active`,
`--repo-root`), so implementers point every comms/claims call at the coordination home by **absolute path** (resolve at
session open; never write a machine-local path into a versioned file). Consequence: implementer PRs are **pure diffs**
(no `.agent/state` or continuity files on a feature branch); the Director lands all `.agent/` writes from the
coordination home.

```bash
# castr context: HEAD is feat/transplant-engraph-practice (the transplant branch carries everything; delivery
# deprioritised, push at owner's call). For this stream, branch implementer worktrees off the transplant branch tip
# (not origin/main — main lacks the transplant). Director's coordination home = the primary checkout.
git worktree add <worktrees-root>/wt-<seat> -b feat/<deliverable> feat/transplant-engraph-practice
cd <worktrees-root>/wt-<seat> && pnpm install && pnpm build   # once per worktree (required for gates)
```

## Coordination cadence

- **Heartbeats**: [`liveness-heartbeat-cron`](../../rules/liveness-heartbeat-cron.md) (≤4-min cadence, 10-min
  retirement threshold) unless the owner ratifies a looser cadence in this brief.
- **Asks**: bounded-deadline + default-action on directed comms events; lowest-authority resolver; Director escalates to
  the owner only for owner-owned decisions.
- **Director monitoring**: persistent watchers on the comms stream and (if PRs open) every PR; every loop carries an
  explicit exit criterion.
- **Reviews / merges**: Director-serialised; every reviewer comment adjudicated firsthand (refute with source or apply,
  never relay/dismiss).
- **Closeout**: Director is the team closeout owner and runs the FULL `session-handoff` + `consolidate-docs` BEFORE the
  final continuity commit. **The phase-8 tag is cut by the Director once the concurrent stream has demonstrably
  exercised the records/lanes end-to-end (two seats' identity rows + live claims/comms) and `pnpm check` is green +
  reference-closure clean.**

## castr-specific cautions

- **Single-branch history**: all work has been on `feat/transplant-engraph-practice`; delivery is deprioritised
  ("not in a rush to merge"). If running full worktree+PR delivery is heavier than this stream needs, the Director may
  run a lighter shape: both implementers on short feature branches off the transplant tip, claims-coordinated on the
  single coordination home — the collision-safety is proven (task 3b). The point is a **genuinely concurrent stream**
  exercising the records, not maximal ceremony.
- **The Oak sync pin is now a rebased branch** `practice/castr-pin` (read it via `git -C <oak> show
practice/castr-pin:<path>`, NEVER the Oak working tree). Not needed for this stream's lanes, but hold it.
- `pnpm check` is the gate (agent-tools now gates too, since task 4b). `.agent` is prettier-checked. commitlint header
  ≤100 chars (the `commit-msg` hook is empty — validate manually with `pnpm --filter @engraph/agent-tools
check-commit-message`).
