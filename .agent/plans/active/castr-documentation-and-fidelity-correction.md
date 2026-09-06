---
title: Castr documentation correction and fidelity repair
status: active
lane: active
created: 2026-09-06
last_updated: 2026-09-06
owner_directive: >-
  Implement the owner-approved comprehensive documentation correction and fidelity
  repair: split PR #81, correct all documents, repair all known in-scope fidelity
  defects, demonstrate local workflows, and merge small coherent PRs regularly.
todos:
  - id: A1
    content: Frozen source custody and complete, evidence-bearing inventories
    status: in_progress
  - id: A2
    content: Consistent current authority and corrected doctrine/documentation
    status: pending
  - id: A3
    content: Every known in-scope fidelity defect closed by behavioural evidence
    status: pending
  - id: A4
    content: Review discipline and condition-based delivery demonstrated on successor PRs
    status: pending
  - id: A5
    content: Contributor and isolated local package walkthroughs pass
    status: pending
  - id: A6
    content: Retrospective, main reconciliation and lifecycle closeout
    status: pending
---

# Castr documentation correction and fidelity repair

## Goal and authority

Make the repository give one correct account of Castr and make its implemented
behaviour satisfy that account. The owner approved this commission on 6 September 2026. Castr has no consumers yet; the owner has intended projects and considers
its usefulness settled. Verification concerns correctness and usability.

No published package is currently planned. Local checkout, build, CLI, API and
packed-package use must be demonstrated without registry-install promises.
Strictness, fail-fast behaviour and semantic fidelity are absolute requirements;
failures are design or implementation defects requiring repair. Preserve source
semantics, including accepted input, produced output and ordered processing.

