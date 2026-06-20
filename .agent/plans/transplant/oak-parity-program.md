---
title: Oak Parity-or-Better Program — agentic-estate sophistication-gap map
status: active
created: 2026-06-20
owner_directive: >-
  "wherever castr's agentic systems are simpler, upgrade them to be at least as
  sophisticated and powerful as those in the Oak repo. castr may be relatively
  simple now, I do not intend for it to stay that way." (owner, 2026-06-20) +
  "review what else is less sophisticated or powerful than the Oak version, I want
  everything upgraded ... the ArcAngel protocol ... is certainly not the only thing missing."
---

# Oak Parity-or-Better Program

Standing owner directive: castr's agentic systems reach **parity-or-better** with Oak's, estate-wide.
See user-memory `castr-parity-or-better-with-oak`. This map supersedes the transplant manifest's
inventory as the authoritative gap list — the manifest was incomplete (it never tracked ArcAngel,
the hook-policy concept model, the memory-machinery dirs, etc.).

## Method + classification

- Read the Oak pin via `git -C /Users/jim/code/oak-open-curriculum-ecosystem show practice/castr-pin:<path>`
  (ref `ad359a4f`), NEVER the Oak working tree.
- Each difference is classified: **deliberate localisation** (preserve — castr fail-fast over
  `use-result-pattern`, zero-Oak-tokens, castr gate commands, dropped Oak-product tooling) vs
  **unbuilt-capability gap** (upgrade to parity-or-better).
- The 2026-06-20 audit fanned out 5 read-only subagents; **all load-bearing claims below were
  re-verified firsthand by the lead** (per `verify-agent-claims-firsthand`). Three agent errors were
  caught and corrected (noted inline) — do not trust the raw audit reports over this verified map.

## Verified gap map (by capability impact)

### Tier A — high impact

