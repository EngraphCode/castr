# 01: Architecture Patterns

**Domain**: Software Architecture  
**Impact**: 🔴 High (foundational changes)  
**Effort**: 🔷 High (requires refactoring)  
**Priority**: P3 (long-term)

---

## 📋 Quick Summary

typed-openapi uses three key architectural patterns that enable flexibility and extensibility:

1. **Abstract Representation Layer (Box Pattern)** - Intermediate AST between OpenAPI and output
2. **Factory Pattern** - Pluggable output generators
3. **Functional Composition** - Pure functions over class hierarchies

These patterns enable multi-runtime support, easier testing, and cleaner separation of concerns.

---

## 1. Abstract Representation Layer (Box Pattern)

### 1.1 The Problem

**openapi-zod-client's current approach**:

```typescript
OpenAPI Schema → Direct Zod String Generation → Output File
```

**Limitations**:

- Tightly couples parsing to Zod output
- Hard to support other runtimes (Valibot, ArkType, etc.)
- Difficult to post-process or transform schemas
- Testing requires parsing OpenAPI and checking string output

### 1.2 typed-openapi's Solution: The Box

**Their approach**:

```typescript
OpenAPI Schema → Box (Abstract Representation) → Factory (Runtime-Specific) → Output
```

**Box Structure**:

```typescript
class Box<T extends AnyBoxDef> {
  type: T['type']; // 'union' | 'intersection' | 'array' | 'ref' | 'literal' | etc.
  value: T['value']; // The generated string (computed from params)
  params: T['params']; // Constructor parameters (types, props, etc.)
  schema: T['schema']; // Original OpenAPI schema (for debugging/recomputation)
  ctx: T['ctx']; // Conversion context (refs, factory, callbacks)

  // Can recompute with different factory
  recompute(callback: OpenapiSchemaConvertContext['onBox']): Box {
    return openApiSchemaToTs({
      schema: this.schema,
      ctx: { ...this.ctx, onBox: callback },
    });
  }
}
```

**See code example**: [examples/01-box-pattern.ts](./examples/01-box-pattern.ts)

### 1.3 Why It Matters

#### Benefits

| Benefit              | Description                                | Example Use Case                                 |
| -------------------- | ------------------------------------------ | ------------------------------------------------ |
| **Decoupling**       | Parse once, generate multiple formats      | Support Zod, Valibot, ArkType from same parse    |
| **Testability**      | Test parsing and generation separately     | Unit test Box creation without string generation |
| **Transformability** | Walk/modify AST before generation          | Add custom validators, modify field names        |
| **Debuggability**    | Inspect information retrieval architecture | See what was parsed before string generation     |
| **Composability**    | Build complex types from simple boxes      | Programmatically construct schemas               |

#### Real-World Impact

**Scenario**: User wants to add custom validators to all string fields

**Without Box**:

```typescript
// Have to modify string generation logic directly
// Fragile, hard to maintain, affects all schemas
```

**With Box**:

```typescript
const withEmailValidation = (box: Box) => {
  if (Box.isKeyword(box) && box.params.name === 'string') {
    // Walk the tree and modify string boxes
    return new Box({
      ...box.definition,
      value: `${box.value}.email()`, // Add email validation
    });
  }
  return box;
};

// Apply transformation
const result = boxTree.recompute(withEmailValidation);
```

**See code example**: [examples/02-box-transformations.ts](./examples/02-box-transformations.ts)

### 1.4 Box Type System

typed-openapi defines a rich type system for boxes:

```typescript
type AnyBoxDef =
  | BoxUnion // Union types (A | B | C)
  | BoxIntersection // Intersection types (A & B & C)
  | BoxArray // Array types (Array<T>)
  | BoxOptional // Optional types (T | undefined)
  | BoxRef // Reference types (Schema name)
  | BoxLiteral // Literal types ("value", 123, true)
  | BoxKeyword // Primitive types (string, number, boolean, unknown, any, never)
  | BoxObject; // Object types ({ prop: Type })
```

Each box type has:

