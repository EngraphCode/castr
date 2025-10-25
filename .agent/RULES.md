# Coding Standards & Best Practices

**Date:** October 2025  
**Project:** openapi-zod-client  
**Purpose:** Define quality standards for code and tests

---

## Testing Standards

### 🎯 **MANDATORY: Test-Driven Development (TDD)**

**ALL code changes MUST follow TDD:**

1. **Write failing tests FIRST** - Before writing any implementation code
2. **Run tests - confirm they fail** - Proves test is actually testing something
3. **Write minimal code to pass** - Implement only what's needed
4. **Run tests - confirm they pass** - Validates implementation works
5. **Refactor if needed** - Clean up while tests protect you
6. **Repeat** - For each new piece of functionality

**Why TDD is mandatory:**

- **Prevents regressions** - Every change is protected by tests
- **Documents behavior** - Tests serve as living documentation
- **Validates tests work** - Seeing tests fail first proves they're effective
- **Forces good design** - Hard-to-test code is usually bad code
- **Builds confidence** - Safe to refactor with test coverage

**Example workflow:**

```typescript
// Step 1: Write failing test FIRST
test("convertOpenAPIToZod converts string type", () => {
    const schema = { type: "string" };
    const result = convertOpenAPIToZod(schema);
    expect(result).toBe("z.string()");
});

// Step 2: Run tests - EXPECT FAILURE
// ❌ ReferenceError: convertOpenAPIToZod is not defined

// Step 3: Write minimal implementation
export function convertOpenAPIToZod(schema: SchemaObject): string {
    return "z.string()"; // Minimal code to pass
}

// Step 4: Run tests - EXPECT SUCCESS
// ✅ Test passes

// Step 5: Add next test case
test("convertOpenAPIToZod converts number type", () => {
    const schema = { type: "number" };
    const result = convertOpenAPIToZod(schema);
    expect(result).toBe("z.number()");
});

// Step 6: Run tests - EXPECT FAILURE (new test fails)
// ✅ string test passes
// ❌ number test fails

// Step 7: Update implementation
export function convertOpenAPIToZod(schema: SchemaObject): string {
    if (schema.type === "string") return "z.string()";
    if (schema.type === "number") return "z.number()";
    throw new Error(`Unsupported type: ${schema.type}`);
}

// Step 8: Run tests - ALL PASS
// ✅ All tests pass
```

**No exceptions:**

- ❌ "I'll add tests later" - NOT ALLOWED
- ❌ "This is too simple to test" - STILL WRITE THE TEST
- ❌ "I need to prototype first" - Prototype in a test file
- ✅ Tests must be written BEFORE implementation code

---

### Core Principles

#### 1. **All tests must be unit tests of pure functions where possible**

**Why:** Pure functions are deterministic, easy to test, and have no side effects.

**Good:**

```typescript
// Pure function - same input always gives same output
function normalizeString(input: string): string {
    return input.trim().toLowerCase();
}

test("normalizeString removes whitespace and lowercases", () => {
    expect(normalizeString("  HELLO  ")).toBe("hello");
});
```

**Avoid:**

```typescript
// Impure - depends on external state
let globalCounter = 0;
function incrementAndReturn(): number {
    return ++globalCounter;
}

// Hard to test reliably
test("incrementAndReturn increases counter", () => {
    expect(incrementAndReturn()).toBe(1); // Depends on order!
});
```

**When impure is necessary:**

- Clearly separate pure logic from side effects
- Test pure parts independently
- Mock side effects for integration tests

---

#### 2. **All tests must prove something useful**

**Why:** Tests document behavior and catch regressions. Useless tests waste time.

**Good:**

```typescript
test("getZodSchema converts OpenAPI string to z.string()", () => {
    const schema = { type: "string" as const };
    const result = getZodSchema({ schema });
    expect(result.toString()).toBe("z.string()");
});
```

**Bad:**

```typescript
test("getZodSchema returns something", () => {
    const schema = { type: "string" as const };
    const result = getZodSchema({ schema });
    expect(result).toBeDefined(); // Too vague, proves nothing
});
```

**Useful tests prove:**

- Correct output for given input
- Edge cases handled
- Errors thrown for invalid input
- Type transformations work
- Format/structure is correct

