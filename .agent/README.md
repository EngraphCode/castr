# .agent Directory - Navigation Guide

**Purpose:** Documentation and planning for @engraph/castr  
**Last Updated:** March 2026

---

## 🚀 Getting Started

**New to this project?** Start with the local agent entrypoint:

→ **[directives/AGENT.md](directives/AGENT.md)** — Stable operational index for agents

Then use:

→ **[prompts/session-entry.prompt.md](prompts/session-entry.prompt.md)** — Current session entrypoint and active workstream

---

## 📚 Foundation Documents (Directives)

| Document                                                  | Purpose                                   | Key Question                      |
| --------------------------------------------------------- | ----------------------------------------- | --------------------------------- |
| [IDENTITY.md](IDENTITY.md)                                | Canonical identity, semantics, and policy | _What is Castr?_                  |
| [VISION.md](directives/VISION.md)                         | Strategic direction                       | _Where are we going?_             |
| [requirements.md](directives/requirements.md)             | Decision guidance                         | _How should I decide?_            |
| [principles.md](directives/principles.md)                 | Engineering standards                     | _What does excellence look like?_ |
| [testing-strategy.md](directives/testing-strategy.md)     | TDD & test methodology                    | _How do we prove correctness?_    |
| [DEFINITION_OF_DONE.md](directives/DEFINITION_OF_DONE.md) | Quality gates                             | _How do we verify we're done?_    |

**Read `IDENTITY.md` first** — it defines what Castr is and what it is not. Then read `principles.md` for the Cardinal Rule and engineering principles.

---

## 🎯 Current State (March 2026)

- **Identity:** [`IDENTITY.md`](IDENTITY.md) is the canonical identity document — Castr is a schema compiler with closed-world, strict-only object semantics
- **Operating Philosophy:** strict and complete everywhere, all the time — code, proofs, docs, plans, and prompts must agree before a support claim is honest
- **Quality Gates:** canonical chain defined in `.agent/directives/DEFINITION_OF_DONE.md`
  - Last reproduced full repo-root sweep (including `test:e2e`): green on Monday, 23 March 2026
  - `test:e2e` is now part of the canonical gate chain (`pnpm qg`); `test:scalar-guard` remains off-chain and green
  - Immediate priority in a fresh session is to reproduce any user-reported failures first
- **Architecture:** IR-based product architecture plus canonical-first local Practice structure
- **Current Review Sweep Record:** Architecture Review Packs — post-IDENTITY bounded audit
  - Sweep record: [`.agent/plans/active/architecture-review-packs.md`](plans/active/architecture-review-packs.md)
  - Historical sweep prompt: [`.agent/prompts/architecture-review-packs.prompt.md`](prompts/architecture-review-packs.prompt.md)
  - Immediate predecessor: [`.agent/plans/current/complete/identity-doctrine-alignment.md`](plans/current/complete/identity-doctrine-alignment.md)
  - Paused successor: [`.agent/plans/current/paused/json-schema-parser.md`](plans/current/paused/json-schema-parser.md)
  - Plan of record: [`.agent/plans/roadmap.md`](plans/roadmap.md)
