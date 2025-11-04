# ADR-012: Remove Playground and Examples Workspaces

## Status

**Accepted** - October 22, 2025

## Context

The monorepo originally contained three workspaces:

1. **`lib`** - Core library (openapi-zod-client)
2. **`playground`** - Interactive web UI for testing the library
3. **`examples`** - Sample projects demonstrating usage

The project's goal evolved: modernize the `lib` workspace to be extracted and ported to another monorepo as a workspace. The destination repo would consume the library, not the playground or examples.

### The Problem

**Maintenance burden:**

- Playground had its own dependencies, build process, and tooling
- Examples had multiple sub-packages with their own deps
- Added complexity to the monorepo setup
- Not needed for the extraction goal

**Migration target:**

- Destination repo: Engraph monorepo
- Purpose: Generate type-safe SDK and MCP server from OpenAPI spec
- Only needs: The core library functionality
- Doesn't need: Interactive playground or example projects

### Forces at Play

**For keeping playground/examples:**

- Demonstrates library capabilities
- Useful for local development testing
- Examples help new users

**Against keeping playground/examples:**

- Not part of extraction goal
- Maintenance overhead
- Complexity in monorepo setup
- Can be recreated if needed
- Core library has comprehensive tests

## Decision

**We will remove the `playground` and `examples` workspaces from the repository.**

### Rationale

1. **Not needed for extraction**: Only `lib` will be ported
2. **Comprehensive tests**: `lib` has 297 tests proving functionality
3. **Focus**: Concentrate effort on core library quality
4. **Simplicity**: Simpler monorepo structure
5. **Maintainability**: Less code to maintain
6. **Can recreate**: If needed in the future, can create new examples

### What Was Removed

#### Playground Workspace

```
playground/
  ├── src/
  │   ├── Playground/
  │   │   └── Playground.machine.ts  # XState machine for UI
  │   ├── App.tsx
  │   └── main.tsx
  ├── package.json
  ├── tsconfig.json
  ├── eslint.config.ts
  └── vite.config.ts
```

- React-based web UI
- Vite build setup
- XState for state management
- Allowed testing library in browser

#### Examples Workspace

```
examples/
  ├── basic/
  │   └── package.json
  ├── schemas-only/
  │   └── package.json
  └── export-schemas-and-types-directly/
      └── package.json
```

- Three example projects
- Demonstrated different usage patterns
- Each had own dependencies

## Consequences

### Positive

✅ **Simpler structure**: Single workspace to maintain  
✅ **Faster CI/CD**: Fewer workspaces to build/test  
✅ **Clear focus**: All effort on core library  
✅ **Less complexity**: Simpler monorepo setup  
✅ **Easier extraction**: Only `lib` to port  
✅ **Fewer dependencies**: Removed React, Vite, XState, etc.

### Negative

⚠️ **No visual testing**: Can't test in browser anymore  
⚠️ **No examples**: Developers need to read tests for usage

### Mitigation

- **Comprehensive tests**: 297 tests document all functionality
- **Test files as examples**: Integration tests show real usage
- **Can recreate**: If playground/examples needed later, can recreate from git history
- **Documentation**: Can create usage examples in `README.md` or docs

## What This Means for the Project

### Before

```
openapi-zod-client/
  ├── lib/              # Core library
  ├── playground/       # Interactive UI
  ├── examples/         # Usage examples
  ├── pnpm-workspace.yaml
  └── turbo.json        # Orchestrates 3 workspaces
```

### After

```
openapi-zod-client/
  ├── lib/              # Core library (only workspace)
  ├── pnpm-workspace.yaml
  └── turbo.json        # Orchestrates 1 workspace
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - lib
  # Removed: playground, examples
```

### Removed Dependencies

**Playground-specific:**

- `react`
- `react-dom`
- `vite`
- `xstate`
- `@xstate/react`

**Examples-specific:**

- Various demo dependencies

**Total size reduction:** ~40MB in `node_modules`

## Extraction Strategy

The goal is to port `lib` to another repository:

```
engraph-monorepo/
  packages/
    ├── openapi-zod-client/   # Ported from this repo
    ├── sdk-generator/         # Uses openapi-zod-client
    ├── mcp-server/            # Uses generated SDK
    └── ...
```

Only the `lib` workspace will be ported, so removing `playground` and `examples` simplifies this process.

## Testing Alternative

Instead of a playground, we have:

1. **Unit tests**: 297 tests covering all functionality
2. **Integration tests**: Real OpenAPI → Zod generation
3. **Snapshot tests**: Verify generated code structure
4. **Compliance tests**: Validate against official OpenAPI schemas

**This is sufficient** for development and validation.

## If Playground/Examples Are Needed Later

1. **Restore from git history**: Commits are preserved
2. **Create new examples**: With updated library
3. **Link external playground**: Create separate repo with published library

## Related Decisions

- [ADR-010: Use Turborepo for Monorepo Orchestration](./ADR-010-use-turborepo.md) - Simplified to one workspace

## References

- Removed files: Git history preserves all deleted files
- Workspace config: `pnpm-workspace.yaml`, `turbo.json`
- Commit: Phase 1a workspace cleanup

## Commits

- Phase 1a: Remove playground and examples workspaces
