# Project Documentation System

**Purpose:** This directory contains the documentation system for continuing complex, multi-session development work with AI assistants across fresh chat contexts.

---

## 📋 The Three-Document System

This system uses three complementary documents to enable seamless context switching between AI chat sessions:

### 1. **`continuation_prompt.md`** - AI Rehydration Prompt
**Audience:** AI assistants resuming work in fresh contexts  
**Purpose:** Comprehensive technical context for AI to "wake up" and understand the project

**Contains:**
- Complete technical background and architecture
- Key decisions and trade-offs made
- Current implementation status
- Critical patterns and approaches
- Quality standards and validation requirements
- References to other documentation

**Update when:**
- Major architectural decisions are made
- New patterns or approaches are established
- Important trade-offs are documented
- Phase/session boundaries are crossed
- Critical context emerges that future AI needs to know

**Characteristics:**
- Comprehensive and technical
- Optimized for AI consumption
- Includes "why" behind decisions
- Self-contained (can be read standalone)
- ~3,000-5,000 words typical

---

### 2. **`context.md`** - Living Status Document
**Audience:** Both humans and AI for quick orientation  
**Purpose:** Current state snapshot and next actions

**Contains:**
- Current phase and session
- What's complete, what's in-progress
- Quality gate status (type/lint/test)
- Immediate next actions
- Recent completions
- Known issues or blockers

**Update when:**
- Session transitions occur
- Quality gate status changes
- Next actions are identified
- Blockers are discovered or resolved
- After completing significant work

**Characteristics:**
- Concise and scannable
- Always current (living document)
- Status-focused, not history
- Quick reference for "where are we?"
- ~500-1,000 words typical

---

### 3. **Plan Document** (e.g., `PHASE-2-MCP-ENHANCEMENTS.md`)
**Audience:** Both humans and AI for session planning  
**Purpose:** Detailed session-by-session implementation roadmap

**Contains:**
- Phase overview and goals
- Session-by-session breakdown
- Acceptance criteria for each session
- Validation steps and quality gates
- Dependencies between sessions
- Estimated effort per session

**Update when:**
- Sessions are planned or reorganized
- Sessions are completed
- Acceptance criteria are met
- Validation results are recorded
- Phase scope changes

**Characteristics:**
- Structured and detailed
- Session-focused granularity
- Explicit acceptance criteria
- Clear validation steps
- Updated with completion status
- ~2,000-4,000 words typical

---

## 🚀 Usage Examples

### Starting Fresh Session (Cold Start)

When resuming work in a completely fresh AI chat with no prior context:

```
I'm continuing development on openapi-zod-client. Please read these documents:

@continuation_prompt.md
@context.md
@PHASE-2-MCP-ENHANCEMENTS.md
@RULES.md

Once you've read them, please:
1. Summarize the current state
2. Identify the next session to work on
3. Enter planning mode and create a detailed implementation plan with:
   - Specific tasks broken down into steps
   - Acceptance criteria for each task
   - Validation steps to confirm completion
   - Estimated effort per task

Follow all standards in @RULES.md including TDD, type safety, and comprehensive TSDoc.
```

**What happens:**
- AI reads `continuation_prompt.md` → understands full technical context
- AI reads `context.md` → knows current state and next actions
- AI reads plan document → knows session objectives
- AI reads `RULES.md` → knows quality standards
- AI creates detailed implementation plan for the session
- AI can begin work immediately with full context

---

### Mid-Session Resume (Warm Start)

When returning to work in the same session after a break:

```
I'm back. What were we working on, and what's the status?
```

**What happens:**
- AI uses existing chat history (context still loaded)
- AI can reference recent work directly
- No need to reload documentation
- Can continue immediately

---

### Session Completion & Handoff

When completing a session and preparing for next session:

```
Excellent work. Please update the documentation for handoff:

1. Update @PHASE-2-MCP-ENHANCEMENTS.md:
   - Mark Session X as COMPLETE
   - Add completion date
   - Record validation results (type/lint/test status)
   - List all deliverables

2. Update @continuation_prompt.md:
   - Add any new architectural insights
   - Document any critical decisions made
   - Update implementation status

3. Update @context.md:
   - Update "Current Focus" to next session
   - Update quality gate status
   - List immediate next actions
   - Update session completion status

4. Commit all changes with a comprehensive commit message
```

**What happens:**
- Documentation is updated to reflect current state
- Next AI session will have complete context
- Commit preserves all work and context
- System is ready for next session (cold start)

---

### Planning New Work

When starting a new phase or major feature:

```
I want to add [NEW FEATURE]. Please:

1. Read the current documentation:
   @continuation_prompt.md
   @context.md
   @RULES.md

2. Analyze the feature requirements
3. Create a detailed plan document in .agent/plans/
4. Break down into sessions with acceptance criteria
5. Identify dependencies and risks
6. Estimate effort per session
7. Update @context.md with the new plan
```

