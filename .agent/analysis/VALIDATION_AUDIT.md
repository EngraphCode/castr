# Validation Logic Audit

**Purpose**: Identify validation logic that should be deferred to `@apidevtools/swagger-parser` and `openapi3-ts`

**Date**: October 25, 2025

## Current Validation in Codebase

### ✅ KEEP: Necessary for Code Generation

These checks are about **code generation requirements**, not OpenAPI validation:

1. **Context Required for References** (`openApiToZod.ts:59`)

   ```typescript
   if (!ctx) throw new Error('Context is required');
   ```

   **Verdict**: KEEP - This is about internal state, not spec validation

2. **Circular Reference Detection** (`openApiToZod.ts:64`)

   ```typescript
   if (refsPath.length > 1 && refsPath.includes(schemaName)) {
     // Handle circular references
   }
   ```

   **Verdict**: KEEP - Code generation needs to handle recursion

3. **Empty Type Arrays** (`openApiToZod.ts:93, 111, 138, 154, 179`)
   ```typescript
   if (!firstSchema) throw new Error('oneOf array has invalid first element');
   ```
   **Verdict**: ⚠️ **DEFER** - These are spec validation, not code generation

### ❌ REMOVE: Should be Handled by swagger-parser

These are **OpenAPI spec validation** that should be caught earlier:

1. **Schema Cannot Be Null** (`openApiToZod.ts:33-39`)

   ```typescript
   if (!$schema) {
     throw new Error(
       $schema === null
         ? 'Invalid OpenAPI specification: Schema cannot be null...'
         : 'Schema is required',
     );
   }
   ```

   **Verdict**: ❌ **DEFER** - `swagger-parser.validate()` should catch this
   **Fix**: Remove check, assume valid schema from parser

2. **Schema Not Found** (`openApiToZod.ts:74-76`)

   ```typescript
   if (!actualSchema) {
     throw new Error(`Schema ${schema.$ref} not found`);
   }
   ```

   **Verdict**: ❌ **DEFER** - `swagger-parser.bundle()` should resolve all refs
   **Fix**: Remove check or fail fast with clear message about using `.bundle()`

3. **Nested $refs** (`openApiToTypescript.helpers.ts:70-72`) ✅ **GOOD!**

   ```typescript
   if ('$ref' in actualSchema) {
     throw new Error(
       `Nested $ref found: ${schema.$ref} -> ${actualSchema.$ref}. Use SwaggerParser.bundle() to dereference.`,
     );
   }
   ```

   **Verdict**: ✅ **KEEP** - This is exactly right! Fail fast with actionable message

4. **Type Checking** (`openApiToZod.ts:346, 383, 395-396, 468, 478`)
   ```typescript
   if (typeof schema.description === "string" && schema.description !== "")
   if (typeof defaultValue === "number")
   if (typeof value === "string" && value.startsWith('"'))
   ```
   **Verdict**: ⚠️ **DEPENDS** - Some are defensive, some are necessary
   - `typeof schema.description === "string"`: **REMOVE** - openapi3-ts types guarantee this
   - `typeof defaultValue === "number"`: **KEEP** - default can be `any` per spec
   - String quote unwrapping: **KEEP** - this is formatting logic

### 🤔 GRAY AREA: Defensive vs. Necessary

1. **Array Length Checks** (`openApiToZod.ts:248`)

   ```typescript
   if (typeof schema.additionalProperties === "object" && Object.keys(schema.additionalProperties).length > 0)
   ```

   **Verdict**: ⚠️ **SIMPLIFY** - The `length > 0` check is unnecessary. If it's an object, process it.

2. **Empty Array Guards** (multiple locations)
   ```typescript
   if (schema.oneOf.length === 1) { // special case }
   ```
   **Verdict**: ✅ **KEEP** - These are optimization/special-case handling, not validation

## Recommendations

### Phase 1: Remove Redundant Checks (P0)

1. **Remove null/undefined schema check** (`openApiToZod.ts:33-39`)
   - Assume `swagger-parser` has validated
   - Document in JSDoc: `@precondition Schema must be valid OpenAPI (use SwaggerParser.validate())`

