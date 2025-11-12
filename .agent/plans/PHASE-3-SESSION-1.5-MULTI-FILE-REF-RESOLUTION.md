# Phase 3 Session 1.5 – Multi-File $ref Resolution

**Status:** Not Started  
**Estimated Effort:** 4-6 hours  
**Prerequisites:** Phase 3 Session 1 complete (CodeMeta deleted) ✅  
**Parent Plan:** [PHASE-3-TS-MORPH-IR.md](./PHASE-3-TS-MORPH-IR.md)  
**Standards:** Must comply with [.agent/RULES.md](../RULES.md) — strict TDD, library types only, zero escape hatches, pure functions, exhaustive documentation

---

## Session Objectives

- **Fix multi-file OpenAPI spec support** that's been disabled since Phase 2
- **Handle Scalar vendor extension refs** (`#/x-ext/{hash}/components/schemas/X`)
- **Re-enable multi-file fixture** in generated code validation tests
- **Maintain zero behavioral changes** for existing single-file specs
- **Preserve Scalar's provenance tracking** (don't flatten x-ext structure)

---

## Problem Statement

### Current Situation

**Symptom:** Multi-file OpenAPI specs fail during code generation with error:
```
Error: Schema 'Pet' not found in components.schemas
```

**Root Cause:** Scalar's bundler stores external file schemas under vendor extensions:

```json
{
  "components": {
    "schemas": {
      "PetSummary": {
        "allOf": [
          { "$ref": "#/x-ext/425563c/components/schemas/Pet" }
        ]
      }
    }
  },
  "x-ext": {
    "425563c": {
      "components": {
        "schemas": {
          "Pet": { "type": "object", ... },
          "PetList": { "type": "array", ... }
        }
      }
    }
  }
}
```

**What's Happening:**

1. Scalar bundles `main.yaml` + `components/pet.yaml` into single document
2. External schemas stored in `x-ext.{hash}.components.schemas` (preserves file provenance)
3. References from main file point to `#/x-ext/425563c/components/schemas/Pet`
4. Our code tries to parse this and look up "Pet" in `components.schemas`
5. Lookup fails because "Pet" is actually in `x-ext.425563c.components.schemas`

### Why This Matters

**Impact:**

- Multi-file specs are **completely broken** (documented as "temporarily disabled")
- Real-world APIs often split specs across multiple files (e.g., Oak National Academy requirements)
- Characterization tests pass (bundling works), but code generation fails (ref resolution broken)
- Blocks Phase 4 consumer requirements (multi-file spec support)

**Current Workaround:**

Multi-file fixture disabled in all validation tests with comment:
```typescript
// Note: The 'multi-file' fixture is temporarily disabled due to a known issue
// with external $ref resolution in the Scalar bundler.
```

But the issue is NOT in Scalar's bundler — Scalar works correctly. The issue is in our ref resolution code that doesn't understand Scalar's `x-ext` structure.

---

## Technical Analysis

### Code Locations Affected

**1. Reference Parsing (8+ implementations):**

Multiple `getSchemaNameFromRef` implementations throughout codebase:
- `lib/src/conversion/zod/handlers.core.ts` (line 18)
- `lib/src/conversion/typescript/helpers.ts` (line 23)
- `lib/src/shared/dependency-graph.ts` (line 29)
- `lib/src/shared/infer-required-only.ts` (line 12)
- `lib/src/shared/utils/schema-sorting.ts` (line 8)
- `lib/src/context/template-context.common.ts` (line 12)
- `lib/src/endpoints/helpers.naming.resolution.ts` (line 17)

All implementations do the same thing:
```typescript
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];  // Just takes last part
  return name;
};
```

This works for `#/components/schemas/Pet` → "Pet"  
But breaks for `#/x-ext/425563c/components/schemas/Pet` → "Pet"  
(Name is correct, but lookup location is wrong!)

**2. Component Lookup:**

`lib/src/shared/component-access.ts` (line 33-45):
```typescript
export function getSchemaFromComponents(
  doc: OpenAPIObject,
  name: string,
): SchemaObject | ReferenceObject {
  if (!doc.components?.schemas) {
    throw new Error(`Schema '${name}' not found in components.schemas`);
  }
  const schema = doc.components.schemas[name];  // Only looks in standard location
  if (!schema) {
    throw new Error(`Schema '${name}' not found in components.schemas`);
  }
  return schema;
}
```

