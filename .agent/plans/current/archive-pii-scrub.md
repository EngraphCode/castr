# Archive PII scrub — mechanise the pre-publish precondition (Q-008)

**Status:** ACTIVE (owner-decided 2026-07-03: "mechanise scrub now"; supersedes Q-008's
open/publish-gated framing). **Tool shape DECIDED (owner, same day): FULL TOOL** — both
`--check` and `--write` land as slice 1, TDD, in the next implementation session (this plan is
the controlling artefact; the 2026-07-03 consolidation session landed the plan and records).

## Context

The `no-machine-local-paths` rule deliberately exempts `archive/` (frozen historical records),
so archived napkins retain real user-home path segments — a username (PII) leak if the repo is
ever made public. Q-008 captured this at the LC3a landing; the owner chose to mechanise the
cure now rather than hold it publish-gated.

**The honest engineering constraint this plan must name:** a working-tree scrub does NOT remove
PII from git HISTORY. Making the repo public exposes every historical blob regardless of the
working tree's cleanliness. The full pre-publish precondition is therefore two-layer:

1. **Working-tree layer (this plan's tool):** archives carry no machine-local PII at HEAD.
2. **History layer (publish-time, owner-invoked):** a history-level scrub (`git filter-repo`
   class) or an explicit owner acceptance of history exposure. This layer is destructive and
   owner-only; the tool below makes layer 1 true and REPORTS that layer 2 remains.

## Tool design (slice 1)

`agent-tools` module `archive-pii-scrub` (unified CLI topic), reusing the machine-local-paths
pattern set that `policy.json` single-sources (the validator and the write-time guard already
share it — one pattern set, three consumers, no drift):

- `--check`: scan `**/archive/**` markdown for machine-local-path hits; report file/line/kind;
  exit 1 on hits (report-only mode for a publish-preflight gate), exit 0 clean.
- `--write`: rewrite hits to the rule's sanctioned placeholder forms (`<user>`, `<oak>`,
  repo-relative), category-aware exactly like the LC3a cure (user-home → `<user>`; Oak-checkout
  → `<oak>`; stale self-links → repo-relative). Idempotent; second run reports clean.
- Fail-loud on unreadable files (LC3a validator precedent); TDD with the blocking contract
  proven (exit 0/1/2), pure helpers + injected reader, no real FS in unit tests.
- **Frozen-record honesty:** `--write` alters archived records. Each rewritten file gains a
  one-line top annotation (`> PII-scrubbed <date>; original in git history`) so the record
  never silently pretends to be verbatim. (The history layer still holds the original — which
  is exactly why layer 2 exists.)

## Acceptance

- Slice 1: tool lands TDD-green; `--check` wired as a non-blocking report initially (blocking
  at publish-preflight, not in the daily gate — archives are exempt from the daily invariant by
  rule design).
- Slice 2 (publish-time, owner-invoked): run `--write`, commit; then the owner decides the
  history layer (filter-repo vs accept-exposure). This plan is DONE when slice 1 lands and the
  two-layer precondition is recorded in the publish path; slice 2 fires only on a real publish
  intent.

## Cross-references

- Q-008 in `.agent/memory/operational/open-questions.md` (decided → this plan owns the work).
- `no-machine-local-paths` rule (pattern set + archive exemption rationale).
- LC3a as-built in `practice-loop-closure-remediation.md` (the validator/cure machinery reused).
