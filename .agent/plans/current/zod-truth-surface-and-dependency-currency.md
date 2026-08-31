---
title: Zod truth surface & dependency currency — two-part plan
status: current
lane: current
created: 2026-08-31
last_updated: 2026-08-31
owner_directive: >-
  "explore and answer the unknowns, then draft a two part plan, part 1 a
  simple dependency currency pass, part two everything else above and your
  recommendation post uncertainty exploration. There is a fairly large and
  current plan for fixing Castr in scheduled task slices, so please read
  that as well, it must be kept up to date." (owner, 2026-08-31,
  in-conversation; "everything above" = the hand-authored-Zod-surface
  exploration recorded in the napkin, 2026-08-31 entry)
todos:
  - id: DC-1
    content: 'Part 1: whole-estate dependency-currency pass (zod 4.5.4 cycle headline) — parent-plan row Q-23'
    status: completed
  - id: TS-1
    content: 'Part 2a: Scenario 8 vendor-conformance oracle + corpus extension — parent-plan row Q-24'
    status: pending
    depends_on: [DC-1]
  - id: TS-1b
    content: 'Part 2a-ii: z.toJSONSchema differential cross-check (split from TS-1 at review) — parent-plan row Q-27'
    status: pending
    depends_on: [TS-1]
  - id: TS-2
    content: 'Part 2b: Zod dialect manifest + unsupported-surface diagnostics — parent-plan row Q-25'
    status: pending
    depends_on: [DC-1]
  - id: TS-4
    content: 'Part 2a-iii: base64/base64url writer-emission fidelity (contentEncoding → z.base64()/z.base64url()) — parent-plan row Q-28'
    status: pending
    depends_on: [DC-1]
  - id: TS-3
    content: 'Part 2c: ADR ratifying static parsing + vendor-oracle complement + dialect versioning — parent-plan row Q-26'
    status: pending
    depends_on: [TS-1, TS-2]
---

# Zod truth surface & dependency currency

The execution queue for this plan lives in the
[proof-programme parent plan](../proof-programme/parent-plan.md) as rows
Q-23..Q-28 (QD-6: queue briefs ARE the per-slice plans). This document is the
evidence base and design detail those briefs cite; where a brief and this
document disagree, the brief governs and this document is corrected.

## Goal

Part 1: the dependency estate is at latest under the skill's holds, with the
Zod 4.5 behaviour deltas taken deliberately and on record rather than by
range drift. Part 2: Castr's knowledge of Zod stops being three unverified
hand-copies — it becomes one intra-repo authority (a dialect manifest)
whose agreement with the installed Zod is recomputed by an executable
oracle on every version bump, and the static-parsing architecture choice
that makes the model necessary is ratified in an ADR instead of inherited.

## Evidence base (all measured firsthand, 2026-08-31)

Probe: side-by-side zod 4.3.6 / 4.4.3 / 4.5.4, 20-construct representative
set — script and raw outputs committed at
`.agent/research/zod/zod-version-probe.mjs` /
`zod-version-probe-2026-08-31.out.jsonl` (re-runnable by any future firing;
the TS-3 revisit trigger depends on it):

| Measurement                                                             | 4.3.6  | 4.4.3              | 4.5.4              |
| ----------------------------------------------------------------------- | ------ | ------------------ | ------------------ |
| `z.iso.datetime()` accepts `2026-08-31T12:00Z` (no secs)                | yes    | yes                | **no**             |
| `z.string().length(1)` accepts `"\u{1F4A9}"` (1 cp, 2 UTF-16)           | no     | no                 | **yes**            |
| `z.string().min(2)` accepts `"\u{1F4A9}"` (rejecting direction)         | yes    | yes                | **no**             |
| `z.creditCard/properties/deepPartial/validate/compile`, `.exactPartial` | absent | absent             | present            |
| Shallow `_zod.def` shape (type/format/keys/checks), 20 constructs       | —      | identical to 4.3.6 | identical to 4.4.3 |
| `z.toJSONSchema(z.string().min(2)).minLength`                           | 2      | 2                  | 2                  |

