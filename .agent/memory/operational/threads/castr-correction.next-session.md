# Castr correction

## Continuation route

State at the 2 November 2026 boundary (Bilby hunts Dreamscape, d71882), written for a
successor on any platform: everything that matters is here or in the files this section
names, never only in an agent's private memory. Verify each line against the live
repository before acting.

- **State on 18 November 2026 (Ingot binds Patina, 194219), which the lines below predate:**
  the branch's pull request was not opened on 2 November; it is opened on 18 November.
  #119 cured the two `@hono/node-server` alerts of 13 November (`SHA:d3077124`), with the
  floor at 2.1.7 because upstream's 2.1.7 release closes GHSA-fj57-4f93-cfw6, which 2.1.6
  leaves open. The served Oak documents have moved since
  the 25 September pins: v1 is `info.version` 1.1.1, and v0 has new bytes under the same
  0.11.2. Neither the pins nor the served documents contain any `allOf`, so the eight
  `allOf` sites the review record measured on 21 September are in no document Castr holds.
- **Specification 0.5.2, approved on 18 November 2026, verbatim "I approve version 0.5.2":**
  SPEC-G-1 says an open alert holds merges unless the clause names it. An alert with no
  patched version needs a trace (is the code used, is the function needed, can it be done
  another way) and its own amendment. An alert is never dismissed.
- **MEASURE ran on 18 November 2026:**
  [its table](../../../analysis-and-reports/measure-2026-11-18.md) scores today's generator
  on the documents served that day, one operation at a time, against Ajv on the source
  schemas. Both whole documents are rejected, at the schema-valued `additionalProperties`
  of the two `check-restricted` responses; the other 30 operations generate. Every `const`
  is written as its bare type, the one construct whose generated Zod disagrees with the
  source. Media types, response headers, security on the endpoint, source defaults as
  annotations and the `paths` type are absent. The table gives no verdict; the reflection
  with the owner is next.
- **OWNER RULING, 18 November 2026, at the start of the reflection, verbatim:** "I don't want
  to move the code until we have defined what working and working well looks like, what
  correctness means, and explored if we can reach that state in isolation. Moving broken
  code into another repo seems like it can only cause further problems". MOVE does not
  start until both are done. Every statement of the course's order further down this record
  predates the ruling; the course plan carries the hold, and the legs before MOVE are
  rewritten when the reflection settles them.
- **THE REFLECTION'S DECISIONS, 18 November 2026 (owner, by card), which replace "until both
  are done" in the bullet above.** Asked what "in isolation" meant, the owner said, verbatim:
  "I mean make the Castr code in Castr as correct as we can, and working with Oak documents
  (specifically the latest v1 open api spec for the curriculum api) and a variety of other
  examples specs, which I assume corresponds to the example input library. Are there any
  tensions or inconsistencies in my request?" The seat found six tensions (the napkin's
  entry lists them) and carded three. The owner chose: correct includes how the code is
  built, "As the specification says (Recommended)"; before the move, "Oak documents pass
  here first (Recommended)"; other example documents, "Never wrong, never crashes
  (Recommended)". So the code travels, made correct here: SPEC-C-1's first acceptance part
  passes in this repository on both Oak documents, and the example library's OpenAPI
  documents are each converted exactly or refused with a located rejection, before MOVE. A
  repair that adds no text-building goes into today's code; new writer output is built as
  syntax-tree nodes; the model changes only after its design (SPEC-N-1) is an approved
  amendment. The course's order is now PICTURE, PLOT, the legs PLOT writes, HOME, MOVE.
- **OWNER CORRECTION, 19 November 2026, verbatim:** "Reflecting the decision back to me is
  not helpful. Use the cognitive skills to break down the questions, analyse them, review
  them from multiple perspectives, and form better questions. This process must involve
  stepping back, identifying assumptions and frames and deeply challenging them. Once the
  better questions exist, use the principles and cognitive skills to run them through the
  decision matrix. Read the Directives for guidance on our philopsophies". It answered a
  draft amendment (0.6.0) that defined working, working well and correct by quoting card
  labels; the draft is withdrawn and no amendment is pending. The cards' answers stand as
  what the first two decision lenses force, not as questions that needed asking. Read OCE's
  `principles.md`, `user-collaboration.md`, `definition-of-delivery.md`, `tdd-as-design.md`
  and the rules `present-verdicts-not-menus` and `design-from-impact-not-the-cowpath`
  before putting anything to the owner: a recommendation-bearing decision is not a
  question, and joint reflection is discussed in prose.
- **OWNER RULING, 19 November 2026, verbatim: "Drop v0, latest v1 only".** Specification
  0.6.0, approved on 20 November 2026 ("I approve 0.6.0"), makes the v1 document at its
  latest published version SPEC-C-1's corpus; the corpus holds one pin (1.1.1). It also
  takes the picomatch advisory's name out of SPEC-G-1: GitHub closed that alert on
  19 November and the owner said "we don't need to track a non-problem". The consuming
  repository generates from an August copy of v0 and moves onto v1 before any swap.
- **OWNER'S STANDARD, 20 November 2026, verbatim: "What I want is to not have to rework
  Castr if Oak adds an additional, valid field type to their spec".** It answered the
  seat's statement that reference documents may be refused where Oak does not use a
  construct. Read by the seat as: Castr supports the format; a valid construct is
  converted, never refused; refusal is for invalid documents and exclusions the owner
  approves; the example documents are the proof for constructs Oak does not use yet. Next:
  a first enumeration ran on 20 November
  ([its report](../../../analysis-and-reports/constructs-2026-11-20.md)): of 94 constructs,
  44 right, 14 wrong, 19 crashed, 4 not measurable alone and 13 not judged, none refused in plain words. Specification
  0.7.0, approved on 20 November 2026 ("I approve 0.7.0"), makes the standard SPEC-PR-6:
  no `NOT-YET-BUILT` rejection is reachable from any valid document of the source format,
  and the required check runs one case for every construct kind the scope-and-fidelity
  table lists. Something the target cannot express stays a located rejection and is
  listed in that table, which the owner approves.
