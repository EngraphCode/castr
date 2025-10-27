# Phase 1 Part 3: Zodios Dependency Removal

**Status:** NOT STARTED (Blocked by Parts 1 & 2)  
**Estimated Duration:** 4-6 hours  
**Prerequisites:** Parts 1 & 2 complete, all tests passing

---

## 🎯 WHY: Impact & Purpose

**Problem:** `@zodios/core` dependency creates:

- Zod 4 incompatibility (peer dependency warnings)
- Unnecessary coupling to Zodios-specific patterns
- Extra dependency to maintain
- Not needed for core functionality (Zod schema generation)

**Impact:** Removing `@zodios/core` will:

- **Enable Zod 4 compatibility** (no peer dependency conflicts)
- **Simplify dependency tree** (one less package to maintain)
- **Improve focus** (pure Zod schema generation)
- **Prepare for extraction** (fewer dependencies = easier extraction)

**Success Metric:** `@zodios/core` removed from package.json, all tests passing, existing functionality preserved

---

## ✅ Acceptance Criteria

1. **Dependency Removal:**
   - `@zodios/core` removed from `package.json` dependencies
   - No imports of `@zodios/core` in production code
   - Peer dependency warnings eliminated

2. **Behavioral Correctness:**
   - All existing tests pass
   - Generated schemas functionally equivalent
   - Templates produce valid code

3. **Code Quality:**
   - No new type assertions added
   - Code complexity maintained or improved
   - All quality gates passing

---

## 🧪 TDD REQUIREMENT

**MANDATORY:** All implementation MUST follow Test-Driven Development:

### For Template Changes:

