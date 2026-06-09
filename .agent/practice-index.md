# Practice Index

This file bridges the portable Practice Core and this repo's local artefacts.
It is **not** part of the travelling practice-core package.

For the portable Core, see [practice-core/index.md](practice-core/index.md).

Local shorthand for this repo: strict and complete everywhere, all the time. Code, doctrine, plans, prompts, and proofs must agree before a support claim is honest.

## Directives

| Directive                                                                                   | Purpose                                   |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [IDENTITY.md](IDENTITY.md)                                                                  | Canonical identity, semantics, and policy |
| [AGENT.md](directives/AGENT.md)                                                             | Operational entry point for agents        |
| [principles.md](directives/principles.md)                                                   | Authoritative engineering doctrine        |
| [testing-strategy.md](directives/testing-strategy.md)                                       | Test methodology and TDD rules            |
| [requirements.md](directives/requirements.md)                                               | Decision guidance and semantic contract   |
| [DEFINITION_OF_DONE.md](directives/DEFINITION_OF_DONE.md)                                   | Canonical quality-gate protocol           |
| [metacognition.md](directives/metacognition.md)                                             | Reflection discipline before planning     |
| [architectural-file-system-structure.md](directives/architectural-file-system-structure.md) | Structural repo architecture guidance     |

## Architectural Decisions

| ADR                                                                                                                        | Subject                                    |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [ADR-026](../docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md)                            | No string manipulation for parsing         |
| [ADR-031](../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)                                           | Zod 4 output strategy                      |
| [ADR-032](../docs/architectural_decision_records/ADR-032-zod-input-strategy.md)                                            | Zod 4 input strategy                       |
| [ADR-035](../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)                                   | Transform validation parity                |
| [ADR-038](../docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md)                                  | Object unknown-key semantics               |
| [ADR-039](../docs/architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)               | UUID subtype semantics                     |
| [ADR-040](../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)       | Strict object ingest/output doctrine       |
| [ADR-041](../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md) | Native-capability seam doctrine            |
| [ADR-042](../docs/architectural_decision_records/ADR-042-json-schema-egress-normal-form.md)                                | JSON Schema egress normal form             |
| [ADR-043](../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)                                  | Core-vs-companion workspace boundary       |
| [ADR-044](../docs/architectural_decision_records/ADR-044-drop-openapi3-ts-adopt-scalar-types.md)                           | Drop openapi3-ts, adopt Scalar types       |
| [ADR-045](../docs/architectural_decision_records/ADR-045-strict-reexport-module-openapi-types.md)                          | Strict re-export module pattern            |
| [ADR-046](../docs/architectural_decision_records/ADR-046-separate-storage-additional-operations.md)                        | Separate `additionalOperations` IR storage |

## Tools and Workflows

| Tool                                                                        | Purpose                                                                 |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [start-right-quick](skills/start-right-quick/SKILL-CANONICAL.md)            | Re-anchor on doctrine, context, and the current entrypoint              |
| [start-right-thorough](skills/start-right-thorough/SKILL-CANONICAL.md)      | Deep re-anchor after a context switch or long gap                       |
| [gates](skills/gates/SKILL-CANONICAL.md)                                    | Run the full canonical quality-gate chain                               |
| [plan](skills/plan/SKILL-CANONICAL.md)                                      | Create or revise a decision-complete plan                               |
| [consolidate-docs](skills/consolidate-docs/SKILL-CANONICAL.md)              | Promote durable truth, audit cohesion, and integrate practice learnings |
| [napkin](skills/napkin/SKILL-CANONICAL.md)                                  | Continuous capture stage of the knowledge flow                          |
| [invoke-reviewers](rules/invoke-reviewers.md)                               | Installed reviewer and domain-expert invocation contract                |
| [quality-gate-failures](rules/quality-gate-failures.md)                     | All gate failures are blocking                                          |
| [tdd](rules/tdd.md)                                                         | TDD applies at all levels                                               |
| [napkin](rules/napkin.md)                                                   | Keep the learning loop's capture stage active                           |
| [input-output-pair-compatibility](rules/input-output-pair-compatibility.md) | Feature support is defined by the input-output pair                     |
| [`.codex/config.toml`](../.codex/config.toml)                               | Codex project-agent registration for installed reviewers and experts    |

## Artefact Directories

| Location                                  | What lives there                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`.agent/directives/`](directives/)       | Doctrine and operational entrypoints                                                     |
| [`.agent/prompts/`](prompts/)             | Session continuation context bridge                                                      |
| [`.agent/skills/`](skills/)               | Canonical skills                                                                         |
| [`.agent/rules/`](rules/)                 | Operationalized doctrine                                                                 |
| [`.agent/sub-agents/`](sub-agents/)       | Canonical reviewer and domain-expert prompt architecture                                 |
| [`.agent/plans/`](plans/)                 | Active, paused, completed, archived, and future plans                                    |
| [`.agent/memory/`](memory/)               | Napkin, distilled learnings, and code-pattern scaffolding                                |
| [`.agent/experience/`](experience/)       | Experience records                                                                       |
| [`.agent/practice-core/`](practice-core/) | Portable Practice Core package                                                           |
| [`.husky/`](../.husky/)                   | Repo-local Git hooks; `pre-commit` formats staged files, `pre-push` runs `pnpm check:ci` |
| [`.agents/skills/`](../.agents/skills/)   | Generated `engraph-` skill adapters for Codex and other platforms                        |
| [`.cursor/`](../.cursor/)                 | Cursor-specific wrappers and settings                                                    |
| [`.codex/`](../.codex/)                   | Codex project-agent registration and thin reviewer/expert adapters                       |
| [`.codex/agents/`](../.codex/agents/)     | Thin Codex project-agent adapters pointing back to canonical templates                   |
