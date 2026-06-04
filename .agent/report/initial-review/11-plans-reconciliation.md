# Plans Reconciliation — Deep Extract, Dispose, Re-author

**Date:** 2026-06-04
**Inputs:** all 80 files under `.agent/plans/` (read via an 8-reader + 2-comparator workflow, 62 structured records),
the ADRs, and the verified code findings in this report. **Every load-bearing claim below was re-checked against the
actual plan file, ADR, or re-run code** — the workflow's outputs were treated as candidates, not facts.

> Governed by the repo's own `active/README.md` execution contract: _"Plans are ephemeral execution tools, not durable
> architecture records — permanent truth belongs in `docs/architecture/_` and ADRs,"\* gated by the **Deletion Test**
> ("extract durable truth first, then the plan can disappear"). This document applies that contract to the whole corpus.

---

## 1. The root cause (synthesis)

The planning layer has the **same disease as the code this review found**: claims are not kept true as reality moves.
The plans are treated as durable _records_ (45 sit in `current/complete/`), but they are not maintained, so:

- completion **headers** get flipped to "Complete" while **bodies** still describe active failure (P4, P5);
- a real architectural decision was **reversed** (Zod fail-fast → default `.refine()`) and recorded **only** in the
  roadmap — never ADR'd, never propagated to the three sub-plans it contradicted, and **mislabelled** "semantic"
  although the closures don't validate (P1-P3 → finding C6);
- a session metaplan claims "**zero outstanding debt**" while the concurrent remediation arc was red (P9);
- an arc is declared "**closed / repo cleared**" in the same document that records its packs as red (P7).

**Crucially, the team is partially self-aware.** `roadmap.md:213` already warns: _"Packs 4-7 later found that the repo's
current support and proof posture is narrower than … the historical 'complete' language … implies."_ And
`architecture-review-packs.md` Pack 7 independently states this review's H7: _"the canonical gate chain can stay green
while a dedicated IR fidelity suite is required."_ So the remediation is not "tell the team what's wrong" — it is
**make the plan surface obey the repo's own contract**: lift durable truth into docs/ADRs, re-author only genuine
remaining _work_ as atomic plans, and clear the residue.

## 2. Problematic plans (P1-P9, all verified against primary source)

| #   | Plan(s)                                                                                  | Problem (verified)                                                                                                                                                                                                              | Finding        |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| P1  | `roadmap.md:147-148`                                                                     | "all 9 fail-fast guards **upgraded to semantic `.refine()` … closures**" presents C6's no-op/`typeof` validators as semantic                                                                                                    | C6             |
| P2  | `if-then-else…`, `pattern-properties…`, `prefixitems-tuple-and-contains…` (all Complete) | mandate Zod **fail-fast** and call `.refine()` "**not a default behaviour**"; code makes broken `.refine()` the default; **no ADR** records the reversal (ADR-031 silent)                                                       | C6             |
| P3  | `roadmap.md:148` vs `:150`                                                               | internally contradictory on `if/then/else` (Phase 1 = refinement; Phase 1.5 = "**genuinely impossible (❌)**" = fail-fast); code does neither correctly                                                                         | C6             |
| P4  | `3.3b-05-validation-parity-scenarios-2-4.md`                                             | header "✅ Complete record"; body line 85 "_Parity matrix is **actively failing**_" + unchecked "Active Issues". (The cited `multipleOf`/`gt`/`lt` writer bug is **now fixed in code** — so the body is stale, not a live bug.) | — (doc stale)  |
| P5  | `anchor-and-dynamic-references.md`                                                       | header "✅ COMPLETE"; body line 43 "**NOT YET WIRED**", line 47 "## Remaining Work"                                                                                                                                             | H1             |
| P6  | `3.3b-04-format-parity-hostname-float.md`                                                | status "🔄 **Active**" yet filed in `current/complete/`; future-tense work                                                                                                                                                      | — (misfiled)   |
| P7  | `architecture-review-packs.md`                                                           | "arc closed / RC-1–RC-7 complete / repo cleared" while lines 24-29 record Packs 2-7 all "red", several "partially remediated"                                                                                                   | C4,C5,C6,H4,H7 |
| P8  | `strict-object-semantics-enforcement.md` (Complete)                                      | ships `nonStrictObjectPolicy: 'reject'\|'strip'`; ADR-031:16 says strip "**has been removed per IDENTITY.md**" → describes a deleted mode                                                                                       | — (superseded) |
| P9  | `discovery-and-prioritisation.md:14`                                                     | "**zero outstanding debt**" — contradicted by the RC arc, the active plan, and findings                                                                                                                                         | C4,C5,C6,H1,H7 |

