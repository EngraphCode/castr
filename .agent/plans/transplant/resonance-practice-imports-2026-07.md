---
title: Resonance practice imports — concept-exploration, fleet-composition framework, pr-lifecycle re-sync
status: active
lane: active
created: 2026-07-18
last_updated: 2026-07-18
owner_directive: >-
  "1. find the concept exploration skill and related information and structure in the local
  Resonance repo and bring it over. 2. We need a decision framework for structuring subagents
  and dynamic workflows... prefer more lower power agents, where the agent power is determined
  by the lowest power that can, with appropriate structure and constraint, do a good job."
  Plus mid-session addition: "also bring over the latest version of the pr lifecycle skill from
  Resonance. Do that last, as it is currently being enhanced." Task 3 source policy
  owner-decided at plan time: working-tree latest, provenance recorded honestly.
  (owner, 2026-07-18, session Midnight Watching Night / 900203)
read_model_note: >-
  Resonance is read live from its primary tree (no pin). Task 1 source measured at
  resonance@d8dc50c with both source files clean. Task 3 source is DECLARED MOVING (uncommitted
  enhancement in flight at plan time) — re-measure at execution; the plan's numbers are
  hypotheses, per the vendor-literal clause.
todos:
  - id: T1
    content: >-
      Bring the concept-exploration skill: canonical + transfer note (localised), generated
      adapters, Skill() permission, principles.md routing block, practice-index row,
      skills-lock provenance entry. Two-case proof + gates.
    status:
      done # 2026-07-18 (Midnight Watching Night, 900203): all surfaces landed; gates
      # green (portability 22 canonical skills, adapters parity, markdownlint 0, repo-validators
      # OK, new files link-clean); two-case proof recorded below.
    depends_on: []
  - id: T2
    content: >-
      Import the fleet-composition framework: PDR-142 + cite closure (PDR-141 + Core annex,
      PDR-140, PDR-125, PDR-126), adversarially-verify-subagent-output rule (+ RULES_INDEX +
      generated wrappers), lean-task-subagents skill (+ castr binding section), task-worker
      template (+ component reads), subagent-architect tier criterion, PDR-124 link-drift fix.
    status:
      done # 2026-07-18 (Midnight Watching Night, 900203): landed; PDRs byte-verbatim vs
      # source; generator worker extension proven red-then-green (25/25); portability 23 skills /
      # 91 rules x3 surfaces / 19 agents; worked sizing demonstration recorded in the body.
    depends_on: [T1]
  - id: T3
    content: >-
      Re-sync pr-lifecycle from resonance working-tree latest (owner-decided source policy):
      per-hunk semantic merge preserving every castr localisation; co-sync invoke-reviewers
      §Gate-Shaped Code if porting Phase 1 §4; honest Governance provenance line; semantic
      self-review diff vs both parents.
    status: pending
    depends_on: [T2]
---

# Resonance practice imports — 2026-07

## End goal

