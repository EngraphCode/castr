---
name: lean-task-subagents
classification: active
description: >-
  Specify and dispatch lean, single-purpose task subagents (Sonnet-5,
  minimum tools, precisely-managed context) with decision-complete, narrow
  briefs. Use when delegating well-defined TASKS — not reasoning or synthesis
  — to one or many worker subagents, especially in large numbers, and to hold
  the non-negotiable discipline of critically verifying every subagent reply,
  claim, and source before acceptance.
---

# Lean Task Subagents

Owner doctrine (2026-07-05): make extensive use of subagents for tasks, but
under binding constraints. The one idea underneath every constraint:
**isolate the doing; keep the thinking in-session.** A task subagent extends
your hands, never your judgement.

This skill is the canonical home for the doctrine. The napkin capture and the
`lean-task-subagents` user-memory entry are its provenance; consolidate here,
do not duplicate.

## The binding constraints (owner-set, non-negotiable)

1. **General-work task subagents run `claude-sonnet-5`.** Use the
   [`task-worker`](../../sub-agents/templates/task-worker.md) agent definition —
   it pins the model, minimum tools, and lean context so every dispatch inherits
   them.
2. **Briefs are decision-complete, precise, and NARROW — the narrower the
   better.** This class DOES TASKS. Reasoning and synthesis are never
   delegated to it.
3. **Every subagent reply, claim, and source is critically assessed before
   acceptance — no class is exempt, however narrow the brief** (owner
   clarification, 2026-07-05, explicit). Acceptance means _verified_, never
   _reported_.
4. **Context is precisely managed:** minimum tool permissions (preferably
   none; sometimes read; rarely if ever write); no extraneous skills, MCP,
   plugins, or rules; laser-focused on a single purpose.

## The task-vs-reasoning test (the load-bearing line)

Before delegating anything, ask: **is this a task, or is this reasoning?**

- A **task** has a decidable done-state you can specify up front and check on
  return: _find every call site of `X`; run this probe and return raw output;
  rename `A` to `B` across these files; extract the `tools:` field from each
  adapter._ The subagent fills in mechanics, not judgement.
- **Reasoning / synthesis** weighs options, resolves ambiguity, forms a
  verdict, or decides what matters: _figure out the right architecture; decide
  which findings are real; summarise what these ten files mean for the design._

Reasoning and synthesis **stay in the accountable seat — yours.** The recorded
failure class is **information loss through delegated synthesis**: hand a
subagent a pile of material and ask it to "summarise" or "decide," and the
lossy compression it returns silently becomes your understanding. It has
happened before. If a job needs judgement, do the judgement; delegate only the
gathering that feeds it, as narrow tasks whose raw outputs you reason over
yourself.

Litmus: _if the subagent returned a one-line answer, could I check it against a
concrete artefact without re-doing the thinking?_ Yes → task. No → keep it.

## Writing a decision-complete, narrow brief

A worker has no session memory and no view of your intent. The brief carries
everything, and narrowness is the quality bar — a broad brief is filled with
guesses.

A good brief states:

- **The single done-state**, concretely and checkably. One goal per dispatch;
  multi-goal briefs drift.
- **Exact inputs**: the precise files, paths, symbols, or commands — no "find
  the relevant file."
- **The exact output shape**: the format, the fields, "raw matches, no
  commentary," a JSON schema when structure matters.
- **Hard constraints**: read-only, stay within directory X, do not edit, do
  not install, return counts not contents.
- **Every gate in the chain the output will be held to** (graduated
  2026-07-12): a delegated-AUTHOR brief enumerates the COMPLETE
  quality-gate chain its output must pass — an omitted gate converts
  silently into violations the worker cannot know to avoid (worked
  instance: a brief listing every gate except eslint; four
  `as`-assertions reached the battery).
- **What NOT to do**: name the reasoning the worker must not attempt (it
  returns findings; you decide what they mean).

Narrower is better: split a two-part job into two dispatches you can verify
independently rather than one you cannot. If a brief cannot be made
decision-complete without handing over judgement, it is not a task — see the
test above.

## Precisely-managed, minimum context

Leanness is correctness here, not thrift: extraneous surface is attack surface
for drift and cost.

- **Tools:** start at **none**; grant **read-only** (`Read, Grep, Glob`) only
  when the task must inspect the tree; grant **write** rarely, and only the
  specific write the task needs. **`Bash` is not a read-only tool** — a shell is
  a universal capability (arbitrary write and execution), so grant it only when a
  task genuinely must run a command, never as part of an "inspect the tree" set.
  Never grant a tool "just in case." Express _none_ as a bare `tools:` key with
  no value — it renders as `tools:` alone on its line, and this is the
  probe-verified zero-tools shape. Do **not** write `tools: []` and do **not**
  omit the field: an empty array and an absent field both fall back to
  inheriting every tool.
- **No extraneous context:** no skills, MCP servers, plugins, or rules the
  task does not need. The `task-worker` definition ships this leanness by
  construction — prefer it over a general-purpose agent, which loads the full
  surface.
