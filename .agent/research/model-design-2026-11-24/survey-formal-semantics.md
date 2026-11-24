## What a schema means, and how a model can hold it

> **A reader's report, not a finding of this repository.** Commissioned on 24 November
> 2026 for the plan `.agent/plans/active/model-design.md` (M3, the survey). It is one reader's
> account of the sources it names, kept whole so that the reading can be checked. The
> seat has not yet checked its claims against the sources; what the design takes from it
> is stated, with what was checked, in the notes that cite it.

The model can store `unevaluated*` and `$dynamicRef` as constructs at no size cost. The exponential lower bounds only apply when a writer translates them away for a target that lacks them. Closed, open and constrained objects fit one constructor with a "rest type". Stripped does not: it is a two-sided transformation, not a set of values.

How each claim was read: **R** = I read the extracted full text; **F** = I read it through a fetch summary; **S** = search snippet only; **M** = from memory, not read in this session. Bracketed numbers refer to the source list at the end. Nothing was written to disk.

### 1. `unevaluated*` and `$dynamicRef`

**Established**

- **Semantics** [2 §4.5, R]:
  - Validation is a judgment that returns a result and the set of children it evaluated.
  - `unevaluatedProperties: S` applies S to the children that adjacent keywords did not evaluate.
  - `additionalProperties` needs only the static names in its sibling `properties` and `patternProperties`. It "is not influenced by what is evaluated by an adjacent `$ref`".
  - This is the authors' reading of the spec, checked against the test suite. I did not read the spec's own `unevaluated*` section; I read only that failing subschemas produce no annotations [18 §7.7.1.2, F].
- **Complexity** [2, R]:
  - Annotation dependence on its own keeps validation in P.
  - `$dynamicRef` makes validation PSPACE-complete. With a bounded number of dynamic references it is in P again.
- **`unevaluated*` can be eliminated** [1, R] when the schema is closed (all references local), recursion is guarded, and there is no `$dynamicRef`. The rewrite preserves validation only (Prop. 11.3). Annotations change: `not not S` produces none (Remark 3).
- **Lower bound** [1 Thm 1, Cor 2–4, R]:
  - The schema is one `unevaluatedProperties: false` over `anyOf` of n branches, each `{required:[ai], patternProperties:{ai:true}}`.
  - Any equivalent Classical JSON Schema needs at least 2^n−1 keywords. The construction relies on overlapping patterns.
  - The same holds for `unevaluatedItems`, even with `minContains`/`maxContains`.
  - The bound counts Classical keywords. It says nothing about a model that has its own primitive.
- **Algorithm** [1 §6, R]:
  - Unnest: each anonymous uneval-subschema becomes a new `$defs` entry.
  - Compute the Evaluation Normal Form (ENF): a cover-closed `anyOf` of statically characterised branches.
  - Push S_u into each branch as `allOf[S_i, {patternProperties: exEP(S_i), additionalProperties: S_u}]`.
- **Where the cost falls** [1 §6.3–6.5, R]:
  - **Statically characterised schemas** (minEP = maxEP), including `allOf`/`$ref`/`not` chains not fed by an `anyOf`/`oneOf` whose branches evaluate different properties (Prop. 6): ENF is the identity. Elimination is linear and restates only key names or patterns. References survive; the worked example keeps `#sale` and `#car`.
  - **`oneOf`**: rewritten as m mutually exclusive `allOf[not S_j…, S_i]`. No closure step is needed, so it is about O(m²), and the `$ref`s survive.
  - **`anyOf`**: pairwise conjunctions are added. This is O(2^|S|) (Prop. 10), and references are expanded (rule 7).
  - The exact test (minEP = maxEP) is pattern-language equality, which the paper calls expensive. Prop. 6 is a cheap sufficient test.
  - `if`/`then`/`else` is not covered in what I read. The prototype rejected `dependentSchemas`.
- **Measured** [1 §7, R]:
  - 430 schemas were tested. 87% grew by less than a factor of 5, under 5% by more than 10, with outliers at 60× and 27×. Runtime was under 10 ms.
  - Equivalence was machine-confirmed for only 30 of the 60 handwritten schemas; 29 timed out at 3 hours.
- **`$dynamicRef` elimination** [2 §8, R]:
  - Static(S) makes one copy of each fragment per context, where a context is a list of resource URIs. Copies get mangled anchors.
  - That gives between n_U!·n_f and (n_U+1)!·n_f fragments, so every name is multiplied.
  - It preserves both results and annotations (Thm 12).
  - The authors say this blow-up "was to be expected", because it reduces a PSPACE-complete problem to a P one. So a polynomial-time elimination would imply P = PSPACE. [1 §8] describes the blow-up as proved.
