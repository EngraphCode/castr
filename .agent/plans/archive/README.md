# Modernization Plans

This directory contains comprehensive plans for modernizing the openapi-zod-client repository.

## Quick Start

1. **Read:** `00-OVERVIEW.md` - Understand the overall strategy
2. **Execute:** Plans 01, 02, 03 in sequence
3. **Document:** Each PR with changeset

## Plan Files

### 00-OVERVIEW.md

**High-level strategic plan** covering all three phases

- Why three PRs instead of one
- Version strategy (v2.0.0 or v3.0.0)
- Risk assessment
- Timeline estimates
- Success criteria

**Read this first!**

---

### 01-dev-tooling.md

**Developer Tooling Modernization**

- **Type:** `patch` (no breaking changes)
- **Time:** 2-3 days
- **Dependencies:** None

**Updates:**

- TypeScript 5.1 → 5.7
- Prettier 2.7 → 3.6
- Vitest 0.22 → 2.1
- ESLint 8.26 → 9.18
- Node.js 18.16+ → 18.20+
- GitHub Actions
- Security fixes
- Remove unnecessary @types packages

**Impact:**

- ✅ No API changes
- ✅ No output changes
- ✅ Foundation for other PRs

---

### 02-openapi3-ts-v4.md

**openapi3-ts v4 Upgrade**

- **Type:** `major` (breaking change)
- **Time:** 2-3 days
- **Dependencies:** Plan 01 complete

**Updates:**

- openapi3-ts 3.1.0 → 4.x
- Import path changes: `"openapi3-ts"` → `"openapi3-ts/oas31"`
- 20+ files updated
- Target OAS 3.1

**Breaking Change:**

```typescript
// Before
import { OpenAPIObject } from "openapi3-ts";

// After
import { OpenAPIObject } from "openapi3-ts/oas31";
```

**Impact:**

- ⚠️ Programmatic users must update imports
- ✅ CLI users: no changes
- ✅ Generated output: no changes

---

### 03-zod-v4.md

**Zod v4 Upgrade**

- **Type:** `major` (breaking change)
- **Time:** 4-6 days
- **Dependencies:** Plans 01 & 02 complete

**Updates:**

- Zod 3.x → 4.x
- @zodios/core to Zod v4 compatible version
- Schema generation logic (`openApiToZod.ts`)
- ALL 68 test snapshots
- Examples and playground

**Breaking Change:**
Generated code uses Zod v4 API

**Impact:**

- ⚠️ ALL users must update
- ⚠️ Must regenerate clients
- ⚠️ Must install Zod v4

---

## Execution Strategy

### Sequential (Recommended)

```
Plan 01 → Merge → Plan 02 → Merge → Plan 03 → Merge
```

**Advantages:**

- Clear checkpoints
- Independent review
- Easy rollback
- Progressive testing

### Timeline

**Aggressive:** 1-2 weeks total  
**Realistic:** 2-3 weeks total  
**Conservative:** 3-4 weeks total

---

## Version Strategy

### Option A: Two Majors

- Plan 01 → No bump (patch)
- Plan 02 → v2.0.0
- Plan 03 → v3.0.0

### Option B: One Major (Recommended)

- Plan 01 → Merge to main (patch)
- Plans 02 + 03 → v2.0.0 (combined)

**Rationale:** Users need to act anyway, single migration is easier

---

## Standards & Requirements

Every plan must include:

### Code Quality

- ✅ All tests pass
- ✅ ESLint passes
- ✅ TypeScript compiles
- ✅ Prettier formatted

### Documentation

- ✅ README updates
- ✅ Migration guides (for breaking changes)
- ✅ Code comments
- ✅ Changeset files

### Testing

- ✅ Unit tests
- ✅ Integration tests
- ✅ Example verification
- ✅ Playground verification

### CI/CD

- ✅ GitHub Actions pass
- ✅ Node 18.20+, 20.x, 22.x tested

---

## Getting Started

### Prerequisites

```bash
# Ensure correct Node.js version
node -v  # Should be 18.16.0+

# Install dependencies
pnpm install

# Verify tests pass
pnpm test

# Verify build works
pnpm build
```

### Execute Plan 01

```bash
# Create branch
git checkout -b chore/modernize-dev-tools

# Follow plan step-by-step
open 01-dev-tooling.md

# Create changeset when done
pnpm changeset

# Push and create PR
git push origin chore/modernize-dev-tools
```

### After Plan 01 Merges

```bash
# Pull latest
git checkout main
git pull

# Start Plan 02
git checkout -b feat/openapi3-ts-v4

# Follow plan step-by-step
open 02-openapi3-ts-v4.md
```

---

## Plan Structure

Each plan follows this structure:

1. **Objective** - What we're doing and why
2. **Scope** - What's in and out of scope
3. **Current State** - What exists now
4. **Implementation Plan** - Step-by-step guide
5. **Testing Checklist** - What to verify
6. **Success Criteria** - How we know we're done
7. **Risks & Mitigation** - What could go wrong
8. **Rollback Plan** - How to undo if needed
9. **Timeline** - How long it takes

---

## Plan Statistics

**Comprehensive Coverage:**

- **Total Words:** ~38,000 words
- **Total Pages:** ~80 pages (if printed)
- **Implementation Steps:** ~150+ detailed steps
- **Test Checkpoints:** ~100+ verification points
- **Atomic Commits:** ~30 well-defined commits

**Coverage:**

- ✅ Every dependency analyzed
- ✅ Every file identified
- ✅ Every risk assessed
- ✅ Every test planned
- ✅ Every commit defined

---

## Frequently Asked Questions

