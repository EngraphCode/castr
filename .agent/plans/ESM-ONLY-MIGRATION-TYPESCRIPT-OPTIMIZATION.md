# ESM-Only Migration & TypeScript Configuration Optimization

**Status**: Planned  
**Created**: 2025-10-29  
**Priority**: High  
**Related ADRs**: ADR-007 (ESM with NodeNext Resolution), ADR-009 (tsup)

## Executive Summary

Migrate from dual-format (ESM + CJS) to ESM-only output, remove unnecessary CJS wrapper files, and optimize TypeScript configuration to align with current best practices for library development. This simplifies the build pipeline, improves type safety, and positions the package as a modern ESM-first library.

## Current State Analysis

### Configuration Issues Identified

1. **Naming Mismatch** 🚨 CRITICAL
   - tsup builds: `openapi-zod-client.{js,cjs}`
   - package.json expects: `openapi-zod-validation.{js,cjs}`
   - **Result**: Package exports are broken!

2. **Dual Format Complexity**
   - Building both ESM and CJS for library and CLI
   - CJS wrapper file `bin.cjs` adds maintenance overhead
   - No actual need for CJS (package is `"type": "module"`)

3. **Missing TypeScript Best Practices**
   - No project references (despite monorepo structure)
   - No `verbatimModuleSyntax` (TypeScript 5.0+ best practice)
   - No `declarationMap` (limits IDE "go to source" capability)
   - No `composite` flag (required for project references)
   - Weakened `strictPropertyInitialization: false`
   - Redundant `esModuleInterop` re-declaration in lib config

4. **Missing tsup Optimizations**
   - No explicit `target` (esbuild defaults to `esnext`, inconsistent with TS)
   - No `platform: 'node'` (missing Node.js-specific optimizations)
   - No naming consistency with package.json

### Files Requiring Changes

- `/lib/tsup.config.ts` - Build configuration
- `/lib/package.json` - Package exports and bin
- `/lib/bin.cjs` - **DELETE** (no longer needed)
- `/tsconfig.json` - Root TypeScript config
- `/lib/tsconfig.json` - Library TypeScript config
- `/lib/tsconfig.lint.json` - Linting config

## Migration Goals

### Primary Objectives

1. ✅ **ESM-Only Output**: Simplify to single modern format
2. ✅ **Fix Naming Mismatch**: Align build output with package.json
3. ✅ **TypeScript Best Practices**: Add modern TS 5.x optimizations
4. ✅ **Project References**: Enable for better monorepo performance
5. ✅ **Remove CJS Artifacts**: Delete unnecessary wrapper files
6. ✅ **Optimize Build Config**: Add platform, target, and other optimizations

### Success Criteria

- ✅ Package builds successfully with ESM-only output
- ✅ CLI executable works with `#!/usr/bin/env node` and ESM
- ✅ All type checking passes with stricter settings
- ✅ Project references enabled and working
- ✅ `verbatimModuleSyntax` enforced throughout
- ✅ No CJS files in distribution
- ✅ Package.json exports correctly reference ESM files
- ✅ All tests pass
- ✅ No linter errors introduced

## Technical Implementation Plan

### Phase 1: TypeScript Configuration Optimization

#### 1.1 Root `tsconfig.json` Enhancements

**Changes**:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // Existing strict settings...
    "strict": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "checkJs": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,

    // ⭐ NEW: Modern TypeScript 5.x settings
    "verbatimModuleSyntax": true, // Explicit type-only imports for ESM
    "noEmit": true
  },
  "display": "Strictest",

  // ⭐ NEW: Project references for monorepo
  "files": [],
  "references": [{ "path": "./lib" }],

  "exclude": [".agent"]
}
```

**Rationale**:

- `verbatimModuleSyntax`: Replaces `importsNotUsedAsValues` + `preserveValueImports`, enforces explicit `import type` for type-only imports (prevents ESM runtime errors)
- `files: []` + `references`: Converts to "solution" file for project references
- Keeps all existing strictness settings

**Note on Import Extensions**: This configuration **does NOT change** the existing requirement for `.js` extensions in relative imports. The codebase already uses `import { foo } from './bar.js'` syntax due to `"moduleResolution": "NodeNext"`, and this remains unchanged. The `.js` extension requirement is part of the Node.js ESM specification and ensures output works in Node.js without bundling.

#### 1.2 Library `lib/tsconfig.json` Optimization

**Changes**:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    // ⭐ NEW: Project reference support
    "composite": true,
    "declarationMap": true,

    // ⭐ NEW: Inherit from root (TS 5.0+)
    "verbatimModuleSyntax": true,

    // Decorators (verify if actually needed)
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    "sourceMap": true,
    "declaration": true,
    "pretty": true,
    "strictNullChecks": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": ".",
    "lib": ["ES2022"],
    "allowSyntheticDefaultImports": true,

    // ⭐ REMOVED: Redundant (inherited from root)
    // "esModuleInterop": true,

    // ⭐ REMOVED OR EVALUATE: Weakens strict mode
    // "strictPropertyInitialization": false,

    "baseUrl": "./"
  },
  "include": ["src", "eslint.config.ts", "examples-fetcher.mts"],
  "exclude": ["node_modules", "**/*.typegen.ts", "example", "tests", "dist", "bin.cjs"]
}
```

