# 08: Code Quality & Maintainability

**Domain**: Code Quality, Error Messages, Debugging  
**Impact**: 🟡 Medium (affects maintainability)  
**Effort**: 🟢 Low  
**Priority**: P1 (near-term)

---

## 📋 Quick Summary

typed-openapi's code quality principles:

1. **Type-Safe String Building** - Avoid string concatenation bugs
2. **Actionable Error Messages** - Include context and suggestions
3. **Debug Mode** - Verbose logging for troubleshooting
4. **Code Comments** - Explain generated code
5. **Consistent Formatting** - Use Prettier by default

**Key insight**: Quality of generated code reflects on the tool

---

## 1. Type-Safe String Building

### 1.1 The Problem

**Current approach** (string concatenation):

```typescript
// Fragile and error-prone
const schema = "z.object({" +
  props.map(p => p.key + ": " + p.value).join(", ") +
  "})";

// Easy to miss quotes, commas, or parentheses
const schema = "z.object({ id: z.number() " + // Missing closing }
```

### 1.2 typed-openapi's Approach

**Template literals with helpers**:

```typescript
const wrapWithQuotesIfNeeded = (str: string) => {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str) ? str : `"${str}"`;
};

const propsString = Object.entries(props)
    .map(([prop, type]) => `${wrapWithQuotesIfNeeded(prop)}${isOptional(type) ? "?" : ""}: ${unwrap(type)}`)
    .join(", ");

return `{ ${propsString} }`;
```

### 1.3 Tagged Template Functions

**Create type-safe builders**:

```typescript
// Tagged template for Zod code
function zodCode(strings: TemplateStringsArray, ...values: unknown[]): string {
    return strings.reduce((result, str, i) => {
        const value = values[i];

        // Validate and escape values
        if (value !== undefined) {
            if (typeof value === "string") {
                // Escape quotes
                return result + str + value.replace(/"/g, '\\"');
            }
            return result + str + String(value);
        }

        return result + str;
    }, "");
}

// Usage
const field = "user-name"; // Contains hyphen
const type = "z.string()";

// Safe: Automatically handles special characters
const code = zodCode`z.object({ ${field}: ${type} })`;
// Result: z.object({ "user-name": z.string() })
```

**See implementation**: [examples/42-type-safe-strings.ts](./examples/42-type-safe-strings.ts)

### 1.4 Code Generation Helpers

**Create reusable builders**:

```typescript
class ZodBuilder {
    object(props: Record<string, string>, options: ObjectOptions = {}) {
        const propsStr = Object.entries(props)
            .map(([key, value]) => {
                const safeKey = this.escapeKey(key);
                return `${safeKey}: ${value}`;
            })
            .join(",\n  ");

        let code = `z.object({\n  ${propsStr}\n})`;

        if (options.strict) code += ".strict()";
        if (options.description) code += `.describe(${JSON.stringify(options.description)})`;

        return code;
    }

    array(itemType: string, options: ArrayOptions = {}) {
        let code = `z.array(${itemType})`;

        if (options.min !== undefined) code += `.min(${options.min})`;
        if (options.max !== undefined) code += `.max(${options.max})`;

        return code;
    }

    private escapeKey(key: string): string {
        // Valid JS identifier?
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
            return key;
        }
        // Needs quotes
        return JSON.stringify(key);
    }
}

// Usage
const builder = new ZodBuilder();
const code = builder.object(
    {
        id: "z.number()",
        "user-name": "z.string()", // Auto-quoted
        email: "z.string().email()",
    },
    { strict: true, description: "User schema" }
);
```

**See implementation**: [examples/43-zod-builder.ts](./examples/43-zod-builder.ts)

---

## 2. Error Messages & Debugging

### 2.1 Current State

**Generic errors** (not helpful):

```typescript
throw new Error("Schema not found");
throw new Error("Invalid type");
throw new Error("Generation failed");
```

**Problems**:

- No context about what went wrong
- No suggestion on how to fix
- No location information

### 2.2 Actionable Error Messages

**Include context and suggestions**:

