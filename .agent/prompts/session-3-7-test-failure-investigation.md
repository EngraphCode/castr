# Test Failure Investigation: Generated Code Type-Check Validation

## Context

The `openapi-zod-client` project has recently replaced its Handlebars templating engine with a new TypeScript writer using `ts-morph` for AST-based code generation. All lint, build, and type-check steps pass, but there's a failing test in the generated code validation suite.

## The Failing Test

**Test Suite**: `tests-generated/type-check-validation.gen.test.ts`
**Test Name**: `'api-examples' ('Constraints (enum, patterns, min/max,…') > generates type-safe code (no type errors)`

**Error**:

```
AssertionError: expected false to be true // Object.is equality

- Expected
+ true

- Received
+ false

❯ tests-generated/type-check-validation.gen.test.ts:102:28
```

**What the test does**:

1. Generates TypeScript code from `examples/openapi/v3.0/api-with-examples.yaml`
2. Writes it to a temp file
3. Runs TypeScript type-checking (equivalent to `tsc --noEmit`)
4. Asserts that `result.valid` is `true` (no type errors)
5. Asserts that `result.errors` is empty

**The assertion that's failing**: `expect(result.valid).toBe(true)` at line 102

## What We Know

- **All other fixtures pass**: tictactoe, petstore, non-oauth, multi-file
- **Only `api-examples` fails**: This spec exercises "Constraints (enum, patterns, min/max, formats, examples)"
- **Build passes**: The writer code itself has no syntax/type errors
- **Lint passes**: All code quality checks pass

## Project Structure

### Key Files

**Code Generation**:

- `lib/src/writers/typescript.ts` - Main writer (uses ts-morph)
- `lib/src/writers/typescript/endpoints.ts` - Endpoint object generation
- `lib/src/writers/typescript/helpers.ts` - Validation helper generation
- `lib/src/writers/typescript/mcp.ts` - MCP tool generation

**Test Infrastructure**:

- `lib/tests-generated/type-check-validation.gen.test.ts` - The failing test
- `lib/tests-generated/validation-harness.ts` - TypeScript validation utilities

**Fixtures**:

- `lib/examples/openapi/v3.0/api-with-examples.yaml` - The problematic spec

## Your Mission

1. **Reproduce the failure**: Run `pnpm test:gen` in `lib/` to see the failure
2. **Generate the actual code**: Use the API to generate code from `api-with-examples.yaml` and inspect it
3. **Identify type errors**: Run TypeScript on the generated code to see what specific type errors exist
4. **Fix root cause**: Update the writer to generate type-safe code
5. **Verify**: Ensure all tests pass (`pnpm test:gen`)

## Recommended Investigation Steps

### Step 1: Generate Code Manually

```typescript
import { generateZodClientFromOpenAPI } from './src/rendering/generate-from-context.js';
import { join } from 'path';

const result = await generateZodClientFromOpenAPI({
  input: join(process.cwd(), 'examples/openapi/v3.0/api-with-examples.yaml'),
  disableWriteToFile: true,
  options: { withAlias: true },
});

console.log(result.content); // Inspect the generated TypeScript
```

### Step 2: Run TypeScript on Generated Code

Save the output to a temp file and run:

```bash
pnpm tsc --noEmit --target ES2020 --module NodeNext temp-file.ts
```

### Step 3: Compare with Working Fixtures

Generate code from a passing fixture (e.g., `tictactoe.yaml`) and diff to see what's different about `api-examples`.

## Rules to Follow

- **STRICT RULES COMPLIANCE**: Read `@.agent/RULES.md` - no type assertions (`!`, `as`, `any`)
- **TDD**: Read `@.agent/testing-strategy.md` - tests must pass before completion
- **Maintain Quality Gate**: All checks must pass: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:gen`

## Expected Outcome

After this investigation, the test should pass. The generated code from `api-with-examples.yaml` should be type-safe with no TypeScript errors.

## Questions to Answer

1. What specific TypeScript errors exist in the generated code?
2. Is it a problem with how constraints (enum, patterns, etc.) are generated?
3. Is it a problem with the endpoint structure, MCP tools, or validation helpers?
4. Does the issue relate to how the `api-examples` spec is structured differently from other fixtures?

---

**Start Here**: Run `pnpm test:gen` in the `lib/` directory and examine the test output.