- **Resources carry meaning** [2 §3.1, §4.6, R]:
  - The dynamic context is the sequence of resource URIs entered.
  - The formalisation flattens embedded resources into `$defs` keyed by absolute URI and keeps each resource's `$schema`.
  - It assumes URIs are already resolved. Nothing I read formalises the resolution layer itself.

**Open:** whether both features can be eliminated within a single exponential, or whether a double exponential is sometimes unavoidable [1 §8, R].

**Consequences**

- **(A)** Three spellings denote one set when the composition is statically characterised and closure covers the whole composition:
  - `unevaluatedProperties:false` over `allOf`;
  - `additionalProperties:false` beside the union of key names;
  - `z.strictObject` over the merged shape.

  `additionalProperties:false` inside a single `allOf` branch is a different, narrower set; Table 2 treats that branch as evaluating `.*`.

- **(B)** References are kept in the static class and under `oneOf`, expanded under `anyOf`, and multiplied by `$dynamicRef` elimination.
- **(C)** The Prop. 6 test can be computed from the model alone.
  - When it passes, a writer can close the object by restating key names.
  - Draft-07 can express that beside `allOf:[$ref…]`. This bears on SPEC-P-1's rule that a dialect which cannot close across composition gets a located rejection.
  - Otherwise the writer refuses, or writes the ENF union.

### 2. Set-theoretic cores

**Established**

- **Semantic subtyping** [6 §4.2–4.3, R]:
  - S ≤ T exactly when S∧¬T is empty. Types are kept in DNF over atoms per constructor, stored as BDDs.
  - Base types (singletons, maximal interval lists) have a unique representation. Constructor atoms do not, so equality is decided by an emptiness check, not by syntax.
- **Records** [6 p. 15:45, R] are quasi-constant functions `{ℓᵢ = Tᵢ, _ = d}`, where ⊥ means the field is absent:
  - open: `_ = Any|⊥`
  - closed: `_ = ⊥`
  - optional field: `T|⊥`
  - **constrained** as `_ = S|⊥` is my derivation; the paper names only open and closed.
- **Elixir** [8, F]: maps are closed unless marked with `...`. Domain keys such as `atom() => T` are always optional, and `not_set()` forbids a key.
- **CUE** [9, F]:
  - Closing a struct is "equivalent to adding `..._|_`", and `...` means `..._`. Pattern constraints are written `[p]: v`.
  - Embedding unifies "disregarding the restrictions imposed by closed structs", so closedness is not a pure lattice meet.
  - "The value of a reference is a copy", so a reference has no identity of its own.
- **JSON Schema algebra** [3 §3.5, §6.3, R]:
  - `additionalProperties: S` becomes `props(¬(r₁|…|rₘ) : S)`, using an external regex complement.
  - Conjunctions go through a "preparation" step that creates new variables and is exponential in general.
  - Satisfiability is EXPTIME-complete without `uniqueItems` (Bourhis et al.), and validation is in P (Pezoa et al.). I know both only through [3]'s related-work section; I did not read Pezoa et al. directly.
- **Stripping** is not part of the type in any of these. ArkType's `onUndeclaredKey: "delete"` [10, S] and Effect's `onExcessProperty` [12, S] are runtime policies.

**Open: fields keyed by a regex.**

- Castagna's ICFP'23 paper associates "sets of keys" with a type [7, F]; the full text returned 403.
- ECMA-262 patterns with backreferences make universality undecidable [21, S], and with it equivalence.
- [3] translated about 97% of the patterns in its corpus to standard regular expressions [R].

**Consequences**

- **(A)** Closed, open and constrained are one constructor with a rest type (⊥, ⊤ or S) in Castagna, CUE and the algebra alike. Stripped is not of that kind. Semantic equality is decidable (in exponential time) only for regular patterns, so "provably equal" can only mean equal with patterns treated as opaque atoms.
- **(B)** These cores compare by structure; names sit outside the type.
- **(C)** The rest type maps one-to-one onto `strictObject`, `looseObject` and `.catchall`, and onto `additionalProperties`. TypeScript has no exact object type; it has been requested since 2016 [22, S].

### 3. Two-sided schemas

**Established**

- **Zod** [11, F]:
  - `z.object` strips unknown keys.
  - `.default` short-circuits on `undefined` and returns the value without parsing it; the value must be assignable to the output type.
  - `.prefault` is parsed, and must be assignable to the input type.
  - `z.union` returns "the first value that validates".
  - Zod's own JSON Schema writer renders a plain `z.object` with `additionalProperties:false` in output mode and with it "not set" in input mode. It inlines reused schemas by default.