Only searches `doc.components.schemas`, never checks `doc['x-ext']`.

**3. Ref Pattern Matching:**

`lib/src/shared/component-access.ts` (line 108-120):
```typescript
function parseComponentRef(ref: string): { componentType: string; componentName: string } {
  const refPattern = /^#\/components\/([^/]+)\/(.+)$/;  // Standard refs only
  const match = refPattern.exec(ref);
  // ...
}
```

Pattern only matches `#/components/{type}/{name}`, not `#/x-ext/{hash}/components/{type}/{name}`.

### Scalar's Bundling Behavior

**Why Scalar uses x-ext:**

1. **Preserve provenance** - Track which file each schema came from
2. **Enable debugging** - Developers can see original file structure
3. **Support source maps** - Future tooling can map errors back to original files
4. **Avoid name collisions** - External files might have schemas with same names

**Scalar metadata:**

```typescript
{
  "x-ext-urls": {
    "425563c": "file:///absolute/path/to/components/pet.yaml"
  },
  "x-ext": {
    "425563c": {
      "components": { "schemas": { "Pet": {...}, "PetList": {...} } }
    }
  }
}
```

**Reference format:**

- Internal refs: `#/components/schemas/PetSummary` (standard)
- External refs: `#/x-ext/{hash}/components/schemas/Pet` (vendor extension)

**Hash generation:** Content-based hash of source file path (deterministic)

---

## Solution Design

### Approach: Dual-Path Resolution

**Strategy:** Enhance ref resolution to check both standard and x-ext locations, with minimal code changes.

**Key Principles:**

1. **Backward compatible** - Single-file specs continue working unchanged
2. **Preserve provenance** - Don't flatten x-ext structure (Scalar uses it for debugging)
3. **Type-safe** - No type assertions, proper type guards
4. **Pure functions** - Ref parsing and lookup are pure, testable functions
5. **Fail-fast** - Clear error messages when refs can't be resolved

### Implementation Plan

**Phase A: Enhanced Ref Parsing (1-2h)**

Create centralized ref parsing utility that understands both standard and x-ext formats:

```typescript
// lib/src/shared/ref-resolution.ts (NEW FILE)

/**
 * Parse result for a component reference.
 * Handles both standard (#/components/schemas/X) and 
 * Scalar vendor extension (#/x-ext/{hash}/components/schemas/X) formats.
 */
export interface ParsedRef {
  /** Component type: 'schemas', 'parameters', 'responses', 'requestBodies' */
  componentType: string;
  /** Component name (e.g., 'Pet', 'User') */
  componentName: string;
  /** True if ref points to x-ext location */
  isExternal: boolean;
  /** Hash key for x-ext location (only if isExternal=true) */
  xExtKey?: string;
  /** Original $ref string */
  originalRef: string;
}

/**
 * Parse a component $ref into its constituent parts.
 * Supports both standard and Scalar x-ext formats.
 * 
 * @param ref - The $ref string
 * @returns Parsed ref information
 * @throws {Error} If $ref format is invalid
 * 
 * @example Standard ref
 * ```typescript
 * parseComponentRef('#/components/schemas/Pet')
 * // => { componentType: 'schemas', componentName: 'Pet', isExternal: false, ... }
 * ```
 * 
 * @example Scalar x-ext ref
 * ```typescript
 * parseComponentRef('#/x-ext/425563c/components/schemas/Pet')
 * // => { componentType: 'schemas', componentName: 'Pet', isExternal: true, xExtKey: '425563c', ... }
 * ```
 */
export function parseComponentRef(ref: string): ParsedRef {
  // Pattern 1: Standard refs (#/components/{type}/{name})
  const standardPattern = /^#\/components\/([^/]+)\/(.+)$/;
  const standardMatch = standardPattern.exec(ref);
  
  if (standardMatch && standardMatch[1] && standardMatch[2]) {
    return {
      componentType: standardMatch[1],
      componentName: standardMatch[2],
      isExternal: false,
      originalRef: ref,
    };
  }
  
  // Pattern 2: Scalar x-ext refs (#/x-ext/{hash}/components/{type}/{name})
  const xExtPattern = /^#\/x-ext\/([^/]+)\/components\/([^/]+)\/(.+)$/;
  const xExtMatch = xExtPattern.exec(ref);
  
  if (xExtMatch && xExtMatch[1] && xExtMatch[2] && xExtMatch[3]) {
    return {
      componentType: xExtMatch[2],
      componentName: xExtMatch[3],
      isExternal: true,
      xExtKey: xExtMatch[1],
      originalRef: ref,
    };
  }
  
  // Neither pattern matched
  throw new Error(
    `Invalid component $ref: ${ref}. ` +
    `Expected format: #/components/{type}/{name} or #/x-ext/{hash}/components/{type}/{name}`
  );
}
```

**Phase B: Enhanced Component Lookup (1-2h)**

Update `component-access.ts` to support dual-path lookups:

```typescript
/**
 * Get a schema from either components.schemas or x-ext locations.
 * Handles both single-file and multi-file (Scalar bundled) specs.
 * 
 * @param doc - The OpenAPI document
 * @param name - Schema name to look up
 * @param xExtKey - Optional x-ext hash key (for multi-file refs)
 * @returns SchemaObject | ReferenceObject
 * @throws {Error} If schema not found in either location
 */