**Rationale**:

- `composite: true`: Required for project references
- `declarationMap: true`: Enables "go to source" in IDEs (not just `.d.ts`)
- `verbatimModuleSyntax: true`: Explicit re-declaration for clarity (inherited but emphasized)
- Remove `esModuleInterop`: Already inherited from root
- **TODO**: Evaluate if `strictPropertyInitialization: false` is necessary (weakens type safety)
- **TODO**: Verify if decorators are actually used in codebase

#### 1.3 Update `lib/tsconfig.lint.json`

**Changes**:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "rootDir": "."
  },
  "include": ["**/*.ts", "**/*.cts", "**/*.mts", "**/*.tsx", "test/**/*.ts"],
  "exclude": ["node_modules", "**/*.typegen.ts", "example", "dist"]
}
```

**Rationale**:

- Remove `bin.cjs` from excludes (will be deleted)
- Inherits all new settings from parent config

#### 1.4 Simplify Root `tsconfig.lint.json`

**Changes**:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["**/*.ts"], // Simplified from redundant patterns
  "exclude": ["node_modules", "dist", ".agent"]
}
```

**Rationale**:

- `**/*.ts` already captures `lib/**/*.ts`, `examples/**/*.ts`, etc.
- Simplifies maintenance

### Phase 2: Build Configuration (tsup) Optimization

#### 2.1 Update `lib/tsup.config.ts`

**Changes**:

```typescript
import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library: ESM only
  {
    entry: {
      'openapi-zod-validation': 'src/index.ts', // ⭐ FIX: Match package.json name
    },
    format: ['esm'], // ⭐ ESM only (was: ['cjs', 'esm'])
    platform: 'node', // ⭐ NEW: Node.js optimizations
    target: 'node16', // ⭐ NEW: Explicit target (or 'node18', 'node20')
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    outDir: 'dist',
  },

  // CLI: ESM only (Node.js supports ESM executables!)
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['esm'], // ⭐ ESM only (was: ['cjs'])
    platform: 'node', // ⭐ NEW
    target: 'node16', // ⭐ NEW
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    outDir: 'dist',
  },
]);
```

**Key Changes**:

1. **Fix naming**: `openapi-zod-client` → `openapi-zod-validation` (matches package.json)
2. **ESM-only**: `format: ['esm']` for both library and CLI
3. **Platform optimization**: `platform: 'node'` for Node.js-specific bundling
4. **Explicit target**: `target: 'node16'` for consistency (more explicit than 'es2022')
5. **Remove CJS**: No more dual-format complexity

**Rationale**:

- Node.js 14+ fully supports ESM for CLI executables
- `platform: 'node'` optimizes bundle size (marks Node.js built-ins as external)
- Explicit `target` ensures consistent output with TypeScript config
- Naming fix resolves broken package exports

**Alternative Target Options**:

- `node16`: Node.js 16.x LTS (minimum for ES2022 features)
- `node18`: Node.js 18.x LTS (recommended)
- `node20`: Node.js 20.x LTS (latest stable)
- Choose based on minimum supported Node.js version

### Phase 3: Package Configuration Updates

#### 3.1 Update `lib/package.json`

**Changes**:

