# Phase 1 Part 2: ts-morph Migration

**Status:** NOT STARTED (Blocked by Part 1)  
**Estimated Duration:** 6-8 hours  
**Prerequisites:** Part 1 complete (100/100 char tests, 0 type errors)

---

## 🎯 WHY: Impact & Purpose

**Problem:** Current TypeScript AST generation uses `tanu`, which:

- Requires extensive type assertions (22 in `openApiToTypescript.helpers.ts`, 17 in `openApiToTypescript.ts`)
- Has unclear/inconsistent API
- Mixing ts.Node and string-based type generation
- Makes code hard to reason about

**Impact:** Migrating to `ts-morph` will:

- **Eliminate remaining type assertions** (~39 in TypeScript generation alone)
- **Improve maintainability** (industry-standard API, better docs)
- **Enable confident refactoring** (proper AST manipulation vs string templates)
- **Prepare for Phase 2** (complete template system rewrite)

**Success Metric:** Zero type assertions in TypeScript generation, all tests passing

---

## ✅ Acceptance Criteria

1. **Type Safety:**
   - Zero type assertions in `openApiToTypescript.ts`
   - Zero type assertions in `openApiToTypescript.helpers.ts`
   - All TypeScript generation type-safe

2. **Behavioral Correctness:**
   - All existing tests pass (no regression)
   - Generated TypeScript identical or improved
   - Snapshot tests updated if format changes

3. **Code Quality:**
   - `tanu` dependency removed from `package.json`
   - All helper functions pure and testable
   - Code complexity reduced (target: <50 lines per function)

---

## 🧪 TDD REQUIREMENT

**MANDATORY:** All implementation MUST follow Test-Driven Development:

### For Each New Helper Function:

1. **RED** - Write test with expected input/output
2. **GREEN** - Implement minimal code
3. **REFACTOR** - Improve while tests stay green
4. **VALIDATE** - Run quality gates

### For Each Refactored Function:

1. **CHARACTERISE** - Add tests for current behavior
2. **RED** - Write tests for new behavior
3. **GREEN** - Refactor to new implementation
4. **VALIDATE** - All tests pass

**No exceptions.** Every function change requires tests first.

---

## 📋 Implementation Steps

### Task 2.1: Research & Design (TDD: Spike with Tests)

**Duration:** 2 hours

**Steps:**

1. **Create spike test file:**

   ```bash
   touch lib/src/ast-builder.test.ts
   ```

2. **Write exploratory tests:**

   ```typescript
   import { Project } from 'ts-morph';
   import { describe, it, expect } from 'vitest';

   describe('ts-morph API exploration', () => {
     it('should create type alias', () => {
       const project = new Project();
       const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

       sourceFile.addTypeAlias({
         name: 'User',
         type: '{ id: number; name: string }',
         isExported: true,
       });

       const output = sourceFile.getFullText();
       expect(output).toContain('export type User');
       expect(output).toContain('id: number');
     });

     it('should create interface', () => {
       // Test interface generation
     });

     it('should create union type', () => {
       // Test union type generation
     });
   });
   ```

3. **Document findings:**
   - Create `.agent/analysis/TS_MORPH_API_CAPABILITIES.md`
   - Document patterns for common operations
   - Identify API gaps (if any)

4. **Validate:**
   ```bash
   pnpm test -- --run ast-builder.test.ts
   ```

---

### Task 2.2: Create ts-morph Adapter (TDD Required)

**Duration:** 4 hours

**TDD Workflow:**

1. **Write tests FIRST:**

   ```typescript
   // lib/src/ast-builder.test.ts
   describe('AstBuilder', () => {
     describe('addImport', () => {
       it('should add named import', () => {
         const builder = new AstBuilder();
         builder.addImport('zod', ['z']);
         expect(builder.toString()).toContain("import { z } from 'zod'");
       });
     });

     describe('addTypeAlias', () => {
       it('should create exported type alias', () => {
         const builder = new AstBuilder();
         builder.addTypeAlias('User', '{ id: number }');
         expect(builder.toString()).toContain('export type User = { id: number }');
       });
     });

     // More tests...
   });
   ```

2. **Run tests (RED):**

   ```bash
   pnpm test -- --run ast-builder.test.ts
   # Should FAIL - no implementation yet
   ```

3. **Implement minimal code (GREEN):**

   ```typescript
   // lib/src/ast-builder.ts
   import { Project, SourceFile } from 'ts-morph';

   export class AstBuilder {
     private project: Project;
     private sourceFile: SourceFile;

     constructor() {
       this.project = new Project();
       this.sourceFile = this.project.createSourceFile('generated.ts', '', { overwrite: true });
     }

     addImport(moduleSpecifier: string, namedImports: string[]): void {
       this.sourceFile.addImportDeclaration({
         moduleSpecifier,
         namedImports,
       });
     }

     addTypeAlias(name: string, type: string): void {
       this.sourceFile.addTypeAlias({
         name,
         type,
         isExported: true,
       });
     }

     toString(): string {
       return this.sourceFile.getFullText();
     }
   }
   ```

