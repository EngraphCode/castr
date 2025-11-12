# Phase 3 Session 2 – IR Schema Foundations, CodeMetaData Replacement & Handlebars Removal

**Status:** Ready to Start  
**Estimated Effort:** 24-34 hours  
**Prerequisites:**

- Phase 3 Session 1 complete (CodeMeta class deleted) ✅
- Phase 3 Session 1.5 complete (Multi-file $ref resolution) ✅  
  **Parent Plan:** [PHASE-3-TS-MORPH-IR.md](./PHASE-3-TS-MORPH-IR.md) § "Session 3.2 – IR Schema Foundations"  
  **Standards:** Must comply with [.agent/RULES.md](../RULES.md) — strict TDD, library types only, zero escape hatches, pure functions, exhaustive documentation

---

## Session Objectives

- **Define lossless Intermediate Representation (IR)** schema that captures all OpenAPI metadata
- **Replace CodeMetaData** interface with richer IR schema metadata
- **Implement IR-based code generation** that replaces Handlebars completely
- **DELETE all Handlebars files, templates, and dependencies**
- **Enable bidirectional transformations** (OpenAPI ↔ IR ↔ Generated Code)
- **Maintain zero behavioral changes** (use characterization tests as safety net)

---

## Strategic Context

### Why IR is Critical

**Problem:** Current architecture has two separate issues:

1. ✅ **RESOLVED (Session 3.1):** CodeMeta class was a poorly-conceived abstraction
2. ⚠️ **REMAINING:** CodeMetaData is conversion-time metadata that's insufficient for IR needs

**Current State:**

- Handlebars templates consume `TemplateContext` directly
- CodeMetaData tracks minimal conversion metadata (isRequired, referencedBy, parent)
- No intermediate representation between OpenAPI and code generation
- Cannot support bidirectional transformations
- Cannot support multiple code generators (types, zod, client, mcp)

**Target State (After Session 3.2):**

- Lossless IR captures ALL OpenAPI information + generation metadata
- IR-based code generation produces TypeScript/Zod strings directly (no templates)
- CodeMetaData completely replaced with IR schema metadata
- **Handlebars completely DELETED** (templates, handlebars.ts, dependency)
- Foundation ready for additional writers and Phase 4 expansion

### Alignment with Phase 3 Goals

**Phase 3 Goal:** Eliminate technical debt and establish IR foundation for Phase 4 expansion

**Session 3.2 Deliverables:**

- IR type definitions with versioning
- Schema node metadata (replaces CodeMetaData)
- Dependency graph structure
- IR-based code generation (replaces Handlebars)
- **Handlebars complete removal** (5 .hbs files, handlebars.ts, dependency)
- Zero behavioral changes (characterization tests prove parity)

**Enables:**

- Session 3.3: IR persistence and validation
- Session 3.4+: Additional IR-based writers
- Phase 4: Modular writer architecture

---

## Work Sections

### Section A: IR Type Definitions (6-8 hours)

**Objective:** Define comprehensive IR schema types that capture all OpenAPI information.

**Intended Impact:**

- Lossless representation of OpenAPI documents
- Rich metadata for code generation (replaces CodeMetaData)
- Dependency graph for circular reference handling
- Foundation for bidirectional transformations

**Tasks:**

1. **Create IR Schema Module** (2h)
   - Create `lib/src/context/ir-schema.ts`
   - Define core IR interfaces (IRDocument, IRComponent, IROperation, IRSchema)
   - Define versioning policy (semver for breaking changes)
   - Add comprehensive TSDoc

2. **Define Schema Node Metadata** (2h)
   - Create `IRSchemaNode` interface (replaces CodeMetaData)
   - Include: required/optional, nullable/nullish, circular references
   - Include: dependency graph, parent relationships, composition type
   - Include: Zod chain metadata (presence, validations, defaults)

3. **Define Dependency Graph Structure** (2h)
   - Create `IRDependencyGraph` interface
   - Track schema references and circular dependencies
   - Compute reference depth and traversal order
   - Enable deterministic code generation order

4. **Add IR Validators** (2h)
   - Create `lib/src/context/ir-validators.ts`
   - Implement type guards for IR structures
   - Add structural validation functions
   - Follow TDD: write tests first

**Acceptance Criteria:**

