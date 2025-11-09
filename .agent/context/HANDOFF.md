# Project Handoff & Orientation

**Last Updated:** November 8, 2025 10:45 PM  
**Purpose:** Quick orientation hub and document navigation for current work  
**Read Time:** ~5-10 minutes

---

## 📍 Where We Are

**Current Phase:** Phase 2 Part 2 – Session 9 ⏳ Pending kickoff  
**Active Branch:** `feat/rewrite`  
**Next Session Tasks:** Begin Session 9 (type guards, error formatting, documentation) — scope includes MCP runtime validators, README/CLI updates for `--emit-mcp-manifest`, and a documentation sweep.
**Project Status:** Session 8 is complete — MCP helper layer + CLI parity landed, manual manifests archived (`tmp/petstore.mcp.json`, `tmp/multi-auth.mcp.json`), fixture-driven snapshots in place, and the full quality gate stack is green on `feat/rewrite`.

### Phase Progress Overview

```
Phase 1: Tooling & Architecture         ✅ Complete
Phase 2 Part 1: Scalar Pipeline         ✅ Complete (Sessions 1-4)
Phase 2 Part 2: MCP Enhancements        ⏳ Session 9 pending
Phase 3: DX & Quality                   ⚪ Planned
```

### Recent Milestone

```
pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js examples/openapi/v3.0/petstore-expanded.yaml --emit-mcp-manifest ../tmp/petstore.mcp.json
pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js examples/custom/openapi/v3.1/multi-auth.yaml --emit-mcp-manifest ../tmp/multi-auth.mcp.json
```

Generates MCP manifests directly from the shared context. Petstore produces 4 tools (with warnings for `default`-only responses); multi-auth exercises layered security requirements. Outputs are archived under `tmp/*.mcp.json` for Workstream D notes.

### Session 8 Highlights (Nov 6–8, 2025)

- Helper modules for tool naming, behavioural hints, aggregated schemas, and security power `mcpTools`; template context + Handlebars exports now consume them with unit coverage.
- CLI `--emit-mcp-manifest` is now a thin wrapper around the shared context, and characterisation tests prove CLI ↔ programmatic parity.
- Added `template-context.mcp.inline-json-schema.ts`, ensuring manifest input/output schemas inline `$ref` chains into standalone Draft 07 objects; helper now satisfies Sonar return-type rules.
- Snapshot hygiene push: major suites (hyphenated parameters, export-all-types, export-all-named-schemas, export-schemas-option, schema-name-already-used) now draw expectations from fixture modules instead of inline megasnapshots; remaining inline suites documented.
- Path utilities shed the slow regex; deterministic parsing preserves both templated (`/users/:id`) and original (`/users/{id}`) forms in manifest metadata.
- Full quality gate stack (`lint`, `test`, `test:snapshot`, `type-check`, `build`, `character`) is green on `feat/rewrite`.
- Manual CLI manifest runs captured for `examples/openapi/v3.0/petstore-expanded.yaml` (4 tools, `default`-only response warning) and `examples/custom/openapi/v3.1/multi-auth.yaml` (2 tools, layered security); artefacts stored in `tmp/*.mcp.json`.
- Ready to kick off Session 9: backlog includes type guards, error formatting, and README/CLI documentation for the new manifest workflow.

---

## 🗺️ Document Navigation

### For Quick Orientation (You Are Here)

- **📄 HANDOFF.md** - This document - Big picture orientation and navigation

### For Current Status & Recent Work

- **📝 context.md** - Living status log with recent session changes and immediate next actions

### For Complete AI Context

- **🤖 continuation_prompt.md** - Comprehensive AI rehydration with full history and architecture

### For Detailed Plans

- **📋 PHASE-2-MCP-ENHANCEMENTS.md** - Session-by-session implementation plan with acceptance criteria

### For Documentation System

- **📚 README.md** - How to use this three-document system effectively

### For Standards & Rules

- **⚖️ RULES.md** - Coding standards (TDD, TSDoc, type safety) - **MANDATORY**

### For Architecture Details

