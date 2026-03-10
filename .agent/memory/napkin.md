# Napkin

This file captures session-scoped discoveries, mistakes, corrections, and useful patterns before they are distilled or promoted into permanent docs.

## 2026-03-09

- Completed the Practice Core integration slice and promoted its durable outcomes into the local Practice spine, canonical wrappers, and future platform planning docs.
- The completion handoff matters: once an operational-practice slice is done, move it to `current/complete/` and restore the next real product workstream to `active/` so cold-start sessions still have one obvious place to begin.
- Consolidation after activating the core-agent-system slice found two durable doc lessons:
  - if a user explicitly keeps non-primary unfinished work inside `active/`, local navigation docs must describe that as a parked-in-place exception rather than pretending multiple plans are co-primary
  - the portable Core must distinguish the canonical agent architecture from a repo's current installation status; local `AGENT.md` should say plainly when reviewer infrastructure is not yet installed
- Practice box check during consolidation:
  - `.agent/practice-core/incoming/` contains only `.gitkeep`
  - `.agent/practice-context/incoming/` received two validator examples from another repo
  - their useful pattern was absorbed into the repo-owned `scripts/validate-portability.mjs`
  - the transient incoming copies were then cleared, leaving only the scaffold `README.md`
- No additional portable-core evolution cleared the bar during this consolidation beyond the already-recorded paused-workstream learning; the main work here was cohesion, handoff, and status correction.
- A follow-on consolidation pass caught one remaining local-doc drift: `castr-practice-integration-notes.md` still described the reviewer layer as not yet adopted after the six-agent `.codex` installation had completed.
- Portability validation should cover any outgoing Practice document that encodes current installation state, not just the main directives and reference guides.

## 2026-03-10

- Consolidating the type-safety remediation docs found one remaining historical roadmap drift: the Session 3.3a progress section still claimed 3.3b.04 was the active plan even though the live active workstream had moved to `type-safety-remediation.md` and its lint-only follow-up handoff.
- Durable documentation now consistently says:
  - doctrinal and lint-policy repair for type-safety remediation are complete
  - `pnpm type-check` and `pnpm format:check` are green
  - the remaining active gate failure is `pnpm lint`, driven by the residual non-const assertion backlog plus `3` adjacent non-assertion lint blockers
- Practice cohesion check:
  - `.agent/practice-core/incoming/` still contains only `.gitkeep`
  - `.agent/practice-context/incoming/` still contains only the scaffold `README.md`
  - no new incoming Practice material needed integration
- No additional Practice evolution cleared the bar in this pass; the useful learning was procedural: historical status markers inside roadmap sections can drift even after the top-level active-workstream block is corrected, so consolidation should explicitly scan for old “current active plan” statements, not just the primary entrypoint.
- A follow-up consolidation pass after the shared-loader and snapshot remediation found the current plan stack coherent:
  - `roadmap.md`, `type-safety-remediation.md`, `type-safety-remediation-follow-up.md`, and `session-entry.prompt.md` all agree that `6` residual non-const assertion warnings remain
  - the next execution slice is the remaining parser/writer low-count cluster
  - that cluster's mixed default-suite plus transforms-suite proof obligation is now stated explicitly in the follow-up handoff and session-entry prompt
- No further durable-doc extraction or Practice evolution cleared the bar in that pass; the remaining work is execution, not doctrine consolidation.
- A later consolidation pass after ADR-039 and the recursive-writer reframe found three useful cohesion drifts:
  - `.agent/practice-index.md` needed ADR-039 added so the local Practice spine matched the durable ADR set
  - `.agent/README.md` still described the transform-proof budgeting investigation and recursive unknown-key remediation as if they lived in `active/`, even though they had moved to `current/paused/` and `current/complete/`
  - `docs/architecture/recursive-unknown-key-semantics.md` still linked its implementation record to the old `active/` remediation path
- The recursive unknown-key tranche produced one durable framing insight that was worth promoting out of the active plan:
  - the remaining seam is not just "find a way to emit `.passthrough()`"; it is to determine whether getter recursion is universally canonical or only canonical for strip-compatible recursion, with preserving modes potentially requiring one tightly-scoped second canonical strategy
- Practice box check in this pass:
  - `.agent/practice-core/incoming/` still contains only `.gitkeep`
  - `.agent/practice-context/incoming/` still contains only the scaffold `README.md`
  - no new incoming Practice material needed integration
- No portable-core evolution cleared the bar in this pass; the value was local cohesion and promoting one architectural framing insight from plan-only status into durable docs.
