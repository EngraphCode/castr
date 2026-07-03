---
title: 'Validation Strategy'
status: seeded-stub
last_updated: 2026-07-03
---

# Validation Strategy

> **Seeded stub (brought from Oak live main 2026-07-03, localised).** The
> spine — test / evaluate / assure — and the risk-tiered assurance frame are
> ratified upstream (Oak owner, 2026-06-23); the finer internal taxonomy is
> **deliberately deferred** until real eval experience exists to write from
> (resist premature crystallisation). castr currently exercises only the
> Test leg; this directive exists so evaluation- or assurance-shaped work
> starts from the ratified frame instead of inventing one. The upstream
> reasoning lives in Oak's evals-and-assurance position report
> (2026-06-23), read on demand from the Oak checkout.

## The spine: test / evaluate / assure

- **Test** — _deterministic_. Proves code does what its spec says. Binary,
  reproducible; unit of truth is the assertion. This is all of
  [testing-strategy.md](testing-strategy.md), which stays **authoritative for
  the whole Test leg** (taxonomy, shape rules, TDD discipline). Mutation
  testing (Stryker, planned in castr) is the meta-quality layer that makes
  test coverage meaningful.
- **Evaluate** — _probabilistic_. Measures the value and reliability of a
  judgement-laden capability across realistic inputs, graded relative to a
  baseline. Unit of truth is a graded outcome over a corpus plus a
  with/without delta. Assertions are authored _after_ the first run (this
  inverts test-first). In castr this leg applies to judgement-laden agentic
  surfaces (skills, sub-agents, prompts), not to the deterministic
  parser→IR→writer pipeline — pipeline correctness is Test-leg work.
- **Assure** — the umbrella trust case: composes test + evaluate +
  conformance + human review into ongoing evidence that the capability is
  fit for the world.

**Describe the outcome you want; never audit the implementation choice** is
the continuity across all three — the same discipline as
testing-strategy.md's "prove behaviour, never config or content" umbrella.

## Assurance tiers (risk-tiered, keyed on harm asymmetry)

Rigour is proportionate to the harm of getting it wrong — not uniform, and
not keyed on surface type. castr's tier examples:

| Tier         | Applies to                                                                                                                                                             | Assurance floor                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Critical** | Silent contract corruption — lossless/fidelity claims on the IR, emitted Zod/TypeScript/OpenAPI/MCP outputs whose errors propagate invisibly into downstream consumers | Behaviour-proof suites end to end (transform/snapshot/gen/e2e) + determinism proofs + human review on the claim surface |
| **Standard** | User-facing surfaces where errors are visible and correctable — the CLI, error messages, the MCP tool-emission surface                                                 | Tests + conformance against the claimed spec surface                                                                    |
| **Light**    | Internal / agent-facing where harm is cheap and self-correcting — agent-tools, scaffolding, internal validators                                                        | Tests + spot checks; evals optional                                                                                     |

## Eval home

Evaluation **definitions are always version-controlled in-repo** with the
artefact they grade; a runner is execution, never the source of truth. When
castr grows an eval-shaped surface (skill evals, MCP-tool-surface evals via
an external runner such as MCPJam), its suite definition lands in-repo and
is reviewed in PRs.

## The real-world loop (non-negotiable closure)

Test / evaluate / assure is an **internal-confidence triad** — every layer
grades against an expectation _we_ authored. It only becomes trustworthy
when closed against a real-world signal of value. castr's near-term
real-world signals are downstream-consumer reality: real-world OpenAPI /
JSON Schema corpora as fixture sources, and the Oak harness integration
(testing-strategy.md §Acceptance Test Layers, layer 6). castr has no usage
telemetry; if one is added, eval corpora should be seeded from real usage
distributions so the loop is structural, not bolted on.

## What is not eval-shaped

Diffuse, long-horizon, cultural capability (doctrine, planning discipline,
collaboration) does not decompose into `prompt → graded output`. It takes a
different instrument (retrospective, experience corpus), not a forced eval
suite. Forcing eval-shape onto it is the mirror category error of treating
evals as tests.