- [ ] New module exists: `lib/src/context/ir-schema.ts`
- [ ] Core IR interfaces defined:
  - [ ] `IRDocument` (top-level document representation)
  - [ ] `IRComponent` (schemas, responses, parameters, etc.)
  - [ ] `IROperation` (endpoint operations with metadata)
  - [ ] `IRSchema` (schema nodes with rich metadata)
  - [ ] `IRDependencyGraph` (reference tracking and circular detection)
- [ ] `IRSchemaNode` interface replaces CodeMetaData functionality:
  - [ ] `required: boolean` (from CodeMetaData.isRequired)
  - [ ] `nullable: boolean` (computed from schema types)
  - [ ] `dependencyGraph` (from CodeMetaData.referencedBy, enhanced)
  - [ ] `inheritance` (from CodeMetaData.parent, enhanced)
  - [ ] `zodChain` (presence, validations, defaults)
- [ ] Versioning policy documented in TSDoc
- [ ] IR validators module: `lib/src/context/ir-validators.ts`
- [ ] Type guards implemented for all IR interfaces
- [ ] Comprehensive TSDoc for all interfaces (with examples)
- [ ] `pnpm type-check` → 0 errors

**Validation Steps:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Step 1: Verify IR module exists
test -f lib/src/context/ir-schema.ts && echo "✅ IR schema module created" || echo "❌ Missing"

# Step 2: Verify core interfaces defined
echo "=== Checking IR Interfaces ==="
grep "export interface IRDocument" lib/src/context/ir-schema.ts && echo "✅ IRDocument"
grep "export interface IRComponent" lib/src/context/ir-schema.ts && echo "✅ IRComponent"
grep "export interface IROperation" lib/src/context/ir-schema.ts && echo "✅ IROperation"
grep "export interface IRSchema" lib/src/context/ir-schema.ts && echo "✅ IRSchema"
grep "export interface IRSchemaNode" lib/src/context/ir-schema.ts && echo "✅ IRSchemaNode"
grep "export interface IRDependencyGraph" lib/src/context/ir-schema.ts && echo "✅ IRDependencyGraph"

# Step 3: Verify validators module
test -f lib/src/context/ir-validators.ts && echo "✅ Validators module created" || echo "❌ Missing"

# Step 4: Count type guards
GUARD_COUNT=$(grep "function is.*IR.*:" lib/src/context/ir-validators.ts | wc -l | tr -d ' ')
[ "$GUARD_COUNT" -ge 4 ] && echo "✅ $GUARD_COUNT type guards" || echo "❌ Only $GUARD_COUNT"

# Step 5: Type check
pnpm type-check 2>&1 | tail -5
```

---

### Section B: IR Builder + Code Generation (8-12 hours)

**Objective:** Build IR from OpenAPI and implement IR-based code generation that replaces Handlebars.

**Intended Impact:**

- IR populated from OpenAPI document (lossless representation)
- Code generated DIRECTLY from IR (not via Handlebars templates)
- Zero behavioral changes (use characterization tests to prove parity)
- Can run Handlebars in parallel temporarily during development for validation
- Foundation for additional writers and Phase 4 expansion

**Tasks:**

1. **Create IR Builder Module** (3-4h)
   - Create `lib/src/context/ir-builder.ts`
   - Implement `buildIR(doc: OpenAPIObject): IRDocument`
   - Follow existing context builder patterns
   - Follow TDD: write tests first

2. **Implement IR-Based Code Generation** (4-6h)
   - Create `lib/src/rendering/generate-from-ir.ts`
   - Implement code generation functions that consume IR
   - Generate TypeScript/Zod strings directly (no templates)
   - Support single-file and grouped strategies
   - Use characterization tests (148) to validate parity

3. **Add IR Builder & Generator Tests** (2h)
   - Create `lib/src/context/ir-builder.test.ts`
   - Create `lib/src/rendering/generate-from-ir.test.ts`
   - Test representative specs (petstore, tictactoe, multi-file)
   - Verify IR structure completeness
   - Verify zero output changes

**Acceptance Criteria:**

- [ ] New module exists: `lib/src/context/ir-builder.ts`
- [ ] New module exists: `lib/src/rendering/generate-from-ir.ts`
- [ ] `buildIR()` function implemented
- [ ] IR-based code generation working (single-file + grouped strategies)
- [ ] Code generated DIRECTLY from IR (not via Handlebars)
- [ ] Zero behavioral changes (148 characterization tests pass)
- [ ] IR builder tests: `lib/src/context/ir-builder.test.ts`
- [ ] Generator tests: `lib/src/rendering/generate-from-ir.test.ts`
- [ ] Tests cover representative specs (petstore, tictactoe, multi-file)
- [ ] `pnpm test` → All passing (679+ tests)
- [ ] `pnpm character` → All passing (148 tests proving parity)
- [ ] `pnpm type-check` → 0 errors

**Validation Steps:**

```bash
# Step 1: Verify IR builder module
test -f lib/src/context/ir-builder.ts && echo "✅ IR builder created" || echo "❌ Missing"
grep "export function buildIR" lib/src/context/ir-builder.ts && echo "✅ buildIR function exported"

