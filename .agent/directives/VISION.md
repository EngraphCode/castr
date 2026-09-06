# Vision: Castr and the Practice

**Amended: 2026-09-06.** This document expresses the owner-ratified two-product
direction and application-contract charter. The universal-schema-conversion
framing and former progress checkmarks are superseded. Strictness, semantic
preservation, deterministic output and the core/companion boundary are retained.

## A shared principle

A claim is only as strong as the evidence that proves its stated boundary.
[Verified-claims engineering](../practice-core/decision-records/PDR-135-verified-claims-engineering.md)
applies to both products: the compiler must prove preservation, and the Practice
must prove that its operating mechanisms produce their claimed outcomes.
A working mechanism, an adopted design and a completed programme are different
claims.

This umbrella names both products. The Castr vision follows below; the
[Practice vision](PRACTICE-VISION.md) owns the second product's beneficiaries,
impact and fitness frame. Current delivery observations belong in the
[Practice bridge](../practice-index.md), not in permanent vision tables.

## Castr: application-value and interaction contracts

**Castr compiles application value and interaction contracts between compatible
representations without silently changing their meaning.**

Its beneficiaries are schema-tooling consumers, SDK authors, API authors and
integration engineers who need dependable transformation, meaningful diagnostics
and proofs they can inspect. Success means they can select a declared source
grammar and target profile and trust the complete result, rather than discovering
semantic loss in production.

Castr owns two distinct kinds of semantic artifact:

- **Application-value contracts:** what inputs are accepted, what successful
  values are produced and what ordered processing relates them.
- **Software-interaction contracts:** operations, parameters, responses, security,
  protocol context and their relationships to value contracts.

The target public model has versioned, discriminated
`CastrValueContractDocument | CastrInteractionContractDocument` roots replacing
`CastrDocument` in one deliberate migration. These are the ratified target
contract, not a claim that the existing public API has already migrated.

Five facets remain distinct persisted semantics: **accepted-input,
produced-output, ordered-processing, annotation and interaction**. Defaults,
coercion, stripping, retention and refinement cannot be flattened into a single
validation schema. Source syntax and renderer fragments are not substitutes for
these semantics.

## Preservation and admission

The canonical IR is the source of truth after parsing. Writers consume the
semantic model, never discarded source documents. The IR serves the admitted
application-contract domain, rather than claiming to encode every feature of
every language.

Each advertised source grammar is bounded and versioned. Every valid construct
inside it must be parsed completely; unsupported source syntax fails at the
boundary. For an admitted contract and selected target profile:

- exact native or behaviourally proven encoded output must preserve every
  declared channel;
- genuinely impossible mappings reject atomically;
- separately named, caller-authorised projections may report a complete
  semantic delta, but do not earn an exact/lossless certificate;
- unimplemented obligations block support and release claims.

Same-family extensions may travel in typed opaque carriers with key safety and
stable provenance. Opaque preservation does not imply that an unaware target
executes their meaning. There is no generic foreign-artifact bag.

Graph semantics such as RDF, SHACL and JSON-LD lie outside Castr's domain.
Any future crossing requires an explicit public, versioned application-value
projection. The existence or naming of a separate graph product is not decided
by this vision.

## Representations and product surfaces

OpenAPI, JSON Schema and bounded Zod source are representation families with
different semantic roles and directed edges. Naming a family does not claim
universal coverage, symmetry or equivalence between its value and interaction
artifacts. Swagger 2 ingress is rejected under the adopted target direction;
a legacy upgrade shim is not a new support promise.

TypeScript generation selects an explicit structural facet. A type declaration
cannot certify all runtime assertions or processing. MCP tool generation is an
interaction projection, not a lossless representation of an entire API document.

The long-term surface direction distinguishes **doctor, upgrade, transform,
validate and check** by the consumer task they perform. This is a direction for
future API design, not a list of implemented commands. Same-format operations
serve canonicalisation and declared migration, with deterministic output and
semantic preservation under the chosen profile.

## Core, companions and adoption

The `lib` / `@engraph/castr` workspace owns loading, parsers, canonical IR and
its runtime validation, writers and consumption metadata. Transport, framework
binding, runtime handlers and code-first authoring integrations belong in
companion workspaces that consume the core through public boundaries.
[ADR-043](../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)
owns that boundary.

Adoption progresses through demonstrable consumer outcomes: replace an adapter
boundary, prove the wider OpenAPI-stack integration, and only then establish a
distinct code-first generation capability. Typed fetch helpers, framework
handlers, tRPC-style ingestion and reference implementations remain companion
directions. They do not silently widen the core-format contract.

## Headline measurement: preservation coverage

**Preservation coverage** is adopted as Castr's headline metric, per declared
source → target profile. Its denominator is the complete, version-pinned set of
admitted transformation obligations for that profile; its numerator is the set
whose required channels have independent, passing preservation proofs on the
same integrated artifact. A source feature, nested position and selected facet
may produce different obligations.

The support-contract inventory owns the denominator and the semantic proof
harness owns discharged obligations. The combined proof estate computes the
metric and binds it to the tested revision, versions and profile. A governed
projection has its own stated relation and certificate; it cannot be counted as
exact preservation.

No percentage is published before those instruments and their complete
inventory exist. Counts of commits, green tests or completed plan rows are not
substitutes. Current evidence and outstanding implementation are reached through
the [Practice bridge](../practice-index.md).

## Engineering requirements

Strict and complete support, fail-fast errors, type safety, deterministic output
and no silent semantic coercion remain requirements. A documentation correction
does not relax them or certify current implementation.

- [Requirements](requirements.md) defines the compiler contract and proof boundaries.
- [Identity](../IDENTITY.md) defines domain, facets and semantic policy.
- [Principles](principles.md) defines engineering standards.
- [Testing strategy](testing-strategy.md) and [definition of done](DEFINITION_OF_DONE.md)
  define evidence and verification.
