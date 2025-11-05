# Phase 3 Plan – Typed IR & ts-morph Migration

**Status:** Draft  
**Prerequisites:** Phase 2 architecture rewrite complete (Scalar pipeline + MCP foundations stable)  
**Reference:** `.agent/reference/openapi-zod-client-emitter-migration.md`

---

## 1. Vision & Success Criteria

- Replace Handlebars string templates with a typed emitter built on **ts-morph**, using a persistent intermediate representation (IR) shared by all generators.
- Enable **bidirectional transformations** between OpenAPI 3.1 documents and the generated Zod/TypeScript artefacts without information loss.
- Guarantee compatibility with the official OpenAPI schemas in `.agent/reference/openapi_schema/` (e.g. `openapi_3_1_x_schema_with_validation.json`) through automated validation.
- Maintain current public APIs (CLI + programmatic) while allowing new outputs (e.g. reverse OpenAPI generation, alternative clients) to be layered on the IR.

---

## 2. Guiding Principles

1. **IR First:** treat the template context as a versioned IR that fully captures operations, components, naming, refs, and metadata. The ts-morph emitter consumes this IR; round-tripping OpenAPI ↔ IR ↔ OpenAPI must be possible.
2. **Schema Authority:** validate every generated or reconstructed OpenAPI document against the official JSON Schemas shipped in `.agent/reference/openapi_schema/` to ensure compliance.
3. **Deterministic Outputs:** no behavioural drift—regressions guarded by existing characterisation tests plus new IR-focused suites.
4. **Extensibility:** IR must support future generators (e.g. SDKs, docs) and the reverse pipeline (Zod → OpenAPI) described in the reference document.
5. **Incremental Delivery:** migrate file groups progressively, keeping the CLI usable between milestones.

---

## 3. Milestones (High Level)

### M1. IR Definition & Persistence (est. 1–2 weeks)

- Finalise IR schema (components, endpoints, dependency graphs, metadata) based on the reference doc.
- Serialise the IR alongside generated outputs (e.g. optional JSON artefact) to enable reverse transformations.
- Update context builders to populate the new IR without changing existing behaviour.
- Add validation tests ensuring IR can reconstruct current Handlebars outputs.

### M2. ts-morph Emitter Foundation (est. 2 weeks)

- Implement the ts-morph emitter described in the reference doc (`emitFilesTsMorph`, `printFilesToStrings`).
- Recreate current single-file and grouped output strategies using the IR + emitter.
- Establish automated formatting via Prettier pass on emitted files.
- Keep CLI/programmatic APIs feature-parity; guard with characterisation tests.

### M3. Full Migration & Decommission Handlebars (est. 1 week)

- Switch generation pipeline to the ts-morph emitter by default; retire Handlebars templates.
- Remove template assets and legacy CodeMeta-only pathways made obsolete by the IR.
- Update documentation and ADRs to reflect the new architecture.
- Measure performance/regression impacts; ensure quality gates pass.

### M4. Bidirectional & Compliance Tooling (est. 1–2 weeks, begins after M3)

- Prototype OpenAPI regeneration (`IR → OpenAPI`) and validate with official schemas.
- Introduce reverse adapters (e.g. Zod runtime → IR) using preserved metadata hooks.
- Extend CI to execute schema validation against `.agent/reference/openapi_schema/*.json`.
- Document workflows for forward/backward conversion and publish migration guidance.

---

## 4. Deliverables

- Versioned IR module with types, validators, and change management policy.
- ts-morph emitter package (supports disk + in-memory outputs).
- Automated compliance suite leveraging official OpenAPI schemas.
- Updated CLI/programmatic docs demonstrating IR inspection and future reverse-generation hook points.
- Migration notes for users (breaking changes, if any, must be clearly flagged—goal is zero).
- Archived legacy Handlebars assets and associated plans (see `.agent/plans/archive/PHASE-3-FURTHER-ENHANCEMENTS-LEGACY.md`).

---

## 5. Open Questions (track in plan updates)

- What metadata is still missing in the current context to guarantee lossless round-tripping?
- Do we need a versioned IR serialization format (e.g. JSON schema) for external tooling?
- How do we expose IR inspection programmatically (new exports vs. hidden implementation)?

---

**Next Steps:**

1. Review `.agent/reference/openapi-zod-client-emitter-migration.md` and confirm IR schema decisions.
2. Draft IR type definitions and validation helpers.
3. Schedule spike to compare ts-morph emission performance vs. current Handlebars pipeline.
