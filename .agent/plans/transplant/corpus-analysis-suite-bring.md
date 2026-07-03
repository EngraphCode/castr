---
title: Corpus-analysis / agentic-judgment-pipelines suite bring (strategic brief)
status: future
lane: future
created: 2026-07-03
owner_directive: >-
  "Move the corpus analysis thread to a later, separate plan, because that is still in
  active development, it would not be efficient to try and bring it over whilst it is so
  mutable." (owner, 2026-07-03 — re-sequencing the delta-review backlog.)
---

# Corpus-analysis / judgment-pipelines suite bring (strategic brief)

## Problem and intent

Oak's dominant post-2026-06-28 delta is a ~70-file `agent-tools/src/corpus-analysis/`
subsystem implementing PDR-122 (agentic judgment pipelines: atomic LLM judgment,
deterministic aggregation, conserve-by-default routing — built after measuring an ~80%
single-voter false-kill rate) with map/reduce/vote/meta workflow stages, an esbuild
self-contained-harness build chain with a canary-enforced output contract, and a
deterministic post-run recompute/triage/salvage leg. castr wants this power (it runs
exactly this class of multi-agent audit/judgment work), but the subsystem is still
mutating upstream — PDR-122's invariants 5–6 were amended 2026-07-02 from live
discovery-run instances, and the runbook/report family is still growing. Bringing now
would import a moving target and buy re-sync churn instead of capability.

## End goal, mechanism, means

- **End goal:** castr runs PDR-122-shaped judgment pipelines on its own corpora
  (napkin/archive audits, review adjudication, backlog triage) with the deterministic
  aggregation and salvage machinery, adapted to castr's fail-fast error model.
- **Mechanism:** bring the suite ONCE, after upstream stabilises, so the port is a
  single faithful transplant instead of a chase.
- **Means (verified bring-shape, from the 2026-07-03 delta review — reference detail,
  not an execution commitment):** `agent-tools/src/corpus-analysis/` (~70 files:
  schemas + frozen aggregation; workflows + build/; post-run/) + the four `corpus-*`
  sub-agent templates + workflow wiring + supporting runbooks. Known bring costs,
  verified firsthand: `esbuild` devDep (absent in castr; Oak pins ^0.28.1), four
  package.json scripts (`build:workflows` chained into `build`, `build-run-artefact`,
  `post-run-driver`, `salvage-driver`), Result→throw adaptation (~25 files use
  `@oaknational/result` — castr's deliberate non-bring), prompt re-anchoring to the
  target corpus. Re-measure ALL of this at promotion time (Oak read live from main).

## Not deferred with this plan

The stable doctrine half already rides earlier batches in the
[gap-rescan backlog](./oak-castr-gap-rescan-2026-06-28.md): **PDR-122 + PDR-123**
(Accepted pattern PDRs, land with the renumbered PDR batch) and the always-on
**`agentic-judgment-conserve-by-default` rule** (doctrine re-sync wave). Doctrine
guides castr's own judgment work now; only the mechanism suite waits.

## Dependencies and sequencing

- **Blocking:** upstream stabilisation (the promotion trigger below).
- **Beneficial:** the PDR-122/123 + rule brings landed first (they will be — earlier
  batches); an identified first castr corpus/run to prove the port against (candidate:
  a napkin-archive audit, mirroring Oak's proving run). Minimum shape without one:
  land the suite gate-green with its unit suites; first live run follows.

## Strategic acceptance criteria

The suite lands as its own multi-slice executable plan: gate-green per slice,
Result→throw adaptation complete (zero `@oaknational/result` imports), the build
chain's canary contract proven in castr's CI, and one live judgment run on a castr
corpus with the conserve-by-default disposition ledger produced.

## Risks and unknowns

Upstream may restructure the module layout before promotion (re-derive the file
inventory then — the delta-review method applies); the esbuild devDep interacts with
castr's audit-zero overrides (esbuild floor already pinned in `pnpm-workspace.yaml` —
verify compatibility); prompt re-anchoring is a per-corpus design act, not a copy.

## Promotion trigger (into an executable plan)

Whichever comes first: (a) the owner names it; or (b) a delta pass observes the
subsystem quiet upstream — no substantive `agent-tools/src/corpus-analysis/` or
PDR-122/123 amendment churn across two consecutive castr delta reviews (or ~4 weeks) —
AND castr has a named first corpus to run it on. Execution decisions are finalised at
promotion per the plan skill.
