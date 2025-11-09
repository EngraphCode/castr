# Continuation Prompt: openapi-zod-client Modernization

**Purpose:** Comprehensive technical context for AI assistants to resume work on the openapi-zod-client modernization project.  
**Audience:** AI assistants in fresh chat contexts  
**Last Updated:** November 8, 2025 (11:42 PM)

> **Quick orientation needed?** See `.agent/context/context.md` for current status snapshot.  
> **Detailed session plans?** See `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` for the roadmap and `PHASE-2-SESSION-9-MCP-TYPE-GUARDS-DOCS.md` for the current session plan.  
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

**Phase:** Phase 2 Part 2 - Session 9 ⏳ Pending kickoff  
**Branch:** `feat/rewrite`  
**Status:** Session 8 complete — MCP helper modules, CLI parity, manual manifests, and documentation updates have landed. Session 9 is underway: runtime type guards (`isMcpTool`, `isMcpToolInput`, `isMcpToolOutput`) are implemented with unit tests; quality gates were rerun and are green.  
**Next:** Continue Session 9 by delivering MCP error formatting helpers and the documentation sweep (README/CLI notes for `--emit-mcp-manifest`, MCP overview/examples, integration guide).

**Recent Verification:**

- **Nov 6, 2025:** `pnpm --filter @oaknational/openapi-to-tooling exec tsx --eval "<petstore Draft 07 inspection script>"` confirmed Draft 07 conversion (`Pet` allOf rewrite, `id` requirement) with AJV validation; full quality suite green immediately after helper refactor.
- **Nov 8, 2025:** Migrated high-churn snapshot suites to fixtures (hyphenated parameters, export-all-types, export-all-named-schemas, export-schemas-option, schema-name-already-used), replaced the slow regex in `path-utils`, and reran the full quality gate stack (`pnpm lint`, `pnpm test`, `pnpm test:snapshot`, `pnpm type-check`, `pnpm build`, `pnpm character`) — all green on `feat/rewrite`.
- **Nov 8, 2025 (10:40 PM):** `pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js examples/openapi/v3.0/petstore-expanded.yaml --emit-mcp-manifest ../tmp/petstore.mcp.json` and `…/multi-auth.yaml --emit-mcp-manifest ../tmp/multi-auth.mcp.json` — stored MCP manifests for Workstream D (petstore reports `default`-only warning, multi-auth surfaces layered OAuth2 + API key requirements).

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

### What Was Accomplished (Phase 2 Part 2)

**Sessions 5-6 completed successfully (November 2025):**

5. **Session 5: MCP Protocol Research & Analysis**
   - Created 3 comprehensive analysis documents (~15,000 words total):
     - `MCP_PROTOCOL_ANALYSIS.md` - MCP 2025-06-18 spec, tool structure, constraints
     - `JSON_SCHEMA_CONVERSION.md` - OpenAPI → JSON Schema Draft 07 conversion rules
     - `SECURITY_EXTRACTION.md` - Upstream API authentication extraction strategy
   - Researched MCP specification version 2025-06-18 from official repository
   - Confirmed JSON Schema Draft 07 requirement (not Draft 2020-12)
   - Established parallel conversion strategy (OpenAPI → Zod + JSON Schema)
   - Clarified two-layer authentication architecture (MCP protocol vs upstream API)
   - Determined MCP SDK not needed for static artifact generation
   - Documented tool structure constraints (type: "object" requirement, snake_case naming)
   - **Result:** Complete implementation roadmap ready for Sessions 6-7

6. **Session 6: SDK Enhancements**
   - Implemented parameter metadata extraction using library types exclusively:
     - `extractDescription()`, `extractDeprecated()`, `extractExample()`, `extractExamples()`, `extractDefault()`
     - `extractSchemaConstraints()` for 11 constraint types (enum, minimum, maximum, minLength, maxLength, pattern, format, minItems, maxItems, uniqueItems)
   - Created type-safe definitions using `Pick` patterns (zero custom types):
     - `SchemaConstraints` = `Pick<SchemaObject, 11 constraint fields>`
     - Parameter metadata uses `Pick<ParameterObject, ...> & Pick<SchemaObject, ...>`
   - Implemented proper type guards (`hasExampleValue`, `isReferenceObject`) for type narrowing
   - Refactored for complexity reduction:
     - `extractSchemaConstraints()` to data-driven approach (complexity 16→5)
     - `extractExample()` into pure helper functions
     - Split `load-openapi-document.ts` into 8 single-responsibility files
   - Architecture improvements:
     - ESM-only build (removed bundling, preserved directory structure)
     - Fixed `__dirname` usage for ESM (`import.meta.url`)
     - Updated ADR-018 with "Critical Architectural Boundary" clarifying OpenAPI 3.1-only downstream
   - Updated 7 snapshot tests with correct metadata (enum constraints, default values)
   - **Result:** 0 type errors, 0 lint errors, all 909 tests passing (607 unit + 157 snapshot + 145 characterization)

