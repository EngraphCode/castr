---
fitness_line_target: 1100
fitness_line_limit: 1467
fitness_char_limit: 200000
fitness_line_length: 100
lifecycle_model: >-
  canonical pending-graduations register — owner-gated and pending items live
  here until graduated, duplicated, stale-withdrawn, or owner-resolved
access_pattern: >-
  consolidation-pass-only — read at consolidations and drain sessions; not
  loaded every session by every agent
drain_strategy: >-
  Graduate items to PDRs/ADRs/rules/permanent docs; keep owner-gated items here
  until owner direction resolves them; do not split, shard, or hide buffer depth
fitness_rationale: >-
  Fitness on a drainable buffer is a drain-cadence signal, not a size cap. The
  register reads `hard` while an owner-gated backlog waits to be walked down with
  the owner present; it goes green when the backlog is genuinely graduated, not by
  tombstone-removal. Fitness here is informational-only (not wired into any
  commit/push hook), so a standing `hard` never blocks a commit and must be
  reported, not chased: owner-gated items that legitimately wait are never trimmed
  to clear it. Materialised fresh in castr by the Practice transplant (Phase 6,
  2026-06-18); the register starts near-empty and is populated by napkin drains and
  consolidation passes.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Pending Graduations

This is the canonical pending-graduations register. Do not create dated,
windowed, backlog, split, or shard-like pending-graduation files. New capture,
owner-gated items, and unresolved pending-graduation decisions belong here until
they graduate, duplicate, become stale-withdrawn, or receive owner direction.

Each entry should record: the captured substance, its candidate permanent home
(PDR / ADR / rule / distilled / pattern / README), why it is owner-gated or
pending, and a `[captured: <date> | source: <surface>]` provenance stamp. When
an item graduates, replace it with a one-line tombstone naming where it landed
(commit / permanent doc) so a future drain does not re-capture it.

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr. Items below are populated by the Phase-6 napkin drain and subsequent
> consolidation passes from castr's own state — not copied from any other repo.

<!-- Entries appended below by napkin drains and consolidation passes. -->

## 2026-06-18 capture (Phase-6 session-completion consolidation)

- **Single-stream continuity scale — the repo-continuity Active-Threads row IS
  the record; per-thread `next-session.md` records deferred until concurrent
  threads arise.** Candidate home: a **PDR-027 amendment** (or clause) extending
  the 2026-04-21 workstream-retirement logic from the workstream layer to the
  thread-record layer — at 1:1 thread↔stream scale a separate per-thread file
  pays coordination cost without structural value, so the identity attribution
  folds into the repo-continuity row. **Owner-gated:** PDR amendment is owner
  governance; also part of the periodic PDR-currency sync (D4/P9), so route there
  rather than authoring a one-off.
  `[captured: 2026-06-18 | source: repo-continuity block-f + this consolidation]`
- **Pattern: a transplanted surface carries the source repo's phenotype — read
  the body, reconcile per-surface, and _regenerate_ host-estate catalogues
  rather than localise them.** Multi-instance, proven every transplant phase
  (P3 portability; P4 a KEEP-classed rule contradicting principles + false
  §-cites; P5 a false TDD cite; P6 an Oak relative-path depth bug + the
  three-forms-aspirational index + regenerate-not-localise catalogues). Candidate
  home: a `.agent/memory/active/patterns/` instance, or a PDR with
  `pdr_kind: pattern` if it generalises beyond the transplant. **Pending:** the
  instances are conserved in `distilled.md` §Transplant method; this is the
  graduation-upward step, owner-confirmable at a dedicated-curation pass.
  **New instances (2026-06-19 s2, sub-agent roster):** (a) the negative-space sweep
  of the host's OWN rules before a DON'T-BRING verdict — castr's `invoke-*` rules
  already required experts whose templates did not exist (completing a half-built
  system, not a free choice); (b) author reviewer templates NATIVE to the host, not
  copy-and-AMEND the source's, because a template instructs against a real estate.
  `[captured: 2026-06-18, extended 2026-06-19 | source: distilled.md §Transplant method]`

## 2026-06-19 capture (session 3 — Phase-6 close)

- **ADR candidate: pin a single workspace TypeScript via a `pnpm-workspace.yaml`
  override.** castr-local toolchain decision (genuine local need → ADR, not a
  portable PDR, per PDR-079): `eslint-plugin-sonarjs` bundles its own TypeScript
  (`>=5` → 5.9.3) while the workspace runs 6.0.3, and the two releases renumber
  `ts.TypeFlags`, so the plugin's type-aware rules masked the wrong bits and
  mis-fired (the D1 126-violation arc). The fix pins `typescript` to one version
  workspace-wide. **graduation-target:** a castr ADR recording the decision +
  rationale + the revisit trigger (sonarjs ships a TS-6 peer, or root TS major
  changes). **trigger-condition:** a second cross-tool version-skew incident, OR
  a curation pass, OR owner direction. **status:** pending — the decision is
  conserved in `pnpm-workspace.yaml` (comment) + `d1-sonarjs-findings.md` §0; the
  ADR is the graduation-upward step, not yet authored.
  `[captured: 2026-06-19 | source: d1-sonarjs-findings.md §0 + pnpm-workspace.yaml]`
