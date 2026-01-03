# TS-Morph Usage & Refactoring Report

> **📋 Historical Reference Document**  
> This report was created during Phase 2 planning (late 2025). Many recommendations
> have since been implemented. The IR is now the canonical source of truth and
> writers operate on it directly. See [ADR-023](../../docs/architectural_decision_records/ADR-023-ir-based-architecture.md) and [ADR-024](../../docs/architectural_decision_records/ADR-024-complete-ir-alignment.md).

## 1. Executive Summary

The current codebase is in a transitional state. While a robust "Internal Information Retrieval State" (IR) has been introduced (`CastrDocument`), the code generation pipeline still relies heavily on legacy string concatenation patterns. The `TemplateContext` acts as a carrier for pre-generated code strings (`schemas`, `types`) rather than serving as a rich data source for AST-based generation.

To achieve engineering excellence and type safety, we must shift the responsibility of code generation from the _conversion_ operational phase (which currently produces strings) to the _writer_ operational phase (which should consume the Caster Model and produce AST nodes).

**Strict Adherence to Rules:**

- **No Compatibility Layers:** We will not build adapters to feed the old string-based writers from the Caster Model. We will completely replace the writers.
- **TDD:** All new writers will be developed using Test-Driven Development.
- **Single Source of Truth:** The `CastrDocument` will become the sole source of truth for generation.

## 2. Current Architecture Analysis

### 2.1 The Pipeline

Currently, the pipeline operates as follows:

1. **Input**: OpenAPI Document.
2. **Context Building** (`getTemplateContext`):
   - Converts OpenAPI components to Zod schema **strings** (`context.schemas`).
   - Converts OpenAPI components to TypeScript type **strings** (`context.types`).
   - Builds an `CastrDocument` (`context._ir`), but it is largely unused by the writers.
3. **Writing** (`writeTypeScript`):
   - Initializes a `ts-morph` Project.
   - Injects the pre-generated strings into the source file using `addStatements` or `initializer: string`.
   - Manually constructs strings for endpoint arrays using template literals.

### 2.2 The Problem: "Falling Back on Strings"

The codebase violates the principle of using the AST as the source of truth in several key areas:

- **Zod Schemas**: The Zod schemas are generated as strings in the `conversion` layer and passed to the writer. This prevents `ts-morph` from validating the structure or managing imports/dependencies.
  - _Current_: `initializer: "z.object({ name: z.string() })"`
  - _Ideal_: `initializer: writer => { ... }` constructed from IR.

- **Endpoint Definitions**: `lib/src/writers/typescript/endpoints.ts` relies heavily on manual string concatenation:

  ```typescript
  // BAD: Manual JSON array construction
  return `[\n${endpoint.parameters.map(...).join(',\n')}\n]`;
  ```

  This is fragile and bypasses `ts-morph`'s formatting and validation capabilities.

- **Type Definitions**: Types are treated as opaque strings. `ts-morph` is used merely as a container to dump these strings into a file.

## 3. The "Internal Information Retrieval State" (IR)

The `CastrDocument` (defined in `lib/src/context/ir-schema.ts`) is a high-quality, type-safe representation of the domain. It includes:

- **Rich Metadata**: `CastrSchemaNode` contains `zodChain` info (validations, presence), dependency graphs, and circular reference detection.
- **Structure**: It preserves the recursive structure of schemas (`allOf`, `oneOf`, properties).
- **Completeness**: It covers Schemas, Parameters, Responses, and Operations.

**The Gap**: This rich IR is currently being built but _ignored_ by the primary code generation logic, which still consumes the legacy string maps.

## 4. Recommendations & Refactoring Plan

We will move to a "Writer-First" architecture where the Writers consume the Caster Model directly. This will be executed via strict TDD.

### 4.1 Tranche 1: Implement IR-Driven Writers (TDD)

We will create specialized writers that traverse the Caster Model and use `ts-morph` structures. These will be developed in isolation using unit tests before being integrated.

#### A. Zod Schema Writer

Create a `ZodWriter` class that accepts an `CastrSchema` and returns a `WriterFunction`.

- **TDD Approach**:
  1. Write test: `expect(writeZodSchema(simpleStringIR)).toEmit('z.string()')`
  2. Implement `writeZodSchema` for strings.
  3. Write test: `expect(writeZodSchema(objectIR)).toEmit('z.object({ ... })')`
  4. Implement recursion for objects.

```typescript
// Concept
export function writeZodSchema(schema: CastrSchema): WriterFunction {
  return (writer) => {
    if (schema.type === 'object') {
      writer
        .write('z.object(')
        .inlineBlock(() => {
          // Recursively write properties
          for (const [key, prop] of schema.properties.entries()) {
            writer.write(`${key}: `);
            writeZodSchema(prop)(writer);
            writer.write(',').newLine();
          }
        })
        .write(')');
    }
    // Append chain methods from IR metadata
    if (schema.metadata.zodChain.optional) writer.write('.optional()');
  };
}
```

#### B. Type Definition Writer

Create a `TypeWriter` that generates TypeScript interfaces/types from the Caster Model.

```typescript
// Concept
export function writeTypeDefinition(schema: CastrSchema, sourceFile: SourceFile) {
  if (schema.type === 'object') {
    sourceFile.addInterface({
      name: schema.name,
      properties: mapProperties(schema.properties), // Maps to Structure
    });
  }
}
```

#### C. Endpoint Writer Refactor

Refactor `lib/src/writers/typescript/endpoints.ts` to use `Writers.array` and `Writers.object` exclusively.

- **Current**:

  ```typescript
  return `[${items.join(', ')}]`;
  ```

- **Refactored**:

  ```typescript
  return Writers.array(items.map(item => Writers.object({ ... })));
  ```

### 4.2 Tranche 2: Switch to New Writers

Once the new writers are proven via unit tests:

1. Update `writeTypeScript` to use the new writers, passing the `CastrDocument` instead of the string maps.
2. Verify using existing snapshot tests (`pnpm test:snapshot`). The output should be identical (or better formatted).

### 4.3 Tranche 3: Decommission String Maps

1. Remove the logic in `lib/src/conversion/` that generates the `schemas` and `types` string maps.
2. Remove `schemas` and `types` from `TemplateContext`.
3. The `TemplateContext` will now primarily hold `CastrDocument` and `options`.

## 5. Conclusion

The project has the correct foundation (`CastrDocument`) but needs to bridge the gap to the final output. By refactoring the writers to consume the Caster Model directly and use `ts-morph`'s builder APIs (Writers, Structures), we will eliminate fragile string manipulation, improve type safety, and fully leverage the tool we have chosen. This refactor will be executed with strict adherence to TDD and "Clean Breaks" principles.