```typescript
// Bad
throw new Error("Schema not found");

// Good
throw new Error(
    `Schema reference "${ref}" not found.\n\n` +
        `Available schemas:\n` +
        availableSchemas.map((s) => `  - ${s}`).join("\n") +
        "\n\n" +
        `Location: ${ctx.currentPath.join(" > ")}\n` +
        `File: ${ctx.sourceFile}:${ctx.lineNumber}\n\n` +
        `Tip: Check your OpenAPI spec for broken $ref pointers.`
);

// Even better: Include link to docs
throw new Error(
    `Schema reference "${ref}" not found.\n\n` +
        `This usually means:\n` +
        `  1. The schema doesn't exist in #/components/schemas\n` +
        `  2. The $ref path is incorrect\n` +
        `  3. The schema is in a different file (check multi-file specs)\n\n` +
        `Available schemas: ${availableSchemas.join(", ")}\n\n` +
        `Location: ${ctx.currentPath.join(" > ")}\n` +
        `Learn more: https://docs.openapi-zod-client.com/errors/schema-not-found`
);
```

### 2.3 Error Classes

**Create custom error types**:

```typescript
class SchemaNotFoundError extends Error {
    constructor(
        public ref: string,
        public availableSchemas: string[],
        public location: string[]
    ) {
        super(
            `Schema "${ref}" not found.\n\n` +
                `Available: ${availableSchemas.join(", ")}\n` +
                `Location: ${location.join(" > ")}`
        );
        this.name = "SchemaNotFoundError";
    }
}

class CircularReferenceError extends Error {
    constructor(
        public ref: string,
        public chain: string[]
    ) {
        super(
            `Circular reference detected: ${chain.join(" -> ")} -> ${ref}\n\n` +
                `Tip: Use z.lazy() for recursive schemas or simplify your schema structure.`
        );
        this.name = "CircularReferenceError";
    }
}

class InvalidOpenApiError extends Error {
    constructor(public issues: Array<{ path: string; message: string }>) {
        super(
            `Invalid OpenAPI specification:\n` +
                issues.map((i) => `  - ${i.path}: ${i.message}`).join("\n") +
                "\n\n" +
                `Tip: Validate your spec at https://editor.swagger.io/`
        );
        this.name = "InvalidOpenApiError";
    }
}
```

**See implementation**: [examples/44-error-classes.ts](./examples/44-error-classes.ts)

### 2.4 Debug Mode

**Add verbose logging**:

```bash
pnpm openapi-zod-client ./api.yaml --debug

🐛 Debug Mode
═══════════════════════════════════════════════════

[00:00] Loading OpenAPI spec...
  File: ./api.yaml
  Size: 2.4 MB
  Parser: @apidevtools/swagger-parser

[00:45] ✓ Spec loaded
  Version: 3.0.3
  Title: My API
  Base URL: https://api.example.com
  Servers: 1
  Paths: 180
  Schemas: 320

[00:50] Resolving references...
  Total $refs: 450
  Circular refs: 2 (Pet -> Tag -> Pet)
  External refs: 0

[01:20] ✓ References resolved

[01:25] Generating schemas...
  [Pet] object with 5 properties
    → id: number
    → name: string
    → category: Category (ref)
    → photoUrls: array<string>
    → status: enum<"available" | "pending" | "sold">
    → Generated: z.object({ ... }).strict()

  [Category] object with 2 properties
    → id: number
    → name: string
    → Generated: z.object({ ... }).strict()

[02:40] ✓ Generated 320 schemas

[02:45] Generating endpoints...
  [getPetById] GET /pets/{petId}
    → Path params: { petId: string }
    → Response 200: Pet
    → Response 404: Error
    → Generated endpoint definition

[03:50] ✓ Generated 180 endpoints

[03:55] Rendering template...
  Template: schemas-with-metadata
  Context size: 2.1 MB

[04:20] ✓ Template rendered (850 KB)

[04:25] Formatting with Prettier...
  Config: .prettierrc.json

[05:10] ✓ Formatted (1.8 MB)

[05:15] Writing output...
  File: ./client.ts

[05:20] ✓ Complete!
  Total time: 5.2s
  Output: ./client.ts (1.8 MB)
```

**Implementation**: [examples/45-debug-mode.ts](./examples/45-debug-mode.ts)

---

## 3. Generated Code Quality

### 3.1 Code Comments

**Add helpful comments**:

```typescript
/**
 * Pet
 *
 * A pet in the pet store
 *
 * @example
 * {
 *   "id": 123,
 *   "name": "Fluffy",
 *   "photoUrls": ["https://example.com/fluffy.jpg"],
 *   "status": "available"
 * }
 */
export const Pet = z
    .object({
        /** Unique identifier */
        id: z.number().int(),

        /** Pet name */
        name: z.string(),

        /** Photo URLs */
        photoUrls: z.array(z.string().url()),

        /** Pet status in the store */
        status: z.enum(["available", "pending", "sold"]).optional(),
    })
    .strict();

/**
 * Get pet by ID
 *
 * Returns a single pet
 *
 * @operationId getPetById
 * @tag pets
 */
export const getPetById = {
    method: "GET" as const,
    path: "/pets/{petId}",
    // ...
};
```

**CLI option**:

```bash
# Add JSDoc comments
pnpm openapi-zod-client ./api.yaml --with-docs