2. **Remove empty array element checks** (`openApiToZod.ts:93, 111, 138, 154, 179`)
   - If spec is invalid, let it fail naturally
   - Trust `swagger-parser.validate()`

3. **Remove typeof checks on typed properties** (`openApiToZod.ts:346`)
   - `schema.description` is typed as `string | undefined` from openapi3-ts
   - Change `typeof schema.description === "string" && schema.description !== ""`
   - To: `schema.description && schema.description !== ""`

### Phase 2: Add Fail-Fast Checks (P1)

1. **Add nested ref check everywhere** (like `openApiToTypescript.helpers.ts:70-72`)
   - This is excellent: fails fast with actionable message
   - Apply same pattern to other ref resolution points

2. **Document preconditions** in JSDoc
   ```typescript
   /**
    * Convert OpenAPI schema to Zod schema
    *
    * @precondition Document must be validated with SwaggerParser.validate()
    * @precondition References must be dereferenced with SwaggerParser.bundle()
    * @throws {Error} If nested $refs found (use SwaggerParser.bundle())
    */
   ```

### Phase 3: Strict Mode (P2)

1. **Add CLI flag**: `--strict-validation`
   - When enabled, runs `SwaggerParser.validate()` before generation
   - When disabled (default), assumes valid spec
   - Fails fast with clear error messages

2. **Document supported workflows**:

   ```typescript
   // ✅ RECOMMENDED: Validate + Bundle
   const openApiDoc = await SwaggerParser.bundle(input);

   // ⚠️ ADVANCED: Parse only (for testing with non-dereferenced specs)
   const openApiDoc = await SwaggerParser.parse(input);

   // ❌ NOT SUPPORTED: Raw object without validation
   const openApiDoc = JSON.parse(fs.readFileSync('spec.json'));
   ```

## Files to Update

1. **`lib/src/openApiToZod.ts`** (HIGH PRIORITY)
   - Lines 33-39: Remove null check or replace with assertion
   - Lines 93, 111, 138, 154, 179: Remove empty array checks
   - Line 346: Simplify typeof check

2. **`lib/src/getZodiosEndpointDefinitionList.ts`** (MEDIUM PRIORITY)
   - Audit for similar defensive checks

3. **`lib/src/openApiToTypescript.ts`** (MEDIUM PRIORITY)
   - Audit for similar defensive checks

4. **`lib/src/cli.ts`** (LOW PRIORITY)
   - Already uses `SwaggerParser.bundle()` ✅
   - Consider adding `--validate` flag

## Expected Impact

- **Lines of Code**: ~50-75 lines removed
- **Performance**: Negligible (checks are in hot paths but very fast)
- **Maintainability**: 📈 **IMPROVED** - Less code, clearer responsibilities
- **Error Messages**: 📈 **IMPROVED** - Fail fast with actionable messages
- **Risk**: ⚠️ **LOW** - If swagger-parser is used correctly, no behavior change

## Testing Strategy

1. **Add negative tests** for malformed specs
   - Expect clear error messages pointing to `SwaggerParser.validate()`
   - Test with non-bundled specs (nested refs)

2. **Document in README**:

   ```markdown
   ## Requirements

   - OpenAPI spec must be validated with `@apidevtools/swagger-parser`
   - For best results, use `.bundle()` to dereference all $refs
   - For advanced usage with non-dereferenced specs, ensure proper ref resolution
   ```

## Decision: Be Strict

**Philosophy**: Fail fast with clear, actionable error messages rather than silently handle malformed specs.

**Rationale**:

1. `swagger-parser` is already a dependency - use it fully
2. Defensive checks hide bugs in upstream specs
3. Clear error messages help users fix specs at the source
4. Simplifies codebase maintenance

**Example Error Message** (GOOD):

```
Error: Nested $ref found: #/components/schemas/Pet -> #/components/schemas/Animal
Solution: Use SwaggerParser.bundle() to dereference all $refs before code generation.
```

**Example Error Message** (BAD):

```
Error: Schema Pet not found
```