- **Single purpose:** one worker, one job. Fan out with many single-purpose
  workers rather than one general one.

## Platform note — Cursor workers are COARSE read-only agents

Real least-privilege tool scoping exists only on Claude platforms: Cursor has
no per-tool permission field, so a Cursor-dispatched worker cannot be
tools-minimal — it is a COARSE read-only agent, and briefs for it must assume
the wider surface (design rationale from the lean-task-subagents arc, frozen
plan record; conserved at the r5 ledger pass 2026-07-06). Design worker
classes per platform capability, not from the Claude template's assumptions.

## Dispatching many

The discipline scales down per dispatch and up in number. To fan out:

- Give each worker a disjoint, single-purpose slice with its own
  decision-complete brief and the same minimum toolset.
- Launch independent dispatches concurrently (one message, multiple tool
  calls) when they share no state.
- **Verify each return on its own** before composing. The composition — what
  the collected results MEAN — is synthesis, and it stays with you.

## Extraction fan-outs: measured verification design (2026-07-05/06 audit)

A 74-dispatch extraction fan-out (45 tasks, 15 sources) measured worker
fidelity directly and set the verification standard for the class:

- **Name the worker's own tool in the brief.** "Use Grep with pattern X,
  then reproduce the matched lines verbatim" measurably outperformed
  describe-the-goal briefs (round-2 acceptance rose to 18/27, including
  123- and 141-line sets byte-exact). Fidelity is length-correlated with a
  stable failure taxonomy: frontmatter-interior omission, YAML-as-list
  over-capture, deep-file under-capture, fabricated matches, indent and
  numbering drift, mid-output commentary.
- **The dispatcher verifies by FULL-SET equality, never sampling** — line-
  number set equality plus per-line byte equality against an independent
  dispatcher recomputation. Count parity plus sampled byte checks passed
  work the full-set standard rejected (28/42 first-round rejections, every
  one adjudicated worker-side); a +1 line offset was caught only by a
  lucky sample.
- **Two-strike pull-in-session.** After two named-deviation strikes on the
  same task, pull it and extract dispatcher-side; zero degraded output is
  accepted.
- **Run a residue audit against shared-definition blindness.** When the
  verifier recomputes with the same match definitions the brief carries, a
  definition gap is invisible to 100% agreement. Cluster all uncaptured
  non-blank source lines into blocks, flag blocks with no captured anchor
  nearby, and prove the detector discriminates (a planted synthetic
  orphan) before trusting a zero-orphan result.
- **Probe design is subject to probe-validity too:** casing and literal
  form are part of probe reach — a lowercase literal probe against an
  uppercase banner "passes" while proving nothing. And chained
  find-replace verification must check for OVER-substitution (a later
  rule re-hitting an earlier rule's output), not just residue — a
  sequential-substitution defect (PDR-129/130 citations rendered
  130/130) survived a residue-only verification and was caught by a
  peer (2026-07-06).

## Critical assessment before acceptance (every output, every class)

A subagent reply is an **input to verify, never a result to accept.** This is
a non-negotiable step, not a recommendation, and **no class is exempt** —
including the lean worker class, however narrow its brief.

- Verify **claims** against the artefact first-hand — read the file, run the
  probe, check the count. A confident report is a hypothesis.
- Verify **sources**: a cited path, symbol, or line is a claim until you see
  it. Renamed or moved surfaces are the canonical drift shape.
- Prefer **empirical** verification (re-run, diff, re-read) over re-reading the
  worker's prose. When the stakes warrant it, verify adversarially — try to
  falsify the claim.
- This composes with
  [`adversarially-verify-subagent-output`](../../rules/adversarially-verify-subagent-output.md):
  acceptance means you have verified, not that the worker asserted.

## Repo specialists are a different class

The repo's reviewer and domain-expert subagents (`code-reviewer`,
`test-reviewer`, `type-reviewer`, the `architecture-expert-*` panel,
`security-expert`, `subagent-architect`, and the schema-domain experts
`openapi-expert` / `zod-expert` / `json-schema-expert` / `mcp-expert`, …) are **not** this
worker class. They are commissioned to reason within their specialism, and
their reasoning is a **critically-assessed input** — the verdict is formed and
owned by you, the dispatching agent. Do not constrain them to Sonnet-5 or
narrow task-briefs; do apply constraint 3 (verify before accepting) to them
too. Invoke them via [`invoke-reviewers`](../../rules/invoke-reviewers.md) and
[`invoke-code-experts`](../../rules/invoke-code-experts.md); use this skill's
worker class for the mechanical gathering those reviews may need.

## Anti-patterns

- **Delegated synthesis** — "summarise these files," "decide which are real,"
  "figure out the approach." The recorded failure class. Gather narrowly;
  reason yourself.
- **Broad brief** — "look into X and report back." Under-specified; the worker
  guesses. Narrow it to a checkable done-state or keep it.
- **Tool maximalism** — granting write or a broad toolset "to be safe." Grant
  the minimum the task needs and nothing more.
