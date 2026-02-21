# ADR-036: Strict Architectural Domain Boundaries

## Status

Accepted

## Context

During the completion of Phase 3.3a (Complexity Refactoring), strict adherence to directory-size thresholds (via `castr/max-files-per-dir`) necessitated breaking up large orchestrator functions and sprawling directories.

However, a pragmatic "shortcut" approach was often taken: files were split up and moved into subdirectories, but their internal types and functions were then aggressively re-exported via `index.ts` barrel files to seamlessly maintain existing contracts with the rest of the application.

This created a severe architectural flaw: **Leaky Abstractions**. The type-graph of the application became a massive, highly entangled web, exposing internal implementation details (such as Zod generic constraints and deep OpenAPI recursive types) across domain boundaries.

This culminated in catastrophic Out of Memory (OOM) failures in the bundler (`tsup` / `rollup-plugin-dts`), which was unable to flatten and traverse this chaotic graph to emit `.d.ts` declaration files.

## Decision

We mandate strict **Domain-Driven Refactoring** over simple file reorganization. The following architectural rules are established:

### 1. Bounded Contexts via Directories

Directories with multiple files represent distinct sub-domains (Bounded Contexts). They are not merely "file folders".

### 2. Strict Public APIs (Barrier of Entry)

Each sub-domain must have a deliberately designed Public API, exposed exclusively through its root `index.ts` file.

- The `index.ts` file is the **only** permitted entry point strictly defining the sub-domain's contract.
- It must **only** export what is absolutely necessary for external consumption.

### 3. Encapsulation of Internals

Internal implementation details—such as helper types, parser utilities, and localized interfaces—must NEVER be exported from the `index.ts` barrel file. They are private to the sub-domain.

### 4. Prohibition of Wildcard Exports

The use of `export *` is permanently banned. All exports mapping a public API must be explicit and named.

### 5. Architectural Guardrails (Enforcement)

We will enforce these boundaries using static analysis:

1. **ESLint Rule (`no-restricted-imports` or `import-x/no-restricted-paths`)**: To block external consumers from importing deeply into a sub-domain (e.g., forbidding imports matching `sub-domain/internal-file.ts`).
2. **Continued File Limits (`castr/max-files-per-dir`)**: To ensure domains do not grow unbounded, forcing continual evaluation of cohesion.

## Consequences

**Positive Outcomes**:

- Eradicates OOM crashes during bundling by keeping the inter-domain type graph extremely narrow and shallow.
- Drastically improves compilation speeds and IDE responsiveness.
- Forces deliberate architectural design, making the system easier to understand and maintain.
- Changes deep inside a sub-domain can be made safely without fear of breaking distant consumers.

**Negative Outcomes**:

- Refactoring takes more thought and effort; it is no longer just moving files.
- Developers must explicitly design integration adapters or centralized data structures when logic needs to cross boundaries.
