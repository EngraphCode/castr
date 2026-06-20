# Napkin

This file captures session-scoped discoveries, mistakes, corrections, and useful patterns before they are distilled or promoted into permanent docs.

## 2026-06-20 (Phase 8 cont. — tasks 6 + 5: triage-clean + Lanes activation)

- **A controlling sub-plan's scope estimate is a claim to MEASURE, not inherit — and it can under- or over-state.** Task
  6 was framed "thin per-hunk reconciliation (most is present)." Firsthand engine-vs-Oak-pin (`ad359a4f`) set-difference
  of `collaboration-state/` (Oak 82 entries vs castr 52) found 6 by-name absences. Triaged each: the 4 `.ts` deltas are
  Oak **refactor-splits** castr already covers under other module names (verified at the identifier level —
  `areaFromOptions`/`sendComms`/`uuidV5Schema`/`WatcherErrorKind` all live in castr, differently filed), so a filename
  set-difference **over-counts** exactly as the distilled lesson warns. But the 2 _directories_ (`archive/` rotation,
  `provenance/`) are genuinely-new **subsystems** the "thin" framing under-stated — caught only because I dropped from
  filename-compare to identifier-compare. Resolution: phase-8-named surfaces all present → nothing to bring in scope;
  the 2 subsystems are castr-classified forward-D4 (`.agent/state/README.md`) → recorded as a D4 lane, not phase-8 work.
  Method that worked: set-difference → per-candidate identifier grep (not filename) → classify bring/covered/forward.
- **"Activate X now" from the owner resolves a premature-scaffolding judgment that I correctly would NOT have made
  solo.** Task 5 (per-thread records / Lanes) sat in genuine tension: the repo's anti-pattern is speculative scaffolding
  for concurrency that isn't happening, yet 3b had just proved a second stream is _safe_ (the enabling trigger). I
  surfaced the fork rather than pre-resolving; owner chose activate-now. The activation is the inverse of the
  "mistook a constraint for a fit" lesson realised: the single-stream constraint was imposed by the unbuilt framework,
  the framework now exists (3b), so materialising the `## Lanes` shape **completes the activation** rather than scaffolds
  speculation. Created the first `threads/<slug>.next-session.md` with the additive PDR-027 identity table + lanes over
  the real takeable arcs. The `transplant/phase-8` tag now awaits only a genuinely concurrent _second stream_ exercising
  the records — which by definition cannot be manufactured by one session.

## 2026-06-20 (Phase 8 cont. — task 4b: the "clerk-expert P7 blocker" was a PHANTOM)

- **A "blocker" I relayed four times was never measured — and dissolved on first contact.** Across the sub-plan,
  repo-continuity, delivery-ledger, and my own 3b closeout I wrote "4b is blocked on the clerk-expert P7 fix" without
  ever opening the failing test. The metacognition pass forced the question I'd skipped: _is `clerk-expert` even a thing
  castr should have?_ Firsthand: **zero** references in `agent-tools/src` (product source); it appeared in exactly ONE
  test assertion (`codex-project-agents.integration.test.ts` `…toContain('clerk-expert')` + an Oak-phenotype `code-expert`
  resolve); and `reference-closure.md §Phase-4` already recorded the intent — **"castr never hosts clerk-expert"** (Clerk
  = Oak's auth SaaS; castr is a headless schema lib with no auth surface). So "fixing P7" was never "author a
  clerk-expert agent" — it was **reconcile a bogus Oak-phenotype test assertion** to castr's real `code-reviewer` roster
  (verified against the live 18-agent `.codex/agents/` set + the resolver output). One ~8-line test edit → suite 942/1 →
  **943/0** → removed the `turbo test --filter=!@engraph/agent-tools` exclusion → agent-tools now gates in `pnpm check`.
  The "hard blocker" framing had **inverted** the actual work (add an agent) from its truth (delete an assertion).
- **The meta-lesson: a "blocked on X" label is a claim to verify against X firsthand, exactly like any other — and a
  multi-surface-repeated blocker is MORE suspect, not less** (repetition launders an unmeasured assumption into apparent
  fact). Same family as the transplant per-surface phenotype lesson ([[verify-agent-claims-firsthand]],
  green-gates-mask-gaps) and the "brought ≠ current" find: the inherited classification (`blocked` / `parity item`) was a
  claim; the body (the test + the source roster) was the verdict. Cure: before relaying "blocked on X" even once more,
  open X and measure what X actually requires — the fix may be the inverse of the inherited framing.
- **Faithful reconciliation ≠ deletion.** The risk in "the assertion is bogus, remove it" is manufactured-completion via
  convenient deletion. Avoided by replacing the Oak-phenotype names with castr's REAL roster (`code-reviewer` +
  `.agent/sub-agents/templates/code-reviewer.md`, measured live) so the test still meaningfully asserts the live Codex
  roster — strengthened to castr's truth, not weakened.

## 2026-06-20 (Phase 8 cont. — task 3b: claims lifecycle + concurrent-session collision-safety)

- **THE coverage insight: "concurrency is tested" was true at the wrong layer.** The engine's lock+retry was unit-tested
  only on a **bare counter** (`transaction.integration.test` "serializes concurrent JSON file updates", in-process
  `Promise.all`), and every `collaboration-state.integration` test runs against an **in-memory fake runtime** (virtual
  paths, no real fs). So the full `claims open`/`close` stack (identity derivation → live-routing-collision assertion →
  `mkdir` transaction lock → optimistic re-read retry → atomic temp-file publish) had **never** been exercised under real
  multi-writer filesystem contention — and "a second concurrent session" means a **separate OS process**, which no test
  touched. The 3b demonstration (10 separate `node` processes opening at one `active-claims.json`: 11/11 claims survived,
  11 unique ids, no lost write) closed that, and I encoded it durably as `claims-concurrency.integration.test.ts` (real-fs
  concurrent opens + close-to-archive through the real CLI). Lesson: before trusting "X is tested", check the test runs X's
  _real_ path at the _real_ layer — a green concurrency test on a proxy (counter) or a fake (in-memory runtime) is not
  proof the production stack is collision-safe. Same family as green-gates-mask-gaps.
- **`claim_id` is schema-`format: "uuid"` — you cannot pass a human-readable `--claim-id`.** First demo seeded `--claim-id
ews-session` → `schema validation failed at /claims/0/claim_id: must match format "uuid"`. The CLI generates a v4 when
  `--claim-id` is omitted; capture it from the open command's JSON stdout (`{claim_id, claim}`) to drive heartbeat/close.
- **zsh word-split re-bite (the recurring lesson, again): a multi-word `CLI="node …js collaboration-state"` var ran as ONE
  command** ("no such file or directory: node …collaboration-state"). zsh does not split unquoted vars. Cure used: write the
  harness as a `bash` script (`#!/usr/bin/env bash` + `bash script.sh`) and a `CLI=(...)` array, where word-splitting is
  normal. The distilled "pass explicit args, never an unquoted multi-word $var" extends to "the command itself".
