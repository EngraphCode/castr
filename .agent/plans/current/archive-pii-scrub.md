# Archive PII scrub — current privacy remediation (Q-008)

**Status:** Current, unimplemented obligation; not the primary active delivery.
The owner's 2026-07-03 instruction “mechanise scrub now” and full-tool choice
remain recorded. This plan owns that work independently of the paused
autonomous experiment.

## Current context — 2026-09-06

GitHub repository visibility was verified **public** in the review. The
pre-publication premise in the former plan is obsolete. A narrow review of
archived Markdown found machine-local home paths; it was not a full privacy audit.
The machine-local-path rule exempts historical archives, so a green daily
validator cannot prove archive privacy.

A fresh narrow scan on 2026-09-06 found **seven user-home-path occurrences on
five lines in three tracked archive files**, all still present in the baseline
HEAD and this worktree:

- `.agent/memory/active/archive/napkin-2026-06-04-to-10.md`, line 211.
- `.agent/memory/active/archive/napkin-2026-06-17-to-20.md`, lines 107, 118 and 120.
- `.agent/memory/active/archive/napkin-2026-06-20-to-21.md`, line 602.

Only filenames/locations are recorded here; this scan tested the macOS user-home
path shape in archived Markdown, not all possible personal or secret data.
Those confirmed occurrences establish a known HEAD exposure, not a complete
privacy inventory.

Working-tree remediation removes occurrences from HEAD. It does not remove
them from Git history. These are distinct outcomes with separate authorisation
and evidence requirements.

## Tool design (slice 1)

`agent-tools` module `archive-pii-scrub` (unified CLI topic), reusing the machine-local-paths
pattern set that `policy.json` single-sources (the validator and the write-time guard already
share it — one pattern set, three consumers, no drift):

- `--check`: scan `**/archive/**` markdown for machine-local-path hits; report file/line/kind;
  exit 0 clean, 1 on findings, and 2 on operational errors.
- `--write`: rewrite hits to the rule's sanctioned placeholder forms (`<user>`, `<oak>`,
  repo-relative), category-aware exactly like the LC3a cure (user-home → `<user>`; Oak-checkout
  → `<oak>`; stale self-links → repo-relative). Idempotent; second run reports clean.
- Fail-loud on unreadable files (LC3a validator precedent); TDD with the blocking contract
  proven (exit 0/1/2), pure helpers + injected reader, no real FS in unit tests.
- **Frozen-record honesty:** `--write` alters archived records. Each rewritten file gains a
  one-line top annotation (`> PII-scrubbed <date>; original in git history`) so the record
  never silently pretends to be verbatim. (The history layer still holds the original — which
  is exactly why layer 2 exists.)

## Acceptance and execution boundary

1. **Tool implementation remains outstanding:** land the full check/write tool
   with red-first behaviour and idempotence proof. This remains the current
   Q-008 carrier; this documentation refresh does not execute it.
2. **Working-tree remediation:** run a fresh complete archive census and record
   the execution scope before applying the tool. The owner authorised mechanisation;
   the old publish-time condition no longer describes the public repository.
   Do not claim the archive corpus clean from a narrow scan.
3. **History disposition remains a separate owner decision:** a HEAD scrub cannot
   remove earlier blobs. No force-push, history rewrite, deletion or inferred
   acceptance of exposure is authorised by this plan update.

The initial integration is a standalone report outside the daily blocking aggregate;
that placement does not suppress the CLI's nonzero findings/error exits. The tool
milestone may complete when its implementation proof is present, but that does not
complete HEAD remediation or resolve history exposure. This plan stays current
until those obligations are delivered or explicitly transferred to a named
successor with their acceptance intact. This refresh neither implements nor runs
the tool.

## Cross-references

- [Owner decisions](../../memory/operational/open-questions.md), Q-008.
- [Machine-local-path rule](../../rules/no-machine-local-paths.md).
- [Historical loop-closure evidence](../transplant/practice-loop-closure-remediation.md).
- [Pre-refresh privacy plan](../../memory/operational/archive/plan-estate-2026-09-06.md).
