---
fitness_line_target: 330
fitness_line_limit: 450
fitness_char_limit: 22000
fitness_line_length: 100
split_strategy: 'Split per-surface detail into companion contracts once the substrate evaluator consumes this inventory at scale'
merge_class: index-narrative-tables
---

# Memory/State Substrate Contracts

Host-local substrate instance and strict inventory bridge for castr's Practice
state, memory, generated read models, historical surfaces, and repair routing.
Look this up when adding, auditing, repairing, or building tooling for any
`.agent/state/` or `.agent/memory/` surface.

Portable doctrine lives in [PDR-050][pdr-050]. Merge-time semantics live in
[PDR-049][pdr-049]. This file is the repo-local bridge: it may name castr paths,
commands, schemas, and plans. Do not move those host details into Practice Core.
The transferable contract specification belongs in PDR-050; this file is the
human-facing local instance that the substrate evaluator validates against that
specification and the adjacent strict JSON manifest/schema.

## Contract Authority

| Field                | Value                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Inventory owner      | This executive-memory file                                                                        |
| Primary writers      | Substrate-contract adoption work, consolidation, and transplant-plan implementation               |
| Reviewer route       | `code-reviewer` (gateway); add `type-reviewer` when the manifest/schema or a JSON surface changes |
| Doctrine source      | PDR-050 for substrate contracts; PDR-049 for merge classes                                        |
| Implementation owner | The pure `practice-substrate` evaluator under `agent-tools/src/practice-substrate/`               |
| Boundary             | Practice Core names portable doctrine only; this file names local roots and commands              |

State is truth-of-now. Memory is truth-across-time. Generated read models are
derived views. Historical fragments and archived prose are evidence, not noise
to delete. Repair must preserve knowledge before satisfying fitness or shape.

## Transferable vs Local

| Layer                      | Home                                                     | Contents                                                                                                                                                            |
| -------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transferable specification | [PDR-050][pdr-050]                                       | Required fields, merge-class discipline, severity vocabulary, repair vocabulary, generated read-model rule, transition-surface pattern, preservation-before-fitness |
| Repo-local instance        | This file plus the strict JSON manifest/schema beside it | Concrete roots, schemas, parsers, generated outputs, commands, exclusions, current gaps, reviewer routes, and migration ledgers                                     |

The substrate evaluator validates the repo-local instance against the
transferable specification. It does not treat this host inventory as the
portable doctrine itself.

## Strict Inventory Manifest

The machine-consumed local instance lives in
[`memory-state-substrate-contracts.manifest.json`](memory-state-substrate-contracts.manifest.json)
and validates against
[`memory-state-substrate-contracts.schema.json`](memory-state-substrate-contracts.schema.json).
This Markdown file remains the human-facing contract; the JSON manifest is the
strict data surface the `practice-substrate` evaluator consumes and validates.

castr authored its own instance during the Phase-6 memory consolidation rather
than copying Oak's runtime data: the manifest enumerates castr's substrate
surfaces, identity, doctrine cites, plan roots, and reviewer routes. The
portable schema structure is shared with Oak (it encodes the PDR-049/050
contract, not host phenotype).

## Surface Contract Template

Every in-scope surface needs a contract. For a single file, put the contract in
frontmatter, schema annotations, or the file body. For a directory, put it in
the directory `README.md`. For a generated read model, put it in the output
header and in the source-surface contract.

| Field                | Required meaning                                                                 |
| -------------------- | -------------------------------------------------------------------------------- |
| Purpose              | What truth this surface carries and what it must not carry                       |
| Authority            | Which doctrine, plan, rule, schema, or contract governs it                       |
| Lifecycle            | Live, generated, archived, historical, fixture, retired, or transition defect    |
| Writer or write API  | Human edit, command, renderer, transaction helper, or append-only fragment write |
| Entry identity       | Stable ID, timestamp, agent identity, filename convention, or none               |
| Merge class          | One PDR-049 class, declared in frontmatter, schema, or directory README          |
| Schema or parser     | JSON Schema, TypeScript parser, markdown convention, or explicit gap             |
| Generated outputs    | Derived files this surface feeds; empty when none                                |
| Validator            | Current check and evaluator responsibility                                       |
| Severity             | Blocking, review-required, or informational for each invariant                   |
| Repair path          | Deterministic, manual-with-provenance, or forbidden                              |
| Portability tier     | One manifest tier; never infer from path alone                                   |
| Owner/reviewer route | Agent, command, reviewer, or plan that owns changes                              |

When a surface stores a derived value, the validator must recompute it. A stored
count, rendered markdown log, freshness status, or generated index is evidence
only after comparison with the current source set.

## Severity and Repair Vocabulary

| Severity          | Meaning                                                              | Examples                                                                           |
| ----------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `blocking`        | Deterministic structural defect that can be proven without judgement | Invalid JSON, conflict markers, generated drift, new writes to a retired live path |
| `review-required` | Ambiguous or semantic defect that needs an agent or owner decision   | Same-key memory collision, unclear stale-vs-archive prose reference                |
| `informational`   | Historical or contextual signal that must be preserved               | Archived prose naming old paths, legacy fragments before terminal migration        |