- **`require(relPath)` resolves vs the MODULE dir, not cwd → `MODULE_NOT_FOUND` for `.agent/state/...`.** A reporter helper
  `node -e 'require(process.argv[1])' .agent/state/.../active-claims.json` failed (Node treats a non-`./`/non-absolute
  specifier as a package). It silently ate the close-archival verification (the substitution failed but `echo` still
  exited 0 under `set -e`). Cure: `JSON.parse(fs.readFileSync(path,'utf8'))` (resolves vs cwd), or prefix `./`.
- **`claims open` does NOT auto-create `active-claims.json`** — `updateActiveClaimsFile` `readFile`s the path with no
  ENOENT tolerance, so the README's "created on first CLI use" needs a seed step: write `{schema_version:"1.3.0",
commit_queue:[],claims:[]}` (+ closed `{schema_version:"1.3.0",claims:[]}`) before the first open. Instance-tier +
  git-ignored, so seeding then cleaning leaves the working tree clean (verified `git status` empty after).

## 2026-06-20 (Phase 8 PARTIAL — substrate skeleton + collaboration-state gate flip + identity SessionStart hook + remote-sync check)

- **A controlling sub-plan can go stale between authoring and execution — re-measure its load-bearing premises before
  executing, don't inherit them.** `08-collaboration-active.md` was authored 2026-06-18, **before** WS7 (P6, 06-19) and
  P7 (06-20). Three premises were stale at execution time: task 2's "one open design point" (schema-surface contract) was
  **already resolved** by WS7 (consumer `live-types.ts` points at committed-source schemas); the "**12** informational
  failures, bulk = collaboration-state absence" was actually **1** (the clerk-expert P7 item — WS7's decoupling made the
  collaboration-state tests pass without `.agent/state/`); and `subagents` was **already wired blocking** (P7). The
  metacognition pass + firsthand measurement caught all three before I built on them. Surfaced to the owner as a scope
  correction (smaller than the plan), got the landing decision, then executed. [[verify-agent-claims-firsthand]]
- **THE load-bearing find: a transplant "bring" took the WRONG (older) version of a file — verify a brought file is
  byte-identical to the PIN, not merely "present."** WS7 (06-19 s3) brought `state-integrity.ts`, but an **older** copy
  that threw unconditionally on absent surfaces. The Oak pin's current version has `optionalWhenAbsent` hardening
  (instance-tier `active-claims.json`/`closed-claims.archive.json`/`comms/` absent = the expected clean state, not a
  fault; `conversations/`/`escalations/` still required). Without that, the deferred `collaboration-state` validator
  could **never** flip green on a fresh checkout (the instance tier is git-ignored, absent in CI) — materialising the
  skeleton alone was insufficient. The sub-plan's task 4 ("flip once the estate exists") under-specified this. Cure:
  `diff <(cat castr/file) <(git -C oak show PIN:file)` for every transplanted file — "brought" ≠ "current." Completing
  the bring (the hardening + its TDD test) was the actual enabler of the gate flip, and is squarely "bring Oak's design,"
  not "silence the validator."
- **prettier broke a blockquote: a long inline brace-list with `+` at a wrap point inside a `> 1.` list lost its `>` on
  the wrapped continuation line.** `` `collaboration/{.gitignore, conversations/.gitkeep, …}` `` wrapped and line N+1
  (`comms-archive/.gitkeep}…`) rendered OUTSIDE the quote. **prettier-stable** (format:check passes) but renders broken —
  the gate does not catch it. Same family as the `(PDR-049 + PDR-050)` → `- PDR-050` list-injection (markdown special
  char `+`/`-` landing at a wrapped line-start). Cure: after `prettier --write` on blockquoted/list markdown, verify
  blockquote integrity firsthand (`grep -vnE '^>|^$'` over the banner range), and avoid long inline `{…}` lists / `+`
  inside blockquotes. format:check green is necessary, not sufficient, for correct render.
- **The validator's `checkedCount` counts always-listed surfaces even when skipped:** `validate-collaboration-state` on
  the empty skeleton reports "OK (2 JSON file(s) checked)" — the 2 are `active-claims.json` + `closed-claims.archive.json`
  (always in `jsonSurfaces`, both optional-absent → skipped). Not "0"; the count is `surfaces.length`, not files-read.
- **"Are there additional commits on the remote?" → an authoritative `git fetch` + divergence analysis answers it; "nothing
  to integrate" is a valid evidence-backed verdict.** The opener's "5 commits unpushed" was **stale** — the remote-tracking
  `origin/feat` ref had drifted (showed `ddbe217`) but `git reflog show origin/feat…` proved `9712113` was already pushed.
  After `git fetch --prune`: origin/feat is a clean ancestor of HEAD (ahead 2 = my P8 commits); `origin/main` (PR #2 merged
  the zod-compiler branch) has **no un-homed content** — `git log origin/main --not HEAD` surfaced only the zod-compiler
  monolith, already cherry-picked-and-homed-in-split-form on the branch, so re-integrating would **regress** the homing;
  `origin/feat/rewrite` is an unrelated 7-month orphan (`git merge-base … HEAD` is **empty** → no shared history, never
  integrate). Tools: `rev-list --left-right --count A...B`, `merge-base --is-ancestor`, `log B --not A`, `merge-base A B`.
- **A plan that says "the hook does X + Y" is a claim to verify against the hook CODE — Y may belong to a different actor.**
  The sub-plan's task 3 said "wire SessionStart to write an identity row **+ open a claim**." Reading the Oak adapter
  (`planClaudeSessionIdentityHook`): it does **identity only** (env vars + `additionalContext` banner), touches **no**
  `.agent/state/`. And `openClaim` _requires_ `intent`/`thread`/`areas` — unknowable at session start. So claim-open is the
  **`register-active-areas-at-session-open` agent discipline** (after intent clears), not a hook write. Wiring conflated
  hook-time identity with agent-time claim. Same family as the per-surface "verify the claim against the artefact" lesson.
- **A doc naming a hook file is a claim to verify on disk AND in the registration.** start-right named the Claude
  SessionStart hook `.claude/hooks/practice-session-identity.mjs` as if live — but the file **did not exist** and
  `.claude/settings.json` had **no `SessionStart` key** (only PreToolUse). Wiring it (Oak's soft-surface shim verbatim +
  the `SessionStart` registration, castr-style `node "${CLAUDE_PROJECT_DIR}/…"`) made the doc accurate. The
  `.claude/settings.json` self-mod needed explicit owner authorisation (surfaced as a decision; authorised; edit went
  through — the napkin's prior self-mod-guard lesson, re-applied). No validator gates SessionStart, so verification is
  behavioural: pipe `{"session_id":"…"}` through the shim → confirm `hookSpecificOutput` JSON + `$CLAUDE_ENV_FILE` append.

## 2026-06-20 (Phase 7 — adapter generator + gate flips LANDED, tag `transplant/phase-7` `b5a7538`)

- **Wiring a transplanted-but-deferred validator surfaces the gaps it was silently masking — budget for them as the
  real content of the "flip" step, not scope creep.** Flipping `portability:check` to Oak's `validate-portability`
  exposed **19 pre-existing issues** (18 missing `Skill(engraph-*)` entries in `.claude/settings.json` + 1 surface-matrix
  hook-description gap); flipping `subagents` exposed **18** `config_file` resolution failures. NONE came from my
  generator (it was portability-clean on first generation). The gate had been green only because it was deferred — exactly
  the green-gates-mask-gaps family. The fixes ARE the flip.
- **The `config_file` reconciliation was the napkin's own predicted P7 item (2026-06-19 s2, line ~150).** castr's
  `.codex/config.toml` used repo-root-relative `config_file = ".codex/agents/X.toml"` (to satisfy the bespoke
  `validate-portability.mjs`), but Oak's `validate-subagents` resolves `config_file` relative to `.codex/` →
  `.codex/.codex/agents/X.toml` (doubled). Fix: switch to `agents/X.toml` (Oak's reference form, verified at pin
  `ad359a4f`). This was only safe **because the bespoke script is retired in the same phase** — retiring it removed the
  repo-root-form constraint. Lockstep: change config_file + retire script + wire Oak validator, verify green before commit.
- **Prettier-stability of generated frontmatter = single-quoted/plain YAML, not JSON double quotes.** First generation
  emitted `description: "..."` (JSON.stringify); prettier's YAML formatter rewrote all 36 agent `.md` wrappers to
  `'...'`. The repo convention (skills generator via the `yaml` lib) is **plain scalars where possible, single-quote when
  needed**. Cure: a `yamlScalar` that quotes only when a plain scalar would be ambiguous, using YAML single-quote
  escaping (`'` → `''`). `.cursor/rules/*.mdc` are NOT in the prettier glob (only `.md` is) so they were never the
  problem. The check-after-generate proof: `prettier --check` the generated surfaces every time (the patterns-index
  lesson, re-applied). **Verify prettier config with a real in-repo file — a `/tmp` copy uses different config and gives
  a false "stable".**
