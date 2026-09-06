# Input-Output Pair Compatibility

**Amended: 2026-09-06.** Retain semantic preservation and canonical IR; supersede
the universal-format-superset interpretation with the ratified application-value
and interaction-contract boundary. See
[principles](../directives/principles.md#-input-output-pair-compatibility-model)
and [identity](../IDENTITY.md).

## The contract

1. Every advertised, versioned source grammar is bounded to the application-contract
   domain. All valid constructs inside it must parse completely into the appropriate
   artifact and facets; invalid or grammar-excluded source fails at admission.
2. The canonical IR carries accepted-input, produced-output, ordered-processing,
   annotation and interaction semantics distinctly. It is not limited by a particular
   writer and is not a universal carrier for foreign semantic domains.
3. Support is defined by a directed source → target profile, including artifact
   kind and selected channels. Exact native or proven encoded output preserves
   those channels. A missing implementation blocks the support claim.
4. Genuine target impossibility rejects atomically. A separately named,
   caller-authorised projection may report a complete semantic delta; it is
   never silently substituted for exact conversion or counted as lossless.

## Reviewer checkpoint

- **Parser:** does every accepted declaration—including nested constructs—preserve
  its complete meaning, or fail as a whole with a located diagnostic?
- **IR:** are artifact kind, versions, facets, presence, identity and references
  explicit? Has source text or a foreign opaque bag replaced semantic carriage?
- **Writer:** does its output preserve both acceptance and successful values,
  including ordered processing? A generated predicate must enforce the
  represented constraint rather than merely look plausible.
- **Object semantics:** are input acceptance, output retention/stripping,
  catchall validation and unevaluated behaviour preserved independently?
- **Boundary:** is the rejection invalid source, declared grammar exclusion,
  incompatible artifact kind or proven target impossibility? Do not disguise
  unimplemented admitted behaviour as an impossibility or unsupported grammar.
- **Proof:** is each claim bounded to a profile, revision and independent
  observation? A green structural or snapshot check alone does not prove
  runtime semantic equivalence.