export function getSchemaFromComponents(
  doc: OpenAPIObject,
  name: string,
  xExtKey?: string,
): SchemaObject | ReferenceObject {
  // Try x-ext location first (if xExtKey provided)
  if (xExtKey && doc['x-ext']) {
    const xExt = doc['x-ext'] as Record<string, unknown>;
    const xExtEntry = xExt[xExtKey] as Record<string, unknown> | undefined;
    
    if (xExtEntry?.components) {
      const components = xExtEntry.components as Record<string, unknown>;
      if (components.schemas) {
        const schemas = components.schemas as Record<string, unknown>;
        const schema = schemas[name];
        if (schema) {
          return schema as SchemaObject | ReferenceObject;
        }
      }
    }
  }
  
  // Try standard location
  if (doc.components?.schemas) {
    const schema = doc.components.schemas[name];
    if (schema) {
      return schema;
    }
  }
  
  // Not found in either location
  const locations = xExtKey 
    ? `x-ext.${xExtKey}.components.schemas or components.schemas`
    : 'components.schemas';
  throw new Error(`Schema '${name}' not found in ${locations}`);
}
```

**Phase C: Integrate parseComponentRef (1h)**

Update all call sites to use centralized `parseComponentRef`:

1. `lib/src/shared/component-access.ts` - Use `parseComponentRef` in parameter/response/requestBody lookups
2. `lib/src/shared/dependency-graph.ts` - Update to use `ParsedRef` for lookups
3. `lib/src/conversion/zod/handlers.core.ts` - Use `parseComponentRef` for ref handling
4. `lib/src/conversion/zod/handlers.object.properties.ts` - Update property ref resolution
5. `lib/src/conversion/zod/handlers.object.schema.ts` - Update additionalProperties ref resolution

**Phase D: Consolidate getSchemaNameFromRef (30min)**

Replace 8+ duplicate implementations with single export from `ref-resolution.ts`:

```typescript
/**
 * Extract schema name from a component schema $ref.
 * Works with both standard and x-ext refs.
 * 
 * @param ref - The $ref string
 * @returns Schema name only (e.g., 'Pet')
 */
export function getSchemaNameFromRef(ref: string): string {
  const parsed = parseComponentRef(ref);
  return parsed.componentName;
}
```

Update imports in all 8+ locations to use centralized version.

**Phase E: Re-enable Multi-File Tests (30min)**

1. Remove "temporarily disabled" comments from validation tests
2. Add multi-file fixture back to test arrays
3. Update `lib/tests-generated/FIXTURES.md` to mark multi-file as enabled
4. Verify all 20 validation tests pass (5 fixtures × 4 validation types)

---

## Work Sections

### Section A: Centralized Ref Resolution (2-3h)

**Objective:** Create single source of truth for ref parsing that understands Scalar's x-ext format.

**Tasks:**

1. **Create ref-resolution module** (1h)
   - Create `lib/src/shared/ref-resolution.ts`
   - Implement `ParsedRef` interface
   - Implement `parseComponentRef()` with dual-pattern matching
   - Implement `getSchemaNameFromRef()` convenience function
   - Add comprehensive TSDoc with examples

2. **Add unit tests** (1h)
   - Create `lib/src/shared/ref-resolution.test.ts`
   - Test standard refs: `#/components/schemas/Pet`
   - Test x-ext refs: `#/x-ext/425563c/components/schemas/Pet`
   - Test all component types (schemas, parameters, responses, requestBodies)
   - Test error cases (invalid formats, missing parts)
   - Follow TDD: write tests first, confirm RED → GREEN