- **`check:ci` runs `format:check` (non-mutating); `check` runs `fix` first.** My own two `.ts` source files were
  unformatted — `check:ci` failed at format:check (early in qg, so the rest never ran). When iterating, run
  `prettier --write` on new source before the aggregate, or the first full run wastes minutes failing fast on a triviality.
- **The harness self-modification guard blocks editing `.claude/settings.json`** (startup config) unless the owner
  explicitly authorises — correctly. Surfaced it as a decision; owner authorised; then the edit went through. Don't try to
  work around a self-modification denial; surface it.
- **Reverse-closure caught a fully-stale table:** `governance-claim-needs-a-scanner.md` listed four `scripts/*.mjs`
  scanner paths — **all four already absent** (the real scanners are `agent-tools/src/validators/*`); my deletion of
  `validate-portability.mjs` merely completed the drift. Repointed all four to real paths + added the new generator. A
  "materialised examples" table is a claim set to verify against disk, like any other (the per-surface lesson).

## 2026-06-19 (session 4 — zod-compiler homing + Phase-7 scoping)

- **FALSE ABSENCE FROM ONE DIRECTORY → wrong claim to the owner.** I told the owner "remediation 02's plan is
  unauthored" after checking only `.agent/plans/remediation/` (which holds 03–07). It was authored and **promoted to
  `.agent/plans/active/02-ir-fidelity-proof-harness.md`** — the lifecycle MOVES a plan on promotion. Same false-absence
  family as session 3's zsh-glob: verify the actual location (here, the lifecycle destination) before claiming absence.
  The delivery-ledger even named the path; I relayed my own stale summary instead of reading it. [[verify-agent-claims-firsthand]]
- **A sub-agent (Explore) over-counted a load-bearing number.** It reported "18 sub-agent templates / 18 wrappers
  needed"; firsthand `ls .agent/sub-agents/templates/` = **15** templates (the 18 is the persona-EXPANDED adapter count:
  `architecture-expert`→barney/betty/fred/wilma). Spot-check every scope-defining count from a sub-agent report against
  source before planning on it. [[dont-dismiss-tools-as-false-positive]] inverted — don't over-trust either.
- **Checking the pinned SOURCE firsthand converts "transplant-vs-build" AND reveals improve-on-Oak openings.** Phase 7's
  framing implied "regenerate adapters" (run an existing generator). `git -C /Users/jim/code/oak-open-curriculum-ecosystem
ls-tree -r ad359a4f` showed Oak HAS the adapter surfaces (`.cursor/agents`, 93 `.cursor/rules`) but ships **NO
  generator** for them — Oak **hand-maintains** them. So it's BUILD, not transplant, and building a generator **improves
  on Oak** (a Phase-9 back-flow item). For any transplant phase, inspect the pinned Oak tree before assuming a tool exists.
- **Cherry-picked/copied content can carry trailing tool-call tags.** The homed zod-compiler report-plan (origin/main
  `ccd9c7a`) ended with literal `</content>`/`</invoke>` lines (the original author leaked them). They propagated into
  every file I split it into; caught by grep before commit. Grep homed/copied files for trailing `</…>` artefacts.

## 2026-06-19 (session 3 — state-schemas scoping; FUNDAMENTAL ERROR + correction)

- **FALSE ABSENCE FROM A BROKEN PROBE → wrong-design verdict (owner halted me).** I concluded "no Oak checkout
  reachable locally" from `ls -d /Users/jim/code/oak* /Users/jim/code/*oak* /Users/jim/code/monorepo*`. In zsh a single
  non-matching glob (`monorepo*`) **aborts the whole command** before `ls` runs → empty output, which I read as "Oak
  absent." Oak was at `/Users/jim/code/oak-open-curriculum-ecosystem` the whole time (matches `oak*`). **This is the
  zsh-glob lesson already in `distilled.md`, re-violated.** Then I hit the SAME family twice more: `git show $P:path` →
  zsh ate `:a` as the absolute-path modifier (`ad359a4f`+`gent-tools`); fix = `"${P}:path"` braced/quoted.
- **The deeper error the false-absence caused:** with Oak "unreachable" I reconciled against a HALF picture (castr's
  bodies + a stale napkin summary "castr's validation is in-code Zod") and began forming a verdict — "Option A: author
  the 5 schemas at `.agent/state/collaboration/`" — **before** reading `08-collaboration-active.md` (the most recent,
  most specific surface) and before reading Oak's actual code. Option A was WRONG: it replicates castr's pre-WS7
  coupling (schemas live with data), the exact thing Oak's **WS7** refactor removed. It also conflated "make the 5 red
  state-integrity tests green" with "materialise the `.agent/state/collaboration/` data plane" — which would have
  prematurely pulled Phase-8 substrate into Phase 6 and risked silencing the honest absent-DATA signal (risk #2 the
  opener flagged; my own [[dont-dismiss-tools-as-false-positive]] / manufactured-completion family, inverted).
