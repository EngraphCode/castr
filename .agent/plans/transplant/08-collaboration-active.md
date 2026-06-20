# Phase 8 sub-plan — Collaboration ACTIVE (the activation phase)

**Source:** owner correction (2026-06-18) — "single-branch is a _constraint_, not a fit; multi-agent concurrency is the
goal" — plus a firsthand inventory of castr's current collaboration estate this session. **Status:** authored 2026-06-18;
**PARTIALLY EXECUTING (2026-06-20)** — see the as-built banner. Sequencing is **unchanged** — Phase 8 remains after
Phase 6 (memory/state) and Phase 7 (adapters), per the primary plan and the owner's standing "I name the next slice."

> ## As-built reconciliation (2026-06-20, firsthand)
>
> This sub-plan was authored 2026-06-18, **before** WS7 (Phase 6, 2026-06-19) and Phase 7 (2026-06-20) landed. Three of
> its load-bearing premises were stale; corrected against measured reality:
>
> - **Task 2 (schema-surface contract) — ALREADY RESOLVED.** WS7 relocated the 5 `*.schema.json` to committed source
>   `agent-tools/src/collaboration-state/schemas/` and repointed the `practice-substrate` consumer (`live-types.ts`) at
>   them. There is no open design point; the "emit-from-Zod vs reconcile-consumer" fork was decided (committed-source
>   schemas) and is in the tree.
> - **Task 4 failure count — 1, not 12.** The agent-tools informational suite is `940 passed / 1 failed`; the lone failure
>   is the pre-existing **clerk-expert P7 roster-parity** item, not a collaboration-state absence. WS7's decoupling means
>   the collaboration-state tests pass without `.agent/state/` present. The "12 → 0 substrate-absent" target is moot.
> - **`subagents` gate — already wired blocking** (Phase 7); only `collaboration-state` remained deferred.
>
> **Landed this session (owner-approved partial: "skeleton + replan reconcile"):**
>
> 1. **Task 1 — substrate skeleton materialised**, seeded empty (no upstream event data): `.agent/state/README.md` plus
>    the `collaboration/` skeleton (`.gitignore`, `conversations/`, `escalations/`, `handoffs/`, `sidebars/`,
>    `comms-archive/`, each anchored by a `README.md` or `.gitkeep`). Repo-tier (`conversations/`, `escalations/`,
>    `sidebars/`) tracked; instance-tier (`comms/`, `active-claims.json`, `closed-claims.archive.json`, `comms-archive/*`,
>    `handoffs/*`) untracked-by-design via `.gitignore`. READMEs reconciled per-surface (schema path → WS7 source;
>    PDR-063 castr-local; ADR-199/182, PDR-094 retained cross-host).
> 2. **Completed the WS7 bring of `state-integrity.ts`** — the earlier WS7 pass took an older version that threw
>    unconditionally on absent surfaces. Brought Oak pin's `optionalWhenAbsent` hardening (instance-tier
>    `active-claims.json` / `closed-claims.archive.json` / `comms/` optional-when-absent; `conversations/` /
>    `escalations/` still required) + its test (TDD red→green). castr's source is now byte-identical to the Oak pin.
> 3. **Task 4a — flipped `validate-collaboration-state` blocking** into `repo-validators:check`; green against the empty
>    skeleton (`checkedCount 0` of real surfaces).
> 4. **Task 3a — identity SessionStart hook wired** (owner-authorised): brought Oak's soft-surface shim
>    `.claude/hooks/practice-session-identity.mjs` + registered it in `.claude/settings.json` `SessionStart`. Verified it
>    fires (emits the PDR-027 identity context + writes `PRACTICE_AGENT_SESSION_ID_CLAUDE` /
>    `ENGRAPH_AGENT_IDENTITY_OVERRIDE` to `$CLAUDE_ENV_FILE`; soft-fails `{}` on empty stdin). This also resolves the
>    start-right doc's dangling reference to a hook file that did not previously exist on disk.
>
> **Scope correction (firsthand):** the sub-plan's task-3 "open an active claim at SessionStart" is **not** a hook write —
> `openClaim` requires `intent`/`thread`/`areas` (knowable only after intent clears). Claim registration is the
> `register-active-areas-at-session-open` agent discipline, now **enabled** by the substrate; the hook's job is identity
> only (as the brought Oak adapter implements).
>
> **Landed 2026-06-20 (session "Ethereal Weaving Star", intra-phase commit — _not_ the phase tag):**
>
> 5. **Task 3b — claims lifecycle exercised end-to-end + concurrent-session collision-safety demonstrated.** Ran the
>    `claims open → heartbeat → close` lifecycle against the REAL materialised `.agent/state/collaboration/` substrate
>    (instance-tier, git-ignored — seeded empty, exercised, cleaned back to the absent/clean state) under my live PDR-027
>    identity (`Ethereal Weaving Star`, prefix `10bc66`). Then fired **10 concurrent _separate-OS-process_ sessions**
>    (distinct env-seed identities) opening claims at the same `active-claims.json`: all 11 claims survived with 11 unique
>    `claim_id`s and 11 unique agent identities — **no lost write under contention**; `claims active-agents` surfaced all
>    11 distinct sessions; two sessions exchanged comms events; `validate-collaboration-state` reported OK against the
>    populated substrate (4 JSON files); concurrent heartbeat held; concurrent close archived all 11 (active → 0,
>    closed → 11). **Why this was the real gap:** the engine's lock+retry was only unit-tested on a bare counter
>    (`transaction.integration.test`, in-process `Promise.all`) and the comms integration tests run against an
>    **in-memory fake runtime** — neither exercised the full `claims open`/`close` stack (identity derivation →
>    live-routing-collision assertion → `mkdir` transaction lock → optimistic re-read retry → atomic temp-file publish)
>    under real concurrent filesystem contention, and "a second concurrent session" means a separate OS process. The
>    demonstration is encoded durably as
>    [`agent-tools/tests/collaboration-state/claims-concurrency.integration.test.ts`](../../../agent-tools/tests/collaboration-state/claims-concurrency.integration.test.ts)
>    (concurrent real-filesystem opens + concurrent close-to-archive through the real CLI stack; `942 passed / 1 failed`
>    suite — the lone failure is the pre-existing clerk-expert P7 item below, not this work). The collision-safety
>    mechanism, verified firsthand in the engine: atomic `mkdir`-based directory lock (100 attempts, 30 s stale-takeover)
>    serialises writers; an optimistic read-reread-compare retry (5 attempts) guards lost updates even under the lock;
>    temp-file + rename gives atomic publish so readers never see partial state.
>
> **NOT yet done (carry the `transplant/phase-8` tag — phase incomplete):** task 4b (remove the
> `turbo test --filter=!@engraph/agent-tools` exclusion — blocked on the **clerk-expert P7** fix); task 5 (per-thread
> records / `## Lanes`); task 6 (thin per-hunk reconciliation of new generic surfaces). These land as green-gated
> intra-phase commits, not the phase tag.

