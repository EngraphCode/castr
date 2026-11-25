# How others hold shapes, references and evaluation that is not local: the survey for the model's design

25 November 2026. Written by the seat (Firefly binds Tallow, Claude Fable 5.2) for step M3
of [the plan for the model's design](../plans/active/model-design.md).

**The finding.** No surveyed system holds everything the specification asks of the model,
and none can be taken whole. Four ideas recur wherever meaning survives a change of
format, and the design takes them. The shortcuts that recur wherever meaning is lost are
faults already recorded against the present model.

## The question, and what it could change

The plan asked one thing of this step: whether the core of the structure should be a
set-theoretic reading of shapes, an existing compiler's model, or neither. It allowed one
pass of readers, and said the note is written whatever the pass found.

## Method, and what was checked

Two readers, briefed apart, each read different sources. Their reports are kept whole:
[the survey of tools](../research/model-design-2026-11-24/survey-tools.md) and
[the survey of formal treatments](../research/model-design-2026-11-24/survey-formal-semantics.md).
Each marks what it read in full, what it read through a summary, and what it took from
memory.

This note takes a claim from a report only with its standing said. There are three:

- **Checked by the seat.** Run against the installed Zod 4.6.7, or read in the source at
  the commit the report cites.
- **Checked at the abstract.** The seat read the paper's abstract and it states the claim.
  The proofs were not read.
- **The reader's.** Not checked by the seat.

## What the specification asks, set against what was found

The requirements are the specification's. The last column says which surveyed systems
meet each and how the claim stands.

| The model must                                                | Sentence  | Who does it, and how the claim stands                                                                                              |
| ------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Keep a reference as a reference, written once                 | SPEC-PR-3 | Smithy, by shape identifier; Hyperjump, by handle (checked by the seat). Zod inlines a reused schema by default (the reader's).    |
| Hold evaluation that reaches past one schema object           | SPEC-P-1  | Hyperjump, Blaze and the formal semantics only. Every code generator surveyed reads it locally or drops it (the reader's).         |
| Hold the four policies for unknown keys as facts              | SPEC-P-1  | Zod, in one field (checked by the seat); ArkType (the reader's). Six others hold it as a boolean, an absence or an outside option. |
| Hold what is accepted and what is produced where they differ  | Section 3 | Effect, ArkType and Zod, as views of one node. Zod's own writer renders the two sides differently (checked by the seat).           |
| Hold numbers exactly                                          | Section 3 | CUE, Smithy, TypeSpec, Blaze, Avro. Zod, ArkType, ajv and Hyperjump use doubles (Hyperjump checked by the seat).                   |
| Hold a shape no value satisfies, and carry it                 | SPEC-PR-7 | ArkType refuses one when it is built (the reader's), so a canonical form taken from ArkType would break this.                      |
| Be the same value for one meaning written in two formats      | SPEC-AR-1 | The set-theoretic systems, by construction. Hyperjump keys by source location, so two formats give two trees (the reader's).       |
| Have no kind a writer can miss without the compiler saying so | SPEC-AR-5 | Smithy and TypeSpec lost this as they grew: later kinds fall back to a default in a visitor (the reader's).                        |

## The three families, and why none is taken whole

**A declaration graph** (Smithy, TypeSpec). Shapes are declared with an identity and refer
to each other by it. It keeps names, the boundaries between a schema and what holds it,
and exact numbers.

- It cannot say `not`, an overlapping `anyOf`, or evaluation across schema objects.
- Constraints and HTTP meaning are open sets of traits or decorators, so a writer cannot
  be proved total over them (SPEC-AR-5).
- Whether an object is closed is an option of the emitter, not a fact of the model.

**An evaluation kernel** (Hyperjump, Blaze, and the formal semantics of Attouche and
others). A schema is lowered to operations, among them one that reads what other
operations evaluated and one that follows a dynamic reference. It is the only family that
represents evaluation across schema objects directly.

- It is keyed by where a keyword sat in its source. One meaning from two formats is two
  trees (SPEC-AR-1).
- An object's policy for unknown keys is a pattern of operations a writer has to
  recognise again, not a fact.
- It has escape hatches for what it does not understand, and holds neither the two sides
  nor the boundaries of a document.

**A canonical set-theoretic form** (ArkType, CUE, the algebra used for witness
generation). Shapes are sets, and equal sets are one value.

- It gives one meaning one value by construction, which is the specification's second
  acceptance test.
- CUE's reader of JSON Schema reads `unevaluatedProperties` locally and accepts values it
  should refuse. No member holds a dynamic reference except by expanding it.
- ArkType refuses a shape no value satisfies (SPEC-PR-7).
- A complete canonical form is decidable only for regular patterns, in exponential time;
  with back-references it is not decidable. So "one value" can mean equal only with a
  pattern held as an opaque thing.

## Four ideas that recur where meaning survives

1. **A definition is keyed by the identity its source gives it.** Hyperjump's handle,
   Smithy's shape identifier and the formal semantics' absolute URI. The tools that lose
   meaning key a definition by a name made for the target language, or demote the name to
   an attribute.
2. **Evaluation is a result and the set of what was evaluated, under a scope.** A static
   form is a rewrite that has to be proved for the case in hand. Hyperjump, Blaze and
   jsonschema-rs all take the static form where they can prove it and fall back otherwise.
3. **The two sides are views of one node.** Effect, ArkType and Zod derive what is
   accepted and what is produced from one node that says how they differ.
4. **Numbers are exact.** With a separate, named projection where a target cannot hold
   them, as TypeSpec does.

## The shortcuts that recur where meaning is lost

Each of these is a fault already recorded against Castr's present model or writers.

- The policy for unknown keys held as a boolean, an absence, or an option outside the
  node.
- A keyword that evaluates across schema objects read as though it were local, or
  widened.
- `oneOf` read as `anyOf`.
- A reference inlined, or renamed, to make writing easier.
- Doubles for numeric bounds.
- Meaning held in closures or in open sets of extensions, and visitors with a default
  method. The default is exactly what lets a writer that misses a kind still compile.

## What the formal work settles

- **Holding costs nothing; removing is what costs.** `unevaluatedProperties`,
  `unevaluatedItems` and `$dynamicRef` can be held as constructs. The exponential cost
  arises only when a writer rewrites them away for a target that lacks them. That the
  elimination of annotation-dependent keywords cannot in general avoid exponential growth
  is checked at the abstract; that validation with dynamic references is PSPACE-complete,
  and that dynamic references and not annotations are the cause, is checked at the
  abstract.
- **A writer can decide from the model alone whether closing an object across a
  composition can be written by restating key names.** The reader reports a cheap,
  sufficient test (Proposition 6 of the elimination paper) for when every branch of a
  composition evaluates the same properties. Where it holds, the rewrite is linear and
  keeps references. Under `oneOf` it is quadratic and keeps them. Under `anyOf` it is
  exponential and expands them. This is the reader's, and bears directly on SPEC-P-1's
  rule for a dialect that cannot close across composition.
- **Closed, open and constrained are one thing.** In every set-theoretic treatment an
  object is its fields and a shape for the rest: nothing, anything, or a schema. Zod
  agrees at the level of its definition, checked by the seat: a strict object's rest is
  `never`, a loose object's is `unknown`, and a catchall's is the schema given.
- **Stripped is not a fourth value of that field.** It is a difference between what is
  accepted and what is produced: the accepted side is open and the produced side is
  closed. In Zod it is the absence of a rest, checked by the seat.

## Three things the design must not assume

Each was found by a reader and then checked by the seat by running Zod.

1. **A union is not free of order on the produced side.** With `A` an object of `a` and
   `AB` an object of `a` and `b`, both stripping, `union([A, AB])` on `{a, b}` produces
   `{a}`, and `union([AB, A])` produces `{a, b}`. The accepted sets are the same. So two
   unions may be merged into one value only on the accepted side, or where every branch
   produces what it accepts.
2. **A default and a prefault are different facts.** `.default(v)` returns `v` for an
   absent value without validating it. `.prefault(v)` validates it. A JSON Schema
   `default` is neither: it is an annotation and inserts nothing (SPEC-P-6).
3. **A publisher's own list of its constructs is a claim to test.** Zod's union of its
   schemas leaves out nine, its union of checks one, and its list of string formats
   nineteen of fifty. The 2020-12 vocabularies leave out four names the dialect's own
   meta-schema constrains.

## Where requirements pull against each other

These are for the design step to settle with the lenses. They are stated here so that the
design does not discover them late.

- **One value for one meaning, against keeping names.** A canonical core merges two
  definitions of equal structure. A separate layer of names over a structural core has
  precedent in one system (WebAssembly's recursion groups, with a brand where two names
  share a structure); the reader found no general result.
- **One value for one meaning, against saying where a fault is.** A located rejection
  names where a construct is in its source (section 3). Wherever two spellings become one
  value, the place each came from has to be held beside the value and not in it.
- **Writing a dynamic reference for a target that lacks one, against "written once".**
  Expanding it makes a copy for each dynamic scope.
- **A commutative union, against an order-dependent produced side.**

## What would show this finding wrong

A system that does all eight rows of the table above. Neither survey found one. A candidate would have to hold evaluation across schema objects as a
fact, key definitions by source identity, and be one value for one meaning, together: the
tool survey's fourth candidate, a table of declarations over a kernel, which no surveyed
system implements.

## What was not done

- The papers' proofs were not read by the seat.
- The accounts of ArkType, CUE, Smithy, TypeSpec and Effect are the readers', read from
  source at commits the report names; the seat checked Zod and Hyperjump only.
- The survey ran for one pass, as the plan set. Systems for describing data that are not
  compilers of JSON-shaped definitions, such as XML Schema and ASN.1, were not surveyed.