castr agents (1) frame unshaped observations before options foreclose the real question
(concept-exploration), (2) size sub-agent fleets and dynamic workflows by the
lowest-sufficient-power principle with structural safeguards (PDR-142 family + castr binding),
and (3) run the newest pr-lifecycle discipline. Acceptance is each capability FIRING (skill
discoverable and routing correctly; framework applied to a real dispatch decision; re-synced
skill's references all resolving), never file presence.

## Mechanism

All three capabilities exist and are proven in the resonance estate. Bringing the genotype and
expressing the castr phenotype (per the operationalised-rules-are-phenotype doctrine) is
cheaper and more faithful than fresh authorship, and castr's routing rule forbids duplicating
portable doctrine. Transplant-completeness (bring-the-iceberg) governs: every cite the brought
surfaces make must resolve in castr or be brought in the same slice.

## T1 — concept-exploration (LANDED 2026-07-18)

Measured footprint (source resonance@d8dc50c, both files clean there):

| Surface                                                              | Disposition                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `.agent/skills/concept-exploration/SKILL-CANONICAL.md` (63 ln)       | BROUGHT + localised (Routing Boundaries)                      |
| `.agent/research/concept-exploration-practice-transfer-2026-07.md`   | BROUGHT + localised (provenance prose) + castr transfer entry |
| `.claude/skills/` + `.agents/skills/` `engraph-concept-exploration/` | GENERATED (skills-adapter-generate, 22 skills)                |
| `.claude/settings.json` `Skill(engraph-concept-exploration)`         | EDITED (alphabetical slot)                                    |
| `principles.md` §"Concept Exploration — the pre-decision workflow"   | EDITED (after §Decision Lenses dissolution paragraph)         |
| `.agent/practice-index.md` skills row                                | EDITED                                                        |
| `skills-lock.json` provenance entry                                  | EDITED (sha256 of landed canonical; source pin)               |

Localisation decisions (phenotype adaptations, each read against the castr estate firsthand):

- castr HAS the Decision Lenses (`principles.md` §Decision Lenses) and the PDR-057 §Four-Lens
  Dissolution Test, but NOT resonance's `decision-matrix` rule or Decision Matrix definition —
  the routing block and the skill's Routing Boundaries therefore point at the lenses + PDR-057
  directly, and the Decision Matrix paragraph was not ported.
- PDR numbering verified ALIGNED (castr PDR-057 = empirical-answerability, same as resonance) —
  the PDR-057 cites resolve without re-pointing.
- The transfer note's `practice-change-transfer-report` rule + PDR-136 cites are named as
  upstream provenance prose (neither installed in castr); the `baxtersgallery` prototype link
  became prose (prototype not brought — provenance only).

Disposition ledger — the rest of resonance's concept-exploration estate:

| Resonance surface                                        | Decision                 | Reason                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baxtersgallery/research/` prototype cluster (5 files)   | DON'T-BRING              | Pre-promotion prototype; the skill supersedes it; provenance recorded in the transfer note                                                                                     |
| `rules/decision-matrix.md` + Decision Lenses rule estate | DON'T-BRING              | castr's principles.md carries its own lenses; the matrix definition depends on resonance's empirical-gate pipeline castr has not adopted; revisit if a second consumer appears |
| `practice-change-transfer-report` rule + PDR-136         | DON'T-BRING (this slice) | Transfer-report machinery is a separate capability; named as upstream provenance in the note; candidate for a later bring                                                      |

Named follow-up: cross-link `remediation-program-concept-exploration-2026-07-17.md` (lands with
PR #10) to the installed skill once both branches merge.

### Two-case proof (per the transfer note's replication path)

**Case A — raw-observation firing (real instance, this session).** Input: today's
coordination-state observations (claims registry read empty at grounding while two peers were
live; claim-open refused by the comms-blind gate; two stale premises in my team-start corrected
by a live peer within 90 seconds). The four movements ran and CHANGED the framing: from "I made
a snapshot error" (individual discipline) to "grounding reads are systematically EARLIER than
peer-visible presence — the read window precedes watcher arming by construction" (an ordering
property of session bootstrap). Proposals with warrant/falsifier: (1) timestamp state
assertions in team-start reports ("registry empty AS OF <t>") — warrant: the correction cost
was premise-relitigation; falsifier: corrections still needed after timestamping; (2)
structural candidate — extend the comms-blind refusal family from claim-opens to broadcasts
that assert registry state — warrant: the gate's worked success today; falsifier: solo
bootstraps acquire friction that outweighs stale-premise cost. Unresolved evidence: whether
non-Claude platforms can arm watchers before grounding. Routed to the napkin as a graduation
candidate. The pass changed a framing and produced warranted proposals → success test met.

**Case B — formed-options near miss (real instance, this session).** The Task 3 source-policy
fork (working-tree latest / committed HEAD / hold) arrived with options already well formed.
Concept-exploration was NOT invoked — the Routing Boundaries correctly route this to the
formed-decision workflow, and the fork was constitutively the owner's (source policy), so it
went to the owner as a formed decision with a recommendation. The boundary text catches the
near miss exactly as designed → decline path proven.

## T2 — fleet-composition framework (LANDED 2026-07-18)

Landed footprint (source resonance@d8dc50c; every body read firsthand before landing):

| Surface                                                                                                 | Disposition                                                                                           |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| PDR-125, PDR-126, PDR-140, PDR-141, PDR-142 + compound-agent Core annex                                 | BROUGHT VERBATIM (byte-diffed vs source; Core parity)                                                 |
| `.agent/rules/adversarially-verify-subagent-output.md`                                                  | BROUGHT VERBATIM + RULES_INDEX row + 3 platform surfaces                                              |
| `.agent/skills/lean-task-subagents/SKILL-CANONICAL.md`                                                  | BROUGHT + localised (specialist roster) + EXTENDED (castr binding §)                                  |
| `.agent/sub-agents/templates/task-worker.md` + `worker-reading-discipline.md`                           | BROUGHT (projection frontmatter intact; castr had `subagent-identity` already)                        |
| `agent-tools` adapter generator worker-class extension (+ `agent-projection.ts` + tests)                | BROUGHT as a red→green code cycle (new tests proven red against the old generator, 25/25 green after) |
| `.codex/agents/task-worker.toml` + config registration                                                  | BROUGHT / EDITED                                                                                      |
| Roster docs (AGENT.md 15→16, sub-agents README, practice-index), settings permission, skills-lock entry | EDITED                                                                                                |
| subagent-architect checklist: tier/power-vs-correlation-distance criterion                              | EDITED (cites PDR-142)                                                                                |
| PDR-124 Related link `PDR-019-adr-pdr-reusability-test.md` → actual filename                            | FIXED (drift)                                                                                         |

Cite-closure verdicts (all firsthand): PDR-142→{124 ✓, 015 ✓, 141 in-set}; PDR-141→{027, 063,
064, 077, 094 all ✓; 140 in-set; annex in-set}; PDR-125→{011 ✓, 124 ✓}; PDR-126→{027 ✓, 125
in-set}. **Known transient dangle, deliberate:** PDR-140's Related block cites PDR-139
(comms-events-thread-at-creation), which castr lacks. PDR-140 is Core and lands VERBATIM
(conservation and parity outrank link hygiene — editing a portable PDR forks it from the
upstream); PDR-139 is comms-estate and sits in Stormbound Circling Kite's ARC territory —
coordination note broadcast on the comms stream; named follow-up: the link resolves when
PDR-139 lands (ARC bring or a later slice).

Disposition ledger — the rest of resonance's fleet doctrine estate:

| Resonance surface                                                           | Decision                 | Reason                                                                               |
| --------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| PDR-134, PDR-131, PDR-053, PDR-058-family fleet mentions                    | DON'T-BRING (this slice) | Related-family, not cite-closure; castr has 058; others await their own consumer     |
| PDR-129 (recomputable-plan-state), PDR-130                                  | DON'T-BRING              | Prose worked-example mention inside lean-task-subagents only (no link); kept as-is   |
| PDR-139 (comms-events-thread-at-creation)                                   | DEFER (coordinated)      | Stormbound's ARC/comms territory; transient PDR-140 Related-link dangle named above  |
| resonance UI-expert templates (accessibility/design-system/react-component) | DON'T-BRING              | Web-product phenotype; castr's roster mention localised to its schema-domain experts |

### Worked sizing demonstration (framework applied to a real dispatch decision)

Applied retrospectively to this session's own plan-phase fan-out (four exploration agents,
dispatched before the framework landed, inheriting the session frontier model): under the
binding, all four sweeps are DEPTH-tier work (each held one whole estate seam — skill estate,
landing conventions, doctrine inventory, pr-lifecycle delta), so `model: sonnet` dispatches
were the right size; none was swarm-shaped (no atomic-judgement decomposition) and none needed
the frontier tier. The apex pass stayed in-session and EARNED ITS SEAT twice, exactly as
PDR-142's failure-class table predicts: firsthand cite-closure re-measurement caught one
explorer's local misjudgement ("castr has no decision-lenses estate" — false; principles.md
§Decision Lenses exists), and cross-seam synthesis caught the cross-repo PDR-numbering
divergence hypothesis being wrong. Both were invisible from inside the individual sweeps —
correlated/local error caught only above them. Verdict recorded: future same-shape
exploration fan-outs dispatch at Sonnet with explicit `model` overrides.

## T3 — pr-lifecycle re-sync (pending; source DECLARED MOVING)

Method: per-hunk semantic merge, never verbatim (castr is AHEAD on the server-side ruleset
harvest surface — preserve; resonance's worktree-hygiene + pr-139-ledger cites dangle in castr
— redirect/genericise). Source policy owner-decided: working-tree latest at execution,
provenance line records the honest source state. Port-in candidates and preserve-list are
enumerated in the session plan; re-measure the delta at execution.

## Foundation alignment & plan-body first-principles check

Doc-only brings, no product code: landing units are validator-gated doc-slices, NOT TDD cycles
(cargo-culted TDD shape would be dishonest here). Proof level `non-code`: reference-closure +
gates + firing demonstrations. Strict-everywhere applies as the localisation bar (no dangling
cites introduced); knowledge-preservation applies to the disposition ledger (nothing silently
dropped).

## Non-goals (YAGNI)

- Not bringing resonance's decision-matrix rule, Decision Lenses rule estate, transfer-report
  rule, PDR-136, or the baxtersgallery prototypes (ledger above).
- Not editing any remediation-program surface (danger-listed lane worktrees untouched).
- Not renumbering any PDR (imports keep source numbers; numbering verified aligned).

## Lifecycle triggers

On T3 completion: consolidation pass (napkin → distilled candidates: the grounding-order
finding from Case A; the boundary-coordination worked instance), thread-record entry for
`resonance-practice-imports`, archive per ADR-117 when all three todos land and the PR merges.