- **Firsthand Oak-pin truth (ad359a4f), now grounded:** (1) 5 schemas live at `agent-tools/src/collaboration-state/schemas/`
  (source tree), NOT `.agent/state/collaboration/`. (2) Resolver = package.json-walk from `import.meta.url`; schemas
  ALWAYS exist regardless of runtime data → decoupled (WS7). (3) NO Zod→JSON-Schema generator exists — schemas are
  hand-authored Ajv contracts, parallel to the in-code Zod (so `08`'s "emit from Zod OR reconcile consumer" open design
  point is moot: Oak already chose committed-source-schemas). (4) Oak's committed `.agent/state/collaboration/` =
  `.gitignore` + per-dir README/.gitkeep + Oak runtime data (DON'T-BRING); live claims/comms/log git-ignored.
- **Corrected design (firsthand, pending owner confirm):** bring WS7 — schemas → castr `agent-tools/src/collaboration-state/schemas/`
  - the resolver refactor (no-arg validator, package.json-walk) + test-helper source change. This greens the 5 (+ other
    helper-dependent) agent-tools tests as a Phase-6 SOURCE/contract bring, **without** touching `.agent/state/` — the
    Phase-8 runtime data plane stays correctly absent. Resolves the P6(schemas-as-source)/P8(runtime-skeleton) boundary
    cleanly. Root meta-lesson: **never accept an absence from a probe that could fail silently — verify against the
    authoritative source (the Oak checkout, the body at the pin), and finish grounding before forming a verdict.**

## 2026-06-19 (session 3c — D1 lint RESOLVED: a TypeScript-version skew, not code/rule)

- **D1's 126 sonarjs warnings were a TypeScript-instance `TypeFlags` skew — root-fixed in one line.** lib resolves TS
  6.0.3; `eslint-plugin-sonarjs@4.0.3` declares `typescript: ">=5"` and resolved its own bundled **5.9.3** in-subtree.
  The `typescript-eslint` parser builds `Type` objects with 6.0.3, but each rule does `type.flags & ts.TypeFlags.X`
  with `ts` = the plugin's 5.9.3 — and TS6 **renumbers** `TypeFlags` (Union 0x08000000 in TS6 lands inside TS5.9.3's
  `StringLike` mask; `Undefined` is 4 vs 32768 so `isNullLike` missed it). Wrong-bit masks → false-fires on type-safe
  object-union `in` guards (S3785) and `X | undefined` returns (S3800). **Fix:** `pnpm-workspace.yaml`
  `overrides: typescript: 6.0.3` (single workspace TS) → both rules flag **0** → restored to `error`. The whole "warn→error
  refactor pending" framing across DoD/tracker/ledger/prompt was a **false premise** (nothing to refactor; a toolchain to
  align) — swept all surfaces.
- **The verify-firsthand discipline WORKED (and mattered).** I delegated the measurement to a sub-agent; its finding
  (TS-version skew) was extraordinary and sat near the prior session's "false-positive/deselect" trap. I did **not** relay
  it — I reproduced every load-bearing fact firsthand (loaded both `typescript` instances and printed `TypeFlags`; computed
  the bit collisions; watched the `+2 -8` install + lint `126→0`). It held. [[verify-agent-claims-firsthand]] is not
  ceremony: an unverified "it's an environment bug" would have been the same shape of error as the prior agent's
  "it's a false positive" — the difference is the measurement.
- **Trust the aligned-TS MEASUREMENT over the sub-agent's SIMULATION.** The agent estimated "~8 genuine cross-kind returns"
  would survive a correct rule; the actual aligned-TS run flags **0** (castr's mandated `@returns` exempts S3800; the 5
  S3785 are type-safe object unions). The agent simulated a _partial_ correction; the real override is ground truth.
- **pnpm 11 gotchas (both bit me, both the "deprecated mechanism prints to stdout" family):** (1) `pnpm.overrides` in
  `package.json` is **no longer read** by pnpm 11 (moved to `pnpm-workspace.yaml`); it warned but my probe still flipped —
  unreliable, don't use it. (2) `$typescript` override-reference syntax is **deprecated** and prints a `[WARN]` to
  **stdout** that pollutes piped tool output (broke a JSON parse). Use an explicit pinned version (kept in lockstep with
  the root TS devDep via a comment) — or a pnpm catalog, which is heavier than a single pin needs.

## 2026-06-19 (session 3b — reviewer-routes + channels card; "surface, don't pre-resolve")

- **Owner correction of a behavioural pattern, not just a task error:** "present the two open issues to me as questions,
  we must resolve all open questions and deferred items." I had defaulted to "I'll do the two follow-on items my way,
  then tag" — quietly choosing the reviewer-route mapping and the channels-card scope, and labelling standing items
  "named-position deferrals." **"Named position" had become my euphemism for "parked."** Same root as this session's
  first halt (substituting my judgment/probes for ground truth + owner intent). **Cure: at any genuine fork with
  owner-relevant stakes, surface it as a decision with a recommendation; resolve nothing load-bearing by silent
  judgment.** Presented A/B + the standing C/D/E set as questions; owner chose mirror-Oak / full-catalogue / drive-all.
- **A — substrate reviewer-routes ✅:** all 22 surfaces are 1:1 with Oak's manifest, so mirror was clean. Mapped Oak's
  routing to castr's 15-expert roster (docs-adr→docs-adr-expert, architecture→architecture-expert,
  assumptions→assumptions-expert); **Oak's `agent-tooling` reviewer has NO castr equivalent → `code-reviewer`**; kept
  code-reviewer gateway + preserved castr's owner-gate clauses. Applied by id via a node script (not 22 fragile edits),
  prettier, then re-validated the manifest against its schema via the substrate consumer.
- **B — agent-collaboration-channels.md ✅:** authored as the routing index/contract (not runtime data). Schema
  cross-refs re-pointed to the **WS7 source location** (`agent-tools/src/collaboration-state/schemas/`), NOT the old
  `.agent/state/collaboration/` path; Oak-local `collaboration-state-write-safety.plan.md` **de-linked** per
  `no-moving-targets`; explicit materialisation-status note marks the `.agent/state/collaboration/` runtime surfaces as
  Phase-8 forward-refs (honest, not a claim they exist). `08-collaboration-active.md` never actually named the card —
  the "P8" attribution was reference-closure "Block (g) remaining" prose, now corrected to "P6, owner-directed."
- **D1 (lint) understood before measuring:** the prior `d1-sonarjs-findings.md` is a documented cautionary tale (agent
  asserted "false positives" repeatedly, wrong). The ONE decisive unmeasured datum (§4/§8): surface S3800's **secondary
  "Returns X/Y" locations** (what the rule actually sees per site) + the **inferred** types of the 5 S3785 operands —
  "likely resolves §4 outright." Measure that, never theorize from the source-reading. [[dont-dismiss-tools-as-false-positive]].

