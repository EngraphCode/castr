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
- **Active Work:** Phase 3.3a — Complexity Refactoring (35 lint violations remaining)

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
├── prompts/
│   ├── session-entry.prompt.md  ← Start here for new sessions
│   └── start-right.prompt.md    ← Quick reference
│
├── plans/
│   ├── roadmap.md               ← Current state & next steps
│   ├── archive/                 ← Completed plans
│   └── acceptance-criteria/     ← Acceptance criteria docs
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
# Verify quality gates
pnpm clean && pnpm install && pnpm build && pnpm type-check && pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && pnpm test:gen && pnpm character
```

---

**Cardinal Rule:** The IR is the single source of truth. After parsing, input documents are conceptually discarded—only the Caster Model matters.
