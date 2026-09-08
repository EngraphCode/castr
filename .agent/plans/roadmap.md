# Castr roadmap

## Current execution

The [proof-programme parent](proof-programme/parent-plan.md#current-execution-state)
is the sole queue. Its Q-30 sequencing amendment authorises the interactive
[documentation and fidelity correction](active/castr-documentation-and-fidelity-correction.md),
the primary active delivery plan. The [delivery ledger](delivery-ledger.md) owns
branch/PR dispositions and the [correction thread](../memory/operational/threads/castr-correction.next-session.md)
owns the next landing.

The platform-neutral autonomous-development experiment is paused and its Claude
Routine disabled, owner-confirmed on 6 September 2026. Dependency eligibility
confers no scheduled execution authority. Small interactive repair PRs merge when
their current-head checks, reviews and ruleset conditions hold.

## Full JSON Schema support

**Committed roadmap outcome; pending implementation and proof.** The owner
confirmed full JSON Schema support on 8 September 2026. Callers must be able to
use standalone JSON Schema as a complete input and output format through Castr's
public API and CLI, without constructing an OpenAPI document.

This milestone belongs to **Q-12 / Tranche 05 (JSON Schema)** in the
[proof programme](proof-programme/parent-plan.md#slice-briefs), together with its
value-contract foundation and public-surface proof tranches. The correction
plan continues to own its existing in-scope fidelity repairs. The parent owns
execution order and promotion into concrete slices.

Acceptance requires all of the following:

- **Explicit dialect coverage:** complete input and output support for Draft
  2020-12 and Draft-07, with a standards-derived dialect, vocabulary and keyword
  inventory. Record decisions for other published dialects, including 2019-09,
  before making a broader support claim. A reduced keyword profile must not be
  presented as full support.
- **Complete semantics:** preserve every valid construct of each committed
  dialect through parsing, IR persistence and writing. Cover boolean and empty
  schemas; every legal recursive schema position; object, array, numeric and
  string constraints; composition and conditionals; evaluated-location semantics;
  annotations; and dialect-correct format and content behaviour. Preserve the
  source's additional-property semantics.
- **References and vocabularies:** preserve resource identity, base URIs,
  definitions, local and external references, anchors and dynamic/recursive
  scope where the dialect defines them. Make dialect selection, vocabulary
  requirements, extension handling and reference resolution explicit, with
  bounded, injected I/O and actionable diagnostics. Unrecognised required
  vocabularies and unresolved references must fail without partial IR or output.
- **Usable public entry points:** expose and document standalone parsing and
  writing through supported package exports and CLI operations. Prove the built
  API and CLI from a local checkout or packed artefact, including types,
  successful conversions, invalid-input failures and diagnostics. Package
  publication is not a prerequisite.
- **Losslessness and pair compatibility:** prove same-dialect semantic round
  trips, IR serialisation/deserialisation and deterministic output. Dialect
  migrations must be explicit, never silent upgrades or downgrades. For
  cross-dialect and cross-format conversions, implement every representable
  mapping and report genuinely impossible target mappings explicitly.
  Unimplemented semantics remain defects; they are not justified exclusions
  or permission for silent narrowing, widening or dropped content.
- **Behavioural conformance:** run the official JSON Schema Test Suite through
  Castr's transformations, comparing source and emitted-schema validation
  outcomes with dialect-appropriate independent validators such as AJV.
  Supplement it with specification-derived cases, adversarial and real-world
  fixtures, and separate annotation/persistence assertions. Keep validator
  coercion, default insertion and property removal disabled for acceptance-set
  comparisons. Tests must constrain behaviour, not configuration tables.

Internal parser/writer functions, AJV dependency declarations and passing
subsets are supporting evidence only. This milestone is complete when the
public workflows, full dialect inventories, behavioural proofs and support
documentation agree, under the
[verification contract](../directives/DEFINITION_OF_DONE.md).

## Supporting research

The dated [Castr and tRPC comparison](../research/castr-versus-trpc-2026-09-08.md)
examines compiler fidelity, runtime responsibilities and possible companion
integration. It separates inspected implementation from ratified requirements
and proposals; it does not add implementation scope or alter the execution queue.

## Retained work and lifecycle

- The correction plan owns comprehensive document/finding/source-change coverage,
  all known in-scope fidelity repairs, local workflows and its own completion.
- The [proof programme](proof-programme/parent-plan.md) remains unfinished beyond
  that commission; its queue and original acceptance remain authoritative.
- The [loop review](active/proof-programme-loop-review.md) has completed R1–R6
  rows; C09 must verify the original evidence and stage its lifecycle completion.
  It is not the primary active plan.
- [Paused workstreams](current/paused/README.md) retain their named obligations;
  the [transplant tracker](transplant/README.md) records the stopped wholesale
  transplant. Parity remains an intent without authorising a renewed transplant.
- [Future plans](future/) retain all nine strategic obligations, subject
  to their actual promotion triggers and the commission's exclusions.
- [Completion staging](current/complete/) and [archive](archive/)
  preserve evidence; a status changes only when its original acceptance is proven.

The former milestone/status narrative is [conserved verbatim](../memory/operational/archive/correction-entry-paths-2026-09-06.md).
C09 reconciles its remaining obligations against actual main evidence rather than
silently dropping historical intentions or treating historical commands as current.