---

#### 3. **All tests must prove behavior, not implementation**

**Why:** Tests should survive refactoring. Testing implementation creates brittle tests.

**Good - Tests behavior:**

```typescript
test("pathToVariableName converts kebab-case to camelCase", () => {
    expect(pathToVariableName("/user-profile")).toBe("userProfile");
    expect(pathToVariableName("/api/user-data")).toBe("apiUserData");
});
```

**Bad - Tests implementation:**

```typescript
test("pathToVariableName calls replaceHyphenatedPath internally", () => {
    const spy = jest.spyOn(utils, "replaceHyphenatedPath");
    pathToVariableName("/user-profile");
    expect(spy).toHaveBeenCalled(); // Constrains implementation!
});
```

**Guidelines:**

- Test what the function does, not how it does it
- Test public API, not private helpers
- Refactoring shouldn't break tests
- Focus on inputs and outputs

---

#### 4. **No tests may constrain implementation**

**Why:** Tests should allow refactoring without rewriting tests.

**Examples of constraining tests:**

```typescript
// ❌ Constrains internal structure
expect(result).toHaveProperty("_internalCache");

// ❌ Constrains method calls
expect(mockFn).toHaveBeenCalledTimes(3);

// ❌ Constrains private methods
expect(obj._privateMethod).toBeDefined();

// ✅ Tests behavior
expect(result.output).toBe("expected");
expect(result.errors).toHaveLength(0);
```

**When implementation testing is OK:**

- Performance testing (call counts for optimization)
- Testing specific algorithms (when algorithm IS the requirement)
- Integration tests (verifying component connections)

---

#### 5. **No tests may trigger filesystem or network I/O**

**Why:** I/O makes tests slow, flaky, and environment-dependent.

**STDIO is fine** - console logs, stdout/stderr for testing CLI output.

**Good:**

```typescript
// Mock filesystem
const mockFs = {
    readFile: vi.fn().mockResolvedValue("content"),
    writeFile: vi.fn().mockResolvedValue(undefined),
};

test("processFile reads and transforms content", async () => {
    const result = await processFile("test.txt", mockFs);
    expect(mockFs.readFile).toHaveBeenCalledWith("test.txt");
    expect(result).toBe("transformed content");
});
```

**Bad:**

```typescript
// ❌ Reads actual filesystem
test("processFile reads actual file", async () => {
    await fs.writeFile("/tmp/test.txt", "content"); // Slow, fragile
    const result = await processFile("/tmp/test.txt");
    expect(result).toBe("transformed content");
});
```

**Strategies:**

- Mock filesystem operations (`memfs`, custom mocks)
- Mock HTTP clients
- Use in-memory data structures
- Test pure transformation logic separately
- STDIO is fine for CLI output testing

---

#### 6. **All type information must be preserved**

**Why:** TypeScript's strength is types. Tests should verify type correctness.

**Good:**

```typescript
test("getTypescriptFromOpenApi preserves type structure", () => {
    const schema: SchemaObject = {
        type: "object",
        properties: {
            name: { type: "string" },
            age: { type: "number" },
        },
    };

    const result = getTypescriptFromOpenApi({ schema });
    // Type is preserved through the pipeline
    const typed: TypeDefinition = result;
    expect(typed).toBeDefined();
});
```

**Avoid:**

```typescript
// ❌ Loses type information
test("function returns something", () => {
    const result: any = getTypescriptFromOpenApi({ schema });
    expect(result).toBeTruthy();
});
```

**Guidelines:**

- Use proper types in test setup
- Don't use `any` unless testing `any` handling
- Verify type guards work
- Test discriminated unions
- Verify generic type parameters

---

#### 7. **Minimize use of type casting (`as`). `as const` is fine.**

**Why:** Type casting bypasses type checking, hiding potential errors.

**Good:**

```typescript
// Proper typing
const schema: SchemaObject = {
    type: "string",
    enum: ["a", "b", "c"],
};

// as const is fine - preserves literal types
const methods = ["GET", "POST", "PUT"] as const;
type Method = (typeof methods)[number]; // "GET" | "POST" | "PUT"
```