1. **CHARACTERISE** - Capture current template output
2. **SPECIFY** - Write tests for new output format
3. **RED** - Tests fail (new format doesn't exist)
4. **GREEN** - Update template
5. **VALIDATE** - All tests pass

### For Type Changes:

1. **RED** - Write test with new types
2. **GREEN** - Implement type changes
3. **REFACTOR** - Clean up while tests stay green
4. **VALIDATE** - Run quality gates

**Tests must exist BEFORE changing:**

- Template syntax
- Type definitions
- Import statements

---

## 📋 Implementation Steps

### Task 3.1: Identify Zodios Usage (Audit)

**Duration:** 1 hour

**Steps:**

1. **Find all imports:**

   ```bash
   cd lib/src
   grep -r "@zodios/core" --include="*.ts"
   ```

2. **Find all type references:**

   ```bash
   grep -r "ZodiosEndpoint" --include="*.ts"
   grep -r "Zodios" --include="*.ts"
   ```

3. **Document findings:**
   Create `.agent/analysis/ZODIOS_USAGE_AUDIT.md` with:
   - List of all files using Zodios
   - What Zodios types are being used
   - What Zodios functions are being called
   - Migration strategy for each

4. **Estimate impact:**
   - How many files affected?
   - How many tests need updating?
   - Any breaking changes to generated code?

---

### Task 3.2: Replace Zodios Types (TDD Required)

**Duration:** 2 hours

**TDD Workflow:**

1. **Write tests for new types:**

   ```typescript
   // lib/src/template-context.test.ts
   describe('Endpoint Definition Types (post-Zodios)', () => {
     it('should define endpoint with method, path, and schemas', () => {
       const endpoint = {
         method: 'get' as const,
         path: '/users/:id',
         parameters: z.object({ id: z.string() }),
         response: z.object({ name: z.string() }),
       };

       expect(endpoint.method).toBe('get');
       // No Zodios types involved
     });
   });
   ```

2. **Run tests (RED):**

   ```bash
   pnpm test -- --run template-context.test.ts
   ```

3. **Define new types:**

   ```typescript
   // lib/src/template-context.types.ts
   export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

   export type EndpointDefinition = {
     method: HttpMethod;
     path: string;
     parameters?: unknown; // Zod schema
     requestBody?: unknown; // Zod schema
     response: unknown; // Zod schema
     // etc.
   };
   ```

4. **Update imports:**

   ```typescript
   // Replace:
   import type { ZodiosEndpointDefinition } from '@zodios/core';

   // With:
   import type { EndpointDefinition } from './template-context.types.js';
   ```

5. **Run tests (GREEN):**

   ```bash
   pnpm test -- --run template-context.test.ts
   pnpm test -- --run  # Full suite
   ```

6. **Quality gates:**
   ```bash
   pnpm format && pnpm build && pnpm type-check
   ```

---

### Task 3.3: Update Templates (TDD Required)

**Duration:** 2 hours

**TDD Workflow:**

1. **Characterise current template output:**

   ```typescript
   // lib/src/templates/default.test.ts (if doesn't exist, create it)
   describe('default template', () => {
     it('should generate client code', async () => {
       const context = {
         /* ... */
       };
       const output = await renderTemplate('default', context);

       // Snapshot CURRENT output
       expect(output).toMatchSnapshot();
     });
   });
   ```

2. **Write tests for new output:**

   ```typescript
   describe('default template (post-Zodios)', () => {
     it('should generate pure Zod schemas without Zodios references', async () => {
       const context = {
         /* ... */
       };
       const output = await renderTemplate('default', context);

       expect(output).not.toContain('@zodios/core');
       expect(output).not.toContain('ZodiosEndpoint');
       expect(output).toContain('z.object'); // Pure Zod
     });
   });
   ```

3. **Update templates:**
   - Remove Zodios imports
   - Replace Zodios-specific constructs
   - Use pure Zod patterns

4. **Validate:**
   ```bash
   pnpm test -- --run templates/
   pnpm test -- --run
   pnpm character
   ```

**Templates to update:**

- `lib/src/templates/default.hbs` (may deprecate)
- `lib/src/templates/grouped.hbs`
- `lib/src/templates/schemas-with-metadata.hbs` (already Zodios-free?)
- Any other templates

---

### Task 3.4: Update Template Context (TDD Required)

**Duration:** 1 hour

**TDD Workflow:**

1. **Write tests first:**

   ```typescript
   describe('getZodClientTemplateContext (post-Zodios)', () => {
     it('should not include Zodios-specific metadata', () => {
       const context = getZodClientTemplateContext(openApiDoc);

       expect(context).not.toHaveProperty('zodiosEndpoints');
       expect(context.endpoints).toBeDefined();
       // Each endpoint should have pure Zod schemas
     });
   });
   ```

2. **Update implementation:**
   - Remove Zodios endpoint generation
   - Keep Zod schema generation
   - Preserve all useful metadata

3. **Validate:**
   ```bash
   pnpm test -- --run template-context.test.ts
   pnpm test -- --run
   ```

---

### Task 3.5: Remove Zodios Dependency

**Duration:** 30 minutes

**Steps:**

1. **Verify no usage:**

   ```bash
   cd lib/src
   grep -r "@zodios/core" --include="*.ts"
   # Should find NOTHING
   ```

2. **Remove from package.json:**

   ```bash
   cd lib
   pnpm remove @zodios/core
   ```

3. **Validate:**
   ```bash
   pnpm install  # Should have no peer dependency warnings
   pnpm build
   pnpm test -- --run
   pnpm character
   ```

---

### Task 3.6: Final Validation

**Duration:** 1 hour

**Full quality gate suite:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# 1. Check Zod 4 compatibility
cd lib
pnpm list zod
# Should show zod@^4.x with NO warnings

# 2. Format
pnpm format

# 3. Build
pnpm build

# 4. Type-check
pnpm type-check
# MUST show 0 errors

# 5. Unit tests
pnpm test -- --run
# All tests must pass

# 6. Character tests
cd .. && pnpm character
# All 100 tests must pass

# 7. Snapshot tests
cd lib && pnpm test:snapshot
# Update if output format changed

# 8. Real-world validation
# Generate client from petstore.yaml
pnpm cli -- ./samples/v3.0/petstore.yaml -o /tmp/petstore-client.ts
# Verify output is valid TypeScript with pure Zod
```

**Check dependency tree:**

```bash
cd lib
pnpm list --depth=0
# Should NOT include @zodios/core
# Should include zod@^4.x
```

---

## 🚦 Validation Gates

**After EVERY file updated:**

```bash
pnpm test -- --run <test-file>
```

**After each task complete:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

**Before declaring complete:**

```bash
# All gates must pass
pnpm format      # ✅ Must pass
pnpm build       # ✅ Must pass
pnpm type-check  # ✅ 0 errors
pnpm test        # ✅ All passing
pnpm character   # ✅ All 100 passing
pnpm lint        # ⚠️ No worse than baseline
```

---

## 📊 Success Metrics

### Before (Baseline)

- Dependencies: `@zodios/core`, `zod`
- Peer warnings: Yes (Zod 4 incompatible)
- Templates: Mixed (some Zodios-free, some not)
- Generated code: Zodios-specific patterns

### After (Target)

- Dependencies: `zod` only
- Peer warnings: None
- Templates: 100% Zodios-free
- Generated code: Pure Zod schemas

---

## 🎓 TDD Principles

### Every change must follow:

1. **Characterise current behavior** (establish baseline)
2. **Write tests for new behavior** (RED)
3. **Implement changes** (GREEN)
4. **Validate with quality gates**

### For template changes:

- **Snapshot current output** first
- **Write assertion tests** for new output
- **Update templates** incrementally
- **Validate constantly**

### No exceptions for:

- "Simple" template changes
- "Obvious" type replacements
- "Just removing imports"

**TDD = Tests First, Always.**

---

## 🚀 Migration Strategy

### Conservative Approach (Recommended)

1. Keep Zodios templates as `*.deprecated.hbs`
2. Create new Zodios-free templates
3. Test both in parallel
4. Switch default after validation
5. Remove deprecated after 1-2 releases

### Aggressive Approach (Faster)

1. Update templates in place
2. Fix all tests immediately
3. Remove dependency ASAP
4. Document breaking changes

**Recommendation:** Conservative for production, aggressive for this project (not shipping releases yet)

---

## 🔗 Related Documents

- **Previous:** `01-2-PHASE-1-TS-MORPH.md` (must be complete first)
- **Requirements:** `.agent/plans/requirements.md` (Req 3: Zod 4 compatible)
- **ADR:** `.agent/adr/ADR-016-remove-zodios-dependencies.md`
- **Analysis:** `.agent/analysis/ZODIOS_CORE_EVALUATION.md`
- **RULES:** `.agent/RULES.md` (TDD mandate)

---

## 📋 Definition of Done

Phase 1 is complete when:

- ✅ `makeSchemaResolver` deleted (Part 1)
- ✅ `CodeMeta` deleted (Part 1)
- ✅ `tanu` removed (Part 2)
- ✅ `@zodios/core` removed (Part 3)
- ✅ Zero type assertions (except `as const`)
- ✅ All 246+ unit tests passing
- ✅ All 100 character tests passing
- ✅ All quality gates green
- ✅ Zod 4 compatible (no peer warnings)
- ✅ Ready for extraction to Engraph monorepo