The length change is two-sided: code-point counting newly ACCEPTS input
4.4 rejected (`length(1)`) and newly REJECTS input 4.4 accepted (`min(2)`)
— both directions belong in any behaviour-delta record. The def-stability
row measures SHALLOW shape only (type, format, sorted def keys, one level
of check descriptors); the 4.5 behaviour changes moved none of it, which
means shallow def shape is measurably blind to exactly this class of
semantic drift — a limit TS-3's ADR must carry alongside the stability
claim.

Corpus audit (`lib/tests-fixtures/zod-parser/happy-path/payloads.ts`): all
five datetime payloads carry seconds; zero astral/code-point length-boundary
payloads; `IsoDatetimeSchema` (string-formats fixture) has **no parity
payload entry at all**. Consequence, and the structural point beneath it:
the ADR-035 parity harness runs original and transformed schema under the
SAME installed Zod, so a vendor semantic change moves both sides together
and parity stays green — the 4.5 datetime change passes the whole suite
while changing what every generated validator accepts. Parity proves the
transform; nothing proves the model.

Survey (`pnpm -r outdated` / `pnpm audit`, 2026-08-31): tsx 4.23.12→4.23.13
(dev patch), knip 6.32.2→6.33.0 (dev minor), **zod 4.4.3→4.5.4**,
@scalar/json-magic 0.13.2→0.13.3 + @scalar/openapi-parser 0.28.16→0.29.0
(coupled data-pipeline pair; json-magic is exact-pinned), @types/node
24.13.3→26.4.0 (**hold**: engines.node 24.x, ADR-049), typescript
6.0.3→7.0.2 (**hold**: ts-morph 28 vendors TS 6.0.2 in `@ts-morph/common` —
a workspace TS 7 reintroduces dual-compiler skew on the emission path;
reopen when a ts-morph release vendors 7.x). Audit: zero findings already.

Table-layer read: the parser's Zod-name knowledge is already table-shaped
(`ZOD_PRIMITIVES` + `ZOD_COMPOSITIONS`, `ZOD_PRIMITIVE_TYPES`, and TWO
format maps — `types/zod-parser.zod4-formats.ts` for Zod-4 primitive names
and `modifiers/zod-parser.constraints.ts` for chained-method names) and
the writer's tables (`STRING_FORMAT_TO_ZOD`, `formatToValidation`, numeric
switches) are their near-inverse — hand-maintained in separate modules,
with a third prose copy in ADR-031 §2. NOT a true inverse (measured): the
chained-method map yields `cuid`, `cuid2`, `ulid`, `emoji`, and `ip`
formats the writer cannot emit (`writeStringSchema` throws on all five),
so the table layer carries a real parse-only/emit-only asymmetry any
manifest must express rather than erase. The chain/AST machinery is
structural and generic over the name constants; it does not need
manifest-driving. The parser already derives a synthetic zod declaration
at runtime from `ZOD_PRIMITIVES` + `ZOD_COMPOSITIONS`
(`registry/zod-decl-builder.ts`, consumed at `ast/zod-ast.ts` — the
in-tree precedent for table-driven runtime derivation, and a third
consumer any manifest must feed).

Doctrine finding (napkin 2026-08-31, feeds TS-3): ADR-032 §Context says
"ADR-026 requires ts-morph; no regex or runtime execution", but ADR-026's
ratified decision is AST-over-string-heuristics — it argues nowhere against
runtime introspection, and ADR-032's Alternatives never weighed it, while
`.agent/research/zod/notes.md` sketches exactly that integration surface.
The static choice has real warrants (no execution of user code,
source-located diagnostics, writer/parser symmetry over source text); they
are currently folklore, not doctrine.

## Part 1 — dependency-currency pass (row Q-23)