## 2026-06-19 (session 2 — sub-agent roster)

- **The opener's "13 generic templates, bring + components" was a hypothesis that firsthand grounding overturned twice.**
  Oak at pin `ad359a4f` has **19** templates (not 13), heavily UI/product-phenotyped. The real driver of the slice was
  invisible until the **negative-space sweep of castr's own `invoke-*` rules**: castr has THREE dangling expert-rules
  authored in Phases 4–5 — `invoke-assumptions-expert`, `invoke-mcp-expert`, and
  `invoke-doc-and-onboarding-experts-on-significant-changes` (the last is **owner standing doctrine 2026-05-02**) — each
  citing a `.agent/sub-agents/templates/<x>.md` that does NOT exist. **Phase 6's sub-agent step is not a free roster
  choice; it is completing the missing half of a half-built expert system castr already committed to.** I twice
  recommended dropping mcp+onboarding ("no surface") and was twice wrong: castr's OWN rules require them (narrowly
  scoped to castr's real surface — MCP-tools _emission_, Practice/AI-path onboarding). **Lesson: before classifying a
  transplant surface DON'T-BRING for "no consuming surface", grep the host's own rules/cites for the surface — the
  consumer may already be installed and dangling.** Same family as the 2026-06-19(s1) manufactured-completion (narrow
  negative-space search).