- **Type-specific parameters** - What's needed to construct it
- **Type guards** - Static methods for type checking
- **Serialization** - toJSON/fromJSON for debugging

**See code example**: [examples/03-box-types.ts](./examples/03-box-types.ts)

### 1.5 Applying to openapi-zod-client

#### Current Architecture

```typescript
// lib/src/openApiToZod.ts
export function getZodSchema({ schema, ctx, meta, options }: ConversionArgs): CodeMeta {
  // Direct string generation
  if (isReferenceObject(schema)) {
    return code.assign(ctx.zodSchemaByName[schema.$ref]);
  }

  if (schema.type === 'object') {
    // Build Zod string directly
    return code.assign(`z.object({ ${props} })`);
  }

  // ... more direct string building
}
```

#### Proposed Architecture with AST Layer

```typescript
// Step 1: Parse OpenAPI to AST
interface SchemaNode {
  type: 'object' | 'array' | 'union' | 'ref' | 'primitive' | 'intersection';
  params: Record<string, unknown>;
  source: SchemaObject | ReferenceObject;
  metadata: {
    description?: string;
    deprecated?: boolean;
    examples?: unknown[];
  };
}

// Step 2: Convert OpenAPI to AST
function parseOpenApiToAST(schema: SchemaObject, ctx: Context): SchemaNode {
  if (isReferenceObject(schema)) {
    return {
      type: 'ref',
      params: { name: ctx.resolver.resolveRef(schema.$ref).normalized },
      source: schema,
      metadata: {},
    };
  }

  if (schema.type === 'object') {
    return {
      type: 'object',
      params: {
        properties: Object.entries(schema.properties || {}).map(([key, prop]) => ({
          key,
          value: parseOpenApiToAST(prop, ctx),
        })),
        required: schema.required || [],
      },
      source: schema,
      metadata: {
        description: schema.description,
        deprecated: schema.deprecated,
      },
    };
  }

  // ... handle other types
}

// Step 3: Generate runtime-specific code from AST
interface RuntimeFactory {
  object(node: SchemaNode): string;
  array(node: SchemaNode): string;
  union(node: SchemaNode): string;
  // ... etc
}

const zodFactory: RuntimeFactory = {
  object: (node) => {
    const props = node.params.properties
      .map(({ key, value }) => `${key}: ${generate(value, zodFactory)}`)
      .join(', ');
    return `z.object({ ${props} })`;
  },
  array: (node) => {
    return `z.array(${generate(node.params.itemType, zodFactory)})`;
  },
  // ... etc
};

function generate(node: SchemaNode, factory: RuntimeFactory): string {
  switch (node.type) {
    case 'object':
      return factory.object(node);
    case 'array':
      return factory.array(node);
    // ... etc
  }
}
```

**See full implementation**: [examples/04-ast-architecture.ts](./examples/04-ast-architecture.ts)

#### Migration Strategy

**Phase 1: Parallel Implementation (Non-breaking)**

```typescript
// Keep existing getZodSchema for backward compatibility
export function getZodSchema(args: ConversionArgs): CodeMeta {
  // Current implementation
}

// Add new AST-based implementation
export function getZodSchemaV2(args: ConversionArgs): CodeMeta {
  const ast = parseOpenApiToAST(args.schema, args.ctx);
  const zodCode = generateFromAST(ast, zodFactory);
  return new CodeMeta(args.schema, args.ctx).assign(zodCode);
}
```

**Phase 2: Feature Flag**

```typescript
// CLI option
--use - ast - generator; // Use new AST-based generator

// Or in options
{
  useAstGenerator: true;
}
```

**Phase 3: Full Migration**

- Deprecate old generator
- Make AST generator default
- Remove old code in next major version

---

## 2. Factory Pattern

### 2.1 The Problem

**Current approach**: Hardcoded Zod-specific logic scattered throughout codebase

```typescript
// enumHelpers.ts
export function generateStringEnumZodCode(values: string[]): string {
  return `z.enum([${values.map((v) => `"${v}"`).join(', ')}])`;
}

// openApiToZod.ts
if (schema.enum) {
  return code.assign(generateStringEnumZodCode(schema.enum));
}
```