# Step 2: Verify test file
test -f lib/src/context/ir-builder.test.ts && echo "✅ IR builder tests created" || echo "❌ Missing"

# Step 3: Run IR builder tests
pnpm test -- run src/context/ir-builder.test.ts

# Step 4: Verify zero behavioral changes
pnpm test 2>&1 | tail -10
# Should show: 679+ tests passing

# Step 5: Type check
pnpm type-check
```

---

### Section C: CodeMetaData Replacement (6-8 hours)

**Objective:** Replace all CodeMetaData usages with IR schema metadata.

**Intended Impact:**

- CodeMetaData interface completely removed
- All conversion code uses IR schema metadata
- Richer metadata available for code generation
- Zero behavioral changes (outputs identical)

**Tasks:**

1. **Create IR Metadata Adapter** (2h)
   - Create `lib/src/conversion/zod/ir-metadata-adapter.ts`
   - Implement adapter functions to extract metadata from IR
   - Replace CodeMetaData with IRSchemaNode references
   - Follow TDD: write tests first

2. **Update Zod Conversion Functions** (3-4h)
   - Update all functions in `lib/src/conversion/zod/` to use IR metadata
   - Replace `CodeMetaData` parameter with `IRSchemaNode`
   - Update imports and type signatures
   - Ensure zero behavioral changes (run tests frequently)

3. **Delete CodeMetaData** (1h)
   - Remove `CodeMetaData` interface from `lib/src/conversion/zod/index.ts`
   - Remove all imports of `CodeMetaData`
   - Update public API exports
   - Run eradication verification

4. **Update Tests** (1h)
   - Update all tests using CodeMetaData
   - Use IR schema metadata instead
   - Verify all tests passing

**Acceptance Criteria:**

- [ ] New module exists: `lib/src/conversion/zod/ir-metadata-adapter.ts`
- [ ] Adapter functions implemented:
  - [ ] `getRequiredFromIR(node: IRSchemaNode): boolean`
  - [ ] `getNullableFromIR(node: IRSchemaNode): boolean`
  - [ ] `getPresenceChainFromIR(node: IRSchemaNode): string`
  - [ ] `getCircularReferencesFromIR(node: IRSchemaNode): string[]`
- [ ] All Zod conversion functions updated:
  - [ ] `lib/src/conversion/zod/index.ts`
  - [ ] `lib/src/conversion/zod/handlers.core.ts`
  - [ ] `lib/src/conversion/zod/handlers.object.properties.ts`
  - [ ] `lib/src/conversion/zod/handlers.object.schema.ts`
  - [ ] `lib/src/conversion/zod/composition.ts`
  - [ ] `lib/src/conversion/zod/chain.ts`
- [ ] CodeMetaData interface DELETED from `lib/src/conversion/zod/index.ts`
- [ ] Zero mentions of "CodeMetaData" in `lib/src/conversion/zod/`
- [ ] Zero mentions of "CodeMetaData" in entire `lib/src/` (verified via grep)
- [ ] All imports updated
- [ ] Public API exports updated
- [ ] All tests passing
- [ ] Zero behavioral changes (outputs identical)
- [ ] `pnpm test` → All passing (679+ tests)
- [ ] `pnpm type-check` → 0 errors

**Validation Steps:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Step 1: Verify adapter module
test -f lib/src/conversion/zod/ir-metadata-adapter.ts && echo "✅ Adapter created" || echo "❌ Missing"

# Step 2: CRITICAL - CodeMetaData eradication check
echo "=== CodeMetaData Eradication Verification ==="
CODEMETADATA_COUNT=$(grep -r "CodeMetaData" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CODEMETADATA_COUNT" -eq 0 ]; then
  echo "✅ PASS: Zero CodeMetaData mentions"
else
  echo "❌ FAIL: Found $CODEMETADATA_COUNT mentions:"
  grep -r "CodeMetaData" lib/src/ --include="*.ts"
  exit 1
fi

# Step 3: Verify no references in conversion code
! grep -r "CodeMetaData" lib/src/conversion/zod/ --include="*.ts" && echo "✅ No CodeMetaData in Zod conversion" || echo "❌ FAIL"

# Step 4: Verify exports updated
! grep -q "CodeMetaData" lib/src/index.ts && echo "✅ Removed from public API" || echo "❌ FAIL"

# Step 5: Run tests
pnpm test 2>&1 | tail -10
# Should show: 679+ tests passing

echo "=== ✅ CODEMETADATA COMPLETELY ERADICATED ==="
```