- **Effect** [12, F]:
  - The AST has `Transformation(from, to, kind)` and `PropertySignatureTransformation(fromKey, toKey, decode, encode)` over `Option`, where `none` means the key is absent.
  - `typeAST` and `encodedAST` project out each side.
- **Lenses** [14, R]: `filter p d : C|p · C\p ⇔ C|p`. The `get` direction drops the children outside p, and `put` restores them. This is stripping as a lens.

**Smallest representation (my synthesis).** Each permitted difference is fixed by data local to the node, so one node with a marker is enough, and each side is a projection (as in Effect's `typeAST`/`encodedAST` and Zod's `io`):

- **Stripped:** the produced value is the input restricted to the declared keys. The accepted side is open; the produced side is closed.
- **`.default(v)`:** the accepted side also admits an absent key; the produced side admits v, which is not validated.
- **`.prefault(v)`:** an absent key is replaced by v, which is then validated.
- **JSON Schema `default`** (SPEC-P-6): an annotation only, with no second side.

Effect stores functions for these; a declarative model does not need to.

**Pitfall (derived from two documented rules).**

- First-match union plus stripping makes the produced value depend on branch order.
- On input `{a, b}`, `union([object({a}), object({a, b})])` produces `{a}`; with the branches reversed it produces `{a, b}`.
- Set-theoretic union is commutative, but a produced-side union is not.
- I have not verified how Zod merges intersection outputs.

**Consequences**

- **(A)** Normalising unions is sound on the accepted side, or among branches whose produced side is the identity.
- **(C)** For a single-sided target, the side must be named for each expression. Zod's own writer already renders the two sides differently.

### 4. Reference identity (mostly S and M)

**Established**

- Equality of equirecursive types reduces to automaton equivalence, and subtyping is O(n²) [16, S]. Minimising the automaton gives a canonical form but merges named nodes that have equal structure (my inference; M).
- **WebAssembly GC** [15, F]:
  - Iso-recursive recursion groups are canonicalised up front, after which equivalence checks are "constant-time". Names do not matter.
  - One large recursion group makes the system behave like a nominal one.
  - Binaryen adds "brand types" when distinct types would collide in shape [15, S].
- Hash-consing shares structurally equal acyclic values and is parameterised by an equality [17, S]. Cyclic graphs need recursion-group or automaton canonicalisation first (M).
- TypeScript compares types structurally but keeps an alias symbol on each type (M).

**What "never inline a reference" costs:**

- Zod needs a getter or `z.lazy` for recursion.
- Dynamic contexts turn one name into many.
- Zod's own writer inlines reused schemas by default.

**Consequences**

- **(A) and (B)** can coexist as a canonical structural core plus a separate name layer, with a brand wherever two names share a structure. This has precedent in one system; the literature does not show it in general.
- **(C)** Writing a `$dynamicRef` as per-context copies conflicts with SPEC-PR-3's "written once".

### 5. Exact numbers

**Established**

- JSON Schema 2020-12 numbers are "arbitrary-precision, base-10 decimal", with "no distinction between integers and other numbers"; trailing zeros are insignificant [18 §4.2, F].
- CUE is exact, but a decimal literal is never `int`, even when it is integral [9, F]. That is a different notion of integer from JSON Schema's.
- The algebra uses `mulOf(q)` for any decimal q, and `notMulOf` for its negation [3, R].
- **Pitfalls:** Ajv rejects 0.3 `multipleOf` 0.1 by default [19, S]. Zod checks steps by counting decimal digits in string forms, and has had bugs at 1e-7 and 1e-10 [20, S].

**Derived (mine)**

- Decimals are closed under lcm, so `multipleOf a ∧ multipleOf b` reduces to a single decimal `multipleOf`.
- `integer ∧ exclusiveMinimum 0.5` reduces to `minimum 1`.
- An unbounded exponent is a denial-of-service risk (M).

**Consequences**

- **(A)** A canonical (coefficient, exponent) pair makes `1` and `1.0` one value.
- **(C)** TypeScript has no numeric bounds, and Zod's `multipleOf` is checked in floating point, so a decimal step is at best a declared limit.

### Findings

**Achievable together**

1. Closed, open and constrained as one value: a field map plus a rest type. Proved in [6]; precedent in [9] and [3].
2. Linear closure across statically characterised composition and across `oneOf`, with references kept. Proved in [1].
3. `unevaluated*` and `$dynamicRef` held as constructs at no cost in model size; the lower bounds apply only to writers targeting Classical JSON Schema. Proved in [1] and [2].
4. Both sides derived from one marked node. Precedent in [11] and [12]; that this is the minimal form is my derivation.

