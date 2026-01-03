# @engraph/castr — Library Package

This is the main library package for Castr, containing the core schema transformation engine.

## Package Structure

```
lib/
├── src/
│   ├── cli/           # Command-line interface
│   ├── context/       # Caster Model (CastrDocument, CastrSchema, etc.)
│   ├── conversion/    # Format conversions (Zod, TypeScript, JSON Schema)
│   ├── generators/    # Output generators (OpenAPI)
│   ├── rendering/     # Template rendering and output generation
│   ├── shared/        # Shared utilities and helpers
│   ├── validation/    # MCP type guards and validation utilities
│   └── writers/       # AST writers (Zod, TypeScript, Markdown)
├── tests-snapshot/    # Snapshot tests
├── tests-e2e/         # End-to-end tests
└── tests-generated/   # Generated validation tests
```

## Caster Model

The **Caster Model** is the canonical internal representation for all schema data:

| Type             | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `CastrDocument`  | Root document containing all schemas and operations |
| `CastrSchema`    | Schema node with type, constraints, and metadata    |
| `CastrOperation` | HTTP operation (GET, POST, etc.)                    |
| `CastrParameter` | Request parameter (path, query, header)             |
| `CastrResponse`  | Response definition with status codes               |

All input formats (OpenAPI, JSON Schema) are parsed into the Caster Model, and all output formats (Zod, TypeScript, MCP) are generated from it.

## Development

```bash
# From lib/ directory
pnpm build         # Build the library
pnpm type-check    # Check TypeScript types
pnpm lint          # Run ESLint
pnpm test          # Run unit tests
pnpm test:snapshot # Run snapshot tests
```

## Quality Gates

All changes must pass these gates:

1. `pnpm build` — Compiles without errors
2. `pnpm type-check` — No TypeScript errors
3. `pnpm lint` — No lint warnings
4. `pnpm format:check` — Code is formatted
5. `pnpm test` — All unit tests pass
6. `pnpm test:snapshot` — Snapshot tests match
7. `pnpm test:gen` — Generated tests pass
8. `pnpm character` — Characterisation tests pass

## Key Exports

```typescript
// Main generation function
export { generateZodClientFromOpenAPI } from '@engraph/castr';

// Template context utilities
export { getZodClientTemplateContext, getEndpointDefinitionList } from '@engraph/castr';

// MCP utilities
export {
  isMcpTool,
  isMcpToolInput,
  isMcpToolOutput,
  formatMcpValidationError,
} from '@engraph/castr';

// Types
export type { CastrDocument, CastrSchema } from '@engraph/castr';
```
