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
  - Last reproduced full repo-root sweep (including `test:e2e`): green on Friday, 28 March 2026
  - `test:e2e` is now part of the canonical gate chain (`pnpm qg`); `test:scalar-guard` remains off-chain and green
  - Immediate priority in a fresh session is to reproduce any user-reported failures first
- **Architecture:** IR-based product architecture plus canonical-first local Practice structure
- **Architecture Review Sweep:** Seven-pack post-IDENTITY bounded audit — all findings closed
  - Sweep record (archived): [`.agent/plans/current/complete/architecture-review-packs.md`](plans/current/complete/architecture-review-packs.md)
  - Cross-pack triage: [`.agent/research/architecture-review-packs/cross-pack-triage.md`](research/architecture-review-packs/cross-pack-triage.md)
  - RC-1 through RC-7: all resolved
- **JSON Schema Parser Expansion** (completed Tuesday, 25 March 2026):
  - `parseJsonSchemaDocument()` expanded from `$defs`-only extractor to full document parser
  - Supports standalone schemas, `$defs` bundles, and mixed documents
  - Unsupported keywords explicitly rejected with `UnsupportedJsonSchemaKeywordError`
  - Standalone fixture and `writeJsonSchemaDocument` ↔ `parseJsonSchemaDocument` round-trip proofs
  - 29 unit tests, 520 transform tests, 4 E2E tests — all green
  - Paused plan partially resolved: [`.agent/plans/current/paused/json-schema-parser.md`](plans/current/paused/json-schema-parser.md)
- **Schema Completeness Arc Phase 1** (completed Friday, 28 March 2026):
  - All 9 Zod fail-fast guards upgraded to semantic `.refine()` closures; zero 🐛 markers remaining
  - TS `booleanSchema: true` upgraded to `unknown`; all TS fail-fast error messages audited
  - Input-Output Pair Compatibility Model established as governing doctrine
- **Next critical-path work:** Phase 1.5 (resolve four ❓ TS markers in format tensions table) then Phase 2 (expand IR for `$anchor`, `$dynamicRef`, `$dynamicAnchor`)
- **Plan of record:** [`.agent/plans/roadmap.md`](plans/roadmap.md)
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