**Avoid:**

```typescript
// ❌ Unsafe casting
const result = getSchema() as OpenAPIObject; // Bypasses checking!

// ❌ Casting to shut up compiler
const value = something as any as SpecificType; // Very dangerous!

// ❌ Narrowing from union type (with guard)
if (isReferenceObject(obj)) {
    const ref = obj as ReferenceObject; // Needless, if the typeguard uses the `is` keyword then the cast is unecessary.
}
```

**When casting is acceptable:**

```typescript
// ✅ Testing type guards
const result = validate(input) as ValidationResult;
expect(isSuccess(result)).toBe(true);

// ✅ as const for literal types
const config = { readonly: true } as const;
```

**Better alternatives:**

- Use type predicates (type guards) (`isReferenceObject`, etc.) that use the `is` keyword.
- Proper type annotations
- Generic type parameters
- Discriminated unions

---

## Code Quality Standards

### General Principles

#### 1. **Prefer pure functions**

- No side effects when possible
- Same input → same output
- Easy to test and reason about
- Compose well

#### 2. **Explicit over implicit**

```typescript
// ✅ Good - explicit and clear
function convertSchema(schema: SchemaObject, options: ConversionOptions): string {
    return generateZod(schema, options);
}

// ❌ Bad - implicit dependencies
function convertSchema(schema: SchemaObject): string {
    return generateZod(schema, globalOptions); // Hidden dependency!
}
```

#### 3. **Single Responsibility Principle**

Each function should do one thing well:

```typescript
// ✅ Good - separate concerns
function parseSchema(schema: SchemaObject): ParsedSchema {
    /* ... */
}
function validateSchema(parsed: ParsedSchema): ValidationResult {
    /* ... */
}
function generateCode(parsed: ParsedSchema): string {
    /* ... */
}

// ❌ Bad - does too much
function processSchema(schema: SchemaObject): string {
    // parsing + validation + generation all in one
}
```

#### 4. **Type safety without `any`**

```typescript
// ✅ Good - proper typing
function processValue<T>(value: T, transform: (v: T) => T): T {
    return transform(value);
}

// ❌ Bad - loses type safety
function processValue(value: any, transform: any): any {
    return transform(value);
}
```

**When `any` is acceptable:**

- Interacting with untyped libraries
- Extremely dynamic situations
- Always document why with comment

#### 5. **Defer Type Definitions to Source Libraries**

**Why:** Library types are maintained by domain experts, are more accurate, and reduce maintenance burden.

**Core Principles:**

1. **Use library types directly** - Import types from `openapi3-ts`, `zod`, `tanu`, etc.
2. **Avoid complex type extractions** - No `Exclude<>`, `Extract<>`, `Pick<>` gymnastics on library types
3. **Don't redefine library concepts** - If the library has it, use it
4. **Accept union types** - If the spec allows `SchemaObject | ReferenceObject`, accept both

**Good:**

```typescript
import type { SchemaObject, ReferenceObject, SchemaObjectType } from "openapi3-ts";

// Use library's union types directly
function processSchema(schema: SchemaObject | ReferenceObject): Result {
    if (isReferenceObject(schema)) {
        // Handle ref
    }
    // Handle schema
}

// Use library's exact types
function getSchemaType(schema: SchemaObject): SchemaObjectType | SchemaObjectType[] | undefined {
    return schema.type; // Type matches library definition
}
```

**Bad:**

```typescript
// ❌ Redefining library enums
type PrimitiveType = "string" | "number" | "integer" | "boolean" | "null";
const primitiveTypeList: readonly PrimitiveType[] = ["string", "number", "integer", "boolean", "null"];

// ❌ Complex extractions
type SingleType = Exclude<SchemaObject["type"], unknown[] | undefined>;

// ❌ Claiming narrower types than reality
function handleItems(
    items: SchemaObject // ❌ Actually receives SchemaObject | ReferenceObject!
): Result {}
```

**Type Guards Over Assertions:**