**Limitations**:

- Every helper is Zod-specific
- Can't support other runtimes without duplicating entire codebase
- Hard to customize output format
- Testing requires checking Zod-specific strings

### 2.2 typed-openapi's Solution: Factory Pattern

```typescript
// Generic factory interface
interface GenericFactory {
  union: (types: Array<StringOrBox>) => string;
  intersection: (types: Array<StringOrBox>) => string;
  array: (type: StringOrBox) => string;
  object: (props: Record<string, StringOrBox>) => string;
  optional: (type: StringOrBox) => string;
  reference: (name: string, generics?: Array<StringOrBox>) => string;
  literal: (value: StringOrBox) => string;
  string: () => string;
  number: () => string;
  boolean: () => string;
  unknown: () => string;
  any: () => string;
  never: () => string;
}
```

**TypeScript Implementation**:

```typescript
const tsFactory: GenericFactory = {
  union: (types) => `(${types.map(unwrap).join(' | ')})`,
  intersection: (types) => `(${types.map(unwrap).join(' & ')})`,
  array: (type) => `Array<${unwrap(type)}>`,
  optional: (type) => `${unwrap(type)} | undefined`,
  reference: (name, generics) => `${name}${generics ? `<${generics.join(', ')}>` : ''}`,
  literal: (value) => value.toString(),
  string: () => 'string',
  number: () => 'number',
  boolean: () => 'boolean',
  unknown: () => 'unknown',
  any: () => 'any',
  never: () => 'never',
  object: (props) => {
    const propsStr = Object.entries(props)
      .map(([key, type]) => `${key}: ${unwrap(type)}`)
      .join(', ');
    return `{ ${propsStr} }`;
  },
};
```

**Zod Implementation** (via typebox-codegen):

```typescript
const zodFactory: GenericFactory = {
  union: (types) => `z.union([${types.map(unwrap).join(', ')}])`,
  array: (type) => `z.array(${unwrap(type)})`,
  // ... handled by Codegen.ModelToZod.Generate
};
```

**See code example**: [examples/05-factory-pattern.ts](./examples/05-factory-pattern.ts)

### 2.3 Benefits

#### Separation of Concerns

| Concern         | Responsibility | Benefit                                  |
| --------------- | -------------- | ---------------------------------------- |
| **Parsing**     | OpenAPI → AST  | Understand spec, handle edge cases       |
| **Factory**     | AST → Code     | Format output, runtime-specific features |
| **Composition** | Glue code      | Simple, testable, maintainable           |

#### Extensibility

Users can provide custom factories:

```typescript
// Custom factory that adds JSDoc comments
const documentedZodFactory: GenericFactory = {
  ...zodFactory,
  object: (props) => {
    const zodCode = zodFactory.object(props);
    return `/**
 * @description Object schema
 */
${zodCode}`;
  },
};

// Use custom factory
const code = generate(ast, documentedZodFactory);
```

### 2.4 Applying to openapi-zod-client

#### Proposed Factory Interface

```typescript
// lib/src/factory/types.ts
export interface SchemaFactory {
  // Basic types
  string(options?: StringOptions): string;
  number(options?: NumberOptions): string;
  boolean(options?: BooleanOptions): string;
  null(): string;
  unknown(): string;
  any(): string;
  never(): string;

  // Complex types
  object(props: Record<string, string>, options?: ObjectOptions): string;
  array(itemType: string, options?: ArrayOptions): string;
  tuple(types: string[]): string;
  union(types: string[]): string;
  intersection(types: string[]): string;
  enum(values: unknown[], options?: EnumOptions): string;
  literal(value: unknown): string;

  // References
  reference(name: string): string;

  // Modifiers
  optional(type: string): string;
  nullable(type: string): string;
  default(type: string, value: unknown): string;

  // Zod-specific (for backward compatibility)
  describe(type: string, description: string): string;
  refine(type: string, refinement: string): string;
}

export interface StringOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'email' | 'uuid' | 'url' | 'date-time';
}

export interface NumberOptions {
  min?: number;
  max?: number;
  int?: boolean;
}

export interface ObjectOptions {
  strict?: boolean;
  passthrough?: boolean;
  additionalProperties?: boolean;
}

export interface ArrayOptions {
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface EnumOptions {
  isString?: boolean;
  descriptions?: Record<string, string>;
}
```

