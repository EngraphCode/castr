---
title: Castr destination specification
id: castr-specification
version: 0.4.0
status: draft-awaiting-owner-ratification
date: 2026-09-23
owner: Jim Cresswell
approvers:
  - Jim Cresswell
  - mantagen (a human collaborator)
clause_id_scheme: >-
  SPEC-<SECTION>-<n>. Identifiers are permanent: never renumbered, never reused.
  A retired identifier is listed in the change log. Other documents cite this
  specification by clause identifier, never by section number.
change_control: >-
  Approval happens locally and only Jim Cresswell or mantagen can give it
  (SPEC-CC-1 to SPEC-CC-3). No pull request body, plan, review, summary, agent
  report, precedent or silence is approval.
---

# Castr destination specification

This is the definitive statement of where Castr is going. Plans describe how to get
there; this document says where "there" is. It is the only description of Castr's
destination.

Text in quotation blocks is the owner's, verbatim, from 21 September 2026. "Must" states a
requirement. Clauses that came from review and not from the owner's own words are listed
in the [ratification checklist](#ratification-checklist).

- **SPEC-I-1 Silence is never permission.** Where this document is silent or admits two
  readings on something a piece of work depends on, that work stops, the owner is asked,
  and the answer is written here by change control before the work continues. No plan,
  review or agent widens or reinterprets a clause.

## 1. Founding principles

> From the very beginning, two core principles of Castr were and remain, and will always
> remain; we optimise for long-term architectural excellence over short-term expediency,
> always; strict, everywhere, all the time. We need those in order for something this
> complicated to last and grow for a decade or more.

- **SPEC-F-1** Long-term architectural excellence over short-term expediency, always.
- **SPEC-F-2** Strict, everywhere, all the time.

## 2. Purpose

> We want to be able to define a data shape in any one of the formats, express that shape
> consistently in multiple other formats, and validate/guarantee that shape at runtime. We
> want to be able to define an application data schema once, and have that same shape flow
> with guarantees from ingest to database to API to application server to client-side code,
> with no loss of fidelity or surety.

Castr is about application data shape:

> defined in a schema, or in TS types, or in TS runtime data structures, or in MCP tool
> schemas and definitions.

The purpose is the direction of travel. The formats Castr reads and writes are the closed
table in §6, and what Castr commits to is the capabilities in §7.

## 3. Definitions

| Term                         | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shape**                    | The meaning of an application data definition.                                                                                                                                                                                                                                                                                                                                                                                |
| **Meaning**                  | Three parts: which values are accepted and produced; what is said about them (description, title, examples, deprecation, defaults as documentation, read-only and write-only, extensions); and how they are named, identified and referred to.                                                                                                                                                                                |
| **Accepted set**             | The values a shape's validator admits.                                                                                                                                                                                                                                                                                                                                                                                        |
| **Produced set**             | The values a shape's validator returns. It differs from the accepted set where a shape has defaults or strips unknown keys. Every promise, profile decision and proof names the side it binds.                                                                                                                                                                                                                                |
| **Value**                    | A serialised value as it crosses a boundary: object, array, string, number, boolean, null. Numbers are exact: arbitrary-precision base-10 decimals, where `1.0` and `1` are one value and an integer is a number with a zero fractional part. A date, a time or a 64-bit integer is a string or number with a stated format.                                                                                                  |
| **Model**                    | Castr's format-agnostic representation of shapes and boundaries (historically "the IR"). After parsing, the model is the only source of truth.                                                                                                                                                                                                                                                                                |
| **Format**                   | A notation in which shapes are expressed, at a named version (§6).                                                                                                                                                                                                                                                                                                                                                            |
| **Expression**               | One shape written in one format.                                                                                                                                                                                                                                                                                                                                                                                              |
| **Document**                 | The unit a parser consumes and a writer produces. For JSON Schema, one schema resource with its `$schema`, `$id`, `$defs` and embedded resources. For OpenAPI, one OpenAPI document. For Zod and TypeScript, one module.                                                                                                                                                                                                      |
| **Parser**                   | Reads a document and produces the model. It interprets meaning once, so no later stage derives meaning from a format's syntax.                                                                                                                                                                                                                                                                                                |
| **Writer**                   | Renders the model as a document in one format. It reads only the model.                                                                                                                                                                                                                                                                                                                                                       |
| **Generator**                | Produces artefacts for a consumer from the model and writers: endpoint definitions, the `paths` type a client library consumes. A generator is never a format writer.                                                                                                                                                                                                                                                         |
| **Boundary**                 | A place where shapes cross between systems: an API operation, a tool definition. A boundary carries its address (path template and method), its identity (`operationId` or tool name), its slots, and for each slot what makes it addressable and interpretable: a parameter's location and serialisation rule, a body's media type, a response's status key and headers. All of it is meaning.                               |
| **Document content**         | What an OpenAPI document states about the API itself: `info`, `servers`, security schemes and requirements, tags, external documentation, links, callbacks, webhooks, specification extensions. It is meaning, carried by the model and written back by the OpenAPI writer.                                                                                                                                                   |
| **Profile**                  | Castr's own declared decisions about how formats are read and written (§5).                                                                                                                                                                                                                                                                                                                                                   |
| **Lossless**                 | No semantic information is lost. Notation may change; meaning may not.                                                                                                                                                                                                                                                                                                                                                        |
| **Located rejection**        | A refusal that names the construct, where it is in the source, the format pair, and why. It has exactly one kind: `UNEXPRESSIBLE` (the target format has no way to say the meaning; permanent) or `NOT-YET-BUILT` (Castr has not built it; a defect that names its capability). It travels as a `Result` on library surfaces.                                                                                                 |
| **Corpus**                   | The documents a capability is proved against, copied into Castr's fixtures and pinned by source commit and SHA-256.                                                                                                                                                                                                                                                                                                           |
| **Scope-and-fidelity table** | Per directed format pair, the class of every construct kind: **carried** (the target expresses it and its own checker enforces it); **carried as structure** (it appears as type or registry structure); **carried by companion** (the target cannot enforce it, and the same run emits from the same model an artefact that does, with the constraint also visible as documentation); **unexpressible** (located rejection). |
| **Advertised capability**    | A directed format pair or generator whose corpus passes §8 with no `NOT-YET-BUILT` rejection reachable. The README's capability table is generated from that fact.                                                                                                                                                                                                                                                            |
| **Landed**                   | Merged on `main` through a merge-green pull request. Landing is not delivery; delivery keeps its standing definition (a named beneficiary consumes the capability).                                                                                                                                                                                                                                                           |

## 4. Promises

- **SPEC-PR-1 Meaning is preserved.**

  > Lossless means no semantic information is lost. I don't care about preserving exact
  > format, I do care about preserving meaning.

  Anything a document states, in any of the three parts of meaning, is carried by the
  model and expressed wherever the target format can say it.

- **SPEC-PR-2 Nothing changes silently.** For every construct and every directed pair, the
  outcome is the class this document's scope-and-fidelity table names, or a located
  rejection. Castr never drops, weakens, widens, guesses or substitutes, and nothing
  leaves a writer in a state this document has not named.
- **SPEC-PR-3 A name is meaning.** A named definition stays named, is written once, and
  every use of it is written as a reference. Castr never inlines a reference to make a
  target easier to write. Where a target's identifier grammar cannot carry a source name,
  the projection from names to identifiers is one stated function, injective over one
  document, and a collision is a located rejection.
- **SPEC-PR-4 Output is deterministic.** Identical input produces byte-identical output.
- **SPEC-PR-5 Guarantees hold at runtime.** The expressions of one shape agree with each
  other and with their source (SPEC-G-4).
- **SPEC-PR-6 An incomplete capability is not advertised.** A capability is advertised,
  accepted or called done only when no `NOT-YET-BUILT` rejection is reachable from its
  corpus. A required check runs the corpora, reports the count of distinct constructs
  raising `NOT-YET-BUILT`, and fails if that count rises on `main`. That computed count is
  the whole record of unbuilt work: a known gap lives in a tested rejection, in code.
  Capability granularity is the directed pair; no construct inside an advertised pair is
  withdrawn from it.
- **SPEC-PR-7 The source's stated meaning governs.** Castr does not infer intent. A shape
  that no value can satisfy is carried faithfully and reported as a diagnostic naming its
  location; it is never repaired inside a conversion.

## 5. Profile

> We are free to make decisions about format and strictness, for instance, we can specify
> that additionalProperties is default false.

Meaning is defined by the source format's specification at its named version, except
where a profile decision below declares a different reading.

- **SPEC-P-1 Unknown keys.** An object has exactly one of four unknown-key policies:
  **closed** (an unknown key is an error), **open** (carried unconstrained), **constrained**
  (an unknown key must satisfy a stated shape), **stripped** (accepted and removed from the
  produced value). All four are meanings.
  - _Reading._ An object that does not state its policy is read as **closed**. This applies
    to every document Castr reads, whoever wrote it. A Zod `z.object()` with no catchall
    states **stripped** and is read as stripped.
  - _Writing._ Every expression Castr writes states the policy explicitly. Closure is
    written with the keyword that expresses it in the target dialect: across composition
    and references that is `unevaluatedProperties`, and a dialect that cannot close across
    composition receives a located rejection. In Zod, closed is `z.strictObject`, open is
    `z.looseObject`, constrained is `.catchall(S)`, stripped is `z.object`.
  - _Reporting._ Every object whose policy Castr supplied by this rule is listed in the
    run's report.
- **SPEC-P-2 Declarative subset.**

  > For now we only work with the declarative subset, and … Zod executable refinements and
  > transforms will be considered as a later feature if beneficial.

  A construct is in the declarative subset when its definition holds no function supplied
  by the schema's author other than the one Zod calls to resolve a reference (`z.lazy`, a
  getter in an object shape), its values are in the value domain (SPEC-P-5), and the only
  ways its produced value can differ from the accepted value are the insertion of a default
  and the removal of unknown keys from a stripped object.
  Defaults and stripped objects are in the subset and are carried with their two sides.
  Appendix A classifies Zod's constructs. Everything outside the subset receives a located
  rejection.

