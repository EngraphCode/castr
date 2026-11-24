## Survey of data-shape models (read 2026-11-24)

> **A reader's report, not a finding of this repository.** Commissioned on 24 November
> 2026 for the plan `.agent/plans/active/model-design.md` (M3, the survey). It is one reader's
> account of the sources it names, kept whole so that the reading can be checked. The
> seat has not yet checked its claims against the sources; what the design takes from it
> is stated, with what was checked, in the notes that cite it.

### 1. Systems that bear on the hard requirements

**Hyperjump kernel [1]**

- **(a) Node kinds:** one closed `Expression` union of 36 ops, e.g. `apply`, `dynamicApply`, `eachProperty`, `annotate`, plus two escape hatches, `predicate` and `opaque` [r].
- **(b) Names and references:** `schemas: Record<Handle, KernelSchema>`, where a Handle is the schema's canonical URI. `apply {schema: Handle}` is an edge to that entry. "Lowering doesn't make copies"; `inline` and `copyOf` appear only as the output of optimisations. `resources` maps each URI to its `dynamicAnchors` [r].
- **(c) Non-local evaluation:** `dynamicApply {anchor, fallback}`, and `eachProperty({select:{unevaluated:true}})`, which reads per-instance "marks". `kernel.reads` indexes which schemas read `evaluated` or `dynamicScope`. Static forms are optimisations that must prove themselves: "contains, dynamicApply, and opaque are never known". Copying per dynamic scope cites Attouche §8, warns of "exponentially many copies", and gives up past a budget [r].
- **(d) Two sides:** none.
- **(e) Numbers:** doubles (`range {min?: number}`) [r].
- **(f) Take:** evaluation state as a closed enum, plus an index of which schemas read it.
- **(g) Loses:** exact numbers. Closed is written as `eachProperty({except})` → `fail`, so a Zod or TypeScript writer must re-recognise the pattern.
- **(h) Wholesale cost:** keyword groups are keyed by source location, so one meaning from two formats gives two trees. No boundaries, no two sides.

**Attouche et al., POPL 2024 [2] and TCS 2025 [3]**

- **(a)** A normalised 2020-12 grammar that includes `$id`, `$dynamicRef`, `$anchor` and `$dynamicAnchor` [r].
- **(b)** Embedded resources are moved into `$defs` keyed by absolute URI; `load(absURI)` reads "an immutable store" [r].
- **(c)** The judgement is `C ⊢ J : S → (r, κ)`: a result plus the evaluated children, under a context C that is the dynamic scope [r].
  - Validation is PSPACE-complete because of `$dynamicRef`, "and not … annotation-dependent validation" [r].
  - §8 eliminates `$dynamicRef` with context-injected copies `CI(C,S)`. Their number lies between n_U!·n_f and (n_U+1)!·n_f [r].
  - Eliminating `unevaluated*` "cannot, in general, avoid an exponential increase" [r, abstract].
  - Their validator passes all but 14 of 1,210 test-suite tests; the failures include "a decimal with a high precision" [r].
- **(f) Take:** (r, κ) as the semantics the model must be able to state.
- **(g) Loses:** the eliminated copies are renamed (`urn:psi_urn:truex1_…`), so reference identity is gone.
- **(h)** A semantics, not a data structure; it covers schemas only.

**Pezoa et al., 2016 [4].** A Draft-4 core with one flat `definitions` table. References are only `#JPointer`, and numbers are "any decimal number". `additionalProperties` is formalised only as `false`, and the semantics `J ⊨ S` is purely local [r].

**Witness generation, Attouche et al., VLDB 2022 [5].**

- Draft-06, plus `minContains` and `maxContains`, minus `uniqueItems`, translated into an algebra in which definitions stay named, mutually recursive variables.
- Not-elimination adds a `not_` variable for each variable, and canonicalisation brings definitions to DNF grouped by type.
- `mulOf(q)` takes "any decimal number". I found no `unevaluated*` or `$dynamicRef` in what I read [r].

**CUE [6]**