Two **fairness corrections** to the discovery workflow's framing (it over-reached; verified by reading the files):

- `3.3a-07-remove-escape-hatches.md` is **honestly scoped** to "Type Assertions, any, eslint-disable" (its title + lines
  15-18) — it does **not** claim to ban `Object.*`/`Reflect.*`, so M1/M12 are **gaps**, not a `3.3a-07` overclaim.
- `identity-doctrine-alignment.md`'s "centralised" claim is about the `CastrSchemaProperties` Symbol-brand (real), which
  is **separate** from the `isRecord` proliferation (M3) — M3 is a gap, not a contradiction of that plan.
- `RC-3` (`ir-and-runtime-validator-remediation.md`) is **not** an overclaim: it _explicitly_ records (line 45) that
  "TypeScript interface narrowing was **deferred**" — i.e. it honestly documents the H6 type/runtime divergence as a
  known deferral. (The active plan now resolves it in the opposite direction — admit schema-valued rather than narrow —
  which is itself worth an ADR note.)

## 3. Coverage map vs findings

| Finding                                                 | Plan coverage                                                                               | Verdict                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| H6 / L8 additionalProperties                            | `active/explicit-additional-properties-support.md` (ACTIVE) + RC-3 (documents the deferral) | **Covered & correct** — proceed       |
| C6 zod refinements                                      | roadmap "Schema Completeness Arc" + 3 sub-plans, but **contradictorily** (P1-P3)            | **Mis-covered** → ADR-047 + re-author |
| H1 normalisation / $dynamicRef wiring                   | `anchor-and-dynamic-references.md` (but "Remaining Work", P5), `json-schema-parser.md`      | **Partial / stale**                   |
| C1, C2, C3, C4, H2, H3, H5, M1, M2, M3, M4, M5, M7, M11 | **none** (verified by grepping all 80 plans)                                                | **Gaps**                              |

## 4. Disposition of the corpus (the "get rid of the rest")

Disposition codes: **KEEP** (active/valid) · **CORRECT** (stale header/body — fix in place before archiving) ·
**SUPERSEDE** (replaced by an ADR/decision — note + archive) · **EXTRACT→ARCHIVE** (lift any durable truth per the
Deletion Test, then move to `archive/`) · **DELETE** (pure duplicate/zero residual value) · **NEW** (to author).

### `active/` (2)

| File                                        | Disposition                                |
| ------------------------------------------- | ------------------------------------------ |
| `README.md`                                 | KEEP (execution contract)                  |
| `explicit-additional-properties-support.md` | KEEP — valid primary; correctly owns H6/L8 |

### `current/complete/` (45) — the staging area; most should EXTRACT→ARCHIVE