This sub-plan only **sharpened scope** so the prioritisation decision rests on measured ground; the partial execution
above does not pull the remaining Phase 8 work forward.

> Why this file exists: the parent plan's Phase-8 line is a one-liner ("directive + rules cluster + skills + structured
> coordinator-state + TTL presence + comms attention pass + plan-mode carveout; wire collaboration validator blocking").
> Read literally it sounds like a large bring. The firsthand inventory below shows it is mostly **activation of
> already-transplanted machinery** — a materially smaller lift. Persisted so the scope is resumable and the owner's
> sequencing call is informed.

---

## 1. Key finding — Phase 8 is ACTIVATION, not a new bring (firsthand, 2026-06-18)

The collaboration **machinery is already in the tree** from earlier phases. What is missing is the **runtime substrate**
and the **wiring/flips** that turn it on. This is the inverse of how the one-liner reads.

### Present (already transplanted — verified firsthand)

| Surface                       | Where                                                                                                                                                                                                                                                                                                                                                                     | Landed  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Collaboration **engine**      | `agent-tools/src/collaboration-state/` (51 modules: claims, comms, identity, watchers, heartbeat, migration, TUI, CLI)                                                                                                                                                                                                                                                    | Phase 2 |
| In-code **schemas** (Zod)     | `agent-tools/src/collaboration-state/state-schemas.ts` (`commsEventSchema` discriminated union; `schema_version 2.0.0`; PDR-027 `agentIdSchema`)                                                                                                                                                                                                                          | Phase 2 |
| Collaboration **rules** (12+) | `register-active-areas-at-session-open`, `register-identity-on-thread-join`, `respect-active-agent-claims`, `check-singleton-per-window`, `use-agent-comms-log`, `comms-all-channels-watcher`, `ping-before-escalate`, `collaboration-is-value-contingent`, `follow-agent-collaboration-practice`, `sha-prefix-in-collaboration-content`, `present-verdicts-not-menus`, … | Phase 4 |
| Collaboration **directives**  | `agent-collaboration.md`, `user-collaboration.md`                                                                                                                                                                                                                                                                                                                         | Phase 5 |
| Team **skill**                | `start-right-team`                                                                                                                                                                                                                                                                                                                                                        | Phase 3 |
| **Hooks**                     | Claude `SessionStart` (`practice-session-identity.mjs`) + live PreToolUse guards                                                                                                                                                                                                                                                                                          | Phase 2 |
| Per-thread **convention**     | `.agent/memory/operational/threads/README.md` (identity schema, lanes, additive-identity)                                                                                                                                                                                                                                                                                 | Phase 6 |
| Substrate **contract**        | `executive/memory-state-substrate-contracts.{md,manifest.json,schema.json}` (the 6 collaboration surfaces enumerated, marked Phase-8 forward-refs)                                                                                                                                                                                                                        | Phase 6 |

