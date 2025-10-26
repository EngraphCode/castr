# .agent Directory - Navigation Guide

**Purpose:** Comprehensive documentation for openapi-zod-client modernization project  
**Last Updated:** October 24, 2025

---

## 🚀 Quick Start (For Fresh Context)

**Read these in order:**

1. **`context/context.md`** - Start here! Living context document with current state
2. **`plans/00-STRATEGIC-PLAN.md`** - High-level strategic overview and phases
3. **`plans/01-CURRENT-IMPLEMENTATION.md`** - Detailed task breakdown for Phase 2
4. **`RULES.md`** - Coding standards (MUST follow)
5. **`DEFINITION_OF_DONE.md`** - Quality gate validation script

---

## 📁 Directory Structure

```
.agent/
├── README.md (this file)
│
├── context/                    # Current State & History
│   ├── context.md             # ⭐ LIVING DOCUMENT - Single source of truth
│   ├── SESSION_STATUS_OCT_24.md  # Detailed session notes
│   └── archive/               # Historical context docs
│       ├── CURRENT_LINT_OUTPUT.txt
│       ├── PHASE1_COMPLETE.md
│       └── [other historical docs]
│
├── plans/                      # Strategic & Implementation Plans
│   ├── 00-STRATEGIC-PLAN.md   # ⭐ High-level strategy, all phases
│   ├── 01-CURRENT-IMPLEMENTATION.md  # ⭐ Detailed Phase 2 tasks
│   └── archive/               # Old plans (reference only)
│       ├── 00-OVERVIEW.md
│       ├── 01-dev-tooling.md
│       ├── 02-openapi3-ts-v4.md
│       ├── 03-zod-v4.md
│       ├── ENHANCEMENTS_BACKLOG.md
│       └── README.md
│
├── adr/                        # Architecture Decision Records
│   ├── 001-fail-fast-spec-violations.md
│   ├── 002-defer-types-to-openapi3-ts.md
│   ├── 003-type-predicates-over-boolean-filters.md
│   ├── 004-pure-functions-single-responsibility.md
│   ├── 005-enum-complexity-constant.md
│   ├── 006-no-unused-variables.md
│   ├── 007-esm-nodenext-resolution.md
│   ├── 008-replace-cac-with-commander.md
│   ├── 009-replace-preconstruct-with-tsup.md
│   ├── 010-use-turborepo.md
│   ├── 011-ajv-runtime-validation.md
│   └── 012-remove-playground-examples.md
│
├── analysis/                   # Investigation Results (created during work)
│   └── [Created during Phase 2 tasks]
│       ├── LINT_TRIAGE_COMPLETE.md
│       ├── PASTABLE_REPLACEMENT_PLAN.md
│       ├── OPENAPI3_TS_V4_INVESTIGATION.md
│       └── [others as work progresses]
│
├── reference/                  # Reference Materials
│   └── reference.eslint.config.ts  # Target repo ESLint standards
│
├── RULES.md                    # ⭐ Coding Standards (MUST follow)
└── DEFINITION_OF_DONE.md      # Quality gate validation script
```

---

## 📄 Key Documents Explained

### Living Documents (Update Regularly)

**`context/context.md`** ⭐⭐⭐

- **Purpose:** Single source of truth for current project state
- **Contains:**
  - Current status & quality gates
  - Progress summary (Phase 1 complete, Phase 2 in progress)
  - Dependency versions & strategy
  - Next priorities
  - Links to all other docs
- **Update:** After every significant change or decision

**`plans/01-CURRENT-IMPLEMENTATION.md`** ⭐⭐

- **Purpose:** Detailed task breakdown for current phase (Phase 2)
- **Contains:**
  - 12 tasks with acceptance criteria, implementation steps, validation
  - Task dependencies and execution order
  - Embedded TODO list (15 items)
- **Update:** Mark tasks complete as you finish them

### Strategic Documents (Reference)

**`plans/00-STRATEGIC-PLAN.md`** ⭐⭐

- **Purpose:** High-level strategic overview
- **Contains:**
  - All 4 phases with timelines
  - Strategic principles from RULES.md
  - Comprehensive dependency analysis
  - Risk management
  - Success criteria
- **Update:** When phase transitions or strategic decisions made