---

### Section D: Handlebars Complete Removal (2-3 hours)

**Objective:** Delete all Handlebars files, templates, and dependencies from the repository.

**Intended Impact:**

- Handlebars completely removed (5 .hbs files, handlebars.ts, dependency)
- IR-based generation is the only code generation system
- Cleaner codebase with single generation pathway
- Foundation ready for Phase 4 modular writer architecture

**Tasks:**

1. **Delete Handlebars Templates** (30min)
   - Delete all 5 `.hbs` files in `lib/src/rendering/templates/`
   - Archive to `.agent/archive/templates/` if needed for reference

2. **Delete Handlebars Code** (1h)
   - Delete `lib/src/rendering/handlebars.ts`
   - Delete `lib/src/rendering/handlebars.test.ts`
   - Update `lib/src/rendering/templating.ts` to use IR-based generation
   - Update `lib/src/rendering/generate-from-context.ts` to use IR-based generation
   - Remove handlebars imports from all files

3. **Remove Handlebars Dependency** (30min)
   - Remove `"handlebars": "^4.7.8"` from `lib/package.json`
   - Run `pnpm install` to update lockfile

4. **Eradication Verification** (30min)
   - Run grep checks for handlebars references
   - Verify all handlebars imports removed
   - Verify all .hbs files deleted
   - Run full quality gate

**Acceptance Criteria:**

- [ ] Zero `.hbs` files in repository (all 5 deleted or archived)
- [ ] `lib/src/rendering/handlebars.ts` DELETED
- [ ] `lib/src/rendering/handlebars.test.ts` DELETED
- [ ] `handlebars` dependency removed from `lib/package.json`
- [ ] Zero imports/requires of `handlebars` in source code
- [ ] Zero mentions of "handlebars" (case-insensitive) in `lib/src/`:
  ```bash
  grep -ri "handlebars" lib/src/ --include="*.ts" | wc -l  # Must be 0
  find lib -name "*.hbs" | wc -l  # Must be 0
  grep -i "handlebars" lib/package.json | wc -l  # Must be 0
  ```
- [ ] All quality gates passing with IR-based generation only
- [ ] `pnpm character` → All 148 tests passing (proving IR parity)

**Validation Steps:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Step 1: Verify .hbs files deleted
find lib -name "*.hbs" | wc -l
# Should output: 0

# Step 2: Verify handlebars.ts deleted
test ! -f lib/src/rendering/handlebars.ts && echo "✅ handlebars.ts deleted" || echo "❌ Still exists"
test ! -f lib/src/rendering/handlebars.test.ts && echo "✅ handlebars.test.ts deleted" || echo "❌ Still exists"

