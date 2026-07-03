# Strict Validation at External Boundaries

Operationalises [`principles.md` §Strict-By-Default and Fail-Fast](../directives/principles.md)
and [`principles.md` §Validate external boundaries](../directives/principles.md)
(Type System Discipline). Origin: Oak ADR-032, ADR-055, and ADR-153
(cross-host; castr's ADR-032 is an unrelated decision).

When data arrives from an external boundary (JSON.parse, API responses, file reads, SSE parsing, WebSocket messages), it is `unknown`. Validate immediately to the **exact known expected shape** using strict, complete validation (Zod schema, exhaustive type guard, or official SDK types). From that point on, use the validated type only. Never widen.

`as Record<string, unknown>` is widening, not narrowing — it is forbidden at boundaries just as it is everywhere else. A `typeof === 'object'` check followed by `as Record<string, unknown>` is a type assertion, not validation. It loses all type information.

The correct pattern:

1. Data arrives as `unknown`
2. Validate to the exact interface (e.g. `z.object({ result: z.object({ tools: z.array(...) }) })`)
3. Use the validated, fully-typed result from then on
4. If the shape is genuinely open-ended, that is a design problem to fix, not a type problem to work around

See [`principles.md` §Type System Discipline](../directives/principles.md)
for the full forbidden-constructs policy.
