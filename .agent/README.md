# .agent Directory - Navigation Guide

**Purpose:** Documentation and planning for @engraph/castr  
**Last Updated:** February 2026

---

## 🚀 Getting Started

**New to this project?** Start with the session entry prompt:

→ **[prompts/session-entry.prompt.md](prompts/session-entry.prompt.md)** — Exhaustive context for new sessions

---

## 📚 Foundation Documents (Directives)

| Document                                                  | Purpose                | Key Question                      |
| --------------------------------------------------------- | ---------------------- | --------------------------------- |
| [VISION.md](directives/VISION.md)                         | Strategic direction    | _Where are we going?_             |
| [requirements.md](directives/requirements.md)             | Decision guidance      | _How should I decide?_            |
| [RULES.md](directives/RULES.md)                           | Engineering standards  | _What does excellence look like?_ |
| [testing-strategy.md](directives/testing-strategy.md)     | TDD & test methodology | _How do we prove correctness?_    |
| [DEFINITION_OF_DONE.md](directives/DEFINITION_OF_DONE.md) | Quality gates          | _How do we verify we're done?_    |

**Read `RULES.md` first** — it contains the Cardinal Rule and engineering principles.

---

## 🎯 Current State (February 2026)

- **Quality Gates:** 10/10 passing (1,010+ tests)
- **Architecture:** IR-based with canonical structure
- **Active Work:** Session 3.3 (strictness remediation + strict Zod-layer round-trip proofs)
  - Plan of record: `.agent/plans/roadmap.md`
  - Atomic plans (execute): `.agent/plans/current/*`

---

## 📁 Directory Structure

```text
.agent/
├── directives/            ← Foundation documents
│   ├── VISION.md              ← Strategic direction
│   ├── RULES.md               ← Engineering standards (extensive)
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
│   ├── session-entry.prompt.md  ← Start here for new sessions
│   └── start-right.prompt.md    ← Quick reference
│
├── plans/
│   ├── roadmap.md               ← Ties all plans together (plan-of-record)
│   ├── active/                  ← Single next atomic plan to execute
│   ├── current/                 ← Queued atomic plans (linear execution steps)
│   │   └── complete/            ← Completed atomic plans (staged; archive in batches)
│   ├── future/                  ← Planned future work (Roadmap Phase 4+)
│   └── archive/                 ← Archived plan groups (completed)
│
├── reference/                   ← Permanent reference material
├── research/                    ← Historical research documents
└── rules/                       ← Cursor/IDE rules
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