- **🏗️ SCALAR-PIPELINE.md** - Scalar pipeline architecture (~3,000 words)
- **🔄 OPENAPI-3.1-MIGRATION.md** - Type system migration guide
- **📖 DEFAULT-RESPONSE-BEHAVIOR.md** - Default response handling

---

## 🚀 Quick Start

### Starting Fresh (Cold Start)

**For AI in new chat:**

```
I'm continuing development on openapi-zod-client. Please read:

@continuation_prompt.md
@context.md
@PHASE-2-MCP-ENHANCEMENTS.md
@RULES.md

Then:
1. Summarize current state
2. Identify next session
3. Create detailed implementation plan with acceptance criteria
4. Begin work following TDD

Follow ALL standards in @RULES.md.
```

**For humans:**

1. Read this HANDOFF.md (5 min orientation)
2. Check context.md for current status (Session 8 complete; Session 9 pending kickoff)
3. Review PHASE-2-MCP-ENHANCEMENTS.md § Session 8 acceptance criteria before implementation
4. Draft detailed Session 8 execution plan (tool context + manifest generation) and proceed with TDD

### Continuing Work (Warm Start)

**For AI in same chat:**

```
Continue with [next task/session] as planned. Follow TDD and RULES.md standards.
```

**For humans:**

1. Check context.md for current status
2. Review immediate next actions
3. Pick up where you left off

---

## 🏗️ Architecture Overview

### Core Design: Scalar Pipeline + OpenAPI 3.1

```
Input (3.0 or 3.1 spec: file, URL, or object)
    ↓
bundle() via @scalar/json-magic
    ↓ (resolves external $refs, preserves internal $refs)
upgrade() via @scalar/openapi-parser
    ↓ (normalizes ALL specs to OpenAPI 3.1)
Validate & type with intersection
    ↓ (type guard converts loose → strict types)
BundledOpenApiDocument
    ↓ (OpenAPIV3_1.Document & OpenAPIObject)
All downstream code uses oas31 types
    ↓
Code generation, validation, MCP tools
```

### Key Architectural Decisions

**1. OpenAPI 3.1 Internal Type System**

- All specs auto-upgraded to 3.1 after bundling
- Single type system eliminates version branching
- Simpler codebase, future-proof architecture

**2. Intersection Type Strategy**

- `OpenAPIV3_1.Document & OpenAPIObject`
- Scalar's extensions + strict typing
- Type guards at boundaries (no casting)

**3. Scalar Pipeline Benefits**

- Deterministic bundling
- Better validation (AJV-backed)
- Multi-file support
- Richer metadata
- Active maintenance

**4. No Custom Types**

- ALWAYS use library types (openapi3-ts/oas31, @modelcontextprotocol/sdk/types.js)
- NEVER create custom types where library types exist
- Use Pick/Extract patterns to subset library types
- Maintain unbroken chain of truth from library definitions

**See:** `.agent/architecture/SCALAR-PIPELINE.md` for complete details

---

## 📦 Key Deliverables

### Production Code

✅ **Scalar Pipeline Implementation**

- `lib/src/shared/load-openapi-document.ts` - Core Scalar loader
- `lib/src/shared/prepare-openapi-document.ts` - Public API wrapper
- 3-stage pipeline: bundle → upgrade → validate

✅ **Type System Migration**

- All code uses `openapi3-ts/oas31` types
- `isNullableType()` helper for OpenAPI 3.1 nullable detection
- Type guards for boundary validation

✅ **Test Suite**

- 0 skipped tests (strict policy)
- All tests migrated to Scalar pipeline
- Comprehensive characterisation coverage

### Documentation

✅ **Architecture Documentation** (~5,000 words total)

- Scalar pipeline details and design decisions
- OpenAPI 3.1 migration guide
- Default response behavior guide

✅ **Enhanced TSDoc**

- All public APIs documented with examples
- 15+ inline architectural comments
- Comprehensive parameter documentation

✅ **Context Documentation**

- Three-document system (this HANDOFF, context, continuation_prompt)
- README with usage patterns
- Session-by-session plans

### Quality Verification

✅ **All Quality Gates Green**

