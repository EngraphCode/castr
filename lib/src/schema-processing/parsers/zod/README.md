# Zod Parser

Parses Zod 4 schema source files into `CastrDocument` IR using ts-morph AST.

## Features

- **Zod 4 only** — Strict rejection of Zod 3 syntax
- **Static analysis** — Rejects dynamic/computed schemas
- **Schema support (strict/lossless)** — Primitives, objects, arrays, enums, unions, intersections
- **Endpoint parsing** — `defineEndpoint({...})` pattern → `CastrOperation`
- **Reference resolution** — Variable refs, getter-based recursion, circular detection
- **Writer lockstep** — Accepts writer-emitted identifier-rooted intersection declarations (for example `const Pet = NewPet.and(...)`) when root identifiers are known schema declarations

## Architecture

```text
Zod Source → ts-morph AST → Parser Modules → CastrDocument IR
```

### No Regex (ADR-026)

All parsing uses **ts-morph AST traversal** — regex is banned for schema parsing.

### Module Structure

| Module                       | Purpose               |
| ---------------------------- | --------------------- |
| `zod-ast.ts`                 | AST utilities         |
| `zod-parser.primitives.ts`   | Primitive types       |
| `zod-parser.object.ts`       | Objects               |
| `zod-parser.composition.ts`  | Arrays, enums         |
| `zod-parser.union.ts`        | Unions                |
| `zod-parser.intersection.ts` | Intersections         |
| `zod-parser.references.ts`   | References, recursion |
| `zod-parser.meta.ts`         | Metadata extraction   |
| `zod-parser.core.ts`         | Central dispatcher    |
| `zod-parser.detection.ts`    | Zod 3 detection       |

## Usage

```typescript
import { parseZodSource } from '@engraph/castr/parsers/zod';

const source = `
  export const UserSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
  }).meta({ description: 'A user' });
`;

const result = parseZodSource(source);
// result.ir: CastrDocument
// result.recommendations: Recommendation[]
```

## Validation Philosophy

| Input           | Behavior          |
| --------------- | ----------------- |
| Valid Zod 4     | Parse to IR       |
| `z.undefined()` | Reject with error |
| Zod 3 syntax    | Reject with error |
| Dynamic schemas | Reject with error |

## See Also

- [ADR-026: No String Manipulation for Parsing](../../../docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md)
- [ADR-032: Zod Input Strategy](../../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md) — Key decisions on metadata, recursion, .describe() handling
