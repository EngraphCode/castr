# Castr: Identity, Semantics, and Policy

## 1. Identity

Castr is a **schema compiler**.

It is **not**:

- a tolerant schema adapter
- a best-effort converter
- a lossy interoperability layer
- a runtime validation helper

It **is**:

- a **canonicalisation system** for data schemas
- a **deterministic transformation engine**
- a system that enforces **semantic stability across arbitrary format translation**

Castr operates under compiler-like guarantees:

- **admission is strict**
- **semantics are canonical**
- **round-trips are lossless (after admission)**
- **outputs are stable and idempotent**

---

## 2. Core Invariant

> Once a schema is successfully ingested into Castr, its meaning is canonical, closed, deterministic, and preserved exactly under arbitrarily deep repeated transformations between all supported formats.

Corollaries:

- No silent data loss is permitted
- No semantic broadening or narrowing is permitted post-ingestion
- No backend-specific interpretation is allowed to alter meaning
- No “best effort” interpretation exists

### 2.1 Strict And Complete Everywhere, All The Time

Castr's strictness is inseparable from completeness.

- A feature is part of Castr only when parser, IR, runtime validation, writers, proofs, and docs all agree on it.
- Partial validation, partial proof, partial documentation, or partially updated support claims are architecture drift, not an acceptable steady state.
- If a surface is not complete yet, the honest state is unsupported, paused, or blocked until the gap is closed.

---

## 3. Ontology

### 3.1 Single Semantic Model

Castr defines **one and only one object semantics model**:

> **Closed-world objects with explicit properties**

This means:

- Every valid key must be explicitly declared
- Unknown keys are **never implicitly accepted**
- Unknown keys are **never implicitly preserved**
- Unknown keys are **never implicitly typed**

There are no alternate object modes in Castr.

---

### 3.2 Rejected Ontologies

The following are **not part of Castr semantics**:

| Feature                                      | Status   | Reason                                                                |
| -------------------------------------------- | -------- | --------------------------------------------------------------------- |
| Strip (accept + drop unknown keys)           | Rejected | Implicit data loss violates determinism                               |
| Passthrough (accept + preserve unknown keys) | Rejected | Violates closed-world assumption                                      |
| Catchall / additionalProperties              | Rejected | Introduces open structural typing incompatible with canonical closure |

These are **source-language features only**, not Castr features.

---

## 4. Intermediate Representation (IR)

### 4.1 Canonical IR

The IR contains only constructs that are:

- **fully explicit**
- **deterministic**
- **closed under transformation**

For objects:

- Only explicitly declared properties exist
- No unknown-key behaviour exists
- No implicit acceptance rules exist

### 4.2 No Dual Semantics

The IR does **not**:

- encode multiple object modes
- preserve source-language openness semantics
- carry behavioural flags for unknown keys

There is no “strict vs passthrough vs strip” in IR.

There is only:

> **object with explicit properties**

---

## 5. Ingestion Policy

### 5.1 Admission Principle

A schema is admitted **if and only if** it can be transformed into canonical IR **without ambiguity, semantic drift, or loss of determinism**.

Otherwise:

> The schema is rejected.

---

### 5.2 Non-Strict Source Constructs

Source constructs that allow unknown keys are handled as follows:

#### Strip semantics

- Definition: accepts unknown keys and removes them
- Status: **rejected by default**
- Reason: changes observable behaviour (acceptance set differs from strict)

Optional (explicit future extension only, not default):

- May be allowed under **explicit compatibility mode**
- Must produce a diagnostic explaining semantic change
- Must not be silent

#### Passthrough semantics

- Definition: accepts and preserves unknown keys
- Status: **rejected**
- Reason: incompatible with closed-world semantics

#### Catchall semantics

- Definition: unknown keys are typed via a rule
- Status: **rejected**
- Reason: represents open structural typing, not compatible with canonical object model

---

### 5.3 Required Diagnostics

All rejections must include:

1. **Precise reason**
2. **Location in schema**
3. **Explanation of incompatibility with Castr semantics**
4. **Actionable alternatives**

Examples of alternatives:

- Explicitly enumerate properties
- Introduce a `metadata` / `extensions` / `attributes` field:

  ```ts
  metadata: Record<string, T>;
  ```

