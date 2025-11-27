# Phase 3 Plan – Typed IR & ts-morph Migration

**Status:** Session 3.2 IN PROGRESS - Type Discipline Restoration  
**Prerequisites:** Phase 2 complete ✅ (Scalar pipeline + MCP foundations stable)  
**Reference:** `.agent/reference/openapi-zod-client-emitter-migration.md`  
**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`

---

## 🎯 Engineering Excellence & Type Discipline

> **Mission:** Excellence and long-term stability over speed, every time.

This phase represents our unwavering commitment to engineering excellence and comprehensive type discipline. When critical type system violations were discovered in Session 3.2 (7 of 8 quality gates RED), we made the decision to **stop all forward progress** and restore type discipline throughout the codebase.

**Core Principles:**

1. **Types Are Our Friend** - Type errors reveal architectural problems, not nuisances to bypass
2. **Zero Tolerance for Escape Hatches** - No `as`, `any`, `!`, `Record<string, unknown>`, `Object.*`, `Reflect.*`
3. **Clean Breaks Over Hacks** - No compatibility layers, no temporary solutions, no "TODO: fix later"
4. **Library Types First** - Use `openapi3-ts/oas31` types before creating custom types
5. **TDD Throughout** - Write failing tests first, implement to pass, refactor for quality
6. **Preserve Type Information** - Never widen types unnecessarily, maintain literal types
7. **Comprehensive Documentation** - TSDoc for all public APIs with examples

**Non-Negotiables:**

- All quality gates must pass GREEN before proceeding
- Zero type assertions (except `as const`)
- Zero type widening
- Proper type guards using library types
- Test-driven development for all changes
- Comprehensive test coverage

This commitment to excellence may require more time, but it ensures long-term stability, maintainability, and the ability to refactor with confidence. **We choose correctness over convenience, and stability over speed.**

---

## Strategic Context

### Phase 3 Purpose: Foundation for Phase 4 Expansion

Phase 3 focuses on **eliminating technical debt** and **establishing the IR foundation** required for Phase 4's multi-artifact generation system. Consumer requirements (documented in `.agent/plans/feature_requests/additional_project_requirements.md` and `.agent/plans/feature_requests/mcp_ecosystem_integration_requirements.md`) describe a sophisticated writer architecture that **cannot be built** on the current Handlebars + CodeMeta system.

**Why Phase 3 Must Complete First:**

1. **CodeMeta Blocks Writer Architecture** - The poorly-conceived CodeMeta abstraction (ADR-013) prevents modular writers from consuming clean data structures.
2. **IR is Foundation** - Phase 4's multiple writers (types, metadata, zod, client, mcp) require a stable, lossless IR.
3. **ts-morph Enables Expansion** - AST-based generation is essential for complex artifacts (openapi-fetch types, parameter maps, enum catalogs).
4. **Handlebars Limits** - Template system cannot support deterministic manifest generation, hook systems, or bidirectional transformations.

**Phase 3 → Phase 4 Dependency Chain:**

```
Phase 3 (Foundation)          Phase 4 (Expansion - FUTURE)
├─ Session 3.1: Delete        ├─ Writer architecture
│  CodeMeta completely         ├─ openapi-fetch types
├─ Session 3.2-3.3: Define    ├─ Parameter/response maps
│  lossless IR + persistence   ├─ Enum catalogs + guards
├─ Session 3.4-3.6: Build     ├─ Hook system
│  ts-morph emitter            ├─ Deterministic manifests
├─ Session 3.7: Remove         └─ MCP tool descriptors
│  Handlebars completely
└─ Session 3.8-3.9: Add
   bidirectional transforms