```typescript
// ✅ Proper type guard - tied to library type with Extract
import type { SchemaObject } from "openapi3-ts";

type PrimitiveSchemaType = Extract<
    NonNullable<SchemaObject["type"]>,
    "string" | "number" | "integer" | "boolean" | "null"
>;

const PRIMITIVE_SCHEMA_TYPES: readonly PrimitiveSchemaType[] = [
    "string",
    "number",
    "integer",
    "boolean",
    "null",
] as const;

export function isPrimitiveSchemaType(value: unknown): value is PrimitiveSchemaType {
    if (typeof value !== "string") return false;
    const typeStrings: readonly string[] = PRIMITIVE_SCHEMA_TYPES;
    return typeStrings.includes(value);
}

// ✅ Type guard from existing library
export function isReferenceObject(obj: unknown): obj is ReferenceObject {
    return obj != null && Object.prototype.hasOwnProperty.call(obj, "$ref");
}

// ❌ Avoid type assertions
const schema = obj as SchemaObject; // Bypasses type safety!

// ❌ Boolean filter pretending to be a type guard
function isPrimitive(type: SchemaObject["type"]): boolean {
    // ❌ Input is already typed! This provides NO type narrowing
    return type === "string" || type === "number";
}

// ❌ Performative type predicates
function isObject(obj: unknown): obj is Record<string, unknown> {
    // This is just a fancy 'any' - not a meaningful type
}
```

**Pattern: Literals Tied to Library Types**

When defining runtime checks for library types:

```typescript
// 1. Extract the subset from library type (compiler validates)
type MySubset = Extract<LibraryType, "foo" | "bar">;

// 2. Define literals tied to that type
const MY_VALUES: readonly MySubset[] = ["foo", "bar"] as const;

// 3. Create type predicate that narrows from unknown
export function isMySubset(value: unknown): value is MySubset {
    if (typeof value !== "string") return false;
    return (MY_VALUES as readonly string[]).includes(value);
}
```

This pattern ensures:

- Compiler validates literals match library types at compile time
- Type guard actually narrows from `unknown` (real type narrowing)
- Refactoring safety: library type changes break our code visibly
- No boolean filters pretending to be type guards

**When Custom Types Are Acceptable:**

- Domain-specific concepts not in libraries
- Aggregating multiple library concepts meaningfully where no reasonable library-native alternative exists
- Helper types that genuinely simplify (must be justified with comment)

#### 6. **Immutability by default**

```typescript
// ✅ Good - immutable
function addItem<T>(array: readonly T[], item: T): T[] {
    return [...array, item];
}

// ❌ Bad - mutates input
function addItem<T>(array: T[], item: T): void {
    array.push(item); // Mutates!
}
```

#### 7. **Clear error handling**

```typescript
// ✅ Good - explicit error handling
function parseOpenAPI(input: string): Result<OpenAPIObject, Error> {
    try {
        const parsed = JSON.parse(input);
        if (!isValidOpenAPI(parsed)) {
            return { success: false, error: new Error("Invalid OpenAPI") };
        }
        return { success: true, value: parsed };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

// ❌ Bad - swallows errors
function parseOpenAPI(input: string): OpenAPIObject | null {
    try {
        return JSON.parse(input);
    } catch {
        return null; // Lost error information!
    }
}
```

---

## TypeScript Best Practices

### 1. **Use strict mode**

Ensure `tsconfig.json` has:

```json
{
    "compilerOptions": {
        "strict": true,
        "strictNullChecks": true,
        "noImplicitAny": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true
    }
}
```

### 2. **Prefer type inference**

```typescript
// ✅ Good - let TypeScript infer
const name = "John"; // inferred as string
const age = 30; // inferred as number

// ❌ Unnecessary annotation
const name: string = "John";
```

### 3. **Use discriminated unions**

```typescript
// ✅ Good
type Result<T, E> = { success: true; value: T } | { success: false; error: E };

function handleResult<T, E>(result: Result<T, E>): void {
    if (result.success) {
        console.log(result.value); // TypeScript knows this exists
    } else {
        console.error(result.error); // TypeScript knows this exists
    }
}
```

### 4. **Avoid enums, use const objects or unions**

```typescript
// ✅ Good - const object with as const
const HttpMethod = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
} as const;
type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

// ✅ Good - union type
type HttpMethod = "GET" | "POST" | "PUT";

// ❌ Avoid - enum has runtime overhead
enum HttpMethod {
    GET = "GET",
    POST = "POST",
}
```

