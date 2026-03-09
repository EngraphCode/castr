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