3. **Export from index** (15min)
   - Export `parseComponentRef`, `getSchemaNameFromRef`, `ParsedRef` from `lib/src/shared/index.ts`
   - Verify public API surface

**Acceptance Criteria:**

- [ ] New module: `lib/src/shared/ref-resolution.ts`
- [ ] `ParsedRef` interface defined with all fields documented
- [ ] `parseComponentRef()` handles standard refs correctly
- [ ] `parseComponentRef()` handles x-ext refs correctly
- [ ] `getSchemaNameFromRef()` extracts name from both formats
- [ ] Comprehensive TSDoc on all exports
- [ ] Unit tests: `lib/src/shared/ref-resolution.test.ts`
- [ ] Tests cover standard refs, x-ext refs, all component types, error cases
- [ ] `pnpm test` → All passing (680+ tests)
- [ ] `pnpm type-check` → 0 errors

**Validation Steps:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Verify module exists
test -f lib/src/shared/ref-resolution.ts && echo "✅ Module created"

# Verify test file exists
test -f lib/src/shared/ref-resolution.test.ts && echo "✅ Tests created"

# Run ref resolution tests
pnpm --filter @oaknative/openapi-to-tooling test -- run shared/ref-resolution.test.ts

# Type check
pnpm type-check

# Full test suite
pnpm test
```

---

### Section B: Enhanced Component Lookup (1-2h)

**Objective:** Update component-access.ts to search both standard and x-ext locations.

**Tasks:**

1. **Update getSchemaFromComponents** (30min)
   - Add optional `xExtKey?: string` parameter
   - Implement x-ext lookup logic with proper type guards
   - Fallback to standard location if x-ext lookup fails
   - Update error messages to reflect both locations
   - Follow TDD: add tests first

2. **Update helper functions** (30min)
   - Update `getParameterByRef()` to use `parseComponentRef` and support x-ext
   - Update `getResponseByRef()` to use `parseComponentRef` and support x-ext
   - Update `getRequestBodyByRef()` to use `parseComponentRef` and support x-ext
   - Remove internal `parseComponentRef` (use shared version)

3. **Update tests** (30min)
   - Add tests for x-ext lookups in component-access.test.ts
   - Test standard location lookups (ensure backward compatibility)
   - Test x-ext location lookups (new functionality)
   - Test fallback behavior
   - Test error messages

**Acceptance Criteria:**

- [ ] `getSchemaFromComponents()` accepts optional `xExtKey` parameter
- [ ] Function checks x-ext location when xExtKey provided
- [ ] Function falls back to standard location
- [ ] Error messages indicate which locations were checked
- [ ] `getParameterByRef()`, `getResponseByRef()`, `getRequestBodyByRef()` use shared `parseComponentRef`
- [ ] Internal `parseComponentRef` deleted from component-access.ts
- [ ] Tests cover both standard and x-ext lookups
- [ ] Zero behavioral changes for single-file specs (backward compatible)
- [ ] `pnpm test` → All passing (685+ tests)
- [ ] `pnpm type-check` → 0 errors

**Validation Steps:**

```bash
# Verify backward compatibility - single-file specs still work
pnpm test -- run src/shared/component-access.test.ts

# Verify x-ext support - multi-file spec can be loaded
cd lib && node -e "
const { loadOpenApiDocument } = require('./dist/shared/index.js');
loadOpenApiDocument('./examples/openapi/multi-file/main.yaml').then(result => {
  console.log('✅ Multi-file spec loaded');
}).catch(err => console.error('❌', err.message));
"

