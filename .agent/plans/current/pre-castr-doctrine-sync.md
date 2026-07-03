---
todos:
  - id: RS-1
    content: Bring use-result-pattern reconciled to the Result+fail-fast composition ruling
    status: pending
  - id: RS-2
    content: Re-sync the product-facing rule bodies (second-consumer rename; host-load §4)
    status: pending
  - id: RS-3
    content: Bring the validation-strategy directive (firsthand overlap-merge with testing-strategy)
    status: pending
  - id: RS-4
    content: Bring TSDoc enforcement so the standard precedes the first new product module
    status: pending
---

# Pre-castr doctrine sync — the one slice that gates product work

**Status:** READY FOR NEXT SESSION (authored 2026-07-03 at session close; owner-directed).
**Branch model:** open ONE feature branch off `main` for this plan; one PR; owner merges.

**End goal:** a product/remediation session (remediation-02 first, features after) can open
immediately after this slice with no risk of writing code to retired doctrine — the OCE
enhancement stream continues in parallel, uncompromised.

**Mechanism:** the only genuine coupling between the substrate backlog and product work is the
doctrine an agent reads BEFORE writing product code (error-model rule, test/validation
directives, documentation standard). Landing exactly that set first removes the rework risk;
everything else in the backlog is parallel-safe (disjoint file estates `lib/` vs
`.agent/`+`agent-tools/`; feature-branch isolation; live coordination substrate). This scoping
was derived by dependency analysis at the 2026-07-03 close (owner question answered, not a
mandate — see repo-continuity NEXT STEPS corrected block).

## Cycles (each independently landable; TDD where code is touched)

**RS-1 — `use-result-pattern` bring, reconciled to the ruling (small; Oak body is 19 lines).**
Read Oak live main's `.agent/rules/use-result-pattern.md` firsthand; author castr's rule
carrying the OWNER RULING verbatim substance (2026-07-03: "Result in no way precludes fail
fast, Result<T,E> IS the correct pattern, and fail fast is absolutely required everywhere" —
they COMPOSE; the retired fail-fast-therefore-no-Result framing must not survive in the rule
body). Wrappers (`.claude`/`.agents` via `portability:check --fix`, `.cursor` trigger via
`agents:adapter-generate`) + RULES_INDEX row. Acceptance: portability + repo-validators green;
the rule resolves from RULES_INDEX; grep confirms no retired-framing text.

**RS-2 — product-facing rule re-syncs (the re-sync wave's leads).**
(a) `consolidate-at-third-consumer` → `consolidate-at-second-consumer` (Oak R100 rename):
rename rule + all three wrappers + RULES_INDEX + repo-wide citation ripple (grep
`third-consumer`); (b) `no-unbounded-host-load` §4 macOS reading (healthy load sits above core
count; use CPU-idle% + memory pressure — the amendment castr's own false-caution instance
already validated). Acceptance: gates green; citation grep returns only historical/archive
hits.

**RS-3 — `validation-strategy` directive bring (firsthand overlap-merge).**
Oak has `.agent/directives/validation-strategy.md`; castr's `testing-strategy.md` already
carries the prove-behaviour umbrella (landed `c31ca23`). Read BOTH firsthand; bring the
directive per bring-everything with the overlap reconciled (castr's testing-strategy stays
authoritative where they collide — PRESERVE-set discipline; the bring adds what castr lacks,
never clobbers). Wire into the start-right reading order if Oak's is so wired. Acceptance:
no duplicated-authority prose (each claim has one home); loop-closure validator green on any
`pnpm <script>` refs the directive carries.

**RS-4 — TSDoc enforcement bring.**
Measure Oak's mechanism firsthand (gate? eslint tsdoc plugin? validator?) — the
`engraph-tsdoc` skill exists in castr already; this cycle brings the ENFORCEMENT so the
standard precedes the first new product module (landing it after means retrofit). TDD if a
validator; config-expert review on any gate wiring. Acceptance: enforcement fires on a
representative violation (prove-it-fires with representative input — the 2026-07-03
hardened-pre-commit lesson), gates green.

## Explicitly NOT in this plan (parallel-safe; run any time on their own branches)

Plan-templates graft (resonance candidate), encoding-integrity gate, markdown-links wiring +
ADR-127, statusline S2/S3, archive-pii-scrub tool, D4 Result-migration, claims-handoff,
provenance/archive-move, the 27-PDR batch, corpus-analysis suite (stabilisation-gated),
commit-queue R100-rename verifier fix, generator prettier-stable quoting.

## Risks

RS-3 overlap-merge is the only judgement-heavy cycle — mitigation: firsthand read of both
directives before any edit; castr-authoritative on collision; owner-visible diff. RS-1 wording
must not water down EITHER half of the composition ruling — carry the verbatim substance.

## Foundation alignment

principles.md (fail-fast everywhere; Result composes per the ruling), testing-strategy.md
(authoritative on collision in RS-3), requirements.md (unchanged). Plan-body first-principles
check: every "Oak has X" claim above was measured 2026-07-03 (file listed/read via
`git -C <oak> show main:`); re-verify at execution — Oak main moves.

## Completion

All four cycles landed + gates green ⇒ product work is UNGATED: the next-next session may
open `remediation/02-ir-fidelity-proof-harness` or a feature slice. Lifecycle: archive this
plan per ADR-117 on completion; consolidation edge at that session's close.