- **SPEC-P-3 `format` asserts.** Castr reads `format` as an assertion in every format and
  writes it as one wherever the target can assert. JSON Schema 2020-12 that Castr writes
  declares the format-assertion vocabulary.
- **SPEC-P-4 Written versions.**

  > Always write to the latest widely used format, in this case OpenAPI 3.2.0.

  Each writer emits its format at the version named in §6. A construct that version cannot
  express is a located rejection.

- **SPEC-P-5 Value domain.** (Reading confirmed by the owner, 21 September 2026.)

  > We need to be able to fully describe and carry anything that can be in a closed OpenAPI
  > specification.

  The model carries values as §3 defines them, which covers everything an OpenAPI or JSON
  Schema document can describe, with numeric bounds held exactly. A construct that
  describes a host-language object with no serialised form (a JavaScript `Date`, `bigint`,
  `Map`, `Set`, `symbol`, `undefined`) receives a located rejection.

## 6. Formats and versions

| Format           | Read                       | Written          |
| ---------------- | -------------------------- | ---------------- |
| OpenAPI          | 3.0.x, 3.1.x, 3.2.x        | 3.2.0            |
| JSON Schema      | Draft 2020-12 and Draft-07 | both, by request |
| Zod              | 4                          | 4                |
| TypeScript types | not read                   | yes              |