# Full test suite
pnpm test
```

---

### Section C: Integration & Consolidation (1-2h)

**Objective:** Update all ref resolution call sites to use centralized utilities.

**Tasks:**

1. **Update dependency-graph.ts** (30min)
   - Replace local `getSchemaNameFromRef` with import from `shared/ref-resolution`
   - Update `handleReferenceInGraph` to use `parseComponentRef` and pass xExtKey to lookups
   - Update tests to cover x-ext refs

2. **Update Zod conversion handlers** (30min)
   - Update `lib/src/conversion/zod/handlers.core.ts` to use shared `parseComponentRef`
   - Update `lib/src/conversion/zod/handlers.object.properties.ts` property ref resolution
   - Update `lib/src/conversion/zod/handlers.object.schema.ts` additionalProperties ref resolution
   - Update `lib/src/conversion/zod/index.ts` exports

3. **Consolidate duplicate implementations** (30min)
   - Replace `getSchemaNameFromRef` in `conversion/typescript/helpers.ts`
   - Replace `getSchemaNameFromRef` in `shared/infer-required-only.ts`
   - Replace `getSchemaNameFromRef` in `shared/utils/schema-sorting.ts`
   - Replace `getSchemaNameFromRef` in `context/template-context.common.ts`
   - Replace `getSchemaNameFromRef` in `endpoints/helpers.naming.resolution.ts`
   - Update all imports to use `shared/ref-resolution`

**Acceptance Criteria:**

- [ ] All 8+ `getSchemaNameFromRef` implementations replaced with shared version
- [ ] All `parseComponentRef` usages use shared version
- [ ] All schema lookups pass `xExtKey` when available
- [ ] Zero local implementations of ref parsing (single source of truth)
- [ ] All imports updated
- [ ] Zero behavioral changes for single-file specs
- [ ] `pnpm test` → All passing (690+ tests)
- [ ] `pnpm type-check` → 0 errors
- [ ] `pnpm lint` → 0 errors

**Validation Steps:**

```bash
# Verify no duplicate implementations remain
echo "=== Checking for duplicate getSchemaNameFromRef implementations ==="
DUPLICATES=$(grep -r "const getSchemaNameFromRef\|function getSchemaNameFromRef" lib/src --include="*.ts" | grep -v "ref-resolution.ts" | grep -v ".test.ts" | wc -l | tr -d ' ')
[ "$DUPLICATES" -eq 0 ] && echo "✅ No duplicates" || echo "❌ Found $DUPLICATES duplicates"

# Verify all imports use shared version
echo "=== Checking imports ==="
grep -r "from.*ref-resolution" lib/src --include="*.ts" | wc -l

# Full quality gates
pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test
```

---

### Section D: Multi-File Tests & Validation (1h)

**Objective:** Re-enable multi-file fixture and verify complete fix.

**Tasks:**

1. **Re-enable multi-file fixture** (15min)
   - Remove "temporarily disabled" comments from all 4 validation test files
   - Add multi-file fixture back to test arrays in:
     - `syntax-validation.gen.test.ts`
     - `type-check-validation.gen.test.ts`
     - `lint-validation.gen.test.ts`
     - `runtime-validation.gen.test.ts`

2. **Update fixture documentation** (15min)
   - Update `lib/tests-generated/FIXTURES.md`
   - Change multi-file status from "⚠️ TEMPORARILY DISABLED" to "✅ ENABLED"
   - Remove "known issue" text
   - Update reason to emphasize x-ext ref resolution

3. **Manual verification** (15min)
   - Generate code from multi-file spec via CLI
   - Inspect generated output for correct schema references
   - Verify no `[object Object]` or broken references
   - Document verification in commit message

4. **Full quality gate sweep** (15min)
   - Run all quality gates
   - Verify 20 generated code validation tests pass (5 fixtures × 4 validation types)
   - Verify all other tests still pass
   - Verify zero behavioral changes for single-file specs

**Acceptance Criteria:**

- [ ] Multi-file fixture re-enabled in all 4 validation test files
- [ ] `lib/tests-generated/FIXTURES.md` updated to mark multi-file as enabled
- [ ] `pnpm test:gen` → 20 tests passing (5 fixtures × 4 types)
- [ ] Manual CLI verification successful
- [ ] `pnpm format` → Passes
- [ ] `pnpm build` → Builds successfully
- [ ] `pnpm type-check` → 0 errors
- [ ] `pnpm lint` → 0 errors
- [ ] `pnpm test` → All passing (695+ tests)
- [ ] `pnpm test:snapshot` → All passing (158+ tests)
- [ ] `pnpm character` → All passing (148+ tests, including multi-file characterization)
- [ ] Zero behavioral changes for single-file specs

**Validation Steps:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Verify multi-file fixture re-enabled
echo "=== Checking multi-file fixture status ==="
! grep -r "temporarily disabled" lib/tests-generated/*.gen.test.ts && echo "✅ Fixture enabled" || echo "❌ Still disabled"

# Run generated code validation
pnpm test:gen
# Should show: 20 tests passing (5 fixtures × 4 validation types)

# Manual CLI test
cd lib
pnpm build
node dist/cli/index.js examples/openapi/multi-file/main.yaml -o /tmp/multi-file-test.ts
echo "✅ Generated from multi-file spec"
cat /tmp/multi-file-test.ts | head -50

# Full quality gate suite
cd ..
pnpm format && \
pnpm build && \
pnpm type-check && \
pnpm lint && \
pnpm test && \
pnpm test:gen && \
pnpm test:snapshot && \
pnpm character

echo "=== ✅ ALL VALIDATIONS PASSED ==="
```