The [parent plan](../proof-programme/parent-plan.md#current-execution-state) is the
sole execution queue. This delivery plan owns acceptance and coverage; its A-IDs
are acceptance checkpoints, not a second queue. The parent records the interactive
sequencing amendment. The platform-neutral autonomous-development experiment
remains paused and its Claude Routine disabled, owner-confirmed on 6 September.
That is owner evidence, not a live platform inspection. This commission authorises
interactive implementation and condition-based merges, without scheduled execution.

## Source custody and coverage

[PR #81](https://github.com/EngraphCode/castr/pull/81) and branch
`codex/plan-estate-refresh` are frozen source evidence at
`33be633862864ce8efb22e70abbbe9bce863c510`. Extract selected changes into fresh
`codex/` branches/worktrees based on current `origin/main`. Never force-push,
rewrite or wholesale merge the source branch. Each original diff hunk needs a
successor or an evidenced superseding disposition before #81 closes. Its closure
need not wait for unrelated compiler repairs.

Three manifests carry the bounded coverage appendix:

- [Original source changes](../correction-manifests/castr-correction-source.json):
  every original file/hunk, hash, destination and evidence.
- [Repository documents](../correction-manifests/castr-correction-documents.json):
  every baseline tracked path, including embedded/generated candidates; review
  state is separate from discovery. Baseline main has 1,270 document-like files;
  the draft has 1,273. All paths are inventoried to avoid extension-only blindness.
- [Known findings](../correction-manifests/castr-correction-findings.json): original
  46 findings, F-01–F-25, later findings and queue carriers, original acceptance,
  dependencies, current reproduction and closing proof.

These are starting inventories, not ceilings. Add discoveries and reconcile added,
changed, moved and deleted paths against final main. A passing count proves coverage,
not correctness. A changed blob invalidates its prior content-review evidence.
Disposition vocabulary: applied, already accurate/correct with evidence, historical,
superseded with evidence, or outstanding with a named carrier. Preserve distinct
source findings even when one repair closes several. The [delivery ledger](../delivery-ledger.md)
is the single current PR-disposition home; inventories link to it rather than
maintaining independent live PR/check statuses.

## Delivery mechanism

Each row is an outcome family, split further wherever one independently green
behaviour can land. The parent queue owns live execution status. Root owns
foundational doctrine and integration; delegated workers own explicit files.
Every PR has a named shepherd, the PDR-132 default budget of at most two expected
review rounds, and its actual tally from first triage. Dataset volume is a size
warning requiring review of the inventory method, never a correctness exemption.

| Position           | Reviewable outcome and dependencies                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01                | Split custody, this acceptance contract, owner corrections and paused execution authority.                                                                                                      |
| C02                | Q-19: durable REVIEW-TALLY, structural step-back and observational drive-attempt counters; demonstrate all three on its own PR.                                                                 |
| C03                | Public local checkout/build/CLI/API instructions, publication state and actual product surface.                                                                                                 |
| C04a / C04b        | Duplicate ADR-044/045/046 unique substance into originals and exact referrers; then remaining index/status/number/navigation defects. Q-08 completes only after both.                           |
| C05                | Plan authority, commands, installed skill/reviewer names, Q-16 PDR-018/template authority, canonical generated adapters.                                                                        |
| C06                | Coupled umbrella/Castr and Practice visions with PDR-135, indexes, adoption records and fired graduation.                                                                                       |
| C07a / C07b / C07c | Compiler doctrine by proposition: artifact/admission boundaries; object/processing semantics; target profiles/proof claims. Each fixes every contradictory current surface for its proposition. |
| C08                | Fidelity families below, one concrete defect and behavioural proof per repair PR. Independently green repairs merge promptly.                                                                   |
| C09                | Plan-family reconciliation, references, historical framing, remaining graduations and entry routes, in separate documentation PRs.                                                              |
| C10                | Both walkthroughs, bounded autonomy retrospective and final coverage/lifecycle reconciliation on main.                                                                                          |

C08 follows prerequisite doctrine and review discipline, but root-neutral repairs
may precede the broader root migration under the parent's sequencing amendment.
Q-22 fixture generation precedes dependent fixture work. Q-28 includes every
intermediate encoding seam its original scenarios traverse. Neither smallness nor
an administrative family label weakens original acceptance.

## Fidelity repair families and describing surfaces

For every current defect, reproduce red, implement green, refactor and retain the
behavioural proof at its owning public seam. Compile generated TypeScript and run
generated validators where those are the claimed products. Observe both acceptance
and successful parsed values using independent source/target observations.

| Family                | Required closing evidence                                                                                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod admission         | Preserve nested union/intersection/tuple/enum members, arity, ordering, chains, refinements and object modifiers. Unrecognised constructs reject the declaration atomically with construct, location and cause.                                                 |
| Generated keywords    | Separate dependent-schema, conditional, contains-bound, pattern-property, property-name and unevaluated PRs. Separating valid/invalid runtime witnesses eliminate placebo predicates and incorrect JSON-type comparisons. Containment is not completed support. |
| Encoding/dialects     | Q-28 plus encoding/media/schema carriage, every schema-bearing position, deep references, dialect-correct exclusive bounds and reference siblings. Never replace composition-aware unevaluated semantics with additionalProperties.                             |
| IR guards/persistence | Canonical guards preserve empty maps, falsey values, valid typeless schemas and hostile own keys through parse, persistence and writing.                                                                                                                        |
| Identity/interactions | Wire identity distinct from symbols; collisions/reserved names, real reference context, security: [], wildcard/default statuses, media alternatives, empty descriptions and consistent entrypoint admission.                                                    |
| Objects/processing    | Omitted/true/false/schema-valued properties and strict/strip/passthrough/catchall behaviour; persist accepted-input, produced-output and ordered-processing distinctions. Writers never reconstruct semantics from retained source strings.                     |
| Code/configuration    | Enum/const/multitype structure; safe literal/name emission; failure before invalid output is written. Remove swallowed formatter failures, reject unsupported template paths/invalid options, remove obsolete client-only surfaces.                             |
| MCP projection        | Actual exposed projection boundaries, output roots, status selection and diagnostic/security metadata. Applicable official specification plus independent behaviour; no new MCP runtime product.                                                                |
| Proof integrity       | Q-22 fixture generator first; applicable vendor/differential oracles; content determinism, positive/negative outcomes, representative semantic-mutant bite and real test isolation repairs.                                                                     |

F-12/F-18/F-19 require implemented ratified value/interaction roots and typed facets:
prepare internal blocks incrementally, then deliberately migrate public roots with
all repository consumers together. No speculative legacy compatibility machinery.
Q-016 direction is settled: orchestration above parsers/writers, conversion utility
dependencies downward. Resolver wiring, dependency policy and prohibited-import
proof land together. Preserve Q-02/Q-03/Q-04 evidence at its original scope; residual
failures need new proof. Existing PR value is selectively extracted against current
code, with closure evidence in the ledger.

## Documentation and retained obligations

Review product docs, Practice doctrine, acceptance criteria, plans, registers,
research, archives, source READMEs, TSDoc, CLI help, schema descriptions, metadata
and emitted docs. Fix canonical sources and regenerate their adapters. Preserve
historical quotations, decisions and third-party provenance while correcting
current framing and navigation. Repair all current broken references, including
the inherited 77 occurrences; extend the existing Markdown-link validator's source,
target and fragment handling where necessary and inspect its by-file report.

Q-14 retains/amends/supersedes each affected doctrine surface against the ratified
charter, distinguishing intended roots/facets from implemented APIs. W1's umbrella
and Practice visions land with PDR-135. W3 names actual support/tooling defects;
W5 defines preservation coverage and Practice fitness with computing owners, no
invented measurements or percentages. Q-20 completes Q-15's readiness-brief rewrite
and Q-17's seventeenth-round correction; named future validity checks are not run
by a documentation landing. Q-10 owns its reserved SUMMARY claim change until its
implementation proves it. QD-14 remains an unresolved general non-code/TDD question.

Reconcile every active/current/paused/future/completed/archive/remediation/transplant
plan against acceptance; stage the completed loop review only after verifying its
original proof. Preserve the stopped wholesale transplant, distinct paused streams
and all nine future plans. Correct obsolete W0 and template premises without
promoting excluded strategic work. Refresh public-repository archive privacy:
known HEAD exposure, outstanding tool and owner-controlled history action remain
separate from working-tree cleanup. Review all queued decisions/graduations against
actual triggers, including autonomous-pattern demonstrated reuse and bot-cited-SHA
convergence sharpening. No fired documentation graduation is deferred merely for
want of a new permission that this commission already provides.

## Acceptance and proof

- **A1 — coverage (repo-safe):** exact baseline sets and subsequent main delta are
  accounted for across all three manifests. Every surviving #81 hunk has a landed
  successor or evidenced supersession; all open PRs have dated heads, full review/
  check state, value, overlap, owner and extraction/closure proof in the ledger.
- **A2 — authority/truth/integrity (repo-safe):** normal reader and agent paths agree
  on paused execution, queue and delivery ownership; every current document is
  correct; historic material conserved; generated sources and outputs agree;
  affected links/commands/invocations work. Q-08/Q-14/Q-16/Q-20 original acceptance
  is proven on integrated main before completion; W1–W5 outcomes remain granular.
- **A3 — fidelity (repo-safe):** every known in-scope finding is either reproduced
  and repaired with red→green evidence, or proven already correct at its full
  original acceptance. No debt is reclassified into permitted compatibility.
- **A4 — delivery (repo-safe):** each successor merges by merge commit after fresh
  full thread/comment/review/check/ruleset harvesting, settled concerns and intact
  hooks. Paired docs/onboarding reviews for documentation; applicable domain,
  architecture, security, type and test reviewers for semantics. Tally and budgeted
  watcher run; non-convergence causes structural reconsideration and named custody.
- **A5 — usability (repo-safe):** a fresh-context contributor using repo instructions
  finds purpose/capabilities/defect ownership/authority/pause and completes a
  documented action. An isolated local pack is installed outside the checkout with
  no inherited dependencies, generates a committed fixture, compiles/imports the
  result, accepts conforming data, rejects distinguishing invalid data, and proves
  deterministic output plus actionable failure. Neither is an adoption test.
- **A6 — closeout (repo-safe):** bounded retrospective accounts for work,
  interventions, recurrent failures, missing evidence and repairs from existing
  autonomy records. Retain fitness measures and append workflow observations,
  never a fabricated composite score. Successor PRs merged, source PR closed when
  eligible, manifests/lifecycle reconciled to main, consolidation complete and
  claims closed. The broader programme and autonomous experiment stay unfinished
  or paused as applicable; commission stops only when these criteria hold.

Run existing formatting, portability, repository validators, by-file reference
reports and canonical `pnpm check`. Coordinate expensive aggregate runs; keep hooks
intact. No prose-pinning tests, parallel validation framework or broad local-hook
corpora without their established placement/runtime contract.

## Exclusions

Publication, hypothetical graph adapters, new formats, new runtime products,
performance research and wholesale plan-directory reorganisation are excluded.
Existing admission/runtime semantics remain included. Threat-only future policy
stays distinct; reproduced loader fail-fast/output-corruption defects are repaired.
No scheduled experiment, arming/probe/scorer machinery or separate Routine is
resumed or inferred. History rewriting remains owner-controlled.

## Framing checkpoint C01

Parallax core, same-context reduced execution, revision C01/1, software-engineering
profile: the owner's settled intent is the normative basis; main and frozen #81
are the observational bases. Counterframe: importing the previous completed carrier
would be cheaper. Rejected because its acceptance excludes current repairs and its
completion predates integration. The bridge from split custody to impact is that
reviewable, independently verified slices can land without losing original work.
Independent inventory agents share the same Git sources and are not independent
runtime oracles. Status: validated for custody framing by paired specialist review; the
commission's unexecuted acceptance remains pending.
Reopen its shape if mapping loses a hunk, a new carrier duplicates queue authority,
or completion evidence relies on the unmerged source branch.

## C01 review and verification record — 6 September 2026

Shepherd: Bora seeks Turbulence (Codex, gpt-6-astra, session 01a072).
Changeset class: custody/discovery record with coupled execution-authority edits.
The PDR-132 size warning was reviewed: baseline CSVs, original acceptance records
and verbatim archives explain the volume; unrelated doctrine/semantic changes
remain in their own C02–C10 slices. Default review budget applies.

REVIEW-TALLY, epoch 1, round 1 (parallel documentation/onboarding review before
PR opening): missing roadmap index targets fixed to existing directories; stale
Q-016 decision wording corrected to outstanding implementation; invalid history
fence repaired; Q-19 inventory scope corrected to authorised implementation.
The last correction also prompted an inclusion/exclusion audit against the
owner's approved scope. No second-round recurrence has occurred. This record
seeds the durable PR tally when the PR is opened; it does not claim Q-19 complete.

Both reviewers independently verified current routing and preservation: 2,622
baseline paths, all 274 source hunk hashes across 136 no-rename file records,
verbatim entry histories and all nine prior programme identities. Existing
portability and repository validators passed. Canonical `pnpm check` passed
with the existing Turbo cache; this is the repository gate result, not new
runtime proof or an isolated package walkthrough. The Markdown-link validator's
by-file report was inspected; new navigation errors were fixed and remaining
inherited/validator-inventory defects remain C09 obligations. Its zero exit
status is not a claim of reference closure.

C01 remains unmerged until its PR meets the current-head merge conditions.
A1–A6 are not complete merely because this custody record exists.

Gateway review additionally caught formatter removal of a two-space hard break
from one historical line. The archive now preserves raw fenced blocks through
the standard Prettier preservation directive; exact bytes are rechecked after
formatting. This is the same first-triage round, before PR opening.

## C02 framing and acceptance record — 6 September 2026

C01 landed in PR #82 at `b14caede`; its detailed proof is in the delivery ledger.
C02 is one procedural outcome: make review rounds and unfinished scheduled PR
drives observable. Parallax core, reduced same-context inquiry: the counterframe
is a new automatic service or imported OCE state machine. The existing durable
PR comment and repository bookkeeping paths suffice; no new scheduler, thresholds
or instrument framework is required. Proportionality retains the three ratified
Q-19 elements together and includes the directing skill's contradictory local
references. It does not reduce the correctness or human-review obligations.

The bot-cited-SHA graduation fires because convergence doctrine is edited. Its
permanent procedure preserves local-versus-remote evidence and independently
reproducible defects; the pending entry is drained. Q-19 remains pending under Q-30 until
its own PR demonstrates the tally from first triage and passes gates on main.
The default two expected review rounds apply; the tally lives on that PR, not in
a second local round store.

Non-code procedure walkthrough (author inspection, not a simulated live firing):
unchanged harvest → no new round; successor → same tally and ordinal; two rounds
narrowing one concern → structural re-derivation; interactive/paused/never-started
collision work → no drive increment; recorded unmerged scheduled ending → one
identified increment, including after substantive progress; observed merge →
retire only with retained final value. Local-missing/remote-present citation →
valid repository evidence; lookup unavailable → unverified; confirmed local and
repository absence → invalid warrant, with any reproducible defect still open.
Specialist review and live PR demonstration remain to follow this author check.

Architectural discovery custody: C08/Q-016 also owns boundary element-classification
blindness reproduced by the read-only architecture review on `e025d233` (folder
patterns missed direct children), context-to-parser and writer-to-context contract
edges, and the production-to-test-helper dependency. Moving two wrappers alone
cannot close Q-016; effective resolver/classification/policy and prohibited-import
proof must land together, with preparatory contract separation if needed.

C02 pre-PR validation: canonical `pnpm check`, skill parity, portability and
repository validators passed on 6 September. The link validator's by-file report
was inspected: 173 inherited entries remain; the edited ledger's reported archive
target exists and is omitted by the validator's inventory. No new affected link
failure was found; C09 owns the complete reference/validator correction. Adapter
regeneration produced no tracked difference. PDR-132's size warning is acknowledged:
the ninth file annotates seven partial C01 source dispositions, with immutable
merge/blob evidence and explicit residual custody; none is silently marked complete.

C02 round 1: PR #83's REVIEW-TALLY comment `5558683768` was created at
10:41:49 UTC before specialist/GitHub triage. Paired documentation and onboarding
reviews accepted the procedure; documentation review found a numeric-budget
restatement contrary to PDR-132 clause 5. The template now points to PDR-132 and
the bounded recheck settled it. No structural recurrence trigger fired. GitHub
review and final-head checks remain live responsibilities of the PR shepherd.

C02's initial asynchronous bot-review batch on `49ad9e43` also found a second
in-progress queue row, missing lease creation on the new-PR path, incomplete
upstream attribution and stale continuity/graduation pointers. The procedure now
keeps Q-30 as the only in-progress row, establishes leases before triage for new
as well as adopted PRs, and cites the verified upstream reference with local
limitations. Continuity corrections land in a separate `chore(continuity)` commit.
The earlier bundled continuity edit was a procedural deviation; pushed history
will not be rewritten to fabricate compliance. C05 owns the rule's ambiguous
applicability to deliberate documentary corrections and its broken authority links.
The PR tally retains all findings and their separate dispositions.

### C01R — bounded post-merge custody correction

PR #82 received eight threads after its verified merge-time clean observation.
C01R follows C02 and precedes C03; it is corrective custody within Q-30, not a new
queue or compiler slice. Close the six current defects by adding Q-016 to the
finding inventory (including the reproduced classification/context edges), the
verified correction identity UUID, direct custody links for the consolidation,
initial-review and loop-review threads, a complete paused proof-thread continuation,
an unambiguous Q-30 plan path and accurate membership-versus-evidence wording.
Clarify that any future resumption must reconcile interactive Q-30 custody before
scheduled pickup. The separate consolidation Routine's platform state remains
unverified. Preserve identities, historical facts and every outstanding obligation.

Exact PR #82 comment custody: `3943677468` (Q-016 inventory), `3943677469` (UUID),
`3943677471` (future resumption), `3943678006` (thread indexes), `3943678022`
(proof continuation), `3943678035` (path), `3943678045` (evidence description).
`3943677464` is the historical commit-policy deviation; record it and route the
rule reconciliation to C05 without rewriting merged history. Full post-merge
review connections were exhausted on 6 September; fixes and thread settlement
remain pending this follow-up. Do not label C01 complete before that evidence.

C03 is further sliced after inspecting the draft's roughly 1,800 changed lines:
C03a local checkout/CLI walkthrough, C03b API and source-local examples, C03c
response/transport/MCP/migration guides. Preserve the full local-entry draft and
extract each coherent outcome into a fresh worktree; validate every executable
example on its rebuilt target. Ignored-option leads extend the existing finding's
case inventory and require discriminating runtime reproduction under C08.

### C02 round-two structural step-back

The first review pass on `49ad9e43` exposed drive-identity coverage; a subsequent
review bound to `142b3980` exposed silent whole-map reset. These successively
narrow the counter-integrity concern and trigger ADR-051 clause 4(c). The
Parallax/proportionality step-back inspected the complete lifecycle instead of
patching only the reported missing-map instance. Independent review found early
STOP/bookkeeping drives could bypass the lifecycle and a delayed counter landing
could resurrect a retired entry. The structural repair requires the map, retains
zero only for absent PR entries, applies one common lifecycle to every actual
authorised scheduled PR drive, and reconciles late observations into retired
delivery evidence. No scheduler, service, threshold or new validator is added.

The live harvest also distinguished a comment's current diff binding from its
originating review commit; the canonical harvest now retains the latter. The
actual tally remains one PR comment. Verification after this response is beyond
the expected authoring budget and is recorded as such: the generator was
incomplete path/state coverage in a human procedure, and the bounded lifecycle
walkthrough addresses it. Neither the budget nor this step-back weakens correctness.

The independent structural recheck verified map admission, new/adopted and
STOP/bookkeeping drives, early endings, retries, late increments after merge,
closed-unmerged custody and crash limits. No remaining procedural gap was found;
this is non-code walkthrough evidence, not a scheduled firing or final-head gate.
