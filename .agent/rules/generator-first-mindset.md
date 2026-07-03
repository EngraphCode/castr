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
generated artefact. The generator is the single source of truth. Missing
data is a generator bug — fail fast.

When a validator drifts, tighten the reference model and rerun the
authoritative generation path before designing exception logic. The
usual fault is a boundary or model gap, not a missing special case.

See `.agent/directives/requirements.md` for the full schema-first policy.
