# Phase 2 Plan: Zod → OpenAPI

**Date:** January 10, 2026  
**Status:** Session 2.1 Complete  
**Prerequisites:** Phase 1 complete (OpenAPI → Zod), Session 2.1 complete (46 new tests, 1080 total)

---

## Design Decisions

> **Resolved during planning (January 10, 2026)**

| Question             | Decision                      | Rationale                                                                 |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| **Zod version**      | Zod 4 only                    | No Zod 3 support; strict rejection of invalid input                       |
| **Input strictness** | Strict validation             | Reject malformed/incorrect Zod; no best-effort parsing                    |
| **Scope**            | Schemas first, then endpoints | Both must be supported                                                    |
| **Metadata**         | Deterministic recommendations | Output suggestions for missing title/description; no AI-generated content |

---

## Strategic Goals

### 1. Architectural Excellence

Phase 2 is not just about "parsing Zod" — it's about **proving the IR architecture works bidirectionally**. Success means:

- The same `CastrDocument` IR serves as the canonical representation for both directions
- Writers and parsers are symmetric: `OpenAPI → IR → Zod` and `Zod → IR → OpenAPI`
- No format-specific leakage — IR remains the single source of truth

### 2. Discovering Format Symmetry

> **Key Question:** What commonalities exist between defining a format as input vs. output?

By implementing the reverse direction, we expect to discover:

| Dimension        | OpenAPI → IR         | Zod → IR                | Shared Opportunity            |
| ---------------- | -------------------- | ----------------------- | ----------------------------- |
| **Type mapping** | OAS types → IR types | Zod types → IR types    | Single bidirectional type map |
| **Composition**  | allOf/oneOf/anyOf    | z.union/z.intersection  | Unified composition algebra   |
| **Optionality**  | required array       | .optional()/.nullable() | Canonical optionality model   |
| **Constraints**  | min/max/pattern      | .min()/.max()/.regex()  | Shared constraint vocabulary  |
| **References**   | $ref resolution      | Zod variable refs       | Dependency graph extraction   |

**Goal:** Extract abstractions that work for **any** format pair, not just OpenAPI ↔ Zod.

### 3. DRY & Elegant Design

Apply rigorous software engineering principles:

- **Single Responsibility:** Each module does one thing well
- **Open/Closed:** IR is open for extension (new formats) without modification
- **Interface Segregation:** Format-specific adapters implement common interfaces
- **Dependency Inversion:** High-level logic depends on IR, not format specifics

**Specific Opportunities:**

1. **Type Mapping Table** — One declaration defines both directions
2. **Constraint Normalisation** — Unified min/max/pattern handling
3. **Composition Handlers** — Shared union/intersection/allOf logic
4. **Reference Resolution** — Common dependency graph builder

---

## Technical Approach

### Input: What We're Parsing

**Zod 4 Only** — No Zod 3 support. The parser will:

- ✅ Accept well-formed, correct Zod 4 schemas
- ❌ Reject Zod 3 syntax (different API surface)
- ❌ Reject malformed or incorrect input with clear errors
- ❌ Reject dynamic/computed schemas that can't be statically analysed

**Strict Validation Philosophy:**

```typescript
// ACCEPTED: Static, well-formed Zod 4
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

// REJECTED: Dynamic construction
const fields = getFields(); // Can't statically analyse
export const DynamicSchema = z.object(fields);

// REJECTED: Zod 3 syntax
export const LegacySchema = z.string().nonempty(); // Zod 3 method
```

### Metadata Strategy: Deterministic Recommendations

When Zod lacks metadata (title, description), we output **recommendations** rather than generated content:

```typescript
interface ParseResult {
  ir: CastrDocument;
  recommendations: Recommendation[];
}

interface Recommendation {
  schemaName: string;
  field: 'title' | 'description';
  suggestedValue?: string;  // Only if derivable (e.g., from variable name)
  reason: string;
}

// Example output:
{
  schemaName: "UserSchema",
  field: "description",
  reason: "No .describe() found. Consider adding: z.object({...}).describe('...')"
}
```

This keeps the process **completely deterministic** — no AI, no heuristics, just structured feedback.

### Parsing Strategy: ts-morph AST

Use ts-morph to parse Zod source files as TypeScript AST:

```typescript
// Input: Zod source
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']),
});

// Extracted IR:
{
  name: "User",
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1, maxLength: 100 },
    email: { type: "string", format: "email", optional: true },
    role: { type: "string", enum: ["admin", "user"] }
  },
  required: ["id", "name", "role"]
}
```

### Key Technical Challenges