- **STATE AT THE PAUSE, 20 November 2026 (owner asked the seat to stop and wrap).**
  - `main` is at specification 0.7.0 (#133). Merged on 19 and 20 November: #129 to #133.
    No dependency alert is open; the daily picomatch check is deleted at the owner's word.
  - **Pull request #134 is open and not merged** (branch
    `chore/continuity-check-and-generators`, napkin and this record only). Its last commit
    is local and not pushed. Three review threads are open on it. Dispositions the seat
    reached and has not yet posted: (1) Codex says a generator should stay a capability
    of its own, total over the model, and not be recast as a pair; this is a real
    counter-position to the seat's "a capability is always a pair" and is NOT settled:
    take it to the next amendment draft as an open design point, do not resolve it by
    assertion. (2) Copilot says the napkin states "no silent skip" as if established while
    product code has default branches that return `undefined` or emit `unknown`
    (`writers/typescript/type-writer/core.ts`) and hand-kept construct lists; taken, the
    entry states a proof obligation, not a fact. (3) Copilot says "one case per construct
    kind" should stay a requirement of its own and not move into SPEC-G-4; taken, it
    matches the adversarial review.
  - **Draft amendment 0.8.0 is withdrawn before the owner saw its text.** An adversarial
    review (20 November) found it weaker than 0.7.0 as drafted. What survives: the proof
    in SPEC-G-4 must reach beyond the one-document corpus; the check needs both a
    construct list computed from each format's published definition and one case per kind
    per pair that must end in the class its row names; `UNEXPRESSIBLE` is allowed only
    where a row says so; a parser's refusals (invalid input, an unsupported version, a
    profile exclusion) need a rejection kind of their own; unknown keywords, `x-`
    extensions and unlisted `format` values need explicit rows; SPEC-C-1's acceptance
    words change with SPEC-G-4. No amendment is before the owner.
  - **Next work, in the course's order (PICTURE, then PLOT).** PICTURE is next, and its
    first part is its row list: compute the construct kinds of OpenAPI 3.1 from its
    published definition (the 57 keywords of the 2020-12 vocabularies shipped with Ajv,
    plus OpenAPI's own fields), propose each row's class for the pairs of SPEC-C-1, and
    bring that list to the owner. The PICTURE command is that list made executable. The
    list is a proposal in a report; writing it into the specification as the
    scope-and-fidelity table (SPEC-N-5) is an amendment, and PLOT sequences it, as the
    course says. Any amendment is drafted against the list and reviewed adversarially
    before the owner is asked for words.
  - **The row list is written (20 November, on the owner's word "go ahead with PICTURE's
    row list").** It is
    [picture-rows-2026-11-20.md](../../../analysis-and-reports/picture-rows-2026-11-20.md):
    278 rows with a proposed class each, and seven findings for the owner. The largest:
    126 rows (document content, serialisation rules, things said about a boundary) fit
    none of the four classes for a Zod target; 26 Zod rows need a check function Castr
    writes; 3.0 and 3.2 documents add rows that have no class yet. Next: the owner's
    answers to those findings, then the PICTURE command with one case per row.
    It landed with #135 on 20 November. Rows review named after the last change, owed to
    the PICTURE command: `discriminator.defaultMapping` (3.2), and one row for each of
    the five values of `xml.nodeType` (3.2: `element`, `attribute`, `text`, `cdata`,
    `none`). Every 3.2 field in the report's section F still needs a class.
  - **Six decisions, by question prompt, 20 November 2026.** The owner asked: "please
    present me with your questions, give me enough context with each one to make a
    decision without having to read through the chat history". The answers are decisions
    about what the specification will say. None is an approval of specification text;
    that still needs the owner's own words naming a version (SPEC-CC-2).
    1. Rows that fit none of the four classes (126 for Zod): "Add a fifth class", for
       meaning outside what a target is for, barred from schema keywords, `type` values
       and `format` values.
    2. The 26 Zod rows that need a check function Castr writes: "Carried; Castr marks its
       checks", so a later Zod reader can recognise them and read them back.
    3. A `format` value Castr has no checker for: "Carry and report". It is an annotation,
       named in the run report, never a refusal; SPEC-P-3 gains a sentence.
    4. Integers. The owner first answered, verbatim: "I need you to suggest the best
       options here, step back and consider the intended impact and desired user value
       first. Whatever we decide, it must be clearly communicated, especially if it is a
       transformation that means the reverse transformation does not give back the
       original semantic meaning". The seat proposed one profile clause for every
       integer, not an int64 rule, and the owner answered "Accept the clause": the model
       keeps the integer exactly; Zod and TypeScript write `number` and Zod asserts a
       safe integer, so a too-large value is refused and never accepted rounded; the run
       report, the TypeScript comment and a Zod annotation state the narrowing; reading
       that Zod back gives `integer, format: int64` again. A `bigint` output mode is a
       later capability. This is not what the code does today: the present Zod and
       TypeScript writers emit `bigint` for `int64`, and that code changes to `number`
       under this decision.
    5. What the reader refuses by design (an unread dialect, OpenAPI 2.0, an invalid
       document): "Add a third kind" of rejection. It never counts toward `NOT-YET-BUILT`
       and its cases are listed in the specification.
    6. Versions that must be complete before OpenAPI to Zod and TypeScript is done: "3.1
       and 3.2". 3.0 follows later. So every 3.2 row in the report's section F needs a
       class, and the Read column's 3.0.x needs words for what it means until then.

    A draft amendment carrying all six in nine changes was written the same day and one
    adversarial review broke it before the owner saw it; it is withdrawn. What the
    redraft must hold, from that review:
    - A rule quantified over a hand list reopens the 0.7.0 loophole. "A `format` value
      the table does not list is an annotation" lets a missing row weaken silently. The
      rule is: a value no specification of the source format defines is an annotation; a
      defined value with no row or no checker is `NOT-YET-BUILT`; a construct met in a
      valid document with no row is `NOT-YET-BUILT`.
    - A case may end in `NOT-YET-BUILT` naming its row, or the check is red by design.
    - "Ends as its class defines" needs an ending per class, and a case must state its
      construct so that deleting it changes a decision or an annotation. Carried as
      structure and outside the target each need a proof that the value is held.
    - The fifth class's bar is the decided, mechanical one, extended to boundary slots
      and to naming. `xml` and `xml.nodeType` are said about a shape and are reclassed as
      carried as structure. The four rows the parser spends (`openapi`,
      `jsonSchemaDialect`, `$schema`, `$vocabulary`) are computed kinds with no class;
      the owner has not decided them.
    - `NOT-READ`: validity is decided by a conforming validator independent of Castr's
      parser; the subset and value-domain cases arise only from a Zod source; a valid
      OpenAPI or JSON Schema document at a listed version never receives it; its cases
      sit in a numbered clause.
    - The published definitions are named and pinned, with an extraction rule and a list
      of corrections (`link.body` is `server`). Zod has none; Appendix A is its row
      source.
    - Integers: the true statement is that integers outside the safe range collide and a
      JSON parser returns the nearest; a non-integer that a double cannot hold is rounded
      before any validator sees it and cannot be refused, which the owner has not
      decided; a source bound, `const` or `enum` member beyond the range is documentation
      and never a number; a Zod reader reads a Zod integer as unbounded, a stated profile
      reading; "an integer" is every schema whose `type` admits `integer`.
    - The mark holds the construct and its arguments as data, and a marked function that
      is not the one Castr emits is refused. Section 11's "executable Zod refinements"
      needs its exception. No marked-check row can be built before SPEC-N-3 states the
      mark.
    - A 3.0.x document is refused before any construct is read, with one rejection
      naming a numbered later capability; section 6 and SPEC-PR-6's "granularity" need
      words.
    - Serialisation rows are outside the target for Zod and TypeScript, and SPEC-C-1's
      first acceptance part requires them proved. The endpoint definitions have no table,
      so they are proved only on the corpus document. The owner has not decided this.
    - The rules bind nothing while SPEC-N-5 is unwritten, so the vocabulary lands with the
      tables, not before them.

    The owner decided those three points by question prompt the same day, numbered on
    from the six above:
    - **Seven.** A decimal with more digits than a JavaScript number holds is rounded by
      the JSON parser before any validator sees it: "Declare once, per run". The
      specification states the limit as a profile decision for JavaScript targets and
      every run's report carries one plain statement of it. The model still holds numbers
      exactly.
    - **Eight.** Serialisation rules: "Yes, a third column". Every row is classed for the
      endpoint definitions as well as for Zod and TypeScript; serialisation rows are
      carried there and each has a case that runs. A generator's output has a table as a
      format's does.
    - **Nine.** The four rows the parser spends (`openapi`, `jsonSchemaDialect`,
      `$schema`, `$vocabulary`): "A separate sixth outcome". The fifth class keeps the
      owner's bar as stated (no schema keyword at all), and a named outcome, read, covers
      these four declarations.

    Next: the PICTURE command, whose cells use the five classes and the read outcome as
    proposals, in three columns (Zod, TypeScript, the endpoint definitions), and whose
    cases show which rows hold. The amendment follows it, in parts small enough to close:
    the reader's rejections and versions; numbers in JavaScript targets; the table
    vocabulary together with the tables.

  - **For the owner, said and not yet answered:** `principles.md` contradicts itself
    (its four rules against "objects are always closed" and against `patternProperties`
    to TypeScript as a correct refusal) and needs the owner's approval to edit. The
    owner's three facts of 19 November (most code not yet written; the consumer uses v0;
    a correct Castr is stricter than today's validators) were given and drew the v1-only
    ruling; where the new code is written was not revisited.
  - **Scratch files are volatile.** The construct probe is preserved in the appendix of
    `.agent/analysis-and-reports/constructs-2026-11-20.md`. The withdrawn draft and the
    commit helper live only in the session scratchpad; the helper's two tricks are in the
    napkin (the `diff.renames` setting for moves; staging removals by name first).
- **WRAP, 20 November 2026: what the loss scan found beyond the state above.**
  - **Promises the seat made, each forwarded here.** Answer and resolve #134's three
    threads. Rehearse the consumer's generation step against a Castr build with no file
    moved (said on 19 November, never run). Run the cases owed to the command (offset
    date-times, astral characters in length limits, a closed-object `allOf` over a shared
    property, whether non-validating keywords are carried). Bring the owner the exact
    before and after of any amendment only after adversarial review. Say to the owner
    when a first measurement is provisional.
  - **Inference, not observation.** Why GitHub closed alert 122 (the seat's reading: the
    lockfile change in #130 made it re-read a withdrawn advisory). That the parser drops
    `discriminator`, `deprecated`, `readOnly` and `writeOnly` (a reviewer's report plus a
    text search that finds no mention of the last two; not traced). That Oak's toolchain
    bounds which constructs it can emit (an idea for ordering the rows, never checked).
    The consumer-side reader's count of 18 rewrites and their classes (a subagent's
    report; two of its facts were verified, the rest were not).
  - **What the scan cannot see.** The session was compacted once; anything from before
    18 November that the summary dropped is not in this record unless the napkin holds
    it. The two subagents' contexts are gone; only their reports survive, quoted in the
    napkin. Review bots read diffs, not the whole tree.
  - **Where outside eyes caught what the seat missed (point scrutiny here).** Every
    amendment draft (0.6.0 draft of 19 November, 0.7.0, 0.8.0) had a loophole of one
    shape: a check quantified over a list nothing forces to be complete. Every first
    measurement moved under review. Plan and record edits left a stale sentence elsewhere
    in the same file on most pull requests: after changing a scope or a count, search the
    whole estate for the old wording before pushing.
  - **Index of homes.** Decisions and the owner's words: this record and the course's
    "Order of the legs". Mistakes, tool notes and owed cases: the napkin's entries of 19
    and 20 November. Measurements: `.agent/analysis-and-reports/measure-2026-11-18.md`
    and `constructs-2026-11-20.md`. Provenance: `docs/THIRD_PARTY_NOTICES.md`. The seat's
    per-user memory holds no ruling made for Castr; every Castr ruling is in this record
    or the course. It holds standing rulings from the owner's other estate, and those
    that bind work here are: a question for the owner goes through a question prompt; a
    reviewing agent's finding is information to test, never authority; a clean, green
    pull request is merged without asking; a review is requested only when none has
    arrived or the area is sensitive; history is merged, never rebased.
  - **Fixed point.** A further pass re-finds only the promises and inferences listed
    here; the recursion closes. Deep consolidation is not run, by the owner's ruling of
    1 November 2026 (recorded in the continuity file).
- **Next work: PICTURE (the course's todo).** One repeatable command that shows what Castr
  does on each document, judged from outside Castr; the MEASURE probe is its first drawing.
  It is the owner's "what working looks like". No approval is waiting on the owner today; one lies ahead, named next. The
  specification needs one phrase changed (§10, "early in the course"), by an approved
  amendment before MOVE (the course's HOME todo). Put to the owner on 19 November as a fact they did not
  have: about 26,500 of 35,655 product lines are the model or written against its shape, so
  what moves after being made correct is mostly code not yet written; the owner's word of
  18 November (make it correct here) stands until the owner says otherwise.
- **EC-0 of the example-input library, 19 November 2026.** `ATTRIBUTION.md` names the
  OpenAPI Initiative, the Swagger Petstore authors and Oak National Academy;
  `docs/THIRD_PARTY_NOTICES.md` gives each licence, the source commit each unchanged file
  matches, and how Castr changed the five it has changed (four OpenAPI Initiative files
  and the Petstore file, which now opens with the notice Apache 2.0 asks for). It also
  covers an earlier Oak document held outside the corpus (`arbitrary/oak-api.json`) and
  the files under `normalized/` that Castr derives from third-party documents. Every claim
  was re-read from the source repositories that day. The fetch script and its dependency
  are gone: a newer copy of an example is a new pin recorded in the notices file. The
  plan is in `active/` and continues at EC-1.
- **The matrix pass of 18 November 2026.** The owner had the items left open by that day's
  work run through OCE's decision matrix. Three survived, all the owner's: what travels (the
  reflection), whether this public repository gets a licence file, and whether the
  user-home paths in three archived napkins stay. By card the owner chose to reflect now,
  to add the MIT text in the owner's own name and to scrub the paths. The seat settled the
  rest, and the napkin's entry for the pass holds each disposition: MEASURE's defects are
  not cured in the present code before the reflection, the eight `allOf` sites are only in
  the consumer's cached copy, the branches and the stash are left, and the example-input
  library starts at EC-0 beside the reflection.
- **Destination:** [the specification](../../../../docs/SPECIFICATION.md), version 0.5.2,
  status `ratified` since 2 November 2026 (0.5.0 at `SHA:0e2ca07a`, 0.5.1 at
  `SHA:1a7631ac`, 0.5.2 at `SHA:8ef18e43`; all on `main` since #120, `SHA:3ff0fd2e`). It is the only description of Castr's destination. The owner: "this work has drifted and drifted and now I think we need a
  destination that can only change with process and agreement"; "approval happens locally,
  only I or mantagen can approve". Mantagen is a human collaborator. Approval is spoken
  locally in a working session and the agent records the words, the date and the content
  hash in the change log (SPEC-CC-2); an agent never writes an approval it was not given
  in that session. Merging the specification's pull request is mechanics an agent performs
  (the drafting agent had written "no agent merges"; the owner ruled on 23 September that
  this was invented, and SPEC-CC-4 is retired).
- **The ratification walk ran on 2 November 2026.** The owner asked for every open
  question to go through the decision matrix of the Engraph Open Curriculum Ecosystem (its
  `principles.md` §Decision Lenses, with the survival tests in its
  `route-blocks-and-questions-to-director` and `owner-attention-at-action-moments` rules),
  then for the survivors as decision cards with enough on each card to decide. The
  survivors were the specification's checklist entries and two profile mismatches raised
  by OCE's `docs/architecture/oce-integrity-and-castr.md`. All 30 were decided. Draft
  0.5.0 carries every decision; its change-log row names what changed and which wording
  is the drafting agent's, and the checklist section is removed.
- **Approval, 2 November 2026, in this session, verbatim:** "I approve draft 0.5.0 , if we
  need to review and change it later that is fine." Recorded per SPEC-CC-2 in
  `SHA:0e2ca07a`: the status set to `ratified` (the only change above the change log), the
  words, the date and the SHA-256 of the bytes above the change-log heading
  (`f7dc6661…52edb2`, re-verified from the commit). Rows 0.2.0 to 0.4.1 read "none".
  From ratification the whole document changes only by approved amendment (SPEC-CC-1).
  The owner then approved 0.5.1 the same day, verbatim "I approve 0.5.1": SPEC-CC-3's
  latest approved record is the latest ever approved, so a change log without a record
  always fails. The SPEC-CC-3 check is written (`SHA:5d264896`, with the shared helpers at
  `SHA:592a4cdc`) and enforces that reading (`SHA:1a7631ac`); it lands with the ratified
  file. The branch is the one the owner named for this work on
  1 November ("We are on a new branch"); `main` has had zero open alerts since #118, so it
  merges with analysis like any pull request, and a new alert would bring back the
  cure-only rule (SPEC-G-1).
- **Alerts, 2 November 2026:** #117 cured the 30 (`SHA:31f49532`); Dependabot then raised
  six advisories `pnpm audit` had reported. #118 cures them, forcing minimatch 11, glob 14
  and KaTeX 0.19 and patching eslint-plugin-import-x with upstream's pending fix, by the
  owner's card "Patch import-x". #118 merged (`SHA:acd9d2b0`); `main` had zero open alerts
  at 15:00Z. `main` is merged into the branch (`SHA:3c46a764`, lockfile regenerated by
  pnpm). At the compaction boundary of 2 November the branch is pushed and its pull
  request is opened as the last act before the seat stops; shepherd it with
  `engraph-pr-lifecycle` (its review tally is the first comment to post).
- **The gap described in the next bullet is cured on 18 November 2026** by the pull request
  stacked on the ratification one: the check also reads `origin/main`'s copy of the
  specification and fails when an approval record there is missing here or has another
  digest. A base that is still a draft holds no record; the continuous-integration
  `static-checks` job fetches full history so that `origin/main` is there to read.
- **Known gap in the SPEC-CC-3 check, found by the wrap's promise sweep on 2 November
  2026 (stated to the owner the same day):** the check enforces 0.5.1's concrete clause, that
  a change log with no approval record fails, but not its general principle, that "the
  latest approved record is the latest ever approved". Deleting only the newest approval row
  and reverting the text to the previous approved version would pass. Cure in its own pull
  request straight after the ratification pull request: the check also compares the
  branch's approval records with `main`'s and fails if any is missing, which needs CI to
  fetch `main`. Each forced dependency floor and the import-x patch name their own removal
  condition in `pnpm-workspace.yaml`.
- **Next owner interaction (superseded on 18 November 2026: the reflection ran; the bullets
  above carry what follows it):** the reflection on MEASURE's table, which decides what travels
  into OCE; run it with the owner as concept exploration over the table, not as a decision
  matrix (owner: "Measure without making decisions, drop the thresholds, we figure out what
  we have, then we reflect on it"). Until then the work needs no owner decision: the
  branch's pull request, then MEASURE (the course, and the plan approved by the owner on
  2 November). The alert cures, the SPEC-CC-3 check and PROBE are done.
- **Owner rulings of 1 and 2 November 2026, verbatim where quoted:** the two goals,
  "bringing Castr into a requires compliant and functioning shape" and "migrating Castr
  into OCE", which "do not supersede previous plans, they are part of enacting the
  previous plans"; no consolidation pass unless it serves those goals (quoted in full in
  `repo-continuity.md`); every linked worktree deleted (done on 1 November; branches and
  the stash kept); "All Castr work happens via AST not via string manipulation. Where
  string manipulation is unavoidable, ask _why_" (now in SPEC-AR-3 and in ADR-026's
  amendment), with a further card the same day: where string manipulation seems unavoidable
  the work stops and asks the owner, and an exception exists only as an owner-approved
  entry in the specification (none is approved); and, the same day, "No strings refers to the
  compiler/decompiler/ and associated state and systems, not to the logger, loggers use
  strings"; "Strike the condition, Castr will move
  into OCE and be fully integrated" (§10); "Where appropriate make sure that logging is
  explicit and informative, and make sure that we respect "strict, everywhere, all the
  time"" (SPEC-PR-8).
- **Course:** [castr-course.md](../../../plans/active/castr-course.md). Order, fixed by the
  owner on 21 September: ALERTS, RATIFY, MEASURE (a throwaway probe scoring today's
  generator on the pinned Oak corpus against the source document with an independent
  validator; its verdict — evolve the present model or rebuild — decides what MOVE
  carries), MOVE (into the Engraph Open Curriculum Ecosystem repository as workspaces,
  fully integrated there; this repository is then archived), PLOT. ALERTS is open again:
  30 open dependency alerts on `main` on 2 November (3 critical, 8 high). The course now
  runs ALERTS, RATIFY (lands with the SPEC-CC-3 check), MEASURE (decides nothing), the
  reflection with the owner (decides what travels), CURRENCY and RULES (both only for code
  that travels), MOVE, PLOT. PROBE ran on 2 November; its table is
  `.agent/analysis-and-reports/oce-lint-probe-2026-11-02.md` (769 findings, 39 rules).
- **Owner decisions by card, 2 November 2026, after the approval (verbatim):** MEASURE:
  "Measure without making decisions, drop the thresholds, we figure out what we have, then
  we reflect on it" (the agent had proposed an 80% `exact` threshold; it is dropped).
  CURRENCY: "After MEASURE, scoped (Recommended)" — after MEASURE, scoped to the code that
  travels, none on archived code, `agent-tools` outside it either way. Lint rules: "At
  move the OCE rules will apply, the point of applying them early is to fix issues in
  isolation before moving" — read as a RULES leg after CURRENCY and before MOVE on the
  code that travels, restoring the owner's 1 November order "dependencies, then rules"; the
  owner confirmed that reading by card the same day ("Yes, as read"). These replace the agent's earlier
  departure (rules applied at MOVE), which the owner had never approved. vitest 4 and tsup
  8 stay held at OCE's majors.
- **Evidence:** [the specification review record](../../../research/castr-specification-review-2026-09-21.md)
  keeps what six reviewers measured on 21 September (the Oak API specification's feature
  inventory, its eight `allOf` sites that accept no value — the owner fixes those at
  source — the consumer's code-generation contract, Zod 4.5.4's behaviour, and the list of
  documents that disagree with the specification). Not one measurement was re-verified by
  the session that wrote the record.
- **Evidence gathered on 1 November 2026:** [the Sonar analysis](../../../analysis-and-reports/sonar-issues-2026-11-01.md)
  (380 open issues on `main`; 211 in Practice tooling, 117 in code the specification
  condemns; nothing urgent). The Scalar probe and the lint-configuration findings are in
  the napkin's 2 November section.
- **Landed on `main` since the 21 September close:** #111 (dependency alerts to zero,
  `SHA:fc94488f`) and #109 (component identity chain, `SHA:8b0aa438`, two review rounds).
  The owner's ruling on #109 was "land it frozen"; the working rule drawn from it is the
  agent's wording, not the owner's: nothing more goes into the present writer code, and a
  review finding against the present model is cured only when it blocks a landing,
  otherwise dropped with the reason stated to the owner. The present model fails SPEC-AR-1 (OpenAPI vocabulary as structure,
  mandatory Zod output text on every node) and the writers fail SPEC-AR-3 (text emission);
  building on it as if it will last is the error the course exists to end.
- **Merging:** the owner granted agents `gh pr merge` for green-and-clean pull requests on
  21 September; the permission rule lives in the agent's local, unversioned settings on
  the host that was used, so a new host may need it again. Green and clean means every
  check passing, no unresolved review thread, no new static-analysis issue, and no open
  dependency alert on `main` that holds merges. Since 0.5.2 an alert that SPEC-G-1 names
  does not hold them. Read that alert's patched-version field at every merge: it holds
  merges again once its advisory names a patched version old enough to install, and no
  pull request will announce that, because Dependabot security updates are off here. The
  clause names the alert only while nothing a user of Castr supplies reaches the
  vulnerable code, so read each change for a new call into a glob matcher with user input
  too; one that adds such a call goes to the owner before it merges.
- **Written off on 21 September 2026 by owner ruling:** every dirty worktree and orphaned
  branch, and pull requests #11–#13, #15–#18, #20, #21, #23, #26, #27 and #81 (closed; commits
  reachable at `refs/pull/<n>/head`). Nothing of theirs is evaluated or recovered. The plans
  `unmerged-work-to-main-or-deleted.md` and
  `castr-documentation-and-fidelity-correction.md` carry `status: superseded` and are in
  `.agent/plans/archive/`.
- **Standing owner rulings that govern every session:** long-term architectural excellence
  over short-term expediency, always; strict, everywhere, all the time; no failing test,
  check or validator is ever tolerated ("'Red by design' is utterly unacceptable, that was
  never true"); no work is routed to any list or future plan, under any name — a finding
  is cured in its own next pull request or dropped with the reason stated, and a known gap
  lives in a tested `NOT-YET-BUILT` rejection; green in a pull request means no
  static-analysis issue in new code, and the specification is met only while `main` has
  zero issues; dependency-update pull requests land on green without analysis; the
  Practice-enhancement lane in this repository is stopped (a more advanced Practice comes
  later from the owner's other estates); the Practice is always vendor-agnostic, so
  everything that matters is written to the repository, never only to one platform's
  memory; where the owner names a Director session, team members own their own work and
  contact the Director only for a second opinion or a suspected rabbit hole (owner's word
  of 23 September 2026 as relayed by the Director, Wick binds Temper; the owner's own
  message that day named the Director as the route for questions).
- **Behavioural corrections from the owner, 21 September, that a successor inherits:**
  "slow right down" — one thing at a time, one gate at a time, never parallel gates on
  this host; a permissive instruction ("dependency PRs land without analysis") is not a
  licence to skip care (two errors followed: a misread `pnpm why` output cited the wrong
  consumer, and a copy-pasted test failed the static-analysis duplication gate); a record
  is never written ahead of its outcome; an owner statement naming who decides is never
  widened by the agent into a prohibition on who executes (the invented merge clause).
- **Behavioural corrections of 1 and 2 November 2026 that a successor inherits:** run
  every owner-bound question through OCE's decision matrix before asking it, and ask the
  survivors as self-contained decision cards with the recommended answer first, never in
  prose (the owner asked for exactly this after an unmatrixed prose question); quote the
  owner's words, and label a rule the agent derived as derived; read a register row to its
  status column before calling it open (QD-1 and QD-10 were closed by the owner on
  26 August); when a plan reorders the owner's sequence, state the change and every hold
  it inherits.
- **What the 2 November boundary left in context only:** the two Cricket panels' returns
  (their corrections are in the napkin's 2 November entries), the full text of the
  decision cards (every answer is verbatim in the napkin's 2 November entry, and the
  non-default answers are quoted in the specification), and the scratch frames and probe
  scripts. Bounds of this scan: the owner's view of the stated plan departures is known
  only from silence, and the comms watcher saw no other agent in the two days.
- **Collaboration state:** Bilby hunts Dreamscape holds claims on the files it edited
  (`active-claims.json`, gitignored) and closes them at its session's end. On arrival,
  register on the comms stream and arm the all-channels watcher before any edit.
- **Host:** on 2 November the load averages were 2 to 6 on 14 cores with no linked
  worktrees; on 21 to 23 September the machine was swap-starved. Check `uptime` before
  running gates.

## History (dated evidence; none of it is live direction)

### Continuation route of 23 September 2026 (superseded on 2 November 2026)

State at the second 23 September 2026 close (Mussel mends Buoy, 372325, after Poppy calls
Topsoil's close the same morning), written for a successor on any platform: everything that matters is here or in the files this section
names, never only in an agent's private memory. Verify each line against the live
repository before acting.

- **Pull request #110 merged on 23 September 2026** as `SHA:75f47abd` (head
  `SHA:4080cbf8`, 16 of 16 checks, no unresolved thread, no dependency alert on `main`),
  carrying the specification, the course plan, the review record and this record. The
  owner's instruction was "land 110 properly, and then we will re-assess". Its one review
  round (Copilot, 17 threads on `SHA:9b3ae0de`) was verified finding by finding and cured
  in draft 0.4.0: every changed clause is on the ratification checklist, the two
  superseded plans are archived, and the session-continuation prompt, roadmap and practice
  index name the course plan as primary. One finding, a new source-anchored boundary check
  for C-1 acceptance, was kept out of the text as a missing requirement rather than a
  contradiction; it and the reading of a source `default` stand on the ratification
  checklist as two decisions for the owner. The pull request's `REVIEW-TALLY` comment
  records each disposition. The merged branch `claude/castr-destination-spec-2026-09-21`
  is left in place; deleting it needs the owner's word.
- **What the 23 September close deliberately left in context only:** the six reviewer
  transcripts (their measured facts are in the review record; nothing else of theirs is
  needed); the drafting reasoning behind each specification clause (the clause and its
  owner quotation are the decision-sufficient compression); the exact wording of the
  decision cards (the decisions are in the specification's change log and the course
  plan). Bounds of that close's own scan: it could not see review comments that arrived on
  #110 after `SHA:9b3ae0de`, and no measurement in the review record was re-verified. The
  next session re-verified only the facts the round-1 cures rest on: Zod 4.5.4's
  `z.iso.datetime()` rejects offsets and `z.lazy` is read by calling its getter (both
  executed), and Draft-07 has no vocabulary mechanism.
- **What the second 23 September close left in context only:** the three reviewers'
  reports on the round-1 cures (the corrections taken are in the specification and the
  commit messages of `SHA:ee970674`, `SHA:8c9b3c50` and `SHA:4080cbf8`; the suggestions
  dropped, with reasons, are in the napkin's 23 September section for Mussel mends Buoy),
  and the 17 thread replies' wording (on the pull request).
- **Next owner interaction:** the owner re-assesses the course now that #110 has landed
  (owner, 23 September 2026). Input prepared for it: the napkin's concept-exploration
  entry on how one review round moved the ratification checklist from 15 entries to 31,
  with three proposals, each with its warrant and falsifier. The course's next leg, unless
  the re-assessment changes it, is the ratification walk — one decision card per entry of
  the specification's ratification checklist, each in
  plain language with its reason and its cost, recording confirm, change or strike; then
  the owner's spoken approval recorded per SPEC-CC-2 and the status set to `ratified`.
- **Course:** [castr-course.md](../../../plans/active/castr-course.md). Order, fixed by the
  owner on 21 September: ALERTS (done: `main` has zero open dependency alerts since
  `SHA:fc94488f`), RATIFY, MEASURE (a throwaway probe scoring today's generator on the
  pinned Oak corpus against the source document with an independent validator; its verdict
  — evolve the present model or rebuild — decides what MOVE carries), MOVE (into the
  Engraph Open Curriculum Ecosystem repository as workspaces; all wiring and the removal of
  every other description of the destination happen once, there, with no tombstones; this
  repository is then archived), PLOT.
- **Collaboration state:** no claims are active (Mussel mends Buoy's claim on the #110
  files closed at the merge). Bora seeks Turbulence's five stale claims
  from 9–10 September were closed on the owner's word ("Bora is gone") on 21 September. On
  arrival, register on the comms stream and arm the all-channels watcher before any edit.
- **Host:** on 21 September the machine was swap-starved with 36 worktree registrations and
  `fseventsd` near 100% CPU; on 23 September swap stood at 21.5 of 22.5 GB and the load
  near the 14-core count. Check `uptime` before running gates. The Codex comms watcher
  started 9 September from the `castr-correction-custody` worktree, which belonged to no
  live session, was stopped on 23 September under the owner's instruction to stop all
  processes at the close.

- Governing sequence for every inherited PR and dirty worktree: the
  [12 September value-proof sequence](../../../plans/archive/castr-documentation-and-fidelity-correction.md#12-september-value-proof-sequence).
  Containers are evidence about gaps; a gap in product code is proven only by a failing
  test on unpatched main, and proof lands with its cure in one green-and-clean PR;
  documentation-only content is proven by the owner's explicit approval of the text,
  sought in its PR. That sequence's container-closure clauses are suspended (see the
  fifth-close bullet).
- Live state at the 20 September fifth close (Candle weaves Residue, a4c7fb), the input
  for the plan the next session creates and works strictly to:
  Owner rulings at the fifth close, verbatim substance, in force for every future session:
  (1) "closing the PR by closing the PR achieves nothing, it's the WORK that matters...
  work that exists only on a branch and not in a PR or merged is at risk, work that we
  don't want needn't be on a branch... what you have done is kicked the can down the road
  while making it harder to know what we do and do not have." (2) "nothing is dealt with,
  and absolutely purge the idea that work can be routed to a bucket of later, whatever
  that bucket is called." (3) "never disable or skip a check of any kind." (4)
  "post-compaction you will create a plan, you will work strictly to that plan, and you
  will not invent outs for yourself."
  State: main is `SHA:8a9b55a4`. Thirteen PRs are open: #11, #12, #13, #15, #16, #17, #18,
  #20, #21, #26 and #27, reopened at 23:2xZ after ruling (1) reversed the closures of
  this day, plus #23 and #81. No branch was deleted; no work was landed from any of
  them. PRs #103 (`SHA:8a53cc78`), #102 (`SHA:8ca0db05`), #101 (`SHA:0ad80a41`), #104
  (`SHA:11715614`), #105 (`SHA:902a9e0f`) and #106 (`SHA:8a9b55a4`) merged today; the
  first three carry real work, the last three carry records.
  False state on main that the plan corrects before anything else: the proof contract's
  "transferred to the gap register" clause (correction plan §Unit of work and proof
  contract, the "Consequences for containers" paragraph) and item 2's "closes its PR
  through the register transfer" sentence are retracted to the 12 September wording (a
  source PR closes only when every claimed gap is cured on main, disproven, or ruled
  unwanted); queue row Q-34's wording follows; the delivery ledger's live-status cells
  for the eleven PRs above say closed while the PRs are open; the research README's
  closure records describe closures that did not stand. The measurements in those
  records stand: the per-delta tables, the probe table (fifteen of eighteen new test
  files from seven containers are red on unpatched main), and #20's two red suites.
  Defect chain found by applying #26's formatter fail-fast to main (three failures:
  `maybe-pretty.test.ts` "returns input on syntax error", the snapshot
  `name-with-special-characters`, the characterisation case "schema names that are
  JavaScript reserved words"): `builder.schemas.ts:107` stores `toIdentifier(name)` as
  the IR component name while every `$ref` keeps the wire name, so
  `typescript/index.ts:116,137` miss the component and skip the declaration silently,
  `zod/index.ts:129` and `type-writer/core.ts:28` emit the reference verbatim
  (`safeSchemaName` only suffixes built-in globals; the type writer projects nothing),
  `maybe-pretty.ts` swallows the invalid output, the inline snapshot enshrines
  `response: 1Name-With-Special---Characters,` with empty declaration sections,
  `markdown/index.ts:128` swallows a malformed reference into `Ref`, and
  `openapi-writer.components.ts:74` writes components under the mangled IR name, a
  wire-name loss on the OpenAPI round trip. `toIdentifier` already yields valid symbols
  (`_1_Name_With_Special_Characters`, `class_`); no unit test covers
  `identifier-utils.ts`. Doctrine: the IR carries the wire name; rendering makes valid
  symbols through one projection with a fail-fast injectivity check; a dangling
  reference throws; a snapshot changes only where its expectation is the defect, with
  the diff reviewed. PR #18's identity slice is a reference for these seams, derived
  independently.
  Constraints the plan works under: TDD with the failing test first; one gate at a time;
  one landing per PR carrying its proof (for product code the red test on unpatched
  main and its cure; for documentation-only content the text with the owner's approval
  sought explicitly in the PR); every check
  runs and passes, none skipped, disabled, loosened or updated away; every delta of
  every open PR is landed on main or deleted with the reason in the commit, and a branch
  is deleted when nothing on it remains; no routing verbs anywhere; the OCE
  `pr-lifecycle` and `proportionality` skills; the probe method (copy a container's new
  test files onto unpatched main, run, remove) as the way to see what a container proves.
  Housekeeping: an empty local branch `claude/fail-fast-formatter-2026-09-21` sits at
  main with no commits; the tree was returned to main's content by writing the file
  forward. No process of this session remains; a Codex watcher from 10 September
  (Bora seeks Turbulence, pid on this host) still runs from the
  `castr-correction-custody` worktree and is not this session's.
- Loss event, found 20 September: the `castr-q07-zod-fixture-runner` worktree lived under
  `the system temp directory`; the temp purge removed its `.git` file and all six dirty files between
  13 and 20 September. The 12 September inventory row (git history, `f8a744c2`) is the
  only record; the 143-line E2E test was never committed anywhere and must be re-derived
  from PR #21's runner test. Dirty worktrees now number 10, not 11.
- The next planning input is the owner-commissioned
  [20 September deep review](https://github.com/EngraphCode/castr/pull/101#issuecomment-5750407866)
  on PR #101, read in full and summarised in the plan's §20 September review. It states
  the owner's requested outcome (known defects exercised by required CI, CI red while
  they remain) and asks for one revised, dependency-ordered repair plan in the active
  plan. Its correction that main excludes no default-only operations is verified and
  applied; its compiler and CI findings are not yet in the register.
- Owner instructions at the 13 September close, in force for the next session:
  1. Delivered: the bootstrap merge-driver cure is PR #103, merged as `8a53cc78`, red
     test first, the pure derivation unit-tested with no FS or git I/O, no machine-local
     path stored. Every checkout now needs its own `agent-tools/dist` build for
     memory-file merges: 16 of the 36 registered worktrees had none at the close and
     halt on a memory-path merge with a module error naming their own missing driver
     until `pnpm install` runs there.
  2. The stash is not the owner's decision and "least privilege" is not "never": Codex
     needs to run code and reach the network in some contexts. The question is which
     surface carries a context-dependent capability; it is
     [Q-018](../open-questions.md) and stays open. Do not drop the stash.
- Next safe step: create the plan (an executable repo plan) from the fifth-close bullet,
  with the owner's four rulings as its constraints, and work strictly to it. Its first
  landing corrects the false state on main named there; every later landing takes one
  container or one defect to main or to deletion.
- Defects in the merge-driver registration found by PR #103's review, each landed or
  deleted by the plan, none routed: (1) the registration's readback covers the registering checkout only; either
  enumerate every linked worktree's effective binding or qualify the "arms every linked
  worktree" clause in CONTRIBUTING, the semantic-merge skill and the registration TSDoc;
  (2) a refused name-key write after a successful driver-key write reports "not armed"
  while the tripwire is armed, so read the driver key back before reporting; (3) a
  failed readback drops git's stderr; (4) the `.gitattributes` mapping covers
  `.agent/memory/**/*.md` only, so the JSON registers under `.agent/state/collaboration/`
  still line-merge; (5) `verify-pr.sh` re-arms the driver on every exit path in the old
  absolute-path shape and retires with its containers once #101 lands; (6) two team
  prompts under `.agent/prompts/agentic-engineering/` require `pnpm install && pnpm build`
  in a worktree for gates and now also for memory merges, and harness-created worktrees
  are never installed (Q-019); (7) `resolveRepoRoot` reads the ambient project-directory
  variable unless `projectDir: undefined` is passed, a hazard for bootstrap code run from
  a worktree. Estate facts: nine temp-directory worktree registrations are prunable
  skeletons; the shell profile exports a GitHub token into every child process, so rotate
  it if any transcript leaves the machine.
- Completed transition: the Q-09 brief plus the
  [source PR table](../../../plans/delivery-ledger.md#source-pr-dispositions).
- PR custody and next delivery action: [delivery ledger](../../../plans/delivery-ledger.md).
- Transition: Q-09 is complete. PR #90 merged the complete PR #28 preservation
  record as `cb73c4de`; PR #28 then closed without merge and retained its recovery
  branch. PRs #94/#95 delivered PR #10's surviving validator and machine-state
  boundary; #10 then closed and retained its recovery branch. Surviving findings live
  in the correction findings register, and the displaced enum/nullability decision
  lives as Q-017; pending semantic carriers remain open.
- Team: root owns compiler/foundational documentation and integration. Kite hunts
  Eyrie delivered C05 Cricket tooling in PR #88; Bora seeks Turbulence delivered its
  installation in PR #91 as `af840d9b`. PR #92 corrected the premature atomic closeout.
  Final I2 is now complete: the fresh trusted task retained all six final-template
  native returns with `fork_turns: "none"` and same-agent adversarial follow-ups.
  PR #93 delivered the evidence/lifecycle record as `07ebdb23`. Q-06 then delivered
  PR #14's four-file dependency correction through PR #98 at merge `0c3d4bdc`; source
  PR #14 closed without merge with its recovery branch retained. The coordinator now
  begins Q-07/PR #21 from current `origin/main`, starting with fresh reproduction and
  exact source-delta custody. M4 is reproduced; the rest of Q-07 remains pending.
  The broader C05 family retains the obligations
  named below. Coordinate expensive aggregate runs and re-read actual claims before edits.
- Source: PR #81 at `SHA:33be633862864ce8efb22e70abbbe9bce863c510`, never rewritten.

The ledger records delivered C01R, Q-19, C03a, operation-security, Error-oracle
and C05 platform-tooling repairs. Q-22 remains open for its integer,
generator/output and remaining oracle
obligations. Q-09 is complete. C05 retains
PR skill attribution and rule/reference cleanup; C10 retains
observed review/continuity-authoring failures and final isolated-pack acceptance.
C03b/c source drafts remain preserved. PR #18's document-security presence and
identity obligations remain open. Displaced continuation text is
[conserved verbatim](../../../plans/archive/correction-sequencing-2026-09-06.md#9-september-pr86-merge-and-q22-continuation).

## Preparation retained for later slices

C03a’s fresh worktree demonstrated build, CLI generation, strict compilation,
successful parsed values, distinguishing invalid witnesses, deterministic bytes
and actionable missing-input failure. An isolated local-pack rehearsal also passed
from the preserved draft; C10 still requires the final-main committed-fixture run.
C04a can consolidate three duplicate ADRs into their originals and repair three
exact ADR links without importing unrelated stale successor-plan wording.

C08/Q-016 preparation reproduced an additional enforcement gap on `SHA:e025d233`:
ESLint boundary folder patterns ending in `/**/*` leave direct children unknown.
Root-folder descriptors reveal parser dependencies from context and six writer
contract dependencies on context, alongside the known conversion edges. Its
closing proof must cover real resolver and element classification, type imports,
re-exports and production-to-test-helper dependencies. The correction plan retains
this discovery for the architectural repair; no implementation is claimed here.

## Participating agent identities

| Agent                  | Platform    | Model            | Session prefix | Agent UUID                           | Role                                           | First session | Last session |
| ---------------------- | ----------- | ---------------- | -------------- | ------------------------------------ | ---------------------------------------------- | ------------- | ------------ |
| Bora seeks Turbulence  | codex       | gpt-6-astra      | 01a072         | 2b847d50-adfe-50d7-a93c-c5ac58ba45a2 | coordinator and PR shepherd                    | 2026-09-06    | 2026-09-10   |
| Coal weaves Pumice     | claude-code | claude-fable-5-1 | f67c69         | d0dfc3a1-ed69-535c-96bd-03c07648c274 | handover analysis, value-proof sequence        | 2026-09-12    | 2026-09-20   |
| Foxglove weaves Acorn  | codex       | gpt-6-astra      | 01a088         | a6955478-7b8e-59e9-870e-dcef0d6e81cd | final Cricket I2 proof                         | 2026-09-10    | 2026-09-10   |
| Candle weaves Residue  | claude-code | claude-fable-5-1 | a4c7fb         | 6803f4ef-dcc2-5305-a2c8-b82944f21b0f | bootstrap merge-driver cure, PR lifecycle      | 2026-09-20    | 2026-09-21   |
| Poppy calls Topsoil    | claude-code | claude-fable-5-1 | bf551f         | (seed-derived; not registered)       | PR closure, PR #109, destination specification | 2026-09-21    | 2026-09-23   |
| Mussel mends Buoy      | claude-code | claude-opus-5-5  | 372325         | b69485ad-3a77-5c8a-b2c0-cc764d734103 | PR #110 round-1 cure and merge                 | 2026-09-23    | 2026-09-23   |
| Smith stirs Ashes      | claude-code | claude-opus-5-5  | 7bd175         | 02ed168a-55c7-5450-8fdb-b7fd399d9c86 | Sonar analysis (sub-agent)                     | 2026-11-01    | 2026-11-01   |
| Bilby hunts Dreamscape | claude-code | claude-opus-5-5  | d71882         | 767b6de5-9347-5fdb-bbdf-eeb98791ec13 | review, ratification walk, draft 0.5.0         | 2026-11-01    | 2026-11-02   |
| Ingot binds Patina     | claude-code | claude-fable-5-2 | 194219         | 8fde4762-1621-5ce7-b563-2d0f4f647804 | alert cure, RATIFY landing, MEASURE, 0.5.2     | 2026-11-18    | 2026-11-18   |
