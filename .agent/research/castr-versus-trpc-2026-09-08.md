# Castr and tRPC: responsibilities, guarantees and interoperability

**Date:** 8 September 2026  
**Inquiry:** castr-trpc-2026-09-08, revision 1  
**Status:** Provisional — architectural comparison supported by current source and official documentation; no local runtime or conformance suite executed.  
**Repository edition:** Publication adaptation of inquiry revision 1. Technical findings retain their original source revisions and review date.
**Purpose:** Help readers distinguish substitution, useful composition and unnecessary duplication, while keeping Castr’s implemented state separate from its intended application-contract architecture.

## 1. Main finding

Castr and tRPC share a concern with application contracts, but place their centre of gravity in different places.

**Castr compiles representations of contracts. tRPC defines and executes application procedures and derives a convenient typed calling interface from them.** Their overlap includes schemas, types, API descriptions and developer tooling. Their responsibilities diverge around runtime execution, cross-format fidelity and the authority of independently usable contract artefacts.

This distinction has a material current qualification: **tRPC now has an official OpenAPI integration in alpha.** Describing it as unable to publish OpenAPI, or as dependent solely on historical community integrations, would be wrong. Conversely, Castr’s broader semantic ambitions are not evidence that its current transformations already satisfy them. [tRPC OpenAPI documentation](https://trpc.io/docs/openapi); [Castr current README](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/README.md).

For a TypeScript application whose clients and server evolve together, tRPC may satisfy the entire need without Castr. Where contracts must be imported, preserved, inspected, persisted and emitted in several representations, Castr has a separate role. Combining them is worthwhile only at a concrete contract boundary.

## 2. Evidence and scope

The comparison uses:

| Source                   | Exact scope                                                                                                                                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Castr                    | Main at `6c3b18f0e97d4d93eca14ab67c2b0c79bc304119`: README, package exports, IR model, relevant parser/writer source, accepted ADR-043, active correction commission and code-first companion plan.                                           |
| tRPC                     | Current 11.x official documentation; upstream main at `66d054454a3339dd8421da9dcf0648f92816f704`, including OpenAPI generator source and committed fixtures. Upstream main evidence is not a certification of a particular installed release. |
| Castr direction          | User-supplied _Castr future direction: an application-contract compiler_, 21 August 2026; SHA-256 `1f7b0302b2f35792423c52102b9ced5494b2f93c9b4a58daf6d489237ec1892f`.                                                                         |
| Adjacent graph direction | User-supplied _Future direction for the semantic-graph contract system_, 21 August 2026; SHA-256 `d6b3d42dc7128668a0b8f80ff44f76910cd0651778f3429f086a2c9db775dc14`.                                                                          |
| OCE methods              | Engraph default branch at `3864af2253a1a00feb4850a7594bee18dc4072d0`. The old repository address resolves to `EngraphCode/open-curriculum-ecosystem`.                                                                                         |

The two August direction documents were supplied as background and are not reproduced here. Their hashes identify the sources but do not provide access to them. Ratified requirements are separately linked to repository evidence; interpretations of the graph direction remain background context.

Current code establishes implementation facts; current accepted decisions and the September correction commission establish intended requirements. The August documents remain dated proposals in their own right. Historical notes are context rather than proof of present upstream behaviour.

The original comparison was a read-only investigation. Adding this repository edition does not approve implementation, package publication or a migration commitment. No performance, comprehensive conformance or production-readiness benchmark was run.

## 3. Comparison by responsibility

| Dimension                    | Castr                                                                                                                    | tRPC                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary object               | Contract documents and a canonical intermediate representation.                                                          | Routers containing executable queries, mutations and subscriptions.                                                                                              |
| Authoritative starting point | A supported source contract; after parsing, IR is intended to carry its meaning.                                         | Procedure definitions, their validators, resolver code and router types.                                                                                         |
| Main operation               | Parse, analyse, persist and emit contract representations.                                                               | Validate and dispatch a call, execute middleware/resolvers, transport results and support typed clients.                                                         |
| TypeScript safety            | Generated types/schemas and typed compiler APIs; generated code must itself be compiled and exercised.                   | Inference from the server router into the client interface; core typed-client flow needs no separate code-generation stage.                                      |
| Runtime validation           | Generates validators and includes specific validation utilities; applications still have to use the relevant boundaries. | Runs supplied input/output validators. Output validation is an explicit choice, distinct from inferred return types.                                             |
| Zod relationship             | Analyses supported Zod source and generates Zod; source parsing is not arbitrary runtime execution.                      | Consumes executable validators, including Zod and Standard Schema implementations.                                                                               |
| HTTP/client execution        | Applications or companion workspaces compose transport, clients and handlers.                                            | An implemented runtime concern through adapters and client links.                                                                                                |
| API publication              | OpenAPI writing and MCP projection are existing compiler surfaces, with fidelity work outstanding.                       | Official OpenAPI 3.1 export is now available in alpha, with documented constraints.                                                                              |
| Portability                  | Intended semantic preservation across admitted formats and explicit target capability decisions.                         | Particularly direct TypeScript client/server integration; other consumers can use the HTTP protocol or generated OpenAPI clients with appropriate serialization. |
| Long-term proof obligation   | Preservation through parse, IR persistence, writing and actual target behaviour.                                         | Correct application execution, validation, transport and client/server type relationships; application compatibility still needs its own proof.                  |
| Current adoption state       | README states no current consumers, local-checkout usage and no planned published package.                               | Established runtime product; its OpenAPI alpha must be assessed separately from the mature core.                                                                 |

Sources: [Castr public exports](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/index.ts), [package export map](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/package.json), [ADR-043](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md), [tRPC introduction](https://trpc.io/docs), [validators](https://trpc.io/docs/server/validators), [HTTP protocol](https://trpc.io/docs/rpc).

There is no general “more type-safe” winner. Static assignability, runtime acceptance, output transformation, wire representation and compatibility between deployed versions are different properties.

## 4. The critical semantic distinction

Consider an application that accepts a string, trims it, validates it, converts it to an internal identifier, queries a service and returns a public response.

Several contracts exist:

1. The value the caller may supply.
2. The value the resolver receives after input processing.
3. The value the resolver returns.
4. The value produced by output validation or transformation.
5. The bytes actually sent after serialization and envelope construction.

tRPC can execute this chain. Its validators can distinguish input and output types. But the existence of inferred TypeScript types does not make every transformation or constraint available as a portable declarative description. [tRPC validators](https://trpc.io/docs/server/validators).

The August Castr proposal makes accepted input, produced output and ordered processing separate semantic facets. The current September correction commission requires those facets and distinct value/interaction roots, but implementation remains outstanding. Today’s `CastrDocument` is still shaped around OpenAPI fields. [Current IR document model](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/schema-processing/ir/models/schema-document.ts); [approved correction commission](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/.agent/plans/active/castr-documentation-and-fidelity-correction.md).

That gives Castr a demanding, useful problem: preserve each representable distinction, identify a genuinely inexpressible target mapping, and never disguise an implementation gap as semantic impossibility. A JSON Schema can describe a set of accepted values; it cannot by itself encode every effectful JavaScript transformation. Nor can a compiler reconstruct arbitrary authorisation logic from a return type.

Standard Schema already standardises validation and input/output typing, and the separate Standard JSON Schema interface provides input/output JSON Schema conversion. These are valuable ecosystem seams to evaluate before inventing a new integration API. Neither interface establishes a universal serialisable representation of arbitrary processing or supplies Castr’s entire round-trip proof system. [Standard Schema specifications](https://standardschema.dev/).

## 5. Current OpenAPI overlap: real and bounded

The official `@trpc/openapi` alpha generates OpenAPI 3.1 from router information. It supports inferred outputs, excludes subscriptions from the generated description today, and requires clients to respect tRPC query encoding and any configured data transformer. It therefore expands tRPC’s reach beyond a shared TypeScript client. It does not automatically turn a router into an independently designed resource API. [Official OpenAPI documentation](https://trpc.io/docs/openapi).

A concrete upstream example exposes the difference between type projection and validation fidelity:

| Upstream procedure constraint | Committed OpenAPI representation           |
| ----------------------------- | ------------------------------------------ |
| Email-validated string        | `type: string`, without email format       |
| Number bounded to 0–150       | `type: number`, without minimum or maximum |
| URL-validated string          | `type: string`, without URL format         |

This is the `complexTypes.refined` procedure in the [pinned router fixture](https://github.com/trpc/trpc/blob/66d054454a3339dd8421da9dcf0648f92816f704/packages/openapi/test/routers/appRouter.router.ts), compared with the same operation in the [pinned OpenAPI fixture](https://github.com/trpc/trpc/blob/66d054454a3339dd8421da9dcf0648f92816f704/packages/openapi/test/routers/appRouter.openapi.json). Both input and success-output schemas exhibit the simplified types. The generator’s primitive conversion and description overlay are consistent with this output. [Generator source](https://github.com/trpc/trpc/blob/66d054454a3339dd8421da9dcf0648f92816f704/packages/openapi/src/generate.ts).

**Observation:** the committed specification omits constraints present in the procedure fixture.  
**Consequence:** an age of −1 satisfies that exported numeric property but violates the authored bound. This is a reasoning consequence of inspected artefacts, not a locally executed test.  
**Limit:** it does not prove every validator constraint is lost, or that tRPC runtime validation is broken. It establishes a concrete fidelity gap in this exported view.

Passing this OpenAPI output through Castr cannot recover the omitted bounds or validation intent. Once information is absent, downstream conversion is not a reconstruction oracle. A fidelity-preserving ingestion path needs a richer authoritative source.

A separate documentation discrepancy deserves care: the pinned package README describes static analysis without executing application code, while pinned `generateOpenAPIDocument` calls `tryImportRouter` to collect runtime descriptions. Do not rely on a blanket no-execution guarantee without checking the installed version and its import path. [Package README](https://github.com/trpc/trpc/blob/66d054454a3339dd8421da9dcf0648f92816f704/packages/openapi/README.md); [generator source](https://github.com/trpc/trpc/blob/66d054454a3339dd8421da9dcf0648f92816f704/packages/openapi/src/generate.ts); [schema extraction source](https://github.com/trpc/trpc/blob/66d054454a3339dd8421da9dcf0648f92816f704/packages/openapi/src/schemaExtraction.ts). No application code was executed in this investigation.

Castr’s old [`trpc-to-openapi` research](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/.agent/research/trpc-to-openapi/notes.md) concerns a different integration with explicit route metadata and HTTP adapters. Its unpinned historical limitations must not be attributed to current tRPC or the new official exporter.

## 6. Castr’s current limitations also matter

The current public package exposes OpenAPI-driven generation, IR operations, OpenAPI writing, Zod parsing and MCP-related helpers. Standalone JSON Schema parser and writer implementations exist, but their functions are not currently exposed through the package root or declared subpaths. This is more capability than “no JSON Schema”, and less than a complete supported public workflow. [Exports](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/index.ts); [package manifest](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/package.json); [JSON Schema parser](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/schema-processing/parsers/json-schema/index.ts); [document writer](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/schema-processing/writers/json-schema/json-schema-writer.document.ts).

One source-level counterexample prevents treating completeness as already established: the JSON Schema core parser’s early `$ref` return does not parse its sibling keywords. The correction commission explicitly includes dialect and reference-sibling repairs. [Parser source](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/schema-processing/parsers/json-schema/json-schema-parser.core.ts); [correction commission](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/.agent/plans/active/castr-documentation-and-fidelity-correction.md).

Castr uses AJV in particular validation paths, including OpenAPI preflight and MCP payload validation. That is relevant implementation evidence, but does not prove complete JSON Schema translation. [Preflight validator](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/shared/doctor/preflight-validator.ts); [MCP validator](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/lib/src/validation/mcp-type-guards.ts).

The fair distinction is therefore **Castr’s explicit fidelity obligation versus tRPC’s primary execution and inference obligation**, with observed implementation scope recorded for both. Castr’s intended projects establish its scope; the outstanding question is whether the implementation delivers its required correctness and usability.

## 7. When substitution or composition makes sense

| Actual need                                                                                                   | Assessment                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A TypeScript product with controlled clients, procedural operations and no material cross-format requirements | tRPC can be sufficient. A separate compiler adds value only if a real contract transformation or inspection need exists.                                            |
| Consuming an independently owned OpenAPI contract and generating validators/metadata                          | This matches Castr’s compiler role. Rewriting that external contract as a tRPC router would not itself solve ingestion or fidelity.                                 |
| Publishing a tRPC application to other languages                                                              | Evaluate the official exporter and its client requirements first. Explicit constraints, output fidelity and protocol ergonomics determine whether it is sufficient. |
| Reusing value contracts across API operations, tools, configuration or other application boundaries           | Castr’s intended value-contract architecture is relevant. tRPC may remain one consumer of generated validators.                                                     |
| Serving calls, managing request context, middleware, subscriptions and client query state                     | Use an application runtime such as tRPC. Those responsibilities do not follow from compiling schemas.                                                               |
| Publishing a durable public API across independent teams and release schedules                                | Evaluate the external contract and lifecycle explicitly. tRPC is not disqualified; Castr does not automatically supply compatibility governance either.             |

These are architectural inferences from the responsibilities above, not measured cost rankings.

Three possible compositions deserve different claims:

**Contract-led:** a supported source contract is compiled into validators and metadata; tRPC procedures consume the validators and supply actual business execution. Start with ordinary generated-schema consumption before introducing a dedicated Castr–tRPC package. The composed application must prove its wire behaviour.

**Procedure-led:** a companion ingestion layer combines procedure identity, explicit interaction metadata and sufficiently rich value contracts, then passes contract artefacts to Castr. Castr core should not become an interpreter for arbitrary routers, middleware and closures.

**Exporter-led:** tRPC’s official OpenAPI output is input to Castr for downstream representations. This may be useful, but it inherits every omission in the first export. It cannot be called lossless merely because the second step is faithful.

The companion distinction is already accepted Castr architecture. ADR-043 places runtime, transport and tRPC/code-first integration outside core. The future code-first plan explicitly allows tRPC or a cleaner authoring model and does not force Oak’s existing AST rewrite mechanism. [ADR-043](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md); [future plan](https://github.com/EngraphCode/castr/blob/6c3b18f0e97d4d93eca14ab67c2b0c79bc304119/.agent/plans/future/oak-code-first-openapi-generation-replacement.md).

## 8. Lifecycle, maintenance and public-contract consequences

tRPC’s direct type inference removes one synchronisation mechanism from the core TypeScript workflow. It does not require a monorepo as a matter of principle: what matters is supplying the correct router types to the client. An independently deployed old client can still disagree with a new server. A successful compilation against one revision is not a proof about every deployed revision. [tRPC introduction](https://trpc.io/docs); [FAQ on sharing backend types](https://trpc.io/docs/faq).

Castr’s explicit artefacts can support inspection, controlled publication and multiple consumers, but they introduce a generation pipeline and a conformance burden. Long-term maintenance benefits depend on accurate semantics, stable public boundaries and actual reuse. No generated artefact prevents a breaking change merely by existing.

At the wire boundary, tRPC’s GET input encoding, result envelopes and transformer conventions remain part of the contract. A schema for an internal response object is insufficient if a client receives an envelope or transformed representation. [HTTP protocol](https://trpc.io/docs/rpc). This is precisely the kind of value-versus-interaction distinction Castr must model honestly.

The relevant ecosystem choice is not “own everything or accept every dependency”. Use mature runtime and validation capabilities where they satisfy the need; own the semantic representation and conversion obligations that remain distinctive. Do not infer performance superiority from either architectural diagram.

## 9. Relationship to the graph direction

The accompanying graph proposal remains a separate boundary. RDF/SHACL concerns identified graph entities, relationships and graph constraints; tRPC can transport an application projection but does not acquire graph semantics by doing so. Castr can compile a projected application contract once identity, multiplicity, ordering and mapping have been explicitly fixed.

Consequently, introducing tRPC would not justify a universal Castr/RDF/router IR. Graph projection, application-contract compilation and procedure execution remain separable responsibilities. This is an interpretation of the two supplied direction documents, not a claim that their integration is implemented.

## 10. What would prove a useful integration

These are proposed acceptance scenarios for a future authorised integration, not tests executed here or a new delivery plan:

| Property                  | Appropriate proof                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input fidelity            | Drive the consuming boundary with valid and invalid witnesses for limits, unions, references, absent/null values and extra properties; compare acceptance with the authoritative source. |
| Processing fidelity       | Compare successful parsed values, including coercion, defaulting, stripping and transformation order. Acceptance alone is insufficient.                                                  |
| Static client correctness | Compile representative client usage against the generated or inferred public types, including intended type errors, using TypeScript.                                                    |
| Wire truth                | Exercise the real composed server/client route and compare request encoding, response envelopes, transformed values, errors and advertised schemas.                                      |
| Portable export           | Show that published constraints accept/reject discriminating values consistently; surface every intentional capability loss.                                                             |
| Version compatibility     | Exercise old/new client and server combinations against the declared support policy.                                                                                                     |
| Compiler persistence      | Remove access to original source, persist/reload IR and regenerate; compare semantic behaviour and deterministic output.                                                                 |
| Maintenance value         | Record the actual duplicate authoring removed, required adapters and ongoing regeneration burden in a representative application.                                                        |

This follows OCE’s distinction between behaviour, type correctness, structural enforcement and assurance. Vitest should constrain runtime outcomes; TypeScript should establish types; boundary tools should enforce dependencies; running-system checks should prove transport behaviour. Avoid a test that merely confirms a capability table says “supported”. [OCE testing strategy](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/3864af2253a1a00feb4850a7594bee18dc4072d0/.agent/directives/testing-strategy.md); [validation strategy](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/3864af2253a1a00feb4850a7594bee18dc4072d0/.agent/directives/validation-strategy.md).

## 11. Parallax and planning record

**Operating mode:** The original investigation applied OCE Start Right Thorough to a bounded, read-only architectural comparison; Parallax standard depth. Repository mutation/commit/CI ceremonies were not activated. Skills were read and applied through this host’s tools rather than native OCE skill commands: `execution_context.mode: emulated-reduced`. Separate evidence agents shared this model family, task context and primary-source ecosystem; they are protected-but-correlated passes, not independent experimental replication.

**Methods:** [Start Right Thorough](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/3864af2253a1a00feb4850a7594bee18dc4072d0/.agent/skills/start-right-thorough/SKILL-CANONICAL.md), [planning](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/3864af2253a1a00feb4850a7594bee18dc4072d0/.agent/skills/planning/plan/SKILL-CANONICAL.md), [Parallax](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/3864af2253a1a00feb4850a7594bee18dc4072d0/.agent/skills/cognition/parallax/SKILL-CANONICAL.md), framing, inquiry design, synthesis and audit contracts. Profiles: investigation, software engineering and digital product/service.

**Plan:** pin evidence and authority → inspect current capabilities separately → reconcile with direction and counterframes → audit claims → save the comparison. Success means a reader can distinguish current implementation, ratified requirements, proposals and unknowns, and understand where either tool or their combination is useful. Scope excludes migration implementation, a market survey and benchmarking. The budget is two protected evidence passes and one bounded adversarial review; closure requires disposition of material contradictions, not exhaustive repository review.

| Basis / method pass            | Question and scale                                               | Discriminating evidence                                                                         | Characteristic blind spot                                              |
| ------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| B1 / M1: application delivery  | One team, procedure boundary, current implementation             | Existing runtime/client/validator capability; whether a compiler removes actual duplicated work | Underweighting future external consumers                               |
| B2 / M2: semantic preservation | Individual values through IR and cross-format transformations    | Exported constraints, parsed outputs, public surfaces and fidelity defects                      | Treating an ambitious contract as a proven implementation              |
| B3 / M3: ecosystem stewardship | Independent consumers, release lifecycles, long-term maintenance | Standards-facing artefacts, transport requirements, companion ownership                         | Assuming openness or generated docs automatically creates low coupling |

Affected parties are the authoring team, compiler maintainers, runtime operators, TypeScript consumers and external-language/API consumers. Their needs cannot be reduced to one DX score.

### Material bridges and crosswalks

- **BC1, code inference → deployed reliability:** inference can catch mismatches at compilation, under the assumption that the checked contract matches the running endpoint. Version skew, unvalidated values and serialization defects break that bridge. Support is strong for the local mechanism, conditional for deployed reliability.
- **BC2, semantic preservation → lower estate maintenance:** faithful multi-target contracts may reduce duplicate authoring and drift. The bridge depends on real consumers, exact mappings and reliable generation. It remains an unmeasured maintenance hypothesis here.
- **CW1, executable procedure → declarative contract:** partial and asymmetric. Types and explicit metadata can project; arbitrary effects, authorisation and all runtime refinements do not follow from type extraction. The refinement fixture is a concrete defeater for an exact crosswalk.
- **CW2, Castr output → tRPC execution:** value schemas may be consumed directly; transport and business execution still need an explicit composition. No native general router conversion is established.

### Conflict and defeater ledger

| Apparent conclusion                                   | Evidence-led disposition                                                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| tRPC lacks official OpenAPI publication               | Corrected: official alpha now exists.                                                                           |
| Generated OpenAPI preserves the procedure contract    | Narrowed: the pinned refinement fixture loses bounds/formats.                                                   |
| Castr already implements the full August architecture | Corrected: current roots differ; September ratified requirements remain under implementation.                   |
| Castr does not support JSON Schema at all             | Corrected: implementation exists internally, with public-surface and fidelity limits.                           |
| tRPC integration belongs in Castr core                | Rejected by accepted ADR-043; companion boundary is explicit.                                                   |
| Using both is automatically the best architecture     | Rejected: a controlled TypeScript application may need only tRPC; combination needs demonstrable contract work. |

**Epistemic profile:** high confidence in the responsibility distinction and inspected API/source facts; bounded confidence in coverage of current implementations; conditional confidence in integration designs; no empirical performance or maintenance-cost estimate; no comprehensive fidelity certification.

**World-return contract:** Project maintainers own any subsequent adoption decision; an integration implementer owns its evidence. At the next actual integration evaluation, before choosing a companion design, pin the selected releases and exercise one representative operation through source → contract artefact → consumer. Require zero unexplained acceptance or parsed-output differences in that declared fixture set and correct wire envelopes/encoding. Reopen this comparison if the official exporter preserves the demonstrated constraints, Castr’s public roots/JSON Schema surface change, or an actual consumer reveals that the supposed compiler boundary adds no value. No recurring monitoring has been scheduled.

**Learning signal L1:** expected historical “no native OpenAPI” framing was defeated by current official documentation. Reusable lesson: inspect the present first-party ecosystem before comparing an owned compiler with a framework. Suggested destination: the next authorised Castr research consolidation; no skills or project instructions were changed.

**Learning signal L2:** a “completed” plan name or internal implementation directory is not proof of a usable, faithful public API. Check current exports, consuming examples and source behaviour together.

### Audit receipt

A fresh-context, correlated Parallax Audit review read this report in full and checked the pivotal tRPC exporter fixtures/import path and Castr exports, ADR and correction requirements. It found no material defect within the declared source-inspection scope. Disposition: qualified; deployed-version behaviour, full conformance and maintenance outcomes remain unverified. A documentation citation was strengthened to the pinned package README. The review adds scrutiny, not independent empirical evidence. All evidence-agent results were incorporated into the original assessment; no integration was executed. This repository edition changes audience and provenance wording only; it does not broaden the technical findings or their evidence.

## 12. Overall assessment

Castr’s application-contract direction remains coherent alongside tRPC. The strongest strategic position is a trustworthy contract compiler with clearly bounded companions. tRPC can supply procedure execution and client ergonomics; it can also make Castr unnecessary for applications that do not need substantive contract compilation.

The new official OpenAPI exporter should change any future build-versus-adopt assessment of a tRPC companion. Its concrete fidelity limits explain why Castr’s semantic goals still matter. Castr earns that distinction through demonstrated preservation and usable public interfaces, rather than a broader format list or an assumed contrast with yesterday’s tRPC.
