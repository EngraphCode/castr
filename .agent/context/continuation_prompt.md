# Continuation Prompt: openapi-zod-client Modernization

**Purpose:** Comprehensive technical context for AI assistants to resume work on the openapi-zod-client modernization project.  
**Audience:** AI assistants in fresh chat contexts  
**Last Updated:** November 5, 2025

> **Quick orientation needed?** See `.agent/context/context.md` for current status snapshot.  
> **Detailed session plans?** See `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` for implementation roadmap.  
> **Documentation system guide?** See `.agent/context/README.md` for usage patterns.

---

## Project Overview

**openapi-zod-client** is a TypeScript library that generates Zod validation schemas and type-safe API clients from OpenAPI specifications. It enables:

1. **Runtime validation** - Convert OpenAPI schemas to Zod schemas with type inference
2. **Type-safe clients** - Generate TypeScript clients with full type safety
3. **SDK generation** - Produce schemas + metadata without HTTP clients
4. **MCP tool generation** - (In progress) Export JSON Schema for AI tool integration

**Strategic Goal:** Every consumer (CLI, programmatic API, MCP tooling) experiences predictable, spec-compliant behavior. Valid specs sail through and produce deterministic artifacts; invalid specs fail fast with actionable guidance. Comprehensive tests and documentation make this contract boringly reliable, unlocking MCP automation and future extraction to Engraph.

---

## Current State & Context

### Where We Are

**Phase:** Phase 2 Part 1 **COMPLETE** ✅  
**Branch:** `feat/rewrite`  
**Status:** Production-ready codebase, all quality gates green  
**Next:** Phase 2 Part 2 - MCP Enhancements (Session 5)

### What Was Accomplished (Phase 2 Part 1)

**Sessions 1-4 completed successfully (October-November 2025):**

1. **Session 1: Foundation & Guardrails**
   - Migrated type system from `openapi3-ts/oas30` to `openapi3-ts/oas31`
   - Removed legacy dependencies (`@apidevtools/swagger-parser`, `openapi-types@12.1.3`)
   - Added Scalar packages with pinned versions
   - Created guard test to prevent legacy imports

2. **Session 2: Loading & Bundling**
   - Implemented `loadOpenApiDocument` using `@scalar/json-magic`
   - Integrated `@scalar/openapi-parser/upgrade` for automatic 3.1 normalization
   - Established intersection type strategy (`OpenAPIV3_1.Document & OpenAPIObject`)
   - Exported new API surface with comprehensive TSDoc

3. **Session 3: Complete Technical Resolution**
   - Created `isNullableType()` helper for OpenAPI 3.1 nullable handling
   - Modernized ALL test fixtures from 3.0 to 3.1 syntax
   - Fixed Vitest v4 mock typing issues
   - Migrated ALL tests to Scalar pipeline
   - Unskipped ALL tests (0 skipped tests policy)
   - **Result:** 0 type errors, 0 lint errors, all tests passing

4. **Session 4: Documentation & Final Cleanup**
   - Created 3 comprehensive architecture documents (~5,000 words total)
   - Enhanced TSDoc for all public APIs
   - Added 15+ inline architectural comments
   - Updated all documentation to reflect Scalar pipeline
   - Verified production-ready state

---

## Architectural Decisions & Rationale

### Why Scalar Pipeline?

**Decision:** Replace `SwaggerParser.bundle()` with Scalar's `@scalar/json-magic` + `@scalar/openapi-parser`

**Rationale:**
1. **Deterministic bundling** - Scalar provides consistent, repeatable results
2. **Better validation** - AJV-backed validation with detailed error messages
3. **Multi-file support** - Better handling of $ref resolution across files
4. **OpenAPI 3.1 support** - Native support for newer spec features
5. **Active maintenance** - Scalar is actively developed and maintained
6. **Richer metadata** - Provides bundle metadata, warnings, and extension data

