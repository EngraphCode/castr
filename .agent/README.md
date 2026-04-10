# .agent Directory - Navigation Guide

**Purpose:** Documentation and planning for @engraph/castr  
**Last Updated:** April 2026

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

**Read `IDENTITY.md` first** — it defines what Castr is and what it is not. Then read `principles.md` for the Cardinal Rule and engineering principles.

---

## 🎯 Current State (April 2026)

- **Identity:** [`IDENTITY.md`](IDENTITY.md) is the canonical identity document — Castr is a schema compiler with closed-world, strict-only object semantics
- **Operating Philosophy:** strict and complete everywhere, all the time — code, proofs, docs, plans, and prompts must agree before a support claim is honest
- **Quality Gates:** canonical chain defined in `.agent/directives/DEFINITION_OF_DONE.md`
  - Last recorded full repo-root sweep (including `test:e2e`): green on Friday, 10 April 2026
  - `test:e2e` is now part of the canonical gate chain (`pnpm qg`); `test:scalar-guard` remains off-chain and green
  - Phase A₂ is closed on Friday, 10 April 2026: AP4 landed honestly, `pnpm qg` / `pnpm madge:circular` / `pnpm knip` are green, the targeted active-surface `openapi3-ts` grep is clean, and the reviewer loop closed with no open findings
  - Immediate priority in a fresh session is to reproduce any user-reported failures first
- **Architecture:** IR-based product architecture plus canonical-first local Practice structure
- **Workspace boundary:** `lib` / `@engraph/castr` is the core compiler surface (parsers, IR, writers, validation, metadata). Any future typed fetch, runtime handler, framework, or code-first integrations belong in companion workspaces, not core exports.
- **Architecture Review Sweep:** Seven-pack post-IDENTITY bounded audit — all findings closed
  - Sweep record (staged completion record): [`.agent/plans/current/complete/architecture-review-packs.md`](plans/current/complete/architecture-review-packs.md)
  - Cross-pack triage: [`.agent/research/architecture-review-packs/cross-pack-triage.md`](research/architecture-review-packs/cross-pack-triage.md)
  - RC-1 through RC-7: all resolved
- **JSON Schema Parser Expansion** (completed Tuesday, 25 March 2026):
  - `parseJsonSchemaDocument()` expanded from `$defs`-only extractor to full document parser
  - Supports standalone schemas, `$defs` bundles, and mixed documents
  - Unsupported keywords explicitly rejected with `UnsupportedJsonSchemaKeywordError`
  - Standalone fixture and `writeJsonSchemaDocument` ↔ `parseJsonSchemaDocument` round-trip proofs
  - 29 unit tests, 520 transform tests, 4 E2E tests — all green
  - Historical remediation context record: [`.agent/plans/current/complete/json-schema-parser.md`](plans/current/complete/json-schema-parser.md)
- **Schema Completeness Arc** (completed Sunday, 30 March 2026):
  - Phase 1: all 9 Zod implementation-gap fail-fast guards upgraded to semantic `.refine()` closures
  - Phase 1.5: all four TypeScript ❓ markers resolved
  - Phase 2: `$anchor`, `$dynamicRef`, and `$dynamicAnchor` added to the IR with parser/writer coverage and fail-fast handling where genuinely impossible
  - Input-Output Pair Compatibility Model established as governing doctrine
- **Current OpenAPI truth:** the shared preparation boundary now canonicalises accepted OpenAPI documents to `3.2.0`; native OAS 3.2 input is accepted, and OpenAPI 3.1.x remains a documented Scalar bridge input
- **Plan-state truth:** the primary active plan is [`.agent/plans/active/oas-3.2-full-feature-support.md`](plans/active/oas-3.2-full-feature-support.md) — OAS 3.2-only feature expansion across the IR, parsers, and writers; the Phase A₂ closure record is [`.agent/plans/current/complete/phase-a2-type-migration.md`](plans/current/complete/phase-a2-type-migration.md); landed version baseline is [`.agent/plans/current/complete/oas-3.2-version-plumbing.md`](plans/current/complete/oas-3.2-version-plumbing.md)
- **Immediate next slice:** run a read-only reviewer/domain-expert pass over the recent Phase A₂ close-out and docs-consolidation changes, then re-check or explicitly defer the pending MCP no-params tool-input-schema follow-up before opening OAS 3.2 feature phases B/C
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
│   └── session-continuation.prompt.md ← Context bridge between sessions
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

**Cardinal Rule:** The IR is the single source of truth. After parsing, input documents are conceptually discarded — only the IR matters.