| Challenge             | Approach                                           |
| --------------------- | -------------------------------------------------- |
| Chain method parsing  | Walk CallExpression AST, accumulate constraints    |
| Variable references   | Track scope, resolve to schema definitions         |
| Circular dependencies | Mirror existing IR circularity detection           |
| Type inference        | Use TypeScript's type checker for complex cases    |
| Zod 3 detection       | Identify and reject with clear error message       |
| Dynamic schemas       | Detect non-static construction, reject with reason |
| Missing metadata      | Generate recommendations, not content              |

---

## Architecture Vision

```
┌─────────────────────────────────────────────────────────────┐
│                     FORMAT ADAPTERS                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ OpenAPI      │  │ Zod          │  │ JSON Schema  │ ...  │
│  │ Adapter      │  │ Adapter      │  │ Adapter      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │ parse()         │ parse()         │ parse()      │
│         ▼                 ▼                 ▼              │
├─────────────────────────────────────────────────────────────┤
│                 CANONICAL IR (CastrDocument)                │
│         components, operations, dependencyGraph             │
├─────────────────────────────────────────────────────────────┤
│         │ write()         │ write()         │ write()      │
│         ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ OpenAPI      │  │ Zod          │  │ TypeScript   │ ...  │
│  │ Writer       │  │ Writer       │  │ Writer       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Adapter Interface (DRY Opportunity)

```typescript
interface FormatAdapter<TInput, TOutput> {
  /** Parse format-specific input into IR */
  parse(input: TInput): CastrDocument;

  /** Write IR to format-specific output */
  write(ir: CastrDocument): TOutput;

  /** Format metadata */
  readonly formatId: string;
  readonly supportsInput: boolean;
  readonly supportsOutput: boolean;
}
```

This interface enables:

- Each format implements one adapter
- Round-trip testing: `adapter.write(adapter.parse(input)) ≈ input`
- Format discovery: registry of available adapters

---

## Work Sessions

### Session 2.1: Zod 4 AST Parser Foundation ✅ COMPLETE

**Goal:** Parse basic Zod 4 schemas to IR using ts-morph with strict validation.

**Completed (46 tests):**

- [x] Create `lib/src/parsers/zod/` directory structure
- [x] Implement `parseZodSource(source: string): ParseResult`
- [x] Implement Zod 4 detection (reject Zod 3 syntax) — 13 tests
- [x] Implement dynamic schema detection — 4 tests
- [x] Handle primitives: `z.string()`, `z.number()`, `z.boolean()` — 10 tests
- [x] Handle `z.object()` with properties — 7 tests
- [x] Extract variable names as schema names — 5 tests
- [x] Return structured errors for invalid input
- [x] Generate deterministic recommendations — 7 tests

**Files Created:**

```
lib/src/parsers/zod/
├── index.ts                          # Module exports
├── zod-parser.ts                     # Main entry point
├── zod-parser.types.ts               # Type definitions
├── zod-parser.detection.ts           # Zod 3 & dynamic detection
├── zod-parser.primitives.ts          # Primitive parsing
├── zod-parser.object.ts              # Object parsing
└── *.unit.test.ts                    # Test files
```

---

### Session 2.2: Constraints & Modifiers (4-6h)

**Goal:** Parse Zod method chains (constraints and optionality).

**Scope:**

- [ ] Implement chain walking: `.min()`, `.max()`, `.length()`, `.regex()`
- [ ] Handle optionality: `.optional()`, `.nullable()`, `.nullish()`
- [ ] Parse string formats: `.email()`, `.url()`, `.uuid()`, `.datetime()`
- [ ] Handle defaults: `.default()`

**Tests:**

- Constraint extraction accuracy
- Optionality edge cases (nullable vs optional vs nullish)

**Acceptance:**

- `z.string().min(1).max(100).email().optional()` → correct IR

---

### Session 2.3: Composition & References (6-8h)

**Goal:** Handle unions, intersections, and schema references.

**Scope:**

- [ ] Parse `z.union([...])` and `z.discriminatedUnion(...)`
- [ ] Parse `z.intersection(...)` (allOf equivalent)
- [ ] Resolve variable references: `const Foo = z.object(...); const Bar = Foo.extend(...)`
- [ ] Build dependency graph from references
- [ ] Handle `z.lazy()` for circular references

**Tests:**

- Union/intersection IR mapping
- Circular reference detection

**Acceptance:**

- Complex schemas with references produce valid dependency graphs

---

### Session 2.4: Endpoint Parsing (6-8h)

**Goal:** Parse Zod-based endpoint definitions into IR operations.

**Scope:**

- [ ] Define endpoint definition format (input/output schemas, method, path)
- [ ] Parse endpoint declarations to `CastrOperation`
- [ ] Link request/response schemas to components
- [ ] Handle path parameters and query schemas

**Tests:**

- Endpoint IR mapping
- Request/response schema linking

**Acceptance:**

- Endpoint definitions produce valid `CastrOperation` entries

---

### Session 2.5: OpenAPI Writer (6-8h)

**Goal:** Generate OpenAPI 3.1 from IR.

**Scope:**

- [ ] Create `lib/src/writers/openapi/` directory structure
- [ ] Implement `writeOpenApi(ir: CastrDocument): OpenAPIObject`
- [ ] Map IR types to OAS types
- [ ] Generate `components.schemas` from IR components
- [ ] Generate `paths` from IR operations
- [ ] Handle composition (allOf/oneOf/anyOf)

**Tests:**

- Round-trip: Parse OpenAPI → IR → Write OpenAPI
- Structural equivalence (not byte-for-byte)

**Acceptance:**

- Generated OpenAPI validates against OAS 3.1 schema

---

### Session 2.6: Round-Trip Validation (4-6h)

**Goal:** Prove architectural symmetry with round-trip tests.

**Scope:**

- [ ] Create round-trip test suite: `OpenAPI → Zod → IR → OpenAPI'`
- [ ] Define equivalence criteria (structural, not textual)
- [ ] Handle expected losses (comments, ordering)
- [ ] Add characterisation tests for real-world specs
- [ ] Validate recommendations output for missing metadata

