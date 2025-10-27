# Phase 1: Detailed Implementation Plan (Tasks 1.3-1.8)

**Date:** October 26, 2025  
**Status:** Session 1 Complete (Tasks 1.0-1.2), Ready for Task 1.3  
**Estimated Remaining:** 10.5-14.5 hours

---

## 📊 Progress Summary

### Completed (1.5 hours)

- ✅ Task 1.0: E2E Test Matrix (30 min)
- ✅ Task 1.1: Component Access TDD (30 min)
- ✅ Task 1.2: Dereferencing Analysis (15 min)

### Remaining (10.5-14.5 hours)

- ⏳ Task 1.3: Update Template Context (2-3 hours) - **NEXT**
- 📋 Task 1.4: Update Dependency Graph (1-2 hours)
- 📋 Task 1.5: Update OpenAPIToZod (2 hours)
- 📋 Task 1.6: Update Zodios Helpers (2-3 hours)
- 📋 Task 1.7: Delete makeSchemaResolver (15 min)
- 📋 Task 1.8: Full Validation (1 hour)

---

## 🎯 TASK 1.3: Update Template Context (2-3 hours)

### Acceptance Criteria

**Must achieve:**

1. ✅ Remove all 10 uses of `result.resolver` from template-context.ts
2. ✅ Use `doc.components.schemas` directly
3. ✅ Use component-access functions where needed
4. ✅ All 246 unit tests still passing
5. ✅ All 88 characterisation tests still passing
6. ✅ Type-check passing
7. ✅ **Zero new type assertions added**

**Success indicators:**

- Template context builds successfully
- getZodiosEndpointDefinitionList no longer creates resolver
- Templates receive necessary data without resolver

### Implementation Steps

#### Step 1.3.1: Analyze getZodiosEndpointDefinitionList (15 min)

**Action:**

```typescript
// Read and understand:
// 1. What does getZodiosEndpointDefinitionList return?
// 2. Where does it create the resolver?
// 3. What context does it pass to other functions?
```

**Read files:**

- `lib/src/getZodiosEndpointDefinitionList.ts`
- Look for `makeSchemaResolver()` call
- Identify ConversionTypeContext structure

**Output:** Understanding of data flow

#### Step 1.3.2: Update getOpenApiDependencyGraph signature (30 min)

**Current signature:**

```typescript
getOpenApiDependencyGraph(
  refs: string[],
  getSchemaByRef: (ref: string) => SchemaObject | ReferenceObject
)
```

**New signature:**

```typescript
getOpenApiDependencyGraph(
  refs: string[],
  doc: OpenAPIObject
)
```

**Changes needed:**

1. Remove `getSchemaByRef` parameter
2. Import component-access functions
3. Use `getSchemaFromComponents()` internally
4. Update all call sites

**Validation:**

```bash
cd lib && pnpm test -- --run getOpenApiDependencyGraph
# Should pass with no changes to test behavior
```

#### Step 1.3.3: Update TsConversionContext type (15 min)

**Current:**

```typescript
type TsConversionContext = {
  nodeByRef: Record<string, ts.Node>;
  resolver: DocumentResolver; // ❌ Remove this
  visitedRefs: Record<string, boolean>;
};
```

**New:**

```typescript
type TsConversionContext = {
  nodeByRef: Record<string, ts.Node>;
  doc: OpenAPIObject; // ✅ Add this
  visitedRefs: Record<string, boolean>;
};
```

**Files to update:**

- `lib/src/openApiToTypescript.ts` (type definition)
- All files that create TsConversionContext

**Validation:**

```bash
pnpm type-check
# Should show errors where context is created - fix them next
```

#### Step 1.3.4: Update template-context.ts resolver uses (60 min)

**10 uses to replace:**

1. **Line 68:** `result.resolver.getSchemaByRef`

```typescript
// BEFORE
const depsGraphs = getOpenApiDependencyGraph(
  Object.keys(docSchemas).map((name) => asComponentSchema(name)),
  result.resolver.getSchemaByRef,
);

// AFTER
const depsGraphs = getOpenApiDependencyGraph(
  Object.keys(docSchemas).map((name) => asComponentSchema(name)),
  openApiDoc,
);
```