Executes the `dependency-currency` skill in full (survey → holds → tiers →
one proof-gated cycle per type-affecting bump → audit-to-zero → Actions
pins → close). Prior art:
[`current/complete/dependency-currency.md`](./complete/dependency-currency.md)
closed at audit-zero on 2026-08-26 (DC0–DC8, per-cycle SHAs), so this pass
starts five days off a clean baseline — its substance is the zod cycle
plus a small dev sweep, and the 2026-08-26 landings are verified, not
re-authored (the `pnpm-workspace.yaml` `typescript: '^6.0.3'` override cap
already exists with the vendored-compiler rationale). The skill's §7
close-the-lane record lands in THIS document's Part 1 plus the Q-23 row;
the completed DC plan stays closed. Premises to re-verify at claim time:
the survey above, and the measured environment skew — this authoring
container runs Node 22 against `engines.node: 24.x` (cloud-image
artifact); a firing inheriting that skew names its disposition (proceed
with the engine warning, or defer to a Node-24 environment) before the
install-heavy steps. Per-slice proof shape: a currency pass has no failing
test to author first — its proof is the skill's capture-before-mutate
baseline plus suites staying green; QD-14 (open) is the governing ruling
on non-code/gate-shaped acceptance vs the red-first non-negotiable, and
this row operates under its recommended reading. Expected shape:

- **Type-neutral dev sweep**: tsx, knip — one commit, gates firsthand.
- **Data-pipeline cycle**: @scalar/json-magic + @scalar/openapi-parser
  together (coupled trio rule; check `@scalar/openapi-types` alignment;
  respect the exact pin's intent — read its history before widening).
  Proof: pipeline/fixture/drift suites green.
- **Zod cycle (the headline, its own commit)**: bump `zod` to `^4.5.4` in
  `lib` and `agent-tools`. Baseline is the committed fixture estate plus a
  pre-bump full-suite run captured to scratch BEFORE `package.json` is
  touched (PDR-097 capture-before-mutate). The bump re-resolves
  `@modelcontextprotocol/sdk`'s zod peer (lockfile today:
  `1.30.0(zod@4.4.3)` with `zod-to-json-schema` beneath it) — a
  peer-range refusal is an install-time failure the green prediction does
  not cover, so verify the resolution before running suites. Measured
  prediction to verify, not assume: the suite stays green because the
  corpus never exercises the changed acceptance regions (probe + corpus
  audit above). The cycle's PR body records both behaviour deltas
  TWO-SIDED (datetime seconds now required — RFC 3339/OpenAPI-faithful
  strictening; length now counts code points — newly accepting astral
  strings under `length`/`max` AND newly rejecting them under `min`,
  Zod moving TOWARD JSON Schema's minLength/maxLength semantics) as the
  release-notes fact that rides the QD-10 residue (any future publish
  prices in accumulated behaviour changes). A red result is
  STOP-and-understand, never regenerate-to-green.
- **Holds recorded, not bumped**: typescript 7 (vendored-compiler
  alignment, reopen condition named), @types/node 26 (ADR-049 Node-major
  coupling; in-range 24.x refresh only). Cap any override per the skill.
- **Actions pins**: refresh SHA pins against verified stable tags.

Acceptance (`integration` + `non-code`, QD-14 reading): `pnpm audit` zero;
`pnpm -r outdated` empty modulo recorded holds and cooldown; one commit per
type-affecting cycle with its proof stated in the body; GitHub Actions SHA
pins verified against dereferenced stable tags; the workspace `overrides`
TS cap re-verified against the vendored major; full `pnpm check:ci` green;
the zod cycle's two-sided behaviour-delta record present in its PR body.

**Part 1 close record (executed 2026-08-31, Dolphin binds Trench,
owner-directed interactive session under the session-scoped HUSKY=0
grant with GitHub CI as the aggregate detection surface).** Cycle 1
(`8ba53b2`): tsx 4.23.13 + knip 6.33.0 in-range sweep; type-check, lint,
knip, agent-tools suite (147/1627) green firsthand. Cycle 2 (`514f956`):
the coupled Scalar set — parser 0.29.0 + json-magic 0.13.3, types
staying 0.9.5 (exactly what parser 0.29.0 pins) — whose first proof run
went RED: parser 0.29.0 extracted its bundled OpenAPI JSON Schemas to a
new `@scalar/openapi-validator` dependency, breaking the doctor
preflight-validator's deep schema path (10 failures, one root); fixed at
source by declaring openapi-validator 0.1.0 as a direct exact member of
the coupled set (trio → quartet) and repointing the resolver;
re-proof green (132/1715). Cycle 3 (`ebd3813`): zod ^4.5.4 in lib +
agent-tools; pre-bump baselines captured from the committed tree, both
suites baseline-identical post-bump; MCP SDK peer re-resolved cleanly to
`1.30.0(zod@4.5.4)`; the two-sided behaviour-delta record lives in the
commit body and the PR (QD-10 residue). Actions pins: all five verified
current at their claimed tags' commit SHAs (checkout v7.0.1,
pnpm/action-setup v6.0.9, setup-node v7.0.0, cache v6.1.0,
upload-code-coverage v1.4.2) — no changes. Close survey: `pnpm audit`
zero; `pnpm -r outdated` shows only the two documented holds
(typescript 7 vs ts-morph-vendored TS 6; @types/node 26 vs ADR-049
Node-24 coupling). Cooldown honoured (zod 4.5.4 published
2026-08-29T17:55Z, ~41 h before install). Environment disposition:
container Node 22 vs `engines.node: 24.x` — proceeded with the engine
warning named; GitHub CI runs the aggregate on Node 24.