7. **Session 7 (Complete): JSON Schema Conversion Engine**
   - Helper layer fully rewritten: discriminated keyword readers, no `Object.keys`/`Reflect.*`, no type assertions; array/object appliers updated accordingly.
   - Permissive fallback emits `{}` Draft 07 schema with contextual warning; new tests exercise failure path.
   - JSON Schema module now augmented with Draft 2020-12 keywords to keep typing strict.
   - Integration coverage expanded (`multi-auth`, `petstore-expanded`, `tictactoe`); AJV harness tightened.
   - Samples snapshot suite now merges official + custom fixtures and asserts the multi-auth scenario is present.
   - Security extraction emits Layer-1 vs Layer-2 warning and throws on unresolved `$ref` schemes.
   - Manual verification (Nov 6, 2025): `tsx --eval` inspection of `petstore-expanded.yaml` confirmed `Pet` → Draft 07 conversion (`allOf` rewrite, `id` requirement) with AJV validation for both composite and inline schemas.
   - Documentation + plans updated (`context.md`, `HANDOFF.md`, `PHASE-2-MCP-ENHANCEMENTS.md`) — ready to kick off Session 8 (MCP tool generation).
   - MCP spec review (Nov 6, 2025 14:15): tool IDs must be stable lowercase ASCII strings; tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) are optional hints; input/output schemas emitted for tools must be JSON Schema Draft 07 objects; generated manifests must satisfy `ToolSchema` from `@modelcontextprotocol/sdk/types.js`; prefer fail-fast errors when constraints cannot be met.
8. **Session 8 (Complete): MCP Tool Generation & Template Integration**
   - Helper modules (naming, hints, schema aggregation, security) drive `mcpTools`; templated + original paths flow through the `httpOperation` block for manifests.
   - CLI `--emit-mcp-manifest` now wraps the shared context; characterisation tests enforce parity with programmatic generation.
   - `template-context.mcp.inline-json-schema.ts` inlines `$ref` chains into Draft 07 documents while satisfying Sonar return-type rules.
   - Snapshot hygiene complete: high-churn suites migrated to fixtures; remaining inline suites (group-strategy, recursive-schema, composition) retain inline expectations with documented rationale.
   - `path-utils.ts` now uses deterministic parsing, ensuring colonised routes remain intact in manifest metadata.
   - Manual manifests captured via `pnpm --filter @oaknational/openapi-to-tooling exec node -- ./dist/cli/index.js … --emit-mcp-manifest ../tmp/*.mcp.json` for petstore (4 tools; `default` warnings) and multi-auth (2 tools; layered OAuth2 + API key). Artefacts stored under `tmp/`.
   - Quality gates (`pnpm lint`, `pnpm test`, `pnpm test:snapshot`, `pnpm type-check`, `pnpm build`, `pnpm character`) rerun post-doc updates — all green (Nov 8, 2025 10:45 PM).
   - Hand-off ready: documentation set, plans, and manifests updated; backlog for Session 9 captured in parent plan (README/CLI docs, type guards, error formatting).

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

**Key principles:**

- **Validate at boundaries, trust internally** - Once a spec is bundled and upgraded, all downstream code can assume OpenAPI 3.1 semantics
- **No custom types** - ALWAYS use library types (openapi3-ts/oas31, @modelcontextprotocol/sdk/types.js). Custom types are forbidden. Maintain unbroken chain of truth from library definitions.

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

### Why No Custom Types?

**Decision:** Use library types exclusively - never create custom types where library types exist

**Rationale:**

1. **Unbroken chain of truth** - Types flow directly from authoritative sources
2. **Zero drift** - Library updates automatically propagate through our code
3. **Expert maintenance** - Domain experts maintain library types, not us
4. **Compiler validation** - TypeScript enforces consistency at compile time
5. **Simpler codebase** - No custom type definitions to maintain

**What this means:**

```typescript
// ✅ GOOD: Use library types directly
import type { ParameterObject, SchemaObject } from 'openapi3-ts/oas31';
import type { Tool, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

// Use Pick to subset library types
function extractMetadata(
  param: ParameterObject,
  schema: SchemaObject,
): Pick<ParameterObject, 'description' | 'deprecated' | 'example' | 'examples'> &
  Pick<SchemaObject, 'default'> {
  return {
    description: param.description,
    deprecated: param.deprecated,
    example: param.example,
    examples: param.examples,
    default: schema.default,
  };
}

// Use library union types directly
function processSchema(schema: SchemaObject | ReferenceObject): void {
  if (isReferenceObject(schema)) {
    // Handle reference
  }
  // Handle schema
}

// ❌ BAD: Creating custom types
interface ParameterMetadata {
  // ❌ FORBIDDEN
  description?: string;
  deprecated?: boolean;
  example?: unknown;
}

interface ParameterConstraints {
  // ❌ FORBIDDEN
  minimum?: number;
  maximum?: number;
}
```

**Approved patterns:**

