# Generator-First Mindset

Origin: Oak ADRs 029/030/031/038 (cross-host — Oak's SDK-codegen
phenotype; castr's ADRs with those numbers are unrelated decisions).
castr's phenotype is the deterministic-generation doctrine in
[`principles.md`](../directives/principles.md) §Deterministic Output and
the schema-first contract in
[`requirements.md`](../directives/requirements.md).

Every byte of generated output must be driven by its authoritative source
through the generator. In castr that means: emitted artefacts (OpenAPI
documents, Zod/TypeScript code, MCP tools, generated test suites) are
produced from the IR by writers and codegen — when output needs to
change, fix the parser/IR/writer seam and regenerate; never hand-edit a
generated artefact (the explicit prohibition is
[`never-edit-generated-files.md`](never-edit-generated-files.md)). The
generator is the single source of truth. Missing data is a generator
bug — fail fast.

When a validator drifts, tighten the reference model and rerun the
authoritative generation path before designing exception logic. The
usual fault is a boundary or model gap, not a missing special case.

## Generator output must be formatter-stable (fixpoint contract)

Any generator whose output lands in a prettier-formatted tree must emit
formatter-stable bytes: `format(generate(x)) === generate(x)`. Otherwise
pre-commit auto-format re-drifts the artefacts after every regeneration
and the drift gate refuses every subsequent push. Detection recipe: run
the generator, then `prettier --check` its OUTPUT — any diff is a future
gate refusal. The durable cure is generator-side (emit what the formatter
would emit), proven inside the generator's own tests; a content-level
workaround (e.g. avoiding the formatting-sensitive construct) is a stopgap
that recurs at the next input hitting the construct. Measured twice:
skills-adapter YAML quoting, two refused pushes (2026-07-03), and the same
quoting fixpoint refiring on a new skill description (2026-08-26).

See `.agent/directives/requirements.md` for the full schema-first policy.
