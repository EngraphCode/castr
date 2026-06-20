<!-- Canonical castr home for the back-flow feedback report (owner direction 2026-06-20:
"the feedback lives in castr, not Oak"). Originally delivered to the Oak Practice Box
as .agent/practice-core/incoming/castr-feedback-2026-06-10.md on the Oak branch
practice/transplant-to-castr (518b34af), now retired. Phase-9 delivers this report FROM
castr to a fresh Oak branch off current main. Tracked in reference-closure.md §back-flow items. -->

# Practice feedback from castr — transplant Phases 0–4 (2026-06-10)

**From:** the castr transplant (`feat/transplant-engraph-practice`, Phases 0–4 complete; rules estate transplanted
at the 2026-06-07 baseline). Delivered into the Practice Box per the inbound contract. Each item names the
defect/enhancement, where it lives in Oak, and what castr did, so this repo can adopt or adapt with full context.

## Upstream defects found firsthand during the rules/skills transplant (fixed in castr's copies)

1. **`consolidate-docs` skill cites retired `practice-context/outgoing/`** — practice-context was retired
   2026-04-29; this is the only skill still citing it. castr repointed to the durable homes.
2. **`practice-lineage.md` names `jc-consolidate-docs` as the live consolidation vehicle** (two present-tense
   protocol lines, the evolution-trigger and Practice-Box-check sections) — a castr-era command name that no longer
   exists in either repo; the canonical vehicle is the `consolidate-docs` skill.
3. **`capture-practice-tool-feedback` rule cites `skills/napkin/SKILL.md`** — the napkin skill's canonical file is
   `SKILL-CANONICAL.md` (the adapter generator resolves only that name).
4. **`dont-break-build-without-fix-plan` rule cites `../commands/consolidate-docs.md`** — the `commands/` directory
   was retired 2026-05-10; the cite predates it.
5. **`register-identity-on-thread-join` rule cites `../commands/session-handoff.md` and
   `../commands/consolidate-docs.md`** — same retired-`commands/` class.
6. **`present-verdicts-not-menus` rule carries machine-local `~/.claude` reference links** with the flattened
   project id — the founding violation class of this repo's own `no-machine-local-paths` rule. castr de-linked to
   templated prose (`~/.claude/projects/<project>/memory/`).
7. **`present-verdicts-not-menus` cites PDR-057 by a wrong filename** (a `-pre-question-gate` suffix; the file is
   `PDR-057-empirical-answerability.md`).

**Method note that found these:** per-rule firsthand body reading; classification-level reads ("portable,
naming-only") were wrong every phase. A reverse-closure sweep (grep the repo for every name a change retires —
retirement dangles references in files the change never touched) is now a standing castr per-phase step; it would
have caught items 2–5 here at their retirement moments.

## Enhancements castr adopted that Oak may want

1. **`session-handoff` step 11 — "Adversarially falsify the continuity surfaces".** Before close, actively try to
   refute the continuity surfaces' claims against the repo (not confirm them). Caught real drift at least three
   separate times in castr within one week, including a continuity surface that had **fabricated an owner
   decision** (a sequencing arrangement recorded as "owner parked X" — later sessions inherited it as settled law).
   Companion doctrine: recorded owner decisions must trace to the owner's actual words; `precedence-is-not-approval`
   names the pathology and arrived in Oak's estate days after castr needed it.
2. **The "delivery" concept + delivery ledger.** Once plans decouple from branches (multiple fix branches and PRs
   per backlog, practice estates on their own branch), continuity surfaces need a single DRY home mapping each plan
   to its **delivery**: the branches, PRs, and release acts that carry its outcome to a beneficiary
   (PDR-085-aligned). castr's shape: `.agent/plans/delivery-ledger.md` — one row per plan-delivery (branches, PRs,
   state, next act) + a monitoring discipline (session-open `gh pr status` / `gh pr checks` / `--comments` sweep
   over every open row; session-close ledger refresh; a scheduled sweep only when manual starts missing). A row
   closes when value is merged or released, not when code exists. The owner reports an Oak agent is converging on
   the same need.
3. **Enforcement data is contract-tested — change data and tests together.** castr re-pointed a deny-payload
   citation in `hook-policy` data alone; the integration test pinning the exact string caught it. The lockstep is a
   feature (silent policy drift is worse); the lesson is to treat policy-data edits as code edits.

## One adoption-context warning

`use-result-pattern` ("never throw") was dropped from castr's transplant — it directly contradicts castr's
fail-fast product doctrine and had essentially no consuming estate there (1 of ~340 agent-tools files). Rule-estate
classification reads lie; bodies decide. Its cause-preservation clause was the salvageable nugget (castr will
re-home it in a fail-fast-compatible rule).

## Additional upstream defects found during the Phase-9 PDR-currency sync (2026-06-20)

Found firsthand while folding Oak's PDR amendments (`4470266..ad359a4f`) into castr's copies — the reverse-closure
sweep recommended above caught it:

1. **`PDR-058` links to a stale `PDR-014` slug.** Oak's `PDR-058-three-tier-optionality-decomposition.md` §Related links
   to `PDR-014-pattern-routing-discipline.md`, but Oak's own current PDR-014 file is
   `PDR-014-consolidation-and-knowledge-flow-discipline.md` (renamed upstream; the link was never repointed). The link
   dangles in Oak itself. castr repointed its copy to the correct slug; Oak should do the same.

**Method note (corroborates the report above):** castr's PDRs sat at an _older_ Oak base than assumed, at inconsistent
per-file bases — e.g. PDR-089 was missing ~47 lines of pre-`4470266` content as well as the post-`4470266` amendments.
A simple "fold the latest delta" would have left content out. Because castr's PDR copies carry **zero** localisation
(portability constraint holds), the correct, complete fold was a verbatim replace with the current pin + re-neutralising
the incoming Oak-product worked-instance tokens (`EEF D5/D6`, `@oaknational/oak-curriculum-sdk`) that castr's convention
excludes. Lesson for the ongoing castr↔Oak sync: verify each PDR's actual base before folding; don't assume a uniform one.