---

## Code Organization

### 1. **No unused vars**

**All symbols must be used or removed.** Never, ever prefix something with an underscore in order to pretend it isn't there, it just hides bugs and mistakes.

```typescript
// ❌ Bad - hiding unused variable
const types = schema.anyOf
    .map((prop) => getZodSchema({ schema: prop }))
    .map((type) => {
        let _isObject = true; // Unused! Should be removed
        return type.toString();
    })
    .join(", ");

// ✅ Good - remove unused variable entirely
const types = schema.anyOf
    .map((prop) => getZodSchema({ schema: prop }))
    .map((type) => type.toString())
    .join(", ");
```

**Exceptions:**

- Function parameters in interfaces/callbacks where signature must match
- Use the comment `// eslint-disable-next-line @typescript-eslint/no-unused-vars` if absolutely necessary and document why

### 2. **File naming**

- Use `kebab-case` for files: `openapi-to-zod.ts`
- Use `PascalCase` for types: `OpenAPIObject`
- Use `camelCase` for functions: `getZodSchema`

### 3. **Import organization**

```typescript
// 1. External dependencies
import type { OpenAPIObject } from "openapi3-ts";
import { match } from "ts-pattern";

// 2. Internal imports (with .js extensions for ESM)
import { isReferenceObject } from "./is-reference-object.js";
import type { TemplateContext } from "./template-context.js";

// 3. Relative imports
import { utils } from "./utils.js";
```

### 4. **Function size**

- Keep functions small (< 50 lines ideal)
- If > 100 lines, consider splitting
- One level of abstraction per function
- Extract complex logic to named functions

---

## Documentation

### 1. **When to add comments**

**Add comments for:**

- Complex algorithms
- Non-obvious business logic
- Workarounds for library bugs
- Performance optimizations
- Public API functions

**Don't comment:**

- Obvious code
- What the code does (code shows that)
- Redundant information

```typescript
// ❌ Bad - obvious
// Increment i by 1
i++;

// ✅ Good - explains why
// Skip empty schemas to avoid generating invalid Zod code
if (Object.keys(schema).length === 0) continue;
```

### 2. **JSDoc for public APIs**

````typescript
/**
 * Converts an OpenAPI schema to a Zod schema string.
 *
 * @param schema - The OpenAPI schema object to convert
 * @param options - Optional conversion options
 * @returns A string representation of the Zod schema
 * @throws {Error} If schema is invalid or contains unsupported features
 *
 * @example
 * ```typescript
 * const zodSchema = getZodSchema({
 *   schema: { type: "string" }
 * });
 * // Returns: "z.string()"
 * ```
 */
export function getZodSchema(args: ConversionArgs): ZodSchema {
    // ...
}
````

---

## 🎯 **MANDATORY: Comprehensive TSDoc Standards**

**Developer Experience is Priority #1.** All code must be self-documenting through excellent TSDoc that enables automatic generation of professional-quality documentation via TypeDoc, Redocly, or similar tools.

### **Documentation Requirements by Visibility**

#### **Public API (Exported Functions, Classes, Types)** - CRITICAL

**MUST have comprehensive TSDoc including:**

1. **Description** - What it does, why it exists, key behaviors
2. **All parameters** - With types, descriptions, constraints
3. **Return value** - What's returned, format, guarantees
4. **Throws** - All error conditions
5. **Examples** - At least one realistic usage example
6. **See tags** - Links to related functions/types
7. **Remarks** - Important behavior notes, edge cases
8. **Since/Deprecated** - Version info when applicable

**Template for Public Functions:**