# Include examples in comments
pnpm openapi-zod-client ./api.yaml --with-docs --with-examples
```

### 3.2 Consistent Formatting

**Always format output**:

```typescript
import prettier from "prettier";

async function formatOutput(code: string, config?: prettier.Options) {
    const defaultConfig = {
        parser: "typescript",
        printWidth: 100,
        tabWidth: 2,
        singleQuote: false,
        trailingComma: "es5",
    };

    try {
        return await prettier.format(code, {
            ...defaultConfig,
            ...config,
        });
    } catch (error) {
        console.warn("⚠️  Prettier formatting failed, output may be unformatted");
        return code;
    }
}
```

### 3.3 Code Validation

**Validate generated code**:

```typescript
import ts from "typescript";

function validateGeneratedCode(code: string): ts.Diagnostic[] {
    const sourceFile = ts.createSourceFile("generated.ts", code, ts.ScriptTarget.Latest, true);

    const program = ts.createProgram(["generated.ts"], {
        noEmit: true,
        noImplicitAny: true,
        strict: true,
    });

    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
        console.error("❌ Generated code has TypeScript errors:");
        diagnostics.forEach((diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            console.error(`  - ${message}`);
        });
    }

    return diagnostics;
}
```

---

## 4. Maintainability

### 4.1 Code Organization

**Separate concerns**:

```typescript
// lib/src/
//   parsing/
//     parseOpenApi.ts
//     resolveRefs.ts
//     validateSpec.ts
//
//   generation/
//     generateSchemas.ts
//     generateEndpoints.ts
//     generateClient.ts
//
//   factories/
//     zodFactory.ts
//     typescriptFactory.ts
//
//   templates/
//     default.hbs
//     schemas-only.hbs
//
//   utils/
//     stringUtils.ts
//     errorUtils.ts
//     formatting.ts
```

### 4.2 Testing Strategy

**Test each layer**:

```typescript
// Unit tests: Pure functions
test("escapeKey handles special characters", () => {
    expect(escapeKey("user-name")).toBe('"user-name"');
    expect(escapeKey("validName")).toBe("validName");
});

// Integration tests: Full generation
test("generates valid code from spec", async () => {
    const code = await generateZodClientFromOpenAPI({
        openApiDoc: petstoreSpec,
        disableWriteToFile: true,
    });

    expect(code).toContain("export const Pet");
    expect(() => validateGeneratedCode(code)).not.toThrow();
});

// Type tests: Generated types are correct
test("generated types are correct", () => {
    expect<Schemas.Pet>().type.toHaveProperty("id");
});
```

### 4.3 Documentation

**Document complex logic**:

```typescript
/**
 * Resolves circular references in OpenAPI schemas
 *
 * OpenAPI allows schemas to reference themselves (e.g. Category.subcategories: Category[])
 * Zod requires using z.lazy() for circular references to avoid infinite recursion.
 *
 * Algorithm:
 * 1. Track reference chain during traversal
 * 2. Detect when a schema references itself (direct or indirect)
 * 3. Generate z.lazy(() => Schema) for circular references
 * 4. Generate normal reference for non-circular cases
 *
 * @example
 * // OpenAPI:
 * Category:
 *   properties:
 *     subcategories:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Category'
 *
 * // Generated:
 * const Category = z.object({
 *   subcategories: z.array(z.lazy(() => Category)).optional()
 * });
 */
function resolveCircularReference(ref: string, chain: string[], ctx: Context): string {
    // Implementation...
}
```

---

## 5. Quality Checklist

- [ ] Type-safe string building
- [ ] Actionable error messages
- [ ] Debug mode available
- [ ] Code comments generated
- [ ] Consistent formatting (Prettier)
- [ ] Generated code validated
- [ ] Tests for all features
- [ ] Documentation for complex logic
- [ ] Proper error handling
- [ ] Logging and debugging utilities

---

## 6. References

### Code Examples

- [42-type-safe-strings.ts](./examples/42-type-safe-strings.ts)
- [43-zod-builder.ts](./examples/43-zod-builder.ts)
- [44-error-classes.ts](./examples/44-error-classes.ts)
- [45-debug-mode.ts](./examples/45-debug-mode.ts)

### External Resources

- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [Prettier API](https://prettier.io/docs/en/api.html)
- [Error Handling Best Practices](https://javascript.info/custom-errors)

---

**Congratulations!** You've completed all domain documents. Return to [00-EXECUTIVE-SUMMARY.md](./00-EXECUTIVE-SUMMARY.md) for the roadmap.
