# Next-Session Record — Practice transplant + deep enhancement

The continuity record for the single deep-enhancement thread (owner: bring the
full Practice / agentic framework / agent-tools over **and** fix castr's known
issues — one goal, not competing priorities). Indexed by
[`../repo-continuity.md § Active Threads`](../repo-continuity.md#active-threads),
which stays the source of truth for thread status; this record carries identity
history and lane state per [`README.md`](README.md) +
[PDR-027](../../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md).

**Activated 2026-06-20** (Phase 8 task 5): per-thread records went live the moment
the collaboration framework that makes a second stream safe landed — task 3b
demonstrated 10 concurrent sessions are collision-safe, so the enabling trigger
fired (not speculative scaffolding; owner-directed activation). The repo ran
single-stream as a _constraint_ of the unbuilt framework, not a fit; that
constraint is now lifted, so the thread is recorded as a multi-lane container.

## Participating agent identities

Additive per PDR-027 — joining adds an identity; a matching platform/model/agent_name
updates `last_session` rather than adding a row.

| platform    | model              | session_id_prefix | agent_name                     | role        | first_session | last_session |
| ----------- | ------------------ | ----------------- | ------------------------------ | ----------- | ------------- | ------------ |
| claude-code | claude-opus-4-8-1m | 10bc66            | Ethereal Weaving Star          | executor    | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 328f4f            | Secret Watching Candle         | implementer | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 4aeee2            | Stratospheric Wheeling Horizon | implementer | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | fdb75b            | Briny Cresting Sextant         | director    | 2026-06-20    | 2026-06-20   |

## Lanes

A lane is an independently pickup-able arc — its own state, branch, and pickup
trigger, active OR deferred. There is no single thread-level "next safe step";
several lanes can be "next" at once. Branch is `feat/transplant-engraph-practice`
for every lane (single-branch invariant) until the split-PR delivery (D3-gated).

### Lane: Phase 8 close — ✅ COMPLETE + TAGGED (2026-06-20)

- Controlling plan: [`../../../plans/transplant/08-collaboration-active.md`](../../../plans/transplant/08-collaboration-active.md) §As-built.
- **Outcome:** `transplant/phase-8` tag CUT on `8d62197` (lightweight, matching `phase-0..7`).
  The last acceptance bar — "records carry a genuinely concurrent stream" — was satisfied by the
  **first director-led concurrent stream** (this session, 2026-06-20): Director Briny Cresting Sextant
  (fdb75b) + two implementers Stratospheric Wheeling Horizon (4aeee2, Lane A) and Secret Watching
  Candle (328f4f, Lane B), each with a distinct PDR-027 identity, an armed comms watcher, a live claim,
  a ≤4-min heartbeat, and comms. The stream exercised claims (open→heartbeat→close), directed +
  broadcast comms, Director-serialised review with routed reviewer sub-agents adjudicated firsthand, a
  live identity-table write-race, and a measured watcher-idle-coalescing failure (F6/N10, now team
  doctrine: catch-up-sweep on every wake).
- **Gate evidence:** `pnpm check` GREEN at `8d62197` (full gate completeness, verified firsthand in an
  isolated detached worktree); reference-closure clean for phase-8 scope (drift validator green inside
  `repo-validators:check`; D4 was a recorded deferred lane, out of phase-8 scope).

### Lane: transplant Phase 9 — deferred (trigger: transplant phases complete)

- Controlling plan: [transplant tracker](../../../plans/transplant/README.md) + [`reference-closure.md §back-flow items`](../../../plans/transplant/reference-closure.md).
- Next safe step: Oak back-flow to a **fresh branch off Oak `main`** (destination
  owner-resolved 2026-06-19); PDR-currency sync (adopt Oak amendments).
- Acceptance bar: back-flow PR raised to Oak; castr-side closure recorded.

### Lane: D4 generic-surface back-brings — ✅ LANDED (branch, 2026-06-20)

- Controlling plan: [`reference-closure.md`](../../../plans/transplant/reference-closure.md) (recorded by Phase 8 task 6 triage).
- **Outcome:** both genuinely-new Oak-pin collaboration subsystems brought by Seat 2 (Secret Watching
  Candle) on branch `feat/d4-archive-provenance-backbring` @ `0a75231` (off transplant tip `8d62197`;
  **unpushed**): `archive/` (class-tiered comms-archive rotation: `archive-move`/`-execute`/`-node`,
  `disposition-policy`, `event-classification`, `event-projection`, `manifest`) + `provenance/`
  (`cited-event-provenance`, `provenance-scan`/`-node`). **Error model reconciled** Oak's
  `@oaknational/result` (castr-DON'T-BRING) → fail-fast: typed `ArchiveMoveError`/`ProvenanceScanError`
  (kind discriminator + `{cause}`) THROW; discriminated-union returns only for genuine domain
  multi-outcomes. Wired via `index.ts` barrel + the unified `cli.ts` topics (`provenance check`,
  `archive plan`, `archive move` — castr's unified-CLI form, not Oak's standalone bins). 94 unit tests;
  `pnpm check` green; Director-approved (code/type/test/architecture-fred reviewers + firsthand). Three
  commits: `4de8857` (core) → `b684a28` (review follow-up) → `0a75231` (CLI slice).
- **Open follow-on (optional, D4/Oak back-flow):** `collectKnownEventIds` does not exclude `.tmp-`
  writes (byte-identical to the Oak pin; fail-closed-safe — can only BLOCK a move, never wrongly permit).

### Lane: arc D2 / D3 — ✅ LANDED (branches, 2026-06-20)

- Controlling plan: transplant tracker §Deep-enhancement arc + [`delivery-ledger.md`](../../../plans/delivery-ledger.md).
- **Outcome (Seat 1, Stratospheric Wheeling Horizon):**
  - **D3** (CI to Oak standard) — `feat/d3-ci-oak-standard` @ `c7f819e` (off `8d62197`; **unpushed**):
    ci.yml runs the full `check:ci` gate; 6 actions SHA-pinned (`# vX.Y.Z`); CodeQL kept+modernized
    v2→v3+pinned; broken `lib/**` path filters removed; dead `publish.yml` removed. Reviewed
    config-expert (PASS-with-nits) + security-expert (PASS), Director-approved firsthand.
  - **D2** (node-version single-source) — `feat/d2-node-version-single-source` @ `41b24f8` (off D3's
    `c7f819e` — D2/D3 are **coordinate-dependent on ci.yml**, so D2 builds on D3): `.nvmrc` "24" + ci.yml
    `node-version-file: .nvmrc` (drops the hardcoded value). `engines.node` semantics left to owner/ADR-049.
    Director-approved firsthand.
- **Delivery framing (Q-001 split-PR plan):** off `c7f819e`, the D2 branch contains D3 (shared ci.yml
  lineage) → they deliver coupled (D2 on top of D3) or D3-first-then-D2-rebase. Both unpushed (delivery
  deprioritised; push = owner's call).
- **Remaining in arc:** release automation (separate deferred lane below); D4 ✅ landed above.

### Lane: remediation 02–07 — deferred (trigger: owner names it after the transplant)

- Controlling plan: [`../../../plans/active/02-ir-fidelity-proof-harness.md`](../../../plans/active/02-ir-fidelity-proof-harness.md) (02 active-next; 03–07 follow).
- Next safe step: the deep-review backlog (5 of 6 reproduced Criticals still
  unfixed) takes a **named position after** the full transplant (owner steer
  2026-06-19); not parked — `no-manufactured-permission` holds.
- Acceptance bar: each Critical reproduced-then-fixed with a regression test.

### Lane: explicit additional-properties feature — deferred (trigger: after positions 1–2)

- Controlling plan: [`../../../plans/current/paused/explicit-additional-properties-support.md`](../../../plans/current/paused/explicit-additional-properties-support.md).
- Next safe step: sequenced product-feature slice (a required component of the one
  deep enhancement, named position — not a paused continuity thread).
- Acceptance bar: feature lands with parser/writer lockstep + tests.

### Lane: release automation — deferred (trigger: owner names release strategy)

- Controlling plan: transplant tracker §Deep-enhancement arc (release surface) + [`delivery-ledger.md`](../../../plans/delivery-ledger.md).
- Origin: surfaced 2026-06-20 by the D3 stream (Seat 1, Stratospheric Wheeling Horizon). castr has **no release tooling**
  (no `.changeset`, no changesets/semantic-release in any package.json, no `release` script); the inherited `publish.yml`
  called a non-existent `pnpm release` via `changesets/action@v1` and was REMOVED in the D3 slice (Director ruling, comms
  `fa53d0af`). Removal is fail-fast (a disabled stub would be a tombstone).
- Next safe step: **owner-owned decision** — adopt semantic-release (Oak parity) vs changesets. Cross-surface
  (package.json + config), outside D3's `.github/workflows/` surface, so a separate lane. Non-blocking; delivery is
  deprioritised.
- Acceptance bar: a working release path lands with the chosen tooling + a CI release job, or owner classifies
  release-out-of-scope.

## Standing decisions this thread carries

- Single branch `feat/transplant-engraph-practice`; roll-forward only; each
  transplant phase = one atomic commit + `transplant/phase-N` tag, green-gated at
  the tag. (Full invariant set: [`../repo-continuity.md §Repo-Wide Invariants`](../repo-continuity.md#repo-wide-invariants--non-goals).)
- Delivery: D3 before merge + split reviewable PRs (owner, Q-001). Delivery
  deprioritised ("not in a rush to merge") — commits land locally, push at the
  owner's call.
- Oak sync pin is the rebased branch `practice/castr-pin` (off Oak `main`, rebased
  at controlled points; may go stale by design), not a frozen SHA — owner, 2026-06-20.
  Currently synced to `ad359a4f` (= Oak `main` HEAD). Read the pin via
  `git -C <oak> show practice/castr-pin:<path>`, never the Oak working tree. Full
  doctrine: `repo-continuity.md §Repo-Wide Invariants`.
