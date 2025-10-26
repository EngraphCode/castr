# 07: Deployment & Bundle Optimization

**Domain**: Bundle Size, Tree-Shaking, Dependencies  
**Impact**: 🔴 High (affects production apps)  
**Effort**: 🟢 Low to Medium  
**Priority**: P1 (near-term)

---

## 📋 Quick Summary

typed-openapi's deployment philosophy:

1. **Zero Dependencies** - Type-only mode has no runtime deps
2. **Tree-Shaking** - Ensure generated code is optimized
3. **Bundle Analysis** - Help users understand size impact
4. **Lazy Loading** - Split code when beneficial
5. **No Side Effects** - Mark as side-effect free

**Key insight**: Bundle size directly impacts user experience

---

## 1. Bundle Size Awareness

### 1.1 typed-openapi's Zero Dependencies

**Type-only mode**:

```typescript
// No imports needed!
export type Pet = {
  id: number;
  name: string;
};

// Lightweight client
export function createClient(fetcher: Fetcher) {
  return {
    getPetById: (id) => fetcher('GET', `/pets/${id}`),
  };
}
```

**Result**: 0 KB runtime dependencies

### 1.2 Dependency Comparison

| Mode                             | Dependencies               | Size (min+gzip) |
| -------------------------------- | -------------------------- | --------------- |
| **typed-openapi (types)**        | None                       | 0 KB            |
| **typed-openapi (zod)**          | zod                        | 13 KB           |
| **openapi-zod-client (current)** | zod + @zodios/core + axios | 56 KB           |

**Real-world impact**:

- Initial page load: ~224ms faster (56 KB @ 3G)
- Parsing time: ~80ms faster
- Memory: ~40 MB less

### 1.3 Bundle Size Reporting

**Add to CLI**:

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts --analyze

📦 Bundle Analysis
═══════════════════════════════════════════════════

Generated Code:
  ./client.ts                    1.8 MB  →  240 KB (gzip)

Runtime Dependencies:
  zod                           58 KB   →   13 KB (gzip)
  @zodios/core                  23 KB   →    7 KB (gzip)

Peer Dependencies (user-installed):
  axios                         98 KB   →   28 KB (gzip)

Total Bundle Impact:             2.0 MB  →  288 KB (gzip)

═══════════════════════════════════════════════════

💡 Optimization Opportunities:

1. Use --output-mode types
   Savings: -179 KB (-62%)
   Impact: No runtime validation, faster IDE

2. Use --export-schemas referenced
   Savings: -1.2 MB (-60% generated code)
   Impact: Only export used schemas

3. Use --template schemas-with-metadata + fetch
   Savings: -121 KB (-42% deps)
   Impact: Remove Zodios + axios, use native fetch

Potential Total Savings: 1.5 MB (75%)
```

**Implementation**: [examples/39-bundle-analysis.ts](./examples/39-bundle-analysis.ts)

---

## 2. Tree-Shaking Optimization

### 2.1 The Problem

**Bad exports** (not tree-shakeable):

```typescript
// Default export object
export default {
  PetSchema: z.object({
    /* ... */
  }),
  UserSchema: z.object({
    /* ... */
  }),
  // ... 200 more schemas
};

// Barrel exports
export * from './schemas';
export * from './endpoints';
export * from './client';
```

**Result**: Bundler includes everything, even unused code

### 2.2 typed-openapi's Approach

**Named exports**:

```typescript
// Each schema is a separate export
export const Pet = z.object({
  /* ... */
});
export const User = z.object({
  /* ... */
});

// Users import only what they need
import { Pet } from './client'; // Only Pet is bundled
```

**Mark as side-effect free**:

```json
{
  "sideEffects": false
}
```

### 2.3 Applying to openapi-zod-client

**Current**: Mixed approach

**Enhanced**: Optimize generated code

```typescript
// Good: Named exports (tree-shakeable)
export const PetSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .strict();

export const UserSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
  })
  .strict();

// Also good: Namespace exports (tree-shakeable with modern bundlers)
export const schemas = {
  Pet: PetSchema,
  User: UserSchema,
} as const;

// Avoid: Computed object keys (not tree-shakeable)
export const schemas = {
  ['Pet']: PetSchema, // ❌ Not statically analyzable
  ['User']: UserSchema,
} as const;
```

**Implementation guide**: [examples/40-tree-shaking.ts](./examples/40-tree-shaking.ts)

### 2.4 Bundle Analysis Tools

**Add analysis command**:

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts --analyze-tree-shaking

🌳 Tree-Shaking Analysis
═══════════════════════════════════════════════════

Exports (total: 320):
  ✓ Tree-shakeable: 315 (98%)
  ⚠️ Not tree-shakeable: 5 (2%)

Potential Issues:
  ⚠️ Dynamic key in schemas object (line 45)
     export const schemas = {
       [computedName]: schema  // ❌ Not statically analyzable
     };

     Fix: Use static keys
       export const schemas = {
         Pet: PetSchema  // ✓ Statically analyzable
       };

Bundle Impact Test:
  Full import:     2.0 MB
  Single schema:   12 KB  (✓ Tree-shaking works!)
  Single endpoint: 18 KB  (✓ Tree-shaking works!)
```