OpenAPI 2.0 is not read: a 2.0 document receives a located rejection naming its version.
A JSON Schema dialect change is always explicit; Castr never infers, upgrades or
downgrades a dialect. A change to this table is a change to this document.

## 7. Capabilities

Each capability names its corpus. A directed pair is advertised only after its
scope-and-fidelity table is written into this document and its corpus passes §8.

### SPEC-C-1 OpenAPI to Zod and TypeScript (first)

> We want OpenAPI -> Zod + TS in order to be able to replace existing libraries in OCE with
> Castr, the Zod + TS -> MCP is already handled in OCE and it can stay that way for now.

Corpus: the Oak API specification, pinned.

Castr produces, from a document given as a file or as a document value:

- the module of TypeScript types a typed HTTP client consumes: `paths` keyed by path
  template, every HTTP method declared, each operation with its four parameter locations,
  its request body keyed by media type, and its responses keyed by status and then media
  type; with `operations`, `components`, `webhooks` and `$defs`;
- the Zod 4 schemas, addressable by component name and by operation, response status
  and media type;
- the endpoint definitions.

A response status key is an exact code, one of the ranges `1XX` to `5XX`, or `default`.
The model records which; it never widens a code to a range, collapses a range to a code,
or treats `default` as a status, and an exact code takes precedence over a range.