## Part 2 — Zod truth-surface programme

### TS-1 / row Q-24 — Scenario 8: vendor-conformance oracle

Extends the ADR-035 scenario matrix with the cross-truth check the parity
harness cannot perform: for each covered IR construct and payload, compare
**(a)** the installed Zod's verdict on the emitted schema (executed via the
existing transpile-and-run harness), **(b)** AJV's verdict on the same IR
node's JSON-Schema projection (ajv + ajv-formats are already runtime
deps), and **(c)** the corpus's declared expectation. Disagreement fails
with the drift DIRECTION named (toward or away from IR/JSON-Schema
semantics — the 4.5 length change is drift toward; the datetime change is a
strictening castr can adopt as the new expectation). Includes:

- **Corpus extension lands first, as the oracle's input**: seconds-less
  datetimes, astral length boundaries, and a parity-payload entry for
  every string-formats fixture schema (the `IsoDatetimeSchema` gap — a
  fixture with no payload entry is silently skipped by
  `assertValidationParity` today) — EXCEPT `Base64Schema` and
  `Base64UrlSchema`, which are excluded here and routed to TS-4/Q-28: the
  parser records them as `contentEncoding` while the writer dispatches on
  `format` only and emits bare `z.string()` (measured), so their invalid
  payloads would fail EXISTING parity before any oracle exists; their
  entries land red-first inside Q-28's writer-fidelity fix. This step
  alone cannot go red — the parity harness moves both sides together,
  which is the finding — so the RED-FIRST proof for this slice is the
  oracle failing on the seeded vendor-drift and projection mutants below,
  with the corpus extension in place before it.
- **ADR-035 amendment** adding Scenario 8 with its blind-spot rationale.

Acceptance (`integration`): oracle red on a seeded vendor-drift mutant
(e.g. a corpus expectation contradicting the installed Zod) and on a seeded
projection mutant; green on the real estate; wired into `pnpm check`; ADR
amendment landed. Runs on the pinned lockfile version — the oracle is what
makes every FUTURE zod bump a measured event instead of a silent shift.

### TS-1b / row Q-27 — `z.toJSONSchema` differential cross-check

Split from TS-1 at review (separate oracle, separate allowlist, separate
failure semantics; nothing in the three-way differential depends on it):
castr's IR→JSON-Schema output diffed against Zod's own `z.toJSONSchema()`
for the shared subset — two independent implementations of the same
mapping as a cheap second oracle. Documented divergences (uuidVersion,
int64/bigint carriers) form a reasoned allowlist; an unlisted divergence
fails.

Acceptance (`integration`): differential red on a seeded writer mutant and
on an unlisted divergence, green on the real estate with the allowlist
populated and each entry reasoned; wired into `pnpm check`; gates green.

### TS-4 / row Q-28 — base64 writer-emission fidelity