- **GRADUATED 2026-06-20** (owner sign-off): the periodic `main`→branch sync-check
  doctrine landed as `delivery-ledger.md §Main→branch sync discipline` + the
  `repo-continuity.md §Repo-Wide Invariants` periodic-sync line (commit graduating
  phase-8 task-3b follow-on).

## 2026-06-20 capture (Phase 8 close consolidation)

- **PDR-pattern candidate: an inherited classification (`blocked`, `thin`, `parity
item`, `not-needed-yet`) is a claim to measure against the artefact, and
  multi-surface repetition increases suspicion rather than confidence.** Distilled
  this session from three instances: the clerk-expert "phantom blocker", the task-6
  "thin" mis-estimate, and the per-thread-records "not-needed-yet" framing.
  **graduation-target:** a Practice Core PDR with `pdr_kind: pattern` (verification
  discipline — sibling to [[verify-agent-claims-firsthand]] / `verify-dont-trust`),
  OR fold as a sharpening of an existing verify-firsthand PDR. **trigger-condition:**
  a third distinct instance, OR a curation pass, OR owner direction. **status:**
  pending — conserved in `distilled.md` (two new bullets); the PDR is the
  graduation-upward step, not yet authored.
  `[captured: 2026-06-20 | source: distilled.md + napkin Phase-8 entries]`
- **Pattern candidate: a green test proves only the layer it runs at — verify it
  exercises the real production stack on its real substrate, not a proxy or a
  fake.** Instance this session: collaboration-state concurrency was "tested" only
  on a bare-counter `Promise.all` + an in-memory fake runtime; the real multi-process
  filesystem path was unproven until the live demonstration + a real-fs test.
  **graduation-target:** `.agent/memory/active/patterns/` (a testing-discipline
  instance) or a `pdr_kind: pattern` PDR if a second cross-repo instance appears.
  **trigger-condition:** second instance, OR curation pass, OR owner direction.
  **status:** pending — conserved in `distilled.md`.
  `[captured: 2026-06-20 | source: distilled.md + claims-concurrency.integration.test.ts]`

## 2026-06-20 capture (first director-led concurrent stream — collaboration-setup first-run friction)

The first genuinely-concurrent stream was also the first real exercise of the collaboration setup; the owner directed
"record all frustrations and issues." Full friction set (F1–F7, N1–N11) is durable in
[`napkin.md`](../active/napkin.md). The graduation-worthy candidates:

- **Doctrine amendment: name the Monitor-idle-coalescing caveat + the catch-up-sweep cure (F6/N10 — the headline
  finding).** An ARMED persistent comms watcher does NOT guarantee per-event wake: when many watcher stdout lines fire
  while a session is idle, the harness coalesces them and only the latest surfaces — so a correctly-armed agent can go
  silently dark (measured firsthand: Seat 2's seen-file consumed all 27 events; the gap was harness notification
  delivery, not the CLI). **graduation-target:** amend `use-monitor-for-event-driven-wake.md` + `comms-all-channels-
watcher.md` (both currently ASSUME per-event wake) to name the caveat and mandate a full `comms list` catch-up sweep
  on every wake + the ≤120s fallback sweep; consider a watcher "N unseen since last wake" summary line. Already
  graduated to user-memory `monitor-watcher-coalesces-idle-notifications` + adopted as team doctrine this session.
  **trigger-condition:** owner direction OR next curation pass (the doctrine is already live as team practice).
  **status:** pending the rule-text amendment. `[captured: 2026-06-20 | source: napkin F6/N10 + comms c3b52249]`
- **Rule/enforcement fix: the dangerous-pattern hook over-matches free substrings (N7 + N11).** The matcher blocked a
  comms-body heredoc containing the word "checkout" AND blocks safe `git checkout -b` as if it were `git checkout --`
  (discard). **graduation-target:** `hook-policy-substring-discipline.md` already names the hazard — this is the
  strongest worked instance; graduate to an actual matcher fix (anchor on command-leading position / word boundary, not
  free substring) in the hook-policy code, + a rule note. **trigger-condition:** a third instance OR owner direction
  (two independent instances this session already). **status:** DUE — owner directed INVEST (2026-06-21, Q-005);
  scheduled in the **hook-matcher-precision lane** (thread record), parity-or-better + Oak back-flow. No longer "accept".
  `[captured: 2026-06-20 | source: napkin N7/N11 + comms 3bbcb36d]`