#### Zod Factory Implementation

```typescript
// lib/src/factory/zod-factory.ts
import { SchemaFactory } from './types';

export const zodFactory: SchemaFactory = {
  string: (options = {}) => {
    let code = 'z.string()';
    if (options.minLength) code += `.min(${options.minLength})`;
    if (options.maxLength) code += `.max(${options.maxLength})`;
    if (options.pattern) code += `.regex(/${options.pattern}/)`;
    if (options.format === 'email') code += '.email()';
    if (options.format === 'uuid') code += '.uuid()';
    if (options.format === 'url') code += '.url()';
    return code;
  },

  number: (options = {}) => {
    let code = 'z.number()';
    if (options.int) code += '.int()';
    if (options.min !== undefined) code += `.min(${options.min})`;
    if (options.max !== undefined) code += `.max(${options.max})`;
    return code;
  },

  boolean: () => 'z.boolean()',
  null: () => 'z.null()',
  unknown: () => 'z.unknown()',
  any: () => 'z.any()',
  never: () => 'z.never()',

  object: (props, options = {}) => {
    const propsStr = Object.entries(props)
      .map(([key, type]) => `${wrapWithQuotesIfNeeded(key)}: ${type}`)
      .join(', ');

    let code = `z.object({ ${propsStr} })`;
    if (options.strict) code += '.strict()';
    if (options.passthrough) code += '.passthrough()';
    return code;
  },

  array: (itemType, options = {}) => {
    let code = `z.array(${itemType})`;
    if (options.minItems) code += `.min(${options.minItems})`;
    if (options.maxItems) code += `.max(${options.maxItems})`;
    return code;
  },

  tuple: (types) => `z.tuple([${types.join(', ')}])`,

  union: (types) => `z.union([${types.join(', ')}])`,

  intersection: (types) => types.reduce((acc, type) => (acc ? `${acc}.and(${type})` : type), ''),

  enum: (values, options = {}) => {
    if (options.isString) {
      return `z.enum([${values.map((v) => `"${v}"`).join(', ')}])`;
    }
    return `z.union([${values.map((v) => `z.literal(${JSON.stringify(v)})`).join(', ')}])`;
  },

  literal: (value) => `z.literal(${JSON.stringify(value)})`,

  reference: (name) => name,

  optional: (type) => `${type}.optional()`,
  nullable: (type) => `${type}.nullable()`,
  default: (type, value) => `${type}.default(${JSON.stringify(value)})`,

  describe: (type, description) => `${type}.describe(${JSON.stringify(description)})`,
  refine: (type, refinement) => `${type}.refine(${refinement})`,
};
```

**See full implementation**: [examples/06-zod-factory.ts](./examples/06-zod-factory.ts)

#### Usage in Code Generation

```typescript
// Before (hardcoded)
if (schema.enum) {
  return code.assign(generateStringEnumZodCode(schema.enum));
}

// After (factory-based)
const factory = ctx.factory; // Injected factory
if (schema.enum) {
  const enumCode = factory.enum(schema.enum, { isString: isStringEnum(schema) });
  return code.assign(enumCode);
}
```

#### Future: Multi-Runtime Support

```typescript
// lib/src/factory/valibot-factory.ts
export const valibotFactory: SchemaFactory = {
  string: () => 'v.string()',
  number: () => 'v.number()',
  object: (props) => `v.object({ ${Object.entries(props).map(([k, v]) => `${k}: ${v}`).join(', ')} })`,
  array: (type) => `v.array(${type})`,
  // ... etc
};

// CLI usage
--runtime zod      // Use zodFactory
--runtime valibot  // Use valibotFactory
--runtime types    // Use typescriptFactory (no runtime validation)
```