Accepted when:

1. in Castr's own checks, generation from the corpus, compilation and execution of the
   output, and the proof of SPEC-G-4 all pass;
2. in the consuming workspaces, `openapi-zod-client`, the `openapi-zod-client-adapter`
   package and `openapi-typescript` are removed, no string or regular-expression rewriting
   of Castr's output remains, and their build, type-check and tests pass.

> openapi-fetch stays for now, if we add a rest client to Castr that will be a separate
> workspace and package later.

### SPEC-C-2 JSON Schema, OpenAPI and Zod in every direction (second)

> We will want JsonSchema <> OpenAPI <> Zod quickly after that to support other upcoming
> work.

C-2 is met with full JSON Schema support: every valid construct of Draft 2020-12 and
Draft-07 is carried and expressed or receives an `UNEXPRESSIBLE` rejection. A standalone
JSON Schema document is a first-class input and output through the public API and the
CLI. Every directed pair among JSON Schema 2020-12, JSON Schema Draft-07, OpenAPI and Zod
is advertised when it meets §8, with the official JSON Schema Test Suite run through
Castr's conversions and source and emitted acceptance decisions compared. Each pair
states its unit map (§3, Document) and its naming rule; names are never invented.

### Later

Capabilities for ingest, storage and client code are added here by change control when
the owner names them.

## 8. Green

> Yes, green means that, and also that all tests and all validators and all checks pass
> without exception... WITHOUT EXCEPTION.

> 'Red by design' is utterly unacceptable, that was never true, we never, for any reason,
> tolerate failing tests, checks, or validators.

> Green in Sonar means two things depending on context, in a PR it means no issues with new
> code, in terms of Castr being in an acceptable and proper state it means zero issues, so
> a PR can pass without main being green, but our spec cannot be met until main is green and
> stays green.

- **SPEC-G-1 Merge green.** A pull request merges only when every test, validator and
  check passes at its head, static analysis reports no issue in new code, and `main` has
  zero open dependency alerts. While `main` has an open dependency alert, the only pull
  requests that merge are the ones that cure alerts; those land without analysis.
- **SPEC-G-2 Destination green.** This specification is met only while `main` has zero
  open static-analysis issues of any type or severity, zero security findings awaiting
  review, and zero open dependency alerts, and stays that way.
- **SPEC-G-3 Every check, without exception.** No check is skipped, disabled, loosened,
  marked todo or expected-to-fail, filtered out, updated away, removed, renamed out of the
  aggregate gate, excluded by path, or left unwritten for an advertised capability. Every
  suppression is red: suppression comments for the linter, the compiler or the analyser, a
  rule switched off in configuration, and an issue marked accepted. Nothing is ever red by
  design. The set of checks is the continuous-integration job list and the scripts it
  calls; removing or replacing a check amends this document.
- **SPEC-G-4 Expressions agree with each other and with their source.** For every shape in
  a capability's corpus and every sampled value, these decisions are identical: an
  independent reference validator run against the source document in the source's own
  dialect (type coercion, default insertion and property removal disabled; `format`
  asserting per SPEC-P-3); the generated Zod validator; and the same reference validator
  run against any JSON Schema Castr generated. Those decisions prove the accepted side.
  The produced side is proved for every sampled value the generated Zod validator accepts:
  the value it returns equals the input with each default the source inserts added and, for
  a stripped object, each unknown key removed. A Zod `.default` inserts; a JSON Schema or
  OpenAPI `default` is an annotation (§5) and inserts nothing. The generated TypeScript
  type for a side and `z.input` or `z.output` of the generated Zod validator for that side
  are mutually assignable, checked by the compiler under `strict` in both directions.
- **SPEC-G-5 The sample is adequate.** Samples are derived from the source document. For
  every constraint a shape states, the sample holds a value that the shape decides
  differently with and without it, plus the boundary values of every bounded constraint.
  Deleting any single constraint from generated output flips at least one decision; the
  check reports constraints caught over constraints present and fails below all of them.
  The one exception is a constraint that the check shows, from the source itself, changes
  nothing when deleted: by naming the constraint that implies it (such as `minimum: 0` in
  one `allOf` branch and `minimum: 1` in another), or by showing that the shape stays
  unsatisfiable without it (SPEC-PR-7). A failed search for a distinguishing value never
  establishes the exception.
