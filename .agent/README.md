# .agent Directory - Navigation Guide

**Purpose:** Documentation and planning for @engraph/castr  
**Last Updated:** 6 September 2026

---

## 🚀 Getting Started

**New to this project?** Start with the local agent entrypoint:

→ **[directives/AGENT.md](directives/AGENT.md)** — Stable operational index for agents

Then use:

→ **[prompts/session-continuation.prompt.md](prompts/session-continuation.prompt.md)** — Context bridge between sessions

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

The [Practice vision](directives/PRACTICE-VISION.md) names its beneficiaries and fitness frame.

**Read `IDENTITY.md` first** — it defines what Castr is and what it is not. Then read `principles.md` for the Cardinal Rule and engineering principles.

---

## Current State

The [Practice bridge](practice-index.md) connects permanent doctrine to the
[programme parent](plans/proof-programme/parent-plan.md), the sole execution queue,
and the [delivery ledger](plans/delivery-ledger.md), the current PR record.
The platform-neutral autonomous-development experiment is paused; its Claude
Routine is disabled, owner-confirmed September 6, 2026. Separate
[owner-directed documentation work](plans/current/complete/plan-estate-and-documentation-refresh.md)
does not resume it.

The [roadmap](plans/roadmap.md) and
[repo continuity](memory/operational/repo-continuity.md) route current, paused and
future work. Read these instead of inferring support or priorities from dated
completion records. The former April status block and navigation guide are
[conserved verbatim](memory/operational/archive/entry-paths-2026-09-06.md).

The [identity](IDENTITY.md) and both visions define the ratified application
contract and Practice direction. Intended roots and facets are distinct from
implemented APIs and independently proven behaviour.

---

## 📁 Directory Structure

```text
.agent/
├── directives/            ← Foundation documents
│   ├── VISION.md              ← Umbrella and Castr vision
│   ├── PRACTICE-VISION.md     ← Practice vision
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
│   └── session-continuation.prompt.md ← Context bridge between sessions
│
├── skills/                 ← Canonical skills
├── sub-agents/             ← Canonical reviewer and domain-expert templates
├── practice-core/          ← Portable Practice Core package
├── memory/                 ← Napkin, distilled learnings, code patterns
├── experience/             ← Qualitative experience records
├── collaboration/          ← Tracked collaboration homes (ARC rapid-comms channels, experiments)
├── state/                  ← Instance-tier runtime state (collaboration registry/comms; two-tier tracked/untracked)
│
├── plans/
│   ├── roadmap.md               ← Impact map; programme parent owns the queue
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

Local Git hooks are active via Husky: `pre-commit` formats staged files with Prettier and `pre-push` runs `pnpm check:ci`.

---

**Cardinal Rule:** The IR is the single source of truth. After parsing, input documents are conceptually discarded — only the IR matters.
