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
  - Last reproduced full repo-root sweep: green on Thursday, 20 March 2026
  - The completed doctor rescue-loop redesign slice reran the full Definition of Done chain green on Thursday, 20 March 2026
  - Immediate priority in a fresh session is to reproduce any user-reported failures first, then select the next honest atomic slice from the paused investigations
- **Architecture:** IR-based product architecture plus canonical-first local Practice structure
- **Primary Active Work:** next-slice selection (rescue-loop redesign complete)
  - Plan of record: `.agent/plans/roadmap.md`
  - Completed plan: `.agent/plans/active/zod-limitations-next-atomic-slice-planning.md`
  - The rescue-loop redesign (All-Errors Preflight Batch Rescue) landed on Thursday, 20 March 2026:
    - `rescueRetryCount` reduced from `1,159` to `1`
    - `nonStandardRescue` reduced from `20,770ms` to `31.79ms`
    - `pnpm test:transforms` reduced from `25.88s` to `6.92s` real
    - doctor-proof timeout reduced from `60s` to `10s`
  - The earlier adjacent predecessor `.agent/plans/current/complete/int64-bigint-semantics-investigation.md` remains complete and green
  - Review closure for completed slices was performed manually in-session using the reviewer templates, not nested reviewer runs
  - Paused umbrella context: `.agent/plans/current/paused/zod-limitations-architecture-investigation.md`
  - Paused supporting investigations:
    - `.agent/plans/current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md`
    - `.agent/plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md`
  - Completed adjacent remediation:
    - `.agent/plans/current/complete/int64-bigint-semantics-investigation.md`
    - `.agent/plans/current/complete/strict-object-semantics-enforcement.md`
    - `.agent/plans/current/complete/recursive-unknown-key-semantics-remediation.md`
- **Installed Agent Layer:** canonical templates in `.agent/sub-agents/` with Codex project agents in `.codex/config.toml` and `.codex/agents/`
- **Recent Completed Operational Slices:**
  - `.agent/plans/current/complete/core-agent-system-and-codex-agent-adapters.md`
  - `.agent/plans/current/complete/practice-core-integration-and-practice-restructuring.md`

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