Measured gap (surfaced by PR #73 review, verified firsthand): the parser's
`ENCODING_MAP` records `z.base64()`/`z.base64url()` as
`contentEncoding: 'base64' | 'base64url'` on a string schema, but the Zod
writer's `writeStringSchema` dispatches on `schema.format` only and emits
bare `z.string()` when no format exists — the encoding constraint is
silently dropped on emission (no `base64`/`contentEncoding` handling
exists anywhere in `writers/zod/generators/`). This is silent content
loss on the Zod→IR→Zod path, invisible today only because the fixtures
carry no parity payloads. Fix: the writer emits `z.base64()` /
`z.base64url()` from `contentEncoding` (the inverse of the parser's
`ENCODING_MAP`, honouring the redundant-validation filter), red-first via
the `Base64Schema`/`Base64UrlSchema` parity-payload entries TS-1 excludes
and routes here — invalid-base64 payloads prove the loss on the pre-fix
tree, then the emission fix turns them green.

Acceptance (`integration`): the two fixtures' parity payloads (valid and
invalid) red on the pre-fix tree and green post-fix; round-trip
(Scenario 2/4/6) preserves `contentEncoding` through emission; `pnpm
check` green.

### TS-2 / row Q-25 — dialect manifest + unsupported-surface diagnostics

One typed data module (the "Castr Zod-4 dialect") holding, per construct:
Zod name, IR type, format/encoding, canonical emission, a
parse-only/emit-only capability field (the measured cuid/cuid2/ulid/
emoji/ip asymmetry must be EXPRESSED, not erased — closing it is a
behaviour change and out of scope), redundant-validation marker, and
conformance-vector references. **Mechanism: runtime derivation** — the
consuming modules import the manifest and build their tables at module
initialisation, the same shape as the in-tree precedent
(`zod-decl-builder.ts` deriving the synthetic zod declaration). No
generated source files are produced, so `never-edit-generated-files` and
regeneration gates are not in play; this is a pure refactor of where the
tables come from. Consumers, all named: parser
`ZOD_PRIMITIVES`/`ZOD_COMPOSITIONS` (including the synthetic-declaration
builder), `ZOD_PRIMITIVE_TYPES`, both parser format maps
(`types/zod-parser.zod4-formats.ts` and
`modifiers/zod-parser.constraints.ts`); writer `STRING_FORMAT_TO_ZOD`,
`formatToValidation`, numeric dispatch. Parser/writer lockstep for the
name/format layer becomes true by construction; ADR-031 §2's prose table
gains a derived-from pointer instead of a third hand copy. Scope
discipline: the manifest drives the TABLE layer only — chain/AST
machinery, objects, composition semantics, and recursion stay code
(measured feasibility read above; forcing them into data would create the
fourth copy the falsifier names). Adds the known-unsupported enumeration:
4.5 surface (`z.creditCard`, `z.properties`, `z.deepPartial`,
`.exactPartial`, `z.validate`, `z.compile`) and other
recognised-but-out-of-dialect constructs get actionable "not in the Castr
Zod dialect" diagnostics with the reason (e.g. creditCard: no faithful
JSON-Schema/OpenAPI carrier) instead of the generic
unsupported-expression error.

Acceptance (`unit` + `integration`): tables byte-identical to today's
behaviour on the existing suite (pure refactor proof); a manifest entry
added in a test drives both parser and writer without further edits;
diagnostics for the enumerated 4.5 surface name the construct and reason;
gates green.

### TS-3 / row Q-26 — ADR: static parsing ratified, with its complement

A new ADR that (1) ratifies static ts-morph parsing from first principles
— naming the real warrants and weighing the runtime-introspection
alternative ADR-032 never recorded (the probe's def-stability evidence and
its limits go in the ADR body); (2) mandates the vendor-conformance oracle
(TS-1) as the standing complement — the model is permitted BECAUSE its
agreement with the vendor is recomputed; (3) defines the dialect as the
versioned declaration of supported Zod surface (TS-2) and the diagnostic
contract for out-of-dialect input. Supersession notes on ADR-026/ADR-032
where their wording conflates the two decisions.