- **agent-tools CLI hardening backlog (F1/F2/F4/F5/F7/N5/N6 + alias/flag friction).** Read-only claims actions ENOENT
  on a fresh home instead of reporting empty (F2); `comms watch` does not auto-create the seen-file parent dir (F4);
  HEARTBEAT MODE requires `--claim-id`/`--intent-id` before a claim exists (F5) + `--intent-id` has no canonical source
  (N5); the commit skill documents a non-existent root alias `agent-tools:check-commit-message` (F7); `platform` field
  renders inconsistently (`claude` vs `claude-code`) breaking directed-comms targeting (N6); `comms list` uses `--tail`
  not `--limit`; the `pnpm … --` wrapper's `cd ..` forces absolute paths. **graduation-target:** an agent-tools
  hardening slice (code) + small doc/reading-order fixes (`start-right.md` §4 "fresh-home files may be absent"). **trigger-
  condition:** owner names a friction-fix tranche OR these recur. **status:** pending — all conserved in napkin.
  `[captured: 2026-06-20 | source: napkin F1–F7/N1–N11]`
- **Doctrine: identity-row registration is the one bootstrap continuity write a seat makes directly, distinct from
  feature-branch pure-diff (N1); and the lock-free identity table has a live write-race (N2).** **graduation-target:**
  a `start-right-team` / `threads/README.md` clause reconciling "seat registers its own identity row" with "Director
  lands all .agent writes", + a `claims/identity register` CLI doing an atomic additive upsert. **trigger-condition:**
  next team session OR curation pass. **status:** pending — conserved in napkin N1/N2.
  `[captured: 2026-06-20 | source: napkin N1/N2]`

## 2026-06-20 capture (Lane 3 — statusline wiring; reviewer-surfaced hardening)

- **Validator candidate: `validate-statusline-routing` — assert `settings.json.statusLine.command` points at an extant
  shim whose adapter target resolves.** Surfaced independently by BOTH reviewers (config-expert + code-reviewer) during
  the Q-003 statusline wiring. There are now THREE classes of `.claude/` → `agent-tools/dist` wiring (PreToolUse guards,
  SessionStart hook, and now `statusLine`), but only the PreToolUse class has a routing validator
  (`validate-pretooluse-guard-routing`, in `repo-validators:check`). A sibling `validate-statusline-routing` would harden
  against silent drift if `agent-tools/` ever relocates — the shim's own `CLAUDE_PROJECT_DIR`-preference comment names
  exactly this risk. **graduation-target:** a new validator under `agent-tools/src/validators/` wired into
  `repo-validators:check`. **trigger-condition:** the friction-fix tranche (Lane 1), OR a third drift incident, OR owner
  direction. **status:** DUE — owner folded it into the **first-run friction-fix tranche** (2026-06-21) as one
  "validator hardening" slice with the §-cite resolver below.
  `[captured: 2026-06-20 | source: config-expert + code-reviewer PASS reviews of the Q-003 wiring]`

## 2026-06-20 capture (Oak parity-program planning — meta-gap)

- **Meta-gap: `.agent/plans/templates/` is EMPTY in castr.** The `engraph-plan` skill and the
  `lifecycle-triggers` plan component both reference plan templates (`.agent/plans/templates/README.md`
  - a template inventory) that do not exist in castr — so plan authoring has no scaffold inventory to
    copy from, and the lifecycle-triggers component reference is a dangling pointer. **graduation-target:**
    a parity-program tranche item (materialise the plan-templates inventory from the Oak pin, or author
    castr-native templates) + a `lifecycle-triggers.md` component. **trigger-condition:** the Oak
    parity-program execution (it is itself a sophistication gap — castr is simpler than Oak here), OR
    owner direction. **status:** pending — recorded in `oak-parity-program.md` §Learning loop as a noted
    meta-gap; folds into the parity program.
    `[captured: 2026-06-20 | source: engraph-plan skill run during parity-program planning]`

- **A `principles.md` §-citation-resolution validator (structural cure for the recurring false-§-cite class).**
  **substance:** doctrine surfaces (rules, PDRs, policy.json, plans) cite `principles.md §<heading>`; transplanted-from-Oak
  surfaces repeatedly carry Oak headings (`§Architectural Excellence Over Expediency`) that castr's principles.md does not
  have. The distilled "false §-cites are pervasive in Oak" lesson keeps recurring — Tranche 2 found one in an
  already-landed sibling rule (`no-hedging-vocabulary.md:99`, fixed `511326f`) that the bring itself never touched. The
  current cure is a per-session reviewer sweep + a napkin vigilance-clause; per PDR-092 (mechanical firing moments over
  vigilance clauses) and the metacognition Cure-Shape directive, the durable cure is mechanical. **graduation-target:** a
  new `agent-tools` validator (sibling to `validate-drift`) that parses every `principles.md §<heading>` citation across
  `.agent/` + `docs/` and fails if the heading does not resolve in `principles.md`; wired into `repo-validators:check`.
  Possibly generalise to any `<file> §<heading>` cite. **trigger-condition:** a third instance of a false-§-cite found
  in review, OR the friction-fix tranche, OR owner direction. **status:** DUE — owner folded it into the **first-run
  friction-fix tranche** (2026-06-21) as one "validator hardening" slice with `validate-statusline-routing` above.
  `[captured: 2026-06-21 | source: Oak parity Tranche 2 metacognition pass; config-expert §-cite find]`
