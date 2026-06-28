---
title: PR #3 Codex automated-review findings — firsthand triage (2026-06-28)
status: current
lane: ephemeral-triage
created: 2026-06-28
note: >-
  Transient triage list (delete once findings are dispositioned). The Codex automated reviewer
  (chatgpt-codex-connector) left 9 line-level findings on PR #3, reviewing commits b69e833 / 2a853a4 /
  24c6ae1 only, then hit usage limits — so the reference-direction layer (8def837+) is UNREVIEWED by it.
  Every verdict below was re-verified FIRSTHAND (verify-don't-trust applies to automated reviewers too).
---

# PR #3 Codex review findings — firsthand triage (2026-06-28)

| #   | Sev | File                                                   | Verdict (firsthand)                                                                                                                                                                                                                             | Origin                                                                      |
| --- | --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | P1  | `.claude/settings.json`                                | **TRUE** — PreToolUse content guard has `Edit`+`Write` matchers but ZERO `MultiEdit`; the machine-local-paths / blocked-content write guard is bypassable via `MultiEdit`.                                                                      | pre-existing                                                                |
| 2   | P1  | `commit-queue/commit-workflow-runtime.ts`              | **TRUE** — `git commit -F … -- <pathspec>` commits the WORKTREE version of the pathspec, not the verified `--cached` index; unstaged edits after staging land unverified.                                                                       | pre-existing                                                                |
| 3   | P1  | `package.json` (CI install-before-clean)               | **FALSE POSITIVE** — CI log (run 28322552932) shows `turbo clean` runs successfully pre-install on a fresh runner and CI is green; the "fails before install" claim is empirically falsified.                                                   | n/a                                                                         |
| 4   | P2  | `collaboration-state/transaction-lock.ts`              | **LIKELY** (not yet reproduced) — a lock dir whose `owner.json` is missing/corrupt → `readLockMetadata()` undefined → never reaped → wedges claims/commit-queue until manual rm.                                                                | pre-existing                                                                |
| 5   | P2  | `repo-check/repo-check-runner.ts`                      | **LIKELY** — `check:profile` task list still has Oak-only Turbo tasks (`sdk-codegen`, `doc-gen`) absent from castr's `turbo.json` → `turboDryRun()` fails. Unreconciled bring.                                                                  | pre-existing (hollow bring)                                                 |
| 6   | P2  | `package.json` (gitleaks)                              | **TRUE** — `gitleaks` is an external binary, only in `secrets:scan*` script strings, not a declared/lockfile dep; a fresh dev running `pnpm check` without it preinstalled fails at the first qg step. (CI is fine — pinned install in ci.yml.) | THIS SESSION (gitleaks wiring `ec53da7`)                                    |
| 7   | P2  | `agent-tools/package.json` (`claude-agent-ops`)        | **LIKELY** — script runs `tsx` against live source, violating `use-built-agent-tools-cli` (must resolve `dist/`).                                                                                                                               | pre-existing (hollow bring)                                                 |
| 8   | P2  | `version-guard/prevent-accidental-major-version.ts:60` | **TRUE** — regex `/^(feat\|fix\|…)!:/m` misses scoped breaking syntax `feat(api)!:` (no optional `(scope)` before `!`); a major-bump signal bypasses the now-live commit-msg guard.                                                             | THIS SESSION-adjacent (commit-msg hook wired `3838662`; regex pre-existing) |
| 9   | P2  | `commit-queue/commit-workflow.ts`                      | **LIKELY** — workflow's `runVerifyStage` drops the `getFreshEntriesAhead` queue-ahead check the standalone `verify-staged` has → can commit out of queue order.                                                                                 | pre-existing                                                                |

## Recommended disposition

- **Quick + this-session, fix now-ish:** #8 (add optional `(\([^)]+\))?` before `!` in the regex + a test) — trivial,
  closes a live commit-msg-guard bypass. #6 (gitleaks) needs a CURE CHOICE: (a) document as a prereq + bootstrap-install,
  (b) `secrets:scan` skips-with-loud-warning when gitleaks absent (weakens local gate), or (c) leave (CI enforces) — owner call.
- **P1 pre-existing, real, queue for a focused fix:** #1 (MultiEdit guard — add the matcher + teach the guard the
  multi-edit payload) and #2 (commit-queue commit `--cached`/`-i` not worktree pathspec) — both genuine integrity holes.
- **P2 pre-existing brought-infra (hollow brings), queue:** #4 (transaction-lock stale-no-metadata reap), #5 (repo-check
  Oak-task reconciliation), #7 (claude-agent-ops → dist), #9 (commit-queue queue-ahead in workflow). #5/#7 are
  iceberg-style hollow brings (PDR-096 family).
- **Dismissed (measured):** #3.

Codex hit usage limits, so the reference-direction layer is unreviewed by it; a `/code-review ultra` or a re-trigger
(`@codex review`) would cover the rest.
