# castr → Oak innovations ledger (running)

The **standing, kept-current** record of capabilities and Practice insights castr has
that Oak lacks, for eventual back-flow to Oak (castr is a bidirectional Practice node —
user-memory `castr-parity-or-better-with-oak`). Distinct from the point-in-time
[`castr-feedback-2026-06-10.md`](./castr-feedback-2026-06-10.md) (Phases 0–4 upstream-defect
report); this ledger accumulates forward and is updated whenever castr builds or articulates
something Oak would want.

Maintenance directive (owner, 2026-06-26): _"keep the record of innovations in this repo that
we should eventually feed back to Oak up to date."_ Add a row when you build a castr-only
capability or distil a portable insight; measure Oak-absence firsthand
(`git -C /Users/jim/code/oak-open-curriculum-ecosystem show main:<path>` / `ls-tree -r main`)
before claiming it — Oak main moves.

## Tooling / validators castr has that Oak lacks

| Innovation                 | What it is                                                                                                                                                              | Oak-absence (measured)                                                                                                               | Back-flow note                                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `validate-drift` validator | Asserts every definite PDR count-claim + anchor across the substrate is consistent (catches "96 PDRs" prose drifting from reality). Wired into `repo-validators:check`. | 2026-06-26: absent from Oak's `agent-tools/src/validators/` inventory (Oak has markdown-links/reference-direction; castr has drift). | Portable as-is — a count/anchor-consistency validator any Practice substrate benefits from. Source: `agent-tools/src/validators/drift/`. |

## Practice insights / patterns castr has articulated

| Insight                                   | Statement                                                                                                                                                                                                                                                                                                                                                      | Back-flow note                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transplant completeness — _tip + iceberg_ | A capability is complete only when its supporting infrastructure (script proxies, template libraries, catch-validators) resolves; the cure for a hollow transplant is to **bring the missing infrastructure**, never to patch the doc to match the gap (that hides it). The structural enforcement is a validator that fails the gate on a dangling reference. | Oak partly embodies this (it _has_ markdown-links + reference-direction). The novel articulation is the **principle + the failure-mode named** (incomplete transplant masquerading as doc-drift) and **bring-by-default** as the governing disposition. Candidate practice-core pattern-PDR. |
| Reverse-closure sweep per retirement      | Grep the whole repo for every name a change retires — retirement dangles references in files the change never touched.                                                                                                                                                                                                                                         | Already noted in the 2026-06-10 report's method note; restated here as standing castr practice.                                                                                                                                                                                              |

## Already-tracked back-flow lanes (cross-reference, not duplicated here)

- **Hook-matcher precision** — castr's word-boundary / command-position matching improvements
  over Oak's verbatim token-subsequence + substring matcher (owner Q-005, 2026-06-21). Home:
  the hook-matcher-precision lane in
  [`../../../memory/operational/threads/practice-transplant.next-session.md`](../../../memory/operational/threads/practice-transplant.next-session.md);
  the Oak back-flow note is written as part of that lane's acceptance.

## Open / unmeasured candidates (verify before promoting to a row above)

- `context-cost` agent-tools script (castr root-proxies it; Oak does not proxy it) — confirm
  whether the underlying capability is genuinely castr-only before claiming it as an innovation.
