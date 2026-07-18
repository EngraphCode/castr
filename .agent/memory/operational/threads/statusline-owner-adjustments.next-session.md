# Thread: statusline-owner-adjustments — next-session record

**Thread slug:** `statusline-owner-adjustments`
**Created:** 2026-07-18 (Midnight Watching Night, session prefix `900203`)
**Scope:** owner-directed statusline changes IN BOTH ESTATES (castr + resonance), plus the
queued owner-attention bring. Pointer and hypothesis — recompute live facts before acting.

## Participating agent identities (PDR-027)

| agent_name              | platform    | model          | session_id_prefix | role                | first_session | last_session |
| ----------------------- | ----------- | -------------- | ----------------- | ------------------- | ------------- | ------------ |
| Midnight Watching Night | claude-code | claude-fable-5 | 900203            | implementer (castr) | 2026-07-18    | 2026-07-18   |

## Owner directives (2026-07-18, verbatim anchors)

1. "I would like `· s:19%(5h) · w:14%(6d)` moved one row down, so they appear after `ctx:61%`,
   and I would like this _in both estates_."
2. "Separately, but also in both estates, I would like the one-line subagent statuslines to
   include the model."
3. "yes, please add those statusline features to the queue" (= the owner-attention glyph +
   session-state substrate bring — see the future brief below).
4. "For any work in Resonance, coordinate with Shaded Foraging Grove (6f105e) in the Resonance
   primary checkout."

## State at record authorship (2026-07-18 — RECOMPUTE)

- **castr: DONE, committed, UNPUSHED.** Branch `feat/statusline-owner-adjustments` (worktree
  `.claude/worktrees/statusline-adjust`, based on post-#19 main 61e30973), one commit: the
  gauge row-move (red-first, 162/162 statusline tests) + the NEW `subagentStatusLine` surface
  (pure planner `agent-tools/src/claude/subagent-statusline.ts` + adapter + soft-fail shim
  `.claude/scripts/subagent-statusline.mjs` + settings block + knip entry + build chmod;
  model short-form display Sonnet 5 / Haiku 4.5 / Fable 5 with raw-id fallback; 16 new tests).
  agent-tools battery green (tsc, lint, knip, 1431/1431 at commit time).
  **⚠️ NEVER clean/remove the `statusline-adjust` worktree — it carries the only copy.**
  Next: push (full gate), PR, owner merge. NOTE the claim `.claude/settings.json` edit-guard
  parallel: settings edits surface to the owner at the PR gate.
- **resonance: NOT STARTED; coordination SETTLED.** Grove accepted shape (b) on their stream
  (event `837b72f2`): the executing agent works in a fresh worktree off resonance/main under a
  properly-opened claim on the statusline seam (unclaimed at last read); Grove reviews async.
  Their estate enforces PDR-139 comms threading (`--in-response-to`; use the castr↔resonance
  opener event `3f8483dc` as antecedent) and runs a live multi-agent window (claims registry:
  Stellar Orbiting Galaxy director seat; Grove two claims; Embered Sparking Pyre is Grove's
  successor-in-waiting). Their primary tree carries in-flight work — worktree only.
- **Mechanism facts (platform-doc-verified, citations in the castr subagent-statusline.ts
  TSDoc):** `subagentStatusLine` is a SEPARATE settings command from `statusLine`; one
  invocation per refresh with ALL visible tasks (`columns` + `tasks[]`; per-task `model` = the
  SUBAGENT'S resolved model id); output one `{"id","content"}` JSON line per task. Neither
  estate had it configured before this work.
- **Resonance implementation shape (planned, symmetric):** same two changes; their render has
  an `attention` extra — proposed title-row order `ctx · s: · w: · ?` (flagged to Grove for
  charter-adjacency check); their layout keeps model on the summary row; port the castr
  modules adapting to their double-quote style and their `statusline-ansi` exports.

## Owner-attention bring — QUEUED (the owner's "add those features to the queue")

The statusline feature-delta (two-mapper sweep, verified firsthand 2026-07-18): after
resonance's ARC feather system reaches castr via PR #22's merge, the ONE remaining
resonance-not-castr feature is the **owner-attention glyph**: a yellow-bold `?` on the
repo-title row driven by a per-session `ownerAttentionWanted` record. The true gap is the
whole `agent-tools/src/session-state/` module (store, types, CLI) — verified absent from both
castr trees; the glyph is its statusline face (resonance wires it via
`statusline-attention.ts` + a `seg.attention` extra). Bring shape: session-state module +
attention formatter + render extra + a writer hook at question-tool moments; POST-#22 slice
(the render seams move under #22's feathers). Value instance from this very session: the
samples-exception push question sat in the question tool while the statusline could only show
"blocked". This section IS the queue entry (owner-approved capture, 2026-07-18); promote to a
`future/` plan brief when picked up.

## Next safe steps

1. Push `feat/statusline-owner-adjustments` (full gate), open its PR, surface the settings
   edit at the owner gate, drop the number on the canonical stream.
2. Execute the resonance side per shape (b): worktree off resonance/main, claim the statusline
   seam on THEIR registry (their comms-blind gate requires an armed watcher first; PDR-139
   threading on every event), port the two changes symmetrically, their gates, branch + push +
   PR per their estate flow, Grove reviews. Share the castr diff shape with Grove (promised).
3. Owner-attention bring: promote the queue entry above when its slot arrives (post-#22).

## Blockers / low-confidence areas

- The resonance-side prettier/lint conventions differ (double quotes, no preserve-caught-error
  rule observed); port by adaptation, not copy.
- The Cursor per-tool enforcement semantics remain unprobed (documented honestly in the
  lean-task-subagents platform note; do not tighten claims without a probe).
