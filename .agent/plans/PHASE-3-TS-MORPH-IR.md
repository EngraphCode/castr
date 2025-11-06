# Phase 3 Plan – Typed IR & ts-morph Migration

**Status:** Draft  
**Prerequisites:** Phase 2 architecture rewrite complete (Scalar pipeline + MCP foundations stable)  
**Reference:** `.agent/reference/openapi-zod-client-emitter-migration.md`

---

## Session Summary

| # | Session | Intent |
| --- | --- | --- |
| 3.1 | IR Schema Foundations | Define the lossless IR structure and align context builders without behavioural drift. |
| 3.2 | IR Persistence & Validation Harness | Persist IR artefacts and prove the model can reproduce current outputs. |
| 3.3 | ts-morph Emitter Skeleton | Implement the core emitter utilities and formatting pipeline. |
| 3.4 | Single-File Output Migration | Port the default template strategy to the emitter using the new IR. |
| 3.5 | Grouped Output Migration & CLI Parity | Support grouped/file strategies and keep CLI/programmatic APIs aligned. |
| 3.6 | Handlebars Decommission | Remove legacy templates, resolve CodeMeta debt, and stabilise regressions. |
| 3.7 | Bidirectional Tooling & Compliance | Implement reverse transforms and schema validation gates. |
| 3.8 | Documentation & Release Prep | Update docs, ADRs, and final validation prior to release. |

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

---

## Sessions

### Session 3.1 – IR Schema Foundations

- **Intent:** Finalise the lossless IR schema (schemas, endpoints, dependency graphs, metadata) aligned with the reference doc and adapt context builders while preserving current behaviour.
- **Acceptance Criteria:**
  - IR type definitions created with clear versioning policy.
  - Context assembly populates the IR alongside existing template context without changing output.
  - Tests cover representative specs to ensure parity with current behaviour.
- **Definition of Done:**
  - IR module exported internally with basic validators.
  - Characterisation tests pass with no output diffs.
  - Notes on remaining metadata gaps captured in open questions.
- **Validation Steps:**
  1. `pnpm test -- run src/context/template-context.test.ts`
  2. `pnpm test --filter characterisation -- context`
  3. Manual inspection of IR snapshots for a fixture spec.

### Session 3.2 – IR Persistence & Validation Harness

- **Intent:** Persist IR artefacts (e.g., optional JSON sidecar) and introduce tests that replay IR back into the current Handlebars pipeline to guarantee fidelity.
- **Acceptance Criteria:**
  - Optional IR serialisation enabled via feature flag/CLI option.
  - Replay harness proves IR → Handlebars round-trip matches current outputs.
  - Documentation covers IR storage format and stability guarantees.
- **Definition of Done:**
  - Snapshot tests exercising IR persistence added.
  - CLI/programmatic API exposes IR dump toggle.
  - Reference docs updated with storage guidance.
- **Validation Steps:**
  1. `pnpm test -- run src/context/ir-persistence.test.ts`
  2. Characterisation run with IR serialisation enabled.
  3. Compare generated IR JSON against schema review checklist.

### Session 3.3 – ts-morph Emitter Skeleton

- **Intent:** Implement the foundational emitter utilities (`emitFilesTsMorph`, `printFilesToStrings`), formatting integration, and project scaffolding.
- **Acceptance Criteria:**
  - ts-morph project creation, import management, and declaration writers implemented per reference.
  - Prettier hook executed post-emission when configured.
  - Unit tests verify writer output for simple FileUnit fixtures.
- **Definition of Done:**
  - `emit-tsmorph.ts` and related utilities committed with TSDoc.
  - Tests covering both disk and in-memory printing pass.
  - CLI pathway behind feature flag to invoke emitter.
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/tsmorph/*.test.ts`
  2. Manual comparison of emitted simple fixture vs. Handlebars output.
  3. Prettier smoke test on emitted files.

### Session 3.4 – Single-File Output Migration

- **Intent:** Port the default single-file template strategy to the ts-morph emitter using the IR.
- **Acceptance Criteria:**
  - Single-file generation (schemas-with-metadata default) uses emitter with no behavioural regressions.
  - Characterisation fixtures updated to reference new pipeline (with expected cosmetic diffs noted).
  - CLI/programmatic paths honour existing flags for single-file output.
- **Definition of Done:**
  - Feature flag switched on for single-file path in development builds.
  - All single-file tests run through ts-morph codepath.
  - Regression baseline documented.
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/single-file.test.ts`
  2. Characterisation suite for single-file generation.
  3. Manual diff review for key fixtures (e.g., Engraph spec).

### Session 3.5 – Grouped Output Migration & CLI Parity

- **Intent:** Support grouped strategies (`tag`, `method`, file grouping, common schemas) and ensure CLI/programmatic APIs remain consistent.
- **Acceptance Criteria:**
  - Grouped outputs emit correct file structures via ts-morph.
  - CLI flags (group strategy, validation helpers, schema registry) fully supported.
  - Tests cover index/common file generation and metadata imports.
- **Definition of Done:**
  - Emitter feature flag covers all strategies.
  - CLI help/README updated to note new architecture (without breaking usage).
  - Characterisation fixtures refreshed for grouped outputs.
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/grouped-generation.test.ts`
  2. `pnpm test --filter characterisation -- grouped`
  3. Manual run of CLI grouped generation end-to-end.

### Session 3.6 – Handlebars Decommission

- **Intent:** Remove legacy Handlebars templates, retire CodeMeta-only pathways, and stabilise the ts-morph codepath as default.
- **Acceptance Criteria:**
  - Handlebars code removed (or retained only for archived tests) with build passing.
  - Dead code paths (CodeMeta-specific helpers) deleted or refactored.
  - Migration notes drafted for downstream users.
- **Definition of Done:**
  - ts-morph pipeline enabled by default with feature flag removed.
  - Repository free of `.hbs` templates.
  - ADR updates captured.
- **Validation Steps:**
  1. Full `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run`
  2. `pnpm lint` to ensure no stray references.
  3. Manual audit confirming template assets removed.

### Session 3.7 – Bidirectional Tooling & Compliance

- **Intent:** Implement IR → OpenAPI regeneration, optional Zod/runtime → IR adapters, and enforce schema validation gates.
- **Acceptance Criteria:**
  - Reverse generator produces OpenAPI docs that validate against official schemas.
  - Optional runtime adapters documented (even if partial).
  - CI task added for schema validation.
- **Definition of Done:**
  - Reverse pipeline accessible via CLI/programmatic option.
  - Validation suite with official schemas integrated.
  - Characterisation test demonstrates round-trip (OpenAPI → IR → OpenAPI).
- **Validation Steps:**
  1. `pnpm test -- run src/rendering/reverse/*.test.ts`
  2. Schema validation command (AJV) over regenerated specs.
  3. Characterisation round-trip diff ensures stability.

### Session 3.8 – Documentation & Release Prep

- **Intent:** Finalise documentation, update ADRs, and prepare release notes once ts-morph migration is stable.
- **Acceptance Criteria:**
  - README/CLI docs updated to describe new architecture and IR access.
  - ADRs capturing migration decisions merged.
  - Release checklist complete with migration guidance.
- **Definition of Done:**
  - Documentation PR merged.
  - Release candidate tagged with notes.
  - Open questions triaged or closed.
- **Validation Steps:**
  1. Documentation lint/check (e.g., `pnpm lint:docs` if available).
  2. Run release dry-run script (if applicable).
  3. Stakeholder review/approval recorded.
