# ts-morph API Capabilities Analysis

**Date:** October 27, 2025  
**Purpose:** Document ts-morph capabilities to inform AstBuilder design for Phase 1 Part 2

---

## Executive Summary

ts-morph is a **mature, well-documented library** built on top of the TypeScript Compiler API. It provides a significantly simpler and more intuitive API for AST manipulation compared to raw TypeScript compiler or `tanu`.

**Key Finding:** ts-morph can handle **all** our TypeScript generation needs with zero type assertions!

---

## ✅ Validated Capabilities

### 1. **Type Alias Generation** ✅ COMPLETE

```typescript
sourceFile.addTypeAlias({
  name: 'User',
  type: '{ id: number; name: string }',
  isExported: true,
});
// Output: export type User = { id: number; name: string };
```

**Supports:**
- Simple object types
- Union types (`"active" | "inactive" | "pending"`)
- Intersection types (`Base & { extra: string }`)
- Nested types
- Array types (`User[]`)
- Tuple types (`[number, number]`)

### 2. **Interface Generation** ✅ COMPLETE

```typescript
sourceFile.addInterface({
  name: 'Person',
  isExported: true,
  properties: [
    { name: 'id', type: 'number' },
    { name: 'email', type: 'string', hasQuestionToken: true }, // optional
    { name: 'data', type: 'Data', isReadonly: true }, // readonly
  ],
  indexSignatures: [
    { keyName: 'key', keyType: 'string', returnType: 'any' }
  ],
});
```

**Supports:**
- Required properties
- Optional properties (`?:`)
- Readonly properties
- Index signatures (`[key: string]: any`)

### 3. **Import Generation** ✅ COMPLETE

```typescript
// Named imports
sourceFile.addImportDeclaration({
  moduleSpecifier: 'zod',
  namedImports: ['z', 'ZodType'],
});
// Output: import { z, ZodType } from "zod";

// Default import
sourceFile.addImportDeclaration({
  moduleSpecifier: 'axios',
  defaultImport: 'axios',
});
// Output: import axios from "axios";

// Namespace import
sourceFile.addImportDeclaration({
  moduleSpecifier: 'fs',
  namespaceImport: 'fs',
});
// Output: import * as fs from "fs";
```

### 4. **Variable Declarations** ✅ COMPLETE

```typescript
sourceFile.addVariableStatement({
  declarationKind: 'const',
  isExported: true,
  declarations: [
    {
      name: 'config',
      type: 'Config', // optional type annotation
      initializer: '{ timeout: 5000 }',
    },
  ],
});
// Output: export const config: Config = { timeout: 5000 };
```

### 5. **Function Declarations** ✅ COMPLETE

```typescript
sourceFile.addFunction({
  name: 'fetchData',
  isExported: true,
  isAsync: true,
  parameters: [{ name: 'url', type: 'string' }],
  returnType: 'Promise<Response>',
  statements: 'return fetch(url);',
});
// Output: export async function fetchData(url: string): Promise<Response> { return fetch(url); }
```

### 6. **JSDoc Comments** ✅ COMPLETE

```typescript
sourceFile.addInterface({
  name: 'User',
  isExported: true,
  docs: ['Represents a user in the system'],
  properties: [
    {
      name: 'id',
      type: 'number',
      docs: ['Unique identifier'],
    },
  ],
});
// Output includes proper JSDoc comments
```

---

## 🎨 Output Formatting

**Key Observations:**

1. **Quote Style:** ts-morph uses **double quotes** by default
2. **Semicolons:** Automatically adds semicolons
3. **Formatting:** Respects TypeScript's standard formatting
4. **Whitespace:** Clean, consistent spacing

**Impact on Project:**
- Snapshot tests will need updating (different formatting than `tanu`)
- Generated code will be **more consistent** with TypeScript standards
- No need to worry about formatting - ts-morph handles it

---

## 💡 Design Recommendations for AstBuilder

### Recommended API Design

```typescript
export class AstBuilder {
  private project: Project;
  private sourceFile: SourceFile;

  constructor() {
    this.project = new Project({ useInMemoryFileSystem: true });
    this.sourceFile = this.project.createSourceFile('generated.ts', '', { overwrite: true });
  }

  // Import management
  addImport(moduleSpecifier: string, namedImports: string[]): this;
  addDefaultImport(moduleSpecifier: string, defaultImport: string): this;
  addNamespaceImport(moduleSpecifier: string, namespaceImport: string): this;

  // Type generation
  addTypeAlias(name: string, type: string, options?: { exported?: boolean; docs?: string[] }): this;
  addInterface(name: string, properties: Property[], options?: InterfaceOptions): this;

  // Variable generation
  addConstant(name: string, initializer: string, options?: { type?: string; exported?: boolean }): this;

  // Function generation (if needed)
  addFunction(name: string, params: Parameter[], returnType: string, body: string, options?: FunctionOptions): this;

  // Output
  toString(): string;
  getFullText(): string; // alias for clarity
}
```

### Why This Design?

1. **Fluent API:** Method chaining for ergonomics
2. **Simple:** Hide ts-morph complexity behind clean interface
3. **Type-safe:** Strong typing throughout
4. **No assertions:** ts-morph types are excellent
5. **Options objects:** Flexible, extensible API

---

## 🔍 Comparison: tanu vs ts-morph

| Feature | tanu | ts-morph |
|---------|------|----------|
| **Type Safety** | Poor (requires assertions) | Excellent (zero assertions) |
| **Documentation** | Minimal | Comprehensive |
| **API Style** | Functional, mixed | Object-oriented, consistent |
| **Community** | Small | Large, active |
| **Maturity** | Lower | High (built on TS compiler) |
| **Output Format** | Varies | Consistent |
| **Learning Curve** | Medium | Low (intuitive API) |

---

## ✅ Gaps and Limitations

**None identified for our use case!**

ts-morph provides everything we need for OpenAPI → TypeScript generation:
- ✅ Type aliases (our primary need)
- ✅ Interfaces (alternative representation)
- ✅ Imports (for referencing types)
- ✅ Comments (for documentation)
- ✅ Complex types (unions, intersections, nested)

---

## 📋 Next Steps

### Task 2.2: Create AstBuilder

Based on this analysis, proceed with confidence:

1. **Create `ast-builder.ts`** with fluent API
2. **Write unit tests first** (TDD)
3. **Implement minimal methods** needed for current usage
4. **No type assertions** - ts-morph types are excellent
5. **Add methods incrementally** as needed

### Task 2.3-2.4: Refactor TypeScript Generation

Replace `tanu` calls with AstBuilder:

1. **One function at a time**
2. **Keep tests passing**
3. **Update snapshots** as needed (formatting will change)
4. **Verify no behavioral regressions**

---

## 🎯 Success Metrics

**Target:** Eliminate 30 type assertions from TypeScript generation files

**Current Baseline:**
- `openApiToTypescript.helpers.ts`: 28 assertions
- `openApiToTypescript.ts`: 2 assertions

**Expected After:**
- Both files: 0 assertions
- All tests passing
- Generated TypeScript improved consistency

---

## 📚 References

- **ts-morph Documentation:** https://ts-morph.com/
- **ts-morph GitHub:** https://github.com/dsherret/ts-morph
- **Exploratory Tests:** `lib/src/ast-builder.test.ts` (19 tests, all passing)

---

**Conclusion:** ts-morph is **ideal** for our needs. Proceed with full confidence!