- **(a)** A `Vertex` tree (`Conjuncts`, `BaseValue`, `ClosedRecursive`) over expressions that include `Ellipsis`, `Num` and `Disjunction` [r].
- **(b)** References remain expressions inside conjuncts [r] and are resolved by unification [m].
- **(c)** Closed is a flag on the vertex, and `Ellipsis` is "a set of optional fields of a given type", which is the constrained policy [r]. The JSON Schema importer reads `unevaluatedProperties` statically; under `anyOf` it "does accept some invalid ones" [r].
- **(e)** `apd.Decimal`, arbitrary precision [r].
- **(f) Take:** closure as a fact on the node; unification merges different spellings into one value [m].
- **(g) Loses:** annotation-dependent evaluation, which it widens.

**TypeSpec [7]**

- **(a)** 23 kinds, e.g. `Model`, `Union`, `Operation` [r].
- **(b)** Object identity; `Model.name` is `""` when the model is anonymous [r].
- **(c)** Only open and constrained (`indexer`) are facts in the model. Closed is the emitter option `seal-object-schemas` [r]. No non-local evaluation.
- **(d)** A `Visibility` bitmask [r]; the per-verb request and response views are derived from it [m].
- **(e)** `NumericValue.value: Numeric` is exact; `NumericLiteral.value: number` is described as the "JavaScript numeric projection" [r].
- **(f) Take:** an exact number with a separate, named lossy projection.
- **(g) Loses:** constraints and HTTP meaning are open sets of decorator applications. 33 `TypeEmitter` methods default to `result.none()` [r], so an emitter that misses a kind compiles and emits nothing. I listed `packages/emitter-framework` but did not read it.

**Smithy [8]**

- **(a)** A closed `ShapeType` of 24 kinds, e.g. `structure`, `union`, `bigDecimal` [r].
- **(b)** Shape IDs (`ns#Name$member`); members and traits refer to shapes by ID. The semantic model is "independent of any particular serialized representation" [r]. Selectors such as `structure > member` scope where a trait may be applied [r].
- **(c)** No unknown-key policy; open content goes through `document` or `map` [m].
- **(d)** Operations have input and output structures [r]; there is no accepted/produced split per shape.
- **(e)** `NumberNode` holds a `BigDecimal value` plus `originalValue` [r].
- **(f) Take:** identity kept apart from meaning, with traits applied by ID.
- **(g) Loses:** HTTP lives in traits that "can be used by protocols" [r], not in core kinds. The later kinds `setShape`, `enumShape` and `intEnumShape` have default visitor methods that delegate to `listShape`, `stringShape` and `integerShape` [r], so adding kinds broke totality.
- **(h)** No `not`, `if` or overlapping `anyOf`.

**Zod 4 [9]**

- **(a)** 40 kinds, e.g. `object`, `pipe`, `default` [r].
- **(b)** Object identity; names exist only in registries, and `toJSONSchema` defaults to `reused:"inline"` [r].
- **(c)** `catchall?` holds all four policies: absent is stripped, `never` is closed, any other schema is open or constrained [r].
- **(d)** `optin`/`optout`. The `io` option defaults to `"output"`, and a stripped object is written closed only on output [r].
- **(e)** `number | bigint | Date` [r].
- **(f) Take:** the four policies as one field.
- **(g) Loses:** names, by default.

**Effect Schema 4 [10]**

- **(a)** 21 `_tag`s, e.g. `Objects`, `Union`, `Suspend`. Every node carries `annotations`, `checks`, `encoding` and `context` [r].
- **(c)** `onExcessProperty: "ignore" | "error"` is a parse option, and "schema annotations do not override" it [r].
- **(d)** Both sides sit on the node as `encoding: [Link, …]`, with `toType`, `toEncoded` and `flip` deriving the views [r].
- **(e)** JS number [m].
- **(f) Take:** the two sides as one node with derived views.
- **(g) Loses:** the unknown-key policy per node.

**ArkType [11]**