**`RULES.md`** ⭐⭐⭐

- **Purpose:** Coding standards and best practices
- **Contains:**
  - Testing standards (7 principles)
  - Code quality standards
  - TypeScript best practices
  - Type safety requirements
- **Follow:** Always! Every line of code must adhere

**`DEFINITION_OF_DONE.md`**

- **Purpose:** Script to validate all quality gates
- **Run:** Before every commit
- **Must pass:** format, build, type-check, test

### Reference Documents

**`adr/` (12 Architecture Decision Records)**

- Document all major architectural decisions
- Provide context for why decisions were made
- Reference when similar situations arise

**`reference/reference.eslint.config.ts`**

- Target repository's ESLint configuration
- Goal: Achieve full compliance
- Note: `assertionStyle: "never"` = zero type assertions required

---

## 🎯 Current Status Summary (October 24, 2025)

### Quality Gates

```
✅ format      - Passing
✅ build       - Passing (ESM + CJS + DTS)
✅ type-check  - Passing (0 errors)
⚠️  lint       - 146 issues (74 = BLOCKER)
✅ test        - Passing (297 tests)
```

### Critical Blocker

**74 type assertions** - Must be zero before extraction to target repo

### Current Phase

**Phase 2:** Type Safety & Dependencies (2-3 weeks)

- Update openapi3-ts (v3 → v4.5.0)
- Update zod (v3 → v4.1.12)
- Replace pastable (with lodash-es + custom)
- Eliminate all type assertions (74 → 0)
- Evaluate & clean dependencies

### Next Actions

See `plans/01-CURRENT-IMPLEMENTATION.md` for detailed tasks.

---

## 📝 How to Use This Directory

### Starting Fresh

1. Read `context/context.md` for current state
2. Read `plans/00-STRATEGIC-PLAN.md` for strategic overview
3. Read `plans/01-CURRENT-IMPLEMENTATION.md` for what to do next
4. Read `RULES.md` to understand standards
5. Run Definition of Done to verify starting state
6. Pick the next pending task and start work

### During Work

1. Follow task steps in `01-CURRENT-IMPLEMENTATION.md`
2. Create analysis documents in `analysis/` as you investigate
3. Update TODO list as tasks progress
4. Run Definition of Done after each task
5. Commit with atomic, well-described commits
6. Update `context/context.md` after significant changes

### Making Decisions

1. Document decision in `adr/` if architectural
2. Update `plans/00-STRATEGIC-PLAN.md` if strategic
3. Update `context/context.md` with current state
4. Follow patterns from `RULES.md`

### Before Any Commit

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

All must pass (lint is exception for now, but check for new issues).

---

## 🔗 External References

**Target Repository:** engraph-monorepo

**Key Requirements:**

- OpenAPI 3.1+ support
- Latest dependencies (verified Oct 24, 2025)
- Zero security vulnerabilities
- Zero type assertions (assertionStyle: "never")
- All quality gates green

---

## 💡 Tips for Success

1. **Always check context.md first** - It's the single source of truth
2. **Follow RULES.md religiously** - Standards are non-negotiable
3. **Document as you go** - Future you will thank present you
4. **Run Definition of Done frequently** - Catch issues early
5. **Update TODO list** - Track progress, stay organized
6. **Make atomic commits** - One logical change per commit
7. **Write helpful commit messages** - Explain why, not what
8. **Create analysis documents** - Record investigations in `analysis/`

---

## 📊 Progress Tracking

### Phase 1: Foundation (✅ COMPLETE)

- Modernized tooling
- Established standards
- Created comprehensive documentation
- Fixed all critical type safety issues
- 297 tests passing

### Phase 2: Type Safety & Dependencies (🔄 IN PROGRESS)

- Investigation tasks pending
- Implementation tasks ready
- Estimated: 2-3 weeks

### Phase 3: Quality & Testing (⏳ PLANNED)

- Stryker mutation testing
- Full ESLint compliance
- handlebars evaluation

### Phase 4: Extraction Preparation (⏳ PLANNED)

- Final audit & documentation
- Ready for porting to target repo

---

**This directory is designed to support both human developers and AI assistants. Everything you need is here.**

**Last Updated:** October 24, 2025  
**Commit:** 866dcc8 (plans complete)