# Step 3: Verify no handlebars imports
HANDLEBARS_IMPORTS=$(grep -ri "handlebars" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
[ "$HANDLEBARS_IMPORTS" -eq 0 ] && echo "✅ Zero handlebars imports" || echo "❌ Found $HANDLEBARS_IMPORTS imports"

# Step 4: Verify dependency removed
! grep -i "handlebars" lib/package.json && echo "✅ Dependency removed" || echo "❌ Still in package.json"

# Step 5: Run characterization tests (prove IR parity)
pnpm character 2>&1 | tail -10
# Should show: 148 tests passing

echo "=== ✅ HANDLEBARS COMPLETELY ERADICATED ==="
```

---

### Section E: Quality Gates & Validation (2-3 hours)

**Objective:** Ensure all quality gates pass with IR-based generation and Handlebars completely removed.

**Intended Impact:**

- All quality gates GREEN
- IR infrastructure validated and ready
- Zero behavioral changes confirmed
- Documentation complete
- Session ready for handoff to Session 3.3

**Tasks:**

1. **Run Full Quality Gate Suite** (1h)
   - Execute all quality gates
   - Fix any issues discovered
   - Verify zero behavioral changes

2. **IR Inspection & Validation** (30min)
   - Manually inspect IR structure for representative specs
   - Verify IR completeness (all metadata present)
   - Document any gaps or missing information

3. **Documentation Updates** (30min)
   - Update session plan status
   - Update context.md with session completion
   - Update ADR-013 (CodeMeta resolution)
   - Prepare commit message

4. **Final Verification** (30min)
   - Run eradication check for CodeMetaData
   - Verify all acceptance criteria met
   - Run validation commands
   - Prepare for Session 3.3

**Acceptance Criteria:**

- [ ] `pnpm format` → Passes
- [ ] `pnpm build` → Builds successfully (0 errors)
- [ ] `pnpm type-check` → 0 errors
- [ ] `pnpm lint` → 0 errors
- [ ] `pnpm test` → All passing (679+ tests, 0 failures, 0 skipped)
- [ ] `pnpm test:gen` → All passing (16 tests)
- [ ] `pnpm test:snapshot` → All passing (158+ tests)
- [ ] `pnpm character` → All passing (148+ tests)
- [ ] Zero behavioral changes (outputs identical)
- [ ] CodeMetaData completely eradicated (0 mentions)
- [ ] IR inspection complete (gaps documented)
- [ ] ADR-013 updated: "CodeMeta resolved in Session 3.1; CodeMetaData replaced with IR in Session 3.2"
- [ ] Session plan updated: Status → "Complete"
- [ ] Commit message prepared

**Validation Steps:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# CRITICAL: Full quality gate must pass
echo "=== Running Full Quality Gate Suite ==="
pnpm format && \
pnpm build && \
pnpm type-check && \
pnpm lint && \
pnpm test && \
pnpm test:gen && \
pnpm test:snapshot && \
pnpm character

EXIT_CODE=$?
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ PASS: Full quality gate passed"
else
  echo "❌ FAIL: Quality gate failed with exit code $EXIT_CODE"
  exit 1
fi

# Final CodeMetaData eradication verification
echo "=== FINAL CODEMETADATA ERADICATION CHECK ==="
METADATA_COUNT=$(grep -r "CodeMetaData" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$METADATA_COUNT" -eq 0 ]; then
  echo "✅ PASS: Zero CodeMetaData mentions"
else
  echo "❌ FAIL: Found $METADATA_COUNT mentions"
  exit 1
fi

# Case-insensitive check
CASE_COUNT=$(grep -ri "codemetadata" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
[ "$CASE_COUNT" -eq 0 ] && echo "✅ PASS: Zero case-insensitive matches" || echo "❌ FAIL: Found $CASE_COUNT matches"

# IR structure inspection
echo "=== IR Structure Inspection ==="
echo "Inspecting IR for petstore-expanded.yaml..."
node -e "
const { getZodClientTemplateContext } = require('./lib/dist/context/index.js');
const { readFileSync } = require('fs');
const yaml = require('yaml');
const spec = yaml.parse(readFileSync('./lib/examples/openapi/v3.0/petstore-expanded.yaml', 'utf-8'));
const ctx = getZodClientTemplateContext({ openApiDoc: spec });
if (ctx._ir) {
  console.log('✅ IR present in context');
  console.log('IR keys:', Object.keys(ctx._ir));
} else {
  console.log('⚠️  IR not yet populated (expected until Section B complete)');
}
"

echo "=== ✅ ALL VALIDATIONS PASSED ==="
```

**Commit Message Template:**

```
feat(ir): establish IR schema foundations, replace CodeMetaData

Session 3.2 - IR Schema Foundations & CodeMetaData Replacement

Established lossless Intermediate Representation (IR) to capture all
OpenAPI metadata and enable bidirectional transformations. Replaced
CodeMetaData interface with richer IR schema metadata.

Changes:
- Created lib/src/context/ir-schema.ts (IR type definitions)
- Created lib/src/context/ir-validators.ts (type guards and validation)
- Created lib/src/context/ir-builder.ts (IR population)
- Created lib/src/conversion/zod/ir-metadata-adapter.ts (adapter functions)
- Updated all Zod conversion functions to use IR metadata
- Deleted CodeMetaData interface completely
- Integrated IR building into context assembly

Impact:
- Lossless IR captures all OpenAPI information
- Rich schema metadata (required, nullable, circular refs, dependency graph)
- CodeMetaData completely replaced (0 mentions)
- Zero behavioral changes (outputs identical)
- Foundation ready for ts-morph emitter (Sessions 3.4-3.6)
- Handlebars decommission unblocked (Session 3.7)

Quality Gates: All green (format ✅ build ✅ type-check ✅ lint ✅ test ✅ test:gen ✅ snapshot ✅ character ✅)
Tests: 679+ passing, 0 failures, 0 skipped
Behavioral Changes: None (outputs identical)

Refs: PHASE-3-TS-MORPH-IR.md Session 3.2, ADR-013
```

---

## Definition of Done

**CRITICAL: Complete CodeMetaData Eradication**

- [ ] `CodeMetaData` interface DELETED from `lib/src/conversion/zod/index.ts`
- [ ] Zero mentions of "CodeMetaData" in `lib/src/` (case-sensitive, verified via grep)
- [ ] Zero mentions of "codemetadata" in `lib/src/` (case-insensitive, verified via grep)
- [ ] Eradication verification script passes (exit code 0)

**CRITICAL: Complete Handlebars Eradication**

- [ ] Zero `.hbs` files in repository (all 5 deleted or archived)
- [ ] `lib/src/rendering/handlebars.ts` DELETED
- [ ] `lib/src/rendering/handlebars.test.ts` DELETED
- [ ] `handlebars` dependency removed from `lib/package.json`
- [ ] Zero imports/requires of `handlebars` in source code
- [ ] Zero mentions of "handlebars" (case-insensitive) in `lib/src/`
- [ ] Eradication verification scripts pass (exit code 0)

**IR Infrastructure Complete**

- [ ] IR schema module created: `lib/src/context/ir-schema.ts`
- [ ] IR validators module created: `lib/src/context/ir-validators.ts`
- [ ] IR builder module created: `lib/src/context/ir-builder.ts`
- [ ] IR-based code generator created: `lib/src/rendering/generate-from-ir.ts`
- [ ] IR metadata adapter created: `lib/src/conversion/zod/ir-metadata-adapter.ts`
- [ ] All core IR interfaces defined (IRDocument, IRComponent, IROperation, IRSchema, IRSchemaNode, IRDependencyGraph)
- [ ] IRSchemaNode replaces CodeMetaData functionality completely
- [ ] IR-based generation produces code (single-file + grouped strategies)
- [ ] All Zod conversion functions use IR metadata

**Standard Completion Criteria**

- [ ] All work sections (A, B, C, D, E) completed
- [ ] All acceptance criteria met for each section
- [ ] All validation steps executed and passing
- [ ] Quality gate passes: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test && pnpm test:gen && pnpm test:snapshot && pnpm character`
- [ ] Zero behavioral changes (outputs identical to before - proven by characterization tests)
- [ ] Comprehensive TSDoc for all new interfaces and functions
- [ ] Unit tests for IR builders, validators, and generators (30+ new tests)
- [ ] ADR-013 updated: "CodeMeta resolved in Session 3.1; CodeMetaData + Handlebars replaced with IR in Session 3.2"
- [ ] Session plan updated: Status → "Complete"
- [ ] Commit created with proper message

**Breaking Changes (Accepted - Internal Only)**

- CodeMetaData interface deleted (internal type, no external consumers)
- Handlebars completely removed (internal generation system, no external consumers)
- IR schema introduced (internal representation, no external API changes)
- No public API changes (zero impact on consumers)

---

## Success Metrics

**Quantitative:**

- Lines of code added: ~600-800 (IR schema + builders + generators + adapters + tests)
- Lines of code deleted: ~1200+ (CodeMetaData + Handlebars templates + handlebars.ts)
- Interfaces deleted: 1 (CodeMetaData)
- Files deleted: 7+ (5 .hbs files + handlebars.ts + handlebars.test.ts)
- Dependencies removed: 1 (handlebars)
- New IR interfaces: 6+ (IRDocument, IRComponent, IROperation, IRSchema, IRSchemaNode, IRDependencyGraph)
- Test coverage: 30+ new tests for IR infrastructure
- Quality gates: 8/8 passing

**Qualitative:**

- Lossless IR established (captures all OpenAPI metadata)
- CodeMetaData replaced with richer IR metadata
- **Handlebars completely removed** (single code generation system)
- IR-based generation working (zero behavioral changes)
- Bidirectional transformation foundation ready
- Phase 4 writer architecture foundations complete
- Dramatically simpler architecture (one generation system, not two)

---

## Risk Mitigation

**Risk:** Breaking existing functionality  
**Mitigation:**

- IR-based generation replaces Handlebars but must produce identical outputs
- Zero behavioral changes requirement (proven by characterization tests)
- Can run Handlebars in parallel temporarily during development for validation
- 148 characterization tests serve as safety net
- Full quality gate execution after each major change
- Comprehensive test coverage (unit + snapshot + characterization)

**Risk:** Incomplete IR metadata  
**Mitigation:**

- Comprehensive IR schema design covering all OpenAPI features
- Manual inspection of IR structure for representative specs
- Gap documentation for missing metadata
- Iterative refinement in Session 3.3 if needed

**Risk:** Time overrun  
**Mitigation:**

- Work sections sized for 2-4 hour chunks
- Clear acceptance criteria for each section
- Validation steps can be run independently
- Can pause between sections if needed

---

## References

- **Parent Plan:** `.agent/plans/PHASE-3-TS-MORPH-IR.md`
- **Session 3.1:** `.agent/plans/PHASE-3-SESSION-1-CODEMETA-ELIMINATION.md` (predecessor)
- **Session 3.3:** IR Persistence & Validation Harness (successor)
- **Coding Standards:** `.agent/RULES.md` (TDD, pure functions, zero escape hatches)
- **ADR-013:** Architecture Rewrite Decision (CodeMeta poorly conceived)
- **Reference:** `.agent/reference/openapi-zod-client-emitter-migration.md` (IR design guidance)

---

## Quick Start for Fresh Chat

**Preparation:**

````
I'm starting Phase 3 Session 2 (IR Schema Foundations) on openapi-zod-client.

CRITICAL - Read these documents in order:
1. @RULES.md - Mandatory coding standards (TDD, type safety, TSDoc)
2. @HANDOFF.md - Project orientation and document navigation
3. @continuation_prompt.md - Complete AI context (architecture, decisions, patterns)
4. @context.md - Current session status and recent changes
5. @PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md - This detailed session plan
6. @PHASE-3-TS-MORPH-IR.md - Parent plan for context

CURRENT STATE:
- ✅ Phase 2 Complete (9 sessions): Scalar pipeline + MCP enhancements
- ✅ Phase 3 Session 1 Complete: CodeMeta class deleted, pure functions extracted
- ✅ Phase 3 Session 1.5 Complete: Multi-file $ref resolution fixed
- ⏳ Phase 3 Session 2: IR Schema Foundations (this session)

OBJECTIVES:
1. Define lossless IR schema (captures all OpenAPI metadata)
2. Replace CodeMetaData with IR schema metadata
3. Implement IR-based code generation (replaces Handlebars)
4. **DELETE all Handlebars files, templates, and dependencies**
5. Maintain zero behavioral changes (use characterization tests)

SECTIONS:
- A: IR Type Definitions (6-8h)
- B: IR Builder + Code Generation (8-12h)
- C: CodeMetaData Replacement (6-8h)
- D: Handlebars Complete Removal (2-3h)
- E: Quality Gates & Validation (2-3h)

CRITICAL REQUIREMENTS:
- Follow strict TDD (write test → RED → implement → GREEN)
- Run quality gates OFTEN (after each major change at minimum):
  ```bash
  pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test
  ```
- Use library types only (NO custom types unless necessary for IR)
- Comprehensive TSDoc for all IR interfaces
- All quality gates must pass GREEN
- Zero behavioral changes (outputs must be identical)

PLAN STRUCTURE:
This plan follows the mandated structure with:
✅ Clear Goals - What we're trying to achieve
✅ Intended Impact - Why this matters and what changes
✅ Acceptance Criteria - Specific, measurable completion requirements
✅ Validation Steps - Concrete bash commands to verify success
✅ Quality Gates - Full suite execution (format, build, type-check, lint, test, test:gen, snapshot, character)

Note: All plans must include these elements. Validation is NOT complete until
the full quality gate suite passes, including build verification.

Ready to begin Section A: IR Type Definitions.
````

---

**Ready for implementation.** All work must follow TDD and adhere strictly to RULES.md.