- **(a)** 7 root kinds (e.g. `alias`, `morph`, `intersection`) and 17 constraint kinds [r].
- **(b)** Nodes are reduced, then interned in `nodesByKey`, keyed by kind, child IDs and metadata. An alias node keeps its `reference` ("a later resolution stays a reference"); a resolved alias serialises as its target's JSON [r].
- **(c)** `undeclared: "ignore" | "reject" | "delete"` gives open, closed and stripped; `index` gives constrained [r].
- **(d)** `in` and `out`: "each morph replaced by its input/output" [r].
- **(e)** `rule: number` [r].
- **(f) Take:** reduce, then intern with metadata in the key. Equal meaning gives one node, while annotated nodes stay distinct.
- **(g) Loses:** an empty intersection throws a `Disjoint` at construction [r]; SPEC-PR-7 requires Castr to carry it.

**Compiled validators [12–15]**

- **Blaze:** 113 instructions, with paired `X`/`XEvaluate` forms and `ControlDynamicAnchorJump`. The compiler separates static from dynamic dependencies for `unevaluated*`. Values include an arbitrary-precision `Decimal` [r].
- **ajv:** `it.props` is `true`, a key set known at compile time, or a runtime variable. `$dynamicRef` supports only hash fragments, and a TODO admits failing tests. `inlineRefs` defaults to `true` [r].
- **boon:** a `SchemaIndex` arena, a runtime `Uneval` set, `DynamicRef` walking up `scope.parent`, and f64 numbers [r].
- **jsonschema-rs:** a static evaluated set plus "parts that hold under conditions" [r].

For (f) to (h): all four describe accepted values only, with no names, sides or boundaries. The thing to take is the pattern of using the static form where it can be proved and runtime marks otherwise.

### 2. One row each † [16]

None of these handles `unevaluated*` in its model, and none separates the two sides. Together they are the evidence for the shortcuts in section 3.

- **quicktype:** `TypeRef = number`, and names are attributes. It copies `unevaluatedProperties` into `additionalProperties` (I verified this) and reads `oneOf` as `anyOf`.
- **openapi-generator:** bags of boolean flags, with names as strings. `disallowAdditionalPropertiesIfNotPresent` defaults to `true`, which its own docs call "old (incorrect) behaviour". Bounds are strings.
- **Kiota:** resolves `$dynamicRef` into one class per binding (I verified this) and drops every value constraint.
- **oapi-codegen:** Go type-name strings; an absent `additionalProperties` and `false` cannot be told apart; bounds are `*float64`.
- **openapi-typescript:** no IR. `$ref` becomes an indexed-access type and is never inlined; bounds are dropped.
- **TypeBox 1.x:** a plain JSON Schema object with a hidden `~kind`; bounds are `number | bigint`.
- **Valibot:** four object variants matching the four policies, but held in closures, and no names.
- **Protobuf:** `type_name` strings; no value constraints.
- **Avro:** named types by fullname, explicit writer and reader schemas, and an exact `decimal` type.
- **GraphQL:** input and output kinds are disjoint, and input objects are closed.
- **JSON Type Definition (RFC 8927):** 8 forms, definitions only at the root, `additionalProperties: bool`.

### 3. Synthesis

**Ideas that recur where meaning survives**

1. **Keys carry the source's identity.** Hyperjump's Handle, Smithy's shape ID and Attouche's absolute URI key each definition by the identity its source gives it, with resource and anchor tables kept beside the definitions. The lossy tools have tables too, but key them by a target-language name (openapi-generator `toModelName`, oapi-codegen Go types, Kiota class names) or demote names to attributes (quicktype).
2. **Evaluation is a result plus an evaluated set, under a scope, and static forms are proven rewrites** (Attouche, Hyperjump, Blaze, jsonschema-rs). Eliminating the non-local forms is exponential in general and renames the copies [2][3].
3. **Two sides are derived views of one node** in the libraries that transform values (Effect, ArkType, Zod). The counter-pattern keeps two declared schemas with specified resolution between them (Avro's writer and reader schemas, GraphQL's input and output kinds).
4. **Exact numbers:** CUE, Smithy, TypeSpec, Blaze, Avro, and both formal treatments.

**Shortcuts that recur where meaning is lost**