**Commit Message Template:**

```
fix(multi-file): resolve Scalar x-ext $ref resolution

Session 3.1.5 - Multi-File $ref Resolution

Fixed multi-file OpenAPI spec support by implementing dual-path reference
resolution that understands both standard (#/components/schemas/X) and
Scalar vendor extension (#/x-ext/{hash}/components/schemas/X) formats.

Changes:
- Created lib/src/shared/ref-resolution.ts (centralized ref parsing)
- Enhanced getSchemaFromComponents() to search x-ext locations
- Consolidated 8+ duplicate getSchemaNameFromRef implementations
- Updated all ref resolution call sites to use shared utilities
- Re-enabled multi-file fixture in generated code validation tests
- Updated FIXTURES.md to mark multi-file as enabled

Impact:
- Multi-file specs now fully supported (no longer "temporarily disabled")
- Zero behavioral changes for single-file specs (backward compatible)
- Preserves Scalar's file provenance tracking (x-ext structure intact)
- Code generation, dependency graphs, and type conversion all work correctly

Quality Gates: All green (format ✅ build ✅ type-check ✅ lint ✅ test ✅ test:gen ✅ snapshot ✅ character ✅)
Tests: 695+ passing (including 20 generated code validation tests with multi-file)
Behavioral Changes: None for single-file specs; multi-file specs now functional

Refs: PHASE-3-SESSION-1.5-MULTI-FILE-REF-RESOLUTION.md
```

---

## Definition of Done

**CRITICAL: Multi-File Support Fully Functional**

- [ ] Centralized ref resolution: `lib/src/shared/ref-resolution.ts` created
- [ ] `parseComponentRef()` handles standard AND x-ext refs
- [ ] `getSchemaFromComponents()` searches both locations
- [ ] All 8+ duplicate `getSchemaNameFromRef` implementations consolidated
- [ ] All ref resolution call sites updated (dependency-graph, handlers, etc.)
- [ ] Multi-file fixture re-enabled in all 4 validation test files
- [ ] `lib/tests-generated/FIXTURES.md` updated (multi-file marked as enabled)
- [ ] Zero mentions of "temporarily disabled" for multi-file in test files

**Standard Completion Criteria**