### Absent (what Phase 8 actually does)

- `.agent/state/` **does not exist** — so neither does `.agent/state/collaboration/`. This is the binding gap.
- The runtime substrate skeleton: per Oak's committed layout at the pin `ad359a4f`, the **committed** surfaces are the
  directory skeleton + per-dir `README.md` + `.gitkeep` + a `.gitignore` (the **live** runtime files — `active-claims.json`,
  comms event fragments, `shared-comms-log.md` — are git-ignored and created on first CLI use, never committed).
- The `collaboration-state` validator is **deferred** (designed to hard-fail on the absent scan dirs — do NOT "fix" it;
  it self-clears once the substrate exists).
- The agent-tools test suite carries **12 informational failures** (measured 2026-06-18), the bulk being
  `collaboration-state` IO/integrity tests that fail purely because `.agent/state/collaboration/` is absent.
- SessionStart identity/claim **registration to live state** — the hook sets the identity env var, but with no state dir
  there is nothing to write a claim into.
- **Per-thread continuity records** — the convention is seeded; no records exist (correctly — they activate here).

## 2. Scope — IN (the activation tasks)

1. **Materialise the runtime substrate skeleton**, seeded **empty** (owner scope — no Oak event data ever):
   `.agent/state/README.md` + `.agent/state/collaboration/` with the committed skeleton (`conversations/`, `escalations/`,
   `sidebars/`, `handoffs/`, `comms-archive/` + per-dir `README.md`/`.gitkeep`) and the `.gitignore` that keeps live
   runtime files (claims/comms/log) out of git. Reconcile dir names against the engine's expectations firsthand (Oak's
   committed `comms-archive/` vs the substrate consumer's `CANONICAL_COMMS_ROOT = comms/` — the live `comms/` is the
   git-ignored runtime dir; confirm at execution).
2. **Resolve the schema-surface contract.** The `practice-substrate` consumer reads `.agent/state/collaboration/*.schema.json`
   (5: active-claims, closed-claims, comms-event, conversation, escalation) via Ajv, while the engine validates with the
   **in-code Zod** `state-schemas.ts`. Decide and execute: emit JSON-Schema artefacts from the Zod schemas to those paths,
   **or** reconcile the consumer to the in-code schemas. (This is the one open design point — verify firsthand; it is why
   the substrate-contract `.md` marks those schema paths a "Phase-8 item".)
