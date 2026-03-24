# Start Right: @engraph/castr

Use this prompt at the start of a new session, after a context switch, or whenever work starts feeling too local and you need to re-anchor on architecture, doctrine, and execution discipline.

## Outcome

Before doing substantial work, re-establish all of the following:

1. the user impact we are trying to create
2. the real current entry point for the workstream
3. whether the session should investigate, design, or execute
4. the architectural layer where the problem should be solved
5. the evidence and completeness bar that will prove the work is correct

The standing question is:

> Are we solving the right problem, at the right layer?

## Read In This Order

1. [AGENT.md](../directives/AGENT.md)
2. [principles.md](../directives/principles.md)
3. [testing-strategy.md](../directives/testing-strategy.md)
4. [requirements.md](../directives/requirements.md)
5. [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
6. [practice-index.md](../practice-index.md)
7. [sub-agents/README.md](../sub-agents/README.md)
8. [invoke-reviewers.md](../rules/invoke-reviewers.md)
9. [session-entry.prompt.md](./session-entry.prompt.md)
10. [active/README.md](../plans/active/README.md)
11. [roadmap.md](../plans/roadmap.md)
12. the primary active plan named by `session-entry.prompt.md`
13. any companion or paused workstream explicitly linked from the primary plan or session-entry prompt
14. the ADRs and durable architecture docs named by that active plan

Do not treat archived plans or stale prompt fragments as the source of truth when a durable doc or current active plan says otherwise.

## First Questions

Ask and answer these before committing to an approach:

1. What impact are we trying to create for the user with this change?
2. What is the source of truth for this problem after parsing?
3. Is the issue a standards gap, IR gap, parser/writer contract issue, canonicalization choice, or upstream runtime/dependency issue?
4. Is the current workstream in investigation mode or execution mode?
5. What measurable evidence will prove success?
6. What surface must become complete end to end before this work is honestly done?

## Non-Negotiable Principles

These rules are absolute.

1. **Cardinal Rule:** after parsing, input is discarded; the IR is the source of truth.
2. **No Content Loss:** format may change, content may not.
3. **Strict And Complete Everywhere, All The Time:** do not relax constraints to "make things work," and do not claim support until parser, IR, runtime validation, writers, proofs, and docs agree.
4. **Fail Fast And Hard:** unsupported patterns must throw with helpful errors. No silent fallbacks, degraded output, or swallowed failures.
5. **Deterministic Output:** identical input must produce byte-for-byte identical output.
6. **No Escape Hatches:** no `as` (except `as const` where governed), `any`, `!`, or `eslint-disable` in product code.
7. **ADR-026:** use ts-morph AST plus semantic APIs for TypeScript-source parsing. No regex or text heuristics in `src/` parsing paths. Data-string parsing is allowed only when centralized, validated, tested, and fail-fast.
8. **Centralize Or Fail:** every parsed data format gets one canonical parser/utility, not scattered ad-hoc logic.
9. **No Tolerance Paths:** rules apply everywhere or they are not rules.
10. **Generated Output Rule:** when inspecting generated files, inspect the generator code as well.
11. **TDD At All Levels:** write failing tests first and prove behavior at the smallest seam that can honestly carry the change.
12. **Explicit Dependencies Only:** every package used in product or test code must be declared explicitly in the consuming `package.json`. Relying on transitive dependencies is forbidden.

## Working Posture

1. Start by understanding the codebase and current workstream state before changing code.
2. Prefer durable architecture over local patching.
3. Treat `docs/architecture/*` and `docs/architectural_decision_records/*` as permanent truth.
4. Treat plans as execution tools, not architecture storage.
5. Respect the primary-versus-companion plan split documented in [active/README.md](../plans/active/README.md).
6. If the primary active plan is investigation-first, do not jump into implementation until its execution trigger is satisfied.
7. If the active workstream says proven remediation stays in `active/`, do not hide known fixes in `future/`.
8. If durable doctrine changes, update ADRs or permanent docs instead of leaving conclusions only in a plan.

## Planning Standard

Any new or substantially updated plan must include:

1. the user impact to optimize for
2. explicit scope and out-of-scope boundaries
3. assumptions that must be validated
4. measurable success criteria
5. a stage map or architecture map when semantic loss or representational drift is involved
6. option families or fix families compared at the right architectural layer
7. TDD order
8. documentation outputs:
   - TSDoc where code changes warrant it
   - markdown documentation where user or maintainer guidance changes
   - ADRs where doctrine or architecture decisions change
9. an execution trigger or clear completion criteria
10. the canonical quality-gate protocol from `DEFINITION_OF_DONE.md`

## Implementation Standard

When the active workstream is ready for execution:

1. write failing tests first
2. prefer pure helpers and narrow seams before broad rewrites
3. keep parser/writer logic centralized
4. preserve IR honesty even when interchange formats are lossy
5. fail fast instead of silently canonicalizing away user-visible semantics
6. update durable docs when behavior, doctrine, or architecture meaning changes
7. if a newly discovered legitimate gap appears, explicitly triage it:
   - include now
   - queue it in the active workstream
   - or record it durably as later-scope work if it is truly outside the current slice

## Practice Box

At session start, also check:

- `.agent/practice-core/incoming/`
- `.agent/practice-context/incoming/`

If files are present, treat them as incoming Practice exchange material and integrate them through the local Practice rather than leaving them stranded.

## Quality Gates

Run from repo root, one at a time, in this exact order:

```bash
pnpm clean
pnpm install --frozen-lockfile

pnpm build
pnpm format:check
pnpm type-check
pnpm lint
pnpm madge:circular
pnpm madge:orphans
pnpm depcruise
pnpm knip
pnpm portability:check

pnpm test
pnpm character
pnpm test:snapshot
pnpm test:gen
pnpm test:transforms
pnpm test:e2e
```

Rules:

1. all quality gate failures are blocking
2. run the gates one by one, not as a bundled analysis step
3. do not analyze failures until the full sequence completes
4. after the sequence completes, ask whether any failure points to a deeper architectural issue rather than a local bug

For one non-mutating aggregate command, use `pnpm check:ci` (or the local `pnpm check` which also auto-fixes formatting).

## Session Close-Out

Before ending the session:

1. promote durable findings into docs or ADRs
2. make sure the active plan reflects the real next step
3. update `session-entry.prompt.md` and `roadmap.md` if the entry point changed
4. avoid leaving critical context stranded only in commentary or ephemeral notes
5. leave the next session with one obvious place to start