| File                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Disposition                          | Note / Deletion-Test extraction target                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `if-then-else-conditional-applicators.md`                                                                                                                                                                                                                                                                                                                                                                                                             | **CORRECT→SUPERSEDE**                | fail-fast stance superseded by **ADR-047**; reconcile header                                                                                                                        |
| `pattern-properties-and-property-names.md`                                                                                                                                                                                                                                                                                                                                                                                                            | **CORRECT→SUPERSEDE**                | ditto (ADR-047); its "opt-in lossy, not default" guidance → preserved in ADR-047                                                                                                    |
| `prefixitems-tuple-and-contains.md`                                                                                                                                                                                                                                                                                                                                                                                                                   | **CORRECT→SUPERSEDE**                | ditto (ADR-047)                                                                                                                                                                     |
| `3.3b-04-format-parity-hostname-float.md`                                                                                                                                                                                                                                                                                                                                                                                                             | **CORRECT**                          | status is "Active" — either close honestly or move to `paused/`                                                                                                                     |
| `3.3b-05-validation-parity-scenarios-2-4.md`                                                                                                                                                                                                                                                                                                                                                                                                          | **CORRECT**                          | body "actively failing" is stale (code fixed); reconcile to Complete or delete the stale body                                                                                       |
| `anchor-and-dynamic-references.md`                                                                                                                                                                                                                                                                                                                                                                                                                    | **CORRECT**                          | extract "Remaining Work" + "NOT YET WIRED" → a `future/` $dynamicRef-runtime plan, then mark truly complete                                                                         |
| `architecture-review-packs.md`                                                                                                                                                                                                                                                                                                                                                                                                                        | **CORRECT**                          | "repo cleared" overstates; reconcile to "packs red, partial remediations tracked in findings" — **durable truth (the pack verdicts) → a permanent `docs/architecture/` audit note** |
| `discovery-and-prioritisation.md`                                                                                                                                                                                                                                                                                                                                                                                                                     | **EXTRACT→ARCHIVE**                  | "zero debt" claim is historical session framing; archive (no durable truth)                                                                                                         |
| `strict-object-semantics-enforcement.md`                                                                                                                                                                                                                                                                                                                                                                                                              | **SUPERSEDE**                        | strip mode removed by ADR-040/IDENTITY; note supersession, archive                                                                                                                  |
| `identity-doctrine-alignment.md`                                                                                                                                                                                                                                                                                                                                                                                                                      | EXTRACT→ARCHIVE                      | durable truth already in ADR-038/040 + IDENTITY.md                                                                                                                                  |
| `ir-and-runtime-validator-remediation.md`                                                                                                                                                                                                                                                                                                                                                                                                             | KEEP-until-H6-lands                  | documents the H6 deferral the active plan resolves; archive after                                                                                                                   |
| `json-schema-parser.md`                                                                                                                                                                                                                                                                                                                                                                                                                               | EXTRACT→ARCHIVE                      | extract the egress-normal-form truth → it is already in **ADR-042**; verify, then archive                                                                                           |
| `oas-3.2-full-feature-support.md`, `oas-3.2-version-plumbing.md`, `phase-a2-type-migration.md`, `phase-4-json-schema-and-parity.md`                                                                                                                                                                                                                                                                                                                   | EXTRACT→ARCHIVE                      | OAS 3.2 truth → ADR-044/045/046 + roadmap; verify, then archive                                                                                                                     |
| `3.3a-01…08`, `3.3b-01…07` (remaining)                                                                                                                                                                                                                                                                                                                                                                                                                | EXTRACT→ARCHIVE (batch)              | doctrine already in ADR-026/033/034/035; the queue-mirror duplicates in `archive/session-3.3-…` can be **DELETE**d                                                                  |
| `int64-bigint-…`, `recursive-wrapper-…`, `recursive-unknown-key-…`, `zod-defect-quarantine-…`, `type-safety-remediation(+follow-up)`, `eperusteet-real-spec-validation`, `format-specific-drift-remediation`, `anchor…`, `proof-system-and-doctrine-remediation`, `architecture-review-packs`, `core-agent-system…`, `core-vs-companion…`, `practice-core-integration…`, `doctor-*`, `feature-parity-…`, `openapi3-ts-dependency-exit`, `recursive-*` | EXTRACT→ARCHIVE (batched by cluster) | most durable truth already in ADRs 038/039/040/041/043; run the Deletion Test per cluster, then archive                                                                             |

### `current/paused/` (1) · `future/` (6) · `archive/` (25)

| Group                                                 | Disposition                                                                                                                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `current/paused/README.md`                            | KEEP                                                                                                                                                                         |
| `future/*` (6)                                        | KEEP — genuine later-scope (oak-adapter replacement, ecosystem expansion, temporal-first, gemini-antigravity). _(These are the legitimate "future" deferrals; leave as-is.)_ |
| `archive/session-3.3-queue-mirrors/*` (11 tiny stubs) | **DELETE** — pure duplicates of `current/complete/3.3a-*`/`3.3b-*` (verified: 350-900 byte mirror stubs)                                                                     |
| `archive/zod-limitations-historical-cluster/*` (4)    | KEEP as history, but **the permanent `docs/architecture/zod-round-trip-limitations.md` must be updated to disclose the C6 keyword defects** (it currently does not)          |
| other `archive/*`                                     | KEEP (already archived history)                                                                                                                                              |

