# Zod Parser

Parses Zod 4 schema source files into `CastrDocument` IR using ts-morph AST.

## Features

- **Zod 4 only** — Strict rejection of Zod 3 syntax
- **Static analysis** — Rejects dynamic/computed schemas
- **Full schema support** — Primitives, objects, arrays, enums, unions, intersections
- **Endpoint parsing** — `defineEndpoint({...})` pattern → `CastrOperation`
- **Reference resolution** — Variable refs, lazy schemas, circular detection

## Architecture

```
Zod Source → ts-morph AST → Parser Modules → CastrDocument IR
```

### No Regex (ADR-026)

All parsing uses **ts-morph AST traversal** — regex is banned for schema parsing. This is enforced via ESLint rules in this directory.

### Module Structure

| Module                           | Purpose                                |
| -------------------------------- | -------------------------------------- |
| `zod-ast.ts`                     | AST utilities, method chain extraction |
| `zod-parser.primitives.ts`       | string, number, boolean, date          |
| `zod-parser.object.ts`           | Objects with properties                |
| `zod-parser.composition.ts`      | Arrays, enums                          |
| `zod-parser.union.ts`            | Unions, discriminated unions           |
| `zod-parser.intersection.ts`     | Intersections → `allOf`                |
| `zod-parser.references.ts`       | Lazy schemas, variable refs            |
| `zod-parser.constraints.ts`      | Method chain constraints               |
| `zod-parser.endpoint.ts`         | Endpoint definitions                   |
| `zod-parser.endpoint.builder.ts` | Build `CastrOperation` from endpoint   |
| `zod-parser.detection.ts`        | Zod 3 and dynamic detection            |

## Usage

```typescript
import { parseZodSource } from '@engraph/castr/parsers/zod';

const source = `
  export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
  });
`;

const result = parseZodSource(source);
// result.ir: CastrDocument
// result.recommendations: Recommendation[]
```

## Validation Philosophy

| Input           | Behavior          |
| --------------- | ----------------- |
| Valid Zod 4     | Parse to IR       |
| Zod 3 syntax    | Reject with error |
| Dynamic schemas | Reject with error |
| Malformed Zod   | Reject with error |

## See Also

- [ADR-026: No Regex for Parsing](../../docs/architectural_decision_records/ADR-026-no-regex-for-parsing.md)
- [ADR-027: Round-Trip Validation](../../docs/architectural_decision_records/ADR-027-round-trip-validation.md)