```json
{
  "name": "openapi-zod-validation",
  "version": "1.18.3",
  "type": "module", // ✅ Already set

  // ⭐ UPDATED: ESM-only exports
  "main": "dist/openapi-zod-validation.js", // Remove .cjs
  "module": "dist/openapi-zod-validation.js", // Same as main for ESM
  "types": "dist/openapi-zod-validation.d.ts",

  "exports": {
    ".": {
      "types": "./dist/openapi-zod-validation.d.ts",
      "import": "./dist/openapi-zod-validation.js"
      // ⭐ REMOVED: "require": "./dist/openapi-zod-validation.cjs"
    },
    "./cli": {
      "types": "./dist/cli.d.ts",
      "import": "./dist/cli.js"
      // ⭐ REMOVED: "require": "./dist/cli.cjs"
    }
  },

  // ⭐ UPDATED: Direct ESM CLI reference
  "bin": {
    "openapi-zod-validation": "./dist/cli.js" // Was: "./bin.cjs"
  },

  "files": [
    // ⭐ REMOVED: "bin.cjs"
    "src",
    "dist",
    "README.md"
  ],

  "sideEffects": false // ✅ Keep for tree-shaking

  // ... rest of package.json unchanged
}
```

**Breaking Changes**:

- Users can no longer use `require('openapi-zod-validation')`
- Minimum Node.js version effectively becomes 14+ (already implied by ES2022)

#### 3.2 Delete `lib/bin.cjs`

**Action**: **DELETE FILE** - No longer needed

**Rationale**:

- Modern Node.js supports ESM executables directly
- `#!/usr/bin/env node` works with `.js` when `"type": "module"`
- Reduces maintenance overhead
- Simplifies build pipeline

### Phase 4: Build Script Updates

#### 4.1 Update `lib/package.json` Scripts

**Changes**:

```json
{
  "scripts": {
    "clean": "rm -rf dist",

    // ⭐ UPDATED: Build with project references
    "build": "tsc -b && tsup",

    "dev": "tsup --watch",
    "format": "prettier --write .",
    "format:check": "prettier --check .",

    // ⭐ UPDATED: Use project references
    "type-check": "tsc -b --noEmit --project tsconfig.lint.json",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:snapshot": "vitest run --config vitest.snapshot.config.ts",
    "test:snapshot:watch": "vitest --config vitest.snapshot.config.ts",
    "character": "vitest run --config vitest.characterisation.config.ts",
    "character:watch": "vitest --config vitest.characterisation.config.ts",
    "fetch:examples": "tsx ./examples-fetcher.mts"
  }
}
```

**Key Changes**:

- `build`: Add `tsc -b` for project reference builds before tsup
- `type-check`: Use `tsc -b` for incremental builds

## Implementation Checklist

### Pre-Implementation

- [ ] Verify decorator usage in codebase (`grep -r "@" lib/src --include="*.ts"`)
- [ ] Determine minimum Node.js version requirement
- [ ] Review if `strictPropertyInitialization: false` can be removed
- [ ] Backup current working build

### Phase 1: TypeScript Configuration

- [ ] Update root `tsconfig.json` with project references
- [ ] Add `verbatimModuleSyntax: true` to root config
- [ ] Update `lib/tsconfig.json` with composite and declarationMap
- [ ] Add `verbatimModuleSyntax: true` to lib config
- [ ] Remove redundant `esModuleInterop` from lib config
- [ ] Evaluate and document `strictPropertyInitialization` decision
- [ ] Simplify root `tsconfig.lint.json` include patterns
- [ ] Update `lib/tsconfig.lint.json` exclusions

### Phase 2: Build Configuration

- [ ] Update `lib/tsup.config.ts` entry name to `openapi-zod-validation`
- [ ] Change format to `['esm']` for library
- [ ] Change format to `['esm']` for CLI
- [ ] Add `platform: 'node'` to both configs
- [ ] Add `target: 'node16'` (or higher) to both configs
- [ ] Document target choice in ADR or comments

### Phase 3: Package Configuration

- [ ] Update `lib/package.json` main field (remove `.cjs`)
- [ ] Update exports to remove `require` conditions
- [ ] Update bin to point to `./dist/cli.js`
- [ ] Remove `bin.cjs` from files array
- [ ] Delete `lib/bin.cjs` file

### Phase 4: Build & Validation

- [ ] Run `pnpm clean` in lib package
- [ ] Run `pnpm build` in lib package
- [ ] Verify `dist/` contains only ESM files (`.js`, no `.cjs`)
- [ ] Verify `dist/cli.js` has shebang: `#!/usr/bin/env node`
- [ ] Test CLI executable: `node lib/dist/cli.js --help`
- [ ] Test CLI via bin: `pnpm -C lib exec openapi-zod-validation --help`

### Phase 5: Type Checking & Linting

- [ ] Run `pnpm type-check` - should pass with new settings
- [ ] Fix any new `verbatimModuleSyntax` errors (add `import type` where needed)
  - Note: Codebase already uses `.js` extensions, no changes needed there
  - Only type-only imports need `import type { ... }` syntax