CLI output may include a transport-oriented `level` such as `error` or `warn`,
but every substrate finding must also carry one of the contract severities
above. `level: "error"` maps to `severity: "blocking"`.

| Repair class             | Meaning                                                                    | Constraint                                |
| ------------------------ | -------------------------------------------------------------------------- | ----------------------------------------- |
| `deterministic`          | Tool can compute one correct repair from current contract                  | Must be available as dry-run before apply |
| `manual-with-provenance` | Agent must preserve source, original path, content identity, and rationale | No silent rewrite or deletion             |
| `forbidden`              | Repair would erase evidence or choose semantics                            | Emit remediation, do not mutate           |

## Current Materialisation

The manifest enumerates the full substrate castr is building toward. Not every
surface is materialised yet — the unbuilt ones are **named Phase-8 / future
positions**, not drift, and carry a `notes` field in the manifest. The consumer
does **not** assert a fixed surface count: a hardcoded expected-count is a
stored derived value that this contract's own `stored_derived_values_rule`
forbids (it is never recomputed, so it only guarantees future staleness). The
evaluator instead checks per-surface integrity — unique ids, required contract
fields, valid PDR-049 merge classes — and validates the manifest against the
schema.

**Live today (11):** this contract; `.agent/memory/README.md`;
`active/napkin.md`; `active/distilled.md`; `active/patterns/` (directory — the
full pattern import is a remaining Phase-6 OUT item);
`operational/repo-continuity.md`; `operational/threads/` (README convention
seeded); `operational/tracks/` (README convention seeded);
`operational/pending-graduations.md`; `operational/open-questions.md`;
`.agent/memory/executive/`.

**Phase-8 / forward-reference (11):** `.agent/state/README.md` and the entire
`.agent/state/collaboration/` plane (comms events, shared-comms-log,
active/closed claims, conversations, escalations); `.agent/memory/collaboration/`;
`operational/collaboration-state-*.md`; `operational/diagnostics/`;
`operational/quarantine/`.

Because the `.agent/state/collaboration/` plane and its colocated schemas are
not yet on disk, running the evaluator today surfaces **expected `blocking`
`live-reader-failure` findings for that plane**. That is a true signal that
Phase-8 infrastructure is not yet installed — **it must not be silenced**
(inverse of green-gates-mask-gaps). The structural manifest checks
(count = 22, unique ids, required fields present, valid PDR-049 merge classes,
manifest-validates-against-schema) pass independently of the absent plane.

## Command Boundary

Repo-level substrate checks invoke built `agent-tools` output. castr exposes a
single workspace script — there is no public `pnpm practice:substrate:*` alias
yet (that aliasing is a future arc):

```bash
pnpm --filter @engraph/agent-tools practice-substrate -- check --mode report
pnpm --filter @engraph/agent-tools practice-substrate -- check --mode strict
```

Repair commands do not exist yet and are a future arc. Do not cite no-arg
`pnpm agent-tools:collaboration-state -- check` as broad substrate validation;
it is a narrow parser check unless explicit paths are supplied. The
`practice-substrate` evaluator is **not** wired into `pnpm check`; it is a
standalone substrate audit.

## Known Contract Gaps

These are not permission to trim content. They are the substrate defect-ledger
for castr.

| Gap                                                                               | Current classification                            | Next owner                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------- |
| `.agent/state/collaboration/` plane unmaterialised                                | Phase-8 named position; evaluator reports absence | Phase-8 collaboration machinery    |
| Collaboration JSON schemas live in-code/fixtures, not as colocated `.schema.json` | Contract gap; runtime schema files are Phase-8    | Phase-8 collaboration machinery    |
| `shared-comms-log.md` renderer exists but has no live source set yet              | Deterministic checker is dormant until Phase-8    | Phase-8 collaboration machinery    |
| Full `active/patterns/` ecosystem import outstanding                              | Phase-6 OUT item                                  | Remaining Phase-6 pass             |
| Directory README contract coverage partial across memory roots                    | Structural metadata gap; preserve content         | Consolidation                      |
| Memory/state merge claims lack live topology validation in castr                  | Multi-checkout merge-safety gap (evaluator-ready) | Phase-8 / first multi-agent stream |

## Canonical Communication-Event Root

`.agent/state/collaboration/comms/` is the one canonical live communication-event
root (Phase-8). castr never carried Oak's legacy comms-events runtime data, so
there is no legacy migration ledger to drain (`migration_ledgers` is empty). When
the plane is materialised, new events must be written only through
`pnpm agent-tools:collaboration-state -- comms send`; archived references to any
superseded path remain archived evidence unless a reviewer explicitly decides
they are live instructions.

[pdr-049]: ../../practice-core/decision-records/PDR-049-memory-and-state-file-merge-semantics.md
[pdr-050]: ../../practice-core/decision-records/PDR-050-state-memory-substrate-contracts.md