- **Most Recent Review Note:** [`.agent/research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md`](research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md)
- **Historical Final-Pack Prompt:** [`.agent/prompts/pack-7-proof-system-and-durable-doctrine.prompt.md`](prompts/pack-7-proof-system-and-durable-doctrine.prompt.md)
- **Current Review State:** Seven-pack sweep complete (Pack 1 `yellow`; Packs 2–7 `red`); RC-1/RC-2 (proof-system and durable-doctrine remediation) complete; RC-3 (IR and runtime validator remediation) is proposed in `active/`
- **Proposed Active Plan:** [ir-and-runtime-validator-remediation.md](plans/active/ir-and-runtime-validator-remediation.md) — RC-3, awaiting review
- **Latest Completed Implementation Slice:** Proof-System and Doctrine Remediation (RC-1/RC-2, verified Monday 23 March 2026)
  - `unknownKeyBehavior` removed from IR, parsers, and writers
  - parser-layer `additionalProperties` honesty restored for non-object schemas
  - public strictness/compatibility surfaces removed
  - `CastrSchemaProperties` runtime detection made brand-based and cross-realm safe
  - full repo-root Definition of Done chain green
  - Completed predecessor slices:
    - `.agent/plans/current/complete/doctor-rescue-loop-runtime-redesign.md`
    - `.agent/plans/current/complete/int64-bigint-semantics-investigation.md`
    - `.agent/plans/current/complete/strict-object-semantics-enforcement.md`
    - `.agent/plans/current/complete/recursive-unknown-key-semantics-remediation.md`
    - `.agent/plans/current/complete/zod-limitations-architecture-investigation.md`
    - `.agent/plans/current/complete/recursive-unknown-key-preserving-zod-emission-investigation.md`
    - `.agent/plans/current/complete/transform-proof-budgeting-and-runtime-architecture-investigation.md`
- **Installed Agent Layer:** canonical templates in `.agent/sub-agents/` with Codex project agents in `.codex/config.toml` and `.codex/agents/`

---

## 📁 Directory Structure

```text
.agent/
├── directives/            ← Foundation documents
│   ├── VISION.md              ← Strategic direction
│   ├── principles.md               ← Engineering standards (extensive)
│   ├── requirements.md        ← Decision-making guide
│   ├── testing-strategy.md    ← Test methodology
│   └── DEFINITION_OF_DONE.md  ← Quality gates
│
├── acceptance-criteria/   ← Formal acceptance criteria (checklists)
│   ├── openapi-acceptance-criteria.md
│   ├── json-schema-and-parity-acceptance-criteria.md
│   ├── zod-output-acceptance-criteria.md
│   └── zod-parser-acceptance-criteria.md
│
├── prompts/
│   ├── architecture-review-packs.prompt.md ← Historical review-sweep prompt
│   ├── pack-7-proof-system-and-durable-doctrine.prompt.md ← Historical final-pack prompt
│   ├── session-entry.prompt.md  ← Current session entrypoint
│   └── start-right.prompt.md    ← Re-anchor on doctrine and architecture
│
├── commands/               ← Canonical command workflows
├── skills/                 ← Canonical skills
├── sub-agents/             ← Canonical reviewer and domain-expert templates
├── practice-core/          ← Portable Practice Core package
├── practice-context/       ← Optional exchange support context
├── memory/                 ← Napkin, distilled learnings, code patterns
├── experience/             ← Qualitative experience records
│
├── plans/
│   ├── roadmap.md               ← Ties all plans together (plan-of-record)
│   ├── active/                  ← Primary active plan plus any explicit parked-in-place exception
│   ├── current/                 ← Current plan state containers
│   │   ├── paused/              ← Incomplete but non-primary workstreams
│   │   └── complete/            ← Completed atomic plans (staged; archive in batches)
│   ├── future/                  ← Planned future work (Roadmap Phase 4+)
│   └── archive/                 ← Archived plan groups (completed)
│
├── reference/                   ← Permanent reference material
├── research/                    ← Historical research documents
├── rules/                       ← Canonical operationalized doctrine
└── practice-index.md            ← Bridge from portable Core to local artefacts
```

---

## 🔗 Key External Documentation

| Location                               | Contents                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `docs/`                                | User-facing API docs, guides, examples                                    |
| `docs/architectural_decision_records/` | ADRs with [SUMMARY.md](../docs/architectural_decision_records/SUMMARY.md) |
| `docs/architecture/`                   | Technical architecture docs                                               |
| `docs/guides/`                         | Migration and usage guides                                                |

---

## ⚡ Quick Commands

```bash
# CI-style (non-mutating) verification
pnpm check:ci

# Local verification (may mutate to fix formatting / safe lint autofixes)
pnpm check

# Structural Practice and adapter validation
pnpm portability:check
```

---

**Cardinal Rule:** The IR is the single source of truth. After parsing, input documents are conceptually discarded—only the Caster Model matters.
