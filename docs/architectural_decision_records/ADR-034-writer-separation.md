# ADR-034: Separation of Writer Concerns (Zod vs Metadata)

**Date:** 2026-02-20
**Status:** Accepted
**Context:** Phase 3.3b (Strict Zod-Layer Transform Validation)

---

## Context

The initial Zod writer in Castr was designed to emit a combined "kitchen-sink" output file. This single output typically included:

1. Zod schema declarations (`export const UserSchema = z.object({...})`)
2. TypeScript type definitions (`export type User = z.infer<typeof UserSchema>`)
3. An `endpoints` array (runtime metadata describing methods, paths, and bound schemas)
4. An `mcpTools` array (MCP tool definitions)

While convenient for early testing, this design directly broke transform validation testing (e.g. `Zod -> IR -> Zod`).
The Zod parser is explicitly designed to only parse schema declarations into the IR. When the writer emits mixed-concern files (schema + types + metadata), the resulting Zod output cannot cleanly round-trip back into the parser without the parser needing to understand/ignore non-schema side-effects.

---

## Decision

We are formally enforcing a **Strict Writer Separation of Concerns** strategy.

The responsibilities previously bundled in a single writer will be split into distinct output generators:

1. **Zod Schema Writer**: Emits _pure_ Zod schema declarations and nothing else. This guarantees that its output is rigidly structured and directly parseable by the Zod parser.
2. **Metadata Writers (Endpoint / MCP)**: Emits runtime artifacts. These consume the IR but output structures (like objects, routes, tRPC bindings) that are external to schema validation semantics.
3. **TypeScript Type Writer**: Emits standard TypeScript interfaces or `z.infer` aliases.

_Note: As of this ADR, the architectural separation is defined, but the implementation timeline follows the priorities of Session 3.3b and Phase 4._

---

## Consequences

### Positive

- **Flawless Transform Validation:** True isolation means we can execute `OpenAPI -> IR -> Zod -> IR -> OpenAPI` natively. The parser only ingests schemas, and the schema writer only produces schemas.
- **Composability:** Downstream SDK orchestrators can independently invoke the Schema Writer to place schemas in `schemas/`, and the Endpoint Writer to place metadata in `routes/`.
- **Ecosystem Fit:** Aligns with standard project layouts where code generation tools allow output paths to be granular.

### Negative

- **Orchestration Boilerplate:** The core orchestrator must execute multiple writers to produce a final SDK, rather than relying on a single method call.
- **Import Management:** Split outputs require generating inter-file `import` statements (e.g., endpoints file must import the schemas file).

---

## References

- [ADR-031: Zod Output Strictness Strategy](./ADR-031-zod-output-strategy.md)
- [ADR-032: Zod Input Strategy (Zod 4 Only)](./ADR-032-zod-input-strategy.md)
- [ADR-027: Transform Validation with Sample Input](./ADR-027-round-trip-validation.md)
