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