Acceptance (`non-code`): ADR accepted per the estate's ADR lifecycle,
indexes reconciled, `docs-adr-expert` review recorded; gates green.

## Recommendation (post uncertainty exploration)

The probes strengthened the pre-probe synthesis on every axis: the shallow
def contract is empirically stable across 4.3→4.5 (the runtime oracle is
cheap and durable — with the measured limit that shallow def shape did not
move for the 4.5 behaviour changes, so it detects representation drift,
never semantic drift; the oracle covers the latter), the corpus blind spot
is real and total for the 4.5-changed regions (the oracle is necessary,
not hypothetical), and the table layer is already half-manifest on both
sides (TS-2 is a consolidation, not an invention). Recommended order:
**Q-23 → Q-28 → Q-24 → Q-25 → Q-26**, with Q-27 (the split `toJSONSchema`
differential) after Q-24 — currency first so the oracle pins the vendor
castr actually ships against; the small Q-28 fidelity fix next so the
corpus can cover the whole string-formats estate; oracle before manifest
so manifest refactoring lands under cross-truth proof; ADR
last-but-referencing-both so doctrine records what exists. Sequencing relative to the existing
queue: after the safety instruments (Q-18/Q-20/Q-22/Q-19), ahead of
Q-05..Q-09 — owner-adjustable; the rows carry no gates beyond `depends_on`
within this plan.

Runtime introspection (`_zod.def` walking) is deliberately NOT adopted as
the parser: its costs (executing user code, expression-level diagnostics
lost) stand, and the oracle takes its value (test-time execution) without
them. Revisit trigger, recorded in TS-3's ADR: a Zod 4.x release whose def
shapes drift (the probe method is the detector) or a user need for
ingesting schemas castr cannot statically analyse.

## Risks

- **Zod 4.5 regression outside the corpus**: the prediction "suite green"
  is measured but the corpus is (by finding) incomplete — the pre-bump
  captured baseline plus STOP-on-red is the mitigation; TS-1 closes the
  class.
- **Manifest refactor drifts behaviour**: mitigated by pure-refactor proof
  (existing suite byte-identical) landing BEFORE any manifest-driven
  change, and by TS-1's oracle if sequenced first (recommended).
- **Oracle flakiness via AJV/Zod format disagreement**: known-divergence
  allowlist with reasons is part of TS-1's acceptance, not a follow-up.
- **Queue interference**: rows ride the proof-programme protocol (WIP=1,
  ADR-051); Q-23 touches `package.json`/lockfile which any open slice PR
  also carries — the standard contested-ref deferral applies.

## Non-goals

- No Zod-3 support, no zod-mini, no runtime-introspection parser.
- No adoption of new 4.5 APIs into the dialect (creditCard etc. get
  diagnostics, not mappings) — each adoption is its own future decision
  with a carrier-fidelity analysis.
- No TypeScript 7 or Node-major work (holds recorded in Part 1).
- No package release/version decision (constitutively the owner's; QD-10).

## Foundation alignment & lifecycle

Aligned to `principles.md` (strict everywhere — the oracle extends
strictness to the vendor boundary), `testing-strategy.md` (red-first
cycles named per slice), `requirements.md` (Zod input contract unchanged
until TS-2's diagnostics, which narrow error text, not acceptance). The
`plan-body-first-principles-check` fires at each executing firing: re-derive
each slice's shape from live code and this plan's evidence, not its
summaries; vendor call shapes (zod probe results, AJV options, ts-morph)
re-verified at slice execution per
`verify-vendor-call-shapes-at-plan-author-time`. Reviewers: this plan took
`assumptions-expert` at authoring (2026-08-31, 17 findings — one blocking,
ten material, six minor — all applied in the authoring landing, including
the Q-27 split and the Q-25 mechanism decision); per-slice reviewer
moments follow the parent plan's protocol step 4. Lifecycle: rows complete →
parent-plan frontmatter + this doc's todos updated in the same landings;
plan completion runs `engraph-consolidate-docs` and stages this doc to
`current/complete/` per the active-plans contract.