4. **Run tests (GREEN):**

   ```bash
   pnpm test -- --run ast-builder.test.ts
   # Should PASS
   ```

5. **Repeat for all methods:**
   - `addInterface()`
   - `addUnionType()`
   - `addIntersectionType()`
   - `addLiteralType()`
   - etc.

6. **Quality gates:**
   ```bash
   pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
   ```

---

### Task 2.3: Refactor openApiToTypescript.helpers.ts (TDD Required)

**Duration:** 2-3 hours

**TDD Workflow:**

1. **Add characterisation tests for current behavior:**

   ```typescript
   // Capture CURRENT behavior before changing
   describe('handleReferenceObject', () => {
     it('should convert ref to type reference', () => {
       const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
       const ctx = {
         /* ... */
       };
       const result = handleReferenceObject(schema, ctx, () => {});

       // Capture what it CURRENTLY does
       expect(result).toMatchSnapshot();
     });
   });
   ```

2. **Run tests (GREEN - establishes baseline):**

   ```bash
   pnpm test -- --run openApiToTypescript.helpers.test.ts
   ```

3. **Write tests for NEW behavior:**

   ```typescript
   describe('handleReferenceObject (ts-morph)', () => {
     it('should use AstBuilder for type reference', () => {
       const builder = new AstBuilder();
       const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
       const result = handleReferenceObject(schema, builder);

       expect(result).toBe('User'); // Returns type name
       // AstBuilder tracks the reference internally
     });
   });
   ```

4. **Refactor ONE function at a time:**
   - Update function signature
   - Replace tanu with ts-morph
   - Run tests
   - Fix until green
   - Move to next function

5. **Quality gates after EACH function:**
   ```bash
   pnpm test -- --run openApiToTypescript.helpers.test.ts
   pnpm test -- --run  # Full suite
   ```

---

### Task 2.4: Refactor openApiToTypescript.ts (TDD Required)

**Duration:** 2 hours

**Same TDD process:**

1. Characterisation tests first
2. New behavior tests
3. Refactor incrementally
4. Validate constantly

---

### Task 2.5: Remove tanu Dependency

**Duration:** 30 minutes

**Steps:**

1. **Verify no usage:**

   ```bash
   cd lib/src
   grep -r "from 'tanu'" --include="*.ts"
   grep -r "import.*tanu" --include="*.ts"
   # Should find NOTHING
   ```

2. **Remove from package.json:**

   ```bash
   cd lib
   pnpm remove tanu
   ```

3. **Validate:**
   ```bash
   pnpm install
   pnpm build
   pnpm test -- --run
   pnpm character
   ```

---

### Task 2.6: Final Validation

**Duration:** 1 hour

**Full quality gate suite:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# 1. Format
pnpm format

# 2. Build
pnpm build

# 3. Type-check
pnpm type-check
# MUST show 0 errors

# 4. Lint
pnpm lint
# Should show IMPROVEMENT from current 136 issues
# Target: <100 issues

# 5. Unit tests
cd lib && pnpm test -- --run
# All tests must pass

# 6. Character tests
cd .. && pnpm character
# All 100 tests must pass

# 7. Snapshot tests
cd lib && pnpm test:snapshot
# Update snapshots if output format improved
```

**Count type assertions:**

```bash
cd lib/src
grep -r " as " --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Target: 0
# Previous: 74
```

---

## 🚦 Validation Gates

**After EVERY function refactored:**

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
pnpm lint        # ⚠️ Improved vs baseline
```

---

## 📊 Success Metrics

### Before (Baseline)

- Type assertions: 74 total (39 in TypeScript generation)
- tanu dependency: Present
- Code complexity: High (some functions >100 lines)
- Test coverage: Partial

### After (Target)

- Type assertions: 0 (except `as const`)
- tanu dependency: Removed
- Code complexity: All functions <50 lines
- Test coverage: 100% of TypeScript generation

---

## 🎓 TDD Principles

### Every change must follow:

1. **Write test first** (RED)
2. **Implement minimal code** (GREEN)
3. **Refactor while green**
4. **Validate with quality gates**

### No exceptions for:

- "Quick fixes"
- "Obvious changes"
- "Just refactoring"

**If you're not writing tests first, you're not doing TDD.**

---

## 🔗 Related Documents

- **Previous:** `01-1-PHASE-1-CONTEXT-TYPES.md` (must be complete first)
- **Next:** `01-3-PHASE-1-ZODIOS-REMOVAL.md`
- **Requirements:** `.agent/plans/requirements.md` (Req 7: Zero type assertions)
- **ADR:** `.agent/adr/ADR-014-migrate-tanu-to-ts-morph.md`
- **RULES:** `.agent/RULES.md` (TDD mandate, pure functions)

