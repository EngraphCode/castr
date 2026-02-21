# ADR-036: Limit Directory Complexity

## Status

Accepted

## Context

As the `@engraph/castr` monorepo scales, certain directories have naturally grown significantly (e.g., `schema-processing/parsers/zod`, `schema-processing/context`, `shared`). Large, flat folders reduce discoverability, increase cognitive load, and visibly blur architectural boundaries.

Without structural guard-rails, organic growth inevitably leads to "junk drawer" architectures where files are colocated simply as a path of least resistance, rather than grouped by strong cohesion. While we possess quality gates restricting internal file complexity (e.g. cyclomatic complexity, max file lines), we lacked a mechanism governing structural relationships at the module level.

## Decision

We will implement an automated guard-rail via a custom ESLint rule (`castr/max-files-per-dir`) to limit the maximum number of source files in any single directory to **8**.

Test files, integration tests, map files, and declaration files (`.test.ts`, `.spec.ts`, `.integration.ts`, `.d.ts`) are deliberately excluded from this counted limit via default configuration (`ignoreSuffixes`). This nuance is paramount: testing suites augment stability but do not artificially inflate the public API surface area or the cognitive burden of navigating the core module's logic.

When the structural limit is breached, an error is emitted explicitly pointing to Agent Guidance (`.agent/directives/directory-complexity.md`). This SOP explicitly instructs the architect (AI Agent or Human Engineer) to refactor the directory by extracting cohesive sub-domains and defining strict boundary contracts (`index.ts` barrel files).

## Consequences

### Positive

- **Continuous Design:** Forces developers and agents to continuously consider bounded contexts and domain-driven design at a micro-level.
- **Erosion Prevention:** Structurally prevents organic architectural erosion into monolith folders.
- **Navigability:** Keeps file trees highly navigable and self-documenting.

### Negative

- Require occasional, potentially blocking structural refactoring interruptions when a feature unexpectedly surpasses the 8-file limit.
- Necessitates slightly heavier maintenance of barrel files (`index.ts`) to ensure downstream consumer imports don't break during refactors.

## Alternatives

- **Leaving it unconstrained:** Leads to continued architectural erosion with some folders scaling past thirty files.
- **Enforcing rigid folder schemas:** Establishing strict folders like `/models`, `/services`, `/controllers` is excessively rigid, negating organic feature-driven slice layouts that group domains tightly.
- **Relying entirely on File specific rules:** These only protect individual file health, not module boundary health.

## References

- Implementation: `lib/eslint-rules/max-files-per-dir.ts`
- Directive SOP: `.agent/directives/directory-complexity.md`
