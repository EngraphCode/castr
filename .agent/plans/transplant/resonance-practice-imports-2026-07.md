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
    status:
      done # 2026-07-18 (Midnight Watching Night, 900203): working-tree-latest source
      # (upstream HEAD 8195b78 + uncommitted); 140->300 ln merge; preserve-list 12/12; foreign
      # refs 0/7; Gate-Shaped Code co-synced; dispositions ledgered in the body.
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
in-set}. **PDR-126 disposition amended at the reviewer fold** (assumptions-expert I1: it was
outside the anchor's cite-closure — an inherited "dependency closure" framing this plan's own
decline logic contradicted): retained WITH a wired castr consumer — the pr-lifecycle Phase 7
shared-credential clause now cites it as the structural cure's home, matching castr's live
shared-gh-credential situation; adoption is a named owner decision point. Its Related mention
of the upstream `identify-as-agent-under-shared-credentials` rule is prose, not a link (no
dangle). **Known transient dangle, deliberate:** PDR-140's Related block cites PDR-139
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

## T3 — pr-lifecycle re-sync (LANDED 2026-07-18)

Source re-measured at execution: upstream HEAD 8195b78; the skill (308 ln) and
`invoke-reviewers.md` still UNCOMMITTED-modified in the upstream working tree → per the
owner's plan-time ruling, working-tree latest taken; Governance provenance line records it.
Method executed: per-hunk semantic merge (castr 140 ln + upstream 308 ln → castr 300 ln).