- **The dangling rules carry unreconciled Oak agent-naming phenotype:** they say `code-expert` where castr's template
  is `code-reviewer`, and assume the 4-persona `architecture-expert-barney/-fred/-wilma` device. Reconciling that naming
  is part of the slice (per-surface phenotype lesson, now on castr's own transplanted rules).
- **castr authors LEAN NATIVE templates, not copy+AMEND of Oak's.** Existing `code-reviewer.md` is 76 lines, references
  castr's `principles/dry-yagni.md` (Oak uses heavier `subagent-principles.md`), castr identity, castr specialists. Oak's
  `code-expert` is ~300 lines of monorepo verbosity. So new templates are authored native (Oak templates = reference for
  the role's essence, not the artefact). This de-risks the whole Oak-phenotype problem at the source.
- **subagents validator gate-flip is PHASE 7, not 6** (tracker phase-table line 24: "Adapters + flip portability/subagents
  gates"). The validator (`agent-tools/.../validate-subagents.ts`) hard-requires a `.cursor/agents` wrapper per template
  (line 198) — and `.cursor/agents` is a P7 deliverable (ledger §Platform adapters→P7). `validate-subagents` is NOT in
  `repo-validators:check`, so `pnpm check` stays green without it. **Phase 6 lands templates + Codex adapters; P7 adds
  Cursor/Claude wrappers + flips the gate.** The "subagents→P6" note in the tracker operational block is superseded.
- **Codex adapter contract (validate-subagents-codex-adapter-field-checks):** each adapter `.toml` REQUIRES top-level
  `name` (== filename) + `description` (== config registration) + `model_reasoning_effort="high"` + `sandbox_mode="read-only"`
  - `approval_policy="never"` + a `developer_instructions` triple-quote referencing the canonical template. **The existing 6
    adapters LACK `name`+`description`** (latent gap; validator deferred so unnoticed). Authoring new ones compliant +
    backfilling the 6 makes P7 a clean flip.
- **State schemas (task #4) — the ledger §State location is STALE.** Oak main moved the JSON schemas FROM
  `.agent/state/collaboration/` TO `agent-tools/src/collaboration-state/schemas/` (5: active-claims, closed-claims,
  comms-event, conversation, escalation). castr's runtime validation is **in-code Zod** (`state-schemas.ts`), and its
  consumer/substrate-manifest reference `.agent/state/collaboration/*.schema.json` (the live-reader-failure = expected
  P8-absent signal). Needs its own scoping pass; under-specified by the stale ledger. Lower value than roster completion.
- **RAN ONLY A GATE SUBSET BEFORE AN INTRA-PHASE COMMIT → put a RED gate on the branch (caught at session-handoff full
  `pnpm check`).** I committed `d5cd4eb` after `format:check` + `repo-validators:check` + the deferred subagents
  validator, reasoning "doc/config changes don't touch the heavy gates." But **`.codex/config.toml` is validated by the
  LIVE `portability:check`** (`scripts/validate-portability.mjs`, in `pnpm check` but NOT in `repo-validators:check`),
  which hardcoded `expectedAgents` (6) + asserted `registeredAgents.length === 6`. My 18 registrations + a `config_file`
  path change broke it. **Lesson: run the FULL `pnpm check` before ANY commit that touches a gate-validated surface — the
  cheap-subset shortcut for "just docs/config" is exactly where a live validator hides.** `repo-validators:check` ≠
  `pnpm check`; `portability:check`, `packaging:check`, `skills:check`, `test:all` are separate links. Roll-forward fix
  (never rewrite the red commit) → green tip before push.
- **Two subagent validators disagree on `config_file` resolution (latent contradiction):** live `validate-portability.mjs`
  resolves relative to **repo root** (wants `.codex/agents/X.toml`); deferred Oak `validate-subagents.ts` resolves
  relative to **`.codex/`** (wants `agents/X.toml`). No single string satisfies both; keep the live form, reconcile at P7.
  And the live validator's hardcoded `expectedAgents`+count was itself the **drift-detector-as-frozen-literal** anti-pattern
  (the 2026-06-18 substrate magic-number lesson) — refactored it to recompute the roster from disk.

## 2026-06-19

- **Phase 6 `active/patterns/` import LANDED — 130 patterns + a new generator/validator CLI `validate-patterns-index`.** Durable
  record is the commit + sub-plan §4 + reference-closure §Phase 6; surprises/lessons only here:
  - **Owner reframe: "do better than a deterministic list by hand — make a CLI, portable to Oak."** The opener said "regenerate
    the README index"; owner corrected it to _build the generator_. This is `generator-first` applied: Oak's own index was
    **stale (87 listed / 132 on disk)** precisely _because_ it was hand-maintained — a worked instance of
    `governance-claim-needs-a-scanner` + the hand-edited-literal-drifts anti-pattern. Built
    `agent-tools/src/validators/patterns-index/` (pure helpers + report + thin CLI, TDD): scans frontmatter → generates the
    `## Pattern Index` region between `<!-- PATTERN-INDEX:START/END -->` sentinels; `--check` (gate, wired into
    `repo-validators:check`) / `--fix` (regenerate). **Repo-agnostic via `resolveRepoRoot` → portable to Oak as a Phase-9
    back-flow item (it also fixes Oak's stale index).**
  - **prettier-stability was the load-bearing risk** (`.agent` is prettier-checked): generate → `prettier --write` → `--check`
    must still be exit 0, else the gate false-drifts. Confirmed stable (proseWrap defaults to preserve; kept the render to
    plain `-` bullets + blank-line separators). The check-after-format is the proof, run it every time.
  - **MANUFACTURED-COMPLETION CAUGHT BY OWNER (the important one).** I claimed "zero source-repo references remain" after a
    grep scoped to a _product/vendor token set_ (oak/oaknational/eef/opal/curriculum/...). Owner asked "what are the current
    problems? zero tolerance for known issues." Re-measuring firsthand found **16 distinct Oak ADR refs (`ADR-078`…`ADR-185`)
    across 17 files** + 11 dangling links I'd missed. **A "clean" claim is only as good as the token set you grepped — scope
    the negative-space search to ALL identifier classes (product names, ADR/PDR numbers >local-max, file paths, links), not
    just the obvious tokens.** Same family as [[dont-dismiss-tools-as-false-positive]] / green-gates-mask-gaps.
  - **Owner decisions (load-bearing):** `proven_in: imported` for all 130 (keep `proven_date`; **no source-repo reference at
    all** — neither inline `[oak-...]` prefix nor a separate field); **broad neutralization** of all source-repo refs in
    pattern bodies (not just proven*in) — justified by the patterns README's OWN doctrine ("patterns are abstract; describe
    the shape, not the domain-specific implementation"), so stripping Oak concretions is faithful, not lossy. Generic
    third-party vendors (Sentry/Clerk/Elasticsearch \_as products*) are NOT source-repo refs → kept. Agent codenames
    (Opalescent/Sparking/etc.) kept (not repo identity).
  - **Category drift decided by substance: NORMALIZE to the canonical 5, don't expand.** Real frontmatter had drifted to 10
    categories (`build-system`, `coordination`, `coordination-architecture`, `planning`, `test-architecture`) — accidental,
    never enforced upstream. Mapped by substance (planning→process, test-architecture→testing, build-system→architecture,
    coordination\*→agent [collaboration-class candidates for P8]); fixed polarity typos (`antipattern`→`anti-pattern`,
    `design-note`→`pattern`); backfilled `use_this_when` on 36 files; renamed `title:`→`name:` on 3. Then made the tool
    **strict** (these are gate-failing _errors_, not warnings) now the estate conforms — "strict, everywhere" enforced by the
    scanner, not hoped.
  - **The tool found 2 broken-YAML files my ad-hoc detection missed** (`fabricated-gate` unquoted `use_this_when` with colons;
    `untracked-wip` orphaned multi-line `proven_in` from my single-line `perl` replace). **A multi-line YAML block scalar
    breaks under a `^proven_in:[^\n]*` single-line replace — the tool's `yaml.parse` is the reliable detector, not awk/grep.**

## 2026-06-18

- **Owner correction — single-branch operation is a CONSTRAINT, not a fit (inverted-causality).** I answered "are we
  ready for per-thread continuity records?" with "no — wait until concurrent threads arise; no structural value yet."
  Owner: _"that's backwards, I am operating in a single branch because that is all the agent support framework can
  currently handle."_ Multi-agent concurrency is the explicit **goal** of this branch (primary plan user-impact line);
  per-thread continuity + the collaboration substrate are **enabling infrastructure on the path to it**, not a downstream
  consequence to wait for. My "wait for the trigger" deferral was **circular** — concurrency cannot arise until the
  framework (which _includes_ per-thread continuity) is built. Root error: I inherited Oak's steady-state deferral
  rationale (per-thread records "without structural value" at single-thread scale, PDR-027 §Amendment 2026-04-21) and
  applied it to castr **without reconciling to castr's build-toward-concurrency context** — the per-surface transplant
  lesson applied to a doctrine's _rationale_, and I missed it. **Meta-lesson (distill candidate): mistook a constraint
  for a fit.** Same family as green-gates-mask-gaps and manufactured-parking — reading a current limitation/absence as
  the intended steady state. **Cure:** when a surface asserts "X is fine / sufficient / 1:1 / deferred-no-value", ask
  whether X is _chosen_ or merely _imposed by an unbuilt capability_; if imposed, the surface should name the constraint
  and the enabling work, not present it as a fit. Reframed `repo-continuity.md` §Active Threads. The binding gap to lift
  the constraint is the Phase-8 collaboration substrate (+ branch/CI coordination, D3); per-thread records are its
  cheapest leaf.

- **Removed two anti-pattern magic numbers from the substrate consumer (owner-directed) — `EXPECTED_MANIFEST_SURFACES = 22`
  and `expectedEntryCount: 114`.** Owner: _"I don't want either of those magic numbers to exist in either repo… all they
  achieve is guaranteeing they will be out of date."_ Sharper framing found in the metacognition pass: a hardcoded
  expected-count is a **stored derived value** that the substrate manifest's own `surface_defaults.stored_derived_values_rule`
  ("allowed only when the validator recomputes and compares them") **forbids** — so the consumer was violating the very
  contract it enforces. And `22` never described reality (only 11 of 22 surfaces exist on disk) — it compared the manifest's
  length against a copy of its own count: a tautology with a maintenance tax. Removed both count checks + their interface
  fields (`ManifestSnapshot.expectedSurfaceCount`, `MigrationLedgerSnapshot.expectedEntryCount`) + the two now-dead functions
  (`evaluateManifestSurfaceCount`, `evaluateMigrationLedgerCount`); kept the integrity checks that **do** recompute against
  state (unique ids, required fields, valid merge classes, schema validation; ledger dup-paths + byte-count + SHA-256
  recompute-vs-recorded). Tests updated in lockstep (the enforcement-data↔test pairing lesson). **Lesson: a "drift detector"
  that is itself a hand-edited literal is not a drift detector — it is a second source of truth that drifts. The honest
  anti-drift pattern is recompute-and-compare against the artefact, never a frozen count.** Castr done + verified; Oak
  carries the identical code (pin + HEAD) → recorded as a precise Phase-9 back-flow item (destination is the open
  owner-decision). **This supersedes the "keep all 22 / lockstep code change avoided" note below** — the better answer was
  to delete the coupling, not work around it.

- **Phase 6 block (g) substrate contract LANDED — `memory-state-substrate-contracts.{md,manifest.json,schema.json}` to
  castr roots, verified against the live consumer.** The durable record is the commit + `reference-closure.md` §Block (g)
  substrate + sub-plan §4 + the executive README row; only the surprises live here:
  - **The consumer pins the contract: `EXPECTED_MANIFEST_SURFACES = 22` is hardcoded in `live-report.ts`.** The manifest
    is **consumed at runtime**, not just docs — `readManifest` Ajv-2020-compiles the sibling schema and validates the
    manifest against it (`schema-incoherence`/`invalid-json` findings), checks count==22, unique ids, all 13
    `required_contract_fields` present, valid PDR-049 `merge_class`. So "re-author to castr roots" = keep all 22 surfaces
    (the layout is byte-identical Oak↔castr; the unbuilt collaboration/diagnostics surfaces are **named Phase-8
    positions**, not drift) and reconcile only the host-local fields. Reducing the surface set would have forced a
    lockstep `EXPECTED_MANIFEST_SURFACES` code change — avoided.
  - **`practice-substrate` is NOT wired into `pnpm check`** (only a standalone `agent-tools` script). So I could run it as
    a **firsthand verification harness** for the contract without gate-blast-radius. Result: all structural checks green;
    the only 2 blocking findings are `live-reader-failure` reading `.agent/state/collaboration/{active-claims.schema.json,
shared-comms-log.md}` — the **expected, honest Phase-8-absent signal** (`collaborationAjv` readFile's the schemas with
    NO catch → throws → caught one level up as one finding per always-live evaluator). Documented in the `.md` as
    must-not-silence (the napkin's own "a failing check may be a TRUE signal" lesson, 2026-06-07).
  - **Oak phenotype in the contract, reconciled per-surface (the per-body lesson again):** Oak's reviewer routes name
    sub-agents castr lacks (`docs-adr-expert`/`architecture-expert-fred`/`assumptions-expert`) → mapped to castr's real
    `code-reviewer`/`type-reviewer` + workflow labels; `plan_roots` pointed at two Oak-local plans (incl. an `agent-tooling`
    doctor plan castr has no analogue for) → re-pointed to the transplant sub-plan, Oak doctor plan **de-linked** per
    `no-moving-targets`; `fixture_roots` named `agent-tools/tests/collaboration-state/fixtures/` (castr has the dir but no
    `/fixtures/` subdir — schemas are in-code/TS fixtures) → corrected; the Oak retired-YAML-seed evidence link dropped.
  - **The portable schema is genuinely portable — brought as-is.** It encodes the PDR-049 merge-class enum + PDR-050
    required-field set, zero host phenotype; matches sub-plan §2's "structural contracts byte-identical, replicate as-is."
    Confirmed castr's PDR-049 (5 merge tokens incl. `append-only-structured-by-<key>`) + PDR-050 (field set, tiers,
    severity/repair split) define exactly what the manifest asserts — faithful to castr's own doctrine, not just Oak text.

- **Phase 6 (memory) continued — operational registers seeded + napkin drained.** Materialised the five operational
  registers from Oak `main` `ad359a4f` (commit `d80e49f`): `operational/README`, `threads/README`, `tracks/README`
  (convention contracts, host-phenotype reconciled per sub-plan §5) + `pending-graduations`/`open-questions`
  (frontmatter + preamble **contract only**; Oak runtime content is DON'T-BRING; castr authors entries). The napkin drain
  graduated its two named targets (commit `ce57dd1`): the manufactured-permission rule + the transplant-method lessons →
  `distilled.md`. Then rotated the pre-transplant April/March block to `archive/napkin-2026-03-to-04.md`; active napkin
  back under the ~500-line threshold (454).
- **The RULES_INDEX "three on-disk forms" contract is aspirational, not implemented** — castr's 83 transplanted rules
  have **no** `.claude`/`.cursor`/`.agents` forwarders (verified firsthand: `precedence-is-not-approval`, added the same
  way in Phase 5, has none; `.claude/rules/` and `.agents/rules/` don't exist; only 3 legacy castr rules have
  `.cursor/*.mdc`). The Oak `portability` validator that would enforce forwarder-alignment is **deferred to P7**, which is
  why the forwarder-less estate is green. So I matched the **real precedent** (canonical `.md` + a `RULES_INDEX.md` row
  only), not the index prose. The index's own "three forms / land all three" text is itself a classification-claim to
  verify against the estate — the per-surface lesson, now turned on castr's own transplanted index. (Index↔reality drift
  across 83 rules is pre-existing, not mine; a P7/D4 cleanup — either generate forwarders or correct the prose.)
- **Phantom alias: `pnpm agent-tools:check-commit-message` is NOT wired in castr** (the commit skill assumes it). The
  real, firsthand-verified path is `pnpm exec commitlint --edit <file>` (the napkin's own 2026-06-17 note). The
  `check-commit-skill-advisories` orchestrator the skill describes is likewise an Oak surface; castr's `.husky/pre-commit`
  is **prettier-only** and `.husky/commit-msg` is **empty** — no commit-time commitlint hook, so the message check is a
  manual pre-screen. The skill's full commit-queue ceremony depends on P8 collaboration-state (absent) → bootstrap
  fast-path (single agent, commit directly).
- **Inherited Oak bug (back-flow #8):** Oak's `threads/README.md` cites `consolidate-docs` via `../../skills/...` (wrong
  depth → `.agent/memory/skills/`); its sibling PDR cites in the same file correctly use `../../../`. Fixed in castr's
  copy; logged in `reference-closure.md` §Phase 6.

## 2026-06-17

- **Manufactured a false dichotomy + escalated a fix as a decision (owner correction).** At session close I claimed a
  "contradiction" between the owner directing Phase 6 next and the continuity surfaces' "(1) NOW remediation / position
  1" framing, and asked the owner to pick a sequence. Owner: there is **no** contradiction — bringing the entire
  Practice / agentic framework / agent-tools / skill+rule+subagent+hook definitions over AND fixing castr's known
  issues are the **same** deep enhancement, not competing priorities; the "sequence positions" are an ordering guide,
  not a gate, and owner direction names the next slice. **I failed to apply the very doctrine I transplanted hours
  earlier** — `orientation.md` §Owner Precedence (owner-direction-beats-plan) and the new `precedence-is-not-approval`
  rule: a stale plan-sequence is precedence, not authority, and a known issue gets **fixed**, not escalated as a
  permission gate. Same family as this napkin's manufactured-permission rule candidate (2026-06-10). Cure: reframed all
  continuity surfaces to the unified deep-enhancement model and fixed the dead `fix/*`-branch routing.
- **Date discipline — use `currentDate`, not the inherited prior-session date.** Dated Phase 5 "2026-06-15" (the prior
  session's date) across surfaces; today is 2026-06-17. The prior session's D1 / single-branch / commitlint work is
  legitimately 2026-06-15; Phase 5 is today's. Corrected the live surfaces (commit timestamps are the authoritative
  record). The date is a claim to verify firsthand like any other.

- **Phase 6 opened — baseline RE-PINNED `4470266` → Oak `main` `ad359a4f` (owner, load-bearing).** Owner steered:
  for deciding the memory _structure_ we're better off from Oak's current main than the stale pin. Measured firsthand
  before acting: `main` is a **clean superset** of the pin (pin is a direct ancestor, +429 commits, no divergence/merge
  cost). Decision: re-pin all remaining phases (6–9) to `ad359a4f` — a _newer fixed ref_, not a moving target. **Key
  measured nuance:** the memory _structure_ is **byte-identical** pin→main (READMEs, substrate-contract, `orientation`,
  dir taxonomy all unchanged); only _content_ moved (patterns 122→133, generator skills). So "work from main" was right
  for the reason of getting current _content/skills_, but it does **not** change the layout I build. Back-flow target is
  now OPEN (old pin's "push to `practice/transplant-to-castr`" no longer self-evident) → deferred to Phase 9.
- **Generator-first (owner): the memory dir is a _generated artefact_ — align the skills, not just the directory.**
  Owner: _"it's not just the memory dir, it's the skills that cause it to be populated."_ `generator-first-mindset`
  vindicated. Measured split `ad649710`→main: memory-governing **rules** = zero change; structural **contracts** =
  byte-identical; the memory-**populating skills** (`consolidate-docs`/`session-handoff`/`curator-pass`/`start-right`)
  **moved** → re-sync those to main forms in this phase. `napkin`/`consolidate-until-done`/`metacognition`/
  `start-right-thorough` unchanged.
- **Opening move LANDED — flat memory → `active/` (git mv, history preserved).** `.agent/memory/{napkin,distilled}.md`
  - `code-patterns/` → `active/{napkin,distilled}.md` + `active/patterns/`. **The flat files were the only lagging
    surface** — every skill (napkin/consolidate-docs/session-handoff/start-right) AND `policy.json` (grounding_reminder
    line 430) already pointed at `active/`. **Lockstep landmine cleared firsthand** (the Phase-4 warning): `policy.json`'s
    17 `"distilled.md"` entries + the hook-policy test citation are **bare basenames / labels — location-independent**, so
    the move doesn't touch them; `practice-fitness`/`fitness-vocabulary` **discover by frontmatter, not hardcoded path**.
    Verified: format clean, all 5 blocking validators green (drift `92 PDR files` consistent). Sub-plan
    `06-memory-and-generator-consolidation.md` written; tracker re-pinned. **Next blocks:** operational/executive contract
    docs (localised) → generator skill re-sync → napkin drain.

- **Homing doc landed + generator-resync triaged (block c).** Brought `ephemeral-to-permanent-homing.md` (reconciled —
  resolves 3 dangling Phase-3 refs from consolidate-docs/session-handoff). **`git merge-file` three-way DEGENERATED** for
  the skill re-sync (castr localised 778/768 lines vs base → localisation noise swamps the real 111-line delta) → fell
  back to manual per-hunk triage (Phase-5 method). **Finding:** the generator's `ad649710`→main evolution is ~95%
  Phase-8 comms/collaboration + Oak-product; only 1 clean generic fold bringable now (consolidate-docs "trigger-firing
  discipline"). The bulk is correctly a P8 activity. Lesson: **a "skill re-sync" is a per-hunk relevance triage, not a
  wholesale bring** (Phase-3/4 lesson, deeper) — and **merge tools degenerate when ours-vs-base localisation is large;
  measure the conflict surface before trusting the tool.**
- **Main re-pin delta ledger built (owner asked "do you have a plan to bring ALL materials?").** Firsthand slug-diff +
  per-file diff vs main — **corrected my own asserted numbers**: NEW rules = **1** (`no-unbounded-host-load`), not ~10
  (9 are the DON'T-BRING set, resolved-by-design); patterns = **~131** (castr has 0; main 133), not 11; and surfaced
  **≈30 PDRs amended on main** — real upstream content (new Decisions/amendment-logs), a workstream the transplant
  **never tracked** (treated PDRs as bring-once at P1). Folded into `relevance-ledger.md` §Main re-pin delta (Tier-1 NEW
  / Tier-2 AMENDED / agent-tools by subsystem; every item phase-positioned). **Lesson: aggregate `git diff` counts
  mislead — a bring-manifest needs slug-diff cross-checked against existing DON'T-BRING dispositions, or it over-counts.**
- **OWNER DECISION (2026-06-17): PDR currency = adopt Oak's amendments at a periodic "PDR currency sync" (D4/P9).** PDRs
  are portable governance castr _hydrates_ from Oak upstream; castr appends Oak's amendment-logs **verbatim**; immutability
  (PDR-001) means append-upstream, not freeze. **The castr↔Oak Practice relationship is a periodic upstream merge, not a
  one-time copy** — reframes the transplant's tail (and ties to the Phase-9 back-flow target, still open).

- **Transplant Phase 5 LANDED — tag `transplant/phase-5` (commit `6895b4b`).** 7 generic directives brought additive +
  the Oak rules-delta folded (`precedence-is-not-approval` + `PDR-091` + `verify-dont-trust` +6). The durable record is
  the commit + `reference-closure.md` §Phase 5 + the tracker (per `permanent-doc-is-the-consolidation-record`); only the
  surprises live here:
  - **commitlint is now LIVE and enforces `subject-case`** (lowercase-start subject). `feat(transplant): Phase 5 …` was
    REJECTED; `… phase 5 …` passed. The older `Phase 4` tag commit predates commitlint. Draft subjects lowercase-first;
    validate with `pnpm exec commitlint --edit <file>` before `git commit`.
  - **"Oak moved" was benign — measured before trusting.** The pin had advanced `4470266`→`518b34af`, but the delta is a
    single file (castr's own back-flow feedback doc); all 7 directives + AGENT/principles are byte-identical at pin and
    tip. Read Phase-5 estates at the pin `4470266`.
  - **A foundational directive carried a false cross-host cite:** `tdd-as-design` cited `principles.md §Code Quality`
    for TDD-as-non-negotiable; castr names it in §Testing Standards. Same class as the Phase-4 false principles-cites —
    every directive-section cite is a claim to verify against castr's real headings.
  - **The edit-surface-bounding rule for a directive transplant:** reconcile Oak-LOCAL refs NOW (Oak plans,
    `@oaknational`, `oak-eslint`, `docs/engineering`, EEF, `oak-consolidate-docs`, Oak ADR paths); leave castr-FUTURE
    refs (P6 memory, P8 state — correct future castr paths) as forward-placeholders, exactly as Phases 3–4. Oak-local
    PLAN citations in a permanent doc also violate `no-moving-targets` — de-link, don't just leave.
  - **Adding PDR-091 tripped the drift validator's count check** (it counts PDR files vs definite count-claims): the
    estate went 91→92 files / 90 numbered slots; two definite "91-PDR"/"all 91 PDR" claims in the scanned ledgers had to
    be recomputed. The validator working as designed — recompute counts, don't just record.
  - **zsh word-splitting bit again:** `grep … $FILES` (newline-joined var) was read as one filename → false "CLEAN".
    Known lesson held: pass explicit file args / globs, never an unquoted multi-file `$var`.

---

_Earlier entries rotated to hold the active napkin under its ~500-line threshold:_
_2026-03-25 → 2026-04-16 → [`archive/napkin-2026-03-to-04.md`](archive/napkin-2026-03-to-04.md) (2026-06-18);_
_2026-06-04 → 2026-06-10 → [`archive/napkin-2026-06-04-to-10.md`](archive/napkin-2026-06-04-to-10.md) (2026-06-19)._