- `pnpm type-check` → 0 errors
- `pnpm lint` → 0 errors
- `pnpm test:all` → All passing, 0 skipped
- `pnpm build` → Clean builds
- `pnpm format` → Consistent style

---

## 🎯 Common Patterns

### Type Guard Pattern (Boundary Validation)

```typescript
export function isBundledOpenApiDocument(doc: unknown): doc is BundledOpenApiDocument {
  if (!doc || typeof doc !== 'object') return false;

  const candidate = doc as Record<string, unknown>;

  if (!candidate.openapi || typeof candidate.openapi !== 'string') return false;
  if (!candidate.openapi.startsWith('3.1')) return false;

  return true;
}
```

### OpenAPI 3.1 Nullable Check

```typescript
export function isNullableType(schema: SchemaObject): boolean {
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  return types.includes('null');
}
```

### TDD Cycle (Mandatory)

1. Write failing test FIRST
2. Run test - confirm RED
3. Write minimal implementation
4. Run test - confirm GREEN
5. Refactor while protected by tests

**See:** `.agent/RULES.md` for complete patterns and standards

---

## ✅ Success Criteria

### Session Complete When:

- [ ] All acceptance criteria met
- [ ] All tests passing (`pnpm test:all`)
- [ ] 0 type errors (`pnpm type-check`)
- [ ] 0 lint errors (`pnpm lint`)
- [ ] 0 skipped tests
- [ ] TSDoc added/updated for changed APIs
- [ ] Documentation updated (context.md, continuation_prompt.md, plan)
- [ ] Changes committed with comprehensive message

### Phase Complete When:

- [ ] All sessions delivered
- [ ] All quality gates green
- [ ] Comprehensive documentation delivered
- [ ] Manual smoke tests passing
- [ ] Characterisation tests updated
- [ ] README/API docs updated
- [ ] Milestone commit with summary

---

## 🎓 Key Principles

### TDD (Test-Driven Development)

- Write failing test FIRST, always
- No implementation without failing tests
- Tests prove behavior, not implementation

### Type Safety

- NEVER use type escape hatches (`as`, `any`, `!`)
- Type guards with `is` keyword
- Validate at boundaries, trust internally
- ALWAYS use library types - custom types are forbidden

### Documentation

- Public APIs require comprehensive TSDoc with examples
- Internal APIs need `@param`, `@returns`, `@throws`
- Inline comments for architectural decisions

### Quality

- All quality gates must pass before commit
- No skipped tests (forbidden)
- Fail fast with actionable error messages

**See:** `.agent/RULES.md` for complete standards (MANDATORY reading)

---

## 🔄 What's Next

### Immediate Next Session

**Session 5: MCP Investigation** (~3-4 hours)

**Goal:** Research and document MCP requirements

**Deliverables:**

1. `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md`
2. `.agent/analysis/JSON_SCHEMA_CONVERSION.md`
3. `.agent/analysis/SECURITY_EXTRACTION.md`

**See:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` for detailed plan

### Upcoming Sessions

- **Session 6:** SDK Enhancements (parameter metadata, rate limiting)
- **Session 7:** MCP Tool Enhancements (JSON Schema, security, type guards)
- **Session 8:** Documentation & Final Validation

---

## 📞 Key Contacts & Resources

**Repository:** `/Users/jim/code/personal/openapi-zod-client`  
**Branch:** `feat/rewrite`  
**Quality Gate:** `pnpm check` (format + build + type-check + lint + test:all)

**Documentation Locations:**

- `.agent/context/` - Status and context documents
- `.agent/plans/` - Phase and session plans
- `.agent/architecture/` - Architecture documentation
- `docs/` - User-facing documentation

**Quality Commands:**

```bash
pnpm format      # Format code
pnpm build       # Verify builds
pnpm type-check  # Check types (must be 0 errors)
pnpm lint        # Check lint (must be 0 errors)
pnpm test:all    # Run all tests (must all pass, 0 skipped)
pnpm check       # Run all quality gates
```

---

**Welcome to the project!** 🎉  
This HANDOFF document gives you the big picture. For recent changes, see **context.md**. For complete AI context, see **continuation_prompt.md**.