**Trade-offs accepted:**
- Scalar preserves internal `$ref`s (unlike SwaggerParser's full dereferencing)
- Need to handle Scalar's extension properties (`x-ext`, `x-ext-urls`)
- Required migration of all existing tests and fixtures

### Why OpenAPI 3.1 Internal Type System?

**Decision:** Normalize ALL specs to OpenAPI 3.1 after bundling, regardless of input version

**Rationale:**
1. **Single type system** - Eliminates version branching in conversion logic
2. **Automatic upgrades** - 3.0 specs transparently upgraded to 3.1
3. **Strict typing** - Leverages `openapi3-ts/oas31` types throughout
4. **Future-proof** - Ready for 3.1 features (webhooks, discriminator, etc.)
5. **Simpler codebase** - No need to handle multiple OpenAPI versions in business logic

**How it works:**
```
Input (3.0 or 3.1 spec)
    ↓
bundle() via @scalar/json-magic       ← Resolves external $refs
    ↓
upgrade() via @scalar/openapi-parser  ← Normalizes to 3.1
    ↓
Validate & type as intersection       ← Type-safe boundary
    ↓
BundledOpenApiDocument                ← Internal type system
    ↓
All downstream code uses oas31 types  ← Single source of truth
```

**Key principle:** Validate at boundaries, trust internally. Once a spec is bundled and upgraded, all downstream code can assume OpenAPI 3.1 semantics.

### Why Intersection Type Strategy?

**Decision:** Use `OpenAPIV3_1.Document & OpenAPIObject` as the internal document type

**Rationale:**
1. **Best of both worlds** - Scalar's extensions + strict typing
2. **Type safety** - Compiler catches misuse of optional properties
3. **Extension access** - Can access `x-ext`, `x-ext-urls` for debugging
4. **Strict downstream** - All business logic uses strict `openapi3-ts/oas31` types
5. **Boundary validation** - Type guards convert Scalar's loose types to our strict types

**Implementation:**
```typescript
import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

// Intersection type combining both type systems
type BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject;

// Type guard validates at boundary
function isBundledOpenApiDocument(doc: unknown): doc is BundledOpenApiDocument {
  // Runtime validation ensures type safety
}
```

**Trade-off:** Need to handle Scalar's `Record<string, unknown>` boundary with type guards, but this is explicit and localized.

---

## Technical Architecture

### Scalar Pipeline (3 Stages)

**Stage 1: Bundle**
- Uses `@scalar/json-magic/bundle` with plugins
- Resolves external `$ref`s to absolute paths
- Preserves internal `$ref`s for dependency tracking
- Adds `x-ext` metadata for debugging
- Tracks filesystem entries and warnings

**Stage 2: Upgrade**
- Uses `@scalar/openapi-parser/upgrade`
- Converts OpenAPI 3.0 → 3.1 transparently
- Handles nullable types, exclusive bounds, etc.
- Normalizes type arrays

**Stage 3: Validate & Type**
- Runtime validation with type guards
- Converts Scalar's loose types to strict types
- Ensures intersection type constraints
- Fails fast with actionable error messages

**See:** `.agent/architecture/SCALAR-PIPELINE.md` for complete documentation

### Type System Migration (OpenAPI 3.0 → 3.1)

**Key changes:**
1. **Nullable types:**
   - 3.0: `{ type: 'string', nullable: true }`
   - 3.1: `{ type: ['string', 'null'] }`

2. **Exclusive bounds:**
   - 3.0: `{ minimum: 5, exclusiveMinimum: true }`
   - 3.1: `{ exclusiveMinimum: 5 }`

3. **Type arrays:**
   - 3.1 supports `type: ['string', 'number']` natively

**Helper:** `isNullableType(schema)` handles 3.1 nullable detection

**See:** `.agent/architecture/OPENAPI-3.1-MIGRATION.md` for complete documentation

---

## Critical Patterns & Conventions

### TDD (Test-Driven Development) - MANDATORY

Every code change follows the TDD cycle:

1. **Write failing test FIRST** - Before any implementation
2. **Run test - confirm failure** - Proves test is valid
3. **Write minimal code** - Just enough to pass
4. **Run test - confirm success** - Implementation works
5. **Refactor** - Clean up while protected by tests

**No exceptions.** This discipline is absolute.

### Type Safety - STRICT

**FORBIDDEN constructs:**
- `as` (except `as const`)
- `any`
- `!` (non-null assertion)
- `Record<string, unknown>` in our code (Scalar uses it, we validate at boundary)
- `Object.*` methods without type guards

**Required patterns:**
- Type predicates with `is` keyword
- Runtime validation at boundaries
- Type inference over annotations
- Discriminated unions
- Generic constraints

### TSDoc - COMPREHENSIVE

**Public APIs require:**
- Description (what, why, key behaviors)
- All parameters with descriptions
- Return value details
- All error conditions (`@throws`)
- At least one realistic example
- Related function links (`@see`)
- Important behavioral notes (`@remarks`)

**Internal APIs require:**
- Brief description
- Parameter types and descriptions
- Return value
- Error conditions if throws

**See:** `.agent/RULES.md` for complete standards with examples

### Fail-Fast Philosophy

- **Validate at boundaries** - External data must be validated
- **Trust internally** - Once validated, assume correctness
- **Fail loud** - Errors should be explicit and actionable
- **No defensive programming** - Don't check for "impossible" states
- **Type system prevents bugs** - Use types, not runtime checks

### Quality Gates - ALWAYS GREEN

Before any commit:
```bash
pnpm format      # Format code
pnpm build       # Verify builds
pnpm type-check  # 0 type errors
pnpm lint        # 0 lint errors
pnpm test:all    # All tests pass, 0 skipped
```

**All gates must pass.** This is non-negotiable.

---

## Key Files & Modules

### Core Pipeline

**`lib/src/shared/load-openapi-document.ts`**
- Implements Scalar-based loading pipeline
- 3-stage process: bundle → upgrade → validate
- Type guard `isBundledOpenApiDocument` for boundary validation
- Comprehensive TSDoc with architecture comments

**`lib/src/shared/prepare-openapi-document.ts`**
- Public API wrapper around `loadOpenApiDocument`
- Accepts string path, URL, or OpenAPIObject
- Returns normalized OpenAPI 3.1 document
- Used by CLI and programmatic API

### Type Conversion

**`lib/src/conversion/typescript/helpers.primitives.ts`**
- Contains `isNullableType()` helper for OpenAPI 3.1 nullable detection
- Primitive type conversion utilities
- Handles type arrays and nullable unions

**`lib/src/conversion/typescript/core.converters.ts`**
- Core schema → TypeScript string conversion
- Uses `isNullableType()` throughout
- Comprehensive type handling

### Code Generation

**`lib/src/rendering/generate-from-context.ts`**
- Main `generateZodClientFromOpenAPI()` function
- Entry point for all code generation
- Template rendering and formatting
- Comprehensive TSDoc

**`lib/src/context/template-context.ts`**
- `getZodClientTemplateContext()` builds template variables
- Includes `defaultStatusBehavior` option
- Comprehensive TSDoc with examples

### Validation & Guards

**`lib/src/validation/scalar-guard.test.ts`**
- Prevents legacy SwaggerParser imports
- Scans all production code for banned imports
- Run via `pnpm test:scalar-guard`
- Must pass to ensure pipeline compliance

---

## Common Patterns & Anti-Patterns

### ✅ Good: Type Guard at Boundary

```typescript
export function isBundledOpenApiDocument(doc: unknown): doc is BundledOpenApiDocument {
  if (!doc || typeof doc !== 'object') return false;
  
  const candidate = doc as Record<string, unknown>;
  
  // Validate required OpenAPI 3.1 fields
  if (!candidate.openapi || typeof candidate.openapi !== 'string') return false;
  if (!candidate.openapi.startsWith('3.1')) return false;
  
  return true;
}

// Usage
const doc = await loadOpenApiDocument(input);
if (!isBundledOpenApiDocument(doc)) {
  throw new Error('Invalid OpenAPI document');
}
// Now doc is typed as BundledOpenApiDocument
```

### ❌ Bad: Type Assertion

```typescript
// NEVER do this
const doc = await loadOpenApiDocument(input) as BundledOpenApiDocument;
// Bypasses type safety!
```

### ✅ Good: OpenAPI 3.1 Nullable Check

```typescript
export function isNullableType(schema: SchemaObject): boolean {
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  return types.includes('null');
}

// Usage
if (isNullableType(schema)) {
  return `${baseType} | null`;
}
```

### ❌ Bad: OpenAPI 3.0 Nullable Check

```typescript
// NEVER do this (3.0 style)
if (schema.nullable) {  // Property doesn't exist in 3.1!
  return `${baseType} | null`;
}
```

### ✅ Good: TDD Cycle

```typescript
// Step 1: Write failing test
test('isNullableType returns true for type array with null', () => {
  const schema = { type: ['string', 'null'] };
  expect(isNullableType(schema)).toBe(true);
});

// Step 2: Run test - expect RED
// ❌ ReferenceError: isNullableType is not defined

// Step 3: Minimal implementation
export function isNullableType(schema: SchemaObject): boolean {
  return true; // Minimal - will need refinement
}

// Step 4: Run test - expect GREEN
// ✅ Test passes

// Step 5: Add next test case
test('isNullableType returns false for string type', () => {
  const schema = { type: 'string' };
  expect(isNullableType(schema)).toBe(false);
});

// Step 6: Run tests - expect ONE RED
// ✅ First test passes
// ❌ Second test fails (returns true, expected false)

// Step 7: Refine implementation
export function isNullableType(schema: SchemaObject): boolean {
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  return types.includes('null');
}

// Step 8: Run tests - expect ALL GREEN
// ✅ All tests pass
```

---

## What's Next (Phase 2 Part 2)

### Session 5: MCP Investigation

**Goal:** Research and document MCP requirements

**Deliverables:**
1. `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` - MCP tool structure, JSON Schema constraints, security, errors
2. `.agent/analysis/JSON_SCHEMA_CONVERSION.md` - zod-to-json-schema config, edge cases, testing
3. `.agent/analysis/SECURITY_EXTRACTION.md` - Security metadata extraction algorithm

**Estimated effort:** 3-4 hours

**See:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` Session 5 for detailed plan

### Subsequent Sessions

- **Session 6:** SDK Enhancements (parameter metadata, rate limiting)
- **Session 7:** MCP Tool Enhancements (JSON Schema export, security metadata, type guards)
- **Session 8:** Documentation & Final Validation

---

## How to Resume Work

### Quick Start (Warm Context)

If you're continuing in the same chat:
```
Continue with Session 5 as planned. Follow TDD and RULES.md standards.
```

### Cold Start (Fresh Chat)

If starting in a fresh chat with no context:
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

### Pre-Work Checklist

Before starting any session:
- [ ] Read `.agent/context/context.md` for current status
- [ ] Read `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` for session details
- [ ] Read `.agent/RULES.md` for standards
- [ ] Verify quality gates are green: `pnpm check`
- [ ] Understand acceptance criteria for session
- [ ] Plan validation steps

### During Work

- [ ] Follow TDD strictly (write test → red → implement → green → refactor)
- [ ] Add comprehensive TSDoc to new/changed APIs
- [ ] Run quality gates frequently
- [ ] Commit atomic, logical changes with good messages
- [ ] Update documentation as you go

### Post-Work Checklist

After completing a session:
- [ ] All tests passing (`pnpm test:all`)
- [ ] 0 type errors (`pnpm type-check`)
- [ ] 0 lint errors (`pnpm lint`)
- [ ] 0 skipped tests
- [ ] All acceptance criteria met
- [ ] Update `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` (mark session complete)
- [ ] Update `.agent/context/continuation_prompt.md` (add insights)
- [ ] Update `.agent/context/context.md` (update status)
- [ ] Commit with comprehensive message

---

## Important Links

**Architecture Documentation:**
- `.agent/architecture/SCALAR-PIPELINE.md` - Scalar pipeline details (~3,000 words)
- `.agent/architecture/OPENAPI-3.1-MIGRATION.md` - Type system migration guide
- `docs/DEFAULT-RESPONSE-BEHAVIOR.md` - Default response handling

**Standards & Guidelines:**
- `.agent/RULES.md` - Coding standards (TDD, TSDoc, type safety) - **MANDATORY**
- `.agent/DEFINITION_OF_DONE.md` - Completion criteria

**Project Context:**
- `.agent/context/README.md` - Documentation system guide
- `.agent/context/context.md` - Current status snapshot
- `.agent/plans/00-STRATEGIC-OVERVIEW.md` - High-level roadmap
- `.agent/plans/requirements.md` - Project constraints

**Session Plans:**
- `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` - Detailed session-by-session plan

---

**Last Updated:** November 5, 2025  
**Status:** Phase 2 Part 1 Complete, Part 2 Ready  
**Quality Gates:** ALL GREEN ✅