- `Pick<LibraryType, 'field1' | 'field2'>` - Subset library types
- `Extract<LibraryType, 'value1' | 'value2'>` - Extract union members (tied to library)
- `LibraryType['fieldName']` - Access exact library field type
- Type guards using library types: `value is LibraryType`

**Forbidden patterns:**

- Creating interfaces that duplicate library fields
- Creating types that "should" match library types
- Extracting types into constants without library tying

---

### MCP Tool Generation Strategy

**Decision:** Generate MCP tools with direct OpenAPI → JSON Schema Draft 07 conversion (parallel to Zod conversion)

**Context:** MCP (Model Context Protocol) 2025-06-18 requires JSON Schema Draft 07 for tool `inputSchema` and `outputSchema` fields.

**Rationale:**

1. **No information loss** - Direct conversion preserves all OpenAPI schema information
2. **Optimal for each format** - Zod for TypeScript runtime validation, JSON Schema for MCP protocol
3. **Full Draft 07 control** - Can ensure compliance with MCP requirements
4. **No conversion dependency** - Eliminates `zod-to-json-schema` with its limitations
5. **Clean separation** - Each converter optimized for its specific target format

**Rejected alternative:** OpenAPI → Zod → JSON Schema conversion

- **Why rejected:**
  - Zod `.transform()` and `.refine()` don't translate to JSON Schema
  - Information loss in conversion process
  - Limited support for complex Zod features
  - Additional dependency with its own edge cases

**Implementation approach:**

```
OpenAPI Schema
    ↓
    ├──→ Zod Converter ──→ Zod schemas (for TypeScript/runtime)
    │
    └──→ JSON Schema Converter ──→ JSON Schema Draft 07 (for MCP tools)
```

**Key constraints enforced:**

- MCP tools require `type: "object"` at root of inputSchema/outputSchema
- Tool naming convention: operationId → snake_case (e.g., `getUser` → `get_user`)
- ToolAnnotations generated from HTTP methods (GET → `readOnlyHint: true`, etc.)
- JSON Schema must conform to Draft 07 (no Draft 2020-12 features)

**See:** `.agent/analysis/JSON_SCHEMA_CONVERSION.md` for complete conversion rules

---

### Security Architecture for MCP

**Decision:** Extract upstream API authentication metadata for documentation, not tool-level security

**Context:** Two-layer authentication model in MCP ecosystem:

- **Layer 1:** MCP client ↔ MCP server (OAuth 2.1, defined by MCP spec)
- **Layer 2:** MCP server ↔ Upstream API (defined by OpenAPI spec)

**Critical distinction:**

- OpenAPI security schemes describe how the **MCP server** authenticates to the **upstream API**
- This is separate from MCP protocol security (OAuth 2.1 between client and server)
- MCP tools themselves don't carry security metadata

**What we extract:**

- `components.securitySchemes` (OAuth 2.0, Bearer, API Keys, etc.)
- Operation-level `security` requirements
- OAuth scopes per operation
- Token/key placement details

**What we generate:**

- Comprehensive documentation comments in tool definitions
- Server implementation configuration guides
- TypeScript configuration types for credentials

**Purpose:** Inform MCP server implementers what credentials they need to configure for calling upstream APIs

**See:** `.agent/analysis/SECURITY_EXTRACTION.md` for complete extraction algorithm

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
const doc = (await loadOpenApiDocument(input)) as BundledOpenApiDocument;
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
if (schema.nullable) {
  // Property doesn't exist in 3.1!
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

### Session 6: SDK Enhancements

**Goal:** Enrich SDK-facing artifacts with metadata from Scalar pipeline

**Focus:**

- Enhanced parameter metadata (descriptions, examples, constraints)
- Rate-limiting/constraint metadata extraction
- Maintain backward compatibility with existing templates

**Prerequisites:** Session 5 complete ✅

**See:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` Session 6 for detailed plan

### Subsequent Sessions

- **Session 7:** MCP Tool Enhancements
  - Implement OpenAPI → JSON Schema Draft 07 converter
  - Generate MCP tool definitions (inputSchema/outputSchema)
  - Extract and document upstream API security metadata
  - Add tool naming converter (operationId → snake_case)
  - Generate ToolAnnotations from HTTP methods
  - Add type guards and validation helpers
- **Session 8:** Documentation & Final Validation
  - Update README with MCP sections
  - Add CLI flags for MCP generation
  - Create comprehensive examples
  - Validate against MCP 2025-06-18 schema
  - Run full quality gates

---

## How to Resume Work

### Quick Start (Warm Context)

If you're continuing in the same chat:

```
Continue with Session 6 as planned. Follow TDD and RULES.md standards.
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

**Analysis Documentation:**

- `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` - MCP 2025-06-18 specification analysis
- `.agent/analysis/JSON_SCHEMA_CONVERSION.md` - OpenAPI → JSON Schema Draft 07 rules
- `.agent/analysis/SECURITY_EXTRACTION.md` - Upstream API authentication extraction

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
**Status:** Phase 2 Part 2 Session 5 Complete, Session 6 Ready  
**Quality Gates:** ALL GREEN ✅