**In conflict**

1. Normalising away evaluation fed by `anyOf` versus keeping names: references get expanded. Proved in [1]. The conflict is a matter of degree, not total.
2. Eliminating `unevaluated*` versus size: Ω(2^n) from a single keyword. Proved in [1]. Whether combined elimination needs a double exponential is open.
3. Eliminating `$dynamicRef` statically versus "written once": factorial copies [2]. That a polynomial-time elimination would imply P = PSPACE is my inference from [2].
4. A complete canonical form versus decidability: exponential time for regular patterns, undecidable with backreferences. Proved in [3] and [21].
5. Commutative union versus an order-dependent produced side. Derived from [11].
6. Stripped as a set: no surveyed set-theoretic system puts it in the type. Observed in [10] and [12].

### Sources

1. Attouche, Baazizi, Colazzo, Ghelli, Klessinger, Sartiani, Scherzinger, "Elimination of annotation dependencies in validation for Modern JSON Schema", arXiv:2503.11288 (TCS) — https://arxiv.org/abs/2503.11288 (R)
2. Attouche et al., "Validation of Modern JSON Schema: Formalization and Complexity", POPL 2024 — https://arxiv.org/abs/2307.10034 , doi:10.1145/3632891 (R)
3. Attouche et al., "Witness Generation for JSON Schema", PVLDB 15 (2022) — https://www.vldb.org/pvldb/vol15/p4002-sartiani.pdf (R)
4. Pezoa, Reutter, Suárez, Ugarte, Vrgoč, "Foundations of JSON Schema", WWW 2016, pp. 263–273; and Bourhis et al., PODS 2017. Both known only through [3]'s related-work section.
5. (no entry)
6. Castagna, "Covariance and Contravariance: a fresh look at an old issue", LMCS 16(1):15, 2020 — https://arxiv.org/abs/1809.01427 (R)
7. Castagna, "Typing Records, Maps, and Structs", ICFP 2023 — https://icfp23.sigplan.org/details/icfp-2023-papers/8/Typing-Records-Maps-and-Structs (abstract only, F)
8. Elixir, "Gradual set-theoretic types" — https://elixir.hexdocs.pm/main/gradual-set-theoretic-types.html (F)
9. CUE language specification — https://cuelang.org/docs/reference/spec/ (F)
10. ArkType configuration — https://arktype.io/docs/configuration (S)
11. Zod API — https://zod.dev/api ; Zod JSON Schema — https://zod.dev/json-schema (F)
12. Effect SchemaAST (v3) — https://effect.website/docs/v3/api/effect/SchemaAST (F); Effect Schema getting started — https://effect.website/docs/guides/schema/getting-started (S)
13. (not used)
14. Foster, Greenwald, Moore, Pierce, Schmitt, "Combinators for Bi-Directional Tree Transformations", TOPLAS — https://www.cis.upenn.edu/~bcpierce/papers/lenses-toplas-final.pdf (R)
15. WebAssembly GC MVP — https://github.com/WebAssembly/gc/blob/main/proposals/gc/MVP.md (F); Binaryen MinimizeRecGroups — https://chromium.googlesource.com/external/github.com/WebAssembly/binaryen/+/HEAD/src/passes/MinimizeRecGroups.cpp (S)
16. Kozen, Palsberg, Schwartzbach, "Efficient Recursive Subtyping" — https://cs.cornell.edu/kozen/Papers/sub.pdf (S)
17. Filliâtre and Conchon, "Type-safe modular hash-consing", ML Workshop 2006 — https://usr.lmf.cnrs.fr/~jcf/ftp/publis/hash-consing2.pdf (S)
18. JSON Schema 2020-12 Core — https://json-schema.org/draft/2020-12/json-schema-core (F; truncated before the `unevaluated*` section)
19. Ajv issue #2353 — https://github.com/ajv-validator/ajv/issues/2353 (S)
20. Zod issue #3486 — https://github.com/colinhacks/zod/issues/3486 , and commit 3a818de / PR #5687 (S)
21. Freydenberger, "Extended Regular Expressions: Succinctness and Decidability", ToCS 53(2), 2013 — https://doi.org/10.1007/s00224-012-9389-0 (S)
22. TypeScript issue #12936, "Exact Types" — https://github.com/microsoft/TypeScript/issues/12936 (S)

From memory only (M): Amadio and Cardelli (1993) and TAPL ch. 21 on minimisation; TypeScript's alias symbol; exponent limits for arbitrary-precision decimals.
