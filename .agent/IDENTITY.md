# Castr: Identity, Semantics, and Policy

**Amended: 2026-09-06.** The ratified application-contract charter supersedes the
closed, universal schema universe and blanket strict-object-only framing.
Canonical IR, exact semantic preservation, deterministic output and explicit
diagnostics are retained. This is policy direction, not certification that
every required capability is implemented.

## 1. Identity and products

**Castr compiles application value and interaction contracts between compatible
representations without silently changing their meaning.**

Castr is a compiler, not a best-effort converter, HTTP client or opinionated SDK.
[The umbrella vision](directives/VISION.md) names both products: Castr and
[the Practice](directives/PRACTICE-VISION.md). The Practice supplies the shared
engineering knowledge and operating mechanisms; it is not another Castr format.

## 2. Semantic artifacts and facets

Application-value and software-interaction contracts are distinct artifact
kinds. The target public boundary has versioned discriminated
`CastrValueContractDocument | CastrInteractionContractDocument` roots.
The migration replaces `CastrDocument` outright; it must not invent an implicit
legacy path or fabricate interaction context for a standalone value schema.

The IR must persist five distinct facets:

| Facet              | Meaning preserved                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Accepted input     | The complete accepted-input language, including presence and any declared preprocessing/coercion.        |
| Produced output    | Successful values and structures, including retention, stripping and transformed results.                |
| Ordered processing | Ordered defaults, catches, refinements, transforms, codecs and their declared sync/async/effect posture. |
| Annotation         | Descriptions, examples, metadata and scoped extension provenance.                                        |
| Interaction        | Operations, protocol context, parameters, responses and exact security relationships.                    |

Identity, references, artifact version and absent/false/null/undefined
distinctions remain explicit. A source-chain string or renderer fragment cannot
stand in for semantic carriage.

## 3. Canonical IR and admission

After parsing, the IR is authoritative; writers do not consult the discarded
input to recover meaning. It represents the admitted application-contract
domain, not arbitrary external languages.

Every advertised source profile names its versions and bounded grammar.
All valid constructs inside that grammar must parse completely into the
appropriate artifact and facets. Invalid input, grammar-excluded syntax and
incompatible artifact kinds fail at their owning boundary with a stable,
located, actionable diagnostic. A missing implementation is planning debt,
not a newly invented grammar exclusion.

Same-family `x-*` and unknown normative extensions may be preserved in typed
opaque carriers with key safety and stable provenance. Exact opaque round-trip
carriage does not mean an unaware target applies the extension's semantics.
Foreign graph semantics are not admitted through a generic bag. Cross-domain
ingress requires a separately governed public projection.

## 4. Object semantics

Strictness means faithful enforcement of the declared contract; it does not mean
rewriting every source into a closed object. Object input acceptance, produced
output retention or stripping, catchall validation and unevaluated-property
behaviour are distinct semantics to carry and prove.

Absent, explicit `false`, explicit `true` and schema-valued
`additionalProperties` remain distinct. Source-dialect defaults must be
interpreted deliberately; missing syntax is not permission to invent openness
or closure. Passthrough, stripping and catchall constructs within an admitted
grammar cannot be flattened into one strict-object policy.

A writer may use `z.strictObject()` for a genuinely closed contract. It must not
substitute that encoding for a different accepted-input or produced-output
contract. The existing implementation's narrower support is a gap to close,
not a reason to reinstate the superseded doctrine.

## 5. Target profiles and preservation

For each admitted transformation obligation, the selected target has one
disposition: exact native output; exact, behaviourally proven encoding;
separately authorised governed projection/widening; or genuine impossibility
with atomic rejection.

Default exact conversion never silently widens or narrows semantics. A named
projection selects its facets, reports its complete delta and proves the
declared relation. It does not discharge an exact lossless certificate.
TypeScript structural output and MCP tool projection particularly require this
distinction.

Semantic preservation includes validation outcomes, successful values,
processing order, presence, wire identity, references, annotations and relevant
interaction/security channels. Concrete source syntax is outside the guarantee
unless the selected profile explicitly includes it.

## 6. Determinism and diagnostics

For a pinned profile and equivalent semantic input, output is deterministic.
Repeated supported transformations preserve the declared semantic channels;
idempotence claims name the normal form and proof domain they cover.

Errors must identify the source/profile, construct and location, the reason
processing cannot continue, and repair guidance. No swallowed errors, invented
fallback output, placeholder validators or partial declaration acceptance.

## 7. Zod and representation boundaries

The intended Zod source dialect is standard Zod `>=4.5 <5`, parsed statically
through its declared grammar; emitted code follows the supported current Zod 4
surface. This is a contract to implement and prove, not blanket parser coverage.
Runtime-evaluated source, Zod Mini and excluded syntax require explicit boundary
diagnostics. The source grammar and static-parsing decisions have their own
implementation and review obligations.

JSON Schema and OpenAPI retain their source-dialect meanings. An OpenAPI
document is an interaction artifact, not interchangeable with a standalone value
schema. Swagger 2 has no retained ingress/upgrade promise under the charter.
RDF, SHACL and JSON-LD graph semantics remain outside Castr.

## 8. Honest support

A supported profile requires parser, IR, runtime validation, writers, independent
proofs and documentation to agree end to end. Requirements can be broader than
the current implementation; completion claims cannot.

[Requirements](directives/requirements.md) owns the detailed contract.
The [Practice bridge](practice-index.md) leads to current implementation evidence,
the controlling queue and the paused additional-properties work's re-entry route.
A plan's placement or an old green check does not certify present support.