**See code example**: [examples/07-multi-runtime.ts](./examples/07-multi-runtime.ts)

---

## 3. Functional Composition

### 3.1 The Problem

**Current approach**: Mixed OOP and functional with stateful classes

```typescript
// CodeMeta class manages state
export class CodeMeta {
  private code: string;
  public meta: CodeMetaData;

  constructor(schema, ctx, inheritedMeta) {
    // Initialize state
  }

  assign(code: string) {
    this.code = code;
    return this;
  }

  toString() {
    return this.code;
  }
}
```

**Limitations**:

- Mutable state harder to reason about
- Harder to test (need to mock class instances)
- Less composable (method chaining is not function composition)

### 3.2 typed-openapi's Solution: Pure Functions

```typescript
// Pure function signature
type SchemaConverter = (schema: SchemaObject, ctx: Context) => Box<AnyBoxDef>;

// Implementation
const openApiSchemaToTs: SchemaConverter = ({ schema, ctx }) => {
  const t = createBoxFactory(schema, ctx); // Factory injection

  if (isReferenceObject(schema)) {
    const refInfo = ctx.refs.getInfosByRef(schema.$ref);
    return t.reference(refInfo.normalized);
  }

  if (schema.type === 'object') {
    const props = Object.entries(schema.properties || {}).map(([key, prop]) => [
      key,
      openApiSchemaToTs({ schema: prop, ctx }),
    ]);
    return t.object(Object.fromEntries(props));
  }

  // ... recursive pure functions
};
```

**Benefits**:

- No mutable state
- Easy to test (pure input → output)
- Easy to compose (functions compose naturally)
- Easy to parallelize (no shared state)

### 3.3 Function Composition

typed-openapi uses function composition for extensibility:

```typescript
// Base converter
const baseConverter = (schema, ctx) => {
  /* ... */
};

// Add custom behavior via composition
const withLogging = (converter) => (schema, ctx) => {
  console.log('Converting:', schema.type);
  return converter(schema, ctx);
};

const withCaching = (converter) => {
  const cache = new Map();
  return (schema, ctx) => {
    const key = JSON.stringify(schema);
    if (cache.has(key)) return cache.get(key);
    const result = converter(schema, ctx);
    cache.set(key, result);
    return result;
  };
};

// Compose behaviors
const converter = withCaching(withLogging(baseConverter));
```

### 3.4 Applying to openapi-zod-client

#### Refactor CodeMeta to be Immutable

```typescript
// Before (mutable)
class CodeMeta {
  private code: string;
  assign(code: string) {
    this.code = code; // Mutation!
    return this;
  }
}

// After (immutable)
class CodeMeta {
  private readonly code: string;

  assign(code: string): CodeMeta {
    return new CodeMeta(this.schema, this.ctx, {
      ...this.meta,
      code,
    }); // New instance
  }
}
```

#### Use Function Composition for Transforms

```typescript
// Define transform type
type SchemaTransform = (schema: SchemaObject, ctx: Context) => SchemaObject;

// Individual transforms
const addStrictMode: SchemaTransform = (schema, ctx) => {
  if (schema.type === 'object' && ctx.options.strictObjects) {
    return { ...schema, additionalProperties: false };
  }
  return schema;
};

const addDescriptions: SchemaTransform = (schema, ctx) => {
  if (ctx.options.withDescription && schema.description) {
    return { ...schema, _zodDescription: schema.description };
  }
  return schema;
};

// Compose transforms
const compose =
  (...transforms: SchemaTransform[]): SchemaTransform =>
  (schema, ctx) =>
    transforms.reduce((acc, transform) => transform(acc, ctx), schema);

// Use composed transforms
const preprocess = compose(
  addStrictMode,
  addDescriptions,
  // ... add more transforms
);

// In generation
export function getZodSchema(args: ConversionArgs): CodeMeta {
  const preprocessed = preprocess(args.schema, args.ctx);
  return generateFromSchema(preprocessed, args.ctx);
}
```

