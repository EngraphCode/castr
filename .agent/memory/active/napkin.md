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

---

_Earlier entries rotated to keep the active napkin healthy as cross-session lessons graduate to [`distilled.md`](distilled.md) (conserved in archive, never trimmed):_
_2026-03-25 → 2026-04-16 → [`archive/napkin-2026-03-to-04.md`](archive/napkin-2026-03-to-04.md) (2026-06-18);_
_2026-06-04 → 2026-06-10 → [`archive/napkin-2026-06-04-to-10.md`](archive/napkin-2026-06-04-to-10.md) (2026-06-19);_
_2026-06-17 → 2026-06-20 (Phase 7 + Phase 8-partial) → [`archive/napkin-2026-06-17-to-20.md`](archive/napkin-2026-06-17-to-20.md) (2026-06-20)._