2. **Line 97:** `result.resolver.resolveSchemaName(schemaName)?.ref`

```typescript
// BEFORE
try {
  ref = result.resolver.resolveSchemaName(schemaName)?.ref;
} catch {
  ref = asComponentSchema(schemaName);
}

// AFTER
// Schema name to ref is deterministic - just construct it
ref = asComponentSchema(schemaName);
```

3. **Line 117:** `resolver: result.resolver`

```typescript
// BEFORE
const ctx: TsConversionContext = {
  nodeByRef: {},
  resolver: result.resolver,
  visitedRefs: {},
};

// AFTER
const ctx: TsConversionContext = {
  nodeByRef: {},
  doc: openApiDoc,
  visitedRefs: {},
};
```

4. **Line 122:** `result.resolver.resolveRef(ref)?.normalized`

```typescript
// BEFORE
const schemaName = shouldGenerateType ? result.resolver.resolveRef(ref)?.normalized : undefined;

// AFTER
// Extract schema name from ref directly
const schemaName = shouldGenerateType ? ref.split('/').pop() : undefined;
```

5. **Line 125:** `result.resolver.getSchemaByRef(ref)`

```typescript
// BEFORE
schema: result.resolver.getSchemaByRef(ref),

// AFTER
import { getSchemaFromComponents } from './component-access.js';

// Extract name from ref and get schema
const schemaName = ref.split('/').pop();
if (!schemaName) throw new Error(`Invalid ref: ${ref}`);
schema: getSchemaFromComponents(openApiDoc, schemaName),
```

6-10. **Similar pattern for remaining uses**

**Validation after each change:**

```bash
pnpm type-check
cd lib && pnpm test -- --run
```

#### Step 1.3.5: Update getZodiosEndpointDefinitionList (30 min)

**Remove resolver creation:**

```typescript
// BEFORE
import { makeSchemaResolver } from './makeSchemaResolver.js';

const resolver = makeSchemaResolver(doc);
const ctx: ConversionTypeContext = {
  // ... other props
  resolver,
};

// AFTER
// Remove makeSchemaResolver import
// Remove resolver creation
const ctx: ConversionTypeContext = {
  // ... other props
  doc, // Add doc instead
};
```

**Update ConversionTypeContext type:**

```typescript
// Remove resolver property
// Add doc property
```

**Validation:**

```bash
cd lib && pnpm test -- --run getZodiosEndpointDefinitionList
pnpm character
```

#### Step 1.3.6: Helper function for ref parsing (15 min)

**Create utility if needed:**

```typescript
/**
 * Extract schema name from component schema ref
 * @param ref - Full ref like '#/components/schemas/User'
 * @returns Schema name like 'User'
 */
function getSchemaNameFromRef(ref: string): string {
  const parts = ref.split('/');
  const name = parts.pop();
  if (!name) {
    throw new Error(`Invalid schema ref: ${ref}`);
  }
  return name;
}
```

Or use existing utility if available in component-access.ts

#### Step 1.3.7: Full validation (15 min)

```bash
# Format
pnpm format

# Build
pnpm build

# Type check
pnpm type-check

# Unit tests
cd lib && pnpm test -- --run

# Characterisation tests
cd .. && pnpm character

# E2E tests (baseline should be maintained)
pnpm character -- programmatic-usage
```

**Expected results:**

- ✅ 246/246 unit tests passing
- ✅ 88/88 char tests passing
- ✅ 5/12 e2e tests passing (baseline)
- ✅ Type-check passing
- ✅ Build successful

### Strategic Reconsideration After Task 1.3

**Questions to answer:**

1. **Did refactoring uncover new complexity?**
   - If yes: Document and adjust estimates for remaining tasks
   - If no: Proceed with confidence

2. **Are tests still comprehensive?**
   - Any gaps exposed by refactoring?
   - Need additional tests?

3. **Type safety improved?**
   - How many type assertions eliminated?
   - Any new assertions introduced (should be 0)?