**Tests:**

- All existing fixture specs round-trip successfully
- Document any lossy transformations
- Recommendations generated for missing descriptions

**Acceptance:**

- Round-trip produces semantically equivalent output
- Recommendations are actionable and deterministic

---

### Session 2.7: Adapter Abstraction & Refactor (4-6h)

**Goal:** Extract common patterns into shared adapter interface.

**Scope:**

- [ ] Define `FormatAdapter` interface
- [ ] Refactor OpenAPI parser to implement adapter
- [ ] Refactor Zod parser to implement adapter
- [ ] Create adapter registry for format discovery
- [ ] Document discovered commonalities

**Deliverables:**

- ADR documenting format adapter abstraction
- Shared type mapping utilities
- Updated architecture documentation

---

## Verification Strategy

### Quality Gates (Same as Phase 1)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

### Round-Trip Testing

```typescript
// New test category: round-trip validation
describe('Format Round-Trip', () => {
  it('OpenAPI → Zod → IR → OpenAPI produces equivalent spec', () => {
    const original = loadFixture('petstore.yaml');
    const zod = generateZod(original);
    const ir = parseZod(zod);
    const regenerated = writeOpenApi(ir);

    expect(regenerated).toBeStructurallyEquivalent(original);
  });
});
```

---

## Success Criteria

**Phase 2 is complete when:**

1. ✅ Zod source files can be parsed into `CastrDocument`
2. ✅ `CastrDocument` can be written to OpenAPI 3.1
3. ✅ Round-trip tests pass for representative specs
4. ✅ Shared `FormatAdapter` abstraction documented
5. ✅ DRY opportunities identified and implemented
6. ✅ All quality gates pass
7. ✅ Architecture documentation updated

---

## Estimated Effort

| Session                      | Effort | Cumulative |
| ---------------------------- | ------ | ---------- |
| 2.1 Zod 4 parser foundation  | 4-6h   | 4-6h       |
| 2.2 Constraints & modifiers  | 4-6h   | 8-12h      |
| 2.3 Composition & references | 6-8h   | 14-20h     |
| 2.4 Endpoint parsing         | 6-8h   | 20-28h     |
| 2.5 OpenAPI writer           | 6-8h   | 26-36h     |
| 2.6 Round-trip validation    | 4-6h   | 30-42h     |
| 2.7 Adapter abstraction      | 4-6h   | 34-48h     |

**Total: ~5-7 focused sessions (3-4 weeks)**

---

## Resolved Questions

| Question              | Resolution                                                               |
| --------------------- | ------------------------------------------------------------------------ |
| Scope of Zod parsing  | Arbitrary well-formed Zod 4; strict rejection of Zod 3 and invalid input |
| Operations            | Both schemas and endpoints supported                                     |
| Metadata enrichment   | Deterministic recommendations; no AI-generated content                   |
| Lossy transformations | Document explicitly; recommendations guide manual enrichment             |

---

## Future: Beyond Phase 2

With the adapter abstraction in place, Phase 3+ becomes straightforward:

| Phase | Format                 | Effort Reduction            |
| ----- | ---------------------- | --------------------------- |
| 3     | JSON Schema ↔ OpenAPI | High (similar structure)    |
| 4     | tRPC ↔ IR             | Medium (Zod already parsed) |
| 5     | Custom formats         | Plug-and-play adapters      |

**This is the power of architectural excellence — each new format is an incremental addition, not a rewrite.**