```

**Consumer Requirements Summary** (Full Phase 4 Scope):

- Single-pass generation of types, constants, Zod, metadata, clients, MCP artifacts
- Modular writer architecture consuming shared IR
- Full `openapi-fetch` compatibility (`paths`, `operations`, `components`, `webhooks`)
- Comprehensive metadata (path catalogs, operation metadata, enum constants, parameter maps)
- Hook system for vendor-specific customizations (Oak National Academy use case)
- Deterministic manifest output with structured file descriptions
- MCP tooling support (operation iterators, sample utilities, tool naming helpers)

**See:** `.agent/plans/PHASE-4-ARTEFACT-EXPANSION.md` for complete Phase 4 details.

---

## Session Summary

| #   | Session                                             | Intent                                                                                                           | Est. Effort |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| 3.1 | CodeMeta Elimination & Pure Function Extract        | **Delete CodeMeta completely**, extract pure functions, align with JSON Schema pattern.                          | 12-16h      |
| 3.2 | IR Schema Foundations & Type Discipline Restoration | Define lossless IR with strict type discipline, restore engineering excellence, prepare for IR-based generation. | 40-50h      |
| 3.3 | IR Persistence & Validation Harness                 | Persist IR artefacts and prove the model can reproduce current outputs.                                          | 12-16h      |
| 3.4 | IR Enhancements & Additional Writers                | Enhance IR with additional metadata, implement specialized writers.                                              | 16-20h      |
| 3.5 | Bidirectional Tooling & Compliance                  | Implement reverse transforms (IR → OpenAPI) and schema validation gates.                                         | 20-24h      |
| 3.6 | Documentation & Release Prep                        | Update docs, ADRs, and final validation prior to release.                                                        | 8-12h       |

**Total Estimated Effort:** 92-122 hours (4-5 weeks)

**Note:** CodeMeta deleted in Session 3.1. Handlebars deleted in Session 3.2. Original Sessions 3.4-3.7 (ts-morph migration) eliminated since IR-based generation replaces Handlebars directly.

---

## 1. Vision & Success Criteria

- Replace Handlebars string templates with **IR-based code generation**, using a persistent information retrieval architecture (IR) shared by all generators.
- Enable **bidirectional transformations** between OpenAPI 3.1 documents and the generated Zod/TypeScript artefacts without information loss.
- Guarantee compatibility with the official OpenAPI schemas in `.agent/reference/openapi_schema/` (e.g. `openapi_3_1_x_schema_with_validation.json`) through automated validation.
- Maintain current public APIs (CLI + programmatic) while allowing new outputs (e.g. reverse OpenAPI generation, alternative clients) to be layered on the IR.
- **Note:** Direct IR-based generation replaces Handlebars without requiring ts-morph migration (ts-morph may be added later if AST manipulation is needed).

---

## 2. Guiding Principles

1. **IR First:** treat the IR as a versioned, lossless representation that fully captures operations, components, naming, refs, and metadata. IR-based generators consume this IR; round-tripping OpenAPI ↔ IR ↔ OpenAPI must be possible.
2. **Schema Authority:** validate every generated or reconstructed OpenAPI document against the official JSON Schemas shipped in `.agent/reference/openapi_schema/` to ensure compliance.
3. **Deterministic Outputs:** no behavioural drift—regressions guarded by existing characterisation tests (148 tests serve as safety net).
4. **Extensibility:** IR must support future generators (e.g. SDKs, docs) and the reverse pipeline (Zod → OpenAPI) described in the reference document.
5. **Single Generation System:** IR-based generation replaces Handlebars completely in Session 3.2 (not gradual migration).
6. **Phase 4 Readiness:** IR design must account for future writer needs (operation metadata, parameter maps, enum catalogs, response descriptors) documented in Phase 4 requirements.

---

## 3. Milestones (High Level)

### M1. IR Definition & Type Discipline Restoration (est. 2–3 weeks) - Session 3.2

- Define lossless IR schema (components, endpoints, dependency graphs, metadata) with strict type discipline.
- Restore engineering excellence throughout codebase (eliminate all type assertions, escape hatches, type widening).
- Establish zero-tolerance policy for type system violations per RULES.md.
- Refactor conversion layer to accept IRSchema directly (no compatibility layers).
- Update all test files with proper type guards for discriminated unions.
- Use characterisation tests (148) to prove zero behavioral changes.
- **Foundation for IR-based generation** (Handlebars removal deferred until generation layer complete).

### M2. IR Persistence & Validation (est. 1 week) - Session 3.3

- Serialise the IR alongside generated outputs (e.g. optional JSON artefact) to enable reverse transformations.
- Add validation tests ensuring IR can reconstruct current outputs.
- Establish automated formatting via Prettier pass on emitted files.
- Keep CLI/programmatic APIs feature-parity; guard with characterisation tests.

### M3. IR Enhancements & Additional Writers (est. 1 week) - Session 3.4

- Enhance IR with additional metadata for specialized writers.
- Implement additional IR-based writers (types, metadata, specialized formats).
- Update documentation and ADRs to reflect the new architecture.
- Measure performance/regression impacts; ensure quality gates pass.

### M4. Bidirectional & Compliance Tooling (est. 1–2 weeks) - Session 3.5

- Prototype OpenAPI regeneration (`IR → OpenAPI`) and validate with official schemas.
- Introduce reverse adapters (e.g. Zod runtime → IR) using preserved metadata hooks.
- Extend CI to execute schema validation against `.agent/reference/openapi_schema/*.json`.
- Document workflows for forward/backward conversion and publish migration guidance.

---

## 4. Deliverables

- Versioned IR module with types, validators, and change management policy.
- IR-based code generation system (supports disk + in-memory outputs, single-file + grouped strategies).
- **Handlebars completely removed** (templates archived to `.agent/archive/templates/` for reference).
- Automated compliance suite leveraging official OpenAPI schemas.
- Updated CLI/programmatic docs demonstrating IR inspection and future reverse-generation hook points.
- Migration notes for users (breaking changes, if any, must be clearly flagged—goal is zero).
- Archived legacy Handlebars assets and associated plans (see `.agent/archive/`).

---

## 5. Open Questions (track in plan updates)

- What metadata is still missing in the current context to guarantee lossless round-tripping?
- Do we need a versioned IR serialization format (e.g. JSON schema) for external tooling?
- How do we expose IR inspection programmatically (new exports vs. hidden implementation)?

---

**Next Steps:**

1. Review `.agent/reference/openapi-zod-client-emitter-migration.md` and confirm IR schema decisions.
2. Draft IR type definitions and validation helpers.
3. Schedule spike to compare ts-morph emission performance vs. current Handlebars pipeline.

---

## Sessions

### Session 3.1 – CodeMeta Elimination & Pure Function Extraction

**Status:** ✅ **COMPLETE** (Nov 11, 2025)  
**Prerequisites:** Phase 2 Part 2 complete (Sessions 5-9) ✅  
**Actual Effort:** ~12 hours (includes blocker resolution)  
**Commit:** `09d337e` - fix(phase3): resolve critical blockers for CodeMeta elimination

**Completion Summary (Nov 11, 2025):**

- ✅ **All Sections Complete (A, B, C, D0, D):** Pure functions extracted, CodeMeta deleted (0 mentions), plain objects in use
- ✅ **Bug Fixes Complete (2/2):**
  - Bug Fix #1: Reference resolution in `handleReferenceObject()` ✅
  - Bug Fix #2: Duplicate error responses in generated code ✅
- ✅ **Section D0 Complete:** Generated code validation infrastructure implemented
  - Created `lib/tests-generated/` with 4 modular test files + reusable harness
  - Created `lib/tests-generated/FIXTURES.md` documenting 5 representative fixtures
  - Created `lib/vitest.generated.config.ts` for dedicated test suite
  - Wired `pnpm test:gen` scripts in both `lib/package.json` and root via Turbo
  - All 16 validation tests passing (4 fixtures × 4 validation types)
- ✅ **Section D Complete:** All 3 critical blockers resolved
  - Code Generation Regression: Fixed 4 snapshot tests to use `.code` property
  - Linting Violations (60 errors): Resolved through proper TypeScript Compiler API usage, refactoring, RULES.md compliance
  - Workspace Hygiene: Deleted 6 `.mjs` files from `lib/` root
- ✅ **Quality Gates:** ALL GREEN (format, build, type-check, lint, test, test:gen, test:snapshot, character)

#### Intended Impact

**Problem:** CodeMeta is a poorly conceived abstraction (ADR-013) that mixes concerns, wraps string generation, and adds unnecessary complexity. It must be completely removed before ts-morph migration.

**Solution:** Extract pure functions for Zod string generation (following JSON Schema converter pattern) and **completely delete** CodeMeta. Replace all usages with plain objects `{ code: string; schema: SchemaObject; ref?: string }`. Clean break, no compatibility layer.

**Success Metrics:**

- **Zero mentions of CodeMeta** anywhere in codebase (complete eradication) ✅
- Pure function extraction complete (~100% of generation logic) ✅
- All handler functions use plain objects instead of CodeMeta instances ✅
- ts-morph migration simplified (no legacy abstractions to work around) ✅
- Zero behavioral changes (all tests passing) ❌ **BLOCKED - Code generation regression discovered**

#### Goals

1. **Extract Pure Functions** (8-10 hours)
   - Create `lib/src/conversion/zod/code-generation.ts` with pure string generation functions
   - Pattern: `generateZodString(schema: SchemaObject, options?) → string`
   - Extract all string generation logic from CodeMeta and handler functions
   - Functions should be testable, composable, and functional (no state)

2. **Delete CodeMeta Completely** (2-3 hours)
   - Delete `lib/src/shared/code-meta.ts` (159 lines)
   - Delete `lib/src/shared/code-meta.test.ts` (246 lines)
   - Remove all imports of `CodeMeta` and `CodeMetaData`
   - Remove exports from `lib/src/index.ts`

3. **Replace with Plain Objects** (2-3 hours)
   - Update all handler functions to return plain objects: `{ code: string; schema: SchemaObject; ref?: string }`
   - Update `getZodSchema()` to return plain object
   - Update all call sites to work with plain objects
   - Remove `.toString()`, `.assign()`, `.inherit()` patterns

4. **Align with JSON Schema Pattern**
   - Both converters use same architecture: pure functions, no wrapper classes
   - Both converters return plain objects
   - Both converters are testable, composable, functional

#### Acceptance Criteria

**Part A: Pure Function Extraction (8-10 hours)**

- [ ] New module created: `lib/src/conversion/zod/code-generation.ts`
- [ ] Pure functions extracted with complete Zod string generation logic:
  - `generatePrimitiveZod(schema: SchemaObject, options?: Options): string`
  - `generateObjectZod(schema: SchemaObject, options?: Options): string`
  - `generateArrayZod(schema: SchemaObject, options?: Options): string`
  - `generateCompositionZod(schema: SchemaObject, type: 'anyOf' | 'allOf' | 'oneOf', options?: Options): string`
  - `generateReferenceZod(ref: string, ctx?: ConversionTypeContext): string`
  - `generateEnumZod(schema: SchemaObject, options?: Options): string`
  - Any other generation helpers needed (extract from CodeMeta/handlers)
- [ ] Comprehensive unit tests for all pure functions (TDD approach)
- [ ] Pure functions are stateless, testable, composable

**Part B: Complete CodeMeta Deletion (2-3 hours)**

- [ ] `lib/src/shared/code-meta.ts` **DELETED** (file does not exist)
- [ ] `lib/src/shared/code-meta.test.ts` **DELETED** (file does not exist)
- [ ] All imports of `CodeMeta` removed from all files
- [ ] All imports of `CodeMetaData` removed from all files
- [ ] `CodeMeta` export removed from `lib/src/index.ts`
- [ ] `CodeMetaData` export removed from `lib/src/index.ts`
- [ ] **Zero mentions of "CodeMeta" in source code:**
  ```bash
  # This MUST return zero results (exit code 1)
  grep -r "CodeMeta" lib/src/ --include="*.ts" --include="*.tsx"
  ```
- [ ] **Zero mentions of "CodeMetaData" in source code:**
  ```bash
  # This MUST return zero results (exit code 1)
  grep -r "CodeMetaData" lib/src/ --include="*.ts" --include="*.tsx"
  ```

**Part C: Plain Object Replacement (2-3 hours)**

- [ ] `getZodSchema()` returns plain object: `{ code: string; schema: SchemaObject; ref?: string }`
- [ ] All handler functions return plain objects (not CodeMeta instances)
- [ ] All handler function call sites updated to work with plain objects
- [ ] No more `.toString()` calls (use `.code` directly)
- [ ] No more `.assign()` calls (use direct object creation)
- [ ] No more `.inherit()` calls (use function parameters)
- [ ] `.complexity` logic extracted to `lib/src/shared/schema-complexity.ts` helper if still needed
- [ ] All handler types updated (no `CodeMeta` in type signatures)

**Part D0: Generated Code Validation (2-3 hours)**

- [ ] 5-8 representative fixture specs identified and documented
- [ ] New test file created: `lib/tests-e2e/generated-code-validation.gen.test.ts`
- [ ] Test harness validates all representative fixtures
- [ ] All 4 validation types implemented (syntax, type-check, lint, runtime)
- [ ] Tests pass GREEN for all fixtures
- [ ] 6 quote-style implementation-constraint tests deleted from existing test files
- [ ] Generated code validation proves behavior (syntactic validity, type safety, lint compliance, runtime validity)

**Part D: Quality Gates & Verification (1-1.5 hours)**

- [ ] `pnpm format` → Passes
- [ ] `pnpm build` → Builds successfully
- [ ] `pnpm type-check` → 0 errors (no CodeMeta type references)
- [ ] `pnpm lint` → 0 errors
- [ ] `pnpm test:all` → All unit tests passing (CodeMeta tests deleted, others updated, generated code validation tests added)
- [ ] `pnpm test:snapshot` → All snapshot tests passing
- [ ] `pnpm character` → All characterization tests passing
- [ ] Zero behavioral changes (all outputs identical to before)
- [ ] **Eradication verification:**
  ```bash
  # ALL of these MUST return zero results
  grep -r "CodeMeta" lib/src/ --include="*.ts"
  grep -r "CodeMetaData" lib/src/ --include="*.ts"
  grep -ri "codemeta" lib/src/ --include="*.ts"
  test ! -f lib/src/shared/code-meta.ts && echo "✅ Deleted"
  test ! -f lib/src/shared/code-meta.test.ts && echo "✅ Deleted"
  ```

#### Validation Steps

**Step 1: Pure Function Extraction Validation (After Part A)**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Verify new module exists
test -f lib/src/conversion/zod/code-generation.ts || echo "❌ FAIL: code-generation.ts not created"
ls -la lib/src/conversion/zod/code-generation.ts

# Count exported functions
FUNC_COUNT=$(grep "^export function" lib/src/conversion/zod/code-generation.ts | wc -l | tr -d ' ')
if [ "$FUNC_COUNT" -ge 5 ]; then
  echo "✅ PASS: $FUNC_COUNT pure functions exported"
else
  echo "❌ FAIL: Only $FUNC_COUNT functions (need 5+)"
fi

# Run tests for pure functions
pnpm test:all --grep "code-generation"

# Compare with JSON Schema converter pattern
echo "Comparing with JSON Schema converter structure:"
ls -la lib/src/conversion/json-schema/convert-schema.ts
ls -la lib/src/conversion/zod/code-generation.ts
```

**Step 2: CodeMeta Deletion Validation (After Part B)**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# CRITICAL: Verify files deleted
test ! -f lib/src/shared/code-meta.ts && echo "✅ code-meta.ts deleted" || echo "❌ FAIL: code-meta.ts still exists"
test ! -f lib/src/shared/code-meta.test.ts && echo "✅ code-meta.test.ts deleted" || echo "❌ FAIL: code-meta.test.ts still exists"

# CRITICAL: Verify zero mentions in source code
echo "Checking for CodeMeta mentions..."
CODEMETA_COUNT=$(grep -r "CodeMeta" lib/src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CODEMETA_COUNT" -eq 0 ]; then
  echo "✅ PASS: Zero CodeMeta mentions"
else
  echo "❌ FAIL: Found $CODEMETA_COUNT mentions:"
  grep -r "CodeMeta" lib/src/ --include="*.ts" --include="*.tsx"
  exit 1
fi

# Verify CodeMetaData also gone
METADATA_COUNT=$(grep -r "CodeMetaData" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$METADATA_COUNT" -eq 0 ]; then
  echo "✅ PASS: Zero CodeMetaData mentions"
else
  echo "❌ FAIL: Found $METADATA_COUNT mentions"
  exit 1
fi

# Case-insensitive check
CASE_COUNT=$(grep -ri "codemeta" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CASE_COUNT" -eq 0 ]; then
  echo "✅ PASS: Zero case-insensitive matches"
else
  echo "❌ FAIL: Found $CASE_COUNT case-insensitive matches"
  exit 1
fi

# Verify exports removed
if grep -q "CodeMeta" lib/src/index.ts; then
  echo "❌ FAIL: Still exporting CodeMeta"
  exit 1
else
  echo "✅ PASS: CodeMeta removed from exports"
fi
```

**Step 3: Plain Object Replacement Validation (After Part C)**

```bash
# Verify getZodSchema returns plain object
grep -A 5 "export.*function getZodSchema" lib/src/conversion/zod/index.ts
# Should show: { code: string; schema: SchemaObject; ref?: string }

# Verify no more CodeMeta method calls
! grep -r "\.toString()" lib/src/conversion/zod/ --include="*.ts" || echo "⚠️  WARNING: .toString() calls found"
! grep -r "\.assign()" lib/src/conversion/zod/ --include="*.ts" || echo "⚠️  WARNING: .assign() calls found"
! grep -r "\.inherit()" lib/src/conversion/zod/ --include="*.ts" || echo "⚠️  WARNING: .inherit() calls found"

# Verify all handler functions return plain objects
echo "Checking handler function signatures..."
grep -r "return {" lib/src/conversion/zod/handlers*.ts | head -10
```

**Step 4: Full Quality Gate**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# CRITICAL: All must pass
pnpm format && \
pnpm build && \
pnpm type-check && \
pnpm lint && \
pnpm test:all && \
pnpm character

EXIT_CODE=$?
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ PASS: Full quality gate passed"
else
  echo "❌ FAIL: Quality gate failed with exit code $EXIT_CODE"
  exit 1
fi
```

**Step 5: Integration Testing**

```bash
# Test CLI still works
pnpm build
cd lib
node dist/cli/index.js ../examples/openapi/v3.1/tictactoe.yaml -o /tmp/test-output.ts
cat /tmp/test-output.ts  # Should contain valid Zod schemas

# Test programmatic API (plain object return)
node <<'EOF'
const { generateZodClientFromOpenAPI } = require('./dist/index.js');
const spec = { openapi: '3.1.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
generateZodClientFromOpenAPI({
  openApiDoc: spec,
  distPath: '/tmp/programmatic-test.ts',
  disableWriteToFile: true
}).then(result => {
  console.log('Result type:', typeof result);  // Should be "string" (the code)
  console.log('Generated:', result.length, 'characters');
});
EOF
```

**Step 6: Final Eradication Verification**

```bash
cd /Users/jim/code/personal/openapi-zod-client

echo "=== FINAL CODEMETA ERADICATION CHECK ==="

# Files must not exist
test ! -f lib/src/shared/code-meta.ts && echo "✅ code-meta.ts deleted" || exit 1
test ! -f lib/src/shared/code-meta.test.ts && echo "✅ code-meta.test.ts deleted" || exit 1

# Source code must have zero mentions
[ $(grep -r "CodeMeta" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] && echo "✅ Zero CodeMeta" || exit 1
[ $(grep -r "CodeMetaData" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] && echo "✅ Zero CodeMetaData" || exit 1
[ $(grep -ri "codemeta" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] && echo "✅ Zero case-insensitive" || exit 1

echo "=== ✅ CODEMETA COMPLETELY ERADICATED ==="
```

#### Definition of Done

**CRITICAL: Complete CodeMeta Eradication**

- [ ] `lib/src/shared/code-meta.ts` does NOT exist
- [ ] `lib/src/shared/code-meta.test.ts` does NOT exist
- [ ] Zero mentions of "CodeMeta" in `lib/src/` (case-sensitive)
- [ ] Zero mentions of "CodeMetaData" in `lib/src/` (case-sensitive)
- [ ] Zero mentions of "codemeta" in `lib/src/` (case-insensitive)
- [ ] Verification script passes:
  ```bash
  grep -r "CodeMeta" lib/src/ --include="*.ts" && exit 1 || echo "✅ Eradicated"
  ```

**Standard Completion Criteria**

- [ ] All acceptance criteria met (Parts A, B, C, D)
- [ ] All validation steps executed and passing (Steps 1-6)
- [ ] Quality gate passes: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`
- [ ] Zero behavioral changes (outputs identical to before)
- [ ] Pure functions module created: `lib/src/conversion/zod/code-generation.ts`
- [ ] All handler functions return plain objects
- [ ] `getZodSchema()` returns plain object: `{ code: string; schema: SchemaObject; ref?: string }`
- [ ] Code review completed
- [ ] Commit message: `refactor(zod): delete CodeMeta, extract pure functions`

**Breaking Changes (Accepted)**

- Public API changed: `getZodSchema()` returns plain object instead of CodeMeta instance
- CodeMeta class deleted (no migration path, no users)
- CodeMetaData type deleted (no migration path, no users)
- Clean break, zero backward compatibility

**Impact**

- ts-morph migration effort reduced by 50% (no legacy abstractions)
- Codebase simpler (405 lines deleted: 159 from class + 246 from tests)
- Architecture aligned with JSON Schema converter (consistency)
- Technical debt eliminated (poorly conceived abstraction removed)

#### Why This Is Required (Cannot Be Deferred)

- **Blocks ts-morph migration:** CodeMeta wraps string generation, incompatible with AST generation
- **No users:** This is a rewrite, no migration path needed
- **50% effort savings:** 12-16h investment saves 8-12h in Sessions 3.2-3.7
- **Clean architecture:** Aligns Zod converter with JSON Schema converter pattern
- **Removes technical debt:** Poorly conceived abstraction (ADR-013) deleted before it spreads

#### References

- CodeMeta analysis: `.agent/analysis/CODEMETA_ANALYSIS.md`
- CodeMeta current status: `.agent/analysis/CODEMETA_CURRENT_STATUS.md`
- ADR-013: "CodeMeta poorly conceived abstraction"
- JSON Schema converter (reference pattern): `lib/src/conversion/json-schema/convert-schema.ts`
- ADR-013: Architecture Rewrite Decision
- ADR-014: tanu to ts-morph Migration

---

### Session 3.1.5 – Multi-File $ref Resolution (Critical Blocker)

**Status:** ✅ **COMPLETE** (Nov 12, 2025)  
**Prerequisites:** Session 3.1 complete (CodeMeta class deleted) ✅  
**Actual Effort:** ~6 hours (includes comprehensive validation)  
**Commit:** `ad4533c` - fix(multi-file): resolve Scalar x-ext $ref resolution  
**Detailed Plan:** [PHASE-3-SESSION-1.5-MULTI-FILE-REF-RESOLUTION.md](./PHASE-3-SESSION-1.5-MULTI-FILE-REF-RESOLUTION.md)

#### Completion Summary (Nov 12, 2025)

**Problem:** Multi-file OpenAPI specs failed with "Schema 'Pet' not found in components.schemas" because ref resolution didn't understand Scalar's `#/x-ext/{hash}/components/schemas/X` vendor extension format.

**Solution:** Implemented dual-path reference resolution supporting both standard and x-ext formats.

**Changes:**

- ✅ Created `lib/src/shared/ref-resolution.ts` - Centralized ref parsing module with `ParsedRef` interface, `parseComponentRef()`, and `getSchemaNameFromRef()`
- ✅ Enhanced `getSchemaFromComponents()` to search x-ext locations first, then fall back to standard `components.schemas`
- ✅ Consolidated 8+ duplicate `getSchemaNameFromRef` implementations across codebase
- ✅ Updated 9 files to use centralized ref resolution: `handlers.core.ts`, `helpers.ts`, `handlers.object.properties.ts`, `handlers.object.schema.ts`, `helpers.naming.resolution.ts`, `dependency-graph.ts`, `infer-required-only.ts`, `template-context.common.ts`
- ✅ Re-enabled multi-file fixture in all 4 validation test files (syntax, type-check, lint, runtime)
- ✅ Updated `FIXTURES.md` documentation
- ✅ 26 comprehensive unit tests for ref resolution (standard, x-ext, bare names, legacy formats)
- ✅ Zero behavioral changes for single-file specs (backward compatible)

**Quality Gates:** All GREEN (format ✅ build ✅ type-check ✅ lint ✅ test ✅ test:gen ✅ snapshot ✅ character ✅)

**Tests:** 711+ passing (20 validation tests: 5 fixtures × 4 types, including multi-file)

**Files Created:**

- `lib/src/shared/ref-resolution.ts` (centralized ref parsing)
- `lib/src/shared/ref-resolution.test.ts` (26 unit tests)

**Files Modified:**

- Enhanced `lib/src/shared/component-access.ts` with x-ext support
- Updated 9 ref resolution call sites across conversion and context modules

**Impact:**

- ✅ Multi-file OpenAPI specs now fully supported
- ✅ Scalar x-ext vendor extension understood throughout codebase
- ✅ Zero code duplication for ref parsing
- ✅ Clear, maintainable ref resolution architecture
- ✅ Phase 4 consumer requirements unblocked

---

### Session 3.2 – IR Schema Foundations, CodeMetaData Replacement & Handlebars Removal

**Status:** ⏳ IN PROGRESS (~85% complete)  
**Prerequisites:** Session 3.1.5 complete (multi-file refs fixed) ✅  
**Estimated Effort:** 40-50 hours  
**Actual Effort So Far:** ~38 hours  
**Remaining:** ~5-7 hours  
**Detailed Plan:** [PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md](./PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md)

**Progress Update (2025-01-15):**

- ✅ Section A: IR Type Definitions COMPLETE
- ✅ Section B: IR Builder Implementation COMPLETE
- ✅ Section C: CodeMetaData Replacement COMPLETE
- ⏳ Section D: Type Discipline Restoration 90% COMPLETE
  - ✅ Production code: Zero type assertions, zero escape hatches
  - ✅ Test infrastructure: Helpers created and documented
  - ✅ Unit tests: ALL 828 passing (176 → 0 failures)
  - ⏳ Snapshot tests: 61 failures (10 files, next task)
  - ⏳ Character tests: 84 failures (11 files, after snapshots)
  - ⏳ Lint cleanup: 27 errors (after tests)
- ⏸️ Section E: Quality Gates & Validation (blocked until D complete)

**Quality Gates:** 5/8 GREEN (format, build, type-check, test, test:gen)

#### Intended Impact

Define a lossless information retrieval architecture (IR) that captures all OpenAPI metadata, **replaces CodeMetaData** with richer IR schema metadata, AND **completely removes Handlebars**. Implements IR-based code generation that produces identical outputs to Handlebars (proven by 148 characterization tests). Establishes foundation for Phase 4 modular writer architecture.

#### Goals

1. Design IR schema covering schemas, endpoints, dependency graphs, naming decisions, and metadata
2. Implement IR type definitions with versioning policy
3. **Replace CodeMetaData with IR schema metadata** (IRSchemaNode)
4. **Implement IR-based code generation** (single-file + grouped strategies)
5. **DELETE all Handlebars files, templates, and dependencies**
6. Prove zero behavioral changes using characterization tests

#### Acceptance Criteria

- [ ] IR type definitions created in `lib/src/context/ir-schema.ts`
- [ ] IRSchemaNode interface replaces CodeMetaData (includes required, nullable, dependency graph, inheritance, zod chain metadata)
- [ ] **CodeMetaData interface DELETED** (zero mentions in codebase)
- [ ] **Handlebars COMPLETELY DELETED** (5 .hbs files, handlebars.ts, dependency removed)
- [ ] IR-based code generation working (single-file + grouped strategies)
- [ ] Zero behavioral changes (148 characterization tests prove IR parity)
- [ ] Versioning policy documented (semver, breaking change handling)
- [ ] All Zod conversion functions use IR metadata
- [ ] Tests cover representative specs (petstore, tictactoe, multi-file)
- [ ] IR validators implemented (structure validation)
- [ ] Metadata gaps documented in open questions

#### Validation Steps

**Step 1: IR Type Definitions**

```bash
# Verify IR types exist
ls -la lib/src/context/ir-schema.ts
grep "export interface IR" lib/src/context/ir-schema.ts
pnpm type-check  # Must pass with new types
```

**Step 2: Context Builder Integration**

```bash
pnpm test -- run src/context/template-context.test.ts
pnpm test -- run src/context/ir-*.test.ts
# All existing tests must still pass
```

**Step 3: Characterization Tests**

```bash
pnpm character  # All 145 tests must pass unchanged
# Verify no output diffs
git diff lib/tests-snapshot/**/*.snap  # Should be empty
```

**Step 4: Full Quality Gate**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character
# All must pass - this is the quality gate
```

