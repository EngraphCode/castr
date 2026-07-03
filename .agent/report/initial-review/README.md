# Initial Deep Review — @engraph/castr

**Date:** 2026-06-04
**Scope:** Whole repository (1,063 tracked files; ~40k LOC of product TypeScript across parsers, IR, writers, context, rendering, shared, CLI).
**Branch / commit:** `main` @ `393e476`.
**Reviewer:** Claude (Opus 4.8, 1M context), driving a 14-agent discovery workflow as a _candidate generator_ only.

---

## What this report is

A comprehensive, **independently verified** review of the castr codebase against its own stated doctrine
(`.agent/directives/principles.md`, `testing-strategy.md`, `DEFINITION_OF_DONE.md`, the ADRs, and the README/API docs).

The governing constraint for this review was: **every load-bearing claim is verified first-hand against source — by
executing the built `dist`, running the quality gates, or reading the exact cited lines. No agent assertion is reported
as fact on its own; candidate findings that did not survive verification are recorded as rejected.**

## How to read it

Start with `00-executive-summary.md`. Then the per-severity finding catalogue (`02`–`05`) is the authoritative,
one-entry-per-finding source of truth. The thematic documents (`06`, `07`) synthesise cross-cutting patterns and
reference finding IDs rather than re-describing them. `08` lists what was rejected (trust calibration). `09` is the
remediation roadmap. `10` is the complete inventory mapping every one of the 86 raw discovery candidates to a
disposition, so nothing is left out. `appendix-A` contains the reproductions so any claim can be re-run.

| File                                 | Contents                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `00-executive-summary.md`            | Headline, the single root cause, the top findings, the bottom line                                       |
| `01-methodology-and-verification.md` | How the review was run; gate results; the verification legend; dedup (86 → distinct)                     |
| `02-findings-critical.md`            | C1–C6 — reproduced by executing the shipped pipeline                                                     |
| `03-findings-high.md`                | H1–H7                                                                                                    |
| `04-findings-medium.md`              | M1–M12                                                                                                   |
| `05-findings-low-and-nit.md`         | L1–L18, N1                                                                                               |
| `06-doctrine-conformance.md`         | Doctrine-vs-enforcement matrix (escape hatches, ADR-026, `as`-in-tests, governed disables)               |
| `07-test-quality-and-proof-gaps.md`  | The partial-proof pattern that masks the bugs; per-test defects                                          |
| `08-rejected-and-downgraded.md`      | Candidates verified to be non-issues or over-stated (R1–R9)                                              |
| `09-remediation-roadmap.md`          | Prioritised, sequenced fixes; the highest-leverage gate additions                                        |
| `10-complete-inventory.md`           | All 86 raw candidates → canonical ID → disposition → verification method                                 |
| `11-plans-reconciliation.md`         | Plans ↔ findings: P1-P9, coverage gaps, full disposition of all 80 plans, extraction map, new-plan specs |
| `appendix-A-reproductions.md`        | Probe scripts, their actual output, and the gate run                                                     |

Companion artefact: `docs/architectural_decision_records/ADR-047-zod-2020-12-keyword-emission-strategy.md` (draft) retro-documents the fail-fast→`.refine()` reversal and mandates the compliant resolution.

## Verification legend (used throughout)

| Tag                  | Meaning                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 🟢 **ran code**      | I executed the compiled `dist` and observed the behaviour (most decisive)                                           |
| 🟢 **ran gate/tool** | I ran the project's own gate (`pnpm test`, `eslint`, `tsc`, etc.) and read the result                               |
| 🔵 **read source**   | I read the exact cited lines and surrounding logic                                                                  |
| 🟡 **mechanism**     | Same code path as a sibling case I executed; verified by reading the shared logic, not separately reproduced        |
| ⚪ **reported**      | Surfaced by the discovery sweep; included for completeness but not independently re-verified (kept to low/nit only) |

## Severity scale

- **Critical** — reachable through the public/shipped path; causes silent data corruption, security weakening, or a broken published artefact.
- **High** — reachable; real content loss / incorrect output / dishonest capability claim, but narrower blast radius.
- **Medium** — real defect on a secondary path, or latent (currently masked) but one refactor away from biting.
- **Low / Nit** — correctness-neutral drift, documentation/enforcement inconsistency, or cosmetic.

## Headline

All 14 quality gates pass green and the type/lint discipline is genuinely strong. **The defects live in the gaps the
gates do not cover** — and they cluster, with a single root cause: _shallow, boundary-only proofs that let real
losslessness/fail-fast/correctness bugs pass behind a green suite._ See `00` and `09`.

## Governing remediation principle

Per user directive (2026-06-04): **where code, proofs, and docs disagree, normalise to the _strictest_ of the three** —
always raise the other two up to the strict contract, never relax it. `06` and `09` are framed around this rule.

## A note on `principles.md`

`.agent/directives/principles.md` states at its top that it must not be edited without explicit user approval. This
report **documents** doctrine-vs-reality drift and recommends reconciliation, but makes no edits to the doctrine itself.
Under the strictest-normalisation rule, the only proposed doc edits are _tightenings_ (e.g. removing the test-`as`
permission `principles.md:970`, narrowing the `additionalProperties` type claim) where enforcement/code is already the
stricter party — those still require the user's explicit approval.
