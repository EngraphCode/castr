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

| Document                                                  | Purpose                | Key Question                      |
| --------------------------------------------------------- | ---------------------- | --------------------------------- |
| [VISION.md](directives/VISION.md)                         | Strategic direction    | _Where are we going?_             |
| [requirements.md](directives/requirements.md)             | Decision guidance      | _How should I decide?_            |
| [principles.md](directives/principles.md)                 | Engineering standards  | _What does excellence look like?_ |
| [testing-strategy.md](directives/testing-strategy.md)     | TDD & test methodology | _How do we prove correctness?_    |
| [DEFINITION_OF_DONE.md](directives/DEFINITION_OF_DONE.md) | Quality gates          | _How do we verify we're done?_    |

**Read `principles.md` first** — it contains the Cardinal Rule and engineering principles.

---

## 🎯 Current State (March 2026)

- **Quality Gates:** canonical chain defined in `.agent/directives/DEFINITION_OF_DONE.md`
- **Architecture:** IR-based product architecture plus canonical-first local Practice structure
- **Primary Active Work:** Zod round-trip limitations architecture investigation
  - Plan of record: `.agent/plans/roadmap.md`
  - Primary active plan: `.agent/plans/active/zod-limitations-architecture-investigation.md`
  - Active companions: `.agent/plans/active/transform-proof-budgeting-and-runtime-architecture-investigation.md`, `.agent/plans/active/recursive-unknown-key-semantics-remediation.md`
- **Recent Completed Operational Slice:** Practice Core integration and canonical-first restructuring
  - Completion record: `.agent/plans/current/complete/practice-core-integration-and-practice-restructuring.md`
  - Outcome: local-practice spine, canonical wrappers, and future Gemini / Antigravity planning are now installed

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
│   ├── zod-output-acceptance-criteria.md
│   └── zod-parser-acceptance-criteria.md
│
├── prompts/
│   ├── session-entry.prompt.md  ← Current session entrypoint
│   └── start-right.prompt.md    ← Re-anchor on doctrine and architecture
│
├── commands/               ← Canonical command workflows
├── skills/                 ← Canonical skills
├── practice-core/          ← Portable Practice Core package
├── practice-context/       ← Optional exchange support context
├── memory/                 ← Napkin, distilled learnings, code patterns
├── experience/             ← Qualitative experience records
│
├── plans/
│   ├── roadmap.md               ← Ties all plans together (plan-of-record)
│   ├── active/                  ← Single next atomic plan to execute
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
```

---

**Cardinal Rule:** The IR is the single source of truth. After parsing, input documents are conceptually discarded—only the Caster Model matters.