**See code example**: [examples/08-composition.ts](./examples/08-composition.ts)

---

## 4. Key Architectural Decisions

### 4.1 Why Not Adopt Everything?

| typed-openapi Pattern      | Should openapi-zod-client adopt? | Reasoning                            |
| -------------------------- | -------------------------------- | ------------------------------------ |
| **Box pattern**            | 🟡 Phase 4 (long-term)           | High effort, enables multi-runtime   |
| **Factory pattern**        | 🟢 Phase 2 (medium-term)         | Medium effort, improves architecture |
| **Functional composition** | 🟢 Phase 2 (medium-term)         | Low effort, better testability       |
| **Single file output**     | 🟢 Phase 1 (quick win)           | Already supported, make default      |
| **Type-only mode**         | 🟢 Phase 1 (quick win)           | Low effort, huge perf benefit        |

### 4.2 Hybrid Approach

**Recommendation**: Keep best of both worlds

```typescript
// Keep Handlebars for output customization
// But use factories for internal logic

// Generation pipeline:
OpenAPI Spec
  ↓
Parse & Validate
  ↓
Transform (via composed functions)
  ↓
Convert to AST (via factory pattern) ← NEW
  ↓
Generate code strings (via factory)
  ↓
Template rendering (via Handlebars) ← EXISTING
  ↓
Format & Output
```

**Benefits**:

- Users can still customize via templates (existing DX)
- Internal code is cleaner (factory pattern)
- Future-proof for multi-runtime (AST layer)
- Incremental migration (no big bang rewrite)

---

## 5. Implementation Checklist

### Phase 1: Preparation (No Breaking Changes)

- [ ] Document current architecture
- [ ] Add architectural decision records (ADRs)
- [ ] Create proof-of-concept for factory pattern
- [ ] Benchmark current generation performance

### Phase 2: Factory Pattern (Internal Refactor)

- [ ] Define SchemaFactory interface
- [ ] Implement zodFactory
- [ ] Refactor helpers to use factory
- [ ] Add factory injection to context
- [ ] Add tests for factory pattern
- [ ] Keep backward compatibility

### Phase 3: AST Layer (Optional, Long-term)

- [ ] Design SchemaNode interface
- [ ] Implement OpenAPI → AST parser
- [ ] Implement AST → Zod generator
- [ ] Run parallel with old generator
- [ ] Add feature flag for testing
- [ ] Migrate incrementally

### Phase 4: Multi-Runtime (Future)

- [ ] Implement valibotFactory
- [ ] Implement arktypeFactory
- [ ] Add --runtime CLI option
- [ ] Update templates for multi-runtime
- [ ] Documentation and examples

---

## 6. References

### Code Examples

- [01-box-pattern.ts](./examples/01-box-pattern.ts) - Box implementation
- [02-box-transformations.ts](./examples/02-box-transformations.ts) - AST transformations
- [03-box-types.ts](./examples/03-box-types.ts) - Box type system
- [04-ast-architecture.ts](./examples/04-ast-architecture.ts) - Full AST implementation
- [05-factory-pattern.ts](./examples/05-factory-pattern.ts) - Factory pattern basics
- [06-zod-factory.ts](./examples/06-zod-factory.ts) - Complete Zod factory
- [07-multi-runtime.ts](./examples/07-multi-runtime.ts) - Multi-runtime support
- [08-composition.ts](./examples/08-composition.ts) - Functional composition

### External Resources

- [typed-openapi source](https://github.com/astahmer/typed-openapi/tree/main/packages/typed-openapi/src)
- [Box pattern implementation](https://github.com/astahmer/typed-openapi/blob/main/packages/typed-openapi/src/box.ts)
- [Factory pattern implementation](https://github.com/astahmer/typed-openapi/blob/main/packages/typed-openapi/src/box-factory.ts)
- [typebox-codegen](https://github.com/sinclairzx81/typebox-codegen) - Multi-runtime code generation

---

**Next**: Read [02-PERFORMANCE.md](./02-PERFORMANCE.md) for performance optimization patterns.