````typescript
/**
 * Generates Zod schemas from an OpenAPI specification.
 *
 * Supports OpenAPI 3.0.x and 3.1.x specifications, converting JSON Schema
 * definitions to runtime-validated Zod schemas with TypeScript type inference.
 * Uses fail-fast validation and strict types by default.
 *
 * @param openApiDoc - The OpenAPI document to convert (JSON or programmatic object)
 * @param options - Configuration options for generation behavior
 * @param options.template - Template to use: "default", "schemas-only", or "schemas-with-metadata"
 * @param options.distPath - Output file path (required unless disableWriteToFile is true)
 * @param options.disableWriteToFile - When true, returns string instead of writing file
 * @param options.prettierConfig - Prettier configuration for output formatting
 * @returns Generated TypeScript code as string, or object if using group strategy
 *
 * @throws {Error} When OpenAPI document is invalid or missing required fields
 * @throws {Error} When template is not found or invalid
 * @throws {ValidationError} When MCP validation fails (if enabled)
 *
 * @example Basic usage with Zodios client
 * ```typescript
 * import SwaggerParser from "@apidevtools/swagger-parser";
 * import { generateZodClientFromOpenAPI } from "openapi-zod-client";
 *
 * const openApiDoc = await SwaggerParser.parse("./api.yaml");
 * await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./src/api-client.ts",
 * });
 * // Generates full Zodios HTTP client with validation
 * ```
 *
 * @example SDK generation without HTTP client
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./src/api.ts",
 *   noClient: true, // Use schemas-with-metadata template
 *   withValidationHelpers: true,
 *   withSchemaRegistry: true,
 * });
 * // Generates schemas + validation helpers for custom HTTP clients
 * ```
 *
 * @example MCP tool generation
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./src/mcp-tools.ts",
 *   template: "schemas-with-metadata",
 *   validateMcpReadiness: true,
 * });
 * // Generates MCP-compatible tool definitions with JSON Schema
 * ```
 *
 * @see {@link TemplateContext} for available template variables
 * @see {@link GenerateZodClientOptions} for all configuration options
 *
 * @remarks
 * - Auto-enables certain options when using schemas-with-metadata template
 * - MCP validation is automatic with --no-client flag
 * - Uses .strict() for objects by default (reject unknown keys)
 * - All validation uses .parse() for fail-fast behavior
 *
 * @since 1.0.0
 * @public
 */
export async function generateZodClientFromOpenAPI(
    args: GenerateZodClientFromOpenApiArgs
): Promise<string | Record<string, string>> {
    // Implementation
}
````

#### **Internal/Private Functions** - REQUIRED

**MUST have TSDoc including:**

1. **Description** - Brief purpose statement
2. **All parameters** - Types and descriptions
3. **Return value** - What's returned
4. **Throws** - If function can throw

**Minimal but sufficient:**

```typescript
/**
 * Sanitizes schema keys for safe programmatic access.
 * Replaces non-alphanumeric characters with underscores.
 *
 * @param key - The schema key to sanitize
 * @returns Sanitized key safe for object property access
 *
 * @internal
 */
function sanitizeSchemaKey(key: string): string {
    return key.replace(/[^A-Za-z0-9_]/g, "_");
}
```

#### **Types, Interfaces, Enums** - REQUIRED

**MUST have TSDoc including:**

1. **Description** - Purpose and usage
2. **All properties** - Individual property descriptions
3. **Examples** - Type usage examples
4. **See tags** - Related types

````typescript
/**
 * Configuration options for Zod client generation.
 *
 * Controls template selection, validation behavior, and output formatting.
 * Options are validated at runtime to ensure compatibility.
 *
 * @example Default template with custom base URL
 * ```typescript
 * const options: GenerateZodClientOptions = {
 *   template: "default",
 *   baseUrl: "https://api.example.com",
 *   withAlias: true,
 * };
 * ```
 *
 * @example SDK generation without HTTP client
 * ```typescript
 * const options: GenerateZodClientOptions = {
 *   noClient: true,
 *   withValidationHelpers: true,
 *   strictMcpValidation: true,
 * };
 * ```
 *
 * @see {@link generateZodClientFromOpenAPI}
 * @public
 */
export interface GenerateZodClientOptions {
    /**
     * Template to use for code generation.
     *
     * - `"default"` - Full Zodios HTTP client with runtime validation
     * - `"schemas-only"` - Pure Zod schemas without client
     * - `"schemas-with-metadata"` - Schemas + metadata without Zodios
     *
     * @defaultValue "default"
     */
    template?: "default" | "schemas-only" | "schemas-with-metadata";

    /**
     * Base URL for API requests.
     *
     * Only used with default template. Becomes default baseURL in generated client.
     *
     * @example "https://api.example.com"
     */
    baseUrl?: string;