---

## 3. Lazy Loading Strategies

### 3.1 When to Split

**Don't split**: Small APIs (<100 endpoints)

- Single file is simpler
- No significant benefit

**Do split**: Large APIs (>500 endpoints)

- Split by domain/feature
- Lazy load infrequently used schemas
- Code-split at route level

### 3.2 Code-Splitting Pattern

**For large APIs**:

```typescript
// client.ts (main bundle)
export async function createApiClient() {
  return {
    // Eager-loaded (common)
    auth: await import('./domains/auth'),
    users: await import('./domains/users'),

    // Lazy-loaded (rare)
    get admin() {
      return import('./domains/admin');
    },
    get analytics() {
      return import('./domains/analytics');
    },
  };
}

// Usage
const api = await createApiClient();
await api.users.getUser('123'); // Already loaded
await (await api.admin).deleteUser('123'); // Loads on first use
```

**Implementation**: [examples/41-code-splitting.ts](./examples/41-code-splitting.ts)

---

## 4. Dependency Management

### 4.1 Peer Dependencies

**Current**: Zodios requires axios as peer dependency

**Enhancement**: Make dependencies optional

```json
{
  "dependencies": {
    "zod": "^3.22.0"
  },
  "peerDependencies": {
    "@zodios/core": "^10.0.0",
    "axios": "^1.6.0"
  },
  "peerDependenciesMeta": {
    "@zodios/core": {
      "optional": true
    },
    "axios": {
      "optional": true
    }
  }
}
```

**Generate warnings**:

```bash
# If using Zodios template without @zodios/core installed
⚠️  Missing peer dependency: @zodios/core
   Install with: pnpm add @zodios/core axios

   Or use a different template:
   - --template schemas-with-metadata (no dependencies)
   - --output-mode types (no runtime validation)
```

### 4.2 Alternative Clients

**Support multiple clients**:

```bash
# Zodios (current default)
pnpm openapi-zod-client ./api.yaml --client zodios
# Deps: zod, @zodios/core, axios

# Headless (no deps)
pnpm openapi-zod-client ./api.yaml --client headless
# Deps: zod only

# Type-only (zero deps)
pnpm openapi-zod-client ./api.yaml --client types
# Deps: none
```

---

## 5. Production Optimization

### 5.1 Minification-Friendly Code

**Generate code that minifies well**:

```typescript
// Bad: Long descriptive names (doesn't minify)
const PetWithLongDescriptiveNameSchema = z.object({
  veryLongPropertyName: z.string(),
});

// Good: Shorter names (minifies better)
const Pet = z.object({
  id: z.number(),
  name: z.string(),
});

// Comments are stripped by minifier anyway
const Pet = z.object({
  id: z.number(), // Pet ID
  name: z.string(), // Pet name
});
```

### 5.2 Dead Code Elimination

**Avoid patterns that prevent DCE**:

```typescript
// Bad: Side effects (can't be eliminated)
const schemas = {};
Object.assign(schemas, { Pet, User });

// Good: Pure assignment (can be eliminated if unused)
export const schemas = { Pet, User };

// Bad: IIFE (can't be optimized)
export const Pet = (() => {
  const base = z.object({ id: z.number() });
  return base.extend({ name: z.string() });
})();

// Good: Direct definition
export const Pet = z.object({
  id: z.number(),
  name: z.string(),
});
```

### 5.3 Source Maps

**Include source maps for debugging**:

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts --sourcemap

# Generates:
#   ./client.ts
#   ./client.ts.map

# Maps back to OpenAPI spec for debugging
```

---

## 6. CDN Optimization

### 6.1 ESM Builds

**Support modern bundlers**:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

### 6.2 Browser-Friendly Output

**Option to generate browser builds**:

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts --target browser

# Generates:
#   ./client.ts (ESM, no Node.js APIs)
#   ./client.d.ts (TypeScript types)
```

---

## 7. Deployment Checklist

- [ ] Bundle size analyzed
- [ ] Tree-shaking verified
- [ ] Dependencies minimized
- [ ] sideEffects: false set
- [ ] Code splits appropriately
- [ ] Source maps generated
- [ ] Minification-friendly code
- [ ] Browser compatibility checked
- [ ] Performance tested
- [ ] CDN-ready if needed

---

## 8. References

### Code Examples

- [39-bundle-analysis.ts](./examples/39-bundle-analysis.ts)
- [40-tree-shaking.ts](./examples/40-tree-shaking.ts)
- [41-code-splitting.ts](./examples/41-code-splitting.ts)

### External Resources

- [Rollup tree-shaking](https://rollupjs.org/guide/en/#tree-shaking)
- [Webpack bundle analysis](https://webpack.js.org/guides/code-splitting/)
- [bundlephobia.com](https://bundlephobia.com/) - Check package sizes

---

**Next**: Read [08-CODE-QUALITY.md](./08-CODE-QUALITY.md) for code quality and maintainability patterns.
