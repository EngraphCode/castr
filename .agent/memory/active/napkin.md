# Napkin

This file captures session-scoped discoveries, mistakes, corrections, and useful patterns before they are distilled or promoted into permanent docs.

## 2026-07-18 (L-F PR #16 review-response round — worktree wf_6f9f06c9-91e-2)

- **A type-driven completeness lock only protects keywords the type VOCABULARY knows** (Codex P2,
  `additionalItems`). The guard's position table is `Record<classified-keywords, shape>` so the
  compiler forces coverage — but Draft 07 `additionalItems` was absent from `Draft07Input` AND the
  base `SchemaObject`, so it was invisible to the lock, leaked through `stripDraft07Keys`'
  rest-spread as an UNTYPED excess property, and silently dropped at parse: valid Draft 07 tuple
  remainder constraints were ignored. Cure: model the keyword (flat key on `Draft07Input`), map it
  in the tuple step (`items` array → `prefixItems`, `additionalItems` → 2020-12 `items`), reject
  boolean forms explicitly, drop only the spec-dead non-tuple form, and add it to the guard table.
  One-sweep audit (mine + json-schema-expert, independently): `additionalItems` was the ONLY
  missing sub-schema position — every other Draft 07/2020-12 applicator is present, and
  `$dynamicRef`/`$recursiveRef`/`$dynamicAnchor` are strings, correctly absent. Red-first: 8 new
  tests (5 mapping/drop, 1 boolean rejection, 1 guard rejection, 1 end-to-end IR carry) all red
  before the fix, 84/84 green after; the "drops dead additionalItems" pins were red BEFORE the fix
  too — proof of the untyped leak, not just the missing mapping.
- **A document-wide recursive guard is a false-positive engine: recursion must follow the
  grammar, not the object graph** (912644d4, Codex P2). The Draft 07 `$ref`-sibling guard
  recursed through EVERY object/array value, so `$ref`-shaped instance data under `default` /
  `const` / `enum` / `examples` was "detected" as a reference and the document falsely rejected.
  Class-eliminating cure: recurse only through sub-schema-bearing keyword positions, with the
  position table typed `Record<keyof Draft07SubSchemaKeywords | flat-keys, shape>` so the
  compiler forces the guard to track the normalization pipeline's single keyword-classification
  source. Red-first: 3 acceptance tests failed at `#/default`, `#/const`,
  `#/properties/link/default` before the fix; 3 new rejection pins (items/then/definitions
  entry) plus all 5 existing guard cases stayed green throughout.
- **A carrying fix creates an emission debt at every writer, and reviewers WILL find the one you
  skipped:** 1bfbdd9 taught the parsers to carry `$ref` siblings and made the OpenAPI writer emit
  them, but left the JSON Schema writer's bare-`$ref` early-return in place (even documented it as
  an egress rule). Both review bots flagged it as P1 within hours: carrying data into the IR that
  your own format's writer then drops is a round-trip regression, not a style choice. Lesson:
  when ingress fidelity improves, sweep EVERY egress of the affected pair before closing the slice.
- **`{ ...boolean }` is `{}` — spread-normalisation silently inverts boolean JSON Schemas:**
  `normalizeDraft07(false)` produced `{}`, turning reject-all into allow-any at every object-typed
  keyword position (properties, $defs, allOf, items, not, contentSchema, boolean roots). Probes
  proved four distinct corruption sites from one root cause. Fix shape: preserve booleans where the
  typed pipeline can carry them (roots, if/then/else, contentSchema, unevaluated*), reject
  explicitly (with the `{}` / `{ "not": {} }` object-form migration hint) where the shared OAS seam
  types are object-only. Never let a type-system boundary become a silent semantic rewrite.
- **Dialect-declared input deserves dialect-faithful handling:** the parser normalises everything
  to 2020-12 semantics and ignored `$schema`, so a declared Draft 07 document with `$ref` siblings
  (dead per Draft 07) had them silently ACTIVATED. Resolution: fail fast on declared-Draft-07
  `$ref` siblings with migration guidance; undeclared/2020-12 input keeps sibling carrying.
- **Out-of-lane finding recorded for disposition: the Zod writer still emits only the referenced
  name for `$ref` IR nodes** (writers/zod/index.ts `writeSchemaType`), so carried siblings
  (e.g. `minLength`) are lost on JSON-Schema → IR → Zod; `writers/zod/**` is forbidden to L-F
  (L-B surface). Needs a lane or follow-up slice.