- **SPEC-G-6 Generated output is exercised.** It is compiled, loaded and executed, never
  only inspected as text.
- **SPEC-G-7 No proof is vacuous, and every proof is Castr's own.** A test that can pass
  without asserting, a check pointed at nothing, or a fixture that certifies an older
  generator is a defect in the proof. A proof that compares only Castr's outputs with one
  another proves nothing. Another library's conversion of the same input is never the
  oracle; the oracle for a format is that format's specification at its named version,
  exercised by a conforming validator.

## 9. Architecture requirements

- **SPEC-AR-1 The model is format-agnostic.**

  > We just happened to build it for OpenAPI first, and so it was overfitted to OpenAPI
  > shapes.

  The model states what shapes and boundaries mean. It contains no format's syntax, no
  format's vocabulary used as structure, and no writer's output, and it depends on no
  parser, writer or generator. Format-agnostic means no format's notation is the model's
  structure; the model carries whatever any format in §6 can mean, including resource
  identity, reference structure, and evaluation whose result depends on sibling and
  composed results.

- **SPEC-AR-2 Designed whole, built by capability.** The model's structure is designed once
  against the full declared surface of the formats in §6 and recorded in this document.
  Implementation proceeds capability by capability; what is designed and not yet built is
  a `NOT-YET-BUILT` rejection.
- **SPEC-AR-3 Semantic operations only.**

  > No string matching, only proper AST operations, no fragile regexes, I want semantic
  > understanding, not pattern matching. This is vital, otherwise we build a fragile,
  > breakable system that decreases fidelity and stability instead of creating a permanent
  > foundation for it.

  Source code is read through syntax trees and the type checker: every recognition is
  made from a resolved symbol or type, never from a node's text. Generated code is built
  as syntax-tree nodes and printed by the compiler's printer; data formats are built as
  values and serialised once at the edge. No writer assembles target syntax as text and
  no model value holds rendered output. A string whose grammar a specification defines
  (JSON Pointer, URI reference, path template, media type, status range, `format` value)
  is parsed once at the boundary by a parser for that grammar, and the result is data.

- **SPEC-AR-4 Seams follow the concepts.**

  > Compiler and generator are indeed different, schema and implementation are different.

  The model, each format's parser and writer, each generator and the command line are
  separate units, in as many workspaces and packages as make the architecture

  > more elegant, functional, maintainable… the goal is excellence.

- **SPEC-AR-5 Writers are total.** For every construct the model can hold, a writer
  expresses it in the class its table names or gives a located rejection. There is no
  default branch, fallback or silent skip.
- **SPEC-AR-6 Reading runtime data structures.** Castr may import a module the operator
  points it at and read its schema objects as data. That module is trusted code supplied
  by the operator, on the footing of a build script: never fetched, never taken from a
  document, never evaluated as a side effect of a read-only command. Reading a `z.lazy`, a
  getter in an object shape, or the value of a `.default` or `.prefault` means making the
  call through which Zod exposes it; Castr makes that call because of the construct's
  kind, and a call that throws, or that returns something other than a Zod schema where
  one is expected, is a located rejection. A runtime read cannot tell a default given as a
  function, which is outside the declarative subset, from one given as a value, so the
  technique chosen for SPEC-N-3 must tell them apart. Every other construct whose meaning
  can only be obtained by calling the author's function is outside the declarative subset
  and is rejected without the call. A Zod reader recovers each construct with its
  arguments as values, the unknown-key policy, every annotation wherever Zod stores it,
  identity and recursion, and type-level constructs the profile accepts.
- **SPEC-AR-7 The engineering standard** is test-driven development, no type-system escape
  hatches, no compatibility layers, replace and never bridge, as the repository's
  principles state them.

## 10. Home

Castr moves into the Engraph Open Curriculum Ecosystem repository as a set of workspaces,
early in the course. No Castr workspace depends on a package of that repository outside
Castr, so Castr stays extractable and publishable. This document travels with it as the
only description of the destination.

## 11. Not part of Castr for now

- Generating MCP tools from Zod and TypeScript (stays with the consumer).
- A REST client (a separate workspace and package, later, if wanted).
- Executable Zod refinements, transforms and conversions to host-language objects.
- Preserving a source document's exact notation, ordering or formatting.