    /**
     * Skip HTTP client generation (auto-switches to schemas-with-metadata template).
     *
     * Perfect for using your own HTTP client (fetch, axios, ky) while maintaining
     * full Zod validation. Automatically enables MCP validation.
     *
     * @defaultValue false
     */
    noClient?: boolean;

    /**
     * Generate validation helper functions (validateRequest, validateResponse).
     *
     * Only applicable when using schemas-with-metadata template. Helpers use
     * .parse() for fail-fast validation with detailed error messages.
     *
     * @defaultValue false
     * @see {@link validateRequest}
     * @see {@link validateResponse}
     */
    withValidationHelpers?: boolean;
}
````

#### **Constants and Variables** - REQUIRED

**MUST have TSDoc for exported constants:**

````typescript
/**
 * HTTP methods supported by OpenAPI specifications.
 *
 * Covers all standard HTTP methods defined in OpenAPI 3.0.x and 3.1.x specs.
 * Used for endpoint definition and validation.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
 * @public
 */
export const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "options", "head", "trace"] as const;

/**
 * Type representing valid HTTP methods.
 *
 * @example
 * ```typescript
 * const method: HttpMethod = "get"; // ✅ Valid
 * const invalid: HttpMethod = "connect"; // ❌ Type error
 * ```
 */
export type HttpMethod = (typeof HTTP_METHODS)[number];
````

### **TSDoc Tag Reference**

#### **Required Tags**

- `@param` - Every parameter (with description)
- `@returns` - Return value (unless void)
- `@throws` - Any thrown errors

#### **Recommended Tags**

- `@example` - Usage examples (CRITICAL for public API)
- `@see` - Related functions/types/docs
- `@remarks` - Important notes, edge cases
- `@defaultValue` - Default parameter values

#### **Situational Tags**

- `@public` - Exported public API
- `@internal` - Internal implementation (not for consumers)
- `@deprecated` - Deprecated functions (with migration path)
- `@since` - Version introduced
- `@typeParam` - Generic type parameters

### **Example Quality Levels**

#### **EXCELLENT (Target for Public API):**

````typescript
/**
 * Validates that an OpenAPI specification is suitable for MCP tool generation.
 *
 * Performs comprehensive validation checking for required fields, security schemes,
 * response definitions, and parameter descriptions. Implements fail-fast philosophy
 * by throwing on critical errors with actionable error messages.
 *
 * Validation levels:
 * - **ERRORS** - Critical issues that prevent MCP generation (operationId missing, etc.)
 * - **WARNINGS** - Recommended improvements (missing descriptions, etc.)
 * - **STRICT** - Treats warnings as errors for maximum spec quality
 *
 * @param openApiDoc - The OpenAPI document to validate
 * @param options - Validation configuration options
 * @param options.skip - Skip validation entirely (for testing or edge cases)
 * @param options.strict - Treat warnings as errors for strict validation
 *
 * @throws {Error} When spec has critical MCP issues with detailed location context
 * @throws {Error} In strict mode, when spec has warnings
 *
 * @example Validate before generation
 * ```typescript
 * try {
 *   validateMcpReadiness(openApiDoc);
 *   // Spec is MCP-ready, proceed with generation
 * } catch (error) {
 *   console.error("MCP validation failed:", error.message);
 *   // Error shows:
 *   // - Exact location (POST /users)
 *   // - What's wrong (Missing required 'operationId')
 *   // - How to fix (Add: operationId: "createUser")
 * }
 * ```
 *
 * @example Strict mode for CI/CD
 * ```typescript
 * validateMcpReadiness(openApiDoc, { strict: true });
 * // Fails on any warnings, ensuring highest quality specs
 * ```
 *
 * @example Skip validation (not recommended)
 * ```typescript
 * validateMcpReadiness(openApiDoc, { skip: true });
 * // Bypasses all validation checks
 * ```
 *
 * @see {@link generateZodClientFromOpenAPI} for usage in generation pipeline
 * @see {@link https://anthropic.com/mcp} for MCP specification
 *
 * @remarks
 * - Automatically enabled when using --no-client CLI flag
 * - Validates operationId presence (required for MCP tool naming)
 * - Validates success response existence (200 or 201)
 * - Validates security scheme references
 * - Warns about missing descriptions (improves AI context)
 *
 * @since 1.9.0
 * @public
 */