**What happens:**
- AI understands existing architecture and patterns
- AI creates new plan document following established format
- Plan is integrated into documentation system
- Ready to begin implementation

---

## 🔄 Documentation Workflow

### Daily/Session Workflow

```
┌─────────────────────┐
│  Start New Session  │
│  (Read docs)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Work on Tasks      │
│  (Implement)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Context.md  │
│  (Status)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Commit Work        │
└─────────────────────┘
```

### Session Completion Workflow

```
┌─────────────────────────┐
│  Complete Session       │
│  (All tasks done)       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Run Quality Gates      │
│  (type/lint/test)       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Update Plan Doc        │
│  (Mark COMPLETE)        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Update Continuation    │
│  (Add insights)         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Update Context.md      │
│  (Next session)         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Commit with Summary    │
└─────────────────────────┘
```

### Phase Completion Workflow

```
┌─────────────────────────┐
│  All Sessions Complete  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Comprehensive Testing  │
│  (All quality gates)    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Documentation Sweep    │
│  (TSDoc, examples, etc) │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Update All Docs        │
│  (Phase complete)       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Milestone Commit       │
└─────────────────────────┘
```

---

## 📁 Directory Structure

```
.agent/
├── context/
│   ├── README.md                    ← This file
│   ├── continuation_prompt.md       ← AI rehydration prompt
│   ├── context.md                   ← Living status document
│   └── archive/
│       └── CONTINUE-PHASE-0.md      ← Archived old prompts
├── plans/
│   ├── PHASE-2-MCP-ENHANCEMENTS.md  ← Current plan
│   └── [future-plans].md
├── architecture/
│   ├── SCALAR-PIPELINE.md           ← Architecture docs
│   ├── OPENAPI-3.1-MIGRATION.md
│   └── [other-arch-docs].md
└── RULES.md                         ← Coding standards
```

---

## 🎯 Design Principles

### 1. **Separation of Concerns**
- Each document has ONE clear purpose
- No overlap or duplication
- Easy to find information

### 2. **Optimized for Different Audiences**
- `continuation_prompt.md` → AI technical context
- `context.md` → Quick human + AI status
- Plan docs → Structured session planning

### 3. **Progressive Disclosure**
- Start with `context.md` (quick scan)
- Read `continuation_prompt.md` (full context)
- Reference plan docs (detailed work breakdown)

### 4. **Living Documentation**
- Always up-to-date
- Updated as work progresses
- Reflects current reality, not aspirations

### 5. **AI-First Design**
- Optimized for AI consumption and comprehension
- Clear structure and formatting
- Explicit context and relationships
- Self-contained sections

---

## ✅ Quality Checklist

Before starting a new session, verify:

- [ ] `continuation_prompt.md` reflects all major decisions
- [ ] `context.md` shows current state accurately
- [ ] Plan document has clear next session
- [ ] Quality gate status is accurate
- [ ] All recent work is committed
- [ ] Architecture docs are up-to-date

Before completing a session, verify:

- [ ] Plan document marked COMPLETE with results
- [ ] `continuation_prompt.md` updated with insights
- [ ] `context.md` updated with next actions
- [ ] All quality gates passing (type/lint/test)
- [ ] All changes committed with good messages
- [ ] Documentation is accurate and current

---

## 🔍 Troubleshooting

### AI seems confused about current state
**Solution:** Ensure `context.md` is up-to-date and accurately reflects status

### AI doesn't understand architectural decisions
**Solution:** Check `continuation_prompt.md` has sufficient background and "why" behind decisions

### AI creates poor implementation plans
**Solution:** Review plan document format and ensure RULES.md is referenced

### Documentation feels stale
**Solution:** Update after each significant work session, not just at boundaries

### Too much duplication between docs
**Solution:** Review separation of concerns - each doc should have ONE clear purpose

---

## 📚 Additional Resources

- **Coding Standards:** `.agent/RULES.md`
- **Architecture Docs:** `.agent/architecture/`
- **Plan Documents:** `.agent/plans/`
- **Project README:** `../README.md`

---

## 🔄 Document Maintenance

### When to Archive

Archive documents when:
- Phase is complete and unlikely to be referenced
- Document is superseded by newer version
- Historical reference only (not active work)

Archive location: `.agent/context/archive/`

### When to Create New Plan Document

Create new plan document when:
- Starting a new major phase
- Significant scope change requires new structure
- Previous plan document is complete

Naming: `PHASE-N-FEATURE-NAME.md`

---

**Last Updated:** November 5, 2025  
**System Version:** 1.0  
**Status:** Active