4. **Path forward clear?**
   - Is Task 1.4 well-defined based on 1.3 learnings?
   - Any architectural surprises?

**Decision point:**

- ✅ If all green: Proceed to Task 1.4
- ⚠️ If issues: Pause, document, adjust plan
- ❌ If major problems: Consider rollback and different approach

---

## 🎯 TASK 1.4: Update Dependency Graph (1-2 hours)

### Acceptance Criteria

1. ✅ getOpenApiDependencyGraph no longer receives resolver function
2. ✅ Uses component-access functions internally
3. ✅ All dependency graph tests passing
4. ✅ Topological sort still works correctly
5. ✅ **Zero type assertions in updated code**

### Implementation Steps

#### Step 1.4.1: Read current implementation (15 min)

```bash
# Read files
- lib/src/getOpenApiDependencyGraph.ts
- lib/src/getOpenApiDependencyGraph.helpers.ts
```

**Understand:**

- How does it use the resolver function?
- What does it traverse?
- Where does it need schema access?

#### Step 1.4.2: Update function signature (15 min)

```typescript
// BEFORE
export const getOpenApiDependencyGraph = (
  refs: string[],
  getSchemaByRef: (ref: string) => SchemaObject | ReferenceObject
) => { ... }

// AFTER
import { getSchemaFromComponents, resolveSchemaRef } from './component-access.js';

export const getOpenApiDependencyGraph = (
  refs: string[],
  doc: OpenAPIObject
) => { ... }
```

#### Step 1.4.3: Replace resolver calls (30 min)

**Pattern:**

```typescript
// BEFORE
const schema = getSchemaByRef(ref);

// AFTER
const schemaName = getSchemaNameFromRef(ref);
const schema = getSchemaFromComponents(doc, schemaName);

// If need resolved (not ref):
const resolved = resolveSchemaRef(doc, schema);
```

#### Step 1.4.4: Update helper functions (15 min)

Update any helper functions in getOpenApiDependencyGraph.helpers.ts

#### Step 1.4.5: Validation (15 min)

```bash
pnpm type-check
cd lib && pnpm test -- --run getOpenApiDependencyGraph
pnpm test -- --run  # All unit tests
pnpm character      # All char tests
```

### Strategic Reconsideration After Task 1.4

**Questions:**

1. Dependency tracking still accurate?
2. Circular reference detection working?
3. Performance acceptable (no regression)?
4. Ready for Task 1.5?

---

## 🎯 TASK 1.5: Update OpenAPIToZod (2 hours)

### Acceptance Criteria

1. ✅ `ctx.resolver` replaced with `ctx.doc`
2. ✅ Uses component-access functions
3. ✅ All openApiToZod tests passing
4. ✅ Generated Zod schemas unchanged (functionally)
5. ✅ **Zero type assertions in updated code**

### Implementation Steps

#### Step 1.5.1: Read current implementation (15 min)

```bash
# Read files
- lib/src/openApiToZod.ts
```

**Find all ctx.resolver uses**

#### Step 1.5.2: Update context usage (60 min)

**Pattern:**

```typescript
// BEFORE
const schema = ctx.resolver.getSchemaByRef(ref);

// AFTER
const schemaName = getSchemaNameFromRef(ref);
const schema = getSchemaFromComponents(ctx.doc, schemaName);
```

#### Step 1.5.3: Validation (15 min)

```bash
cd lib && pnpm test -- --run openApiToZod
pnpm test -- --run  # All tests
pnpm character
```

### Strategic Reconsideration After Task 1.5

**Questions:**

1. Zod schema generation still correct?
2. All schema types handled?
3. Ready for Task 1.6 (biggest remaining task)?

---

## 🎯 TASK 1.6: Update Zodios Helpers (2-3 hours)

### Acceptance Criteria

1. ✅ Handle both dereferenced AND non-dereferenced specs
2. ✅ Use conditional logic instead of assertNotReference everywhere
3. ✅ All zodios helper tests passing
4. ✅ E2E tests improving (aiming for 8/12 P0)
5. ✅ **Minimal type assertions** (only where truly necessary)

### Implementation Steps