**Ported (each localised to upstream-provenance prose, castr surfaces, castr instances):**
Phase 1 §4 gate-shaped adversarial fixpoint WITH the coupled `invoke-reviewers`
§Gate-Shaped Code section (co-synced, cross-linked to lean-task-subagents/PDR-142);
harvest-denominator paragraph; empty-checks-is-a-fact clause; routed-to-named-successor 4th
disposition + target-must-exist-in-writing guard; laddered triage protocol (its "decision
matrix" synthesis step localised to castr's Decision Lenses + PDR-057 dissolution test);
cancelled-CI-is-infrastructure clause (kengraph-token instance generalised to
credential-Actions-write); false-premise verification; watch ALL-GREEN exit semantics;
paired-mutation independent verification; mergeStateStatus-UNKNOWN backlog;
review-materialisation lag; checks-rollup race; full convergence-discipline block (castr's
own PR #10 seven-round instance added beside the upstream arc); reflexive-loop JUDGEMENT
exit + strictly-narrowing tell; volatile-tracker named cost; denominator-naming;
proportionality damper; mergeable-vs-CLEAN; dual-signal recipe; post-hoc reviewer-gateway;
shared-credential approval-failure (stated as mechanism + castr-conditional, not asserted as
castr-observed); Stacked-PR note.

**Preserved castr-local (self-review verified, 12/12 present):** `check:ci` gate name;
feature-branch model; FOUR-surface harvest incl. server-side ruleset findings +
scanning-fix-verification (castr is AHEAD of upstream here — back-flow candidate);
Copilot/Codex bot names; persistent-Monitor watcher note; PR #3 worked instances;
owner-invoked merge posture; question-tool notification; merge-commit preference; Phase 8
continuity vocabulary; agent-identity-in-replies note.

**NOT ported (dispositions):**

| Upstream hunk                                                      | Decision    | Reason                                                                                                                                                                          |
| ------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto-merge-early arming (Phase 7)                                  | NOT-PORTED  | Contradicts castr's standing owner-invoked merge posture (2026-07-03); adopting it is an owner posture decision, not a sync hunk — surface if the owner revisits the merge gate |
| worktree-hygiene cites (Phases 1, 8)                               | NOT-PORTED  | Rule absent in castr; castr's feature-branch model + never-use-git-to-remove-work already carry the substance                                                                   |
| pr-139 disposition-ledger cites                                    | GENERICISED | Ledger absent in castr; instances kept as upstream-provenance prose                                                                                                             |
| invoke-reviewers §Verification-Set-Includes-Decision-Record-Corpus | DEFERRED    | Valuable but outside the coupled scope; follow-up candidate for a later invoke-reviewers sync                                                                                   |

Self-review proof: foreign-ref scan 0/7 classes present (worktree-hygiene, pr-139, Director,
kengraph, Bugbot, Vercel, decision-matrix); §Gate-Shaped Code anchor resolves; preserve-list
12/12.

## Reviewer fold (2026-07-18, five depth-tier reviewers, all findings dispositioned)

- **code-reviewer** APPROVED-WITH-SUGGESTIONS: validator now routes projection throws through
  its issue list (applied); TSDoc added to `CodexPermissionCompositionInput` (applied);
  principles.md edit-guard checkpoint SURFACED TO OWNER at the PR gate (the approved plan
  enumerated the edit; explicit confirmation requested rather than assumed).
- **test-reviewer** ISSUES-FOUND(medium): malformed-YAML fail-fast + frontmatter-sans-projection
  branches uncovered → colocated `agent-projection.unit.test.ts` added (4 tests; applied).
- **type-reviewer** APPROVED-WITH-SUGGESTIONS: `WorkerTool` union threaded (schema-inferred,
  single-source) — RECORD CORRECTION: the first fold applied only the agent-projection half;
  the generator's `AgentRosterEntry.tools` widening survived until Copilot's PR round caught
  it (thread SRL), and the threading completed in the round-1 fold commit;
  `DEFAULT_REVIEWER_PROJECTION` deduped (applied); Zod-4 `strictObject`/`looseObject`
  modernisation (applied). Config-conflict flag (agent-tools tsconfig lacks
  `exactOptionalPropertyTypes`) = pre-existing workspace matter, NAMED FOLLOW-UP, not this
  slice.

## PR #23 round-1 fold (2026-07-18, 8 threads: 7 Copilot + 1 Codex duplicate)

Code (each red-first): `hasTomlAssignment` now matches every legal TOML key spelling (bare,
basic-quoted, literal-quoted — the quoted spellings were a gate bypass); `soleTemplatePath`
shared helper enforces exactly-one-canonical-template in BOTH the validator (issue) and the
generator (throw) — the class-picked-lexicographically defect fixed at the class level;
`AgentRosterEntry.tools` retyped to the closed `WorkerTool` union (completing the type-reviewer
threading); pr-watch gains the ALL-GREEN exit (`isAllGreen`: attached checks all settled
passing + zero unresolved threads; zero-attached-checks reads as the rollup race, not green —
a CI-less PR runs to its poll budget; wired at both watch-loop exits) — the deeper fix for the
two hollow-claim threads (Copilot SRd + Codex P2 duplicate), implementing the documented
behaviour rather than retracting the doc. Docs truthed: the Sonnet-5 pin scoped to the Claude
surface (Codex inherits by design, Cursor pins platform default); the generated worker class
named read-only-by-construction with write grants as dispatch-time constructions; the Cursor
note reconciled with the generator's emitted allowlist (readonly is the verified bit; per-tool
enforcement unprobed); pr-lifecycle Phase 5 wording carries the rollup-race/no-CI honesty.

- **assumptions-expert** CONCERNS: I1 PDR-126 consumer-less → wired (pr-lifecycle Phase 7 cites
  it as the shared-credential structural cure; disposition amended above); I2 Workflow-tool
  call shapes → verification made visible in the skill (authored FROM the live harness contract,
  not inherited; provenance note added). O1 PDR-139 follow-up ownership → carried in the
  thread record at closeout (survives this plan's archive). Sequencing labels noted.
- **docs-adr-expert** GAPS-FOUND (no plan claim falsified; lock hashes byte-confirmed): two
  executive-memory roster mirrors updated (invoke-code-experts 16 templates;
  cross-platform matrix 23 skills / 91 rules / 19 adapters / 16 templates — the matrix's
  pre-existing stale counts corrected in passing); PDR-126 gains `pdr_kind: governance`
  frontmatter (castr corpus convention over byte-parity — the T2 "byte-verbatim" row is
  AMENDED for PDR-126: body verbatim, frontmatter castr-added; back-flow candidate); the
  pr-lifecycle Governance line's transplant-plan pointer replaced with the owner+date (this
  plan archives on merge); decision-records README index brought current (+7 rows: 105, 124,
  125, 126, 140, 141, 142 — the hand-maintained index remains the no-moving-targets
  anti-pattern; generated-index follow-up noted). WAIVED as conserved provenance prose (not
  links, per the PDR-139 rationale): PDR-126's upstream-rule mention;
  PDR-141's first-run-report mention; PDR-126 §First-phenotype's upstream-repo naming;
  `pdr_kind: governance` as an undocumented-but-used value.

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