**Step 5: Manual IR Inspection**

```bash
# Generate IR for sample specs
node -e "
const { getZodClientTemplateContext } = require('./lib/dist/context/index.js');
const spec = require('./lib/examples/openapi/v3.1/tictactoe.yaml');
const ctx = getZodClientTemplateContext(spec);
console.log(JSON.stringify(ctx._ir, null, 2));
" > ir-snapshot.json
# Review ir-snapshot.json for completeness
```

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] All validation steps passing
- [ ] Quality gate passes
- [ ] IR module exported internally with validators
- [ ] Documentation updated with IR schema decisions
- [ ] Open questions documented for missing metadata

### Session 3.3 – IR Persistence & Validation Harness

- **Intent:** Persist IR artefacts (e.g., optional JSON sidecar) and introduce tests that replay IR back into the current Handlebars pipeline to guarantee fidelity.
- **Acceptance Criteria:**
  - Optional IR serialisation enabled via feature flag/CLI option.
  - Replay harness proves IR → Handlebars round-trip matches current outputs.
  - Documentation covers IR storage format and stability guarantees.
- **Definition of Done:**
  - Snapshot tests exercising IR persistence added.
  - CLI/programmatic API exposes IR dump toggle.
  - Reference docs updated with storage guidance.
- **Validation Steps:**
  1. `pnpm test -- run src/context/ir-persistence.test.ts`
  2. Characterisation run with IR serialisation enabled.
  3. Compare generated IR JSON against schema review checklist.

