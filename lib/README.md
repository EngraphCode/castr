# @engraph/castr — Library Package

This is the main library package for Castr, containing the core schema transformation engine.

## Package Structure

```text
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
# From repo root: canonical aggregate verification
pnpm check:ci
pnpm check

# From lib/ directory: targeted iteration
pnpm build         # Build the library
pnpm type-check    # Check TypeScript types
pnpm lint          # Run ESLint
pnpm test          # Run unit tests
pnpm test:snapshot # Run snapshot tests
```

## Local Git Hooks

- Husky `pre-commit` formats staged files with Prettier.
- Husky `pre-push` runs `pnpm check:ci`.
- Explicit repo-root aggregate reruns remain the close-out source of truth.

## Quality Gates

Canonical aggregate verification lives at the repo root:

1. `pnpm check:ci` — full non-mutating aggregate verification
2. `pnpm check` — full local aggregate verification, allowed to fix formatting and safe lint issues

When you need to isolate failures manually, follow the expanded chain in [.agent/directives/DEFINITION_OF_DONE.md](../.agent/directives/DEFINITION_OF_DONE.md).

## Key Exports

```typescript
// Main generation function (OpenAPI → Zod)
export { generateZodClientFromOpenAPI } from '@engraph/castr';

// OpenAPI writer (IR → OpenAPI)
export { writeOpenApi } from '@engraph/castr';

// Template context utilities
export { getZodClientTemplateContext } from '@engraph/castr';

// Zod parser (Zod → IR) - subpath export
export { parseZodSource } from '@engraph/castr/parsers/zod';

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