- The unknown-key policy held as a boolean, as absence, or as an option outside the node (oapi-codegen, openapi-typescript, openapi-generator, TypeSpec, Effect, JSON Type Definition).
- A non-local keyword read locally or widened (quicktype, the CUE importer).
- `oneOf` read as `anyOf`.
- Inlining or renaming to make writing easier (Zod's default, ajv's `inlineRefs`, the elimination copies, openapi-generator's inline names).
- Doubles for numeric bounds.
- Meaning held in closures or in open extension sets, and visitors with default methods (TypeSpec, Smithy). The defaults are exactly what lets a writer that misses a kind compile.

**Candidate cores (evidence only, no recommendation)**

**A. Declaration graph (Smithy, TypeSpec).**

- For: identity, boundaries, exact numbers, and a closed kind enum.
- Against: no `not`, `if`, overlapping `anyOf`, `unevaluated*` or `$dynamicRef`. Constraints and HTTP sit in open trait or decorator sets, and closure is not a fact in the model. Smithy's own enum lost totality as it grew.

**B. Evaluation kernel (Hyperjump, Blaze, Attouche).**

- For: the only family that represents the dynamic scope and evaluated marks directly. References go by handle, and annotations are an op.
- Against: keyed by location, with no canonical form. The object policy and named shapes are patterns that writers must recover. It has escape hatches and no boundaries or sides.

**C. Canonical set-theoretic form (ArkType, CUE, the witness algebra).**

- For: one meaning gives one value by construction. ArkType holds all four policies and both sides, and the witness algebra keeps definitions as variables through canonicalisation.
- Against: ArkType throws on empty intersections and CUE widens `unevaluated*`. No member handles `$dynamicRef` or `unevaluated*` except by exponential elimination.

**D. Declaration table over a kernel.**

- No surveyed system implements it. Observed pieces: Hyperjump keeps `schemas` and `resources` apart from its expressions, and ArkType puts metadata in its intern key.
- Against: no system both canonicalises its kernel and keeps location-keyed identity. Wherever two spellings merge, the mapping back to each source location must be held; Hyperjump's `copyOf` exists for exactly this.

### Citations

Files were read through the GitHub contents API on the default branch. The SHAs below were recorded at the time of reading, except for Zod, Effect and jsonschema-rs, whose SHAs were recorded shortly after.

1. Hyperjump @ fc40c22092d743798ab6df15da82555a0921e358. `src/kernel/kernel.d.ts`, `src/kernel/optimizations/static-unevaluated.js`, `src/kernel/optimizations/static-dynamic-scope.js`, `src/kernel/kernel-uris.js`, under https://github.com/hyperjump-io/json-schema/blob/fc40c22092d743798ab6df15da82555a0921e358/
2. Attouche et al., POPL 2024: https://arxiv.org/pdf/2307.10034v2 (PDF pp. 21–34) and https://ar5iv.labs.arxiv.org/html/2307.10034
3. Attouche et al., TCS 2025, abstract: https://arxiv.org/abs/2503.11288v1
4. Pezoa et al., WWW 2016: https://dvrgoc.ing.uc.cl/data/json.pdf (pp. 3–5)
5. Attouche et al., VLDB 2022: https://ar5iv.labs.arxiv.org/html/2202.12849 (§§1–7.2, partial)
6. CUE @ 045f65e886dc84ea6b8a062a0ed452dbc6e4fbb8. `internal/core/adt/expr.go`, `internal/core/adt/composite.go`, `encoding/jsonschema/constraints_object.go`, under https://github.com/cue-lang/cue/blob/045f65e886dc84ea6b8a062a0ed452dbc6e4fbb8/
7. TypeSpec @ 1549a46bdb9b4f8dbaa45199807d927f66f1a423. `packages/compiler/src/core/types.ts`, `packages/json-schema/src/json-schema-emitter.ts`, `packages/http/src/metadata.ts`, `packages/asset-emitter/src/type-emitter.ts`, under https://github.com/microsoft/typespec/blob/1549a46bdb9b4f8dbaa45199807d927f66f1a423/
8. Smithy @ 5ee84f296638cde654524cac02d97699b860e332. `smithy-model/src/main/java/software/amazon/smithy/model/shapes/{ShapeType,ShapeVisitor}.java` and `.../model/node/NumberNode.java`; https://smithy.io/2.0/spec/model.html; https://smithy.io/2.0/spec/http-bindings.html
9. Zod @ d40c329910436e528d3c26cb1b9179e05abebf05 (latest release v4.6.7). `packages/zod/src/v4/core/{schemas,checks,util,to-json-schema,json-schema-processors}.ts`
10. Effect @ 296c20943b9b94b13c9925a5d43ad02cb20d1f13 (effect 4.1.5). `packages/effect/src/SchemaAST.ts`
11. ArkType @ 2062c7ca49e3ae5665d1aef4a0c0f0eb2aba1c50. `ark/schema/{shared/implement.ts, structure/structure.ts, node.ts, parse.ts, roots/alias.ts, refinements/range.ts}`
12. Blaze @ 11ab0dedff3841ffb9a4540ea6e7d1e182a720a8: `src/evaluator/include/sourcemeta/blaze/{evaluator_instruction.h, evaluator_value.h}`, `src/compiler/unevaluated.h`. sourcemeta/core @ c31b22cec7c172e9c349901262d47f75f1eeb007: `src/spec/json/include/sourcemeta/core/json_value.h`, `src/lang/numeric/include/sourcemeta/core/numeric_decimal.h`
13. ajv @ f177fe323420ccb23e1a79445fd470cbf80aee7c. `lib/vocabularies/unevaluated/unevaluatedProperties.ts`, `lib/vocabularies/dynamic/dynamicRef.ts`, `lib/core.ts`
14. boon @ e27e4456905de00f13e912a4bd80bac55b99c10c. `src/lib.rs`, `src/validator.rs`, `Cargo.toml`
15. jsonschema-rs @ b3c57348ef6cb1d76412c49252db2d5c58bb1f4c. `crates/jsonschema/src/keywords/{unevaluated_properties.rs, ref_.rs}`
16. † Sub-surveys; every claim was tagged read at a pinned raw URL:
    - quicktype: https://raw.githubusercontent.com/glideapps/quicktype/c39af7d303b025280e2668a1b2d29913093593c9/packages/quicktype-core/src/ (`Type/Type.ts`, `Type/TypeRef.ts`, `input/JSONSchemaInput.ts`, `attributes/Constraints.ts`)
    - openapi-generator: https://raw.githubusercontent.com/OpenAPITools/openapi-generator/f3d9adcffddbb456156af0871b10968205cd5498/modules/openapi-generator/src/main/java/org/openapitools/codegen/ (`CodegenModel.java`, `CodegenProperty.java`, `DefaultCodegen.java`, `CodegenConstants.java`, `utils/ModelUtils.java`)
    - Kiota: https://raw.githubusercontent.com/microsoft/kiota/ead1982df0f038a451edcdc319b5d49d56398176/src/Kiota.Builder/ (`KiotaBuilder.cs`, `CodeDOM/*`)
    - oapi-codegen: https://raw.githubusercontent.com/oapi-codegen/oapi-codegen/977b0d44e128618e63b7452c9686b62cb2160a9b/pkg/codegen/schema.go; kin-openapi: https://raw.githubusercontent.com/getkin/kin-openapi/v0.153.0/openapi3/schema.go
    - openapi-typescript: https://raw.githubusercontent.com/openapi-ts/openapi-typescript/d46a319ae2efab30e135ba9b223a3cffd1a67eab/packages/openapi-typescript/src/transform/schema-object.ts
    - TypeBox: https://raw.githubusercontent.com/sinclairzx81/typebox/13586809ca01e8b003bc2481c61b0d9f9553b1c8/src/
    - Valibot: https://raw.githubusercontent.com/fabian-hiller/valibot/40fae9405d79ca477fdaade624600a567940dcbf/library/src/
    - Protobuf: https://raw.githubusercontent.com/protocolbuffers/protobuf/c8638469e77dfb200f54c70de822186c081169d0/src/google/protobuf/descriptor.proto
    - Avro: https://avro.apache.org/docs/1.12.0/specification/
    - GraphQL: https://spec.graphql.org/September2026/
    - JSON Type Definition: https://www.rfc-editor.org/rfc/rfc8927.txt