3. **Wire SessionStart registration** to write an identity row + open an active claim into the live substrate at session
   open (the rules `register-identity-on-thread-join` / `register-active-areas-at-session-open` already mandate it; the
   engine CLI already implements `claims open|heartbeat|close`).
4. **Flip the deferred gates blocking** once their estate exists: add `collaboration-state` to `repo-validators:check`;
   remove the `turbo test --filter=!@engraph/agent-tools` informational exclusion so agent-tools tests gate (target: the
   12 substrate-absent failures → 0). (`subagents`→P6 roster, Oak `portability`→P7 are separate flips.)
5. **Activate per-thread continuity records** as part of the capability: when a second stream becomes safe to run, each
   stream gets a `threads/<slug>.next-session.md` record (identity table, lanes) per `threads/README.md`; the intermediate
   step is a `## Lanes` block on the single thread. Records are the **leaf** of this phase, not its substance.
6. Bring any genuinely-new Phase-8 generic surfaces from the pin that depend on live state (PEEN-hardened coordinator
   state, TTL presence, comms attention pass, plan-mode carveout) — triage per-hunk against what the engine already
   implements (most is present; this is a thin reconciliation, per the Phase-3/6 "re-sync is per-hunk triage" lesson).

## 3. D3 dependency mapping (CI / branch coordination is coupled to safe concurrency)

Safe **concurrent multi-agent / multi-branch** work — the goal Phase 8 unlocks — needs CI to enforce gates per branch and
a safe merge path. castr's CI today (`/.github/workflows/ci.yml`) runs only `install + build + test` — **not** `check:ci`
(the lint/type-check/madge/depcruise/knip/validators/test:all chain). Consequences:

- Concurrent branches would merge to `main` **ungated** — the per-phase `check:ci` discipline is local-only.
- This is the same gap as **Q-001** (the ~100k-line transplant PR merging without CI gate enforcement).

**Therefore D3 is a prerequisite for _safe_ multi-stream**, not an independent nicety. D3 scope (per the arc): CI runs the
full `check:ci` chain; SHA-pin every action with a `# vX.Y.Z` comment (supply-chain); fix the `lib/pnpm-lock.yaml` path
filter (lockfile is at root); repair the `publish.yml` non-existent `pnpm release`. **Sequencing — DECIDED (owner,
2026-06-19 s3, resolving Q-001): D3 lands _before_ the transplant merge, and the transplant is delivered as split,
reviewable PRs** (not one ~100k-line PR). So the transplant-close sequence is: complete the phases → land D3 → split the
delivery into reviewable PRs against a D3-gated `main`. See [`open-questions.md` Q-001](../../memory/operational/open-questions.md)
and [`delivery-ledger.md`](../../plans/delivery-ledger.md).

## 4. Acceptance + validation

- `.agent/state/collaboration/` skeleton exists, seeded empty; `.gitignore` keeps runtime files uncommitted; no Oak event
  data present.
- The schema-surface contract is resolved: the `practice-substrate` consumer runs with **no `live-reader-failure`** for the
  collaboration plane (the 2 expected Phase-8 findings from the substrate sub-block clear).
- `collaboration-state` validator flipped into `repo-validators:check` and green; the agent-tools test informational
  exclusion removed and the suite green (12 → 0 substrate-absent failures).
- SessionStart writes a live identity row + claim; a second concurrent session is demonstrably collision-safe (claims +
  comms exercised end-to-end, empty-seeded).
- Per-thread continuity records (or the `## Lanes` shape) carry a genuinely concurrent stream.
- `pnpm check` green (ALL gates); tag `transplant/phase-8`; reference-closure-clean.

## 5. Sequencing — UNCHANGED (owner, 2026-06-18)

Phase 8 stays **after** Phase 6 (memory/state) and Phase 7 (adapters). It has real prerequisites: the substrate **contract**
(Phase 6 ✅, this session) and the `.agent/state/` layout it describes; the regenerated adapters (Phase 7). This sub-plan
sharpens _what_ Phase 8 is (activation + D3 coupling), not _when_ it runs. The owner names the next slice; the value of
this sharpening is that lifting the single-branch constraint is now a **measured, mostly-activation** lift, not an
open-ended bring — useful input to that prioritisation, nothing more.
