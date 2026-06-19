---
prompt_id: start-right-quick
title: 'Start Right (Quick)'
type: workflow
status: active
last_updated: 2026-04-26
---

# Start Right (Quick)

Ground yourself before beginning work. Read in the order below; each
step leads to the surfaces the next step assumes.

## Ground First (reading order)

### 1. Durable directives

Read and internalise. **This foundation-directive reading is the
necessary precondition for Family-A Class A.1 (per PDR-029
§Decision; A.1 is single-layer post-2026-04-21 Session 5
reclassification — foundation-directive grounding is background
grounding, not an installed tripwire layer; the installed layer
is the plan-body first-principles-check rule).**

1. @.agent/directives/AGENT.md — operational entry point and index
2. @RULES_INDEX.md — canonical list of always-applied `.agent/rules/*.md`
   files
3. @.agent/directives/principles.md — authoritative engineering principles
4. @.agent/directives/tdd-as-design.md — foundational TDD definition: a test
   describes a system state, product code is the path that guides the system
   into it
5. @.agent/directives/testing-strategy.md — test-type taxonomy and shape rules
6. @.agent/directives/requirements.md — castr's decision-making guide and product doctrine
7. @.agent/directives/DEFINITION_OF_DONE.md — castr's canonical quality-gate protocol
8. @.agent/directives/metacognition.md — reflective grounding before planning substantial work
9. @.agent/directives/orientation.md — layering contract and authority order

For Codex, Gemini, or any other platform that does not auto-load canonical
rules, read every canonical `.agent/rules/*.md` file listed in
`RULES_INDEX.md` before substantive work. Treat `RULES_INDEX.md` as the live
inventory rather than copying the rule list here.

### 2. Start-here ADRs

Open the [ADR index](../../../../docs/architectural_decision_records/README.md) and read any ADR (001–047) whose slug
matches your current workstream, plus the durable architecture docs under
[`docs/architecture/`](../../../../docs/architecture/) named by the active plan.

### 3. Learning-loop surfaces (active memory)

- @.agent/memory/active/distilled.md — refined cross-session lessons
- @.agent/memory/active/napkin.md — current session observations
- @.agent/memory/active/patterns/passive-guidance-loses-to-artefact-gravity.md —
  constraint at tripwire-design time (passive guidance needs an active
  layer to fire under context pressure)