export function validateMcpReadiness(openApiDoc: OpenAPIObject, options: ValidateMcpReadinessOptions = {}): void {
    // Implementation
}
````

#### **GOOD (Target for Internal API):**

```typescript
/**
 * Extracts security metadata from an OpenAPI operation.
 *
 * Resolves security scheme references and computes helper metadata
 * like requiresAuth and authTypes for easier consumption.
 *
 * @param operation - The operation object to extract security from
 * @param components - The components object containing security scheme definitions
 * @returns Security metadata with resolved schemes and computed helpers
 *
 * @throws {Error} When security scheme is referenced but not defined
 *
 * @internal
 */
function extractSecurityMetadata(operation: OperationObject, components?: ComponentsObject): SecurityMetadata {
    // Implementation
}
```

#### **POOR (Not Acceptable):**

```typescript
// ❌ No JSDoc at all
export function convert(schema: any): string {
    // ...
}

// ❌ Incomplete JSDoc (missing @param, @returns, @example)
/**
 * Converts schema.
 */
export function convertSchema(schema: SchemaObject, options: Options): string {
    // ...
}

// ❌ Useless JSDoc (redundant with types)
/**
 * @param schema - schema
 * @returns string
 */
export function convertSchema(schema: SchemaObject): string {
    // ...
}
```

### **Documentation Sweep Requirements**

Before any major release or phase completion, a **comprehensive documentation sweep** is required:

1. **TSDoc Audit** - Every exported symbol has complete TSDoc
2. **Example Validation** - All @example code blocks are tested and working
3. **Link Validation** - All @see links resolve correctly
4. **TypeDoc Generation** - Generate docs with zero warnings
5. **README Sync** - README examples match actual API
6. **Migration Guides** - Breaking changes documented with upgrade paths

### **Tooling Integration**

**TypeDoc Configuration:**

```json
{
    "entryPoints": ["src/index.ts"],
    "excludePrivate": true,
    "excludeInternal": true,
    "validation": {
        "notExported": true,
        "invalidLink": true,
        "notDocumented": true
    }
}
```

**Quality Checks:**

```bash
# Generate documentation and fail on warnings
pnpm typedoc --treatWarningsAsErrors

# Validate examples in JSDoc
pnpm ts-node scripts/validate-jsdoc-examples.ts

# Check for missing documentation
pnpm eslint --rule 'jsdoc/require-jsdoc: error'
```

---

## Git Commit Standards

### 1. **Commit message format**

```
type(scope): short description

Longer description if needed, explaining why not what.

- Bullet points for multiple changes
- Reference issues if applicable
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes nor adds feature
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Tooling, config changes
- `perf`: Performance improvement

### 2. **Atomic commits**

- One logical change per commit
- Commit should leave code in working state
- Easy to review
- Easy to revert if needed

---

## Performance Considerations

### 1. **Avoid premature optimization**

- Make it work first
- Make it right second
- Make it fast if needed

### 2. **When to optimize**

- Profiling shows bottleneck
- User-facing performance issue
- Processing large datasets

### 3. **Measure before optimizing**

```typescript
// Add timing when investigating performance
const start = performance.now();
const result = expensiveOperation();
console.log(`Took ${performance.now() - start}ms`);
```

---

## Summary

**Key Takeaways:**

1. ✅ Test behavior, not implementation
2. ✅ Tests prove functionality works
3. ✅ Preserve type information
4. ✅ Minimize type casting
5. ✅ No filesystem/network I/O in tests
6. ✅ Pure functions when possible
7. ✅ Explicit over implicit
8. ✅ Type safety without `any`
9. ✅ Immutable by default
10. ✅ Clear error handling

**When in doubt:**

- Ask: "Does this test prove the code works?"
- Ask: "Will this survive refactoring?"
- Ask: "Is this as type-safe as possible?"
- Ask: "Is this as simple as it can be?"

---

**These rules apply to all phases of the modernization project.**