| #   | Gap                                                  | Oak source                                                                                                                                                                                                 | castr state (VERIFIED)                                                                                             | Size | Notes                                                                                                                                                                                           |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **ArcAngel / ARC rapid-comms protocol**              | `.agent/reference/arc-rapid-communication.md` (354L) + `.agent/collaboration/rapid-comms/`                                                                                                                 | castr LACKS `.agent/collaboration/` entirely                                                                       | M    | Owner-named. Complementary low-latency peer-dialogue channel; complements (not replaces) canonical comms. Needs: protocol doc + dir + watcher-pairing clauses + statusline wing (depends A4).   |
| A2  | **hook-policy concept/reappraisal model**            | `content-deny-response.ts` (83L), richer `types.ts` (218 vs 130), `blocked-patterns.ts` (148 vs 96), `matchers.ts` (224 vs 200, returns matchedText), `match:'substring'` mode, policy.json concept-groups | castr SIMPLER: flat `{pattern,citation}`, no reappraisal/concept, no content-deny-response, token-subsequence only | L    | One coherent unit. Teaching deny-messages (PDR-044 §Innate immunity). Ships with A3. Open evasion: busy-loop in a quoted token sails past castr's matcher.                                      |
| A3  | **`validate-policy-reappraisal` validator**          | `agent-tools/src/validators/policy-reappraisal/` (3 files)                                                                                                                                                 | MISSING (not in castr's 8-validator chain)                                                                         | M    | Commit-time gate enforcing reappraisal presence. Depends on A2.                                                                                                                                 |
| A4  | **statusline session-shape coordination indicators** | `statusline-session-shape.ts` (219L), `statusline-indicators.ts`, `statusline-ansi.ts` + `--role` declaration                                                                                              | castr renders identity+git+model only; coordination-blind                                                          | M    | Team-shape icon / director demark / ArcAngel wing, fed by claims+experiments reads. Oak `oak-logo.ts` is a brand asset → DON'T bring; insert indicator segment into castr's single-line layout. |

### Tier B — medium impact

| #   | Gap                                               | Oak source                                                                                                                                    | castr state (VERIFIED)                                                                                                                   | Size | Notes                                                                                                                                                          |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **D4 archive + provenance engines**               | `collaboration-state/archive/` (8 files) + `provenance/` (3 files)                                                                            | **NOT missing — landed on branch `feat/d4-archive-provenance-backbring` (unmerged)**                                                     | M    | CORRECTION to audit ("MISSING"): code exists on the D4 branch. Action = MERGE/REBASE that branch onto the transplant branch, not build. Coordinate-dependent.  |
| B2  | **metacognition directive depth**                 | `.agent/directives/metacognition.md` (122L)                                                                                                   | castr 16L — missing Two-Modes (retrospective/generative), Friction, Fluency-is-a-warning, structural-cure-shape sections                 | S    | Pure portable doctrine, zero product-coupling, highest-value-per-effort. The metacognition _skill_ is byte-identical; the rich content lives nowhere in castr. |
| B3  | **agent-identity versioned schema-registry**      | `core/agent-identity/schema-registry.ts` (145L) + digest-pinning + `namingSchemaVersion`                                                      | PARTIAL: castr HAS the 6 themed wordlists and uses them (CORRECTION to audit); MISSING only the versioning/digest/era-selection registry | S-M  | Gap narrower than audited. Adds wordlist-era freezing (SHA gate) + historical-schema selection + provenance.                                                   |
| B4  | **cross-platform session-identity hooks**         | `.cursor/hooks/` (sessionStart + identity hook + continual-learning state) + `.codex/hooks/practice-session-identity.mjs`                     | castr has Claude hook only; LACKS `.cursor/hooks` + `.codex/hooks`                                                                       | S-M  | Identity registration is Claude-only across castr's 3 adapters. Continual-learning state machinery also Cursor-only in Oak.                                    |
| B5  | **collaboration-state convention/lifecycle docs** | `operational/collaboration-state-conventions.md` (201L), `-lifecycle.md` (252L), `executive/collaboration-state-placement-contract.md` (110L) | MISSING                                                                                                                                  | M    | The doctrine layer behind the runtime collaboration plane.                                                                                                     |
| B6  | **prompts machinery**                             | `agentic-engineering/collaboration/`, governance/comms research-session prompts, `user-snippets.md`, prompt `archive/`                        | castr has session-continuation + 2 prompts only                                                                                          | M    | Oak `connecting-oak-resources/` + `semantic-search/` are product → skip.                                                                                       |

### Tier C — small / correctness

| #   | Gap                                                             | Oak source                                                                                                                          | castr state (VERIFIED)                                                          | Size   |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| C1  | **practice-fitness URL-aware width** (real bug)                 | `practice-fitness/markdown.ts` `measurableProseWidth()` (29L) + test                                                                | castr `evaluate.ts:95` uses raw `line.text.length` → false-flags long-URL lines | S      |
| C2  | **`assertClaimMatches` fail-loud guard** (fail-fast regression) | `cli-claim-commands.ts` throws on no-match (heartbeat/close)                                                                        | castr `heartbeatClaim` silently `.map`-no-ops; `--role` field dropped           | S      |
| C3  | **watcher silent-hang hardening**                               | `comms-watch-errors.ts` (122L) per-step deadline + `WatcherTimeoutError`                                                            | castr loop has error taxonomy but no per-step timeout race                      | M      |
| C4  | **watcher liveness self-check + mutual-cover** (rule depth)     | `comms-all-channels-watcher.md` liveness/mutual-cover sections                                                                      | castr code primitives present, rule guidance stripped                           | S      |
| C5  | **liveness-heartbeat-cron loop hygiene** (rule depth)           | `liveness-heartbeat-cron.md` (283L) loop-hygiene + remote cross-check                                                               | castr 238L, sections missing                                                    | S      |
| C6  | **memory machinery dirs**                                       | `operational/{quarantine,curator-passes,workstreams,archive}/`, `memory/collaboration/`, `executive/agent-capability-vocabulary.md` | all MISSING (castr skills reference homes that don't exist)                     | S each |
| C7  | **Claude settings keys**                                        | `skillListingBudgetFraction`, `skillOverrides`                                                                                      | castr lacks (relevant given large skill roster)                                 | S      |
| C8  | **hook error-logging lib**                                      | `.claude/hooks/_lib/log-hook-errors.sh`                                                                                             | MISSING (secrets hooks = assess for product-coupling)                           | S      |

### Confirmed NON-gaps (deliberate localisation / product-coupling — do NOT action)

fail-fast over `use-result-pattern`; zero-Oak-token PDR convention; dropped Oak-product experts
(clerk/elasticsearch/sentry/a11y/design-system/react/ground-truth) + skills (onboard-me/working-with-graphs/
ground-truth-\*) + rules (eef-corpus-grounding/sonarqube-mcp) + `ci-schema-drift-check` + `oak-logo.ts` +
Oak `.cursor` SaaS plugins. castr is AHEAD on `drift` + `patterns-index` validators. CI/repo-check at parity.

## Recommended execution order

Low-risk high-value first; couple the dependent units:

1. **B2 metacognition directive** (S, zero-coupling, highest value/effort) — inline.
2. **C1 practice-fitness URL bug + C2 assertClaimMatches guard** (S, real defects in castr's own systems) — inline TDD.
3. **C6 memory dirs + C4/C5/C7/C8 rule-depth & config** (S each) — inline batch.
4. **A2+A3 hook-policy concept/reappraisal + validator** (L, one unit, TDD) — focused slice or workflow.
5. **A4 statusline session-shape** (M) then **A1 ArcAngel** (M, depends A4 wing) — owner-confirm ArcAngel scope.
6. **B1 D4 archive/provenance** — merge/rebase the existing branch (delivery, not build).
7. **B3 schema-registry, B4 cross-platform hooks, B5 collaboration docs, B6 prompts, C3 watcher hardening** (M).

Phase-9 closure (practice-verification + relevance-ledger + handoff + tag) happens AFTER the parity
program lands, not before (the docs forbid a green-but-incomplete Phase-9 tag).