- **Accept-on-report** — treating a confident reply as done. Verify first-hand,
  every time, every class.
- **Multi-goal dispatch** — several jobs in one brief. Split them.

## Fleet sizing and dynamic workflows — the castr binding

castr's expression of
[`PDR-142`](../../practice-core/decision-records/PDR-142-three-tier-fleet-composition.md)
(three-tier fleet composition), binding the estate's concrete model vocabulary per that
record's grant-surface clause. Owner directive (2026-07-18, this binding's warrant): _"prefer
more lower power agents, where the agent power is determined by the lowest power that can,
with appropriate structure and constraint, do a good job. Sometimes Fable will be necessary,
often it will not, sometimes a fleet of 10 Sonnet instances would do the same job faster and
with more checks and balances and complementary and adversarial perspectives and validation.
Sometimes 100 Haiku is what is needed."_

**The power floor.** Agent power is the LOWEST tier that, with appropriate structure and
constraint, does a good job — power is never a default, always a justified selection.
Structure substitutes for power: a decision-complete brief, a disjoint slice, an atomic
structured judgement, code-side aggregation, adversarial verification, and an apex synthesis
pass each buy quality that would otherwise be bought with a bigger model.

**Tier → model binding (castr):**

| PDR-142 tier | castr model                             | Use for                                                                                                        |
| ------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Swarm        | Haiku (`claude-haiku-*`)                | Many (~10–100s) independent atomic judgements under decision-complete briefs; aggregation in code, never prose |
| Depth        | Sonnet (`claude-sonnet-*`)              | The default `task-worker`; seam-holding adjudication where one mind must hold a whole subsystem                |
| Apex         | The session frontier model (Fable/Opus) | Cross-seam synthesis, brief validation, correlated-error hunting, custody judgement — never delegated below    |

**The decision procedure (ordered; each step defers to the doctrine that owns it):**

1. **Proportionality first** — do these agents need to exist at all?
   [`invoke-assumptions-expert`](../../rules/invoke-assumptions-expert.md) owns this gate
   (it fires on 3+ new specialist agents); "prefer more lower-power agents" is never a
   licence to skip it.
2. **Task or reasoning?** — the task-vs-reasoning test above. Synthesis stays in the
   accountable seat; only gathering fans out.
3. **Map failure classes to tiers** — PDR-142's table is the load-bearing step: random
   individual error → swarm redundancy + code aggregation; local misjudgement → depth
   adjudication; correlated/systemic error → an apex pass. A fleet design with no apex pass
   has silently accepted correlated error, however many agents it runs.
4. **Reviewers are depth-tier specialists, not workers** — dispatch per
   [`invoke-reviewers`](../../rules/invoke-reviewers.md) and
   [`invoke-code-experts`](../../rules/invoke-code-experts.md); never constrain them to
   worker briefs or the worker model pin (§Repo specialists above).
5. **Every fleet inherits the protection rules** —
   [`subagent-practice-core-protection`](../../rules/subagent-practice-core-protection.md)
   (no practice-core writes; a 100-agent swarm multiplies the protected-surface risk) and
   [`adversarially-verify-subagent-output`](../../rules/adversarially-verify-subagent-output.md)
   (acceptance means verified, at every tier).

**Dynamic workflows (Claude Code Workflow tool).** The tiers map directly onto workflow
scripts: set `model`/`effort` per `agent()` call — cheap mechanical stages low
(swarm: `model: 'haiku'`, low effort), verify/judge stages higher, and omit the override to
inherit the session model for apex-shaped stages. Schema-forced structured output IS the
atomic-judgement clause (one narrow judgement per agent); aggregation, dedup, counting, and
thresholds happen in script code, never in another agent's prose. Default to pipeline over
barrier; use loop-until-dry for unknown-size discovery; scope any completeness critic to
NAMING uncovered surfaces (its presence re-checks are unreliable — PDR-124's measured
finding). The audit-shaped composition of all of this is
[`PDR-124`](../../practice-core/decision-records/PDR-124-multi-agent-audit-harness.md); cite
it rather than re-deriving the harness.

## Related

- [`task-worker`](../../sub-agents/templates/task-worker.md) — the lean
  general-work agent definition this skill dispatches.
- [`adversarially-verify-subagent-output`](../../rules/adversarially-verify-subagent-output.md)
  — the verify-before-accept rule constraint 3 operationalises.
- [`codex-helper`](../codex-helper/SKILL-CANONICAL.md) — the sibling for
  delegating a self-contained task to a Codex worker; the same briefing-quality
  and least-privilege disciplines apply.
- [`PDR-142`](../../practice-core/decision-records/PDR-142-three-tier-fleet-composition.md)
  — the portable three-tier doctrine the castr binding above expresses;
  [`PDR-125`](../../practice-core/decision-records/PDR-125-adversarial-verification-of-delegated-work.md)
  and [`PDR-141`](../../practice-core/decision-records/PDR-141-compound-agent-composition-invocation-and-dissolution.md)
  govern verification and compound-agent lifecycles above the ephemeral fleets this skill
  dispatches.