## 2026-07-17 (L-F lane, H4 nested $ref siblings + L14 array parity — worktree wf_6f9f06c9-91e-2)

- **A fix wired at one level of a recursive structure is the SAME bug one level down:** the H4
  sibling-carrying fix landed at the parser's top level while three per-file copies of
  `parseSingleSchemaOrRef` (helpers, object-fields, 2020-keywords) plus an inline `items` branch
  still stripped refs to bare `{ $ref }` at every nested position. Red-first proof: 12 of 14 new
  nested-position tests failed before the fix. The cure was structural, not additive — route the
  FULL reference object through `parseSchema` (whose `$ref` path already carries siblings) and
  consolidate the three copies into one exported helper, so no future nested position can drift.
  Consolidate-at-second-consumer applied late is exactly what left the copies behind.
- **NEW FINDING (out of this lane's scope, needs a home): `convertUnionSchema`'s
  `cloneWithoutSharedKeywords` silently deletes `prefixItems`, `unevaluatedItems`,
  `unevaluatedProperties`, and `dependentSchemas` before union-member conversion**
  (conversion/json-schema/convert-schema.ts) — so union-typed schemas BYPASS both L14 fail-fast
  rejections (the keyword is gone before the applier can see it) and silently drop tuple info.
  The L14 asymmetry cure landed this session (unevaluatedItems now fails fast exactly like
  unevaluatedProperties in the non-union path); the union hole is shared symmetrically by both
  keywords and predates this lane. Candidate for the remediation backlog.
- **`CastrSchema.items` is `CastrSchema | CastrSchema[]`** — tests touching `items` need an
  `Array.isArray` narrow before member access; caught by tsc, not by the (green) vitest run,
  re-proving lint+typecheck-after-edit over test-green-only.

## 2026-07-18 (PR #19 Copilot findings — samples-config-escape lane)

- **A helper built to kill a directory-argument defect can re-import it at another call shape:**
  `resolvePrettierConfigForOutput` anchored prettier resolution on the OUTPUT PATH, but for the
  tag-file/method-file grouping strategies the output path IS a directory (the renderer writes
  `index.ts` and per-group files beneath it), so the parent-walk escape the helper existed to
  eliminate came straight back for grouped outputs. When a defect is about an argument's KIND
  (file vs directory), enumerate the kinds at every call site of the cure. Fix: directory targets
  anchor on a representative child (`<dir>/index.ts`); detection reuses the renderer's own
  `isFileGroupingStrategy` (now exported — second consumer). Caught by Copilot review; red-first
  proven at both the pure and real-FS levels.
- **In-process purity cure shape that worked:** an injected resolver seam (`resolveConfigFn`
  defaulting to prettier's `resolveConfig`) makes the unit suite pure (it records the anchor path;
  no FS IO), and the real-filesystem decoy-config proof moved to `tests-snapshot/integration/`
  beside `samples.test.ts`. Every proof the old FS-touching in-process test carried was re-homed,
  none dropped.

## 2026-07-04 (wide+deep initial castr review — Fragrant Twining Glade / 5367e2)

- **All five open Criticals (C2–C6) re-confirmed firsthand on today's main (`8bfc858`)** by
  re-running the initial-review probe recipes against the built dist — AND→OR security collapse,
  dangling `Basic_Thing` refs, empty-`properties` deserialize throw, silent union-member drop with
  `errors: []`, and the `typeof item === 'integer'` / `return true` placebo refinements all
  reproduce verbatim; the same tree passed full `pnpm check` (exit 0, FULL TURBO) minutes later.
  Green-gates-mask-gaps is the PRESENT state, not history. Home: the review report
  (`.agent/report/wide-deep-review-2026-07-04.md`).
- **C6 sharpened: the no-op refinements are deliberate scaffolding, not bugs** — the writer source
  literally emits `return true` bodies with reassuring messages. Interim doctrine-compliant cure is
  a fail-fast throw, which is a small diff landable with the first harness PR.
- **New findings R1–R6 recorded in the report**, headline: `parseJsonSchema` / the JSON Schema
  writer / the TS writer are NOT exported from any public entry point (verified against dist) while
  `VISION.md` claims the format complete — and `requirements.md` still says "JSON Schema: Deferred";
  the IR carries Zod chain strings computed by EVERY parser (`metadata.zodChain`), contradicting
  the format-agnostic-IR principle; `IRSecurityRequirement` is structurally flat so C2 is an
  IR-model change, not a builder fix.
- **A stale doctrine claim one day old:** `principles.md` §Tooling Integration still says no TSDoc
  lint is wired; RS-4 made `tsdoc/syntax` blocking the day before. Doc-drift latency is now shorter
  than doc-review latency — strengthens the case for the doctrine-claims validator (report §7 #5).
- **Verify-firsthand paid out on the workflow inventory:** both spot-checked load-bearing numbers
  (2323 tracked files; lib non-src composition) matched the subagent census exactly; the census was
  usable as-is with the two checks recorded.
- **OWNER DIRECTIVE (post-review): record everything across surfaces + plan a TOTAL OVERHAUL of
  the planning/strategy/vision estate organised around the appropriate impacts and principles.**
  Landed this session: the overhaul plan
  (`plans/future/strategy-vision-estate-overhaul.md` — W0 owner walk + W1 vision / W2
  strategy+continuity / W3 claims-truthing+validator / W4 plans-tree / W5 measurement);
  Q-012..Q-015 registered (second-product naming, vision topology, preservation-coverage metric,
  principles.md truthing batch); verified-claims thesis → pending-graduations (PDR candidate);
  two distilled entries (claims-drift-faster-than-review-cadence → computed claims; re-review =
  execute the prior probes first); continuity spine + prompt + roadmap + remediation-02 banners.
- **Double-enqueue specimen (self-inflicted):** my first `commit-queue enqueue` succeeded but its
  bare-UUID stdout was eaten by my own `grep -E 'intent_id|error'` filter, so I enqueued again →
  duplicate intent, abandoned with notes. The queue CLI prints ONLY the raw intent UUID on
  success; filter for UUID shape or take the tail line, never grep for field names. Same
  verify-own-observer-instruments family as the pipe-eats-exit-code entry.

## 2026-07-06 (n=2 team window: fold + close — Fragrant Twining Glade / 5367e2 + Mistbound Fading Night / fe1498)

- **Contention-flake instance in the n=2 window:** the pre-commit gate's
  `claims-concurrency.integration.test.ts` failed at 9.65s under a busy 2-core window (the peer's
  probes ran concurrently), green in isolation at 4.6s — the KNOWN timing-marginal class (CI cure
  was `--concurrency=1`); local cure is coordinating heavy runs around the commit window (now in
  the team comms discipline), never timeout inflation. Classified by the rerun-failed probe.
- **cwd drift masquerading as state loss:** after a `cd agent-tools && vitest` call, the shell
  cwd PERSISTED; the next repo-root-relative reads reported the comms directory missing and the
  CLI unloadable — reading as drastic tree damage. `pwd` before concluding ANY state loss; prefer
  absolute or explicitly re-rooted paths in every compound command.
- **Probe-outranks-read, peer instance (Mistbound):** an Explore agent's code-read called the C4
  empty-properties path "benign"; the peer's firsthand probe against dist threw
  `Invalid CastrDocument structure` — the read was wrong, the probe decisive. Same family as
  reviewer-disagreement-resolved-by-probe (2026-07-03).
- **Reviewer-fold shape that worked (overhaul plan):** two readiness reviewers (assumptions +
  docs-adr) on a same-day strategic brief; every load-bearing claim re-verified firsthand before
  folding (the git-diff orphan-line confirmation, the roadmap ✅ table, ADR ceiling, ledger
  absence). One BLOCKING finding each; both real; owner-walk minimised to three genuine forks via
  the Four-Lens test.
- **candidate: a closeout event's "claims ALL closed" is a TIMESTAMPED claim a second same-session
  work-block can stale** (Mistbound's fold-in): they read my live claim as dead-session residue
  because my earlier closeout narrative said all closed — the live registry, not the closeout
  narrative, is the truth surface. New sub-shape of the session-start-snapshot-goes-stale family
  (user-memory sharpening candidate at next consolidation).
- **candidate: watcher initial-drain marks pre-arm events SEEN without emitting them** (Mistbound):
  events landing before the watcher armed are consumed silently; only the catch-up sweep surfaced
  my earlier team-start to them. Re-proves sweep-on-every-wake AND adds the arm-time variant —
  candidate sharpening for `comms-all-channels-watcher` §catch-up sweep (run a sweep at ARM time,
  not just on wakes).

## 2026-07-03 evening (pre-castr doctrine sync RS-1..RS-4 — Cirrus Spiralling Airstream / 8bff79)

- **Pathspec-scoped queue commit + pre-commit auto-format leaves a STALE INDEX BLOB for a
  formatter-touched file:** the pre-commit formatted `gh.ts` and committed the formatted version,
  but the index kept my earlier pre-format `git add` blob — the file then read `MM` (staged diff
  REVERTING the formatting) at the next status. Harmless but alarming; cure is re-`git add` the
  file to re-sync index with worktree (= HEAD). Watch for it whenever the formatter touches a
  file inside the commit-queue `commit` workflow.
- **TaskOutput with block:true on a still-RUNNING background agent dumps raw JSONL transcript into
  context** (large; nearly a context bomb). Only call TaskOutput on agents after their completion
  notification, or use short non-blocking peeks on the summary file, never the transcript.
- **`eslint-plugin-tsdoc` bring shape (RS-4):** Oak's enforcement is lint-only (`tsdoc/syntax:
'error'` + root `tsdoc.json`), no validator. castr's pre-existing surface was 385 errors, 293
  files of which were a REDUNDANT `@module <path>` header convention with zero consumers (no
  TypeDoc) — the tsdoc skill's checklist already said remove them; enforcement finally made the
  checklist fire. Vendor type mismatch (plugin's optional rule `meta` vs core's RuleDefinition
  under `exactOptionalPropertyTypes`) cured with a type predicate at the vendor boundary
  (`isEslintPlugin`), not an assertion — the ADR-020 validate-at-boundary shape at the type level.
- **F-95 gate fired correctly on a DEAD peer's unexpired claim** (Bellows closed 18:51; their 4h
  commit-window claim was residue): the gate can't distinguish dead-session residue from live
  peers, so the cost is one comms-watcher arm — acceptable; but a session-close that "closes ALL
  claims" can still leave an unexpired residue row (Bellows's closeout said all closed, one
  remained). Verify-own-closeout applies to claim closure too.
- **Three-batch parallel comment-fix fan-out worked cleanly** (192 tsdoc violations, 59 files, 3
  agents, zero collisions by file-disjoint batching, each self-verified with scoped eslint; my
  firsthand re-verify: whole-workspace lint + type-check + unit suite green). Balanced by
  violation count, not file count.
- **PR #7 wave dispositions (both decided by measurement):** (1) Copilot's asPlugin
  error-message nit — real, fixed `a40d9b2`. (2) Codex P1 "lint will fail immediately on
  existing `catch {}` sites" — REJECTED with falsifying evidence: `preserve-caught-error` only
  fires when a NEW error is thrown inside the catch; all four named sites are non-throwing
  fallback catches, lint exit 0 on the exact files + both whole workspaces + server-side CI at
  both heads. A bot's assertion about a LINT RULE'S SEMANTICS is an inherited classification to
  measure against the rule's actual firing condition — same family as
  dont-dismiss-tools-as-false-positive, in the inverse direction (here the TOOL RUN was the
  ground truth and the reviewer's model of the rule was wrong).
- **Reviewer disagreement resolved by probe, worked instance:** config-expert live-probed the
  root tsdoc.json as DEAD (resolver stops at each workspace's package.json) while the gateway
  code-reviewer asserted the opposite mechanism ("walks up from each source file") without
  probing. My own probe decided it (1 = undefined-tag error at lib/src). When two reviewers
  contradict, the one with a probe wins pending your own; never average them.

## 2026-07-03 (external note: resonance Tranche-1 transplant — Resonance transplant coordinator / claude-fable-5)

- **`plan` skill references templates that do not exist on disk (hollow reference, PDR-096 shape):**
  `.agent/skills/plan/SKILL-CANONICAL.md` points at `.agent/plans/templates/README.md` and
  `templates/components/{quality-gates,lifecycle-triggers}.md` as the "live inventory", but castr has
  no `.agent/plans/templates/` directory (verified by find during the resonance PDR-005 transplant
  survey, 2026-07-03). Every plan-authoring pass here follows a dangling pointer. During its
  Tranche-1 transplant, resonance initially authored minimal scaffolding, then superseded it with
  the real graft source: **Oak has the full templates estate at
  `oak:.agent/plans/templates/`** (README + 7 templates + 10 components) — an earlier version of
  this note wrongly claimed Oak shared the gap; owner-corrected 2026-07-03. The gap is castr-only.
  Cure: graft the templates estate from Oak (or from resonance's Oak-derived adaptation); either
  way the `plan` skill's live-inventory reference should stop dangling.

- **Two brought gates fired IN ANGER for the first time, same afternoon — the loop-closure programme
  paying out live:** (1) the LC3c watcher step-deadline killed my comms watcher fail-loud (`drain`
  > 60s, fatal exit, `kind=timeout` line) during a transient FS stall — silent-hang-turned-loud
  > exactly as designed; catch-up sweep showed zero missed events, re-arm clean. (2) The freshly
  > hardened pre-commit caught `repo-check markdownlint-staged` as a HOLLOW transplant on its FIRST
  > real staged-Markdown commit (it exec'd Oak's `markdownlint` binary; castr ships `markdownlint-cli2`)
  > — my pre-landing green-run had "proven" the chain, but with an EMPTY staged set the action
  > short-circuited before the broken exec. Lesson sharpening the prove-it-fires bar: a gate's green
  > run must carry REPRESENTATIVE INPUT for every branch it guards, or the pass proves the
  > short-circuit, not the gate. Fixed RED→GREEN (`markdownlint-cli2 --no-globs`, literal paths).
- **Codex wave-5 dispositioned 5/5 fixed (`922e51f`), one going deliberately past a recorded parity
  disposition:** the staged-bundle reader now resolves trusted git although the rescan recorded
  Oak's leave-commit-path-execs-by-name posture as matched parity — the fingerprint feeding a
  TRUSTED commit exec via an UNTRUSTED PATH git was an inconsistency worth the divergence
  (back-flow candidate). Also: message-file subject verification de-tautologised (fresh-read dep at
  both verify stages); valued long-option matching fixed at the MATCHER level (stronger than adding
  a spelling); amend + long interactive-rebase blocked with safe negations proven permitted.
- **Attribution error under concurrency (3rd stale-snapshot firing today):** I labelled Bellows's
  claimed in-flight statusline work "owner WIP" — their claim opened AFTER my last registry read.
  Before attributing ANY dirty file in a team window, re-read the claims registry at that moment;
  a dirty file + no claim in my snapshot ≠ unclaimed.
- **Held-bundle pause discipline worked end-to-end:** owner pause → broadcast the exact
  staged/unstaged inventory with do-not-sweep instructions → peer's pathspec ceremony + the owner's
  own hand-landing (`9f12d49`) both honoured it; nothing lost, nothing duplicated. The inventory
  broadcast is the piece that made three concurrent writers safe around one shared index.
- **Q-010 ruling reach noted for the corpus brief:** `use-result-pattern` is now a BRING and a D4
  Result-migration slice is named (Bellows landed the reach, `1226d9f`); the corpus-analysis brief's
  "Result→throw adaptation" bring-cost line is superseded in DIRECTION (likely keep `Result<T,E>`,
  compose fail-fast) — the promotion-time re-measure catches the exact shape (noted here so it does).

## 2026-07-03 (pr-lifecycle bring + live application — Fiery Flaring Bellows / bafbac, session part 3)

- **OWNER CORRECTION (post-close): I hardened an owner QUESTION into "owner-confirmed" doctrine.**
  "That looks like there is more to do before castr work" was a question about WHEN product work
  can start; I wrote it into the continuity spine as a confirmed substrate-before-product
  direction. Manufactured-decision family (no-manufactured-permission's inverse: manufacturing a
  MANDATE rather than a permission-gate). The tell: an owner statement with "to me that looks
  like" is a hypothesis offered for ANALYSIS, not a ruling — answer it with the dependency
  structure (what genuinely blocks, what is parallel-safe), never enshrine it. Cure applied: the
  spine now carries the answered question — one doctrine-sync slice gates new product code; all
  else parallel-safe; remediation may open any time after.
- **A plain `mv` of a tracked file crashes tracked-file validators until the rename is staged:**
  the machine-local-paths validator reads git's tracked list, so the un-staged plan move made it
  fail-loud ENOENT mid-`pnpm check` (correct behaviour — a silent skip would have hidden a
  scan-surface hole). Stage the rename (`git add -- <old> <new>`) in the same breath as the move.
  Also: session-close `pnpm check` on cache-warm main = 71s with 13 FULL TURBO replays (was ~10
  min) — the caching slice proven at the local gate too.
- **The brought pr-watch proved itself DURING its own bring-PR:** armed on PR #4 it caught the
  head move, the check-cycle reset, and the thread counts unprompted, one line per state change
  — and the harvest it prescribes surfaced a real Copilot thread the same minute. The fix
  (`--prefer-offline` on the composite setup install) IMPROVES on the upstream source action
  (back-flow candidate): the documented offline-warm-path claim is now actually true.
- **Generator↔formatter UNSTABLE FIXPOINT class:** the skills-adapter generator double-quotes a
  frontmatter description containing colon-space; prettier converts to single quotes; the
  pre-commit auto-format then re-drifts the adapters after every regeneration — the pre-push
  skills gate refused the same push twice before the root was measured (diff generator-output
  vs prettier(generator-output)). Content-level cure landed (colon-free description emits
  unquoted, prettier-stable); the structural cure is generator-side prettier-stable quoting —
  back-flow candidate, since upstream simply never hit the colon case. Detection recipe: run
  the generator, then prettier --check its OUTPUT; any diff is a future gate refusal.
- **A scoped test run is not the pre-commit's test run:** my `vitest run src/pr-watch` was green
  while `tests/agent-tools-cli.unit.test.ts` (which byte-pins the CLI usage listing) failed on
  the new topic line — caught only by the full chain. And the first failure READ wrong: validator
  tests print "Patterns index validation failed" to stdout as fixture noise, which masked the
  real one-line FAIL further down; grep for FAIL/✗ status, not error-shaped strings (the
  distilled grep-for-failure-status lesson, refired inside a gate log).
- **This commit deliberately conserves a peer's stranded napkin note** (the resonance
  coordinator's plan-templates observation, uncommitted in the tree with no active claim):
  committing it preserves the knowledge; stranding it risks loss. Its substance (the plan
  skill's dangling templates references + resonance's authored scaffolding as a graft
  candidate) is a named backlog input for the next curation pass.

## 2026-07-03 (CI split bring, post-merge — Fiery Flaring Bellows / bafbac, session part 2)

- **The split pipeline EXPOSED two latent repo defects the sequential monolith structurally
  masked** (the best argument for the split beyond speed): (1) `test:e2e`/`test:snapshot` had NO
  `dependsOn: build` in turbo.json — the packaging e2e's `pnpm pack` raced a parallel dist
  rewrite and packed a half-written dist; the monolith's `build && … && test:e2e` chain hid the
  missing edge for its whole life. A sequential wrapper is an undeclared dependency graph —
  parallelise it and the missing edges fire. (2) `packaging:check` is a plain pnpm script
  OUTSIDE turbo's graph, so no edge builds `lib/dist` for it; its green had been riding an
  artefact another step happened to leave behind.
- **"Dead mechanism" reasoning must enumerate ALL consumers before removal:** I removed the
  actions/cache dist transfer as dead (turbo caching is off repo-wide → the .turbo half WAS
  dead) and broke structure-checks — the dist half was load-bearing for the non-turbo packaging
  script. Same family as bring-the-iceberg, inverted: remove-the-iceberg needs the same
  transitive consumer sweep.
- **Five vitest suites sharing a 2-core runner blow 5s per-test timeouts** — turbo's default
  in-job parallelism ≠ local `test:all` semantics; `--concurrency=1` inside the job (while jobs
  stay parallel) is the honest cure, never raising timeouts to mask contention.
- **hook-matcher specimens #4 AND #5 (token-subsequence class, two firings this session):**
  `git add -- <files>` plus a LATER `-u` token in the same compound command assembles the
  blocked "git add -u" pattern — #4 via `$(date -u …)`, #5 via `git push -u origin` (whose
  block also silently prevented an earlier `printf > file` in the same compound, producing a
  confusing missing-file error one command later — a blocked compound runs NONE of its parts). The
  established mitigation (split the ceremony into separate shell strings) held. Also: my own
  push's pre-push dist-clean window killed my own background heartbeat tick MODULE_NOT_FOUND —
  the check-singleton rule's dist-window note applies to one's OWN loops, not just peers'.
- **Prove-cycle discipline that worked:** rerun-failed as the cheap decisive probe
  (timing-marginal vs structural); reading `--log-order=grouped` output carefully (a turbo
  cache HIT replays stored logs — build output lines do NOT prove a rebuild); measuring turbo
  edges via `--dry=json` before claiming the fix.

## 2026-07-03 (dedicated consolidation pass — Fiery Flaring Bellows / bafbac)

- **The gate-collision graduation trigger fired INSIDE the pass that walked it:** Cliff's pre-push
  `format:check` tripped on my in-flight backflow-ledger edit (a SECOND multi-agent window → worked
  instance #3) minutes before I dispositioned the register item — and the coordination cure ran
  exactly as captured (sanctioned mechanical repair + heads-up event + reload-before-write; zero
  content loss). Graduated same-pass into `check-singleton-per-window` §Peer-In-Flight Collisions,
  including the dist-clean built-CLI side-effect window both morning sessions measured.
- **castr-original PDR numbering precedent (Q-009 mapping-table applied):** minted PDR-124 ABOVE
  Oak main's current highest (123, measured firsthand via `ls-tree`) so a castr original never
  squats the pending Oak import range (098–123). The next castr original repeats the measurement —
  Oak main moves.
- **OWNER RULING (Q-010, walk): "Result in no way precludes fail fast, Result<T,E> IS the
  correct pattern, and fail fast is absolutely required everywhere."** The recorded
  "castr-is-fail-fast-therefore-no-Result" framing (D4 error-model reconciliation rationale;
  the use-result-pattern non-bring grounds; the rescan's "tension" item) was a FALSE DICHOTOMY
  laundered across surfaces — inherited-classification family, at the DOCTRINE level this
  time. principles.md's Result examples stand. Scope-of-reach (bring the rule? migrate D4
  seams?) re-asked and DECIDED same session: FULL reach — the rule becomes a bring, the D4
  seams get a named migration slice. Lesson: when two doctrines look opposed, check whether they
  actually COMPOSE before recording a "tension" — a tension entry repeated verbatim across
  surfaces gains false authority exactly like a blocked/thin label.
- **Owner process correction: questions go through the AskUserQuestion tool, never prose-only**
  ("otherwise I have to spot them on the way past, and I am not always looking") — saved to
  user-memory `surface-questions-via-ask-tool`; a 60s timeout means away, proceed-safe and
  RE-ASK on return.
- **A peer's context handoff is a claim-set to cross-check, and it earned trust by matching:**
  Cliff's 6-item curation handoff matched my firsthand reads 6/6 (audit-harness DUE, HARD signals =
  register prose-width, ledger owed, etc.); the one out-of-boundary item (merge-event continuity
  reconciliation) was left NAMED in continuity, not silently absorbed or dropped.

---

_Earlier entries rotated to keep the active napkin healthy as cross-session lessons graduate to [`distilled.md`](distilled.md) (conserved in archive, never trimmed):_
_2026-03-25 → 2026-04-16 → [`archive/napkin-2026-03-to-04.md`](archive/napkin-2026-03-to-04.md) (2026-06-18);_
_2026-06-04 → 2026-06-10 → [`archive/napkin-2026-06-04-to-10.md`](archive/napkin-2026-06-04-to-10.md) (2026-06-19);_
_2026-06-17 → 2026-06-20 (Phase 7 + Phase 8-partial) → [`archive/napkin-2026-06-17-to-20.md`](archive/napkin-2026-06-17-to-20.md) (2026-06-20);_
_2026-06-20 → 2026-06-21 (Tranche 1/2 + FIRST-RUN dogfood + dependency-currency + pin-reframe) → [`archive/napkin-2026-06-20-to-21.md`](archive/napkin-2026-06-20-to-21.md) (2026-06-26);_
_2026-06-26 → 2026-07-03-morning (consolidations + LC/TC lanes + gap rescan + S1/delta/coverage) → [`archive/napkin-2026-06-26-to-07-03-morning.md`](archive/napkin-2026-06-26-to-07-03-morning.md) (2026-07-03)._