- Use unions to model variation
- Use explicit map fields instead of open objects

---

## 6. Canonical Guarantees

### 6.1 Idempotence

For any admitted schema:

```text
emit → parse → emit → parse → ...
```

must produce identical semantics indefinitely.

---

### 6.2 Losslessness (Canonical)

Losslessness is defined as:

> No loss or change of meaning within canonical Castr semantics.

Important:

- This does **not** guarantee reconstruction of original source syntax
- It guarantees preservation of canonical meaning only

---

### 6.3 Determinism

- No transformation may depend on runtime evaluation order
- No transformation may depend on backend quirks
- Output is uniquely determined by canonical IR

---

## 7. Backend Policy

### 7.1 Backend Role

Backends (Zod, JSON Schema, OpenAPI, etc.) are **targets**, not authorities.

They must:

- faithfully represent canonical IR
- not introduce semantic variation
- not expand or reduce acceptance behaviour

---

### 7.2 Capability Constraint

If a backend cannot express canonical IR:

- Emission must **fail explicitly**
- No degraded or approximate output is allowed

---

### 7.3 No Backend Leakage

Backend-specific constructs must not:

- influence IR design
- redefine semantics
- introduce alternate meanings

---

## 8. Zod-Specific Policy

### 8.1 Canonical Mapping

Castr emits only closed-object semantics in Zod:

```ts
z.strictObject({...})
```

or equivalent canonical encoding.

---

### 8.2 Explicit Non-Support

The following Zod constructs are **not supported** for ingestion or emission:

| Construct            | Reason                            |
| -------------------- | --------------------------------- |
| `.passthrough()`     | Violates closed-world semantics   |
| `.catchall()`        | Represents open structural typing |
| `z.looseObject()`    | Equivalent to passthrough         |
| `.strip()` semantics | Implicit data loss                |

---

### 8.3 Recursive Objects

Recursive schemas are supported **only in canonical closed form**.

Any recursive schema relying on:

- passthrough
- catchall
- loose object semantics

is:

> **rejected during ingestion**

This is **intentional**, not a limitation.

---

## 9. Parser / Writer Contract

### 9.1 Scope

Parser/writer guarantees apply to:

> **canonical Castr semantics only**

Not arbitrary source constructs.

---

### 9.2 Guarantee

If a schema is:

- admitted into IR
- emitted to a supported backend
- re-parsed

then:

- it must remain semantically identical

---

### 9.3 Non-Goal

Castr does **not** guarantee:

- round-tripping arbitrary source syntax
- preserving source-specific features
- supporting all backend constructs

---

## 10. Error Philosophy

Errors are:

- **fail-fast**
- **precise**
- **actionable**

Errors must never:

- silently coerce meaning
- degrade semantics
- partially accept invalid constructs

---

## 11. Design Principles

### 11.1 No Implicit Behaviour

All behaviour must be:

- explicit
- visible in the schema
- representable in IR

---

### 11.2 No Semantic Ambiguity

If a construct has multiple interpretations:

- it must be rejected

---

### 11.3 No Silent Compatibility

Compatibility transformations:

- must be explicit
- must be opt-in
- must produce diagnostics

---

### 11.4 Stability Over Convenience

Castr prioritises:

- correctness
- predictability
- reproducibility

over:

- convenience
- permissiveness
- ecosystem alignment

---

## 12. What “Correct” Means

A correct Castr system:

- Accepts only schemas that can be canonicalised without ambiguity
- Rejects all non-canonical constructs deterministically
- Produces identical meaning across all supported formats
- Maintains semantic stability under infinite round-trips
- Never silently alters schema behaviour

---

## 13. What “Good” Means

A good Castr system:

- Makes invalid constructs **obviously invalid**
- Provides **clear migration paths** for rejected schemas
- Produces **minimal, canonical, stable output**
- Is **predictable without reading implementation details**
- Does not leak backend-specific quirks into its model

---

## 14. Final Statement

Castr enforces a **closed, canonical schema universe**.

It does not attempt to represent every schema expressible in external systems.  
It accepts only those schemas that can exist **without ambiguity, without openness, and without semantic drift**.

Everything else is either:

- transformed explicitly, or
- rejected with guidance.

There are no exceptions.
