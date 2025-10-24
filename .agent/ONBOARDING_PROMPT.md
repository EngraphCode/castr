# Fresh Context Onboarding Prompt

**Purpose:** Use this prompt to onboard a fresh AI context to the project  
**Last Updated:** October 24, 2025  
**Current Commit:** cef365e

---

## Copy-Paste This Prompt Into A New Chat

```
I'm working on modernizing a fork of openapi-zod-client to extract and port to 
the Oak National Academy monorepo. The repo generates strict Zod schemas and MCP 
tool validation from OpenAPI 3.0/3.1 specifications.

**Project Context:**
- Phase 1 (tooling modernization) is COMPLETE
- Phase 2 (type safety & dependencies) is ready to execute
- All documentation is comprehensive and up-to-date
- 297 tests passing, 0 TypeScript errors
- BLOCKER: 74 type assertions must become 0 before extraction

**Please read these files IN ORDER:**

1. `.agent/README.md` - Navigation guide (start here)
2. `.agent/context/context.md` - Current state & living context
3. `.agent/plans/00-STRATEGIC-PLAN.md` - Strategic overview
4. `.agent/plans/01-CURRENT-IMPLEMENTATION.md` - Detailed Phase 2 tasks
5. `.agent/RULES.md` - Coding standards (MUST follow for all work)

**After reading, confirm you understand:**
- Current project status
- The 12 Phase 2 tasks with acceptance criteria
- Quality standards from RULES.md
- Definition of Done must pass before any commit

**Then proceed with:**
Task 1.1 from `01-CURRENT-IMPLEMENTATION.md` (Lint Triage)

**Key Constraints:**
- NO type assertions allowed (target repo: assertionStyle: "never")
- Follow RULES.md standards religiously
- Every task has acceptance/implementation/validation steps
- Run quality gates after every change:
  `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run`

**Verified Versions (October 24, 2025):**
- Zod: 4.1.12 (target for update)
- openapi3-ts: 4.5.0 (target for update)
- Stryker: 9.2.0 (to be added in Phase 3)

Ready to start?
```

---

## What This Prompt Does

**1. Provides Essential Context**
- Project goal and purpose
- Current phase and status
- Critical blocker (type assertions)
- Test/error state

**2. Guides Reading Order**
- Starts with navigation (README.md)
- Living context for current state
- Strategic plan for big picture
- Implementation plan for detailed tasks
- Standards document for quality requirements

**3. Sets Expectations**
- Quality standards must be followed
- Definition of Done is mandatory
- Type safety is paramount
- No shortcuts allowed

**4. Provides Starting Point**
- Clear first task (1.1 Lint Triage)
- Understanding checkpoints
- Command to run before commits
- Current versions verified

**5. Establishes Constraints**
- Zero type assertions (extraction blocker)
- RULES.md compliance
- Task structure (acceptance/implementation/validation)
- Quality gate requirements

---

## Expected AI Response Pattern

A properly onboarded AI should:

1. **Confirm Reading**
   - "I've read all 5 documents"
   - "I understand the current state"
   - "I'm familiar with RULES.md standards"

2. **Summarize Understanding**
   - Project goal (extraction to Oak monorepo)
   - Current phase (Phase 2, ready to execute)
   - Blocker (74 type assertions)
   - First task (Lint Triage)

3. **Acknowledge Constraints**
   - No type assertions allowed
   - RULES.md standards apply
   - Quality gates must pass
   - Comprehensive testing required

4. **Begin Work**
   - Start with Task 1.1
   - Follow acceptance/implementation/validation pattern
   - Update TODO list as progressing
   - Commit with quality gates passing

---

## Troubleshooting

### If AI Seems Confused

Ask: "Have you read all 5 documents I mentioned?"

If not, provide them one at a time:
1. `.agent/README.md` first
2. Then guide through the rest

### If AI Asks for More Context

Point to:
- `.agent/adr/` for specific decision rationale
- `.agent/plans/01-CURRENT-IMPLEMENTATION.md` for task details
- `.agent/RULES.md` for standards clarification
- `.agent/DEFINITION_OF_DONE.md` for quality gates

### If AI Starts Wrong Task

Redirect: "Please start with Task 1.1 from 01-CURRENT-IMPLEMENTATION.md"

### If AI Violates Standards

Remind: "This violates RULES.md - see section X"

---

## Alternative: Minimal Prompt (If Full Prompt Too Long)

```
I need help modernizing openapi-zod-client for extraction to Oak National 
Academy monorepo. Phase 1 complete, Phase 2 ready to execute.

Start by reading:
1. .agent/README.md (navigation)
2. .agent/context/context.md (current state)
3. .agent/plans/01-CURRENT-IMPLEMENTATION.md (what to do)

Then begin Task 1.1 (Lint Triage).

CRITICAL: 74 type assertions must become 0 (extraction blocker).
Follow .agent/RULES.md for all standards.

Ready?
```

---

## Success Indicators

**An AI is properly onboarded when it:**

✅ References specific documents by name  
✅ Understands the type assertion blocker  
✅ Knows to follow RULES.md  
✅ Can state the current phase (2) and status  
✅ Knows the first task (1.1 Lint Triage)  
✅ Understands quality gate requirements  
✅ Can explain acceptance/implementation/validation pattern  
✅ Knows Definition of Done must pass  

**Warning signs of poor onboarding:**

❌ Asks "what should I work on?"  
❌ Doesn't mention type assertions  
❌ Doesn't reference RULES.md  
❌ Suggests skipping tests  
❌ Doesn't run quality gates  
❌ Violates coding standards  
❌ Can't cite documentation  

---

## Context Handoff Checklist

**Before ending current session:**

- [ ] All work committed
- [ ] Quality gates passing
- [ ] TODO list updated
- [ ] context.md updated if needed
- [ ] This prompt is current

**To start new session:**

- [ ] Copy full prompt above
- [ ] Paste into new chat
- [ ] Wait for AI to confirm reading
- [ ] Verify AI understands constraints
- [ ] Direct to first pending task
- [ ] Monitor for RULES.md compliance

---

## Version History

- **2025-10-24 (cef365e):** Initial version - comprehensive onboarding
- Future versions will be added here as documentation evolves

---

**This prompt represents 2,800+ lines of documentation distilled into essential onboarding instructions.**