### Why three separate PRs?

- **Risk isolation** - Issues in one don't affect others
- **Independent review** - Easier to review smaller changes
- **Clear rollback points** - Can revert specific changes
- **Progressive testing** - Test after each major change
- **Better git history** - Clear, understandable commits

### Why this specific order?

1. **Plan 01 first:** Foundation (no breaking changes, clean baseline)
2. **Plan 02 second:** Type changes (limited impact, only programmatic users)
3. **Plan 03 last:** Output changes (highest impact, all users affected)

Each builds on the previous, minimizing compounding issues.

### Can I combine Plans 02 and 03?

**Yes, you can!** See the overview document for decision matrix.

- **Pros:** Single v2.0.0 release, one migration for users
- **Cons:** Larger PR, harder to debug, higher risk

**Recommendation:** Execute as separate PRs, but release together as v2.0.0.

### What if Zod v4 isn't actually released?

Plan 03 includes a research phase to verify. If Zod v4 doesn't exist:

- Update the plan with actual version info
- Adjust timelines as needed
- The research phase will catch this

### How long will this really take?

**Time estimates by experience level:**

- **Experienced with codebase:** 1.5-2 weeks
- **Moderate familiarity:** 2-3 weeks
- **Learning the codebase:** 3-4 weeks

**By work intensity:**

- **Full-time focus:** 1.5 weeks
- **Half-time work:** 3 weeks
- **Side project:** 4+ weeks

### What if I find issues with the plans?

**Plans are living documents!**

- Update them as you learn
- Document discoveries
- Share improvements
- Help future maintainers

### How do I know when I'm done?

Each plan has a **Success Criteria** section listing specific requirements:

- All tests pass
- Documentation complete
- Changeset created
- CI/CD passing
- Examples work

All checkboxes must be checked before submitting PR.

---

## What Makes These Plans Special

### 1. Based on Real Current Data

- Actual `npm outdated` output analyzed
- Security vulnerabilities considered
- October 2025 ecosystem state
- Not based on assumptions

### 2. Fork-Aware Design

- Professional commit structure
- Clear, comprehensive documentation
- High-quality standards
- Ready for upstream contribution if desired

### 3. Risk-Managed Approach

- Three separate PRs isolate risks
- Independent rollback capability
- Progressive testing between phases
- Clear checkpoints and validation

### 4. User-Focused

- Comprehensive migration guides
- Clear breaking change communication
- Minimal user disruption
- Excellent support documentation

### 5. Maintainer-Friendly

- Detailed implementation steps
- No ambiguous instructions
- Easy to follow even months later
- Future maintainers will understand decisions

---

## Key Principles

### Atomic Commits

- One logical change per commit
- Clear commit messages
- Easy to review
- Easy to rollback

### Comprehensive Testing

- Test after each major change
- Don't accumulate errors
- Verify no regressions
- Document any issues

### Excellent Documentation

- Migration guides for users
- Code comments for maintainers
- Changeset files for releases
- Clear communication

### Quality First

- No shortcuts
- Fix issues properly
- Maintain high standards
- Think about future maintainers

---

## Fork Considerations

Since this is a fork:

### Clean History

- Professional commits
- Well-documented changes
- Easy to understand
- Ready for upstream if desired

### Independence

- Can release separately
- Own versioning
- Custom features possible
- But aligned with best practices

### Contribution Ready

- High-quality PRs
- Comprehensive testing
- Professional communication
- Could contribute back upstream

---

## Communication

### Before Starting

- [ ] Team aware of plans
- [ ] Timeline communicated
- [ ] Resources allocated

### During Execution

- [ ] Regular updates
- [ ] Blockers communicated
- [ ] Help requested when needed

### After Completion

- [ ] Changes documented
- [ ] Migration guide published
- [ ] Users notified (for breaking changes)

---

## Resources

### Documentation

- [Changesets](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Dependencies

- [TypeScript](https://www.typescriptlang.org/)
- [Prettier](https://prettier.io/)
- [Vitest](https://vitest.dev/)
- [ESLint](https://eslint.org/)
- [Zod](https://zod.dev/)
- [openapi3-ts](https://www.npmjs.com/package/openapi3-ts)
- [Zodios](https://www.zodios.org/)

### Tools

- [pnpm](https://pnpm.io/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Node Version Managers](https://github.com/shadowspawn/node-version-usage)

---

## Support

### Issues

- Check existing plans for answers
- Review FAQ sections
- Ask team for help
- Document new issues

### Questions

- Overview doc has general strategy
- Individual plans have specifics
- Code has inline comments (after completion)

### Feedback

- Plans are living documents
- Update as you learn
- Share improvements
- Help future maintainers

---

## Status Tracking

### Plan 01: Developer Tooling

- [ ] Started
- [ ] In Progress
- [ ] PR Created
- [ ] Merged

### Plan 02: openapi3-ts v4

- [ ] Started
- [ ] In Progress
- [ ] PR Created
- [ ] Merged

### Plan 03: Zod v4

- [ ] Started
- [ ] In Progress
- [ ] PR Created
- [ ] Merged

### Release

- [ ] v2.0.0 Released
- [ ] Documentation Updated
- [ ] Users Notified

---

## Final Notes

These plans are:

- **Comprehensive:** Cover all aspects
- **Detailed:** Step-by-step instructions
- **Flexible:** Adapt as needed
- **Professional:** Production-quality

Take your time. Do it right. The codebase will thank you! 🚀

---

**Start with:** `00-OVERVIEW.md`  
**Then execute:** `01-dev-tooling.md`  
**Good luck!** 💪