- [ ] Run `pnpm lint` - should pass
- [ ] Fix any new strict type errors if `strictPropertyInitialization` re-enabled

### Phase 6: Testing

- [ ] Run `pnpm test` - all tests should pass
- [ ] Run `pnpm test:snapshot` - snapshots should match
- [ ] Run `pnpm character` - characterization tests should pass
- [ ] Test example generation: `pnpm fetch:examples`
- [ ] Test in example projects (if available)

### Phase 7: Documentation

- [ ] Update README if it shows CJS usage examples
- [ ] Add migration notes to CHANGELOG
- [ ] Update any inline code comments referencing CJS
- [ ] Create ADR documenting ESM-only decision
- [ ] Document minimum Node.js version requirement

## Risk Assessment

### Low Risk

- ✅ Package already has `"type": "module"`
- ✅ Modern Node.js (14+) fully supports ESM
- ✅ Target ES2022 already implies modern environment
- ✅ Breaking change is acceptable for new major version

### Medium Risk

- ⚠️ Existing users with `require()` will break (migration guide needed)
- ⚠️ `verbatimModuleSyntax` may require code changes
- ⚠️ Decorator settings may be unnecessary (verify usage)

### Mitigation Strategies

1. **Breaking Changes**: Document in CHANGELOG with migration examples
2. **Type Errors**: Fix incrementally, may reveal actual bugs
3. **Decorator Verification**: Grep codebase, remove if unused

## Testing Strategy

### Unit Tests

- Run full test suite after each phase
- Verify no regressions in existing functionality

### Integration Tests

- Test CLI executable directly
- Test via package bin
- Test package import in Node.js ESM context
- Test type imports work correctly

### Manual Tests

- Install package locally in test project
- Verify IDE type checking works
- Verify "go to definition" uses source (not `.d.ts`) with declaration maps
- Test incremental builds with project references

## Success Metrics

### Build Performance

- **Before**: Dual format builds (2x output)
- **After**: Single ESM format (1x output, ~40% faster)
- **Project References**: 2-10x faster incremental rebuilds

### Bundle Size

- **Before**: CJS + ESM + wrapper files
- **After**: ESM only (~15-20% smaller distribution)

### Type Safety

- **Before**: Missing `verbatimModuleSyntax`, weak property initialization
- **After**: Explicit type imports, stronger guarantees

### Developer Experience

- **Before**: No declaration maps, no project references
- **After**: "Go to source" works, faster IDE performance

## Rollback Plan

If issues arise:

1. **Immediate**: Revert `lib/tsup.config.ts` to dual format
2. **Short-term**: Restore `bin.cjs` wrapper
3. **Medium-term**: Keep TypeScript improvements, revert only build changes
4. **Git**: All changes in single commit, easy to revert

## Future Enhancements

### After ESM Migration

- [ ] Consider `splitting: true` for better code splitting
- [ ] Evaluate top-level await opportunities
- [ ] Consider `"exports"` for subpath exports if needed
- [ ] Investigate `pnpm workspaces` optimizations with project references

### Documentation

- [ ] Add "Why ESM-only?" section to README
- [ ] Create migration guide for users on older versions
- [ ] Document Node.js version requirements clearly

## References

- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript 5.0: verbatimModuleSyntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#verbatimmodulesyntax)
- [TypeScript Module Guide](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
- [TSup Documentation](https://tsup.egoist.dev/)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- ADR-007: ESM with NodeNext Resolution
- ADR-009: Replace Preconstruct with tsup

## Decision Log

| Date       | Decision                     | Rationale                                      |
| ---------- | ---------------------------- | ---------------------------------------------- |
| 2025-10-29 | ESM-only for library and CLI | Simplifies build, aligns with modern ecosystem |
| 2025-10-29 | Delete `bin.cjs` wrapper     | Direct ESM executable support in Node.js 14+   |
| 2025-10-29 | Add `verbatimModuleSyntax`   | TypeScript 5.0+ best practice for ESM          |
| 2025-10-29 | Enable project references    | Better monorepo performance and IDE support    |
| 2025-10-29 | Add `declarationMap: true`   | Improves IDE "go to source" experience         |
| 2025-10-29 | Fix naming mismatch          | Align tsup output with package.json exports    |

---

**Plan Status**: Ready for Implementation  
**Estimated Effort**: 2-4 hours (including testing)  
**Breaking Change**: Yes (major version bump recommended)  
**Recommended Version**: 2.0.0