#### Step 1.6.1: Update files ONE AT A TIME (30 min each)

**Files:**

1. `lib/src/zodiosEndpoint.helpers.ts`
2. `lib/src/zodiosEndpoint.operation.helpers.ts`
3. `lib/src/zodiosEndpoint.path.helpers.ts`

**Strategy per file:**

```typescript
// DON'T do this everywhere:
assertNotReference(value, 'context');

// DO this instead:
if (isReferenceObject(value)) {
  // Handle ref case
  const resolved = resolveSchemaRef(doc, value);
  // Use resolved
} else {
  // Handle non-ref case
  // Use value directly
}
```

#### Step 1.6.2: Test after EACH file (15 min each)

```bash
cd lib && pnpm test -- --run zodiosEndpoint
pnpm test -- --run  # All tests
pnpm character
pnpm character -- programmatic-usage  # E2E baseline
```

**Track E2E improvement:**

- Start: 5/12
- After each file: Check if more passing
- Goal: 8/12 P0 minimum

#### Step 1.6.3: Validation (15 min)

Full quality gate after all files updated

### Strategic Reconsideration After Task 1.6

**Critical questions:**

1. **E2E tests passing?** Should be 8/12 P0 minimum
2. **Char tests still green?** Must be 88/88
3. **Type assertions?** Count reduction
4. **Ready for cleanup?** Can we delete makeSchemaResolver?

**Decision point:**

- ✅ If 8/12 P0 passing: Success! Proceed to cleanup
- ⚠️ If 6-7/12 P0: Acceptable, proceed with caution
- ❌ If <6/12 P0: Major issue, need investigation

---

## 🎯 TASK 1.7: Delete makeSchemaResolver (15 min)

### Acceptance Criteria

1. ✅ No remaining uses of makeSchemaResolver
2. ✅ Files deleted successfully
3. ✅ All tests still passing
4. ✅ Build successful

### Implementation Steps

#### Step 1.7.1: Verify no uses (5 min)

```bash
cd lib/src
grep -r "makeSchemaResolver" --include="*.ts"
# Should return 0 results (except in files being deleted)

grep -r "DocumentResolver" --include="*.ts"
# Should return 0 results (except in files being deleted)
```

#### Step 1.7.2: Delete files (2 min)

```bash
rm lib/src/makeSchemaResolver.ts
rm lib/src/makeSchemaResolver.test.ts
```

#### Step 1.7.3: Validation (8 min)

```bash
pnpm format
pnpm build
pnpm type-check
cd lib && pnpm test -- --run
cd .. && pnpm character
```

**Expected:**

- ✅ Build successful
- ✅ 227/227 unit tests (down from 246 - we removed 19 resolver tests)
- ✅ 88/88 char tests
- ✅ Type-check passing

### Strategic Reconsideration After Task 1.7

**Questions:**

1. All resolver references truly gone?
2. System working without resolver?
3. Ready for final validation?

---

## 🎯 TASK 1.8: Full Validation (1 hour)

### Acceptance Criteria

1. ✅ All quality gates green
2. ✅ 8/12 P0 e2e scenarios passing (minimum)
3. ✅ 88/88 characterisation tests passing
4. ✅ 227 unit tests passing (246 - 19 resolver tests)
5. ✅ Type assertion reduction documented
6. ✅ Performance acceptable

### Validation Steps

#### Step 1.8.1: Quality Gates (15 min)

```bash
# 1. Format
pnpm format
# Expected: All files formatted

# 2. Build
pnpm build
# Expected: Successful build

# 3. Type Check
pnpm type-check
# Expected: 0 errors

# 4. Unit Tests
cd lib && pnpm test -- --run
# Expected: 227/227 passing

# 5. Characterisation Tests
cd .. && pnpm character
# Expected: 88/88 passing

# 6. E2E Tests
pnpm character -- programmatic-usage
# Expected: 8/12 P0 passing (minimum)
```

#### Step 1.8.2: Metrics Collection (15 min)