- [ ] All work sections (A, B, C, D) completed
- [ ] All acceptance criteria met for each section
- [ ] All validation steps executed and passing
- [ ] Quality gate passes: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test && pnpm test:gen && pnpm test:snapshot && pnpm character`
- [ ] Zero behavioral changes for single-file specs (backward compatible)
- [ ] Comprehensive TSDoc for all new/changed functions
- [ ] Unit tests for ref resolution module (15+ new tests)
- [ ] Manual CLI verification successful (multi-file spec generates correctly)
- [ ] Commit created with proper message

**Breaking Changes (None)**

- Zero breaking changes (fully backward compatible)
- Single-file specs continue working unchanged
- Public API unchanged (internal refactoring only)

---

## Success Metrics

**Quantitative:**

- Lines of code added: ~150-200 (ref-resolution module + tests)
- Duplicate implementations removed: 8+ (consolidated to 1)
- Tests passing: 20 generated code validation tests (5 fixtures × 4 types)
- Quality gates: 8/8 passing

**Qualitative:**

- Multi-file specs fully functional (no longer disabled)
- Single source of truth for ref parsing
- Backward compatible (zero behavioral changes for single-file specs)
- Preserves Scalar's file provenance tracking
- Clear error messages for both ref formats

---

## Risk Mitigation

**Risk:** Breaking existing single-file specs  
**Mitigation:**
- Backward compatibility is primary design goal
- Standard ref resolution unchanged (x-ext is additive)
- Comprehensive test coverage for both formats
- Full regression suite execution

**Risk:** Performance impact from dual-path lookups  
**Mitigation:**
- x-ext lookup only attempted when xExtKey provided
- Standard location checked as fallback (minimal overhead)
- No performance regression expected

**Risk:** Incomplete consolidation (missing call sites)  
**Mitigation:**
- Grep verification for duplicate implementations
- Import analysis to ensure shared version used
- Comprehensive validation across all code paths

---

## References

- **Parent Plan:** `.agent/plans/PHASE-3-TS-MORPH-IR.md`
- **Session 3.1:** `.agent/plans/PHASE-3-SESSION-1-CODEMETA-ELIMINATION.md` (predecessor)
- **Session 3.2:** `.agent/plans/PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md` (successor)
- **Coding Standards:** `.agent/RULES.md` (TDD, pure functions, zero escape hatches)
- **Scalar Documentation:** Scalar preserves x-ext for file provenance tracking
- **Fixture Documentation:** `lib/tests-generated/FIXTURES.md` (multi-file fixture)

---

## Quick Start for Fresh Chat

**Preparation:**

````
I'm starting Phase 3 Session 1.5 (Multi-File $ref Resolution) on openapi-zod-client.

CRITICAL - Read these documents in order:
1. @RULES.md - Mandatory coding standards (TDD, type safety, TSDoc)
2. @HANDOFF.md - Project orientation and document navigation
3. @continuation_prompt.md - Complete AI context (architecture, decisions, patterns)
4. @context.md - Current session status and recent changes
5. @PHASE-3-SESSION-1.5-MULTI-FILE-REF-RESOLUTION.md - This detailed session plan
6. @PHASE-3-TS-MORPH-IR.md - Parent plan for context

CURRENT STATE:
- ✅ Phase 2 Complete (9 sessions): Scalar pipeline + MCP enhancements
- ✅ Phase 3 Session 1 Complete: CodeMeta deleted, pure functions extracted
- ⏳ Phase 3 Session 1.5: Multi-File $ref Resolution (this session)

PROBLEM:
Multi-file OpenAPI specs fail with "Schema 'Pet' not found" because our code
doesn't understand Scalar's x-ext vendor extension format for external refs.

OBJECTIVES:
1. Create centralized ref resolution module
2. Enhance component lookup to search x-ext locations
3. Consolidate 8+ duplicate implementations
4. Re-enable multi-file fixture (currently disabled)

SECTIONS:
- A: Centralized Ref Resolution (2-3h)
- B: Enhanced Component Lookup (1-2h)
- C: Integration & Consolidation (1-2h)
- D: Multi-File Tests & Validation (1h)

CRITICAL REQUIREMENTS:
- Follow strict TDD (write test → RED → implement → GREEN)
- Run quality gates OFTEN (after each section at minimum):
  ```bash
  pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test
  ```
- Zero behavioral changes for single-file specs (backward compatible)
- Comprehensive TSDoc for all ref resolution functions
- All quality gates must pass GREEN before considering work complete

PLAN STRUCTURE:
This plan follows the mandated structure with:
✅ Clear Goals - What we're trying to achieve
✅ Intended Impact - Why this matters and what changes
✅ Acceptance Criteria - Specific, measurable completion requirements
✅ Validation Steps - Concrete bash commands to verify success
✅ Quality Gates - Full suite execution (format, build, type-check, lint, test, test:gen, snapshot, character)

Note: All plans must include these elements. Validation is NOT complete until
the full quality gate suite passes, including build verification.

Ready to begin Section A: Centralized Ref Resolution.
````

---

**Ready for implementation.** All work must follow TDD and adhere strictly to RULES.md.