## 5. Extraction map (durable truth → its contract-correct permanent home)

| Durable truth currently trapped in plans                                                                                                                                    | Permanent home                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Fail-fast → `.refine()` Zod-keyword decision + per-keyword disposition                                                                                                      | **ADR-047** (created)                                                                                |
| C6 keyword no-ops/incorrect refinements (until fixed)                                                                                                                       | `docs/architecture/zod-round-trip-limitations.md` (add a "Known defects" section)                    |
| `architecture-review-packs` pack verdicts (red, partial)                                                                                                                    | a short permanent `docs/architecture/` audit note (or fold into the roadmap "current truth" section) |
| Real Zod/TS format-tension table (post-ADR-047 truth)                                                                                                                       | `docs/architecture/` (a permanent format-tensions doc) — not a plan                                  |
| Genuine deferred capabilities (external `$ref`, `$anchor`/`$dynamicRef` runtime resolution, codecs, `.overwrite()`, `itemSchema` downstream targets, custom portable types) | `roadmap.md` "Deferred" section (keep accurate) + the new `future/` plans below                      |

## 6. New plans to author (atomic, doc-referencing — per the execution contract)

These re-author the **useful remaining work** (findings + genuine deferrals). They are **specs**; placement is the
user's decision (see the question accompanying this report). Each references permanent docs first and is the smallest
useful slice.

**Remediation (derived from findings; sequence = report `09`):**

1. **`packaging-and-types-integrity`** — C1. Fix inherited `noEmit`, emit `.d.ts` at the `types` paths, repoint
   `./parsers/zod`; add a `publint` + `@arethetypeswrong/cli` gate to `pnpm qg`. _Highest leverage; lowest risk._
2. **`ir-fidelity-proof-harness`** — H7 + C2/C3/C4/H1/H2/H3/H4/M10. Add a round-trip/property suite covering the exact
   edge cases (empty `properties`, dotted component names, AND-security, `4XX`/`5XX`, boolean `exclusiveMinimum`,
   `contentEncoding`, `$ref` siblings, Draft-07 nested keywords) as failing-first tests, then fix each bug to green.
3. **`zod-2020-12-keyword-semantics`** — C6, executes **ADR-047**: implement semantic-or-fail-fast per keyword with
   executed-validator proofs; replace the `toContain('.refine(')` tests.
4. **`zod-parser-strict-whitelist`** — C5. Replace parser blacklists with whitelists; fail-fast (PARSE_ERROR) on any
   unrecognised union/tuple/enum member or chained method.
5. **`single-source-type-guards`** — M3/C4. Consolidate the four `isRecord` (and two `isCastrSchema`) to one correct
   definition (accepts `{}`); this also fixes the C4 round-trip throw.
6. **`doctrine-enforcement-truthing`** — M1/M2/L1/L2 (per the strictest-normalisation rule): add lint rules so the
   `Object.*`/`Reflect.*` and ADR-026 lodash-form bans are enforced; reconcile `principles.md`/ADR-026 wording
   (⚠️ needs user approval for doctrine edits).
7. **`test-hygiene`** — M4/M5. Remove fs-IO and global-`console` mutation from in-process tests.

**Genuine future deferrals (consolidate scattered paused/archived investigations into clean `future/` plans):** 8. **`reference-resolution-runtime`** — external `$ref`, `$anchor`, `$dynamicRef`/`$dynamicAnchor` runtime resolution
(consolidates the three paused `zod-limitations-historical-cluster` investigations + `anchor…` Remaining Work).

## 7. What this buys

After execution: `active/` has one obvious entrypoint; durable decisions live in ADRs/docs (ADR-047 + the disclosures
above); the stale/contradictory headers are corrected; the duplicate stubs are gone; and the remaining work is a small
set of atomic, truthful plans that reference permanent docs — i.e. the plan surface finally obeys the repo's own
"strict and complete everywhere, all the time" contract.
