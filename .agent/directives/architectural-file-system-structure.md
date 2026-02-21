# Architectural File System Structure & Complexity Limits

## Overview

Software architecture naturally trends towards entropy. To maintain a healthy, scalable, and OOM-free codebase, we enforce strict **Domain-Driven Architecture**.

This document outlines proactive rules for _creating_ and _maintaining_ structure within the project, as well as remediation steps when you encounter architectural limit alerts (like the custom ESLint rule `castr/max-files-per-dir` or `dependency-cruiser` boundary violations).

**Core Philosophy:** Every tool in our static analysis symphony (linters, cruisers, graph checks) must act in service of **revealing issues**, providing valuable feedback signals upon which we act to strengthen our repo.

> **Maximizing Signal:** The fundamental intent of our architectural tooling is to maximize the signal that reveals structural truths. This supports true architectural excellence and provides the best possible developer experience (for both humans and AI). Tuning configurations to minimize signal just to avoid reported issues—thus hiding the problem entirely—is not just a poor solution; **it is actively harmful to the repository.** We use these tools to surface architectural drift so it can be fixed at the root cause.

## Proactive Architectural Rules (How to Organize Code)

When creating a new feature, directory, or module, you must design it as a strict **Bounded Context**:

### 1. Identify the Domain

Code should be grouped by its functional domain (e.g., `parsers`, `writers`, `context`), not by technical type (e.g., not `utils/`, `types/`, `helpers/` at the root level).

### 2. Design the Public API (The Contract)

Before writing files, define the narrowest possible entry point.

- The module must have an `index.ts` file acting as a **barrel file**.
- **This `index.ts` file is the ONLY permitted entry point for external consumers.**
- Export only what is absolutely necessary for external consumers to use. This minimizes the inter-domain type graph.

### 3. Encapsulate Internals (Dependency Cruiser's Primary Job)

Internal implementation details—such as helper types, sub-parsers, or localized utilities—must **never** be exported from the domain's `index.ts`.

- External consumers are completely banned from bypassing the `index.ts` file to import internal implementation files directly.
- **Dependency-Cruiser (`depcruise`)** actively enforces this constraint. Any violation flagged by `dependency-cruiser` means an external module has pierced the boundary of a domain and coupled itself to internal logic.
- **Do not tune the `dependency-cruiser` regexes to hide these violations.** Instead, either (1) export the needed symbol from the domain's root `index.ts` or (2) refactor the dependency so it relies on public contracts instead of private implementation details.
- If multiple sibling domains need an internal utility, move the utility down to a `shared/` layer.

### 4. Banned Practices

- **Never use wildcard exports (`export *`).** They create "leaky" abstractions, leading to hidden coupling and massive "Out of Memory" bundler crashes.
- **No Upward or Lateral Internal Dependencies.** A domain cannot depend on its sibling's internal files.

## Remediation Strategy: Domain-Driven Refactoring

If you encounter an architectural tool violation (like `max-files-per-dir`), **do not simply increase the limit or suppress the rule.** This rule is a signal that a directory now represents multiple distinct ideas.

You are required to perform an **Architectural Domain Refactoring**, not just a file reorganization.

1. **Spot Sub-domains:** Group files into natural bounded contexts (e.g., `primitives/`, `objects/`, `composition/` inside a `zod` parser).
2. **Extract:** Move the files to subdirectories.
3. **Establish Contracts:** Create an `index.ts` in each new subdirectory. Explicitly export only the Public API. Do not use wildcards.
4. **Restore the Parent:** Update the parent's `index.ts` (if it has consumers) to correctly map to the new sub-domain contracts.

## Verify the Seam (The Architectural Symphony)

When you believe you have successfully created or extracted a Bounded Context, you must verify it using our 5-tool static analysis symphony. Evaluate these signals honestly:

1. **`pnpm run cruise` (`dependency-cruiser`)**: Validates the global dependency graph. It guarantees you haven't bypassed an `index.ts` barrel file or tangled domains illegally. **Listen to its feedback; do not loosen its rules to simply pass CI.**
2. **`pnpm lint`**:
   - Verifies the `castr/max-files-per-dir` complexity rule count is within bounds.
   - Runs `eslint-plugin-boundaries` to provide semantic structural validation.
   - Runs `eslint-plugin-import-x` to check for hard-coded file exclusions.
3. **`pnpm run madge:circular`**: Fast check to verify your abstractions didn't accidentally introduce a runtime-failing circular dependency.
4. **`pnpm run knip`**: Because you firmly locked down the public API in the `index.ts` file, `knip` will immediately flag any internal file or utility that is unused. If it's not exported, and not used internally, delete it.
5. **`pnpm test` & `pnpm type-check`**: Validates runtime behavior and static type soundness.

Refactoring is a healthy part of the software lifecycle. By applying these steps and trusting the symphony of tools, you drastically improve the modularity, compilation speed, and readability of the project.
