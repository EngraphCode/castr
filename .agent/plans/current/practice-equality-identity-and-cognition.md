---
title: Practice equality instalment 1 — identity unification and the cognition skill tree
status: current
lane: current
created: 2026-08-24
last_updated: 2026-08-24
owner_directive: >-
  Four owner directives, 2026-08-24, in the loop-review session's continuation, under the
  standing equality directive ("piece by piece, I want the Practice in Castr and OCE to take
  the best of each other, until they are Equal in capability"): (1) "For cloud sessions it
  seems the underlying Claude Code session ID is the wrong conceptual unit for a consistent
  ID. It works well for Claude Code CLI, but perhaps for Cloud sessions we should use the
  session ID, and strip the ubiquitous session_ before processing… Any enhancements must go
  to both Castr and OCE"; (2) "Castr and OCE should align in the OCE model of Practice
  identity, which is the later schema version"; (3) "Castr needs the missing cognition
  skills and skill tree structure bringing over from OCE".
evidence: >-
  .agent/analysis-and-reports/castr-oce-loop-comparison-2026-08-24.md (the equality
  directive's durable home); the 2026-08-24 in-session identity-chimera measurement recorded
  in .agent/memory/active/napkin.md; OCE engraph branch read firsthand (agent-tools
  src/core/agent-identity/{schema-registry.ts,schemas/v2}, PDR-027 amendments 2026-07-23 and
  2026-08-01, .agent/skills/cognition/ tree, .agent/plans/templates/).
todos:
  - id: ID-1
    content: >-
      Seed-source precedence (castr): a single resolveIdentitySeed used by the Claude
      SessionStart hook, identity preflight, and the agent-identity CLI. Rule: when
      CLAUDE_CODE_REMOTE_SESSION_ID is present (cloud seat), the seed is its payload with
      the leading type tag stripped (strip the ^[a-z]+_ prefix — the env form is cse_<id>,
      the URL form session_<id>; both strip to the same identifier); otherwise (CLI seat)
      the harness session_id remains the seed, unchanged. Red-first unit cycles: cloud env
      resolves the stripped payload; CLI env resolves session_id; empty or malformed remote
      id falls back to session_id; the stripped payload round-trips into the Claude-Session
      trailer identifier so registry rows and commit trailers share one join key.
    status: pending
    depends_on: []
  - id: ID-2
    content: >-
      Hook chimera cure (castr): the SessionStart hook must never pin a display name that
      can diverge from the seed it also sets. Cure shape (structural, not doc-patch): stop
      writing ENGRAPH_AGENT_IDENTITY_OVERRIDE from the hook — the name derives from the
      live seed at every point of use; the override env var remains reserved for explicit
      human override only. Red-first regression named for the 2026-08-24 measured chimera:
      with the hook's env file sourced and a different seed exported, the resolved tuple
      (name, prefix, uuid) must be coherent — all three from the exported seed, no
      mixed-provenance tuple.
    status: pending
    depends_on: [ID-1]
  - id: ID-3
    content: >-
      Naming-schema registry transplant (castr): bring OCE's
      core/agent-identity/schema-registry.ts, schemas/v2 wordlists, and the digest-pin gate
      test into castr agent-tools. New derivations default to v2-noun-verb-noun; v1 stays
      registered so historical rows remain self-describing; derived-identity results carry
      their naming-schema id wherever the OCE schema does. Localise imports and naming
      (oak → engraph) per the transplant field-report discipline.
    status: pending
    depends_on: [ID-1]
  - id: ID-4
    content: >-
      PDR-027 doctrine alignment (castr): fold OCE's later PDR-027 amendments into castr's
      copy — 2026-07-23 (forks and duplicates: identity derives from the session, never
      from inherited context) and 2026-08-01 (derivation-source provenance: claim rows
      only; the visual-disambiguator display token with the bare-join-key authored-surface
      obligation) — and add the new cloud-seat seed clause from ID-1 as a dated 2026-08-24
      amendment. Record in the clause: session_id_prefix stays first-6 universally; for
      ULID-shaped cloud seeds the first six characters are timestamp-derived, so two
      sessions started within the same ~4-minute window share a prefix — the PDR-076a UUID
      remains the canonical disambiguator and the visual-disambiguator token the display
      guard (warrant: prefix collision is already doctrinally survivable; falsifier: a
      measured same-window mis-bind that the uuid checks fail to catch).
    status: pending
    depends_on: [ID-1]
  - id: ID-5
    content: >-
      OCE landing (equality: enhancements go to both): raise the OCE PR carrying the same
      seed-source precedence (their hook + preflight + CLI), the same chimera cure if OCE's
      hook shares the override-pinning shape, and the same PDR-027 cloud-seat clause —
      branched off engraph, landed per OCE's own conventions and ratification path (their
      plan estate, sketch status where governance requires it). castr-side ID-1/ID-2 code
      is the reference implementation; OCE's naming schemas need no change (v2 is theirs).
    status: pending
    depends_on: [ID-1, ID-2, ID-4]
  - id: SK-1
    content: >-
      Skill-tree structure (castr): create .agent/skills/cognition/ and move metacognition
      and reason into it, matching OCE's tree. Verify castr's skills-adapter-generate
      handles nested canonical directories (OCE's does — same generator lineage); fix every
      reference to the moved canonicals (skills, rules, directives, PDR/ADR pointers);
      regenerate the engraph-* platform adapters; adapters and canonicals stay in lockstep.
    status: pending
    depends_on: []
  - id: SK-2
    content: >-
      Cognition skills transplant (castr): bring over OCE's missing cognition skills —
      concept-exploration, cricket, free-play, proportionality, retrospective, and the
      parallax family (parallax plus its frame, learn, decide, audit, synthesise,
      design-inquiry, design-experiment, product-experiment sub-skills, including the
      parallax skill's assets/evals/references/scripts payload) — localised oak → engraph,
      OCE-host-specific references adapted or dropped per the transplant relevance rules.
      Each skill lands with its adapter regenerated and its canonical links resolving.
    status: pending
    depends_on: [SK-1]
  - id: SK-3
    content: >-
      Skills-corpus governance transplant (castr): the skills README (corpus definition,
      audience-set registry) and the capability-landing-decision-procedure rule it depends
      on, localised to castr's audiences (no curriculum/teacher row; castr's audience sets
      named honestly).
    status: pending
    depends_on: [SK-1]
  - id: SK-4
    content: >-
      Plan-templates transplant (castr): bring OCE's .agent/plans/templates/ (README,
      delivery/runbook/strategic templates, components) so castr's plan skill references
      resolve — the skill points at ../../plans/templates/README.md which does not exist in
      castr (measured 2026-08-24, this plan's authoring). Localise template prose to
      castr's collections and lanes.
    status: pending
    depends_on: []
---

# Practice equality instalment 1 — identity unification and the cognition skill tree

The first executable instalment of the owner's standing equality directive (conserved
verbatim in the
[castr–OCE loop comparison](../../analysis-and-reports/castr-oce-loop-comparison-2026-08-24.md)):
unify Practice identity on one conceptual unit per seat and one naming model across both
estates, and bring castr's cognition skill corpus up to OCE's.

## End goal

One seat resolves to exactly one identity tuple, derived from the identifier that is durable
and visible for that seat's platform — and that same identifier is the join key across the
collaboration registry, commit trailers, and rendered views. Castr's reflective toolkit
(cognition skills) and skills-tree governance match OCE's, so a lesson learned in either
estate lands in the same structure in both.

## Mechanism — why these means produce that outcome

**Identity.** PDR-027 seeds identity from "the session id". On CLI seats the harness
session_id is the right unit: stable for the session, the only id there is. On cloud seats
there are two ids — the harness-internal session UUID (hook stdin `session_id`,
`CLAUDE_CODE_SESSION_ID`) and the platform session id (`CLAUDE_CODE_REMOTE_SESSION_ID`,
`cse_`-tagged in env, `session_`-tagged in URLs and Claude-Session commit trailers). The
2026-08-24 session measured the failure this duality causes: three distinct identity tuples
for one seat in one day — the hook-derived tuple (harness UUID), a manually-seeded tuple
(platform id), and a chimera (manual seed + the hook's pinned name override). The cure is
structural: one precedence rule (platform id on cloud seats, stripped of its type tag;
harness id otherwise), derivation always from the live seed, no hook-pinned name. The
platform id is the unit the owner sees (the session URL), the unit that reaches durable
artefacts (the Claude-Session trailer — the loop review's settled per-firing discriminator),
and the unit that survives container recycling — so registry rows, trailers, and the owner's
own view join on one key with no translation table.

**Naming model.** OCE's identity module is the later generation: a digest-pinned
naming-schema registry with frozen eras (`v1-adjective-verb-noun`, `v2-noun-verb-noun`) so
historical rows stay self-describing while new derivations use the current schema. Castr has
the pre-registry single derivation. Transplanting the registry (directive 2) makes the two
estates produce identical names from identical seeds — a precondition for cross-estate
identity rows meaning the same thing.

**Cognition corpus.** OCE's `.agent/skills/cognition/` tree carries ten skills castr lacks
(and the two castr has, better-homed). The transplant brief (this repo,
`.agent/plans/practice-alignment-brief.md`) already mandates wholesale parity; this plan
executes the cognition slice of it plus the skills-governance surfaces that make the tree
navigable (corpus README, audience-set registry, landing procedure, plan templates).

## Non-goals

- Retroactive renaming of registered identities or rewriting of historical registry,
  thread-record, or report rows — v1 rows stay v1, self-described by the registry.
- Changing the Claude-Session commit-trailer format (it is already the platform id).
- Adopting OCE host-local skills outside the cognition tree (oak product, curriculum,
  design-system skills) — the audience-set registry transplant makes that boundary explicit
  rather than importing everything.
- Re-opening PDR-076a (the UUID v5 canonical id) — the uuid derivation is unchanged; only
  the seed that feeds it gains the precedence rule.

## Prerequisites

- None blocking. OCE read access (beneficial): the transplant copies from the OCE clone at
  the pinned engraph head; without a live clone, the minimum shippable shape is
  castr-side ID-1/ID-2 from this plan's stated rule alone, with ID-3/SK-* deferred until a
  source tree is attached.

## Acceptance criteria (proof contract)

- **ID-1** (`unit`): the four named red-first cycles green in agent-tools; command:
  `pnpm --filter @engraph/agent-tools test -- identity`. In a live cloud session,
  `identity preflight` reports the stripped platform id payload as seed and a prefix
  matching the session URL's identifier (`value-proxy`: run in this environment).
- **ID-2** (`unit` + `value-proxy`): the chimera regression test green; a fresh cloud
  session's hook-sourced shell and a manually-seeded shell each resolve coherent tuples.
- **ID-3** (`unit`): the digest-pin gate test green in castr; identical seed → identical
  v2 display name in both repos (cross-checked against OCE's derive tests).
- **ID-4** (`non-code`): castr PDR-027 contains the three folded amendments with their
  original dates plus the dated cloud-seat clause; docs-adr-expert review COMPLIANT.
- **ID-5** (`non-code` + `value-proxy`): OCE PR open, branched off engraph, carrying the
  same rule; its own gates green.
- **SK-1..SK-4** (`integration` + `non-code`): adapter generation clean
  (`pnpm agent-tools:skills-adapter-generate` or castr's equivalent script), no dangling
  links (`pnpm docs:check` / markdown link gate), onboarding-expert + docs-adr-expert
  COMPLIANT on the landed tree; the plan skill's template reference resolves.
- Every cycle: full aggregate gate green (`pnpm check:ci` or the repo's canonical gate)
  before its commit; all tests passing at every level; no skipped tests.

## Risks

- **ULID prefix crowding** (ID-1/ID-4): cloud ids are ULID-shaped, so first-6 prefixes
  collide inside a ~4-minute creation window. Mitigation is already doctrinal (PDR-076a
  uuid as canonical disambiguator; OCE's visual-disambiguator token), recorded in the ID-4
  clause with warrant and falsifier rather than invented anew.
- **Adapter-generator divergence** (SK-1): castr's generator may predate nested canonical
  support. The cycle verifies before moving; if it lacks support, the generator upgrade is
  pulled from OCE first (still in-scope: it is the same equality directive).
- **Transplant contamination** (SK-2/SK-3): OCE-host references leaking in. Guard: the
  existing transplant relevance rules + reviewer pass; localisation grep (`oak-`,
  `@oaknational/`, OCE-only paths) as a deterministic check per cycle.
- **Override removal breaking a consumer** (ID-2): the cursor hook also writes the
  override. The cycle inventories every writer/reader of
  `ENGRAPH_AGENT_IDENTITY_OVERRIDE` first and cures the shape everywhere, not just the
  Claude hook.

## Plan-body first-principles check

Fires at three points: before ID-1's rule is coded (is the precedence rule still the
simplest unit-per-seat rule, re-checked against the live env of the executing session);
before ID-4's doctrine text lands (does the folded PDR-027 read as one document, not a
patch quilt); before SK-2's each-skill copy (does this skill's content fit castr, or is it
OCE-host-local — the relevance determination is per skill, never wholesale-by-default).

## Foundation alignment

`principles.md` (structural cures over doc patches — ID-2's shape; replace-don't-bridge —
one seed rule, not a translation table), `testing-strategy.md` (red-first cycles, one
landing unit per cycle), `requirements.md` (strict validation at the boundary — malformed
remote ids fall back loudly, never half-parse). Verdict-not-menu: the first-6 prefix
decision is presented as a verdict with warrant and falsifier in ID-4, not an owner quiz.

## Readiness reviewers

Before execution starts: assumptions-expert (proportionality of the transplant slice),
docs-adr-expert (ID-4 doctrine fold), onboarding-expert (SK-1..SK-4 tree navigability),
type-reviewer + test-reviewer per agent-tools code cycle. Pre-execution code-expert review
per loop cycle per the standing rule.

## Learning loop

Plan completion runs the consolidation workflow (`engraph-consolidate-docs`); the identity
chimera lesson and the ULID-prefix note are already napkined (2026-08-24) and graduate with
ID-4. Lifecycle triggers per `.agent/plans/` conventions; archival per the delivery ledger.