Castr's existing MCP projection and Markdown writer are outside every capability. They
are unadvertised, and they are deleted in the landing that replaces the model.

## 12. Not yet specified

> Identifying the tensions properly, and coming up with an elegant solution, is something
> we need to revisit.

This list is closed at this version. A question that arises later is answered by a
change-controlled amendment. An open item is not permission: while it is open, no code
assumes an answer to it and no capability that depends on it is advertised. Deferring a
decision never defers a requirement; §9 binds the present code today.

- **SPEC-N-1** The model's concrete structure, including how it carries reference identity
  and evaluation that is not local to one node.
- **SPEC-N-2** The workspace and package seams.
- **SPEC-N-3** The technique by which Zod is read (SPEC-AR-6 states the requirement).
- **SPEC-N-4** The public surface: the entry points and their input and output types.
- **SPEC-N-5** The scope-and-fidelity tables for the pairs of SPEC-C-1.

## 13. Change control

> This work has drifted and drifted and now I think we need a destination that can only
> change with process and agreement.

> Approval happens locally, only I or mantagen can approve.

- **SPEC-CC-1** From its first ratification, this document changes only by an approved
  amendment: the version and the change log move in the same change as the text.
- **SPEC-CC-2** Approval is given locally by Jim Cresswell or mantagen, a human
  collaborator, in their own words in a working session, naming the version approved. The
  agent in that session records the approver's words verbatim, the date and the SHA-256 of
  the approved text as a row of this document's change log, in the change that sets the
  status to `ratified`. The approved text is this file's bytes above the `## Change log`
  heading as committed in that change, so the recorded hash never covers itself. An agent
  never writes an approval that was not given to it in that session.
- **SPEC-CC-3** A required check fails when this document's content does not match its
  latest approved record. While no approved record exists, it fails if the status is
  `ratified`. Merging an approved change is mechanics that any agent may
  perform; the approval is the record, never the merge.

## Appendix A. Zod constructs and the declarative subset

Verified against Zod 4.5.4 on 21 September 2026 by executing each construct.

| Construct                                                                                      | Author's code                                 | In the value domain         | Sides agree                            | Profile                                                           |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `.refine`, `.superRefine`, `.check`                                                            | yes                                           | yes                         | yes                                    | rejected                                                          |
| `.overwrite`                                                                                   | yes                                           | yes                         | no                                     | rejected                                                          |
| `.transform`, `.pipe`, `z.preprocess`, `z.codec`, `z.stringbool`                               | yes                                           | depends                     | no                                     | rejected                                                          |
| `z.coerce.*`                                                                                   | no                                            | yes, except `coerce.date`   | no (input is `unknown`)                | rejected                                                          |
| `.catch`                                                                                       | function form                                 | yes                         | no                                     | rejected                                                          |
| `.default`                                                                                     | function form                                 | yes                         | no (optional in, present out)          | accepted, two sides; the function form is rejected (SPEC-AR-6)    |
| `.prefault`                                                                                    | function form                                 | yes                         | no                                     | rejected (`NOT-YET-BUILT`)                                        |
| `.optional`, `.exactOptional`, `.nullable`, `.nullish`                                         | no                                            | yes, as a property of a key | yes                                    | accepted                                                          |
| `.readonly`                                                                                    | no                                            | yes                         | yes in types; output frozen at runtime | accepted                                                          |
| `.brand`                                                                                       | no                                            | yes                         | type-level only                        | rejected (`NOT-YET-BUILT`)                                        |
| `z.lazy`, a getter in an object shape                                                          | the getter Zod calls to resolve the reference | yes                         | yes                                    | accepted: Zod's reference, read by calling the getter (SPEC-AR-6) |
| `z.custom`, `z.instanceof`                                                                     | yes                                           | no                          | yes                                    | rejected                                                          |
| `z.date`, `z.bigint`, `z.map`, `z.set`, `z.undefined`, `z.void`, `z.symbol`, `z.nan`, `z.file` | no                                            | no                          | yes                                    | rejected (SPEC-P-5)                                               |
| `z.never`, `z.unknown`, `z.any`                                                                | no                                            | yes                         | yes                                    | accepted; the last two state "any value"                          |
| `z.templateLiteral`                                                                            | no                                            | yes                         | yes                                    | accepted                                                          |
| `z.email`, `z.uuid`, `z.iso.*` and the other string formats                                    | no                                            | yes                         | yes                                    | accepted (SPEC-P-3)                                               |
| `.meta`, `.describe`                                                                           | no                                            | yes                         | yes                                    | accepted; annotations are meaning                                 |
| `z.strictObject`, `z.looseObject`, `.catchall`, `z.object`                                     | no                                            | yes                         | `z.object` strips                      | accepted (SPEC-P-1)                                               |