- Your own platform's per-user memory and session logs. Scan the
  surface for the platform you are running on:
  - Claude Code: `~/.claude/projects/<project>/memory/`
  - Cursor: `~/.cursor/chats/`, `~/.cursor/prompt_history.json`; Composer may inject deterministic identity from `.cursor/hooks/engraph-session-identity.mjs` (`sessionStart`; see `agent-tools/docs/agent-identity.md` and [Cursor Hooks](https://cursor.com/docs/hooks))
  - Codex: `~/.codex/memories/`, `~/.codex/history.jsonl`

  Read only the surface that matches your current platform at
  session open. Cross-platform ingestion (reading another
  platform's surface for insight) is a consolidation-time
  activity, not a session-open one — see `consolidate-docs`
  step 3.

### 4. Live state (operational memory) — authority order

Read in order; stop at whichever answers your next-step question:

1. @.agent/memory/operational/repo-continuity.md — canonical continuity contract
2. @.agent/memory/operational/threads/README.md — thread convention + identity discipline (PDR-027)
3. `.agent/memory/operational/threads/<slug>.next-session.md` — the thread record for any thread the session will touch (carries identity, next-session landing, _and lane state_ — workstream surface retired 2026-04-21)
4. `.agent/state/collaboration/active-claims.json` — active-claims
   registry and ordered advisory `commit_queue`
5. `.agent/state/collaboration/shared-comms-log.md` — generated recent
   free-form collaboration context
6. `.agent/state/collaboration/conversations/*.json` — open decision
   threads, sidebars, joint decisions, unresolved decision requests, and
   evidence obligations for the touched thread or area
7. `.agent/state/collaboration/escalations/*.json` — active owner-facing
   escalation cases for the touched thread or area
8. `.agent/memory/operational/tracks/*.md` — any relevant tactical track card(s)

When reading `active-claims.json`, surface any fresh `commit_queue` entries
alongside active claims: `intent_id`, `agent_id`, `files`, `commit_subject`,
`phase`, and `expires_at`. Queue entries are discovery and ordering signals,
not mechanical refusals.

If a dirty slice has no matching active claim or recent comms event, do not
classify it as orphaned until `repo-continuity.md` Next Safe Steps, the touched
thread record, and any active plan have been checked for owner-direction
landing notes or explicit hold-state. Some legitimate slices become visible
there before a claim or comms event exists.

Apply the
[`register-active-areas-at-session-open`](../../../rules/register-active-areas-at-session-open.md)
rule before any edit: enumerate the areas you intend to touch, register
your own active claim through the collaboration-state helper when available,
and leave an artefact proving the registry was
consulted. If no entries other than your own exist, log "no other agents
present" through an immutable comms event and proceed (bootstrap fast-path).
On overlap, consult the shared communication log and any
open decision-thread and escalation files before deciding whether to
proceed, ping, append a decision thread, request a sidebar, record a
joint decision, open or close an escalation, or ask the owner.

When registering your PDR-027 identity row, use an existing owner-assigned
`agent_name` if one matches. Otherwise derive a session display name with
`pnpm agent-tools:agent-identity --format display`. The CLI reads (in order)
`PRACTICE_AGENT_SESSION_ID_CLAUDE`, `PRACTICE_AGENT_SESSION_ID_CURSOR`,
`PRACTICE_AGENT_SESSION_ID_CODEX`, then the harness-native `CODEX_THREAD_ID`.
Platform hooks set the platform-suffixed Practice variable: the Claude Code
`SessionStart` hook (`.claude/hooks/practice-session-identity.mjs`) appends
`PRACTICE_AGENT_SESSION_ID_CLAUDE` to `$CLAUDE_ENV_FILE`, and the Cursor
`sessionStart` hook (`.cursor/hooks/engraph-session-identity.mjs`) injects
`PRACTICE_AGENT_SESSION_ID_CURSOR`. If none of these is set in your shell
(e.g. the hook artefact has not been built yet), pass
`--seed "<stable-session-seed>"` explicitly. Do not use personal-email
fallback.

Before any Codex thread registration or shared collaboration-state write,
run the PDR-027 identity preflight with the current platform and model values.
For this repo's Codex GPT-5 sessions the command is:

```bash
pnpm agent-tools:collaboration-state -- identity preflight --platform codex --model GPT-5
```

Codex sessions with `CODEX_THREAD_ID` available must not write new thread rows
or collaboration state as `Codex` / `unknown`; use the derived `agent_name` and
`session_id_prefix`. Codex `SessionStart` hooks may inject the same block as
developer context, but the preflight command remains the correctness check.

Before staging or committing, use the always-active commit skill. It
checks for fresh `commit_queue` entries and `git:index/head` commit-window
claims, enqueues your intended bundle before staging, verifies the staged
bundle exactly before `git commit`, and clears the queue entry after success.

### 5. Active plans

Read the active plan(s) named in the thread's next-session record.
Plans are authoritative for scope, sequencing, acceptance, and
validation.

### 6. Live branch state

```bash
git status --short
git log --oneline --decorate -5
```

## Practice Box

Check `.agent/practice-core/incoming/` for practice-core files. If
present, alert the user — incoming material may carry learnings from
another repo. Full integration happens during `/engraph-consolidate-docs`.

## Per-Session Landing Commitment

State your landing target at session open. See
[PDR-026: Per-Session Landing Commitment](../../../practice-core/decision-records/PDR-026-per-session-landing-commitment.md)
for the doctrine; the ritual is:

> Target: `<lane-id or artefact>` — `<specific outcome>`.

A landing is a specific invariant achieved in code — a rule enabled,
a test added, a file authored, a commit made, a deployment registered
— not a plan edit or a "lane opened."

If no landing is appropriate:

> No-landing session — reason: `<reason>`.

Bounded exceptions: deep-consolidation, Core-trinity refinement, and
root-cause investigation sessions. Any other no-landing session is
drift.

## Session Title — `/rename` Suggestion

As soon as the session intent is clear and BEFORE any significant
implementation (no source edits, no scaffolding, no claim opening
beyond pure-reading work), suggest the user run:

> `/rename <session-name> - <intent>`

where `<session-name>` is your PDR-027 display name and `<intent>` is
the cycle, plan, or boundary you have committed to landing.

The suggestion is surfaced **once**, at the moment intent first clears:

- Solo sessions: typically after the Per-Session Landing Commitment
  above is declared.
- Team sessions: after rendezvous resolves and cycle / boundary
  assignment is settled. See
  [`start-right-team` First Moves §4](../../start-right-team/SKILL-CANONICAL.md)
  for the team-shaped invocation point.

Never surface `/rename` in closeout summaries — by then the title
either matches the work (no-op) or no longer matches because the work
shifted (in which case the rename is too late to inform the title's
audience). The standing rule lives in user-memory entry
`feedback_rename_suggestion_at_session_open_only`; this section is its
repo-visible doctrine surface.

## Work Shape and Simple Plan

Before the first non-planning edit, leave a small observable plan
artefact whose size matches the work:

- **Trivial work**: the landing target or no-landing reason is enough.
- **Bounded non-trivial work**: record a simple plan in chat or the
  touched thread record naming goal, scope, validation, and lifecycle
  touch points.
- **Multi-session, architectural, Practice, cross-workspace, or high-risk
  work**: use an executable repo plan in `current/` or `active/`.

This is a work-shape declaration, not a repo plan file for every edit.
It operationalises PDR-026 without turning small fixes into plan theatre.

## Session Priority

Apply session priority ordering:

1. **Bugs first** — fix known defects before anything else
2. **Unfinished planned work second** — complete in-progress items
3. **New work last** — only start new items when the above are clear

## Guiding Questions

Before diving in, pause and ask:

1. **Are we solving the right problem, at the right layer?**
2. **What value are we delivering, through what impact, for which users?**
3. **Could it be simpler without compromising quality?**
4. **What assumptions am I making? Are they valid?**

## Commit

**Commit** to excellence in systems architecture, software engineering,
and developer experience. Choose architectural correctness over
short-term expediency. This requires critical and _long-term_
thinking.

## castr Domain Grounding

The **IR is the source of truth after parsing** (`Any Input → Parser → IR → Writers → Any Output`). Preserve IR honesty
even when an interchange format is lossy; **fail fast rather than silently canonicalising away user-visible semantics**.
Types and Zod flow from schema (see `requirements.md` and `principles.md`).

Frame the problem precisely: is it a **standards gap, an IR gap, a parser/writer contract issue, a canonicalisation
choice, or an upstream runtime/dependency issue?** Name the input→output pair and the output format that constrains
support.

When analysing generated files, always analyse the generator code that produced them — the generator (ts-morph emission)
is the source of truth.

## Sub-agent Reviews

Invoke the reviewer and domain-expert layer per
[`invoke-reviewers.md`](../../../rules/invoke-reviewers.md) after non-trivial changes. The roster is 15 canonical
templates — see [`invoke-code-experts.md`](../../../memory/executive/invoke-code-experts.md) for the authoritative
catalogue and triage. castr's schema-domain experts — `openapi-expert`, `zod-expert`, `json-schema-expert`, and
`mcp-expert` (the IR→MCP-Tools writer) — review IR fidelity and parser/writer lockstep; the generic reviewers
(`code-reviewer`, `test-reviewer`, `type-reviewer`) cover correctness, tests, and type-flow; cross-cutting reviewers
(`architecture-expert-{barney,betty,fred,wilma}`, `config-expert`, `security-expert`, `docs-adr-expert` +
`onboarding-expert`, `release-readiness-expert`) and the plan-time `assumptions-expert` / `subagent-architect` complete
the layer.

## Process

**Do not assume you know the initial step.** Discuss with the user
first.

## Quality Gates

Run after making changes. The canonical aggregate is `pnpm check` (local, mutating) or `pnpm check:ci` (non-mutating,
`--frozen-lockfile`). Do not invoke `pnpm qg` directly. Husky reinforces this — `pre-commit` formats staged files,
`pre-push` runs `pnpm check:ci` — but a hook run is not a substitute for an explicit aggregate rerun when closing work.

```bash
# From repo root; the qg chain, one at a time (caching prevents duplicate work)
pnpm build
pnpm format:check
pnpm type-check
pnpm lint
pnpm madge:circular && pnpm madge:orphans
pnpm depcruise
pnpm knip
pnpm portability:check
pnpm skills:check
pnpm repo-validators:check
pnpm test:all   # test + character + snapshot + gen + transforms + e2e
```

Green gates are not proof of correctness — see the deep-review caveat in `session-continuation.prompt.md`.