```bash
# Type assertions count
cd lib/src
grep -r " as " --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Document before/after

# Files deleted
# - makeSchemaResolver.ts
# - makeSchemaResolver.test.ts
# - CodeMeta.ts (if also removed)
# - CodeMeta.test.ts (if also removed)

# Lines of code removed
# Document total reduction
```

#### Step 1.8.3: E2E Analysis (15 min)

**Analyze which E2E tests pass/fail:**

```typescript
// Document status of all 12 scenarios:
// ✅ 1.1 (P0): Named schemas from components
// ✅ 1.2 (P0): Schema dependencies
// ⚠️ 1.3 (P1): Circular refs
// etc...
```

**If <8/12 P0 passing:** Investigate why

#### Step 1.8.4: Performance Check (15 min)

```bash
# Build time
time pnpm build

# Test time
time pnpm test -- --run
time pnpm character

# Compare to baseline
# Document any regression
```

### Strategic Reconsideration After Task 1.8

**Critical Analysis:**

#### Question 1: Did we achieve Phase 1 goals?

**Success Criteria:**

- ✅ All quality gates green?
- ✅ 8/12 P0 e2e passing?
- ✅ 88/88 char tests passing?
- ✅ 227 unit tests passing?
- ✅ makeSchemaResolver deleted?
- ✅ 20-30 type assertions eliminated?
- ✅ Using ComponentsObject types properly?
- ✅ Supports both dereferenced and non-dereferenced specs?

**Score:** \_\_/8 criteria met

#### Question 2: What did we learn?

**Architectural insights:**

- [ ] CLI bundle() behavior confirmed
- [ ] Component access pattern works well
- [ ] Ref handling strategy validated
- [ ] Surprises or gotchas?

**Technical insights:**

- [ ] TDD effectiveness?
- [ ] Refactoring complexity?
- [ ] Type safety improvements?
- [ ] Code quality improvements?

#### Question 3: Are we ready for Phase 2?

**Prerequisites for Phase 2:**

1. Clean architecture foundation ✅/❌
2. All tests passing ✅/❌
3. Zero regression ✅/❌
4. Documentation complete ✅/❌
5. Team confidence high ✅/❌

**Decision:**

- ✅ Ready for Phase 2 (ts-morph migration)
- ⚠️ Minor cleanup needed first
- ❌ Issues to resolve

#### Question 4: Should we adjust Phase 2 plan?

**Based on Phase 1 learnings:**

- Did complexity match estimates?
- Any new risks discovered?
- Any new opportunities?
- Timeline adjustments needed?

---

## 📈 Success Metrics Summary

### Phase 1 Complete When:

**Quality Gates:**

- ✅ format: PASSING
- ✅ build: PASSING
- ✅ type-check: PASSING (0 errors)
- ✅ unit tests: 227/227 PASSING
- ✅ char tests: 88/88 PASSING

**E2E Tests:**

- ✅ 8/12 P0 scenarios passing (minimum)
- ✅ 10/12 total passing (stretch goal)

**Code Quality:**

- ✅ makeSchemaResolver deleted
- ✅ CodeMeta deleted (if Phase 1 scope)
- ✅ 20-30 type assertions eliminated
- ✅ Zero assertions in component-access.ts
- ✅ ComponentsObject types used properly

**Architecture:**

- ✅ NO internal dereferencing added
- ✅ Supports both dereferenced and non-dereferenced specs
- ✅ Clean separation of concerns
- ✅ Honest types throughout

**Documentation:**

- ✅ All tasks documented
- ✅ Learnings captured
- ✅ Metrics collected
- ✅ Phase 2 plan updated

---

## 🎓 Lessons Learned (To Be Updated)

### What Worked Well

- TDD execution (Task 1.1 perfect first implementation)
- E2E test baseline establishment
- Dereferencing strategy investigation
- Engineering excellence mindset

### What Was More Complex Than Expected

- Task 1.3 scope (2-3 hours vs 2 hours)
- Number of files with resolver dependencies
- (more to come...)

### What Would We Do Differently

- (to be filled in during execution)

### Key Insights for Phase 2

- (to be filled in after Phase 1 complete)

---

**This detailed plan provides clear acceptance criteria, implementation steps, and strategic reconsideration points for each remaining task.**