### Session 3.4 – ts-morph Emitter Skeleton

- **Intent:** Implement the foundational emitter utilities (`emitFilesTsMorph`, `printFilesToStrings`), formatting integration, and project scaffolding.
- **Acceptance Criteria:**
  - ts-morph project creation, import management, and declaration writers implemented per reference.
  - Prettier hook executed post-emission when configured.
  - Unit tests verify writer output for simple FileUnit fixtures.
- **Definition of Done:**
  - `emit-tsmorph.ts` and related utilities committed with TSDoc.
  - Tests covering both disk and in-memory printing pass.
  - CLI pathway behind feature flag to invoke emitter.
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/tsmorph/*.test.ts`
  2. Manual comparison of emitted simple fixture vs. Handlebars output.
  3. Prettier smoke test on emitted files.

### Session 3.5 – Single-File Output Migration

- **Intent:** Port the default single-file template strategy to the ts-morph emitter using the IR.
- **Acceptance Criteria:**
  - Single-file generation (schemas-with-metadata default) uses emitter with no behavioural regressions.
  - Characterisation fixtures updated to reference new pipeline (with expected cosmetic diffs noted).
  - CLI/programmatic paths honour existing flags for single-file output.
- **Definition of Done:**
  - Feature flag switched on for single-file path in development builds.
  - All single-file tests run through ts-morph codepath.
  - Regression baseline documented.
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/single-file.test.ts`
  2. Characterisation suite for single-file generation.
  3. Manual diff review for key fixtures (e.g., Engraph spec).

### Session 3.6 – Grouped Output Migration & CLI Parity

- **Intent:** Support grouped strategies (`tag`, `method`, file grouping, common schemas) and ensure CLI/programmatic APIs remain consistent.
- **Acceptance Criteria:**
  - Grouped outputs emit correct file structures via ts-morph.
  - CLI flags (group strategy, validation helpers, schema registry) fully supported.
  - Tests cover index/common file generation and metadata imports.
- **Definition of Done:**
  - Emitter feature flag covers all strategies.
  - CLI help/README updated to note new architecture (without breaking usage).
  - Characterisation fixtures refreshed for grouped outputs.
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/grouped-generation.test.ts`
  2. `pnpm test --filter characterisation -- grouped`
  3. Manual run of CLI grouped generation end-to-end.

### Session 3.7 – Handlebars Decommission & ts-morph Finalization

**Status:** Not started  
**Prerequisites:** Sessions 3.1-3.6 complete (CodeMeta deleted, IR + ts-morph emitter working) ✅  
**Estimated Effort:** 6-8 hours

#### Intended Impact

**Problem:** Dual code generation systems (Handlebars + ts-morph) create maintenance burden. Handlebars templates are obsolete with ts-morph AST generation.

**Solution:** Complete migration to ts-morph by removing all Handlebars infrastructure. ts-morph becomes the single source of truth for code generation. (Note: CodeMeta already deleted in Session 3.1)

**Success Metrics:**

- Zero Handlebars templates in repository
- Handlebars dependency removed from package.json
- ts-morph is default and only generation path
- All tests passing with no behavioral regressions
- No migration guide needed (no users)

#### Goals

1. **Remove Handlebars Infrastructure** (4-6 hours)
   - Delete all `.hbs` template files
   - Remove `handlebars` dependency from `lib/package.json`
   - Remove template-loading logic from `lib/src/rendering/`
   - Update build scripts (remove template compilation)
   - Delete any Handlebars helper functions

2. **Stabilize ts-morph** (2-3 hours)
   - Remove feature flags for ts-morph (now default and only option)
   - Update ADRs documenting completion (ADR-014)
   - Document breaking changes

#### Acceptance Criteria

**Part A: Handlebars Complete Removal**

- [ ] All `.hbs` template files deleted (or archived to `.agent/archive/templates/`)
- [ ] `handlebars` dependency removed from `lib/package.json`
- [ ] Template loader code removed from `lib/src/rendering/`
- [ ] Zero imports of `handlebars` anywhere in `lib/src/`
- [ ] Build scripts updated (no template compilation steps)
- [ ] Verification:
  ```bash
  find lib -name "*.hbs" | wc -l  # Must be 0
  grep -r "handlebars" lib/package.json | wc -l  # Must be 0
  grep -r "import.*handlebars" lib/src/ --include="*.ts" | wc -l  # Must be 0
  ```

**Part B: ts-morph Finalization**

- [ ] Feature flags removed (ts-morph is now default and only option)
- [ ] ADR-014 updated to "Completed" status
- [ ] All tests using ts-morph codepath (no Handlebars fallback)
- [ ] Performance benchmarks run (optional: compare with Handlebars baseline)

**Part C: Quality Gates**

- [ ] `pnpm format` → Passes
- [ ] `pnpm build` → Builds successfully (no Handlebars steps)
- [ ] `pnpm type-check` → 0 errors
- [ ] `pnpm lint` → 0 errors
- [ ] `pnpm test:all` → All tests passing
- [ ] `pnpm test:snapshot` → All snapshots passing
- [ ] `pnpm character` → All characterization tests passing

**Part D: Documentation**

- [ ] ADR-014 status: "Completed"
- [ ] CHANGELOG updated with breaking changes (Handlebars removed)
- [ ] README updated (remove any Handlebars mentions)
- [ ] Note: No migration guide needed (no users)

#### Validation Steps

**Step 1: Pre-Removal Audit**

```bash
# Document what's being removed
find lib -name "*.hbs" | tee handlebars-templates.txt
grep -r "import.*handlebars" lib/src/ --include="*.ts"
grep -r "CodeMeta" lib/src/ --include="*.ts" | wc -l
# Capture baseline
```

**Step 2: Handlebars Removal Validation**

```bash
# Verify Handlebars gone
find lib -name "*.hbs"  # Should be empty
grep -r "handlebars" lib/package.json  # Should be empty
grep -r "import.*handlebars" lib/src/ --include="*.ts"  # Should be empty

# Run quality gate
pnpm format && pnpm build && pnpm type-check && pnpm lint
```

**Step 3: Integration Testing**

```bash
# Test CLI still works
pnpm build
cd lib
node dist/cli/index.js ../examples/openapi/v3.1/tictactoe.yaml -o /tmp/test-output.ts
cat /tmp/test-output.ts  # Should contain valid Zod schemas

# Test programmatic API
node <<'EOF'
const { generateZodClientFromOpenAPI } = require('./dist/index.js');
const spec = { openapi: '3.1.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
generateZodClientFromOpenAPI({
  openApiDoc: spec,
  distPath: '/tmp/programmatic-test.ts',
  disableWriteToFile: true
}).then(code => console.log('Generated:', code.length, 'characters'));
EOF
```

**Step 4: Final Quality Gate**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# CRITICAL: Full quality gate must pass
pnpm format && \
pnpm build && \
pnpm type-check && \
pnpm lint && \
pnpm test:all && \
pnpm character

EXIT_CODE=$?
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ PASS: Full quality gate passed"
else
  echo "❌ FAIL: Quality gate failed with exit code $EXIT_CODE"
  exit 1
fi
```

**Step 5: Regression Testing**

```bash
# Run against representative specs
for spec in lib/examples/openapi/v3.1/*.yaml; do
  echo "Testing: $spec"
  node lib/dist/cli/index.js "$spec" -o "/tmp/test-$(basename $spec).ts"
done

# Verify all generated files are valid TypeScript
for file in /tmp/test-*.ts; do
  npx tsc --noEmit "$file" || echo "FAIL: $file"
done

echo "✅ All tests completed"
```

#### Definition of Done

**CRITICAL: Handlebars Complete Removal**

- [ ] Zero `.hbs` files in repository
- [ ] `handlebars` dependency removed from `package.json`
- [ ] Zero imports of `handlebars` in source code
- [ ] Verification commands pass:
  ```bash
  find lib -name "*.hbs" | wc -l  # Must be 0
  grep -r "handlebars" lib/package.json | wc -l  # Must be 0
  grep -r "import.*handlebars" lib/src/ --include="*.ts" | wc -l  # Must be 0
  ```

**ts-morph Finalization**

- [ ] Feature flags removed (ts-morph is default and only option)
- [ ] ADR-014 status: "Completed"
- [ ] All tests using ts-morph codepath (no Handlebars fallback)

**Standard Completion**

- [ ] All acceptance criteria met (Parts A, B, C, D)
- [ ] All validation steps executed and passing (Steps 1-5)
- [ ] Quality gate passes: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`
- [ ] CHANGELOG updated (Handlebars removed, ts-morph is now only generation system)
- [ ] README updated (remove Handlebars mentions)
- [ ] Code review completed
- [ ] Commit message: `feat(codegen): complete ts-morph migration, delete Handlebars`

**Impact**

- Single code generation system (ts-morph only)
- CodeMeta already deleted (Session 3.1)
- Handlebars infrastructure deleted (~1000+ lines)
- Maintenance burden reduced by 50%
- No users, no migration paths needed

#### Breaking Changes (for v2.0.0)

**Note:** CodeMeta breaking changes already handled in Session 3.1. This session only adds:

1. **Handlebars removed:** No more template-based generation
2. **ts-morph is only option:** Feature flags removed, ts-morph is default and only code generation system

**No public API changes in this session** (all breaking changes happened in Session 3.1)

#### Why This Is Critical

- Completes Phase 3 migration to ts-morph
- Eliminates dual code generation systems (Handlebars + ts-morph)
- Single code generation system (better maintainability)
- Enables Phase 4 (bidirectional tooling, advanced features)
- Clean foundation for future development

#### References

- Session 3.1: CodeMeta Elimination (already completed)
- Sessions 3.2-3.6: IR and ts-morph emitter implementation
- ADR-014: ts-morph Migration
- ADR-013: CodeMeta poor abstraction (already resolved in 3.1)

### Session 3.8 – Bidirectional Tooling & Compliance

- **Intent:** Implement IR → OpenAPI regeneration, optional Zod/runtime → IR adapters, and enforce schema validation gates.
- **Acceptance Criteria:**
  - Reverse generator produces OpenAPI docs that validate against official schemas.
  - Optional runtime adapters documented (even if partial).
  - CI task added for schema validation.
- **Definition of Done:**
  - Reverse pipeline accessible via CLI/programmatic option.
  - Validation suite with official schemas integrated.
  - Characterisation test demonstrates round-trip (OpenAPI → IR → OpenAPI).
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/reverse/*.test.ts`
  2. Schema validation command (AJV) over regenerated specs.
  3. Characterisation round-trip diff ensures stability.

### Session 3.9 – Documentation & Release Prep

**Status:** Not started  
**Prerequisites:** Sessions 3.1-3.8 complete (ts-morph migration complete) ✅  
**Estimated Effort:** 8-12 hours

#### Intended Impact

Finalize all documentation, capture architectural decisions, prepare migration guidance, and ensure Phase 3 deliverables are release-ready with comprehensive v2.0.0 documentation.

#### Goals

1. Update all documentation for ts-morph architecture
2. Complete ADRs documenting Phase 3 decisions
3. Prepare v2.0.0 release candidate with migration guide
4. Final quality assurance across all deliverables

#### Acceptance Criteria

- [ ] README.md updated with new architecture (IR + ts-morph)
- [ ] CLI documentation updated (help text, examples)
- [ ] API documentation generated (TypeDoc)
- [ ] ADR-014 status: "Completed" with Phase 3 summary
- [ ] Migration guide complete: `docs/MIGRATION-2.0.md`
- [ ] CHANGELOG.md updated with breaking changes
- [ ] Release notes drafted
- [ ] All open questions from sessions triaged or closed

#### Validation Steps

**Step 1: Documentation Completeness**

```bash
# Verify all docs updated
ls -la docs/MIGRATION-2.0.md
grep -i "ts-morph" README.md
grep -i "CodeMeta" README.md  # Should mention removal

# Check ADRs
grep "Status:" docs/architectural_decision_records/ADR-014-*.md
```

**Step 2: API Documentation Generation**

```bash
# Generate TypeDoc
pnpm typedoc --treatWarningsAsErrors
# Should generate without errors

# Review generated docs
open docs/api/index.html
```

**Step 3: Final Quality Gate (CRITICAL)**

```bash
# Full quality gate - MUST PASS for release
pnpm format && \
pnpm build && \
pnpm type-check && \
pnpm lint && \
pnpm test:all && \
pnpm character

# Verify exit code
echo "Quality gate status: $?"  # Must be 0
```

**Step 4: Release Candidate Validation**

```bash
# Create release candidate
git tag v2.0.0-rc.1
pnpm pack

# Test installation from tarball
cd /tmp
tar -xzf /path/to/tarball.tgz
cd package
npm install
npm test
```

**Step 5: Migration Guide Validation**

```bash
# Review migration guide
cat docs/MIGRATION-2.0.md
# Should cover:
# - CodeMeta removal
# - New API types
# - Breaking changes
# - Step-by-step migration
```

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] All validation steps passing
- [ ] Quality gate passes
- [ ] Release candidate tagged (v2.0.0-rc.1)
- [ ] Documentation reviewed and approved
- [ ] Ready for Phase 3 closure

---

## Session Validation Pattern

**Note:** Sessions 3.3-3.6 and 3.8 (not yet detailed above) MUST follow the same comprehensive validation pattern as Sessions 3.1, 3.2, 3.7, and 3.9:

1. **Intended Impact** - Clear problem/solution/metrics
2. **Goals** - Specific, measurable objectives
3. **Acceptance Criteria** - Detailed checklist with checkboxes
4. **Validation Steps** - Bash commands that can be copy-pasted
5. **Definition of Done** - Explicit completion criteria
6. **Quality Gate** - ALWAYS include: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`

Each session MUST run the full quality gate at least once (typically at the end), and critical sessions should run it multiple times during implementation to catch regressions early.

---

## Phase 3 Success Criteria

- [ ] All 9 sessions complete with quality gates passing
- [ ] CodeMeta fully removed (prep work in 3.1, completion in 3.7)
- [ ] Handlebars fully removed (3.7)
- [ ] ts-morph is sole code generation system
- [ ] IR enables bidirectional transformations
- [ ] Zero behavioral regressions (characterization tests unchanged)
- [ ] v2.0.0 released with comprehensive migration guide
- [ ] All breaking changes documented
- [ ] ADRs updated (Phase 3 complete)