## Ratification checklist

These clauses came from review, not from the owner's own words, and are the owner's to
confirm, change or strike at ratification.

From the six reviews of 21 September 2026: SPEC-PR-3, SPEC-PR-4, SPEC-PR-7, the reporting
rule and the closure-keyword rule in SPEC-P-1, the three-part test in SPEC-P-2 and
Appendix A's "rejected (`NOT-YET-BUILT`)" rows, SPEC-G-4, SPEC-G-5, SPEC-G-6, SPEC-G-7,
the cure-only merge rule in SPEC-G-1, SPEC-AR-5, the content of the C-1 artefact list and
status-key rule, the extractability condition in §10, and SPEC-CC-3. The review record
names SPEC-G-4 to SPEC-G-7 as the reviewers' cure; whether the owner confirmed SPEC-G-4
and SPEC-G-6 by decision card on 21 September is not recorded, so both are listed.

From the review of pull request #110 on 23 September 2026, folded into draft 0.4.0: the
reference-resolving function admitted in SPEC-P-2 and the third part of its test; the
2020-12 scope of the vocabulary sentence in SPEC-P-3; the removal of the Zod call from
SPEC-P-5; the media type in the C-1 Zod address; the produced-side proof in SPEC-G-4,
including its reading that a JSON Schema or OpenAPI `default` inserts nothing; the
exception rule in SPEC-G-5; the scope of SPEC-CC-1; the approved-text definition in
SPEC-CC-2; the no-record rule in SPEC-CC-3; the calls made by kind and the SPEC-N-3
requirement in SPEC-AR-6; and Appendix A's `.default`, `.prefault` and `z.lazy` rows.

## Change log

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Approval |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0.1.0   | 2026-09-21 | First draft from the owner's statements of 21 September 2026.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | none     |
| 0.2.0   | 2026-09-21 | Owner decisions of the same day and six reviews folded in: sides, source-anchored proof, scope-and-fidelity tables, rejection kinds, versions, home, change control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | pending  |
| 0.3.0   | 2026-09-21 | Owner decisions by card: mantagen is a human collaborator; approval is spoken locally and recorded by the agent with the content hash (SPEC-N-6 retired, answered by SPEC-CC-2); zero open dependency alerts on `main` to merge; SPEC-P-5 reading confirmed; OpenAPI 2.0 is not read.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | pending  |
| 0.3.1   | 2026-09-23 | SPEC-CC-4 retired. It read "No agent merges a change to this document" and was the drafting agent's invention, never an owner decision (owner, 23 September 2026: "you invented the need for me to merge, it was never real"). Approval is the spoken word recorded under SPEC-CC-2; merging is mechanics. SPEC-CC-3 clarified to say so.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | pending  |
| 0.4.0   | 2026-09-23 | The review of pull request #110 folded in; every changed clause is on the ratification checklist. SPEC-P-2 admits the function Zod calls to resolve a reference (`z.lazy`, a getter in an object shape) and names default insertion and unknown-key stripping as the only accepted-to-produced differences; SPEC-AR-6 makes those calls, and the call that reads a default's value, by construct kind, and requires the SPEC-N-3 technique to tell a function-form default from a value; the SPEC-P-3 vocabulary sentence is scoped to 2020-12; the wrong Zod call is removed from SPEC-P-5 (bare `z.iso.datetime()` rejects offsets that `date-time` permits); the C-1 Zod address carries the media type; the SPEC-G-4 produced side is defined, reading a JSON Schema or OpenAPI `default` as an annotation that inserts nothing; SPEC-G-5 excuses a constraint only where the source shows its deletion changes nothing; SPEC-CC-1 binds from the first ratification, SPEC-CC-2 defines the hashed text and SPEC-CC-3 its no-record state; SPEC-G-4 and SPEC-G-6 are added to the checklist. | pending  |
