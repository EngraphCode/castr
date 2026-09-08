# RDF, JSON-LD and YAML-LD: standards and contract boundaries

**Date:** 8 September 2026  
**Status:** Source-backed research and proposed architectural requirements; not an adopted ADR or implementation claim.  
**Companion proposals:** [Semantic-graph system](semantic-graph-contract-system-future-direction-2026-08-21.md) · [Castr application-contract compiler](castr-future-direction-application-contract-compiler-2026-08-21.md)

## 1. Decision-relevant findings

RDF 1.2 makes claims and their annotations easier to represent. JSON-LD development addresses processing reliability and additional representations. YAML-LD provides a more convenient authoring format for linked data. These developments are consistent with the graph-system boundary ratified in [Castr owner ballot B-01/B-07](https://github.com/EngraphCode/castr/blob/f168c177faba0b0e512f2d40f7c9801c9a53b799/.agent/plans/proof-programme/ballot-2026-08-owner-walk.md) on 22 August 2026; they do not make graph semantics native Castr application-contract semantics. The sibling graph product's existence/name and the standards-specific implementation profiles remain proposals; this research does not authorise API changes or implementation.

The proposed response is to retain an RDF 1.1/SHACL Core initial implementation baseline, design explicit graph-profile seams for the new terms, and evaluate YAML-LD alongside JSON-LD processing. Reproducible contexts and visible treatment of conversion loss are requirements now. Standards maturity and actual dependency conformance must be recorded independently.

## 2. Standards status, checked 8 September 2026

| Specification                  | Status at this check                             | Planning consequence                                                                       |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| RDF 1.1                        | Published Recommendation baseline                | Suitable initial graph profile.                                                            |
| RDF 1.2 Concepts and Semantics | Candidate Recommendations                        | The suite is not yet a completed Recommendation; pin specifications and feature coverage.  |
| SHACL 1.2 Core                 | Working Draft                                    | Triple-term constraints and reifier shapes are experimental graph-validation capabilities. |
| SPARQL 1.2 Query               | Working Draft                                    | Track graph querying separately from parsing and validation.                               |
| JSON-LD 1.1                    | Recommendation, 16 July 2020                     | Current standardized JSON-LD baseline.                                                     |
| JSON-LD 1.2                    | Chartered work, with evolving API editor's draft | Safer processing and representation-independent processing are work in progress.           |
| YAML-LD 1.0                    | Working Draft, 26 August 2026                    | Candidate authoring carrier; qualify exact draft and processor options.                    |
| JSON-LD 1.3 and YAML-LD 1.1    | Tentative charter deliverables                   | Full RDF 1.2 compatibility is a planned subsequent track, not an existing guarantee.       |

The charter's Recommendation targets are Q4 2027 for JSON-LD 1.2 and Q1 2027 for YAML-LD 1.0. They are planning dates; tentative successors have no equivalent firm commitment. Sources: [RDF Concepts](https://www.w3.org/TR/2026/CR-rdf12-concepts-20260407/), [RDF Semantics](https://www.w3.org/TR/rdf12-semantics/), [SHACL 1.2](https://www.w3.org/TR/shacl12-core/), [SPARQL 1.2](https://www.w3.org/TR/sparql12-query/), [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/), [YAML-LD](https://www.w3.org/TR/yaml-ld-10/), [JSON-LD charter](https://www.w3.org/2026/01/json-ld-wg-charter.html), [working-group publications](https://www.w3.org/groups/wg/json-ld/publications/).

## 3. RDF 1.2 over RDF 1.1

The main data-model additions are triple terms, directional language-tagged strings, and version signalling. A triple term may occur in an object's position, including recursively within another triple term. An identified reifier links to it using `rdf:reifies`; the reifier can carry source, author, time or assessment information. Distinct reifiers can refer to the same proposition, and one reifier may refer to several propositions. Reifier identity must therefore remain independent of triple-term equality. Referencing a proposition does not assert it. [RDF 1.2 Concepts](https://www.w3.org/TR/2026/CR-rdf12-concepts-20260407/)

An illustrative Turtle document records a review's claim without asserting the underlying lesson relationship:

```turtle
VERSION "1.2"
PREFIX ex: <https://example.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

ex:claim1 rdf:reifies <<( ex:lesson42 ex:teaches ex:fractions )>> ;
          ex:source ex:review7 .
```

Adding `ex:lesson42 ex:teaches ex:fractions .` asserts that relationship in the graph. Turtle also provides shorthand for reification and annotations that assert the annotated triple. A compiler must preserve that distinction through parsing, persistence and emission. [RDF 1.2 Turtle](https://www.w3.org/TR/rdf12-turtle/)

Language direction is additional literal information, not presentation guessed from the language. Version labels include `1.2` and `1.2-basic`. Smaller changes include language-tag and string clarifications and incorporation of the `rdf:JSON` datatype previously defined by JSON-LD. [RDF 1.2 Concepts](https://www.w3.org/TR/2026/CR-rdf12-concepts-20260407/)

RDF 1.2 Basic excludes triple terms; Full includes them. Encoding between profiles is an explicit transformation requiring its own equivalence claim. Basic is not simply RDF 1.1: directional literals still need consideration. [RDF 1.2 Interoperability](https://www.w3.org/TR/rdf12-interop/)

Earlier RDF-star designs differ from current RDF 1.2; older quoted-triple syntax and subject-position assumptions must not leak into an RDF 1.2 profile. An implementation's “RDF-star” label is insufficient conformance evidence. [RDF-star Community Group report](https://www.w3.org/2021/12/rdf-star.html)

RDFC-1.0 defines canonicalization for RDF 1.1 datasets. Its availability does not establish canonical hashing for native RDF 1.2 Full or every Basic dataset. Deterministic serialization, structural dataset equality and standardized canonicalization remain different capabilities. [RDF Dataset Canonicalization 1.0](https://www.w3.org/TR/rdf-canon/)

RDF's additional mechanism does not itself assess evidence, calculate probabilities or establish trust. Those require application vocabularies and separately specified processing. Provenance can use [PROV-O](https://www.w3.org/TR/prov-o/); the generic RDF semantics leave room for such extensions. [RDF 1.2 Semantics](https://www.w3.org/TR/rdf12-semantics/)

## 4. JSON-LD: established features and planned changes

Scoped and imported contexts, protected definitions, `@json` literals and `@direction` already belong to JSON-LD 1.1. Native RDF 1.2 compatibility must be distinguished from having an existing JSON-LD direction feature. [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/)

Three development tracks matter:

| Track                                    | Evidence and maturity                                                                                                                                                                            | Proposed requirement                                                                                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detect processing loss                   | Standardized safe mode remains an open [API issue](https://github.com/w3c/json-ld-api/issues/629); `jsonld.js` already offers [safe mode](https://github.com/digitalbazaar/jsonld.js#safe-mode). | Diagnose unmapped or dropped content; qualify the exact processor and options. Safe processing does not replace validation.                                                                                                             |
| Reproducible contexts                    | Context integrity/pinning is an open [syntax proposal](https://github.com/w3c/json-ld-syntax/issues/422).                                                                                        | Use an injected resolver and a reproducibility manifest: context content/digest, requested and effective identifiers, imports, base, processing version and options. This is a proposed project policy, not settled W3C pinning syntax. |
| Common processing across representations | The [API editor's draft](https://w3c.github.io/json-ld-api/) describes processing over maps, arrays and scalar values.                                                                           | Keep JSON/YAML/CBOR parsing separate from linked-data operations and their configuration.                                                                                                                                               |

JSON-LD 1.3 is the charter's tentative full RDF 1.2 track. The separate JSON-LD-star proposal still reflects earlier RDF-star concepts: `@annotation` examples do not establish a settled current-RDF-1.2 syntax. [Charter](https://www.w3.org/2026/01/json-ld-wg-charter.html), [JSON-LD-star](https://json-ld.github.io/json-ld-star/)

**Preserving RDF does not necessarily preserve a complete JSON-LD document.** Ordinary `@index` information is not part of the RDF dataset; context choice, framing and document organisation also need a separately declared preservation scope. Property-based indexing can explicitly map an index into graph data, but that is a different contract. A bare dataset IR cannot truthfully promise unrestricted JSON-LD document round trips. [JSON-LD 1.1 indexing](https://www.w3.org/TR/json-ld11/#data-indexing)

The graph system should distinguish dataset preservation, JSON-LD processing/document information, and concrete authoring syntax. Structured document information, when promised, belongs in an explicit artifact model; raw input retained as an escape hatch is insufficient.

## 5. YAML-LD: candidate authoring format

YAML-LD 1.0 applies JSON-LD processing to YAML. It offers comments, block strings and anchors, while imposing a compatible data-model subset: YAML 1.2 or compatible later syntax; string mapping keys; finite numeric values; and no alias cycles. Date-like untagged scalars remain strings. Anchors are reuse mechanisms, not RDF identifiers; graph cycles use node identifiers. Comments and anchor arrangements need not survive semantic conversion. [YAML-LD 1.0](https://www.w3.org/TR/yaml-ld-10/)

The `extractAllScripts` option governs multi-document construction: all documents versus the first. Record the selected policy and detect unprocessed material when the application requires complete ingestion. It is not a graph-merging policy by itself. A candidate use is reviewed, human-authored vocabularies, shapes, fixtures and projection definitions. [YAML-LD 1.0](https://www.w3.org/TR/yaml-ld-10/)

Official fixtures cover processing results and failures. Admit an explicit Core profile; the draft's extended-profile material and non-normative tests are unfinished and must not be advertised as a completed conformance surface. Tests must preserve ordered `@list` values while allowing the permitted reordering of other values. [YAML-LD test suite](https://w3c.github.io/yaml-ld/tests/)

YAML-LD 1.1 is tentative RDF 1.2 work. CBOR-LD is the related binary-representation track; serialization family membership does not prove compatible versions, canonicalization or signatures. [Working-group charter](https://www.w3.org/2026/01/json-ld-wg-charter.html)

## 6. Related ecosystem by responsibility

| Responsibility                        | Standards or technology                                                                                                                                                | Architectural distinction                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Graph and dataset carriers            | [Turtle](https://www.w3.org/TR/turtle/), [N-Triples](https://www.w3.org/TR/n-triples/), [TriG](https://www.w3.org/TR/trig/), [N-Quads](https://www.w3.org/TR/n-quads/) | The latter two also carry named-graph datasets.                                                                             |
| JSON, YAML and binary representations | JSON-LD, YAML-LD, [CBOR-LD](https://www.w3.org/TR/cbor-ld/)                                                                                                            | Carrier and processing profiles; none is a complete application projection contract.                                        |
| Query and update                      | [SPARQL](https://www.w3.org/TR/sparql11-overview/)                                                                                                                     | Separate optional execution and protocol layers.                                                                            |
| Constraints                           | [SHACL](https://www.w3.org/TR/shacl/), [ShEx](https://shex.io/shex-semantics/)                                                                                         | Graph validation; ShEx 2.1 is a Community Group specification, not a W3C Recommendation.                                    |
| Vocabulary and inference              | [RDFS](https://www.w3.org/TR/rdf-schema/), [OWL 2](https://www.w3.org/TR/owl2-overview/)                                                                               | Entailment differs from conformance checking. An RDFS domain can infer class membership; it is not a SHACL validation rule. |
| Provenance and concept schemes        | [PROV-O](https://www.w3.org/TR/prov-o/), [SKOS](https://www.w3.org/TR/skos-reference/)                                                                                 | Shared vocabularies for attribution/derivation and labelled concept organisation.                                           |
| Dataset canonicalization              | [RDFC-1.0](https://www.w3.org/TR/rdf-canon/)                                                                                                                           | Equality, hashing and signing inputs within its supported model; not semantic equivalence under arbitrary entailment.       |
| JavaScript interfaces                 | [RDF/JS](https://rdf.js.org/)                                                                                                                                          | Interoperability interfaces for provider adapters; verify extension support.                                                |
| Implementation examples               | [N3.js](https://github.com/rdfjs/N3.js), [Comunica](https://comunica.dev/)                                                                                             | Parsing/writing/storage and querying examples, not evaluated selections or endorsements.                                    |
| Adjacent graph model                  | Property graphs and [ISO GQL](https://www.iso.org/standard/76120.html)                                                                                                 | A separate model and query ecosystem; conversion requires explicit semantics.                                               |

## 7. Proposed architecture and proof obligations

The graph system owns RDF terms, assertions, graph identity, graph constraints and linked-data processing. Castr owns application values and interactions. A separate integration adapter consumes a versioned projection contract covering roots, identity, predicates, multiplicity, ordering, datatypes, direction, cycles, absence, openness, entailment and unmapped content. Contexts and frames are inputs to that contract; they do not alone supply graph constraints or an application schema.

Required proof tranches for the graph work are:

1. **Profile and term preservation:** recursive triple terms only in permitted positions; distinct reifier identities; assertion membership by graph; lexical/datatype/language/direction equality; persistence and cross-carrier round trips. Include multiple reifiers per proposition and a reifier of multiple propositions.
2. **Capability honesty:** Basic/Full and dated syntax admission, legacy RDF-star separation, observable reject/transform results, canonicalization-domain checks, bounded nesting and resource failure.
3. **Linked-data processing:** official suites plus dropped-term and context-change fixtures, deterministic resolver manifests, unavailable/tampered/imported contexts, and explicit `@index`/document-preservation outcomes.
4. **YAML authoring boundary:** scalar and key rules, alias cycles and expansion limits, stream selection, ordered lists, and independent claims for data, document information and comments/layout.
5. **Cross-domain integration:** graph → application → graph where reversible; exact/widen/reject evidence elsewhere; statement assertion and annotations retained; ambiguous validation locations diagnosed. Exercise behaviour through public contracts, not configuration-table checks.

These are proposed acceptance requirements for future implementation, not assertions that tests currently exist. Castr's native JSON Schema roadmap remains independent and is not displaced by these graph profiles. Review the dated standards register before adopting or upgrading any experimental profile.
